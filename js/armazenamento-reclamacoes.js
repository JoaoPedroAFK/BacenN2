/* === SISTEMA DE ARMAZENAMENTO DE RECLAMAÇÕES === */
/* VERSÃO: v2.8.0 | DATA: 2025-02-01 | ALTERAÇÕES: Removido salvamento de logs de debug no localStorage para evitar quota excedida */
/* Usa Firebase Realtime Database quando disponível, fallback para localStorage */

class ArmazenamentoReclamacoes {
    constructor() {
        this.chaves = {
            bacen: 'velotax_reclamacoes_bacen',
            n2: 'velotax_reclamacoes_n2',
            chatbot: 'velotax_reclamacoes_chatbot',
            'ra-procon': 'velotax_reclamacoes_ra_procon'
        };
        this.usarFirebase = false; // Começa como falso
        this.firebaseDB = null; // A instância será atribuída quando Firebase estiver pronto
        
        // Adiciona um ouvinte para o evento 'firebaseReady'
        window.addEventListener('firebaseReady', (event) => {
            console.log('✅ [ArmazenamentoReclamacoes] Evento firebaseReady recebido! Firebase está pronto.');
            if (event.detail && event.detail.firebaseDB) {
                this.firebaseDB = event.detail.firebaseDB; // Atribui a instância inicializada
                this.usarFirebase = true; // Agora podemos usar o Firebase!
                console.log('   [ArmazenamentoReclamacoes] Firebase ativado para uso.');
                console.log('   [ArmazenamentoReclamacoes] firebaseDB.inicializado:', this.firebaseDB.inicializado);
            } else {
                // Se não veio no evento, verificar window.firebaseDB
                if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
                    this.firebaseDB = window.firebaseDB;
                    this.usarFirebase = true;
                    console.log('   [ArmazenamentoReclamacoes] Firebase ativado via window.firebaseDB');
                }
            }
        });
        
        // Também manter a verificação periódica como fallback
        this.inicializarFirebase();
        
        // Limpar logs de debug antigos do localStorage para evitar quota excedida
        this.limparLogsDebugAntigos();
        
