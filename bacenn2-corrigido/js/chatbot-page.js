/* === SISTEMA DE GESTÃO CHATBOT - PÁGINA ESPECÍFICA === */
/* VERSÃO: v2.6.0 | DATA: 2025-02-01 | ALTERAÇÕES: Adicionar recarregamento automático de gráficos após importação e salvamento de reclamações */

console.log('📦 [chatbot-page.js] Script carregado!');

// REMOVER STUBS - as funções completas serão definidas abaixo e atribuídas diretamente
// Não criar stubs para evitar confusão - as funções serão definidas antes de serem chamadas

// Variáveis globais
let fichasChatbot = [];
// Função helper para atualizar fichasChatbot e window.fichasChatbot simultaneamente
function atualizarFichasChatbot(novasFichas) {
    fichasChatbot = novasFichas;
    window.fichasChatbot = fichasChatbot;
    return fichasChatbot;
}
// Expor no window para acesso global
window.fichasChatbot = fichasChatbot;

// === DECLARAÇÃO ANTECIPADA DAS FUNÇÕES ===
// Declarar variáveis para as funções (serão atribuídas mais abaixo)
let renderizarListaChatbot, renderizarMinhasReclamacoesChatbot;

// === NAVEGAÇÃO ===
function mostrarSecao(secaoId) {
    console.log('🔍 [chatbot-page] mostrarSecao chamado com:', secaoId);
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const section = document.getElementById(secaoId);
    if (section) {
        section.classList.add('active');
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${secaoId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Ações específicas por seção
    if (secaoId === 'lista-chatbot') {
        if (typeof renderizarListaChatbot === 'function') {
        renderizarListaChatbot();
        } else if (typeof window.renderizarListaChatbot === 'function') {
            window.renderizarListaChatbot();
        } else {
            console.error('❌ renderizarListaChatbot não está definida!');
        }
    } else if (secaoId === 'dashboard-chatbot') {
        // Aguardar um pouco para garantir que armazenamentoReclamacoes está pronto
        setTimeout(async () => {
            await atualizarDashboardChatbot();
        }, 500);
        // Reinicializar gráficos
        setTimeout(async () => {
            if (window.graficosDetalhadosChatbot) {
                await window.graficosDetalhadosChatbot.carregarDados();
                window.graficosDetalhadosChatbot.renderizarGraficos();
            } else {
                window.graficosDetalhadosChatbot = new GraficosDetalhados('chatbot');
                // Inicializar controle de gráficos após renderização
                setTimeout(() => {
                    if (typeof ControleGraficosDashboard !== 'undefined') {
                        window.controleGraficosChatbot = new ControleGraficosDashboard('chatbot');
                    }
                }, 2000);
            }
        }, 300);
        // Configurar cards após um pequeno delay
        setTimeout(() => {
            configurarCardsDashboardChatbot();
        }, 500);
    }
}

// === CARREGAMENTO DE DADOS ===
async function carregarFichasChatbot() {
    console.log('📥 [chatbot-page] carregarFichasChatbot chamado');
    
    // Aguardar armazenamentoReclamacoes estar disponível
        let tentativas = 0;
        while (!window.armazenamentoReclamacoes && tentativas < 10) {
        console.log(`⏳ [chatbot-page] Aguardando armazenamentoReclamacoes... (tentativa ${tentativas + 1}/10)`);
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }
    
    if (window.armazenamentoReclamacoes) {
            console.log('✅ armazenamentoReclamacoes encontrado após espera!');
        }
    
    // Verificar se Firebase está disponível e ativá-lo se necessário
    if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.verificarEAtivarFirebase) {
        try {
                    window.armazenamentoReclamacoes.verificarEAtivarFirebase();
        } catch (error) {
            console.error('❌ Erro ao verificar Firebase:', error);
                }
            }
            
    if (window.armazenamentoReclamacoes) {
        try {
            console.log('📦 [chatbot-page] Carregando fichas via armazenamentoReclamacoes...');
            const dados = await window.armazenamentoReclamacoes.carregarTodos('chatbot');
            if (Array.isArray(dados)) {
                atualizarFichasChatbot(dados);
            console.log('✅ Fichas carregadas via sistema:', fichasChatbot.length);
            if (fichasChatbot.length > 0) {
                console.log('📋 IDs:', fichasChatbot.slice(0, 5).map(f => f.id).join(', '));
                console.log('📋 Primeira ficha:', fichasChatbot[0]);
            }
            } else {
                console.warn('⚠️ Dados retornados não são um array:', dados);
            atualizarFichasChatbot([]);
        }
        } catch (error) {
            console.error('❌ Erro ao carregar via armazenamentoReclamacoes:', error);
            // Fallback para localStorage
            const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
            if (dados) {
                try {
                    const parsed = JSON.parse(dados);
                    if (Array.isArray(parsed)) {
                        atualizarFichasChatbot(parsed);
                console.log('✅ Carregado do localStorage (fallback):', fichasChatbot.length);
            } else {
                atualizarFichasChatbot([]);
                    }
                } catch (e) {
                    console.error('❌ Erro ao parsear localStorage:', e);
                    atualizarFichasChatbot([]);
                }
            } else {
                console.log('📦 Nenhum dado encontrado no localStorage');
                atualizarFichasChatbot([]);
            }
            }
    } else {
        console.warn('⚠️ armazenamentoReclamacoes não disponível, usando localStorage...');
        const dados = localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot');
        if (dados) {
            try {
                const parsed = JSON.parse(dados);
                if (Array.isArray(parsed)) {
                    atualizarFichasChatbot(parsed);
                } else {
            atualizarFichasChatbot([]);
        }
            } catch (e) {
                console.error('❌ Erro ao parsear localStorage:', e);
                atualizarFichasChatbot([]);
    }
        } else {
        atualizarFichasChatbot([]);
    }
    }
    
    // Sincronizar com localStorage se necessário
    const dadosFinais = fichasChatbot;
    if (dadosFinais.length > 0) {
            if (dadosFinais.length !== fichasChatbot.length) {
            console.warn('⚠️ DISCREPÂNCIA: localStorage tem', dadosFinais.length, 'mas fichasChatbot tem', fichasChatbot.length);
            // Sincronizar
            atualizarFichasChatbot(dadosFinais);
            console.log('✅ Sincronizado com localStorage');
        }
    }
    
    console.log('📋 Total final de fichas:', fichasChatbot.length);
    return fichasChatbot;
}

// === CONFIGURAÇÃO DE EVENTOS ===
function configurarEventosChatbot() {
    console.log('🔧 [chatbot-page] configurarEventosChatbot chamado');
    const form = document.getElementById('form-chatbot');
    console.log('🔧 [chatbot-page] Form encontrado?', form ? 'Sim' : 'Não');
    if (form) {
        console.log('🔧 [chatbot-page] Adicionando event listener de submit ao formulário');
        form.addEventListener('submit', handleSubmitChatbot);
        console.log('✅ [chatbot-page] Event listener adicionado com sucesso');
    } else {
        console.error('❌ [chatbot-page] Formulário form-chatbot não encontrado!');
    }
    
    const busca = document.getElementById('busca-chatbot');
    if (busca) {
        busca.addEventListener('input', renderizarListaChatbot);
    }
    
    const filtroStatus = document.getElementById('filtro-status-chatbot');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', renderizarListaChatbot);
    }
    
    const filtroCanal = document.getElementById('filtro-canal-chatbot');
    if (filtroCanal) {
        filtroCanal.addEventListener('change', renderizarListaChatbot);
    }
    
    const cpf = document.getElementById('chatbot-cpf');
    if (cpf) {
        cpf.addEventListener('input', formatCPF);
    }
    
    // Aplicar máscara em todos os campos de telefone existentes e futuros
    const telefones = document.querySelectorAll('#chatbot-telefones-container .telefone-mask');
    telefones.forEach(tel => {
        tel.addEventListener('input', formatPhone);
    });
}

