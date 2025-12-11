/* === SISTEMA DE PERFIS E AUTENTICAÇÃO VELOTAX === */

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
        
        // Dispara evento de logout
        window.dispatchEvent(new CustomEvent('usuarioDeslogado'));
        
        // Redireciona para login
        window.location.hash = '#login';
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
                            <img src="img/velotax_ajustada_cor (1).png" alt="Velotax Logo" class="logo-velotax-img">
                            <h2>VELOTAX</h2>
                            <p>Sistema de Reclamações BACEN</p>
                        </div>
                    </div>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" class="velohub-input" 
                                   placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="login-senha">Senha</label>
                            <input type="password" id="login-senha" class="velohub-input" 
                                   placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="velohub-btn btn-primary login-btn">
                            🚀 Entrar no Sistema
                        </button>
                    </form>
                    
                    <div class="login-info">
                        <h4>📋 Acesso de Demonstração</h4>
                        <div class="demo-accounts">
                            <div class="account-card">
                                <strong>Administrador:</strong>
                                <br>admin@velotax.com / admin123
                            </div>
                            <div class="account-card">
                                <strong>Operador BACEN:</strong>
                                <br>operador1@velotax.com / oper1123
                            </div>
                            <div class="account-card">
                                <strong>Operador N2/Chatbot:</strong>
                                <br>operador2@velotax.com / oper2123
                            </div>
                            <div class="account-card">
                                <strong>Atendente:</strong>
                                <br>atendente@velotax.com / atend123
                            </div>
                            <div class="account-card">
                                <strong>Usuário:</strong>
                                <br>usuario@velotax.com / user123
                            </div>
                        </div>
                    </div>
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
        // Adiciona estilos CSS
        this.adicionarEstilos();
        
        // Verifica se usuário está logado
        if (!this.usuarioAtual) {
            this.mostrarTelaLogin();
        } else {
            this.mostrarSistema();
        }

        // Configura eventos
        this.configurarEventos();
    }

    mostrarTelaLogin() {
        // Só mostra login se não houver conteúdo já carregado
        if (document.querySelector('.velohub-container') || document.querySelector('.login-container')) {
            // Já tem conteúdo, não substitui
            return;
        }
        
        document.body.innerHTML = this.criarTelaLogin();
        
        // Adiciona evento de submit ao formulário
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.realizarLogin();
            });
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
        // O sistema já está carregado, apenas atualiza interface
        this.atualizarInterfaceUsuario();
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
                    background: linear-gradient(135deg, var(--azul-escuro) 0%, var(--azul-royal) 100%);
                    padding: 20px;
                }

                .login-card {
                    background: var(--cor-container);
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: var(--sombra-forte);
                    width: 100%;
                    max-width: 450px;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .logo-velotax-img {
                    max-width: 200px;
                    height: auto;
                    margin-bottom: 16px;
                }

                .logo-velotax h2 {
                    color: var(--azul-royal);
                    font-size: 2rem;
                    margin-bottom: 8px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                }

                .logo-velotax p {
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                    font-family: 'Poppins', sans-serif;
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
