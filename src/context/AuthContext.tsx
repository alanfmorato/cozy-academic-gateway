
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
  const navigate = useNavigate();
  const location = useLocation();

  // Função para verificar a sessão atual
  const checkSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao verificar sessão:", error);
        throw error;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      
      // Redirecionar com base no status da autenticação e na rota atual
      if (!data.session && location.pathname !== "/auth") {
        navigate("/auth");
      }
      
      return data.session;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Não foi possível verificar sua sessão",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se já existe uma sessão ativa quando o componente for montado
    checkSession();

    // Configurar o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);

        // Redirecionar o usuário com base no estado de autenticação
        if (event === "SIGNED_IN" && location.pathname === "/auth") {
          navigate("/");
        } else if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    // Limpar o listener ao desmontar o componente
    return () => {
      authListener.subscription.unsubscribe();
    };
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
