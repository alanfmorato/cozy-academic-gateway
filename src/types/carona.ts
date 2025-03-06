
export interface Carona {
  id: string;
  usuario_id: string;
  local_saida: string;
  local_chegada: string;
  horario_saida: string;
  valor_vaga: number;
  qtd_vagas: number;
  forma_pagamento: string;
  observacoes: string | null;
  status: "disponivel" | "completo";
  created_at: string;
  updated_at: string;
  usuario?: {
    full_name: string;
    email: string;
  };
}

export interface ReservaCarona {
  id: string;
  carona_id: string;
  usuario_id: string;
  status: "confirmado" | "cancelado";
  created_at: string;
  updated_at: string;
  usuario?: {
    full_name: string;
    email: string;
  };
}

export interface AvaliacaoCarona {
  id: string;
  carona_id: string;
  avaliador_id: string;
  avaliado_id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export interface FavoritoCarona {
  id: string;
  usuario_id: string;
  motorista_id: string | null;
  rota_origem: string | null;
  rota_destino: string | null;
  created_at: string;
}

export interface MensagemCarona {
  id: string;
  carona_id: string;
  remetente_id: string;
  destinatario_id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  remetente?: {
    full_name: string;
  };
}

export interface CaronaFormData {
  local_saida: string;
  local_chegada: string;
  horario_saida: string;
  valor_vaga: number;
  qtd_vagas: number;
  forma_pagamento: string;
  observacoes: string;
}
