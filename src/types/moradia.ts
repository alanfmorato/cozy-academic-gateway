

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
  status?: "disponivel" | "alugado";
}

export interface MoradiaFormData {
  descricao: string;
  valor_mensal: number;
  qtd_moradores: number;
  localizacao: string;
  servicos: string;
  whatsapp: string;
}

// Tipos para Marketplace

export interface Produto {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  imagens: string[] | null;
  usuario_id: string;
  universidade_id: string;
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
  whatsapp?: string;
  status?: "disponivel" | "vendido";
}

export interface ProdutoFormData {
  titulo: string;
  descricao: string;
  valor: number;
  whatsapp: string;
}

export interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  arquivo_url: string | null;
  usuario_id: string;
  curso_id: string | null;
  universidade_id: string;
  curso?: {
    nome: string;
  };
  universidade?: {
    nome: string;
    sigla: string;
  };
  updated_at: string;
  whatsapp?: string;
  status?: "disponivel" | "indisponivel";
}

export interface MaterialFormData {
  titulo: string;
  descricao: string;
  curso_id: string;
  arquivo_url: string;
  whatsapp: string;
}
