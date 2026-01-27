/**
 * VeloHub V3 - Reports API Service
 * VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team
 * 
 * Serviço de API para envio de relatórios via WhatsApp
 */

import { API_BASE_URL } from '../config/api-config';

/**
 * Função genérica para fazer requisições
 * @param {string} endpoint - Endpoint da API
 * @param {object} options - Opções da requisição
 * @returns {Promise<any>} Resposta da API
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🔍 [reportsApi] Fazendo requisição para: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Verificar se a resposta é JSON antes de tentar parsear
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`❌ [reportsApi] Resposta não é JSON. Status: ${response.status}, Content-Type: ${contentType}`);
      console.error(`❌ [reportsApi] Conteúdo recebido:`, text.substring(0, 200));
      throw new Error(`Resposta não é JSON. Status: ${response.status}. A rota pode não estar registrada no servidor.`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [reportsApi] Erro na API ${endpoint}:`, error);
    console.error(`❌ [reportsApi] URL completa: ${url}`);
    throw error;
  }
}

/**
 * API para Relatórios WhatsApp
 */
export const reportsAPI = {
  /**
   * Enviar relatório via WhatsApp
   * @param {string} reportContent - Conteúdo do relatório (markdown ou texto)
   * @param {Object} options - Opções { title, filters, dateRange, jid, imagens }
   * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
   */
  async sendReport(reportContent, options = {}) {
    try {
      const { title, filters, dateRange, jid, imagens } = options;
      
      const result = await apiRequest('/escalacoes/reports/send', {
        method: 'POST',
        body: JSON.stringify({
          reportContent,
          title,
          filters,
          dateRange,
          jid,
          imagens
        })
      });
      
      return result;
    } catch (error) {
      console.error('[reportsAPI] Erro ao enviar relatório:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar relatório'
      };
    }
  },

  /**
   * Enviar relatório com imagem via WhatsApp
   * @param {string} reportContent - Conteúdo do relatório
   * @param {string} imageBase64 - Imagem em base64 (sem prefixo data:image)
   * @param {string} mimeType - Tipo MIME da imagem (padrão: image/png)
   * @param {Object} options - Opções adicionais { title, filters, dateRange, jid }
   * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
   */
  async sendReportWithImage(reportContent, imageBase64, mimeType = 'image/png', options = {}) {
    try {
      const { title, filters, dateRange, jid } = options;
      
      const result = await apiRequest('/escalacoes/reports/send-with-image', {
        method: 'POST',
        body: JSON.stringify({
          reportContent,
          imageBase64,
          mimeType,
          title,
          filters,
          dateRange,
          jid
        })
      });
      
      return result;
    } catch (error) {
      console.error('[reportsAPI] Erro ao enviar relatório com imagem:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar relatório com imagem'
      };
    }
  },

  /**
   * Testar conexão com o serviço de relatórios
   * @returns {Promise<Object>} { success: boolean, message?: string }
   */
  async testConnection() {
    try {
      const result = await apiRequest('/escalacoes/reports/test', {
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.error('[reportsAPI] Erro ao testar conexão:', error);
      return {
        success: false,
        error: error.message || 'Erro ao testar conexão'
      };
    }
  }
};

export default reportsAPI;
