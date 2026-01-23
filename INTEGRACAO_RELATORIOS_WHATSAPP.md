# 📱 Integração de Relatórios via WhatsApp

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Descrição

Sistema integrado para envio de relatórios de redes sociais via WhatsApp usando a API Baileys do VeloHub.

## 🎯 Funcionalidades

- ✅ Envio de relatórios formatados via WhatsApp
- ✅ Suporte para imagens (gráficos, dashboards)
- ✅ Formatação automática de markdown para WhatsApp
- ✅ Destinatário padrão configurado: **11943952784** (5511943952784@s.whatsapp.net)

## 🔧 Configuração

### Backend

O serviço já está integrado no backend do VeloHub:

- **Serviço:** `backend/services/escalacoes/reportService.js`
- **Rotas:** `backend/routes/api/escalacoes/reports.js`
- **Registrado em:** `backend/server.js`

### Variáveis de Ambiente

Certifique-se de que a variável `WHATSAPP_API_URL` está configurada no backend:

```env
WHATSAPP_API_URL=https://sua-api-baileys.com
```

## 📡 Endpoints da API

### POST `/api/escalacoes/reports/send`

Envia um relatório via WhatsApp.

**Request Body:**
```json
{
  "reportContent": "Conteúdo do relatório em markdown ou texto",
  "title": "Título do Relatório (opcional)",
  "filters": {
    "socialNetwork": "Instagram",
    "contactReason": "Suporte",
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-23"
  },
  "dateRange": "01/01/2025 - 23/01/2025 (opcional)",
  "jid": "5511943952784@s.whatsapp.net (opcional, usa padrão se não informado)",
  "imagens": [
    {
      "data": "base64...",
      "type": "image/png"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Relatório enviado com sucesso",
  "data": {
    "messageId": "3EB0...",
    "messageIds": ["3EB0..."]
  }
}
```

### POST `/api/escalacoes/reports/send-with-image`

Envia um relatório com imagem via WhatsApp.

**Request Body:**
```json
{
  "reportContent": "Conteúdo do relatório",
  "imageBase64": "iVBORw0KGgoAAAANS...",
  "mimeType": "image/png",
  "title": "Relatório Executivo",
  "filters": {},
  "dateRange": "01/01/2025 - 23/01/2025"
}
```

### GET `/api/escalacoes/reports/test`

Testa a conexão com o serviço de relatórios.

## 💻 Uso no Frontend

### React (VeloHub)

```javascript
import { reportsAPI } from '../services/reportsApi';

// Enviar relatório simples
const result = await reportsAPI.sendReport(reportContent, {
  title: 'Relatório Executivo de CX',
  filters: {
    socialNetwork: 'Instagram',
    contactReason: 'Suporte'
  },
  dateRange: '01/01/2025 - 23/01/2025'
});

if (result.success) {
  console.log('Relatório enviado!', result.data.messageId);
}
```

### React (Socials - Exemplo)

```javascript
// src/services/velohubApi.js
const API_BASE_URL = 'https://velohub-278491073220.us-east1.run.app/api';

export const sendReportToWhatsApp = async (reportContent, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/escalacoes/reports/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportContent,
        ...options
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar relatório:', error);
    return { success: false, error: error.message };
  }
};
```

### Python (Streamlit - Socials)

```python
import requests
import json

def send_report_to_whatsapp(report_content, title=None, filters=None):
    """Envia relatório via WhatsApp usando API do VeloHub"""
    api_url = "https://velohub-278491073220.us-east1.run.app/api/escalacoes/reports/send"
    
    payload = {
        "reportContent": report_content,
        "title": title or "Relatório Executivo de CX",
        "filters": filters or {}
    }
    
    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Erro ao enviar relatório: {e}")
        return {"success": False, "error": str(e)}

# Uso no Streamlit
if st.button("📱 Enviar Relatório via WhatsApp"):
    report = generate_executive_report(df_summary)
    result = send_report_to_whatsapp(report, title="Relatório Semanal")
    
    if result.get("success"):
        st.success("✅ Relatório enviado com sucesso!")
    else:
        st.error(f"❌ Erro: {result.get('error')}")
```

## 📝 Formatação de Relatórios

O serviço converte automaticamente markdown para formato WhatsApp:

- `# Título` → `*Título*` (negrito)
- `## Subtítulo` → `*Subtítulo*` (negrito)
- `- Item` → `• Item` (lista)
- Links markdown são convertidos para texto simples
- Blocos de código são removidos

## 🔢 Número de Destinatário

O número padrão configurado é: **11943952784**

Formato WhatsApp: `5511943952784@s.whatsapp.net`

Para usar outro número, passe o `jid` no corpo da requisição.

## 🧪 Teste

```bash
# Testar conexão
curl https://velohub-278491073220.us-east1.run.app/api/escalacoes/reports/test

# Enviar relatório de teste
curl -X POST https://velohub-278491073220.us-east1.run.app/api/escalacoes/reports/send \
  -H "Content-Type: application/json" \
  -d '{
    "reportContent": "# Teste de Relatório\n\nEste é um relatório de teste.",
    "title": "Relatório de Teste"
  }'
```

## 📚 Arquivos Criados

1. `backend/services/escalacoes/reportService.js` - Serviço de formatação e envio
2. `backend/routes/api/escalacoes/reports.js` - Rotas da API
3. `src/services/reportsApi.js` - Cliente React para o frontend
4. `backend/server.js` - Registro das rotas (atualizado)

## ⚠️ Observações

- O serviço depende da API WhatsApp (Baileys) estar configurada e conectada
- O número 11943952784 precisa estar no formato brasileiro: 5511943952784
- Relatórios muito longos podem ser divididos em múltiplas mensagens pelo WhatsApp
- Imagens devem estar em base64 sem o prefixo `data:image/...`

## 🔗 Referências

- [WhatsApp Service](./backend/services/escalacoes/whatsappService.js)
- [Baileys Helper](./scripts/README_BAILEYS_HELPER.md)
- [API Config](./src/config/api-config.js)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
