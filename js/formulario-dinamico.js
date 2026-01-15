/**
 * Sistema de Formulários Dinâmicos
 * VERSION: v1.0.0 | DATE: 2025-02-01 | AUTHOR: VeloHub Development Team
 * 
 * Carrega configurações do Firebase e aplica nos formulários de criação/edição
 * Compatível com BACEN, N2 e Chatbot
 */

class FormularioDinamico {
    constructor() {
        this.configuracoes = null;
        this.firebaseDB = null;
        this.inicializado = false;
    }

    async inicializar() {
        try {
            console.log('🔄 Inicializando FormularioDinamico...');
            
            // Aguardar Firebase
            await this.aguardarFirebase();
            
            // Carregar configurações
            await this.carregarConfiguracoes();
            
            // Configurar observador em tempo real
            this.configurarObservadorTempoReal();
            
            // Escutar eventos de atualização
            window.addEventListener('configuracoesFormulariosAtualizadas', (event) => {
                console.log('🔄 Configurações atualizadas, reaplicando nos formulários...');
                this.configuracoes = event.detail;
                this.aplicarConfiguracoesEmTodosFormularios();
            });
            
            this.inicializado = true;
            console.log('✅ FormularioDinamico inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar FormularioDinamico:', error);
        }
    }

    async aguardarFirebase() {
        return new Promise((resolve, reject) => {
            if (window.firebaseDB && window.firebaseDB.database) {
                this.firebaseDB = window.firebaseDB.database;
                resolve();
                return;
            }
            
            if (window.firebaseDB && window.firebaseDB.inicializado) {
                this.firebaseDB = window.firebaseDB.database;
                resolve();
                return;
            }
            
            let tentativas = 0;
            const maxTentativas = 50;
            
            const verificar = setInterval(() => {
                tentativas++;
                
                if (window.firebaseDB && window.firebaseDB.database) {
                    clearInterval(verificar);
                    this.firebaseDB = window.firebaseDB.database;
                    resolve();
                } else if (window.firebaseDB && window.firebaseDB.inicializado) {
                    clearInterval(verificar);
                    this.firebaseDB = window.firebaseDB.database;
                    resolve();
                } else if (tentativas >= maxTentativas) {
                    clearInterval(verificar);
                    reject(new Error('Firebase não inicializou'));
                }
            }, 100);
        });
    }

    async carregarConfiguracoes() {
        try {
            // Tentar carregar do Firebase
            if (this.firebaseDB) {
                try {
                    const ref = this.firebaseDB.ref('configuracoes_formularios');
                    const snapshot = await ref.once('value');
                    
                    if (snapshot.exists()) {
                        this.configuracoes = snapshot.val();
                        console.log('✅ Configurações carregadas do Firebase para formulários:', this.configuracoes);
                        return;
                    }
                } catch (firebaseError) {
                    console.warn('⚠️ Erro ao carregar do Firebase, tentando localStorage:', firebaseError.message);
                }
            }
            
            // Fallback para localStorage
            const dadosLocal = localStorage.getItem('admin_configuracoes_formularios');
            if (dadosLocal) {
                try {
                    this.configuracoes = JSON.parse(dadosLocal);
                    console.log('✅ Configurações carregadas do localStorage para formulários:', this.configuracoes);
                    return;
                } catch (parseError) {
                    console.error('❌ Erro ao parsear localStorage:', parseError);
                }
            }
            
            // Inicializar estrutura vazia
            console.log('ℹ️ Nenhuma configuração encontrada, usando padrões');
            this.configuracoes = {
                camposTexto: [],
                listas: [],
                checkboxes: []
            };
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            this.configuracoes = {
                camposTexto: [],
                listas: [],
                checkboxes: []
            };
        }
    }

    /**
     * Aplica configurações dinâmicas em um formulário
     * @param {string} tipo - 'bacen', 'n2' ou 'chatbot'
     * @param {HTMLElement} container - Container do formulário
     */
    aplicarConfiguracoes(tipo, container) {
        if (!this.configuracoes) {
            console.warn('⚠️ Configurações não carregadas ainda');
            return;
        }

        // Aplicar campos de texto
        this.aplicarCamposTexto(tipo, container);
        
        // Aplicar listas (selects)
        this.aplicarListas(tipo, container);
        
        // Aplicar checkboxes
        this.aplicarCheckboxes(tipo, container);
    }

