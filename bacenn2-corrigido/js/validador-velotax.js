/* === SISTEMA DE VALIDAÇÃO VELOTAX === */

class ValidadorVelotax {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.adicionarValidacoesGlobais();
        this.configurarMascaras();
        this.adicionarEstilos();
    }

    // === VALIDAÇÃO DE CPF ===
    validarCPF(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) {
            return { valido: false, mensagem: 'CPF deve ter 11 dígitos' };
        }

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) {
            return { valido: false, mensagem: 'CPF inválido: todos os dígitos iguais' };
        }

        // Cálculo dos dígitos verificadores
        let soma = 0;
        let resto;

        // Primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) {
            return { valido: false, mensagem: 'CPF inválido: primeiro dígito verificador incorreto' };
        }

        // Segundo dígito verificador
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) {
            return { valido: false, mensagem: 'CPF inválido: segundo dígito verificador incorreto' };
        }

        return { valido: true, mensagem: 'CPF válido' };
    }

    // === VALIDAÇÃO DE DATA ===
    validarData(dataString, formato = 'YYYY-MM-DD') {
        if (!dataString) {
            return { valido: false, mensagem: 'Data é obrigatória' };
        }

        let data;
        
        try {
            if (formato === 'YYYY-MM-DD') {
                // Formato ISO (input type="date")
                const [ano, mes, dia] = dataString.split('-').map(Number);
                data = new Date(ano, mes - 1, dia);
                
                // Verifica se a data foi criada corretamente
                if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
                    return { valido: false, mensagem: 'Data inválida' };
                }
            } else if (formato === 'DD/MM/YYYY') {
                // Formato brasileiro
                const [dia, mes, ano] = dataString.split('/').map(Number);
                data = new Date(ano, mes - 1, dia);
                
                if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
                    return { valido: false, mensagem: 'Data inválida' };
                }
            } else {
                // Tentativa automática
                data = new Date(dataString);
                if (isNaN(data.getTime())) {
                    return { valido: false, mensagem: 'Formato de data inválido' };
                }
            }
        } catch (erro) {
            return { valido: false, mensagem: 'Data inválida' };
        }

        // Verifica se a data não é no futuro (exceto para datas previstas)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (data < new Date(1900, 0, 1)) {
            return { valido: false, mensagem: 'Data muito antiga' };
        }

        // Verifica se é data futura (permitir até 1 ano no futuro para prazos)
        const limiteFuturo = new Date();
        limiteFuturo.setFullYear(limiteFuturo.getFullYear() + 1);
        
        if (data > limiteFuturo) {
            return { valido: false, mensagem: 'Data muito distante no futuro' };
        }

        return { valido: true, mensagem: 'Data válida', data: data };
    }

    // === VALIDAÇÃO DE NÚMEROS ===
    validarNumero(valor, opcoes = {}) {
        const {
            minimo,
            maximo,
            inteiro = false,
            positivo = false,
            permitirZero = true,
            campo = ''
        } = opcoes;

        // Remove caracteres não numéricos, exceto ponto e vírgula
        let numeroLimpo = valor.toString().replace(/[^\d.,-]/g, '');
        
        // Converte para número
        const numero = parseFloat(numeroLimpo.replace(',', '.'));

        if (isNaN(numero)) {
            return { valido: false, mensagem: `${campo || 'Valor'} deve ser um número` };
        }

        // Verifica se é inteiro
        if (inteiro && !Number.isInteger(numero)) {
            return { valido: false, mensagem: `${campo || 'Valor'} deve ser um número inteiro` };
        }

        // Verifica se é positivo
        if (positivo && numero <= 0) {
            return { valido: false, mensagem: `${campo || 'Valor'} deve ser positivo` };
        }

        // Verifica se permite zero
        if (!permitirZero && numero === 0) {
            return { valido: false, mensagem: `${campo || 'Valor'} não pode ser zero` };
        }

        // Verifica mínimo
        if (minimo !== undefined && numero < minimo) {
            return { valido: false, mensagem: `${campo || 'Valor'} deve ser no mínimo ${minimo}` };
        }

        // Verifica máximo
        if (maximo !== undefined && numero > maximo) {
            return { valido: false, mensagem: `${campo || 'Valor'} deve ser no máximo ${maximo}` };
        }

        return { valido: true, mensagem: `${campo || 'Valor'} válido`, numero: numero };
    }

    // === VALIDAÇÃO DE TELEFONE ===
    validarTelefone(telefone) {
        if (!telefone) {
            return { valido: true, mensagem: 'Telefone não é obrigatório' };
        }

        // Remove caracteres não numéricos
        const numeros = telefone.replace(/[^\d]/g, '');

        // Verifica se tem 10 ou 11 dígitos
        if (numeros.length !== 10 && numeros.length !== 11) {
            return { valido: false, mensagem: 'Telefone deve ter 10 ou 11 dígitos' };
        }

        // Verifica se começa com DDD válido
        const ddd = numeros.substring(0, 2);
        const dddsValidos = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19',
            '21', '22', '24', '27', '28',
            '31', '32', '33', '34', '35', '37', '38',
            '41', '42', '43', '44', '45', '46',
            '51', '53', '54', '55',
            '61', '62', '63', '64', '65', '66', '67', '68', '69',
            '71', '73', '74', '75', '77',
            '79', '81', '82', '83', '84', '85', '86', '87', '88', '89',
            '91', '92', '93', '94', '95', '96', '97', '98', '99'
        ];

        if (!dddsValidos.includes(ddd)) {
            return { valido: false, mensagem: 'DDD inválido' };
        }

        return { valido: true, mensagem: 'Telefone válido' };
    }

    // === MÁSCARAS DE ENTRADA ===
    configurarMascaras() {
        // Máscara de CPF
        this.configurarMascaraCPF();
        
        // Máscara de Telefone
        this.configurarMascaraTelefone();
        
        // Máscara de Valores Monetários
        this.configurarMascaraMonetaria();
        
        // Máscara de Data
        this.configurarMascaraData();
        
        // Campos numéricos
        this.configurarCamposNumericos();
    }

    configurarMascaraCPF() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.cpf-mask, input[id*="cpf"]')) {
                let valor = e.target.value.replace(/\D/g, '');
                
                // Limita a 11 dígitos
                if (valor.length > 11) {
                    valor = valor.substring(0, 11);
                }
                
                // Aplica máscara
                if (valor.length > 9) {
                    valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
                } else if (valor.length > 6) {
                    valor = valor.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
                } else if (valor.length > 3) {
                    valor = valor.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
                }
                
                e.target.value = valor;
                
                // Validação em tempo real
                if (valor.length === 14) {
                    const validacao = this.validarCPF(valor);
                    this.mostrarValidacao(e.target, validacao);
                } else {
                    this.limparValidacao(e.target);
                }
            }
        });
    }

    configurarMascaraTelefone() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.telefone-mask, input[id*="telefone"], input[name*="telefone"]')) {
                let valor = e.target.value.replace(/\D/g, '');
                
                // Limita a 11 dígitos
                if (valor.length > 11) {
                    valor = valor.substring(0, 11);
                }
                
                // Aplica máscara
                if (valor.length > 10) {
                    valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                } else if (valor.length > 6) {
                    valor = valor.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
                } else if (valor.length > 2) {
                    valor = valor.replace(/^(\d{2})(\d{4}).*/, '($1) $2');
                }
                
                e.target.value = valor;
                
                // Validação em tempo real
                if (valor.length >= 14) {
                    const validacao = this.validarTelefone(valor);
                    this.mostrarValidacao(e.target, validacao);
                } else {
                    this.limparValidacao(e.target);
                }
            }
        });
    }

    configurarMascaraMonetaria() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.monetario-mask, input[id*="valor"], input[name*="valor"], input[id*="negociado"]')) {
                let valor = e.target.value.replace(/\D/g, '');
                
                // Converte para centavos
                if (valor === '') {
                    valor = '0';
                }
                
                const centavos = parseInt(valor);
                const reais = centavos / 100;
                
                // Formata como moeda brasileira
                e.target.value = reais.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2
                });
                
                // Validação
                if (reais > 0) {
                    const validacao = this.validarNumero(reais, {
                        positivo: true,
                        permitirZero: false,
                        campo: 'Valor'
                    });
                    this.mostrarValidacao(e.target, validacao);
                } else {
                    this.limparValidacao(e.target);
                }
            }
        });
    }

    configurarMascaraData() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.data-mask, input[type="date"]')) {
                // Para input type="date", o navegador já formata
                if (e.target.type === 'date') {
                    if (e.target.value) {
                        const validacao = this.validarData(e.target.value);
                        this.mostrarValidacao(e.target, validacao);
                    } else {
                        this.limparValidacao(e.target);
                    }
                }
            }
        });
    }

    configurarCamposNumericos() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.numero-mask, input[data-tipo="numero"]')) {
                // Permite apenas números, ponto e sinal negativo
                let valor = e.target.value;
                
                // Remove caracteres inválidos
                valor = valor.replace(/[^\d.-]/g, '');
                
                // Permite apenas um ponto decimal
                const partes = valor.split('.');
                if (partes.length > 2) {
                    valor = partes[0] + '.' + partes.slice(1).join('');
                }
                
                // Permite apenas um sinal negativo no início
                if (valor.includes('-') && !valor.startsWith('-')) {
                    valor = valor.replace(/-/g, '');
                }
                
                e.target.value = valor;
                
                // Validação se houver valor
                if (valor) {
                    const validacao = this.validarNumero(parseFloat(valor), {
                        campo: e.target.placeholder || 'Número'
                    });
                    this.mostrarValidacao(e.target, validacao);
                } else {
                    this.limparValidacao(e.target);
                }
            }
        });
    }

    // === VALIDAÇÕES GLOBAIS ===
    adicionarValidacoesGlobais() {
        // Validação em formulários
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                if (!this.validarFormulario(e.target)) {
                    e.preventDefault();
                }
            }
        });

        // Validação ao perder foco
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validarCampo(e.target);
            }
        }, true);
    }

    validarFormulario(formulario) {
        const campos = formulario.querySelectorAll('input, textarea, select');
        let formularioValido = true;
        
        campos.forEach(campo => {
            if (!this.validarCampo(campo)) {
                formularioValido = false;
            }
        });
        
        if (!formularioValido) {
            this.mostrarNotificacao('Por favor, corrija os erros no formulário', 'erro');
        }
        
        return formularioValido;
    }

    validarCampo(campo) {
        // Pula campos sem validação
        if (campo.disabled || campo.readOnly || campo.type === 'hidden') {
            return true;
        }

        let validacao = { valido: true, mensagem: '' };

        // Validação de campo obrigatório
        if (campo.hasAttribute('required') && !campo.value.trim()) {
            validacao = { 
                valido: false, 
                mensagem: 'Campo obrigatório' 
            };
        }
        
        // Validações específicas por tipo
        if (campo.value.trim() && validacao.valido) {
            switch (campo.type) {
                case 'email':
                    validacao = this.validarEmail(campo.value);
                    break;
                    
                case 'date':
                    validacao = this.validarData(campo.value);
                    break;
                    
                case 'tel':
                    validacao = this.validarTelefone(campo.value);
                    break;
                    
                case 'number':
                    const min = parseFloat(campo.min);
                    const max = parseFloat(campo.max);
                    validacao = this.validarNumero(campo.value, {
                        minimo: isNaN(min) ? undefined : min,
                        maximo: isNaN(max) ? undefined : max,
                        inteiro: campo.step === '1',
                        campo: campo.placeholder || campo.name
                    });
                    break;
            }
            
            // Validações por classe
            if (campo.classList.contains('cpf-mask') || campo.id.includes('cpf')) {
                validacao = this.validarCPF(campo.value);
            }
            
            if (campo.classList.contains('monetario-mask') || campo.id.includes('valor')) {
                const valor = parseFloat(campo.value.replace(/[^\d]/g, '')) / 100;
                validacao = this.validarNumero(valor, {
                    positivo: true,
                    permitirZero: false,
                    campo: 'Valor'
                });
            }
        }

        this.mostrarValidacao(campo, validacao);
        return validacao.valido;
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return { valido: false, mensagem: 'E-mail inválido' };
        }
        return { valido: true, mensagem: 'E-mail válido' };
    }

    // === INTERFACE DE VALIDAÇÃO ===
    mostrarValidacao(campo, validacao) {
        // Remove validações anteriores
        this.limparValidacao(campo);
        
        // Adiciona classe de validação
        campo.classList.add(validacao.valido ? 'valido' : 'invalido');
        
        // Cria mensagem de validação
        if (!validacao.valido && validacao.mensagem) {
            const mensagem = document.createElement('div');
            mensagem.className = 'mensagem-validacao';
            mensagem.textContent = validacao.mensagem;
            
            // Posiciona a mensagem
            campo.parentNode.style.position = 'relative';
            campo.parentNode.appendChild(mensagem);
        }
    }

    limparValidacao(campo) {
        // Remove classes
        campo.classList.remove('valido', 'invalido');
        
        // Remove mensagens
        const mensagem = campo.parentNode.querySelector('.mensagem-validacao');
        if (mensagem) {
            mensagem.remove();
        }
    }

    // === UTILITÁRIOS ===
    mostrarNotificacao(mensagem, tipo = 'info') {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.remove();
        }, 3000);
    }

    // === GERADOR DE CPF TESTE ===
    gerarCPFTeste() {
        // Gera 9 dígitos aleatórios
        let cpf = '';
        for (let i = 0; i < 9; i++) {
            cpf += Math.floor(Math.random() * 10);
        }
        
        // Calcula primeiro dígito verificador
        let soma = 0;
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        cpf += resto;
        
        // Calcula segundo dígito verificador
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        cpf += resto;
        
        // Formata CPF
        return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    }

    // === ESTILOS ===
    adicionarEstilos() {
        const estilos = `
            <style id="estilos-validacao">
                /* === CAMPOS COM VALIDAÇÃO === */
                .valido {
                    border-color: #28a745 !important;
                    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
                }
                
                .invalido {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                
                /* === MENSAGENS DE VALIDAÇÃO === */
                .mensagem-validacao {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #dc3545;
                    color: white;
                    padding: 4px 8px;
                    font-size: 0.75rem;
                    border-radius: 0 0 4px 4px;
                    z-index: 1000;
                    margin-top: 2px;
                }
                
                .valido + .mensagem-validacao {
                    background: #28a745;
                }
                
                /* === NOTIFICAÇÕES === */
                .notificacao {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                
                .notificacao-erro {
                    background: #dc3545;
                }
                
                .notificacao-sucesso {
                    background: #28a745;
                }
                
                .notificacao-info {
                    background: #17a2b8;
                }
                
                .notificacao-aviso {
                    background: #ffc107;
                    color: #212529;
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
                
                /* === CAMPOS ESPECÍFICOS === */
                .cpf-mask, .telefone-mask, .monetario-mask, .numero-mask {
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                
                .cpf-mask:focus, .telefone-mask:focus, .monetario-mask:focus, .numero-mask:focus {
                    outline: none;
                    border-color: var(--azul-royal, #1634FF);
                    box-shadow: 0 0 0 0.2rem rgba(22, 52, 255, 0.25);
                }
                
                /* === RESPONSIVO === */
                @media (max-width: 768px) {
                    .notificacao {
                        right: 10px;
                        left: 10px;
                    }
                }
            </style>
        `;

        if (!document.getElementById('estilos-validacao')) {
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
    }
}

// === FUNÇÕES GLOBAIS ===

// Função para gerar CPF teste (compatibilidade com código existente)
function gerarCPFTeste() {
    const validador = new ValidadorVelotax();
    return validador.gerarCPFTeste();
}

// Função para validar CPF
function validarCPF(cpf) {
    const validador = new ValidadorVelotax();
    return validador.validarCPF(cpf);
}

// Função para validar data
function validarData(data) {
    const validador = new ValidadorVelotax();
    return validador.validarData(data);
}

// Função para validar número
function validarNumero(valor, opcoes) {
    const validador = new ValidadorVelotax();
    return validador.validarNumero(valor, opcoes);
}

// Inicializa o validador
let validadorVelotax;
document.addEventListener('DOMContentLoaded', () => {
    validadorVelotax = new ValidadorVelotax();
    
    // Disponibiliza globalmente
    window.ValidadorVelotax = ValidadorVelotax;
    window.validadorVelotax = validadorVelotax;
    window.gerarCPFTeste = gerarCPFTeste;
    window.validarCPF = validarCPF;
    window.validarData = validarData;
    window.validarNumero = validarNumero;
});

// Exporta para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidadorVelotax;
}
