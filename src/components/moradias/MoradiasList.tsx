
import React from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Moradia } from "@/types/moradia";
import { MoradiaCard } from "./MoradiaCard";

interface MoradiasListProps {
  moradias: Moradia[];
  loading: boolean;
  searchTerm: string;
  expandedMoradia: string | null;
  toggleMoradiaExpansion: (id: string) => void;
  onOpenForm: () => void;
}

export const MoradiasList: React.FC<MoradiasListProps> = ({
  moradias,
  loading,
  searchTerm,
  expandedMoradia,
  toggleMoradiaExpansion,
  onOpenForm,
}) => {
  const filteredMoradias = moradias.filter(moradia =>
    moradia.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moradia.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    moradia.universidade?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[280px] border border-border/40 backdrop-blur-sm bg-card/30" />
        ))}
      </div>
    );
  }
  
  if (filteredMoradias.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma moradia encontrada</h3>
        <p className="mt-2 text-muted-foreground">
          {searchTerm ? (
            "Nenhuma moradia corresponde aos termos de busca. Tente outros termos."
          ) : (
            <>
              Ainda não temos moradias cadastradas. Seja o primeiro a <Button variant="link" className="p-0 h-auto" onClick={onOpenForm}>publicar uma moradia</Button>.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredMoradias.map((moradia) => (
        <MoradiaCard
          key={moradia.id}
          moradia={moradia}
          expandedMoradia={expandedMoradia}
          toggleMoradiaExpansion={toggleMoradiaExpansion}
        />
      ))}
    </div>
  );
};
