
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  checkSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  checkSession: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check the current session
  const checkSession = async () => {
    try {
      setIsLoading(true);
      console.log("Checking session...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        throw error;
      }
      
      console.log("Session data:", data.session ? "Session exists" : "No session");
      setSession(data.session);
      setUser(data.session?.user || null);
      
      return data.session;
    } catch (error: any) {
      console.error("Error getting session:", error);
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Não foi possível verificar sua sessão",
      });
      return null;
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  // Redirect logic based on auth state and current location
  useEffect(() => {
    if (!initialized) return;
    
    if (!session && location.pathname !== "/auth") {
      console.log("No session, redirecting to /auth");
      navigate("/auth");
    }
  }, [session, location.pathname, initialized, navigate]);

  // Check session and setup auth listener on component mount
  useEffect(() => {
    const initAuth = async () => {
      await checkSession();
      
      // Setup listener for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Handle redirects based on auth events
          if (event === "SIGNED_IN" && location.pathname === "/auth") {
            navigate("/");
          } else if (event === "SIGNED_OUT") {
            navigate("/auth");
          }
        }
      );
      
      // Cleanup listener on unmount
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
