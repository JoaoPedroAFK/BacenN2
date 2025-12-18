-- ============================================
-- SCRIPT CORRIGIDO PARA SUPABASE
-- Versão que ignora colunas já existentes
-- ============================================

-- 1. HABILITAR RLS
ALTER TABLE IF EXISTS fichas_bacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fichas_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fichas_chatbot ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÃO AUXILIAR PARA ADICIONAR COLUNAS (ignora se já existir)
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_type TEXT
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = add_column_if_not_exists.table_name
        AND LOWER(column_name) = LOWER(add_column_if_not_exists.column_name)
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
            add_column_if_not_exists.table_name, 
            add_column_if_not_exists.column_name, 
            add_column_if_not_exists.column_type);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TABELAS SE NÃO EXISTIREM
CREATE TABLE IF NOT EXISTS fichas_bacen (
    id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS fichas_n2 (
    id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS fichas_chatbot (
    id TEXT PRIMARY KEY
);

-- 4. ADICIONAR TODAS AS COLUNAS NECESSÁRIAS (ignora se já existirem)
SELECT add_column_if_not_exists('fichas_bacen', 'nomeCliente', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'nomeCompleto', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'cpf', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'cpfTratado', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'telefone', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'origem', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'status', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'dataCriacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_bacen', 'dataRecebimento', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_bacen', 'finalizadoEm', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_bacen', 'responsavel', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'motivoReduzido', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'motivoDetalhado', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'enviarCobranca', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_bacen', 'observacoes', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'mes', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'tipoDemanda', 'TEXT');
SELECT add_column_if_not_exists('fichas_bacen', 'modulosContato', 'JSONB');
SELECT add_column_if_not_exists('fichas_bacen', 'pixLiberado', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_bacen', 'aceitouLiquidacao', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_bacen', 'tentativas', 'JSONB');
SELECT add_column_if_not_exists('fichas_bacen', 'protocolos', 'JSONB');
SELECT add_column_if_not_exists('fichas_bacen', 'camposEspecificos', 'JSONB');
SELECT add_column_if_not_exists('fichas_bacen', 'concluido', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_bacen', 'dataAtualizacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_bacen', '_debugLogado', 'BOOLEAN');

-- Para fichas_n2
SELECT add_column_if_not_exists('fichas_n2', 'nomeCliente', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'nomeCompleto', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'cpf', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'cpfTratado', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'telefone', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'origem', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'status', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'dataCriacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_n2', 'dataRecebimento', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_n2', 'finalizadoEm', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_n2', 'responsavel', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'motivoReduzido', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'motivoDetalhado', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'enviarCobranca', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_n2', 'observacoes', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'mes', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'tipoDemanda', 'TEXT');
SELECT add_column_if_not_exists('fichas_n2', 'modulosContato', 'JSONB');
SELECT add_column_if_not_exists('fichas_n2', 'pixLiberado', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_n2', 'aceitouLiquidacao', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_n2', 'tentativas', 'JSONB');
SELECT add_column_if_not_exists('fichas_n2', 'protocolos', 'JSONB');
SELECT add_column_if_not_exists('fichas_n2', 'camposEspecificos', 'JSONB');
SELECT add_column_if_not_exists('fichas_n2', 'concluido', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_n2', 'dataAtualizacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_n2', '_debugLogado', 'BOOLEAN');

-- Para fichas_chatbot
SELECT add_column_if_not_exists('fichas_chatbot', 'nomeCliente', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'nomeCompleto', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'cpf', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'cpfTratado', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'telefone', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'origem', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'status', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'dataCriacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_chatbot', 'dataRecebimento', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_chatbot', 'finalizadoEm', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_chatbot', 'responsavel', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'motivoReduzido', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'motivoDetalhado', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'enviarCobranca', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_chatbot', 'observacoes', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'mes', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'tipoDemanda', 'TEXT');
SELECT add_column_if_not_exists('fichas_chatbot', 'modulosContato', 'JSONB');
SELECT add_column_if_not_exists('fichas_chatbot', 'pixLiberado', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_chatbot', 'aceitouLiquidacao', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_chatbot', 'tentativas', 'JSONB');
SELECT add_column_if_not_exists('fichas_chatbot', 'protocolos', 'JSONB');
SELECT add_column_if_not_exists('fichas_chatbot', 'camposEspecificos', 'JSONB');
SELECT add_column_if_not_exists('fichas_chatbot', 'concluido', 'BOOLEAN');
SELECT add_column_if_not_exists('fichas_chatbot', 'dataAtualizacao', 'TIMESTAMPTZ');
SELECT add_column_if_not_exists('fichas_chatbot', '_debugLogado', 'BOOLEAN');

-- 5. REMOVER POLÍTICAS DUPLICADAS E CRIAR NOVAS
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

-- Criar políticas únicas para fichas_bacen
CREATE POLICY "Permitir leitura pública" ON fichas_bacen FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_bacen FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_bacen FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_bacen FOR DELETE USING (true);

-- Criar políticas únicas para fichas_n2
CREATE POLICY "Permitir leitura pública" ON fichas_n2 FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_n2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_n2 FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_n2 FOR DELETE USING (true);

-- Criar políticas únicas para fichas_chatbot
CREATE POLICY "Permitir leitura pública" ON fichas_chatbot FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_chatbot FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_chatbot FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_chatbot FOR DELETE USING (true);

-- 6. LIMPAR FUNÇÃO AUXILIAR (opcional)
-- DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT);

