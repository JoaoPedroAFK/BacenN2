/* === SSO GOOGLE - SINGLE SIGN-ON === */
/* SSO desativado por padrão para testes; mudar para false para exigir login Google */
if (typeof window.SSO_DESATIVADO === 'undefined') window.SSO_DESATIVADO = true;

class GoogleSSO {
    constructor() {
        this.clientId = null;
        this.initialized = false;
        if (window.SSO_DESATIVADO) {
            console.log('SSO desativado – Google Sign-In não carregado');
            return;
        }
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
        // Client ID configurado
        this.clientId = window.GOOGLE_CLIENT_ID || 
                       localStorage.getItem('GOOGLE_CLIENT_ID') ||
                       '638842930106-b0plff0sbbs0ljsm39n5kadsjfcj3u3q.apps.googleusercontent.com';
        
        if (!this.clientId) {
            console.warn('⚠️ Google Client ID não configurado. SSO não funcionará.');
            return;
        }
        
        console.log('✅ Google Client ID configurado:', this.clientId.substring(0, 20) + '...');

        // Aguardar Google Identity Services carregar
        const tentarConfigurar = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: this.handleCredentialResponse.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                
                this.initialized = true;
                console.log('✅ Google SSO inicializado');
                
                // Tentar renderizar botão se o container já existir
                const container = document.getElementById('google-sso-container');
                if (container) {
                    this.renderizarBotao('google-sso-container');
                }
            } else {
                // Tentar novamente após 100ms
                setTimeout(tentarConfigurar, 100);
            }
        };
        
        tentarConfigurar();
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
        // PRIORIDADE: Validar no backend
        const apiBackendUrl = window.location.origin;
        
        try {
            console.log('🔐 Validando token no backend:', apiBackendUrl);
            const endpoint = `${apiBackendUrl}/api/auth/google`;
            console.log('📍 Endpoint:', endpoint);
            const response = await fetch(endpoint, {
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
    }

    verificarEmailAutorizado(email) {
        // Lista de emails autorizados
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

    renderizarBotao(containerId) {
        if (window.SSO_DESATIVADO) return;
        if (!this.initialized || !this.clientId) {
            console.warn('⚠️ Google SSO não inicializado. Tentando novamente...');
            // Tentar novamente após um tempo
            setTimeout(() => {
                if (window.google && window.google.accounts && this.clientId) {
                    this.initialized = true;
                    this.renderizarBotao(containerId);
                }
            }, 500);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container ${containerId} não encontrado.`);
            return;
        }

        // Limpar container antes de renderizar
        container.innerHTML = '';

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
            console.log('✅ Botão Google SSO renderizado');
        } catch (error) {
            console.error('❌ Erro ao renderizar botão Google:', error);
        }
    }
}

// Inicializar SSO quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.googleSSO = new GoogleSSO();
    });
} else {
    window.googleSSO = new GoogleSSO();
}
