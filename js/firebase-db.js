/* === FIREBASE REALTIME DATABASE - SUBSTITUIÇÃO DO SUPABASE === */

class FirebaseDB {
    constructor() {
        this.database = null;
        this.inicializado = false;
        this.usarLocalStorage = false;
        this.config = null;
    }

    async inicializar() {
        try {
            // Verificar se Firebase está disponível
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase não está carregado. Usando localStorage como fallback.');
                this.usarLocalStorage = true;
                return false;
            }

            // Verificar configuração
            if (!window.FIREBASE_CONFIG) {
                console.warn('⚠️ FIREBASE_CONFIG não encontrado. Usando localStorage como fallback.');
                this.usarLocalStorage = true;
                return false;
            }

            this.config = window.FIREBASE_CONFIG;

            // Inicializar Firebase
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(this.config);
            }

            // Obter referência do database
            this.database = firebase.database();
            this.inicializado = true;
            this.usarLocalStorage = false;

            console.log('✅ Firebase Realtime Database inicializado com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            this.usarLocalStorage = true;
            return false;
        }
    }

    // Salvar uma ficha
    async salvar(tipo, ficha) {
        if (!this.inicializado || this.usarLocalStorage) {
            return false;
        }

        try {
            const caminho = `fichas_${tipo}/${ficha.id}`;
            await this.database.ref(caminho).set(ficha);
            console.log(`✅ Ficha ${tipo} salva no Firebase: ${ficha.id}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar ficha ${tipo} no Firebase:`, error);
            return false;
        }
    }

    // Carregar todas as fichas de um tipo
    async carregar(tipo) {
        if (!this.inicializado || this.usarLocalStorage) {
            return [];
        }

        try {
            const caminho = `fichas_${tipo}`;
            const snapshot = await this.database.ref(caminho).once('value');
            const dados = snapshot.val();
            
            if (!dados) {
                return [];
            }

            // Converter objeto em array
            const fichas = Object.keys(dados).map(id => dados[id]);
            console.log(`✅ ${fichas.length} fichas ${tipo} carregadas do Firebase`);
            return fichas;
        } catch (error) {
            console.error(`❌ Erro ao carregar fichas ${tipo} do Firebase:`, error);
            return [];
        }
    }

    // Carregar todas as fichas (todos os tipos)
    async carregarTodos() {
        if (!this.inicializado || this.usarLocalStorage) {
            return {
                bacen: [],
                n2: [],
                chatbot: []
            };
        }

        try {
            const [bacen, n2, chatbot] = await Promise.all([
                this.carregar('bacen'),
                this.carregar('n2'),
                this.carregar('chatbot')
            ]);

            return { bacen, n2, chatbot };
        } catch (error) {
            console.error('❌ Erro ao carregar todas as fichas do Firebase:', error);
            return {
                bacen: [],
                n2: [],
                chatbot: []
            };
        }
    }

    // Excluir uma ficha
    async excluir(tipo, id) {
        if (!this.inicializado || this.usarLocalStorage) {
            return false;
        }

        try {
            const caminho = `fichas_${tipo}/${id}`;
            await this.database.ref(caminho).remove();
            console.log(`✅ Ficha ${tipo} excluída do Firebase: ${id}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao excluir ficha ${tipo} do Firebase:`, error);
            return false;
        }
    }

    // Verificar se uma ficha existe
    async existe(tipo, id) {
        if (!this.inicializado || this.usarLocalStorage) {
            return false;
        }

        try {
            const caminho = `fichas_${tipo}/${id}`;
            const snapshot = await this.database.ref(caminho).once('value');
            return snapshot.exists();
        } catch (error) {
            console.error(`❌ Erro ao verificar existência da ficha ${tipo} no Firebase:`, error);
            return false;
        }
    }
}

// Inicializar quando a página carregar
window.firebaseDB = new FirebaseDB();

// Aguardar Firebase carregar e inicializar
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar um pouco para garantir que Firebase está carregado
    setTimeout(async () => {
        await window.firebaseDB.inicializar();
    }, 500);
});

