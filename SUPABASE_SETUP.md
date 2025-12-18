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

### 5. Verificar se as tabelas existem

Se as tabelas não existirem, crie-as com este SQL:

```sql
-- Criar tabela fichas_bacen
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

-- Criar tabela fichas_n2
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

-- Criar tabela fichas_chatbot
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

