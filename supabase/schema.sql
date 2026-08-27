-- ==============================================================================
-- Schema SQL para o Supabase - Integrar Central
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. Criação da tabela de Pacientes
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cpf TEXT DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT DEFAULT '',
    birth_date DATE,
    address TEXT DEFAULT '',
    origin TEXT DEFAULT 'Outros',
    status TEXT NOT NULL DEFAULT 'Ativo',
    notes TEXT DEFAULT '',
    tags JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    first_visit_date DATE DEFAULT CURRENT_DATE,
    last_visit_date DATE DEFAULT CURRENT_DATE,
    churn_risk BOOLEAN DEFAULT FALSE,
    churn_risk_reason TEXT,
    follow_up_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices de performance e busca rápida
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);

-- 3. Habilita Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso permissivas para a aplicação
-- Permite leitura para anon e service role
CREATE POLICY "Permitir SELECT em patients para todos" 
ON public.patients FOR SELECT 
USING (true);

-- Permite inserção para anon e service role
CREATE POLICY "Permitir INSERT em patients para todos" 
ON public.patients FOR INSERT 
WITH CHECK (true);

-- Permite atualização para anon e service role
CREATE POLICY "Permitir UPDATE em patients para todos" 
ON public.patients FOR UPDATE 
USING (true);

-- Permite exclusão para anon e service role
CREATE POLICY "Permitir DELETE em patients para todos" 
ON public.patients FOR DELETE 
USING (true);
