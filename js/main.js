/* === SISTEMA DE RECLAMAÇÕES BACEN - JAVASCRIPT PRINCIPAL === */
/* VERSÃO: v2.8.0 | DATA: 2025-02-01 | ALTERAÇÕES: Corrigir gráfico mensal geral para usar dataEntrada da planilha em vez de dataCriacao */

// === VARIÁVEIS GLOBAIS ===
let complaints = [];
let currentFilter = 'all';

// Carrega fichas usando o gerenciador ou sistema de armazenamento
async function carregarFichas() {
    if (window.gerenciadorFichas) {
        complaints = window.gerenciadorFichas.obterFichasPorPerfil();
    } else if (window.armazenamentoReclamacoes) {
        // Usar o novo sistema de armazenamento - carregar todas as reclamações (AGUARDAR)
        try {
            const fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
            const fichasN2 = await window.armazenamentoReclamacoes.carregarTodos('n2') || [];
            const fichasChatbot = await window.armazenamentoReclamacoes.carregarTodos('chatbot') || [];
            complaints = [
                ...fichasBacen,
                ...fichasN2,
                ...fichasChatbot
            ];
            console.log('📋 Reclamações carregadas para home:', complaints.length, '(BACEN:', fichasBacen.length, 'N2:', fichasN2.length, 'Chatbot:', fichasChatbot.length, ')');
        } catch (error) {
            console.error('❌ Erro ao carregar fichas do armazenamentoReclamacoes:', error);
            // Fallback para localStorage
            const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
            const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
            const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
            complaints = [
                ...fichasBacen,
                ...fichasN2,
                ...fichasChatbot
            ];
            console.log('📋 Reclamações carregadas (fallback localStorage):', complaints.length);
        }
    } else {
        // Fallback: tentar chaves novas e antigas
        const fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        const fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        const fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        complaints = [
            ...fichasBacen,
            ...fichasN2,
            ...fichasChatbot
        ];
        console.log('📋 Reclamações carregadas (fallback localStorage):', complaints.length);
    }
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que o logo da home está usando o símbolo branco
    function garantirLogoPadrao() {
        const logoHome = document.getElementById('logo-home');
        const logoHeader = document.querySelector('.logo-header');
        const logoSymboloBranco = 'img/simbolo_velotax_ajustada_branco.png';
        
        // Verificar e corrigir logo-home
        if (logoHome && logoHome.src && !logoHome.src.includes('simbolo_velotax_ajustada_branco')) {
            logoHome.src = logoSymboloBranco;
            console.log('✅ Logo da home corrigido para símbolo branco');
        }
        
        // Verificar e corrigir qualquer logo-header na home
        if (logoHeader && logoHeader.src && !logoHeader.src.includes('simbolo_velotax_ajustada_branco')) {
            logoHeader.src = logoSymboloBranco;
            console.log('✅ Logo header corrigido para símbolo branco');
        }
        
        // Garantir que não há logo de Natal ou logo colorido grande
        if (logoHome && logoHome.src && (logoHome.src.includes('natal') || logoHome.src.includes('velotax_ajustada_cor'))) {
            logoHome.src = logoSymboloBranco;
            console.log('✅ Logo substituído por símbolo branco');
        }
    }
    
    // Executar imediatamente
    garantirLogoPadrao();
    
    // Executar novamente após um delay para garantir
    setTimeout(garantirLogoPadrao, 500);
    
    // Executar periodicamente para garantir que não mude
    setInterval(garantirLogoPadrao, 5000);
    
    // Mostra loading
    if (window.loadingVelotax) {
        window.loadingVelotax.mostrar();
        window.loadingVelotax.esconderForcado(); // Segurança: esconde após 5s
    }
    
    // Atualizar home IMEDIATAMENTE (não esperar nada)
    atualizarHomeStats();
    
    // Aguarda o gerenciador de fichas estar pronto
    setTimeout(async () => {
        try {
            initializeApp();
            await carregarFichas();
            await updateDashboard();
            setupEventListeners();
            
            // Atualiza home stats novamente após inicialização
            setTimeout(() => {
                atualizarHomeStats();
                // Esconde loading
                if (window.loadingVelotax) {
                    window.loadingVelotax.esconder();
                }
            }, 300);
        } catch (error) {
            console.error('Erro na inicialização:', error);
            // Garante que o loading seja escondido mesmo em caso de erro
            if (window.loadingVelotax) {
                window.loadingVelotax.esconder();
            }
        }
    }, 100);
    
    // Listener para atualizar home quando uma nova reclamação for salva
    window.addEventListener('reclamacaoSalva', async function(event) {
        console.log('📢 Evento reclamacaoSalva recebido:', event.detail);
        
        // Recarregar dados ANTES de atualizar
        try {
            // Recarregar fichas de todas as fontes
            if (typeof carregarFichas === 'function') {
                await carregarFichas();
            }
            
            // Aguardar um pouco para garantir que os dados foram carregados
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Atualizar dashboard (que usa os cards: total-complaints, in-progress, completed, responded)
            if (typeof updateDashboard === 'function') {
                await carregarFichas(); // Recarregar antes de atualizar
                updateDashboard();
                console.log('✅ Dashboard atualizado após nova reclamação');
            }
            
            // Atualizar home stats (se os elementos existirem)
            if (typeof atualizarHomeStats === 'function') {
                atualizarHomeStats();
                console.log('✅ Home stats atualizada após nova reclamação');
            }
            
            // Se o dashboard avançado existir, atualizar também
            if (window.dashboardAvancado && typeof window.dashboardAvancado.atualizarDados === 'function') {
                window.dashboardAvancado.atualizarDados();
                console.log('✅ Dashboard avançado atualizado após nova reclamação');
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar após nova reclamação:', error);
        }
    });
    
    // Atualizar home periodicamente (a cada 2 segundos) para garantir sincronização
    setInterval(() => {
        atualizarHomeStats();
    }, 2000);
});

// === INICIALIZAR APLICAÇÃO ===
function initializeApp() {
    // Mostrar seção home por padrão
    showSection('home');
    atualizarHomeStats();
    
    // Configurar data atual nos campos de data
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-reclamacao').value = today;
    document.getElementById('data-recebimento').value = today;
    document.getElementById('data-status').value = today;
    
    // Carregar dados salvos se existirem
    loadFormData();
}

