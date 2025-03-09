
import React, { useEffect, useState } from "react";
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
  Car,
  Bell,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para os eventos
interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_hora: string;
  localizacao: string | null;
  tipo_evento: string | null;
  universidade?: {
    nome: string;
    sigla: string;
  };
}

// Interface para os avisos
interface Aviso {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  tipo: "importante" | "informativo" | "urgente";
}

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosLoading, setEventosLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Avisos da faculdade (mockados por enquanto)
  const avisos: Aviso[] = [
    {
      id: 1,
      titulo: "Matrícula para o próximo semestre",
      descricao: "As matrículas para o próximo semestre estarão abertas de 01/12 a 15/12. Não perca o prazo!",
      data: "2023-11-15",
      tipo: "importante"
    },
    {
      id: 2,
      titulo: "Semana de Tecnologia",
      descricao: "A Semana de Tecnologia acontecerá entre os dias 20 e 24 de novembro. Participe das palestras e workshops!",
      data: "2023-11-05",
      tipo: "informativo"
    },
    {
      id: 3,
      titulo: "Manutenção do Sistema",
      descricao: "O sistema acadêmico estará indisponível no dia 18/11 das 22h às 6h para manutenção programada.",
      data: "2023-11-10",
      tipo: "urgente"
    }
  ];
  
  // Informações acadêmicas do aluno (mockado por enquanto)
  const infoAcademica = {
    curso: "Ciência da Computação",
    semestre: "5º",
    cr: "8.7",
    atividades_complementares: "80/120",
    proximas_provas: [
      { nome: "Cálculo III", data: "2023-11-25" },
      { nome: "Inteligência Artificial", data: "2023-11-28" }
    ]
  };

  useEffect(() => {
    console.log("Index page loaded", { user, isLoading });
    // Check for any assets that might be failing to load
    window.addEventListener('error', (e) => {
      if (e.target && (e.target as any).tagName === 'SCRIPT' || (e.target as any).tagName === 'LINK') {
        console.error('Resource failed to load:', (e.target as any).src || (e.target as any).href);
      }
    }, true);
    
    // Carregar eventos
    fetchEventos();
  }, [user, isLoading]);

  // Buscar eventos no Supabase
  const fetchEventos = async () => {
    setEventosLoading(true);
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select(`
          *,
          universidade:universidades(nome, sigla)
        `)
        .order("data_hora", { ascending: true })
        .limit(5);

      if (error) throw error;
      
      setEventos(data || []);
      
    } catch (error: any) {
      console.error("Erro ao carregar eventos:", error.message);
    } finally {
      setEventosLoading(false);
    }
  };

  // Mapeamento de universidade para nomes completos
  const universidadeNomes: Record<string, string> = {
    usp: "Universidade de São Paulo",
    unicamp: "Universidade Estadual de Campinas",
    ufrj: "Universidade Federal do Rio de Janeiro",
    unb: "Universidade de Brasília",
    ufmg: "Universidade Federal de Minas Gerais"
  };

  const formatarData = (isoString: string) => {
    const data = parseISO(isoString);
    return format(data, "dd 'de' MMMM', às 'HH:mm", { locale: ptBR });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === eventos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? eventos.length - 1 : prev - 1));
  };

  const getTipoBadge = (tipo: Aviso["tipo"]) => {
    switch (tipo) {
      case "importante":
        return <Badge variant="secondary">Importante</Badge>;
      case "urgente":
        return <Badge variant="destructive">Urgente</Badge>;
      default:
        return <Badge variant="outline">Informativo</Badge>;
    }
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
    <div className="space-y-8">
      {/* Cabeçalho de boas-vindas */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.user_metadata.full_name || "Estudante"}!</h1>
        <p className="text-muted-foreground">
          {user?.user_metadata.university ? 
            `Conectado a ${universidadeNomes[user.user_metadata.university] || user.user_metadata.university}` : 
            "Acesse todas as funcionalidades abaixo"}
        </p>
      </div>

      {/* Avisos da faculdade */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Megaphone className="mr-2 h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-semibold">Avisos da Faculdade</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {avisos.map((aviso) => (
            <Alert key={aviso.id} className="border border-border/40 backdrop-blur-sm bg-card/30 hover-scale">
              <div className="flex justify-between items-start mb-2">
                <AlertTitle className="text-base font-medium">{aviso.titulo}</AlertTitle>
                {getTipoBadge(aviso.tipo)}
              </div>
              <AlertDescription className="text-sm">
                {aviso.descricao}
                <div className="mt-2 text-xs text-muted-foreground">
                  Publicado em: {new Date(aviso.data).toLocaleDateString('pt-BR')}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>

      {/* Carrossel de eventos */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-semibold">Próximos Eventos</h2>
        </div>
        <div className="relative">
          {eventosLoading ? (
            <Card className="h-64 flex items-center justify-center border border-border/40 backdrop-blur-sm bg-card/30">
              <div className="animate-pulse text-lg">Carregando eventos...</div>
            </Card>
          ) : eventos.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg">
                <div className="relative h-64 transition-all duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  <div className="flex">
                    {eventos.map((evento, index) => (
                      <Card 
                        key={evento.id} 
                        className="min-w-full border border-border/40 backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 h-64 relative"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{evento.titulo}</CardTitle>
                            {evento.tipo_evento && <Badge variant="secondary">{evento.tipo_evento}</Badge>}
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            {evento.universidade?.sigla || "UNIVERSIDADE"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-2">
                          <p className="text-sm text-muted-foreground line-clamp-3">{evento.descricao}</p>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span className="font-medium">{formatarData(evento.data_hora)}</span>
                            </div>
                            {evento.localizacao && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span>{evento.localizacao}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="absolute bottom-4 left-0 right-0 px-6">
                          <Button variant="default" className="w-full" onClick={() => navigate("/eventos")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <div className="flex justify-center mt-4">
                {eventos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`mx-1 h-3 w-3 rounded-full transition-all ${
                      currentSlide === index ? "bg-primary" : "bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center border border-border/40 backdrop-blur-sm bg-card/30">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Nenhum evento encontrado</h3>
                <p className="mt-2 text-muted-foreground">
                  Não existem eventos cadastrados para sua universidade.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Informações acadêmicas */}
      <div className="space-y-4">
        <div className="flex items-center">
          <GraduationCap className="mr-2 h-5 w-5 text-green-500" />
          <h2 className="text-2xl font-semibold">Informações Acadêmicas</h2>
        </div>
        <Card className="border border-border/40 backdrop-blur-sm bg-gradient-to-br from-green-500/10 to-blue-500/10">
          <CardHeader>
            <CardTitle>Resumo Acadêmico</CardTitle>
            <CardDescription>
              {infoAcademica.curso} - {infoAcademica.semestre} semestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Coeficiente de Rendimento</p>
                  <p className="text-2xl font-bold">{infoAcademica.cr}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Atividades Complementares</p>
                  <p className="text-2xl font-bold">{infoAcademica.atividades_complementares} horas</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Próximas Avaliações</p>
                <div className="space-y-2">
                  {infoAcademica.proximas_provas.map((prova, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background/50 rounded-md">
                      <span className="font-medium">{prova.nome}</span>
                      <Badge variant="outline">{new Date(prova.data).toLocaleDateString('pt-BR')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver Histórico Completo
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Serviços rápidos */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-purple-500" />
          <h2 className="text-2xl font-semibold">Serviços Rápidos</h2>
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
      </div>

      {/* Perfil do usuário */}
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
