import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, ShoppingCart, Tag, Plus, Building, Info, Phone, Edit, Trash, Check, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Produto } from "@/types/moradia";

interface Universidade {
  id: string;
  nome: string;
  sigla: string;
}

const produtosDemo: Produto[] = [
  {
    id: "demo1",
    titulo: "Livro de Anatomia Humana - 8ª Edição",
    descricao: "Livro em excelente estado, com marcações mínimas a lápis. Ideal para estudantes de Medicina e áreas da saúde.",
    valor: 150,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade de São Paulo", sigla: "USP" },
    updated_at: new Date().toISOString()
  },
  {
    id: "demo2",
    titulo: "Calculadora Científica HP Prime",
    descricao: "Calculadora gráfica touchscreen, com menos de 1 ano de uso. Vem com capa protetora e cabo USB.",
    valor: 580,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade Estadual de Campinas", sigla: "UNICAMP" },
    updated_at: new Date().toISOString()
  },
  {
    id: "demo3",
    titulo: "Notebook Dell Inspiron 15",
    descricao: "Processador i5, 8GB RAM, SSD 256GB. Ideal para estudantes de engenharia. Apenas 1 ano de uso.",
    valor: 2200,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade Federal de Santa Catarina", sigla: "UFSC" },
    updated_at: new Date().toISOString()
  },
  {
    id: "demo4",
    titulo: "Kit de Desenho Arquitetônico Completo",
    descricao: "Kit com réguas, esquadros, compasso, lapiseiras e maletas. Usado por apenas um semestre.",
    valor: 200,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade de Brasília", sigla: "UnB" },
    updated_at: new Date().toISOString()
  },
  {
    id: "demo5",
    titulo: "Microscópio Binocular Profissional",
    descricao: "Aumento de até 1600x, com kit de lâminas e luz LED. Usado em bom estado.",
    valor: 850,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade Federal do Rio Grande do Sul", sigla: "UFRGS" },
    updated_at: new Date().toISOString()
  },
  {
    id: "demo6",
    titulo: "Código Civil Comentado - 2023",
    descricao: "Livro novo, ainda lacrado. Versão mais atualizada do Código Civil com jurisprudências.",
    valor: 120,
    imagens: null,
    usuario_id: "demo",
    universidade_id: "demo",
    universidade: { nome: "Universidade Federal do Rio de Janeiro", sigla: "UFRJ" },
    updated_at: new Date().toISOString()
  }
];

