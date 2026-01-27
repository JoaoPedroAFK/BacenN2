# 🚀 Deploy do Backend VeloHub no Supabase

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Opções de Deploy no Supabase

O Supabase oferece duas opções principais para hospedar aplicações Node.js:

1. **Supabase Edge Functions** (Deno) - Para funções serverless
2. **Supabase Projects** com Docker - Para aplicações completas

Para um backend Express completo, recomendamos usar **Docker** ou considerar **Supabase Projects** com configuração customizada.

## 🔧 Opção 1: Supabase Projects (Recomendado)

### Pré-requisitos

1. Conta no Supabase: https://supabase.com
2. CLI do Supabase instalado: `npm install -g supabase`

### Passo 1: Instalar Supabase CLI

```powershell
npm install -g supabase
```

### Passo 2: Login no Supabase

```powershell
supabase login
```

### Passo 3: Criar Projeto no Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Crie um novo projeto
3. Anote o **Project URL** e **API Key**

### Passo 4: Configurar Variáveis de Ambiente

No dashboard do Supabase, vá em **Settings > Environment Variables** e configure:

```env
MONGO_ENV=sua_uri_mongodb
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_gemini
WHATSAPP_API_URL=https://sua-api-baileys.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net
CORS_ORIGIN=https://seu-frontend.com
```

## 🐳 Opção 2: Docker no Supabase (Alternativa)

### Criar Dockerfile para Supabase

Crie um arquivo `Dockerfile.supabase` na raiz do projeto:

```dockerfile
# Dockerfile para Supabase - VeloHub Backend
# VERSION: v1.0.0 | DATE: 2025-01-23

FROM node:18-alpine

WORKDIR /app

# Instalar dependências do backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código do backend
COPY backend/ ./

# Expor porta (Supabase usa PORT dinâmica)
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar o servidor
CMD ["node", "server.js"]
```

### Build e Deploy

```powershell
# Build da imagem
docker build -f Dockerfile.supabase -t velohub-backend .

# Tag para Supabase (ajuste com seu registry)
docker tag velohub-backend your-registry/velohub-backend:latest

# Push para registry
docker push your-registry/velohub-backend:latest
```

## 🔄 Opção 3: Usar Supabase Edge Functions (Para APIs Específicas)

Se você quiser migrar endpoints específicos para Edge Functions:

### Estrutura de Edge Function

```
supabase/
  functions/
    api/
      index.ts
```

### Exemplo de Edge Function

```typescript
// supabase/functions/api/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Sua lógica aqui
    const data = { message: 'Hello from Supabase Edge Function' }
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

## 📝 Configuração Recomendada

### 1. Usar Supabase Database (Opcional)

Se quiser migrar do MongoDB para PostgreSQL do Supabase:

1. Criar schema no Supabase
2. Migrar dados
3. Atualizar conexão no `backend/config.js`

### 2. Configurar CORS

No `backend/server.js`, adicione o domínio do Supabase:

```javascript
app.use(cors({
  origin: [
    'https://seu-projeto.supabase.co',
    'https://app.velohub.velotax.com.br',
    // ... outros
  ],
  credentials: true
}));
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env.supabase`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key
MONGO_ENV=sua_uri_mongodb
# ... outras variáveis
```

## 🚀 Deploy Manual (Alternativa Simples)

Se o Supabase não suportar Docker diretamente, você pode:

1. **Usar Railway/Render com Supabase Database:**
   - Deploy do backend no Railway/Render
   - Conectar ao Supabase Database
   - Usar Supabase Auth, Storage, etc.

2. **Usar Vercel/Netlify Functions:**
   - Converter endpoints para serverless functions
   - Conectar ao Supabase

## 📚 Recursos do Supabase

- **Database:** PostgreSQL gerenciado
- **Auth:** Autenticação pronta
- **Storage:** Armazenamento de arquivos
- **Edge Functions:** Funções serverless (Deno)
- **Realtime:** WebSockets para tempo real

## ⚠️ Limitações

- Supabase Edge Functions usam **Deno**, não Node.js
- Para Express completo, considere Docker ou hospedagem alternativa
- Supabase Projects podem ter limites de recursos

## 🔗 Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
