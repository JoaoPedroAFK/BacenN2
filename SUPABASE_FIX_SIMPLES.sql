-- ============================================
-- SCRIPT SIMPLES E DIRETO - ADICIONAR COLUNAS
-- Execute este script no Supabase SQL Editor
-- ============================================

-- TABELA: fichas_bacen
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "nomeCliente" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "nomeCompleto" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "cpfTratado" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "origem" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "responsavel" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "motivoReduzido" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "motivoDetalhado" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "mes" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "tipoDemanda" TEXT;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "dataCriacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "dataRecebimento" TIMESTAMPTZ;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "finalizadoEm" TIMESTAMPTZ;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "dataAtualizacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "enviarCobranca" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "pixLiberado" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "aceitouLiquidacao" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "concluido" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "modulosContato" JSONB;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "tentativas" JSONB;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "protocolos" JSONB;
ALTER TABLE public.fichas_bacen ADD COLUMN IF NOT EXISTS "camposEspecificos" JSONB;

-- TABELA: fichas_n2
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "nomeCliente" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "nomeCompleto" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "cpfTratado" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "origem" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "responsavel" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "motivoReduzido" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "motivoDetalhado" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "mes" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "tipoDemanda" TEXT;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "dataCriacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "dataRecebimento" TIMESTAMPTZ;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "finalizadoEm" TIMESTAMPTZ;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "dataAtualizacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "enviarCobranca" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "pixLiberado" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "aceitouLiquidacao" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "concluido" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "modulosContato" JSONB;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "tentativas" JSONB;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "protocolos" JSONB;
ALTER TABLE public.fichas_n2 ADD COLUMN IF NOT EXISTS "camposEspecificos" JSONB;

-- TABELA: fichas_chatbot (SEM campo "origem")
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "nomeCliente" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "nomeCompleto" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "cpfTratado" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "telefone" TEXT;
-- NÃO adicionar "origem" para chatbot
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "responsavel" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "motivoReduzido" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "motivoDetalhado" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "observacoes" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "mes" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "tipoDemanda" TEXT;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "dataCriacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "dataRecebimento" TIMESTAMPTZ;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "finalizadoEm" TIMESTAMPTZ;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "dataAtualizacao" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "enviarCobranca" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "pixLiberado" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "aceitouLiquidacao" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "concluido" BOOLEAN DEFAULT false;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "modulosContato" JSONB;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "tentativas" JSONB;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "protocolos" JSONB;
ALTER TABLE public.fichas_chatbot ADD COLUMN IF NOT EXISTS "camposEspecificos" JSONB;

-- Forçar atualização do cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificar colunas criadas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('fichas_bacen', 'fichas_n2', 'fichas_chatbot')
    AND column_name IN ('nomeCliente', 'nomeCompleto', 'cpf', 'motivoReduzido', 'motivoDetalhado', 'finalizadoEm', 'dataCriacao', 'dataAtualizacao')
ORDER BY table_name, column_name;

