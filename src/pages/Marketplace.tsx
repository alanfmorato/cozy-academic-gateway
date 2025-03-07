
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Produto } from '@/types/moradia';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Marketplace = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversidade, setSelectedUniversidade] = useState<string>("all");
  const [universidades, setUniversidades] = useState<{id: string, nome: string}[]>([]);
  const [activeTab, setActiveTab] = useState("todos");
  const { user } = useAuth();

  useEffect(() => {
    fetchProdutos();
    fetchUniversidades();
  }, []);

  const fetchProdutos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*, universidade:universidades(nome, sigla)');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: error.message,
      });
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversidades = async () => {
    try {
      const { data, error } = await supabase
        .from('universidades')
        .select('id, nome');

      if (error) throw error;
      setUniversidades(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar universidades:', error);
    }
  };

  const getFilteredProdutos = () => {
    let filtered = produtos.filter(produto => {
      const matchesSearch = 
        produto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (produto.descricao && produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (produto.universidade?.nome && produto.universidade.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesUniversidade = 
        !selectedUniversidade || selectedUniversidade === "all" || produto.universidade_id === selectedUniversidade;
      
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUniversidadeChange = (value: string) => {
    setSelectedUniversidade(value);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search">Buscar produto</Label>
          <Input
            id="search"
            placeholder="Buscar por título, descrição ou universidade..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="w-full md:w-64">
          <Label htmlFor="universidade">Filtrar por universidade</Label>
          <Select value={selectedUniversidade} onValueChange={handleUniversidadeChange}>
            <SelectTrigger id="universidade">
              <SelectValue placeholder="Todas universidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas universidades</SelectItem>
              {universidades.map(uni => (
                <SelectItem key={uni.id} value={uni.id}>{uni.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {user && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="todos">Todos os produtos</TabsTrigger>
            <TabsTrigger value="meus">Meus produtos</TabsTrigger>
            <TabsTrigger value="vendidos">Produtos vendidos</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Carregando produtos...</p>
        ) : getFilteredProdutos().length > 0 ? (
          getFilteredProdutos().map(produto => (
            <Card key={produto.id} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{produto.titulo}</h3>
                <p className="text-gray-500 text-sm">
                  {produto.universidade?.nome || "Universidade não especificada"}
                </p>
                <p className="my-2">{produto.descricao}</p>
                <p className="font-bold text-lg">R$ {produto.valor.toFixed(2)}</p>
                {produto.whatsapp && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => window.open(`https://wa.me/${produto.whatsapp}`, '_blank')}
                  >
                    Contatar vendedor
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
