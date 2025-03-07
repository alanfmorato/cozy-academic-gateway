
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
import { toast } from "@/hooks/use-toast";

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

  const handleAddToCalendar = () => {
    try {
      const eventDate = parseISO(data_hora);
      
      // Calculate end time (default: 2 hours after start time)
      const endTime = new Date(eventDate);
      endTime.setHours(endTime.getHours() + 2);
      
      // Format dates for Google Calendar
      const startTimeStr = eventDate.toISOString().replace(/-|:|\.\d+/g, "");
      const endTimeStr = endTime.toISOString().replace(/-|:|\.\d+/g, "");
      
      // Create event details
      const eventTitle = encodeURIComponent(titulo);
      const eventDetails = encodeURIComponent(descricao);
      const eventLocation = localizacao ? encodeURIComponent(localizacao) : "";
      
      // Generate calendar URL (Google Calendar format)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startTimeStr}/${endTimeStr}&details=${eventDetails}&location=${eventLocation}&sf=true&output=xml`;
      
      // Open calendar in new tab
      window.open(googleCalendarUrl, '_blank');
      
      toast({
        title: "Evento adicionado",
        description: "O evento foi adicionado ao seu calendário",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar evento ao calendário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o evento ao calendário",
        variant: "destructive",
      });
    }
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
        <Button size="sm" className="w-full" onClick={handleAddToCalendar}>
          <Calendar className="mr-2 h-4 w-4" />
          Tenho interesse
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
