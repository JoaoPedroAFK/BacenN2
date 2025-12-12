# 🔐 Configuração SSO Google

## 📋 Status

✅ **Código implementado** - Sistema de SSO Google adicionado ao projeto
⏳ **Aguardando**: Configuração do Google Client ID

## 🔧 Como Configurar

### 1. Obter Google Client ID

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto `bacen-painel` (ou crie um novo)
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Se solicitado, configure a tela de consentimento OAuth
6. Escolha **Web application** como tipo
7. Configure:
   - **Name**: `BACEN Painel SSO`
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção)
   - **Authorized redirect URIs**: 
     - `http://localhost:3000` (para desenvolvimento)
     - `https://seu-dominio.vercel.app` (para produção)
8. Clique em **Create**
9. **Copie o Client ID** (algo como: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### 2. Configurar no Código

**Opção A: Via Variável Global (Recomendado para Vercel)**

No Vercel, adicione a variável de ambiente:
- **Nome**: `GOOGLE_CLIENT_ID`
- **Valor**: Seu Client ID do Google

E adicione este script antes do `google-sso.js`:

```html
<script>
    window.GOOGLE_CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
</script>
```

**Opção B: Editar Diretamente o Arquivo**

Edite `js/google-sso.js` e substitua:
```javascript
this.clientId = window.GOOGLE_CLIENT_ID || 'SEU_GOOGLE_CLIENT_ID_AQUI';
```

Por:
```javascript
this.clientId = window.GOOGLE_CLIENT_ID || 'SEU_CLIENT_ID_REAL_AQUI';
```

### 3. Emails Autorizados

Por padrão, o sistema autoriza:
- Todos os emails do domínio `@velotax.com` e `@velotax.com.br`
- Emails específicos configurados no código

Para adicionar mais emails, edite a função `verificarEmailAutorizado()` em `js/google-sso.js`.

## 🚀 Como Funciona

1. Usuário clica no botão "Sign in with Google"
2. Google exibe tela de seleção de conta
3. Usuário seleciona conta e autoriza
4. Google retorna um token JWT
5. Sistema valida o token e extrai informações do usuário
6. Sistema verifica se o email está autorizado
7. Sistema cria sessão do usuário
8. Usuário é redirecionado para o sistema

## 🔒 Segurança

- ✅ Validação de email autorizado
- ✅ Verificação de domínio
- ✅ Tokens JWT do Google
- ⚠️ **IMPORTANTE**: Em produção, a validação do token deve ser feita no backend

## 📝 Notas

- O Service Account fornecido é para acesso a APIs do Google (Sheets, etc.)
- Para SSO, é necessário um **OAuth Client ID** (diferente do Service Account)
- O Client ID é público e seguro de expor no frontend
- A validação do token em produção deve ser feita no backend para maior segurança

## 🐛 Troubleshooting

**Problema: Botão do Google não aparece**
- Verifique se o Client ID está configurado
- Verifique o console do navegador para erros
- Certifique-se de que o script `google-sso.js` está carregado

**Problema: "Email não autorizado"**
- Verifique se o email está na lista de autorizados
- Verifique se o domínio está correto (@velotax.com)

**Problema: Erro ao fazer login**
- Verifique se as origens autorizadas estão configuradas no Google Cloud Console
- Verifique se o Client ID está correto

