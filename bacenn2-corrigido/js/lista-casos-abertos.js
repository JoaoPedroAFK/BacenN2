/* === LISTA LATERAL DE CASOS EM ABERTO === */

class ListaCasosAbertos {
    constructor() {
        this.casos = [];
        this.filtroCPF = '';
        this.inicializar();
    }

    inicializar() {
        this.criarSidebar();
        this.carregarCasos();
        this.configurarEventos();
    }

    criarSidebar() {
        // Verificar se já existe
        if (document.getElementById('sidebar-casos-abertos')) {
            return;
        }

        const sidebar = document.createElement('div');
        sidebar.id = 'sidebar-casos-abertos';
        sidebar.className = 'sidebar-casos-abertos';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h3>📋 Casos em Aberto</h3>
                <button class="btn-fechar-sidebar" onclick="listaCasosAbertos.toggleSidebar()">✕</button>
            </div>
            <div class="sidebar-search">
                <input type="text" id="busca-cpf-casos" class="velohub-input" placeholder="🔍 Buscar por CPF...">
            </div>
            <div class="sidebar-content" id="lista-casos-conteudo">
                <div class="loading-casos">Carregando casos...</div>
            </div>
        `;

        // Adicionar ao body
        document.body.appendChild(sidebar);

        // Adicionar botão toggle no header
        this.adicionarBotaoToggle();
    }

    adicionarBotaoToggle() {
        const headers = document.querySelectorAll('.velohub-header');
        headers.forEach(header => {
            if (!header.querySelector('.btn-toggle-casos')) {
                const btnToggle = document.createElement('button');
                btnToggle.className = 'btn-toggle-casos';
                btnToggle.innerHTML = '📋';
                btnToggle.title = 'Mostrar/Ocultar Casos em Aberto';
                btnToggle.onclick = () => this.toggleSidebar();
                
                const headerActions = header.querySelector('.header-actions');
                if (headerActions) {
                    headerActions.appendChild(btnToggle);
                }
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar-casos-abertos');
        if (sidebar) {
            sidebar.classList.toggle('aberta');
        }
    }

    carregarCasos() {
        // Carregar casos de todos os tipos
        // Usar chaves novas e antigas para compatibilidade
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        // Usar chaves novas e antigas para compatibilidade
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');

        // Filtrar apenas casos em aberto (não concluídos)
        const casosAbertos = [
            ...fichasBacen
                .filter(f => f.status !== 'concluido' && f.status !== 'concluído' && f.status !== 'respondido')
                .map(f => ({ ...f, tipo: 'BACEN' })),
            ...fichasN2
                .filter(f => f.status !== 'concluido' && f.status !== 'concluído' && f.status !== 'respondido')
                .map(f => ({ ...f, tipo: 'N2' })),
            ...fichasChatbot
                .filter(f => f.status !== 'concluido' && f.status !== 'concluído' && f.status !== 'respondido')
                .map(f => ({ ...f, tipo: 'Chatbot' }))
        ];

        // Ordenar por prazo (mais próximo de vencer primeiro)
        casosAbertos.sort((a, b) => {
            const prazoA = this.obterPrazo(a);
            const prazoB = this.obterPrazo(b);
            
            if (!prazoA && !prazoB) return 0;
            if (!prazoA) return 1;
            if (!prazoB) return -1;
            
            return new Date(prazoA) - new Date(prazoB);
        });

        this.casos = casosAbertos;
        this.renderizarCasos();
    }

    obterPrazo(ficha) {
        if (ficha.tipo === 'BACEN') {
            return ficha.prazoBacen || ficha.prazoRetorno;
        } else if (ficha.tipo === 'N2') {
            return ficha.prazoN2 || ficha.prazoRetorno;
        } else {
            return ficha.prazoResposta || ficha.prazoRetorno;
        }
    }

    calcularDiasRestantes(prazo) {
        if (!prazo) return null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const prazoDate = new Date(prazo);
        prazoDate.setHours(0, 0, 0, 0);
        const diff = Math.ceil((prazoDate - hoje) / (1000 * 60 * 60 * 24));
        return diff;
    }

    renderizarCasos() {
        const container = document.getElementById('lista-casos-conteudo');
        if (!container) return;

        let casosFiltrados = this.casos;

        // Aplicar filtro de CPF
        if (this.filtroCPF) {
            const cpfFiltrado = this.filtroCPF.replace(/\D/g, '');
            casosFiltrados = casosFiltrados.filter(c => {
                const cpf = (c.cpf || '').replace(/\D/g, '');
                return cpf.includes(cpfFiltrado);
            });
        }

        if (casosFiltrados.length === 0) {
            container.innerHTML = `
                <div class="sem-casos">
                    <p>${this.filtroCPF ? 'Nenhum caso encontrado com este CPF' : 'Nenhum caso em aberto'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = casosFiltrados.map(caso => {
            const prazo = this.obterPrazo(caso);
            const diasRestantes = prazo ? this.calcularDiasRestantes(prazo) : null;
            const urgente = diasRestantes !== null && diasRestantes <= 3;
            const vencido = diasRestantes !== null && diasRestantes < 0;

            return `
                <div class="caso-item ${urgente ? 'urgente' : ''} ${vencido ? 'vencido' : ''}" onclick="listaCasosAbertos.abrirCaso('${caso.tipo}', '${caso.id}')">
                    <div class="caso-header">
                        <span class="caso-tipo">${caso.tipo}</span>
                        <span class="caso-status status-${caso.status || 'nao-iniciado'}">${this.formatarStatus(caso.status)}</span>
                    </div>
                    <div class="caso-nome">${caso.nomeCompleto || caso.nomeCliente || 'Sem nome'}</div>
                    <div class="caso-cpf">${this.formatarCPF(caso.cpf || '')}</div>
                    ${prazo ? `
                        <div class="caso-prazo ${vencido ? 'vencido' : urgente ? 'urgente' : ''}">
                            ${vencido ? '⚠️ Vencido' : urgente ? '🚨 Urgente' : '📅'} 
                            ${this.formatarData(prazo)}
                            ${diasRestantes !== null ? `(${diasRestantes > 0 ? diasRestantes + ' dias' : Math.abs(diasRestantes) + ' dias atrás'})` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    configurarEventos() {
        const inputBusca = document.getElementById('busca-cpf-casos');
        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                this.filtroCPF = e.target.value;
                this.renderizarCasos();
            });
        }

        // Atualizar lista quando houver mudanças
        setInterval(() => {
            this.carregarCasos();
        }, 30000); // Atualizar a cada 30 segundos
    }

    abrirCaso(tipo, id) {
        // Navegar para a página correspondente e abrir a ficha
        let url = '';
        if (tipo === 'BACEN') {
            url = 'bacen.html';
        } else if (tipo === 'N2') {
            url = 'n2.html';
        } else {
            url = 'chatbot.html';
        }

        // Salvar ID para abrir após carregar a página
        sessionStorage.setItem('abrirFichaId', id);
        sessionStorage.setItem('abrirFichaTipo', tipo.toLowerCase());
        
        window.location.href = url;
    }

    formatarStatus(status) {
        const statusMap = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'concluído': 'Concluído',
            'respondido': 'Respondido'
        };
        return statusMap[status] || status || 'Não definido';
    }

    formatarCPF(cpf) {
        if (!cpf) return 'Não informado';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatarData(data) {
        if (!data) return '';
        const d = new Date(data);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('pt-BR');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.listaCasosAbertos = new ListaCasosAbertos();
    
    // Verificar se há ficha para abrir
    const fichaId = sessionStorage.getItem('abrirFichaId');
    const fichaTipo = sessionStorage.getItem('abrirFichaTipo');
    if (fichaId && fichaTipo) {
        setTimeout(() => {
            if (window.fichasEspecificas) {
                window.fichasEspecificas.abrirFicha(fichaId, fichaTipo);
            }
            sessionStorage.removeItem('abrirFichaId');
            sessionStorage.removeItem('abrirFichaTipo');
        }, 1000);
    }
});

