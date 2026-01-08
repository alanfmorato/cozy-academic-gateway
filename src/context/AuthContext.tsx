
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const sessionCheckRef = useRef<boolean>(false);
  const authChangeHandled = useRef<boolean>(false);

  // Memoized function to check the current session
  const checkSession = useCallback(async () => {
    // If a session check is already in progress, don't start another one
    if (sessionCheckRef.current) {
      return session;
    }

    try {
      sessionCheckRef.current = true;
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
      sessionCheckRef.current = false;
    }
  }, [session]);

  // Force navigation when session changes
  const handleAuthChange = useCallback((newSession: Session | null) => {
    console.log("Handling auth change, session exists:", !!newSession);
    
    if (newSession && location.pathname === "/auth") {
      console.log("Redirecting to home page after login");
      navigate("/", { replace: true });
    }
    // Removed redirect to /auth when not logged in - allows viewing without auth
  }, [navigate, location.pathname]);

  // Redirect logic based on auth state and current location
  useEffect(() => {
    if (!initialized) return;
    
    handleAuthChange(session);
  }, [session, initialized, handleAuthChange]);

  // Check session and setup auth listener only once on component mount
  useEffect(() => {
    const initAuth = async () => {
      if (!initialized) {
        const currentSession = await checkSession();
        
        // Handle initial navigation
        if (currentSession && location.pathname === "/auth") {
          console.log("Initial redirect to home page");
          navigate("/", { replace: true });
        }
      }
      
      // Setup listener for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log("Auth state changed:", event);
          authChangeHandled.current = true;
          
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Handle redirects based on auth events
          if (event === "SIGNED_IN" && location.pathname === "/auth") {
            console.log("User signed in, redirecting to home");
            navigate("/", { replace: true });
          } else if (event === "SIGNED_OUT") {
            console.log("User signed out, redirecting to auth");
            navigate("/auth", { replace: true });
          }
        }
      );
      
      // Cleanup listener on unmount
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initAuth();
    // Only run once on mount, other state changes are handled by the onAuthStateChange listener
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
