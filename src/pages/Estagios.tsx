
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Briefcase, Building, DollarSign, ListChecks, Plus, LogIn, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";

interface Estagio {
  id: string;
  empresa: string;
  descricao: string;
  remuneracao: number | null;
  requisitos: string | null;
  universidade_id: string;
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
}

const Estagios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estagios, setEstagios] = useState<Estagio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    empresa: "",
    descricao: "",
    remuneracao: "",
    requisitos: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    fetchEstagios();
  }, []);

  const fetchEstagios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("estagios")
        .select(`
          *,
          universidade:universidades(nome, sigla)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setEstagios(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar estágios:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar estágios",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setNeedsLogin(true);
      return;
    }

    setFormLoading(true);
    try {
      // Verificando se o usuário tem uma universidade associada
      if (!user.user_metadata.university || user.user_metadata.university === "explorando") {
        throw new Error("Você precisa estar associado a uma universidade para publicar estágios.");
      }

      // Buscando o ID da universidade do usuário
      const { data: uniData, error: uniError } = await supabase
        .from("universidades")
        .select("id")
        .eq("sigla", user.user_metadata.university)
        .single();

      if (uniError) {
        if (uniError.code === 'PGRST116') {
          throw new Error(`Universidade '${user.user_metadata.university}' não encontrada. Por favor, contate o administrador.`);
        }
        throw uniError;
      }

      const novoEstagio = {
        empresa: formData.empresa,
        descricao: formData.descricao,
        remuneracao: formData.remuneracao ? parseFloat(formData.remuneracao) : null,
        requisitos: formData.requisitos || null,
        universidade_id: uniData.id,
      };

      const { error } = await supabase
        .from("estagios")
        .insert(novoEstagio);

      if (error) {
        console.error("Erro detalhado ao publicar estágio:", error);
        throw error;
      }

      toast({
        title: "Estágio publicado",
        description: "A vaga de estágio foi publicada com sucesso!",
      });
      
      setFormOpen(false);
      setFormData({
        empresa: "",
        descricao: "",
        remuneracao: "",
        requisitos: "",
      });
      fetchEstagios();
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao publicar estágio",
        description: error.message,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleNewStageClick = () => {
    if (!user) {
      setNeedsLogin(true);
    } else {
      setFormOpen(true);
    }
  }

  const filteredEstagios = estagios.filter(estagio =>
    estagio.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estagio.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estagio.requisitos && estagio.requisitos.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (estagio.universidade?.nome && estagio.universidade.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) return "Não informado";
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleLoginRedirect = () => {
    setNeedsLogin(false);
    navigate("/auth");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Estágios</h1>
          <p className="text-muted-foreground">
            Encontre oportunidades de estágio e monitoria
          </p>
        </div>
        <Dialog open={needsLogin} onOpenChange={setNeedsLogin}>
          <DialogTrigger asChild>
            <Button onClick={handleNewStageClick}>
              <Plus className="mr-2 h-4 w-4" /> Nova Vaga
            </Button>
          </DialogTrigger>
          {needsLogin && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Autenticação necessária</DialogTitle>
                <DialogDescription>
                  Você precisa estar logado para publicar uma vaga de estágio.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <Button onClick={handleLoginRedirect} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Fazer login
                </Button>
              </div>
            </DialogContent>
          )}
          {user && formOpen && (
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Publicar Vaga de Estágio</DialogTitle>
                  <DialogDescription>
                    Compartilhe detalhes sobre a vaga de estágio disponível.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      name="empresa"
                      placeholder="Nome da empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      placeholder="Descreva a vaga, responsabilidades, carga horária, etc."
                      value={formData.descricao}
                      onChange={handleInputChange}
                      required
                      className="resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="remuneracao">Remuneração (R$)</Label>
                    <Input
                      id="remuneracao"
                      name="remuneracao"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Valor da bolsa (opcional)"
                      value={formData.remuneracao}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="requisitos">Requisitos</Label>
                    <Textarea
                      id="requisitos"
                      name="requisitos"
                      placeholder="Requisitos para a vaga (opcional)"
                      value={formData.requisitos}
                      onChange={handleInputChange}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Publicando..." : "Publicar Vaga"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          )}
        </Dialog>
      </div>

      {!user && (
        <Alert variant="default" className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Autenticação necessária</AlertTitle>
          <AlertDescription>
            Para publicar vagas de estágio, você precisa <Link to="/auth" className="font-medium underline">fazer login</Link> no sistema.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar estágios..."
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
      ) : filteredEstagios.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma vaga encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            {user ? (
              <Button variant="link" className="p-0 h-auto" onClick={() => setFormOpen(true)}>
                Seja o primeiro a publicar uma vaga
              </Button>
            ) : (
              <>
                <Link to="/auth" className="font-medium text-primary hover:underline">
                  Faça login
                </Link> para publicar uma vaga ou ajuste sua busca.
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEstagios.map((estagio) => (
            <Card 
              key={estagio.id} 
              className="border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover-scale"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{estagio.empresa}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3" />
                      {estagio.universidade?.sigla || "UNIVERSIDADE"}
                    </CardDescription>
                  </div>
                  {estagio.remuneracao !== null && (
                    <Badge variant="outline">
                      {formatCurrency(estagio.remuneracao)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {estagio.descricao}
                </p>
                
                {estagio.requisitos && (
                  <div className="flex items-start gap-1 text-xs text-muted-foreground">
                    <ListChecks className="h-3 w-3 mt-0.5" />
                    <span className="line-clamp-2">Requisitos: {estagio.requisitos}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button size="sm" className="w-full">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Candidatar-se
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Estagios;
