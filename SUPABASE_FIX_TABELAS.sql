-- ============================================
-- SCRIPT COMPLETO PARA CORRIGIR TABELAS SUPABASE
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- 1. HABILITAR RLS
ALTER TABLE fichas_bacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_chatbot ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR/ATUALIZAR TABELA fichas_bacen
CREATE TABLE IF NOT EXISTS fichas_bacen (
    id TEXT PRIMARY KEY,
    nomeCliente TEXT,
    nomeCompleto TEXT,
    cpf TEXT,
    cpfTratado TEXT,
    telefone TEXT,
    origem TEXT,
    status TEXT,
    dataCriacao TIMESTAMPTZ,
    dataRecebimento TIMESTAMPTZ,
    finalizadoEm TIMESTAMPTZ,
    responsavel TEXT,
    motivoReduzido TEXT,
    motivoDetalhado TEXT,
    enviarCobranca BOOLEAN,
    observacoes TEXT,
    mes TEXT,
    tipoDemanda TEXT,
    modulosContato JSONB,
    pixLiberado BOOLEAN,
    aceitouLiquidacao BOOLEAN,
    tentativas JSONB,
    protocolos JSONB,
    camposEspecificos JSONB,
    concluido BOOLEAN,
    dataAtualizacao TIMESTAMPTZ,
    _debugLogado BOOLEAN
);

-- Adicionar colunas faltantes em fichas_bacen
DO $$ 
BEGIN
    -- Verificar e adicionar colunas (usando LOWER para case-insensitive)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('nomeCliente')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "nomeCliente" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('nomeCompleto')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "nomeCompleto" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('cpf')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('cpfTratado')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "cpfTratado" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('telefone')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('origem')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN origem TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('status')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('dataCriacao')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "dataCriacao" TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('dataRecebimento')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "dataRecebimento" TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('finalizadoEm')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "finalizadoEm" TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('motivoReduzido')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "motivoReduzido" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('motivoDetalhado')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "motivoDetalhado" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('enviarCobranca')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "enviarCobranca" BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('observacoes')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN observacoes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('tipoDemanda')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "tipoDemanda" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('modulosContato')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "modulosContato" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('pixLiberado')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "pixLiberado" BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('aceitouLiquidacao')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "aceitouLiquidacao" BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('tentativas')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN tentativas JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('protocolos')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN protocolos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('camposEspecificos')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "camposEspecificos" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('concluido')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN concluido BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('dataAtualizacao')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "dataAtualizacao" TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND LOWER(column_name)=LOWER('_debugLogado')) THEN
        ALTER TABLE fichas_bacen ADD COLUMN "_debugLogado" BOOLEAN;
    END IF;
END $$;

-- 3. CRIAR/ATUALIZAR TABELA fichas_n2
CREATE TABLE IF NOT EXISTS fichas_n2 (
    id TEXT PRIMARY KEY,
    nomeCliente TEXT,
    nomeCompleto TEXT,
    cpf TEXT,
    cpfTratado TEXT,
    telefone TEXT,
    origem TEXT,
    status TEXT,
    dataCriacao TIMESTAMPTZ,
    dataRecebimento TIMESTAMPTZ,
    finalizadoEm TIMESTAMPTZ,
    responsavel TEXT,
    motivoReduzido TEXT,
    motivoDetalhado TEXT,
    enviarCobranca BOOLEAN,
    observacoes TEXT,
    mes TEXT,
    tipoDemanda TEXT,
    modulosContato JSONB,
    pixLiberado BOOLEAN,
    aceitouLiquidacao BOOLEAN,
    tentativas JSONB,
    protocolos JSONB,
    camposEspecificos JSONB,
    concluido BOOLEAN,
    dataAtualizacao TIMESTAMPTZ,
    _debugLogado BOOLEAN
);

