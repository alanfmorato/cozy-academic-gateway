
import React from 'react';
import { Edit, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Produto } from '@/types/moradia';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProdutoActionsProps {
  produto: Produto;
  onEdit: () => void;
  onStatusChange: () => void;
}

const ProdutoActions: React.FC<ProdutoActionsProps> = ({ 
  produto, 
  onEdit,
  onStatusChange 
}) => {
  const handleMarkAsSold = async () => {
    try {
      const { error } = await supabase
        .from('compra_venda')
        .update({ status: 'vendido' })
        .eq('id', produto.id);

      if (error) throw error;
      
      toast({
        title: "Produto atualizado",
        description: "Produto marcado como vendido com sucesso!",
      });
      
      onStatusChange();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar produto",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-3">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center" 
        onClick={onEdit}
      >
        <Edit className="mr-2 h-4 w-4" />
        Editar anúncio
      </Button>
      
      {produto.status === 'disponivel' && (
        <Button 
          variant="success" 
          className="w-full flex items-center justify-center" 
          onClick={handleMarkAsSold}
        >
          <PackageCheck className="mr-2 h-4 w-4" />
          Marcar como vendido
        </Button>
      )}
    </div>
  );
};

export default ProdutoActions;