// === NAVEGAÇÃO ===
// === DASHBOARD GERAL ===
async function atualizarDashboardGeral() {
    console.log('📊 [Dashboard Geral] Atualizando dashboard consolidado...');
    console.log('🔍 [Dashboard Geral] armazenamentoReclamacoes existe?', !!window.armazenamentoReclamacoes);
    console.log('🔍 [Dashboard Geral] firebaseDB existe?', !!window.firebaseDB);
    console.log('🔍 [Dashboard Geral] firebaseDB.inicializado?', window.firebaseDB?.inicializado);
    
    // Carregar dados de todos os canais
    let fichasBacen = [];
    let fichasN2 = [];
    let fichasChatbot = [];
    
    if (window.armazenamentoReclamacoes) {
        try {
            console.log('📥 [Dashboard Geral] Carregando BACEN...');
            fichasBacen = await window.armazenamentoReclamacoes.carregarTodos('bacen') || [];
            console.log('✅ [Dashboard Geral] BACEN carregado:', fichasBacen.length);
            
            console.log('📥 [Dashboard Geral] Carregando N2...');
            fichasN2 = await window.armazenamentoReclamacoes.carregarTodos('n2') || [];
            console.log('✅ [Dashboard Geral] N2 carregado:', fichasN2.length);
            
            console.log('📥 [Dashboard Geral] Carregando Chatbot...');
            fichasChatbot = await window.armazenamentoReclamacoes.carregarTodos('chatbot') || [];
            console.log('✅ [Dashboard Geral] Chatbot carregado:', fichasChatbot.length);
        } catch (error) {
            console.error('❌ [Dashboard Geral] Erro ao carregar do armazenamentoReclamacoes:', error);
            // Fallback para localStorage
            fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
            fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
            fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
            console.log('📦 [Dashboard Geral] Usando fallback localStorage:', { bacen: fichasBacen.length, n2: fichasN2.length, chatbot: fichasChatbot.length });
        }
    } else {
        console.warn('⚠️ [Dashboard Geral] armazenamentoReclamacoes não existe, usando localStorage');
        // Fallback: localStorage
        fichasBacen = JSON.parse(localStorage.getItem('velotax_reclamacoes_bacen') || localStorage.getItem('velotax_demandas_bacen') || '[]');
        fichasN2 = JSON.parse(localStorage.getItem('velotax_reclamacoes_n2') || localStorage.getItem('velotax_demandas_n2') || '[]');
        fichasChatbot = JSON.parse(localStorage.getItem('velotax_reclamacoes_chatbot') || localStorage.getItem('velotax_demandas_chatbot') || '[]');
        console.log('📦 [Dashboard Geral] Dados do localStorage:', { bacen: fichasBacen.length, n2: fichasN2.length, chatbot: fichasChatbot.length });
    }
    
    // Consolidar todas as fichas
    const todasFichas = [...fichasBacen, ...fichasN2, ...fichasChatbot];
    
    // Calcular métricas gerais
    const totalGeral = todasFichas.length;
    const emTratativaGeral = todasFichas.filter(f => f.status === 'em-tratativa').length;
    const concluidasGeral = todasFichas.filter(f => f.status === 'concluido' || f.status === 'concluído').length;
    const respondidasGeral = todasFichas.filter(f => f.status === 'respondido').length;
    
    // Métricas BACEN
    const totalBacen = fichasBacen.length;
    const emTratativaBacen = fichasBacen.filter(f => f.status === 'em-tratativa').length;
    const concluidasBacen = fichasBacen.filter(f => f.status === 'concluido' || f.status === 'concluído').length;
    
    // Métricas N2
    const totalN2 = fichasN2.length;
    const emTratativaN2 = fichasN2.filter(f => f.status === 'em-tratativa').length;
    const concluidasN2 = fichasN2.filter(f => f.status === 'concluido' || f.status === 'concluído').length;
    
    // Métricas Chatbot
    const totalChatbot = fichasChatbot.length;
    const autoChatbot = fichasChatbot.filter(f => {
        if (f.resolvidoAutomaticamente === true || f.resolvidoAutomaticamente === 'Sim') return true;
        if (f.respostaBot === 'Sim' || f.respostaBot === 'sim') return true;
        return false;
    }).length;
    const encaminhadasChatbot = fichasChatbot.filter(f => {
        if (f.encaminhadoHumano === true || f.encaminhadoHumano === 'Sim') return true;
        if (f.respostaBot === 'Não' || f.respostaBot === 'não' || f.respostaBot === 'Nao') return true;
        return false;
    }).length;
    
    // Atualizar elementos HTML
    atualizarElemento('total-geral', totalGeral);
    atualizarElemento('em-tratativa-geral', emTratativaGeral);
    atualizarElemento('concluidas-geral', concluidasGeral);
    atualizarElemento('respondidas-geral', respondidasGeral);
    
    // Atualizar por canal
    atualizarElemento('total-bacen', totalBacen);
    atualizarElemento('em-tratativa-bacen', emTratativaBacen);
    atualizarElemento('concluidas-bacen', concluidasBacen);
    
    atualizarElemento('total-n2', totalN2);
    atualizarElemento('em-tratativa-n2', emTratativaN2);
    atualizarElemento('concluidas-n2', concluidasN2);
    
    atualizarElemento('total-chatbot', totalChatbot);
    atualizarElemento('auto-chatbot', autoChatbot);
    atualizarElemento('encaminhadas-chatbot', encaminhadasChatbot);
    
    console.log('✅ [Dashboard Geral] Atualizado:', {
        totalGeral,
        bacen: { total: totalBacen, emTratativa: emTratativaBacen },
        n2: { total: totalN2, emTratativa: emTratativaN2 },
        chatbot: { total: totalChatbot, auto: autoChatbot, encaminhadas: encaminhadasChatbot }
    });
    
    // Renderizar gráficos consolidados
    renderizarGraficosDashboardGeral(todasFichas, fichasBacen, fichasN2, fichasChatbot);
}

// Função para renderizar gráficos na dashboard geral
function renderizarGraficosDashboardGeral(todasFichas, fichasBacen, fichasN2, fichasChatbot) {
    console.log('📊 [Dashboard Geral] Renderizando gráficos...');
    
    // Gráfico de Status Geral
    renderizarGraficoStatusGeral(todasFichas);
    
    // Gráfico Mensal Consolidado
    renderizarGraficoMensalGeral(todasFichas);
    
    // Gráfico por Canal
    renderizarGraficoCanalGeral(fichasBacen, fichasN2, fichasChatbot);
    
    // Gráfico Status por Canal
    renderizarGraficoStatusCanalGeral(fichasBacen, fichasN2, fichasChatbot);
}

// Gráfico de Status Geral
function renderizarGraficoStatusGeral(todasFichas) {
    const container = document.getElementById('grafico-status-geral');
    if (!container) return;
    
    const statusCount = {};
    todasFichas.forEach(f => {
        const status = f.status || 'sem-status';
        const statusNormalizado = status.toLowerCase().trim().replace('í', 'i').replace('é', 'e');
        statusCount[statusNormalizado] = (statusCount[statusNormalizado] || 0) + 1;
    });
    
    const labels = Object.keys(statusCount);
    const values = Object.values(statusCount);
    const cores = {
        'nao-iniciado': '#FF8400',
        'em-tratativa': '#1634FF',
        'concluido': '#1DFDB9',
        'concluído': '#1DFDB9',
        'respondido': '#791DD0',
        'sem-status': '#666'
    };
    
    container.innerHTML = criarGraficoBarras(labels, values, cores);
}

