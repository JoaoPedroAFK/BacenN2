-- ============================================
-- SCRIPT SIMPLES: ADICIONAR COLUNAS FALTANTES
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Adicionar coluna dataAtualizacao se não existir
DO $$ 
BEGIN
    -- Para fichas_bacen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fichas_bacen' 
        AND LOWER(column_name) = LOWER('dataAtualizacao')
    ) THEN
        ALTER TABLE public.fichas_bacen ADD COLUMN "dataAtualizacao" TIMESTAMPTZ;
        RAISE NOTICE 'Coluna dataAtualizacao adicionada em fichas_bacen';
    ELSE
        RAISE NOTICE 'Coluna dataAtualizacao já existe em fichas_bacen';
    END IF;

    -- Para fichas_n2
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fichas_n2' 
        AND LOWER(column_name) = LOWER('dataAtualizacao')
    ) THEN
        ALTER TABLE public.fichas_n2 ADD COLUMN "dataAtualizacao" TIMESTAMPTZ;
        RAISE NOTICE 'Coluna dataAtualizacao adicionada em fichas_n2';
    ELSE
        RAISE NOTICE 'Coluna dataAtualizacao já existe em fichas_n2';
    END IF;

    -- Para fichas_chatbot
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'fichas_chatbot' 
        AND LOWER(column_name) = LOWER('dataAtualizacao')
    ) THEN
        ALTER TABLE public.fichas_chatbot ADD COLUMN "dataAtualizacao" TIMESTAMPTZ;
        RAISE NOTICE 'Coluna dataAtualizacao adicionada em fichas_chatbot';
    ELSE
        RAISE NOTICE 'Coluna dataAtualizacao já existe em fichas_chatbot';
    END IF;
END $$;

-- Verificar colunas existentes
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name IN ('fichas_bacen', 'fichas_n2', 'fichas_chatbot')
    AND LOWER(column_name) LIKE '%data%'
ORDER BY table_name, column_name;

