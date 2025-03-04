
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Search, GraduationCap, Building, MapPin, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Universidade {
  id: string;
  nome: string;
  sigla: string;
  cidade: string;
  estado: string;
  descricao: string | null;
  custo_vida: number | null;
  recursos_campus: string | null;
}

interface Curso {
  id: string;
  nome: string;
  descricao: string | null;
  nota_corte_sisu: number | null;
  universidade_id: string;
  universidade?: Universidade;
}

const Cursos = () => {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [universidades, setUniversidades] = useState<Universidade[]>([]);
  const [uniSelecionada, setUniSelecionada] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversidades = async () => {
      try {
        const { data, error } = await supabase
          .from("universidades")
          .select("*")
          .order("nome");

        if (error) throw error;
        setUniversidades(data);

        // Se o usuário tiver uma universidade definida, seleciona ela por padrão
        if (user?.user_metadata?.university) {
          const userUni = data.find(uni => uni.sigla.toLowerCase() === user.user_metadata.university.toLowerCase());
          if (userUni) {
            setUniSelecionada(userUni.id);
          }
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar universidades",
          description: error.message,
        });
      }
    };

    fetchUniversidades();
  }, [user]);

  useEffect(() => {
    const fetchCursos = async () => {
      setLoading(true);
      try {
        let query = supabase.from("cursos").select(`
          *,
          universidade:universidades(*)
        `);

        if (uniSelecionada) {
          query = query.eq("universidade_id", uniSelecionada);
        }

        const { data, error } = await query.order("nome");

        if (error) throw error;
        setCursos(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar cursos",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [uniSelecionada]);

  const filteredCursos = cursos.filter(curso =>
    curso.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCursoExpansion = (id: string) => {
    if (expandedCurso === id) {
      setExpandedCurso(null);
    } else {
      setExpandedCurso(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
        <p className="text-muted-foreground">
          Explore cursos disponíveis nas universidades federais brasileiras
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            value={uniSelecionada}
            onChange={(e) => setUniSelecionada(e.target.value)}
          >
            <option value="">Todas as universidades</option>
            {universidades.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.sigla} - {uni.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border/40 backdrop-blur-sm bg-card/30">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCursos.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">Nenhum curso encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            Tente ajustar sua busca ou selecionar outra universidade.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCursos.map((curso) => (
            <Card 
              key={curso.id} 
              className="border border-border/40 backdrop-blur-sm bg-card/30 transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{curso.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building className="h-4 w-4" />
                      {curso.universidade?.sigla} - {curso.universidade?.nome}
                    </CardDescription>
                  </div>
                  {curso.nota_corte_sisu && (
                    <Badge variant="outline" className="text-xs">
                      Nota SISU: {curso.nota_corte_sisu.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {expandedCurso === curso.id ? (
                  <div className="space-y-4 animate-fade-in">
                    {curso.descricao && (
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                          <Info className="h-4 w-4" /> Sobre o curso
                        </h4>
                        <p className="text-sm text-muted-foreground">{curso.descricao}</p>
                      </div>
                    )}
                    
                    {curso.universidade && (
                      <>
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <MapPin className="h-4 w-4" /> Localização
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {curso.universidade.cidade}, {curso.universidade.estado}
                          </p>
                        </div>
                        
                        {curso.universidade.custo_vida && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Custo de vida estimado</h4>
                            <p className="text-sm text-muted-foreground">
                              R$ {curso.universidade.custo_vida.toFixed(2)} mensais
                            </p>
                          </div>
                        )}
                        
                        {curso.universidade.recursos_campus && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Recursos do campus</h4>
                            <p className="text-sm text-muted-foreground">
                              {curso.universidade.recursos_campus}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {curso.descricao || "Sem descrição disponível para este curso."}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleCursoExpansion(curso.id)}
                  className="ml-auto"
                >
                  {expandedCurso === curso.id ? "Ver menos" : "Ver mais"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cursos;