// Gráfico Mensal Consolidado
function renderizarGraficoMensalGeral(todasFichas) {
    const container = document.getElementById('grafico-mensal-geral');
    if (!container) return;
    
    console.log('📊 [renderizarGraficoMensalGeral] Total de fichas:', todasFichas.length);
    
    const mesesCount = {};
    let fichasComData = 0;
    let fichasSemData = 0;
    
    todasFichas.forEach((f, index) => {
        // Tentar diferentes campos de data baseado no tipo
        let dataParaMes = null;
        
        // Para N2, priorizar dataEntradaN2 ou dataEntradaAtendimento
        // dataEntrada também é da planilha (não é dataCriacao que é a data de importação)
        // NÃO usar dataCriacao como fallback pois é a data de inserção na plataforma, não a data do caso
        if (f.tipoDemanda === 'n2') {
            dataParaMes = f.dataEntradaN2 || f.dataEntradaAtendimento || f.dataEntrada || f.dataReclamacao;
            // Se não tiver nenhuma das datas acima, tentar extrair da planilha (campo Data)
            if (!dataParaMes && f.data) {
                dataParaMes = f.data;
            }
        }
               // Para Chatbot, priorizar dataClienteChatbot
               // NÃO usar dataCriacao como fallback pois é a data de inserção na plataforma, não a data do caso
               else if (f.tipoDemanda === 'chatbot') {
                   dataParaMes = f.dataClienteChatbot || f.dataEntrada || f.dataReclamacao;
                   // Se não tiver dataClienteChatbot, tentar extrair da planilha (campo Data)
                   if (!dataParaMes && f.data) {
                       dataParaMes = f.data;
                   }
               }
        // Para BACEN, usar dataEntrada (da planilha) primeiro, não dataCriacao (data de importação)
        else {
            dataParaMes = f.dataEntrada || f.dataRecebimento || f.dataReclamacao;
            // Só usar dataCriacao como último recurso se não houver dataEntrada
            if (!dataParaMes) {
                dataParaMes = f.dataCriacao;
            }
        }
        
        if (dataParaMes) {
            // Tentar parsear como Date
            let data = null;
            if (dataParaMes instanceof Date) {
                data = dataParaMes;
            } else if (typeof dataParaMes === 'string') {
                // Tentar diferentes formatos de data
                data = new Date(dataParaMes);
                // Se falhar, tentar formato DD/MM/YYYY
                if (isNaN(data.getTime()) && dataParaMes.includes('/')) {
                    const partes = dataParaMes.split('/');
                    if (partes.length === 3) {
                        data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                    }
                }
            }
            
            if (data && !isNaN(data.getTime())) {
                const mes = `${data.getMonth() + 1}/${data.getFullYear()}`;
                mesesCount[mes] = (mesesCount[mes] || 0) + 1;
                fichasComData++;
                
                // Log das primeiras 5 fichas para debug
                if (fichasComData <= 5) {
                    console.log(`📅 [${fichasComData}] Ficha ${f.tipoDemanda || 'sem-tipo'}: dataParaMes="${dataParaMes}" → mes="${mes}"`);
                }
            } else {
                fichasSemData++;
                // Log das primeiras 5 fichas sem data para debug
                if (fichasSemData <= 5) {
                    console.log(`⚠️ [${fichasSemData}] Ficha sem data válida: tipo=${f.tipoDemanda || 'sem-tipo'}, dataParaMes="${dataParaMes}"`);
                }
            }
        } else {
            fichasSemData++;
        }
    });
    
    console.log(`📊 [renderizarGraficoMensalGeral] Fichas com data: ${fichasComData}, sem data: ${fichasSemData}`);
    console.log(`📊 [renderizarGraficoMensalGeral] Meses encontrados:`, Object.keys(mesesCount));
    
    if (Object.keys(mesesCount).length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
        return;
    }
    
    // Ordenar meses
    const mesesOrdenados = Object.keys(mesesCount).sort((a, b) => {
        const [ma, ya] = a.split('/').map(Number);
        const [mb, yb] = b.split('/').map(Number);
        if (ya !== yb) return ya - yb;
        return ma - mb;
    });
    
    // Preencher meses intermediários (limitado a um período razoável)
    if (mesesOrdenados.length > 0) {
        const [primeiroMesRaw, primeiroAnoRaw] = mesesOrdenados[0].split('/');
        const [ultimoMesRaw, ultimoAnoRaw] = mesesOrdenados[mesesOrdenados.length - 1].split('/');
        const primeiroMes = parseInt(primeiroMesRaw);
        const primeiroAno = parseInt(primeiroAnoRaw);
        const ultimoMes = parseInt(ultimoMesRaw);
        const ultimoAno = parseInt(ultimoAnoRaw);
        
        // Limitar a um período máximo de 24 meses (2 anos) para evitar gráficos muito longos
        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        const mesAtual = dataAtual.getMonth() + 1;
        
        // Calcular data de início (máximo 24 meses atrás)
        let dataInicio = new Date(anoAtual, mesAtual - 24, 1);
        let dataFim = new Date(anoAtual, mesAtual, 0);
        
        // Se o primeiro mês dos dados for mais recente que o limite, usar ele
        const primeiroData = new Date(primeiroAno, primeiroMes - 1, 1);
        if (primeiroData > dataInicio) {
            dataInicio = primeiroData;
        }
        
        // Se o último mês dos dados for mais antigo que o limite, usar ele
        const ultimoData = new Date(ultimoAno, ultimoMes - 1, 1);
        if (ultimoData < dataFim) {
            dataFim = ultimoData;
        }
        
        // Limitar ainda mais: se o intervalo for maior que 24 meses, usar apenas os últimos 24 meses
        const mesesDiferenca = (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + (dataFim.getMonth() - dataInicio.getMonth());
        if (mesesDiferenca > 24) {
            dataInicio = new Date(dataFim.getFullYear(), dataFim.getMonth() - 23, 1);
        }
        
        const meses = [];
        const valores = [];
        let mesAtualLoop = dataInicio.getMonth() + 1;
        let anoAtualLoop = dataInicio.getFullYear();
        const mesFim = dataFim.getMonth() + 1;
        const anoFim = dataFim.getFullYear();
        
        while (anoAtualLoop < anoFim || (anoAtualLoop === anoFim && mesAtualLoop <= mesFim)) {
            const chaveMes = `${mesAtualLoop}/${anoAtualLoop}`;
            meses.push(chaveMes);
            valores.push(mesesCount[chaveMes] || 0);
            mesAtualLoop++;
            if (mesAtualLoop > 12) {
                mesAtualLoop = 1;
                anoAtualLoop++;
            }
        }
        
        container.innerHTML = criarGraficoLinha(meses, valores);
        console.log(`✅ [renderizarGraficoMensalGeral] Gráfico renderizado com ${meses.length} meses`);
    } else {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--texto-secundario);">Nenhum dado disponível</p>';
        console.warn('⚠️ [renderizarGraficoMensalGeral] Nenhum mês encontrado para renderizar');
    }
}

// Gráfico por Canal
function renderizarGraficoCanalGeral(fichasBacen, fichasN2, fichasChatbot) {
    const container = document.getElementById('grafico-canal-geral');
    if (!container) return;
    
    const canalCount = {
        'BACEN': fichasBacen.length,
        'N2': fichasN2.length,
        'Chatbot': fichasChatbot.length
    };
    
    const labels = Object.keys(canalCount);
    const values = Object.values(canalCount);
    const cores = {
        'BACEN': '#1634FF',
        'N2': '#1DFDB9',
        'Chatbot': '#FF8400'
    };
    
    container.innerHTML = criarGraficoBarras(labels, values, cores);
}

// Gráfico Status por Canal
function renderizarGraficoStatusCanalGeral(fichasBacen, fichasN2, fichasChatbot) {
    const container = document.getElementById('grafico-status-canal-geral');
    if (!container) return;
    
    const statusPorCanal = {
        'BACEN': {},
        'N2': {},
        'Chatbot': {}
    };
    
    [fichasBacen, fichasN2, fichasChatbot].forEach((fichas, index) => {
        const canal = ['BACEN', 'N2', 'Chatbot'][index];
        fichas.forEach(f => {
            const status = f.status || 'sem-status';
            const statusNormalizado = status.toLowerCase().trim().replace('í', 'i').replace('é', 'e');
            statusPorCanal[canal][statusNormalizado] = (statusPorCanal[canal][statusNormalizado] || 0) + 1;
        });
    });
    
    // Criar gráfico de barras agrupadas
    const statuses = ['nao-iniciado', 'em-tratativa', 'concluido', 'concluído', 'respondido'];
    const labels = ['BACEN', 'N2', 'Chatbot'];
    const datasets = statuses.map(status => ({
        label: status === 'nao-iniciado' ? 'Não Iniciado' : 
               status === 'em-tratativa' ? 'Em Tratativa' :
               status === 'concluido' || status === 'concluído' ? 'Concluído' :
               status === 'respondido' ? 'Respondido' : status,
        values: labels.map(canal => statusPorCanal[canal][status] || 0)
    }));
    
    container.innerHTML = criarGraficoBarrasAgrupadas(labels, datasets);
}

