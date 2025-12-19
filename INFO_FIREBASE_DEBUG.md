# 🔍 Informações para Debug do Firebase Realtime Database

## 📋 1. Código JavaScript para Ler Dados do Realtime Database

### Arquivo: `js/firebase-db.js`

#### Método `carregar(tipo)` - Carrega todas as fichas de um tipo:

```javascript
// Carregar todas as fichas de um tipo
async carregar(tipo) {
    if (!this.inicializado || this.usarLocalStorage) {
        console.warn(`⚠️ Firebase não inicializado ou usando localStorage. Tipo: ${tipo}`);
        return [];
    }

    try {
        const caminho = `fichas_${tipo}`;
        console.log(`📥 Carregando fichas ${tipo} do Firebase (caminho: ${caminho})...`);
        const snapshot = await this.database.ref(caminho).once('value');
        const dados = snapshot.val();
        
        console.log(`📊 Dados brutos do Firebase para ${tipo}:`, dados);
        console.log(`📊 Tipo dos dados:`, typeof dados);
        console.log(`📊 É objeto?`, dados && typeof dados === 'object' && !Array.isArray(dados));
        
        if (!dados) {
            console.log(`⚠️ Nenhuma ficha ${tipo} encontrada no Firebase (dados é null/undefined)`);
            return [];
        }

        // Converter objeto em array
        const fichas = Object.keys(dados).map(id => dados[id]);
        console.log(`✅ ${fichas.length} fichas ${tipo} carregadas do Firebase`);
        if (fichas.length > 0) {
            console.log(`📋 Primeira ficha ${tipo}:`, fichas[0].id || 'sem ID', fichas[0].nomeCliente || 'sem nome');
        }
        return fichas;
    } catch (error) {
        console.error(`❌ Erro ao carregar fichas ${tipo} do Firebase:`, error);
        console.error(`   Caminho: fichas_${tipo}`);
        console.error(`   Erro:`, error.message);
        if (error.code === 'PERMISSION_DENIED') {
            console.error(`🚨 ERRO DE PERMISSÃO! Verifique as regras de segurança no Firebase Console!`);
        }
        return [];
    }
}
```

#### Inicialização do Firebase:

```javascript
async inicializar() {
    try {
        // Verificar se Firebase SDK está carregado
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK não está carregado!');
            this.usarLocalStorage = true;
            return false;
        }

        // Verificar se configuração existe
        if (!window.FIREBASE_CONFIG) {
            console.error('❌ FIREBASE_CONFIG não encontrado!');
            this.usarLocalStorage = true;
            return false;
        }

        this.config = window.FIREBASE_CONFIG;
        console.log('✅ FIREBASE_CONFIG encontrado:', this.config);
        console.log('✅ databaseURL:', this.config.databaseURL);

        // Inicializar Firebase App
        console.log('🔧 Inicializando Firebase App...');
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
            console.log('✅ Firebase App inicializado');
        } else {
            console.log('✅ Firebase App já estava inicializado');
        }

        // Obter referência do database
        console.log('🔧 Obtendo referência do Realtime Database...');
        this.database = firebase.database();
        this.inicializado = true;
        this.usarLocalStorage = false;

        console.log('✅ Firebase Realtime Database inicializado com sucesso!');
        console.log('   Database URL:', this.config.databaseURL);
        
        // Notificar que Firebase está pronto
        window.dispatchEvent(new CustomEvent('firebaseReady', { detail: { firebaseDB: this } }));
        console.log('📢 Evento firebaseReady disparado');
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
        console.error('   Detalhes:', error.message);
        console.error('   Stack:', error.stack);
        this.usarLocalStorage = true;
        return false;
    }
}
```

### Arquivo: `js/armazenamento-reclamacoes.js`

#### Método `carregarTodos(tipo)` - Usa o Firebase para carregar:

