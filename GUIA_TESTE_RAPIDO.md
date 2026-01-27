# ⚡ Guia Rápido de Teste - Relatórios WhatsApp

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 🚀 Teste Rápido (3 Passos)

### 1️⃣ Iniciar o Backend

Abra um terminal e execute:

```powershell
cd "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub\backend"
npm start
```

**Aguarde até ver:**
```
✅ Servidor backend rodando na porta 8090
🌐 Acessível em: http://localhost:8090
```

### 2️⃣ Executar Teste

Em **outro terminal**, execute:

```powershell
cd "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub"
node test-reports-whatsapp.js
```

### 3️⃣ Verificar Resultado

O script mostrará:
- ✅ **Verde** = Teste passou
- ❌ **Vermelho** = Teste falhou
- ⚠️ **Amarelo** = Aviso (configuração pendente)

## 📋 Resultado Esperado

```
🧪 TESTE DE INTEGRAÇÃO - RELATÓRIOS VIA WHATSAPP
============================================================

TESTE 1: Verificar Conexão
✅ Conexão OK!

TESTE 2: Enviar Relatório Simples
✅ Relatório enviado com sucesso!

📱 Verifique o WhatsApp do número 11943952784
```

## ⚠️ Problemas Comuns

### Backend não está rodando

**Erro:**
```
❌ Erro ao conectar
   Verifique se o backend está rodando em http://localhost:8090/api
```

**Solução:** Execute o passo 1 primeiro.

### WhatsApp API não configurada

**Erro:**
```
❌ Erro: WhatsApp desconectado
```

**Solução:** Configure `WHATSAPP_API_URL` no `backend/env` (opcional para teste básico).

## 🔧 Teste Manual via Browser

Abra no navegador:
```
http://localhost:8090/api/escalacoes/reports/test
```

Deve retornar JSON com `"success": true`.

## 📱 Teste de Envio Real

Para testar envio real via WhatsApp, você precisa:

1. **API Baileys rodando** (ex: Render.com, Cloud Run, etc.)
2. **Configurar variável:**
   ```env
   WHATSAPP_API_URL=https://sua-api-baileys.com
   ```
3. **WhatsApp conectado** na API Baileys

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23
