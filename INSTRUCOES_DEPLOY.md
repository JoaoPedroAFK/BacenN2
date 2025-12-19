# 🚀 Instruções de Deploy - BacenN2

## 📋 Status das Correções

✅ **Correções Aplicadas:**
- Arquivo `js/firebase-init-v2.js` criado e configurado
- Todos os arquivos HTML atualizados
- Compatibilidade com código existente garantida
- Credenciais do Firebase já configuradas

## 🔍 Verificações Antes do Deploy

### 1. Testar Localmente Primeiro

1. Abra o projeto no navegador:
   ```
   file:///C:/Users/Velotax Suporte/Downloads/Bacen Projeto/Bacen/index.html
   ```

2. Abra o Console (F12) e verifique:
   - ✅ `[FirebaseManager] Firebase inicializado com sucesso`
   - ✅ `[FirebaseManager] window.firebaseDB criado para compatibilidade`
   - ✅ `[ArmazenamentoReclamacoes] Firebase ativado para uso`
   - ✅ `X fichas carregadas do Firebase`

3. Verifique se as fichas aparecem na página

### 2. Verificar Firebase Console

1. Acesse: https://console.firebase.google.com/project/bacen-n2/database
2. Verifique se existem os nós:
   - `fichas_bacen/`
   - `fichas_n2/`
   - `fichas_chatbot/`
3. Verifique as **Regras de Segurança**:
   ```json
   {
     "rules": {
       "fichas_bacen": {
         ".read": true,
         ".write": true
       },
       "fichas_n2": {
         ".read": true,
         ".write": true
       },
       "fichas_chatbot": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

## 🚀 Opções de Deploy

### Opção 1: Vercel (Recomendado - Mais Rápido)

#### Pré-requisitos:
- Conta no [Vercel](https://vercel.com)
- Vercel CLI instalado (opcional)

#### Passos:

1. **Instalar Vercel CLI** (se ainda não tiver):
```powershell
npm install -g vercel
```

2. **Login no Vercel**:
```powershell
vercel login
```

3. **Navegar até a pasta do projeto**:
```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
```

4. **Deploy**:
```powershell
vercel
```

5. **Seguir as instruções**:
   - Link ao projeto existente? `N` (criar novo)
   - Nome do projeto: `bacen-n2` (ou deixar padrão)
   - Diretório: `.` (pasta atual)
   - Override settings? `N`

6. **Deploy de Produção** (após teste):
```powershell
vercel --prod
```

#### Ou via Dashboard:
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Conecte o repositório GitHub `JoaoPedroAFK/BacenN2`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `Bacen` (ou `.` se estiver na raiz)
   - **Build Command**: (deixe vazio)
   - **Output Directory**: `.`
5. Clique em **Deploy**

---

### Opção 2: Firebase Hosting

#### Pré-requisitos:
- Firebase CLI instalado
- Login no Firebase

#### Passos:

1. **Instalar Firebase CLI** (se ainda não tiver):
```powershell
npm install -g firebase-tools
```

2. **Login no Firebase**:
```powershell
firebase login
```

3. **Navegar até a pasta do projeto**:
```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen"
```

4. **Inicializar Firebase Hosting** (se ainda não foi feito):
```powershell
firebase init hosting
```

   - Selecione o projeto: `bacen-n2`
   - Public directory: `.`
   - Configure as single-page app: `N`
   - Set up automatic builds: `N`

5. **Criar/Verificar `firebase.json`**:
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

6. **Deploy**:
```powershell
firebase deploy --only hosting
```

---

### Opção 3: GitHub Pages

#### Passos:

1. **Fazer commit dos arquivos**:
```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto"
git add Bacen/
git commit -m "Correções Firebase - Sistema robusto de inicialização"
git push origin main
```

2. **Configurar GitHub Pages**:
   - Acesse: https://github.com/JoaoPedroAFK/BacenN2/settings/pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/Bacen` (ou `/` se estiver na raiz)

3. **Aguardar deploy** (pode levar alguns minutos)

---

## ✅ Checklist Pós-Deploy

Após o deploy, verifique:

- [ ] Site está acessível
- [ ] Console do navegador não mostra erros
- [ ] Firebase inicializa corretamente
- [ ] Fichas aparecem na página
- [ ] É possível criar nova ficha
- [ ] É possível editar ficha existente

## 🐛 Troubleshooting

### Problema: Fichas não aparecem após deploy

**Soluções:**
1. Verificar console do navegador para erros
2. Verificar Firebase Console se caminhos existem
3. Verificar regras de segurança
4. Verificar se credenciais estão corretas

### Problema: Erro de CORS

**Solução**: Adicionar domínio nas configurações do Firebase:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Adicionar o domínio do deploy

### Problema: Firebase não inicializa

**Soluções:**
1. Verificar se Firebase SDK está carregado
2. Verificar credenciais em `js/config-firebase.js`
3. Verificar console para erros específicos

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar console do navegador (F12)
2. Verificar logs do Firebase Console
3. Consultar `CORRECOES_FIREBASE.md` para mais detalhes
4. Consultar `ANALISE_BACENN2_FIREBASE.md` para análise completa

---

*Última atualização: 2025-01-31*

