/* === FIREBASE REALTIME DATABASE - SUBSTITUIÇÃO DO SUPABASE === */
/* VERSÃO: v2.3.0 | DATA: 2025-02-01 | ALTERAÇÕES: Removido salvamento de logs de debug no localStorage para evitar quota excedida */

class FirebaseDB {
    constructor() {
        this.database = null;
        this.inicializado = false;
        this.usarLocalStorage = false;
        this.config = null;
    }

    async inicializar() {
        try {
            console.log('🔍 Tentando inicializar Firebase...');
            
            // Verificar se Firebase está disponível
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK não está carregado!');
                console.error('   Verifique se os scripts do Firebase estão incluídos no HTML antes de firebase-db.js');
                this.usarLocalStorage = true;
                return false;
            }
            console.log('✅ Firebase SDK carregado');

            // Verificar configuração
            if (!window.FIREBASE_CONFIG) {
                console.error('❌ FIREBASE_CONFIG não encontrado!');
                console.error('   Verifique se js/config-firebase.js está carregado antes de firebase-db.js');
                this.usarLocalStorage = true;
                return false;
            }
            console.log('✅ FIREBASE_CONFIG encontrado:', window.FIREBASE_CONFIG);

            this.config = window.FIREBASE_CONFIG;

            // Verificar se databaseURL está presente
            if (!this.config.databaseURL) {
                console.error('❌ databaseURL não encontrado na configuração!');
                console.error('   Certifique-se de que o Realtime Database foi criado no Firebase Console');
                this.usarLocalStorage = true;
                return false;
            }
            console.log('✅ databaseURL:', this.config.databaseURL);

            // Inicializar Firebase
            if (!firebase.apps || firebase.apps.length === 0) {
                console.log('🔧 Inicializando Firebase App...');
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

    // Salvar uma ficha
    async salvar(tipo, ficha) {
        console.log(`💾 [FirebaseDB.salvar] Chamado - tipo: ${tipo}, ID: ${ficha?.id}`);
        console.log(`🔍 [FirebaseDB.salvar] Estado: inicializado=${this.inicializado}, usarLocalStorage=${this.usarLocalStorage}`);
        
        if (!this.inicializado || this.usarLocalStorage) {
            console.warn(`⚠️ Firebase não inicializado ou usando localStorage. Tipo: ${tipo}, ID: ${ficha.id}`);
            return false;
        }

        if (!this.database) {
            console.error(`❌ this.database não está disponível!`);
            return false;
        }

        try {
            const caminho = `fichas_${tipo}/${ficha.id}`;
            console.log(`📤 [FirebaseDB.salvar] Salvando em: ${caminho}`);
            console.log(`📦 [FirebaseDB.salvar] Dados:`, JSON.stringify(ficha).substring(0, 200) + '...');
            
            await this.database.ref(caminho).set(ficha);
            console.log(`✅ [FirebaseDB.salvar] Ficha ${tipo} salva no Firebase: ${ficha.id}`);
            
            return true;
        } catch (error) {
            console.error(`❌ [FirebaseDB.salvar] Erro ao salvar ficha ${tipo} no Firebase:`, error);
            console.error(`   Caminho: fichas_${tipo}/${ficha.id}`);
            console.error(`   Erro:`, error.message);
            console.error(`   Stack:`, error.stack);
            
            if (error.code === 'PERMISSION_DENIED') {
                console.error(`🚨 ERRO DE PERMISSÃO! Verifique as regras de segurança no Firebase Console!`);
                console.error(`   Caminho tentado: fichas_${tipo}/${ficha.id}`);
            }
            return false;
        }
    }

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
            
            console.log(`📊 [FirebaseDB.carregar] Dados brutos do Firebase para ${tipo}:`, dados);
            console.log(`📊 [FirebaseDB.carregar] Tipo dos dados:`, typeof dados);
            console.log(`📊 [FirebaseDB.carregar] É objeto?`, dados && typeof dados === 'object' && !Array.isArray(dados));
            console.log(`📊 [FirebaseDB.carregar] snapshot.exists():`, snapshot.exists());
            
            if (!snapshot.exists() || !dados || dados === null) {
                console.warn(`⚠️ [FirebaseDB.carregar] Nenhuma ficha ${tipo} encontrada no Firebase`);
                return [];
            }
            
            // Verificar se dados é um objeto (estrutura do Firebase)
            if (typeof dados !== 'object' || Array.isArray(dados)) {
                console.error(`❌ [FirebaseDB.carregar] Dados não é um objeto válido! Tipo: ${typeof dados}, É array: ${Array.isArray(dados)}`);
                return [];
            }
            
            const keys = Object.keys(dados);
            console.log(`📊 [FirebaseDB.carregar] Número de chaves encontradas: ${keys.length}`);
            if (keys.length > 0) {
                console.log(`📊 [FirebaseDB.carregar] Primeiras 3 chaves:`, keys.slice(0, 3));
            }

            // Converter objeto em array
            // IMPORTANTE: Object.keys(dados) retorna os IDs das fichas
            // Precisamos garantir que cada ficha tenha o ID correto
            const fichas = Object.keys(dados).map(id => {
                const ficha = dados[id];
                // Garantir que o ID está presente (pode não estar no objeto salvo)
                if (!ficha.id || ficha.id !== id) {
                    ficha.id = id;
                }
                return ficha;
            });
            
            console.log(`✅ [FirebaseDB.carregar] ${fichas.length} fichas ${tipo} carregadas do Firebase`);
            if (fichas.length > 0) {
                console.log(`📋 [FirebaseDB.carregar] Primeira ficha ${tipo}:`, {
                    id: fichas[0].id,
                    nome: fichas[0].nomeCliente || fichas[0].nomeCompleto || 'sem nome'
                });
                console.log(`📋 [FirebaseDB.carregar] IDs das fichas:`, fichas.map(f => f.id).slice(0, 5));
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

// Criar instância global do FirebaseDB
// IMPORTANTE: Esta instância deve ser criada ANTES de armazenamento-reclamacoes.js ser carregado
if (!window.firebaseDB) {
    window.firebaseDB = new FirebaseDB();
    console.log('✅ Instância global do FirebaseDB criada');
}

// Aguardar Firebase carregar e inicializar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM carregado, aguardando Firebase SDK...');
    // Aguardar mais tempo para garantir que Firebase SDK está carregado
    setTimeout(async () => {
        console.log('⏰ Iniciando inicialização do Firebase...');
        if (window.firebaseDB) {
            const sucesso = await window.firebaseDB.inicializar();
            if (sucesso) {
                console.log('🎉 Firebase pronto para uso!');
            } else {
                console.error('❌ Falha na inicialização do Firebase. Usando localStorage.');
            }
        } else {
            console.error('❌ window.firebaseDB não está disponível!');
        }
    }, 1000);
});

