# 🚀 Deploy Backend VeloHub - Supabase + Railway

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Estratégia Recomendada

Como o Supabase não hospeda aplicações Express completas, usaremos:

- **Supabase:** Database, Auth, Storage
- **Railway/Render:** Backend Express Node.js

## 🔧 Passo 1: Configurar Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse: https://app.supabase.com
2. Crie um novo projeto
3. Anote:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** `eyJhbGc...`
   - **Service Role Key:** `eyJhbGc...`

### 1.2 Configurar Database (Opcional - se migrar do MongoDB)

Se quiser usar PostgreSQL do Supabase:

```sql
-- Criar tabelas necessárias no Supabase SQL Editor
-- (Adaptar conforme seu schema MongoDB)
```

## 🚂 Passo 2: Deploy no Railway (Recomendado)

### 2.1 Criar Conta no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Crie um novo projeto

### 2.2 Conectar Repositório

1. No Railway, clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Escolha o repositório do VeloHub
4. Selecione a pasta `backend`

### 2.3 Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=8080

# MongoDB (ou Supabase Database)
MONGO_ENV=sua_uri_mongodb
# OU
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret

# APIs de IA
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_gemini

# WhatsApp
WHATSAPP_API_URL=https://sua-api-baileys.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net

# CORS
CORS_ORIGIN=https://seu-frontend.com
```

### 2.4 Configurar Build

Railway detecta automaticamente Node.js. Certifique-se de que:

- `backend/package.json` existe
- Script `start` está definido: `"start": "node server.js"`

### 2.5 Deploy

Railway fará deploy automaticamente ao fazer push no GitHub.

## 🎨 Passo 3: Deploy no Render (Alternativa)

### 3.1 Criar Conta no Render

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em **New +** > **Web Service**

### 3.2 Configurar Serviço

- **Name:** `velohub-backend`
- **Environment:** `Node`
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Root Directory:** `backend`

### 3.3 Variáveis de Ambiente

Adicione as mesmas variáveis do passo 2.3

### 3.4 Deploy

Render fará deploy automaticamente.

## 🔗 Passo 4: Integrar com Supabase

### 4.1 Instalar Cliente Supabase (Opcional)

Se quiser usar Supabase Database:

```powershell
cd backend
npm install @supabase/supabase-js
```

### 4.2 Criar Serviço Supabase

Crie `backend/services/supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client inicializado');
} else {
  console.warn('⚠️ Supabase não configurado. Usando MongoDB.');
}

module.exports = supabase;
```

### 4.3 Atualizar Config

Em `backend/config.js`, adicione:

```javascript
SUPABASE_URL: process.env.SUPABASE_URL,
SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
```

## 📝 Passo 5: Atualizar CORS

No `backend/server.js`, adicione o domínio do Railway/Render:

```javascript
app.use(cors({
  origin: [
    'https://velohub-backend.railway.app', // Railway
    // OU
    'https://velohub-backend.onrender.com', // Render
    'https://app.velohub.velotax.com.br',
    'http://localhost:8080',
    // ... outros
  ],
  credentials: true
}));
```

## 🧪 Passe 6: Testar Deploy

### 6.1 Verificar Health Check

```bash
curl https://seu-backend.railway.app/api/test
```

### 6.2 Testar Endpoint de Relatórios

```bash
curl https://seu-backend.railway.app/api/escalacoes/reports/test
```

## 🔐 Passo 7: Configurar Domínio Customizado (Opcional)

### Railway

1. No projeto Railway, vá em **Settings**
2. Clique em **Domains**
3. Adicione seu domínio customizado
4. Configure DNS conforme instruções

### Render

1. No serviço Render, vá em **Settings**
2. Clique em **Custom Domain**
3. Adicione seu domínio
4. Configure DNS

## 📊 Monitoramento

### Railway

- Logs em tempo real no dashboard
- Métricas de CPU, RAM, Network
- Alertas configuráveis

### Render

- Logs em tempo real
- Métricas básicas
- Status page automático

## 🔄 CI/CD Automático

Ambos Railway e Render fazem deploy automático ao fazer push no GitHub.

## 💰 Custos

### Railway

- **Free Tier:** $5 crédito/mês
- **Pro:** $20/mês (mais recursos)

### Render

- **Free Tier:** Disponível (com limitações)
- **Starter:** $7/mês por serviço

## ⚠️ Notas Importantes

1. **MongoDB vs Supabase:** Você pode continuar usando MongoDB ou migrar para PostgreSQL do Supabase
2. **Variáveis Sensíveis:** Use sempre variáveis de ambiente, nunca hardcode
3. **CORS:** Configure corretamente para permitir requisições do frontend
4. **Porta:** Railway/Render definem PORT automaticamente, não precisa configurar

## 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
