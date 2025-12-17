/* === SISTEMA DE ARMAZENAMENTO DE RECLAMAÇÕES === */
/* Usa Supabase quando disponível, fallback para localStorage */

class ArmazenamentoReclamacoes {
    constructor() {
        this.chaves = {
            bacen: 'velotax_reclamacoes_bacen',
            n2: 'velotax_reclamacoes_n2',
            chatbot: 'velotax_reclamacoes_chatbot'
        };
        this.usarSupabase = false;
        this.supabase = null;
        this.inicializarSupabase();
        console.log('✅ Sistema de armazenamento inicializado');
    }
    
    inicializarSupabase() {
        // Verificar se Supabase está disponível
        if (window.supabaseDB && !window.supabaseDB.usarLocalStorage) {
            this.usarSupabase = true;
            this.supabase = window.supabaseDB.supabase;
            console.log('✅ Usando Supabase para armazenamento compartilhado');
        } else {
            console.warn('⚠️ Supabase não disponível. Usando localStorage (dados locais apenas).');
        }
    }

    // === SALVAR RECLAMAÇÃO ===
    async salvar(tipo, reclamacao) {
        console.log(`💾 Salvando reclamação ${tipo} - ID: ${reclamacao.id}`);
        
        // Garantir que tem ID
        if (!reclamacao.id) {
            reclamacao.id = this.gerarId();
            console.log(`🆔 ID gerado: ${reclamacao.id}`);
        }
        
        // Garantir que tem data de criação
        if (!reclamacao.dataCriacao) {
            reclamacao.dataCriacao = new Date().toISOString();
        }
        
        // Garantir tipo
        reclamacao.tipoDemanda = tipo;
        
        // Obter chave
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return false;
        }
        
        // PRIORIDADE 1: Tentar salvar no Supabase (armazenamento compartilhado)
        if (this.usarSupabase && window.supabaseDB) {
            try {
                const nomeTabela = `fichas_${tipo}`;
                console.log(`☁️ Tentando salvar no Supabase (tabela: ${nomeTabela})...`);
                
                // Verificar se já existe
                const { data: existente } = await window.supabaseDB.supabase
                    .from(nomeTabela)
                    .select('id')
                    .eq('id', reclamacao.id)
                    .single();
                
                let resultado;
                if (existente) {
                    // Atualizar
                    const { data, error } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .update(reclamacao)
                        .eq('id', reclamacao.id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                    console.log(`✅ Reclamação atualizada no Supabase: ${reclamacao.id}`);
                } else {
                    // Inserir
                    const { data, error } = await window.supabaseDB.supabase
                        .from(nomeTabela)
                        .insert(reclamacao)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                    console.log(`✅ Reclamação salva no Supabase: ${reclamacao.id}`);
                }
                
                // Também salvar no localStorage como backup
                this.salvarLocalStorage(tipo, reclamacao, chave);
                return true;
            } catch (error) {
                console.error(`❌ Erro ao salvar no Supabase:`, error);
                console.warn(`⚠️ Fallback para localStorage...`);
                // Continuar para salvar no localStorage
            }
        }
        
        // FALLBACK: Salvar no localStorage
        return this.salvarLocalStorage(tipo, reclamacao, chave);
    }
    
