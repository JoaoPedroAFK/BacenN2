/* === SISTEMA DE BUSCA AVANÇADA === */

class BuscaAvancada {
    constructor() {
        this.filtrosSalvos = JSON.parse(localStorage.getItem('velotax_buscas_salvas') || '[]');
        this.filtrosAtivos = {};
    }

    criarInterfaceBusca(containerId, tipoDemanda) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="busca-avancada-container">
                <div class="busca-header">
                    <h3>🔍 Busca Avançada</h3>
                    <button class="btn-toggle-filtros" onclick="buscaAvancada.toggleFiltros()">
                        ${this.filtrosVisiveis ? '▲ Ocultar' : '▼ Mostrar'} Filtros
                    </button>
                </div>

                <div class="busca-rapida">
                        <input type="text" 
                           id="busca-texto-${tipoDemanda}" 
                           class="busca-input" 
                           placeholder="Buscar por nome, CPF, motivo, observações..."
                           onkeyup="buscaAvancada.buscar('${tipoDemanda}')">
                    <button class="btn-buscar" onclick="buscaAvancada.buscar('${tipoDemanda}')">
                            🔍 Buscar
                        </button>
                </div>

                <div class="filtros-avancados ${this.filtrosVisiveis ? 'aberto' : ''}" id="filtros-${tipoDemanda}">
                    <div class="filtros-grid">
                        <div class="filtro-group">
                            <label>Status</label>
                            <select id="filtro-status-${tipoDemanda}" onchange="buscaAvancada.buscar('${tipoDemanda}')">
                                <option value="">Todos</option>
                                <option value="nao-iniciado">Não Iniciado</option>
                                <option value="em-tratativa">Em Tratativa</option>
                                <option value="concluido">Concluído</option>
                                <option value="respondido">Respondido</option>
                            </select>
                        </div>

                        <div class="filtro-group">
                            <label>Responsável</label>
                            <input type="text" 
                                   id="filtro-responsavel-${tipoDemanda}" 
                                   placeholder="Nome do responsável"
                                   onkeyup="buscaAvancada.buscar('${tipoDemanda}')">
                        </div>

                        <div class="filtro-group">
                            <label>Data de Entrada (De)</label>
                            <input type="date" 
                                   id="filtro-data-inicio-${tipoDemanda}" 
                                   onchange="buscaAvancada.buscar('${tipoDemanda}')">
                        </div>

                        <div class="filtro-group">
                            <label>Data de Entrada (Até)</label>
                            <input type="date" 
                                   id="filtro-data-fim-${tipoDemanda}" 
                                   onchange="buscaAvancada.buscar('${tipoDemanda}')">
                        </div>

                        ${tipoDemanda === 'bacen' ? `
                            <div class="filtro-group">
                                <label>Com Procon</label>
                                <select id="filtro-procon-${tipoDemanda}" onchange="buscaAvancada.buscar('${tipoDemanda}')">
                                    <option value="">Todos</option>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                </select>
                            </div>
                            <div class="filtro-group">
                                <label>PIX Status</label>
                                <select id="filtro-pix-${tipoDemanda}" onchange="buscaAvancada.buscar('${tipoDemanda}')">
                                    <option value="">Todos</option>
                                    <option value="Liberado">Liberado</option>
                                    <option value="Excluído">Excluído</option>
                                </select>
                        </div>
                        ` : ''}

                        ${tipoDemanda === 'n2' ? `
                            <div class="filtro-group">
                                <label>Status Portabilidade</label>
                                <select id="filtro-portabilidade-${tipoDemanda}" onchange="buscaAvancada.buscar('${tipoDemanda}')">
                                    <option value="">Todos</option>
                                    <option value="em-andamento">Em Andamento</option>
                                    <option value="concluida">Concluída</option>
                                    <option value="pendente">Pendente</option>
                                </select>
                                </div>
                            <div class="filtro-group">
                                <!-- Removido: Filtro Banco Destino (campo removido das fichas) -->
                        ` : ''}

