# 📚 Documentação Técnica - Sistema de Integração com Firebase Realtime Database

<!-- VERSION: v1.0.0 | DATE: 2025-01-31 | AUTHOR: VeloHub Development Team -->

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Fluxo de Inicialização](#fluxo-de-inicialização)
4. [Envio de Dados para Firebase](#envio-de-dados-para-firebase)
5. [Carregamento de Dados do Firebase](#carregamento-de-dados-do-firebase)
6. [Exibição nas Listas](#exibição-nas-listas)
7. [Estrutura de Dados no Firebase](#estrutura-de-dados-no-firebase)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O sistema utiliza **Firebase Realtime Database** como armazenamento principal para fichas de reclamações (BACEN, N2 e Chatbot). O sistema foi projetado com:

- **Sistema de eventos** para sincronização entre componentes
- **Fallback para localStorage** quando Firebase não está disponível
- **Logs persistentes** para debug (sobrevivem a recarregamentos)
- **Tratamento robusto de erros** e reconexão automática

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    HTML (index.html)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ config-      │  │ firebase-   │  │ firebase-   │       │
│  │ firebase.js  │→ │ init-v2.js  │→ │ db.js       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                          ↓                                   │
│                  ┌──────────────────┐                       │
│                  │ armazenamento-   │                       │
│                  │ reclamacoes.js   │                       │
│                  └──────────────────┘                       │
│                          ↓                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ bacen-       │  │ n2-page.js  │  │ chatbot-    │       │
│  │ page.js      │  │             │  │ page.js     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          ↓
                  ┌──────────────────┐
                  │ Firebase         │
                  │ Realtime Database│
                  └──────────────────┘
```

### Fluxo de Dependências

1. **config-firebase.js** → Define `window.FIREBASE_CONFIG`
2. **firebase-init-v2.js** → Inicializa Firebase e dispara evento `firebaseReady`
3. **firebase-db.js** → Cria `window.firebaseDB` com métodos `salvar()` e `carregar()`
4. **armazenamento-reclamacoes.js** → Camada de abstração que usa `firebaseDB`
5. **bacen-page.js / n2-page.js / chatbot-page.js** → Usam `armazenamentoReclamacoes`

---

## 🔄 Fluxo de Inicialização

### 1. Carregamento dos Scripts (HTML)

```html
<!-- Ordem CRÍTICA de carregamento -->
<script src="js/config-firebase.js"></script>        <!-- 1. Configuração -->
<script src="js/firebase-init-v2.js"></script>      <!-- 2. Inicialização -->
<script src="js/firebase-db.js"></script>            <!-- 3. Classe FirebaseDB -->
<script src="js/armazenamento-reclamacoes.js"></script> <!-- 4. Camada de abstração -->
<script src="js/bacen-page.js"></script>            <!-- 5. Páginas específicas -->
```

### 2. Inicialização do Firebase (firebase-init-v2.js)

```javascript
// Classe FirebaseManager gerencia a inicialização
class FirebaseManager {
  async initialize() {
    // 1. Verifica se Firebase SDK está carregado
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK não está carregado');
    }
    
    // 2. Verifica configuração
    if (!window.FIREBASE_CONFIG) {
      throw new Error('FIREBASE_CONFIG não encontrado');
    }
    
    // 3. Inicializa Firebase App
    firebase.initializeApp(window.FIREBASE_CONFIG);
    
    // 4. Obtém referência do Database
    this.firebaseDB = firebase.database();
    
    // 5. AGUARDA CONEXÃO (importante!)
    await this.waitForConnection();
    
    // 6. Dispara evento quando pronto
    window.dispatchEvent(new CustomEvent('firebaseReady', {
      detail: { firebaseDB: window.firebaseDB }
    }));
  }
  
  waitForConnection() {
    // Monitora .info/connected para garantir conexão
    const connectedRef = this.firebaseDB.ref('.info/connected');
    return new Promise((resolve) => {
      connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
          resolve();
        }
      });
    });
  }
}
```

**Por que aguardar conexão?**
- Garante que o Firebase está realmente conectado antes de usar
- Evita erros de "permission denied" por tentar usar antes de conectar
- Timeout de 10 segundos para evitar travamento

### 3. Criação do FirebaseDB (firebase-db.js)

```javascript
class FirebaseDB {
  async inicializar() {
    // Usa a configuração já carregada
    this.database = firebase.database();
    this.inicializado = true;
    
    // Dispara evento
    window.dispatchEvent(new CustomEvent('firebaseReady', {
      detail: { firebaseDB: this }
    }));
  }
}

// Cria instância global
window.firebaseDB = new FirebaseDB();
```

### 4. Ativação do Armazenamento (armazenamento-reclamacoes.js)

```javascript
class ArmazenamentoReclamacoes {
  constructor() {
    // Escuta evento firebaseReady
    window.addEventListener('firebaseReady', (event) => {
      if (event.detail && event.detail.firebaseDB) {
        this.firebaseDB = event.detail.firebaseDB;
        this.usarFirebase = true;
        console.log('✅ Firebase ativado para uso');
      }
    });
    
    // Verificação periódica como fallback
    this.inicializarFirebase();
  }
  
  verificarEAtivarFirebase() {
    if (window.firebaseDB && 
        window.firebaseDB.inicializado && 
        !window.firebaseDB.usarLocalStorage) {
      this.usarFirebase = true;
      this.firebaseDB = window.firebaseDB;
      return true;
    }
    return false;
  }
}
```

---

## 📤 Envio de Dados para Firebase

### Fluxo Completo de Salvamento

```
Usuário preenche formulário
        ↓
handleSubmitChatbot() (chatbot-page.js)
        ↓
armazenamentoReclamacoes.salvar('chatbot', ficha)
        ↓
firebaseDB.salvar('chatbot', ficha)
        ↓
firebase.database().ref('fichas_chatbot/{id}').set(ficha)
        ↓
Firebase Realtime Database
```

### 1. Coleta de Dados (chatbot-page.js)

```javascript
async function handleSubmitChatbot(e) {
  e.preventDefault();
  
  // 1. Coleta dados do formulário
  const ficha = {
    id: window.armazenamentoReclamacoes.gerarId(),
    nomeCompleto: obterValorCampoChatbot('chatbot-nome'),
    cpf: obterValorCampoChatbot('chatbot-cpf'),
    motivo: obterValorCampoChatbot('chatbot-motivo'),
    dataCriacao: new Date().toISOString(),
    tipoDemanda: 'chatbot',
    // ... outros campos
  };
  
  // 2. Validação
  if (!validarFichaChatbot(ficha)) {
    return; // Para aqui se inválido
  }
  
  // 3. Salva via sistema de armazenamento
  await window.armazenamentoReclamacoes.salvar('chatbot', ficha);
}
```

### 2. Camada de Abstração (armazenamento-reclamacoes.js)

```javascript
async salvar(tipo, reclamacao) {
  // 1. Garante ID
  if (!reclamacao.id) {
    reclamacao.id = this.gerarId();
  }
  
  // 2. Garante data de criação
  if (!reclamacao.dataCriacao) {
    reclamacao.dataCriacao = new Date().toISOString();
  }
  
  // 3. Garante tipo
  reclamacao.tipoDemanda = tipo;
  
  // 4. Verifica se Firebase está disponível
  if (!this.usarFirebase) {
    this.verificarEAtivarFirebase();
  }
  
  // 5. Se Firebase disponível, salva lá
  if (this.usarFirebase && this.firebaseDB) {
    const sucesso = await this.firebaseDB.salvar(tipo, reclamacao);
    if (sucesso) {
      return true; // NÃO salva no localStorage
    }
  }
  
  // 6. Fallback para localStorage (apenas se Firebase não disponível)
  // ...
}
```

### 3. Salvamento no Firebase (firebase-db.js)

```javascript
async salvar(tipo, ficha) {
  // 1. Verifica se está inicializado
  if (!this.inicializado || this.usarLocalStorage) {
    return false;
  }
  
  // 2. Monta caminho no Firebase
  const caminho = `fichas_${tipo}/${ficha.id}`;
  // Exemplo: "fichas_chatbot/abc123"
  
  // 3. Salva usando set() (substitui se já existir)
  await this.database.ref(caminho).set(ficha);
  
  // 4. Retorna sucesso
  return true;
}
```

**Estrutura no Firebase após salvamento:**

```json
{
  "fichas_chatbot": {
    "abc123": {
      "id": "abc123",
      "nomeCompleto": "João Silva",
      "cpf": "12345678900",
      "motivo": "Problema com produto",
      "dataCriacao": "2025-01-31T10:30:00.000Z",
      "tipoDemanda": "chatbot",
      "status": "nao-iniciado"
    },
    "def456": {
      // ... outra ficha
    }
  },
  "fichas_bacen": {
    // ... fichas BACEN
  },
  "fichas_n2": {
    // ... fichas N2
  }
}
```

### 4. Logs Persistentes

O sistema salva logs no `localStorage` para debug (sobrevivem a recarregamentos):

```javascript
// Antes de salvar
localStorage.setItem('velotax_debug_firebase_salvar_' + Date.now(), JSON.stringify({
  timestamp: new Date().toISOString(),
  acao: 'antes_de_set',
  caminho: caminho,
  tipo: tipo,
  id: ficha.id
}));

// Após salvar com sucesso
localStorage.setItem(logKey + '_sucesso', JSON.stringify({
  timestamp: new Date().toISOString(),
  acao: 'apos_set_sucesso',
  sucesso: true
}));
```

**Como verificar logs:**
```javascript
// No console do navegador
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('velotax_debug_firebase_salvar_')) {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  }
}
```

---

## 📥 Carregamento de Dados do Firebase

### Fluxo Completo de Carregamento

```
Página carrega (bacen-page.js)
        ↓
