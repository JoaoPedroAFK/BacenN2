/* === GERENCIADOR DE FICHAS POR PERFIL VELOTAX === */

class GerenciadorFichasPerfil {
    constructor() {
        this.fichas = this.carregarFichas();
        this.historicoAlteracoes = this.carregarHistorico();
        this.inicializar();
    }

    inicializar() {
        this.adicionarEstilos();
    }

    // === CARREGAR FICHAS ===
    carregarFichas() {
        // Carrega fichas de todos os tipos
        // Usar chaves novas e antigas para compatibilidade
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        // Usar chaves novas e antigas para compatibilidade
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        
        // Adiciona tipo a cada ficha
        const todasFichas = [
            ...fichasBacen.map(f => ({ ...f, tipoDemanda: 'bacen' })),
            ...fichasN2.map(f => ({ ...f, tipoDemanda: 'n2' })),
            ...fichasChatbot.map(f => ({ ...f, tipoDemanda: 'chatbot' }))
        ];

        // Carrega também fichas antigas (compatibilidade)
        const fichasAntigas = JSON.parse(localStorage.getItem('bacen-complaints') || '[]');
        fichasAntigas.forEach(f => {
            if (!f.tipoDemanda) {
                f.tipoDemanda = this.identificarTipoDemanda(f);
            }
        });

        return [...todasFichas, ...fichasAntigas];
    }

    // === IDENTIFICAR TIPO DE DEMANDA ===
    identificarTipoDemanda(ficha) {
        // Verifica campos específicos
        if (ficha.moduloContato?.n2 || ficha['N2 Portabilidade?'] === 'TRUE') {
            return 'n2';
        }
        
        if (ficha['Canal Chatbot'] || ficha['Resolvido Automaticamente?']) {
            return 'chatbot';
        }
        
        // Padrão: BACEN
        return 'bacen';
    }

    // === OBTER FICHAS POR PERFIL ===
    obterFichasPorPerfil() {
        const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
        
        if (!usuarioAtual) {
            return [];
        }

        // Admin vê todas
        if (usuarioAtual.perfil === 'administrador') {
            return this.fichas;
        }

        // Operador vê apenas seus tipos atribuídos
        if (usuarioAtual.perfil === 'operador') {
            const tiposPermitidos = usuarioAtual.tiposDemanda || [];
            return this.fichas.filter(f => tiposPermitidos.includes(f.tipoDemanda));
        }

        // Atendente e Usuário vêem todas (com restrições de edição)
        return this.fichas;
    }

    // === OBTER FICHAS POR TIPO ===
    obterFichasPorTipo(tipo) {
        return this.fichas.filter(f => f.tipoDemanda === tipo);
    }

    // === ADICIONAR FICHA ===
    adicionarFicha(ficha) {
        // Identifica tipo se não estiver definido
        if (!ficha.tipoDemanda) {
            ficha.tipoDemanda = this.identificarTipoDemanda(ficha);
        }

        // Adiciona metadados
        ficha.id = ficha.id || this.gerarId();
        ficha.dataCriacao = ficha.dataCriacao || new Date().toISOString();
        ficha.dataAtualizacao = new Date().toISOString();
        ficha.criadoPor = window.sistemaPerfis?.usuarioAtual?.email || 'sistema';
        ficha.ultimaAlteracaoPor = window.sistemaPerfis?.usuarioAtual?.email || 'sistema';

        // Adiciona à lista
        this.fichas.push(ficha);

        // Salva no storage específico do tipo
        this.salvarFichaPorTipo(ficha);

        // Registra no histórico
        this.registrarAlteracao(ficha.id, 'criacao', ficha);

        return ficha;
    }

