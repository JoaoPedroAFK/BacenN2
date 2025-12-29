# 🔍 Guia de Depuração - Carregamento de Dados do Firebase

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 📋 Índice

1. [Como Usar o Script de Depuração](#como-usar-o-script-de-depuração)
2. [Passos de Diagnóstico](#passos-de-diagnóstico)
3. [Interpretação dos Resultados](#interpretação-dos-resultados)
4. [Soluções para Problemas Comuns](#soluções-para-problemas-comuns)

---

## 🚀 Como Usar o Script de Depuração

### Método 1: Carregar Script no HTML (Recomendado)

Adicione ao final do `<body>` em `index.html`, `bacen.html`, `n2.html` ou `chatbot.html`:

```html
<script src="js/DEBUG_CARREGAMENTO_FIREBASE.js"></script>
```

### Método 2: Copiar e Colar no Console

1. Abra o console do navegador (F12)
2. Vá na aba "Console"
3. Abra o arquivo `DEBUG_CARREGAMENTO_FIREBASE.js`
4. Copie TODO o conteúdo
5. Cole no console e pressione Enter

### Executar Diagnóstico

```javascript
// Diagnosticar fichas Chatbot
await debugCarregamentoFirebase('chatbot');

// Diagnosticar fichas BACEN
await debugCarregamentoFirebase('bacen');

// Diagnosticar fichas N2
await debugCarregamentoFirebase('n2');
```

---

## 🔬 Passos de Diagnóstico

O script executa **6 passos** de diagnóstico sequenciais:

### **PASSO 1: Verificar Inicialização do Firebase**

**O que verifica:**
- Se `window.firebaseDB` está inicializado
- Se está usando localStorage (não deveria quando Firebase está ativo)
- Se `armazenamentoReclamacoes` está configurado para usar Firebase

**Comandos manuais:**
```javascript
console.log('Firebase inicializado?', window.firebaseDB?.inicializado);
console.log('Usando localStorage?', window.firebaseDB?.usarLocalStorage);
console.log('Armazenamento usando Firebase?', window.armazenamentoReclamacoes?.usarFirebase);
```

**Resultado esperado:**
```
✅ Firebase inicializado? true
✅ Usando localStorage? false
✅ Armazenamento usando Firebase? true
```

**Se falhar:**
- Verifique se `firebase-init-v2.js` foi carregado
- Verifique se `config-firebase.js` está correto
- Verifique se o evento `firebaseReady` foi disparado

---

### **PASSO 2: Verificar Dados no Firebase Diretamente**

**O que verifica:**
- Se os dados existem no caminho correto (`fichas_chatbot`, `fichas_bacen`, `fichas_n2`)
- Se o snapshot retorna dados
- Se a conversão objeto→array funciona

**Comando manual:**
```javascript
async function verificarDadosFirebase() {
  const snapshot = await firebase.database().ref('fichas_chatbot').once('value');
  console.log('Snapshot existe?', snapshot.exists());
  console.log('Dados brutos:', snapshot.val());
  
  if (snapshot.exists()) {
    const dados = snapshot.val();
    const fichas = Object.keys(dados).map(id => {
      const ficha = dados[id];
      if (!ficha.id || ficha.id !== id) {
        ficha.id = id;
      }
      return ficha;
    });
    console.log('Dados convertidos:', fichas);
  }
}
verificarDadosFirebase();
```

**Resultado esperado:**
```
✅ Snapshot existe? true
📊 Dados brutos: { "abc123": {...}, "def456": {...} }
✅ Conversão concluída: [{ id: "abc123", ... }, { id: "def456", ... }]
```

**Se falhar:**
- **`Snapshot existe? false`**: Dados não foram salvos ou caminho incorreto
- **`Dados brutos: null`**: Regras de segurança ou dados não existem
- **Erro de permissão**: Verifique regras no Firebase Console

---

### **PASSO 3: Testar firebaseDB.carregar()**

**O que verifica:**
- Se o método `carregar()` existe e funciona
- Se retorna array corretamente
- Se os dados estão completos

**Comando manual:**
```javascript
const fichas = await window.firebaseDB.carregar('chatbot');
console.log('Total de fichas:', fichas.length);
console.log('Primeira ficha:', fichas[0]);
```

**Resultado esperado:**
```
✅ Total de fichas: 5
✅ Primeira ficha: { id: "abc123", nomeCompleto: "João", ... }
```

**Se falhar:**
- Verifique se `firebase-db.js` foi carregado
- Verifique se `window.firebaseDB` existe
- Verifique logs de erro no console

---

### **PASSO 4: Testar armazenamentoReclamacoes.carregarTodos()**

**O que verifica:**
- Se a camada de abstração funciona
- Se está usando Firebase (não localStorage)
- Se retorna dados corretos

**Comando manual:**
```javascript
const fichas = await window.armazenamentoReclamacoes.carregarTodos('chatbot');
console.log('Total de fichas:', fichas.length);
console.log('Usando Firebase?', window.armazenamentoReclamacoes.usarFirebase);
```

**Resultado esperado:**
```
✅ Total de fichas: 5
✅ Usando Firebase? true
```

**Se falhar:**
- Verifique se `armazenamento-reclamacoes.js` foi carregado
- Verifique se escutou o evento `firebaseReady`
- Verifique se `this.usarFirebase` está `true`

---

### **PASSO 5: Verificar Variável Global da Página**

**O que verifica:**
- Se a variável global (`fichasBacen`, `fichasN2`, `fichasChatbot`) existe
- Se a função `carregarFichas*()` existe
- Se os dados estão na variável após carregar

**Comando manual:**
```javascript
// Para chatbot
console.log('fichasChatbot existe?', typeof window.fichasChatbot !== 'undefined');
console.log('Total:', window.fichasChatbot?.length || 0);

// Testar função carregar
await window.carregarFichasChatbot();
console.log('Total após carregar:', window.fichasChatbot?.length || 0);
```

**Resultado esperado:**
```
✅ fichasChatbot existe? true
✅ Total: 5
✅ Total após carregar: 5
```

**Se falhar:**
- Verifique se a página específica foi carregada (`chatbot-page.js`, etc)
- Verifique se a função `carregarFichas*()` está definida
- Verifique se está sendo chamada corretamente

---

### **PASSO 6: Verificar Logs Persistentes**

**O que verifica:**
- Logs de salvamento anteriores
- Logs de erros
- Histórico de operações

**Comando manual:**
```javascript
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('velotax_debug_')) {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  }
}
```

**O que procurar:**
- `velotax_debug_firebase_salvar_*`: Logs de salvamento
- `velotax_debug_firebase_salvar_*_sucesso`: Salvamentos bem-sucedidos
- `velotax_debug_firebase_salvar_*_erro`: Erros de salvamento

---

## 📊 Interpretação dos Resultados

### Cenário 1: Firebase Não Inicializado

**Sintomas:**
```
❌ Firebase inicializado? false
❌ Usando localStorage? true
❌ Armazenamento usando Firebase? false
```

**Causa:** Firebase não foi inicializado corretamente

**Solução:**
1. Verifique ordem de carregamento dos scripts no HTML
2. Verifique se `config-firebase.js` está correto
3. Verifique console para erros de inicialização
4. Verifique se Realtime Database foi criado no Firebase Console

---

### Cenário 2: Dados Não Existem no Firebase

**Sintomas:**
```
✅ Firebase inicializado? true
✅ Snapshot existe? false
```

**Causa:** Dados nunca foram salvos ou foram salvos em caminho diferente

**Solução:**
1. Verifique Firebase Console → Realtime Database
2. Procure por `fichas_chatbot`, `fichas_bacen`, `fichas_n2`
3. Se não existir, tente salvar uma ficha manualmente
4. Verifique logs de salvamento no localStorage

---

### Cenário 3: Erro de Permissão

**Sintomas:**
```
❌ Erro: PERMISSION_DENIED
❌ Código: permission-denied
```

**Causa:** Regras de segurança do Firebase impedem leitura

**Solução:**
1. Acesse Firebase Console → Realtime Database → Rules
2. Verifique se as regras permitem leitura:
```json
{
  "rules": {
    "fichas_chatbot": {
      ".read": true,
      ".write": true
    }
  }
}
```
3. Publique as regras

---

### Cenário 4: Dados Existem mas Não Aparecem na Lista

**Sintomas:**
```
✅ Firebase inicializado? true
✅ Snapshot existe? true
✅ Total de fichas: 5
✅ Variável global: 5
❌ Lista vazia na tela
```

**Causa:** Problema na renderização ou filtros

**Solução:**
1. Verifique se `renderizarListaBacen()` está sendo chamado
2. Verifique se o container existe: `document.getElementById('lista-fichas-bacen')`
3. Verifique filtros (busca, status) que podem estar ocultando dados
4. Verifique console para erros de renderização

---

## 🛠️ Soluções para Problemas Comuns

### Problema: Firebase Não Inicializa

**Diagnóstico:**
```javascript
console.log('Firebase SDK:', typeof firebase);
console.log('FIREBASE_CONFIG:', window.FIREBASE_CONFIG);
```

**Soluções:**
1. Verifique se scripts do Firebase estão carregados antes de `firebase-init-v2.js`
2. Verifique se `config-firebase.js` define `window.FIREBASE_CONFIG`
3. Verifique se Realtime Database foi criado no Firebase Console

---

### Problema: Dados Não Aparecem Após Importação

**Diagnóstico:**
```javascript
// Verificar se dados foram salvos
const snapshot = await firebase.database().ref('fichas_chatbot').once('value');
console.log('Dados após importação:', snapshot.exists());
```

**Soluções:**
1. Verifique logs do importador (`importador-dados.js`)
2. Verifique se `armazenamentoReclamacoes.salvar()` retornou `true`
3. Aguarde alguns segundos e recarregue a página
4. Verifique se eventos `reclamacaoSalva` foram disparados

---

### Problema: Lista Não Atualiza Automaticamente

**Diagnóstico:**
```javascript
// Verificar listeners
console.log('Listeners registrados:', window.addEventListener.toString());
```

**Soluções:**
1. Verifique se listeners foram adicionados em `inicializarBacen()`, etc
2. Dispare evento manualmente para testar:
```javascript
window.dispatchEvent(new CustomEvent('reclamacaoSalva', {
  detail: { tipo: 'chatbot', origem: 'teste' }
}));
```
3. Verifique se `renderizarListaBacen()` está sendo chamado no listener

---

## 📝 Limpeza de Logs

Para remover logs antigos (mais de 7 dias):

```javascript
limparLogsDebug(7); // Remove logs com mais de 7 dias
```

---

## 🎯 Checklist Rápido

Use este checklist quando os dados não aparecem:

- [ ] Firebase está inicializado? (`window.firebaseDB?.inicializado`)
- [ ] Está usando Firebase? (`!window.firebaseDB?.usarLocalStorage`)
- [ ] Dados existem no Firebase? (`snapshot.exists()`)
- [ ] Método `carregar()` funciona? (`await firebaseDB.carregar('chatbot')`)
- [ ] Variável global tem dados? (`window.fichasChatbot?.length`)
- [ ] Função renderizar está sendo chamada? (`renderizarListaChatbot()`)
- [ ] Container existe no DOM? (`document.getElementById('lista-fichas-chatbot')`)
- [ ] Filtros não estão ocultando? (verificar valores de busca/status)

---

*Guia criado em: 2025-01-31*
*Versão do sistema: v2.1.0*

