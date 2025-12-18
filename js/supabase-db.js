/* === GERENCIADOR DE DADOS SUPABASE === */
/* Substitui o localStorage por armazenamento persistente no Supabase */

class SupabaseDB {
    constructor() {
        this.supabase = null;
        this.usarLocalStorage = false; // Fallback para localStorage
        this.inicializar();
    }

    inicializar() {
        // Aguardar um pouco para garantir que os scripts foram carregados
        setTimeout(() => {
            // Verificar se Supabase está disponível
            console.log('🔍 Inicializando SupabaseDB...');
            console.log('🔍 window.supabase:', typeof window.supabase);
            console.log('🔍 window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG ? 'existe' : 'não existe');
            
            if (window.SUPABASE_CONFIG) {
                console.log('🔍 SUPABASE_CONFIG.url:', window.SUPABASE_CONFIG.url);
                console.log('🔍 SUPABASE_CONFIG.anonKey:', window.SUPABASE_CONFIG.anonKey ? 'existe' : 'não existe');
            }
            
            if (window.supabase && window.SUPABASE_CONFIG) {
                try {
                    this.supabase = window.supabase.createClient(
                        window.SUPABASE_CONFIG.url,
                        window.SUPABASE_CONFIG.anonKey
                    );
                    console.log('✅ Supabase DB inicializado com sucesso');
                    console.log('✅ this.supabase:', this.supabase ? 'criado' : 'não criado');
                    console.log('✅ this.usarLocalStorage:', this.usarLocalStorage);
                    
                    // Testar conexão com uma query simples
                    this.testarConexao();
                } catch (error) {
                    console.error('❌ Erro ao inicializar Supabase:', error);
                    this.usarLocalStorage = true;
                    console.warn('⚠️ Usando localStorage como fallback');
                }
            } else {
                console.warn('⚠️ Supabase não configurado. Usando localStorage.');
                console.warn('🔍 window.supabase:', typeof window.supabase);
                console.warn('🔍 window.SUPABASE_CONFIG:', window.SUPABASE_CONFIG);
                this.usarLocalStorage = true;
            }
        }, 300); // Aumentar tempo de espera
    }
    
    async testarConexao() {
        if (this.usarLocalStorage || !this.supabase) return;
        
        try {
            // Tentar uma query simples para verificar conexão
            const { data, error } = await this.supabase
                .from('fichas_bacen')
                .select('id')
                .limit(1);
            
            if (error) {
                console.warn('⚠️ Erro ao testar conexão Supabase:', error.message);
                if (error.message.includes('relation') || error.message.includes('does not exist')) {
                    console.warn('⚠️ Tabela pode não existir ainda. Isso é normal na primeira execução.');
                }
            } else {
                console.log('✅ Conexão com Supabase testada com sucesso');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao testar conexão:', error);
        }
    }

    // === FICHAS BACEN ===
    async obterFichasBacen() {
        if (this.usarLocalStorage) {
            return JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
        }

        try {
            const { data, error } = await this.supabase
                .from('fichas_bacen')
                .select('*')
                .order('dataCriacao', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar fichas BACEN:', error);
            // Fallback para localStorage
            return JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
        }
    }

    async salvarFichaBacen(ficha) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(fichas));
            return ficha;
        }

        try {
            // Verificar se já existe
            const { data: existente } = await this.supabase
                .from('fichas_bacen')
                .select('id')
                .eq('id', ficha.id)
                .single();

            if (existente) {
                // Atualizar
                const { data, error } = await this.supabase
                    .from('fichas_bacen')
                    .update(ficha)
                    .eq('id', ficha.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Inserir
                const { data, error } = await this.supabase
                    .from('fichas_bacen')
                    .insert(ficha)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Erro ao salvar ficha BACEN:', error);
            // Fallback para localStorage
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(fichas));
            return ficha;
        }
    }

    async excluirFichaBacen(id) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(filtradas));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('fichas_bacen')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao excluir ficha BACEN:', error);
            // Fallback
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_bacen', JSON.stringify(filtradas));
            return true;
        }
    }

    // === FICHAS N2 ===
    async obterFichasN2() {
        if (this.usarLocalStorage) {
            return JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
        }

        try {
            const { data, error } = await this.supabase
                .from('fichas_n2')
                .select('*')
                .order('dataCriacao', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar fichas N2:', error);
            return JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
        }
    }

    async salvarFichaN2(ficha) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(fichas));
            return ficha;
        }

        try {
            const { data: existente } = await this.supabase
                .from('fichas_n2')
                .select('id')
                .eq('id', ficha.id)
                .single();

            if (existente) {
                const { data, error } = await this.supabase
                    .from('fichas_n2')
                    .update(ficha)
                    .eq('id', ficha.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                const { data, error } = await this.supabase
                    .from('fichas_n2')
                    .insert(ficha)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Erro ao salvar ficha N2:', error);
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(fichas));
            return ficha;
        }
    }

    async excluirFichaN2(id) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(filtradas));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('fichas_n2')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao excluir ficha N2:', error);
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_n2', JSON.stringify(filtradas));
            return true;
        }
    }

    // === FICHAS CHATBOT ===
    async obterFichasChatbot() {
        if (this.usarLocalStorage) {
            return JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
        }

        try {
            const { data, error } = await this.supabase
                .from('fichas_chatbot')
                .select('*')
                .order('dataCriacao', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar fichas Chatbot:', error);
            return JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
        }
    }

    async salvarFichaChatbot(ficha) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(fichas));
            return ficha;
        }

        try {
            const { data: existente } = await this.supabase
                .from('fichas_chatbot')
                .select('id')
                .eq('id', ficha.id)
                .single();

            if (existente) {
                const { data, error } = await this.supabase
                    .from('fichas_chatbot')
                    .update(ficha)
                    .eq('id', ficha.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                const { data, error } = await this.supabase
                    .from('fichas_chatbot')
                    .insert(ficha)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Erro ao salvar ficha Chatbot:', error);
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
            const index = fichas.findIndex(f => f.id === ficha.id);
            
            if (index >= 0) {
                fichas[index] = ficha;
            } else {
                fichas.push(ficha);
            }
            
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(fichas));
            return ficha;
        }
    }

    async excluirFichaChatbot(id) {
        if (this.usarLocalStorage) {
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(filtradas));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('fichas_chatbot')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao excluir ficha Chatbot:', error);
            const fichas = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
            const filtradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('velotax_demandas_chatbot', JSON.stringify(filtradas));
            return true;
        }
    }

    // === MIGRAÇÃO: Copiar dados do localStorage para Supabase ===
    async migrarDadosLocalStorage() {
        if (this.usarLocalStorage) {
            console.log('⚠️ Supabase não disponível. Migração não executada.');
            return;
        }

        try {
            console.log('🔄 Iniciando migração de dados do localStorage para Supabase...');

            // Migrar BACEN
            const fichasBacen = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
            if (fichasBacen.length > 0) {
                const { data: existentes } = await this.supabase.from('fichas_bacen').select('id');
                const idsExistentes = new Set((existentes || []).map(f => f.id));
                const novas = fichasBacen.filter(f => !idsExistentes.has(f.id));
                
                if (novas.length > 0) {
                    await this.supabase.from('fichas_bacen').insert(novas);
                    console.log(`✅ ${novas.length} fichas BACEN migradas`);
                }
            }

            // Migrar N2
            const fichasN2 = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
            if (fichasN2.length > 0) {
                const { data: existentes } = await this.supabase.from('fichas_n2').select('id');
                const idsExistentes = new Set((existentes || []).map(f => f.id));
                const novas = fichasN2.filter(f => !idsExistentes.has(f.id));
                
                if (novas.length > 0) {
                    await this.supabase.from('fichas_n2').insert(novas);
                    console.log(`✅ ${novas.length} fichas N2 migradas`);
                }
            }

            // Migrar Chatbot
            const fichasChatbot = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');
            if (fichasChatbot.length > 0) {
                const { data: existentes } = await this.supabase.from('fichas_chatbot').select('id');
                const idsExistentes = new Set((existentes || []).map(f => f.id));
                const novas = fichasChatbot.filter(f => !idsExistentes.has(f.id));
                
                if (novas.length > 0) {
                    await this.supabase.from('fichas_chatbot').insert(novas);
                    console.log(`✅ ${novas.length} fichas Chatbot migradas`);
                }
            }

            console.log('✅ Migração concluída!');
        } catch (error) {
            console.error('❌ Erro na migração:', error);
        }
    }
}

// Instanciar globalmente
window.supabaseDB = new SupabaseDB();

