# 🚀 Guia de Deploy - Sistema BACEN, N2 e Chatbot

## ✅ Status

- ✅ **Código enviado para GitHub**: https://github.com/JoaoPedroAFK/BacenN2
- ✅ **Pronto para deploy**

---

## 🌐 Opções de Hospedagem

### Opção 1: Netlify (Recomendado - Mais Fácil)

#### Passo a Passo:

1. **Acesse:** https://app.netlify.com
2. **Faça login** (pode usar GitHub)
3. **Clique em:** "Add new site" → "Import an existing project"
4. **Conecte ao GitHub:**
   - Selecione o repositório: `JoaoPedroAFK/BacenN2`
   - Clique em "Connect"
5. **Configure o build:**
   - **Build command:** (deixe vazio - é um site estático)
   - **Publish directory:** `/` (raiz)
6. **Clique em:** "Deploy site"
7. **Aguarde** o deploy (1-2 minutos)
8. **Pronto!** Seu site estará online com URL tipo: `https://seu-site.netlify.app`

#### Configurações Adicionais (Opcional):

- **Custom domain:** Adicione seu domínio personalizado
- **HTTPS:** Automático e gratuito
- **Deploy automático:** A cada push no GitHub

---

### Opção 2: Vercel (Alternativa Rápida)

#### Passo a Passo:

1. **Acesse:** https://vercel.com
2. **Faça login** (pode usar GitHub)
3. **Clique em:** "Add New Project"
4. **Importe o repositório:**
   - Selecione: `JoaoPedroAFK/BacenN2`
   - Clique em "Import"
5. **Configure:**
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** (deixe vazio)
   - **Output Directory:** `./`
6. **Clique em:** "Deploy"
7. **Aguarde** o deploy
8. **Pronto!** URL tipo: `https://seu-site.vercel.app`

---

### Opção 3: GitHub Pages (Gratuito e Integrado)

#### Passo a Passo:

1. **No GitHub:**
   - Acesse: https://github.com/JoaoPedroAFK/BacenN2
   - Vá em **Settings** → **Pages**
2. **Configure:**
   - **Source:** Branch `main`
   - **Folder:** `/` (root)
   - Clique em **Save**
3. **Aguarde** alguns minutos
4. **Acesse:** `https://joaopedroafk.github.io/BacenN2`

**⚠️ Nota:** GitHub Pages pode ter limitações com SPAs. Se houver problemas, use Netlify ou Vercel.

---

## 📋 Checklist Pós-Deploy

Após fazer o deploy, verifique:

- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Formulários funcionam (BACEN, N2, Chatbot)
- [ ] Dashboard exibe dados
- [ ] Tema claro/escuro funciona
- [ ] Supabase está configurado (se aplicável)

---

## 🔧 Configuração do Supabase (Importante)

⚠️ **Antes de usar em produção:**

1. Execute o script SQL no Supabase:
   - Acesse: https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/sql/new
   - Copie o conteúdo de `supabase-setup.sql`
   - Cole e execute no SQL Editor

2. Verifique as políticas RLS estão ativas

3. Teste criando uma ficha no sistema

---

## 🔗 Links Úteis

- **Repositório GitHub:** https://github.com/JoaoPedroAFK/BacenN2
- **Supabase Dashboard:** https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk
- **Netlify:** https://app.netlify.com
- **Vercel:** https://vercel.com

---

## 🎯 Recomendação Final

**Para este projeto, recomendo Netlify:**
- ✅ Setup mais simples
- ✅ Deploy automático via Git
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Sem configuração adicional necessária

---

## 📞 Próximos Passos

1. Escolha uma opção de hospedagem (Netlify recomendado)
2. Faça o deploy seguindo os passos acima
3. Configure o Supabase (executar SQL script)
4. Teste o sistema online
5. Compartilhe o link com a equipe!

---

**Última atualização:** Código enviado para GitHub - Pronto para deploy! 🚀