    // === ATUALIZAR FICHA ===
    atualizarFicha(id, dadosAtualizados) {
        const index = this.fichas.findIndex(f => f.id === id);
        
        if (index === -1) {
            throw new Error('Ficha não encontrada');
        }

        // Verifica permissão
        const ficha = this.fichas[index];
        if (!this.podeEditarFicha(ficha)) {
            throw new Error('Sem permissão para editar esta ficha');
        }

        // Salva dados antigos para histórico
        const dadosAntigos = { ...ficha };

        // Atualiza ficha
        this.fichas[index] = {
            ...ficha,
            ...dadosAtualizados,
            id: ficha.id, // Mantém ID original
            tipoDemanda: ficha.tipoDemanda, // Mantém tipo
            dataCriacao: ficha.dataCriacao, // Mantém data criação
            dataAtualizacao: new Date().toISOString(),
            ultimaAlteracaoPor: window.sistemaPerfis?.usuarioAtual?.email || 'sistema'
        };

        // Salva no storage
        this.salvarFichaPorTipo(this.fichas[index]);

        // Registra no histórico
        this.registrarAlteracao(id, 'edicao', this.fichas[index], dadosAntigos);

        return this.fichas[index];
    }

    // === EXCLUIR FICHA ===
    excluirFicha(id) {
        const index = this.fichas.findIndex(f => f.id === id);
        
        if (index === -1) {
            throw new Error('Ficha não encontrada');
        }

        const ficha = this.fichas[index];

        // Verifica permissão
        if (!this.podeExcluirFicha(ficha)) {
            throw new Error('Sem permissão para excluir esta ficha');
        }

        // Remove da lista
        this.fichas.splice(index, 1);

        // Remove do storage específico
        this.removerFichaPorTipo(ficha);

        // Registra no histórico
        this.registrarAlteracao(id, 'exclusao', null, ficha);

        return true;
    }

    // === VERIFICAR PERMISSÕES ===
    podeEditarFicha(ficha) {
        const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
        
        if (!usuarioAtual) return false;

        // Admin pode editar todas
        if (usuarioAtual.perfil === 'administrador') {
            return true;
        }

        // Operador pode editar apenas seus tipos
        if (usuarioAtual.perfil === 'operador') {
            const tiposPermitidos = usuarioAtual.tiposDemanda || [];
            return tiposPermitidos.includes(ficha.tipoDemanda);
        }

        // Atendente pode editar todas
        if (usuarioAtual.perfil === 'atendente') {
            return true;
        }

        // Usuário não pode editar
        return false;
    }

    podeExcluirFicha(ficha) {
        const usuarioAtual = window.sistemaPerfis?.usuarioAtual;
        
        if (!usuarioAtual) return false;

        // Apenas admin e atendente podem excluir
        return ['administrador', 'atendente'].includes(usuarioAtual.perfil);
    }

    // === SALVAR FICHA POR TIPO ===
    salvarFichaPorTipo(ficha) {
        const tipo = ficha.tipoDemanda || 'bacen';
        const chave = `velotax_demandas_${tipo}`;
        
        // Obtém fichas do tipo
        let fichasTipo = this.fichas.filter(f => f.tipoDemanda === tipo);
        
        // Remove a ficha atual se já existir
        fichasTipo = fichasTipo.filter(f => f.id !== ficha.id);
        
        // Adiciona a ficha atualizada
        fichasTipo.push(ficha);
        
        // Salva no localStorage
        localStorage.setItem(chave, JSON.stringify(fichasTipo));
    }

    // === REMOVER FICHA POR TIPO ===
    removerFichaPorTipo(ficha) {
        const tipo = ficha.tipoDemanda || 'bacen';
        const chave = `velotax_demandas_${tipo}`;
        
        // Obtém fichas do tipo
        let fichasTipo = this.fichas.filter(f => f.tipoDemanda === tipo);
        
        // Remove a ficha
        fichasTipo = fichasTipo.filter(f => f.id !== ficha.id);
        
        // Salva no localStorage
        localStorage.setItem(chave, JSON.stringify(fichasTipo));
    }

