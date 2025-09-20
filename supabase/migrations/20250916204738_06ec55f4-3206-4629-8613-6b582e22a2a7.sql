-- Criação do banco de dados EstratégiaENEM

-- Tabela de usuários (além da auth.users do Supabase)
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  objetivo VARCHAR(50) CHECK (objetivo IN ('medicina', 'engenharia', 'humanas', 'outros')) DEFAULT 'outros',
  plano VARCHAR(20) CHECK (plano IN ('free', 'premium')) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Tabela de progresso
CREATE TABLE public.progresso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  materia VARCHAR(50) NOT NULL,
  horas DECIMAL(5,2) DEFAULT 0,
  acertos_percent DECIMAL(5,2) DEFAULT 0,
  data_atividade DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio progresso" 
ON public.progresso 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso" 
ON public.progresso 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso" 
ON public.progresso 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela de redações
CREATE TABLE public.redacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tema VARCHAR(255) NOT NULL,
  texto TEXT NOT NULL,
  nota DECIMAL(4,1) DEFAULT 0,
  feedback_ia TEXT,
  competencia_1 INTEGER DEFAULT 0,
  competencia_2 INTEGER DEFAULT 0,
  competencia_3 INTEGER DEFAULT 0,
  competencia_4 INTEGER DEFAULT 0,
  competencia_5 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.redacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias redações" 
ON public.redacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias redações" 
ON public.redacoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Tabela de biblioteca de conteúdo
CREATE TABLE public.biblioteca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materia VARCHAR(50) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('video', 'pdf', 'resumo')) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  resumo TEXT,
  url TEXT,
  conteudo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Biblioteca é pública para todos os usuários autenticados
ALTER TABLE public.biblioteca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver a biblioteca" 
ON public.biblioteca 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Tabela de questões
CREATE TABLE public.questoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materia VARCHAR(50) NOT NULL,
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta VARCHAR(1) NOT NULL,
  dificuldade INTEGER DEFAULT 1 CHECK (dificuldade BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver questões" 
ON public.questoes 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Tabela de planos de estudo
CREATE TABLE public.planos_estudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meta_semanal JSONB,
  tarefas JSONB,
  progresso_semanal DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.planos_estudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios planos" 
ON public.planos_estudos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios planos" 
ON public.planos_estudos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios planos" 
ON public.planos_estudos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Tabela de chats com IA
CREATE TABLE public.chats_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT,
  materia VARCHAR(50) DEFAULT 'geral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chats_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios chats" 
ON public.chats_ia 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios chats" 
ON public.chats_ia 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Tabela de simulados
CREATE TABLE public.simulados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('completo', 'materia', 'rapido')) NOT NULL,
  materia VARCHAR(50),
  questoes_count INTEGER NOT NULL,
  acertos INTEGER DEFAULT 0,
  acertos_percent DECIMAL(5,2) DEFAULT 0,
  tempo_gasto INTEGER, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios simulados" 
ON public.simulados 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios simulados" 
ON public.simulados 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_estudos_updated_at
    BEFORE UPDATE ON public.planos_estudos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais da biblioteca
INSERT INTO public.biblioteca (materia, tipo, titulo, resumo, url, conteudo) VALUES
-- Matemática
('matematica', 'video', 'Funções Quadráticas - Teoria Completa', 'Aprenda tudo sobre funções do 2º grau, vértice, discriminante e gráficos', 'https://www.youtube.com/watch?v=example1', 'Conteúdo sobre funções quadráticas...'),
('matematica', 'resumo', 'Resumo: Geometria Plana', 'Fórmulas essenciais de área, perímetro e teoremas', null, 'Triângulos: Área = (b×h)/2. Quadrado: Área = l². Círculo: Área = πr²...'),
('matematica', 'pdf', 'Exercícios de Logaritmos', 'Lista com 50 exercícios resolvidos sobre logaritmos', 'https://example.com/logaritmos.pdf', null),

-- Ciências Humanas
('humanas', 'video', 'Ditadura Militar no Brasil (1964-1985)', 'Contexto histórico, AI-5, abertura política e redemocratização', 'https://www.youtube.com/watch?v=example2', 'A ditadura militar brasileira...'),
('humanas', 'resumo', 'Resumo: Era Vargas', 'Governo provisório, constitucional e Estado Novo', null, 'Getúlio Vargas governou o Brasil de 1930 a 1945 e de 1951 a 1954...'),
('humanas', 'video', 'Geografia: Mudanças Climáticas', 'Efeito estufa, aquecimento global e consequências ambientais', 'https://www.youtube.com/watch?v=example3', 'As mudanças climáticas...'),

