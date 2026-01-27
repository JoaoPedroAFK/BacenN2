# 🚀 Guia de Deploy - BacenN2

## 📋 Opções de Deploy

### Opção 1: Vercel (Recomendado)

#### Pré-requisitos:
- Conta no [Vercel](https://vercel.com)
- Projeto conectado ao GitHub (repositório: `JoaoPedroAFK/BacenN2`)

#### Passos:

1. **Instalar Vercel CLI** (opcional):
```bash
npm i -g vercel
```

2. **Deploy via CLI**:
```bash
cd bacenn2-corrigido
vercel
```

3. **Deploy via Dashboard**:
   - Acesse [vercel.com](https://vercel.com)
   - Conecte o repositório `JoaoPedroAFK/BacenN2`
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: `bacenn2-corrigido`
     - **Build Command**: (deixe vazio)
     - **Output Directory**: `.`
   - Clique em **Deploy**

4. **Configurar Variáveis de Ambiente** (se necessário):
   - No dashboard da Vercel, vá em Settings → Environment Variables
   - Adicione variáveis se necessário

#### Arquivo de Configuração:
O arquivo `vercel.json` já está configurado para servir arquivos estáticos.

---

### Opção 2: Firebase Hosting

#### Pré-requisitos:
- Conta no [Firebase](https://firebase.google.com)
- Firebase CLI instalado

#### Passos:

1. **Instalar Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login no Firebase**:
```bash
firebase login
```

3. **Inicializar Firebase Hosting** (se ainda não foi feito):
```bash
cd bacenn2-corrigido
firebase init hosting
```

   - Selecione o projeto: `bacen-n2`
   - Public directory: `.`
   - Configure como single-page app: `N`
   - Set up automatic builds: `N`

4. **Criar arquivo `firebase.json`** (se não existir):
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
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

5. **Deploy**:
```bash
firebase deploy --only hosting
```

---

### Opção 3: GitHub Pages

#### Passos:

1. **Criar arquivo `.nojekyll`** (para não processar com Jekyll):
```bash
cd bacenn2-corrigido
touch .nojekyll
```

2. **Configurar GitHub Pages**:
   - No repositório GitHub, vá em Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (ou `master`)
   - Folder: `/bacenn2-corrigido`

3. **Fazer commit e push**:
```bash
git add bacenn2-corrigido/
git commit -m "Adiciona correções do BacenN2"
git push origin main
```

---

## ⚙️ Configurações Importantes

### 1. Atualizar Credenciais do Firebase

**IMPORTANTE**: Antes do deploy, atualize as credenciais em `js/firebase-init.js`:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_REAL",
  authDomain: "bacen-n2.firebaseapp.com",
  databaseURL: "https://bacen-n2-default-rtdb.firebaseio.com",
  projectId: "bacen-n2",
  storageBucket: "bacen-n2.appspot.com",
  messagingSenderId: "SEU_SENDER_ID_REAL",
  appId: "SEU_APP_ID_REAL"
};
```

### 2. Verificar Regras de Segurança

No Firebase Console:
1. Acesse: https://console.firebase.google.com/project/bacen-n2
2. Vá em **Realtime Database** → **Rules**
3. Verifique se as regras permitem leitura/escrita:

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

### 3. Verificar Estrutura de Dados

Certifique-se de que os caminhos existem no Firebase:
- `fichas_bacen/`
- `fichas_n2/`
- `fichas_chatbot/`

---

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

1. **Acesse a URL do deploy**
2. **Abra o Console do Navegador** (F12)
3. **Procure por logs**:
   - ✅ `Firebase inicializado com sucesso`
   - ✅ `ArmazenamentoReclamacoes: Firebase pronto`
   - ✅ `X fichas carregadas do Firebase`
4. **Verifique se as fichas aparecem na página**
5. **Teste criar uma nova ficha** (se houver interface para isso)

---

## 🐛 Troubleshooting

### Problema: Fichas não aparecem

**Soluções**:
1. Verifique o console do navegador para erros
2. Verifique se os caminhos estão corretos no Firebase
3. Verifique as regras de segurança
4. Verifique se as credenciais estão corretas

### Problema: Erro de CORS

**Solução**: Adicione o domínio nas configurações do Firebase:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Adicione o domínio do deploy

### Problema: Firebase não inicializa

**Soluções**:
1. Verifique se o Firebase SDK está carregado
2. Verifique as credenciais
3. Verifique a conexão com a internet
4. Verifique o console para erros específicos

---

## 📝 Checklist de Deploy

- [ ] Credenciais do Firebase atualizadas
- [ ] Regras de segurança verificadas
- [ ] Estrutura de dados verificada no Firebase
- [ ] Arquivos corrigidos commitados
- [ ] Deploy realizado
- [ ] Testes realizados após deploy
- [ ] Logs verificados no console
- [ ] Fichas aparecendo corretamente

---

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/project/bacen-n2)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vercel Docs](https://vercel.com/docs)

---

*Última atualização: 2025-01-31*