// Funções auxiliares para criar gráficos
function criarGraficoBarras(labels, values, cores) {
    const maxValue = Math.max(...values, 1);
    const alturaMax = 200;
    
    return `
        <div class="grafico-barras" style="min-height: 300px; padding: 20px;">
            <div class="grafico-barras-container" style="display: flex; align-items: flex-end; gap: 20px; min-height: 220px;">
                ${labels.map((label, i) => {
                    const altura = (values[i] / maxValue) * alturaMax;
                    const cor = cores && cores[label] ? cores[label] : '#1634FF';
                    return `
                        <div class="barra-item" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <div style="height: 200px; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
                                <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${values[i]}</div>
                                <div style="height: ${altura}px; background: ${cor}; width: 80%; border-radius: 4px 4px 0 0;"></div>
                            </div>
                            <div style="margin-top: 12px; font-size: 12px; text-align: center;">${label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function criarGraficoLinha(meses, valores) {
    const maxValue = Math.max(...valores, 1);
    const alturaMax = 200;
    const largura = Math.max(600, meses.length * 60);
    const paddingEsq = 40;
    const paddingDir = 20;
    const paddingTopo = 20;
    const paddingBase = 60;
    const larguraUtil = largura - (paddingEsq + paddingDir);
    
    const pontos = valores.map((v, i) => ({
        x: paddingEsq + (meses.length <= 1 ? 0 : (i / (meses.length - 1)) * larguraUtil),
        y: paddingTopo + (alturaMax - (v / maxValue) * alturaMax)
    }));
    
    const alturaTotal = paddingTopo + alturaMax + paddingBase;
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return `
        <div class="grafico-linha" style="padding: 20px; min-height: 300px; overflow-x: auto;">
            <svg width="${largura}" height="${alturaTotal}" viewBox="0 0 ${largura} ${alturaTotal}">
                <line x1="${paddingEsq}" y1="${paddingTopo + alturaMax}" x2="${paddingEsq + larguraUtil}" y2="${paddingTopo + alturaMax}" stroke="#444" stroke-width="2"/>
                <polyline points="${pontos.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="#1634FF" stroke-width="3"/>
                ${pontos.map((p, i) => `
                    <circle cx="${p.x}" cy="${p.y}" r="5" fill="#1634FF"/>
                    <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff">${valores[i]}</text>
                    <text x="${p.x}" y="${paddingTopo + alturaMax + 30}" text-anchor="middle" font-size="11" fill="#fff">
                        ${(() => {
                            const [mes, ano] = meses[i].split('/');
                            return `${nomesMeses[parseInt(mes) - 1]}/${ano.slice(-2)}`;
                        })()}
                    </text>
                `).join('')}
            </svg>
        </div>
    `;
}

function criarGraficoBarrasAgrupadas(labels, datasets) {
    const maxValue = Math.max(...datasets.flatMap(d => d.values), 1);
    const alturaMax = 200;
    const cores = ['#1634FF', '#1DFDB9', '#FF8400', '#791DD0', '#FF00D7'];
    
    return `
        <div class="grafico-barras-agrupadas" style="min-height: 300px; padding: 20px;">
            <div class="grafico-barras-container" style="display: flex; align-items: flex-end; gap: 10px; min-height: 220px;">
                ${labels.map((label, i) => `
                    <div class="barra-grupo" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <div style="height: 200px; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 2px;">
                            ${datasets.map((dataset, j) => {
                                const altura = (dataset.values[i] / maxValue) * alturaMax;
                                const cor = cores[j % cores.length];
                                return `
                                    <div style="height: ${altura}px; background: ${cor}; width: 100%; border-radius: 2px;" title="${dataset.label}: ${dataset.values[i]}"></div>
                                `;
                            }).join('')}
                        </div>
                        <div style="margin-top: 12px; font-size: 12px; text-align: center;">${label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="legenda" style="display: flex; gap: 20px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                ${datasets.map((dataset, j) => `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: ${cores[j % cores.length]}; border-radius: 2px;"></div>
                        <span style="font-size: 12px;">${dataset.label}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

// Tornar showSection global imediatamente
window.showSection = function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Ativar botão correspondente
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Atualizar dashboard geral se a seção for exibida
    if (sectionId === 'dashboard-geral') {
        // Aguardar um pouco para garantir que armazenamentoReclamacoes está pronto
        setTimeout(() => {
            atualizarDashboardGeral();
        }, 500);
    }
    
    // Ações específicas por seção
    if (sectionId === 'list') {
        carregarFichas().then(() => {
            renderComplaintsList();
        });
    } else if (sectionId === 'dashboard') {
        carregarFichas().then(() => {
            updateDashboard();
        });
    } else if (sectionId === 'register') {
        loadFormData();
    } else if (sectionId === 'home') {
        atualizarHomeStats();
    }
}

// === FUNÇÕES DE HOME ===
function atualizarHomeStats() {
    console.log('🏠 ========== atualizarHomeStats() INICIADO ==========');
    
    // FUNÇÃO AUXILIAR: Contar de TODAS as fontes possíveis
    function contarReclamacoes(tipo) {
        let total = 0;
        const chaves = [
            `velotax_reclamacoes_${tipo}`,
            `velotax_demandas_${tipo}`,
            `bacen-complaints`,
            `n2-complaints`,
            `chatbot-complaints`
        ];
        
        // Tentar armazenamentoReclamacoes primeiro (síncrono - retorna Promise, então não pode usar aqui)
        // Esta função é síncrona, então vamos usar localStorage como fallback
        
        // Tentar localStorage diretamente
        for (const chave of chaves) {
            try {
                const dados = localStorage.getItem(chave);
                if (dados) {
                    const parsed = JSON.parse(dados);
                    if (Array.isArray(parsed)) {
                        total = Math.max(total, parsed.length);
                        console.log(`📦 ${tipo.toUpperCase()} encontrado em ${chave}:`, parsed.length);
                    }
                }
            } catch (e) {
                // Ignorar erros de parsing
            }
        }
        
        return total;
    }
    
    // Contar reclamações
    const totalBacen = contarReclamacoes('bacen');
    const totalN2 = contarReclamacoes('n2');
    const totalChatbot = contarReclamacoes('chatbot');
    
    // ATUALIZAR ELEMENTOS HTML - FORÇAR ATUALIZAÇÃO
    const bacenTotalEl = document.getElementById('bacen-total');
    const bacenTratativaEl = document.getElementById('bacen-tratativa');
    const n2TotalEl = document.getElementById('n2-total');
    const n2TratativaEl = document.getElementById('n2-tratativa');
    const chatbotTotalEl = document.getElementById('chatbot-total');
    const chatbotTratativaEl = document.getElementById('chatbot-tratativa');
    
    // BACEN
    if (bacenTotalEl) {
        bacenTotalEl.textContent = String(totalBacen);
        bacenTotalEl.innerText = String(totalBacen);
        console.log('✅ BACEN Total atualizado:', totalBacen, 'Elemento encontrado:', !!bacenTotalEl);
    } else {
        console.error('❌ Elemento bacen-total NÃO encontrado no DOM!');
        // Tentar novamente após um delay
        setTimeout(() => {
            const el = document.getElementById('bacen-total');
            if (el) {
                el.textContent = String(totalBacen);
                console.log('✅ BACEN Total atualizado (retry):', totalBacen);
            }
        }, 500);
    }
    
    if (bacenTratativaEl) {
        bacenTratativaEl.textContent = '0'; // Simplificado por enquanto
        console.log('✅ BACEN Em Tratativa atualizado');
    }
    
    // N2
    if (n2TotalEl) {
        n2TotalEl.textContent = String(totalN2);
        n2TotalEl.innerText = String(totalN2);
        console.log('✅ N2 Total atualizado:', totalN2, 'Elemento encontrado:', !!n2TotalEl);
    } else {
        console.error('❌ Elemento n2-total NÃO encontrado no DOM!');
        setTimeout(() => {
            const el = document.getElementById('n2-total');
            if (el) {
                el.textContent = String(totalN2);
                console.log('✅ N2 Total atualizado (retry):', totalN2);
            }
        }, 500);
    }
    
    if (n2TratativaEl) {
        n2TratativaEl.textContent = '0'; // Simplificado por enquanto
        console.log('✅ N2 Em Tratativa atualizado');
    }
    
    // Chatbot
    if (chatbotTotalEl) {
        chatbotTotalEl.textContent = String(totalChatbot);
        chatbotTotalEl.innerText = String(totalChatbot);
        console.log('✅ Chatbot Total atualizado:', totalChatbot, 'Elemento encontrado:', !!chatbotTotalEl);
    } else {
        console.error('❌ Elemento chatbot-total NÃO encontrado no DOM!');
        setTimeout(() => {
            const el = document.getElementById('chatbot-total');
            if (el) {
                el.textContent = String(totalChatbot);
                console.log('✅ Chatbot Total atualizado (retry):', totalChatbot);
            }
        }, 500);
    }
    
    if (chatbotTratativaEl) {
        chatbotTratativaEl.textContent = '0'; // Simplificado por enquanto
        console.log('✅ Chatbot Em Tratativa atualizado');
    }
    
    console.log('🏠 ========== RESUMO FINAL ==========');
    console.log('📊 BACEN:', totalBacen, '| N2:', totalN2, '| Chatbot:', totalChatbot);
    console.log('🏠 ====================================');
    
    // EXPOR FUNÇÃO GLOBAL PARA TESTE
    window.testarContagem = function() {
        console.log('🧪 TESTE DE CONTAGEM:');
        console.log('BACEN:', contarReclamacoes('bacen'));
        console.log('N2:', contarReclamacoes('n2'));
        console.log('Chatbot:', contarReclamacoes('chatbot'));
        console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('velotax')));
    };
}

// === CONFIGURAR EVENT LISTENERS ===
function setupEventListeners() {
    // Formulário de reclamação
    const form = document.getElementById('complaint-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Busca na lista
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filtro por status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', handleStatusFilter);
    }
    
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', formatCPF);
    }
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatPhone);
    }
    
    // Atualizar data do status quando status mudar
    const statusSelect = document.getElementById('status');
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            if (this.value) {
                const dataStatus = document.getElementById('data-status');
                if (dataStatus) {
                    dataStatus.value = new Date().toISOString().split('T')[0];
                }
            }
        });
    }
    
    // Auto-save durante preenchimento
    setupAutoSave();
}

