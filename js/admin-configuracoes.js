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
            categorias: [],
            listas: [],
            checkboxes: []
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

            const ref = this.firebaseDB.ref('configuracoes_formularios');
            const snapshot = await ref.once('value');
            
            if (snapshot.exists()) {
                const dados = snapshot.val();
                this.configuracoes = {
                    categorias: dados.categorias || [],
                    listas: dados.listas || [],
                    checkboxes: dados.checkboxes || []
                };
                console.log('✅ Configurações carregadas do Firebase:', this.configuracoes);
            } else {
                console.log('ℹ️ Nenhuma configuração encontrada, iniciando com dados vazios');
                // Inicializar estrutura vazia
                this.configuracoes = {
                    categorias: [],
                    listas: [],
                    checkboxes: []
                };
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            throw error;
        }
    }

    async salvarConfiguracoes() {
        try {
            if (!this.firebaseDB) {
                throw new Error('Firebase não está disponível');
            }

            const ref = this.firebaseDB.ref('configuracoes_formularios');
            await ref.set({
                categorias: this.configuracoes.categorias,
                listas: this.configuracoes.listas,
                checkboxes: this.configuracoes.checkboxes,
                atualizadoEm: firebase.database.ServerValue.TIMESTAMP
            });
            
            console.log('✅ Configurações salvas no Firebase');
            this.mostrarMensagem('Configurações salvas com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.mostrarMensagem('Erro ao salvar configurações: ' + error.message, 'error');
            return false;
        }
    }

    async registrarHistorico(acao, tipo, dados) {
        try {
            if (!this.firebaseDB) {
                return;
            }

            // Obter usuário atual (se disponível)
            const usuario = this.obterUsuarioAtual();
            
            const historicoItem = {
                acao: acao, // 'criar', 'editar', 'remover'
                tipo: tipo, // 'categoria', 'lista', 'checkbox'
                dados: dados,
                usuario: usuario,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                dataFormatada: new Date().toLocaleString('pt-BR')
            };

            const ref = this.firebaseDB.ref('configuracoes_formularios/historico');
            await ref.push(historicoItem);
            
            console.log('✅ Histórico registrado:', historicoItem);
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

    async carregarHistorico() {
        try {
            if (!this.firebaseDB) {
                return;
            }

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
                'categoria': '📁 Categoria',
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
        this.renderizarCategorias();
        this.renderizarListas();
        this.renderizarCheckboxes();
        // Histórico será renderizado quando a aba for aberta
    }

    renderizarCategorias() {
        const container = document.getElementById('categorias-list');
        if (!container) return;

        if (this.configuracoes.categorias.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--texto-secundario); padding: 40px;">Nenhuma categoria cadastrada</p>';
            return;
        }

        container.innerHTML = this.configuracoes.categorias.map((cat, index) => `
            <div class="config-item">
                <div class="config-item-info">
                    <div class="config-item-label">${cat.label || cat.nome}</div>
                    <div class="config-item-type">ID: ${cat.nome} | Categoria: ${cat.categoria || 'Todos'}</div>
                </div>
                <div class="config-item-actions">
                    <button class="btn-admin btn-edit" onclick="adminConfig.editarCategoria(${index})">✏️ Editar</button>
                    <button class="btn-admin btn-delete" onclick="adminConfig.removerCategoria(${index})">🗑️ Remover</button>
                </div>
            </div>
        `).join('');
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

    abrirModalCategoria() {
        document.getElementById('modal-title').textContent = 'Adicionar Categoria';
        document.getElementById('config-tipo').value = 'categoria';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }

    abrirModalLista() {
        document.getElementById('modal-title').textContent = 'Adicionar Lista (Select)';
        document.getElementById('config-tipo').value = 'lista';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'block';
        document.getElementById('config-opcoes-list').innerHTML = '<div class="option-item"><input type="text" placeholder="Digite uma opção" class="opcao-input"></div>';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }

    abrirModalCheckbox() {
        document.getElementById('modal-title').textContent = 'Adicionar Checkbox';
        document.getElementById('config-tipo').value = 'checkbox';
        document.getElementById('config-id').value = '';
        document.getElementById('config-opcoes-group').style.display = 'none';
        document.getElementById('form-config').reset();
        document.getElementById('modal-config').classList.add('active');
    }

    editarCategoria(index) {
        const categoria = this.configuracoes.categorias[index];
        document.getElementById('modal-title').textContent = 'Editar Categoria';
        document.getElementById('config-tipo').value = 'categoria';
        document.getElementById('config-id').value = index;
        document.getElementById('config-nome').value = categoria.nome;
        document.getElementById('config-label').value = categoria.label || '';
        document.getElementById('config-categoria').value = categoria.categoria || 'todos';
        document.getElementById('config-obrigatorio').value = categoria.obrigatorio ? 'true' : 'false';
        document.getElementById('config-observacoes').value = categoria.observacoes || '';
        document.getElementById('config-opcoes-group').style.display = 'none';
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
        document.getElementById('config-observacoes').value = lista.observacoes || '';
        
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
        document.getElementById('config-observacoes').value = checkbox.observacoes || '';
        document.getElementById('config-opcoes-group').style.display = 'none';
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
            observacoes: observacoes,
            atualizadoEm: new Date().toISOString()
        };
        
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
        const dadosAntigos = id !== '' ? 
            this.configuracoes[tipo === 'categoria' ? 'categorias' : tipo === 'lista' ? 'listas' : 'checkboxes'][parseInt(id)] : 
            null;
        
        // Salvar no array apropriado
        if (id === '') {
            // Nova configuração
            this.configuracoes[tipo === 'categoria' ? 'categorias' : tipo === 'lista' ? 'listas' : 'checkboxes'].push(config);
        } else {
            // Editar configuração existente
            const index = parseInt(id);
            this.configuracoes[tipo === 'categoria' ? 'categorias' : tipo === 'lista' ? 'listas' : 'checkboxes'][index] = config;
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
        }
    }

    async removerCategoria(index) {
        if (!confirm('Tem certeza que deseja remover esta categoria?')) {
            return;
        }
        
        const categoriaRemovida = this.configuracoes.categorias[index];
        this.configuracoes.categorias.splice(index, 1);
        
        const sucesso = await this.salvarConfiguracoes();
        if (sucesso) {
            // Registrar no histórico
            await this.registrarHistorico('remover', 'categoria', {
                nome: categoriaRemovida.nome,
                label: categoriaRemovida.label
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
    } else if (aba === 'fichas' && adminConfig) {
        // Limpar resultados ao abrir a aba
        const container = document.getElementById('fichas-resultados');
        if (container) {
            container.innerHTML = '';
        }
    }
}

function abrirModalCategoria() {
    adminConfig.abrirModalCategoria();
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

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    adminConfig = new AdminConfiguracoes();
    
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
