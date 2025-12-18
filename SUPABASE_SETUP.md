# 🔧 Configuração do Supabase - POLÍTICAS RLS

## ⚠️ PROBLEMA ATUAL
Os dados estão sendo salvos no Supabase, mas não estão sendo carregados porque as **políticas RLS (Row Level Security)** estão bloqueando a leitura.

## ✅ SOLUÇÃO: Configurar Políticas RLS

### 1. Acesse o Dashboard do Supabase
https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk

### 2. Vá para Authentication > Policies

### 3. Para cada tabela (`fichas_bacen`, `fichas_n2`, `fichas_chatbot`):

#### 3.1. Clique na tabela no menu lateral (Table Editor)

#### 3.2. Vá na aba "Policies" (ou "RLS")

#### 3.3. Certifique-se que RLS está **HABILITADO**

#### 3.4. Crie as seguintes políticas:

#### **Política 1: Permitir SELECT (Leitura) para todos**
- **Nome:** `Permitir leitura pública`
- **Tipo:** `SELECT`
- **Target roles:** `anon`, `authenticated`
- **USING expression:** `true`
- **WITH CHECK expression:** (deixe vazio)

#### **Política 2: Permitir INSERT (Inserção) para todos**
- **Nome:** `Permitir inserção pública`
- **Tipo:** `INSERT`
- **Target roles:** `anon`, `authenticated`
- **USING expression:** (deixe vazio)
- **WITH CHECK expression:** `true`

#### **Política 3: Permitir UPDATE (Atualização) para todos**
- **Nome:** `Permitir atualização pública`
- **Tipo:** `UPDATE`
- **Target roles:** `anon`, `authenticated`
- **USING expression:** `true`
- **WITH CHECK expression:** `true`

#### **Política 4: Permitir DELETE (Exclusão) para todos**
- **Nome:** `Permitir exclusão pública`
- **Tipo:** `DELETE`
- **Target roles:** `anon`, `authenticated`
- **USING expression:** `true`
- **WITH CHECK expression:** (deixe vazio)

### 4. SQL Alternativo (via SQL Editor)

Se preferir, execute este SQL no SQL Editor:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE fichas_bacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_n2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_chatbot ENABLE ROW LEVEL SECURITY;

-- Políticas para fichas_bacen
CREATE POLICY "Permitir leitura pública" ON fichas_bacen FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_bacen FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_bacen FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_bacen FOR DELETE USING (true);

-- Políticas para fichas_n2
CREATE POLICY "Permitir leitura pública" ON fichas_n2 FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_n2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_n2 FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_n2 FOR DELETE USING (true);

-- Políticas para fichas_chatbot
CREATE POLICY "Permitir leitura pública" ON fichas_chatbot FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública" ON fichas_chatbot FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública" ON fichas_chatbot FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública" ON fichas_chatbot FOR DELETE USING (true);
```

### 5. ⚠️ IMPORTANTE: Verificar estrutura das tabelas

**PROBLEMA:** As tabelas podem ter apenas algumas colunas, mas o código precisa de TODAS as colunas listadas abaixo.

**SOLUÇÃO:** Execute este SQL para criar/atualizar as tabelas com TODAS as colunas necessárias:

```sql
-- ⚠️ IMPORTANTE: Se a tabela já existe, use ALTER TABLE para adicionar colunas faltantes
-- Se não existe, o CREATE TABLE será executado

-- Criar tabela fichas_bacen (se não existir)
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

-- Adicionar colunas faltantes (se a tabela já existe)
DO $$ 
BEGIN
    -- Adicionar colunas que podem não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='nomeCliente') THEN
        ALTER TABLE fichas_bacen ADD COLUMN nomeCliente TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='nomeCompleto') THEN
        ALTER TABLE fichas_bacen ADD COLUMN nomeCompleto TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='cpf') THEN
        ALTER TABLE fichas_bacen ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='cpfTratado') THEN
        ALTER TABLE fichas_bacen ADD COLUMN cpfTratado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='telefone') THEN
        ALTER TABLE fichas_bacen ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='origem') THEN
        ALTER TABLE fichas_bacen ADD COLUMN origem TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='status') THEN
        ALTER TABLE fichas_bacen ADD COLUMN status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='dataCriacao') THEN
        ALTER TABLE fichas_bacen ADD COLUMN dataCriacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='dataRecebimento') THEN
        ALTER TABLE fichas_bacen ADD COLUMN dataRecebimento TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='finalizadoEm') THEN
        ALTER TABLE fichas_bacen ADD COLUMN finalizadoEm TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='motivoReduzido') THEN
        ALTER TABLE fichas_bacen ADD COLUMN motivoReduzido TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='motivoDetalhado') THEN
        ALTER TABLE fichas_bacen ADD COLUMN motivoDetalhado TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='enviarCobranca') THEN
        ALTER TABLE fichas_bacen ADD COLUMN enviarCobranca BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='observacoes') THEN
        ALTER TABLE fichas_bacen ADD COLUMN observacoes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='tipoDemanda') THEN
        ALTER TABLE fichas_bacen ADD COLUMN tipoDemanda TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='modulosContato') THEN
        ALTER TABLE fichas_bacen ADD COLUMN modulosContato JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='pixLiberado') THEN
        ALTER TABLE fichas_bacen ADD COLUMN pixLiberado BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='aceitouLiquidacao') THEN
        ALTER TABLE fichas_bacen ADD COLUMN aceitouLiquidacao BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='tentativas') THEN
        ALTER TABLE fichas_bacen ADD COLUMN tentativas JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='protocolos') THEN
        ALTER TABLE fichas_bacen ADD COLUMN protocolos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='camposEspecificos') THEN
        ALTER TABLE fichas_bacen ADD COLUMN camposEspecificos JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='concluido') THEN
        ALTER TABLE fichas_bacen ADD COLUMN concluido BOOLEAN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='dataAtualizacao') THEN
        ALTER TABLE fichas_bacen ADD COLUMN dataAtualizacao TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_bacen' AND column_name='_debugLogado') THEN
        ALTER TABLE fichas_bacen ADD COLUMN _debugLogado BOOLEAN;
    END IF;
END $$;

-- Criar tabela fichas_n2 (se não existir)
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

-- Adicionar colunas faltantes para fichas_n2 (mesmo processo)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fichas_n2' AND column_name='nomeCliente') THEN
        ALTER TABLE fichas_n2 ADD COLUMN nomeCliente TEXT;
    END IF;
    -- ... (adicionar todas as outras colunas como acima)
END $$;

-- Criar tabela fichas_chatbot (se não existir)
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
```

## 🔍 Verificação

Após configurar, teste:

1. Limpe o cache do navegador
2. Recarregue a página
3. Verifique os logs do console
4. Os dados devem ser carregados do Supabase

## 📝 Notas

- As políticas acima permitem acesso público (anon). Para produção, considere adicionar autenticação.
- Se você quiser restringir acesso, modifique as políticas USING/WITH CHECK expressions.