// === FORMULÁRIO ===
async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('Tentando salvar reclamação...'); // Debug
    
    // Obtém tipo de demanda se foi definido
    const tipoDemanda = sessionStorage.getItem('tipoDemandaAtual') || 'bacen';
    
    const complaint = {
        id: generateId(),
        tipoDemanda: tipoDemanda,
        dataReclamacao: document.getElementById('data-reclamacao').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        prazoRetorno: document.getElementById('prazo-retorno').value,
        responsavel: document.getElementById('responsavel').value,
        nomeCliente: document.getElementById('nome-cliente').value,
        cpf: document.getElementById('cpf').value,
        origem: getOrigemValue(),
        motivoReduzido: document.getElementById('motivo-reduzido').value,
        motivoDetalhado: document.getElementById('motivo-detalhado').value,
        telefone: document.getElementById('telefone').value,
        historicoTentativas: getTentativasData(),
        moduloContato: getModuloContatoData(),
        protocolosAnteriores: getProtocolosData(),
        resultadoTratativa: document.getElementById('resultado-tratativa').value,
        status: document.getElementById('status').value,
        dataStatus: document.getElementById('data-status').value,
        dataCriacao: new Date().toISOString()
    };
    
    // Limpa tipo temporário
    sessionStorage.removeItem('tipoDemandaAtual');
    
    // Restaura título do formulário
    const formTitle = document.querySelector('#register h2');
    if (formTitle) {
        formTitle.innerHTML = 'Nova Reclamação';
    }
    
    // Esconde botão voltar
    const btnVoltar = document.getElementById('btn-voltar-form');
    if (btnVoltar) {
        btnVoltar.style.display = 'none';
    }
    
    console.log('Dados da reclamação:', complaint); // Debug
    
    // Validar dados obrigatórios
    if (!validateComplaint(complaint)) {
        console.log('Validação falhou'); // Debug
        return;
    }
    
    // Adicionar reclamação usando gerenciador
    try {
        console.log('Salvando reclamação...', complaint); // Debug
        
        if (window.gerenciadorFichas) {
            console.log('Usando gerenciadorFichas');
            window.gerenciadorFichas.adicionarFicha(complaint);
            carregarFichas();
        } else if (window.supabaseDB) {
            console.log('Usando Supabase');
            // Tentar salvar no Supabase
            await window.supabaseDB.adicionarFicha(complaint);
            await carregarFichas();
        } else {
            console.log('Usando localStorage fallback');
            // Fallback para localStorage
            complaints.push(complaint);
            saveComplaints();
        }
        
        console.log('Reclamação salva com sucesso!'); // Debug
        
        // Limpar dados salvos
        clearFormData();
        
        // Limpar formulário
        clearForm();
        
        // Mostrar mensagem de sucesso
        mostrarAlertaGlobal('Reclamação salva com sucesso!', 'success');
        
        // Atualizar dashboard
        updateDashboard();
        
        // Ir para a lista de reclamações
        showSection('list');
    } catch (error) {
        console.error('Erro ao salvar reclamação:', error);
        mostrarAlertaGlobal('Erro ao salvar reclamação: ' + (error.message || error), 'error');
    }
}

// === VALIDAÇÃO ===
function validateComplaint(complaint) {
    const requiredFields = [
        'dataReclamacao', 'dataRecebimento', 'responsavel', 
        'nomeCliente', 'cpf', 'motivoReduzido', 'status'
    ];
    
    console.log('Validando campos obrigatórios...'); // Debug
    
    for (let field of requiredFields) {
        const value = complaint[field];
        console.log(`Campo ${field}:`, value); // Debug
        
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            console.log(`Campo ${field} está vazio ou inválido`); // Debug
            showAlert(`Campo obrigatório não preenchido: ${getFieldLabel(field)}`, 'error');
            return false;
        }
    }
    
    console.log('Validando CPF:', complaint.cpf); // Debug
    
    // Validar CPF
    if (!validateCPF(complaint.cpf)) {
        console.log('CPF inválido:', complaint.cpf); // Debug
        showAlert('CPF inválido', 'error');
        return false;
    }
    
    console.log('Validação passou!'); // Debug
    return true;
}

function getFieldLabel(field) {
    const labels = {
        'dataReclamacao': 'Data da Reclamação',
        'dataRecebimento': 'Data de Recebimento',
        'responsavel': 'Responsável',
        'nomeCliente': 'Nome do Cliente',
        'cpf': 'CPF',
        'motivoReduzido': 'Motivo Reduzido',
        'status': 'Status'
    };
    return labels[field] || field;
}

