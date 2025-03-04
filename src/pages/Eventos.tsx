
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Calendar, MapPin, Clock, Plus, Building, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data_hora: string;
  localizacao: string | null;
  tipo_evento: string | null;
  usuario_id: string;
  universidade_id: string;
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
}

const tiposEvento = [
  "Festa",
  "Palestra",
  "Workshop",
  "Seminário",
  "Conferência",
  "Encontro",
  "Curso",
  "Outro"
];

const Eventos = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_hora: "",
    localizacao: "",
    tipo_evento: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [universidadeLoading, setUniversidadeLoading] = useState(false);

  useEffect(() => {
    fetchEventos();
    // Verificar e criar universidade se necessário quando o usuário estiver logado
    if (user && user.user_metadata.university && user.user_metadata.university !== "explorando") {
      verificaECriaUniversidade(user.user_metadata.university);
    }
  }, [user]);

  const verificaECriaUniversidade = async (sigla: string) => {
    if (universidadeLoading) return;
    
    setUniversidadeLoading(true);
    try {
      // Verifica se a universidade já existe
      const { data: existingUni, error: checkError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", sigla)
        .maybeSingle();

      if (checkError) {
        console.error("Erro ao verificar universidade:", checkError);
        return;
      }

      // Se a universidade não existir, criamos uma nova
      if (!existingUni) {
        console.log(`Universidade com sigla ${sigla} não encontrada. Criando uma nova.`);
        
        // Mapeamento das siglas para nomes completos
        const uniNomes: Record<string, [string, string, string]> = {
          usp: ["Universidade de São Paulo", "São Paulo", "SP"],
          unicamp: ["Universidade Estadual de Campinas", "Campinas", "SP"],
          ufrj: ["Universidade Federal do Rio de Janeiro", "Rio de Janeiro", "RJ"],
          unb: ["Universidade de Brasília", "Brasília", "DF"],
          ufmg: ["Universidade Federal de Minas Gerais", "Belo Horizonte", "MG"],
          ufsc: ["Universidade Federal de Santa Catarina", "Florianópolis", "SC"],
          ufrgs: ["Universidade Federal do Rio Grande do Sul", "Porto Alegre", "RS"],
          ufc: ["Universidade Federal do Ceará", "Fortaleza", "CE"],
          ufba: ["Universidade Federal da Bahia", "Salvador", "BA"]
        };

        if (!uniNomes[sigla]) {
          console.error(`Não foi possível mapear a sigla ${sigla} para um nome de universidade`);
          return;
        }

        const [nome, cidade, estado] = uniNomes[sigla];
        
        // Inserir a nova universidade
        const { data: newUni, error: insertError } = await supabase
          .from("universidades")
          .insert({
            nome,
            sigla,
            cidade,
            estado
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Erro ao criar universidade:", insertError);
          return;
        }

        console.log(`Universidade ${nome} (${sigla}) criada com sucesso!`);
      } else {
        console.log(`Universidade com sigla ${sigla} encontrada.`);
      }
    } catch (error) {
      console.error("Erro ao verificar/criar universidade:", error);
    } finally {
      setUniversidadeLoading(false);
    }
  };

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select(`
          *,
          universidade:universidades(nome, sigla)
        `)
        .order("data_hora", { ascending: true });

      if (error) throw error;
      
      // Filtra apenas eventos futuros
      const now = new Date().toISOString();
      const eventosFuturos = data.filter(evento => evento.data_hora >= now);
      
      setEventos(eventosFuturos);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar eventos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipo_evento: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para publicar eventos.",
      });
      return;
    }

    // Verificar se o tipo do evento está dentro das opções permitidas
    if (formData.tipo_evento && !tiposEvento.includes(formData.tipo_evento)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Tipo de evento inválido. Por favor, selecione um tipo válido.",
      });
      return;
    }

    // Verificar e criar a universidade se necessário antes de publicar o evento
    await verificaECriaUniversidade(user.user_metadata.university);

    setFormLoading(true);
    try {
      // Buscando o ID da universidade do usuário
      const { data: uniData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", user.user_metadata.university)
        .maybeSingle();

      if (uniError) {
        throw uniError;
      }

      if (!uniData) {
        throw new Error(`Universidade ${user.user_metadata.university} não encontrada. Por favor, entre em contato com o suporte.`);
      }

      const novoEvento = {
        ...formData,
        usuario_id: user.id,
        universidade_id: uniData.id,
      };

      const { error } = await supabase
        .from("eventos")
        .insert(novoEvento);

      if (error) throw error;

      toast({
        title: "Evento publicado",
        description: "Seu evento foi publicado com sucesso!",
      });
      
      setFormOpen(false);
      setFormData({
        titulo: "",
        descricao: "",
        data_hora: "",
        localizacao: "",
        tipo_evento: "",
      });
      fetchEventos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao publicar evento",
        description: error.message,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesTermo = 
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evento.localizacao && evento.localizacao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      evento.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filtroTipo ? evento.tipo_evento === filtroTipo : true;
    
    return matchesTermo && matchesTipo;
  });

  const formatarData = (isoString: string) => {
    const data = parseISO(isoString);
    return format(data, "dd 'de' MMMM', às 'HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Fique por dentro dos eventos na sua universidade
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Publicar Novo Evento</DialogTitle>
                <DialogDescription>
                  Compartilhe detalhes sobre o evento que você deseja divulgar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    placeholder="Nome do evento"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    placeholder="Descreva o evento, programação, etc."
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    className="resize-none"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="data_hora">Data e Hora</Label>
                    <Input
                      id="data_hora"
                      name="data_hora"
                      type="datetime-local"
                      value={formData.data_hora}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipo_evento">Tipo de Evento</Label>
                    <Select 
                      value={formData.tipo_evento} 
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="tipo_evento">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEvento.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    name="localizacao"
                    placeholder="Local do evento"
                    value={formData.localizacao}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading || universidadeLoading}>
                  {formLoading ? "Publicando..." : "Publicar Evento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              {tiposEvento.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border/40 backdrop-blur-sm bg-card/30">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredEventos.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum evento encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            Seja o primeiro a publicar um evento ou ajuste sua busca.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEventos.map((evento) => (
            <Card 
              key={evento.id} 
              className="border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover-scale"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                  {evento.tipo_evento && (
                    <Badge variant="secondary">{evento.tipo_evento}</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Building className="h-3 w-3" />
                  {evento.universidade?.sigla || "UNIVERSIDADE"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{evento.descricao}</p>
                
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatarData(evento.data_hora)}</span>
                  </div>
                  
                  {evento.localizacao && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{evento.localizacao}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button size="sm" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Tenho interesse
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Eventos;
