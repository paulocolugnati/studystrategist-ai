-- Add is_premium column to usuarios table
ALTER TABLE public.usuarios ADD COLUMN is_premium BOOLEAN DEFAULT false;

-- Create essays table for redação functionality  
CREATE TABLE public.essays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tema TEXT NOT NULL,
  texto TEXT NOT NULL,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on essays table
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for essays
CREATE POLICY "Users can view their own essays" 
ON public.essays 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own essays" 
ON public.essays 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create study_plans table
CREATE TABLE public.study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  focus_area TEXT NOT NULL,
  plan_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on study_plans table
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_plans
CREATE POLICY "Users can view their own study plans" 
ON public.study_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" 
ON public.study_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add some sample questions to questoes table if it's empty
INSERT INTO public.questoes (enunciado, alternativas, resposta_correta, materia, dificuldade) VALUES
('Qual é a derivada da função f(x) = x²?', '["2x", "x", "2", "x²"]', '2x', 'Matemática', 2),
('Quem proclamou a independência do Brasil?', '["Dom Pedro I", "Dom Pedro II", "Getúlio Vargas", "Juscelino Kubitschek"]', 'Dom Pedro I', 'História', 1),
('Qual é a fórmula da água?', '["H2O", "CO2", "NaCl", "CH4"]', 'H2O', 'Química', 1),
('O que significa "biodiversidade"?', '["Variedade de vida", "Poluição", "Aquecimento global", "Desmatamento"]', 'Variedade de vida', 'Biologia', 2),
('Qual é a capital da França?', '["Paris", "Londres", "Madrid", "Roma"]', 'Paris', 'Geografia', 1),
('Qual figura de linguagem está presente em "O vento sussurra"?', '["Personificação", "Metáfora", "Comparação", "Ironia"]', 'Personificação', 'Português', 2),
('Qual é o resultado de 2³?', '["6", "8", "9", "4"]', '8', 'Matemática', 1),
('Em que ano foi promulgada a Constituição Federal atual?', '["1988", "1985", "1990", "1992"]', '1988', 'História', 2),
('Qual é a unidade de medida da força?', '["Newton", "Joule", "Watt", "Pascal"]', 'Newton', 'Física', 2),
('O que é fotossíntese?', '["Processo de produção de alimento pelas plantas", "Respiração das plantas", "Reprodução das plantas", "Crescimento das plantas"]', 'Processo de produção de alimento pelas plantas', 'Biologia', 2);

-- Add some sample resources to biblioteca table if it's empty
INSERT INTO public.biblioteca (titulo, tipo, materia, resumo, url) VALUES
('Manual do ENEM 2025', 'PDF', 'Geral', 'Guia completo com todas as informações sobre o ENEM 2025', 'https://download.inep.gov.br/enem/manual_enem_2025.pdf'),
('Videoaulas de Matemática', 'Vídeo', 'Matemática', 'Curso completo de matemática para o ENEM', 'https://www.youtube.com/playlist?list=PLx3G6HkJ0BKx'),
('Redação ENEM: Dicas e Modelos', 'PDF', 'Redação', 'Manual com dicas e modelos de redação para o ENEM', 'https://redacao.com.br/manual-enem-2025.pdf'),
('História do Brasil Resumida', 'PDF', 'História', 'Resumo completo da história do Brasil para o ENEM', 'https://historia.com.br/brasil-resumo.pdf'),
('Fórmulas de Física', 'PDF', 'Física', 'Compilação das principais fórmulas de física do ENEM', 'https://fisica.com.br/formulas-enem.pdf'),
('Química Orgânica', 'Vídeo', 'Química', 'Curso de química orgânica focado no ENEM', 'https://www.youtube.com/playlist?list=PLx3G6HkJ0BKy'),
('Geografia Física e Humana', 'PDF', 'Geografia', 'Resumo de geografia para o ENEM', 'https://geografia.com.br/enem-resumo.pdf'),
('Literatura Brasileira', 'PDF', 'Português', 'Obras e autores mais cobrados no ENEM', 'https://literatura.com.br/enem-obras.pdf'),
('Biologia Celular', 'Vídeo', 'Biologia', 'Videoaulas sobre biologia celular', 'https://www.youtube.com/playlist?list=PLx3G6HkJ0BKz'),
('Filosofia e Sociologia', 'PDF', 'Filosofia', 'Principais conceitos de filosofia e sociologia', 'https://filosofia.com.br/enem-conceitos.pdf');