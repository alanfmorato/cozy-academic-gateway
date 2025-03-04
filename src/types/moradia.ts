
export interface Moradia {
  id: string;
  descricao: string;
  valor_mensal: number;
  qtd_moradores: number | null;
  localizacao: string | null;
  servicos: string | null;
  imagens: string[] | null;
  usuario_id: string;
  universidade_id: string;
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
  whatsapp?: string;
}

export interface MoradiaFormData {
  descricao: string;
  valor_mensal: number;
  qtd_moradores: number;
  localizacao: string;
  servicos: string;
  whatsapp: string;
}

