/* === SISTEMA DE ALERTAS E NOTIFICAÇÕES === */

class SistemaAlertas {
    constructor() {
        this.alertas = [];
        this.intervaloVerificacao = 60000; // Verifica a cada 1 minuto
        this.inicializar();
    }

    inicializar() {
        this.verificarPrazos();
        // Verifica periodicamente
        setInterval(() => this.verificarPrazos(), this.intervaloVerificacao);
        
        // Verifica ao carregar a página
        window.addEventListener('load', () => this.verificarPrazos());
    }

    verificarPrazos() {
        this.alertas = [];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Verificar fichas BACEN
        // Usar chaves novas e antigas para compatibilidade
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        fichasBacen.forEach(ficha => {
            if (ficha.prazoBacen) {
                const prazo = new Date(ficha.prazoBacen);
                prazo.setHours(0, 0, 0, 0);
                const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));

                if (diff < 0) {
                    this.alertas.push({
                        tipo: 'vencido',
                        ficha: ficha,
                        dias: Math.abs(diff),
                        mensagem: `Prazo BACEN vencido há ${Math.abs(diff)} dia(s)`,
                        urgente: true
                    });
                } else if (diff === 0) {
                    this.alertas.push({
                        tipo: 'hoje',
                        ficha: ficha,
                        dias: 0,
                        mensagem: 'Prazo BACEN vence HOJE!',
                        urgente: true
                    });
                } else if (diff <= 3) {
                    this.alertas.push({
                        tipo: 'critico',
                        ficha: ficha,
                        dias: diff,
                        mensagem: `Prazo BACEN vence em ${diff} dia(s)`,
                        urgente: true
                    });
                } else if (diff <= 7) {
                    this.alertas.push({
                        tipo: 'atencao',
                        ficha: ficha,
                        dias: diff,
                        mensagem: `Prazo BACEN vence em ${diff} dia(s)`,
                        urgente: false
                    });
                }
            }
        });

        // Verificar fichas N2
        // Usar chaves novas e antigas para compatibilidade
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        fichasN2.forEach(ficha => {
            if (ficha.prazoN2) {
                const prazo = new Date(ficha.prazoN2);
                prazo.setHours(0, 0, 0, 0);
                const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));

                if (diff <= 3 && diff >= 0) {
                    this.alertas.push({
                        tipo: diff === 0 ? 'hoje' : 'critico',
                        ficha: ficha,
                        dias: diff,
                        mensagem: `Prazo N2 ${diff === 0 ? 'vence HOJE' : `vence em ${diff} dia(s)`}`,
                        urgente: diff <= 1
                    });
                }
            }
        });

        // Verificar fichas Chatbot
        // Usar chaves novas e antigas para compatibilidade
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        fichasChatbot.forEach(ficha => {
            if (ficha.prazoResposta) {
                const prazo = new Date(ficha.prazoResposta);
                prazo.setHours(0, 0, 0, 0);
                const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));

                if (diff <= 1 && diff >= 0) {
                    this.alertas.push({
                        tipo: diff === 0 ? 'hoje' : 'critico',
                        ficha: ficha,
                        dias: diff,
                        mensagem: `Prazo de resposta ${diff === 0 ? 'vence HOJE' : `vence em ${diff} dia(s)`}`,
                        urgente: true
                    });
                }
            }
        });

        this.atualizarUI();
    }

    atualizarUI() {
        // Atualizar badge no header
        const badge = document.getElementById('alertas-badge');
        if (badge) {
            const urgentes = this.alertas.filter(a => a.urgente).length;
            badge.textContent = urgentes > 0 ? urgentes : '';
            badge.style.display = urgentes > 0 ? 'flex' : 'none';
        }

        // Atualizar dashboard de urgências se existir
        this.atualizarDashboardUrgencias();
    }

    atualizarDashboardUrgencias() {
        const container = document.getElementById('dashboard-urgencias');
        if (!container) return;

        const urgentes = this.alertas.filter(a => a.urgente);
        const atencao = this.alertas.filter(a => !a.urgente);

        if (this.alertas.length === 0) {
            container.innerHTML = `
                <div class="urgencias-card sem-urgencias">
                    <h3>✅ Nenhum alerta no momento</h3>
                    <p>Todas as fichas estão dentro do prazo</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="urgencias-grid">
                ${urgentes.length > 0 ? `
                    <div class="urgencias-card urgentes">
                        <div class="urgencias-header">
                            <h3>Urgentes</h3>
                        </div>
                        <div class="urgencias-lista">
                            ${urgentes.slice(0, 5).map(alerta => this.criarItemAlerta(alerta)).join('')}
                            ${urgentes.length > 5 ? `<div class="mais-itens">+${urgentes.length - 5} mais</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                ${atencao.length > 0 ? `
                    <div class="urgencias-card atencao">
                        <div class="urgencias-header">
                            <h3>⚠️ Atenção (${atencao.length})</h3>
                        </div>
                        <div class="urgencias-lista">
                            ${atencao.slice(0, 5).map(alerta => this.criarItemAlerta(alerta)).join('')}
                            ${atencao.length > 5 ? `<div class="mais-itens">+${atencao.length - 5} mais</div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    criarItemAlerta(alerta) {
        const tipoDemanda = alerta.ficha.tipoDemanda || 
            (alerta.ficha.prazoBacen ? 'bacen' : 
             alerta.ficha.prazoN2 ? 'n2' : 'chatbot');
        
        const nome = alerta.ficha.nomeCompleto || alerta.ficha.nomeCliente || 'Sem nome';
        const pagina = tipoDemanda === 'bacen' ? 'bacen.html' : 
                      tipoDemanda === 'n2' ? 'n2.html' : 'chatbot.html';

        return `
            <div class="item-alerta" onclick="window.location.href='${pagina}#ficha-${alerta.ficha.id}'">
                <div class="item-alerta-header">
                    <span class="tipo-demanda">${tipoDemanda.toUpperCase()}</span>
                    <span class="dias-restantes ${alerta.tipo}">${alerta.dias}d</span>
                </div>
                <div class="item-alerta-nome">${nome}</div>
                <div class="item-alerta-mensagem">${alerta.mensagem}</div>
            </div>
        `;
    }

    obterAlertasUrgentes() {
        return this.alertas.filter(a => a.urgente);
    }

    obterTotalAlertas() {
        return this.alertas.length;
    }
}

// Inicializar sistema de alertas
if (typeof window !== 'undefined') {
    window.sistemaAlertas = new SistemaAlertas();
}