function validateCPF(cpf) {
    if (!cpf) {
        console.log('CPF vazio'); // Debug
        return false;
    }
    
    const cpfOriginal = cpf;
    cpf = cpf.replace(/\D/g, '');
    console.log('CPF sem formatação:', cpf); // Debug
    
    if (cpf.length !== 11) {
        console.log('CPF não tem 11 dígitos:', cpf.length); // Debug
        return false;
    }
    
    // CPFs de teste válidos (para desenvolvimento)
    const cpfsTeste = [
        '12345678909', // CPF de teste padrão
        '11111111111', // Para testes rápidos
        '00000000000'  // Para testes rápidos
    ];
    
    if (cpfsTeste.includes(cpf)) {
        console.log('CPF de teste aceito'); // Debug
        return true;
    }
    
    // Verificar se todos os dígitos são iguais (exceto os de teste)
    if (/^(\d)\1{10}$/.test(cpf)) {
        console.log('CPF com todos dígitos iguais'); // Debug
        return false;
    }
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
        console.log('Primeiro dígito verificador inválido'); // Debug
        console.log('Esperado:', remainder, 'Recebido:', parseInt(cpf.charAt(9))); // Debug
        return false;
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
        console.log('Segundo dígito verificador inválido'); // Debug
        console.log('Esperado:', remainder, 'Recebido:', parseInt(cpf.charAt(10))); // Debug
        return false;
    }
    
    console.log('CPF válido!'); // Debug
    return true;
}

// === DADOS DO FORMULÁRIO ===
function getOrigemValue() {
    const origem = document.getElementById('origem').value;
    if (origem === 'outro') {
        const outro = document.getElementById('origem-outro').value;
        return outro || origem;
    }
    return origem;
}

function getTentativasData() {
    const tentativas = [];
    const tentativaItems = document.querySelectorAll('.tentativa-item');
    
    tentativaItems.forEach(item => {
        const datetime = item.querySelector('.tentativa-datetime').value;
        const resultado = item.querySelector('.tentativa-resultado').value;
        const obs = item.querySelector('.tentativa-obs').value;
        
        if (datetime && resultado) {
            tentativas.push({
                datetime,
                resultado,
                observacoes: obs
            });
        }
    });
    
    return tentativas;
}

function getModuloContatoData() {
    return {
        atendimento: document.getElementById('atendimento').checked,
        reclameAqui: document.getElementById('reclame-aqui').checked,
        bacen: document.getElementById('bacen').checked,
        procon: document.getElementById('procon').checked,
        n2: document.getElementById('n2').checked
    };
}

function getProtocolosData() {
    const protocolos = [];
    const protocoloItems = document.querySelectorAll('.protocolo-item');
    
    protocoloItems.forEach(item => {
        const protocolo = item.querySelector('.protocolo-input').value.trim();
        const canal = item.querySelector('.protocolo-canal').value.trim();
        const data = item.querySelector('.protocolo-data').value;
        
        if (protocolo) {
            protocolos.push({
                protocolo,
                canal: canal || '',
                data: data || ''
            });
        }
    });
    
    return protocolos;
}

// === PROTOCOLOS E TENTATIVAS ===
function addProtocolo() {
    const container = document.getElementById('protocolos-container');
    const newItem = document.createElement('div');
    newItem.className = 'protocolo-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Número do Protocolo</label>
                <input type="text" class="velohub-input protocolo-input" placeholder="Digite o número do protocolo">
            </div>
            <div class="form-group">
                <label>Canal</label>
                <input type="text" class="velohub-input protocolo-canal" placeholder="Digite o canal">
            </div>
            <div class="form-group">
                <label>Data</label>
                <input type="date" class="velohub-input protocolo-data">
            </div>
        </div>
        <button type="button" class="btn-remove" onclick="removeProtocolo(this)">❌</button>
    `;
    container.appendChild(newItem);
}

function removeProtocolo(button) {
    button.parentElement.remove();
}

function addTentativa() {
    const container = document.getElementById('historico-container');
    const newItem = document.createElement('div');
    newItem.className = 'tentativa-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Data/Hora</label>
                <input type="datetime-local" class="velohub-input tentativa-datetime">
            </div>
            <div class="form-group">
                <label>Resultado</label>
                <select class="velohub-input tentativa-resultado">
                    <option value="">Selecione...</option>
                    <option value="contatado">Contatado</option>
                    <option value="nao-atendeu">Não Atendeu</option>
                    <option value="telefone-ocupado">Telefone Ocupado</option>
                    <option value="nao-existe">Número Não Existe</option>
                    <option value="mensagem-voz">Mensagem de Voz</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Observações</label>
            <input type="text" class="velohub-input tentativa-obs" placeholder="Observações sobre a tentativa...">
        </div>
        <button type="button" class="btn-remove" onclick="removeTentativa(this)">❌</button>
    `;
    container.appendChild(newItem);
}

function removeTentativa(button) {
    button.parentElement.remove();
}

// === MÁSCARAS ===
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

// === LISTA DE RECLAMAÇÕES ===
function renderComplaintsList() {
    const container = document.getElementById('complaints-list');
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const tipoFilter = document.getElementById('tipo-filter')?.value || '';
    
    let filteredComplaints = complaints;
    
    // Aplicar filtro de busca
    if (searchTerm) {
        filteredComplaints = filteredComplaints.filter(complaint => {
            const nome = (complaint.nomeCliente || '').toLowerCase();
            const cpf = (complaint.cpf || '').toLowerCase();
            const motivo = (complaint.motivoReduzido || '').toLowerCase();
            const obs = (complaint.observacoes || '').toLowerCase();
            const motivoDetalhado = (complaint.motivoDetalhado || '').toLowerCase();
            
            return nome.includes(searchTerm) ||
                   cpf.includes(searchTerm) ||
                   motivo.includes(searchTerm) ||
                   obs.includes(searchTerm) ||
                   motivoDetalhado.includes(searchTerm);
        });
    }
    
    // Aplicar filtro de tipo
    if (tipoFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.tipoDemanda === tipoFilter
        );
    }
    
    // Aplicar filtro de status
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => 
            complaint.status === statusFilter
        );
    }
    
    if (filteredComplaints.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhuma reclamação encontrada</div>';
        return;
    }
    
    container.innerHTML = filteredComplaints.map(complaint => createComplaintCard(complaint)).join('');
}

function createComplaintCard(complaint) {
    const statusLabels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    
    const tipoLabels = {
        'bacen': '🏦 BACEN',
        'n2': '🔄 N2',
        'chatbot': '🤖 Chatbot'
    };
    
    const statusClass = `status-${complaint.status}`;
    const statusLabel = statusLabels[complaint.status] || complaint.status;
    const tipoLabel = tipoLabels[complaint.tipoDemanda] || '';
    const tipoClass = complaint.tipoDemanda || 'bacen';
    
    return `
        <div class="complaint-item" onclick="toggleComplaintDetails(this)">
            <div class="complaint-header">
                <div class="complaint-title">
                    ${complaint.nomeCliente}
                    <span class="ficha-perfil-badge ${tipoClass}">${tipoLabel}</span>
                </div>
                <div class="complaint-status ${statusClass}">${statusLabel}</div>
            </div>
            <div class="complaint-summary">
                <div class="complaint-detail">
                    <strong>CPF:</strong> ${complaint.cpf}
                </div>
                <div class="complaint-detail">
                    <strong>Motivo:</strong> ${complaint.motivoReduzido}
                </div>
                <div class="complaint-detail">
                    <strong>Responsável:</strong> ${complaint.responsavel}
                </div>
                <div class="complaint-detail">
                    <strong>Data:</strong> ${formatDate(complaint.dataReclamacao)}
                </div>
            </div>
            <div class="complaint-details">
                <div class="complaint-detail">
                    <strong>Data de Recebimento:</strong> ${formatDate(complaint.dataRecebimento)}
                </div>
                <div class="complaint-detail">
                    <strong>Prazo Retorno BACEN:</strong> ${complaint.prazoRetorno ? formatDate(complaint.prazoRetorno) : 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Origem:</strong> ${complaint.origem || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Telefone:</strong> ${complaint.telefone || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Motivo Detalhado:</strong> ${complaint.motivoDetalhado || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Resultado da Tratativa:</strong> ${complaint.resultadoTratativa || 'Não informado'}
                </div>
                <div class="complaint-detail">
                    <strong>Data do Status:</strong> ${formatDate(complaint.dataStatus)}
                </div>
                ${renderModuloContato(complaint.moduloContato)}
                ${renderProtocolos(complaint.protocolosAnteriores)}
                ${renderTentativas(complaint.historicoTentativas)}
            </div>
            <div class="expand-icon">▼</div>
        </div>
    `;
}

