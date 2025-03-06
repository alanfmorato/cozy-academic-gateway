
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Carona, CaronaFormData } from "@/types/carona";
import InputWithIcon from "@/components/forms/common/InputWithIcon";

interface CaronaFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCaronaCreated: () => void;
  editingCarona: Carona | null;
  onClearEdit: () => void;
}

export const CaronaForm: React.FC<CaronaFormProps> = ({
  open,
  setOpen,
  onCaronaCreated,
  editingCarona,
  onClearEdit,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CaronaFormData>({
    local_saida: "",
    local_chegada: "",
    horario_saida: "",
    valor_vaga: 0,
    qtd_vagas: 1,
    forma_pagamento: "pix",
    observacoes: "",
  });

  useEffect(() => {
    if (editingCarona) {
      const { 
        local_saida, 
        local_chegada, 
        horario_saida, 
        valor_vaga, 
        qtd_vagas, 
        forma_pagamento, 
        observacoes 
      } = editingCarona;

      setFormData({
        local_saida,
        local_chegada,
        // Format the date to local datetime-local input format
        horario_saida: new Date(horario_saida).toISOString().slice(0, 16),
        valor_vaga,
        qtd_vagas,
        forma_pagamento,
        observacoes: observacoes || "",
      });
    }
  }, [editingCarona]);

  const resetForm = () => {
    setFormData({
      local_saida: "",
      local_chegada: "",
      horario_saida: "",
      valor_vaga: 0,
      qtd_vagas: 1,
      forma_pagamento: "pix",
      observacoes: "",
    });
    onClearEdit();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Você precisa estar logado para oferecer uma carona",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert form data to proper types
      const caronaData = {
        ...formData,
        valor_vaga: Number(formData.valor_vaga),
        qtd_vagas: Number(formData.qtd_vagas),
        usuario_id: user.id,
      };

      let result;

      if (editingCarona) {
        // Update existing carona
        result = await supabase
          .from("caronas")
          .update(caronaData)
          .eq("id", editingCarona.id);
      } else {
        // Insert new carona
        result = await supabase.from("caronas").insert(caronaData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: editingCarona
          ? "Carona atualizada com sucesso!"
          : "Carona cadastrada com sucesso!",
      });

      handleClose();
      onCaronaCreated();
    } catch (error: any) {
      console.error("Erro ao cadastrar carona:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar carona",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Oferecer carona
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingCarona ? "Editar carona" : "Oferecer uma carona"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da carona que você quer oferecer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="local_saida">Local de saída *</Label>
            <Input
              id="local_saida"
              name="local_saida"
              value={formData.local_saida}
              onChange={handleChange}
              placeholder="Ex: Portaria Principal USP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local_chegada">Local de chegada *</Label>
            <Input
              id="local_chegada"
              name="local_chegada"
              value={formData.local_chegada}
              onChange={handleChange}
              placeholder="Ex: Terminal Rodoviário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario_saida">Horário de saída *</Label>
            <Input
              id="horario_saida"
              name="horario_saida"
              type="datetime-local"
              value={formData.horario_saida}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_vaga">Valor por vaga (R$) *</Label>
              <Input
                id="valor_vaga"
                name="valor_vaga"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_vaga}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qtd_vagas">Quantidade de vagas *</Label>
              <Input
                id="qtd_vagas"
                name="qtd_vagas"
                type="number"
                min="1"
                max="10"
                value={formData.qtd_vagas}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de pagamento *</Label>
            <Select
              value={formData.forma_pagamento}
              onValueChange={(value) =>
                handleSelectChange("forma_pagamento", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Ex: Ponto de encontro, regras do carro, se aceita animais, espaço para mala..."
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : editingCarona
                ? "Atualizar Carona"
                : "Oferecer Carona"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
