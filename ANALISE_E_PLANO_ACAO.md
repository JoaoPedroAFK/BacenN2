# 📋 Análise e Plano de Ação - Sistema Casos Especiais

## 📊 Resumo Executivo

Este documento apresenta a análise comparativa entre o documento de orientação "Sistema Casos Especiais (BACEN, N2 e Chatbot)" e a implementação atual do sistema, listando todas as melhorias necessárias e o plano de ação para implementação.

---

## 🔍 ANÁLISE COMPARATIVA

### ✅ O QUE JÁ ESTÁ CORRETO

1. **Estrutura Base:**
   - ✅ Sistema de canais (BACEN, N2, Chatbot) implementado
   - ✅ Formulários separados por canal
   - ✅ Seção "Detalhes da Reclamação" como primeira seção
   - ✅ Sistema de anexos (PDFs e Imagens) funcionando

2. **Campos Comuns:**
   - ✅ Nome completo, CPF, Telefone com máscaras
   - ✅ Data de entrada
   - ✅ Status e Finalizado em
   - ✅ Observações

---

## 🚨 MELHORIAS NECESSÁRIAS

### 📋 FORMULÁRIO BACEN

#### **1. Responsável (Dados Básicos)**
- ❌ **ATUAL:** Dropdown com 6 opções (Vanessa, Shirley, Caroline, Emerson, Nayara, Renata)
- ✅ **DOCUMENTO:** Apenas 2 opções (Shirley ou Vanessa)
- **AÇÃO:** Limitar dropdown para apenas Shirley e Vanessa

#### **2. Origem (Dados do Cliente)**
- ❌ **ATUAL:** 5 opções (Bacen Celcoin, Bacen Via Capital, Consumidor.Gov, Reclame Aqui, Procon)
- ✅ **DOCUMENTO:** Apenas 3 opções (Bacen Celcoin, Bacen Via Capital, Consumidor.Gov)
- **AÇÃO:** Remover "Reclame Aqui" e "Procon" do dropdown de Origem

#### **3. Tentativas de Contato**
- ❌ **ATUAL:** 3 campos (1ª, 2ª, 3ª tentativa)
- ✅ **DOCUMENTO:** Apenas 2 campos (1ª e 2ª tentativa)
- **AÇÃO:** Remover campo "3ª tentativa"

#### **4. NOVA SEÇÃO: "Acionamentos ao Canais de Atendimento e Protocolos"**
- ❌ **ATUAL:** Checkboxes simples sem campo de protocolo
- ✅ **DOCUMENTO:** Cada checkbox deve ter um campo "Qual Protocolo" associado
- **ESTRUTURA NECESSÁRIA:**
  ```
  - Acionou a central? [ ] → Qual Protocolo: [________]
  - N2 – Segundo Nível? [ ] → Qual Protocolo: [________]
  - Reclame Aqui? [ ] → Qual Protocolo: [________]
  - Procon? [ ] → Qual Protocolo: [________]
  - Protocolos em que não houve acionamento: [________]
  ```
- **AÇÃO:** Criar nova seção com checkboxes e campos de protocolo condicionais

#### **5. Liberação do PIX**
- ❌ **ATUAL:** Checkbox simples "PIX liberado ou excluído?"
- ✅ **DOCUMENTO:** Opção de seleção (dropdown) com subitem "Enviar para cobrança"
- **ESTRUTURA NECESSÁRIA:**
  ```
  - Liberação do PIX: [Dropdown: Liberado / Excluído / Não Aplicável]
    - Enviar para cobrança? [ ] Sim [ ] Não
  ```
- **AÇÃO:** Converter checkbox para dropdown e adicionar subitem

#### **6. Ordem das Seções**
- ✅ **ATUAL:** Detalhes da Reclamação (1º) ✓
- ❌ **ATUAL:** Ordem das demais seções não corresponde exatamente
- ✅ **DOCUMENTO:** Ordem específica:
  1. Detalhes da Reclamação
  2. Dados básicos
  3. Tentativas de Contato
  4. Acionamentos ao Canais de Atendimento e Protocolos
  5. Liberação do PIX
  6. Observações (desfecho)
  7. Casos Críticos (Blacklist)
