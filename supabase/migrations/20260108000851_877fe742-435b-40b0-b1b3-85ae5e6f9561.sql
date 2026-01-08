
-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de universidades
CREATE TABLE public.universidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de caronas
CREATE TABLE public.caronas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  local_saida TEXT NOT NULL,
  local_chegada TEXT NOT NULL,
  horario_saida TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_vaga NUMERIC NOT NULL DEFAULT 0,
  qtd_vagas INTEGER NOT NULL DEFAULT 1,
  forma_pagamento TEXT NOT NULL DEFAULT 'pix',
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de reservas de caronas
CREATE TABLE public.reservas_caronas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carona_id UUID REFERENCES public.caronas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de avaliações de caronas
CREATE TABLE public.avaliacoes_caronas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carona_id UUID REFERENCES public.caronas(id) ON DELETE CASCADE,
  avaliador_id UUID NOT NULL,
  avaliado_id UUID NOT NULL,
  nota INTEGER NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de favoritos de caronas
CREATE TABLE public.favoritos_caronas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  motorista_id UUID,
  rota_origem TEXT,
  rota_destino TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens de caronas
CREATE TABLE public.mensagens_caronas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carona_id UUID REFERENCES public.caronas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL,
  destinatario_id UUID NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de moradias
CREATE TABLE public.moradias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  universidade_id UUID REFERENCES public.universidades(id),
  descricao TEXT NOT NULL,
  valor_mensal NUMERIC NOT NULL,
  qtd_moradores INTEGER,
  localizacao TEXT,
  servicos TEXT,
  imagens TEXT[],
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de compra e venda (marketplace)
CREATE TABLE public.compra_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  universidade_id UUID REFERENCES public.universidades(id),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  imagens TEXT[],
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de materiais
CREATE TABLE public.materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  universidade_id UUID REFERENCES public.universidades(id),
  curso_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT,
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de estágios
CREATE TABLE public.estagios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  universidade_id UUID REFERENCES public.universidades(id),
  empresa TEXT NOT NULL,
  descricao TEXT NOT NULL,
  remuneracao NUMERIC,
  requisitos TEXT,
  link_inscricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  universidade_id UUID REFERENCES public.universidades(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  tipo TEXT,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caronas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_caronas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_caronas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos_caronas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_caronas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moradias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compra_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estagios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura (já que removemos autenticação)
CREATE POLICY "Acesso público para leitura de profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de universidades" ON public.universidades FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de caronas" ON public.caronas FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de reservas" ON public.reservas_caronas FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de avaliacoes" ON public.avaliacoes_caronas FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de favoritos" ON public.favoritos_caronas FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de mensagens" ON public.mensagens_caronas FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de moradias" ON public.moradias FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de compra_venda" ON public.compra_venda FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de materiais" ON public.materiais FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de estagios" ON public.estagios FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de eventos" ON public.eventos FOR SELECT USING (true);

-- Políticas para inserção pública (temporárias para teste sem auth)
CREATE POLICY "Acesso público para inserção em profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em universidades" ON public.universidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em caronas" ON public.caronas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em reservas" ON public.reservas_caronas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em avaliacoes" ON public.avaliacoes_caronas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em favoritos" ON public.favoritos_caronas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em mensagens" ON public.mensagens_caronas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em moradias" ON public.moradias FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em compra_venda" ON public.compra_venda FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em materiais" ON public.materiais FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em estagios" ON public.estagios FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em eventos" ON public.eventos FOR INSERT WITH CHECK (true);

-- Políticas para atualização pública
CREATE POLICY "Acesso público para atualização em profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em caronas" ON public.caronas FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em reservas" ON public.reservas_caronas FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em mensagens" ON public.mensagens_caronas FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em moradias" ON public.moradias FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em compra_venda" ON public.compra_venda FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em materiais" ON public.materiais FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em estagios" ON public.estagios FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em eventos" ON public.eventos FOR UPDATE USING (true);

-- Políticas para exclusão pública
CREATE POLICY "Acesso público para exclusão em caronas" ON public.caronas FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em reservas" ON public.reservas_caronas FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em favoritos" ON public.favoritos_caronas FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em moradias" ON public.moradias FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em compra_venda" ON public.compra_venda FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em materiais" ON public.materiais FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em eventos" ON public.eventos FOR DELETE USING (true);

-- Inserir algumas universidades de exemplo
INSERT INTO public.universidades (nome, sigla) VALUES
  ('Universidade de São Paulo', 'USP'),
  ('Universidade Estadual de Campinas', 'UNICAMP'),
  ('Universidade Federal do Rio de Janeiro', 'UFRJ'),
  ('Universidade Federal de Minas Gerais', 'UFMG'),
  ('Pontifícia Universidade Católica', 'PUC');
