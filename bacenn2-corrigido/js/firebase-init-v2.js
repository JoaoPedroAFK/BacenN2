/**
 * Firebase Manager - Sistema Robusto de Inicialização (VERSÃO CORRIGIDA)
 * Versão: v2.0.0
 * Projeto: BacenN2
 * 
 * Gerencia a inicialização do Firebase Realtime Database
 * e fornece sistema de eventos para sincronização
 * 
 * CORREÇÕES IMPLEMENTADAS:
 * - Aguarda conexão antes de marcar como pronto
 * - Sistema de eventos para sincronização
 * - Tratamento de erros completo
 * - Compatível com estrutura existente do projeto
 */
class FirebaseManager {
  constructor() {
    this.firebaseDB = null;
    this.isReady = false;
    this.listeners = [];
    this.initializationPromise = null;
  }

  /**
   * Inicializa o Firebase e aguarda conexão
   */
  async initialize() {
    // Evitar múltiplas inicializações
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('🔥 [FirebaseManager] Iniciando inicialização do Firebase...');
        
        // Verificar se Firebase já está carregado
        if (typeof firebase === 'undefined') {
          throw new Error('Firebase SDK não está carregado. Verifique se o script do Firebase foi incluído antes deste arquivo.');
        }

        // Usar configuração do projeto (já existe em config-firebase.js)
        if (!window.FIREBASE_CONFIG) {
          throw new Error('FIREBASE_CONFIG não encontrado. Verifique se config-firebase.js está carregado.');
        }

        const firebaseConfig = window.FIREBASE_CONFIG;
        console.log('✅ [FirebaseManager] Configuração encontrada:', firebaseConfig.databaseURL);

        // Inicializar Firebase
        if (!firebase.apps || firebase.apps.length === 0) {
          console.log('🔧 [FirebaseManager] Inicializando Firebase App...');
          firebase.initializeApp(firebaseConfig);
          console.log('✅ [FirebaseManager] Firebase App inicializado');
        } else {
          console.log('✅ [FirebaseManager] Firebase App já estava inicializado');
        }
        
        this.firebaseDB = firebase.database();
        console.log('✅ [FirebaseManager] Firebase Database obtido');
        
        // Aguardar conexão
        await this.waitForConnection();
        
        this.isReady = true;
        this.notifyListeners();
        
        // Aguardar firebase-db.js criar window.firebaseDB e então atualizar
        // O firebase-db.js já cria window.firebaseDB, então vamos garantir que está inicializado
        if (window.firebaseDB) {
          // Atualizar a instância existente com o database conectado
          window.firebaseDB.database = this.firebaseDB;
          window.firebaseDB.inicializado = true;
          window.firebaseDB.usarLocalStorage = false;
          console.log('✅ [FirebaseManager] window.firebaseDB atualizado com database conectado');
        }
        
        // Disparar evento global (compatível com código existente)
        window.dispatchEvent(new CustomEvent('firebaseReady', {
          detail: { 
            firebaseDB: window.firebaseDB || { database: this.firebaseDB, inicializado: true, usarLocalStorage: false },
            firebaseManager: this,
            database: this.firebaseDB
          }
        }));
        
        console.log('✅ [FirebaseManager] Firebase inicializado com sucesso e conectado');
        return this.firebaseDB;
      } catch (error) {
        console.error('❌ [FirebaseManager] Erro ao inicializar Firebase:', error);
        this.isReady = false;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Aguarda conexão com o Firebase Realtime Database
   */
  waitForConnection() {
    return new Promise((resolve, reject) => {
      let connectedRef;
      const timeout = setTimeout(() => {
        if (connectedRef) connectedRef.off();
        reject(new Error('Timeout ao conectar ao Firebase (10s)'));
      }, 10000);

      connectedRef = this.firebaseDB.ref('.info/connected');
      connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearTimeout(timeout);
          connectedRef.off();
          console.log('✅ [FirebaseManager] Conectado ao Firebase Realtime Database');
          resolve();
        }
      });

      // Verificar se já está conectado
      connectedRef.once('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearTimeout(timeout);
          connectedRef.off();
          console.log('✅ [FirebaseManager] Já conectado ao Firebase Realtime Database');
          resolve();
        }
      });
    });
  }

  /**
   * Registra callback para quando Firebase estiver pronto
   * @param {Function} callback - Função a ser chamada quando Firebase estiver pronto
   */
  onReady(callback) {
    if (this.isReady) {
      // Já está pronto, chamar imediatamente
      callback();
    } else {
      // Adicionar à lista de listeners
      this.listeners.push(callback);
    }
  }

  /**
   * Notifica todos os listeners que Firebase está pronto
   */
  notifyListeners() {
    console.log(`📢 [FirebaseManager] Notificando ${this.listeners.length} listeners que Firebase está pronto`);
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ [FirebaseManager] Erro ao executar listener:', error);
      }
    });
    this.listeners = [];
  }

  /**
   * Retorna a instância do database
   * @returns {firebase.database.Database} Instância do Firebase Database
   */
  getDatabase() {
    if (!this.isReady) {
      throw new Error('Firebase não está pronto. Use onReady() primeiro ou aguarde o evento firebaseReady.');
    }
    return this.firebaseDB;
  }

  /**
   * Verifica se Firebase está pronto
   * @returns {Boolean} true se está pronto
   */
  getReady() {
    return this.isReady;
  }
}

// Criar instância global
window.firebaseManager = new FirebaseManager();

// Inicializar automaticamente quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.firebaseManager.initialize().catch(error => {
      console.error('❌ [FirebaseManager] Erro crítico ao inicializar Firebase:', error);
    });
  });
} else {
  // DOM já está pronto
  window.firebaseManager.initialize().catch(error => {
    console.error('❌ [FirebaseManager] Erro crítico ao inicializar Firebase:', error);
  });
}

