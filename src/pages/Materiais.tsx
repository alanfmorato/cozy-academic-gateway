import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, FileText, Folder, BookOpen, ExternalLink, Plus, Phone, Edit, Trash, Check, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Material } from "@/types/moradia";

interface Curso {
  id: string;
  nome: string;
}

interface Universidade {
  id: string;
  nome: string;
  sigla: string;
}

const Materiais = () => {
  const { user } = useAuth();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCurso, setFiltroCurso] = useState<string>("");
  const [filtroUniversidade, setFiltroUniversidade] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    curso_id: "",
    arquivo_url: "",
    whatsapp: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unavailableDialogOpen, setUnavailableDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editingMaterial) {
      setIsEditing(true);
      setFormData({
        titulo: editingMaterial.titulo,
        descricao: editingMaterial.descricao || "",
        curso_id: editingMaterial.curso_id || "",
        arquivo_url: editingMaterial.arquivo_url || "",
        whatsapp: editingMaterial.whatsapp || "",
      });
    } else {
      setIsEditing(false);
      setFormData({
        titulo: "",
        descricao: "",
        curso_id: "",
        arquivo_url: "",
        whatsapp: "",
      });
    }
  }, [editingMaterial]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cursosResponse, universidadesResponse, materiaisResponse] = await Promise.all([
        supabase.from("cursos").select("id, nome").order("nome"),
        supabase.from("universidades").select("id, nome, sigla").order("nome"),
        supabase.from("materiais").select(`
          *,
          curso:cursos(nome),
          universidade:universidades(nome, sigla)
        `).order("updated_at", { ascending: false })
      ]);

      if (cursosResponse.error) throw cursosResponse.error;
      if (universidadesResponse.error) throw universidadesResponse.error;
      if (materiaisResponse.error) throw materiaisResponse.error;

      setCursos(cursosResponse.data);
      setUniversidades(universidadesResponse.data);
      
      const typedData = materiaisResponse.data.map(item => ({
        ...item,
        status: (item.status as "disponivel" | "indisponivel" | null) || "disponivel"
      }));
      
      setMateriais(typedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para compartilhar materiais.",
      });
      return;
    }

    setFormLoading(true);
    try {
      const { data: uniData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", user.user_metadata.university)
        .single();

      if (uniError) throw uniError;

      if (isEditing && editingMaterial) {
        const { error } = await supabase
          .from("materiais")
          .update({
            ...formData,
            curso_id: formData.curso_id || null,
          })
          .eq("id", editingMaterial.id);

        if (error) throw error;

        toast({
          title: "Material atualizado",
          description: "Seu material foi atualizado com sucesso!",
        });
      } else {
        const novoMaterial = {
          ...formData,
          usuario_id: user.id,
          universidade_id: uniData.id,
          curso_id: formData.curso_id || null,
        };

        const { error } = await supabase
          .from("materiais")
          .insert(novoMaterial);

        if (error) throw error;

        toast({
          title: "Material compartilhado",
          description: "Seu material foi compartilhado com sucesso!",
        });
      }
      
      setFormOpen(false);
      setEditingMaterial(null);
      setFormData({
        titulo: "",
        descricao: "",
        curso_id: "",
        arquivo_url: "",
        whatsapp: "",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar material" : "Erro ao compartilhar material",
        description: error.message,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentMaterial) return;

    try {
      const { error } = await supabase
        .from("materiais")
        .delete()
        .eq("id", currentMaterial.id);
      
      if (error) throw error;
      
      toast({
        title: "Material excluído",
        description: "Seu material foi removido com sucesso.",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message,
      });
    }
    
    setDeleteDialogOpen(false);
    setCurrentMaterial(null);
  };

  const handleMarkAsUnavailable = async () => {
    if (!currentMaterial) return;

    try {
      const { error } = await supabase
        .from("materiais")
        .update({ status: "indisponivel" })
        .eq("id", currentMaterial.id);
      
      if (error) throw error;
      
      toast({
        title: "Material atualizado",
        description: "Material marcado como indisponível.",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message,
      });
    }
    
    setUnavailableDialogOpen(false);
    setCurrentMaterial(null);
  };

  const handleContact = (material: Material) => {
    if (!material.whatsapp) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número de WhatsApp não disponível para este material."
      });
      return;
    }
    
    const formattedNumber = material.whatsapp.replace(/\D/g, "");
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=Olá! Vi seu material compartilhado na plataforma e gostaria de mais informações sobre "${material.titulo}".`;
    
    window.open(whatsappUrl, "_blank");
  };

  const filteredMateriais = materiais.filter(material => {
    const matchesTermo = 
      material.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.descricao && material.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
      material.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.curso?.nome && material.curso.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCurso = !filtroCurso || material.curso_id === filtroCurso;
    
    const matchesUniversidade = !filtroUniversidade || material.universidade_id === filtroUniversidade;
    
    return matchesTermo && matchesCurso && matchesUniversidade;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Materiais Acadêmicos</h1>
          <p className="text-muted-foreground">
            Acesse e compartilhe materiais de estudo
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMaterial(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Material" : "Compartilhar Material"}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Atualize as informações do seu material."
                    : "Compartilhe materiais de estudo com outros estudantes."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    placeholder="Título do material"
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
                    placeholder="Descreva o material, disciplina, etc."
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curso_id">Curso</Label>
                  <select
                    id="curso_id"
                    name="curso_id"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.curso_id}
                    onChange={handleInputChange}
                  >
                    <option value="all">Selecione um curso...</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>{curso.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arquivo_url">Link do Material</Label>
                  <Input
                    id="arquivo_url"
                    name="arquivo_url"
                    placeholder="URL do material (Google Drive, OneDrive, etc.)"
                    value={formData.arquivo_url}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole um link de compartilhamento para o seu material.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp para contato</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    placeholder="Ex: +5511999999999"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Inclua o código do país (Ex: +55 para Brasil)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setFormOpen(false);
                  setEditingMaterial(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading 
                    ? (isEditing ? "Atualizando..." : "Compartilhando...") 
                    : (isEditing ? "Atualizar Material" : "Compartilhar Material")
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiais..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select 
            value={filtroCurso} 
            onValueChange={setFiltroCurso}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Curso" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {cursos.map(curso => (
                <SelectItem key={curso.id} value={curso.id}>{curso.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-64">
          <Select 
            value={filtroUniversidade} 
            onValueChange={setFiltroUniversidade}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Universidade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as universidades</SelectItem>
              {universidades.map((uni) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.sigla} - {uni.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
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
      ) : filteredMateriais.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum material encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || filtroCurso || filtroUniversidade ? (
              "Nenhum material corresponde aos filtros aplicados. Tente outros termos ou filtros."
            ) : (
              "Seja o primeiro a compartilhar um material ou ajuste sua busca."
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMateriais.map((material) => {
            const isOwner = user && user.id === material.usuario_id;
            const statusBadge = material.status === "indisponivel" ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 ml-1">
                Indisponível
              </Badge>
            ) : null;
            
            return (
              <Card 
                key={material.id} 
                className={`border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover-scale ${material.status === "indisponivel" ? "opacity-70" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 mt-1 flex-shrink-0" />
                    <div>
                      <div className="flex items-center">
                        <CardTitle className="text-lg">{material.titulo}</CardTitle>
                        {statusBadge}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {material.curso && (
                          <Badge variant="outline">{material.curso.nome}</Badge>
                        )}
                        {material.universidade && (
                          <Badge variant="secondary">{material.universidade.sigla}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {material.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {material.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>Material acadêmico</span>
                  </div>
                </CardContent>
                <CardFooter className={isOwner ? "flex-col gap-2" : "flex gap-2"}>
                  {isOwner ? (
                    <>
                      <div className="flex w-full gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setEditingMaterial(material);
                            setFormOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => {
                            setCurrentMaterial(material);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                      {material.status !== "indisponivel" && (
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            setCurrentMaterial(material);
                            setUnavailableDialogOpen(true);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Marcar como indisponível
                        </Button>
                      )}
                      {material.arquivo_url && (
                        <a 
                          href={material.arquivo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button size="sm" className="w-full" variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Acessar Material
                          </Button>
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {material.arquivo_url ? (
                        <a 
                          href={material.arquivo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full" variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Acessar Material
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" className="flex-1" variant="outline" disabled>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Sem arquivo disponível
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleContact(material)}
                        disabled={material.status === "indisponivel"}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Contato
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentMaterial(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unavailableDialogOpen} onOpenChange={setUnavailableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como indisponível?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto marcará seu material como indisponível. O anúncio ainda ficará visível, 
              mas indicado como indisponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentMaterial(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsUnavailable}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Materiais;
