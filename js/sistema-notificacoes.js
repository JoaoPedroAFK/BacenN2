/* === SISTEMA DE NOTIFICAÇÕES PARA RECLAMAÇÕES === */
/* VERSÃO: v1.0.0 | DATA: 2026-01-XX | ALTERAÇÕES: Sistema de notificações para reclamações expiradas e PIX Solicitada */

class SistemaNotificacoes {
    constructor() {
        this.notificacoes = [];
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
        // Remover container existente se houver
        const existente = document.getElementById('container-notificacoes');
        if (existente) existente.remove();
        
        const container = document.createElement('div');
        container.id = 'container-notificacoes';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        document.body.appendChild(container);
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
        const container = document.getElementById('container-notificacoes');
        if (!container) return;
        
        // Filtrar notificações já exibidas (evitar duplicatas)
        const notificacoesNovas = notificacoes.filter(n => {
            const chave = `${n.tipo}-${n.ficha.id}`;
            return !this.notificacoes.includes(chave);
        });
        
        if (notificacoesNovas.length === 0) {
            if (notificacoes.length === 0) {
                container.innerHTML = '';
            }
            return;
        }
        
        // Adicionar novas notificações
        notificacoesNovas.forEach(notif => {
            const chave = `${notif.tipo}-${notif.ficha.id}`;
            this.notificacoes.push(chave);
            
            const elemento = this.criarElementoNotificacao(notif);
            container.appendChild(elemento);
            
            // Notificação sonora e visual para PIX Solicitada após 1 dia útil
            if (notif.tipo === 'pix-solicitada') {
                this.tocarAlerta();
                this.animarNotificacao(elemento);
            }
            
            // Notificação sonora para prazos críticos
            if (notif.prioridade === 'critica') {
                this.tocarAlerta();
                this.animarNotificacao(elemento);
            }
        });
        
        // Atualizar contador no header se existir
        this.atualizarContadorNotificacoes(notificacoes.length);
    }
    
    criarElementoNotificacao(notif) {
        const elemento = document.createElement('div');
        elemento.className = 'notificacao-item';
        elemento.style.cssText = `
            background: ${notif.prioridade === 'critica' ? '#FF0000' : notif.prioridade === 'alta' ? '#FF8400' : '#1634FF'};
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            cursor: pointer;
            animation: slideInRight 0.3s ease-out;
        `;
        
        elemento.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${notif.mensagem}</div>
                    <div style="font-size: 0.85em; opacity: 0.9;">Protocolo: ${this.obterProtocolosFicha(notif.ficha) || 'N/A'}</div>
                </div>
                <button onclick="sistemaNotificacoes.fecharNotificacao(this)" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 10px;">✕</button>
            </div>
        `;
        
        elemento.onclick = () => {
            this.abrirFicha(notif.ficha);
        };
        
        return elemento;
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
    
    fecharNotificacao(btn) {
        const elemento = btn.closest('.notificacao-item');
        if (elemento) {
            elemento.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                elemento.remove();
                this.atualizarContadorNotificacoes();
            }, 300);
        }
    }
    
    abrirFicha(ficha) {
        if (window.FichasEspecificas) {
            const fichasEspecificas = new window.FichasEspecificas();
            fichasEspecificas.abrirFicha(ficha.tipoDemanda || 'bacen', ficha);
        }
    }
    
    atualizarContadorNotificacoes(count) {
        const container = document.getElementById('container-notificacoes');
        if (!container) return;
        
        const countAtual = container.querySelectorAll('.notificacao-item').length;
        const countFinal = count !== undefined ? count : countAtual;
        
        // Adicionar badge no header se não existir
        let badge = document.getElementById('badge-notificacoes');
        if (!badge && countFinal > 0) {
            const header = document.querySelector('.velohub-header .header-actions');
            if (header) {
                badge = document.createElement('div');
                badge.id = 'badge-notificacoes';
                badge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #FF0000;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 10001;
                `;
                badge.textContent = countFinal > 99 ? '99+' : countFinal;
                badge.onclick = () => {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                header.style.position = 'relative';
                header.appendChild(badge);
            }
        } else if (badge) {
            if (countFinal > 0) {
                badge.textContent = countFinal > 99 ? '99+' : countFinal;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
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

