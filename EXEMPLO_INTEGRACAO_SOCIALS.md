# 📱 Exemplo de Integração - Socials com WhatsApp

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 🔧 Como Adicionar Envio via WhatsApp no Socials

### 1. Adicionar função no `src/services/api.js`

Adicione esta função ao final do arquivo:

```javascript
// Enviar relatório via WhatsApp (VeloHub)
export const sendReportToWhatsApp = async (reportContent, options = {}) => {
  try {
    // URL da API do VeloHub
    const velohubApiUrl = import.meta.env.VITE_VELOHUB_API_URL || 
                         'https://velohub-278491073220.us-east1.run.app/api';
    
    const response = await fetch(`${velohubApiUrl}/escalacoes/reports/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportContent,
        title: options.title || 'Relatório Executivo de CX',
        filters: options.filters || {},
        dateRange: options.dateRange || null
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar relatório via WhatsApp:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar relatório'
    };
  }
};
```

### 2. Atualizar `src/components/Reports.jsx`

Adicione o botão de envio via WhatsApp e a função de envio:

```javascript
// VERSION: v1.1.1 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team
import { useState } from 'react'
import { AssessmentOutlined, DownloadOutlined, RocketLaunchOutlined, SendOutlined } from '@mui/icons-material'
import { generateReport, getTabulations, sendReportToWhatsApp } from '../services/api'

const Reports = () => {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState(null)
  const [filters, setFilters] = useState({
    socialNetwork: '',
    contactReason: '',
    dateFrom: '',
    dateTo: ''
  })

  // ... código existente ...

  const handleSendToWhatsApp = async () => {
    if (!report) {
      setWhatsappStatus({ success: false, error: 'Gere um relatório primeiro' });
      return;
    }

    setSendingWhatsApp(true);
    setWhatsappStatus(null);

    try {
      // Formatar período
      let dateRange = null;
      if (filters.dateFrom && filters.dateTo) {
        const from = new Date(filters.dateFrom).toLocaleDateString('pt-BR');
        const to = new Date(filters.dateTo).toLocaleDateString('pt-BR');
        dateRange = `${from} - ${to}`;
      }

      const result = await sendReportToWhatsApp(report, {
        title: 'Relatório Executivo de CX',
        filters: {
          socialNetwork: filters.socialNetwork || null,
          contactReason: filters.contactReason || null
        },
        dateRange
      });

      if (result.success) {
        setWhatsappStatus({
          success: true,
          message: 'Relatório enviado com sucesso via WhatsApp!'
        });
      } else {
        setWhatsappStatus({
          success: false,
          error: result.error || 'Erro ao enviar relatório'
        });
      }
    } catch (error) {
      setWhatsappStatus({
        success: false,
        error: error.message || 'Erro ao enviar relatório'
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="velohub-container">
      {/* ... código existente de filtros e geração ... */}

      <div className="report-actions">
        <button
          onClick={handleGenerateReport}
          className="velohub-btn"
          disabled={loading}
        >
          <RocketLaunchOutlined sx={{ fontSize: '1rem', mr: 1 }} />
          {loading ? 'Gerando relatório...' : 'Gerar Relatório com IA'}
        </button>

        {report && (
          <>
            <button
              onClick={handleDownload}
              className="velohub-btn secondary"
            >
              <DownloadOutlined sx={{ fontSize: '1rem', mr: 1 }} />
              Baixar Relatório (Markdown)
            </button>

            <button
              onClick={handleSendToWhatsApp}
              className="velohub-btn"
              disabled={sendingWhatsApp}
              style={{ backgroundColor: '#25D366', color: 'white' }}
            >
              <SendOutlined sx={{ fontSize: '1rem', mr: 1 }} />
              {sendingWhatsApp ? 'Enviando...' : '📱 Enviar via WhatsApp'}
            </button>
          </>
        )}
      </div>

      {/* Status do envio WhatsApp */}
      {whatsappStatus && (
        <div 
          className={`whatsapp-status ${whatsappStatus.success ? 'success' : 'error'}`}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: whatsappStatus.success ? '#d4edda' : '#f8d7da',
            color: whatsappStatus.success ? '#155724' : '#721c24',
            border: `1px solid ${whatsappStatus.success ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {whatsappStatus.success ? (
            <span>✅ {whatsappStatus.message}</span>
          ) : (
            <span>❌ {whatsappStatus.error}</span>
          )}
        </div>
      )}

      {/* ... resto do código ... */}
    </div>
  )
}

export default Reports
```

### 3. Variável de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto socials:

```env
VITE_VELOHUB_API_URL=https://velohub-278491073220.us-east1.run.app/api
```

## 🧪 Teste

1. Gere um relatório normalmente
2. Clique em "📱 Enviar via WhatsApp"
3. Verifique o status na tela
4. Confira o WhatsApp do número **11943952784**

## 📝 Notas

- O número padrão é **11943952784** (formatado como `5511943952784@s.whatsapp.net`)
- Para usar outro número, modifique a função `sendReportToWhatsApp` para incluir o `jid` no body
- O relatório será formatado automaticamente para WhatsApp (markdown → texto WhatsApp)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
