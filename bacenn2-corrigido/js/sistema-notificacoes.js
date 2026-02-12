/* === SISTEMA DE NOTIFICAÇÕES PARA RECLAMAÇÕES === */
/* VERSÃO: v2.0.0 | DATA: 2026-01-XX | ALTERAÇÕES: Sistema completo refeito conforme instruções */

class SistemaNotificacoes {
    constructor() {
        this.notificacoes = [];
        this.notificacoesAtivas = [];
        this.audioContext = null;
        this.intervaloVerificacao = null;
        this.inicializar();
    }
    
    inicializar() {
        console.log('🔔 [Notificações] Inicializando sistema...');
        
        // Criar container de notificações
        this.criarContainerNotificacoes();
        
        // Iniciar verificação periódica (mas não exibir automaticamente)
        this.iniciarVerificacaoPeriodica();
        
        // Verificar notificações em background (sem exibir)
        this.verificarNotificacoes();
        
        // Tentar criar o ícone múltiplas vezes para garantir que apareça
        this.tentarCriarIconeComRetry();
        
        console.log('✅ Sistema de Notificações inicializado');
    }
    
    tentarCriarIconeComRetry() {
        const tentativas = [500, 1000, 2000, 3000, 5000];
        tentativas.forEach((delay, index) => {
            setTimeout(() => {
                if (!document.getElementById('icone-notificacoes')) {
                    console.log(`🔄 [Notificações] Tentativa ${index + 1}/${tentativas.length} de criar ícone após ${delay}ms...`);
                    this.criarIconeSino();
                } else {
                    console.log('✅ [Notificações] Ícone já existe');
                }
            }, delay);
        });
    }
    