- **AÇÃO:** Reorganizar ordem das seções conforme documento

---

### 📋 FORMULÁRIO N2

#### **1. Responsável (Dados Básicos)**
- ❌ **ATUAL:** Dropdown com 6 opções
- ✅ **DOCUMENTO:** Apenas 2 opções (Shirley ou Vanessa)
- **AÇÃO:** Limitar dropdown para apenas Shirley e Vanessa

#### **2. Origem (Dados do Cliente)**
- ❌ **ATUAL:** "Ouvidoria N2"
- ✅ **DOCUMENTO:** "Atendimento"
- **AÇÃO:** Alterar texto de "Ouvidoria N2" para "Atendimento"

#### **3. Tentativas de Contato**
- ❌ **ATUAL:** Não implementado no formulário N2
- ✅ **DOCUMENTO:** Deve ter 1ª e 2ª tentativa
- **AÇÃO:** Adicionar seção "Tentativas de Contato" com 2 campos

#### **4. NOVA SEÇÃO: "Acionamentos ao Canais de Atendimento e Protocolos"**
- ❌ **ATUAL:** Não existe
- ✅ **DOCUMENTO:** Mesma estrutura do BACEN
- **AÇÃO:** Criar seção idêntica ao BACEN

#### **5. Liberação do PIX**
- ❌ **ATUAL:** Checkbox simples
- ✅ **DOCUMENTO:** Dropdown com subitem "Enviar para cobrança"
- **AÇÃO:** Mesma alteração do BACEN

#### **6. Ordem das Seções**
- ✅ **ATUAL:** Detalhes da Reclamação (1º) ✓
- ❌ **ATUAL:** Ordem não corresponde
- ✅ **DOCUMENTO:** Mesma ordem do BACEN
- **AÇÃO:** Reorganizar conforme documento

---

### 📋 FORMULÁRIO CHATBOT

#### **⚠️ MUDANÇA ESTRUTURAL COMPLETA**

O formulário Chatbot precisa ser **completamente reformulado** conforme o documento:

#### **ESTRUTURA ATUAL vs DOCUMENTO:**

**ATUAL:**
1. Detalhes da Reclamação
2. Dados Básicos
3. Dados do Cliente
4. Campos Específicos Chatbot
5. Resolução

**DOCUMENTO:**
1. **Dados Básicos**
   - Data do cliente com o chatbot
   - CPF (000.000.000-00)

2. **Detalhes da Avaliação**
   - Nota de Avaliação
   - Avaliação do Cliente (campo aberto)
   - Produto (dropdown: Antecipação, Aplicativo, Calculadora, Crédito do Trabalhador, Empréstimo Pessoal)
   - Motivo (dropdown: Calculadora, Chave PIX, Conta, Débito em Aberto, Elegibilidade, Encerramento da Cadastro, Erros – Bugs, Fraude, Open Finance)
   - Resposta do Bot (Sim ou Não)

3. **Liberação do PIX**
   - Opção de selecionar
   - Subitem: Enviar para cobrança (Sim ou Não)
   - Casos Críticos (Blacklist)

4. **Resolução**
   - Finalização (Sim ou não)
   - Responsável (Shirley ou Vanessa)
   - Campo aberto

#### **AÇÕES NECESSÁRIAS:**
1. Remover seção "Detalhes da Reclamação" atual
2. Criar nova seção "Dados Básicos" com apenas Data e CPF
3. Criar nova seção "Detalhes da Avaliação" com todos os campos especificados
4. Reorganizar "Liberação do PIX" com subitens
5. Reorganizar "Resolução" conforme especificação
6. Remover campos não mencionados no documento

---

## 📝 PLANO DE AÇÃO DETALHADO

### **FASE 1: Ajustes BACEN e N2 (Prioridade Alta)**

#### **Tarefa 1.1: Ajustar Dropdown de Responsável**
- **Arquivos:** `bacen.html`, `n2.html`
- **Ação:** Limitar opções para apenas Shirley e Vanessa
- **Tempo estimado:** 15 minutos

#### **Tarefa 1.2: Ajustar Dropdown de Origem**
- **Arquivos:** `bacen.html`, `n2.html`
- **Ação:** 
  - BACEN: Remover "Reclame Aqui" e "Procon"
  - N2: Alterar "Ouvidoria N2" para "Atendimento"