carregarFichasBacen()
        ↓
armazenamentoReclamacoes.carregarTodos('bacen')
        ↓
firebaseDB.carregar('bacen')
        ↓
firebase.database().ref('fichas_bacen').once('value')
        ↓
Conversão de objeto para array
        ↓
Atualização de variável global (fichasBacen)
        ↓
Renderização na lista
```

### 1. Chamada da Página (bacen-page.js)

```javascript
async function carregarFichasBacen() {
  // 1. Verifica se armazenamentoReclamacoes está disponível
  if (!window.armazenamentoReclamacoes) {
    // Aguarda até 1 segundo
    let tentativas = 0;
    while (!window.armazenamentoReclamacoes && tentativas < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tentativas++;
    }
  }
  
  // 2. Carrega via sistema de armazenamento
  if (window.armazenamentoReclamacoes) {
    fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
    console.log('✅ Fichas carregadas:', fichasBacen.length);
  }
}
```

### 2. Camada de Abstração (armazenamento-reclamacoes.js)

```javascript
async carregarTodos(tipo) {
  // 1. Verifica se Firebase está disponível
  if (!this.usarFirebase || !this.firebaseDB) {
    // Fallback para localStorage
    return this.carregarDoLocalStorage(tipo);
  }
  
  // 2. Carrega do Firebase
  try {
    const fichas = await this.firebaseDB.carregar(tipo);
    return fichas;
  } catch (error) {
    console.error('Erro ao carregar do Firebase:', error);
    // Fallback para localStorage
    return this.carregarDoLocalStorage(tipo);
  }
}
```

### 3. Carregamento do Firebase (firebase-db.js)

```javascript
async carregar(tipo) {
  // 1. Monta caminho
  const caminho = `fichas_${tipo}`;
  // Exemplo: "fichas_bacen"
  
  // 2. Faz leitura única (once('value'))
  const snapshot = await this.database.ref(caminho).once('value');
  const dados = snapshot.val();
  
  // 3. Verifica se existe
  if (!snapshot.exists() || !dados) {
    return [];
  }
  
  // 4. Firebase retorna OBJETO, não array
  // Estrutura: { "id1": {...}, "id2": {...} }
  
  // 5. Converte objeto para array
  const fichas = Object.keys(dados).map(id => {
    const ficha = dados[id];
    // Garante que ID está presente
    if (!ficha.id || ficha.id !== id) {
      ficha.id = id;
    }
    return ficha;
  });
  
  return fichas;
}
```

**Estrutura retornada pelo Firebase:**

```javascript
// Firebase retorna:
{
  "abc123": { nomeCompleto: "João", cpf: "123" },
  "def456": { nomeCompleto: "Maria", cpf: "456" }
}