                        ${tipoDemanda === 'chatbot' ? `
                            <div class="filtro-group">
                                <label>Resolvido Automaticamente</label>
                                <select id="filtro-auto-${tipoDemanda}" onchange="buscaAvancada.buscar('${tipoDemanda}')">
                                    <option value="">Todos</option>
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                </select>
                            </div>
                            <div class="filtro-group">
                                <label>Canal</label>
                                <input type="text" 
                                       id="filtro-canal-${tipoDemanda}" 
                                       placeholder="Canal do chatbot"
                                       onkeyup="buscaAvancada.buscar('${tipoDemanda}')">
                        </div>
                        ` : ''}
                </div>

                    <div class="filtros-acoes">
                        <button class="btn-limpar" onclick="buscaAvancada.limparFiltros('${tipoDemanda}')">
                            🗑️ Limpar Filtros
                        </button>
                        <button class="btn-salvar" onclick="buscaAvancada.salvarBusca('${tipoDemanda}')">
                            💾 Salvar Busca
                        </button>
                </div>

                    ${this.filtrosSalvos.length > 0 ? `
                        <div class="buscas-salvas">
                            <h4>📌 Buscas Salvas</h4>
                            <div class="buscas-salvas-lista">
                                ${this.filtrosSalvos.map((busca, index) => `
                                    <div class="busca-salva-item" onclick="buscaAvancada.aplicarBuscaSalva('${tipoDemanda}', ${index})">
                                        <span>${busca.nome || `Busca ${index + 1}`}</span>
                                        <button onclick="event.stopPropagation(); buscaAvancada.removerBuscaSalva(${index})">🗑️</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="resultados-info" id="resultados-info-${tipoDemanda}"></div>
            </div>
        `;
    }

    toggleFiltros() {
        this.filtrosVisiveis = !this.filtrosVisiveis;
        const filtros = document.querySelectorAll('.filtros-avancados');
        filtros.forEach(f => f.classList.toggle('aberto', this.filtrosVisiveis));
    }

    buscar(tipoDemanda) {
        const texto = document.getElementById(`busca-texto-${tipoDemanda}`)?.value.toLowerCase() || '';
        const status = document.getElementById(`filtro-status-${tipoDemanda}`)?.value || '';
        const responsavel = document.getElementById(`filtro-responsavel-${tipoDemanda}`)?.value.toLowerCase() || '';
        const dataInicio = document.getElementById(`filtro-data-inicio-${tipoDemanda}`)?.value || '';
        const dataFim = document.getElementById(`filtro-data-fim-${tipoDemanda}`)?.value || '';

        // Carregar fichas
        const storageKey = `velotax_demandas_${tipoDemanda}`;
        let fichas = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Aplicar filtros
        let filtradas = fichas.filter(ficha => {
            // Busca textual
            if (texto) {
                const matchTexto = 
                    (ficha.nomeCompleto || ficha.nomeCliente || '').toLowerCase().includes(texto) ||
                    (ficha.cpf || '').includes(texto) ||
                    (ficha.motivoReduzido || '').toLowerCase().includes(texto) ||
                    (ficha.motivoDetalhado || ficha.motivoReclamacao || '').toLowerCase().includes(texto) ||
                    (ficha.observacoes || '').toLowerCase().includes(texto);
                if (!matchTexto) return false;
            }

            // Status
            if (status && ficha.status !== status) return false;

            // Responsável
            if (responsavel && !(ficha.responsavel || '').toLowerCase().includes(responsavel)) return false;

            // Data
            if (dataInicio) {
                const dataEntrada = ficha.dataEntrada || ficha.dataReclamacao;
                if (!dataEntrada || dataEntrada < dataInicio) return false;
            }
            if (dataFim) {
                const dataEntrada = ficha.dataEntrada || ficha.dataReclamacao;
                if (!dataEntrada || dataEntrada > dataFim) return false;
            }

            // Filtros específicos BACEN
            if (tipoDemanda === 'bacen') {
                const procon = document.getElementById(`filtro-procon-${tipoDemanda}`)?.value;
                if (procon === 'sim' && !ficha.procon) return false;
                if (procon === 'nao' && ficha.procon) return false;

                const pix = document.getElementById(`filtro-pix-${tipoDemanda}`)?.value;
                if (pix && ficha.pixStatus !== pix) return false;
            }

            // Filtros específicos N2
            if (tipoDemanda === 'n2') {
                const portabilidade = document.getElementById(`filtro-portabilidade-${tipoDemanda}`)?.value;
                if (portabilidade && ficha.statusPortabilidade !== portabilidade) return false;

                const banco = document.getElementById(`filtro-banco-${tipoDemanda}`)?.value.toLowerCase();
                // Removido: filtro por bancoDestino (campo removido das fichas)
            }

            // Filtros específicos Chatbot
            if (tipoDemanda === 'chatbot') {
                const auto = document.getElementById(`filtro-auto-${tipoDemanda}`)?.value;
                if (auto === 'sim' && !ficha.resolvidoAutomaticamente) return false;
                if (auto === 'nao' && ficha.resolvidoAutomaticamente) return false;

                const canal = document.getElementById(`filtro-canal-${tipoDemanda}`)?.value.toLowerCase();
                if (canal && !(ficha.canalChatbot || '').toLowerCase().includes(canal)) return false;
            }
            
            return true;
        });

        // Atualizar resultados
        const info = document.getElementById(`resultados-info-${tipoDemanda}`);
        if (info) {
            info.textContent = `${filtradas.length} resultado(s) encontrado(s) de ${fichas.length} total`;
        }

        // Chamar função de renderização específica
        if (tipoDemanda === 'bacen' && window.renderizarListaBacen) {
            window.fichasBacenFiltradas = filtradas;
            window.renderizarListaBacen();
        } else if (tipoDemanda === 'n2' && window.renderizarListaN2) {
            window.fichasN2Filtradas = filtradas;
            window.renderizarListaN2();
        } else if (tipoDemanda === 'chatbot' && window.renderizarListaChatbot) {
            window.fichasChatbotFiltradas = filtradas;
            window.renderizarListaChatbot();
        }

        this.filtrosAtivos[tipoDemanda] = {
            texto, status, responsavel, dataInicio, dataFim
        };
    }

    limparFiltros(tipoDemanda) {
        document.getElementById(`busca-texto-${tipoDemanda}`).value = '';
        document.getElementById(`filtro-status-${tipoDemanda}`).value = '';
        document.getElementById(`filtro-responsavel-${tipoDemanda}`).value = '';
        document.getElementById(`filtro-data-inicio-${tipoDemanda}`).value = '';
        document.getElementById(`filtro-data-fim-${tipoDemanda}`).value = '';
        
        if (tipoDemanda === 'bacen') {
            document.getElementById(`filtro-procon-${tipoDemanda}`).value = '';
            document.getElementById(`filtro-pix-${tipoDemanda}`).value = '';
        } else if (tipoDemanda === 'n2') {
            document.getElementById(`filtro-portabilidade-${tipoDemanda}`).value = '';
            document.getElementById(`filtro-banco-${tipoDemanda}`).value = '';
        } else if (tipoDemanda === 'chatbot') {
            document.getElementById(`filtro-auto-${tipoDemanda}`).value = '';
            document.getElementById(`filtro-canal-${tipoDemanda}`).value = '';
        }

        this.buscar(tipoDemanda);
    }

    salvarBusca(tipoDemanda) {
        const nome = prompt('Nome para esta busca:');
        if (!nome) return;

        const busca = {
            nome,
            tipoDemanda,
            filtros: this.filtrosAtivos[tipoDemanda] || {}
        };

        this.filtrosSalvos.push(busca);
        localStorage.setItem('velotax_buscas_salvas', JSON.stringify(this.filtrosSalvos));
        
        alert('Busca salva com sucesso!');
        this.criarInterfaceBusca(`busca-avancada-${tipoDemanda}`, tipoDemanda);
    }

    aplicarBuscaSalva(tipoDemanda, index) {
        const busca = this.filtrosSalvos[index];
        if (!busca || busca.tipoDemanda !== tipoDemanda) return;

        // Aplicar filtros
        Object.keys(busca.filtros).forEach(key => {
            const elemento = document.getElementById(`filtro-${key}-${tipoDemanda}`) || 
                           document.getElementById(`busca-texto-${tipoDemanda}`);
            if (elemento) elemento.value = busca.filtros[key];
        });

        this.buscar(tipoDemanda);
    }

    removerBuscaSalva(index) {
        if (confirm('Remover esta busca salva?')) {
            this.filtrosSalvos.splice(index, 1);
            localStorage.setItem('velotax_buscas_salvas', JSON.stringify(this.filtrosSalvos));
            location.reload();
        }
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.buscaAvancada = new BuscaAvancada();
}
