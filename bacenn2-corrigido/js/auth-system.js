/* === SISTEMA DE PERFIS E AUTENTICAÇÃO VELOTAX === */
/* SSO desativado: antes da home o usuário escolhe quem está atendendo (Shirley, Vanessa, Gilmar); reclamações são atribuídas à pessoa */

window.SSO_DESATIVADO = true; // true = sem login; false = exige login/Google

/** Perfis selecionáveis antes de entrar (reclamações ficam atribuídas à pessoa escolhida) */
window.PERFIS_OPERADORAS = [
    { id: 'shirley', nome: 'Shirley', email: 'shirley@velotax.com', perfil: 'operador', tiposDemanda: ['bacen', 'n2', 'chatbot'], ativo: true },
    { id: 'vanessa', nome: 'Vanessa', email: 'vanessa@velotax.com', perfil: 'operador', tiposDemanda: ['bacen', 'n2', 'chatbot'], ativo: true },
    { id: 'gilmar', nome: 'Gilmar', email: 'gilmar@velotax.com', perfil: 'operador', tiposDemanda: ['bacen', 'n2', 'chatbot'], ativo: true }
];

class SistemaPerfis {
    constructor() {
        this.usuarios = this.carregarUsuarios();
        this.usuarioAtual = this.carregarUsuarioAtual();
        this.inicializarSistema();
    }

    // === USUÁRIOS PREDEFINIDOS ===
    carregarUsuarios() {
        const usuariosPadrao = [
            {
                id: 1,
                nome: "Administrador Velotax",
                email: "admin@velotax.com",
                senha: "admin123", // Em produção, usar hash
                perfil: "administrador",
                tiposDemanda: ['bacen', 'n2', 'chatbot'], // Admin vê todas
                ativo: true,
                dataCriacao: new Date().toISOString()
            },
            {
                id: 2,
                nome: "Operador BACEN",
                email: "operador1@velotax.com",
                senha: "oper1123", // Em produção, usar hash
                perfil: "operador",
                tiposDemanda: ['bacen'], // Perfil 1: apenas BACEN
                ativo: true,
                dataCriacao: new Date().toISOString()
            },
            {
                id: 3,
                nome: "Operador N2/Chatbot",
                email: "operador2@velotax.com",
                senha: "oper2123", // Em produção, usar hash
                perfil: "operador",
                tiposDemanda: ['n2', 'chatbot'], // Perfil 2: N2 e Chatbot
                ativo: true,
                dataCriacao: new Date().toISOString()
            },
            {
                id: 4,
                nome: "Atendente Básico",
                email: "atendente@velotax.com",
                senha: "atend123", // Em produção, usar hash
                perfil: "atendente",
                tiposDemanda: ['bacen', 'n2', 'chatbot'], // Atendente vê todas
                ativo: true,
                dataCriacao: new Date().toISOString()
            },
            {
                id: 5,
                nome: "Usuário Visualizador",
                email: "usuario@velotax.com",
                senha: "user123", // Em produção, usar hash
                perfil: "usuario",
                tiposDemanda: ['bacen', 'n2', 'chatbot'], // Usuário vê todas (somente leitura)
                ativo: true,
                dataCriacao: new Date().toISOString()
            }
        ];

        const usuariosSalvos = localStorage.getItem('velotax_usuarios');
        return usuariosSalvos ? JSON.parse(usuariosSalvos) : usuariosPadrao;
    }

    carregarUsuarioAtual() {
        const usuarioSalvo = localStorage.getItem('velotax_usuario_atual');
        return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    }

    // === AUTENTICAÇÃO ===
    async login(email, senha) {
        try {
            const usuario = this.usuarios.find(u => 
                u.email === email && 
                u.senha === senha && 
                u.ativo
            );

            if (!usuario) {
                throw new Error('Email ou senha incorretos');
            }

            // Atualiza último acesso
            usuario.ultimoAcesso = new Date().toISOString();
            this.usuarioAtual = usuario;
            
            // Salva estado
            localStorage.setItem('velotax_usuario_atual', JSON.stringify(usuario));
            this.salvarUsuarios();

            // Dispara evento de login
            window.dispatchEvent(new CustomEvent('usuarioLogado', { 
                detail: { usuario: usuario } 
            }));

            return { sucesso: true, usuario: usuario };
        } catch (erro) {
            return { sucesso: false, erro: erro.message };
        }
    }

