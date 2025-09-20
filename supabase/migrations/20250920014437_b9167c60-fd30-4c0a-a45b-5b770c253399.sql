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