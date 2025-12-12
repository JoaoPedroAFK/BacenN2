# 🔐 Configuração Google SSO (Single Sign-On)

## 📋 Pré-requisitos

Para usar o Google SSO, você precisa de um **OAuth 2.0 Client ID** do Google Cloud Console.

⚠️ **IMPORTANTE:** O Service Account que você forneceu é para APIs server-side. Para SSO no frontend, você precisa criar um **OAuth 2.0 Client ID** diferente.

## 🔧 Passos para Configurar

### 1. Criar OAuth 2.0 Client ID

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: `bacen-painel`
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Se for a primeira vez, configure a tela de consentimento OAuth:
   - Tipo: **External** (ou Internal se tiver Google Workspace)
   - Nome do app: **Sistema BACEN Velotax**
   - Email de suporte: seu email
   - Clique em **Save and Continue**
6. Configure os escopos:
   - Adicione: `openid`, `email`, `profile`
   - Clique em **Save and Continue**
7. Adicione usuários de teste (se necessário)
8. Volte para **Credentials** e crie o OAuth Client ID:
   - Tipo: **Web application**
   - Nome: **BACEN Web Client**
   - **Authorized JavaScript origins:**
     - `http://localhost` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção)
   - **Authorized redirect URIs:**
     - `http://localhost` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção)
   - Clique em **Create**
9. **Copie o Client ID** gerado

### 2. Configurar no Sistema

#### Opção A: Via localStorage (Desenvolvimento)

Abra o console do navegador (F12) e execute:

```javascript
localStorage.setItem('GOOGLE_CLIENT_ID', 'SEU_CLIENT_ID_AQUI');
location.reload();
```

#### Opção B: Via Variável Global (Produção)

Adicione no arquivo HTML antes do script `google-sso.js`:

```html
<script>
    window.GOOGLE_CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
</script>
<script src="js/google-sso.js"></script>
```

#### Opção C: Via API Backend (Recomendado para Produção)

Crie um endpoint que retorne o Client ID de forma segura:

```javascript
// No seu backend
app.get('/api/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});
```

E no frontend:

```javascript
// Carregar Client ID do backend
fetch('/api/google-client-id')
    .then(res => res.json())
    .then(data => {
        window.GOOGLE_CLIENT_ID = data.clientId;
        // Inicializar Google SSO
        if (window.googleSSO) {
            window.googleSSO.inicializar();
        }
    });
```

### 3. Configurar no Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - **Name:** `GOOGLE_CLIENT_ID`
   - **Value:** Seu OAuth Client ID
   - **Environment:** Production, Preview, Development

### 4. Atualizar Authorized Origins no Google

Após fazer deploy no Vercel, atualize os **Authorized JavaScript origins** no Google Cloud Console com a URL do seu site:

- `https://seu-projeto.vercel.app`

## ✅ Verificação

Após configurar:

1. Abra o sistema
2. Vá para a tela de login
3. Você deve ver um botão "Sign in with Google"
4. Clique e faça login com sua conta Google
5. O sistema deve criar/atualizar seu usuário automaticamente

## 🔒 Segurança

- **NUNCA** commite o Client ID no código
- Use variáveis de ambiente em produção
- Configure corretamente os **Authorized origins** no Google
- Use HTTPS em produção (obrigatório para OAuth)

## 📚 Documentação

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)

