
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [universidadeLoading, setUniversidadeLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica e cria a universidade se necessário quando o componente for montado e o usuário estiver logado
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

    // Verificar se o usuário tem uma universidade associada
    if (!user.user_metadata.university || user.user_metadata.university === "explorando") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar associado a uma universidade para publicar moradias.",
      });
      return;
    }

    // Verificar e criar a universidade se necessário antes de publicar a moradia
    await verificaECriaUniversidade(user.user_metadata.university);

    setLoading(true);
    try {
      // Buscando o ID da universidade do usuário
      const { data: uniData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", user.user_metadata.university)
        .maybeSingle();

      if (uniError) {
        console.error("Erro ao buscar universidade:", uniError);
        throw uniError;
      }

      if (!uniData) {
        throw new Error(`Universidade não encontrada com a sigla: ${user.user_metadata.university}`);
      }

      const novaMoradia = {
        ...formData,
        usuario_id: user.id,
        universidade_id: uniData.id,
      };

      console.log("Tentando inserir moradia:", novaMoradia);

      const { error } = await supabase
        .from("moradias")
        .insert(novaMoradia);

      if (error) {
        console.error("Erro detalhado ao publicar moradia:", error);
        throw error;
      }

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

  const handleLoginRedirect = () => {
    setOpen(false);
    navigate("/auth");
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
              <Button onClick={handleLoginRedirect} className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" /> Entrar no sistema
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
            <Button type="submit" disabled={loading || universidadeLoading}>
              {loading ? "Publicando..." : "Publicar Moradia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
