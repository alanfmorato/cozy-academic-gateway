
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Carona, ReservaCarona } from "@/types/carona";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CreditCard,
  MessageSquare,
  Edit,
  Trash2,
  Star,
  Heart,
  X,
  BellRing,
  UserCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
import { ChatForm } from "./ChatForm";
import { RatingForm } from "./RatingForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaronaCardProps {
  carona: Carona;
  expanded: boolean;
  toggleExpansion: () => void;
  onEdit: (carona: Carona) => void;
  onDelete: (caronaId: string) => void;
  onRefresh: () => void;
}

export const CaronaCard: React.FC<CaronaCardProps> = ({
  carona,
  expanded,
  toggleExpansion,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<ReservaCarona[]>([]);
  const [isReserved, setIsReserved] = useState(false);
  const [loadingReserva, setLoadingReserva] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [userData, setUserData] = useState<{ full_name: string; email: string } | null>(null);
  const [userReservationId, setUserReservationId] = useState<string | null>(null);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [passengerProfiles, setPassengerProfiles] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fetchingReservas, setFetchingReservas] = useState(false);
  const [vagasDisponiveis, setVagasDisponiveis] = useState(carona.qtd_vagas);
  const [vagasOcupadas, setVagasOcupadas] = useState(0);

  const isOwner = user?.id === carona.usuario_id;
  const formattedDate = format(parseISO(carona.horario_saida), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(parseISO(carona.horario_saida), "HH:mm", { locale: ptBR });
  
  // Check if the ride is upcoming (within the next 24 hours)
  const isUpcoming = () => {
    const departureTime = new Date(carona.horario_saida);
    const now = new Date();
    const timeDiff = departureTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff < 24;
  };

  useEffect(() => {
    if (expanded) {
      fetchReservas();
      fetchUsuario();
      checkIfFavorited();
    }
  }, [expanded, carona.id, user?.id]);

  useEffect(() => {
    if (user && reservas.length > 0) {
      const usuarioReserva = reservas.find(
        (r) => r.usuario_id === user.id && r.status === "confirmado"
      );
      setIsReserved(!!usuarioReserva);
      setUserReservationId(usuarioReserva?.id || null);
    } else {
      setIsReserved(false);
      setUserReservationId(null);
    }
    
    // Calculate vagas ocupadas and disponíveis based on confirmed reservations
    const confirmedReservations = reservas.filter(r => r.status === "confirmado").length;
    setVagasOcupadas(confirmedReservations);
    setVagasDisponiveis(carona.qtd_vagas - confirmedReservations);
    
  }, [reservas, user, carona.qtd_vagas]);

  // Fetch passenger profiles whenever reservations change and for the owner
  useEffect(() => {
    if (isOwner && reservas.length > 0) {
      fetchPassengerProfiles();
    }
  }, [reservas, isOwner]);

  const fetchReservas = async () => {
    if (fetchingReservas) return;
    setFetchingReservas(true);
    console.log("Fetching reservations for carona:", carona.id);
    
    try {
      // Fetch all reservations for this carona
      const { data: reservaData, error: reservaError } = await supabase
        .from("reservas_caronas")
        .select("*")
        .eq("carona_id", carona.id);

      if (reservaError) {
        console.error("Error fetching reservations:", reservaError);
        throw reservaError;
      }
      
      console.log("Raw reservations data:", reservaData);
      
      if (!reservaData || reservaData.length === 0) {
        console.log("No reservations found for this carona");
        setReservas([]);
        setFetchingReservas(false);
        return;
      }
      
      // Process reservations to include user information
      const processedReservas = await Promise.all(reservaData.map(async (reserva) => {
        console.log("Processing reservation:", reserva);
        
        // Get user profile information for each reservation
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", reserva.usuario_id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile for reservation:", profileError);
        }
        
        const userInfo = profileData 
          ? { full_name: profileData.full_name || 'Usuário' }
          : { full_name: 'Usuário' };
          
        console.log("User info for reservation:", userInfo);
        
        return {
          ...reserva,
          status: reserva.status as "confirmado" | "cancelado",
          usuario: userInfo
        } as ReservaCarona;
      }));
      
      console.log("Processed reservations with user info:", processedReservas);
      setReservas(processedReservas);
    } catch (error: any) {
      console.error("Erro ao carregar reservas:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar reservas",
        description: error.message,
      });
    } finally {
      setFetchingReservas(false);
    }
  };

  const fetchUsuario = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", carona.usuario_id)
        .single();

      if (error) throw error;
      
      setUserData({
        full_name: data.full_name || "Usuário",
        email: "usuario@exemplo.com" // Default email since it's not in profiles
      });
    } catch (error: any) {
      console.error("Erro ao carregar informações do usuário:", error);
      setUserData({
        full_name: "Usuário",
        email: "usuario@exemplo.com"
      });
    }
  };

  const fetchPassengerProfiles = async () => {
    console.log("Fetching passenger profiles for carona:", carona.id);
    try {
      // Get confirmed reservations only
      const confirmedReservations = reservas.filter(r => r.status === "confirmado");
      console.log("Confirmed reservations:", confirmedReservations);
      
      if (confirmedReservations.length === 0) {
        console.log("No confirmed reservations found");
        setPassengerProfiles([]);
        return;
      }

      // Get passenger IDs from confirmed reservations
      const passengerIds = confirmedReservations.map(r => r.usuario_id);
      console.log("Passenger IDs to fetch:", passengerIds);
      
      if (passengerIds.length === 0) {
        console.log("No valid passenger IDs found");
        setPassengerProfiles([]);
        return;
      }
      
      // Fetch profile information for each passenger
      const fetchedProfiles = [];
      
      for (const passengerId of passengerIds) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, university")
          .eq("id", passengerId)
          .maybeSingle();
          
        if (error) {
          console.error(`Error fetching profile for passenger ${passengerId}:`, error);
          continue;
        }
        
        if (data) {
          console.log(`Fetched profile for passenger ${passengerId}:`, data);
          fetchedProfiles.push({
            ...data,
            email: "usuario@exemplo.com" // Default email since it's not in profiles
          });
        }
      }
      
      console.log("Fetched passenger profiles:", fetchedProfiles);
      setPassengerProfiles(fetchedProfiles);
    } catch (error: any) {
      console.error("Erro ao carregar perfis dos passageiros:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfis",
        description: "Não foi possível obter informações dos passageiros."
      });
    }
  };

  const checkIfFavorited = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favoritos_caronas")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("motorista_id", carona.usuario_id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error("Erro ao verificar favorito:", error);
    }
  };

  const handleReservar = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Você precisa estar logado para reservar uma carona",
      });
      return;
    }

    if (isOwner) {
      toast({
        variant: "destructive",
        title: "Você não pode reservar sua própria carona",
      });
      return;
    }

    if (vagasDisponiveis <= 0) {
      toast({
        variant: "destructive",
        title: "Não há vagas disponíveis para esta carona",
      });
      return;
    }

    setLoadingReserva(true);

    try {
      console.log("Attempting to create reservation for carona:", carona.id, "user:", user.id);
      
      // Check if user already has a reservation
      const { data: existingReservation, error: queryError } = await supabase
        .from("reservas_caronas")
        .select("id")
        .eq("carona_id", carona.id)
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (queryError) {
        console.error("Error checking existing reservation:", queryError);
        throw queryError;
      }

      if (existingReservation) {
        console.log("User already has a reservation:", existingReservation);
        toast({
          title: "Você já possui uma reserva para esta carona",
        });
        setLoadingReserva(false);
        return;
      }

      // Create the reservation
      const { data, error } = await supabase
        .from("reservas_caronas")
        .insert({
          carona_id: carona.id,
          usuario_id: user.id,
          status: "confirmado",
        })
        .select();

      if (error) {
        console.error("Detailed error when creating reservation:", error);
        throw error;
      }

      console.log("Reservation created successfully:", data);

      if (data && data.length > 0) {
        setUserReservationId(data[0].id);
      }

      toast({
        title: "Carona reservada com sucesso!",
        description: "Você pode visualizar os detalhes da carona expandindo o card.",
      });

      // Enable notifications by default after reserving
      setNotificationsEnabled(true);

      // Refresh the data
      fetchReservas();
      onRefresh(); // Refresh parent component data
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reservar carona",
        description: error.message,
      });
    } finally {
      setLoadingReserva(false);
    }
  };

  const handleCancelarReserva = async () => {
    if (!user || !userReservationId) {
      toast({
        variant: "destructive",
        title: "Não foi possível identificar sua reserva",
        description: "Por favor, tente novamente ou entre em contato com o motorista."
      });
      return;
    }

    setLoadingReserva(true);

    try {
      console.log("Cancelando reserva:", userReservationId);
      
      const { error } = await supabase
        .from("reservas_caronas")
        .delete()
        .eq("id", userReservationId);

      if (error) throw error;

      toast({
        title: "Reserva cancelada com sucesso!",
        description: "A vaga foi liberada e está disponível para outros usuários."
      });

      setIsReserved(false);
      setUserReservationId(null);
      
      fetchReservas();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao cancelar reserva:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cancelar reserva",
        description: error.message,
      });
    } finally {
      setLoadingReserva(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Você precisa estar logado para favoritar um motorista",
      });
      return;
    }

    setLoadingFavorite(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favoritos_caronas")
          .delete()
          .eq("usuario_id", user.id)
          .eq("motorista_id", carona.usuario_id);

        if (error) throw error;
        
        toast({
          title: "Motorista removido dos favoritos",
        });
      } else {
        const { error } = await supabase.from("favoritos_caronas").insert({
          usuario_id: user.id,
          motorista_id: carona.usuario_id,
        });

        if (error) throw error;
        
        toast({
          title: "Motorista adicionado aos favoritos",
        });
      }

      setIsFavorite(!isFavorite);
    } catch (error: any) {
      console.error("Erro ao atualizar favorito:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar favorito",
        description: error.message,
      });
    } finally {
      setLoadingFavorite(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    
    toast({
      title: notificationsEnabled 
        ? "Notificações desativadas" 
        : "Notificações ativadas",
      description: notificationsEnabled 
        ? "Você não receberá mais avisos sobre esta carona." 
        : "Você receberá avisos sobre esta carona."
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{carona.local_saida} → {carona.local_chegada}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" /> {formattedDate} às {formattedTime}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isUpcoming() && (
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 text-yellow-800 dark:text-yellow-200">
                Em breve
              </Badge>
            )}
            <Badge variant={carona.status === "disponivel" ? "secondary" : "outline"}>
              {carona.status === "disponivel" ? "Disponível" : "Completo"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>Trajeto:</strong> {carona.local_saida} → {carona.local_chegada}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>Data e hora:</strong> {formattedDate} às {formattedTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>Valor por vaga:</strong> {formatCurrency(carona.valor_vaga)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>Vagas:</strong> {vagasDisponiveis} disponíveis de {carona.qtd_vagas}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>Pagamento:</strong> {carona.forma_pagamento}
          </span>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger onClick={toggleExpansion}>
              {expanded ? "Ocultar detalhes" : "Ver mais detalhes"}
            </AccordionTrigger>
            <AccordionContent>
              {expanded && (
                <div className="space-y-4">
                  {carona.observacoes && (
                    <div className="mt-4">
                      <h4 className="font-medium">Observações</h4>
                      <p className="text-sm text-muted-foreground">{carona.observacoes}</p>
                    </div>
                  )}

                  {userData && !isOwner && (
                    <div className="mt-4">
                      <h4 className="font-medium">Informações do motorista</h4>
                      <p className="text-sm">Nome: {userData.full_name}</p>
                      <p className="text-sm">Email: {userData.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setShowChat(true)}>
                          <MessageSquare className="h-4 w-4 mr-1" /> Mensagem
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleToggleFavorite}
                          disabled={loadingFavorite}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          {isFavorite ? "Favoritado" : "Favoritar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowRating(true)}>
                          <Star className="h-4 w-4 mr-1" /> Avaliar
                        </Button>
                        <Button 
                          size="sm" 
                          variant={notificationsEnabled ? "default" : "outline"}
                          onClick={toggleNotifications}
                        >
                          <BellRing className="h-4 w-4 mr-1" /> 
                          {notificationsEnabled ? "Notificações On" : "Notificações Off"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isOwner && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Passageiros Confirmados ({vagasOcupadas})</h4>
                        <Sheet open={showPassengerList} onOpenChange={setShowPassengerList}>
                          <SheetTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                fetchPassengerProfiles();
                                setShowPassengerList(true);
                              }}
                            >
                              <Users className="h-4 w-4 mr-1" /> Ver Lista Completa
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Lista de Passageiros</SheetTitle>
                              <SheetDescription>
                                Carona de {carona.local_saida} para {carona.local_chegada}
                                <br />
                                {formattedDate} às {formattedTime}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                              <h4 className="font-medium mb-4">Passageiros Confirmados ({vagasOcupadas})</h4>
                              {vagasOcupadas === 0 ? (
                                <p className="text-muted-foreground text-sm">Não há passageiros confirmados para esta carona.</p>
                              ) : (
                                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                                  <div className="space-y-4">
                                    {passengerProfiles.map((profile) => (
                                      <div key={profile.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                                        <Avatar>
                                          <AvatarFallback>{getInitials(profile.full_name || "Usuário")}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="font-medium">{profile.full_name || "Usuário"}</div>
                                          <p className="text-sm text-muted-foreground">{profile.university || "Universidade não informada"}</p>
                                          <p className="text-sm text-muted-foreground">{profile.email || "Email não informado"}</p>
                                          
                                          <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" onClick={() => {
                                              setShowPassengerList(false);
                                              setShowChat(true);
                                              // Would need to set up the chat mechanism for this specific passenger
                                            }}>
                                              <MessageSquare className="h-3 w-3 mr-1" /> Mensagem
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                      
                      {vagasOcupadas > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {reservas
                            .filter(r => r.status === "confirmado")
                            .slice(0, 3)
                            .map((reserva) => (
                              <li key={reserva.id} className="text-sm flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-muted-foreground" />
                                <p>{reserva.usuario?.full_name || "Usuário"}</p>
                              </li>
                            ))}
                          {vagasOcupadas > 3 && (
                            <li className="text-sm text-muted-foreground">
                              + {vagasOcupadas - 3} outros passageiros...
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">Não há passageiros confirmados para esta carona.</p>
                      )}

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-3">
                            <BellRing className="h-4 w-4 mr-1" /> Notificações
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">Gerenciar Notificações</h4>
                            <p className="text-sm text-muted-foreground">
                              Você receberá notificações automáticas para:
                            </p>
                            <ul className="text-sm space-y-1 list-disc pl-5">
                              <li>Novas reservas em suas caronas</li>
                              <li>Cancelamentos de reservas</li>
                              <li>Lembretes antes do horário de saída</li>
                            </ul>
                            <Button 
                              className="w-full mt-2" 
                              variant={notificationsEnabled ? "default" : "outline"}
                              onClick={toggleNotifications}
                            >
                              {notificationsEnabled ? "Desativar Notificações" : "Ativar Notificações"}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {showChat && userData && (
                    <ChatForm
                      caronaId={carona.id}
                      destinatarioId={carona.usuario_id}
                      destinatarioNome={userData.full_name}
                      onClose={() => setShowChat(false)}
                    />
                  )}

                  {showRating && (
                    <RatingForm
                      caronaId={carona.id}
                      avaliadoId={carona.usuario_id}
                      onClose={() => setShowRating(false)}
                      onSuccess={() => {
                        setShowRating(false);
                        toast({
                          title: "Avaliação enviada com sucesso!",
                        });
                      }}
                    />
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex justify-between">
        {isOwner ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(carona)}
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(carona.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Excluir
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {isReserved ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCancelarReserva}
                disabled={loadingReserva}
              >
                <X className="h-4 w-4 mr-1" /> Cancelar Reserva
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleReservar}
                disabled={
                  loadingReserva ||
                  carona.status === "completo" ||
                  vagasDisponiveis === 0
                }
              >
                {carona.status === "completo" || vagasDisponiveis === 0
                  ? "Sem vagas"
                  : "Reservar Vaga"}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
