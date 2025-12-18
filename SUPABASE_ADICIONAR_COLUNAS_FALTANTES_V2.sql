-- Script para adicionar TODAS as colunas necessárias nas tabelas
-- Execute este script no SQL Editor do Supabase

-- 1) Helper function: checa existencia de coluna (case-insensitive)
CREATE OR REPLACE FUNCTION public.column_exists_ci(
  p_schema text,
  p_table text,
  p_column text
) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = p_schema
      AND table_name = p_table
      AND lower(column_name) = lower(p_column)
  );
$$;

-- 2) Procedure to add a column only if it doesn't exist (case-insensitive)
CREATE OR REPLACE PROCEDURE public.add_column_if_not_exists_ci(
  p_schema text,
  p_table text,
  p_column text,
  p_type text,
  p_default text DEFAULT NULL,
  p_nullable boolean DEFAULT true
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.column_exists_ci(p_schema, p_table, p_column) THEN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s %s',
      p_schema, p_table, p_column, p_type,
      CASE WHEN p_nullable THEN '' ELSE 'NOT NULL' END
    );

    IF p_default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s',
        p_schema, p_table, p_column, p_default);
    END IF;
    
    RAISE NOTICE 'Column % added to %.%', p_column, p_schema, p_table;
  ELSE
    RAISE NOTICE 'Column %.% already exists (case-insensitive) on %.%', p_schema, p_column, p_schema, p_table;
  END IF;
END;
$$;

-- 3) Adicionar TODAS as colunas necessárias nas 3 tabelas
DO $$
DECLARE
  schema_name text := 'public';
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(array['fichas_bacen','fichas_n2','fichas_chatbot']) LOOP
    RAISE NOTICE '=== Processando tabela: % ===', tbl;
    
    -- Campos básicos de texto
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'nomeCliente', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'nomeCompleto', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'cpf', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'cpfTratado', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'telefone', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'origem', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'status', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'responsavel', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'motivoReduzido', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'motivoDetalhado', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'observacoes', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'mes', 'TEXT');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'tipoDemanda', 'TEXT');
    
    -- Campos de data
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'dataCriacao', 'TIMESTAMPTZ');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'dataRecebimento', 'TIMESTAMPTZ');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'finalizadoEm', 'TIMESTAMPTZ');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'dataAtualizacao', 'TIMESTAMPTZ');
    
    -- Campos booleanos
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'enviarCobranca', 'BOOLEAN');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'pixLiberado', 'BOOLEAN');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'aceitouLiquidacao', 'BOOLEAN');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'concluido', 'BOOLEAN');
    
    -- Campos JSON
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'modulosContato', 'JSONB');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'tentativas', 'JSONB');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'protocolos', 'JSONB');
    CALL public.add_column_if_not_exists_ci(schema_name, tbl, 'camposEspecificos', 'JSONB');
    
    RAISE NOTICE '=== Tabela % processada com sucesso ===', tbl;
  END LOOP;
  
  RAISE NOTICE '✅ Todas as colunas foram adicionadas!';
END;
$$;

-- 4) Verificar colunas criadas
DO $$
DECLARE
  tbl text;
  col_count int;
BEGIN
  FOR tbl IN SELECT unnest(array['fichas_bacen','fichas_n2','fichas_chatbot']) LOOP
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = tbl;
    
    RAISE NOTICE 'Tabela % tem % colunas', tbl, col_count;
  END LOOP;
END;
$$;

-- IMPORTANTE: Após executar este script, o PostgREST pode precisar de alguns segundos
-- para atualizar o cache do schema. Se ainda houver erros, aguarde 10-30 segundos
-- e tente novamente, ou reinicie o projeto no Supabase Dashboard.

