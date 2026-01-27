# ⚙️ Configuração do Render para Vercel

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 🎯 O que precisa ser configurado no Render?

### ✅ **NADA!** - Já está configurado automaticamente

O backend no Render **já está preparado** para aceitar requisições do Vercel automaticamente!

---

## 🔍 Como funciona?

O arquivo `backend/server.js` já contém as seguintes configurações de CORS:

```javascript
app.use(cors({
  origin: [
    /\.vercel\.app$/, // Vercel (qualquer subdomínio)
    /\.vercel\.sh$/, // Vercel preview deployments
    // ... outros
  ],
  credentials: true
}));
```

**Isso significa:**
- ✅ Qualquer domínio `*.vercel.app` será aceito automaticamente
- ✅ Qualquer domínio `*.vercel.sh` (preview deployments) será aceito automaticamente
- ✅ **Não é necessário configurar nada no Render!**

---

## 📋 Checklist Render (Para Vercel)

### ✅ Configurações que JÁ ESTÃO PRONTAS:

- [x] CORS configurado para aceitar `.vercel.app`
- [x] CORS configurado para aceitar `.vercel.sh`
- [x] Credentials habilitado para cookies/sessões

### ⚙️ Configurações OPCIONAIS (Apenas se usar domínio customizado):

Se você usar um domínio customizado no Vercel (ex: `app.velohub.com`), adicione no Render:

**Variável de Ambiente:**
```env
CORS_ORIGIN=https://app.velohub.com
```

**OU** atualize o código `backend/server.js` para incluir seu domínio específico.

---

## 🚀 Próximos Passos

1. ✅ Backend no Render: **Já configurado** (não precisa fazer nada)
2. 📝 Frontend no Vercel: Siga o guia `GUIA_DEPLOY_VERCEL.md`
3. 🔗 Configure `REACT_APP_API_URL` no Vercel apontando para o Render

---

## 💡 Resumo

**Pergunta:** O que preciso configurar no Render para o Vercel?

**Resposta:** **NADA!** O backend já aceita automaticamente qualquer domínio do Vercel.

Apenas certifique-se de:
1. Backend está rodando no Render
2. Frontend está configurado no Vercel com `REACT_APP_API_URL` apontando para o Render
3. Pronto! 🎉

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
