
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, LogIn, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoradiaFormData } from "@/types/moradia";

interface MoradiaFormProps {
  user: any;
  onMoradiaCreated: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const initialFormData: MoradiaFormData = {
  descricao: "",
  valor_mensal: 0,
  qtd_moradores: 1,
  localizacao: "",
  servicos: "",
};

export const MoradiaForm: React.FC<MoradiaFormProps> = ({ 
  user, 
  onMoradiaCreated, 
  open, 
  setOpen 
}) => {
  const [formData, setFormData] = useState<MoradiaFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor_mensal' || name === 'qtd_moradores' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para publicar moradias.",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscando o ID da universidade do usuário
      const { data: uniData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", user.user_metadata.university)
        .single();

      if (uniError) throw uniError;

      const novaMoradia = {
        ...formData,
        usuario_id: user.id,
        universidade_id: uniData.id,
      };

      const { error } = await supabase
        .from("moradias")
        .insert(novaMoradia);

      if (error) throw error;

      toast({
        title: "Moradia publicada",
        description: "Sua moradia foi publicada com sucesso!",
      });
      
      setOpen(false);
      setFormData(initialFormData);
      onMoradiaCreated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao publicar moradia",
        description: error.message,
      });
      console.error("Erro ao publicar moradia:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Moradia
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <div className="text-center py-6 space-y-4">
            <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <DialogTitle>Faça login para continuar</DialogTitle>
            <DialogDescription className="px-8">
              Você precisa estar logado para publicar uma moradia. Crie uma conta ou faça login para continuar.
            </DialogDescription>
            <div className="flex justify-center pt-4">
              <Button asChild>
                <Link to="/auth" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" /> Entrar no sistema
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Moradia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Publicar Nova Moradia</DialogTitle>
            <DialogDescription>
              Compartilhe detalhes sobre a moradia que você deseja anunciar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva a moradia, tipo de imóvel, etc."
                value={formData.descricao}
                onChange={handleInputChange}
                required
                className="resize-none"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                <Input
                  id="valor_mensal"
                  name="valor_mensal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_mensal}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qtd_moradores">Quantidade de Moradores</Label>
                <Input
                  id="qtd_moradores"
                  name="qtd_moradores"
                  type="number"
                  min="1"
                  value={formData.qtd_moradores}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                name="localizacao"
                placeholder="Endereço ou bairro"
                value={formData.localizacao}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="servicos">Serviços Inclusos</Label>
              <Input
                id="servicos"
                name="servicos"
                placeholder="Internet, água, luz, faxina, etc."
                value={formData.servicos}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publicando..." : "Publicar Moradia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
