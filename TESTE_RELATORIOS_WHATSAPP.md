# 🧪 Guia de Teste Local - Relatórios via WhatsApp

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Pré-requisitos

1. **Node.js >= 18.0.0** instalado
2. **Backend VeloHub** configurado e rodando
3. **API WhatsApp (Baileys)** configurada (opcional para teste básico)

## 🚀 Como Testar

### Opção 1: Script Automatizado (Recomendado)

```powershell
# Na raiz do projeto VeloHub
node test-reports-whatsapp.js
```

O script irá:
- ✅ Verificar conexão com o backend
- ✅ Testar envio de relatório
- ✅ Mostrar status da configuração

### Opção 2: Teste Manual via cURL

#### 1. Testar Conexão

```powershell
curl http://localhost:8090/api/escalacoes/reports/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Serviço de relatórios está funcionando",
  "timestamp": "2025-01-23T...",
  "config": {
    "defaultJid": "11943952784@s.whatsapp.net",
    "whatsappApiUrl": "Configurado"
  }
}
```

#### 2. Enviar Relatório

```powershell
curl -X POST http://localhost:8090/api/escalacoes/reports/send `
  -H "Content-Type: application/json" `
  -d '{
    "reportContent": "# Relatório de Teste\n\nEste é um teste.",
    "title": "Teste de Integração"
  }'
```

### Opção 3: Teste via Frontend (React)

```javascript
import { reportsAPI } from './services/reportsApi';

// Testar conexão
const testResult = await reportsAPI.testConnection();
console.log(testResult);

// Enviar relatório
const result = await reportsAPI.sendReport(
  '# Relatório de Teste\n\nConteúdo do relatório...',
  {
    title: 'Relatório de Teste',
    filters: { socialNetwork: 'Instagram' }
  }
);
console.log(result);
```

## 🔧 Configuração Necessária

### 1. Iniciar o Backend

```powershell
cd backend
npm install
npm start
```

O backend deve estar rodando em: **http://localhost:8090**

### 2. Configurar WhatsApp API (Opcional)

Para testar o envio real, configure a variável de ambiente:

**Arquivo:** `backend/env` ou `backend/.env`

```env
WHATSAPP_API_URL=https://sua-api-baileys.com
```

**Nota:** Se não configurar, o teste ainda funcionará mas retornará erro ao tentar enviar.

### 3. Verificar Porta do Backend

O backend usa a porta **8090** por padrão. Se estiver usando outra porta, ajuste:

```powershell
# Windows PowerShell
$env:API_URL="http://localhost:SUA_PORTA/api"
node test-reports-whatsapp.js
```

## 📊 Resultados Esperados

### ✅ Teste Bem-Sucedido

```
🧪 TESTE DE INTEGRAÇÃO - RELATÓRIOS VIA WHATSAPP
============================================================

TESTE 1: Verificar Conexão
============================================================
✅ Conexão OK!
   Mensagem: Serviço de relatórios está funcionando

TESTE 2: Enviar Relatório Simples
============================================================
✅ Relatório enviado com sucesso!
   Message ID: 3EB0...
   Total de mensagens: 1

📱 Verifique o WhatsApp do número 11943952784
```

### ❌ Erro Comum: Backend Não Está Rodando

```
❌ Erro ao conectar
   Erro: fetch failed
   Verifique se o backend está rodando em http://localhost:8090/api
```

**Solução:** Inicie o backend primeiro:
```powershell
cd backend && npm start
```

### ❌ Erro: WhatsApp Desconectado

```
❌ Erro ao enviar relatório
   Erro: WhatsApp desconectado
   
⚠️  A API WhatsApp (Baileys) não está conectada
   Configure a variável WHATSAPP_API_URL no backend
```

**Solução:** Configure a URL da API Baileys ou verifique se está rodando.

## 🐛 Troubleshooting

### Problema: "Cannot find module 'fetch'"

**Solução:** Node.js >= 18 tem fetch nativo. Se estiver usando versão antiga:

```powershell
npm install node-fetch
```

E adicione no início do script:
```javascript
const fetch = require('node-fetch');
```

### Problema: Porta 8090 já em uso

**Solução:** Altere a porta no `backend/server.js` ou pare o processo que está usando a porta.

### Problema: CORS Error

**Solução:** O backend já tem CORS configurado. Se ainda houver erro, verifique se está acessando do mesmo domínio.

## 📝 Notas

- O número padrão é **11943952784** (formatado como `5511943952784@s.whatsapp.net`)
- O relatório será formatado automaticamente para WhatsApp
- Testes sem WhatsApp API configurado ainda validam a lógica do código

## 🔗 Próximos Passos

1. ✅ Testar conexão básica
2. ✅ Testar envio de relatório
3. ⏳ Configurar API WhatsApp para teste real
4. ⏳ Integrar no frontend socials

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
