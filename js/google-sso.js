/* === SSO GOOGLE - SINGLE SIGN-ON === */

class GoogleSSO {
    constructor() {
        this.clientId = null;
        this.initialized = false;
        this.inicializar();
    }

    async inicializar() {
        // Carregar Google Identity Services
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.configurarGoogleSignIn();
            };
            document.head.appendChild(script);
        } else {
            this.configurarGoogleSignIn();
        }
    }

    configurarGoogleSignIn() {
        // O Client ID será obtido do backend ou configurado via variável de ambiente
        // Client ID configurado: 638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com
        this.clientId = window.GOOGLE_CLIENT_ID || 
                       localStorage.getItem('GOOGLE_CLIENT_ID') ||
                       '638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com';
        
        if (!this.clientId) {
            console.warn('⚠️ Google Client ID não configurado. SSO não funcionará.');
            return;
        }
        
        console.log('✅ Google Client ID configurado:', this.clientId.substring(0, 20) + '...');

        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: this.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
            
            this.initialized = true;
            console.log('✅ Google SSO inicializado');
        }
    }

    async handleCredentialResponse(response) {
        console.log('🔐 Resposta do Google:', response);
        
        try {
            // Enviar o token para o backend para validação
            const resultado = await this.validarTokenGoogle(response.credential);
            
            if (resultado.sucesso) {
                // Login bem-sucedido
                if (window.sistemaPerfis) {
                    // Criar sessão do usuário
                    const usuario = {
                        id: resultado.usuario.id,
                        nome: resultado.usuario.nome,
                        email: resultado.usuario.email,
                        perfil: resultado.usuario.perfil || 'operador',
                        tiposDemanda: resultado.usuario.tiposDemanda || ['bacen', 'n2', 'chatbot'],
                        foto: resultado.usuario.picture,
                        loginSSO: true,
                        ultimoAcesso: new Date().toISOString()
                    };
                    
                    // Salvar no sistema de perfis
                    window.sistemaPerfis.usuarioAtual = usuario;
                    localStorage.setItem('velotax_usuario_atual', JSON.stringify(usuario));
                    
                    // Disparar evento de login
                    window.dispatchEvent(new CustomEvent('usuarioLogado', { detail: usuario }));
                    
                    // Mostrar notificação
                    if (window.sistemaPerfis.mostrarNotificacao) {
                        window.sistemaPerfis.mostrarNotificacao('Login realizado com sucesso via Google!', 'sucesso');
                    }
                    
                    // Recarregar a página para aplicar as permissões
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                throw new Error(resultado.erro || 'Erro ao validar credenciais');
            }
        } catch (error) {
            console.error('❌ Erro no login Google:', error);
            if (window.sistemaPerfis && window.sistemaPerfis.mostrarNotificacao) {
                window.sistemaPerfis.mostrarNotificacao('Erro ao fazer login com Google: ' + error.message, 'erro');
            }
        }
    }

    async validarTokenGoogle(token) {
        // PRIORIDADE: Validar no backend local primeiro
        const apiBackendUrl = window.API_BACKEND_URL || 
                             (window.location.origin) || 
                             'http://localhost:3000';
        
        try {
            console.log('🔐 Validando token no backend:', apiBackendUrl);
            const response = await fetch(`${apiBackendUrl}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: token })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Validação backend bem-sucedida:', data);
                return data;
            } else {
                const errorData = await response.json().catch(() => ({ erro: 'Erro desconhecido' }));
                console.warn('⚠️ Backend retornou erro:', errorData);
                throw new Error(errorData.erro || 'Erro ao validar token');
            }
        } catch (err) {
            console.error('❌ Erro ao validar no backend:', err);
            // Fallback: validação local (apenas para desenvolvimento)
            console.warn('⚠️ Usando validação local como fallback');
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('📋 Payload do Google (fallback local):', payload);
            
            const emailAutorizado = this.verificarEmailAutorizado(payload.email);
            
            if (!emailAutorizado) {
                return {
                    sucesso: false,
                    erro: 'Email não autorizado para acessar o sistema'
                };
            }
            
            const usuario = {
                id: payload.sub,
                nome: payload.name || payload.email.split('@')[0],
                email: payload.email,
                perfil: this.obterPerfilPorEmail(payload.email),
                tiposDemanda: this.obterTiposDemandaPorEmail(payload.email),
                picture: payload.picture
            };
            
            return {
                sucesso: true,
                usuario: usuario
            };
        } catch (error) {
            console.error('❌ Erro ao validar token:', error);
            return {
                sucesso: false,
                erro: 'Erro ao validar credenciais do Google'
            };
        }
    }

    verificarEmailAutorizado(email) {
        // Lista de emails autorizados (pode ser configurado via variável de ambiente)
        const emailsAutorizados = [
            'admin@velotax.com',
            'operador1@velotax.com',
            'operador2@velotax.com',
            'atendente@velotax.com',
            'vanessa@velotax.com',
            'shirley@velotax.com',
            'caroline@velotax.com',
            'emerson@velotax.com',
            'nayara@velotax.com',
            'renata@velotax.com'
        ];
        
        // Verificar domínio @velotax.com ou emails específicos
        if (email.endsWith('@velotax.com') || email.endsWith('@velotax.com.br')) {
            return true;
        }
        
        return emailsAutorizados.includes(email.toLowerCase());
    }

    obterPerfilPorEmail(email) {
        // Mapear emails para perfis
        if (email.includes('admin')) return 'administrador';
        if (email.includes('operador')) return 'operador';
        if (email.includes('atendente')) return 'atendente';
        return 'operador'; // Padrão
    }

    obterTiposDemandaPorEmail(email) {
        // Mapear emails para tipos de demanda permitidos
        if (email.includes('admin')) return ['bacen', 'n2', 'chatbot'];
        if (email.includes('operador1')) return ['bacen'];
        if (email.includes('operador2')) return ['n2', 'chatbot'];
        return ['bacen', 'n2', 'chatbot']; // Padrão: todos
    }

    renderizarBotaoGoogle(containerId) {
        if (!this.initialized) {
            console.warn('⚠️ Google SSO não inicializado. Botão não será renderizado.');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container ${containerId} não encontrado.`);
            return;
        }

        // Criar botão de login com Google
        const botaoHTML = `
            <div id="google-signin-button" style="margin-top: 16px;">
                <div id="g_id_onload"
                    data-client_id="${this.clientId}"
                    data-callback="handleGoogleSignIn"
                    data-auto_prompt="false">
                </div>
                <div class="g_id_signin"
                    data-type="standard"
                    data-size="large"
                    data-theme="outline"
                    data-text="sign_in_with"
                    data-shape="rectangular"
                    data-logo_alignment="left">
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', botaoHTML);

        // Carregar script do Google
        if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    }
}

// Função global para callback do Google
window.handleGoogleSignIn = function(response) {
    if (window.googleSSO) {
        window.googleSSO.handleCredentialResponse(response);
    }
};

// Inicializar SSO quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.googleSSO = new GoogleSSO();
    });
} else {
    window.googleSSO = new GoogleSSO();
}
    constructor() {
        this.clientId = null;
        this.initialized = false;
        this.inicializar();
    }

    async inicializar() {
        // Carregar Client ID do Google (deve estar configurado no env ou config)
        // Para Google OAuth, precisamos do Client ID do OAuth, não do Service Account
        // O Service Account é para APIs server-side
        
        // Por enquanto, vamos usar um Client ID genérico ou buscar de variável de ambiente
        // Em produção, isso deve vir de uma API backend ou configuração segura
        this.clientId = this.obterClientId();
        
        if (!this.clientId) {
            console.warn('⚠️ Google Client ID não configurado. SSO não estará disponível.');
            return;
        }

        // Carregar Google Identity Services
        this.carregarGoogleScript();
    }

    obterClientId() {
        // Tentar obter do localStorage ou configuração
        // Em produção, isso deve vir de uma API backend
        const clientId = localStorage.getItem('GOOGLE_CLIENT_ID') || 
                        window.GOOGLE_CLIENT_ID || 
                        null;
        
        // Se não tiver, tentar usar o project_id do Service Account como referência
        // Mas para OAuth precisamos de um Client ID diferente (OAuth 2.0 Client)
        return clientId;
    }

    carregarGoogleScript() {
        if (document.getElementById('google-identity-script')) {
            return; // Já carregado
        }

        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('✅ Google Identity Services carregado');
            this.initialized = true;
            this.configurarGoogleSignIn();
        };
        script.onerror = () => {
            console.error('❌ Erro ao carregar Google Identity Services');
        };
        document.head.appendChild(script);
    }

    configurarGoogleSignIn() {
        if (!window.google || !this.clientId) {
            console.warn('⚠️ Google Identity Services não disponível');
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: this.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });

            console.log('✅ Google Sign-In configurado');
        } catch (error) {
            console.error('❌ Erro ao configurar Google Sign-In:', error);
        }
    }

    handleCredentialResponse(response) {
        console.log('🔐 Resposta do Google:', response);
        
        // Decodificar o JWT token
        try {
            const payload = this.decodificarJWT(response.credential);
            console.log('👤 Dados do usuário Google:', payload);
            
            // Criar ou atualizar usuário no sistema
            const usuarioGoogle = {
                id: payload.sub,
                nome: payload.name || payload.given_name + ' ' + payload.family_name,
                email: payload.email,
                foto: payload.picture,
                perfil: this.determinarPerfil(payload.email),
                tiposDemanda: this.determinarTiposDemanda(payload.email),
                loginVia: 'google',
                ativo: true,
                dataCriacao: new Date().toISOString(),
                ultimoLogin: new Date().toISOString()
            };

            // Salvar no sistema de autenticação
            if (window.sistemaPerfis) {
                window.sistemaPerfis.fazerLoginGoogle(usuarioGoogle);
            } else {
                console.error('❌ Sistema de perfis não disponível');
            }
        } catch (error) {
            console.error('❌ Erro ao processar credenciais Google:', error);
            alert('Erro ao fazer login com Google. Tente novamente.');
        }
    }

    decodificarJWT(token) {
        // Decodificar JWT sem verificação (apenas para obter dados)
        // Em produção, isso deve ser verificado no backend
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    determinarPerfil(email) {
        // Mapear email para perfil baseado em domínio ou lista de emails
        const emailLower = email.toLowerCase();
        
        // Emails administrativos
        if (emailLower.includes('admin') || emailLower.includes('gerente') || emailLower.includes('diretor')) {
            return 'administrador';
        }
        
        // Emails de operadores específicos
        if (emailLower.includes('operador') || emailLower.includes('atendente')) {
            return 'operador';
        }
        
        // Padrão: atendente
        return 'atendente';
    }

    determinarTiposDemanda(email) {
        // Mapear email para tipos de demanda permitidos
        const emailLower = email.toLowerCase();
        
        // Administradores veem tudo
        if (emailLower.includes('admin') || emailLower.includes('gerente') || emailLower.includes('diretor')) {
            return ['bacen', 'n2', 'chatbot'];
        }
        
        // Emails específicos para BACEN
        if (emailLower.includes('bacen')) {
            return ['bacen'];
        }
        
        // Emails específicos para N2/Chatbot
        if (emailLower.includes('n2') || emailLower.includes('chatbot')) {
            return ['n2', 'chatbot'];
        }
        
        // Padrão: todos os tipos
        return ['bacen', 'n2', 'chatbot'];
    }

    renderizarBotao(containerId) {
        if (!this.initialized || !this.clientId) {
            console.warn('⚠️ Google SSO não inicializado');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container não encontrado:', containerId);
            return;
        }

        try {
            window.google.accounts.id.renderButton(
                container,
                {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left'
                }
            );
        } catch (error) {
            console.error('❌ Erro ao renderizar botão Google:', error);
        }
    }

    prompt() {
        if (!this.initialized || !this.clientId) {
            console.warn('⚠️ Google SSO não inicializado');
            return;
        }

        try {
            window.google.accounts.id.prompt();
        } catch (error) {
            console.error('❌ Erro ao mostrar prompt Google:', error);
        }
    }
}

// Instanciar globalmente
window.googleSSO = new GoogleSSO();

