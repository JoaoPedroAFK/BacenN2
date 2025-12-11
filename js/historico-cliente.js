/* === HISTÓRICO COMPLETO DO CLIENTE === */

class HistoricoCliente {
    constructor() {
        this.clienteAtual = null;
    }

    buscarPorCPF(cpf) {
        // Remove formatação do CPF
        const cpfLimpo = cpf.replace(/\D/g, '');

        // Buscar em todas as demandas
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_demandas_bacen') || '[]');
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_demandas_n2') || '[]');
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_demandas_chatbot') || '[]');

        const todasFichas = [
            ...fichasBacen.map(f => ({ ...f, tipoDemanda: 'bacen' })),
            ...fichasN2.map(f => ({ ...f, tipoDemanda: 'n2' })),
            ...fichasChatbot.map(f => ({ ...f, tipoDemanda: 'chatbot' }))
        ];

        // Filtrar por CPF
        const fichasCliente = todasFichas.filter(ficha => {
            const cpfFicha = (ficha.cpf || '').replace(/\D/g, '');
            return cpfFicha === cpfLimpo;
        });

        if (fichasCliente.length === 0) {
            return {
                encontrado: false,
                fichas: [],
                cliente: null
            };
        }

        // Pegar dados do cliente da primeira ficha
        const primeiraFicha = fichasCliente[0];
        const cliente = {
            nome: primeiraFicha.nomeCompleto || primeiraFicha.nomeCliente || 'Não informado',
            cpf: primeiraFicha.cpf || cpf,
            telefone: primeiraFicha.telefone || 'Não informado',
            totalFichas: fichasCliente.length
        };

        // Ordenar por data (mais recente primeiro)
        fichasCliente.sort((a, b) => {
            const dataA = new Date(a.dataEntrada || a.dataReclamacao || 0);
            const dataB = new Date(b.dataEntrada || b.dataReclamacao || 0);
            return dataB - dataA;
        });

        this.clienteAtual = cliente;

        return {
            encontrado: true,
            fichas: fichasCliente,
            cliente: cliente
        };
    }

    mostrarHistorico(cpf) {
        const resultado = this.buscarPorCPF(cpf);

        if (!resultado.encontrado) {
            alert('Nenhuma ficha encontrada para este CPF.');
            return;
        }

        // Criar modal com histórico
        const modal = document.createElement('div');
        modal.className = 'modal-historico';
        modal.innerHTML = `
            <div class="modal-historico-content">
                <div class="modal-historico-header">
                    <h2>📋 Histórico Completo do Cliente</h2>
                    <button class="btn-fechar" onclick="this.closest('.modal-historico').remove()">✕</button>
                </div>
                
                <div class="cliente-info">
                    <div class="cliente-card">
                        <h3>${resultado.cliente.nome}</h3>
                        <p><strong>CPF:</strong> ${resultado.cliente.cpf}</p>
                        <p><strong>Telefone:</strong> ${resultado.cliente.telefone}</p>
                        <p><strong>Total de Fichas:</strong> ${resultado.cliente.totalFichas}</p>
                    </div>
                </div>

                <div class="historico-fichas">
                    <h3>Fichas (${resultado.fichas.length})</h3>
                    <div class="historico-lista">
                        ${resultado.fichas.map(ficha => this.criarCardFicha(ficha)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    criarCardFicha(ficha) {
        const tipoDemanda = ficha.tipoDemanda || 'bacen';
        const tipoLabel = tipoDemanda.toUpperCase();
        const tipoCor = tipoDemanda === 'bacen' ? '#1634FF' : 
                       tipoDemanda === 'n2' ? '#1DFDB9' : '#FF8400';
        
        const statusLabels = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido'
        };

        const status = statusLabels[ficha.status] || ficha.status;
        const dataEntrada = this.formatarData(ficha.dataEntrada || ficha.dataReclamacao);
        const pagina = `${tipoDemanda}.html`;

        return `
            <div class="historico-ficha-card" onclick="window.location.href='${pagina}#ficha-${ficha.id}'">
                <div class="historico-ficha-header">
                    <span class="tipo-badge" style="background: ${tipoCor}">${tipoLabel}</span>
                    <span class="status-badge status-${ficha.status}">${status}</span>
                </div>
                <div class="historico-ficha-body">
                    <p><strong>Data de Entrada:</strong> ${dataEntrada}</p>
                    <p><strong>Responsável:</strong> ${ficha.responsavel || 'Não atribuído'}</p>
                    ${ficha.motivoReduzido ? `<p><strong>Motivo:</strong> ${ficha.motivoReduzido}</p>` : ''}
                    ${ficha.prazoBacen ? `<p><strong>Prazo BACEN:</strong> ${this.formatarData(ficha.prazoBacen)}</p>` : ''}
                    ${ficha.prazoN2 ? `<p><strong>Prazo N2:</strong> ${this.formatarData(ficha.prazoN2)}</p>` : ''}
                </div>
            </div>
        `;
    }

    formatarData(data) {
        if (!data) return 'Não informada';
        const d = new Date(data);
        if (isNaN(d.getTime())) return 'Data inválida';
        return d.toLocaleDateString('pt-BR');
    }

    adicionarBotaoBusca() {
        // Adicionar botão de busca por CPF nas páginas
        const headers = document.querySelectorAll('.velohub-header, .bacen-header, .n2-header, .chatbot-header');
        headers.forEach(header => {
            if (header.querySelector('.btn-historico-cliente')) return; // Já existe

            const btn = document.createElement('button');
            btn.className = 'velohub-btn btn-secondary btn-historico-cliente';
            btn.innerHTML = '🔍 Buscar Cliente';
            btn.onclick = () => {
                const cpf = prompt('Digite o CPF do cliente:');
                if (cpf) this.mostrarHistorico(cpf);
            };
            
            const actions = header.querySelector('.header-actions');
            if (actions) {
                actions.insertBefore(btn, actions.firstChild);
            }
        });
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.historicoCliente = new HistoricoCliente();
    
    // Adicionar botão após carregar a página
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.historicoCliente.adicionarBotaoBusca(), 500);
    });
}