function renderModuloContato(modulo) {
    const contatos = [];
    if (modulo.atendimento) contatos.push('Atendimento');
    if (modulo.reclameAqui) contatos.push('Reclame Aqui');
    if (modulo.bacen) contatos.push('BACEN');
    if (modulo.procon) contatos.push('Procon');
    if (modulo.n2) contatos.push('N2');
    
    return `
        <div class="complaint-detail">
            <strong>Módulo de Contato:</strong> ${contatos.length > 0 ? contatos.join(', ') : 'Nenhum selecionado'}
        </div>
    `;
}

function renderProtocolos(protocolos) {
    if (protocolos.length === 0) return '';
    
    const protocolosHtml = protocolos.map(protocolo => {
        if (typeof protocolo === 'string') {
            // Formato antigo (apenas string)
            return protocolo;
        } else {
            // Formato novo (objeto com protocolo, canal, data)
            let result = protocolo.protocolo;
            if (protocolo.canal) result += ` (${protocolo.canal})`;
            if (protocolo.data) result += ` - ${formatDate(protocolo.data)}`;
            return result;
        }
    }).join(', ');
    
    return `
        <div class="complaint-detail">
            <strong>Protocolos Anteriores:</strong> ${protocolosHtml}
        </div>
    `;
}

function renderTentativas(tentativas) {
    if (tentativas.length === 0) return '';
    
    const tentativasHtml = tentativas.map(tentativa => `
        <div class="tentativa-detail">
            <strong>${formatDateTime(tentativa.datetime)}</strong> - 
            ${tentativa.resultado}${tentativa.observacoes ? ` (${tentativa.observacoes})` : ''}
        </div>
    `).join('');
    
    return `
        <div class="complaint-detail">
            <strong>Histórico de Tentativas:</strong>
            <div class="tentativas-list">${tentativasHtml}</div>
        </div>
    `;
}

function toggleComplaintDetails(element) {
    element.classList.toggle('expanded');
    const details = element.querySelector('.complaint-details');
    details.classList.toggle('expanded');
}

// === BUSCA E FILTROS ===
function handleSearch() {
    renderComplaintsList();
}

function handleStatusFilter() {
    renderComplaintsList();
}

function handleTipoFilter() {
    renderComplaintsList();
}

// Configurar eventos de filtro
if (document.getElementById('tipo-filter')) {
    document.getElementById('tipo-filter').addEventListener('change', handleTipoFilter);
}

// Função para abrir busca avançada
function abrirBuscaAvancada() {
    if (window.sistemaBusca) {
        window.sistemaBusca.mostrarModalBusca();
    } else {
        alert('Sistema de busca avançada carregando...');
    }
}

// === DASHBOARD ===
async function updateDashboard() {
    // Recarregar dados ANTES de atualizar os cards (AGUARDAR)
    await carregarFichas();
    
    // Usar a variável complaints atualizada
    const total = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'em-tratativa').length;
    const completed = complaints.filter(c => c.status === 'concluido').length;
    const responded = complaints.filter(c => c.status === 'respondido').length;
    
    // Atualizar os elementos do dashboard se existirem
    const totalEl = document.getElementById('total-complaints');
    const inProgressEl = document.getElementById('in-progress');
    const completedEl = document.getElementById('completed');
    const respondedEl = document.getElementById('responded');
    
    if (totalEl) totalEl.textContent = total;
    if (inProgressEl) inProgressEl.textContent = inProgress;
    if (completedEl) completedEl.textContent = completed;
    if (respondedEl) respondedEl.textContent = responded;
    
    console.log('📊 Dashboard atualizado:', { total, inProgress, completed, responded });
}

// === RELATÓRIOS ===
function generatePeriodReport() {
    const startDate = prompt('Data inicial (DD/MM/AAAA):');
    const endDate = prompt('Data final (DD/MM/AAAA):');
    
    if (!startDate || !endDate) return;
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    const filteredComplaints = complaints.filter(complaint => {
        const complaintDate = new Date(complaint.dataReclamacao);
        return complaintDate >= start && complaintDate <= end;
    });
    
    showReport('Relatório por Período', filteredComplaints, `Período: ${startDate} a ${endDate}`);
}

function generateStatusReport() {
    const statusCounts = {};
    complaints.forEach(complaint => {
        statusCounts[complaint.status] = (statusCounts[complaint.status] || 0) + 1;
    });
    
    const reportData = Object.entries(statusCounts).map(([status, count]) => ({
        status: getStatusLabel(status),
        count: count,
        percentage: ((count / complaints.length) * 100).toFixed(1)
    }));
    
    showStatusReport('Relatório por Status', reportData);
}

function generateResponsibleReport() {
    const responsibleCounts = {};
    complaints.forEach(complaint => {
        responsibleCounts[complaint.responsavel] = (responsibleCounts[complaint.responsavel] || 0) + 1;
    });
    
    const reportData = Object.entries(responsibleCounts).map(([responsible, count]) => ({
        responsible,
        count,
        percentage: ((count / complaints.length) * 100).toFixed(1)
    }));
    
    showResponsibleReport('Relatório por Responsável', reportData);
}

function generateFullReport() {
    showReport('Relatório Completo', complaints, `Total de ${complaints.length} reclamações`);
}

