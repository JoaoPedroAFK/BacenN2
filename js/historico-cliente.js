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

        // Remover modal existente se houver
        const modalExistente = document.querySelector('.modal-historico');
        if (modalExistente) {
            modalExistente.remove();
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
                
                <div class="cliente-info" id="cliente-info-section">
                    <div class="cliente-card">
                        <h3>${resultado.cliente.nome}</h3>
                        <p><strong>CPF:</strong> ${resultado.cliente.cpf}</p>
                        <p><strong>Telefone:</strong> ${resultado.cliente.telefone}</p>
                        <p><strong>Total de Fichas:</strong> ${resultado.cliente.totalFichas}</p>
                    </div>
                </div>

                <div class="historico-fichas" id="historico-fichas-section">
                    <h3>Fichas (${resultado.fichas.length})</h3>
                    <div class="historico-lista">
                        ${resultado.fichas.map((ficha, index) => this.criarCardFicha(ficha, index + 1)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Scroll automático para a seção de informações do cliente
        setTimeout(() => {
            const clienteSection = document.getElementById('cliente-info-section');
            if (clienteSection) {
                clienteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    criarCardFicha(ficha, numero) {
        const tipoDemanda = ficha.tipoDemanda || 'bacen';
        const tipoLabel = tipoDemanda === 'bacen' ? 'BACEN' : 
                         tipoDemanda === 'n2' ? 'N2' : 'CHATBOT';
        const tipoCor = tipoDemanda === 'bacen' ? '#1634FF' : 
                       tipoDemanda === 'n2' ? '#1DFDB9' : '#FF8400';
        
        const statusLabels = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido'
        };

        const status = statusLabels[ficha.status] || ficha.status;
        const statusClass = ficha.status === 'em-tratativa' ? 'status-em-tratativa' : 
                           ficha.status === 'concluido' || ficha.status === 'respondido' ? 'status-concluido' : 
                           'status-outro';
        const dataEntrada = this.formatarData(ficha.dataEntrada || ficha.dataReclamacao);
        const pagina = `${tipoDemanda}.html`;
        
        // Determinar qual prazo mostrar
        const prazoTexto = ficha.prazoBacen ? `Prazo BACEN: ${this.formatarData(ficha.prazoBacen)}` :
                          ficha.prazoN2 ? `Prazo N2: ${this.formatarData(ficha.prazoN2)}` : '';

        return `
            <div class="historico-ficha-card" onclick="window.location.href='${pagina}#ficha-${ficha.id}'">
                <div class="historico-ficha-numero">${numero}</div>
                <div class="historico-ficha-content">
                    <div class="historico-ficha-header">
                        <span class="status-badge ${statusClass}">${status}</span>
                        <span class="tipo-badge" style="background: ${tipoCor}">${tipoLabel}</span>
                    </div>
                    <div class="historico-ficha-body">
                        <div class="historico-ficha-item">
                            <strong>Data de Entrada:</strong> ${dataEntrada}
                        </div>
                        <div class="historico-ficha-item">
                            <strong>Responsável:</strong> ${ficha.responsavel || 'Não atribuído'}
                        </div>
                        ${ficha.motivoReduzido ? `
                        <div class="historico-ficha-item">
                            <strong>Motivo:</strong> ${ficha.motivoReduzido}
                        </div>
                        ` : ''}
                        ${prazoTexto ? `
                        <div class="historico-ficha-item">
                            <strong>${prazoTexto}</strong>
                        </div>
                        ` : ''}
                    </div>
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