```javascript
async carregarTodos(tipo) {
    console.log(`📥 carregarTodos chamado para tipo: ${tipo}`);
    console.log(`🔍 Estado atual: usarFirebase=${this.usarFirebase}, firebaseDB.inicializado=${window.firebaseDB?.inicializado}`);
    
    const chave = this.chaves[tipo];
    if (!chave) {
        console.error(`❌ Tipo inválido: ${tipo}`);
        return [];
    }
    
    // PRIORIDADE 1: Tentar carregar do Firebase (armazenamento compartilhado)
    // Re-verificar Firebase antes de carregar (pode ter sido inicializado depois)
    console.log(`🔍 Verificando Firebase antes de carregar ${tipo}...`);
    console.log(`   usarFirebase: ${this.usarFirebase}`);
    console.log(`   window.firebaseDB: ${window.firebaseDB ? 'existe' : 'não existe'}`);
    console.log(`   window.firebaseDB?.inicializado: ${window.firebaseDB?.inicializado}`);
    console.log(`   window.firebaseDB?.usarLocalStorage: ${window.firebaseDB?.usarLocalStorage}`);
    
    if (!this.usarFirebase || !window.firebaseDB || !window.firebaseDB.inicializado) {
        console.log('🔄 Re-verificando Firebase antes de carregar...');
        const ativado = this.verificarEAtivarFirebase();
        if (ativado) {
            console.log('✅ Firebase detectado durante carregamento, ativando...');
        } else {
            console.log('⚠️ Firebase ainda não está disponível após verificação');
        }
    }
    
    // Forçar verificação novamente antes de usar
    if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
        if (!this.usarFirebase) {
            console.log('🔄 Firebase disponível mas não estava ativo, ativando agora...');
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
            console.log('✅ Firebase ativado imediatamente antes de carregar!');
        }
    }
    
    console.log(`🔍 Estado final antes de tentar carregar: usarFirebase=${this.usarFirebase}, firebaseDB.inicializado=${window.firebaseDB?.inicializado}`);
    
    if (this.usarFirebase && window.firebaseDB && window.firebaseDB.inicializado) {
        try {
            console.log(`🔥 Carregando do Firebase (tipo: ${tipo})...`);
            console.log(`🔍 Estado: usarFirebase=${this.usarFirebase}, firebaseDB.inicializado=${window.firebaseDB.inicializado}`);
            
            const data = await window.firebaseDB.carregar(tipo);
            
            console.log(`📊 Dados retornados do Firebase para ${tipo}:`, data);
            console.log(`📊 É array?`, Array.isArray(data));
            console.log(`📊 Tamanho:`, data ? data.length : 'null/undefined');
            
            // Ordenar por dataCriacao (se existir) ou data de recebimento
            if (data && Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => {
                    const dataA = a.dataCriacao || a.dataRecebimento || a.dataEntrada || 0;
                    const dataB = b.dataCriacao || b.dataRecebimento || b.dataEntrada || 0;
                    return new Date(dataB) - new Date(dataA);
                });
                console.log(`✅ ${data.length} reclamações ${tipo} carregadas do Firebase e ordenadas`);
                // NÃO salvar no localStorage quando dados vêm do Firebase
                return data;
            } else {
                console.log(`⚠️ Nenhuma reclamação ${tipo} encontrada no Firebase (retornou: ${data ? 'array vazio' : 'null/undefined'})`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar do Firebase:`, error);
            console.error(`   Tipo: ${tipo}`);
            console.error(`   Stack: ${error.stack}`);
            // NÃO fazer fallback para localStorage se Firebase está ativo
            if (this.usarFirebase) {
                console.error(`⚠️ Firebase está ativo mas falhou ao carregar. NÃO usando localStorage!`);
                return [];
            }
        }
    } else {
        const motivo = [];
        if (!this.usarFirebase) motivo.push('usarFirebase=false');
        if (!window.firebaseDB) motivo.push('firebaseDB não existe');
        else {
            if (!window.firebaseDB.inicializado) motivo.push('firebaseDB.inicializado=false');
            if (window.firebaseDB.usarLocalStorage) motivo.push('firebaseDB.usarLocalStorage=true');
        }
        console.warn(`⚠️ Firebase não disponível para carregar ${tipo}. Motivos: ${motivo.join(', ')}`);
    }
    
    // FALLBACK: Carregar do localStorage APENAS se Firebase não estiver disponível
    if (!this.usarFirebase) {
        // ... código de fallback para localStorage ...
    }
    
    return [];
}
```

## 📊 2. Estrutura dos Dados no Realtime Database

### Estrutura Hierárquica:

```
https://bacen-n2-default-rtdb.firebaseio.com/
├── fichas_bacen/
│   ├── [id-da-ficha-1]/
│   │   ├── id: "mjbykn0eldefnznwxuc"
│   │   ├── nomeCliente: "Nome do Cliente"
│   │   ├── nomeCompleto: "Nome Completo do Cliente"
│   │   ├── cpf: "12345678900"
│   │   ├── cpfTratado: "123.456.789-00"
│   │   ├── telefone: "(11) 99999-9999"
│   │   ├── origem: "Origem da Reclamação"
│   │   ├── status: "em-tratamento"
│   │   ├── dataCriacao: "2025-01-15T10:30:00.000Z"
│   │   ├── dataRecebimento: "2025-01-15T10:30:00.000Z"
│   │   ├── finalizadoEm: null
│   │   ├── responsavel: "Nome do Responsável"
│   │   ├── motivoReduzido: "Motivo da Reclamação"
│   │   ├── motivoDetalhado: "Detalhes da Reclamação"
│   │   ├── observacoes: "Observações adicionais"
│   │   ├── mes: "2025-01"
│   │   ├── tipoDemanda: "bacen"
│   │   ├── enviarCobranca: false
│   │   ├── pixLiberado: false
│   │   ├── aceitouLiquidacao: false
│   │   ├── concluido: false
│   │   ├── modulosContato: {...}
│   │   ├── tentativas: {...}
│   │   ├── protocolos: {...}
│   │   └── camposEspecificos: {...}
│   ├── [id-da-ficha-2]/
│   └── ...
├── fichas_n2/
│   ├── [id-da-ficha-1]/
│   │   ├── id: "mjbykn0pfd5ol2cdbkq"
│   │   ├── nomeCliente: "Nome do Cliente"
│   │   ├── nomeCompleto: "Nome Completo do Cliente"
│   │   ├── cpf: "12345678900"
│   │   ├── origem: "Origem da Reclamação"
│   │   ├── status: "em-tratamento"
│   │   ├── motivoReduzido: "Motivo da Reclamação"
│   │   ├── tipoDemanda: "n2"
│   │   └── ... (mesma estrutura de fichas_bacen, mas SEM campo "origem" para chatbot)
│   └── ...
└── fichas_chatbot/
    ├── [id-da-ficha-1]/
    │   ├── id: "mjbykn0u3ijuetnqqtd"
    │   ├── nomeCliente: "Nome do Cliente"
    │   ├── nomeCompleto: "Nome Completo do Cliente"
    │   ├── cpf: "12345678900"
    │   ├── status: "em-tratamento"
    │   ├── canal: "WhatsApp"
    │   ├── tipoDemanda: "chatbot"
    │   └── ... (mesma estrutura, mas SEM campo "origem")
    └── ...
