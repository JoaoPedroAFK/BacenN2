/* === SISTEMA DE ATALHOS DE TECLADO === */

class AtalhosTeclado {
    constructor() {
        this.atalhos = {
            'ctrl+k': () => this.abrirBusca(),
            'ctrl+n': () => this.novaFicha(),
            'escape': () => this.fecharModais(),
            'ctrl+/': () => this.mostrarAjuda()
        };
        this.inicializar();
    }

    inicializar() {
        document.addEventListener('keydown', (e) => {
            const combo = this.obterCombo(e);
            if (this.atalhos[combo]) {
                e.preventDefault();
                this.atalhos[combo]();
            }
        });

        // Mostrar dica de atalhos
        this.criarDicaAtalhos();
    }

    obterCombo(e) {
        let combo = '';
        if (e.ctrlKey || e.metaKey) combo += 'ctrl+';
        if (e.shiftKey) combo += 'shift+';
        if (e.altKey) combo += 'alt+';
        
        const key = e.key.toLowerCase();
        if (key === ' ') combo += 'space';
        else if (key === '/') combo += '/';
        else combo += key;

        return combo;
    }

    abrirBusca() {
        // Focar no campo de busca
        const buscaInputs = document.querySelectorAll('input[type="text"][id^="busca"], input[type="text"][placeholder*="Buscar"]');
        if (buscaInputs.length > 0) {
            buscaInputs[0].focus();
            buscaInputs[0].select();
        } else {
            // Criar busca rápida se não existir
            this.criarBuscaRapida();
        }
    }

    criarBuscaRapida() {
        const modal = document.createElement('div');
        modal.className = 'modal-busca-rapida';
        modal.innerHTML = `
            <div class="modal-busca-rapida-content">
                <div class="modal-busca-rapida-header">
                    <h3>🔍 Busca Rápida</h3>
                    <button onclick="this.closest('.modal-busca-rapida').remove()">✕</button>
                </div>
                <input type="text" 
                       id="busca-rapida-input" 
                       placeholder="Digite para buscar..."
                       autofocus>
                <div class="busca-rapida-resultados" id="busca-rapida-resultados"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = document.getElementById('busca-rapida-input');
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.executarBuscaRapida(input.value);
            }
        });
    }

    executarBuscaRapida(termo) {
        // Buscar em todas as fichas
        // Buscar em todas as demandas (usando chaves novas e antigas para compatibilidade)
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');

        const todasFichas = [
            ...fichasBacen.map(f => ({ ...f, tipo: 'bacen', pagina: 'bacen.html' })),
            ...fichasN2.map(f => ({ ...f, tipo: 'n2', pagina: 'n2.html' })),
            ...fichasChatbot.map(f => ({ ...f, tipo: 'chatbot', pagina: 'chatbot.html' }))
        ];

        const termoLower = termo.toLowerCase();
        const resultados = todasFichas.filter(ficha => {
            return (
                (ficha.nomeCompleto || ficha.nomeCliente || '').toLowerCase().includes(termoLower) ||
                (ficha.cpf || '').includes(termo) ||
                (ficha.motivoReduzido || '').toLowerCase().includes(termoLower) ||
                (ficha.id || '').toString().includes(termo)
            );
        }).slice(0, 10);

        const container = document.getElementById('busca-rapida-resultados');
        if (container) {
            if (resultados.length === 0) {
                container.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            } else {
                container.innerHTML = resultados.map(ficha => `
                    <div class="resultado-busca-rapida" onclick="window.location.href='${ficha.pagina}#ficha-${ficha.id}'">
                        <strong>${ficha.nomeCompleto || ficha.nomeCliente || 'Sem nome'}</strong>
                        <span class="tipo-badge">${ficha.tipo.toUpperCase()}</span>
                        <p>${ficha.motivoReduzido || ''}</p>
                    </div>
                `).join('');
            }
        }
    }

    novaFicha() {
        // Detectar qual página está aberta
        const path = window.location.pathname;
        if (path.includes('bacen.html')) {
            mostrarSecao('nova-ficha-bacen');
        } else if (path.includes('n2.html')) {
            mostrarSecao('nova-ficha-n2');
        } else if (path.includes('chatbot.html')) {
            mostrarSecao('nova-ficha-chatbot');
        }
    }

    fecharModais() {
        // Fechar modais abertos
        const modais = document.querySelectorAll('.modal, .ficha-modal, .modal-historico, .modal-busca-rapida');
        modais.forEach(modal => modal.remove());
    }

    mostrarAjuda() {
        // Remover popup existente se houver
        const popupExistente = document.getElementById('popup-atalhos');
        if (popupExistente) {
            popupExistente.remove();
        }
        
        const popup = document.createElement('div');
        popup.id = 'popup-atalhos';
        popup.className = 'popup-atalhos';
        popup.innerHTML = `
            <div class="popup-atalhos-content">
                <div class="popup-atalhos-header">
                    <h3>⌨️ Atalhos de Teclado</h3>
                </div>
                <div class="atalhos-lista">
                    <div class="atalho-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>Abrir busca rápida</span>
                    </div>
                    <div class="atalho-item">
                        <kbd>Ctrl</kbd> + <kbd>N</kbd>
                        <span>Nova Reclamação</span>
                    </div>
                    <div class="atalho-item">
                        <kbd>Esc</kbd>
                        <span>Fechar modais</span>
                    </div>
                    <div class="atalho-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd>
                        <span>Mostrar esta ajuda</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        
        let timeoutId;
        const iniciarTimeout = () => {
            timeoutId = setTimeout(() => {
                if (popup && !popup.matches(':hover')) {
                    popup.style.opacity = '0';
                    setTimeout(() => popup.remove(), 300);
                }
            }, 5000);
        };
        
        popup.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });
        
        popup.addEventListener('mouseleave', () => {
            iniciarTimeout();
        });
        
        iniciarTimeout();
    }

    criarDicaAtalhos() {
        // Adicionar dica no footer ou header
        const dica = document.createElement('div');
        dica.className = 'dica-atalhos';
        dica.innerHTML = `
            <span>💡 Pressione <kbd>Ctrl</kbd> + <kbd>/</kbd> para ver atalhos</span>
        `;
        dica.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--azul-royal);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            cursor: pointer;
        `;
        dica.onclick = () => this.mostrarAjuda();
        document.body.appendChild(dica);
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.atalhosTeclado = new AtalhosTeclado();
}














