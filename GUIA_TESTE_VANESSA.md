# 🧪 Guia de Teste - Sistema Velotax (Versão para Vanessa)

## 📋 Instruções Rápidas

### Como Abrir o Sistema
1. Extraia todos os arquivos do ZIP para uma pasta (ex: `C:\Users\Vanessa\Desktop\SistemaVelotax\`)
2. Abra o arquivo `index.html` com um navegador (Chrome, Edge ou Firefox)
3. Faça login com:
   - **Usuário:** `admin`
   - **Senha:** `admin123`

---

## ✅ Checklist de Testes

### 1. Teste de Login e Navegação
- [ ] Abrir `index.html` no navegador
- [ ] Fazer login com usuário e senha
- [ ] Verificar se aparece a tela inicial com 3 cards (BACEN, N2, Chatbot)
- [ ] Clicar em cada card e verificar se abre a página correta

---

### 2. Teste Ficha BACEN

#### 2.1. Estrutura do Formulário
- [ ] **Detalhes da Reclamação** (primeira seção)
  - [ ] Motivo Reduzido (dropdown) - obrigatório
  - [ ] Prazo BACEN (obrigatório apenas se Origem = "Bacen Celcoin" ou "Bacen Via Capital")
  - [ ] Motivo da Reclamação (textarea) - obrigatório
  - [ ] Anexos (PDFs e Imagens) - opcional

- [ ] **Dados Básicos**
  - [ ] Data de Entrada - obrigatório
  - [ ] Responsável (dropdown: apenas Shirley ou Vanessa) - obrigatório
  - [ ] Mês (dropdown: 3/2025 a 11/2025) - obrigatório

- [ ] **Dados do Cliente**
  - [ ] Nome Completo - obrigatório
  - [ ] CPF (com máscara) - obrigatório
  - [ ] Telefone (com máscara) - opcional
  - [ ] Origem (dropdown: apenas Bacen Celcoin, Bacen Via Capital, Consumidor.Gov) - obrigatório

- [ ] **Tentativas de Contato**
  - [ ] 1ª tentativa (data) - opcional
  - [ ] 2ª tentativa (data) - opcional
  - [ ] **NÃO deve ter 3ª tentativa**

- [ ] **Acionamentos ao Canais de Atendimento e Protocolos**
  - [ ] Acionou a central? (checkbox) → ao marcar, aparece campo "Qual Protocolo"
  - [ ] N2 – Segundo Nível? (checkbox) → ao marcar, aparece campo "Qual Protocolo"
  - [ ] Reclame Aqui? (checkbox) → ao marcar, aparece campo "Qual Protocolo"
  - [ ] Procon? (checkbox) → ao marcar, aparece campo "Qual Protocolo"
  - [ ] Protocolos sem acionamento (campo de texto)

- [ ] **Liberação do PIX**
  - [ ] PIX liberado ou excluído? (dropdown: Liberado/Excluído/Não Aplicável)
  - [ ] Enviar para cobrança? (radio: Sim/Não) - obrigatório

- [ ] **Observações** (sem a palavra "desfecho")
  - [ ] Campo de texto livre

- [ ] **Casos Críticos (Blacklist)**
  - [ ] Checkbox para marcar

- [ ] **Resolução**
  - [ ] Status (dropdown) - obrigatório
  - [ ] Finalizado em (data) - opcional
  - [ ] **NÃO deve ter campo "Valor Negociado"**

#### 2.2. Validações
- [ ] Tentar salvar sem preencher campos obrigatórios → deve mostrar erro
- [ ] Selecionar Origem = "Bacen Celcoin" → Prazo BACEN deve ficar obrigatório
- [ ] Selecionar Origem = "Bacen Via Capital" → Prazo BACEN deve ficar obrigatório
- [ ] Selecionar Origem = "Consumidor.Gov" → Prazo BACEN deve ficar opcional

#### 2.3. Funcionalidades
- [ ] Salvar ficha completa
- [ ] Verificar se aparece na lista
- [ ] Abrir ficha salva e verificar se todos os dados estão corretos
- [ ] Editar ficha salva
- [ ] Adicionar anexos (PDFs e imagens)
- [ ] Visualizar anexos na ficha salva

---

### 3. Teste Ficha N2

#### 3.1. Estrutura do Formulário
- [ ] **Detalhes da Reclamação** (primeira seção)
  - [ ] Motivo Reduzido (dropdown) - obrigatório
  - [ ] Motivo da Reclamação (textarea) - obrigatório
  - [ ] Anexos (PDFs e Imagens) - opcional

- [ ] **Dados Básicos**
  - [ ] Data de entrada Atendimento - obrigatório
  - [ ] Data Entrada N2 - obrigatório
  - [ ] Data de Entrada - obrigatório
  - [ ] Responsável (dropdown: apenas Shirley ou Vanessa) - obrigatório
  - [ ] Mês (dropdown) - obrigatório

- [ ] **Dados do Cliente**
  - [ ] Nome Completo - obrigatório
  - [ ] CPF (com máscara) - obrigatório
  - [ ] Telefone (com máscara) - opcional
  - [ ] Origem (dropdown: apenas "Atendimento") - obrigatório

- [ ] **Tentativas de Contato**
  - [ ] 1ª tentativa (data) - opcional
  - [ ] 2ª tentativa (data) - opcional

- [ ] **Acionamentos ao Canais de Atendimento e Protocolos**
  - [ ] Mesma estrutura do BACEN

- [ ] **Liberação do PIX**
  - [ ] Mesma estrutura do BACEN

- [ ] **Observações** (sem a palavra "desfecho")
  - [ ] Campo de texto livre

- [ ] **Casos Críticos (Blacklist)**
  - [ ] Checkbox para marcar

- [ ] **Resolução**
  - [ ] Status (dropdown) - obrigatório
  - [ ] Finalizado em (data) - opcional
  - [ ] **NÃO deve ter campo "Valor Negociado"**

#### 3.2. Funcionalidades
- [ ] Salvar ficha completa
- [ ] Verificar se aparece na lista
- [ ] Abrir ficha salva e verificar dados

---

### 4. Teste Ficha Chatbot

#### 4.1. Estrutura do Formulário (NOVA ESTRUTURA)
- [ ] **Dados Básicos** (primeira seção)
  - [ ] Data do cliente com o chatbot - obrigatório
  - [ ] CPF (com máscara) - obrigatório

- [ ] **Detalhes da Avaliação**
  - [ ] Nota de Avaliação (dropdown: 1 a 5) - opcional
  - [ ] Avaliação do Cliente (campo aberto/textarea) - opcional
  - [ ] Produto (dropdown: Antecipação, Aplicativo, Calculadora, Crédito do Trabalhador, Empréstimo Pessoal) - opcional
  - [ ] Motivo (dropdown: Calculadora, Chave PIX, Conta, Débito em Aberto, Elegibilidade, Encerramento da Cadastro, Erros – Bugs, Fraude, Open Finance) - opcional
  - [ ] Resposta do Bot (radio: Sim/Não) - opcional

- [ ] **Liberação do PIX**
  - [ ] PIX liberado ou excluído? (dropdown)
  - [ ] Enviar para cobrança? (radio: Sim/Não)
  - [ ] Casos Críticos (Blacklist) (checkbox)

- [ ] **Resolução**
  - [ ] Finalização (radio: Sim/Não)
  - [ ] Responsável (dropdown: Shirley ou Vanessa) - obrigatório
  - [ ] **Observações** (não "Campo aberto") - opcional

#### 4.2. Funcionalidades
- [ ] Salvar ficha completa
- [ ] Verificar se aparece na lista
- [ ] Abrir ficha salva e verificar dados

---

### 5. Testes Gerais

#### 5.1. Navegação
- [ ] Navegar entre as seções (Dashboard, Nova Ficha, Lista, Relatórios)
- [ ] Voltar à Home a partir de qualquer página
- [ ] Alternar entre tema claro e escuro

#### 5.2. Busca e Filtros
- [ ] Buscar fichas por nome
- [ ] Buscar fichas por CPF
- [ ] Filtrar por status
- [ ] Usar busca avançada

#### 5.3. Dashboard
- [ ] Verificar se os números aparecem corretamente
- [ ] Verificar se os cards estão funcionando
- [ ] Verificar se os gráficos aparecem

#### 5.4. Relatórios
- [ ] Gerar relatório por período
- [ ] Gerar relatório completo
- [ ] Exportar relatório

---

## ⚠️ Pontos de Atenção Especiais

1. **Valor Negociado:** Este campo foi REMOVIDO de todas as fichas. Não deve aparecer em nenhum lugar.

2. **Palavra "desfecho":** Foi REMOVIDA. A seção deve aparecer apenas como "Observações".

3. **Campo aberto (Chatbot):** Foi TROCADO por "Observações".

4. **Responsável:** Apenas Shirley ou Vanessa devem aparecer no dropdown.

5. **Origem BACEN:** Apenas 3 opções (Bacen Celcoin, Bacen Via Capital, Consumidor.Gov).

6. **Origem N2:** Apenas "Atendimento".

7. **Tentativas:** BACEN e N2 têm apenas 2 tentativas (1ª e 2ª).

8. **Protocolos:** Campos de protocolo aparecem apenas quando o checkbox correspondente está marcado.

---

## 🐛 Problemas Conhecidos a Reportar

Se encontrar algum dos seguintes problemas, anote e reporte:

- [ ] Campo não aparece quando deveria
- [ ] Campo aparece quando não deveria
- [ ] Validação não funciona
- [ ] Dados não são salvos corretamente
- [ ] Ficha não aparece na lista após salvar
- [ ] Erro ao editar ficha
- [ ] Anexos não aparecem
- [ ] Navegação quebrada
- [ ] Texto ilegível ou mal formatado

---

## 📝 Notas de Teste

Use este espaço para anotar observações durante os testes:

```
Data: ___________
Testador: Vanessa

Observações:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**Versão:** 2.0 (Atualizada conforme documento de orientação)  
**Data:** 2025-01-02  
**Sistema:** Velotax - Gestão de Casos Especiais (BACEN, N2 e Chatbot)

