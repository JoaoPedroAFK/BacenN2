-- ============================================
-- SCRIPT FINAL: ADICIONAR TODAS AS COLUNAS FALTANTES
-- Este script força a atualização do cache do PostgREST
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Função helper para verificar se coluna existe (case-insensitive)
CREATE OR REPLACE FUNCTION column_exists_ci(
    p_schema text,
    p_table text,
    p_column text
) RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = p_schema
            AND table_name = p_table
            AND LOWER(column_name) = LOWER(p_column)
    );
$$;

-- Adicionar todas as colunas necessárias
DO $$
DECLARE
    schema_name text := 'public';
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(array['fichas_bacen','fichas_n2','fichas_chatbot']) LOOP
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Processando tabela: %', tbl;
        RAISE NOTICE '========================================';

        -- Colunas TEXT essenciais
        IF NOT column_exists_ci(schema_name, tbl, 'nomeCliente') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "nomeCliente" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna nomeCliente adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna nomeCliente já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'nomeCompleto') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "nomeCompleto" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna nomeCompleto adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna nomeCompleto já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'cpf') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "cpf" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna cpf adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna cpf já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'cpfTratado') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "cpfTratado" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna cpfTratado adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna cpfTratado já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'telefone') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "telefone" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna telefone adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna telefone já existe';
        END IF;

        -- Origem apenas para BACEN e N2 (NÃO para chatbot)
        IF tbl != 'fichas_chatbot' THEN
            IF NOT column_exists_ci(schema_name, tbl, 'origem') THEN
                EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "origem" TEXT;', schema_name, tbl);
                RAISE NOTICE '  ✅ Coluna origem adicionada';
            ELSE
                RAISE NOTICE '  ⏭️  Coluna origem já existe';
            END IF;
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'status') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "status" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna status adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna status já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'responsavel') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "responsavel" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna responsavel adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna responsavel já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'motivoReduzido') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "motivoReduzido" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna motivoReduzido adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna motivoReduzido já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'motivoDetalhado') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "motivoDetalhado" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna motivoDetalhado adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna motivoDetalhado já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'observacoes') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "observacoes" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna observacoes adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna observacoes já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'mes') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "mes" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna mes adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna mes já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'tipoDemanda') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "tipoDemanda" TEXT;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna tipoDemanda adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna tipoDemanda já existe';
        END IF;

        -- Colunas TIMESTAMPTZ
        IF NOT column_exists_ci(schema_name, tbl, 'dataCriacao') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "dataCriacao" TIMESTAMPTZ DEFAULT NOW();', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna dataCriacao adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna dataCriacao já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'dataRecebimento') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "dataRecebimento" TIMESTAMPTZ;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna dataRecebimento adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna dataRecebimento já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'finalizadoEm') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "finalizadoEm" TIMESTAMPTZ;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna finalizadoEm adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna finalizadoEm já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'dataAtualizacao') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "dataAtualizacao" TIMESTAMPTZ DEFAULT NOW();', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna dataAtualizacao adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna dataAtualizacao já existe';
        END IF;

        -- Colunas BOOLEAN
        IF NOT column_exists_ci(schema_name, tbl, 'enviarCobranca') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "enviarCobranca" BOOLEAN DEFAULT false;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna enviarCobranca adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna enviarCobranca já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'pixLiberado') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "pixLiberado" BOOLEAN DEFAULT false;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna pixLiberado adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna pixLiberado já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'aceitouLiquidacao') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "aceitouLiquidacao" BOOLEAN DEFAULT false;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna aceitouLiquidacao adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna aceitouLiquidacao já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'concluido') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "concluido" BOOLEAN DEFAULT false;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna concluido adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna concluido já existe';
        END IF;

        -- Colunas JSONB
        IF NOT column_exists_ci(schema_name, tbl, 'modulosContato') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "modulosContato" JSONB;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna modulosContato adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna modulosContato já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'tentativas') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "tentativas" JSONB;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna tentativas adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna tentativas já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'protocolos') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "protocolos" JSONB;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna protocolos adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna protocolos já existe';
        END IF;

        IF NOT column_exists_ci(schema_name, tbl, 'camposEspecificos') THEN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN "camposEspecificos" JSONB;', schema_name, tbl);
            RAISE NOTICE '  ✅ Coluna camposEspecificos adicionada';
        ELSE
            RAISE NOTICE '  ⏭️  Coluna camposEspecificos já existe';
        END IF;

        RAISE NOTICE '✅ Tabela % processada com sucesso!', tbl;
    END LOOP;
END $$;

-- Forçar atualização do cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificar colunas criadas
DO $$
DECLARE
    tbl text;
    col_count int;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO FINAL DAS COLUNAS';
    RAISE NOTICE '========================================';
    
    FOR tbl IN SELECT unnest(array['fichas_bacen','fichas_n2','fichas_chatbot']) LOOP
        SELECT COUNT(*) INTO col_count
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = tbl;
        
        RAISE NOTICE 'Tabela % tem % colunas', tbl, col_count;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IMPORTANTE: Aguarde 10-30 segundos para o PostgREST atualizar o cache';
    RAISE NOTICE 'Se ainda houver erros, recarregue a página do aplicativo';
    RAISE NOTICE '========================================';
END $$;

-- Listar todas as colunas de cada tabela (para debug)
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('fichas_bacen', 'fichas_n2', 'fichas_chatbot')
ORDER BY table_name, ordinal_position;

