# 🧪 Guia de Teste Local - Tipo Estorno e Campos Cancelamento

## 📋 Pré-requisitos

1. Node.js >= 18.0.0 instalado
2. MongoDB configurado (ou usar URI do MongoDB Atlas)
3. Variáveis de ambiente configuradas

## 🚀 Como Iniciar os Servidores

### Terminal 1: Backend (Porta 8090)

```powershell
cd "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub\backend"
npm install
npm start
```

Ou em modo desenvolvimento com auto-reload:
```powershell
npm run dev
```

**Verificar se está rodando:**
- Acesse: http://localhost:8090/api/test
- Deve retornar: `{ "success": true, "message": "Servidor funcionando!" }`

### Terminal 2: Frontend VeloHub Principal (Porta 8080)

```powershell
cd "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub"
npm install
npm start
```

**Verificar se está rodando:**
- Acesse: http://localhost:8080
- Deve abrir a aplicação React

### Terminal 3: Painel de Serviços (Porta 3000)

```powershell
cd "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub\painel de serviços"
npm install
npm run dev
```

**Verificar se está rodando:**
- Acesse: http://localhost:3000
- Deve abrir o painel Next.js

## 🧪 Testes a Realizar

### 1. Teste do Tipo "Estorno"

#### No Painel de Serviços (http://localhost:3000):
1. Acesse a página de solicitações
2. Selecione o tipo "Estorno" no dropdown
3. Verifique se aparecem os campos:
   - ☐ Checkbox "Crédito do Trabalhador"
   - ☐ Checkbox "Excedeu 40 dias"
   - Campo "Valor" (texto)
   - Seção "Anexos (imagens e vídeos)"
   - Campo "Observações"

#### Teste de Upload de Arquivos:
1. Clique em "Selecionar imagens" e escolha uma imagem
2. Verifique se a imagem aparece na lista com preview
3. Clique em "Selecionar vídeos" e escolha um vídeo
4. Verifique se o vídeo aparece na lista
5. Teste remover um arquivo clicando no "✕"
6. Preencha os campos obrigatórios:
   - CPF (11 dígitos)
   - Valor
   - Selecione pelo menos um checkbox
7. Clique em "Enviar Solicitação"
8. Verifique no console do backend se a mensagem foi enviada com anexos

#### Verificar Mensagem no WhatsApp:
A mensagem deve conter:
```
*Nova Solicitação Técnica - Estorno*

Agente: [Nome]
CPF: [CPF sem pontos e traços]

Crédito do Trabalhador: ✅ Sim / ❌ Não
Excedeu 40 dias: ✅ Sim / ❌ Não
Valor: R$ 0,00
Observações: [texto]

📎 Anexos: X imagem(ns), Y vídeo(s)
```

### 2. Teste do Tipo "Cancelamento"

#### Verificar Campos:
1. Selecione o tipo "Cancelamento" no dropdown
2. Verifique se aparecem os campos:
   - Campo "Nome do Cliente" (texto, obrigatório)
   - Campo "Data da Contratação" (date, obrigatório)
   - Campo "Valor" (texto, obrigatório)
   - Campo "Observações"

#### Teste de Envio:
1. Preencha todos os campos obrigatórios
2. Envie a solicitação
3. Verifique se a mensagem no WhatsApp contém:
   ```
   Nome do Cliente: [nome]
   Data da Contratação: [data]
   Valor: [valor]
   Observações: [texto]
   ```

### 3. Teste no VeloHub Principal

#### Acesse: http://localhost:8080
1. Navegue até o módulo de Escalações
2. Teste os mesmos cenários acima
3. Verifique se os campos e funcionalidades são idênticos

## 🔍 Verificações no Backend

### Console do Backend deve mostrar:
```
[WHATSAPP DEBUG] Verificando condições de envio:
  - WHATSAPP_API_URL: ✅ Configurado
  - WHATSAPP_DEFAULT_JID: ✅ Configurado
  - mensagemTexto: ✅ Presente (XXX chars)
✅ WhatsApp: Mensagem enviada com sucesso! messageId: [ID]
```

### Verificar no MongoDB:
1. Conecte ao MongoDB
2. Acesse a coleção `hub_escalacoes.solicitacoes_tecnicas`
3. Verifique se a solicitação foi salva com:
   - `tipo: "Estorno"` ou `tipo: "Cancelamento"`
   - `payload.imagens: [...]` (se houver anexos)
   - `payload.videos: [...]` (se houver vídeos)
   - `payload.creditoTrabalhador: true/false`
   - `payload.excedeu40Dias: true/false`
   - `payload.valorEstorno: "R$ X,XX"`

## ⚠️ Problemas Comuns

### Backend não inicia:
- Verifique se a porta 8090 está livre: `netstat -ano | findstr :8090`
- Verifique se o MongoDB está configurado no arquivo `.env` ou `backend/config-local.js`

### Frontend não conecta ao backend:
- Verifique se o backend está rodando na porta 8090
- Verifique a variável `API_BASE_URL` no frontend (deve ser `http://localhost:8090`)

### Upload de arquivos não funciona:
- Verifique o tamanho dos arquivos (máximo 50MB)
- Verifique o console do navegador para erros
- Verifique se o backend está processando os anexos (logs no console)

### WhatsApp não envia:
- Verifique se `WHATSAPP_API_URL` e `WHATSAPP_DEFAULT_JID` estão configurados
- Verifique se a API do WhatsApp está rodando e conectada
- Verifique os logs do backend para erros específicos

## 📝 Checklist de Testes

- [ ] Backend iniciado na porta 8090
- [ ] Frontend VeloHub iniciado na porta 8080
- [ ] Painel de Serviços iniciado na porta 3000
- [ ] Tipo "Estorno" aparece no select
- [ ] Campos do Estorno aparecem corretamente
- [ ] Upload de imagens funciona
- [ ] Upload de vídeos funciona
- [ ] Remoção de arquivos funciona
- [ ] Envio de Estorno com anexos funciona
- [ ] Mensagem no WhatsApp contém todos os campos
- [ ] Tipo "Cancelamento" aparece no select
- [ ] Campos do Cancelamento aparecem corretamente
- [ ] Envio de Cancelamento funciona
- [ ] Dados são salvos no MongoDB corretamente
- [ ] CPF é enviado sem pontos e traços no WhatsApp

## 🎯 Resultado Esperado

Após todos os testes, você deve conseguir:
1. ✅ Criar solicitações do tipo "Estorno" com anexos
2. ✅ Criar solicitações do tipo "Cancelamento" com todos os campos
3. ✅ Ver as mensagens formatadas corretamente no WhatsApp
4. ✅ Ver os dados salvos corretamente no MongoDB

---

**Versões dos arquivos modificados:**
- `painel de serviços/components/FormSolicitacao.jsx`: v1.6.0
- `src/components/Escalacoes/FormSolicitacao.js`: v1.4.0
- `backend/routes/api/escalacoes/solicitacoes.js`: atualizado para processar anexos

