/* === DADOS DE DEMONSTRAÇÃO - SISTEMA BACEN === */

// Função para carregar dados de demonstração
function loadDemoData() {
    const demoComplaints = [
        {
            id: 'demo-001',
            dataReclamacao: '2024-01-15',
            dataRecebimento: '2024-01-15',
            prazoRetorno: '2024-01-30',
            responsavel: 'Maria Silva',
            nomeCliente: 'João Santos',
            cpf: '123.456.789-00',
            origem: 'telefone',
            motivoReduzido: 'Cobrança indevida',
            motivoDetalhado: 'Cliente relata cobrança de taxa não informada previamente. Valor de R$ 50,00 cobrado sem autorização.',
            telefone: '(11) 99999-9999',
            historicoTentativas: [
                {
                    datetime: '2024-01-16T10:30:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente atendeu, mas estava irritado'
                },
                {
                    datetime: '2024-01-17T14:15:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente mais receptivo, aguardando retorno'
                }
            ],
            moduloContato: {
                atendimento: true,
                reclameAqui: false,
                bacen: true,
                procon: false,
                n2: false
            },
            protocolosAnteriores: ['PROT-2024-001', 'PROT-2024-002'],
            resultadoTratativa: 'Taxa cancelada e valor estornado. Cliente satisfeito com a resolução.',
            status: 'concluido',
            dataStatus: '2024-01-20',
            dataCriacao: '2024-01-15T08:00:00.000Z'
        },
        {
            id: 'demo-002',
            dataReclamacao: '2024-01-18',
            dataRecebimento: '2024-01-18',
            prazoRetorno: '2024-02-02',
            responsavel: 'Carlos Oliveira',
            nomeCliente: 'Ana Costa',
            cpf: '987.654.321-00',
            origem: 'email',
            motivoReduzido: 'Problema no atendimento',
            motivoDetalhado: 'Cliente relata atendimento inadequado por funcionário. Falta de cordialidade e informações incorretas fornecidas.',
            telefone: '(21) 88888-8888',
            historicoTentativas: [
                {
                    datetime: '2024-01-19T09:00:00',
                    resultado: 'nao-atendeu',
                    observacoes: 'Telefone ocupado'
                },
                {
                    datetime: '2024-01-19T15:30:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente disponível para conversar'
                }
            ],
            moduloContato: {
                atendimento: true,
                reclameAqui: true,
                bacen: false,
                procon: false,
                n2: true
            },
            protocolosAnteriores: [],
            resultadoTratativa: 'Funcionário orientado e treinamento adicional agendado. Cliente recebeu desculpas formais.',
            status: 'em-tratativa',
            dataStatus: '2024-01-22',
            dataCriacao: '2024-01-18T10:30:00.000Z'
        },
        {
            id: 'demo-003',
            dataReclamacao: '2024-01-20',
            dataRecebimento: '2024-01-20',
            prazoRetorno: '2024-02-05',
            responsavel: 'Patricia Lima',
            nomeCliente: 'Roberto Ferreira',
            cpf: '456.789.123-00',
            origem: 'presencial',
            motivoReduzido: 'Demora na liberação de crédito',
            motivoDetalhado: 'Cliente aprovado para crédito há 15 dias, mas liberação ainda não foi efetivada. Prejuízo financeiro devido à demora.',
            telefone: '(31) 77777-7777',
            historicoTentativas: [
                {
                    datetime: '2024-01-21T11:00:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente muito insatisfeito, ameaçou cancelar'
                }
            ],
            moduloContato: {
                atendimento: true,
                reclameAqui: false,
                bacen: true,
                procon: true,
                n2: false
            },
            protocolosAnteriores: ['PROT-2024-003'],
            resultadoTratativa: '',
            status: 'nao-iniciado',
            dataStatus: '2024-01-20',
            dataCriacao: '2024-01-20T14:15:00.000Z'
        },
        {
            id: 'demo-004',
            dataReclamacao: '2024-01-22',
            dataRecebimento: '2024-01-22',
            prazoRetorno: '2024-02-07',
            responsavel: 'Maria Silva',
            nomeCliente: 'Fernanda Alves',
            cpf: '789.123.456-00',
            origem: 'app',
            motivoReduzido: 'Erro no aplicativo',
            motivoDetalhado: 'Aplicativo apresenta erro ao tentar realizar transferência. Cliente não consegue finalizar operação há 3 dias.',
            telefone: '(41) 66666-6666',
            historicoTentativas: [
                {
                    datetime: '2024-01-23T08:30:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente relatou problema técnico específico'
                },
                {
                    datetime: '2024-01-24T10:00:00',
                    resultado: 'contatado',
                    observacoes: 'Problema identificado e correção em andamento'
                }
            ],
            moduloContato: {
                atendimento: true,
                reclameAqui: false,
                bacen: false,
                procon: false,
                n2: true
            },
            protocolosAnteriores: [],
            resultadoTratativa: 'Bug corrigido e aplicativo atualizado. Cliente testou e confirmou funcionamento normal.',
            status: 'respondido',
            dataStatus: '2024-01-25',
            dataCriacao: '2024-01-22T16:45:00.000Z'
        },
        {
            id: 'demo-005',
            dataReclamacao: '2024-01-25',
            dataRecebimento: '2024-01-25',
            prazoRetorno: '2024-02-10',
            responsavel: 'Carlos Oliveira',
            nomeCliente: 'Marcos Pereira',
            cpf: '321.654.987-00',
            origem: 'site',
            motivoReduzido: 'Cobrança duplicada',
            motivoDetalhado: 'Cliente foi cobrado duas vezes pelo mesmo serviço no mesmo mês. Valor total de R$ 200,00 cobrado indevidamente.',
            telefone: '(51) 55555-5555',
            historicoTentativas: [
                {
                    datetime: '2024-01-26T13:20:00',
                    resultado: 'nao-atendeu',
                    observacoes: 'Telefone não atendeu'
                },
                {
                    datetime: '2024-01-26T16:45:00',
                    resultado: 'contatado',
                    observacoes: 'Cliente confirmou a cobrança duplicada'
                }
            ],
            moduloContato: {
                atendimento: true,
                reclameAqui: true,
                bacen: true,
                procon: false,
                n2: false
            },
            protocolosAnteriores: ['PROT-2024-004'],
            resultadoTratativa: 'Cobrança duplicada identificada e estorno processado. Cliente receberá reembolso em até 5 dias úteis.',
            status: 'concluido',
            dataStatus: '2024-01-28',
            dataCriacao: '2024-01-25T11:20:00.000Z'
        }
    ];

    // Verificar se já existem dados
    const existingComplaints = JSON.parse(localStorage.getItem('bacen-complaints')) || [];
    
    if (existingComplaints.length === 0) {
        // Carregar dados de demonstração apenas se não houver dados existentes
        localStorage.setItem('bacen-complaints', JSON.stringify(demoComplaints));
        
        // Recarregar a página para mostrar os dados
        if (confirm('Dados de demonstração carregados! Deseja recarregar a página para visualizar?')) {
            window.location.reload();
        }
    } else {
        alert('Já existem reclamações cadastradas. Os dados de demonstração não foram carregados.');
    }
}