    criarContainerNotificacoes() {
        // Criar ícone de sino no header
        this.criarIconeSino();
        
        // Criar caixa de notificações (inicialmente oculta)
        const existente = document.getElementById('caixa-notificacoes');
        if (existente) existente.remove();
        
        const caixa = document.createElement('div');
        caixa.id = 'caixa-notificacoes';
        caixa.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 10000;
            width: 400px;
            max-height: 600px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
        `;
        
        caixa.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #1634FF; color: white;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">🔔 Notificações</h3>
                <button id="btn-fechar-notificacoes" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 18px;">✕</button>
            </div>
            <div id="lista-notificacoes" style="overflow-y: auto; max-height: 540px; padding: 8px;">
                <div style="padding: 20px; text-align: center; color: #666;">
                    Nenhuma notificação no momento
                </div>
            </div>
        `;
        
        document.body.appendChild(caixa);
        
        // Event listeners
        setTimeout(() => {
            const btnFechar = document.getElementById('btn-fechar-notificacoes');
            if (btnFechar) {
                btnFechar.onclick = (e) => {
                    e.stopPropagation();
                    this.fecharCaixaNotificacoes();
                };
            }
        }, 100);
        
        // Fechar ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                const caixaEl = document.getElementById('caixa-notificacoes');
                const icone = document.getElementById('icone-notificacoes');
                if (caixaEl && caixaEl.style.display === 'flex') {
                    if (!caixaEl.contains(e.target) && !(icone && icone.contains(e.target))) {
                        this.fecharCaixaNotificacoes();
                    }
                }
            });
        }, 200);
    }
    
    criarIconeSino() {
        // Remover ícone existente se houver
        const existente = document.getElementById('icone-notificacoes');
        if (existente) {
            console.log('🔄 [Notificações] Removendo ícone existente');
            existente.remove();
        }
        
        // Procurar header-actions - tentar múltiplas estratégias
        let headerActions = document.querySelector('.velohub-header .header-actions') || 
                           document.querySelector('.header-actions') ||
                           document.querySelector('header .header-actions') ||
                           document.querySelector('.header-content .header-actions');
        
        // Se não encontrar, tentar criar
        if (!headerActions) {
            const header = document.querySelector('.velohub-header') || 
                          document.querySelector('header') ||
                          document.querySelector('.header');
            if (header) {
                const headerContent = header.querySelector('.header-content') || header;
                if (headerContent) {
                    headerActions = document.createElement('div');
                    headerActions.className = 'header-actions';
                    headerContent.appendChild(headerActions);
                    console.log('✅ [Notificações] Criado header-actions');
                }
            }
        }
        
        if (!headerActions) {
            console.warn('⚠️ [Notificações] Header actions não encontrado');
            return false;
        }
        
        // Verificar se já existe um ícone
        if (document.getElementById('icone-notificacoes')) {
            console.log('✅ [Notificações] Ícone já existe');
            return true;
        }
        
        const icone = document.createElement('button');
        icone.id = 'icone-notificacoes';
        icone.innerHTML = '🔔';
        icone.style.cssText = `
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            position: relative;
            padding: 8px;
            border-radius: 50%;
            transition: background 0.2s;
        `;
        
        icone.onmouseover = () => {
            icone.style.background = 'rgba(255,255,255,0.1)';
        };
        icone.onmouseout = () => {
            icone.style.background = 'transparent';
        };
        
        icone.onclick = (e) => {
            e.stopPropagation();
            console.log('🔔 [Notificações] Ícone clicado');
            this.toggleCaixaNotificacoes();
        };
        
        // Badge de contador
        const badge = document.createElement('span');
        badge.id = 'badge-contador-notificacoes';
        badge.style.cssText = `
            position: absolute;
            top: 4px;
            right: 4px;
            background: #FF0000;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
        `;
        badge.textContent = '0';
        icone.appendChild(badge);
        
        headerActions.appendChild(icone);
        console.log('✅ [Notificações] Ícone de sino criado e adicionado ao header');
        return true;
    }
    
    toggleCaixaNotificacoes() {
        const caixa = document.getElementById('caixa-notificacoes');
        if (!caixa) return;
        
        if (caixa.style.display === 'flex') {
            this.fecharCaixaNotificacoes();
        } else {
            this.abrirCaixaNotificacoes();
        }
    }
    
    abrirCaixaNotificacoes() {
        const caixa = document.getElementById('caixa-notificacoes');
        if (caixa) {
            // Verificar notificações antes de abrir (atualizar lista)
            this.verificarNotificacoes().then(() => {
                caixa.style.display = 'flex';
                // Atualizar lista ao abrir
                this.atualizarListaNotificacoes();
            }).catch(() => {
                // Se der erro, apenas abrir a caixa com as notificações já carregadas
                caixa.style.display = 'flex';
                this.atualizarListaNotificacoes();
            });
        }
    }
    
    fecharCaixaNotificacoes() {
        const caixa = document.getElementById('caixa-notificacoes');
        if (caixa) {
            caixa.style.display = 'none';
        }
    }
    
    iniciarVerificacaoPeriodica() {
        // Verificar a cada 5 minutos
        this.intervaloVerificacao = setInterval(() => {
            this.verificarNotificacoes();
        }, 5 * 60 * 1000);
    }
    
    async verificarNotificacoes() {
        console.log('🔔 [Notificações] Verificando notificações em background...');
        
        try {
            // Carregar todas as fichas
            const todasFichas = [];
            
            if (window.armazenamentoReclamacoes) {
                try {
                    const [bacen, n2, chatbot] = await Promise.all([
                        window.armazenamentoReclamacoes.carregarTodos('bacen').catch(() => []),
                        window.armazenamentoReclamacoes.carregarTodos('n2').catch(() => []),
                        window.armazenamentoReclamacoes.carregarTodos('chatbot').catch(() => [])
                    ]);
                    
                    todasFichas.push(
                        ...(Array.isArray(bacen) ? bacen : []).map(f => ({ ...f, tipoDemanda: 'bacen' })),
                        ...(Array.isArray(n2) ? n2 : []).map(f => ({ ...f, tipoDemanda: 'n2' })),
                        ...(Array.isArray(chatbot) ? chatbot : []).map(f => ({ ...f, tipoDemanda: 'chatbot' }))
                    );
                } catch (error) {
                    console.warn('⚠️ [Notificações] Erro ao carregar do Firebase:', error);
                }
            }
            
            // Fallback para localStorage
            if (todasFichas.length === 0) {
                const bacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || '[]');
                const n2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || '[]');
                const chatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || '[]');
                
                todasFichas.push(
                    ...bacen.map(f => ({ ...f, tipoDemanda: 'bacen' })),
                    ...n2.map(f => ({ ...f, tipoDemanda: 'n2' })),
                    ...chatbot.map(f => ({ ...f, tipoDemanda: 'chatbot' }))
                );
            }
            
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const notificacoes = [];
            
            todasFichas.forEach(ficha => {
                // Verificar PIX Solicitada após 1 dia útil (mas não mais de 20 dias)
                if (ficha.pixStatus === 'Solicitada' && ficha.dataCriacao) {
                    const dataCriacao = new Date(ficha.dataCriacao);
                    const diasUteis = this.calcularDiasUteis(dataCriacao, hoje);
                    const diasTotais = Math.ceil((hoje - dataCriacao) / (1000 * 60 * 60 * 24));
                    
                    if (diasUteis >= 1 && diasTotais <= 20) {
                        notificacoes.push({
                            tipo: 'pix-solicitada',
                            ficha: ficha,
                            mensagem: `PIX Solicitada há ${diasUteis} dia(s) útil(is)`,
                            prioridade: 'alta',
                            dataCriacao: ficha.dataCriacao
                        });
                    }
                }
                
                // Verificar prazos expirados ou a 2 dias de expirar (mas não mais de 20 dias)
                if (ficha.prazoBacen) {
                    const prazo = new Date(ficha.prazoBacen);
                    prazo.setHours(0, 0, 0, 0);
                    const diffDias = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
                    const diasDesdePrazo = Math.abs(diffDias);
                    
                    // Só notificar se não exceder 20 dias
                    if (diasDesdePrazo <= 20) {
                        if (diffDias < 0) {
                            notificacoes.push({
                                tipo: 'prazo-expirado',
                                ficha: ficha,
                                mensagem: `⚠️ Prazo expirado há ${Math.abs(diffDias)} dia(s)`,
                                prioridade: 'critica',
                                dataPrazo: ficha.prazoBacen
                            });
                        } else if (diffDias <= 2) {
                            notificacoes.push({
                                tipo: 'prazo-proximo',
                                ficha: ficha,
                                mensagem: `⏰ Prazo vence em ${diffDias} dia(s)`,
                                prioridade: diffDias === 0 ? 'critica' : 'alta',
                                dataPrazo: ficha.prazoBacen
                            });
                        }
                    }
                }
            });
            
            this.notificacoesAtivas = notificacoes;
            this.atualizarContadorNotificacoes(notificacoes.length);
            
            console.log(`✅ [Notificações] ${notificacoes.length} notificação(ões) encontrada(s)`);
        } catch (error) {
            console.error('❌ [Notificações] Erro ao verificar notificações:', error);
        }
    }
    
    calcularDiasUteis(dataInicio, dataFim) {
        let dias = 0;
        const atual = new Date(dataInicio);
        
        while (atual <= dataFim) {
            const diaSemana = atual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) { // Não contar sábado e domingo
                dias++;
            }
            atual.setDate(atual.getDate() + 1);
        }
        
        return dias;
    }
    
    atualizarListaNotificacoes() {
        const lista = document.getElementById('lista-notificacoes');
        if (!lista) return;
        
        if (!this.notificacoesAtivas || this.notificacoesAtivas.length === 0) {
            lista.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    Nenhuma notificação no momento
                </div>
            `;
            return;
        }
        
        lista.innerHTML = this.notificacoesAtivas.map((notif, index) => {
            return this.criarElementoNotificacao(notif, index);
        }).join('');
        
        // Adicionar event listeners após renderizar
        lista.querySelectorAll('.notificacao-item').forEach((item) => {
            const index = parseInt(item.getAttribute('data-index') || '0');
            item.onclick = (e) => {
                e.stopPropagation();
                if (this.notificacoesAtivas && this.notificacoesAtivas[index]) {
                    console.log('🔍 [Notificações] Clicou na notificação, índice:', index);
                    console.log('🔍 [Notificações] Ficha:', this.notificacoesAtivas[index].ficha);
                    this.abrirFicha(this.notificacoesAtivas[index].ficha);
                } else {
                    console.error('❌ [Notificações] Índice inválido ou ficha não encontrada:', index);
                }
            };
        });
    }
    
    criarElementoNotificacao(notif, index) {
        const corFundo = notif.prioridade === 'critica' ? '#FF0000' : notif.prioridade === 'alta' ? '#FF8400' : '#1634FF';
        const protocolos = this.obterProtocolosFicha(notif.ficha) || 'N/A';
        const tipoDemanda = notif.ficha.tipoDemanda || 'bacen';
        const tipoLabel = tipoDemanda === 'bacen' ? 'BACEN' : tipoDemanda === 'n2' ? 'N2' : tipoDemanda === 'chatbot' ? 'Chatbot' : 'RA/Procon';
        const nomeCliente = notif.ficha.nomeCompleto || notif.ficha.nomeCliente || 'Não informado';
        const cpfCliente = notif.ficha.cpf || 'Não informado';
        
        return `
            <div class="notificacao-item" style="
                background: ${corFundo};
                color: white;
                padding: 12px 16px;
                margin: 8px;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            " data-ficha-id="${notif.ficha.id || ''}" data-tipo-demanda="${tipoDemanda}" data-index="${index}" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${notif.mensagem}</div>
                        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 4px;">
                            <strong>Tipo:</strong> ${tipoLabel}
                        </div>
                        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 4px;">
                            <strong>Cliente:</strong> ${nomeCliente}
                        </div>
                        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 4px;">
                            <strong>CPF:</strong> ${cpfCliente}
                        </div>
                        <div style="font-size: 0.85em; opacity: 0.9;">
                            <strong>Protocolo(s):</strong> ${protocolos}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    obterProtocolosFicha(ficha) {
        const protocolos = [];
        
        if (ficha.protocoloCentral && Array.isArray(ficha.protocoloCentral) && ficha.protocoloCentral.length > 0) {
            protocolos.push(...ficha.protocoloCentral.filter(p => p && p.trim()));
        }
        if (ficha.protocoloN2 && Array.isArray(ficha.protocoloN2) && ficha.protocoloN2.length > 0) {
            protocolos.push(...ficha.protocoloN2.filter(p => p && p.trim()));
        }
        if (ficha.protocoloReclameAqui && Array.isArray(ficha.protocoloReclameAqui) && ficha.protocoloReclameAqui.length > 0) {
            protocolos.push(...ficha.protocoloReclameAqui.filter(p => p && p.trim()));
        }
        if (ficha.protocoloProcon && Array.isArray(ficha.protocoloProcon) && ficha.protocoloProcon.length > 0) {
            protocolos.push(...ficha.protocoloProcon.filter(p => p && p.trim()));
        }
        if (ficha.protocolosSemAcionamento && ficha.protocolosSemAcionamento.trim()) {
            protocolos.push(ficha.protocolosSemAcionamento.trim());
        }
        
        return protocolos.length > 0 ? protocolos.join(', ') : null;
    }
    
    atualizarContadorNotificacoes(count) {
        const badge = document.getElementById('badge-contador-notificacoes');
        if (!badge) return;
        
        const countFinal = count !== undefined ? count : (this.notificacoesAtivas?.length || 0);
        
        if (countFinal > 0) {
            badge.textContent = countFinal > 99 ? '99+' : countFinal;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    abrirFicha(ficha) {
        console.log('🔍 [Notificações] Abrindo ficha:', ficha.id, ficha.tipoDemanda);
        
        // Fechar caixa de notificações
        this.fecharCaixaNotificacoes();
        
        // Navegar para a página correta se necessário
        const tipoDemanda = ficha.tipoDemanda || 'bacen';
        const paginaAtual = window.location.pathname.split('/').pop();
        
        if (tipoDemanda === 'bacen' && !paginaAtual.includes('bacen.html')) {
            window.location.href = 'bacen.html';
            // Aguardar carregamento e então abrir ficha
            setTimeout(() => {
                this.abrirFichaAposCarregamento(ficha);
            }, 1000);
        } else if (tipoDemanda === 'n2' && !paginaAtual.includes('n2.html')) {
            window.location.href = 'n2.html';
            setTimeout(() => {
                this.abrirFichaAposCarregamento(ficha);
            }, 1000);
        } else if (tipoDemanda === 'chatbot' && !paginaAtual.includes('chatbot.html')) {
            window.location.href = 'chatbot.html';
            setTimeout(() => {
                this.abrirFichaAposCarregamento(ficha);
            }, 1000);
        } else {
            // Já está na página correta, abrir ficha diretamente
            this.abrirFichaAposCarregamento(ficha);
        }
    }
    
    abrirFichaAposCarregamento(ficha) {
        console.log('🔍 [Notificações] Tentando abrir ficha após carregamento:', ficha.id, ficha.tipoDemanda);
        
        let tentativas = 0;
        const maxTentativas = 50;
        
        const tentarAbrir = setInterval(() => {
            tentativas++;
            
            if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
                clearInterval(tentarAbrir);
                
                try {
                    if (!window.fichasEspecificas) {
                        console.log('✅ [Notificações] Criando nova instância de FichasEspecificas');
                        window.fichasEspecificas = new window.FichasEspecificas();
                    }
                    
                    if (typeof window.fichasEspecificas.abrirFicha === 'function') {
                        console.log('✅ [Notificações] Abrindo ficha usando fichasEspecificas.abrirFicha');
                        window.fichasEspecificas.abrirFicha(ficha);
                    } else {
                        throw new Error('Método abrirFicha não encontrado na instância');
                    }
                } catch (error) {
                    console.error('❌ [Notificações] Erro ao abrir ficha:', error);
                    this.tentarAbrirPorId(ficha);
                }
            } else if (tentativas >= maxTentativas) {
                clearInterval(tentarAbrir);
                console.error('❌ [Notificações] FichasEspecificas não disponível após', maxTentativas * 100, 'ms');
                this.tentarAbrirPorId(ficha);
            }
        }, 100);
    }
    
    tentarAbrirPorId(ficha) {
        const fichaId = ficha.id;
        console.log('🔄 [Notificações] Tentando método alternativo por ID:', fichaId);
        
        setTimeout(() => {
            if (ficha.tipoDemanda === 'bacen') {
                if (typeof abrirFichaBacen === 'function') {
                    console.log('🔄 [Notificações] Usando abrirFichaBacen');
                    abrirFichaBacen(fichaId);
                } else if (window.abrirFichaBacen) {
                    console.log('🔄 [Notificações] Usando window.abrirFichaBacen');
                    window.abrirFichaBacen(fichaId);
                }
            } else if (ficha.tipoDemanda === 'n2') {
                if (typeof abrirFichaN2 === 'function') {
                    console.log('🔄 [Notificações] Usando abrirFichaN2');
                    abrirFichaN2(fichaId);
                } else if (window.abrirFichaN2) {
                    console.log('🔄 [Notificações] Usando window.abrirFichaN2');
                    window.abrirFichaN2(fichaId);
                }
            } else if (ficha.tipoDemanda === 'chatbot') {
                if (typeof abrirFichaChatbotHTML === 'function') {
                    console.log('🔄 [Notificações] Usando abrirFichaChatbotHTML');
                    abrirFichaChatbotHTML(fichaId);
                } else if (window.abrirFichaChatbotHTML) {
                    console.log('🔄 [Notificações] Usando window.abrirFichaChatbotHTML');
                    window.abrirFichaChatbotHTML(fichaId);
                }
            }
        }, 200);
    }
}

// Inicializar sistema de notificações
let sistemaNotificacoes = null;

function inicializarSistemaNotificacoes() {
    if (sistemaNotificacoes) return; // Já inicializado
    
    sistemaNotificacoes = new SistemaNotificacoes();
    window.sistemaNotificacoes = sistemaNotificacoes;
}

// Tentar inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaNotificacoes);
} else {
    inicializarSistemaNotificacoes();
}

// Também tentar após delays adicionais (caso o header seja carregado dinamicamente)
setTimeout(inicializarSistemaNotificacoes, 500);
setTimeout(inicializarSistemaNotificacoes, 1000);
setTimeout(inicializarSistemaNotificacoes, 2000);
setTimeout(inicializarSistemaNotificacoes, 3000);

// Adicionar estilos CSS para animações
if (!document.getElementById('estilos-notificacoes')) {
    const style = document.createElement('style');
    style.id = 'estilos-notificacoes';
    style.textContent = `
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
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);
}
