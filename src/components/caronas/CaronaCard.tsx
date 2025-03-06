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
import { formatCurrency } from "@/lib/utils";
import { ChatForm } from "./ChatForm";
import { RatingForm } from "./RatingForm";

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

  const isOwner = user?.id === carona.usuario_id;
  const formattedDate = format(parseISO(carona.horario_saida), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(parseISO(carona.horario_saida), "HH:mm", { locale: ptBR });
  const vagasOcupadas = reservas.filter(r => r.status === "confirmado").length;
  const vagasDisponiveis = carona.qtd_vagas - vagasOcupadas;

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
  }, [reservas, user]);

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from("reservas_caronas")
        .select(`
          id,
          carona_id,
          usuario_id,
          status,
          created_at,
          updated_at,
          usuario:profiles(full_name)
        `)
        .eq("carona_id", carona.id);

      if (error) throw error;
      
      const typedReservas: ReservaCarona[] = data?.map(item => {
        const usuario = item.usuario && typeof item.usuario === 'object' 
          ? { full_name: (item.usuario as any).full_name || 'Usuário' }
          : { full_name: 'Usuário' };
          
        return {
          id: item.id,
          carona_id: item.carona_id,
          usuario_id: item.usuario_id,
          status: item.status as "confirmado" | "cancelado",
          created_at: item.created_at,
          updated_at: item.updated_at,
          usuario
        };
      }) || [];
      
      setReservas(typedReservas);
    } catch (error: any) {
      console.error("Erro ao carregar reservas:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar reservas",
        description: error.message,
      });
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
        email: "usuario@exemplo.com"
      });
    } catch (error: any) {
      console.error("Erro ao carregar informações do usuário:", error);
      setUserData({
        full_name: "Usuário",
        email: "usuario@exemplo.com"
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
      const { data: existingReservation, error: queryError } = await supabase
        .from("reservas_caronas")
        .select("id")
        .eq("carona_id", carona.id)
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      if (existingReservation) {
        toast({
          title: "Você já possui uma reserva para esta carona",
        });
        setLoadingReserva(false);
        return;
      }

      const { data, error } = await supabase.from("reservas_caronas").insert({
        carona_id: carona.id,
        usuario_id: user.id,
        status: "confirmado",
      }).select();

      if (error) throw error;

      if (data && data.length > 0) {
        setUserReservationId(data[0].id);
      }

      toast({
        title: "Carona reservada com sucesso!",
        description: "Você pode visualizar os detalhes da carona expandindo o card.",
      });

      fetchReservas();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao reservar carona:", error);
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
          <Badge variant={carona.status === "disponivel" ? "secondary" : "outline"}>
            {carona.status === "disponivel" ? "Disponível" : "Completo"}
          </Badge>
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
                      </div>
                    </div>
                  )}

                  {isOwner && reservas.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">Passageiros ({vagasOcupadas})</h4>
                      <ul className="mt-2 space-y-2">
                        {reservas
                          .filter(r => r.status === "confirmado")
                          .map((reserva) => (
                            <li key={reserva.id} className="text-sm">
                              <p>{reserva.usuario?.full_name}</p>
                              {/* <p className="text-muted-foreground">{reserva.usuario?.email}</p> */}
                            </li>
                          ))}
                      </ul>
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
