
-- Tabela de categorias de cursos
CREATE TABLE public.course_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de cursos
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL,
  category_id UUID REFERENCES public.course_categories(id),
  thumbnail_url TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'iniciante',
  duration_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho',
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de módulos de cursos
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de aulas de cursos
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_num INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de materiais de cursos
CREATE TABLE public.course_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de matrículas em cursos
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  progress NUMERIC DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(course_id, user_id)
);

-- Tabela de progresso em aulas
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Tabela de avaliações de cursos
CREATE TABLE public.course_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Função para calcular média de avaliações de um curso
CREATE OR REPLACE FUNCTION public.get_course_avg_rating(course_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating)::NUMERIC, 0) FROM public.course_ratings WHERE course_id = course_uuid;
$$;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura
CREATE POLICY "Acesso público para leitura de course_categories" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de course_modules" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de course_lessons" ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de course_materials" ON public.course_materials FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de course_enrollments" ON public.course_enrollments FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de lesson_progress" ON public.lesson_progress FOR SELECT USING (true);
CREATE POLICY "Acesso público para leitura de course_ratings" ON public.course_ratings FOR SELECT USING (true);

-- Políticas para inserção pública
CREATE POLICY "Acesso público para inserção em course_categories" ON public.course_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em course_modules" ON public.course_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em course_lessons" ON public.course_lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em course_materials" ON public.course_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em course_enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em lesson_progress" ON public.lesson_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para inserção em course_ratings" ON public.course_ratings FOR INSERT WITH CHECK (true);

-- Políticas para atualização pública
CREATE POLICY "Acesso público para atualização em courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em course_modules" ON public.course_modules FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em course_lessons" ON public.course_lessons FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em course_materials" ON public.course_materials FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em course_enrollments" ON public.course_enrollments FOR UPDATE USING (true);
CREATE POLICY "Acesso público para atualização em lesson_progress" ON public.lesson_progress FOR UPDATE USING (true);

-- Políticas para exclusão pública
CREATE POLICY "Acesso público para exclusão em courses" ON public.courses FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em course_modules" ON public.course_modules FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em course_lessons" ON public.course_lessons FOR DELETE USING (true);
CREATE POLICY "Acesso público para exclusão em course_materials" ON public.course_materials FOR DELETE USING (true);

-- Inserir categorias de exemplo
INSERT INTO public.course_categories (name, slug, description) VALUES
  ('Programação', 'programacao', 'Cursos de desenvolvimento de software'),
  ('Design', 'design', 'Cursos de design gráfico e UI/UX'),
  ('Marketing', 'marketing', 'Cursos de marketing digital'),
  ('Negócios', 'negocios', 'Cursos de gestão e empreendedorismo'),
  ('Idiomas', 'idiomas', 'Cursos de idiomas estrangeiros');