// Seed automático para dashboards (usa as mesmas chaves do ArmazenamentoReclamacoes)
function seedDashboardReclamacoesIfEmpty() {
    try {
        const chaveBacen = 'velotax_reclamacoes_bacen';
        const chaveN2 = 'velotax_reclamacoes_n2';
        const chaveChatbot = 'velotax_reclamacoes_chatbot';

        const jaTemBacen = !!localStorage.getItem(chaveBacen);
        const jaTemN2 = !!localStorage.getItem(chaveN2);
        const jaTemChatbot = !!localStorage.getItem(chaveChatbot);

        // Não sobrescreve nada se já houver qualquer dado salvo
        if (jaTemBacen || jaTemN2 || jaTemChatbot) {
            return;
        }

        const hoje = new Date();
        const ano = hoje.getFullYear();

        const demoBacen = [
            {
                id: 'seed-bacen-001',
                tipoDemanda: 'bacen',
                nomeCliente: 'Cliente BACEN 1',
                cpf: '111.111.111-11',
                status: 'nao-iniciado',
                responsavel: 'analista.bacen@velotax.com',
                origem: 'Bacen Celcoin',
                dataCriacao: `${ano}-01-10T09:00:00.000Z`,
                mes: `01/${ano}`,
                enviarCobranca: false,
                casosCriticos: true
            },
            {
                id: 'seed-bacen-002',
                tipoDemanda: 'bacen',
                nomeCliente: 'Cliente BACEN 2',
                cpf: '222.222.222-22',
                status: 'em-tratativa',
                responsavel: 'analista.bacen@velotax.com',
                origem: 'Bacen Via Capital',
                dataCriacao: `${ano}-02-05T11:30:00.000Z`,
                mes: `02/${ano}`,
                enviarCobranca: true,
                casosCriticos: false
            },
            {
                id: 'seed-bacen-003',
                tipoDemanda: 'bacen',
                nomeCliente: 'Cliente BACEN 3',
                cpf: '333.333.333-33',
                status: 'respondido',
                responsavel: 'gestor@velotax.com',
                origem: 'Consumidor.Gov',
                dataCriacao: `${ano}-03-18T14:15:00.000Z`,
                mes: `03/${ano}`,
                enviarCobranca: false,
                casosCriticos: false
            },
            {
                id: 'seed-bacen-004',
                tipoDemanda: 'bacen',
                nomeCliente: 'Cliente BACEN 4',
                cpf: '444.444.444-44',
                status: 'concluido',
                responsavel: 'gestor@velotax.com',
                origem: 'Bacen Celcoin',
                dataCriacao: `${ano}-03-25T16:45:00.000Z`,
                mes: `03/${ano}`,
                enviarCobranca: true,
                casosCriticos: false
            }
        ];

        const demoN2 = [
            {
                id: 'seed-n2-001',
                tipoDemanda: 'n2',
                nomeCliente: 'Cliente N2 1',
                cpf: '555.555.555-55',
                status: 'em-tratativa',
                responsavel: 'analista.n2@velotax.com',
                origem: 'Portabilidade',
                dataCriacao: `${ano}-02-01T10:00:00.000Z`,
                mes: `02/${ano}`,
                enviarCobranca: false,
                casosCriticos: false
            },
            {
                id: 'seed-n2-002',
                tipoDemanda: 'n2',
                nomeCliente: 'Cliente N2 2',
                cpf: '666.666.666-66',
                status: 'concluido',
                responsavel: 'analista.n2@velotax.com',
                origem: 'Portabilidade',
                dataCriacao: `${ano}-03-07T09:30:00.000Z`,
                mes: `03/${ano}`,
                enviarCobranca: true,
                casosCriticos: false
            }
        ];

        const demoChatbot = [
            {
                id: 'seed-chat-001',
                tipoDemanda: 'chatbot',
                nomeCliente: 'Cliente Chatbot 1',
                cpf: '777.777.777-77',
                status: 'em-tratativa',
                responsavel: 'bot-owner@velotax.com',
                origem: 'chatbot',
                dataCriacao: `${ano}-01-12T08:20:00.000Z`,
                mes: `01/${ano}`,
                enviarCobranca: false,
                casosCriticos: false
            },
            {
                id: 'seed-chat-002',
                tipoDemanda: 'chatbot',
                nomeCliente: 'Cliente Chatbot 2',
                cpf: '888.888.888-88',
                status: 'respondido',
                responsavel: 'bot-owner@velotax.com',
                origem: 'chatbot',
                dataCriacao: `${ano}-02-20T19:10:00.000Z`,
                mes: `02/${ano}`,
                enviarCobranca: false,
                casosCriticos: false
            }
        ];

        localStorage.setItem(chaveBacen, JSON.stringify(demoBacen));
        localStorage.setItem(chaveN2, JSON.stringify(demoN2));
        localStorage.setItem(chaveChatbot, JSON.stringify(demoChatbot));
    } catch (e) {
        console.error('Erro ao semear dados de dashboard para demonstração:', e);
    }
}

