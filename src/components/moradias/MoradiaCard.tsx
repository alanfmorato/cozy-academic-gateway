
import React from "react";
import { MapPin, Users, Wifi, Phone, Edit, Trash, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Moradia } from "@/types/moradia";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoradiaCardProps {
  moradia: Moradia;
  expandedMoradia: string | null;
  toggleMoradiaExpansion: (id: string) => void;
  onEdit?: (moradia: Moradia) => void;
  onRefresh?: () => void;
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
  onEdit,
  onRefresh
}) => {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [soldDialogOpen, setSoldDialogOpen] = React.useState(false);
  const isOwner = user && user.id === moradia.usuario_id;

  const handleContactClick = () => {
    if (!moradia.whatsapp) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número de WhatsApp não disponível para este anúncio."
      });
      return;
    }

    // Format the WhatsApp number (remove non-numeric characters)
    const formattedNumber = moradia.whatsapp.replace(/\D/g, "");
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=Olá! Vi seu anúncio de moradia na plataforma e gostaria de mais informações.`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("moradias")
        .delete()
        .eq("id", moradia.id);
      
      if (error) throw error;
      
      toast({
        title: "Anúncio excluído",
        description: "Seu anúncio foi removido com sucesso."
      });
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message
      });
    }
    
    setDeleteDialogOpen(false);
  };

  const handleMarkAsRented = async () => {
    try {
      const { error } = await supabase
        .from("moradias")
        .update({ status: "alugado" })
        .eq("id", moradia.id);
      
      if (error) throw error;
      
      toast({
        title: "Anúncio atualizado",
        description: "Moradia marcada como alugada."
      });
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message
      });
    }
    
    setSoldDialogOpen(false);
  };

  const statusBadge = moradia.status === "alugado" ? (
    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
      Alugado
    </Badge>
  ) : null;

  return (
    <Card className={`border border-border/40 backdrop-blur-sm bg-card/30 overflow-hidden hover:shadow-md transition-all duration-200 ${moradia.status === "alugado" ? "opacity-70" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline">
            {formatCurrency(moradia.valor_mensal)}/mês
          </Badge>
          <div className="flex items-center gap-2">
            {statusBadge}
            <Badge variant="secondary">
              {moradia.universidade?.sigla || "UNIVERSIDADE"}
            </Badge>
          </div>
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
        
        {moradia.imagens && moradia.imagens.length > 0 && (
          <div className="pt-2">
            <div className="aspect-video rounded-md overflow-hidden bg-muted">
              <img 
                src={moradia.imagens[0]} 
                alt="Imagem da moradia" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className={isOwner ? "flex-col gap-2" : ""}>
        {isOwner ? (
          <>
            <div className="flex w-full gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit && onEdit(moradia)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
            {moradia.status !== "alugado" && (
              <Button 
                size="sm" 
                variant="default" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setSoldDialogOpen(true)}
              >
                <Check className="mr-2 h-4 w-4" />
                Marcar como Alugado
              </Button>
            )}
          </>
        ) : (
          <Button 
            size="sm" 
            className="w-full" 
            onClick={handleContactClick}
            disabled={moradia.status === "alugado"}
          >
            <Phone className="mr-2 h-4 w-4" />
            Entrar em contato
          </Button>
        )}
      </CardFooter>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu anúncio
              de moradia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como alugado?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto marcará sua moradia como alugada. O anúncio ainda ficará visível, 
              mas indicado como indisponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsRented}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
