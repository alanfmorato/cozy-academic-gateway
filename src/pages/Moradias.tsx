
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moradia } from "@/types/moradia";
import { MoradiaForm } from "@/components/moradias/MoradiaForm";
import { MoradiasList } from "@/components/moradias/MoradiasList";

const Moradias = () => {
  const { user } = useAuth();
  const [moradias, setMoradias] = useState<Moradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
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

  const toggleMoradiaExpansion = (id: string) => {
    setExpandedMoradia(expandedMoradia === id ? null : id);
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
        />
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

      <MoradiasList
        moradias={moradias}
        loading={loading}
        searchTerm={searchTerm}
        expandedMoradia={expandedMoradia}
        toggleMoradiaExpansion={toggleMoradiaExpansion}
        onOpenForm={() => setFormOpen(true)}
      />
    </div>
  );
};

export default Moradias;