// Função para limpar todos os dados
function clearAllData() {
    if (confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
        // Chaves antigas de demo
        localStorage.removeItem('bacen-complaints');

        // Chaves usadas pelos dashboards (inclusive seeds de demonstração)
        localStorage.removeItem('velotax_reclamacoes_bacen');
        localStorage.removeItem('velotax_reclamacoes_n2');
        localStorage.removeItem('velotax_reclamacoes_chatbot');

        alert('Todos os dados de demonstração/local foram removidos. A página será recarregada.');
        window.location.reload();
    }
}

// Adicionar botões de demonstração ao header
function addDemoButtons() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.querySelector('.demo-buttons')) {
        const demoButtons = document.createElement('div');
        demoButtons.className = 'demo-buttons';
        demoButtons.innerHTML = `
            <button class="velohub-btn btn-secondary" onclick="loadDemoData()" style="font-size: 0.8rem; padding: 8px 12px;">
                📊 Dados Demo
            </button>
            <button class="velohub-btn" onclick="clearAllData()" style="font-size: 0.8rem; padding: 8px 12px; background: #ff4757;">
                🗑️ Limpar Dados
            </button>
        `;
        headerActions.appendChild(demoButtons);
    }
}

// Inicializar botões de demonstração quando o DOM estiver pronto (SEM seed automático)
document.addEventListener('DOMContentLoaded', function() {
    addDemoButtons();
});