-- Adicionar colunas faltantes em fichas_n2 (mesmo processo)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='nomeCliente') THEN
        ALTER TABLE fichas_n2 ADD COLUMN nomeCliente TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='nomeCompleto') THEN
        ALTER TABLE fichas_n2 ADD COLUMN nomeCompleto TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='cpf') THEN
        ALTER TABLE fichas_n2 ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='cpfTratado') THEN
        ALTER TABLE fichas_n2 ADD COLUMN cpfTratado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='telefone') THEN
        ALTER TABLE fichas_n2 ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='origem') THEN
        ALTER TABLE fichas_n2 ADD COLUMN origem TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='status') THEN
        ALTER TABLE fichas_n2 ADD COLUMN status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='dataCriacao') THEN
        ALTER TABLE fichas_n2 ADD COLUMN dataCriacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='dataRecebimento') THEN
        ALTER TABLE fichas_n2 ADD COLUMN dataRecebimento TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='finalizadoEm') THEN
        ALTER TABLE fichas_n2 ADD COLUMN finalizadoEm TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='motivoReduzido') THEN
        ALTER TABLE fichas_n2 ADD COLUMN motivoReduzido TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='motivoDetalhado') THEN
        ALTER TABLE fichas_n2 ADD COLUMN motivoDetalhado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='enviarCobranca') THEN
        ALTER TABLE fichas_n2 ADD COLUMN enviarCobranca BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='observacoes') THEN
        ALTER TABLE fichas_n2 ADD COLUMN observacoes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='tipoDemanda') THEN
        ALTER TABLE fichas_n2 ADD COLUMN tipoDemanda TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='modulosContato') THEN
        ALTER TABLE fichas_n2 ADD COLUMN modulosContato JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='pixLiberado') THEN
        ALTER TABLE fichas_n2 ADD COLUMN pixLiberado BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='aceitouLiquidacao') THEN
        ALTER TABLE fichas_n2 ADD COLUMN aceitouLiquidacao BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='tentativas') THEN
        ALTER TABLE fichas_n2 ADD COLUMN tentativas JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='protocolos') THEN
        ALTER TABLE fichas_n2 ADD COLUMN protocolos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='camposEspecificos') THEN
        ALTER TABLE fichas_n2 ADD COLUMN camposEspecificos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='concluido') THEN
        ALTER TABLE fichas_n2 ADD COLUMN concluido BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='dataAtualizacao') THEN
        ALTER TABLE fichas_n2 ADD COLUMN dataAtualizacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='_debugLogado') THEN
        ALTER TABLE fichas_n2 ADD COLUMN _debugLogado BOOLEAN;
    END IF;
END $$;

-- 4. CRIAR/ATUALIZAR TABELA fichas_chatbot
CREATE TABLE IF NOT EXISTS fichas_chatbot (
    id TEXT PRIMARY KEY,
    nomeCliente TEXT,
    nomeCompleto TEXT,
    cpf TEXT,
    cpfTratado TEXT,
    telefone TEXT,
    origem TEXT,
    status TEXT,
    dataCriacao TIMESTAMPTZ,
    dataRecebimento TIMESTAMPTZ,
    finalizadoEm TIMESTAMPTZ,
    responsavel TEXT,
    motivoReduzido TEXT,
    motivoDetalhado TEXT,
    enviarCobranca BOOLEAN,
    observacoes TEXT,
    mes TEXT,
    tipoDemanda TEXT,
    modulosContato JSONB,
    pixLiberado BOOLEAN,
    aceitouLiquidacao BOOLEAN,
    tentativas JSONB,
    protocolos JSONB,
    camposEspecificos JSONB,
    concluido BOOLEAN,
    dataAtualizacao TIMESTAMPTZ,
    _debugLogado BOOLEAN
);

-- Adicionar colunas faltantes em fichas_chatbot (mesmo processo)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='nomeCliente') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN nomeCliente TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='nomeCompleto') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN nomeCompleto TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='cpf') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='cpfTratado') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN cpfTratado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='telefone') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='origem') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN origem TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='status') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='dataCriacao') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN dataCriacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='dataRecebimento') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN dataRecebimento TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='finalizadoEm') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN finalizadoEm TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='motivoReduzido') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN motivoReduzido TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='motivoDetalhado') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN motivoDetalhado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='enviarCobranca') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN enviarCobranca BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='observacoes') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN observacoes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='tipoDemanda') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN tipoDemanda TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='modulosContato') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN modulosContato JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='pixLiberado') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN pixLiberado BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='aceitouLiquidacao') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN aceitouLiquidacao BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='tentativas') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN tentativas JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='protocolos') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN protocolos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='camposEspecificos') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN camposEspecificos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='concluido') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN concluido BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='dataAtualizacao') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN dataAtualizacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_chatbot' AND column_name='_debugLogado') THEN
        ALTER TABLE fichas_chatbot ADD COLUMN _debugLogado BOOLEAN;
    END IF;
END $$;

-- 5. CRIAR POLÍTICAS RLS (remover duplicatas primeiro se existirem)
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

