
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  userUniversity: string | undefined;
  onEventCreated: () => void;
}

export const tiposEvento = [
  "Festa",
  "Palestra",
  "Workshop",
  "Seminário",
  "Conferência",
  "Encontro",
  "Curso",
  "Outro",
];

const EventForm: React.FC<EventFormProps> = ({
  open,
  onOpenChange,
  userId,
  userUniversity,
  onEventCreated,
}) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_hora: "",
    localizacao: "",
    tipo_evento: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [universidadeLoading, setUniversidadeLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo_evento: value,
    }));
  };

  const verificaECriaUniversidade = async (sigla: string) => {
    if (universidadeLoading) return null;

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
        return null;
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
          ufba: ["Universidade Federal da Bahia", "Salvador", "BA"],
        };

        if (!uniNomes[sigla]) {
          console.error(`Não foi possível mapear a sigla ${sigla} para um nome de universidade`);
          return null;
        }

        const [nome, cidade, estado] = uniNomes[sigla];

        // Inserir a nova universidade
        const { data: newUni, error: insertError } = await supabase
          .from("universidades")
          .insert({
            nome,
            sigla,
            cidade,
            estado,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Erro ao criar universidade:", insertError);
          return null;
        }

        console.log(`Universidade ${nome} (${sigla}) criada com sucesso!`);
        return newUni.id;
      } else {
        console.log(`Universidade com sigla ${sigla} encontrada.`);
        return existingUni.id;
      }
    } catch (error) {
      console.error("Erro ao verificar/criar universidade:", error);
      return null;
    } finally {
      setUniversidadeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para publicar eventos.",
      });
      return;
    }

    if (!userUniversity) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Universidade não encontrada em seu perfil.",
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

    setFormLoading(true);
    try {
      // Verificar e criar a universidade se necessário antes de publicar o evento
      const universidadeId = await verificaECriaUniversidade(userUniversity);

      if (!universidadeId) {
        throw new Error(
          `Universidade ${userUniversity} não encontrada. Por favor, entre em contato com o suporte.`
        );
      }

      const novoEvento = {
        ...formData,
        usuario_id: userId,
        universidade_id: universidadeId,
      };

      const { error } = await supabase.from("eventos").insert(novoEvento);

      if (error) throw error;

      toast({
        title: "Evento publicado",
        description: "Seu evento foi publicado com sucesso!",
      });

      onOpenChange(false);
      setFormData({
        titulo: "",
        descricao: "",
        data_hora: "",
        localizacao: "",
        tipo_evento: "",
      });
      onEventCreated();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <Select value={formData.tipo_evento} onValueChange={handleSelectChange}>
                  <SelectTrigger id="tipo_evento">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((tipo) => (
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formLoading || universidadeLoading}>
              {formLoading ? "Publicando..." : "Publicar Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
