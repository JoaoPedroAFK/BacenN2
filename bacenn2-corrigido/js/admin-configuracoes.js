/**
 * Sistema de Gerenciamento de Configurações - Painel Administrativo
 * VERSION: v1.0.0 | DATE: 2025-02-01 | AUTHOR: VeloHub Development Team
 * 
 * Gerencia categorias, listas (selects) e checkboxes dos formulários
 * Compatível com Firebase Realtime Database
 */

class AdminConfiguracoes {
    constructor() {
        this.firebaseDB = null;
        this.configuracoes = {
            camposTexto: [],
            listas: [],
            checkboxes: [],
            camposFixos: {} // { tipoFicha: { nomeCampo: { label, obrigatorio, placeholder, oculto, observacoes } } }
        };
        this.inicializado = false;
    }

    async inicializar() {
        try {
            console.log('🔧 Inicializando AdminConfiguracoes...');
            
            // Aguardar Firebase estar pronto
            if (window.firebaseDB && window.firebaseDB.database) {
                this.firebaseDB = window.firebaseDB.database;
                console.log('✅ Firebase DB disponível');
            } else {
                // Aguardar Firebase inicializar
                await this.aguardarFirebase();
            }
            
            // Carregar configurações do Firebase
            await this.carregarConfiguracoes();
            
            // Configurar observador em tempo real
            this.configurarObservadorTempoReal();
            
            this.inicializado = true;
            console.log('✅ AdminConfiguracoes inicializado');
            
            // Renderizar interface
            this.renderizar();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar AdminConfiguracoes:', error);
            this.mostrarMensagem('Erro ao inicializar. Verifique o console.', 'error');
        }
    }

    async aguardarFirebase() {
        return new Promise((resolve, reject) => {
            let tentativas = 0;
            const maxTentativas = 50; // 5 segundos
            
            const verificar = setInterval(() => {
                tentativas++;
                
                // Verificar se firebaseDB existe e está inicializado
                if (window.firebaseDB && window.firebaseDB.database) {
                    clearInterval(verificar);
                    this.firebaseDB = window.firebaseDB.database;
                    console.log('✅ Firebase DB disponível após aguardar');
                    resolve();
                } else if (window.firebaseDB && window.firebaseDB.inicializado) {
                    clearInterval(verificar);
                    this.firebaseDB = window.firebaseDB.database;
                    console.log('✅ Firebase DB disponível (inicializado)');
                    resolve();
                } else if (tentativas >= maxTentativas) {
                    clearInterval(verificar);
                    reject(new Error('Firebase não inicializou após 5 segundos'));
                }
            }, 100);
        });
    }

    async carregarConfiguracoes() {
        try {
            if (!this.firebaseDB) {
                throw new Error('Firebase não está disponível');
            }

            // Tentar carregar do Firebase
            try {
                const ref = this.firebaseDB.ref('configuracoes_formularios');
                const snapshot = await ref.once('value');
                
                if (snapshot.exists()) {
                    const dados = snapshot.val();
                    this.configuracoes = {
                        camposTexto: dados.camposTexto || dados.categorias || [],
                        listas: dados.listas || [],
                        checkboxes: dados.checkboxes || [],
                        camposFixos: dados.camposFixos || {}
                    };
                    console.log('✅ Configurações carregadas do Firebase:', this.configuracoes);
                    return;
                }
            } catch (firebaseError) {
                console.warn('⚠️ Erro ao carregar do Firebase, tentando localStorage:', firebaseError.message);
            }
            
            // Fallback para localStorage
            const dadosLocal = localStorage.getItem('admin_configuracoes_formularios');
            if (dadosLocal) {
                try {
                    const dados = JSON.parse(dadosLocal);
                    this.configuracoes = {
                        camposTexto: dados.camposTexto || dados.categorias || [],
                        listas: dados.listas || [],
                        checkboxes: dados.checkboxes || [],
                        camposFixos: dados.camposFixos || {}
                    };
                    console.log('✅ Configurações carregadas do localStorage:', this.configuracoes);
                    return;
                } catch (parseError) {
                    console.error('❌ Erro ao parsear localStorage:', parseError);
                }
            }
            
            // Inicializar estrutura vazia
            console.log('ℹ️ Nenhuma configuração encontrada, iniciando com dados vazios');
            this.configuracoes = {
                camposTexto: [],
                listas: [],
                checkboxes: [],
                camposFixos: {}
            };
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            // Não lançar erro, apenas usar estrutura vazia
            this.configuracoes = {
                camposTexto: [],
                listas: [],
                checkboxes: [],
                camposFixos: {}
            };
        }
    }