- **Tempo estimado:** 15 minutos

#### **Tarefa 1.3: Ajustar Tentativas de Contato**
- **Arquivos:** `bacen.html`, `n2.html`
- **Ação:**
  - BACEN: Remover campo "3ª tentativa"
  - N2: Adicionar seção "Tentativas de Contato" com 2 campos
- **Tempo estimado:** 30 minutos

#### **Tarefa 1.4: Criar Seção "Acionamentos ao Canais de Atendimento e Protocolos"**
- **Arquivos:** `bacen.html`, `n2.html`, `js/bacen-page.js`, `js/n2-page.js`
- **Ação:** 
  - Criar nova seção com checkboxes e campos de protocolo condicionais
  - Implementar lógica JavaScript para mostrar/ocultar campos de protocolo
  - Atualizar lógica de salvamento
- **Tempo estimado:** 2 horas

#### **Tarefa 1.5: Converter PIX para Dropdown com Subitens**
- **Arquivos:** `bacen.html`, `n2.html`, `js/bacen-page.js`, `js/n2-page.js`
- **Ação:**
  - Converter checkbox para dropdown (Liberado/Excluído/Não Aplicável)
  - Adicionar subitem "Enviar para cobrança" (Sim/Não)
  - Atualizar lógica de salvamento e exibição
- **Tempo estimado:** 1 hora

#### **Tarefa 1.6: Reorganizar Ordem das Seções**
- **Arquivos:** `bacen.html`, `n2.html`
- **Ação:** Reordenar seções conforme documento
- **Tempo estimado:** 30 minutos

---

### **FASE 2: Reformulação Completa Chatbot (Prioridade Alta)**

#### **Tarefa 2.1: Remover Estrutura Atual**
- **Arquivos:** `chatbot.html`
- **Ação:** Remover seções não mencionadas no documento
- **Tempo estimado:** 15 minutos

#### **Tarefa 2.2: Criar Nova Seção "Dados Básicos"**
- **Arquivos:** `chatbot.html`
- **Ação:** Criar seção com apenas Data do cliente com o chatbot e CPF
- **Tempo estimado:** 20 minutos

#### **Tarefa 2.3: Criar Seção "Detalhes da Avaliação"**
- **Arquivos:** `chatbot.html`, `js/chatbot-page.js`
- **Ação:** 
  - Criar seção com todos os campos especificados
  - Implementar dropdowns para Produto e Motivo
  - Implementar campo "Resposta do Bot" (Sim/Não)
- **Tempo estimado:** 1 hora

#### **Tarefa 2.4: Reorganizar "Liberação do PIX" e "Resolução"**
- **Arquivos:** `chatbot.html`, `js/chatbot-page.js`
- **Ação:** 
  - Reorganizar PIX conforme especificação
  - Reorganizar Resolução com campos corretos
- **Tempo estimado:** 45 minutos

#### **Tarefa 2.5: Atualizar Lógica de Salvamento Chatbot**
- **Arquivos:** `js/chatbot-page.js`, `js/fichas-especificas.js`
- **Ação:** Atualizar para salvar novos campos e estrutura
- **Tempo estimado:** 1 hora

---

### **FASE 3: Atualizações de Exibição e Validação (Prioridade Média)**

#### **Tarefa 3.1: Atualizar Fichas Detalhadas**
- **Arquivos:** `js/fichas-especificas.js`
- **Ação:** Atualizar exibição das fichas para refletir nova estrutura
- **Tempo estimado:** 2 horas

#### **Tarefa 3.2: Atualizar Validações**
- **Arquivos:** `js/validacao-condicional.js`, `js/bacen-page.js`, `js/n2-page.js`, `js/chatbot-page.js`
- **Ação:** Atualizar validações para novos campos e estruturas
- **Tempo estimado:** 1 hora

#### **Tarefa 3.3: Atualizar Relatórios**
- **Arquivos:** `js/relatorios-robusto.js`, `js/exportacao-relatorios.js`
- **Ação:** Atualizar relatórios para incluir novos campos
- **Tempo estimado:** 1 hora

---

