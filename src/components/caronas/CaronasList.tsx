
import React from "react";
import { Carona } from "@/types/carona";
import { CaronaCard } from "./CaronaCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CaronasListProps {
  caronas: Carona[];
  loading: boolean;
  searchTerm: string;
  filteredLocal: string;
  expandedCarona: string | null;
  toggleCaronaExpansion: (id: string) => void;
  onOpenForm: () => void;
  onEditCarona: (carona: Carona) => void;
  onDeleteCarona: (caronaId: string) => void;
  onRefresh: () => void;
}

export const CaronasList: React.FC<CaronasListProps> = ({
  caronas,
  loading,
  searchTerm,
  filteredLocal,
  expandedCarona,
  toggleCaronaExpansion,
  onOpenForm,
  onEditCarona,
  onDeleteCarona,
  onRefresh,
}) => {
  // Filter caronas based on search term and local filter
  const filteredCaronas = caronas.filter((carona) => {
    const matchesSearch =
      searchTerm === "" ||
      carona.local_saida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carona.local_chegada.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocal =
      filteredLocal === "" ||
      carona.local_saida.toLowerCase().includes(filteredLocal.toLowerCase()) ||
      carona.local_chegada.toLowerCase().includes(filteredLocal.toLowerCase());

    return matchesSearch && matchesLocal;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredCaronas.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhuma carona encontrada</AlertTitle>
          <AlertDescription>
            Não existem caronas disponíveis com os filtros selecionados.
            {searchTerm || filteredLocal ? (
              " Tente mudar seus filtros de busca."
            ) : (
              " Seja o primeiro a oferecer uma carona!"
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={onOpenForm} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Oferecer uma carona
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCaronas.map((carona) => (
        <CaronaCard
          key={carona.id}
          carona={carona}
          expanded={expandedCarona === carona.id}
          toggleExpansion={() => toggleCaronaExpansion(carona.id)}
          onEdit={onEditCarona}
          onDelete={onDeleteCarona}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};