```

### Exemplo JSON de uma Ficha BACEN:

```json
{
  "id": "mjbykn0eldefnznwxuc",
  "nomeCliente": "Pedro Henrique Freitas Rocha",
  "nomeCompleto": "Pedro Henrique Freitas Rocha",
  "cpf": "12345678900",
  "cpfTratado": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "origem": "Site",
  "status": "em-tratamento",
  "dataCriacao": "2025-01-15T10:30:00.000Z",
  "dataRecebimento": "2025-01-15T10:30:00.000Z",
  "finalizadoEm": null,
  "responsavel": "João Silva",
  "motivoReduzido": "Cobrança indevida",
  "motivoDetalhado": "Cliente relata cobrança indevida no valor de R$ 100,00",
  "observacoes": "Aguardando resposta do cliente",
  "mes": "2025-01",
  "tipoDemanda": "bacen",
  "enviarCobranca": false,
  "pixLiberado": false,
  "aceitouLiquidacao": false,
  "concluido": false,
  "modulosContato": {},
  "tentativas": {},
  "protocolos": {},
  "camposEspecificos": {}
}
```

### Exemplo JSON de uma Ficha Chatbot:

```json
{
  "id": "mjbykn0u3ijuetnqqtd",
  "nomeCliente": "Maria Silva",
  "nomeCompleto": "Maria Silva",
  "cpf": "98765432100",
  "cpfTratado": "987.654.321-00",
  "telefone": "(11) 88888-8888",
  "status": "em-tratamento",
  "canal": "WhatsApp",
  "dataCriacao": "2025-01-15T10:30:00.000Z",
  "dataRecebimento": "2025-01-15T10:30:00.000Z",
  "finalizadoEm": null,
  "responsavel": "João Silva",
  "motivoReduzido": "Dúvida sobre produto",
  "observacoes": "Cliente entrou em contato via chatbot",
  "mes": "2025-01",
  "tipoDemanda": "chatbot",
  "enviarCobranca": false,
  "pixLiberado": false,
  "aceitouLiquidacao": false,
  "concluido": false,
  "modulosContato": {},
  "tentativas": {},
  "protocolos": {},
  "camposEspecificos": {}
}
```

## 🔧 3. Configuração do Firebase

### Arquivo: `js/config-firebase.js`

```javascript
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyAVoOWyvMjk29hm9OZ7g7EcOnIkHklFGSQ",
    authDomain: "bacen-n2.firebaseapp.com",
    databaseURL: "https://bacen-n2-default-rtdb.firebaseio.com",
    projectId: "bacen-n2",
    storageBucket: "bacen-n2.firebasestorage.app",
    messagingSenderId: "165884440954",
    appId: "1:165884440954:web:df1d0482e9cf7fc54da6c3",
    measurementId: "G-GV7KFPPYFE"
};
```

## 🔐 4. Regras de Segurança do Realtime Database

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

## 📝 5. Problema Atual

**Situação:**
- ✅ Os dados estão sendo **salvos** corretamente no Firebase Realtime Database
- ❌ Os dados **não estão sendo carregados** e exibidos nas listas do sistema
- ⚠️ O sistema está usando `localStorage` como fallback, mas os dados não estão lá

**Logs do Console:**
- `✅ Firebase Realtime Database inicializado com sucesso!`
- `📢 Evento firebaseReady disparado`
- `⚠️ Firebase não disponível para carregar [tipo]. Motivos: usarFirebase=false, firebaseDB.inicializado=false`
- `📦 Fichas carregadas do localStorage (fallback): 0`

**Possíveis Causas:**
1. Timing: Firebase inicializa depois que o código tenta carregar
2. Verificação: O sistema não está detectando que o Firebase está pronto
3. Conversão: Problema na conversão do objeto do Firebase para array

## 🛠️ 6. Versão do Firebase SDK

```html
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
```

## 📍 7. Localização do Banco de Dados

- **Região:** Estados Unidos (us-central1)
- **URL:** https://bacen-n2-default-rtdb.firebaseio.com