### **FASE 4: Testes e Ajustes Finais (Prioridade Média)**

#### **Tarefa 4.1: Testes de Formulários**
- **Ação:** Testar todos os formulários com dados reais
- **Tempo estimado:** 2 horas

#### **Tarefa 4.2: Testes de Salvamento e Recuperação**
- **Ação:** Verificar se dados são salvos e recuperados corretamente
- **Tempo estimado:** 1 hora

#### **Tarefa 4.3: Testes de Exibição**
- **Ação:** Verificar se fichas detalhadas exibem corretamente
- **Tempo estimado:** 1 hora

---

## 📊 RESUMO DE ESFORÇO

| Fase | Tarefas | Tempo Estimado |
|------|---------|----------------|
| Fase 1 | 6 tarefas | ~5 horas |
| Fase 2 | 5 tarefas | ~4 horas |
| Fase 3 | 3 tarefas | ~4 horas |
| Fase 4 | 3 tarefas | ~4 horas |
| **TOTAL** | **17 tarefas** | **~17 horas** |

---

## 🎯 PRIORIZAÇÃO

### **Alta Prioridade (Implementar Primeiro):**
1. ✅ Ajustar Responsável (BACEN e N2)
2. ✅ Ajustar Origem (BACEN e N2)
3. ✅ Ajustar Tentativas de Contato
4. ✅ Criar Seção "Acionamentos ao Canais de Atendimento e Protocolos"
5. ✅ Converter PIX para Dropdown
6. ✅ Reformulação Completa Chatbot

### **Média Prioridade (Implementar Depois):**
1. Reorganizar ordem das seções
2. Atualizar fichas detalhadas
3. Atualizar validações
4. Atualizar relatórios

### **Baixa Prioridade (Ajustes Finais):**
1. Testes completos
2. Ajustes de UX baseados em feedback

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **Compatibilidade com Dados Existentes:**
   - Algumas mudanças podem afetar fichas já salvas
   - Considerar migração de dados ou manter compatibilidade retroativa

2. **Campos Removidos:**
   - Alguns campos atuais não estão no documento
   - Decidir se devem ser mantidos ou removidos

3. **Validações:**
   - Atualizar validações para novos campos obrigatórios
   - Garantir que protocolos sejam obrigatórios quando checkbox estiver marcado

4. **Exibição:**
   - Atualizar todas as visualizações (lista, detalhes, relatórios) para nova estrutura

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **BACEN:**
- [ ] Ajustar Responsável (apenas Shirley/Vanessa)
- [ ] Ajustar Origem (remover Reclame Aqui e Procon)
- [ ] Remover 3ª tentativa
- [ ] Criar seção "Acionamentos ao Canais de Atendimento e Protocolos"
- [ ] Converter PIX para dropdown com subitens
- [ ] Reorganizar ordem das seções
- [ ] Atualizar validações
- [ ] Atualizar exibição

### **N2:**
- [ ] Ajustar Responsável (apenas Shirley/Vanessa)
- [ ] Alterar Origem para "Atendimento"
- [ ] Adicionar seção "Tentativas de Contato"
- [ ] Criar seção "Acionamentos ao Canais de Atendimento e Protocolos"
- [ ] Converter PIX para dropdown com subitens
- [ ] Reorganizar ordem das seções
- [ ] Atualizar validações
- [ ] Atualizar exibição

### **Chatbot:**
- [ ] Remover estrutura atual
- [ ] Criar seção "Dados Básicos" (Data + CPF)
- [ ] Criar seção "Detalhes da Avaliação"
- [ ] Reorganizar "Liberação do PIX"
- [ ] Reorganizar "Resolução"
- [ ] Atualizar lógica de salvamento
- [ ] Atualizar validações
- [ ] Atualizar exibição

---

## 🚀 PRÓXIMOS PASSOS

1. **Revisar este documento** com a equipe
2. **Aprovar plano de ação**
3. **Iniciar Fase 1** (Ajustes BACEN e N2)
4. **Testar cada fase** antes de prosseguir
5. **Documentar mudanças** durante implementação

---

**Documento criado em:** 2025-01-02
**Última atualização:** 2025-01-02
**Status:** Aguardando aprovação para implementação