        console.log('✅ Sistema de armazenamento inicializado');
    }
    
    /**
     * Limpa logs de debug antigos do localStorage para evitar quota excedida
     * Remove todas as chaves que começam com 'velotax_debug_firebase_'
     */
    limparLogsDebugAntigos() {
        try {
            const chavesParaRemover = [];
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && chave.startsWith('velotax_debug_firebase_')) {
                    chavesParaRemover.push(chave);
                }
            }
            
            if (chavesParaRemover.length > 0) {
                console.log(`🧹 Limpando ${chavesParaRemover.length} logs de debug antigos do localStorage...`);
                chavesParaRemover.forEach(chave => {
                    try {
                        localStorage.removeItem(chave);
                    } catch (e) {
                        console.warn(`⚠️ Erro ao remover chave ${chave}:`, e);
                    }
                });
                console.log(`✅ Logs de debug antigos removidos`);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao limpar logs de debug antigos:', error);
        }
    }
    
    inicializarFirebase() {
        // Verificar imediatamente
        this.verificarEAtivarFirebase();
        
        // Aguardar Firebase inicializar (pode levar até 2 segundos)
        setTimeout(() => {
            this.verificarEAtivarFirebase();
        }, 2000);
        
        // Verificar novamente após mais tempo (caso o primeiro não tenha funcionado)
        setTimeout(() => {
            if (!this.usarFirebase) {
                console.log('🔄 Verificando Firebase novamente...');
                this.verificarEAtivarFirebase();
            }
        }, 3000);
        
        // Verificação final após 5 segundos
        setTimeout(() => {
            if (!this.usarFirebase) {
                console.log('🔄 Verificação final do Firebase...');
                this.verificarEAtivarFirebase();
                if (this.usarFirebase) {
                    console.log('✅ Firebase finalmente ativado!');
                } else {
                    console.error('❌ Firebase não foi inicializado após 5 segundos!');
                    console.error('   Verifique se o Realtime Database foi criado no Firebase Console');
                }
            }
        }, 5000);
        
        // Escutar evento quando Firebase estiver pronto
        window.addEventListener('firebaseReady', (event) => {
            console.log('📢 Evento firebaseReady recebido! Ativando Firebase...');
            if (event.detail && event.detail.firebaseDB) {
                this.usarFirebase = true;
                this.firebaseDB = event.detail.firebaseDB;
                console.log('✅ Firebase ativado via evento firebaseReady!');
            } else {
                // Se não veio no evento, verificar novamente
                this.verificarEAtivarFirebase();
            }
        });
    }
    
    verificarEAtivarFirebase() {
        // Verificar se Firebase está disponível
        if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
            console.log('✅ Usando Firebase Realtime Database para armazenamento compartilhado');
            console.log('🔍 Firebase DB:', this.firebaseDB ? 'disponível' : 'indisponível');
            return true;
        } else {
            console.warn('⚠️ Firebase não disponível. Usando localStorage (dados locais apenas).');
            console.warn('🔍 window.firebaseDB:', window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.warn('🔍 window.firebaseDB.inicializado:', window.firebaseDB.inicializado);
                console.warn('🔍 window.firebaseDB.usarLocalStorage:', window.firebaseDB.usarLocalStorage);
            }
            if (window.FIREBASE_CONFIG) {
                console.warn('🔍 window.FIREBASE_CONFIG existe');
            } else {
                console.warn('🔍 window.FIREBASE_CONFIG não existe - configure em js/config-firebase.js');
            }
            return false;
        }
    }

    // === FUNÇÃO HELPER: Criar objeto apenas com campos básicos que provavelmente existem ===
    criarObjetoMinimo(dados, tipo = null) {
        // Campos MÍNIMOS que provavelmente existem em TODAS as tabelas
        const objetoMinimo = {
            id: dados.id,
            nomeCliente: dados.nomeCliente || dados.nomeCompleto || '',
            cpf: dados.cpf || '',
            status: dados.status || 'nao-iniciado'
        };
        
        // Adicionar origem apenas se NÃO for chatbot
        if (tipo !== 'chatbot' && dados.origem) {
            objetoMinimo.origem = dados.origem;
        }
        
        // Adicionar campos que provavelmente existem (mas não são obrigatórios)
        // NÃO adicionar dataCriacao, enviarCobranca, pixLiberado, tipoDemanda - podem não existir
        if (dados.telefone) objetoMinimo.telefone = dados.telefone;
        if (dados.nomeCompleto) objetoMinimo.nomeCompleto = dados.nomeCompleto;
        if (dados.cpfTratado) objetoMinimo.cpfTratado = dados.cpfTratado;
        // NÃO adicionar dataCriacao - pode não existir ou ter nome diferente
        if (dados.dataRecebimento) objetoMinimo.dataRecebimento = dados.dataRecebimento;
        if (dados.finalizadoEm) objetoMinimo.finalizadoEm = dados.finalizadoEm;
        if (dados.responsavel) objetoMinimo.responsavel = dados.responsavel;
        if (dados.motivoReduzido) objetoMinimo.motivoReduzido = dados.motivoReduzido;
        if (dados.motivoDetalhado) objetoMinimo.motivoDetalhado = dados.motivoDetalhado;
        if (dados.observacoes) objetoMinimo.observacoes = dados.observacoes;
        if (dados.mes) objetoMinimo.mes = dados.mes;
        
        // NÃO adicionar campos booleanos que podem não existir
        // if (typeof dados.enviarCobranca === 'boolean') objetoMinimo.enviarCobranca = dados.enviarCobranca;
        // if (typeof dados.pixLiberado === 'boolean') objetoMinimo.pixLiberado = dados.pixLiberado;
        // if (typeof dados.aceitouLiquidacao === 'boolean') objetoMinimo.aceitouLiquidacao = dados.aceitouLiquidacao;
        // if (typeof dados.concluido === 'boolean') objetoMinimo.concluido = dados.concluido;
        
        // NÃO adicionar campos JSON que podem não existir
        // if (dados.modulosContato && typeof dados.modulosContato === 'object') objetoMinimo.modulosContato = dados.modulosContato;
        // if (dados.tentativas && typeof dados.tentativas === 'object') objetoMinimo.tentativas = dados.tentativas;
        // if (dados.protocolos && typeof dados.protocolos === 'object') objetoMinimo.protocolos = dados.protocolos;
        // if (dados.camposEspecificos && typeof dados.camposEspecificos === 'object') objetoMinimo.camposEspecificos = dados.camposEspecificos;
        
        // NÃO adicionar tipoDemanda - pode não existir
        // if (dados.tipoDemanda) objetoMinimo.tipoDemanda = dados.tipoDemanda;
        
        return objetoMinimo;
    }

    // === FUNÇÃO HELPER: Tentar salvar removendo colunas inexistentes automaticamente ===
    async tentarSalvarComRetry(supabase, nomeTabela, dados, operacao = 'insert', id = null, maxTentativas = 20) {
        // Extrair tipo da tabela (fichas_bacen -> bacen, fichas_n2 -> n2, fichas_chatbot -> chatbot)
        const tipo = nomeTabela.replace('fichas_', '');
        
        // Começar com objeto mínimo (apenas campos básicos)
        let dadosLimpos = this.criarObjetoMinimo(dados, tipo);
        
        for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
            try {
                let resultado;
                
                if (operacao === 'update' && id) {
                    const { data, error } = await supabase
                        .from(nomeTabela)
                        .update(dadosLimpos)
                        .eq('id', id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                } else {
                    const { data, error } = await supabase
                        .from(nomeTabela)
                        .insert(dadosLimpos)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    resultado = data;
                }
                
                return { sucesso: true, data: resultado };
            } catch (error) {
                // Se for erro de rede (Failed to fetch), tentar novamente após um delay
                if (error.message && error.message.includes('Failed to fetch')) {
                    console.warn(`   ⚠️ Erro de rede (tentativa ${tentativa + 1}/${maxTentativas}), aguardando 500ms e tentando novamente...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue; // Tentar novamente
                }
                
                // Se for erro de coluna não encontrada (PGRST204), extrair nome da coluna e remover
                if (error.code === 'PGRST204' && error.message) {
                    // Extrair nome da coluna da mensagem: "Could not find the 'nomeColuna' column..."
                    const match = error.message.match(/'([^']+)'/);
                    if (match && match[1]) {
                        const colunaProblema = match[1];
                        console.warn(`   ⚠️ Coluna '${colunaProblema}' não existe na tabela, removendo e tentando novamente...`);
                        delete dadosLimpos[colunaProblema];
                        continue; // Tentar novamente sem essa coluna
                    }
                }
                
                // Se não for erro de coluna ou não conseguir extrair nome, retornar erro
                return { sucesso: false, error };
            }
        }
        
        return { sucesso: false, error: new Error('Máximo de tentativas excedido') };
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
        
        // DEBUG: Verificar estado do Firebase (apenas para primeira ficha para não poluir logs)
        if (!reclamacao._debugLogado) {
            reclamacao._debugLogado = true;
            console.log(`🔍 DEBUG Firebase - usarFirebase: ${this.usarFirebase}`);
            console.log(`🔍 DEBUG Firebase - window.firebaseDB:`, window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.log(`🔍 DEBUG Firebase - window.firebaseDB.inicializado:`, window.firebaseDB.inicializado);
                console.log(`🔍 DEBUG Firebase - window.firebaseDB.usarLocalStorage:`, window.firebaseDB.usarLocalStorage);
                console.log(`🔍 DEBUG Firebase - window.FIREBASE_CONFIG:`, window.FIREBASE_CONFIG ? 'existe' : 'não existe');
            }
        }
        
        // PRIORIDADE 1: Tentar salvar no Firebase (armazenamento compartilhado)
        // Re-verificar Firebase antes de salvar (pode ter sido inicializado depois)
        if (!this.usarFirebase) {
            const ativado = this.verificarEAtivarFirebase();
            if (ativado) {
                console.log('✅ Firebase detectado durante salvamento, ativando...');
            }
        }
        
        // Forçar verificação novamente antes de usar
        if (window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
        }
        
        // Log detalhado para debug
        if (!reclamacao._debugLogado) {
            console.log(`🔍 DEBUG SALVAMENTO - usarFirebase: ${this.usarFirebase}`);
            console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB:`, window.firebaseDB ? 'existe' : 'não existe');
            if (window.firebaseDB) {
                console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB.inicializado:`, window.firebaseDB.inicializado);
                console.log(`🔍 DEBUG SALVAMENTO - window.firebaseDB.usarLocalStorage:`, window.firebaseDB.usarLocalStorage);
            }
        }
        
        // Verificar Firebase uma última vez antes de salvar
        if (!this.usarFirebase && window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            console.log('🔄 Firebase disponível mas não estava marcado como ativo, ativando agora...');
            this.usarFirebase = true;
            this.firebaseDB = window.firebaseDB;
        }
        
        // Agora a lógica é mais simples e confiável - depende do estado this.usarFirebase
        // que é definido quando o evento firebaseReady é recebido
        if (this.usarFirebase && this.firebaseDB && this.firebaseDB.inicializado && !this.firebaseDB.usarLocalStorage) {
            try {
                console.log(`🔥 [armazenamento] Tentando salvar no Firebase (tipo: ${tipo}, ID: ${reclamacao.id})...`);
                console.log(`🔍 [armazenamento] DEBUG - this.firebaseDB:`, this.firebaseDB);
                console.log(`🔍 [armazenamento] DEBUG - typeof this.firebaseDB.salvar:`, typeof this.firebaseDB.salvar);
                
                // Verificar se o método salvar existe
                if (typeof this.firebaseDB.salvar !== 'function') {
                    console.error(`❌ [armazenamento] this.firebaseDB.salvar não é uma função!`);
                    console.error(`   this.firebaseDB:`, this.firebaseDB);
                    console.error(`   Métodos disponíveis:`, Object.keys(this.firebaseDB));
                    throw new Error('Método salvar não encontrado no firebaseDB');
                }
                
                // Firebase salva diretamente (não precisa verificar existência - set() substitui automaticamente)
                // Usar this.firebaseDB em vez de window.firebaseDB (instância recebida via evento firebaseReady)
                console.log(`📤 [armazenamento] Chamando this.firebaseDB.salvar(${tipo}, reclamacao)...`);
                const sucesso = await this.firebaseDB.salvar(tipo, reclamacao);
                console.log(`📥 [armazenamento] Resultado do salvar:`, sucesso);
                
                if (sucesso) {
                    if (!reclamacao._debugLogado) {
                        console.log(`✅ Reclamação ${reclamacao.id} salva no Firebase`);
                    }
                    // NÃO salvar no localStorage quando Firebase funcionou
                    return true;
                } else {
                    console.error(`❌ Falha ao salvar no Firebase - retornou false`);
                    throw new Error('Falha ao salvar no Firebase');
                }
            } catch (error) {
                console.error(`❌ Erro ao salvar no Firebase:`, error);
                console.error(`   Tipo: ${tipo}, ID: ${reclamacao.id}`);
                console.error(`   Erro completo:`, error);
                
                // NUNCA usar localStorage quando Firebase está ativo - apenas Firebase!
                if (this.usarFirebase) {
                    console.error(`⚠️ Firebase está ativo mas falhou. NÃO usando localStorage!`);
                    console.error(`   Verifique as regras de segurança no Firebase Console!`);
                    throw error; // Propaga o erro - NÃO tenta localStorage
                } else {
                    console.warn(`⚠️ Firebase não disponível. Fallback para localStorage...`);
                    // Continuar para salvar no localStorage apenas se Firebase não estiver disponível
                }
            }
        } else {
            // Firebase não está disponível
            const motivo = [];
            if (!this.usarFirebase) motivo.push('usarFirebase=false');
            if (!window.firebaseDB) motivo.push('firebaseDB não existe');
            else {
                if (!window.firebaseDB.inicializado) motivo.push('firebaseDB.inicializado=false');
                if (window.firebaseDB.usarLocalStorage) motivo.push('firebaseDB.usarLocalStorage=true');
            }
            
            if (!reclamacao._debugLogado) {
                console.warn(`⚠️ Firebase não disponível para salvar. Motivos: ${motivo.join(', ')}`);
            }
        }
        
        // FALLBACK: Salvar no localStorage APENAS se Firebase não estiver disponível
        // Se Firebase está ativo mas falhou, NÃO usar localStorage
        if (!this.usarFirebase) {
            return this.salvarLocalStorage(tipo, reclamacao, chave);
        } else {
            // Firebase está ativo mas falhou - não usar localStorage
            console.error(`❌ Não foi possível salvar: Firebase está ativo mas falhou, e localStorage não será usado.`);
            return false;
        }
    }
    
    // Método auxiliar para salvar no localStorage (apenas quando Supabase não está disponível)
    salvarLocalStorage(tipo, reclamacao, chave) {
        try {
            // Verificar tamanho antes de salvar (evitar quota excedida)
            const dadosAtuais = localStorage.getItem(chave);
            let reclamacoes = [];
            
            if (dadosAtuais) {
                try {
                    reclamacoes = JSON.parse(dadosAtuais);
                    if (!Array.isArray(reclamacoes)) {
                        console.warn(`⚠️ Dados inválidos para ${tipo}, resetando...`);
                        reclamacoes = [];
                    }
                } catch (e) {
                    console.warn(`⚠️ Erro ao parsear dados existentes, resetando...`);
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
            
            // Tentar salvar no localStorage
            const dadosParaSalvar = JSON.stringify(reclamacoes);
            const tamanhoMB = (new Blob([dadosParaSalvar]).size / 1024 / 1024).toFixed(2);
            
            // Verificar se excede limite (localStorage geralmente tem ~5-10MB)
            if (tamanhoMB > 4) {
                console.warn(`⚠️ Dados muito grandes (${tamanhoMB}MB). Limpando localStorage antigo...`);
                // Limpar dados antigos, manter apenas os últimos 100 registros
                reclamacoes = reclamacoes.slice(-100);
                console.warn(`⚠️ Mantendo apenas os últimos 100 registros no localStorage`);
            }
            
            try {
                localStorage.setItem(chave, JSON.stringify(reclamacoes));
                console.log(`✅ Salvo no localStorage: ${reclamacoes.length} reclamações ${tipo} (${tamanhoMB}MB)`);
                return true;
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError') {
                    console.error(`❌ QUOTA EXCEDIDA no localStorage!`);
                    console.error(`   Tamanho tentado: ${tamanhoMB}MB`);
                    console.error(`   ⚠️ Limpando localStorage e mantendo apenas últimos 50 registros...`);
                    
                    // Limpar e manter apenas últimos 50
                    reclamacoes = reclamacoes.slice(-50);
                    try {
                        localStorage.setItem(chave, JSON.stringify(reclamacoes));
                        console.warn(`⚠️ localStorage limpo. Mantidos apenas últimos 50 registros.`);
                        return true;
                    } catch (e) {
                        console.error(`❌ ERRO: Não foi possível salvar mesmo após limpar!`);
                        console.error(`   Use o Supabase para salvar todos os dados!`);
                        return false;
                    }
                }
                throw quotaError;
            }
        } catch (error) {
            console.error(`❌ Erro ao salvar no localStorage:`, error);
            if (error.name === 'QuotaExceededError') {
                console.error(`🚨 QUOTA EXCEDIDA! Execute o script SQL para usar Supabase!`);
            }
            return false;
        }
    }

    // === CARREGAR TODAS AS RECLAMAÇÕES ===
    async carregarTodos(tipo) {
        console.log(`📥 carregarTodos chamado para tipo: ${tipo}`);
        console.log(`🔍 Estado atual: usarFirebase=${this.usarFirebase}, firebaseDB=${this.firebaseDB ? 'existe' : 'null'}, firebaseDB.inicializado=${this.firebaseDB?.inicializado}`);
        
        const chave = this.chaves[tipo];
        if (!chave) {
            console.error(`❌ Tipo inválido: ${tipo}`);
            return [];
        }
        
        // Verificação final: se Firebase está disponível mas não foi ativado, ativar agora
        if (!this.usarFirebase && window.firebaseDB && window.firebaseDB.inicializado && !window.firebaseDB.usarLocalStorage) {
            console.log('🔄 Firebase disponível mas não estava ativo, ativando agora...');
            this.firebaseDB = window.firebaseDB;
            this.usarFirebase = true;
            console.log('✅ Firebase ativado imediatamente antes de carregar!');
        }
        
        // PRIORIDADE 1: Tentar carregar do Firebase (armazenamento compartilhado)
        // Agora a lógica é mais simples e confiável - depende do estado this.usarFirebase
        // que é definido quando o evento firebaseReady é recebido
        if (this.usarFirebase && this.firebaseDB && this.firebaseDB.inicializado && !this.firebaseDB.usarLocalStorage) {
            try {
                console.log(`🔥 Carregando do Firebase (tipo: ${tipo})...`);
                console.log(`🔍 Estado: usarFirebase=${this.usarFirebase}, firebaseDB.inicializado=${this.firebaseDB.inicializado}`);
                
                // Usar this.firebaseDB em vez de window.firebaseDB
                const data = await this.firebaseDB.carregar(tipo);
                
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
            if (!this.firebaseDB) motivo.push('firebaseDB não atribuído');
            else {
                if (!this.firebaseDB.inicializado) motivo.push('firebaseDB.inicializado=false');
                if (this.firebaseDB.usarLocalStorage) motivo.push('firebaseDB.usarLocalStorage=true');
            }
            console.warn(`⚠️ Firebase NÃO está pronto para carregar ${tipo}. Motivos: ${motivo.join(', ')}. Cairá para localStorage (se aplicável).`);
        }
        
        // FALLBACK: Carregar do localStorage APENAS se Firebase não estiver disponível
        if (!this.usarFirebase) {
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
            
                console.log(`📦 Carregadas ${reclamacoes.length} reclamações ${tipo} do localStorage`);
                return reclamacoes;
            } catch (error) {
                console.error(`❌ Erro ao carregar ${tipo}:`, error);
                return [];
            }
        } else {
            console.log(`⚠️ Firebase está ativo, não carregando do localStorage para ${tipo}`);
        }
        
        return [];
    }

    // === OBTER RECLAMAÇÃO POR ID ===
    async obterPorId(tipo, id) {
        const reclamacoes = await this.carregarTodos(tipo);
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
    
    // Escutar evento quando Firebase estiver pronto (caso o evento seja disparado antes)
    window.addEventListener('firebaseReady', () => {
        if (window.armazenamentoReclamacoes) {
            console.log('📢 Evento firebaseReady recebido globalmente! Re-verificando Firebase...');
            window.armazenamentoReclamacoes.verificarEAtivarFirebase();
        }
    });
}


