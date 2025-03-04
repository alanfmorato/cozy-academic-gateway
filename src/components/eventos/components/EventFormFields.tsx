
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tiposEvento } from "../utils/eventTypes";

interface EventFormFieldsProps {
  formData: {
    titulo: string;
    descricao: string;
    data_hora: string;
    localizacao: string;
    tipo_evento: string;
  };
  tiposEventoDb: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (value: string) => void;
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({
  formData,
  tiposEventoDb,
  handleInputChange,
  handleSelectChange,
}) => {
  return (
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
            required
          >
            <SelectTrigger id="tipo_evento">
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              {tiposEvento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tiposEventoDb.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Tipos usados recentemente: {tiposEventoDb.join(', ')}
            </p>
          )}
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
  );
};

export default EventFormFields;