    aplicarCamposTexto(tipo, container) {
        const camposTexto = this.configuracoes.camposTexto || [];
        
        camposTexto.forEach(campo => {
            // Verificar se o campo se aplica a este tipo
            if (campo.categoria !== tipo && campo.categoria !== 'todos') {
                return;
            }
            
            // Procurar campo existente pelo ID
            const campoId = `${tipo}-${campo.nome}`;
            let campoElement = container.querySelector(`#${campoId}`);
            
            if (!campoElement) {
                // Criar campo se não existir
                const campoDiv = this.criarCampoTexto(campo, tipo);
                // Inserir no container (procurar local apropriado)
                const formSection = container.querySelector('.form-section:last-child') || container;
                formSection.appendChild(campoDiv);
            } else {
                // Atualizar campo existente (label, placeholder, etc)
                const label = campoElement.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.textContent = campo.label + (campo.obrigatorio ? ' *' : '');
                }
                if (campo.placeholder) {
                    campoElement.placeholder = campo.placeholder;
                }
            }
        });
    }

    criarCampoTexto(campo, tipo) {
        const div = document.createElement('div');
        div.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `${tipo}-${campo.nome}`);
        label.textContent = campo.label + (campo.obrigatorio ? ' *' : '');
        
        let input;
        const tipoCampo = campo.tipo || 'texto';
        
        if (tipoCampo === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
        } else {
            input = document.createElement('input');
            
            // Definir tipo do input baseado no tipo do campo
            switch(tipoCampo) {
                case 'data':
                    input.type = 'date';
                    break;
                case 'numero':
                    input.type = 'number';
                    break;
                case 'email':
                    input.type = 'email';
                    break;
                case 'telefone':
                    input.type = 'text';
                    input.classList.add('telefone-mask');
                    break;
                case 'cpf':
                    input.type = 'text';
                    input.classList.add('cpf-mask');
                    break;
                default:
                    input.type = 'text';
            }
        }
        
        input.id = `${tipo}-${campo.nome}`;
        input.className = 'velohub-input';
        if (campo.obrigatorio) {
            input.setAttribute('required', '');
        }
        if (campo.placeholder) {
            input.placeholder = campo.placeholder;
        }
        
        div.appendChild(label);
        div.appendChild(input);
        
        // Aplicar máscaras se necessário
        if (tipoCampo === 'telefone' && typeof formatPhone === 'function') {
            input.addEventListener('input', formatPhone);
        } else if (tipoCampo === 'cpf' && typeof formatCPF === 'function') {
            input.addEventListener('input', formatCPF);
        }
        
        return div;
    }

    aplicarListas(tipo, container) {
        const listas = this.configuracoes.listas || [];
        
        listas.forEach(lista => {
            // Verificar se a lista se aplica a este tipo
            if (lista.categoria !== tipo && lista.categoria !== 'todos') {
                return;
            }
            
            // Procurar select existente pelo ID
            const selectId = `${tipo}-${lista.nome}`;
            let select = container.querySelector(`#${selectId}`);
            
            if (!select) {
                // Criar select se não existir
                select = this.criarSelect(lista, tipo);
                // Inserir no container (procurar local apropriado)
                const formSection = container.querySelector('.form-section:last-child') || container;
                formSection.appendChild(select);
            } else {
                // Atualizar opções do select existente
                this.atualizarSelect(select, lista);
            }
        });
    }

    criarSelect(lista, tipo) {
        const div = document.createElement('div');
        div.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `${tipo}-${lista.nome}`);
        label.textContent = lista.label + (lista.obrigatorio ? ' *' : '');
        
        const select = document.createElement('select');
        select.id = `${tipo}-${lista.nome}`;
        select.className = 'velohub-input';
        if (lista.obrigatorio) {
            select.setAttribute('required', '');
        }
        
        // Adicionar opção vazia
        const optionVazia = document.createElement('option');
        optionVazia.value = '';
        optionVazia.textContent = 'Selecione...';
        select.appendChild(optionVazia);
        
        // Adicionar opções
        if (lista.opcoes && Array.isArray(lista.opcoes)) {
            lista.opcoes.forEach(opcao => {
                const option = document.createElement('option');
                option.value = opcao;
                option.textContent = opcao;
                select.appendChild(option);
            });
        }
        
        div.appendChild(label);
        div.appendChild(select);
        
        return div;
    }

    atualizarSelect(select, lista) {
        // Limpar opções existentes (exceto a primeira que é "Selecione...")
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Adicionar novas opções
        if (lista.opcoes && Array.isArray(lista.opcoes)) {
            lista.opcoes.forEach(opcao => {
                const option = document.createElement('option');
                option.value = opcao;
                option.textContent = opcao;
                select.appendChild(option);
            });
        }
    }

    aplicarCheckboxes(tipo, container) {
        const checkboxes = this.configuracoes.checkboxes || [];
        
        checkboxes.forEach(checkbox => {
            // Verificar se o checkbox se aplica a este tipo
            if (checkbox.categoria !== tipo && checkbox.categoria !== 'todos') {
                return;
            }
            
            // Procurar checkbox existente pelo ID
            const checkboxId = `${tipo}-${checkbox.nome}`;
            let checkboxElement = container.querySelector(`#${checkboxId}`);
            
            if (!checkboxElement) {
                // Criar checkbox se não existir
                const checkboxDiv = this.criarCheckbox(checkbox, tipo);
                // Inserir no container
                const formSection = container.querySelector('.form-section:last-child') || container;
                formSection.appendChild(checkboxDiv);
            } else {
                // Atualizar label do checkbox existente
                const label = checkboxElement.closest('label') || checkboxElement.parentElement.querySelector('label');
                if (label) {
                    const span = label.querySelector('span.checkmark') || label.querySelector('span');
                    if (span) {
                        label.insertBefore(document.createTextNode(checkbox.label), span);
                    } else {
                        label.textContent = checkbox.label;
                    }
                }
            }
        });
    }

    criarCheckbox(checkbox, tipo) {
        const div = document.createElement('div');
        div.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `${tipo}-${checkbox.nome}`;
        if (checkbox.obrigatorio) {
            input.setAttribute('required', '');
        }
        
        const span = document.createElement('span');
        span.className = 'checkmark';
        
        label.appendChild(input);
        label.appendChild(span);
        label.appendChild(document.createTextNode(checkbox.label));
        
        div.appendChild(label);
        
        return div;
    }

    /**
     * Obtém valor de um campo dinâmico
     * @param {string} tipo - 'bacen', 'n2' ou 'chatbot'
     * @param {string} nome - Nome do campo (sem prefixo)
     * @returns {string|boolean|Array} Valor do campo
     */
    obterValorCampo(tipo, nome) {
        const campoId = `${tipo}-${nome}`;
        const campo = document.getElementById(campoId);
        
        if (!campo) {
            return null;
        }
        
        // Verificar tipo de campo
        if (campo.type === 'checkbox') {
            return campo.checked;
        } else if (campo.tagName === 'SELECT') {
            return campo.value;
        } else if (campo.type === 'radio') {
            const radio = document.querySelector(`input[name="${campo.name}"]:checked`);
            return radio ? radio.value : null;
        } else {
            return campo.value;
        }
    }

    /**
     * Define valor de um campo dinâmico
     * @param {string} tipo - 'bacen', 'n2' ou 'chatbot'
     * @param {string} nome - Nome do campo (sem prefixo)
     * @param {any} valor - Valor a definir
     */
    definirValorCampo(tipo, nome, valor) {
        const campoId = `${tipo}-${nome}`;
        const campo = document.getElementById(campoId);
        
        if (!campo) {
            return;
        }
        
        if (campo.type === 'checkbox') {
            campo.checked = !!valor;
        } else if (campo.tagName === 'SELECT') {
            campo.value = valor || '';
        } else if (campo.type === 'radio') {
            const radio = document.querySelector(`input[name="${campo.name}"][value="${valor}"]`);
            if (radio) {
                radio.checked = true;
            }
        } else {
            campo.value = valor || '';
        }
    }

    /**
     * Observa mudanças nas configurações e atualiza formulários
     */
    observarMudancas() {
        if (!this.firebaseDB) {
            return;
        }

        const ref = this.firebaseDB.ref('configuracoes_formularios');
        ref.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.configuracoes = snapshot.val();
                console.log('🔄 Configurações atualizadas, recarregando formulários...');
                
                // Disparar evento para que os formulários se atualizem
                window.dispatchEvent(new CustomEvent('configuracoesAtualizadas', {
                    detail: { configuracoes: this.configuracoes }
                }));
            }
        });
    }
}

// Criar instância global
window.formularioDinamico = new FormularioDinamico();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    if (window.formularioDinamico) {
        await window.formularioDinamico.inicializar();
        
        // Observar mudanças
        window.formularioDinamico.observarMudancas();
        
        // Aplicar configurações nos formulários existentes
        const aplicarEmFormularios = () => {
            // BACEN
            const formBacen = document.getElementById('form-bacen');
            if (formBacen) {
                window.formularioDinamico.aplicarConfiguracoes('bacen', formBacen);
            }
            
            // N2
            const formN2 = document.getElementById('form-n2');
            if (formN2) {
                window.formularioDinamico.aplicarConfiguracoes('n2', formN2);
            }
            
            // Chatbot
            const formChatbot = document.getElementById('form-chatbot');
            if (formChatbot) {
                window.formularioDinamico.aplicarConfiguracoes('chatbot', formChatbot);
            }
        };
        
        aplicarEmFormularios();
        
        // Aplicar quando configurações forem atualizadas
        window.addEventListener('configuracoesAtualizadas', aplicarEmFormularios);
    }
});
