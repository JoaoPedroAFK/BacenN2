/**
 * Firebase Manager - Sistema Robusto de Inicialização
 * Versão: v1.0.0
 * Projeto: BacenN2
 * 
 * Gerencia a inicialização do Firebase Realtime Database
 * e fornece sistema de eventos para sincronização
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
        console.log('🔥 Iniciando inicialização do Firebase...');
        
        // Verificar se Firebase já está carregado
        if (typeof firebase === 'undefined') {
          throw new Error('Firebase SDK não está carregado. Verifique se o script do Firebase foi incluído antes deste arquivo.');
        }

        // Configuração do Firebase - Credenciais do projeto bacen-n2
        const firebaseConfig = {
          apiKey: "AIzaSyAVoOWyvMjk29hm9OZ7g7EcOnIkHklFGSQ",
          authDomain: "bacen-n2.firebaseapp.com",
          databaseURL: "https://bacen-n2-default-rtdb.firebaseio.com",
          projectId: "bacen-n2",
          storageBucket: "bacen-n2.firebasestorage.app",
          messagingSenderId: "165884440954",
          appId: "1:165884440954:web:df1d0482e9cf7fc54da6c3"
        };

        // Inicializar Firebase
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        
        this.firebaseDB = firebase.database();
        console.log('✅ Firebase app inicializado');
        
        // Aguardar conexão
        await this.waitForConnection();
        
        this.isReady = true;
        this.notifyListeners();
        
        // Disparar evento global
        window.dispatchEvent(new CustomEvent('firebaseReady', {
          detail: { firebaseDB: this.firebaseDB }
        }));
        
        console.log('✅ Firebase inicializado com sucesso e conectado');
        return this.firebaseDB;
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
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
      const timeout = setTimeout(() => {
        connectedRef.off();
        reject(new Error('Timeout ao conectar ao Firebase (10s)'));
      }, 10000);

      const connectedRef = this.firebaseDB.ref('.info/connected');
      connectedRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearTimeout(timeout);
          connectedRef.off();
          console.log('✅ Conectado ao Firebase Realtime Database');
          resolve();
        }
      });

      // Verificar se já está conectado
      connectedRef.once('value', (snapshot) => {
        if (snapshot.val() === true) {
          clearTimeout(timeout);
          connectedRef.off();
          console.log('✅ Já conectado ao Firebase Realtime Database');
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
    console.log(`📢 Notificando ${this.listeners.length} listeners que Firebase está pronto`);
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ Erro ao executar listener:', error);
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
      console.error('❌ Erro crítico ao inicializar Firebase:', error);
    });
  });
} else {
  // DOM já está pronto
  window.firebaseManager.initialize().catch(error => {
    console.error('❌ Erro crítico ao inicializar Firebase:', error);
  });
}