-- Ciências da Natureza
('natureza', 'video', 'Ecologia: Cadeias e Teias Alimentares', 'Produtores, consumidores, decompositores e fluxo de energia', 'https://www.youtube.com/watch?v=example4', 'Conceitos fundamentais de ecologia...'),
('natureza', 'resumo', 'Resumo: Leis de Newton', 'Primeira, segunda e terceira lei com exemplos práticos', null, '1ª Lei (Inércia): Todo corpo em repouso tende a permanecer em repouso...'),
('natureza', 'video', 'Química Orgânica: Funções Orgânicas', 'Hidrocarbonetos, álcoois, aldeídos, cetonas e ácidos carboxílicos', 'https://www.youtube.com/watch?v=example5', 'Funções orgânicas principais...'),

-- Linguagens
('linguagens', 'video', 'Literatura: Realismo e Naturalismo', 'Machado de Assis, Aluísio Azevedo e características dos movimentos', 'https://www.youtube.com/watch?v=example6', 'O Realismo surgiu no século XIX...'),
('linguagens', 'resumo', 'Resumo: Figuras de Linguagem', 'Metáfora, metonímia, hipérbole, ironia e outras figuras importantes', null, 'Metáfora: comparação implícita. Ex: Meus cabelos são fios de ouro...'),
('linguagens', 'video', 'Interpretação de Texto ENEM', 'Técnicas e estratégias para resolver questões de interpretação', 'https://www.youtube.com/watch?v=example7', 'Dicas para interpretação...');

-- Inserir questões de exemplo
INSERT INTO public.questoes (materia, enunciado, alternativas, resposta_correta, dificuldade) VALUES
-- Matemática
('matematica', 'Qual é a raiz da equação x² - 4 = 0?', '{"a": "±2", "b": "±4", "c": "2", "d": "4", "e": "0"}', 'a', 1),
('matematica', 'Uma função quadrática f(x) = ax² + bx + c tem vértice no ponto (2, -1). Se f(0) = 3, qual o valor de a?', '{"a": "1", "b": "2", "c": "1/2", "d": "3", "e": "-1"}', 'a', 2),
('matematica', 'O valor de log₂(8) é:', '{"a": "2", "b": "3", "c": "4", "d": "8", "e": "16"}', 'b', 1),

-- Ciências Humanas
('humanas', 'O AI-5, decretado durante a ditadura militar brasileira, teve como principal característica:', '{"a": "Abertura política gradual", "b": "Suspensão das garantias constitucionais", "c": "Criação do pluripartidarismo", "d": "Anistia política ampla", "e": "Eleições diretas"}', 'b', 2),
('humanas', 'Durante o Estado Novo (1937-1945), Getúlio Vargas:', '{"a": "Promoveu a democratização", "b": "Criou o DIP (Departamento de Imprensa e Propaganda)", "c": "Estabeleceu o parlamentarismo", "d": "Descentralizou o poder", "e": "Extinguiu a CLT"}', 'b', 1),

-- Ciências da Natureza
('natureza', 'Na cadeia alimentar, os seres que produzem seu próprio alimento são chamados de:', '{"a": "Consumidores primários", "b": "Consumidores secundários", "c": "Decompositores", "d": "Produtores", "e": "Parasitas"}', 'd', 1),
('natureza', 'A 1ª Lei de Newton (Lei da Inércia) afirma que:', '{"a": "F = ma", "b": "Ação e reação são iguais", "c": "Todo corpo em repouso tende a permanecer em repouso", "d": "A velocidade é constante", "e": "A aceleração é nula"}', 'c', 2),

-- Linguagens
('linguagens', 'Machado de Assis é considerado o maior representante do:', '{"a": "Romantismo", "b": "Realismo", "c": "Naturalismo", "d": "Parnasianismo", "e": "Simbolismo"}', 'b', 1),
('linguagens', 'A figura de linguagem presente em "Seus cabelos são fios de ouro" é:', '{"a": "Metáfora", "b": "Metonímia", "c": "Hipérbole", "d": "Ironia", "e": "Personificação"}', 'a', 1);