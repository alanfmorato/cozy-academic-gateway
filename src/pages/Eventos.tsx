
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import EventList, { Evento } from "@/components/eventos/EventList";
import EventForm from "@/components/eventos/EventForm";
import EventSearch from "@/components/eventos/EventSearch";

const Eventos = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Fique por dentro dos eventos na sua universidade
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
        <EventForm
          open={formOpen}
          onOpenChange={setFormOpen}
          userId={user?.id}
          userUniversity={user?.user_metadata.university}
          onEventCreated={fetchEventos}
        />
      </div>

      <EventSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
      />

      <EventList
        eventos={eventos}
        loading={loading}
        searchTerm={searchTerm}
        filtroTipo={filtroTipo}
      />
    </div>
  );
};

export default Eventos;
