/* === SISTEMA DE CONTROLE DE GRÁFICOS NAS DASHBOARDS === */

class ControleGraficosDashboard {
    constructor(tipoDemanda) {
        this.tipoDemanda = tipoDemanda;
        this.graficosVisiveis = this.carregarPreferencias();
        this.tamanhosGraficos = this.carregarTamanhos();
        this.inicializar();
    }

    carregarPreferencias() {
        const salvo = localStorage.getItem(`graficos_visiveis_${this.tipoDemanda}`);
        if (salvo) {
            return JSON.parse(salvo);
        }
        // Por padrão, todos os gráficos são visíveis
        return {
            status: true,
            mensal: true,
            origem: true,
            prazoBacen: true,
            cobranca: true,
            casosCriticos: true,
            responsavel: true,
            canal: true,
            satisfacao: true,
            produto: true
        };
    }

    carregarTamanhos() {
        const salvo = localStorage.getItem(`tamanhos_graficos_${this.tipoDemanda}`);
        if (salvo) {
            return JSON.parse(salvo);
        }
        return {};
    }

    salvarPreferencias() {
        localStorage.setItem(`graficos_visiveis_${this.tipoDemanda}`, JSON.stringify(this.graficosVisiveis));
        localStorage.setItem(`tamanhos_graficos_${this.tipoDemanda}`, JSON.stringify(this.tamanhosGraficos));
    }

    inicializar() {
        // Aguardar os gráficos serem renderizados
        setTimeout(() => {
            this.renderizarControles();
            this.aplicarVisibilidade();
            this.aplicarTamanhos();
        }, 1000);
    }

    renderizarControles() {
        const dashboard = document.getElementById(`dashboard-${this.tipoDemanda}`);
        if (!dashboard) return;

        // Verificar se já existe o painel de controles
        let painelControles = document.getElementById(`controles-graficos-${this.tipoDemanda}`);
        if (painelControles) return;

        // Criar painel de controles
        painelControles = document.createElement('div');
        painelControles.id = `controles-graficos-${this.tipoDemanda}`;
        painelControles.className = 'controles-graficos-painel';
        painelControles.innerHTML = `
            <div class="controles-graficos-header">
                <h3>⚙️ Controles dos Gráficos</h3>
                <button class="btn-toggle-controles" onclick="controleGraficos${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.togglePainel()">
                    <span class="icon-toggle">▼</span>
                </button>
            </div>
            <div class="controles-graficos-conteudo" id="conteudo-controles-${this.tipoDemanda}">
                <div class="controles-secao">
                    <h4>👁️ Mostrar/Ocultar Gráficos</h4>
                    <div class="checkboxes-graficos">
                        ${this.gerarCheckboxes()}
                    </div>
                </div>
                <div class="controles-secao">
                    <h4>📏 Redimensionar Gráficos</h4>
                    <p class="instrucoes">Clique e arraste o canto inferior direito de qualquer gráfico para redimensionar</p>
                </div>
                <div class="controles-secao">
                    <button class="btn-reset" onclick="controleGraficos${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.resetarTudo()">
                        🔄 Resetar Tudo
                    </button>
                </div>
            </div>
        `;

        // Inserir antes dos gráficos
        const graficosContainer = dashboard.querySelector(`.graficos-${this.tipoDemanda}`);
        if (graficosContainer) {
            graficosContainer.parentNode.insertBefore(painelControles, graficosContainer);
        } else {
            dashboard.insertBefore(painelControles, dashboard.firstChild);
        }

        // Adicionar listeners de redimensionamento
        this.adicionarListenersRedimensionamento();
    }

    gerarCheckboxes() {
        const graficos = this.obterListaGraficos();
        return graficos.map(grafico => `
            <label class="checkbox-grafico">
                <input type="checkbox" 
                       id="checkbox-${grafico.id}-${this.tipoDemanda}"
                       ${this.graficosVisiveis[grafico.id] ? 'checked' : ''}
                       onchange="controleGraficos${this.tipoDemanda.charAt(0).toUpperCase() + this.tipoDemanda.slice(1)}.toggleGrafico('${grafico.id}')">
                <span>${grafico.nome}</span>
            </label>
        `).join('');
    }

    obterListaGraficos() {
        const graficos = [];
        
        if (this.tipoDemanda === 'bacen') {
            graficos.push(
                { id: 'status', nome: 'Status (Pizza)' },
                { id: 'mensal', nome: 'Gráfico Mensal' },
                { id: 'origem', nome: 'Origem' },
                { id: 'prazoBacen', nome: 'Prazo BACEN' },
                { id: 'cobranca', nome: 'Cobrança (Pizza)' },
                { id: 'casosCriticos', nome: 'Casos Críticos' },
                { id: 'responsavel', nome: 'Responsável' }
            );
        } else if (this.tipoDemanda === 'n2') {
            graficos.push(
                { id: 'status', nome: 'Status (Pizza)' },
                { id: 'mensal', nome: 'Gráfico Mensal' },
                { id: 'origem', nome: 'Origem' },
                { id: 'cobranca', nome: 'Cobrança (Pizza)' },
                { id: 'casosCriticos', nome: 'Casos Críticos' },
                { id: 'responsavel', nome: 'Responsável' }
            );
        } else if (this.tipoDemanda === 'chatbot') {
            graficos.push(
                { id: 'status', nome: 'Status (Pizza)' },
                { id: 'canal', nome: 'Canal' },
                { id: 'satisfacao', nome: 'Satisfação' },
                { id: 'mensal', nome: 'Gráfico Mensal' },
                { id: 'produto', nome: 'Produto' },
                { id: 'cobranca', nome: 'Cobrança (Pizza)' },
                { id: 'casosCriticos', nome: 'Casos Críticos' }
            );
        }
        
        return graficos;
    }