function showReport(title, data, subtitle) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <div class="report-table">
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>CPF</th>
                        <th>Status</th>
                        <th>Responsável</th>
                        <th>Data</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(complaint => `
                        <tr>
                            <td>${complaint.nomeCliente}</td>
                            <td>${complaint.cpf}</td>
                            <td>${getStatusLabel(complaint.status)}</td>
                            <td>${complaint.responsavel}</td>
                            <td>${formatDate(complaint.dataReclamacao)}</td>
                            <td>${complaint.motivoReduzido}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function showStatusReport(title, data) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <div class="status-chart">
            ${data.map(item => `
                <div class="status-item">
                    <div class="status-label">${item.status}</div>
                    <div class="status-bar">
                        <div class="status-fill" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="status-count">${item.count} (${item.percentage}%)</div>
                </div>
            `).join('')}
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function showResponsibleReport(title, data) {
    const content = document.getElementById('report-content');
    content.style.display = 'block';
    content.innerHTML = `
        <h3>${title}</h3>
        <div class="responsible-chart">
            ${data.map(item => `
                <div class="responsible-item">
                    <div class="responsible-label">${item.responsible}</div>
                    <div class="responsible-bar">
                        <div class="responsible-fill" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="responsible-count">${item.count} (${item.percentage}%)</div>
                </div>
            `).join('')}
        </div>
        <button class="velohub-btn" onclick="exportReport()">📊 Exportar Relatório</button>
    `;
}

function exportReport() {
    const data = complaints.map(complaint => ({
        'Data Reclamação': formatDate(complaint.dataReclamacao),
        'Data Recebimento': formatDate(complaint.dataRecebimento),
        'Cliente': complaint.nomeCliente,
        'CPF': complaint.cpf,
        'Status': getStatusLabel(complaint.status),
        'Responsável': complaint.responsavel,
        'Motivo': complaint.motivoReduzido,
        'Origem': complaint.origem || '',
        'Telefone': complaint.telefone || ''
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'relatorio-reclamacoes.csv');
}

// === AUTO-SAVE ===
function setupAutoSave() {
    const form = document.getElementById('complaint-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
        input.addEventListener('change', saveFormData);
    });
    
    // Carregar dados salvos ao entrar na seção
    document.addEventListener('click', function(e) {
        if (e.target && e.target.onclick && e.target.onclick.toString().includes('showSection(\'register\')')) {
            loadFormData();
        }
    });
}

function saveFormData() {
    const formData = {
        dataReclamacao: document.getElementById('data-reclamacao').value,
        dataRecebimento: document.getElementById('data-recebimento').value,
        prazoRetorno: document.getElementById('prazo-retorno').value,
        responsavel: document.getElementById('responsavel').value,
        nomeCliente: document.getElementById('nome-cliente').value,
        cpf: document.getElementById('cpf').value,
        origem: document.getElementById('origem').value,
        origemOutro: document.getElementById('origem-outro').value,
        motivoReduzido: document.getElementById('motivo-reduzido').value,
        motivoDetalhado: document.getElementById('motivo-detalhado').value,
        telefone: document.getElementById('telefone').value,
        resultadoTratativa: document.getElementById('resultado-tratativa').value,
        status: document.getElementById('status').value,
        dataStatus: document.getElementById('data-status').value,
        moduloContato: getModuloContatoData(),
        protocolos: getProtocolosData(),
        tentativas: getTentativasData()
    };
    
    localStorage.setItem('bacen-form-draft', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('bacen-form-draft');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            // Preencher campos básicos
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = formData[key] || '';
                }
            });
            
            // Tratar origem especial
            if (formData.origem === 'outro') {
                document.getElementById('origem-outro-group').style.display = 'block';
                document.getElementById('origem-outro').value = formData.origemOutro || '';
            }
            
            // Restaurar módulo de contato
            if (formData.moduloContato) {
                Object.keys(formData.moduloContato).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        element.checked = formData.moduloContato[key];
                    }
                });
            }
            
            // Restaurar protocolos
            if (formData.protocolos && formData.protocolos.length > 0) {
                const container = document.getElementById('protocolos-container');
                container.innerHTML = '';
                formData.protocolos.forEach(protocolo => {
                    addProtocolo();
                    const lastItem = container.lastElementChild;
                    lastItem.querySelector('.protocolo-input').value = protocolo.protocolo || '';
                    lastItem.querySelector('.protocolo-canal').value = protocolo.canal || '';
                    lastItem.querySelector('.protocolo-data').value = protocolo.data || '';
                });
            }
            
            // Restaurar tentativas
            if (formData.tentativas && formData.tentativas.length > 0) {
                const container = document.getElementById('historico-container');
                container.innerHTML = '';
                formData.tentativas.forEach(tentativa => {
                    addTentativa();
                    const lastItem = container.lastElementChild;
                    lastItem.querySelector('.tentativa-datetime').value = tentativa.datetime || '';
                    lastItem.querySelector('.tentativa-resultado').value = tentativa.resultado || '';
                    lastItem.querySelector('.tentativa-obs').value = tentativa.observacoes || '';
                });
            }
            
        } catch (e) {
            console.error('Erro ao carregar dados salvos:', e);
        }
    }
}

function clearFormData() {
    localStorage.removeItem('bacen-form-draft');
}

// === CONTROLE DE ORIGEM ===
function handleOrigemChange() {
    const origem = document.getElementById('origem').value;
    const outroGroup = document.getElementById('origem-outro-group');
    
    if (origem === 'outro') {
        outroGroup.style.display = 'block';
        document.getElementById('origem-outro').focus();
    } else {
        outroGroup.style.display = 'none';
        document.getElementById('origem-outro').value = '';
    }
}

// === GERADOR DE CPF VÁLIDO ===
function gerarCPFTeste() {
    // Gerar 9 primeiros dígitos aleatórios
    let cpf = '';
    for (let i = 0; i < 9; i++) {
        cpf += Math.floor(Math.random() * 10);
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    // Formatar CPF
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    // Preencher campo
    document.getElementById('cpf').value = cpfFormatado;
    
    // Disparar evento de input para atualizar auto-save
    const event = new Event('input', { bubbles: true });
    document.getElementById('cpf').dispatchEvent(event);
    
    console.log('CPF gerado:', cpfFormatado);
}

// === UTILITÁRIOS ===
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Não informado';
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR');
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

function getStatusLabel(status) {
    const labels = {
        'nao-iniciado': 'Não Iniciado',
        'em-tratativa': 'Em Tratativa',
        'concluido': 'Concluído',
        'respondido': 'Respondido'
    };
    return labels[status] || status;
}

function clearForm() {
    document.getElementById('complaint-form').reset();
    
    // Limpar dados salvos
    clearFormData();
    
    // Limpar protocolos e tentativas
    document.getElementById('protocolos-container').innerHTML = `
        <div class="protocolo-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Número do Protocolo</label>
                    <input type="text" class="velohub-input protocolo-input" placeholder="Digite o número do protocolo">
                </div>
                <div class="form-group">
                    <label>Canal</label>
                    <input type="text" class="velohub-input protocolo-canal" placeholder="Digite o canal">
                </div>
                <div class="form-group">
                    <label>Data</label>
                    <input type="date" class="velohub-input protocolo-data">
                </div>
            </div>
            <button type="button" class="btn-remove" onclick="removeProtocolo(this)">❌</button>
        </div>
    `;
    
    document.getElementById('historico-container').innerHTML = `
        <div class="tentativa-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Data/Hora</label>
                    <input type="datetime-local" class="velohub-input tentativa-datetime">
                </div>
                <div class="form-group">
                    <label>Resultado</label>
                    <select class="velohub-input tentativa-resultado">
                        <option value="">Selecione...</option>
                        <option value="contatado">Contatado</option>
                        <option value="nao-atendeu">Não Atendeu</option>
                        <option value="telefone-ocupado">Telefone Ocupado</option>
                        <option value="nao-existe">Número Não Existe</option>
                        <option value="mensagem-voz">Mensagem de Voz</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <input type="text" class="velohub-input tentativa-obs" placeholder="Observações sobre a tentativa...">
            </div>
            <button type="button" class="btn-remove" onclick="removeTentativa(this)">❌</button>
        </div>
    `;
    
    // Esconder campo origem outro
    document.getElementById('origem-outro-group').style.display = 'none';
    
    // Configurar data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-reclamacao').value = today;
    document.getElementById('data-recebimento').value = today;
    document.getElementById('data-status').value = today;
}

function saveComplaints() {
    localStorage.setItem('bacen-complaints', JSON.stringify(complaints));
}

function loadComplaints() {
    complaints = JSON.parse(localStorage.getItem('bacen-complaints')) || [];
}

// Função global para mostrar alertas
function mostrarAlertaGlobal(message, type) {
    if (window.mostrarAlerta) {
        window.mostrarAlerta(message, type);
    } else if (typeof showAlert === 'function') {
        showAlert(message, type);
    } else {
        alert(message);
    }
}

// Função global para mostrar alertas
function mostrarAlertaGlobal(message, type) {
    if (window.mostrarAlerta) {
        window.mostrarAlerta(message, type);
    } else if (typeof showAlert === 'function') {
        showAlert(message, type);
    } else {
        alert(message);
    }
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
