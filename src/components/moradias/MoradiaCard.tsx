
import React from "react";
import { MapPin, Users, Wifi, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Moradia } from "@/types/moradia";

interface MoradiaCardProps {
  moradia: Moradia;
  expandedMoradia: string | null;
  toggleMoradiaExpansion: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const MoradiaCard: React.FC<MoradiaCardProps> = ({
  moradia,
  expandedMoradia,
  toggleMoradiaExpansion,
}) => {
  return (
    <Card className="border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover:shadow-md transition-all duration-200">
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
  );
};