    toggleGrafico(graficoId) {
        const checkbox = document.getElementById(`checkbox-${graficoId}-${this.tipoDemanda}`);
        this.graficosVisiveis[graficoId] = checkbox.checked;
        this.salvarPreferencias();
        this.aplicarVisibilidade();
    }

    aplicarVisibilidade() {
        const graficos = this.obterListaGraficos();
        graficos.forEach(grafico => {
            const container = this.obterContainerGrafico(grafico.id);
            if (container) {
                if (this.graficosVisiveis[grafico.id]) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            } else {
                // Gráfico ainda não foi renderizado, será aplicado quando renderizar
                console.debug(`⏳ Gráfico ${grafico.id} ainda não renderizado, visibilidade será aplicada depois`);
            }
        });
    }

    obterContainerGrafico(graficoId) {
        const mapeamento = {
            'status': `grafico-status-${this.tipoDemanda}`,
            'mensal': `grafico-mensal-${this.tipoDemanda}`,
            'origem': `grafico-origem-${this.tipoDemanda}`,
            'prazoBacen': `grafico-prazo-bacen-${this.tipoDemanda}`,
            'cobranca': `grafico-cobranca-${this.tipoDemanda}`,
            'casosCriticos': `grafico-casos-criticos-${this.tipoDemanda}`,
            'responsavel': `grafico-responsavel-${this.tipoDemanda}`,
            'canal': `grafico-canais-${this.tipoDemanda}`,
            'satisfacao': `grafico-satisfacao-${this.tipoDemanda}`,
            'produto': `grafico-produto-${this.tipoDemanda}`
        };

        const id = mapeamento[graficoId];
        if (!id) {
            console.warn(`⚠️ ID de gráfico não encontrado para: ${graficoId}`);
            return null;
        }

        // Procurar pelo elemento do gráfico
        const elemento = document.getElementById(id);
        if (!elemento) {
            // Gráfico ainda não foi renderizado
            return null;
        }

        // Procurar pelo card do gráfico
        const card = elemento.closest('.grafico-card');
        return card || elemento;
    }

    adicionarListenersRedimensionamento() {
        // FUNCIONALIDADE DE RESIZE REMOVIDA
        // Agora os gráficos só podem ser expandidos via botão "Expandir" que abre modal
        console.log('ℹ️ Redimensionamento por arrastar desabilitado. Use o botão "Expandir" para ver gráficos maiores.');
    }

    tornarResizavel(elemento) {
        // FUNCIONALIDADE REMOVIDA - não fazer nada
        // Os gráficos agora só podem ser expandidos via modal
        return;
    }

    obterIdGraficoDoElemento(elemento) {
        const id = elemento.id || elemento.querySelector('[id^="grafico-"]')?.id;
        if (!id) return null;
        
        // Extrair tipo do gráfico do ID
        const match = id.match(/grafico-([^-]+)/);
        return match ? match[1] : null;
    }

    aplicarTamanhos() {
        Object.keys(this.tamanhosGraficos).forEach(graficoId => {
            const tamanho = this.tamanhosGraficos[graficoId];
            const container = this.obterContainerGrafico(graficoId);
            if (container && tamanho) {
                container.style.width = tamanho.width + 'px';
                container.style.height = tamanho.height + 'px';
            }
        });
    }

    togglePainel() {
        const conteudo = document.getElementById(`conteudo-controles-${this.tipoDemanda}`);
        const icon = document.querySelector(`#controles-graficos-${this.tipoDemanda} .icon-toggle`);
        
        if (conteudo.style.display === 'none') {
            conteudo.style.display = 'block';
            icon.textContent = '▼';
        } else {
            conteudo.style.display = 'none';
            icon.textContent = '▶';
        }
    }

    resetarTudo() {
        if (confirm('Deseja resetar todas as preferências de gráficos?')) {
            this.graficosVisiveis = {};
            this.tamanhosGraficos = {};
            this.obterListaGraficos().forEach(g => {
                this.graficosVisiveis[g.id] = true;
            });
            localStorage.removeItem(`graficos_visiveis_${this.tipoDemanda}`);
            localStorage.removeItem(`tamanhos_graficos_${this.tipoDemanda}`);
            location.reload();
        }
    }
}