    // Método auxiliar para salvar no localStorage
    salvarLocalStorage(tipo, reclamacao, chave) {
        try {
            // Carregar reclamações existentes
            let reclamacoes = [];
            const dados = localStorage.getItem(chave);
            if (dados) {
                reclamacoes = JSON.parse(dados);
                if (!Array.isArray(reclamacoes)) {
                    console.warn(`⚠️ Dados inválidos para ${tipo}, resetando...`);
                    reclamacoes = [];
                }
            }
            
            // Verificar se já existe (atualizar) ou adicionar nova
            const index = reclamacoes.findIndex(r => r.id === reclamacao.id);
            if (index >= 0) {
                reclamacoes[index] = reclamacao;
                console.log(`🔄 Reclamação atualizada no localStorage: ${reclamacao.id}`);
            } else {
                reclamacoes.push(reclamacao);
                console.log(`➕ Nova reclamação adicionada no localStorage: ${reclamacao.id}`);
            }
            
            // Salvar no localStorage
            const dadosParaSalvar = JSON.stringify(reclamacoes);
            localStorage.setItem(chave, dadosParaSalvar);
            
            // Verificar se foi salvo corretamente
            const verificado = localStorage.getItem(chave);
            if (verificado) {
                const dadosVerificados = JSON.parse(verificado);
                console.log(`✅ Salvo no localStorage: ${dadosVerificados.length} reclamações ${tipo}`);
                
                const encontrada = dadosVerificados.find(r => r.id === reclamacao.id);
                if (encontrada) {
                    console.log(`✅ Reclamação ${reclamacao.id} confirmada no localStorage`);
                    return true;
                } else {
                    console.error(`❌ ERRO: Reclamação ${reclamacao.id} NÃO foi salva corretamente!`);
                    return false;
                }
            } else {
                console.error(`❌ ERRO: localStorage não retornou dados após salvar!`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Erro ao salvar no localStorage:`, error);
            return false;
        }
    }

    // === CARREGAR TODAS AS RECLAMAÇÕES ===
    carregarTodos(tipo) {
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return [];
        }
        
        try {
            // Tentar carregar da chave nova primeiro
            let dados = localStorage.getItem(chave);
            let reclamacoes = [];
            
            if (dados) {
                reclamacoes = JSON.parse(dados);
                if (!Array.isArray(reclamacoes)) {
                    console.warn(`⚠️ Dados inválidos para ${tipo}, resetando...`);
                    localStorage.removeItem(chave);
                    reclamacoes = [];
                }
            }
            
            // MIGRAÇÃO: Se não encontrou na chave nova, tentar chave antiga e migrar
            if (reclamacoes.length === 0) {
                const chaveAntiga = `velotax_demandas_${tipo}`;
                const dadosAntigos = localStorage.getItem(chaveAntiga);
                
                if (dadosAntigos) {
                    console.log(`🔄 Migrando dados de ${chaveAntiga} para ${chave}...`);
                    try {
                        const dadosMigrados = JSON.parse(dadosAntigos);
                        if (Array.isArray(dadosMigrados) && dadosMigrados.length > 0) {
                            reclamacoes = dadosMigrados;
                            // Salvar na chave nova
                            localStorage.setItem(chave, JSON.stringify(reclamacoes));
                            console.log(`✅ ${reclamacoes.length} reclamações migradas`);
                            // Remover chave antiga
                            localStorage.removeItem(chaveAntiga);
                            console.log(`🗑️ Chave antiga removida: ${chaveAntiga}`);
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao migrar dados:`, error);
                    }
                }
            }
            
            console.log(`📦 Carregadas ${reclamacoes.length} reclamações ${tipo}`);
            return reclamacoes;
        } catch (error) {
            console.error(`❌ Erro ao carregar ${tipo}:`, error);
            return [];
        }
    }

    // === OBTER RECLAMAÇÃO POR ID ===
    obterPorId(tipo, id) {
        const reclamacoes = this.carregarTodos(tipo);
        return reclamacoes.find(r => r.id === id) || null;
    }

    // === REMOVER RECLAMAÇÃO ===
    remover(tipo, id) {
        const chave = this.chaves[tipo];
        if (!chave) return false;
        
        let reclamacoes = this.carregarTodos(tipo);
        const antes = reclamacoes.length;
        reclamacoes = reclamacoes.filter(r => r.id !== id);
        
        if (reclamacoes.length < antes) {
            localStorage.setItem(chave, JSON.stringify(reclamacoes));
            console.log(`🗑️ Reclamação ${id} removida`);
            return true;
        }
        
        return false;
    }

    // === RESETAR TODOS OS DADOS ===
    resetar() {
        console.log('🔄 Resetando todos os dados...');
        Object.values(this.chaves).forEach(chave => {
            localStorage.removeItem(chave);
            console.log(`🗑️ Removido: ${chave}`);
        });
        console.log('✅ Todos os dados foram resetados');
    }

    // === GERAR ID ÚNICO ===
    gerarId() {
        return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // === CONTAR RECLAMAÇÕES ===
    async contar(tipo) {
        const reclamacoes = await this.carregarTodos(tipo);
        return reclamacoes.length;
    }
}

// Criar instância global
if (!window.armazenamentoReclamacoes) {
    window.armazenamentoReclamacoes = new ArmazenamentoReclamacoes();
    console.log('✅ Sistema de armazenamento global criado');
}

