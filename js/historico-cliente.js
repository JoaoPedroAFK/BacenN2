/* === HISTÓRICO COMPLETO DO CLIENTE === */

// Função global para abrir ficha completa
window.abrirFichaCompleta = function(tipoDemanda, id) {
    const pagina = `${tipoDemanda}.html`;
    
    // Navegar para a página e depois abrir a ficha
    if (window.location.pathname.includes(pagina)) {
        // Já estamos na página correta, apenas abrir a ficha
        setTimeout(() => {
            if (tipoDemanda === 'bacen' && window.abrirFichaBacen) {
                window.abrirFichaBacen(id);
            } else if (tipoDemanda === 'n2' && window.abrirFichaN2) {
                window.abrirFichaN2(id);
            } else if (tipoDemanda === 'chatbot' && window.abrirFichaChatbot) {
                window.abrirFichaChatbot(id);
            } else if (window.fichasEspecificas) {
                // Buscar a ficha e abrir
                const fichas = tipoDemanda === 'bacen' ? window.fichasBacen || [] :
                              tipoDemanda === 'n2' ? window.fichasN2 || [] :
                              window.fichasChatbot || [];
                const ficha = fichas.find(f => f.id === id);
                if (ficha) {
                    window.fichasEspecificas.abrirFicha(ficha);
                }
            }
        }, 100);
    } else {
        // Navegar para a página e depois abrir a ficha
        window.location.href = `${pagina}?ficha=${id}`;
    }
};

class HistoricoCliente {
    constructor() {
        this.clienteAtual = null;
    }

    async buscarPorCPF(cpf) {
        // Remove formatação do CPF
        const cpfLimpo = cpf.replace(/\D/g, '');
        
        if (!cpfLimpo || cpfLimpo.length < 11) {
            return {
                encontrado: false,
                fichas: [],
                cliente: null
            };
        }

        console.log('🔍 Buscando CPF:', cpfLimpo);

        // Buscar em todas as demandas - PRIORIDADE: Firebase, depois localStorage
        let fichasBacen = [];
        let fichasN2 = [];
        let fichasChatbot = [];

        // Tentar buscar do Firebase primeiro (se disponível)
        if (window.armazenamentoReclamacoes) {
            try {
                console.log('📥 Buscando do Firebase...');
                const [bacen, n2, chatbot] = await Promise.all([
                    window.armazenamentoReclamacoes.carregarTodos('bacen').catch(() => []),
                    window.armazenamentoReclamacoes.carregarTodos('n2').catch(() => []),
                    window.armazenamentoReclamacoes.carregarTodos('chatbot').catch(() => [])
                ]);
                
                fichasBacen = Array.isArray(bacen) ? bacen : [];
                fichasN2 = Array.isArray(n2) ? n2 : [];
                fichasChatbot = Array.isArray(chatbot) ? chatbot : [];
                
                console.log(`✅ Firebase: ${fichasBacen.length} BACEN, ${fichasN2.length} N2, ${fichasChatbot.length} Chatbot`);
            } catch (error) {
                console.warn('⚠️ Erro ao buscar do Firebase, usando localStorage:', error);
            }
        }

        // Fallback: buscar do localStorage se Firebase não retornou dados
        if (fichasBacen.length === 0 && fichasN2.length === 0 && fichasChatbot.length === 0) {
            console.log('📦 Buscando do localStorage...');
            fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
            fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
            fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
            console.log(`✅ localStorage: ${fichasBacen.length} BACEN, ${fichasN2.length} N2, ${fichasChatbot.length} Chatbot`);
        }

        const todasFichas = [
            ...fichasBacen.map(f => ({ ...f, tipoDemanda: 'bacen' })),
            ...fichasN2.map(f => ({ ...f, tipoDemanda: 'n2' })),
            ...fichasChatbot.map(f => ({ ...f, tipoDemanda: 'chatbot' }))
        ];

        console.log(`📋 Total de fichas carregadas: ${todasFichas.length}`);

        // Filtrar por CPF
        const fichasCliente = todasFichas.filter(ficha => {
            const cpfFicha = (ficha.cpf || '').replace(/\D/g, '');
            const match = cpfFicha === cpfLimpo;
            if (match) {
                console.log('✅ Match encontrado:', ficha.id, ficha.tipoDemanda);
            }
            return match;
        });

        console.log(`📋 Fichas encontradas para CPF ${cpfLimpo}: ${fichasCliente.length}`);

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

    async mostrarHistorico(cpf) {
        // Mostrar loading
        const loadingModal = document.createElement('div');
        loadingModal.className = 'modal-historico';
        loadingModal.innerHTML = `
            <div class="modal-historico-content">
                <div class="modal-historico-header">
                    <h2>🔍 Buscando...</h2>
                </div>
                <div style="padding: 20px; text-align: center;">
                    <p>Buscando fichas para o CPF informado...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);

        try {
            const resultado = await this.buscarPorCPF(cpf);

            // Remover loading
            loadingModal.remove();

            if (!resultado.encontrado) {
                mostrarAlerta('Nenhuma ficha encontrada para este CPF.', 'info');
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
        } catch (error) {
            // Remover loading em caso de erro
            loadingModal.remove();
            console.error('❌ Erro ao buscar histórico:', error);
            mostrarAlerta('Erro ao buscar histórico do cliente: ' + error.message, 'error');
        }
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
            <div class="historico-ficha-card" onclick="abrirFichaCompleta('${ficha.tipoDemanda}', '${ficha.id}')" style="cursor: pointer;">
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
        // Função global para buscar cliente por CPF
        window.buscarClientePorCPF = async () => {
            const input = document.getElementById('busca-cliente-cpf');
            const cpf = input ? input.value.trim() : '';
            if (cpf) {
                // Validar CPF básico (11 dígitos)
                const cpfLimpo = cpf.replace(/\D/g, '');
                if (cpfLimpo.length < 11) {
                    mostrarAlerta('CPF inválido. Digite os 11 dígitos.', 'warning');
                    return;
                }
                await this.mostrarHistorico(cpf);
                if (input) input.value = ''; // Limpar campo após busca
            } else {
                mostrarAlerta('Digite um CPF para buscar', 'info');
            }
        };
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














