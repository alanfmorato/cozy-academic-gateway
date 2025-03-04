
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AuthFormData {
  email: string;
  password: string;
  full_name?: string;
  university?: string;
  tipo_usuario?: string;
}

export const signIn = async ({ email, password }: AuthFormData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message,
      });
      return { success: false, error };
    }

    toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
    });
    return { success: true, data };
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Erro inesperado",
      description: error.message || "Ocorreu um erro ao fazer login",
    });
    return { success: false, error };
  }
};

export const signUp = async ({ email, password, full_name, university, tipo_usuario }: AuthFormData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          university,
          tipo_usuario: tipo_usuario || "estudante",
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
      return { success: false, error };
    }

    toast({
      title: "Conta criada com sucesso",
      description: "Verifique seu email para confirmar seu cadastro",
    });
    return { success: true, data };
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Erro inesperado",
      description: error.message || "Ocorreu um erro ao criar conta",
    });
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
      return { success: false, error };
    }
    
    toast({
      title: "Sessão finalizada",
      description: "Você saiu da sua conta com sucesso",
    });
    return { success: true };
  } catch (error: any) {
    console.error("Exceção ao fazer logout:", error);
    toast({
      variant: "destructive",
      title: "Erro inesperado",
      description: error.message || "Ocorreu um erro ao sair",
    });
    return { success: false, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao resetar senha",
        description: error.message,
      });
      return { success: false, error };
    }
    
    toast({
      title: "Email enviado",
      description: "Verifique seu email para resetar sua senha",
    });
    return { success: true };
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Erro inesperado",
      description: error.message || "Ocorreu um erro ao resetar senha",
    });
    return { success: false, error };
  }
};
