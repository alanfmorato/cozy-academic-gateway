
import React from "react";
import { Calendar } from "lucide-react";
import EventCard from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export interface Evento {
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

interface EventListProps {
  eventos: Evento[];
  loading: boolean;
  searchTerm: string;
  filtroTipo: string;
}

const EventList: React.FC<EventListProps> = ({ eventos, loading, searchTerm, filtroTipo }) => {
  const filteredEventos = eventos.filter((evento) => {
    const matchesTermo =
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evento.localizacao && evento.localizacao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      evento.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = filtroTipo === "all" ? true : evento.tipo_evento === filtroTipo;

    return matchesTermo && matchesTipo;
  });

  if (loading) {
    return (
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
    );
  }

  if (filteredEventos.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">Nenhum evento encontrado</h3>
        <p className="mt-2 text-muted-foreground">
          Seja o primeiro a publicar um evento ou ajuste sua busca.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredEventos.map((evento) => (
        <EventCard
          key={evento.id}
          id={evento.id}
          titulo={evento.titulo}
          descricao={evento.descricao}
          data_hora={evento.data_hora}
          localizacao={evento.localizacao}
          tipo_evento={evento.tipo_evento}
          universidade={evento.universidade}
        />
      ))}
    </div>
  );
};

export default EventList;
