-- ============================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS NO SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Acesse: https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/sql/new

-- ============================================
-- TABELA: fichas_bacen
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_bacen (
    id TEXT PRIMARY KEY,
    tipoDemanda TEXT DEFAULT 'bacen',
    dataEntrada DATE,
    responsavel TEXT,
    mes TEXT,
    nomeCompleto TEXT,
    cpf TEXT,
    telefone TEXT,
    origem TEXT,
    motivoReduzido TEXT,
    motivoDetalhado TEXT,
    motivoReclamacao TEXT,
    prazoBacen DATE,
    primeiraTentativa DATE,
    segundaTentativa DATE,
    acionouCentral BOOLEAN DEFAULT false,
    reclameAqui BOOLEAN DEFAULT false,
    bacen BOOLEAN DEFAULT false,
    procon BOOLEAN DEFAULT false,
    pixLiberado TEXT,
    liquidacaoAntecipada BOOLEAN DEFAULT false,
    casosCriticos BOOLEAN DEFAULT false,
    enviarCobranca TEXT,
    status TEXT,
    finalizadoEm DATE,
    observacoes TEXT,
    anexos JSONB DEFAULT '[]'::jsonb,
    dataCriacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criadoPor TEXT,
    ultimaAlteracaoPor TEXT
);

-- ============================================
-- TABELA: fichas_n2
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_n2 (
    id TEXT PRIMARY KEY,
    tipoDemanda TEXT DEFAULT 'n2',
    dataEntradaAtendimento DATE,
    dataEntradaN2 DATE,
    responsavel TEXT,
    mes TEXT,
    nomeCompleto TEXT,
    cpf TEXT,
    telefone TEXT,
    origem TEXT,
    motivoReduzido TEXT,
    motivoDetalhado TEXT,
    motivoReclamacao TEXT,
    prazoN2 DATE,
    primeiraTentativa DATE,
    segundaTentativa DATE,
    acionouCentral BOOLEAN DEFAULT false,
    protocoloCentral TEXT,
    n2SegundoNivel BOOLEAN DEFAULT false,
    protocoloN2 TEXT,
    reclameAqui BOOLEAN DEFAULT false,
    protocoloReclameAqui TEXT,
    procon BOOLEAN DEFAULT false,
    protocoloProcon TEXT,
    protocolosNaoAcionados TEXT,
    n2Portabilidade BOOLEAN DEFAULT false,
    n2ConseguiuContato BOOLEAN DEFAULT false,
    pixLiberado TEXT,
    casosCriticos BOOLEAN DEFAULT false,
    enviarCobranca TEXT,
    status TEXT,
    finalizadoEm DATE,
    observacoes TEXT,
    anexos JSONB DEFAULT '[]'::jsonb,
    dataCriacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criadoPor TEXT,
    ultimaAlteracaoPor TEXT
);

-- ============================================
-- TABELA: fichas_chatbot
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_chatbot (
    id TEXT PRIMARY KEY,
    tipoDemanda TEXT DEFAULT 'chatbot',
    dataClienteChatbot DATE,
    cpf TEXT,
    notaAvaliacao TEXT,
    avaliacaoCliente TEXT,
    produto TEXT,
    motivo TEXT,
    respostaBot TEXT,
    pixLiberado TEXT,
    enviarCobranca TEXT,
    casosCriticos BOOLEAN DEFAULT false,
    finalizacao TEXT,
    responsavel TEXT,
    observacoes TEXT,
    anexos JSONB DEFAULT '[]'::jsonb,
    dataCriacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criadoPor TEXT,
    ultimaAlteracaoPor TEXT
);

-- ============================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_fichas_bacen_cpf ON fichas_bacen(cpf);
CREATE INDEX IF NOT EXISTS idx_fichas_bacen_status ON fichas_bacen(status);
CREATE INDEX IF NOT EXISTS idx_fichas_bacen_dataCriacao ON fichas_bacen(dataCriacao);
CREATE INDEX IF NOT EXISTS idx_fichas_bacen_responsavel ON fichas_bacen(responsavel);

CREATE INDEX IF NOT EXISTS idx_fichas_n2_cpf ON fichas_n2(cpf);
CREATE INDEX IF NOT EXISTS idx_fichas_n2_status ON fichas_n2(status);
CREATE INDEX IF NOT EXISTS idx_fichas_n2_dataCriacao ON fichas_n2(dataCriacao);
CREATE INDEX IF NOT EXISTS idx_fichas_n2_responsavel ON fichas_n2(responsavel);

CREATE INDEX IF NOT EXISTS idx_fichas_chatbot_cpf ON fichas_chatbot(cpf);
CREATE INDEX IF NOT EXISTS idx_fichas_chatbot_dataCriacao ON fichas_chatbot(dataCriacao);
CREATE INDEX IF NOT EXISTS idx_fichas_chatbot_responsavel ON fichas_chatbot(responsavel);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================
-- Habilitar RLS nas tabelas
ALTER TABLE fichas_bacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_chatbot ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura para todos (anon key)
CREATE POLICY "Permitir leitura anônima fichas_bacen" ON fichas_bacen
    FOR SELECT USING (true);

CREATE POLICY "Permitir leitura anônima fichas_n2" ON fichas_n2
    FOR SELECT USING (true);

CREATE POLICY "Permitir leitura anônima fichas_chatbot" ON fichas_chatbot
    FOR SELECT USING (true);

-- Política: Permitir inserção para todos (anon key)
CREATE POLICY "Permitir inserção anônima fichas_bacen" ON fichas_bacen
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção anônima fichas_n2" ON fichas_n2
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção anônima fichas_chatbot" ON fichas_chatbot
    FOR INSERT WITH CHECK (true);

-- Política: Permitir atualização para todos (anon key)
CREATE POLICY "Permitir atualização anônima fichas_bacen" ON fichas_bacen
    FOR UPDATE USING (true);

CREATE POLICY "Permitir atualização anônima fichas_n2" ON fichas_n2
    FOR UPDATE USING (true);

CREATE POLICY "Permitir atualização anônima fichas_chatbot" ON fichas_chatbot
    FOR UPDATE USING (true);

-- Política: Permitir exclusão para todos (anon key)
CREATE POLICY "Permitir exclusão anônima fichas_bacen" ON fichas_bacen
    FOR DELETE USING (true);

CREATE POLICY "Permitir exclusão anônima fichas_n2" ON fichas_n2
    FOR DELETE USING (true);

CREATE POLICY "Permitir exclusão anônima fichas_chatbot" ON fichas_chatbot
    FOR DELETE USING (true);

-- ============================================
-- FUNÇÃO PARA ATUALIZAR dataAtualizacao AUTOMATICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dataAtualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar dataAtualizacao
CREATE TRIGGER trigger_atualizar_bacen
    BEFORE UPDATE ON fichas_bacen
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER trigger_atualizar_n2
    BEFORE UPDATE ON fichas_n2
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER trigger_atualizar_chatbot
    BEFORE UPDATE ON fichas_chatbot
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar se as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'fichas_%';

