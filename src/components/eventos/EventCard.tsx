
import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventCardProps {
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

const EventCard: React.FC<EventCardProps> = ({
  id,
  titulo,
  descricao,
  data_hora,
  localizacao,
  tipo_evento,
  universidade,
}) => {
  const formatarData = (isoString: string) => {
    const data = parseISO(isoString);
    return format(data, "dd 'de' MMMM', às 'HH:mm", { locale: ptBR });
  };

  return (
    <Card key={id} className="border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover-scale">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{titulo}</CardTitle>
          {tipo_evento && <Badge variant="secondary">{tipo_evento}</Badge>}
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <Building className="h-3 w-3" />
          {universidade?.sigla || "UNIVERSIDADE"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{descricao}</p>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatarData(data_hora)}</span>
          </div>

          {localizacao && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{localizacao}</span>
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
  );
};

export default EventCard;
