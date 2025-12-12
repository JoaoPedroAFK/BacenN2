# 📋 Resumo das Alterações - Documento V2

## ✅ O QUE JÁ FOI FEITO

### 1. Menu CANAIS
- [x] Adicionado menu "CANAIS" no topo de todas as páginas
- [x] Links para BACEN, N2 e Chatbot
- [x] Estilos CSS aplicados

### 2. Substituição "Ficha" → "Reclamação"
- [x] Títulos e botões atualizados em `bacen.html`
- [x] "Nova Ficha" → "Nova Reclamação"
- [x] "Lista de Fichas" → "Lista de Reclamações"
- [ ] **PENDENTE**: Substituir em todos os arquivos JavaScript
- [ ] **PENDENTE**: Substituir em `n2.html` e `chatbot.html`

### 3. Formulário BACEN - Reorganização
- [x] **1º Item: Dados Básicos** (primeiro)
  - [x] Data entrada, Responsável, Nome completo, CPF, Origem, Telefone
  - [x] Removido "Dados do Cliente" (campos movidos para Dados Básicos)
- [x] **2º Item: Detalhes da Reclamação** (segundo)
  - [x] Motivo Reduzido atualizado com todas as opções especificadas
  - [x] Motivo Reclamação
  - [x] Prazo Bacen
- [x] **3º Item: Tentativas de Contato**
  - [x] 1ª e 2ª tentativa
  - [x] Botão para adicionar mais tentativas
  - [x] Função JavaScript para múltiplas tentativas
- [x] **4º Item: Acionamentos ao Canais de Atendimento e Protocolos**
  - [x] Todos os campos com protocolos condicionais
- [x] **5º Item: Liberação do PIX**
  - [x] Subitem "Enviar para cobrança" (Sim/Não)
- [x] **6º Item: Observações (desfecho)**
- [x] **7º Item: Casos Críticos (Blacklist)**

## ⚠️ O QUE AINDA PRECISA SER FEITO

### 1. Substituição "Ficha" → "Reclamação" (completo)
- [ ] Substituir em `n2.html`
- [ ] Substituir em `chatbot.html`
- [ ] Substituir em todos os arquivos JavaScript:
  - `js/bacen-page.js`
  - `js/n2-page.js`
  - `js/chatbot-page.js`
  - `js/fichas-especificas.js`
  - `js/gerenciador-fichas-perfil.js`
  - `js/lista-casos-abertos.js`
  - Outros arquivos que mencionam "ficha"

### 2. Formulário N2 - Ajustes
- [ ] Reorganizar conforme especificação (mesma estrutura do BACEN)
- [ ] Atualizar opções de Motivo Reduzido
- [ ] Adicionar múltiplas tentativas de contato
- [ ] Ajustar ordem das seções

### 3. Formulário Chatbot - Ajustes
- [ ] Verificar estrutura conforme especificação
- [ ] Ajustar campos e ordem

### 4. Exportação para Excel
- [ ] Implementar exportação para Excel (.xlsx)
- [ ] Adicionar botão de exportação em todos os relatórios
- [ ] Atualmente só tem CSV

### 5. Menu CANAIS nas outras páginas
- [ ] Adicionar em `n2.html`
- [ ] Adicionar em `chatbot.html`

### 6. JavaScript - Coleta de Dados
- [x] Função para coletar múltiplas tentativas (BACEN)
- [ ] Atualizar `handleSubmitBacen` para salvar tentativas corretamente
- [ ] Fazer o mesmo para N2
- [ ] Atualizar funções de exibição para mostrar múltiplas tentativas

## 📝 DETALHES DAS ESPECIFICAÇÕES

### Motivo Reduzido - Opções Completas
- Abatimento Juros
- Abatimento Juros/Chave PIX
- Cancelamento Conta
- Chave PIX
- PIX/Abatimento Juros/Encerramento de conta
- Chave PIX/Abatimento Juros/Prob. App
- Chave PIX/Acesso ao App
- Chave PIX/Exclusão de Conta
- Conta
- Devolução à Celcoin
- Fraude
- Liquidação Antecipada
- Liquidação Antecipada/Abatimento Juros
- Não recebeu restituição
- Não recebeu restituição/Abatimento Juros
- Não recebeu restituição/Abatimento Juros/Chave PIX
- Não recebeu restituição/Chave PIX
- Probl. App/Gov
- Superendividamento

### Origem BACEN e N2
- Bacen Celcoin
- Bacen Via Capital
- Consumidor.Gov

### Origem Chatbot
- Atendimento

## 🎯 PRÓXIMOS PASSOS

1. **Completar substituição "Ficha" → "Reclamação"** em todos os arquivos
2. **Ajustar formulários N2 e Chatbot** conforme especificação
3. **Implementar exportação Excel**
4. **Adicionar menu CANAIS** nas outras páginas
5. **Testar todas as funcionalidades**

---

**Status**: ~40% completo - Foco em BACEN primeiro, depois N2 e Chatbot

