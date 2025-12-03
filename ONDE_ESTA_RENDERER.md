# 📍 Onde está o código do renderer?

## 🔍 Situação Atual

O código do **renderer do WhatsApp** **NÃO está neste repositório**.

Este repositório contém apenas:
- ✅ Backend do VeloHub (Node.js/Express)
- ✅ Frontend do VeloHub (React)
- ✅ Serviços de integração

## 📋 Onde o Renderer Está

### 1. Servidor Externo
Pela configuração encontrada:
```
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
```

O renderer está rodando em um **serviço separado no Render.com**.

### 2. Repositório Separado
O código do renderer provavelmente está em:
- Outro repositório Git (separado)
- Servidor do Render.com
- Código que implementa Baileys (biblioteca WhatsApp)

## 🔎 Como Encontrar o Código

### Procure por estes logs no código do renderer:

1. **Log de reação:**
   ```
   [REACTION][upsert]
   ```

2. **Log de auto-status:**
   ```
   [AUTO-STATUS/UPSERT] Marcando FEITO via reação ✅
   ```

3. **Log de debug:**
   ```
   [REACTION DEBUG][upsert]
   ```

### Arquivos prováveis:
- `index.js` ou `server.js` (arquivo principal)
- Arquivo que processa eventos do Baileys
- Arquivo que lida com reações (`reaction`, `upsert`)

## ✅ O Que Fazer

1. **Acesse o repositório do renderer** (separado)
2. **Procure pelo log** `[AUTO-STATUS/UPSERT]`
3. **Adicione o código** do arquivo `CODIGO_RENDERER_AUTO_STATUS.js`
4. **Configure a variável de ambiente:**
   ```
   BACKEND_URL=http://localhost:8090
   ```
   (ou `http://172.16.50.66:8090` se estiver em outra máquina)

## 📝 Exemplo de Código

O código que precisa ser adicionado está no arquivo:
- `CODIGO_RENDERER_AUTO_STATUS.js`

Ele contém a função `atualizarStatusViaReacao()` que faz a requisição HTTP para o backend.

## 🚨 Importante

O renderer precisa fazer uma requisição HTTP POST para:
```
http://localhost:8090/api/escalacoes/solicitacoes/auto-status
```

Com o body:
```json
{
  "waMessageId": "3EB077B9BE075B4BCD6C63",
  "reaction": "✅",
  "reactor": "35257503981709"
}
```