    async salvarConfiguracoes() {
        try {
            const dadosParaSalvar = {
                camposTexto: this.configuracoes.camposTexto,
                listas: this.configuracoes.listas,
                checkboxes: this.configuracoes.checkboxes,
                camposFixos: this.configuracoes.camposFixos || {},
                atualizadoEm: new Date().toISOString()
            };
            
            // PRIORIDADE: Salvar no Firebase primeiro (para ficar disponível para todos)
            if (!this.firebaseDB) {
                throw new Error('Firebase não está disponível. Verifique a conexão e as regras de segurança.');
            }
            
            try {
                const ref = this.firebaseDB.ref('configuracoes_formularios');
                await ref.set({
                    ...dadosParaSalvar,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                console.log('✅ Configurações salvas no Firebase (disponível para todos)');
                
                // Salvar no localStorage como backup
                localStorage.setItem('admin_configuracoes_formularios', JSON.stringify(dadosParaSalvar));
                console.log('✅ Configurações também salvas no localStorage (backup)');
                
                this.mostrarMensagem('✅ Configurações salvas com sucesso! Agora disponíveis para todos os usuários.', 'success');
                return true;
            } catch (firebaseError) {
                console.error('❌ Erro ao salvar no Firebase:', firebaseError);
                
                // Mostrar erro detalhado
                let mensagemErro = 'Erro ao salvar no Firebase: ' + firebaseError.message;
                if (firebaseError.message.includes('permission_denied')) {
                    mensagemErro += '\n\n⚠️ ATENÇÃO: É necessário configurar as regras de segurança do Firebase para permitir escrita em "configuracoes_formularios".\n\nConsulte o arquivo GUIA_FIREBASE_REGRAS.md para instruções.';
                }
                
                this.mostrarMensagem(mensagemErro, 'error');
                
                // Salvar no localStorage como fallback temporário
                localStorage.setItem('admin_configuracoes_formularios', JSON.stringify(dadosParaSalvar));
                console.warn('⚠️ Configurações salvas apenas localmente (não disponível para outros usuários)');
                
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.mostrarMensagem('Erro ao salvar configurações: ' + error.message, 'error');
            return false;
        }
    }

    async registrarHistorico(acao, tipo, dados) {
        try {
            const usuario = this.obterUsuarioAtual();
            
            const historicoItem = {
                acao: acao, // 'criar', 'editar', 'remover'
                tipo: tipo, // 'campoTexto', 'lista', 'checkbox'
                dados: dados,
                usuario: usuario,
                timestamp: new Date().toISOString(),
                dataFormatada: new Date().toLocaleString('pt-BR')
            };

            // Tentar salvar no Firebase
            if (this.firebaseDB) {
                try {
                    const ref = this.firebaseDB.ref('configuracoes_formularios/historico');
                    await ref.push({
                        ...historicoItem,
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                    console.log('✅ Histórico registrado no Firebase:', historicoItem);
                } catch (firebaseError) {
                    console.warn('⚠️ Erro ao salvar histórico no Firebase, usando localStorage:', firebaseError.message);
                }
            }
            
            // Sempre salvar no localStorage como backup
            const historicoLocal = JSON.parse(localStorage.getItem('admin_historico') || '[]');
            historicoLocal.push(historicoItem);
            // Manter apenas os últimos 100 itens
            if (historicoLocal.length > 100) {
                historicoLocal.shift();
            }
            localStorage.setItem('admin_historico', JSON.stringify(historicoLocal));
            console.log('✅ Histórico registrado no localStorage');
        } catch (error) {
            console.error('❌ Erro ao registrar histórico:', error);
        }
    }

    obterUsuarioAtual() {
        // Tentar obter usuário de diferentes fontes
        if (window.sistemaPerfis && window.sistemaPerfis.usuarioAtual) {
            return window.sistemaPerfis.usuarioAtual.nome || window.sistemaPerfis.usuarioAtual.email || 'Sistema';
        }
        if (localStorage.getItem('usuarioAtual')) {
            return localStorage.getItem('usuarioAtual');
        }
        return 'Sistema';
    }

    configurarObservadorTempoReal() {
        if (!this.firebaseDB) {
            console.warn('⚠️ Firebase não disponível para observador em tempo real');
            return;
        }

        try {
            const ref = this.firebaseDB.ref('configuracoes_formularios');
            
            // Observar mudanças em tempo real
            ref.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const dados = snapshot.val();
                    const novasConfiguracoes = {
                        camposTexto: dados.camposTexto || dados.categorias || [],
                        listas: dados.listas || [],
                        checkboxes: dados.checkboxes || [],
                        camposFixos: dados.camposFixos || {}
                    };
                    
                    // Atualizar apenas se houver mudanças
                    const configAtual = JSON.stringify(this.configuracoes);
                    const configNova = JSON.stringify(novasConfiguracoes);
                    
                    if (configAtual !== configNova) {
                        console.log('🔄 Configurações atualizadas em tempo real do Firebase');
                        this.configuracoes = novasConfiguracoes;
                        this.renderizar();
                        
                        // Disparar evento para outros componentes
                        window.dispatchEvent(new CustomEvent('configuracoesFormulariosAtualizadas', {
                            detail: this.configuracoes
                        }));
                    }
                }
            }, (error) => {
                console.warn('⚠️ Erro no observador em tempo real:', error);
            });
            
            console.log('✅ Observador em tempo real configurado');
        } catch (error) {
            console.error('❌ Erro ao configurar observador:', error);
        }
    }

    obterCamposFixos(tipo) {
        // Campos fixos existentes em cada tipo de ficha
        const camposFixos = {
            'n2': [
                { nome: 'dataEntradaAtendimento', label: 'Data Entrada Atendimento', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'dataEntradaN2', label: 'Data Entrada N2', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'mes', label: 'Mês', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'nomeCompleto', label: 'Nome Completo', tipo: 'texto', obrigatorio: true, fixo: true },
                { nome: 'cpf', label: 'CPF', tipo: 'cpf', obrigatorio: true, fixo: true },
                { nome: 'telefone', label: 'Telefone', tipo: 'telefone', obrigatorio: false, fixo: true },
                { nome: 'origemTipo', label: 'Origem Tipo', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'motivoReduzido', label: 'Motivo Reduzido', tipo: 'select', obrigatorio: true, fixo: true },
                { nome: 'tentativasContato', label: 'Tentativas de Contato', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'pixStatus', label: 'PIX Status', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'statusContratoQuitado', label: 'Status Contrato Quitado', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'statusContratoAberto', label: 'Status Contrato Aberto', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'enviarCobranca', label: 'Enviar para Cobrança', tipo: 'radio', obrigatorio: true, fixo: true },
                { nome: 'formalizadoCliente', label: 'Formalizado Cliente', tipo: 'radio', obrigatorio: false, fixo: true },
                { nome: 'casosCriticos', label: 'Casos Críticos', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'status', label: 'Status', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'finalizadoEm', label: 'Finalizado Em', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'observacoes', label: 'Observações', tipo: 'textarea', obrigatorio: false, fixo: true },
                { nome: 'anexos', label: 'Anexos', tipo: 'file', obrigatorio: false, fixo: true },
                { nome: 'acionouCentral', label: 'Acionou Central', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloCentral', label: 'Protocolo Central', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'n2SegundoNivel', label: 'N2 Segundo Nível', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloN2', label: 'Protocolo N2', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'reclameAqui', label: 'Reclame Aqui', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloReclameAqui', label: 'Protocolo Reclame Aqui', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'procon', label: 'Procon', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloProcon', label: 'Protocolo Procon', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'protocolosSemAcionamento', label: 'Protocolos Sem Acionamento', tipo: 'texto', obrigatorio: false, fixo: true }
            ],
            'bacen': [
                { nome: 'dataEntrada', label: 'Data de Entrada', tipo: 'data', obrigatorio: true, fixo: true },
                { nome: 'mes', label: 'Mês', tipo: 'select', obrigatorio: true, fixo: true },
                { nome: 'nomeCompleto', label: 'Nome Completo', tipo: 'texto', obrigatorio: true, fixo: true },
                { nome: 'cpf', label: 'CPF', tipo: 'cpf', obrigatorio: true, fixo: true },
                { nome: 'origem', label: 'Origem', tipo: 'select', obrigatorio: true, fixo: true },
                { nome: 'origemTipo', label: 'Origem Tipo', tipo: 'texto', obrigatorio: true, fixo: true },
                { nome: 'telefone', label: 'Telefone', tipo: 'telefone', obrigatorio: false, fixo: true },
                { nome: 'rdr', label: 'RDR', tipo: 'numero', obrigatorio: false, fixo: true },
                { nome: 'anexo', label: 'Anexo', tipo: 'file', obrigatorio: false, fixo: true },
                { nome: 'motivoReduzido', label: 'Motivo Reduzido', tipo: 'select', obrigatorio: true, fixo: true },
                { nome: 'prazoBacen', label: 'Prazo Bacen', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'motivoDetalhado', label: 'Motivo Detalhado', tipo: 'textarea', obrigatorio: true, fixo: true },
                { nome: 'tentativasContato', label: 'Tentativas de Contato', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'enviarCobranca', label: 'Enviar para Cobrança', tipo: 'radio', obrigatorio: true, fixo: true },
                { nome: 'casosCriticos', label: 'Casos Críticos', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'status', label: 'Status', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'finalizadoEm', label: 'Finalizado Em', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'observacoes', label: 'Observações', tipo: 'textarea', obrigatorio: false, fixo: true },
                { nome: 'anexos', label: 'Anexos', tipo: 'file', obrigatorio: false, fixo: true },
                { nome: 'acionouCentral', label: 'Acionou Central', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloCentral', label: 'Protocolo Central', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'n2SegundoNivel', label: 'N2 Segundo Nível', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloN2', label: 'Protocolo N2', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'reclameAqui', label: 'Reclame Aqui', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloReclameAqui', label: 'Protocolo Reclame Aqui', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'procon', label: 'Procon', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'protocoloProcon', label: 'Protocolo Procon', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'protocolosSemAcionamento', label: 'Protocolos Sem Acionamento', tipo: 'texto', obrigatorio: false, fixo: true }
            ],
            'chatbot': [
                { nome: 'dataClienteChatbot', label: 'Data Cliente Chatbot', tipo: 'data', obrigatorio: false, fixo: true },
                { nome: 'nomeCompleto', label: 'Nome Completo', tipo: 'texto', obrigatorio: true, fixo: true },
                { nome: 'cpf', label: 'CPF', tipo: 'cpf', obrigatorio: true, fixo: true },
                { nome: 'telefone', label: 'Telefone', tipo: 'telefone', obrigatorio: false, fixo: true },
                { nome: 'notaAvaliacao', label: 'Nota de Avaliação', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'avaliacaoCliente', label: 'Avaliação do Cliente', tipo: 'textarea', obrigatorio: false, fixo: true },
                { nome: 'produto', label: 'Produto', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'motivo', label: 'Motivo', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'respostaBot', label: 'Resposta do Bot', tipo: 'radio', obrigatorio: false, fixo: true },
                { nome: 'observacaoRespostaBot', label: 'Observação Resposta Bot', tipo: 'textarea', obrigatorio: false, fixo: true },
                { nome: 'pixStatus', label: 'PIX Status', tipo: 'select', obrigatorio: false, fixo: true },
                { nome: 'enviarCobranca', label: 'Enviar para Cobrança', tipo: 'radio', obrigatorio: true, fixo: true },
                { nome: 'casosCriticos', label: 'Casos Críticos', tipo: 'checkbox', obrigatorio: false, fixo: true },
                { nome: 'observacoes', label: 'Observações', tipo: 'textarea', obrigatorio: false, fixo: true },
                { nome: 'status', label: 'Status', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'canalChatbot', label: 'Canal Chatbot', tipo: 'texto', obrigatorio: false, fixo: true },
                { nome: 'anexos', label: 'Anexos', tipo: 'file', obrigatorio: false, fixo: true }
            ]
        };
        
        return camposFixos[tipo.toLowerCase()] || [];
    }

    carregarCamposFicha() {
        if (!this.configuracoes) {
            console.warn('⚠️ Configurações ainda não carregadas, aguardando...');
            setTimeout(() => {
                if (this.configuracoes) {
                    this.carregarCamposFicha();
                } else {
                    const container = document.getElementById('campos-ficha-editaveis');
                    if (container) {
                        container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Aguardando carregamento das configurações...</p>';
                    }
                }
            }, 500);
            return;
        }
        
        const tipo = document.getElementById('tipo-ficha-editar')?.value;
        const container = document.getElementById('campos-ficha-editaveis');
        
        if (!container) {
            console.error('❌ Container campos-ficha-editaveis não encontrado');
            return;
        }
        
        if (!tipo) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Selecione um tipo de ficha para visualizar os campos</p>';
            return;
        }
        
        // Obter campos fixos
        const camposFixos = this.obterCamposFixos(tipo);
        
        // Filtrar campos dinâmicos por tipo
        const camposTexto = (this.configuracoes.camposTexto || []).filter(c => c.categoria === tipo || c.categoria === 'todos');
        const listas = (this.configuracoes.listas || []).filter(l => l.categoria === tipo || l.categoria === 'todos');
        const checkboxes = (this.configuracoes.checkboxes || []).filter(c => c.categoria === tipo || c.categoria === 'todos');
        
        if (camposFixos.length === 0 && camposTexto.length === 0 && listas.length === 0 && checkboxes.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--texto-secundario); padding: 40px;">
                    Nenhum campo configurado para ${tipo.toUpperCase()}.<br>
                    Use as outras abas para adicionar campos.
                </p>
            `;
            return;
        }
        
        let html = '<div style="margin-bottom: 30px;">';
        html += `<h4 style="color: var(--texto-principal); margin-bottom: 15px;">Campos configurados para ${tipo.toUpperCase()}</h4>`;
        
        // Campos Fixos (já existentes)
        if (camposFixos.length > 0) {
            html += '<div style="margin-bottom: 20px;"><h5 style="color: var(--texto-principal); margin-bottom: 10px;">🔒 Campos Fixos (Sistema)</h5>';
            camposFixos.forEach((campo) => {
                const tipoLabel = {
                    'texto': '📝 Texto',
                    'textarea': '📄 Área de Texto',
                    'data': '📅 Data',
                    'numero': '🔢 Número',
                    'email': '📧 E-mail',
                    'telefone': '📱 Telefone',
                    'cpf': '🆔 CPF',
                    'select': '📋 Select',
                    'checkbox': '☑️ Checkbox',
                    'radio': '🔘 Radio',
                    'file': '📎 Arquivo'
                }[campo.tipo] || campo.tipo;
                
                // Verificar se há configuração customizada para este campo fixo
                const configCustomizada = (this.configuracoes.camposFixos[tipo] || {})[campo.nome] || {};
                const labelExibido = configCustomizada.label || campo.label;
                const obrigatorioCustomizado = configCustomizada.obrigatorio !== undefined ? configCustomizada.obrigatorio : campo.obrigatorio;
                const oculto = configCustomizada.oculto || false;
                
                html += `
                    <div class="config-item" style="margin-bottom: 10px; ${oculto ? 'opacity: 0.5;' : ''}">
                        <div class="config-item-info">
                            <div class="config-item-label">${labelExibido} <span style="color: var(--azul-royal); font-size: 0.85em;">(Fixo)</span> ${oculto ? '<span style="color: #ff4757; font-size: 0.85em;">(Oculto)</span>' : ''}</div>
                            <div class="config-item-type">Tipo: ${tipoLabel} | ID: ${campo.nome} ${obrigatorioCustomizado ? '| ⚠️ Obrigatório' : ''}</div>
                        </div>
                        <div class="config-item-actions">
                            <button class="btn-admin btn-edit" onclick="adminConfig.editarCampoFixo('${tipo}', '${campo.nome}')">✏️ Editar</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Campos de Texto Dinâmicos
        if (camposTexto.length > 0) {
            html += '<div style="margin-bottom: 20px;"><h5 style="color: var(--texto-principal); margin-bottom: 10px;">📝 Campos de Texto</h5>';
            camposTexto.forEach((campo) => {
                const index = this.configuracoes.camposTexto.findIndex(c => c.nome === campo.nome);
                const tipoLabel = {
                    'texto': '📝 Texto',
                    'textarea': '📄 Área de Texto',
                    'data': '📅 Data',
                    'numero': '🔢 Número',
                    'email': '📧 E-mail',
                    'telefone': '📱 Telefone',
                    'cpf': '🆔 CPF'
                }[campo.tipo] || campo.tipo;
                
                html += `
                    <div class="config-item" style="margin-bottom: 10px;">
                        <div class="config-item-info">
                            <div class="config-item-label">${campo.label}</div>
                            <div class="config-item-type">Tipo: ${tipoLabel} | ID: ${campo.nome} ${campo.obrigatorio ? '| ⚠️ Obrigatório' : ''}</div>
                        </div>
                        <div class="config-item-actions">
                            <button class="btn-admin btn-edit" onclick="adminConfig.editarCampoExistente('campoTexto', '${tipo}', ${index})">✏️ Editar</button>
                            <button class="btn-admin btn-delete" onclick="adminConfig.removerCampoExistente('campoTexto', '${tipo}', ${index})">🗑️ Remover</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Listas
        if (listas.length > 0) {
            html += '<div style="margin-bottom: 20px;"><h5 style="color: var(--texto-principal); margin-bottom: 10px;">📋 Listas (Selects)</h5>';
            listas.forEach((lista) => {
                const index = this.configuracoes.listas.findIndex(l => l.nome === lista.nome);
                html += `
                    <div class="config-item" style="margin-bottom: 10px;">
                        <div class="config-item-info">
                            <div class="config-item-label">${lista.label}</div>
                            <div class="config-item-type">ID: ${lista.nome} | Opções: ${lista.opcoes ? lista.opcoes.length : 0} ${lista.obrigatorio ? '| ⚠️ Obrigatório' : ''}</div>
                        </div>
                        <div class="config-item-actions">
                            <button class="btn-admin btn-edit" onclick="adminConfig.editarCampoExistente('lista', '${tipo}', ${index})">✏️ Editar</button>
                            <button class="btn-admin btn-delete" onclick="adminConfig.removerCampoExistente('lista', '${tipo}', ${index})">🗑️ Remover</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Checkboxes
        if (checkboxes.length > 0) {
            html += '<div style="margin-bottom: 20px;"><h5 style="color: var(--texto-principal); margin-bottom: 10px;">☑️ Checkboxes</h5>';
            checkboxes.forEach((checkbox) => {
                const index = this.configuracoes.checkboxes.findIndex(c => c.nome === checkbox.nome);
                html += `
                    <div class="config-item" style="margin-bottom: 10px;">
                        <div class="config-item-info">
                            <div class="config-item-label">${checkbox.label}</div>
                            <div class="config-item-type">ID: ${checkbox.nome} ${checkbox.obrigatorio ? '| ⚠️ Obrigatório' : ''}</div>
                        </div>
                        <div class="config-item-actions">
                            <button class="btn-admin btn-edit" onclick="adminConfig.editarCampoExistente('checkbox', '${tipo}', ${index})">✏️ Editar</button>
                            <button class="btn-admin btn-delete" onclick="adminConfig.removerCampoExistente('checkbox', '${tipo}', ${index})">🗑️ Remover</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        html += '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--borda);">';
        html += `<button class="btn-admin btn-add" onclick="adminConfig.adicionarCampoParaFicha('${tipo}')">➕ Adicionar Novo Campo para ${tipo.toUpperCase()}</button>`;
        html += '</div>';
        
        container.innerHTML = html;
    }

    editarCampoExistente(tipoCampo, tipoFicha, index) {
        if (tipoCampo === 'campoTexto') {
            this.editarCampoTexto(index);
        } else if (tipoCampo === 'lista') {
            this.editarLista(index);
        } else if (tipoCampo === 'checkbox') {
            this.editarCheckbox(index);
        }
    }

    async removerCampoExistente(tipoCampo, tipoFicha, index) {
        if (!confirm('Tem certeza que deseja remover este campo?')) {
            return;
        }
        
        if (tipoCampo === 'campoTexto') {
            await this.removerCampoTexto(index);
        } else if (tipoCampo === 'lista') {
            await this.removerLista(index);
        } else if (tipoCampo === 'checkbox') {
            await this.removerCheckbox(index);
        }
        
        // Recarregar campos da ficha
        this.carregarCamposFicha();
    }

    // Função auxiliar para obter opções atuais de um select fixo
    obterOpcoesSelectFixo(tipoFicha, nomeCampo) {
        const mapeamentoIds = {
            'bacen': {
                'mes': 'bacen-mes',
                'origem': 'bacen-origem',
                'motivoReduzido': 'bacen-motivo-reduzido'
            },
            'n2': {
                'mes': 'n2-mes',
                'motivoReduzido': 'n2-motivo-reduzido',
                'pixStatus': 'n2-pix-status'
            },
            'chatbot': {
                'notaAvaliacao': 'chatbot-nota-avaliacao',
                'produto': 'chatbot-produto',
                'motivo': 'chatbot-motivo',
                'pixStatus': 'chatbot-pix-status'
            }
        };
        
        const seletor = mapeamentoIds[tipoFicha]?.[nomeCampo];
        if (!seletor) return [];
        
        const select = document.getElementById(seletor);
        if (!select) return [];
        
        const opcoes = [];
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            if (option.value !== '') { // Ignorar opção vazia "Selecione..."
                opcoes.push(option.value);
            }
        }
        return opcoes;
    }

    // Função auxiliar para obter opções atuais de um radio fixo
    obterOpcoesRadioFixo(tipoFicha, nomeCampo) {
        const mapeamentoIds = {
            'bacen': {
                'origemTipo': 'input[name="bacen-origem-tipo"]',
                'enviarCobranca': 'input[name="bacen-enviar-cobranca"]'
            },
            'n2': {
                'origemTipo': 'input[name="n2-origem-tipo"]',
                'enviarCobranca': 'input[name="n2-enviar-cobranca"]',
                'formalizadoCliente': 'input[name="n2-formalizado-cliente"]'
            },
            'chatbot': {
                'respostaBot': 'input[name="chatbot-resposta-bot"]',
                'enviarCobranca': 'input[name="chatbot-enviar-cobranca"]'
            }
        };
        
        const seletor = mapeamentoIds[tipoFicha]?.[nomeCampo];
        if (!seletor) return [];
        
        const radios = document.querySelectorAll(seletor);
        if (radios.length === 0) return [];
        
        const opcoes = [];
        radios.forEach(radio => {
            if (radio.value) {
                opcoes.push(radio.value);
            }
        });
        return [...new Set(opcoes)]; // Remover duplicatas
    }

    // Função auxiliar para obter opções originais de um campo fixo (do HTML original)
    obterOpcoesCampoFixoOriginal(tipoFicha, nomeCampo) {
        const opcoesOriginais = {
            'bacen': {
                'mes': ['01/2026', '02/2026', '03/2026', '04/2026', '05/2026', '06/2026', '07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'],
                'origem': ['Bacen Celcoin', 'Bacen Via Capital', 'Consumidor.Gov'],
                'motivoReduzido': [
                    'Abatimento Juros', 'Abatimento Juros/Chave PIX', 'Cancelamento Conta', 'Chave PIX',
                    'PIX/Abatimento Juros/Encerramento de conta', 'Chave PIX/Abatimento Juros/Prob. App',
                    'Chave PIX/Acesso ao App', 'Chave PIX/Exclusão de Conta', 'Conta', 'Contestação de Valores',
                    'Credito do Trabalhador', 'Credito Pessoal', 'Cupons Velotax', 'Devolução à Celcoin',
                    'Fraude', 'Liquidação Antecipada', 'Liquidação Antecipada/Abatimento Juros',
                    'Não recebeu restituição', 'Não recebeu restituição/Abatimento Juros',
                    'Não recebeu restituição/Abatimento Juros/Chave PIX', 'Não recebeu restituição/Chave PIX',
                    'Probl. App/Gov', 'Seguro Celular', 'Seguro Divida Zero', 'Seguro Prestamista',
                    'Seguro Saude', 'Superendividamento'
                ],
                'origemTipo': ['Ligação', 'Ticket'],
                'enviarCobranca': ['Sim', 'Não']
            },
            'n2': {
                'mes': ['01/2026', '02/2026', '03/2026', '04/2026', '05/2026', '06/2026', '07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'],
                'motivoReduzido': [
                    'Abatimento Juros', 'Abatimento Juros/Chave PIX', 'Cancelamento Conta', 'Chave PIX',
                    'PIX/Abatimento Juros/Encerramento de conta', 'Chave PIX/Abatimento Juros/Prob. App',
                    'Chave PIX/Acesso ao App', 'Chave PIX/Exclusão de Conta', 'Conta', 'Contestação de Valores',
                    'Credito do Trabalhador', 'Credito Pessoal', 'Cupons Velotax', 'Devolução à Celcoin',
                    'Fraude', 'Liquidação Antecipada', 'Liquidação Antecipada/Abatimento Juros',
                    'Não recebeu restituição', 'Não recebeu restituição/Abatimento Juros',
                    'Não recebeu restituição/Abatimento Juros/Chave PIX', 'Não recebeu restituição/Chave PIX',
                    'Probl. App/Gov', 'Seguro Celular', 'Seguro Divida Zero', 'Seguro Prestamista',
                    'Seguro Saude', 'Superendividamento'
                ],
                'pixStatus': ['Liberado', 'Excluído', 'Solicitada', 'Não aplicável'],
                'origemTipo': ['Ligação', 'Ticket'],
                'enviarCobranca': ['Sim', 'Não'],
                'formalizadoCliente': ['Sim', 'Não']
            },
            'chatbot': {
                'notaAvaliacao': ['1', '2', '3', '4', '5'],
                'produto': ['Produto 1', 'Produto 2', 'Produto 3'], // Ajustar conforme necessário
                'motivo': ['Motivo 1', 'Motivo 2', 'Motivo 3'], // Ajustar conforme necessário
                'pixStatus': ['Liberado', 'Excluído', 'Solicitada', 'Não aplicável'],
                'respostaBot': ['Sim', 'Não'],
                'enviarCobranca': ['Sim', 'Não']
            }
        };
        
        return opcoesOriginais[tipoFicha.toLowerCase()]?.[nomeCampo] || [];
    }

    // Função auxiliar para detectar o tipo real do campo no HTML
    detectarTipoCampoReal(tipoFicha, nomeCampo) {
        const mapeamentoIds = {
            'bacen': {
                'dataEntrada': 'bacen-data-entrada',
                'mes': 'bacen-mes',
                'nomeCompleto': 'bacen-nome',
                'cpf': 'bacen-cpf',
                'origem': 'bacen-origem',
                'origemTipo': 'input[name="bacen-origem-tipo"]',
                'telefone': '#bacen-telefones-container',
                'rdr': 'bacen-rdr',
                'motivoReduzido': 'bacen-motivo-reduzido',
                'prazoBacen': 'bacen-prazo-bacen',
                'motivoDetalhado': 'bacen-motivo-detalhado',
                'enviarCobranca': 'input[name="bacen-enviar-cobranca"]',
                'casosCriticos': 'bacen-casos-criticos',
                'status': 'bacen-status',
                'finalizadoEm': 'bacen-finalizado-em',
                'observacoes': 'bacen-observacoes'
            },
            'n2': {
                'dataEntradaAtendimento': 'n2-data-entrada-atendimento',
                'dataEntradaN2': 'n2-data-entrada-n2',
                'mes': 'n2-mes',
                'nomeCompleto': 'n2-nome',
                'cpf': 'n2-cpf',
                'telefone': '#n2-telefones-container',
                'origemTipo': 'input[name="n2-origem-tipo"]',
                'motivoReduzido': 'n2-motivo-reduzido',
                'pixStatus': 'n2-pix-status',
                'enviarCobranca': 'input[name="n2-enviar-cobranca"]',
                'formalizadoCliente': 'input[name="n2-formalizado-cliente"]',
                'casosCriticos': 'n2-casos-criticos',
                'status': 'n2-status',
                'finalizadoEm': 'n2-finalizado-em',
                'observacoes': 'n2-observacoes'
            },
            'chatbot': {
                'dataClienteChatbot': 'chatbot-data-cliente',
                'nomeCompleto': 'chatbot-nome',
                'cpf': 'chatbot-cpf',
                'telefone': '#chatbot-telefones-container',
                'notaAvaliacao': 'chatbot-nota-avaliacao',
                'avaliacaoCliente': 'chatbot-avaliacao-cliente',
                'produto': 'chatbot-produto',
                'motivo': 'chatbot-motivo',
                'respostaBot': 'input[name="chatbot-resposta-bot"]',
                'pixStatus': 'chatbot-pix-status',
                'enviarCobranca': 'input[name="chatbot-enviar-cobranca"]',
                'casosCriticos': 'chatbot-casos-criticos',
                'observacoes': 'chatbot-observacoes',
                'status': 'chatbot-status',
                'canalChatbot': 'chatbot-canal'
            }
        };
        
        const seletor = mapeamentoIds[tipoFicha]?.[nomeCampo];
        if (!seletor) return null;
        
        let elemento = null;
        if (seletor.startsWith('#')) {
            elemento = document.querySelector(seletor);
        } else if (seletor.startsWith('input[name=')) {
            elemento = document.querySelector(seletor);
        } else {
            elemento = document.getElementById(seletor);
        }
        
        if (!elemento) return null;
        
        // Detectar tipo baseado no elemento HTML
        if (elemento.tagName === 'SELECT') {
            return 'select';
        } else if (elemento.tagName === 'INPUT' && elemento.type === 'radio') {
            return 'radio';
        } else if (elemento.tagName === 'INPUT' && elemento.type === 'checkbox') {
            return 'checkbox';
        } else if (elemento.tagName === 'TEXTAREA') {
            return 'textarea';
        } else if (elemento.tagName === 'INPUT' && elemento.type === 'date') {
            return 'data';
        } else if (elemento.tagName === 'INPUT' && elemento.type === 'number') {
            return 'numero';
        } else if (elemento.tagName === 'INPUT' && elemento.type === 'email') {
            return 'email';
        } else if (elemento.classList.contains('cpf-mask')) {
            return 'cpf';
        } else if (elemento.classList.contains('telefone-mask')) {
            return 'telefone';
        } else {
            return 'texto';
        }
    }

    editarCampoFixo(tipoFicha, nomeCampo) {
        const camposFixos = this.obterCamposFixos(tipoFicha);
        let campo = camposFixos.find(c => c.nome === nomeCampo);
        
        if (!campo) {
            this.mostrarMensagem('Campo fixo não encontrado', 'error');
            return;
        }
        
        // Detectar tipo real do campo no HTML (pode ser diferente do definido)
        const tipoReal = this.detectarTipoCampoReal(tipoFicha, nomeCampo);
        if (tipoReal) {
            campo = { ...campo, tipo: tipoReal }; // Usar tipo detectado
        }
        
        // Obter configuração customizada existente
        if (!this.configuracoes.camposFixos[tipoFicha]) {
            this.configuracoes.camposFixos[tipoFicha] = {};
        }
        const configAtual = this.configuracoes.camposFixos[tipoFicha][nomeCampo] || {};
        
        // Obter opções atuais do campo (se for select ou radio)
        let opcoesAtuais = [];
        if (campo.tipo === 'select') {
            // Prioridade: 1) Configuração salva, 2) HTML atual (se disponível), 3) Opções originais do campo fixo
            if (configAtual.opcoes !== undefined && configAtual.opcoes !== null && Array.isArray(configAtual.opcoes) && configAtual.opcoes.length > 0) {
                opcoesAtuais = configAtual.opcoes;
            } else {
                // Tentar ler do HTML atual (só funciona se estivermos na página do formulário)
                const opcoesHTML = this.obterOpcoesSelectFixo(tipoFicha, nomeCampo);
                if (Array.isArray(opcoesHTML) && opcoesHTML.length > 0) {
                    opcoesAtuais = opcoesHTML;
                } else {
                    // Se não encontrou no HTML, tentar obter opções originais do campo fixo
                    const opcoesOriginais = this.obterOpcoesCampoFixoOriginal(tipoFicha, nomeCampo);
                    opcoesAtuais = Array.isArray(opcoesOriginais) && opcoesOriginais.length > 0 ? opcoesOriginais : [];
                }
            }
        } else if (campo.tipo === 'radio') {
            // Prioridade: 1) Configuração salva, 2) HTML atual (se disponível), 3) Opções originais do campo fixo
            if (configAtual.opcoes !== undefined && configAtual.opcoes !== null && Array.isArray(configAtual.opcoes) && configAtual.opcoes.length > 0) {
                opcoesAtuais = configAtual.opcoes;
            } else {
                // Tentar ler do HTML atual (só funciona se estivermos na página do formulário)
                const opcoesHTML = this.obterOpcoesRadioFixo(tipoFicha, nomeCampo);
                if (Array.isArray(opcoesHTML) && opcoesHTML.length > 0) {
                    opcoesAtuais = opcoesHTML;
                } else {
                    // Se não encontrou no HTML, tentar obter opções originais do campo fixo
                    const opcoesOriginais = this.obterOpcoesCampoFixoOriginal(tipoFicha, nomeCampo);
                    opcoesAtuais = Array.isArray(opcoesOriginais) && opcoesOriginais.length > 0 ? opcoesOriginais : [];
                }
            }
        }
        
        console.log(`🔍 Opções obtidas para ${nomeCampo} (${campo.tipo}):`, opcoesAtuais);
        
        // Criar HTML para opções (se aplicável)
        let htmlOpcoes = '';
        if (campo.tipo === 'select' || campo.tipo === 'radio') {
            // Sempre mostrar pelo menos um campo vazio se não houver opções
            const opcoesParaExibir = opcoesAtuais.length > 0 ? opcoesAtuais : [''];
            
            htmlOpcoes = `
                <div style="margin-bottom: 15px; padding: 15px; background: var(--cor-container); border-radius: 8px; border: 1px solid var(--borda);">
                    <label style="display: block; margin-bottom: 10px; color: var(--texto-principal); font-weight: 500;">
                        Opções ${campo.tipo === 'select' ? '(Select/Dropdown)' : '(Radio)'} *
                    </label>
                    <div id="edit-fixo-opcoes-list" style="margin-bottom: 10px;">
                        ${opcoesParaExibir.map((opcao, idx) => `
                            <div class="option-item" style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <input type="text" class="opcao-input velohub-input" value="${opcao || ''}" placeholder="Digite uma opção" style="flex: 1;">
                                <button type="button" class="btn-admin btn-delete" onclick="this.parentElement.remove()" style="padding: 8px 12px;">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <button type="button" class="btn-admin btn-add" onclick="adminConfig.adicionarOpcaoFixo()" style="width: 100%;">➕ Adicionar Opção</button>
                    <small style="color: var(--texto-secundario); display: block; margin-top: 8px;">Adicione, edite ou remova as opções disponíveis</small>
                </div>
            `;
        }
        
        // Criar modal de edição
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Editar Campo Fixo: ${campo.label}</h2>
                    <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <form id="form-editar-campo-fixo" style="padding: 20px;">
                    <input type="hidden" id="edit-fixo-tipo" value="${tipoFicha}">
                    <input type="hidden" id="edit-fixo-nome" value="${nomeCampo}">
                    <input type="hidden" id="edit-fixo-tipo-campo" value="${campo.tipo}">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--texto-principal);">Label (Nome exibido) *</label>
                        <input type="text" id="edit-fixo-label" class="velohub-input" value="${configAtual.label || campo.label}" required>
                        <small style="color: var(--texto-secundario);">Nome que aparecerá no formulário</small>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--texto-principal);">Obrigatório</label>
                        <select id="edit-fixo-obrigatorio" class="velohub-input">
                            <option value="true" ${(configAtual.obrigatorio !== undefined ? configAtual.obrigatorio : campo.obrigatorio) ? 'selected' : ''}>Sim</option>
                            <option value="false" ${(configAtual.obrigatorio !== undefined ? configAtual.obrigatorio : campo.obrigatorio) ? '' : 'selected'}>Não</option>
                        </select>
                    </div>
                    
                    ${campo.tipo !== 'select' && campo.tipo !== 'radio' && campo.tipo !== 'checkbox' ? `
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--texto-principal);">Placeholder</label>
                        <input type="text" id="edit-fixo-placeholder" class="velohub-input" value="${configAtual.placeholder || ''}" placeholder="Texto de exemplo no campo">
                    </div>
                    ` : ''}
                    
                    ${campo.tipo === 'checkbox' ? `
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--texto-principal);">Valor Padrão (Marcado por padrão)</label>
                        <select id="edit-fixo-valor-padrao" class="velohub-input">
                            <option value="false" ${configAtual.valorPadrao === true ? '' : 'selected'}>Não marcado</option>
                            <option value="true" ${configAtual.valorPadrao === true ? 'selected' : ''}>Marcado</option>
                        </select>
                        <small style="color: var(--texto-secundario);">Define se o checkbox deve vir marcado por padrão</small>
                    </div>
                    ` : ''}
                    
                    ${htmlOpcoes}
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--texto-principal);">Observações</label>
                        <textarea id="edit-fixo-observacoes" class="velohub-input" rows="3" placeholder="Observações sobre este campo">${configAtual.observacoes || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 8px; color: var(--texto-principal);">
                            <input type="checkbox" id="edit-fixo-oculto" ${configAtual.oculto ? 'checked' : ''}>
                            Ocultar campo no formulário
                        </label>
                        <small style="color: var(--texto-secundario);">Se marcado, o campo não será exibido no formulário</small>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn-admin btn-add" style="flex: 1;">💾 Salvar</button>
                        <button type="button" class="btn-admin btn-secondary" onclick="this.closest('.modal').remove()" style="flex: 1;">❌ Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Adicionar listener ao formulário
        document.getElementById('form-editar-campo-fixo').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarConfiguracaoCampoFixo(tipoFicha, nomeCampo);
            modal.remove();
        });
    }

    adicionarOpcaoFixo() {
        const opcoesList = document.getElementById('edit-fixo-opcoes-list');
        if (!opcoesList) return;
        
        const div = document.createElement('div');
        div.className = 'option-item';
        div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px;';
        div.innerHTML = `
            <input type="text" class="opcao-input velohub-input" placeholder="Digite uma opção" style="flex: 1;">
            <button type="button" class="btn-admin btn-delete" onclick="this.parentElement.remove()" style="padding: 8px 12px;">✕</button>
        `;
        opcoesList.appendChild(div);
    }

    async salvarConfiguracaoCampoFixo(tipoFicha, nomeCampo) {
        const label = document.getElementById('edit-fixo-label').value.trim();
        const obrigatorio = document.getElementById('edit-fixo-obrigatorio').value === 'true';
        const tipoCampo = document.getElementById('edit-fixo-tipo-campo').value;
        const observacoes = document.getElementById('edit-fixo-observacoes').value.trim();
        const oculto = document.getElementById('edit-fixo-oculto').checked;
        
        // Obter placeholder (se não for select/radio/checkbox)
        let placeholder = '';
        const placeholderEl = document.getElementById('edit-fixo-placeholder');
        if (placeholderEl) {
            placeholder = placeholderEl.value.trim();
        }
        
        // Obter opções (se for select ou radio)
        let opcoes = [];
        if (tipoCampo === 'select' || tipoCampo === 'radio') {
            const opcoesList = document.getElementById('edit-fixo-opcoes-list');
            if (opcoesList) {
                const inputs = opcoesList.querySelectorAll('.opcao-input');
                opcoes = Array.from(inputs)
                    .map(input => input.value.trim())
                    .filter(val => val !== ''); // Remover opções vazias
            }
            
            if (opcoes.length === 0) {
                this.mostrarMensagem('É necessário ter pelo menos uma opção', 'error');
                return;
            }
        }
        
        // Obter valor padrão (se for checkbox)
        let valorPadrao = false;
        if (tipoCampo === 'checkbox') {
            const valorPadraoEl = document.getElementById('edit-fixo-valor-padrao');
            if (valorPadraoEl) {
                valorPadrao = valorPadraoEl.value === 'true';
            }
        }
        
        if (!label) {
            this.mostrarMensagem('Label é obrigatório', 'error');
            return;
        }
        
        // Inicializar estrutura se não existir
        if (!this.configuracoes.camposFixos[tipoFicha]) {
            this.configuracoes.camposFixos[tipoFicha] = {};
        }
        
        // Salvar configuração
        const config = {
            label,
            obrigatorio,
            observacoes: observacoes || undefined,
            oculto,
            dataModificacao: new Date().toISOString()
        };
        
        // Adicionar placeholder se não for select/radio/checkbox
        if (tipoCampo !== 'select' && tipoCampo !== 'radio' && tipoCampo !== 'checkbox' && placeholder) {
            config.placeholder = placeholder;
        }
        
        // Adicionar opções se for select ou radio
        if (tipoCampo === 'select' || tipoCampo === 'radio') {
            config.opcoes = opcoes;
        }
        
        // Adicionar valor padrão se for checkbox
        if (tipoCampo === 'checkbox') {
            config.valorPadrao = valorPadrao;
        }
        
        this.configuracoes.camposFixos[tipoFicha][nomeCampo] = config;
        
        // Salvar no Firebase/localStorage
        const sucesso = await this.salvarConfiguracoes();
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico('editar', 'campoFixo', {
                tipoFicha,
                nomeCampo,
                label,
                obrigatorio,
                oculto
            });
            
            this.mostrarMensagem('Configuração do campo fixo salva com sucesso!', 'success');
            
            // Recarregar campos da ficha
            this.carregarCamposFicha();
            
            // Disparar evento para atualizar formulários
            window.dispatchEvent(new CustomEvent('configuracoesFormulariosAtualizadas', {
                detail: this.configuracoes
            }));
        } else {
            this.mostrarMensagem('Erro ao salvar configuração', 'error');
        }
    }

    adicionarCampoParaFicha(tipoFicha) {
        // Criar modal de seleção de tipo
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Adicionar Campo para ${tipoFicha.toUpperCase()}</h2>
                    <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div style="padding: 20px;">
                    <p style="margin-bottom: 20px; color: var(--texto-secundario);">Selecione o tipo de campo:</p>
                    <button class="btn-admin btn-add" style="width: 100%; margin-bottom: 10px;" onclick="adminConfig.abrirModalCampoTexto(); document.getElementById('config-categoria').value = '${tipoFicha}'; this.closest('.modal').remove();">📝 Campo de Texto</button>
                    <button class="btn-admin btn-add" style="width: 100%; margin-bottom: 10px;" onclick="adminConfig.abrirModalLista(); document.getElementById('config-categoria').value = '${tipoFicha}'; this.closest('.modal').remove();">📋 Lista (Select)</button>
                    <button class="btn-admin btn-add" style="width: 100%;" onclick="adminConfig.abrirModalCheckbox(); document.getElementById('config-categoria').value = '${tipoFicha}'; this.closest('.modal').remove();">☑️ Checkbox</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async carregarHistorico() {
        try {
            // Tentar carregar do Firebase
            if (this.firebaseDB) {
                try {
                    const ref = this.firebaseDB.ref('configuracoes_formularios/historico');
                    const snapshot = await ref.once('value');
                    
                    if (snapshot.exists()) {
                        const historico = snapshot.val();
                        // Converter objeto em array e ordenar por timestamp
                        const historicoArray = Object.keys(historico).map(key => ({
                            id: key,
                            ...historico[key]
                        })).sort((a, b) => {
                            // Ordenar por timestamp (mais recente primeiro)
                            const tsA = a.timestamp || 0;
                            const tsB = b.timestamp || 0;
                            return tsB - tsA;
                        });
                        
                        return historicoArray;
                    }
                } catch (firebaseError) {
                    console.warn('⚠️ Erro ao carregar histórico do Firebase, usando localStorage:', firebaseError.message);
                }
            }
            
            // Fallback para localStorage
            const historicoLocal = localStorage.getItem('admin_historico');
            if (historicoLocal) {
                try {
                    const historico = JSON.parse(historicoLocal);
                    return historico.sort((a, b) => {
                        const timestampA = new Date(a.timestamp || a.dataFormatada || 0).getTime();
                        const timestampB = new Date(b.timestamp || b.dataFormatada || 0).getTime();
                        return timestampB - timestampA;
                    });
                } catch (parseError) {
                    console.error('❌ Erro ao parsear histórico do localStorage:', parseError);
                }
            }
            
            return [];
        } catch (error) {
            console.error('❌ Erro ao carregar histórico:', error);
            return [];
        }
    }

    async renderizarHistorico() {
        const container = document.getElementById('historico-list');
        if (!container) return;

        container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 20px;">Carregando histórico...</p>';

        const historico = await this.carregarHistorico();

        if (!historico || !Array.isArray(historico) || historico.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Nenhum registro de histórico encontrado</p>';
            return;
        }

        container.innerHTML = historico.map(item => {
            const acaoLabel = {
                'criar': '➕ Criado',
                'editar': '✏️ Editado',
                'remover': '🗑️ Removido'
            }[item.acao] || item.acao;

            const tipoLabel = {
                'campoTexto': '📝 Campo de Texto',
                'lista': '📋 Lista',
                'checkbox': '☑️ Checkbox'
            }[item.tipo] || item.tipo;

            const dadosInfo = item.dados ? 
                (item.dados.nome || item.dados.label || JSON.stringify(item.dados).substring(0, 50)) : 
                'N/A';

            const dataFormatada = item.dataFormatada || 
                (item.timestamp ? new Date(item.timestamp).toLocaleString('pt-BR') : 'Data não disponível');

            return `
                <div class="config-item" style="border-left: 4px solid var(--azul-royal);">
                    <div class="config-item-info">
                        <div class="config-item-label">
                            ${acaoLabel} - ${tipoLabel}: ${dadosInfo}
                        </div>
                        <div class="config-item-type">
                            Por: ${item.usuario || 'Sistema'} | ${dataFormatada}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizar() {
        this.renderizarCamposTexto();
        this.renderizarListas();
        this.renderizarCheckboxes();
        // Histórico será renderizado quando a aba for aberta
    }

    renderizarCamposTexto() {
        const container = document.getElementById('campos-texto-list');
        if (!container) return;

        if (this.configuracoes.camposTexto.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Nenhum campo de texto cadastrado</p>';
            return;
        }

        container.innerHTML = this.configuracoes.camposTexto.map((campo, index) => {
            const tipoLabel = {
                'texto': '📝 Texto',
                'textarea': '📄 Área de Texto',
                'data': '📅 Data',
                'numero': '🔢 Número',
                'email': '📧 E-mail',
                'telefone': '📱 Telefone',
                'cpf': '🆔 CPF'
            }[campo.tipo] || campo.tipo;
            
            return `
                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">${campo.label || campo.nome}</div>
                        <div class="config-item-type">ID: ${campo.nome} | Tipo: ${tipoLabel} | Categoria: ${campo.categoria || 'Todos'} ${campo.obrigatorio ? '| ⚠️ Obrigatório' : ''}</div>
                    </div>
                    <div class="config-item-actions">
                        <button class="btn-admin btn-edit" onclick="adminConfig.editarCampoTexto(${index})">✏️ Editar</button>
                        <button class="btn-admin btn-delete" onclick="adminConfig.removerCampoTexto(${index})">🗑️ Remover</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizarListas() {
        const container = document.getElementById('listas-list');
        if (!container) return;

        if (this.configuracoes.listas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Nenhuma lista cadastrada</p>';
            return;
        }

        container.innerHTML = this.configuracoes.listas.map((lista, index) => `
            <div class="config-item">
                <div class="config-item-info">
                    <div class="config-item-label">${lista.label || lista.nome}</div>
                    <div class="config-item-type">ID: ${lista.nome} | Categoria: ${lista.categoria || 'Todos'} | Opções: ${lista.opcoes ? lista.opcoes.length : 0}</div>
                </div>
                <div class="config-item-actions">
                    <button class="btn-admin btn-edit" onclick="adminConfig.editarLista(${index})">✏️ Editar</button>
                    <button class="btn-admin btn-delete" onclick="adminConfig.removerLista(${index})">🗑️ Remover</button>
                </div>
            </div>
        `).join('');
    }

    renderizarCheckboxes() {
        const container = document.getElementById('checkboxes-list');
        if (!container) return;

        if (this.configuracoes.checkboxes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Nenhum checkbox cadastrado</p>';
            return;
        }

        container.innerHTML = this.configuracoes.checkboxes.map((checkbox, index) => `
            <div class="config-item">
                <div class="config-item-info">
                    <div class="config-item-label">${checkbox.label || checkbox.nome}</div>
                    <div class="config-item-type">ID: ${checkbox.nome} | Categoria: ${checkbox.categoria || 'Todos'}</div>
                </div>
                <div class="config-item-actions">
                    <button class="btn-admin btn-edit" onclick="adminConfig.editarCheckbox(${index})">✏️ Editar</button>
                    <button class="btn-admin btn-delete" onclick="adminConfig.removerCheckbox(${index})">🗑️ Remover</button>
                </div>
            </div>
        `).join('');
    }

    abrirModalCampoTexto() {
        document.getElementById('modal-title').textContent = 'Adicionar Campo de Texto';
        document.getElementById('config-tipo').value = 'campoTexto';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('config-tipo-campo-group').style.display = 'block';
        document.getElementById('config-tipo-campo').value = 'texto';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }

    alterarTipoCampo() {
        const tipoCampo = document.getElementById('config-tipo-campo').value;
        const opcoesGroup = document.getElementById('config-opcoes-group');
        
        // Se for lista/select, mostrar opções
        if (tipoCampo === 'select') {
            opcoesGroup.style.display = 'block';
            if (document.getElementById('config-opcoes-list').children.length === 0) {
                document.getElementById('config-opcoes-list').innerHTML = '<div class="option-item"><input type="text" placeholder="Digite uma opção" class="opcao-input"></div>';
            }
        } else {
            opcoesGroup.style.display = 'none';
        }
    }

    editarCampoTexto(index) {
        const campo = this.configuracoes.camposTexto[index];
        document.getElementById('modal-title').textContent = 'Editar Campo de Texto';
        document.getElementById('config-tipo').value = 'campoTexto';
        document.getElementById('config-id').value = index;
        document.getElementById('config-nome').value = campo.nome;
        document.getElementById('config-label').value = campo.label || '';
        document.getElementById('config-categoria').value = campo.categoria || 'todos';
        document.getElementById('config-tipo-campo').value = campo.tipo || 'texto';
        document.getElementById('config-obrigatorio').value = campo.obrigatorio ? 'true' : 'false';
        document.getElementById('config-placeholder').value = campo.placeholder || '';
        document.getElementById('config-observacoes').value = campo.observacoes || '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('config-tipo-campo-group').style.display = 'block';
        document.getElementById('modal-config').classList.add('active');
    }

    abrirModalLista() {
        document.getElementById('modal-title').textContent = 'Adicionar Lista (Select)';
        document.getElementById('config-tipo').value = 'lista';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'block';
        document.getElementById('config-tipo-campo-group').style.display = 'none';
        document.getElementById('config-opcoes-list').innerHTML = '<div class="option-item"><input type="text" placeholder="Digite uma opção" class="opcao-input"></div>';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }

    abrirModalCheckbox() {
        document.getElementById('modal-title').textContent = 'Adicionar Checkbox';
        document.getElementById('config-tipo').value = 'checkbox';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('config-tipo-campo-group').style.display = 'none';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }


    editarLista(index) {
        const lista = this.configuracoes.listas[index];
        document.getElementById('modal-title').textContent = 'Editar Lista (Select)';
        document.getElementById('config-tipo').value = 'lista';
        document.getElementById('config-id').value = index;
        document.getElementById('config-nome').value = lista.nome;
        document.getElementById('config-label').value = lista.label || '';
        document.getElementById('config-categoria').value = lista.categoria || 'todos';
        document.getElementById('config-obrigatorio').value = lista.obrigatorio ? 'true' : 'false';
        document.getElementById('config-placeholder').value = lista.placeholder || '';
        document.getElementById('config-observacoes').value = lista.observacoes || '';
        document.getElementById('config-tipo-campo-group').style.display = 'none';
        
        // Renderizar opções
        const opcoesList = document.getElementById('config-opcoes-list');
        opcoesList.innerHTML = '';
        if (lista.opcoes && lista.opcoes.length > 0) {
            lista.opcoes.forEach(opcao => {
                const div = document.createElement('div');
                div.className = 'option-item';
                div.innerHTML = `
                    <input type="text" class="opcao-input" value="${opcao}" placeholder="Digite uma opção">
                    <button type="button" class="btn-remove-option" onclick="this.parentElement.remove()">✕</button>
                `;
                opcoesList.appendChild(div);
            });
        } else {
            opcoesList.innerHTML = '<div class="option-item"><input type="text" placeholder="Digite uma opção" class="opcao-input"></div>';
        }
        
        document.getElementById('config-opcoes-group').style.display = 'block';
        document.getElementById('modal-config').classList.add('active');
    }

    editarCheckbox(index) {
        const checkbox = this.configuracoes.checkboxes[index];
        document.getElementById('modal-title').textContent = 'Editar Checkbox';
        document.getElementById('config-tipo').value = 'checkbox';
        document.getElementById('config-id').value = index;
        document.getElementById('config-nome').value = checkbox.nome;
        document.getElementById('config-label').value = checkbox.label || '';
        document.getElementById('config-categoria').value = checkbox.categoria || 'todos';
        document.getElementById('config-obrigatorio').value = checkbox.obrigatorio ? 'true' : 'false';
        document.getElementById('config-placeholder').value = checkbox.placeholder || '';
        document.getElementById('config-observacoes').value = checkbox.observacoes || '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('config-tipo-campo-group').style.display = 'none';
        document.getElementById('modal-config').classList.add('active');
    }

    async salvarConfiguracao(event) {
        event.preventDefault();
        
        const tipo = document.getElementById('config-tipo').value;
        const id = document.getElementById('config-id').value;
        const nome = document.getElementById('config-nome').value.trim();
        const label = document.getElementById('config-label').value.trim();
        const categoria = document.getElementById('config-categoria').value;
        const obrigatorio = document.getElementById('config-obrigatorio').value === 'true';
        const placeholder = document.getElementById('config-placeholder').value.trim();
        const observacoes = document.getElementById('config-observacoes').value.trim();
        
        if (!nome || !label) {
            this.mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        const config = {
            nome: nome,
            label: label,
            categoria: categoria,
            obrigatorio: obrigatorio,
            placeholder: placeholder,
            observacoes: observacoes,
            atualizadoEm: new Date().toISOString()
        };
        
        // Adicionar tipo de campo se for campo de texto
        if (tipo === 'campoTexto') {
            const tipoCampo = document.getElementById('config-tipo-campo').value;
            config.tipo = tipoCampo;
        }
        
        // Adicionar opções se for lista
        if (tipo === 'lista') {
            const opcoesInputs = document.querySelectorAll('.opcao-input');
            const opcoes = Array.from(opcoesInputs)
                .map(input => input.value.trim())
                .filter(valor => valor.length > 0);
            
            if (opcoes.length === 0) {
                this.mostrarMensagem('Adicione pelo menos uma opção para a lista', 'error');
                return;
            }
            
            config.opcoes = opcoes;
        }
        
        // Determinar ação para histórico
        const acao = id === '' ? 'criar' : 'editar';
        const arrayNome = tipo === 'campoTexto' ? 'camposTexto' : tipo === 'lista' ? 'listas' : 'checkboxes';
        const dadosAntigos = id !== '' ? this.configuracoes[arrayNome][parseInt(id)] : null;
        
        // Salvar no array apropriado
        if (id === '') {
            // Nova configuração
            this.configuracoes[arrayNome].push(config);
        } else {
            // Editar configuração existente
            const index = parseInt(id);
            this.configuracoes[arrayNome][index] = config;
        }
        
        // Salvar no Firebase
        const sucesso = await this.salvarConfiguracoes();
        
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico(acao, tipo, {
                nome: config.nome,
                label: config.label,
                categoria: config.categoria,
                dadosAntigos: dadosAntigos
            });
            
            this.renderizar();
            this.fecharModal();
            
            // Se estiver na aba de editar fichas, recarregar
            const tipoFicha = document.getElementById('tipo-ficha-editar')?.value;
            if (tipoFicha) {
                this.carregarCamposFicha();
            }
        }
    }

    async removerCampoTexto(index) {
        if (!confirm('Tem certeza que deseja remover este campo de texto?')) {
            return;
        }
        
        const campoRemovido = this.configuracoes.camposTexto[index];
        this.configuracoes.camposTexto.splice(index, 1);
        
        const sucesso = await this.salvarConfiguracoes();
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico('remover', 'campoTexto', {
                nome: campoRemovido.nome,
                label: campoRemovido.label
            });
        }
        
        this.renderizar();
    }

    async removerLista(index) {
        if (!confirm('Tem certeza que deseja remover esta lista?')) {
            return;
        }
        
        const listaRemovida = this.configuracoes.listas[index];
        this.configuracoes.listas.splice(index, 1);
        
        const sucesso = await this.salvarConfiguracoes();
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico('remover', 'lista', {
                nome: listaRemovida.nome,
                label: listaRemovida.label
            });
        }
        
        this.renderizar();
    }

    async removerCheckbox(index) {
        if (!confirm('Tem certeza que deseja remover este checkbox?')) {
            return;
        }
        
        const checkboxRemovido = this.configuracoes.checkboxes[index];
        this.configuracoes.checkboxes.splice(index, 1);
        
        const sucesso = await this.salvarConfiguracoes();
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico('remover', 'checkbox', {
                nome: checkboxRemovido.nome,
                label: checkboxRemovido.label
            });
        }
        
        this.renderizar();
    }

    fecharModal() {
        document.getElementById('modal-config').classList.remove('active');
        document.getElementById('form-config').reset();
    }

    mostrarMensagem(mensagem, tipo) {
        const statusDiv = document.getElementById('status-message');
        statusDiv.textContent = mensagem;
        statusDiv.className = `status-message ${tipo}`;
        
        setTimeout(() => {
            statusDiv.className = 'status-message';
        }, 5000);
    }
}

// Funções globais para acesso via HTML
let adminConfig;
window.adminConfig = null; // Será definido após inicialização

function mostrarAba(aba) {
    // Remover active de todas as abas
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    
    // Ativar aba selecionada
    event.target.classList.add('active');
    document.getElementById(`aba-${aba}`).classList.add('active');
    
    // Ações específicas por aba
    if (aba === 'historico' && adminConfig) {
        adminConfig.renderizarHistorico();
    } else if (aba === 'editar-fichas' && adminConfig) {
        // Limpar seleção ao abrir a aba
        document.getElementById('tipo-ficha-editar').value = '';
        document.getElementById('campos-ficha-editaveis').innerHTML = '';
    }
}

function abrirModalCampoTexto() {
    adminConfig.abrirModalCampoTexto();
}

function abrirModalLista() {
    adminConfig.abrirModalLista();
}

function abrirModalCheckbox() {
    adminConfig.abrirModalCheckbox();
}

function fecharModal() {
    adminConfig.fecharModal();
}

function adicionarOpcao() {
    const opcoesList = document.getElementById('config-opcoes-list');
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
        <input type="text" class="opcao-input" placeholder="Digite uma opção">
        <button type="button" class="btn-remove-option" onclick="this.parentElement.remove()">✕</button>
    `;
    opcoesList.appendChild(div);
}

// Expor função globalmente para uso em campos fixos
window.adicionarOpcaoFixo = function() {
    if (adminConfig && typeof adminConfig.adicionarOpcaoFixo === 'function') {
        adminConfig.adicionarOpcaoFixo();
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    adminConfig = new AdminConfiguracoes();
    window.adminConfig = adminConfig; // Expor globalmente imediatamente
    
    // Aguardar Firebase inicializar
    const aguardarFirebaseAdmin = async () => {
        if (window.firebaseDB && window.firebaseDB.inicializado) {
            await adminConfig.inicializar();
        } else {
            // Aguardar evento firebaseReady
            window.addEventListener('firebaseReady', async () => {
                await adminConfig.inicializar();
            }, { once: true });
            
            // Fallback: verificar periodicamente
            let tentativas = 0;
            const verificar = setInterval(() => {
                tentativas++;
                if (window.firebaseDB && window.firebaseDB.inicializado) {
                    clearInterval(verificar);
                    adminConfig.inicializar();
                } else if (tentativas >= 50) {
                    clearInterval(verificar);
                    console.error('❌ Firebase não inicializou após 5 segundos');
                    adminConfig.mostrarMensagem('Erro: Firebase não inicializou. Verifique o console.', 'error');
                }
            }, 100);
        }
    };
    
    await aguardarFirebaseAdmin();
    
    // Configurar formulário
    const formConfig = document.getElementById('form-config');
    if (formConfig) {
        formConfig.addEventListener('submit', (e) => {
            adminConfig.salvarConfiguracao(e);
        });
    }
});
