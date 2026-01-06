/* === FIREBASE REALTIME DATABASE - SUBSTITUIÇÃO DO SUPABASE === */
/* VERSÃO: v2.4.0 | DATA: 2025-02-01 | ALTERAÇÕES: Adicionada função excluirTodasFichas que mantém estrutura dos caminhos, função global resetarBasesBacenEChatbot */

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

    /**
     * Exclui TODAS as fichas de um tipo específico do Firebase, mas MANTÉM a estrutura do caminho
     * ⚠️ AÇÃO DESTRUTIVA - Use com cuidado!
     * Isso garante que a próxima importação funcione normalmente, pois o caminho permanece válido
     * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
     * @returns {Promise<Object>} { sucesso: boolean, quantidadeExcluida: number, erro?: string }
     */
    async excluirTodasFichas(tipo = 'bacen') {
        if (!this.inicializado || this.usarLocalStorage) {
            console.warn('⚠️ Firebase não inicializado ou usando localStorage. Não é possível excluir do Firebase.');
            return { sucesso: false, quantidadeExcluida: 0, erro: 'Firebase não inicializado' };
        }

        if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
            return { sucesso: false, quantidadeExcluida: 0, erro: 'Tipo inválido. Use: bacen, n2 ou chatbot' };
        }

        try {
            const caminho = `fichas_${tipo}`;
            
            // Primeiro, contar quantas fichas existem
            const snapshot = await this.database.ref(caminho).once('value');
            const dados = snapshot.val() || {};
            const quantidade = Object.keys(dados).length;
            
            if (quantidade === 0) {
                console.log(`ℹ️ Nenhuma ficha ${tipo} encontrada para excluir.`);
                // Mesmo sem fichas, garantir que o caminho existe (estrutura preservada)
                await this.database.ref(caminho).set({});
                return { sucesso: true, quantidadeExcluida: 0 };
            }

            console.log(`⚠️ ATENÇÃO: Excluindo ${quantidade} fichas do tipo '${tipo}' do Firebase...`);
            
            // IMPORTANTE: Excluir todas as fichas, mas MANTER o caminho com objeto vazio
            // Isso preserva a estrutura para que a próxima importação funcione normalmente
            await this.database.ref(caminho).set({});
            
            console.log(`✅ ${quantidade} fichas ${tipo} excluídas com sucesso do Firebase!`);
            console.log(`✅ Estrutura do caminho '${caminho}' preservada (vazia, mas pronta para receber novos dados).`);
            
            // Também limpar localStorage relacionado
            const chavesLocalStorage = [
                `velotax_reclamacoes_${tipo}`,
                `velotax_demandas_${tipo}`,
                `${tipo}-complaints`,
                `${tipo}-form-draft`
            ];
            
            let limpasLocalStorage = 0;
            chavesLocalStorage.forEach(chave => {
                if (localStorage.getItem(chave)) {
                    localStorage.removeItem(chave);
                    limpasLocalStorage++;
                }
            });
            
            if (limpasLocalStorage > 0) {
                console.log(`✅ ${limpasLocalStorage} chaves do localStorage relacionadas a ${tipo} foram limpas.`);
            }
            
            return { 
                sucesso: true, 
                quantidadeExcluida: quantidade,
                limpasLocalStorage: limpasLocalStorage
            };
        } catch (error) {
            console.error(`❌ Erro ao excluir todas as fichas ${tipo} do Firebase:`, error);
            return { 
                sucesso: false, 
                quantidadeExcluida: 0, 
                erro: error.message 
            };
        }
    }
}

// Criar instância global do FirebaseDB
// IMPORTANTE: Esta instância deve ser criada ANTES de armazenamento-reclamacoes.js ser carregado
if (!window.firebaseDB) {
    window.firebaseDB = new FirebaseDB();
    console.log('✅ Instância global do FirebaseDB criada');
}

// Função global para resetar bases (excluir dados mas manter estrutura)
/**
 * Reseta as bases BACEN e Chatbot no Firebase
 * Exclui todos os dados mas mantém a estrutura dos caminhos para que a próxima importação funcione
 * 
 * Uso no console do navegador:
 *   await resetarBasesBacenEChatbot()
 * 
 * Ou para resetar apenas uma:
 *   await window.firebaseDB.excluirTodasFichas('bacen')
 *   await window.firebaseDB.excluirTodasFichas('chatbot')
 */
window.resetarBasesBacenEChatbot = async function() {
    console.log('🔄 Iniciando reset das bases BACEN e Chatbot...');
    console.log('⚠️ ATENÇÃO: Esta operação excluirá TODOS os dados, mas manterá a estrutura dos caminhos.');
    
    if (!window.firebaseDB || !window.firebaseDB.inicializado) {
        console.error('❌ Firebase não está inicializado. Aguarde alguns segundos e tente novamente.');
        return { sucesso: false, erro: 'Firebase não inicializado' };
    }

    const resultados = {
        bacen: null,
        chatbot: null
    };

    try {
        // Resetar BACEN
        console.log('\n📋 Resetando base BACEN...');
        resultados.bacen = await window.firebaseDB.excluirTodasFichas('bacen');
        
        // Resetar Chatbot
        console.log('\n📋 Resetando base Chatbot...');
        resultados.chatbot = await window.firebaseDB.excluirTodasFichas('chatbot');
        
        const totalExcluido = (resultados.bacen?.quantidadeExcluida || 0) + (resultados.chatbot?.quantidadeExcluida || 0);
        
        if (resultados.bacen?.sucesso && resultados.chatbot?.sucesso) {
            console.log('\n✅ Reset concluído com sucesso!');
            console.log(`   - BACEN: ${resultados.bacen.quantidadeExcluida} fichas excluídas`);
            console.log(`   - Chatbot: ${resultados.chatbot.quantidadeExcluida} fichas excluídas`);
            console.log(`   - Total: ${totalExcluido} fichas excluídas`);
            console.log('✅ Estruturas dos caminhos preservadas. Pronto para nova importação!');
        } else {
            console.error('\n❌ Erro durante o reset:');
            if (!resultados.bacen?.sucesso) {
                console.error('   - BACEN:', resultados.bacen?.erro || 'Erro desconhecido');
            }
            if (!resultados.chatbot?.sucesso) {
                console.error('   - Chatbot:', resultados.chatbot?.erro || 'Erro desconhecido');
            }
        }
        
        return resultados;
    } catch (error) {
        console.error('❌ Erro ao resetar bases:', error);
        return { sucesso: false, erro: error.message, resultados };
    }
};

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
                console.log('💡 Para resetar bases BACEN e Chatbot, execute: await resetarBasesBacenEChatbot()');
            } else {
                console.error('❌ Falha na inicialização do Firebase. Usando localStorage.');
            }
        } else {
            console.error('❌ window.firebaseDB não está disponível!');
        }
    }, 1000);
});

