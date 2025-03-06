
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "./Sidebar";
import LoadingScreen from "./LoadingScreen";
import { toast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading, checkSession } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const sessionVerified = useRef(false);
  
  useEffect(() => {
    const verifySession = async () => {
      if (sessionVerified.current) return;
      
      try {
        setCheckingSession(true);
        sessionVerified.current = true;
        const session = await checkSession();
        
        if (!session) {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Falha ao verificar sua sessão. Tente novamente."
        });
        navigate('/auth');
      } finally {
        setCheckingSession(false);
      }
    };
    
    verifySession();
  }, [checkSession, navigate]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading || checkingSession) {
      timeoutId = window.setTimeout(() => {
        setCheckingSession(false);
      }, 5000);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading, checkingSession]);

  // Check for notifications when the user loads the app
  useEffect(() => {
    if (user) {
      checkForNotifications();
    }
  }, [user]);

  // Function to check for ride notifications
  const checkForNotifications = async () => {
    if (!user) return;
    
    try {
      // Check for upcoming rides (as passenger)
      const { data: upcomingRides } = await supabase
        .from("reservas_caronas")
        .select(`
          carona_id,
          status,
          caronas (
            horario_saida,
            local_saida,
            local_chegada
          )
        `)
        .eq("usuario_id", user.id)
        .eq("status", "confirmado");
      
      // Check for driver's rides with passengers
      const { data: driverRides } = await supabase
        .from("caronas")
        .select(`
          id,
          horario_saida,
          local_saida,
          local_chegada,
          reservas_caronas (
            id,
            usuario_id,
            status,
            created_at
          )
        `)
        .eq("usuario_id", user.id);
      
      // Process upcoming rides notifications (passenger)
      if (upcomingRides) {
        upcomingRides.forEach(reservation => {
          const ride = reservation.caronas;
          if (!ride) return;
          
          const departureTime = new Date(ride.horario_saida);
          const now = new Date();
          const timeDiff = departureTime.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Notify about rides happening in the next 3 hours
          if (hoursDiff > 0 && hoursDiff < 3) {
            toast({
              title: "Lembrete de carona",
              description: `Você tem uma carona de ${ride.local_saida} para ${ride.local_chegada} em ${Math.round(hoursDiff * 60)} minutos!`,
              duration: 10000,
            });
          }
        });
      }
      
      // Process driver notifications (new reservations in the last 24h)
      if (driverRides) {
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);
        
        driverRides.forEach(ride => {
          // Check upcoming rides for driver notifications
          const departureTime = new Date(ride.horario_saida);
          const now = new Date();
          const timeDiff = departureTime.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          // Notify driver about rides happening in the next 3 hours
          if (hoursDiff > 0 && hoursDiff < 3) {
            const passengersCount = ride.reservas_caronas?.filter(r => r.status === "confirmado").length || 0;
            
            if (passengersCount > 0) {
              toast({
                title: "Lembrete de carona (motorista)",
                description: `Você tem uma carona de ${ride.local_saida} para ${ride.local_chegada} em ${Math.round(hoursDiff * 60)} minutos com ${passengersCount} passageiro(s)!`,
                duration: 10000,
              });
            }
          }
          
          // New reservations notification
          if (ride.reservas_caronas) {
            const newReservations = ride.reservas_caronas.filter(reservation => {
              const reservationDate = new Date(reservation.created_at);
              return reservationDate > last24h && reservation.status === "confirmado";
            });
            
            if (newReservations.length > 0) {
              toast({
                title: "Novas reservas",
                description: `Você tem ${newReservations.length} nova(s) reserva(s) para sua carona de ${ride.local_saida} para ${ride.local_chegada}!`,
                duration: 10000,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error checking for notifications:", error);
    }
  };

  if (isLoading || checkingSession) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <>{children}</>;
  }

  const toggleMenu = () => setMenuOpen(prev => !prev);
  
  const closeMenu = () => {
    if (window.innerWidth < 768) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          className="p-2 rounded-full bg-background border border-border md:hidden"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <Sidebar 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        closeMenu={closeMenu}
      />

      <main
        className={cn(
          "flex-1 transition-all duration-300 ml-0 md:ml-64 p-6",
          menuOpen && "brightness-50 md:brightness-100"
        )}
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
