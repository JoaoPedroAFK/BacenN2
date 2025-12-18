/* === FICHAS ESPECÍFICAS POR TIPO DE DEMANDA === */

class FichasEspecificas {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.adicionarEstilos();
    }

    // === FICHA BACEN ===
    criarFichaBacen(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🏦 Reclamação BACEN - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Origem:</label>
                                <span class="ficha-valor editavel" data-campo="origem">${dados.origem || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Motivo da Reclamação:</label>
                                <span class="ficha-valor editavel" data-campo="motivoDetalhado">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Prazo BACEN:</label>
                                <span class="ficha-valor editavel" data-campo="prazoBacen">${this.formatarData(dados.prazoBacen || dados.prazoRetorno)}</span>
                            </div>
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-bacen-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>🏦 Campos Específicos BACEN</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Acionou a central?</label>
                                <span class="ficha-valor editavel" data-campo="acionouCentral">${dados.acionouCentral ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>BACEN?</label>
                                <span class="ficha-valor editavel" data-campo="bacen">${dados.bacen ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Procon?</label>
                                <span class="ficha-valor editavel" data-campo="procon">${dados.procon ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído"]'>${dados.pixStatus === 'Liberado' ? 'Liberado' : dados.pixStatus === 'Excluído' ? 'Excluído' : dados.pixLiberado ? 'Liberado' : 'Excluído'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Aceitou liquidação Antecipada?</label>
                                <span class="ficha-valor editavel" data-campo="liquidacaoAntecipada">${dados.liquidacaoAntecipada ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status">${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                </div>
            </div>
        `;
    }

    // === FICHA N2 ===
    criarFichaN2(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🔄 Reclamação N2 - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Origem:</label>
                                <span class="ficha-valor editavel" data-campo="origem">${dados.origem || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <!-- Removido: Motivo da Reclamação e Prazo N2 (não existem mais em N2) -->
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-n2-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>🔄 Campos Específicos N2</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>N2 Portabilidade?</label>
                                <span class="ficha-valor editavel" data-campo="n2Portabilidade">${dados.n2Portabilidade ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Acionou a central?</label>
                                <span class="ficha-valor editavel" data-campo="acionouCentral">${dados.acionouCentral ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Banco Origem:</label>
                                <span class="ficha-valor editavel" data-campo="bancoOrigem">${dados.bancoOrigem || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Banco Destino:</label>
                                <span class="ficha-valor editavel" data-campo="bancoDestino">${dados.bancoDestino || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Status Portabilidade:</label>
                                <span class="ficha-valor editavel" data-campo="statusPortabilidade">${dados.statusPortabilidade || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído"]'>${dados.pixStatus === 'Liberado' ? 'Liberado' : dados.pixStatus === 'Excluído' ? 'Excluído' : dados.pixLiberado ? 'Liberado' : 'Excluído'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status">${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                </div>
            </div>
        `;
    }

    // === FICHA CHATBOT ===
    criarFichaChatbot(dados) {
        return `
            <div class="ficha-detalhada-container">
                <div class="ficha-header">
                    <div class="ficha-titulo">
                        <h2>🤖 Reclamação Chatbot - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
                        <button class="btn-fechar" onclick="fichasEspecificas.fecharFicha()">✕</button>
                    </div>
                    <div class="ficha-status">
                        <span class="status-badge status-${dados.status || 'nao-iniciado'}">
                            ${this.formatarStatus(dados.status)}
                        </span>
                    </div>
                </div>

                <div class="ficha-conteudo-scroll">
                    <div class="ficha-secao">
                        <h3>📋 Dados Básicos</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Data de Entrada:</label>
                                <span class="ficha-valor editavel" data-campo="dataEntrada">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Finalizado em:</label>
                                <span class="ficha-valor editavel" data-campo="finalizadoEm">${this.formatarData(dados.finalizadoEm)}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Responsável:</label>
                                <span class="ficha-valor editavel" data-campo="responsavel">${dados.responsavel || 'Não atribuído'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>👤 Dados do Cliente</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Nome Completo:</label>
                                <span class="ficha-valor editavel" data-campo="nomeCompleto">${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>CPF:</label>
                                <span class="ficha-valor editavel" data-campo="cpf">${dados.cpf || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Telefone:</label>
                                <span class="ficha-valor editavel" data-campo="telefone">${dados.telefone || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Origem:</label>
                                <span class="ficha-valor editavel" data-campo="origem">${dados.origem || 'Não informado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>🎯 Detalhes da Reclamação</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Motivo Reduzido:</label>
                                <span class="ficha-valor editavel" data-campo="motivoReduzido">${dados.motivoReduzido || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Motivo da Reclamação:</label>
                                <span class="ficha-valor editavel" data-campo="motivoDetalhado">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Prazo Resposta:</label>
                                <span class="ficha-valor editavel" data-campo="prazoResposta">${this.formatarData(dados.prazoResposta || dados.prazoRetorno)}</span>
                            </div>
                        </div>
                        ${dados.anexos && dados.anexos.length > 0 ? `
                            <div class="ficha-item full-width">
                                <label>📎 Anexos (${dados.anexos.length}):</label>
                                <div id="anexos-ficha-chatbot-${dados.id}" class="anexos-exibicao-container"></div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="ficha-secao">
                        <h3>🤖 Campos Específicos Chatbot</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Canal Chatbot:</label>
                                <span class="ficha-valor editavel" data-campo="canalChatbot">${dados.canalChatbot || 'Não informado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Satisfação (1-5):</label>
                                <span class="ficha-valor editavel" data-campo="satisfacao">${dados.satisfacao ? '⭐'.repeat(parseInt(dados.satisfacao)) + ' (' + dados.satisfacao + ')' : 'Não avaliado'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Resolvido Automaticamente?</label>
                                <span class="ficha-valor editavel" data-campo="resolvidoAutomaticamente">${dados.resolvidoAutomaticamente ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Encaminhado para Humano?</label>
                                <span class="ficha-valor editavel" data-campo="encaminhadoHumano">${dados.encaminhadoHumano ? 'Sim' : 'Não'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>PIX liberado ou excluído?</label>
                                <span class="ficha-valor editavel" data-campo="pixStatus" data-tipo="select" data-opcoes='["Liberado","Excluído"]'>${dados.pixStatus === 'Liberado' ? 'Liberado' : dados.pixStatus === 'Excluído' ? 'Excluído' : dados.pixLiberado ? 'Liberado' : 'Excluído'}</span>
                            </div>
                            <div class="ficha-item">
                                <label>Enviar para cobrança?</label>
                                <span class="ficha-valor editavel" data-campo="enviarCobranca">${dados.enviarCobranca ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ficha-secao">
                        <h3>✅ Resolução</h3>
                        <div class="ficha-grid">
                            <div class="ficha-item">
                                <label>Status:</label>
                                <span class="ficha-valor editavel" data-campo="status">${this.formatarStatus(dados.status)}</span>
                            </div>
                            <div class="ficha-item">
                            </div>
                            <div class="ficha-item full-width">
                                <label>Observações:</label>
                                <span class="ficha-valor editavel" data-campo="observacoes">${dados.observacoes || 'Nenhuma observação'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ficha-rodape">
                    <button class="velohub-btn btn-primary" onclick="fichasEspecificas.toggleEdicao()">
                        ✏️ Editar Reclamação
                    </button>
                    <button class="velohub-btn btn-secondary" onclick="fichasEspecificas.salvarFicha()">
                        💾 Salvar Alterações
                    </button>
                    <button class="velohub-btn" style="background: #1DFDB9; color: #000058;" onclick="fichasEspecificas.copiarParaEmail()">
                        📧 Copiar para Email
                    </button>
                </div>
            </div>
        `;
    }

    // === ABRIR FICHA ===
    abrirFicha(dados) {
        this.fichaAtual = dados;
        this.modoEdicao = false;
        
        const tipo = dados.tipoDemanda || 'bacen';
        let conteudo = '';
        
        if (tipo === 'bacen') {
            conteudo = this.criarFichaBacen(dados);
        } else if (tipo === 'n2') {
            conteudo = this.criarFichaN2(dados);
        } else if (tipo === 'chatbot') {
            conteudo = this.criarFichaChatbot(dados);
        } else {
            conteudo = this.criarFichaBacen(dados); // Fallback
        }
        
        const modal = document.createElement('div');
        modal.className = 'ficha-modal';
        modal.innerHTML = `
            <div class="ficha-modal-overlay" onclick="fichasEspecificas.fecharFicha()"></div>
            <div class="ficha-modal-content">
                ${conteudo}
            </div>
        `;

        document.body.appendChild(modal);
        // NÃO bloqueia o scroll do body, apenas do modal
        
        // Exibir anexos após criar a ficha
        setTimeout(() => {
            if (dados.anexos && dados.anexos.length > 0 && window.gerenciadorAnexos) {
                const tipo = dados.tipoDemanda || 'bacen';
                const containerId = `anexos-ficha-${tipo}-${dados.id}`;
                window.gerenciadorAnexos.exibirAnexosNaFicha(dados.anexos, containerId);
            }
        }, 100);
    }

    // === FECHAR FICHA ===
    fecharFicha() {
        const modal = document.querySelector('.ficha-modal');
        if (modal) {
            modal.remove();
        }
        this.fichaAtual = null;
        this.modoEdicao = false;
    }

    // === TOGGLE EDIÇÃO ===
    toggleEdicao() {
        this.modoEdicao = !this.modoEdicao;
        const valores = document.querySelectorAll('.ficha-valor.editavel');
        
        valores.forEach(elemento => {
            if (this.modoEdicao) {
                elemento.contentEditable = 'true';
                elemento.classList.add('editando');
                elemento.setAttribute('tabindex', '0');
                
                // Para campos de data, converte para input
                const campo = elemento.dataset.campo;
                const tipo = elemento.dataset.tipo;
                
                // Campo PIX com select
                if (campo === 'pixStatus' && tipo === 'select') {
                    const valorAtual = elemento.textContent.trim();
                    const opcoes = JSON.parse(elemento.dataset.opcoes || '["Liberado","Excluído"]');
                    let optionsHTML = opcoes.map(op => {
                        const selected = valorAtual === op ? 'selected' : '';
                        return `<option value="${op}" ${selected}>${op}</option>`;
                    }).join('');
                    elemento.innerHTML = `<select style="width: 100%; padding: 4px; border: 1px solid var(--azul-royal); border-radius: 4px; font-family: 'Poppins', sans-serif;">${optionsHTML}</select>`;
                } else if (campo && (campo.includes('data') || campo.includes('Data') || campo.includes('prazo') || campo.includes('Prazo'))) {
                    const valorAtual = elemento.textContent.trim();
                    if (valorAtual && valorAtual !== 'Não informada' && valorAtual !== 'Não informado') {
                        // Tenta converter data BR para formato input
                        const dataBR = valorAtual.split('/');
                        if (dataBR.length === 3) {
                            const dataISO = `${dataBR[2]}-${dataBR[1].padStart(2, '0')}-${dataBR[0].padStart(2, '0')}`;
                            elemento.innerHTML = `<input type="date" value="${dataISO}" style="width: 100%; padding: 4px; border: 1px solid var(--azul-royal); border-radius: 4px;">`;
                        }
                    } else {
                        elemento.innerHTML = `<input type="date" style="width: 100%; padding: 4px; border: 1px solid var(--azul-royal); border-radius: 4px;">`;
                    }
                }
            } else {
                elemento.contentEditable = 'false';
                elemento.classList.remove('editando');
                elemento.removeAttribute('tabindex');
                
                // Restaura texto de inputs de data ou select
                const input = elemento.querySelector('input[type="date"]');
                const select = elemento.querySelector('select');
                
                if (select) {
                    elemento.textContent = select.value;
                } else if (input) {
                    const dataISO = input.value;
                    if (dataISO) {
                        const [ano, mes, dia] = dataISO.split('-');
                        elemento.textContent = `${dia}/${mes}/${ano}`;
                    } else {
                        elemento.textContent = 'Não informada';
                    }
                }
            }
        });
        
        const btnEditar = document.querySelector('.ficha-rodape .btn-primary');
        if (btnEditar) {
            btnEditar.textContent = this.modoEdicao ? '✏️ Cancelar Edição' : '✏️ Editar Ficha';
        }
    }

    // === SALVAR FICHA ===
    salvarFicha() {
        if (!this.fichaAtual) return;
        
        const valores = document.querySelectorAll('.ficha-valor.editavel');
        const alteracoes = {};
        
        valores.forEach(elemento => {
            const campo = elemento.dataset.campo;
            const valorAntigo = this.fichaAtual[campo];
            let valorNovo;
            
            // Verifica se é um input de data ou select
            const input = elemento.querySelector('input[type="date"]');
            const select = elemento.querySelector('select');
            
            if (select) {
                valorNovo = select.value;
            } else if (input) {
                const dataISO = input.value;
                if (dataISO) {
                    valorNovo = dataISO; // Mantém formato ISO para salvar
                } else {
                    valorNovo = null;
                }
            } else {
                valorNovo = elemento.textContent.trim();
            }
            
            // Converte valores booleanos (exceto pixStatus que agora é string)
            if (campo !== 'pixStatus' && ['acionouCentral', 'bacen', 'procon', 'pixLiberado', 'liquidacaoAntecipada', 
                 'enviarCobranca', 'n2Portabilidade', 'resolvidoAutomaticamente', 'encaminhadoHumano'].includes(campo)) {
                valorNovo = valorNovo.toLowerCase() === 'sim' || valorNovo === true || valorNovo === 'true';
            }
            
            // Para pixStatus, mantém como string e também atualiza pixLiberado para compatibilidade
            if (campo === 'pixStatus') {
                this.fichaAtual.pixLiberado = valorNovo === 'Liberado';
            }
            
            // Converte datas de formato BR para ISO se necessário
            if (campo && (campo.includes('data') || campo.includes('Data') || campo.includes('prazo') || campo.includes('Prazo'))) {
                if (valorNovo && !valorNovo.includes('-') && valorNovo.includes('/')) {
                    const [dia, mes, ano] = valorNovo.split('/');
                    if (dia && mes && ano) {
                        valorNovo = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
                    }
                }
            }
            
            if (valorNovo !== valorAntigo && valorNovo !== '') {
                alteracoes[campo] = valorNovo;
                this.fichaAtual[campo] = valorNovo;
            }
        });
        
        if (Object.keys(alteracoes).length > 0) {
            // Salva via gerenciador
            if (window.gerenciadorFichas) {
                window.gerenciadorFichas.adicionarFicha(this.fichaAtual);
            }
            
            this.mostrarNotificacao('Ficha salva com sucesso!', 'sucesso');
            this.toggleEdicao();
            
            // Recarrega a lista se estiver em uma página específica
            setTimeout(() => {
                if (typeof renderizarListaBacen === 'function') renderizarListaBacen();
                if (typeof renderizarListaN2 === 'function') renderizarListaN2();
                if (typeof renderizarListaChatbot === 'function') renderizarListaChatbot();
            }, 500);
        } else {
            this.mostrarNotificacao('Nenhuma alteração detectada', 'info');
        }
    }

    // === COPIAR PARA EMAIL ===
    copiarParaEmail() {
        if (!this.fichaAtual) return;
        
        const tipo = this.fichaAtual.tipoDemanda || 'bacen';
        let emailHTML = '';
        
        if (tipo === 'bacen') {
            emailHTML = this.formatarEmailBacen(this.fichaAtual);
        } else if (tipo === 'n2') {
            emailHTML = this.formatarEmailN2(this.fichaAtual);
        } else if (tipo === 'chatbot') {
            emailHTML = this.formatarEmailChatbot(this.fichaAtual);
        }
        
        // Copia para clipboard usando API moderna ou fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            // Tenta copiar como texto HTML primeiro
            navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([emailHTML], { type: 'text/html' }),
                    'text/plain': new Blob([this.htmlParaTexto(emailHTML)], { type: 'text/plain' })
                })
            ]).then(() => {
                this.mostrarNotificacao('Conteúdo copiado para área de transferência! Cole no seu email.', 'sucesso');
            }).catch(() => {
                // Fallback: copia como texto simples
                this.copiarTextoFallback(emailHTML);
            });
        } else {
            // Fallback para navegadores antigos
            this.copiarTextoFallback(emailHTML);
        }
    }
    
    copiarTextoFallback(html) {
        const textArea = document.createElement('textarea');
        textArea.value = this.htmlParaTexto(html);
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.mostrarNotificacao('Conteúdo copiado! Cole no seu email (formatação HTML preservada).', 'sucesso');
        } catch (err) {
            // Último fallback: abre em nova janela
            const popup = window.open('', '_blank');
            popup.document.write(html);
            this.mostrarNotificacao('Conteúdo aberto em nova janela. Copie manualmente.', 'info');
        }
        
        document.body.removeChild(textArea);
    }
    
    htmlParaTexto(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    formatarEmailBacen(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #1634FF; border-bottom: 2px solid #1634FF; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #1634FF; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🏦 FICHA BACEN - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <div class="campo"><span class="label">Origem:</span> <span class="valor">${dados.origem || 'Não informado'}</span></div>
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">Motivo Reduzido:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <div class="campo"><span class="label">Motivo da Reclamação:</span> <span class="valor">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span></div>
            <div class="campo"><span class="label">Prazo BACEN:</span> <span class="valor"><strong>${this.formatarData(dados.prazoBacen || dados.prazoRetorno)}</strong></span></div>
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🏦 CAMPOS ESPECÍFICOS BACEN</strong></h3>
        <div class="campo"><span class="label">Acionou a central?</span> <span class="valor"><strong>${dados.acionouCentral ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">BACEN?</span> <span class="valor"><strong>${dados.bacen ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Procon?</span> <span class="valor"><strong>${dados.procon ? 'Sim ⚠️' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Aceitou liquidação Antecipada?</span> <span class="valor"><strong>${dados.liquidacaoAntecipada ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas BACEN</p>
</body>
</html>`;
    }
    
    formatarEmailN2(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #1DFDB9; border-bottom: 2px solid #1DFDB9; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #1DFDB9; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🔄 FICHA N2 - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <div class="campo"><span class="label">Origem:</span> <span class="valor">${dados.origem || 'Não informado'}</span></div>
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">Motivo:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <!-- Removido: Motivo da Reclamação e Prazo N2 (não existem mais em N2) -->
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🔄 CAMPOS ESPECÍFICOS N2</strong></h3>
        <div class="campo"><span class="label">N2 Portabilidade?</span> <span class="valor"><strong>${dados.n2Portabilidade ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Acionou a central?</span> <span class="valor"><strong>${dados.acionouCentral ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Banco Origem:</span> <span class="valor"><strong>${dados.bancoOrigem || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Banco Destino:</span> <span class="valor"><strong>${dados.bancoDestino || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Status Portabilidade:</span> <span class="valor"><strong>${dados.statusPortabilidade || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas N2</p>
</body>
</html>`;
    }
    
    formatarEmailChatbot(dados) {
        return `<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #FF8400; border-bottom: 2px solid #FF8400; padding-bottom: 10px; }
        .secao { margin: 20px 0; }
        .campo { margin: 10px 0; }
        .label { font-weight: bold; color: #000058; }
        .valor { margin-left: 10px; }
        .destaque { background: #f0f0f0; padding: 15px; border-left: 4px solid #FF8400; margin: 10px 0; }
    </style>
</head>
<body>
    <h2>🤖 FICHA CHATBOT - ${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</h2>
    
    <div class="secao">
        <h3><strong>📋 DADOS BÁSICOS</strong></h3>
        <div class="campo"><span class="label">Data de Entrada:</span> <span class="valor">${this.formatarData(dados.dataEntrada || dados.dataReclamacao)}</span></div>
        <div class="campo"><span class="label">Finalizado em:</span> <span class="valor">${this.formatarData(dados.finalizadoEm)}</span></div>
        <div class="campo"><span class="label">Responsável:</span> <span class="valor"><strong>${dados.responsavel || 'Não atribuído'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>👤 DADOS DO CLIENTE</strong></h3>
        <div class="campo"><span class="label">Nome Completo:</span> <span class="valor"><strong>${dados.nomeCompleto || dados.nomeCliente || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">CPF:</span> <span class="valor"><strong>${dados.cpf || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Telefone:</span> <span class="valor">${dados.telefone || 'Não informado'}</span></div>
        <div class="campo"><span class="label">Origem:</span> <span class="valor">${dados.origem || 'Não informado'}</span></div>
    </div>
    
    <div class="secao">
        <h3><strong>🎯 DETALHES DA RECLAMAÇÃO</strong></h3>
        <div class="destaque">
            <div class="campo"><span class="label">Motivo Reduzido:</span> <span class="valor"><strong>${dados.motivoReduzido || 'Não informado'}</strong></span></div>
            <div class="campo"><span class="label">Motivo da Reclamação:</span> <span class="valor">${dados.motivoDetalhado || dados.motivoReclamacao || 'Não informado'}</span></div>
            <div class="campo"><span class="label">Prazo Resposta:</span> <span class="valor"><strong>${this.formatarData(dados.prazoResposta || dados.prazoRetorno)}</strong></span></div>
        </div>
    </div>
    
    <div class="secao">
        <h3><strong>🤖 CAMPOS ESPECÍFICOS CHATBOT</strong></h3>
        <div class="campo"><span class="label">Canal Chatbot:</span> <span class="valor"><strong>${dados.canalChatbot || 'Não informado'}</strong></span></div>
        <div class="campo"><span class="label">Satisfação (1-5):</span> <span class="valor"><strong>${dados.satisfacao ? '⭐'.repeat(parseInt(dados.satisfacao)) + ' (' + dados.satisfacao + ')' : 'Não avaliado'}</strong></span></div>
        <div class="campo"><span class="label">Resolvido Automaticamente?</span> <span class="valor"><strong>${dados.resolvidoAutomaticamente ? 'Sim ✅' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Encaminhado para Humano?</span> <span class="valor"><strong>${dados.encaminhadoHumano ? 'Sim 👤' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">PIX liberado ou excluído?</span> <span class="valor"><strong>${dados.pixLiberado ? 'Sim' : 'Não'}</strong></span></div>
        <div class="campo"><span class="label">Enviar para cobrança?</span> <span class="valor"><strong>${dados.enviarCobranca ? 'Sim' : 'Não'}</strong></span></div>
    </div>
    
    <div class="secao">
        <h3><strong>✅ RESOLUÇÃO</strong></h3>
        <div class="campo"><span class="label">Status:</span> <span class="valor"><strong>${this.formatarStatus(dados.status)}</strong></span></div>
        <div class="campo"><span class="label">Observações:</span> <span class="valor">${dados.observacoes || 'Nenhuma observação'}</span></div>
    </div>
    
    <hr>
    <p style="font-size: 0.9em; color: #666;">Sistema Velotax - Gestão de Demandas Chatbot</p>
</body>
</html>`;
    }

    // === UTILITÁRIOS ===
    formatarData(dataString) {
        if (!dataString) return 'Não informada';
        try {
            return new Date(dataString).toLocaleDateString('pt-BR');
        } catch {
            return dataString;
        }
    }
    
    formatarStatus(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'cancelado': 'Cancelado',
            'aguardando': 'Aguardando',
            'finalizado': 'Finalizado'
        };
        return statusMap[status] || status || 'Não informado';
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Cria uma notificação simples
        const notificacao = document.createElement('div');
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'sucesso' ? '#1DFDB9' : tipo === 'erro' ? '#FF00D7' : '#1634FF'};
            color: ${tipo === 'sucesso' ? '#000058' : '#FFFFFF'};
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            max-width: 400px;
        `;
        notificacao.textContent = mensagem;
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.style.opacity = '0';
            notificacao.style.transition = 'opacity 0.3s';
            setTimeout(() => notificacao.remove(), 300);
        }, 3000);
    }

    formatarStatus(status) {
        const statusMap = {
            'nao-iniciado': 'Não Iniciado',
            'em-tratativa': 'Em Tratativa',
            'concluido': 'Concluído',
            'respondido': 'Respondido',
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'cancelado': 'Cancelado',
            'aguardando': 'Aguardando',
            'finalizado': 'Finalizado'
        };
        return statusMap[status] || status || 'Não definido';
    }

    mostrarNotificacao(mensagem, tipo) {
        const notif = document.createElement('div');
        notif.className = `notificacao notificacao-${tipo}`;
        notif.textContent = mensagem;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${tipo === 'sucesso' ? '#1DFDB9' : tipo === 'erro' ? '#FF8400' : '#1634FF'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // === ESTILOS ===
    adicionarEstilos() {
        if (document.getElementById('estilos-fichas-especificas')) return;
        
        const estilos = `
            <style id="estilos-fichas-especificas">
                .ficha-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ficha-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }

                .ficha-modal-content {
                    position: relative;
                    width: 90%;
                    max-width: 1000px;
                    max-height: 90vh;
                    background: var(--cor-container);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 10000;
                }

                .ficha-detalhada-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .ficha-header {
                    background: linear-gradient(135deg, var(--azul-escuro) 0%, var(--azul-royal) 100%);
                    padding: 24px;
                    color: white;
                    flex-shrink: 0;
                }

                .ficha-titulo {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .ficha-titulo h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .btn-fechar {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .btn-fechar:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .ficha-conteudo-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    max-height: calc(90vh - 200px);
                }

                .ficha-secao {
                    margin-bottom: 32px;
                }

                .ficha-secao h3 {
                    color: var(--azul-royal);
                    font-size: 1.2rem;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid var(--borda-clara);
                }

                .ficha-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .ficha-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .ficha-item.full-width {
                    grid-column: 1 / -1;
                }

                .ficha-item label {
                    font-weight: 600;
                    color: var(--texto-secundario);
                    font-size: 0.9rem;
                }

                .ficha-valor {
                    color: var(--texto-principal);
                    font-size: 1rem;
                    padding: 8px;
                    border-radius: 4px;
                    min-height: 24px;
                }

                .ficha-valor.editando {
                    background: var(--cor-container);
                    border: 2px solid var(--azul-royal);
                    outline: none;
                }

                .ficha-valor:focus {
                    outline: 2px solid var(--azul-royal);
                    outline-offset: 2px;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .status-nao-iniciado { background: #ECECEC; color: #272A30; }
                .status-em-tratativa { background: #FF8400; color: white; }
                .status-concluido { background: #1DFDB9; color: #000058; }
                .status-respondido { background: #1634FF; color: white; }

                .ficha-rodape {
                    padding: 16px 24px;
                    background: var(--cor-container);
                    border-top: 1px solid var(--borda-clara);
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    flex-shrink: 0;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', estilos);
    }
}

// Inicializa
let fichasEspecificas;
document.addEventListener('DOMContentLoaded', () => {
    fichasEspecificas = new FichasEspecificas();
    window.fichasEspecificas = fichasEspecificas;
    window.FichasEspecificas = FichasEspecificas;
});