const Marketplace = () => {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valor: 0,
    whatsapp: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [usandoDadosDemo, setUsandoDadosDemo] = useState(false);
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [selectedUniversidade, setSelectedUniversidade] = useState<string>("");
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [currentProduto, setCurrentProduto] = useState<Produto | null>(null);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    fetchProdutos();
    fetchUniversidades();
  }, []);

  useEffect(() => {
    if (editingProduto) {
      setIsEditing(true);
      setFormData({
        titulo: editingProduto.titulo,
        descricao: editingProduto.descricao,
        valor: editingProduto.valor,
        whatsapp: editingProduto.whatsapp || "",
      });
    } else {
      setIsEditing(false);
      setFormData({
        titulo: "",
        descricao: "",
        valor: 0,
        whatsapp: "",
      });
    }
  }, [editingProduto]);

  const fetchUniversidades = async () => {
    try {
      const { data, error } = await supabase
        .from("universidades")
        .select("id, nome, sigla")
        .order("nome");

      if (error) throw error;
      setUniversidades(data);
    } catch (error: any) {
      console.error("Erro ao carregar universidades:", error);
    }
  };

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("compra_venda")
        .select(`
          *,
          universidade:universidades(nome, sigla)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setProdutos(produtosDemo);
        setUsandoDadosDemo(true);
      } else {
        const typedData = data.map(item => ({
          ...item,
          status: (item.status as "disponivel" | "vendido" | null) || "disponivel"
        }));
        
        setProdutos(typedData);
        setUsandoDadosDemo(false);
      }
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      setProdutos(produtosDemo);
      setUsandoDadosDemo(true);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: "Exibindo dados de demonstração.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para publicar produtos.",
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

      if (isEditing && editingProduto) {
        const { error } = await supabase
          .from("compra_venda")
          .update(formData)
          .eq("id", editingProduto.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "Seu produto foi atualizado com sucesso!",
        });
      } else {
        const novoProduto = {
          ...formData,
          usuario_id: user.id,
          universidade_id: uniData.id,
        };

        const { error } = await supabase
          .from("compra_venda")
          .insert(novoProduto);

        if (error) throw error;

        toast({
          title: "Produto publicado",
          description: "Seu produto foi publicado com sucesso!",
        });
      }
      
      setFormOpen(false);
      setEditingProduto(null);
      setFormData({
        titulo: "",
        descricao: "",
        valor: 0,
        whatsapp: "",
      });
      fetchProdutos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditing ? "Erro ao atualizar produto" : "Erro ao publicar produto",
        description: error.message,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProduto) return;

    try {
      const { error } = await supabase
        .from("compra_venda")
        .delete()
        .eq("id", currentProduto.id);
      
      if (error) throw error;
      
      toast({
        title: "Produto excluído",
        description: "Seu produto foi removido com sucesso.",
      });
      
      fetchProdutos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message,
      });
    }
    
    setDeleteDialogOpen(false);
    setCurrentProduto(null);
  };

  const handleMarkAsSold = async () => {
    if (!currentProduto) return;

    try {
      const { error } = await supabase
        .from("compra_venda")
        .update({ status: "vendido" })
        .eq("id", currentProduto.id);
      
      if (error) throw error;
      
      toast({
        title: "Produto atualizado",
        description: "Produto marcado como vendido.",
      });
      
      fetchProdutos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message,
      });
    }
    
    setSoldDialogOpen(false);
    setCurrentProduto(null);
  };

  const handleInteresse = (produto: Produto) => {
    if (usandoDadosDemo) {
      toast({
        title: "Modo de demonstração",
        description: "Esta é uma demonstração. Faça login para interagir com produtos reais.",
      });
      return;
    }
    
    if (!produto.whatsapp) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número de WhatsApp não disponível para este anúncio."
      });
      return;
    }
    
    const formattedNumber = produto.whatsapp.replace(/\D/g, "");
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=Olá! Vi seu anúncio de produto na plataforma e gostaria de mais informações sobre "${produto.titulo}".`;
    
    window.open(whatsappUrl, "_blank");
  };

  const getFilteredProdutos = () => {
    let filtered = produtos.filter(produto => {
      const matchesSearch = 
        produto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUniversidade = 
        !selectedUniversidade || produto.universidade_id === selectedUniversidade;
      
      return matchesSearch && matchesUniversidade;
    });

    if (activeTab === "meus" && user) {
      filtered = filtered.filter(produto => 
        produto.usuario_id === user.id && 
        produto.status !== "vendido"
      );
    } else if (activeTab === "vendidos" && user) {
      filtered = filtered.filter(produto => 
        produto.usuario_id === user.id && 
        produto.status === "vendido"
      );
    } else if (activeTab === "todos") {
      filtered = filtered.filter(produto => produto.status !== "vendido");
    }

    return filtered;
  };

  const filteredProdutos = getFilteredProdutos();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Compre e venda itens na comunidade acadêmica
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProduto(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Produto" : "Publicar Novo Produto"}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Atualize as informações do seu produto."
                    : "Compartilhe detalhes sobre o item que você deseja vender."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    placeholder="Nome do produto"
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
                    placeholder="Descreva o produto, estado de conservação, etc."
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    className="resize-none"
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                  />
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
                  setEditingProduto(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading 
                    ? (isEditing ? "Atualizando..." : "Publicando...") 
                    : (isEditing ? "Atualizar Produto" : "Publicar Produto")
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {usandoDadosDemo && (
        <Alert className="mb-4 border-amber-500 bg-amber-500/10">
          <Info className="h-4 w-4" />
          <AlertTitle>Modo de demonstração</AlertTitle>
          <AlertDescription>
            Você está visualizando dados de demonstração. Faça login para publicar e interagir com produtos reais.
          </AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="todos" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select 
              value={selectedUniversidade} 
              onValueChange={setSelectedUniversidade}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Universidade" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as universidades</SelectItem>
                {universidades.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.sigla} - {uni.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="todos">Anúncios</TabsTrigger>
          {user && (
            <>
              <TabsTrigger value="meus">Meus Anúncios</TabsTrigger>
              <TabsTrigger value="vendidos">Vendidos</TabsTrigger>
            </>
          )}
          {!user && (
            <>
              <TabsTrigger value="meus" disabled>Meus Anúncios</TabsTrigger>
              <TabsTrigger value="vendidos" disabled>Vendidos</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="todos" className="mt-0">
          {renderProductsList(filteredProdutos, false)}
        </TabsContent>

        {user && (
          <>
            <TabsContent value="meus" className="mt-0">
              {renderProductsList(filteredProdutos, true)}
            </TabsContent>
            
            <TabsContent value="vendidos" className="mt-0">
              {renderProductsList(filteredProdutos, true)}
            </TabsContent>
          </>
        )}
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu anúncio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentProduto(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como vendido?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto marcará seu produto como vendido. O anúncio ainda ficará visível, 
              mas indicado como indisponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentProduto(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsSold}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  function renderProductsList(products: Produto[], isOwnerList: boolean) {
    if (loading) {
      return (
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
      );
    }
    
    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {activeTab === "meus" ? (
              "Você ainda não publicou nenhum produto."
            ) : activeTab === "vendidos" ? (
              "Você ainda não vendeu nenhum produto."
            ) : searchTerm || selectedUniversidade ? (
              "Nenhum produto corresponde aos filtros aplicados. Tente outros termos ou filtros."
            ) : (
              "Seja o primeiro a publicar um produto ou ajuste sua busca."
            )}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((produto) => {
          const isOwner = user && user.id === produto.usuario_id && !usandoDadosDemo;
          const statusBadge = produto.status === "vendido" ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ml-1">
              Vendido
            </Badge>
          ) : null;
          
          return (
            <Card 
              key={produto.id} 
              className={`border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover:shadow-md transition-all ${usandoDadosDemo ? 'ring-1 ring-amber-500/30' : ''} ${produto.status === "vendido" ? "opacity-70" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{produto.titulo}</h3>
                  <div className="flex items-center">
                    {statusBadge}
                    <Badge variant="outline">{formatCurrency(produto.valor)}</Badge>
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Building className="mr-1 h-3 w-3" />
                  <span>{produto.universidade?.sigla || "UNIVERSIDADE"}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{produto.descricao}</p>
              </CardContent>
              <CardFooter className={isOwner ? "flex-col gap-2" : "pt-2"}>
                {isOwner ? (
                  <>
                    <div className="flex w-full gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setEditingProduto(produto);
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
                          setCurrentProduto(produto);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                    {produto.status !== "vendido" && (
                      <Button 
                        size="sm" 
                        variant="success" 
                        className="w-full"
                        onClick={() => {
                          setCurrentProduto(produto);
                          setSoldDialogOpen(true);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como vendido
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleInteresse(produto)}
                    disabled={produto.status === "vendido"}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Entrar em contato
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default Marketplace;
