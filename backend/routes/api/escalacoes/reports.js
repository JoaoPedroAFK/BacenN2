/**
 * VeloHub V3 - Escalações API Routes - Relatórios WhatsApp
 * VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team
 * 
 * Rotas para envio de relatórios via WhatsApp
 */

const express = require('express');
const router = express.Router();
const reportService = require('../../../services/escalacoes/reportService');

/**
 * Inicializar rotas de relatórios
 * @param {Object} client - MongoDB client
 * @param {Function} connectToMongo - Função para conectar ao MongoDB
 * @param {Object} services - Serviços disponíveis (userActivityLogger, etc.)
 */
const initReportsRoutes = (client, connectToMongo, services = {}) => {
  const { userActivityLogger } = services;
  
  /**
   * POST /api/escalacoes/reports/send
   * Enviar relatório via WhatsApp
   * 
   * Body:
   * {
   *   reportContent: string,      // Conteúdo do relatório (markdown ou texto)
   *   title?: string,              // Título do relatório
   *   filters?: {                  // Filtros aplicados
   *     socialNetwork?: string,
   *     contactReason?: string,
   *     dateFrom?: string,
   *     dateTo?: string
   *   },
   *   dateRange?: string,          // Período formatado
   *   jid?: string,                // JID do destinatário (opcional, usa padrão 11943952784)
   *   imagens?: Array<{           // Imagens opcionais
   *     data: string,              // Base64
   *     type: string               // MIME type
   *   }>
   * }
   */
  router.post('/send', async (req, res) => {
    try {
      const {
        reportContent,
        title,
        filters,
        dateRange,
        jid,
        imagens
      } = req.body;
      
      // Validação
      if (!reportContent || typeof reportContent !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Conteúdo do relatório é obrigatório'
        });
      }
      
      console.log('[REPORTS API] Recebida solicitação de envio de relatório');
      console.log(`[REPORTS API] Título: ${title || 'Não informado'}`);
      console.log(`[REPORTS API] Tamanho do conteúdo: ${reportContent.length} caracteres`);
      console.log(`[REPORTS API] JID: ${jid || 'Usando padrão (11943952784)'}`);
      
      // Enviar relatório
      const result = await reportService.sendReport(reportContent, {
        title,
        filters,
        dateRange,
        jid,
        imagens: imagens || []
      });
      
      if (result.ok) {
        // Log de atividade (se disponível)
        if (userActivityLogger) {
          try {
            await userActivityLogger.log({
              action: 'report_sent',
              module: 'escalacoes',
              details: {
                messageId: result.messageId,
                title: title || 'Relatório de Redes Sociais',
                hasImages: imagens && imagens.length > 0
              }
            });
          } catch (logError) {
            console.error('[REPORTS API] Erro ao registrar log:', logError);
          }
        }
        
        return res.json({
          success: true,
          message: 'Relatório enviado com sucesso',
          data: {
            messageId: result.messageId,
            messageIds: result.messageIds || []
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || 'Erro ao enviar relatório'
        });
      }
      
    } catch (error) {
      console.error('[REPORTS API] Erro ao processar solicitação:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });
  
  /**
   * POST /api/escalacoes/reports/send-with-image
   * Enviar relatório com imagem via WhatsApp
   * 
   * Body:
   * {
   *   reportContent: string,
   *   imageBase64: string,         // Imagem em base64 (sem prefixo data:image)
   *   mimeType?: string,           // Tipo MIME (padrão: image/png)
   *   title?: string,
   *   filters?: Object,
   *   dateRange?: string,
   *   jid?: string
   * }
   */
  router.post('/send-with-image', async (req, res) => {
    try {
      const {
        reportContent,
        imageBase64,
        mimeType = 'image/png',
        title,
        filters,
        dateRange,
        jid
      } = req.body;
      
      // Validação
      if (!reportContent || typeof reportContent !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Conteúdo do relatório é obrigatório'
        });
      }
      
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Imagem em base64 é obrigatória'
        });
      }
      
      console.log('[REPORTS API] Recebida solicitação de envio de relatório com imagem');
      console.log(`[REPORTS API] Tamanho da imagem: ${imageBase64.length} caracteres`);
      console.log(`[REPORTS API] Tipo MIME: ${mimeType}`);
      
      // Enviar relatório com imagem
      const result = await reportService.sendReportWithImage(
        reportContent,
        imageBase64,
        mimeType,
        {
          title,
          filters,
          dateRange,
          jid
        }
      );
      
      if (result.ok) {
        // Log de atividade
        if (userActivityLogger) {
          try {
            await userActivityLogger.log({
              action: 'report_sent_with_image',
              module: 'escalacoes',
              details: {
                messageId: result.messageId,
                title: title || 'Relatório de Redes Sociais',
                mimeType
              }
            });
          } catch (logError) {
            console.error('[REPORTS API] Erro ao registrar log:', logError);
          }
        }
        
        return res.json({
          success: true,
          message: 'Relatório com imagem enviado com sucesso',
          data: {
            messageId: result.messageId,
            messageIds: result.messageIds || []
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || 'Erro ao enviar relatório'
        });
      }
      
    } catch (error) {
      console.error('[REPORTS API] Erro ao processar solicitação:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });
  
  /**
   * GET /api/escalacoes/reports/test
   * Endpoint de teste para verificar se o serviço está funcionando
   */
  router.get('/test', async (req, res) => {
    try {
      return res.json({
        success: true,
        message: 'Serviço de relatórios está funcionando',
        timestamp: new Date().toISOString(),
        config: {
          defaultJid: '11943952784@s.whatsapp.net',
          whatsappApiUrl: process.env.WHATSAPP_API_URL ? 'Configurado' : 'Não configurado'
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return router;
};

module.exports = initReportsRoutes;
