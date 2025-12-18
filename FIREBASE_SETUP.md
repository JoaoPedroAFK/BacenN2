# 🔥 Configuração do Firebase Realtime Database

## Passo 1: Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `velotax-reclamacoes` (ou outro nome)
4. Desative Google Analytics (não é necessário)
5. Clique em "Criar projeto"

## Passo 2: Criar Realtime Database

1. No menu lateral, clique em "Realtime Database"
2. Clique em "Criar banco de dados"
3. Escolha localização: `southamerica-east1` (São Paulo)
4. Escolha modo: **"Modo de teste"** (permite leitura/escrita sem autenticação)
5. Clique em "Ativar"

## Passo 3: Obter Configuração

1. No menu lateral, clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique no ícone `</>` (Web)
5. Registre o app com um nome (ex: "Bacen N2")
6. **Copie o objeto de configuração** que aparece

## Passo 4: Configurar no Código

1. Abra o arquivo `js/config-firebase.js` (será criado)
2. Cole a configuração do Firebase
3. Substitua `YOUR_API_KEY`, `YOUR_AUTH_DOMAIN`, etc. pelos valores reais

## Passo 5: Configurar Regras de Segurança

1. No Firebase Console, vá em "Realtime Database"
2. Clique na aba "Regras"
3. Cole as regras abaixo:

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

4. Clique em "Publicar"

## Passo 6: Adicionar Scripts no HTML

Adicione estes scripts ANTES de `firebase-db.js`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"></script>

<!-- Configuração do Firebase -->
<script src="js/config-firebase.js"></script>

<!-- Firebase DB -->
<script src="js/firebase-db.js"></script>
```

## ✅ Pronto!

O sistema agora usará Firebase Realtime Database em vez de Supabase.

**Vantagens:**
- ✅ Sem schema rígido (não precisa criar colunas)
- ✅ Mais simples de configurar
- ✅ Sem problemas de cache
- ✅ Funciona imediatamente após configurar

