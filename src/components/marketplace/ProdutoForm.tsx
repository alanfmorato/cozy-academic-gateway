
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Produto } from '@/types/moradia';

interface ProdutoFormProps {
  universidades: {id: string, nome: string}[];
  onSuccess: () => void;
  onCancel: () => void;
  editingProduto?: Produto;
}

const ProdutoForm: React.FC<ProdutoFormProps> = ({ 
  universidades, 
  onSuccess, 
  onCancel,
  editingProduto 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    universidade_id: '',
    whatsapp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with editing product data if available
  useEffect(() => {
    if (editingProduto) {
      setFormData({
        titulo: editingProduto.titulo,
        descricao: editingProduto.descricao,
        valor: editingProduto.valor.toString(),
        universidade_id: editingProduto.universidade_id,
        whatsapp: editingProduto.whatsapp || ''
      });
    }
  }, [editingProduto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUniversidadeChange = (value: string) => {
    setFormData(prev => ({ ...prev, universidade_id: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para cadastrar produtos.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!formData.titulo || !formData.descricao || !formData.valor || !formData.universidade_id) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Parse the numeric value
      const valor = parseFloat(formData.valor);
      if (isNaN(valor) || valor <= 0) {
        throw new Error('O valor precisa ser um número positivo.');
      }

      const produtoData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        valor: valor,
        universidade_id: formData.universidade_id,
        whatsapp: formData.whatsapp || null,
        status: 'disponivel' as const
      };

      let result;

      if (editingProduto) {
        // Update existing product
        result = await supabase
          .from('compra_venda')
          .update(produtoData)
          .eq('id', editingProduto.id)
          .select();
          
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso.",
        });
      } else {
        // Insert new product
        result = await supabase
          .from('compra_venda')
          .insert({
            ...produtoData,
            usuario_id: user.id,
          })
          .select();
          
        toast({
          title: "Sucesso!",
          description: "Produto cadastrado com sucesso.",
        });
      }

      if (result.error) throw result.error;
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: editingProduto ? "Erro ao atualizar produto" : "Erro ao cadastrar produto",
        description: error.message,
      });
      console.error('Erro ao processar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título*</Label>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ex: Livro de Cálculo 1"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição*</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva o produto, estado de conservação, etc."
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)*</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="50.00"
              value={formData.valor}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="universidade">Universidade*</Label>
            <Select value={formData.universidade_id} onValueChange={handleUniversidadeChange}>
              <SelectTrigger id="universidade">
                <SelectValue placeholder="Selecione uma universidade" />
              </SelectTrigger>
              <SelectContent>
                {universidades.map(uni => (
                  <SelectItem key={uni.id} value={uni.id}>{uni.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              placeholder="+5511999999999"
              value={formData.whatsapp}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (editingProduto ? 'Atualizando...' : 'Cadastrando...') 
                : (editingProduto ? 'Atualizar Produto' : 'Cadastrar Produto')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProdutoForm;