// Sistema converte para:
[
  { id: "abc123", nomeCompleto: "João", cpf: "123" },
  { id: "def456", nomeCompleto: "Maria", cpf: "456" }
]
```

### 4. Atualização de Variáveis Globais

```javascript
// bacen-page.js
let fichasBacen = []; // Variável global

async function carregarFichasBacen() {
  fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
  // Agora fichasBacen contém todas as fichas
}
```

---

## 🎨 Exibição nas Listas

### Fluxo de Renderização

```
carregarFichasBacen() atualiza fichasBacen[]
        ↓
renderizarListaBacen()
        ↓
Filtra fichas (busca, status, etc)
        ↓
criarCardBacen() para cada ficha
        ↓
container.innerHTML = HTML gerado
        ↓
Exibição na tela
```

### 1. Função de Renderização (bacen-page.js)

```javascript
async function renderizarListaBacen() {
  // 1. Obtém container
  const container = document.getElementById('lista-fichas-bacen');
  if (!container) return;
  
  // 2. SEMPRE recarrega antes de renderizar
  await carregarFichasBacen();
  
  // 3. Aplica filtros
  const busca = document.getElementById('busca-bacen')?.value.toLowerCase() || '';
  const filtroStatus = document.getElementById('filtro-status-bacen')?.value || '';
  
  let filtradas = fichasBacen.filter(ficha => {
    // Filtro de busca
    if (busca) {
      const textoBusca = `${ficha.nomeCompleto} ${ficha.cpf} ${ficha.motivo}`.toLowerCase();
      if (!textoBusca.includes(busca)) return false;
    }
    
    // Filtro de status
    if (filtroStatus && ficha.status !== filtroStatus) return false;
    
    return true;
  });
  
  // 4. Gera HTML para cada ficha
  const html = filtradas.map(ficha => criarCardBacen(ficha)).join('');
  
  // 5. Atualiza DOM
  container.innerHTML = html;
}
```

### 2. Criação de Cards

```javascript
function criarCardBacen(ficha) {
  const statusLabels = {
    'nao-iniciado': 'Não Iniciado',
    'em-tratativa': 'Em Tratativa',
    'concluido': 'Concluído'
  };
  
  return `
    <div class="complaint-item" onclick="abrirFichaBacen('${ficha.id}')">
      <div class="complaint-header">
        <div class="complaint-title">
          ${ficha.nomeCompleto || 'Nome não informado'}
        </div>
        <div class="complaint-status status-${ficha.status}">
          ${statusLabels[ficha.status] || ficha.status}
        </div>
      </div>
      <div class="complaint-summary">
        <div class="complaint-detail">
          <strong>CPF:</strong> ${ficha.cpf || 'Não informado'}
        </div>
        <div class="complaint-detail">
          <strong>Motivo:</strong> ${ficha.motivo || 'Não informado'}
        </div>
      </div>
    </div>
  `;
}
```

### 3. Atualização Automática dos Dashboards

```javascript
// Listener para atualizar quando fichas forem importadas
window.addEventListener('reclamacaoSalva', async function(event) {
  if (event.detail && event.detail.tipo === 'bacen') {
    // Recarrega fichas
    await carregarFichasBacen();
    
    // Atualiza dashboard
    atualizarDashboardBacen();
    
    // Atualiza lista se estiver visível
    const secaoLista = document.getElementById('lista-bacen');
    if (secaoLista && secaoLista.classList.contains('active')) {
      renderizarListaBacen();
    }
  }
});
```

### 4. Atualização de Cards do Dashboard

```javascript
async function atualizarDashboardBacen() {
  // 1. Recarrega fichas
  await carregarFichasBacen();
  
  // 2. Calcula estatísticas
  const total = fichasBacen.length;
  const emTratativa = fichasBacen.filter(f => f.status === 'em-tratativa').length;
  const concluidas = fichasBacen.filter(f => f.status === 'concluido').length;
  
  // 3. Atualiza elementos do DOM
  atualizarElemento('bacen-total-dash', total);
  atualizarElemento('bacen-tratativa-dash', emTratativa);
  atualizarElemento('bacen-concluidas-dash', concluidas);
}

