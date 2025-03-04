
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moradia } from "@/types/moradia";
import { MoradiaForm } from "@/components/moradias/MoradiaForm";
import { MoradiasList } from "@/components/moradias/MoradiasList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Universidade {
  id: string;
  nome: string;
  sigla: string;
}

const Moradias = () => {
  const { user } = useAuth();
  const [moradias, setMoradias] = useState<Moradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [expandedMoradia, setExpandedMoradia] = useState<string | null>(null);
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [selectedUniversidade, setSelectedUniversidade] = useState<string>("");
  const [editingMoradia, setEditingMoradia] = useState<Moradia | null>(null);

  useEffect(() => {
    fetchMoradias();
    fetchUniversidades();
  }, []);

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
      toast({
        variant: "destructive",
        title: "Erro ao carregar universidades",
        description: error.message,
      });
    }
  };

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
      
      // Cast the status field to the correct type
      const typedData = data?.map(item => ({
        ...item,
        status: (item.status as "disponivel" | "alugado" | null) || "disponivel"
      }));
      
      setMoradias(typedData);
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

  const toggleMoradiaExpansion = (id: string) => {
    setExpandedMoradia(expandedMoradia === id ? null : id);
  };

  const handleEditMoradia = (moradia: Moradia) => {
    setEditingMoradia(moradia);
    setFormOpen(true);
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
        <MoradiaForm 
          user={user} 
          onMoradiaCreated={fetchMoradias} 
          open={formOpen} 
          setOpen={setFormOpen}
          editingMoradia={editingMoradia}
          onClearEdit={() => setEditingMoradia(null)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar moradias..."
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

      <MoradiasList
        moradias={moradias}
        loading={loading}
        searchTerm={searchTerm}
        universidadeFilter={selectedUniversidade === "all" ? "" : selectedUniversidade}
        expandedMoradia={expandedMoradia}
        toggleMoradiaExpansion={toggleMoradiaExpansion}
        onOpenForm={() => setFormOpen(true)}
        onEditMoradia={handleEditMoradia}
        onRefresh={fetchMoradias}
      />
    </div>
  );
};

export default Moradias;
