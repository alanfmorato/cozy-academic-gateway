import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Home, MapPin, Users, Wifi, Plus, Info, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

interface Moradia {
  id: string;
  descricao: string;
  valor_mensal: number;
  qtd_moradores: number | null;
  localizacao: string | null;
  servicos: string | null;
  imagens: string[] | null;
  usuario_id: string;
  universidade_id: string;
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
}

const Moradias = () => {
  const { user } = useAuth();
  const [moradias, setMoradias] = useState<Moradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    valor_mensal: 0,
    qtd_moradores: 1,
    localizacao: "",
    servicos: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [expandedMoradia, setExpandedMoradia] = useState<string | null>(null);

  useEffect(() => {
    fetchMoradias();
  }, []);

  const fetchMoradias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("moradias")
        .select(`
          *,
          universidade:universidades(nome, sigla)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setMoradias(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar moradias",
        description: error.message,
      });
      console.error("Erro ao carregar moradias:", error);
    } finally {
      setLoading(false);
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

    setFormLoading(true);
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
      
      setFormOpen(false);
      setFormData({
        descricao: "",
        valor_mensal: 0,
        qtd_moradores: 1,
        localizacao: "",
        servicos: "",
      });
      fetchMoradias();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao publicar moradia",
        description: error.message,
      });
      console.error("Erro ao publicar moradia:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleMoradiaExpansion = (id: string) => {
    setExpandedMoradia(expandedMoradia === id ? null : id);
  };

  const filteredMoradias = moradias.filter(moradia =>
    moradia.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moradia.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moradia.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Moradias</h1>
          <p className="text-muted-foreground">
            Encontre ou anuncie moradias próximas à sua universidade
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Moradia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            {!user ? (
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
            ) : (
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
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Publicando..." : "Publicar Moradia"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar moradias..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
      ) : filteredMoradias.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma moradia encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? (
              "Nenhuma moradia corresponde aos termos de busca. Tente outros termos."
            ) : (
              <>
                Ainda não temos moradias cadastradas. Seja o primeiro a <Button variant="link" className="p-0 h-auto" onClick={() => setFormOpen(true)}>publicar uma moradia</Button>.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMoradias.map((moradia) => (
            <Card 
              key={moradia.id} 
              className="border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline">
                    {formatCurrency(moradia.valor_mensal)}/mês
                  </Badge>
                  <Badge variant="secondary">
                    {moradia.universidade?.sigla || "UNIVERSIDADE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  {moradia.descricao.length > 100 && expandedMoradia !== moradia.id ? (
                    <>
                      <p className="text-sm">{moradia.descricao.substring(0, 100)}...</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-xs"
                        onClick={() => toggleMoradiaExpansion(moradia.id)}
                      >
                        Ler mais
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm">
                      {moradia.descricao}
                      {moradia.descricao.length > 100 && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-xs ml-1"
                          onClick={() => toggleMoradiaExpansion(moradia.id)}
                        >
                          Ler menos
                        </Button>
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {moradia.localizacao && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{moradia.localizacao}</span>
                    </div>
                  )}
                  {moradia.qtd_moradores && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{moradia.qtd_moradores} {moradia.qtd_moradores === 1 ? "morador" : "moradores"}</span>
                    </div>
                  )}
                </div>

                {moradia.servicos && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Wifi className="h-3 w-3" />
                    <span>Inclui: {moradia.servicos}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">
                  <Info className="mr-2 h-4 w-4" />
                  Entrar em contato
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Moradias;