function atualizarElemento(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}
```

---

## 📊 Estrutura de Dados no Firebase

### Caminhos (Paths)

```
Firebase Realtime Database
├── fichas_bacen/
│   ├── {id1}/
│   │   ├── id: "id1"
│   │   ├── nomeCompleto: "João Silva"
│   │   ├── cpf: "12345678900"
│   │   ├── status: "em-tratativa"
│   │   └── ...
│   └── {id2}/
│       └── ...
├── fichas_n2/
│   └── ...
└── fichas_chatbot/
    └── ...
```

### Regras de Segurança (Firebase Console)

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

**⚠️ IMPORTANTE:** Estas regras permitem leitura/escrita para todos. Em produção, implemente autenticação!

---

## ⚠️ Tratamento de Erros

### 1. Erro de Permissão

```javascript
catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    console.error('🚨 ERRO DE PERMISSÃO!');
    console.error('Verifique as regras de segurança no Firebase Console!');
  }
}
```

### 2. Firebase Não Inicializado

```javascript
if (!this.inicializado || this.usarLocalStorage) {
  console.warn('⚠️ Firebase não inicializado, usando localStorage');
  // Fallback para localStorage
}
```

### 3. Timeout de Conexão

```javascript
waitForConnection() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout ao conectar ao Firebase (10s)'));
    }, 10000);
    // ...
  });
}
```

### 4. Dados Não Encontrados

```javascript
if (!snapshot.exists() || !dados) {
  console.warn('⚠️ Nenhuma ficha encontrada');
  return []; // Retorna array vazio
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Salvar Nova Ficha Manualmente

```javascript
// 1. Usuário preenche formulário e clica em "Salvar"
// 2. handleSubmitChatbot() é chamado

const ficha = {
  id: 'abc123',
  nomeCompleto: 'João Silva',
  cpf: '12345678900',
  motivo: 'Problema com produto',
  dataCriacao: '2025-01-31T10:30:00.000Z',
  tipoDemanda: 'chatbot'
};

// 3. Salva via armazenamento
await window.armazenamentoReclamacoes.salvar('chatbot', ficha);

// 4. Internamente chama:
await window.firebaseDB.salvar('chatbot', ficha);

// 5. Firebase salva em:
// fichas_chatbot/abc123 = { ...dados da ficha }
```

### Exemplo 2: Carregar Fichas na Página

```javascript
// 1. Página carrega
// 2. carregarFichasBacen() é chamado

// 3. Carrega via armazenamento
fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen');

// 4. Internamente chama:
const snapshot = await firebase.database().ref('fichas_bacen').once('value');
const dados = snapshot.val();

// 5. Converte objeto para array
const fichas = Object.keys(dados).map(id => ({
  id: id,
  ...dados[id]
}));

// 6. fichasBacen agora contém todas as fichas
// 7. renderizarListaBacen() exibe na tela
```

### Exemplo 3: Importação de Planilha

```javascript
// 1. Usuário importa planilha Excel
// 2. importador-dados.js processa e cria fichas

const fichasImportadas = [
  { id: 'id1', nomeCompleto: 'Cliente 1', tipoDemanda: 'bacen' },
  { id: 'id2', nomeCompleto: 'Cliente 2', tipoDemanda: 'n2' }
];

// 3. Salva cada ficha
for (const ficha of fichasImportadas) {
  await window.armazenamentoReclamacoes.salvar(ficha.tipoDemanda, ficha);
}

// 4. Dispara eventos para atualizar dashboards
window.dispatchEvent(new CustomEvent('reclamacaoSalva', {
  detail: { tipo: 'bacen', origem: 'importacao' }
}));

// 5. Dashboards escutam evento e atualizam automaticamente
```

---

## 🔍 Debug e Troubleshooting

### Verificar se Firebase está Conectado

```javascript
// No console do navegador
console.log('Firebase inicializado?', window.firebaseDB?.inicializado);
console.log('Usando localStorage?', window.firebaseDB?.usarLocalStorage);
console.log('Armazenamento usando Firebase?', window.armazenamentoReclamacoes?.usarFirebase);
```

### Verificar Dados no Firebase

```javascript
// No console do navegador
const snapshot = await firebase.database().ref('fichas_chatbot').once('value');
console.log('Fichas no Firebase:', snapshot.val());
```

### Verificar Logs Persistentes

```javascript
// No console do navegador
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('velotax_debug_')) {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  }
}
```

---

## 📝 Resumo do Fluxo Completo

1. **Inicialização:**
   - `config-firebase.js` → Define configuração
   - `firebase-init-v2.js` → Inicializa e aguarda conexão
   - `firebase-db.js` → Cria métodos `salvar()` e `carregar()`
   - `armazenamento-reclamacoes.js` → Escuta evento `firebaseReady`

2. **Salvamento:**
   - Formulário → `handleSubmit()` → `armazenamentoReclamacoes.salvar()`
   - → `firebaseDB.salvar()` → `firebase.database().ref().set()`
   - → Firebase Realtime Database

3. **Carregamento:**
   - Página carrega → `carregarFichas()` → `armazenamentoReclamacoes.carregarTodos()`
   - → `firebaseDB.carregar()` → `firebase.database().ref().once('value')`
   - → Converte objeto para array → Atualiza variável global → Renderiza lista

4. **Atualização:**
   - Evento `reclamacaoSalva` → Listener atualiza dashboard → Recarrega fichas → Renderiza lista

---

*Documentação criada em: 2025-01-31*
*Versão do sistema: v2.1.0*

