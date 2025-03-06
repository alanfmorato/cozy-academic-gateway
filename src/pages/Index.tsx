
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  BookOpen, 
  Home as HomeIcon, 
  ShoppingCart, 
  Calendar, 
  FileText, 
  Briefcase, 
  ArrowRight,
  Car
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index page loaded", { user, isLoading });
    // Check for any assets that might be failing to load
    window.addEventListener('error', (e) => {
      if (e.target && (e.target as any).tagName === 'SCRIPT' || (e.target as any).tagName === 'LINK') {
        console.error('Resource failed to load:', (e.target as any).src || (e.target as any).href);
      }
    }, true);
  }, [user, isLoading]);

  // Mapeamento de universidade para nomes completos
  const universidadeNomes: Record<string, string> = {
    usp: "Universidade de São Paulo",
    unicamp: "Universidade Estadual de Campinas",
    ufrj: "Universidade Federal do Rio de Janeiro",
    unb: "Universidade de Brasília",
    ufmg: "Universidade Federal de Minas Gerais"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  const features = [
    {
      title: "Cursos",
      description: "Informações detalhadas sobre cursos, notas de corte e mais",
      icon: <BookOpen className="h-6 w-6" />,
      path: "/cursos",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      title: "Moradias",
      description: "Encontre ou anuncie moradias próximas à universidade",
      icon: <HomeIcon className="h-6 w-6" />,
      path: "/moradias",
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Marketplace",
      description: "Compre e venda itens entre a comunidade acadêmica",
      icon: <ShoppingCart className="h-6 w-6" />,
      path: "/marketplace",
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      title: "Eventos",
      description: "Fique por dentro de eventos, palestras e workshops",
      icon: <Calendar className="h-6 w-6" />,
      path: "/eventos",
      color: "from-red-500/20 to-red-600/20"
    },
    {
      title: "Materiais",
      description: "Acesse materiais acadêmicos e grupos de estudo",
      icon: <FileText className="h-6 w-6" />,
      path: "/materiais",
      color: "from-yellow-500/20 to-yellow-600/20"
    },
    {
      title: "Estágios",
      description: "Descubra oportunidades de estágio e monitorias",
      icon: <Briefcase className="h-6 w-6" />,
      path: "/estagios",
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      title: "Caronas",
      description: "Ofereça ou reserve caronas para a universidade",
      icon: <Car className="h-6 w-6" />,
      path: "/caronas",
      color: "from-indigo-500/20 to-indigo-600/20"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.user_metadata.full_name || "Estudante"}!</h1>
        <p className="text-muted-foreground">
          {user?.user_metadata.university ? 
            `Conectado a ${universidadeNomes[user.user_metadata.university] || user.user_metadata.university}` : 
            "Acesse todas as funcionalidades abaixo"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="overflow-hidden border border-border/40 backdrop-blur-sm bg-card/30 hover-scale">
            <CardHeader className={`bg-gradient-to-br ${feature.color} p-6`}>
              <div className="flex items-center gap-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => navigate(feature.path)}
              >
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border border-border/40 backdrop-blur-sm bg-card/30">
        <CardHeader>
          <CardTitle>Seu perfil</CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Email:</span>
              <span className="col-span-2">{user?.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Nome:</span>
              <span className="col-span-2">
                {user?.user_metadata.full_name || "Não informado"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Universidade:</span>
              <span className="col-span-2">
                {universidadeNomes[user?.user_metadata.university] || "Não informada"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium">Tipo de usuário:</span>
              <span className="col-span-2 capitalize">
                {user?.user_metadata.tipo_usuario || "Estudante"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
