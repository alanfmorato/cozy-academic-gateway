
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  // Mapeamento de valores de universidade para nomes completos
  const universidadeNomes: Record<string, string> = {
    usp: "Universidade de São Paulo",
    unicamp: "Universidade Estadual de Campinas",
    ufrj: "Universidade Federal do Rio de Janeiro",
    unb: "Universidade de Brasília",
    ufmg: "Universidade Federal de Minas Gerais"
  };

  // Mapeamento de tipo de usuário para nomes mais amigáveis
  const tiposUsuario: Record<string, string> = {
    estudante: "Estudante",
    cursinho: "Cursinho"
  };

  return (
    <div className="container mx-auto p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo ao NewsUniversity</h1>
          <p className="text-muted-foreground">
            Olá, {user.user_metadata.full_name || user.email}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sua conta</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Email:</span>
              <span className="col-span-2">{user.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Nome:</span>
              <span className="col-span-2">
                {user.user_metadata.full_name || "Não informado"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Universidade:</span>
              <span className="col-span-2">
                {universidadeNomes[user.user_metadata.university] || "Não informada"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Tipo de usuário:</span>
              <span className="col-span-2">
                {tiposUsuario[user.user_metadata.tipo_usuario] || "Estudante"}
              </span>
            </div>
          </div>
        </div>

        <Button variant="destructive" className="w-full" onClick={signOut}>
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Index;
