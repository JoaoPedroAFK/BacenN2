# 🧪 Guia de Teste - Endpoint auto-status

## 📋 Pré-requisitos

1. Servidor backend rodando em `http://localhost:8090`
2. MongoDB conectado e com pelo menos uma solicitação criada
3. A solicitação deve ter um `waMessageId` (criada via WhatsApp)

## 🚀 Como Testar

### Opção 1: Usar o script de teste automatizado

```bash
cd backend
node test-auto-status.js
```

O script irá:
1. Buscar uma solicitação existente
2. Testar reação ✅ (deve atualizar para "feito")
3. Testar reação ❌ (deve atualizar para "não feito")

### Opção 2: Teste manual com curl/Postman

#### 1. Primeiro, busque uma solicitação existente:

```bash
curl http://localhost:8090/api/escalacoes/solicitacoes
```

Anote o `waMessageId` de uma solicitação.

#### 2. Teste reação ✅ (feito):

```bash
curl -X POST http://localhost:8090/api/escalacoes/solicitacoes/auto-status \
  -H "Content-Type: application/json" \
  -d "{\"waMessageId\": \"SEU_WA_MESSAGE_ID_AQUI\", \"reaction\": \"✅\", \"reactor\": \"5511999999999\"}"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "feito",  // ✅ Deve ser "feito" e não "Resolvido"
    "respondedAt": "...",
    "respondedBy": "5511999999999",
    ...
  }
}
```

#### 3. Teste reação ❌ (não feito):

```bash
curl -X POST http://localhost:8090/api/escalacoes/solicitacoes/auto-status \
  -H "Content-Type: application/json" \
  -d "{\"waMessageId\": \"SEU_WA_MESSAGE_ID_AQUI\", \"reaction\": \"❌\", \"reactor\": \"5511999999999\"}"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "não feito",  // ✅ Deve ser "não feito" e não "Negado"
    "respondedAt": "...",
    "respondedBy": "5511999999999",
    ...
  }
}
```

## ✅ Validação

Após o teste, verifique:

1. **Status no MongoDB**: O campo `status` deve estar como `"feito"` ou `"não feito"` (não mais "Resolvido" ou "Negado")
2. **Frontend**: O frontend deve exibir o status corretamente após o refresh automático (a cada 20s)
3. **Logs do servidor**: Deve aparecer `[AUTO-STATUS]` nos logs com os dados recebidos

## 🔍 Verificação no Frontend

1. Abra o painel de escalações no frontend
2. Crie uma solicitação (se ainda não tiver)
3. Aguarde o envio via WhatsApp (se configurado)
4. Anote o `waMessageId` retornado
5. Use o script de teste ou curl para atualizar o status
6. Aguarde até 20 segundos (refresh automático)
7. Verifique se o status aparece corretamente na lista de logs

## 🐛 Troubleshooting

### Erro: "Solicitação não encontrada"
- Verifique se o `waMessageId` está correto
- Verifique se a solicitação existe no MongoDB
- O `waMessageId` pode estar em `payload.messageIds` (array)

### Erro: "MongoDB não configurado"
- Verifique se `MONGO_ENV` está configurado
- Verifique se o MongoDB está acessível

### Status não aparece no frontend
- Verifique se o frontend está fazendo refresh (a cada 20s)
- Verifique se o `waMessageId` no cache local corresponde ao do backend
- Verifique o console do navegador para erros

