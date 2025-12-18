-- ============================================
-- SCRIPT FINAL CORRIGIDO PARA SUPABASE
-- Baseado na solução do assistente do Supabase
-- ============================================

-- 1) Função auxiliar: verifica se coluna existe (case-insensitive)
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

-- 2) Procedure para adicionar coluna apenas se não existir (case-insensitive)
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
      p_schema, p_table, p_column,
      p_type,
      CASE WHEN p_nullable THEN '' ELSE 'NOT NULL' END
    );

    -- Definir default APÓS adicionar se fornecido
    IF p_default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s',
        p_schema, p_table, p_column, p_default);
    END IF;
  ELSE
    RAISE NOTICE 'Coluna %.% já existe (case-insensitive) na tabela %.%', p_schema, p_column, p_schema, p_table;
  END IF;
END;
$$;

-- 3) Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS fichas_bacen (
    id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS fichas_n2 (
    id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS fichas_chatbot (
    id TEXT PRIMARY KEY
);

-- 4) Adicionar todas as colunas necessárias usando a procedure
DO $$
DECLARE
  schema_name text := 'public';
BEGIN
  -- ===== FICHAS_BACEN =====
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'nomeCliente', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'nomeCompleto', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'cpf', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'cpfTratado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'telefone', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'origem', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'status', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'dataCriacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'dataRecebimento', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'finalizadoEm', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'responsavel', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'motivoReduzido', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'motivoDetalhado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'enviarCobranca', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'observacoes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'mes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'tipoDemanda', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'modulosContato', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'pixLiberado', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'aceitouLiquidacao', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'tentativas', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'protocolos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'camposEspecificos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'concluido', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', 'dataAtualizacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_bacen', '_debugLogado', 'boolean');

  -- ===== FICHAS_N2 =====
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'nomeCliente', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'nomeCompleto', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'cpf', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'cpfTratado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'telefone', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'origem', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'status', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'dataCriacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'dataRecebimento', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'finalizadoEm', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'responsavel', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'motivoReduzido', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'motivoDetalhado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'enviarCobranca', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'observacoes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'mes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'tipoDemanda', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'modulosContato', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'pixLiberado', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'aceitouLiquidacao', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'tentativas', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'protocolos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'camposEspecificos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'concluido', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', 'dataAtualizacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_n2', '_debugLogado', 'boolean');

  -- ===== FICHAS_CHATBOT =====
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'nomeCliente', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'nomeCompleto', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'cpf', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'cpfTratado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'telefone', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'origem', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'status', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'dataCriacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'dataRecebimento', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'finalizadoEm', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'responsavel', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'motivoReduzido', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'motivoDetalhado', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'enviarCobranca', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'observacoes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'mes', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'tipoDemanda', 'text');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'modulosContato', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'pixLiberado', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'aceitouLiquidacao', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'tentativas', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'protocolos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'camposEspecificos', 'jsonb');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'concluido', 'boolean');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', 'dataAtualizacao', 'timestamptz');
  CALL public.add_column_if_not_exists_ci(schema_name, 'fichas_chatbot', '_debugLogado', 'boolean');
END;
$$;

-- 5) Habilitar RLS nas tabelas
ALTER TABLE IF EXISTS fichas_bacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fichas_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fichas_chatbot ENABLE ROW LEVEL SECURITY;

-- 6) Remover políticas duplicadas existentes
DROP POLICY IF EXISTS "Permitir leitura pública" ON fichas_bacen;
DROP POLICY IF EXISTS "Permitir inserção pública" ON fichas_bacen;
DROP POLICY IF EXISTS "Permitir atualização pública" ON fichas_bacen;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON fichas_bacen;
DROP POLICY IF EXISTS "Permitir exclusão anônima fichas_bacen" ON fichas_bacen;

DROP POLICY IF EXISTS "Permitir leitura pública" ON fichas_n2;
DROP POLICY IF EXISTS "Permitir inserção pública" ON fichas_n2;
DROP POLICY IF EXISTS "Permitir atualização pública" ON fichas_n2;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON fichas_n2;

DROP POLICY IF EXISTS "Permitir leitura pública" ON fichas_chatbot;
DROP POLICY IF EXISTS "Permitir inserção pública" ON fichas_chatbot;
DROP POLICY IF EXISTS "Permitir atualização pública" ON fichas_chatbot;
DROP POLICY IF EXISTS "Permitir exclusão pública" ON fichas_chatbot;

-- 7) Criar políticas RLS públicas (acesso para todos - anon e authenticated)
-- NOTA: Para produção, considere adicionar autenticação específica

-- Políticas para fichas_bacen
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Permitir leitura pública" ON fichas_bacen FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir leitura pública" já existe em fichas_bacen, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir inserção pública" ON fichas_bacen FOR INSERT WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir inserção pública" já existe em fichas_bacen, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir atualização pública" ON fichas_bacen FOR UPDATE USING (true) WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir atualização pública" já existe em fichas_bacen, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir exclusão pública" ON fichas_bacen FOR DELETE USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir exclusão pública" já existe em fichas_bacen, ignorando...';
  END;
END;
$$;

-- Políticas para fichas_n2
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Permitir leitura pública" ON fichas_n2 FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir leitura pública" já existe em fichas_n2, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir inserção pública" ON fichas_n2 FOR INSERT WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir inserção pública" já existe em fichas_n2, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir atualização pública" ON fichas_n2 FOR UPDATE USING (true) WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir atualização pública" já existe em fichas_n2, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir exclusão pública" ON fichas_n2 FOR DELETE USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir exclusão pública" já existe em fichas_n2, ignorando...';
  END;
END;
$$;

-- Políticas para fichas_chatbot
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Permitir leitura pública" ON fichas_chatbot FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir leitura pública" já existe em fichas_chatbot, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir inserção pública" ON fichas_chatbot FOR INSERT WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir inserção pública" já existe em fichas_chatbot, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir atualização pública" ON fichas_chatbot FOR UPDATE USING (true) WITH CHECK (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir atualização pública" já existe em fichas_chatbot, ignorando...';
  END;

  BEGIN
    CREATE POLICY "Permitir exclusão pública" ON fichas_chatbot FOR DELETE USING (true);
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Política "Permitir exclusão pública" já existe em fichas_chatbot, ignorando...';
  END;
END;
$$;

-- 8) Limpar funções auxiliares (opcional - comente se quiser manter)
-- DROP FUNCTION IF EXISTS public.column_exists_ci(text, text, text);
-- DROP PROCEDURE IF EXISTS public.add_column_if_not_exists_ci(text, text, text, text, text, boolean);

