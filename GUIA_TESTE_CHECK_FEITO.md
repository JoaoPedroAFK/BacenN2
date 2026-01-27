# 🧪 Guia de Teste - Check "Feito" no Painel

## 📋 Pré-requisitos

1. **Backend rodando** na porta `8090`
2. **Frontend rodando** na porta `8080`
3. **MongoDB conectado** e funcionando
4. **Uma solicitação criada** com `waMessageId`

---

## 🚀 Passo 1: Iniciar os Servidores

### Terminal 1 - Backend:
```powershell
cd backend
npm start
```

**Verificar se iniciou corretamente:**
- Deve mostrar: `🚀 Tentando iniciar servidor na porta 8090`
- Deve mostrar: `✅ Servidor rodando em http://0.0.0.0:8090`

### Terminal 2 - Frontend:
```powershell
npm start
```

**Verificar se iniciou corretamente:**
- Deve abrir automaticamente em `http://localhost:8080`
- Ou acesse manualmente: `http://172.16.50.66:8080`

---

## 📝 Passo 2: Criar uma Solicitação

1. **Acesse o frontend:** `http://localhost:8080` ou `http://172.16.50.66:8080`
2. **Faça login** (se necessário)
3. **Vá para:** Escalações → Solicitações Técnicas
4. **Preencha o formulário:**
   - CPF: `12345678900` (exemplo)
   - Tipo: `Alteração de Dados Cadastrais`
   - Preencha os demais campos
5. **Clique em "Enviar Solicitação"**
6. **Aguarde** a confirmação de envio
7. **Anote o `waMessageId`** que aparece nos logs (ou no console do navegador)

---

## 🧪 Passo 3: Testar o Auto-Status

### Opção A: Teste Manual com PowerShell

```powershell
# Substitua SEU_WA_MESSAGE_ID pelo waMessageId real da solicitação criada
$body = @{
  waMessageId = 'SEU_WA_MESSAGE_ID_AQUI'
  reaction = '✅'
  reactor = '5511999999999'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://172.16.50.66:8090/api/escalacoes/solicitacoes/auto-status' `
  -Method POST `
  -ContentType 'application/json' `
  -Body $body
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "feito",  // ✅ Deve ser "feito"
    "respondedAt": "...",
    "respondedBy": "5511999999999",
    ...
  }
}
```

### Opção B: Usar o Script de Teste

```powershell
cd backend
node test-auto-status.js
```

**Nota:** O script busca automaticamente uma solicitação existente e testa.

---

## ✅ Passo 4: Verificar no Frontend

1. **Volte para o painel de Solicitações Técnicas**
2. **Procure a solicitação** que você criou
3. **Aguarde até 10 segundos** (refresh automático) ou **clique no botão "Atualizar"**
4. **Verifique se apareceu:**
   - ✅ **Ícone de check verde** (✅)
   - **3 barras verdes** de progresso
   - **Status: "feito"** no texto

---

## 🔍 Passo 5: Verificar Logs

### No Console do Navegador (F12):
- Deve aparecer: `[STATUS UPDATE] ... "enviado" → "feito"`
- Deve aparecer: `[REFRESH NOW] Status atualizado: ...`

### No Terminal do Backend:
- Deve aparecer: `[AUTO-STATUS] Recebida requisição:`
- Deve aparecer: `[AUTO-STATUS] Dados recebidos:`
- Deve aparecer: `✅ Status automático atualizado: ... → feito`

---

## 🐛 Troubleshooting

### Problema: Status não atualiza no frontend

**Solução:**
1. Verifique se o backend recebeu a requisição (logs)
2. Clique no botão "Atualizar" manualmente
3. Verifique o console do navegador para erros
4. Verifique se o `waMessageId` está correto

### Problema: Backend não recebe requisição

**Solução:**
1. Verifique se o backend está rodando: `curl http://172.16.50.66:8090/api/escalacoes/solicitacoes`
2. Verifique se a porta está correta (8090)
3. Verifique se há firewall bloqueando

### Problema: Check não aparece

**Solução:**
1. Verifique se o status no MongoDB é exatamente `"feito"` (não "Resolvido")
2. Verifique o console do navegador para logs de debug
3. Limpe o cache do navegador (Ctrl+Shift+R)
4. Verifique se o refresh automático está funcionando (10s)

---

## 📊 Checklist de Teste

- [ ] Backend iniciado na porta 8090
- [ ] Frontend iniciado na porta 8080
- [ ] Solicitação criada com sucesso
- [ ] `waMessageId` anotado
- [ ] Teste do auto-status executado
- [ ] Backend retornou `status: "feito"`
- [ ] Frontend mostra check ✅
- [ ] Frontend mostra 3 barras verdes
- [ ] Status atualiza automaticamente (10s)
- [ ] Botão "Atualizar" funciona

---

## 🎯 Teste Completo do Fluxo

1. **Criar solicitação** → Status: "enviado" (📨)
2. **Enviar reação ✅** → Status: "feito" (✅)
3. **Verificar no frontend** → Deve mostrar ✅ e 3 barras verdes
4. **Aguardar 10s** → Deve atualizar automaticamente
5. **Enviar reação ❌** → Status: "não feito" (❌)
6. **Verificar no frontend** → Deve mostrar ❌ e 3 barras vermelhas

---

## 💡 Dicas

- **Use o console do navegador (F12)** para ver logs de debug
- **Use o botão "Atualizar"** para forçar atualização imediata
- **Verifique os logs do backend** para confirmar que recebeu a requisição
- **O refresh automático** acontece a cada 10 segundos

---

## 🚀 Pronto para Testar!

Siga os passos acima e verifique se o check ✅ aparece corretamente quando o status é atualizado para "feito".

