
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, Filter, Map, Star, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { isPast, addHours, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Carona } from "@/types/carona";
import { CaronaForm } from "@/components/caronas/CaronaForm";
import { CaronasList } from "@/components/caronas/CaronasList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Caronas = () => {
  const { user } = useAuth();
  const [caronas, setCaronas] = useState<Carona[]>([]);
  const [minhasReservas, setMinhasReservas] = useState<Carona[]>([]);
  const [minhasCaronas, setMinhasCaronas] = useState<Carona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocal, setFilteredLocal] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [expandedCarona, setExpandedCarona] = useState<string | null>(null);
  const [editingCarona, setEditingCarona] = useState<Carona | null>(null);
  const [deletingCarona, setDeletingCarona] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

  useEffect(() => {
    fetchCaronas();
  }, [user]);

  const fetchCaronas = async () => {
    setLoading(true);
    try {
      // Fetch all caronas
      const { data: todasCaronas, error: errorTodasCaronas } = await supabase
        .from("caronas")
        .select("*")
        .order("horario_saida", { ascending: true });

      if (errorTodasCaronas) throw errorTodasCaronas;

      // Filter out caronas that are more than 2 hours past their departure time
      const now = new Date();
      const filteredCaronas = todasCaronas ? todasCaronas.filter(carona => {
        // Here we handle timezone consistently by using parseISO
        const departureTime = parseISO(carona.horario_saida);
        const twoHoursAfterDeparture = addHours(departureTime, 2);
        return now < twoHoursAfterDeparture;
      }) : [];

      console.log("Filtered caronas (before processing):", filteredCaronas.length);
      
      // Get all reservations for these caronas to properly show available seats
      const allReservations = await Promise.all(
        filteredCaronas.map(async (carona) => {
          const { data: reservations } = await supabase
            .from("reservas_caronas")
            .select("*")
            .eq("carona_id", carona.id)
            .eq("status", "confirmado");
            
          return {
            caronaId: carona.id,
            reservations: reservations || []
          };
        })
      );
      
      // Create a map of carona IDs to reservation counts
      const reservationsMap = allReservations.reduce((map, item) => {
        map[item.caronaId] = item.reservations.length;
        return map;
      }, {} as Record<string, number>);
      
      console.log("Reservations map:", reservationsMap);

      // Fetch user data separately for each carona
      const caronasComUsuarios = await Promise.all(
        filteredCaronas.map(async (carona) => {
          // Get user profile information
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", carona.usuario_id)
            .single();
          
          // Calculate available seats
          const reservedSeats = reservationsMap[carona.id] || 0;
          const availableSeats = carona.qtd_vagas - reservedSeats;
          const status = availableSeats > 0 ? "disponivel" : "completo";
          
          return {
            ...carona,
            status: status as "disponivel" | "completo",
            qtd_vagas_disponiveis: availableSeats,
            usuario: userError 
              ? { full_name: "Usuário", email: "usuario@exemplo.com" } 
              : { full_name: userData?.full_name || "Usuário", email: "usuario@exemplo.com" }
          } as Carona;
        })
      );
      
      console.log("Processed caronas with user info and correct seat count:", caronasComUsuarios.length);
      setCaronas(caronasComUsuarios || []);

      if (user) {
        // Fetch user's caronas (don't filter by time - show all in "Minhas" tab)
        const { data: userCaronas, error: errorUserCaronas } = await supabase
          .from("caronas")
          .select("*")
          .eq("usuario_id", user.id)
          .order("horario_saida", { ascending: true });

        if (errorUserCaronas) throw errorUserCaronas;

        // For each carona, fetch its reservations separately
        const userCaronasComReservas = await Promise.all(
          (userCaronas || []).map(async (carona) => {
            // Get user profile information
            const { data: userData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", carona.usuario_id)
              .single();
            
            // Get reservations for this carona
            const { data: reservasData, error: reservasError } = await supabase
              .from("reservas_caronas")
              .select("*")
              .eq("carona_id", carona.id);
              
            if (reservasError) {
              console.error("Erro ao buscar reservas:", reservasError);
              return {
                ...carona,
                status: (carona.status as "disponivel" | "completo"),
                usuario: { 
                  full_name: userData?.full_name || user.user_metadata?.full_name || "Usuário", 
                  email: user.email || "usuario@exemplo.com" 
                },
                reservas_caronas: []
              } as Carona;
            }
            
            // Process reservations to include passenger profile data
            const reservasProcessadas = await Promise.all(
              (reservasData || []).map(async (reserva) => {
                if (!reserva.usuario_id) return reserva;
                
                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("full_name")
                  .eq("id", reserva.usuario_id)
                  .maybeSingle();
                
                return {
                  ...reserva,
                  usuario: profileData ? {
                    full_name: profileData.full_name || "Usuário",
                    email: "usuario@exemplo.com" // Using a default email as it's not in the profiles table
                  } : {
                    full_name: "Usuário",
                    email: "usuario@exemplo.com"
                  }
                };
              })
            );
            
            return {
              ...carona,
              status: (carona.status as "disponivel" | "completo"),
              usuario: { 
                full_name: userData?.full_name || user.user_metadata?.full_name || "Usuário", 
                email: user.email || "usuario@exemplo.com" 
              },
              reservas_caronas: reservasProcessadas
            } as Carona;
          })
        );
        
        setMinhasCaronas(userCaronasComReservas || []);

        // Fetch user's reservations
        const { data: reservasData, error: errorReservas } = await supabase
          .from("reservas_caronas")
          .select("carona_id")
          .eq("usuario_id", user.id)
          .eq("status", "confirmado");

        if (errorReservas) throw errorReservas;

        if (reservasData && reservasData.length > 0) {
          const caronaIds = reservasData.map(r => r.carona_id);
          
          const { data: caronasReservadas, error: errorCaronasReservadas } = await supabase
            .from("caronas")
            .select("*")
            .in("id", caronaIds)
            .order("horario_saida", { ascending: true });

          if (errorCaronasReservadas) throw errorCaronasReservadas;

          // Process reserved caronas with profile data
          const reservasComUsuarios = await Promise.all(
            (caronasReservadas || []).map(async (carona) => {
              // Get user profile information
              const { data: userData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", carona.usuario_id)
                .single();
              
              return {
                ...carona,
                status: (carona.status as "disponivel" | "completo"),
                usuario: { 
                  full_name: userData?.full_name || "Usuário", 
                  email: "usuario@exemplo.com" 
                }
              } as Carona;
            })
          );
          
          setMinhasReservas(reservasComUsuarios || []);
        } else {
          setMinhasReservas([]);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar caronas",
        description: error.message,
      });
      console.error("Erro ao carregar caronas:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCaronaExpansion = (id: string) => {
    setExpandedCarona(expandedCarona === id ? null : id);
  };

  const handleEditCarona = (carona: Carona) => {
    setEditingCarona(carona);
    setFormOpen(true);
  };

  const handleDeleteCarona = async () => {
    if (!deletingCarona) return;

    try {
      const { error } = await supabase
        .from("caronas")
        .delete()
        .eq("id", deletingCarona);

      if (error) throw error;

      toast({
        title: "Carona excluída com sucesso!",
      });

      fetchCaronas();
    } catch (error: any) {
      console.error("Erro ao excluir carona:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir carona",
        description: error.message,
      });
    } finally {
      setDeletingCarona(null);
    }
  };

  const getActiveCaronas = () => {
    switch (activeTab) {
      case "minhas":
        return minhasCaronas;
      case "reservadas":
        return minhasReservas;
      case "todas":
      default:
        return caronas;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Caronas</h1>
          <p className="text-muted-foreground">
            Encontre ou ofereça caronas para outros estudantes
          </p>
        </div>
        <CaronaForm
          onCaronaCreated={fetchCaronas}
          open={formOpen}
          setOpen={setFormOpen}
          editingCarona={editingCarona}
          onClearEdit={() => setEditingCarona(null)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="todas" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">Todas</span>
            </TabsTrigger>
            {user && (
              <>
                <TabsTrigger value="minhas" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="hidden md:inline">Minhas</span>
                </TabsTrigger>
                <TabsTrigger value="reservadas" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="hidden md:inline">Reservadas</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar caronas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por local..."
                className="pl-10"
                value={filteredLocal}
                onChange={(e) => setFilteredLocal(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="todas" className="mt-0">
          <CaronasList
            caronas={caronas}
            loading={loading}
            searchTerm={searchTerm}
            filteredLocal={filteredLocal}
            expandedCarona={expandedCarona}
            toggleCaronaExpansion={toggleCaronaExpansion}
            onOpenForm={() => setFormOpen(true)}
            onEditCarona={handleEditCarona}
            onDeleteCarona={setDeletingCarona}
            onRefresh={fetchCaronas}
          />
        </TabsContent>

        <TabsContent value="minhas" className="mt-0">
          <CaronasList
            caronas={minhasCaronas}
            loading={loading}
            searchTerm={searchTerm}
            filteredLocal={filteredLocal}
            expandedCarona={expandedCarona}
            toggleCaronaExpansion={toggleCaronaExpansion}
            onOpenForm={() => setFormOpen(true)}
            onEditCarona={handleEditCarona}
            onDeleteCarona={setDeletingCarona}
            onRefresh={fetchCaronas}
          />
        </TabsContent>

        <TabsContent value="reservadas" className="mt-0">
          <CaronasList
            caronas={minhasReservas}
            loading={loading}
            searchTerm={searchTerm}
            filteredLocal={filteredLocal}
            expandedCarona={expandedCarona}
            toggleCaronaExpansion={toggleCaronaExpansion}
            onOpenForm={() => setFormOpen(true)}
            onEditCarona={handleEditCarona}
            onDeleteCarona={setDeletingCarona}
            onRefresh={fetchCaronas}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deletingCarona} onOpenChange={(open) => !open && setDeletingCarona(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir carona</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta carona? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCarona} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Caronas;
