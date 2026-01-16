// VERSION: v1.2.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
let GoogleGenerativeAI = null;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (error) {
  console.error('⚠️ Módulo @google/generative-ai não encontrado:', error.message);
  console.error('⚠️ Funcionalidades de IA não estarão disponíveis');
}

let genAI = null;

// Inicializar Gemini AI
const configureGemini = () => {
  // Verificar módulo primeiro
  if (!GoogleGenerativeAI) {
    console.warn('⚠️ @google/generative-ai não disponível');
    return null;
  }

  // Verificar API Key dinamicamente (não apenas no carregamento do módulo)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // Logs detalhados para debug (sem mostrar o valor da chave por segurança)
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY não configurada');
    console.warn('⚠️ Verifique se a variável de ambiente GEMINI_API_KEY está definida');
    console.warn('⚠️ Ambiente:', process.env.NODE_ENV || 'development');
    return null;
  }

  // Verificar se já foi inicializado
  if (!genAI) {
    try {
      console.log('🔄 Inicializando Gemini AI...');
      console.log('✅ GEMINI_API_KEY encontrada (tamanho:', GEMINI_API_KEY.length, 'caracteres)');
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      console.log('✅ Gemini AI configurado com sucesso');
      return genAI;
    } catch (error) {
      console.error('❌ Erro ao configurar Gemini AI:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return null;
    }
  }

  // Retornar instância já inicializada
  return genAI;
};

// Analisar sentimento e motivo do contato
const analyzeSentimentAndReason = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        success: false,
        error: 'Texto inválido para análise'
      };
    }

    if (!GoogleGenerativeAI) {
      return {
        success: false,
        error: 'Módulo @google/generative-ai não disponível',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }

    console.log('🔄 Tentando configurar Gemini AI para análise...');
    const ai = configureGemini();
    if (!ai) {
      const apiKeyStatus = process.env.GEMINI_API_KEY ? 'definida' : 'não definida';
      console.error('❌ Gemini AI não configurado');
      console.error('❌ Status GEMINI_API_KEY:', apiKeyStatus);
      console.error('❌ Status GoogleGenerativeAI:', GoogleGenerativeAI ? 'disponível' : 'não disponível');
      return {
        success: false,
        error: 'Gemini AI não configurado. Verifique GEMINI_API_KEY',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }
    console.log('✅ Gemini AI configurado e pronto para análise');

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Analise o seguinte texto de atendimento de rede social e retorne APENAS um JSON válido com:
1. "sentiment": (Positivo, Neutro ou Negativo)
2. "reason": (Comercial, Suporte, Bug ou Elogio)

Texto: "${text}"

Retorne APENAS o JSON, sem markdown, sem código, sem explicações. Exemplo:
{"sentiment": "Positivo", "reason": "Elogio"}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text().trim();

    // Limpar a resposta para garantir que seja um JSON válido
    if (content.includes('```json')) {
      content = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      content = content.split('```')[1].split('```')[0].trim();
    }

    // Remover markdown se presente
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
      const analysis = JSON.parse(content);
      
      // Validar estrutura
      const validSentiments = ['Positivo', 'Neutro', 'Negativo'];
      const validReasons = ['Comercial', 'Suporte', 'Bug', 'Elogio'];
      
      if (!validSentiments.includes(analysis.sentiment)) {
        analysis.sentiment = 'Neutro';
      }
      
      if (!validReasons.includes(analysis.reason)) {
        analysis.reason = 'Suporte';
      }

      return {
        success: true,
        data: {
          sentiment: analysis.sentiment,
          reason: analysis.reason
        }
      };
    } catch (parseError) {
      console.error('Erro ao parsear resposta do Gemini:', parseError);
      console.error('Conteúdo recebido:', content);
      return {
        success: false,
        error: 'Erro ao processar resposta da IA',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    return {
      success: false,
      error: error.message || 'Erro ao analisar texto com IA',
      fallback: {
        sentiment: 'Neutro',
        reason: 'Suporte'
      }
    };
  }
};

// Gerar relatório executivo
const generateExecutiveReport = async (data) => {
  try {
    if (!data || (typeof data === 'string' && data.trim().length === 0)) {
      return {
        success: false,
        error: 'Dados inválidos para gerar relatório'
      };
    }

    if (!GoogleGenerativeAI) {
      return {
        success: false,
        error: 'Módulo @google/generative-ai não disponível'
      };
    }

    console.log('🔄 Tentando configurar Gemini AI para gerar relatório...');
    const ai = configureGemini();
    if (!ai) {
      const apiKeyStatus = process.env.GEMINI_API_KEY ? 'definida' : 'não definida';
      console.error('❌ Gemini AI não configurado');
      console.error('❌ Status GEMINI_API_KEY:', apiKeyStatus);
      console.error('❌ Status GoogleGenerativeAI:', GoogleGenerativeAI ? 'disponível' : 'não disponível');
      console.error('❌ Ambiente:', process.env.NODE_ENV || 'development');
      return {
        success: false,
        error: 'Gemini AI não configurado. Verifique GEMINI_API_KEY'
      };
    }
    console.log('✅ Gemini AI configurado e pronto para gerar relatório');

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Preparar dados para o prompt
    let dataSummary = '';
    if (typeof data === 'string') {
      dataSummary = data;
    } else if (Array.isArray(data)) {
      dataSummary = data.map(item => {
        if (typeof item === 'object') {
          return JSON.stringify(item);
        }
        return String(item);
      }).join('\n');
    } else if (typeof data === 'object') {
      dataSummary = JSON.stringify(data, null, 2);
    } else {
      dataSummary = String(data);
    }

    const prompt = `Você é um consultor sênior de CX (Customer Experience). 
Com base nos seguintes dados de atendimentos de redes sociais, escreva um relatório executivo narrativo, profissional e humano.

Dados:
${dataSummary}

O relatório deve conter:
- Título impactante
- Resumo executivo (tópicos)
- Análise estratégica por rede social e sentimento
- Plano de Ação (Action Plan) com 3 pontos estratégicos
- Conclusão

Use formatação Markdown.
Seja objetivo, profissional e forneça insights acionáveis.`;

    const result = await model.generateContent(prompt);
    const report = result.response.text();

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Erro ao gerar relatório executivo:', error);
    return {
      success: false,
      error: error.message || 'Erro ao gerar relatório executivo'
    };
  }
};

module.exports = {
  configureGemini,
  analyzeSentimentAndReason,
  generateExecutiveReport
};
