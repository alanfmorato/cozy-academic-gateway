
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, LogIn, Plus, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Moradia, MoradiaFormData } from "@/types/moradia";

interface MoradiaFormProps {
  user: any;
  onMoradiaCreated: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  editingMoradia?: Moradia | null;
  onClearEdit?: () => void;
}

const initialFormData: MoradiaFormData = {
  descricao: "",
  valor_mensal: 0,
  qtd_moradores: 1,
  localizacao: "",
  servicos: "",
  whatsapp: "",
};

export const MoradiaForm: React.FC<MoradiaFormProps> = ({ 
  user, 
  onMoradiaCreated, 
  open, 
  setOpen,
  editingMoradia = null,
  onClearEdit
}) => {
  const [formData, setFormData] = useState<MoradiaFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [universidadeLoading, setUniversidadeLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_metadata.university && user.user_metadata.university !== "explorando") {
      verificaECriaUniversidade(user.user_metadata.university);
    }
  }, [user]);

  // Efeito para carregar dados quando estiver editando
  useEffect(() => {
    if (editingMoradia) {
      setIsEditing(true);
      setFormData({
        descricao: editingMoradia.descricao,
        valor_mensal: editingMoradia.valor_mensal,
        qtd_moradores: editingMoradia.qtd_moradores || 1,
        localizacao: editingMoradia.localizacao || "",
        servicos: editingMoradia.servicos || "",
        whatsapp: editingMoradia.whatsapp || "",
      });
      
      if (editingMoradia.imagens && editingMoradia.imagens.length > 0) {
        setImageUrls(editingMoradia.imagens);
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [editingMoradia]);

  // Reset do formulário quando o dialog é fechado
  useEffect(() => {
    if (!open && onClearEdit) {
      onClearEdit();
    }
  }, [open]);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedImages(null);
    setImageUrls([]);
  };

  const verificaECriaUniversidade = async (sigla: string) => {
    if (universidadeLoading) return;
    
    setUniversidadeLoading(true);
    try {
      const { data: existingUni, error: checkError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", sigla)
        .maybeSingle();

      if (checkError) {
        console.error("Erro ao verificar universidade:", checkError);
        return;
      }

      if (!existingUni) {
        console.log(`Universidade com sigla ${sigla} não encontrada. Criando uma nova.`);
        
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImages(e.target.files);
      
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImageUrls(urls);
    }
  };

  const uploadImages = async () => {
    if (!selectedImages || selectedImages.length === 0) return [];
    
    setUploadingImages(true);
    try {
      const uploadedUrls = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `moradias/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        
        const { data } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(data.publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      setUploadingImages(false);
    }
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

    if (!user.user_metadata.university || user.user_metadata.university === "explorando") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar associado a uma universidade para publicar moradias.",
      });
      return;
    }

    await verificaECriaUniversidade(user.user_metadata.university);

    setLoading(true);
    try {
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

      // Upload de novas imagens apenas se o usuário selecionar novas
      let updatedImageUrls = imageUrls;
      if (selectedImages && selectedImages.length > 0) {
        const uploadedImageUrls = await uploadImages();
        if (isEditing && editingMoradia?.imagens) {
          // Se estiver editando, mantém as imagens existentes e adiciona as novas
          updatedImageUrls = [...uploadedImageUrls];
        } else {
          updatedImageUrls = uploadedImageUrls;
        }
      }

      if (isEditing && editingMoradia) {
        // Atualizando moradia existente
        const { error } = await supabase
          .from("moradias")
          .update({
            ...formData,
            imagens: updatedImageUrls.length > 0 ? updatedImageUrls : null
          })
          .eq("id", editingMoradia.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Moradia atualizada",
          description: "Sua moradia foi atualizada com sucesso!",
        });
      } else {
        // Criando nova moradia
        const novaMoradia = {
          ...formData,
          usuario_id: user.id,
          universidade_id: uniData.id,
          imagens: updatedImageUrls.length > 0 ? updatedImageUrls : null
        };

        const { error } = await supabase
          .from("moradias")
          .insert(novaMoradia);

        if (error) {
          throw error;
        }

        toast({
          title: "Moradia publicada",
          description: "Sua moradia foi publicada com sucesso!",
        });
      }
      
      setOpen(false);
      resetForm();
      if (onClearEdit) onClearEdit();
      onMoradiaCreated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar moradia" : "Erro ao publicar moradia",
        description: error.message,
      });
      console.error(isEditing ? "Erro ao atualizar moradia:" : "Erro ao publicar moradia:", error);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Moradia" : "Publicar Nova Moradia"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Atualize as informações da sua moradia."
                : "Compartilhe detalhes sobre a moradia que você deseja anunciar."
              }
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
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp para Contato</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="Ex: +5511999999999"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imagens">
                {isEditing && imageUrls.length > 0 
                  ? "Substituir imagens" 
                  : "Imagens"
                }
              </Label>
              <div className="border border-input rounded-md p-2">
                <Input
                  id="imagens"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="imagens" className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isEditing && imageUrls.length > 0 
                      ? "Clique para substituir imagens" 
                      : "Clique para selecionar imagens"
                    }
                  </span>
                </label>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false);
              if (onClearEdit) onClearEdit();
            }}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || universidadeLoading || uploadingImages}
            >
              {loading || uploadingImages 
                ? (isEditing ? "Atualizando..." : "Publicando...") 
                : (isEditing ? "Atualizar Moradia" : "Publicar Moradia")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