    logout() {
        this.usuarioAtual = null;
        localStorage.removeItem('velotax_usuario_atual');
        
        if (window.SSO_DESATIVADO) {
            window.dispatchEvent(new CustomEvent('usuarioDeslogado'));
            location.reload(); // volta para a tela de seleção Shirley/Vanessa
            return;
        }
        
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.disableAutoSelect();
            } catch (e) {
                console.log('Google logout:', e);
            }
        }
        window.dispatchEvent(new CustomEvent('usuarioDeslogado'));
        window.location.hash = '#login';
    }

    // === LOGIN COM GOOGLE SSO ===
    fazerLoginGoogle(usuarioGoogle) {
        try {
            // Verificar se usuário já existe
            let usuario = this.usuarios.find(u => u.email === usuarioGoogle.email);
            
            if (!usuario) {
                // Criar novo usuário do Google
                usuario = {
                    id: Date.now(),
                    ...usuarioGoogle,
                    senha: null, // Não tem senha, usa Google
                    ativo: true
                };
                this.usuarios.push(usuario);
                this.salvarUsuarios();
            } else {
                // Atualizar dados do Google
                usuario.nome = usuarioGoogle.nome;
                usuario.foto = usuarioGoogle.foto;
                usuario.ultimoLogin = new Date().toISOString();
                usuario.loginVia = 'google';
                this.salvarUsuarios();
            }

            // Fazer login
            this.usuarioAtual = usuario;
            localStorage.setItem('velotax_usuario_atual', JSON.stringify(usuario));
            
            // Dispara evento de login
            window.dispatchEvent(new CustomEvent('usuarioLogado', { detail: usuario }));
            
            // Recarrega a página para aplicar permissões
            window.location.reload();
            
            return { sucesso: true, usuario: usuario };
        } catch (erro) {
            console.error('Erro no login Google:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    // === VERIFICAÇÃO DE PERMISSÕES ===
    verificarPermissao(acao) {
        if (!this.usuarioAtual) {
            return false;
        }

        const permissoes = {
            administrador: [
                'visualizar_todos', 'criar_ficha', 'editar_ficha', 'excluir_ficha',
                'visualizar_relatorios', 'exportar_dados', 'gerenciar_usuarios',
                'configurar_sistema', 'visualizar_todas_demandas'
            ],
            operador: [
                'visualizar_proprios', 'criar_ficha', 'editar_ficha', 
                'visualizar_relatorios_basicos', 'visualizar_demandas_atribuidas'
            ],
            atendente: [
                'visualizar_todos', 'criar_ficha', 'editar_ficha', 
                'visualizar_relatorios_basicos', 'visualizar_todas_demandas'
            ],
            usuario: [
                'visualizar_todos', 'visualizar_relatorios_basicos', 'visualizar_todas_demandas'
            ]
        };

        return permissoes[this.usuarioAtual.perfil]?.includes(acao) || false;
    }

    // === GERENCIAMENTO DE USUÁRIOS (ADMIN) ===
    adicionarUsuario(novoUsuario) {
        if (!this.verificarPermissao('gerenciar_usuarios')) {
            throw new Error('Sem permissão para gerenciar usuários');
        }

        // Validações básicas
        if (this.usuarios.some(u => u.email === novoUsuario.email)) {
            throw new Error('Email já cadastrado');
        }

        const usuario = {
            id: Date.now(),
            ...novoUsuario,
            ativo: true,
            dataCriacao: new Date().toISOString()
        };

        this.usuarios.push(usuario);
        this.salvarUsuarios();
        
        return usuario;
    }

    editarUsuario(id, dadosAtualizados) {
        if (!this.verificarPermissao('gerenciar_usuarios')) {
            throw new Error('Sem permissão para gerenciar usuários');
        }

        const index = this.usuarios.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('Usuário não encontrado');
        }

        this.usuarios[index] = { ...this.usuarios[index], ...dadosAtualizados };
        this.salvarUsuarios();
        
        return this.usuarios[index];
    }

    desativarUsuario(id) {
        if (!this.verificarPermissao('gerenciar_usuarios')) {
            throw new Error('Sem permissão para gerenciar usuários');
        }

        const usuario = this.usuarios.find(u => u.id === id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        if (usuario.id === this.usuarioAtual.id) {
            throw new Error('Não pode desativar seu próprio usuário');
        }

        usuario.ativo = false;
        this.salvarUsuarios();
        
        return usuario;
    }

    // === INTERFACE ===
    criarTelaLogin() {
        const loginHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="logo-velotax">
                            <img src="img/simbolo_velotax_ajustada_branco.png" alt="Velotax Logo" class="logo-velotax-img">
                        </div>
                    </div>
                    
                    <div id="google-sso-container" class="google-signin-container"></div>
                </div>
            </div>
        `;

        return loginHTML;
    }

    criarMenuUsuario() {
        if (!this.usuarioAtual) return '';

        const perfilIcones = {
            administrador: '👑',
            operador: '⚙️',
            atendente: '👤',
            usuario: '👁️'
        };

        const perfilNomes = {
            administrador: 'Administrador',
            operador: 'Operador',
            atendente: 'Atendente',
            usuario: 'Usuário Visualizador'
        };

        return `
            <div class="usuario-menu">
                <div class="usuario-info">
                    <span class="usuario-perfil ${this.usuarioAtual.perfil}">
                        ${perfilIcones[this.usuarioAtual.perfil]} ${perfilNomes[this.usuarioAtual.perfil]}
                    </span>
                    <span class="usuario-nome">${this.usuarioAtual.nome}</span>
                </div>
                <button class="logout-btn" onclick="sistemaPerfis.logout()">
                    🚪 Sair
                </button>
            </div>
        `;
    }

    // === INICIALIZAÇÃO ===
    inicializarSistema() {
        this.adicionarEstilos();

        // SSO desativado: tela para escolher Shirley ou Vanessa antes de entrar; reclamações serão atribuídas a ela
        if (window.SSO_DESATIVADO) {
            this.mostrarTelaSelecaoOperadora();
            this.configurarEventos();
            return;
        }

        // Verifica se usuário está logado
        if (!this.usuarioAtual) {
            this.mostrarTelaLogin();
        } else {
            this.mostrarSistema();
        }

        this.configurarEventos();
    }

    mostrarTelaLogin() {
        // Limpar qualquer conteúdo existente
        const container = document.querySelector('.velohub-container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Se já tem tela de login, não substitui
        if (document.querySelector('.login-container')) {
            // Apenas garantir que o botão Google está renderizado
            setTimeout(() => {
                if (window.googleSSO) {
                    window.googleSSO.renderizarBotao('google-sso-container');
                }
            }, 500);
            return;
        }
        
        // Criar overlay para esconder conteúdo existente
        const overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;';
        
        overlay.innerHTML = this.criarTelaLogin();
        document.body.appendChild(overlay);
        
        // Adiciona evento de submit ao formulário
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.realizarLogin();
            });
        }
        
        // Renderizar botão Google SSO após um pequeno delay
        setTimeout(() => {
            if (window.googleSSO) {
                window.googleSSO.renderizarBotao('google-sso-container');
            } else {
                // Tentar novamente após mais tempo se ainda não estiver inicializado
                setTimeout(() => {
                    if (window.googleSSO) {
                        window.googleSSO.renderizarBotao('google-sso-container');
                    }
                }, 1000);
            }
        }, 500);
    }
    
    removerTelaLogin() {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.remove();
        }
        const sel = document.getElementById('selecao-operadora-overlay');
        if (sel) sel.remove();
        const container = document.querySelector('.velohub-container');
        if (container) {
            container.style.display = '';
        }
    }

    criarTelaSelecaoOperadora() {
        const perfis = window.PERFIS_OPERADORAS || [];
        const cards = perfis.map(op => `
            <button type="button" class="selecao-operadora-card" data-operadora-id="${op.id}">
                <span class="selecao-operadora-nome">${op.nome}</span>
            </button>
        `).join('');
        return `
            <div class="selecao-operadora-container">
                <div class="selecao-operadora-header">
                    <img src="img/simbolo_velotax_ajustada_branco.png" alt="Velotax" class="selecao-operadora-logo">
                    <h2 class="selecao-operadora-titulo">Quem está atendendo?</h2>
                    <p class="selecao-operadora-subtitulo">As reclamações serão atribuídas a você.</p>
                </div>
                <div class="selecao-operadora-cards">
                    ${cards}
                </div>
            </div>
        `;
    }

    mostrarTelaSelecaoOperadora() {
        const container = document.querySelector('.velohub-container');
        if (container) container.style.display = 'none';
        if (document.getElementById('selecao-operadora-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'selecao-operadora-overlay';
        overlay.className = 'selecao-operadora-overlay';
        overlay.innerHTML = this.criarTelaSelecaoOperadora();
        document.body.appendChild(overlay);
        const perfis = window.PERFIS_OPERADORAS || [];
        overlay.querySelectorAll('.selecao-operadora-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-operadora-id');
                const op = perfis.find(p => p.id === id);
                if (op) this.entrarComoOperadora(op);
            });
        });
    }

    entrarComoOperadora(operadora) {
        this.usuarioAtual = operadora;
        localStorage.setItem('velotax_usuario_atual', JSON.stringify(operadora));
        this.removerTelaLogin();
        this.mostrarSistema();
        if (this.mostrarNotificacao) {
            this.mostrarNotificacao('Entrando como ' + operadora.nome + ' – reclamações serão atribuídas a você.', 'sucesso');
        }
    }

    async realizarLogin() {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        
        // Mostra loading
        if (window.loadingVelotax) {
            window.loadingVelotax.mostrar();
        }
        
        const resultado = await this.login(email, senha);
        
        if (resultado.sucesso) {
            this.mostrarNotificacao('Login realizado com sucesso!', 'sucesso');
            setTimeout(() => {
                if (window.loadingVelotax) {
                    window.loadingVelotax.esconder();
                }
                location.reload();
            }, 1000);
        } else {
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
            this.mostrarNotificacao(resultado.erro, 'erro');
        }
    }

    mostrarSistema() {
        // Remove overlay de login
        this.removerTelaLogin();
        
        // O sistema já está carregado, apenas atualiza interface
        this.atualizarInterfaceUsuario();
        
        // Carregar scripts do app se ainda não foram carregados
        if (!window.appScriptsCarregados) {
            this.carregarScriptsApp();
            window.appScriptsCarregados = true;
        }
    }
    
    carregarScriptsApp() {
        const scripts = [
            'js/gerenciador-fichas-perfil.js',
            'js/sistema-alertas.js',
            'js/ficha-detalhada.js',
            'js/busca-avancada.js',
            'js/dashboard-avancado.js',
            'js/relatorios-robusto.js',
            'js/importador-dados.js',
            'js/classificacao-demandas.js',
            'js/theme-toggle.js',
            'js/main.js',
            'js/demo-data.js'
        ];
        
        scripts.forEach(src => {
            // Verificar se o script já foi carregado (por src ou por classe)
            const scriptExistente = document.querySelector(`script[src="${src}"]`) || 
                                   document.querySelector(`script[data-script="${src}"]`);
            
            if (!scriptExistente) {
                const script = document.createElement('script');
                script.src = src;
                script.setAttribute('data-script', src); // Marcar para evitar duplicação
                document.body.appendChild(script);
                console.log(`✅ Script carregado: ${src}`);
            } else {
                console.log(`⚠️ Script já carregado, pulando: ${src}`);
            }
        });
    }

    atualizarInterfaceUsuario() {
        // Adiciona menu de usuário ao header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && this.usuarioAtual) {
            headerActions.insertAdjacentHTML('beforeend', this.criarMenuUsuario());
        }

        // Aplica restrições de acesso
        this.aplicarRestricoesAcesso();
    }

    aplicarRestricoesAcesso() {
        // Esconde elementos baseado no perfil
        const restricoes = {
            usuario: ['.admin-only', '.atendente-only', '.operador-only'],
            operador: ['.admin-only'],
            atendente: ['.admin-only']
        };

        const perfil = this.usuarioAtual.perfil;
        
        if (restricoes[perfil]) {
            restricoes[perfil].forEach(seletor => {
                document.querySelectorAll(seletor).forEach(el => {
                    el.style.display = 'none';
                });
            });
        }
    }

    // === OBTER TIPOS DE DEMANDA DO USUÁRIO ===
    obterTiposDemandaUsuario() {
        if (!this.usuarioAtual) return [];
        
        // Admin vê todas
        if (this.usuarioAtual.perfil === 'administrador') {
            return ['bacen', 'n2', 'chatbot'];
        }
        
        // Retorna tipos atribuídos ao usuário
        return this.usuarioAtual.tiposDemanda || [];
    }

    // === VERIFICAR SE USUÁRIO PODE VER TIPO DE DEMANDA ===
    podeVerTipoDemanda(tipo) {
        if (!this.usuarioAtual) return false;
        
        // Admin vê todas
        if (this.usuarioAtual.perfil === 'administrador') {
            return true;
        }
        
        // Verifica se o tipo está nos tipos permitidos
        return this.obterTiposDemandaUsuario().includes(tipo);
    }

    configurarEventos() {
        // Evento de login
        window.addEventListener('usuarioLogado', (e) => {
            console.log('Usuário logado:', e.detail.usuario);
        });

        // Evento de logout
        window.addEventListener('usuarioDeslogado', () => {
            console.log('Usuário deslogado');
        });
    }

    // === UTILITÁRIOS ===
    salvarUsuarios() {
        localStorage.setItem('velotax_usuarios', JSON.stringify(this.usuarios));
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    }

    adicionarEstilos() {
        const estilos = `
            <style id="estilos-perfis">
                /* === TELA DE LOGIN === */
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    width: 100vw;
                    height: 100vh;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background: #000000;
                    padding: 0;
                    z-index: 10000;
                }

                .login-card {
                    background: transparent;
                    border-radius: 0;
                    padding: 0;
                    box-shadow: none;
                    width: 100%;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 60px;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .logo-velotax {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                }

                .logo-velotax-img {
                    height: 60px;
                    width: auto;
                    object-fit: contain;
                    margin-bottom: 0;
                    display: block;
                }

                .login-form {
                    margin-bottom: 30px;
                }

                .login-btn {
                    width: 100%;
                    padding: 14px;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .login-divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 24px 0;
                    color: var(--texto-secundario);
                }
                
                .login-divider::before,
                .login-divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid var(--borda);
                }
                
                .login-divider span {
                    padding: 0 16px;
                    font-size: 0.9rem;
                }
                
                #google-sso-container {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .login-info {
                    background: var(--cor-sidebar);
                    border-radius: 8px;
                    padding: 20px;
                }

                .login-info h4 {
                    color: var(--azul-royal);
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                }

                .demo-accounts {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .account-card {
                    background: var(--cor-container);
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    color: var(--texto-secundario);
                }

                /* === SELEÇÃO USUÁRIO (Velotax – minimalista) === */
                .selecao-operadora-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(160deg, #000058 0%, #0d0d6e 50%, #000058 100%);
                    font-family: 'Poppins', sans-serif;
                }
                .selecao-operadora-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    max-width: 480px;
                }
                .selecao-operadora-header {
                    text-align: center;
                    margin-bottom: 48px;
                }
                .selecao-operadora-logo {
                    height: 44px;
                    width: auto;
                    margin-bottom: 32px;
                    display: block;
                    opacity: 0.95;
                }
                .selecao-operadora-titulo {
                    font-size: 1.35rem;
                    font-weight: 500;
                    color: #fff;
                    margin: 0 0 6px 0;
                    letter-spacing: 0.02em;
                }
                .selecao-operadora-subtitulo {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.5);
                    margin: 0;
                    font-weight: 400;
                }
                .selecao-operadora-cards {
                    display: flex;
                    flex-direction: row;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .selecao-operadora-card {
                    min-width: 120px;
                    padding: 20px 32px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 10px;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
                }
                .selecao-operadora-card:hover {
                    background: rgba(29, 253, 185, 0.08);
                    border-color: #1DFDB9;
                    box-shadow: 0 0 20px rgba(29, 253, 185, 0.15);
                }
                .selecao-operadora-card:focus {
                    outline: none;
                    border-color: #1634FF;
                    box-shadow: 0 0 0 2px rgba(22, 52, 255, 0.3);
                }
                .selecao-operadora-nome {
                    font-size: 1rem;
                    font-weight: 500;
                }

                /* === MENU USUÁRIO === */
                .usuario-menu {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    backdrop-filter: blur(10px);
                }

                .usuario-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .usuario-perfil {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: var(--azul-ciano);
                    color: var(--azul-escuro);
                    align-self: flex-start;
                }

                .usuario-nome {
                    font-size: 0.85rem;
                    color: var(--texto-claro);
                    font-weight: 500;
                }

                .logout-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: var(--texto-claro);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                }

                /* === NOTIFICAÇÕES === */
                .notificacao {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    box-shadow: var(--sombra-media);
                }

                .notificacao-sucesso {
                    background: var(--sucesso);
                    color: var(--azul-escuro);
                }

                .notificacao-erro {
                    background: var(--erro);
                }

                .notificacao-info {
                    background: var(--info);
                }

                .notificacao-aviso {
                    background: var(--aviso);
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .usuario-menu {
                        flex-direction: column;
                        gap: 8px;
                        padding: 12px;
                    }

                    .usuario-info {
                        text-align: center;
                    }

                    .login-card {
                        padding: 30px 20px;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-perfis')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }
}

// Inicializa o sistema de perfis
let sistemaPerfis;
let sistemaInicializado = false;

document.addEventListener('DOMContentLoaded', () => {
    // Evita múltiplas inicializações
    if (!sistemaInicializado && !window.sistemaPerfis) {
        sistemaPerfis = new SistemaPerfis();
        sistemaInicializado = true;
        window.sistemaPerfis = sistemaPerfis;
    } else if (window.sistemaPerfis) {
        sistemaPerfis = window.sistemaPerfis;
    }
});

// Exporta para uso global
window.SistemaPerfis = SistemaPerfis;
window.sistemaPerfis = sistemaPerfis;
