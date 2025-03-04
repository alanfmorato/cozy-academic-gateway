
import { useState, useEffect } from "react";
import { tiposEvento, updateEventTypesConstraint } from "../utils/eventTypes";
import { useUniversityCreation } from "./useUniversityCreation";
import { toast } from "@/hooks/use-toast";

interface FormData {
  titulo: string;
  descricao: string;
  data_hora: string;
  localizacao: string;
  tipo_evento: string;
}

interface EventoRecord {
  tipo_evento: string;
}

export const useEventForm = (
  supabase: any,
  userId: string | undefined,
  userUniversity: string | undefined,
  onOpenChange: (open: boolean) => void,
  onEventCreated: () => void,
  open: boolean
) => {
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    data_hora: "",
    localizacao: "",
    tipo_evento: tiposEvento[0],
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [tiposEventoDb, setTiposEventoDb] = useState<string[]>([]);
  const [constraintUpdated, setConstraintUpdated] = useState(false);
  
  const { universidadeLoading, verificaECriaUniversidade } = useUniversityCreation(supabase);

  useEffect(() => {
    const runUpdate = async () => {
      if (open && !constraintUpdated) {
        const result = await updateEventTypesConstraint(supabase);
        if (result.success) {
          setConstraintUpdated(true);
          toast({
            title: "Sistema atualizado",
            description: "Tipos de evento foram atualizados no sistema.",
          });
        }
      }
    };
    
    runUpdate();
  }, [open, constraintUpdated, supabase]);

  useEffect(() => {
    const fetchAllowedEventTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('tipo_evento')
          .limit(5);
        
        if (error) {
          console.error('Erro ao buscar tipos de evento:', error);
          return;
        }

        if (data && data.length > 0) {
          const eventRecords = data as EventoRecord[];
          
          const tipos: string[] = [...new Set(
            eventRecords
              .map(item => item.tipo_evento)
              .filter(Boolean)
          )];
          
          if (tipos.length > 0) {
            console.log('Tipos de evento encontrados no banco:', tipos);
            setTiposEventoDb(tipos);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar tipos de evento:', error);
      }
    };

    fetchAllowedEventTypes();
  }, [supabase]);

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
    console.log(`Tipo de evento selecionado: "${value}"`);
    
    if (tiposEvento.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        tipo_evento: value,
      }));
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Tipo de evento inválido: "${value}". Valores permitidos: ${tiposEvento.join(', ')}`,
      });
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

    if (!formData.tipo_evento || !tiposEvento.includes(formData.tipo_evento)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Tipo de evento inválido: "${formData.tipo_evento}". Por favor, selecione um tipo válido.`,
      });
      return;
    }

    setFormLoading(true);
    try {
      const universidadeId = await verificaECriaUniversidade(userUniversity);

      if (!universidadeId) {
        throw new Error(
          `Universidade ${userUniversity} não encontrada. Por favor, entre em contato com o suporte.`
        );
      }

      const tipoEventoValido = formData.tipo_evento;
      console.log(`Tipo de evento a ser enviado: "${tipoEventoValido}"`);

      const novoEvento = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        data_hora: formData.data_hora,
        localizacao: formData.localizacao,
        tipo_evento: tipoEventoValido,
        usuario_id: userId,
        universidade_id: universidadeId,
      };

      console.log("Dados do evento a serem enviados:", novoEvento);

      const { error } = await supabase.from("eventos").insert(novoEvento);

      if (error) {
        console.error("Erro ao inserir evento:", error);
        throw new Error(`Erro ao inserir evento: ${error.message}`);
      }

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
        tipo_evento: tiposEvento[0],
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

  return {
    formData,
    formLoading,
    universidadeLoading,
    tiposEventoDb,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  };
};