// Função auxiliar para obter valor de campo de forma segura
function obterValorCampoChatbot(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value : '';
}

// Função auxiliar para obter checkbox de forma segura
function obterCheckboxChatbot(id) {
    const campo = document.getElementById(id);
    return campo ? campo.checked : false;
}

async function handleSubmitChatbot(e) {
    console.log('🚀🚀🚀 [chatbot-page] handleSubmitChatbot chamado! 🚀🚀🚀');
    e.preventDefault();
    console.log('🚀 [chatbot-page] Event preventDefault executado');
    console.log('🚀 [chatbot-page] Event:', e);
    console.log('🚀 [chatbot-page] Target:', e.target);
    console.log('🚀 [chatbot-page] Form:', e.target.form || e.target.closest('form'));
    
    try {
        // Obter anexos
        const anexos = window.gerenciadorAnexos ? 
            window.gerenciadorAnexos.obterAnexosDoFormulario('anexos-preview-chatbot') : [];
        console.log('📎 Anexos coletados:', anexos.length);
        
        // Coletar dataClienteChatbot diretamente do campo
        const campoDataCliente = document.getElementById('chatbot-data-cliente');
        const dataClienteChatbot = campoDataCliente ? campoDataCliente.value : '';
        console.log('📅 Data Cliente Chatbot coletada:', dataClienteChatbot);
        console.log('📅 Campo existe?', campoDataCliente !== null);
        console.log('📅 Valor direto do campo:', campoDataCliente?.value);
        console.log('📅 Tipo do valor:', typeof dataClienteChatbot);
        console.log('📅 Valor após trim:', dataClienteChatbot.trim());
    
        // Gerar ID usando o sistema de armazenamento
        const id = window.armazenamentoReclamacoes ? 
            window.armazenamentoReclamacoes.gerarId() : 
            `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const responsavel = window.sistemaPerfis?.usuarioAtual?.nome || window.sistemaPerfis?.usuarioAtual?.email || 'Sistema';
        const ficha = {
            id: id,
            tipoDemanda: 'chatbot',
            dataClienteChatbot: dataClienteChatbot,
            responsavel: responsavel,
            responsavelChatbot: responsavel, // Também adicionar no campo específico do chatbot
            nomeCompleto: obterValorCampoChatbot('chatbot-nome') || '',
            cpf: obterValorCampoChatbot('chatbot-cpf'),
            // Removido: origem (não existe mais em chatbot)
            telefone: window.obterTelefonesDoContainer ? window.obterTelefonesDoContainer('chatbot-telefones-container').join(', ') : obterValorCampoChatbot('chatbot-telefone') || '',
            notaAvaliacao: obterValorCampoChatbot('chatbot-nota-avaliacao'),
            avaliacaoCliente: obterValorCampoChatbot('chatbot-avaliacao-cliente'),
            produto: obterValorCampoChatbot('chatbot-produto'),
            motivo: obterValorCampoChatbot('chatbot-motivo'),
            respostaBot: document.querySelector('input[name="chatbot-resposta-bot"]:checked')?.value || '',
            observacaoRespostaBot: obterValorCampoChatbot('chatbot-observacao-resposta-bot-texto') || '',
            pixStatus: obterValorCampoChatbot('chatbot-pix-status'),
            enviarCobranca: document.querySelector('input[name="chatbot-enviar-cobranca"]:checked')?.value || 'Não',
            casosCriticos: obterCheckboxChatbot('chatbot-casos-criticos'),
            observacoes: obterValorCampoChatbot('chatbot-observacoes'),
            anexos: anexos, // Incluir anexos
            status: obterValorCampoChatbot('chatbot-status') || 'nao-iniciado', // Status padrão
            canalChatbot: obterValorCampoChatbot('chatbot-canal') || '', // Canal do chatbot
            dataCriacao: new Date().toISOString()
        };
        
        console.log('📋 Ficha coletada:', ficha);
        
        // Validar
        console.log('✅ Validando ficha...');
        if (!validarFichaChatbot(ficha)) {
            console.error('❌ Validação falhou');
            return;
        }
        console.log('✅ Validação passou');
        
        // Salvar usando o novo sistema
        console.log('💾 Salvando reclamação...');
        
        if (!window.armazenamentoReclamacoes) {
            console.error('❌ Sistema de armazenamento não encontrado!');
            mostrarAlerta('Erro ao salvar: sistema de armazenamento não disponível', 'error');
            return;
        }
        
        // Salvar usando o novo sistema (assíncrono)
        console.log('📤 [chatbot-page] Chamando armazenamentoReclamacoes.salvar...');
        console.log('📤 [chatbot-page] Tipo: chatbot, ID:', ficha.id);
        console.log('📤 [chatbot-page] window.armazenamentoReclamacoes:', window.armazenamentoReclamacoes ? 'existe' : 'não existe');
        
        try {
            // Log persistente para debug (sobrevive ao redirecionamento)
            const logKey = 'velotax_debug_salvamento_' + Date.now();
            localStorage.setItem(logKey, JSON.stringify({
                timestamp: new Date().toISOString(),
                acao: 'iniciando_salvamento',
                tipo: 'chatbot',
                id: ficha.id
            }));
            
            console.log('📤 [chatbot-page] Chamando armazenamentoReclamacoes.salvar...');
            const sucesso = await window.armazenamentoReclamacoes.salvar('chatbot', ficha);
            console.log('📥 [chatbot-page] Resultado do salvar:', sucesso);
            
            // Log persistente do resultado
            localStorage.setItem(logKey + '_resultado', JSON.stringify({
                timestamp: new Date().toISOString(),
                sucesso: sucesso,
                tipo: 'chatbot',
                id: ficha.id
            }));
            
            if (!sucesso) {
                console.error('❌ [chatbot-page] Erro ao salvar reclamação - retornou false');
                localStorage.setItem(logKey + '_erro', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    erro: 'salvar retornou false',
                    tipo: 'chatbot',
                    id: ficha.id
                }));
                mostrarAlerta('Erro ao salvar reclamação', 'error');
                return;
            }
            
            console.log('✅ [chatbot-page] Reclamação salva com sucesso!');
            
            // Aguardar um pouco para garantir que o Firebase salvou
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error('❌ [chatbot-page] Erro ao salvar reclamação:', error);
            console.error('❌ [chatbot-page] Stack:', error.stack);
            
            // Log persistente do erro
            const logKey = 'velotax_debug_salvamento_' + Date.now();
            localStorage.setItem(logKey + '_erro', JSON.stringify({
                timestamp: new Date().toISOString(),
                erro: error.message,
                stack: error.stack,
                tipo: 'chatbot',
                id: ficha.id
            }));
            
            mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
            return;
        }
        
        // RECARREGAR IMEDIATAMENTE (assíncrono)
        await carregarFichasChatbot();
        console.log('📋 Fichas recarregadas:', fichasChatbot.length);
        
        // Limpar formulário
        console.log('🧹 Limpando formulário...');
        limparFormChatbot();
        
        // Atualizar dashboard e listas IMEDIATAMENTE (seguindo padrão N2)
        atualizarDashboardChatbot();
        renderizarListaChatbot();
        
        // Mostrar lista
        mostrarSecao('lista-chatbot');
        
        // Disparar evento para atualizar home e relatórios
        if (typeof window !== 'undefined') {
            const evento = new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'chatbot', reclamacao: ficha, total: fichasChatbot.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado do chatbot-page');
        }
        
        // Mostrar sucesso
        mostrarAlerta('Reclamação Chatbot salva com sucesso!', 'success');
        
        // Tentar salvar no gerenciador de fichas (se disponível)
        if (window.gerenciadorFichas) {
            try {
                window.gerenciadorFichas.adicionarFicha(ficha);
                console.log('✅ Salvo no gerenciadorFichas');
            } catch (error) {
                console.error('❌ Erro ao salvar no gerenciadorFichas:', error);
            }
        }
        
        // Disparar evento novamente para garantir atualização (seguindo padrão N2)
        if (typeof window !== 'undefined') {
            const evento = new CustomEvent('reclamacaoSalva', {
                detail: { tipo: 'chatbot', reclamacao: ficha, total: fichasChatbot.length }
            });
            window.dispatchEvent(evento);
            console.log('📢 Evento reclamacaoSalva disparado novamente do chatbot-page');
        }
        
        // Recarregar fichas para garantir que a nova ficha esteja disponível (seguindo padrão N2)
        await carregarFichasChatbot();
        console.log('📋 Fichas Chatbot carregadas após salvar:', fichasChatbot.length);
        console.log('📋 Última ficha salva:', fichasChatbot[fichasChatbot.length - 1]);
        console.log('📋 Ficha salva está no array?', fichasChatbot.find(f => f.id === ficha.id) ? 'Sim' : 'Não');
        
        // Atualizar dashboard e listas NOVAMENTE (seguindo padrão N2)
        await atualizarDashboardChatbot();
        
        // Atualizar lista geral (sem filtro de usuário)
        renderizarListaChatbot();
        
        // Atualizar "Minhas Reclamações" se a seção estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-chatbot');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesChatbot();
        }
        
        // Log persistente do sucesso (sobrevive ao recarregamento)
        const logKeySucesso = 'velotax_salvamento_sucesso_' + Date.now();
        localStorage.setItem(logKeySucesso, JSON.stringify({
            timestamp: new Date().toISOString(),
            tipo: 'chatbot',
            id: ficha.id,
            sucesso: true,
            mensagem: 'Ficha salva com sucesso'
        }));
        
        mostrarSecao('lista-chatbot');
        
    } catch (error) {
        console.error('❌ Erro ao processar submit:', error);
        
        // Log persistente do erro
        const logKeyErro = 'velotax_salvamento_erro_' + Date.now();
        localStorage.setItem(logKeyErro, JSON.stringify({
            timestamp: new Date().toISOString(),
            tipo: 'chatbot',
            erro: error.message,
            stack: error.stack
        }));
        
        mostrarAlerta('Erro ao salvar reclamação: ' + error.message, 'error');
    }
}

function validarFichaChatbot(ficha) {
    if (!ficha.nomeCompleto || ficha.nomeCompleto.trim() === '') {
        mostrarAlerta('Por favor, preencha o nome completo', 'error');
                return false;
            }
    if (!ficha.cpf || ficha.cpf.trim() === '') {
        mostrarAlerta('Por favor, preencha o CPF', 'error');
                return false;
            }
    if (ficha.cpf && !validarCPF(ficha.cpf)) {
        mostrarAlerta('CPF inválido', 'error');
        return false;
    }
    return true;
}

// === EXCLUSÃO ===
async function excluirFichaChatbot(id) {
    if (!confirm('Tem certeza que deseja excluir esta reclamação das listas e contagens? Esta ação não pode ser desfeita localmente.')) {
        return;
    }
    
    try {
        // Remover APENAS do array local, não do Firebase
        fichasChatbot = fichasChatbot.filter(f => f.id !== id);
        atualizarFichasChatbot(fichasChatbot);
        
        // Recarregar fichas e atualizar interface
        // Não precisa carregar do Firebase novamente, pois já removemos localmente
        await atualizarDashboardChatbot(); // Ensure dashboard is updated
        renderizarListaChatbot();
        
        // Atualizar "Minhas Reclamações" se estiver visível
        const secaoMinhas = document.getElementById('minhas-reclamacoes-chatbot');
        if (secaoMinhas && secaoMinhas.classList.contains('active')) {
            renderizarMinhasReclamacoesChatbot();
        }
        
        mostrarAlerta('Reclamação removida das listas com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao remover ficha Chatbot das listas:', error);
        mostrarAlerta('Erro ao remover reclamação das listas: ' + error.message, 'error');
    }
}

// Tornar função global
window.excluirFichaChatbot = excluirFichaChatbot;

async function atualizarDashboardChatbot() {
    console.log('📊 [atualizarDashboardChatbot] Iniciando atualização...');
    console.log('🔍 [atualizarDashboardChatbot] armazenamentoReclamacoes existe?', !!window.armazenamentoReclamacoes);
    console.log('🔍 [atualizarDashboardChatbot] firebaseDB existe?', !!window.firebaseDB);
    console.log('🔍 [atualizarDashboardChatbot] firebaseDB.inicializado?', window.firebaseDB?.inicializado);
    
    // Usar a mesma lógica da dashboard geral - carregar diretamente
    let fichasChatbotCarregadas = [];
    
    if (window.armazenamentoReclamacoes) {
        try {
            console.log('📥 [atualizarDashboardChatbot] Carregando Chatbot do armazenamentoReclamacoes...');
            fichasChatbotCarregadas = await window.armazenamentoReclamacoes.carregarTodos('chatbot') || [];
            console.log('✅ [atualizarDashboardChatbot] Chatbot carregado:', fichasChatbotCarregadas.length);
            
            // Atualizar variável global também
            atualizarFichasChatbot(fichasChatbotCarregadas);
        } catch (error) {
            console.error('❌ [atualizarDashboardChatbot] Erro ao carregar do armazenamentoReclamacoes:', error);
            // Fallback para localStorage
            fichasChatbotCarregadas = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
            atualizarFichasChatbot(fichasChatbotCarregadas);
            console.log('📦 [atualizarDashboardChatbot] Usando fallback localStorage:', fichasChatbotCarregadas.length);
        }
    } else {
        console.warn('⚠️ [atualizarDashboardChatbot] armazenamentoReclamacoes não existe, usando localStorage');
        // Fallback: localStorage
        fichasChatbotCarregadas = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        atualizarFichasChatbot(fichasChatbotCarregadas);
        console.log('📦 [atualizarDashboardChatbot] Dados do localStorage:', fichasChatbotCarregadas.length);
    }
    
    // Usar fichasChatbotCarregadas para cálculos
    const total = fichasChatbotCarregadas.length;
    
    console.log('📊 [atualizarDashboardChatbot] Total de fichas carregadas:', total);
    console.log('📊 [atualizarDashboardChatbot] Primeiras 3 fichas:', fichasChatbotCarregadas.slice(0, 3).map(f => ({
        id: f.id,
        nome: f.nomeCompleto || f.nomeCliente,
        resolvidoAutomaticamente: f.resolvidoAutomaticamente,
        encaminhadoHumano: f.encaminhadoHumano,
        respostaBot: f.respostaBot
    })));
    // Para chatbot, verificar respostaBot: se for "Sim", é resolvido automaticamente; se for "Não", é encaminhado para humano
    const resolvidasAuto = fichasChatbotCarregadas.filter(f => {
        // Verificar se tem a propriedade explícita ou inferir de respostaBot
        if (f.resolvidoAutomaticamente === true || f.resolvidoAutomaticamente === 'Sim') return true;
        if (f.respostaBot === 'Sim' || f.respostaBot === 'sim') return true;
        return false;
    }).length;
    const encaminhadas = fichasChatbotCarregadas.filter(f => {
        // Verificar se tem a propriedade explícita ou inferir de respostaBot
        if (f.encaminhadoHumano === true || f.encaminhadoHumano === 'Sim') return true;
        if (f.respostaBot === 'Não' || f.respostaBot === 'não' || f.respostaBot === 'Nao') return true;
        return false;
    }).length;
    
    console.log('📊 [atualizarDashboardChatbot] Total:', total, 'Resolvidas Auto:', resolvidasAuto, 'Encaminhadas:', encaminhadas);
    
    // Calcular média de satisfação - usar notaAvaliacao (campo correto)
    const fichasComNota = fichasChatbotCarregadas.filter(f => {
        const nota = parseInt(f.notaAvaliacao || f.satisfacao || 0);
        return nota > 0 && nota <= 5;
    });
    
    console.log('📊 Fichas com nota de avaliação:', fichasComNota.length);
    console.log('📊 Notas:', fichasComNota.map(f => ({
        id: f.id,
        notaAvaliacao: f.notaAvaliacao,
        satisfacao: f.satisfacao
    })));
    
    const satisfacoes = fichasComNota.map(f => parseInt(f.notaAvaliacao || f.satisfacao || 0));
    const mediaSatisfacao = satisfacoes.length > 0 
        ? (satisfacoes.reduce((a, b) => a + b, 0) / satisfacoes.length).toFixed(1)
        : '0.0';
    const taxaSatisfacao = satisfacoes.length > 0 
        ? ((satisfacoes.filter(s => s >= 4).length / satisfacoes.length) * 100).toFixed(1)
        : '0.0';
    
    console.log('📊 Média de satisfação calculada:', mediaSatisfacao);
    console.log('📊 Taxa de satisfação calculada:', taxaSatisfacao + '%');
    
    console.log('📊 [atualizarDashboardChatbot] Atualizando elementos HTML...');
    console.log('📊 [atualizarDashboardChatbot] Valores a atualizar:', {
        total,
        resolvidasAuto,
        encaminhadas,
        taxaSatisfacao: `${taxaSatisfacao}%`,
        mediaSatisfacao
    });
    
    // Verificar se os elementos existem antes de atualizar
    const elementos = {
        'chatbot-total-dash': document.getElementById('chatbot-total-dash'),
        'chatbot-auto-resolvidas': document.getElementById('chatbot-auto-resolvidas'),
        'chatbot-encaminhadas': document.getElementById('chatbot-encaminhadas'),
        'chatbot-satisfacao': document.getElementById('chatbot-satisfacao')
    };
    
    console.log('🔍 [atualizarDashboardChatbot] Elementos encontrados:', Object.keys(elementos).map(id => ({
        id,
        existe: !!elementos[id]
    })));
    
    atualizarElemento('chatbot-total-dash', total);
    atualizarElemento('chatbot-auto-resolvidas', resolvidasAuto);
    atualizarElemento('chatbot-encaminhadas', encaminhadas);
    atualizarElemento('chatbot-satisfacao', `${taxaSatisfacao}%`);
    
    // Métricas específicas
    const taxaAuto = total > 0 ? ((resolvidasAuto / total) * 100).toFixed(1) : 0;
    atualizarElemento('taxa-auto-chatbot', `${taxaAuto}%`);
    
    // Canal mais usado
    const canais = {};
    fichasChatbotCarregadas.forEach(f => {
        if (f.canalChatbot) {
            canais[f.canalChatbot] = (canais[f.canalChatbot] || 0) + 1;
        }
    });
    const canalMaisUsado = Object.keys(canais).length > 0 
        ? Object.keys(canais).reduce((a, b) => canais[a] > canais[b] ? a : b)
        : 'N/A';
    atualizarElemento('canal-mais-usado', canalMaisUsado);
    
    atualizarElemento('media-satisfacao', mediaSatisfacao);
    
    console.log('✅ [atualizarDashboardChatbot] Elementos atualizados com sucesso!');
    
    // Adicionar event listeners aos cards
    configurarCardsDashboardChatbot();
}

// Configurar cliques nos cards do dashboard Chatbot
function configurarCardsDashboardChatbot() {
    // Card Total
    const cardTotal = document.querySelector('.stat-card.chatbot-card:has(#chatbot-total-dash)');
    if (cardTotal) {
        cardTotal.onclick = () => mostrarSecao('lista-chatbot');
    }
    
    // Card Resolvidas Auto
    const cardAuto = document.querySelector('.stat-card.chatbot-card:has(#chatbot-auto-resolvidas)');
    if (cardAuto) {
        cardAuto.onclick = () => {
            mostrarSecao('lista-chatbot');
            // Filtrar por resolvidas automaticamente
            const filtro = document.getElementById('filtro-status-chatbot');
            if (filtro) {
                filtro.value = 'resolvidas-auto';
                renderizarListaChatbot();
            }
        };
    }
    
    // Card Encaminhadas
    const cardEncaminhadas = document.querySelector('.stat-card.chatbot-card:has(#chatbot-encaminhadas)');
    if (cardEncaminhadas) {
        cardEncaminhadas.onclick = () => {
            mostrarSecao('lista-chatbot');
            // Filtrar por encaminhadas
            const filtro = document.getElementById('filtro-status-chatbot');
            if (filtro) {
                filtro.value = 'encaminhadas';
                renderizarListaChatbot();
            }
        };
            }
        }

// === RENDERIZAÇÃO DE LISTAS ===
// Replicar exatamente o funcionamento de BACEN e N2
renderizarListaChatbot = async function() {
    console.log('📋 [renderizarListaChatbot] Iniciando renderização...');
    
    // SEMPRE recarregar as fichas antes de renderizar (AGUARDAR) - igual BACEN e N2
    console.log('🔄 Recarregando fichas antes de renderizar lista...');
    await carregarFichasChatbot();
    
    // Verificar novamente após carregar
    if (!fichasChatbot || !Array.isArray(fichasChatbot)) {
        console.warn('⚠️ fichasChatbot não é um array válido, inicializando...');
        fichasChatbot = [];
    }

    console.log('📋 Renderizando lista geral com', fichasChatbot.length, 'fichas');
    console.log('📋 Primeiras 3 fichas:', fichasChatbot.slice(0, 3).map(f => ({ id: f.id, nome: f.nomeCompleto })));
    
    // Usar o mesmo padrão de BACEN e N2: lista-fichas-chatbot
    const container = document.getElementById('lista-fichas-chatbot');
    if (!container) {
        console.error('❌ Container lista-fichas-chatbot não encontrado!');
        console.error('❌ Tentando encontrar container alternativo...');
        // Tentar encontrar container alternativo (igual N2)
        const containerAlt = document.querySelector('#lista-chatbot .fichas-container, #lista-chatbot .complaints-list, #lista-chatbot');
        if (containerAlt) {
            console.log('✅ Container alternativo encontrado:', containerAlt.id || containerAlt.className);
            container = containerAlt;
    } else {
            console.error('❌ Nenhum container encontrado!');
            return;
        }
    }
    
    const busca = document.getElementById('busca-chatbot')?.value.toLowerCase() || '';
    const filtroStatus = document.getElementById('filtro-status-chatbot')?.value || 'all';
    const filtroCanal = document.getElementById('filtro-canal-chatbot')?.value || 'all';
    
    console.log('🔍 [renderizarListaChatbot] Filtros aplicados:', { busca, filtroStatus, filtroCanal });
    console.log('🔍 [renderizarListaChatbot] Total de fichas antes dos filtros:', fichasChatbot.length);
    
    // NÃO FILTRAR POR USUÁRIO NA LISTA GERAL - mostrar TODAS as reclamações de TODOS os agentes
    let filtradas = [...fichasChatbot]; // Criar cópia para não modificar o array original
    
    // Aplicar busca (igual BACEN)
    if (busca && busca.trim() !== '') {
        // Normalizar busca (remover formatação de CPF)
        const buscaNormalizada = busca.replace(/\D/g, ''); // Remove tudo que não é dígito
        const buscaLower = busca.toLowerCase();
        
        filtradas = filtradas.filter(f => {
            const nome = (f.nomeCompleto || f.nomeCliente || '').toLowerCase();
            const cpfFormatado = (f.cpf || '').toLowerCase();
            const cpfSemFormatacao = (f.cpf || '').replace(/\D/g, '');
            const motivo = (f.motivoReduzido || f.motivo || f.motivoChatbot || '').toLowerCase();
            const id = (f.id || '').toLowerCase();
            
            return nome.includes(buscaLower) || 
                cpfFormatado.includes(buscaLower) || 
                cpfSemFormatacao.includes(buscaNormalizada) ||
                   motivo.includes(buscaLower) ||
                   id.includes(buscaLower);
        });
        console.log('🔍 [renderizarListaChatbot] Após busca:', filtradas.length);
    }
    
    // Aplicar filtro de status (só se não for 'all' e não estiver vazio)
    if (filtroStatus && filtroStatus !== 'all' && filtroStatus.trim() !== '') {
        let filtradasStatus = [];
        switch (filtroStatus) {
            case 'resolvidas-auto':
                filtradasStatus = filtradas.filter(f => f.resolvidoAutomaticamente === true);
                console.log('🔍 [renderizarListaChatbot] Filtro resolvidas-auto:', filtradasStatus.length);
                break;
            case 'encaminhadas':
                filtradasStatus = filtradas.filter(f => f.encaminhadoHumano === true);
                console.log('🔍 [renderizarListaChatbot] Filtro encaminhadas:', filtradasStatus.length);
                break;
            default:
                filtradasStatus = filtradas.filter(f => (f.status || '').toLowerCase() === filtroStatus.toLowerCase());
                console.log('🔍 [renderizarListaChatbot] Filtro status:', filtroStatus, 'Resultado:', filtradasStatus.length);
    }
        filtradas = filtradasStatus;
    }
    
    // Aplicar filtro de canal (só se não for 'all' e não estiver vazio)
    if (filtroCanal && filtroCanal !== 'all' && filtroCanal.trim() !== '') {
        const antesCanal = filtradas.length;
        filtradas = filtradas.filter(f => {
            const canal = (f.canalChatbot || '').toLowerCase().trim();
            const filtro = filtroCanal.toLowerCase().trim();
            return canal === filtro;
        });
        console.log('🔍 [renderizarListaChatbot] Filtro canal:', filtroCanal, 'Antes:', antesCanal, 'Depois:', filtradas.length);
    }
    
    console.log('🔍 [renderizarListaChatbot] Total de fichas após todos os filtros:', filtradas.length);
    
    // Verificar se criarCardChatbot existe (igual BACEN)
    if (typeof criarCardChatbot !== 'function' && typeof window.criarCardChatbot !== 'function') {
        console.error('❌ Função criarCardChatbot não encontrada!');
        container.innerHTML = '<div class="no-results">Erro: Função de renderização não encontrada</div>';
        return;
    }
    
    if (filtradas.length === 0) {
        if (fichasChatbot.length === 0) {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação Chatbot cadastrada ainda</div>';
        } else {
            container.innerHTML = '<div class="no-results">Nenhuma reclamação Chatbot encontrada com os filtros aplicados</div>';
        }
        console.log('⚠️ Nenhuma ficha filtrada encontrada');
        return;
    }
    
    // Ordenar por data (mais recentes primeiro) - igual BACEN e N2
    filtradas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataClienteChatbot || 0);
        const dataB = new Date(b.dataCriacao || b.dataClienteChatbot || 0);
        return dataB - dataA;
    });
    
    // Usar criarCardChatbot do window se disponível, senão usar função local (igual BACEN e N2)
    const criarCard = window.criarCardChatbot || criarCardChatbot;
        const html = filtradas.map(f => {
        try {
            return criarCard(f);
    } catch (error) {
            console.error('❌ Erro ao criar card para ficha', f.id, ':', error);
            return `<div class="ficha-card">Erro ao renderizar ficha ${f.id}</div>`;
    }
    }).join('');
    
    container.innerHTML = html;
    console.log('✅ Lista Chatbot renderizada com sucesso!', filtradas.length, 'fichas exibidas');
}

// Atribuir função à variável declarada acima
renderizarMinhasReclamacoesChatbot = async function() {
    console.log('📋 Total de fichas disponíveis:', fichasChatbot.length);
    
    // Verificar usuário atual - múltiplas fontes
    let usuarioAtual = window.sistemaPerfis?.usuarioAtual;
    
    // Fallback: tentar obter do localStorage
    if (!usuarioAtual) {
        try {
            const usuarioSalvo = localStorage.getItem('velotax_usuario_atual');
            if (usuarioSalvo) {
                usuarioAtual = JSON.parse(usuarioSalvo);
                console.log('✅ [Chatbot] Usuário carregado do localStorage:', usuarioAtual);
            }
        } catch (e) {
            console.warn('⚠️ [Chatbot] Erro ao carregar usuário do localStorage:', e);
        }
    }
    
    // Fallback: tentar obter da sessão do Google/VeloHub
    if (!usuarioAtual) {
        try {
            const sessionData = localStorage.getItem('velohub_user_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session?.user) {
                    usuarioAtual = {
                        nome: session.user.name,
                        email: session.user.email,
                        foto: session.user.picture
                    };
                    console.log('✅ [Chatbot] Usuário carregado da sessão VeloHub:', usuarioAtual);
    }
            }
        } catch (e) {
            console.warn('⚠️ [Chatbot] Erro ao carregar usuário da sessão:', e);
        }
    }
    
    if (!usuarioAtual) {
        console.warn('⚠️ [Chatbot] Usuário não autenticado');
        const container = document.getElementById('minhas-reclamacoes-chatbot-container');
        if (container) {
        container.innerHTML = '<div class="no-results">Você precisa estar logado para ver suas reclamações</div>';
        }
        return;
    }
    
    console.log('👤 [Chatbot] Usuário atual identificado:', usuarioAtual);
    console.log('📋 [Chatbot] Total de fichas disponíveis:', fichasChatbot.length);
    
    // Normalizar nome do usuário atual
    const nomeAtual = (usuarioAtual.nome || '').toString().trim();
    const emailAtual = (usuarioAtual.email || '').toString().trim();
    
    // Normalizar variações de nomes conhecidos
    const normalizarNome = (nome) => {
        if (!nome) return '';
        const nomeLower = nome.toLowerCase().trim();
        // Normalizar "Shirley" - todas as variações
        if (nomeLower.includes('shirley')) {
            return 'shirley';
        }
        // Normalizar "Venssa" - todas as variações
        if (nomeLower.includes('venssa') || nomeLower.includes('venessa') || nomeLower.includes('venesa')) {
            return 'venssa';
        }
        return nomeLower;
    };
    
    const nomeAtualNormalizado = normalizarNome(nomeAtual);
    const emailAtualLower = emailAtual.toLowerCase().trim();
        
    console.log('🔍 [Chatbot] Buscando fichas para:', {
        nomeOriginal: nomeAtual,
        nomeNormalizado: nomeAtualNormalizado,
        email: emailAtualLower
    });
    
    // Filtrar apenas fichas do responsável atual - comparação mais robusta
    const minhasFichas = fichasChatbot.filter(f => {
        const responsavelFicha = (f.responsavel || f.responsavelChatbot || '').toString().trim();
        const responsavelFichaLower = responsavelFicha.toLowerCase();
        const responsavelFichaNormalizado = normalizarNome(responsavelFicha);
        
        // Múltiplas estratégias de comparação
        const match = 
            // Comparação exata (case-insensitive)
            responsavelFichaLower === nomeAtualNormalizado ||
            responsavelFichaLower === emailAtualLower ||
            // Comparação normalizada (para Shirley, Venssa, etc)
            responsavelFichaNormalizado === nomeAtualNormalizado ||
            // Comparação parcial (inclui)
            (nomeAtualNormalizado && responsavelFichaLower.includes(nomeAtualNormalizado)) ||
            (emailAtualLower && responsavelFichaLower.includes(emailAtualLower)) ||
            // Comparação reversa (nome do usuário inclui responsável)
            (nomeAtualNormalizado && nomeAtualNormalizado.includes(responsavelFichaNormalizado));
        
        if (match) {
            console.log('✅ [Chatbot] Match encontrado:', {
                fichaId: f.id,
                responsavelFicha: responsavelFicha,
                nomeAtual: nomeAtual,
                matchType: responsavelFichaLower === nomeAtualNormalizado ? 'exato' :
                          responsavelFichaNormalizado === nomeAtualNormalizado ? 'normalizado' :
                          'parcial'
            });
        }
        
        return match;
    });
    
    console.log('📋 [Chatbot] Minhas fichas encontradas:', minhasFichas.length);
    if (minhasFichas.length === 0) {
        console.warn('⚠️ [Chatbot] Nenhuma ficha encontrada. Verificando responsáveis disponíveis...');
        const responsaveisUnicos = [...new Set(fichasChatbot.map(f => f.responsavel || f.responsavelChatbot).filter(Boolean))];
        console.log('📋 [Chatbot] Responsáveis únicos nas fichas:', responsaveisUnicos);
        console.log('📋 [Chatbot] Comparação:', {
            buscando: nomeAtualNormalizado || emailAtualLower,
            disponiveis: responsaveisUnicos.map(r => ({ original: r, normalizado: normalizarNome(r) }))
        });
    }
    
    const container = document.getElementById('minhas-reclamacoes-chatbot-container');
    if (!container) {
        console.error('❌ Container minhas-reclamacoes-chatbot-container não encontrado!');
        return;
    }
    
    if (minhasFichas.length === 0) {
        container.innerHTML = '<div class="no-results">Você ainda não possui reclamações Chatbot atribuídas</div>';
        return;
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    minhasFichas.sort((a, b) => {
        const dataA = new Date(a.dataCriacao || a.dataClienteChatbot || 0);
        const dataB = new Date(b.dataCriacao || b.dataClienteChatbot || 0);
        return dataB - dataA;
    });
    
    if (typeof criarCardChatbot === 'function') {
        container.innerHTML = minhasFichas.map(f => criarCardChatbot(f)).join('');
    } else if (typeof window.criarCardChatbot === 'function') {
        container.innerHTML = minhasFichas.map(f => window.criarCardChatbot(f)).join('');
    } else {
        container.innerHTML = minhasFichas.map(f => {
            const statusClass = f.status || 'nao-iniciado';
            const statusLabel = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
                'concluído': 'Concluído',
        'respondido': 'Respondido'
            }[statusClass] || statusClass;
    
    return `
                <div class="complaint-item chatbot-item" onclick="toggleComplaintDetails(this)">
            <div class="complaint-header">
                        <div class="complaint-info">
                            <h4>${f.nomeCompleto || f.nomeCliente || 'Sem nome'}</h4>
                            <span class="complaint-status status-${statusClass}">${statusLabel}</span>
                </div>
                        <button class="btn-excluir-ficha" onclick="event.stopPropagation(); excluirFichaChatbot('${f.id}')" title="Excluir">×</button>
            </div>
                    <div class="complaint-details" style="display: none;">
                        <p><strong>CPF:</strong> ${f.cpf || 'Não informado'}</p>
                        <p><strong>Telefone:</strong> ${f.telefone || 'Não informado'}</p>
                        <p><strong>Data:</strong> ${f.dataClienteChatbot ? new Date(f.dataClienteChatbot).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                        <p><strong>Nota:</strong> ${f.notaAvaliacao || f.satisfacao || 'Não informada'}</p>
                        <p><strong>Resposta Bot:</strong> ${f.respostaBot || 'Não informado'}</p>
            </div>
        </div>
    `;
        }).join('');
        }
    }
    
// === EXPORTAÇÃO ===
function exportarRelatorioSatisfacaoChatbot(dados) {
    if (!dados || dados.length === 0) {
        mostrarAlerta('Nenhum dado para exportar', 'error');
        return;
    }
    
    console.log('📥 Exportando relatório de satisfação com', dados.length, 'avaliações');
    
    // Agrupar por nível
    const porNivel = {};
    dados.forEach(f => {
        const nivel = parseInt(f.notaAvaliacao || f.satisfacao || 0);
        if (nivel > 0 && nivel <= 5) {
            porNivel[nivel] = (porNivel[nivel] || 0) + 1;
        }
    });
    
    // Criar CSV com dados detalhados
    const headers = ['Nível de Satisfação', 'Quantidade', 'Percentual', 'Cliente', 'CPF', 'Avaliação'];
    const rows = [];
    
    // Adicionar linha de resumo por nível
    [5, 4, 3, 2, 1].forEach(nivel => {
        const count = porNivel[nivel] || 0;
        const percentual = dados.length > 0 ? ((count / dados.length) * 100).toFixed(1) : 0;
        rows.push([
            `${'⭐'.repeat(nivel)} (${nivel})`,
            count,
            `${percentual}%`,
            '',
            '',
            ''
        ]);
    });
    
    // Adicionar linha em branco
    rows.push(['', '', '', '', '', '']);
    
    // Adicionar detalhes de cada avaliação
    rows.push(['Detalhes das Avaliações', '', '', '', '', '']);
    rows.push(['Cliente', 'CPF', 'Nota', 'Avaliação Texto', 'Data', 'Status']);
    
    dados.forEach(f => {
        rows.push([
            f.nomeCompleto || f.nomeCliente || '',
            f.cpf || '',
            f.notaAvaliacao || f.satisfacao || '',
            f.avaliacaoCliente || '',
            f.dataCriacao ? new Date(f.dataCriacao).toLocaleDateString('pt-BR') : '',
            f.status || ''
        ]);
    });
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-satisfacao-chatbot-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exportado com sucesso');
}

// === UTILITÁRIOS ===
function limparFormChatbot() {
    document.getElementById('form-chatbot')?.reset();
    // Não preencher automaticamente - usuário deve inserir manualmente
    // Limpar anexos
    if (window.gerenciadorAnexos) {
        window.gerenciadorAnexos.limparAnexosFormulario('anexos-preview-chatbot');
    }
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    } else {
        console.warn(`⚠️ [atualizarElemento] Elemento com ID "${id}" não encontrado no DOM`);
    }
}

function formatarData(dataString) {
    if (!dataString) return 'Não informada';
    return new Date(dataString).toLocaleDateString('pt-BR');
}

function parseDate(dateString) {
    if (!dateString) return null;
    // Aceitar formato DD/MM/AAAA ou AAAA-MM-DD
    if (dateString.includes('/')) {
        const [dia, mes, ano] = dateString.split('/');
        return new Date(ano, mes - 1, dia);
    } else if (dateString.includes('-')) {
        return new Date(dateString);
    }
    return null;
}

// Função global para mostrar modal de seleção de período (reutilizada)
if (typeof window.mostrarModalPeriodo === 'undefined') {
    window.mostrarModalPeriodo = function(callback) {
        // Remover modal existente se houver
        const modalExistente = document.getElementById('modal-periodo');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'modal-periodo';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-periodo">
                <div class="modal-header">
                    <h3>📅 Selecionar Período</h3>
                    <button class="modal-close" onclick="fecharModalPeriodo()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="data-inicio">Data Inicial:</label>
                        <input type="date" id="data-inicio" class="form-control">
                        <input type="text" id="data-inicio-texto" class="form-control" placeholder="DD/MM/AAAA" 
                               pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label for="data-fim">Data Final:</label>
                        <input type="date" id="data-fim" class="form-control">
                        <input type="text" id="data-fim-texto" class="form-control" placeholder="DD/MM/AAAA" 
                               pattern="\\d{2}/\\d{2}/\\d{4}" maxlength="10">
                    </div>
                    <div class="modal-actions">
                        <button class="velohub-btn btn-secondary" onclick="fecharModalPeriodo()">Cancelar</button>
                        <button class="velohub-btn btn-primary" onclick="confirmarPeriodo()">Gerar Relatório</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Sincronizar inputs de data e texto
        const dataInicio = document.getElementById('data-inicio');
        const dataInicioTexto = document.getElementById('data-inicio-texto');
        const dataFim = document.getElementById('data-fim');
        const dataFimTexto = document.getElementById('data-fim-texto');
        
        // Converter data para formato brasileiro
        function formatarDataBR(dataISO) {
            if (!dataISO) return '';
            const [ano, mes, dia] = dataISO.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        // Converter formato brasileiro para ISO
        function formatarDataISO(dataBR) {
            if (!dataBR) return '';
            const [dia, mes, ano] = dataBR.split('/');
            if (dia && mes && ano) {
                return `${ano}-${mes}-${dia}`;
            }
            return '';
        }
        
        // Validar formato DD/MM/AAAA
        function validarDataBR(data) {
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!regex.test(data)) return false;
            const [dia, mes, ano] = data.split('/').map(Number);
            if (mes < 1 || mes > 12) return false;
            if (dia < 1 || dia > 31) return false;
            if (ano < 1900 || ano > 2100) return false;
            return true;
        }
        
        // Sincronizar data picker -> texto
        dataInicio.addEventListener('change', function() {
            dataInicioTexto.value = formatarDataBR(this.value);
        });
        
        dataFim.addEventListener('change', function() {
            dataFimTexto.value = formatarDataBR(this.value);
        });
        
        // Sincronizar texto -> data picker (com validação)
        dataInicioTexto.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length >= 2) valor = valor.substring(0, 2) + '/' + valor.substring(2);
            if (valor.length >= 5) valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
            this.value = valor;
            
            if (validarDataBR(this.value)) {
                dataInicio.value = formatarDataISO(this.value);
            }
        });
        
        dataFimTexto.addEventListener('input', function() {
            let valor = this.value.replace(/\D/g, '');
            if (valor.length >= 2) valor = valor.substring(0, 2) + '/' + valor.substring(2);
            if (valor.length >= 5) valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
            this.value = valor;
            
            if (validarDataBR(this.value)) {
                dataFim.value = formatarDataISO(this.value);
            }
        });
        
        // Fechar ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalPeriodo();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function fecharESC(e) {
            if (e.key === 'Escape') {
                fecharModalPeriodo();
                document.removeEventListener('keydown', fecharESC);
            }
        });
        
        // Focar no primeiro campo
        setTimeout(() => dataInicio.focus(), 100);
        
        // Função global para confirmar
        window.confirmarPeriodo = function() {
            const inicio = dataInicioTexto.value || formatarDataBR(dataInicio.value);
            const fim = dataFimTexto.value || formatarDataBR(dataFim.value);
            
            if (!inicio || !fim) {
                mostrarAlerta('Por favor, preencha ambas as datas', 'erro');
                return;
            }
            
            if (!validarDataBR(inicio) || !validarDataBR(fim)) {
                mostrarAlerta('Por favor, use o formato DD/MM/AAAA para as datas', 'erro');
                return;
            }
            
            fecharModalPeriodo();
            if (callback) callback(inicio, fim);
        };
        
        // Função global para fechar
        window.fecharModalPeriodo = function() {
            const modal = document.getElementById('modal-periodo');
            if (modal) {
                modal.remove();
            }
            delete window.confirmarPeriodo;
            delete window.fecharModalPeriodo;
        };
    };
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function mostrarAlerta(mensagem, tipo) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensagem;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

function formatCPF(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
}

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
}

// Garantir que mostrarSecao está disponível globalmente (já está definido acima)
// Adicionar verificação adicional para garantir disponibilidade
if (typeof window.mostrarSecao === 'undefined' || !window.mostrarSecao) {
    console.error('❌ mostrarSecao não está definido!');
} else {
    console.log('✅ mostrarSecao está disponível globalmente');
}

// Função de inicialização
function inicializarChatbotPage() {
    console.log('🚀 [chatbot-page] inicializarChatbotPage chamado');
    console.log('🚀 [chatbot-page] document.readyState:', document.readyState);
    
    // Garantir que mostrarSecao está disponível
    if (typeof window.mostrarSecao === 'function') {
        console.log('✅ [chatbot-page] mostrarSecao confirmado');
    } else {
        console.error('❌ [chatbot-page] mostrarSecao NÃO está disponível!');
    }
    
    // Configurar eventos do formulário (CRÍTICO!)
    console.log('🔧 [chatbot-page] Chamando configurarEventosChatbot...');
    try {
        configurarEventosChatbot();
    } catch (error) {
        console.error('❌ [chatbot-page] Erro ao configurar eventos:', error);
    }
    
    // Carregar fichas
    console.log('📥 [chatbot-page] Chamando carregarFichasChatbot...');
    try {
        carregarFichasChatbot();
    } catch (error) {
        console.error('❌ [chatbot-page] Erro ao carregar fichas:', error);
    }
    
    // Listener CRÍTICO: Recarregar fichas quando Firebase estiver pronto
    window.addEventListener('firebaseReady', async function(event) {
        console.log('🔥 [CHATBOT] Firebase está pronto! Recarregando fichas...');
        // Aguardar um pouco para garantir que armazenamentoReclamacoes também está pronto
        await new Promise(resolve => setTimeout(resolve, 500));
        // Recarregar fichas do Firebase
        await carregarFichasChatbot();
        // Atualizar dashboard (AGUARDAR para garantir que está atualizado)
        await atualizarDashboardChatbot();
        // Atualizar lista se estiver visível
        const secaoLista = document.getElementById('lista-chatbot');
        if (secaoLista && secaoLista.classList.contains('active')) {
            renderizarListaChatbot();
        }
        
        // Verificar se há parâmetro ?editar=id na URL
        const urlParams = new URLSearchParams(window.location.search);
        const editarId = urlParams.get('editar');
        if (editarId) {
            console.log('📝 [CHATBOT] Parâmetro editar encontrado:', editarId);
            // Aguardar um pouco para garantir que tudo está carregado
            setTimeout(() => {
                if (window.abrirFichaChatbot) {
                    window.abrirFichaChatbot(editarId);
                } else {
                    console.error('❌ [CHATBOT] abrirFichaChatbot não está disponível');
                }
            }, 1000);
        }
    });
    
    // Listener para atualizar dashboard quando fichas forem importadas
    window.addEventListener('reclamacaoSalva', async function(event) {
        if (event.detail && (event.detail.tipo === 'chatbot' || event.detail.origem === 'importacao')) {
            console.log('📢 [CHATBOT] Evento reclamacaoSalva recebido, atualizando dashboard...');
            // Recarregar fichas e atualizar dashboard (AGUARDAR)
            await carregarFichasChatbot();
            await atualizarDashboardChatbot();
            // Atualizar lista se estiver visível
            const secaoLista = document.getElementById('lista-chatbot');
            if (secaoLista && secaoLista.classList.contains('active')) {
                renderizarListaChatbot();
            }
            // Recarregar gráficos do Chatbot
            if (window.graficosDetalhadosChatbot) {
                console.log('🔄 [CHATBOT] Recarregando gráficos após salvar reclamação...');
                await window.graficosDetalhadosChatbot.carregarDados();
                window.graficosDetalhadosChatbot.renderizarGraficos();
                console.log('✅ [CHATBOT] Gráficos recarregados após salvar reclamação');
            }
        }
    });
    
    // Listener para evento de importação concluída
    window.addEventListener('importacaoConcluida', async function(event) {
        if (event.detail && event.detail.porTipo && event.detail.porTipo.chatbot > 0) {
            console.log('📢 [CHATBOT] Importação concluída, atualizando dashboard...');
            // Recarregar fichas e atualizar dashboard (AGUARDAR)
            await carregarFichasChatbot();
            await atualizarDashboardChatbot();
            // Atualizar lista se estiver visível
            const secaoLista = document.getElementById('lista-chatbot');
            if (secaoLista && secaoLista.classList.contains('active')) {
                renderizarListaChatbot();
            }
            // Recarregar gráficos do Chatbot
            if (window.graficosDetalhadosChatbot) {
                console.log('🔄 [CHATBOT] Recarregando gráficos após importação...');
                await window.graficosDetalhadosChatbot.carregarDados();
                window.graficosDetalhadosChatbot.renderizarGraficos();
                console.log('✅ [CHATBOT] Gráficos recarregados após importação');
            } else {
                console.warn('⚠️ [CHATBOT] window.graficosDetalhadosChatbot não está disponível');
            }
        }
    });
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    console.log('⏳ [chatbot-page] DOM ainda carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 [chatbot-page] DOM carregado via DOMContentLoaded');
        inicializarChatbotPage();
    });
} else {
    // DOM já está carregado
    console.log('📄 [chatbot-page] DOM já estava carregado');
    // Chamar imediatamente
    inicializarChatbotPage();
    // E também com um pequeno delay para garantir que tudo está pronto
    setTimeout(function() {
        console.log('⏰ [chatbot-page] Re-inicializando após delay (fallback)...');
        inicializarChatbotPage();
    }, 500);
}

// Função para abrir ficha do Chatbot
function abrirFichaChatbot(id) {
    const fichas = window.fichasChatbot || fichasChatbot || [];
    const ficha = fichas.find(f => f.id === id);
    if (!ficha) {
        mostrarAlerta('Ficha não encontrada', 'error');
        return;
    }
    
    // Usa o sistema de fichas específicas
    console.log('🔍 [chatbot-page] abrirFichaChatbot - Verificando disponibilidade:', {
        fichasEspecificas: !!window.fichasEspecificas,
        FichasEspecificas: !!window.FichasEspecificas,
        tipo: typeof window.FichasEspecificas
    });
    
    if (window.fichasEspecificas && typeof window.fichasEspecificas.abrirFicha === 'function') {
        console.log('✅ [chatbot-page] Usando instância existente');
        window.fichasEspecificas.abrirFicha(ficha);
    } else if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
        // Criar instância se não existir
        console.log('✅ [chatbot-page] Criando nova instância de FichasEspecificas');
        try {
            window.fichasEspecificas = new window.FichasEspecificas();
            window.fichasEspecificas.abrirFicha(ficha);
        } catch (error) {
            console.error('❌ [chatbot-page] Erro ao criar instância:', error);
            mostrarAlerta('Erro ao abrir ficha: ' + error.message, 'error');
        }
    } else {
        // Aguardar mais tempo e tentar novamente (pode ser carregamento assíncrono)
        console.warn('⚠️ [chatbot-page] FichasEspecificas não disponível imediatamente, aguardando...');
        let tentativas = 0;
        const maxTentativas = 10; // 5 segundos total
        
        const tentarAbrir = setInterval(() => {
            tentativas++;
            console.log(`🔄 [chatbot-page] Tentativa ${tentativas}/${maxTentativas} de abrir ficha`);
            
            if (window.FichasEspecificas && typeof window.FichasEspecificas === 'function') {
                clearInterval(tentarAbrir);
                console.log('✅ [chatbot-page] FichasEspecificas disponível após aguardar');
                try {
                    window.fichasEspecificas = new window.FichasEspecificas();
                    window.fichasEspecificas.abrirFicha(ficha);
                } catch (error) {
                    console.error('❌ [chatbot-page] Erro ao criar instância após aguardar:', error);
                    mostrarAlerta('Erro ao abrir ficha: ' + error.message, 'error');
                }
            } else if (tentativas >= maxTentativas) {
                clearInterval(tentarAbrir);
                console.error('❌ [chatbot-page] FichasEspecificas não disponível após', maxTentativas * 500, 'ms');
                console.error('   Verifique se js/fichas-especificas.js está sendo carregado corretamente');
                console.error('   window.FichasEspecificas:', window.FichasEspecificas);
                mostrarAlerta('Sistema de fichas não disponível. Verifique o console para mais detalhes.', 'error');
            }
        }, 500);
    }
}

// Expor funções e variáveis globalmente
window.carregarFichasChatbot = carregarFichasChatbot;
window.atualizarDashboardChatbot = atualizarDashboardChatbot;
window.abrirFichaChatbot = abrirFichaChatbot;
// Expor funções de renderização (já definidas acima)
window.renderizarListaChatbot = renderizarListaChatbot;
window.renderizarMinhasReclamacoesChatbot = renderizarMinhasReclamacoesChatbot;
// window.fichasChatbot já é atualizado pela função atualizarFichasChatbot()
