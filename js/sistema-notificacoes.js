/* === SISTEMA DE NOTIFICAÇÕES PARA RECLAMAÇÕES === */
/* VERSÃO: v1.0.0 | DATA: 2026-01-XX | ALTERAÇÕES: Sistema de notificações para reclamações expiradas e PIX Solicitada */

class SistemaNotificacoes {
    constructor() {
        this.notificacoes = [];
        this.notificacoesAtivas = [];
        this.audioContext = null;
        this.intervaloVerificacao = null;
        this.inicializar();
    }
    
    inicializar() {
        // Criar container de notificações
        this.criarContainerNotificacoes();
        
        // Iniciar verificação periódica
        this.iniciarVerificacaoPeriodica();
        
        // Verificar imediatamente
        this.verificarNotificacoes();
        
        console.log('✅ Sistema de Notificações inicializado');
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
        document.getElementById('btn-fechar-notificacoes').onclick = () => {
            this.fecharCaixaNotificacoes();
        };
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!caixa.contains(e.target) && !e.target.closest('#icone-notificacoes')) {
                this.fecharCaixaNotificacoes();
            }
        });
    }
    
    criarIconeSino() {
        // Remover ícone existente se houver
        const existente = document.getElementById('icone-notificacoes');
        if (existente) existente.remove();
        
        // Procurar header-actions
        const headerActions = document.querySelector('.velohub-header .header-actions') || 
                             document.querySelector('.header-actions') ||
                             document.querySelector('.velohub-header');
        
        if (!headerActions) {
            console.warn('⚠️ Header actions não encontrado, tentando criar...');
            return;
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
            caixa.style.display = 'flex';
            // Atualizar lista ao abrir
            this.atualizarListaNotificacoes();
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
        console.log('🔔 Verificando notificações...');
        
        try {
            // Carregar todas as reclamações
            let todasFichas = [];
            
            if (window.armazenamentoReclamacoes) {
                const fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
                const fichasN2 = await window.armazenamentoReclamacoes.carregarTodos('n2') || [];
                const fichasChatbot = await window.armazenamentoReclamacoes.carregarTodos('chatbot') || [];
                todasFichas = [...fichasBacen, ...fichasN2, ...fichasChatbot];
            } else {
                // Fallback localStorage
                const dadosBacen = localStorage.getItem('velotax_reclamacoes_bacen');
                const dadosN2 = localStorage.getItem('velotax_reclamacoes_n2');
                const dadosChatbot = localStorage.getItem('velotax_reclamacoes_chatbot');
                
                if (dadosBacen) todasFichas.push(...JSON.parse(dadosBacen));
                if (dadosN2) todasFichas.push(...JSON.parse(dadosN2));
                if (dadosChatbot) todasFichas.push(...JSON.parse(dadosChatbot));
            }
            
            const notificacoes = [];
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            todasFichas.forEach(ficha => {
                // Verificar PIX Solicitada após 1 dia útil
                if (ficha.pixStatus === 'Solicitada' && ficha.dataCriacao) {
                    const dataCriacao = new Date(ficha.dataCriacao);
                    const diasUteis = this.calcularDiasUteis(dataCriacao, hoje);
                    
                    if (diasUteis >= 1) {
                        notificacoes.push({
                            tipo: 'pix-solicitada',
                            ficha: ficha,
                            mensagem: `PIX Solicitada há ${diasUteis} dia(s) útil(is) - ${ficha.nomeCompleto || 'Cliente'}`,
                            prioridade: 'alta'
                        });
                    }
                }
                
                // Verificar prazos expirados ou a 2 dias de expirar
                if (ficha.prazoBacen) {
                    const prazo = new Date(ficha.prazoBacen);
                    prazo.setHours(0, 0, 0, 0);
                    const diffDias = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
                    
                    if (diffDias < 0) {
                        notificacoes.push({
                            tipo: 'prazo-expirado',
                            ficha: ficha,
                            mensagem: `⚠️ Prazo expirado há ${Math.abs(diffDias)} dia(s) - ${ficha.nomeCompleto || 'Cliente'}`,
                            prioridade: 'critica'
                        });
                    } else if (diffDias <= 2) {
                        notificacoes.push({
                            tipo: 'prazo-proximo',
                            ficha: ficha,
                            mensagem: `⏰ Prazo vence em ${diffDias} dia(s) - ${ficha.nomeCompleto || 'Cliente'}`,
                            prioridade: diffDias === 0 ? 'critica' : 'alta'
                        });
                    }
                }
            });
            
            // Exibir notificações
            this.exibirNotificacoes(notificacoes);
            
        } catch (error) {
            console.error('❌ Erro ao verificar notificações:', error);
        }
    }
    
    calcularDiasUteis(dataInicio, dataFim) {
        let dias = 0;
        const data = new Date(dataInicio);
        
        while (data <= dataFim) {
            const diaSemana = data.getDay();
            // 0 = Domingo, 6 = Sábado
            if (diaSemana !== 0 && diaSemana !== 6) {
                dias++;
            }
            data.setDate(data.getDate() + 1);
        }
        
        return dias;
    }
    
    exibirNotificacoes(notificacoes) {
        // Armazenar notificações ativas
        this.notificacoesAtivas = notificacoes;
        
        // Atualizar lista na caixa
        this.atualizarListaNotificacoes();
        
        // Atualizar contador no badge
        this.atualizarContadorNotificacoes(notificacoes.length);
        
        // Tocar alerta para novas notificações críticas
        const novasCriticas = notificacoes.filter(n => 
            n.prioridade === 'critica' || 
            (n.tipo === 'pix-solicitada' && n.prioridade === 'alta')
        );
        
        if (novasCriticas.length > 0) {
            this.tocarAlerta();
        }
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
        lista.querySelectorAll('.notificacao-item').forEach((item, index) => {
            item.onclick = () => {
                this.abrirFicha(this.notificacoesAtivas[index].ficha);
            };
        });
    }
    
    criarElementoNotificacao(notif, index) {
        const corFundo = notif.prioridade === 'critica' ? '#FF0000' : notif.prioridade === 'alta' ? '#FF8400' : '#1634FF';
        const protocolos = this.obterProtocolosFicha(notif.ficha) || 'N/A';
        const tipoDemanda = notif.ficha.tipoDemanda || 'bacen';
        const tipoLabel = tipoDemanda === 'bacen' ? 'BACEN' : tipoDemanda === 'n2' ? 'N2' : tipoDemanda === 'chatbot' ? 'Chatbot' : 'RA/Procon';
        const fichaId = notif.ficha.id || '';
        
        return `
            <div class="notificacao-item" style="
                background: ${corFundo};
                color: white;
                padding: 12px 16px;
                margin: 8px;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            " data-ficha-id="${fichaId}" data-tipo-demanda="${tipoDemanda}" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${notif.mensagem}</div>
                        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 4px;">
                            <strong>Tipo:</strong> ${tipoLabel} | <strong>Cliente:</strong> ${notif.ficha.nomeCompleto || notif.ficha.nomeCliente || 'N/A'}
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
    
    tocarAlerta() {
        try {
            // Criar contexto de áudio se não existir
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Criar oscilador para som de alerta
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('⚠️ Não foi possível tocar alerta sonoro:', error);
        }
    }
    
    animarNotificacao(elemento) {
        elemento.style.animation = 'pulse 0.5s ease-in-out 3';
    }
    
    abrirFicha(ficha) {
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
        // Aguardar até que FichasEspecificas esteja disponível
        let tentativas = 0;
        const maxTentativas = 20;
        
        const tentarAbrir = setInterval(() => {
            tentativas++;
            
            if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
                clearInterval(tentarAbrir);
                
                try {
                    if (!window.fichasEspecificas) {
                        window.fichasEspecificas = new window.FichasEspecificas();
                    }
                    window.fichasEspecificas.abrirFicha(ficha);
                } catch (error) {
                    console.error('❌ Erro ao abrir ficha:', error);
                    // Tentar método alternativo
                    if (ficha.tipoDemanda === 'bacen' && typeof abrirFichaBacen === 'function') {
                        abrirFichaBacen(ficha.id);
                    } else if (ficha.tipoDemanda === 'n2' && typeof abrirFichaN2 === 'function') {
                        abrirFichaN2(ficha.id);
                    }
                }
            } else if (tentativas >= maxTentativas) {
                clearInterval(tentarAbrir);
                console.error('❌ FichasEspecificas não disponível após', maxTentativas * 100, 'ms');
            }
        }, 100);
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
}

// Inicializar sistema de notificações
let sistemaNotificacoes = null;

document.addEventListener('DOMContentLoaded', function() {
    sistemaNotificacoes = new SistemaNotificacoes();
    window.sistemaNotificacoes = sistemaNotificacoes;
    
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
                    transform: scale(1.05);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Expor globalmente
window.SistemaNotificacoes = SistemaNotificacoes;

