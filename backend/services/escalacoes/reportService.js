/**
 * VeloHub V3 - Report Service para Envio de Relatórios via WhatsApp
 * VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team
 * 
 * Serviço para formatar e enviar relatórios via WhatsApp usando Baileys
 */

const whatsappService = require('./whatsappService');
const config = require('../../config');

/**
 * Formatar número para JID WhatsApp
 * @param {string} numero - Número no formato numérico (ex: 11943952784)
 * @returns {string} JID formatado
 */
function formatJid(numero) {
  if (!numero || typeof numero !== 'string') {
    return null;
  }
  
  // Se já contém @, retornar como está
  if (numero.includes('@')) {
    return numero;
  }
  
  // Remover caracteres não numéricos
  const digits = numero.replace(/\D/g, '');
  
  // Se contém -, é grupo
  if (numero.includes('-')) {
    return `${digits}@g.us`;
  }
  
  // Caso contrário, é individual
  return `${digits}@s.whatsapp.net`;
}

/**
 * Formatar relatório para envio via WhatsApp
 * @param {string} reportContent - Conteúdo do relatório (markdown ou texto)
 * @param {Object} options - Opções adicionais { title, filters, dateRange }
 * @returns {string} Relatório formatado para WhatsApp
 */
function formatReportForWhatsApp(reportContent, options = {}) {
  const { title, filters, dateRange } = options;
  
  let formatted = '';
  
  // Título
  if (title) {
    formatted += `*${title}*\n\n`;
  } else {
    formatted += `*📊 Relatório Executivo de CX*\n\n`;
  }
  
  // Informações do período
  if (dateRange) {
    formatted += `📅 *Período:* ${dateRange}\n`;
  } else {
    const now = new Date();
    formatted += `📅 *Data:* ${now.toLocaleDateString('pt-BR')}\n`;
  }
  
  // Filtros aplicados
  if (filters) {
    if (filters.socialNetwork) {
      formatted += `📱 *Rede Social:* ${filters.socialNetwork}\n`;
    }
    if (filters.contactReason) {
      formatted += `🎯 *Motivo:* ${filters.contactReason}\n`;
    }
    formatted += '\n';
  }
  
  // Separador
  formatted += '─'.repeat(30) + '\n\n';
  
  // Conteúdo do relatório
  // Converter markdown básico para texto WhatsApp
  let content = reportContent || '';
  
  // Remover blocos de código
  content = content.replace(/```[\s\S]*?```/g, '');
  
  // Converter headers markdown para negrito
  content = content.replace(/^### (.*$)/gim, '*$1*');
  content = content.replace(/^## (.*$)/gim, '*$1*');
  content = content.replace(/^# (.*$)/gim, '*$1*');
  
  // Converter listas markdown
  content = content.replace(/^\- (.*$)/gim, '• $1');
  content = content.replace(/^\* (.*$)/gim, '• $1');
  
  // Remover links markdown (manter apenas texto)
  content = content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Limpar múltiplas quebras de linha
  content = content.replace(/\n{3,}/g, '\n\n');
  
  formatted += content.trim();
  
  // Rodapé
  formatted += '\n\n' + '─'.repeat(30) + '\n';
  formatted += `_Gerado automaticamente pelo VeloHub_`;
  
  return formatted;
}

/**
 * Enviar relatório via WhatsApp
 * @param {string} reportContent - Conteúdo do relatório
 * @param {Object} options - Opções { title, filters, dateRange, jid, imagens }
 * @returns {Promise<Object>} { ok: boolean, messageId?: string, error?: string }
 */
async function sendReport(reportContent, options = {}) {
  try {
    console.log('[REPORT SERVICE] Iniciando envio de relatório via WhatsApp...');
    
    // Destinatário padrão: 11943952784 (formato brasileiro: 5511943952784)
    // WhatsApp brasileiro precisa do código do país (55) + DDD (11) + número
    const defaultNumber = '5511943952784';
    const defaultJid = formatJid(defaultNumber);
    const jid = options.jid || config.WHATSAPP_DEFAULT_JID || defaultJid;
    
    if (!jid) {
      console.error('[REPORT SERVICE] ❌ JID não configurado');
      return { ok: false, error: 'JID do destinatário não configurado' };
    }
    
    console.log(`[REPORT SERVICE] Destinatário: ${jid}`);
    
    // Formatar relatório
    const formattedReport = formatReportForWhatsApp(reportContent, {
      title: options.title,
      filters: options.filters,
      dateRange: options.dateRange
    });
    
    console.log(`[REPORT SERVICE] Relatório formatado (${formattedReport.length} caracteres)`);
    
    // Enviar via WhatsApp service
    const result = await whatsappService.sendMessage(
      jid,
      formattedReport,
      options.imagens || [],
      options.videos || [],
      {
        cpf: null,
        solicitacao: 'Relatório de Redes Sociais',
        agente: 'Sistema VeloHub'
      }
    );
    
    if (result.ok) {
      console.log(`[REPORT SERVICE] ✅ Relatório enviado com sucesso! messageId: ${result.messageId}`);
    } else {
      console.error(`[REPORT SERVICE] ❌ Erro ao enviar relatório: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('[REPORT SERVICE] ❌ Erro ao enviar relatório:', error);
    return { ok: false, error: error.message || 'Erro desconhecido' };
  }
}

/**
 * Enviar relatório com imagem (gráfico/dashboard)
 * @param {string} reportContent - Conteúdo do relatório
 * @param {string} imageBase64 - Imagem em base64 (sem prefixo data:image)
 * @param {string} mimeType - Tipo MIME da imagem
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} { ok: boolean, messageId?: string, error?: string }
 */
async function sendReportWithImage(reportContent, imageBase64, mimeType = 'image/png', options = {}) {
  const imagens = [{
    data: imageBase64,
    type: mimeType
  }];
  
  return sendReport(reportContent, {
    ...options,
    imagens
  });
}

module.exports = {
  sendReport,
  sendReportWithImage,
  formatReportForWhatsApp,
  formatJid
};