    // === HISTÓRICO DE ALTERAÇÕES ===
    registrarAlteracao(fichaId, tipoAlteracao, dadosNovos, dadosAntigos = null) {
        const registro = {
            id: this.gerarId(),
            fichaId: fichaId,
            tipoAlteracao: tipoAlteracao, // 'criacao', 'edicao', 'exclusao'
            usuario: window.sistemaPerfis?.usuarioAtual?.email || 'sistema',
            dataHora: new Date().toISOString(),
            dadosNovos: dadosNovos,
            dadosAntigos: dadosAntigos,
            alteracoes: this.calcularDiferencas(dadosAntigos, dadosNovos)
        };

        this.historicoAlteracoes.push(registro);
        this.salvarHistorico();

        return registro;
    }

    calcularDiferencas(dadosAntigos, dadosNovos) {
        if (!dadosAntigos || !dadosNovos) return [];

        const alteracoes = [];
        const campos = Object.keys(dadosNovos);

        campos.forEach(campo => {
            if (campo === 'dataAtualizacao' || campo === 'ultimaAlteracaoPor') {
                return; // Ignora campos de metadados
            }

            const valorAntigo = dadosAntigos[campo];
            const valorNovo = dadosNovos[campo];

            if (JSON.stringify(valorAntigo) !== JSON.stringify(valorNovo)) {
                alteracoes.push({
                    campo: campo,
                    valorAntigo: valorAntigo,
                    valorNovo: valorNovo
                });
            }
        });

        return alteracoes;
    }

    obterHistoricoFicha(fichaId) {
        return this.historicoAlteracoes
            .filter(h => h.fichaId === fichaId)
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    }

    // === CARREGAR E SALVAR HISTÓRICO ===
    carregarHistorico() {
        return JSON.parse(localStorage.getItem('velotax_historico_alteracoes') || '[]');
    }

    salvarHistorico() {
        // Mantém apenas últimos 1000 registros
        if (this.historicoAlteracoes.length > 1000) {
            this.historicoAlteracoes = this.historicoAlteracoes.slice(-1000);
        }
        
        localStorage.setItem('velotax_historico_alteracoes', JSON.stringify(this.historicoAlteracoes));
    }

    // === ESTATÍSTICAS ===
    obterEstatisticas() {
        const fichasVisiveis = this.obterFichasPorPerfil();
        
        return {
            total: fichasVisiveis.length,
            porTipo: {
                bacen: fichasVisiveis.filter(f => f.tipoDemanda === 'bacen').length,
                n2: fichasVisiveis.filter(f => f.tipoDemanda === 'n2').length,
                chatbot: fichasVisiveis.filter(f => f.tipoDemanda === 'chatbot').length
            },
            porStatus: {
                'nao-iniciado': fichasVisiveis.filter(f => f.status === 'nao-iniciado').length,
                'em-tratativa': fichasVisiveis.filter(f => f.status === 'em-tratativa').length,
                'concluido': fichasVisiveis.filter(f => f.status === 'concluido').length,
                'respondido': fichasVisiveis.filter(f => f.status === 'respondido').length
            }
        };
    }

    // === UTILITÁRIOS ===
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    adicionarEstilos() {
        const estilos = `
            <style id="estilos-gerenciador-fichas">
                .ficha-perfil-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-left: 8px;
                }
                
                .ficha-perfil-badge.bacen {
                    background: #1634FF;
                    color: white;
                }
                
                .ficha-perfil-badge.n2 {
                    background: #1DFDB9;
                    color: #000058;
                }
                
                .ficha-perfil-badge.chatbot {
                    background: #FF8400;
                    color: white;
                }
            </style>
        `;

        if (!document.getElementById('estilos-gerenciador-fichas')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }
}

// Inicializa o gerenciador
let gerenciadorFichas;
document.addEventListener('DOMContentLoaded', () => {
    gerenciadorFichas = new GerenciadorFichasPerfil();
});

// Exporta para uso global
window.GerenciadorFichasPerfil = GerenciadorFichasPerfil;
window.gerenciadorFichas = gerenciadorFichas;

