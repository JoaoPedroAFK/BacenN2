# 🚀 Deploy Backend VeloHub no Render.com

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Guia Completo de Deploy

Este guia mostra como fazer deploy do backend completo do VeloHub no Render.com.

## 🔧 Passo 1: Preparação

### 1.1 Verificar Estrutura

Certifique-se de que a estrutura está correta:

```
VeloHub/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config.js
│   └── ...
├── render.yaml
└── ...
```

### 1.2 Verificar package.json

O `backend/package.json` deve ter o script `start`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## 🎨 Passo 2: Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **Get Started for Free**
3. Faça login com **GitHub** (recomendado)
4. Autorize o acesso ao repositório

## 🚀 Passo 3: Criar Web Service

### 3.1 Novo Serviço

1. No dashboard do Render, clique em **New +**
2. Selecione **Web Service**
3. Conecte seu repositório GitHub do VeloHub

### 3.2 Configuração Básica

Preencha os campos:

- **Name:** `velohub-backend`
- **Region:** Escolha a região mais próxima (ex: `Oregon (US West)`)
- **Branch:** `main` ou `master` (sua branch principal)
- **Root Directory:** `backend` ⚠️ **IMPORTANTE**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3.3 Configuração Avançada (Opcional)

Se preferir usar o arquivo `render.yaml`:

1. Marque **Use render.yaml**
2. O Render usará automaticamente o `render.yaml` na raiz

## 🔐 Passo 4: Configurar Variáveis de Ambiente

No Render, vá em **Environment** e adicione todas as variáveis:

### Variáveis Obrigatórias

```env
NODE_ENV=production
PORT=8080
```

### Database

```env
MONGO_ENV=sua_uri_mongodb_completa
```

### Google OAuth

```env
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
```

### APIs de IA

```env
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_gemini
```

### WhatsApp

```env
WHATSAPP_API_URL=https://sua-api-baileys.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net
```

### CORS

```env
CORS_ORIGIN=https://seu-frontend.com
```

### Google Sheets (se usar)

```env
GOOGLE_CREDENTIALS={"type":"service_account",...}
CHATBOT_LOG_SHEET_NAME=Log_IA_Usage
CHATBOT_SPREADSHEET_ID=1tnWusrOW-UXHFM8GT3o0Du93QDwv5G3Ylvgebof9wfQ
```

## 📝 Passo 5: Configurar Health Check

No Render, configure:

- **Health Check Path:** `/api/test`
- Isso garante que o Render sabe quando o serviço está saudável

## 🚀 Passo 6: Deploy

1. Clique em **Create Web Service**
2. O Render começará o build automaticamente
3. Aguarde o deploy completar (pode levar 5-10 minutos)

### Monitorar Deploy

- Veja os logs em tempo real
- Verifique se há erros no build
- Confirme que o serviço iniciou corretamente

## ✅ Passo 7: Verificar Deploy

### 7.1 Verificar URL

Após o deploy, você receberá uma URL como:
```
https://velohub-backend.onrender.com
```

### 7.2 Testar Health Check

```bash
curl https://velohub-backend.onrender.com/api/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Servidor funcionando!"
}
```

### 7.3 Testar Endpoint de Relatórios

```bash
curl https://velohub-backend.onrender.com/api/escalacoes/reports/test
```

## 🔄 Passo 8: Configurar Auto-Deploy

O Render já faz auto-deploy por padrão quando você faz push no GitHub.

Para configurar:

1. Vá em **Settings**
2. Em **Auto-Deploy**, certifique-se de que está ativado
3. Escolha a branch (geralmente `main`)

## 🔐 Passo 9: Configurar Domínio Customizado (Opcional)

### 9.1 Adicionar Domínio

1. Vá em **Settings** > **Custom Domains**
2. Clique em **Add Custom Domain**
3. Digite seu domínio (ex: `api.velohub.com`)
4. Siga as instruções de DNS

### 9.2 Configurar DNS

Adicione um registro CNAME no seu provedor DNS:

```
Tipo: CNAME
Nome: api (ou subdomínio desejado)
Valor: velohub-backend.onrender.com
```

## 📊 Passo 10: Monitoramento

### Logs

- Acesse **Logs** no dashboard do Render
- Veja logs em tempo real
- Filtre por nível (Info, Warning, Error)

### Métricas

- **CPU Usage:** Uso de CPU
- **Memory Usage:** Uso de memória
- **Request Count:** Número de requisições
- **Response Time:** Tempo de resposta

## ⚙️ Configurações Avançadas

### Plano de Serviço

- **Free:** Disponível, mas com limitações (sleep após inatividade)
- **Starter ($7/mês):** Sem sleep, mais recursos
- **Standard ($25/mês):** Recursos dedicados

### Escalabilidade

No **Settings** > **Scaling**:

- **Instance Count:** Número de instâncias
- **Auto-Scaling:** Escalar automaticamente

### Health Checks

Configure em **Settings** > **Health Check**:

- **Path:** `/api/test`
- **Interval:** 30 segundos
- **Timeout:** 10 segundos

## 🐛 Troubleshooting

### Problema: Build Falha

**Solução:**
1. Verifique os logs de build
2. Certifique-se de que `backend/package.json` está correto
3. Verifique se todas as dependências estão listadas

### Problema: Serviço Não Inicia

**Solução:**
1. Verifique os logs de runtime
2. Confirme que `PORT` está configurado (Render define automaticamente)
3. Verifique variáveis de ambiente

### Problema: Timeout

**Solução:**
1. Render Free tier tem timeout de 30 segundos
2. Considere upgrade para Starter plan
3. Otimize rotas lentas

### Problema: Sleep Mode (Free Tier)

**Solução:**
- Free tier entra em sleep após 15 minutos de inatividade
- Primeira requisição após sleep pode levar 30-60 segundos
- Upgrade para Starter plan remove sleep

## 📝 Atualizar CORS

Após o deploy, atualize o CORS no `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://velohub-backend.onrender.com', // Render
    'https://app.velohub.velotax.com.br',
    'http://localhost:8080',
    // ... outros
  ],
  credentials: true
}));
```

**Nota:** Faça commit e push para atualizar.

## 🔄 CI/CD Automático

O Render faz deploy automático quando você:

1. Faz push para a branch configurada
2. Faz merge de Pull Request
3. Cria uma nova tag (opcional)

## 💰 Custos

### Free Tier

- ✅ Grátis
- ⚠️ Sleep após 15 min de inatividade
- ⚠️ Limite de recursos

### Starter Plan

- 💵 $7/mês por serviço
- ✅ Sem sleep
- ✅ Mais recursos
- ✅ Melhor performance

## 📚 Recursos Adicionais

- [Render Docs](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Community](https://community.render.com)

## ✅ Checklist de Deploy

- [ ] Conta criada no Render
- [ ] Repositório conectado
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Health check funcionando
- [ ] Testes de endpoints passando
- [ ] CORS configurado
- [ ] Domínio customizado (opcional)
- [ ] Monitoramento ativo

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
