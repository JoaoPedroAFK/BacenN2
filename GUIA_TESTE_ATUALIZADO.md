# 🧪 Guia de Teste - Sistema BACEN e N2 Atualizado

## ✅ Checklist de Testes

### 1. Teste de Login
- [ ] Acessar `index.html`
- [ ] Fazer login com usuário válido
- [ ] Verificar se o loading aparece e desaparece corretamente

### 2. Teste Ficha BACEN

#### 2.1. Campos Obrigatórios
- [ ] **Detalhes da Reclamação (PRIMEIRA SEÇÃO)**
  - [ ] Motivo Reduzido (dropdown) - obrigatório
  - [ ] Prazo BACEN - obrigatório apenas se Origem = "Bacen Celcoin" ou "Bacen Via Capital"
  - [ ] Motivo da Reclamação (textarea) - obrigatório
  - [ ] Anexos (PDFs e Imagens) - opcional

- [ ] **Dados Básicos**
  - [ ] Data de Entrada - obrigatório
  - [ ] Responsável (dropdown: Vanessa, Shirley, Caroline, Emerson, Nayara, Renata) - obrigatório
  - [ ] Mês (dropdown: 3/2025 a 11/2025) - obrigatório

- [ ] **Dados do Cliente**
  - [ ] Nome Completo - obrigatório
  - [ ] CPF (com máscara) - obrigatório
  - [ ] Telefone (com máscara) - opcional
  - [ ] Origem (dropdown: Bacen Celcoin, Bacen Via Capital, Consumidor.Gov, Reclame Aqui, Procon) - obrigatório

- [ ] **Campos Específicos BACEN**
  - [ ] 1ª tentativa (data) - opcional
  - [ ] 2ª tentativa (data) - opcional
  - [ ] 3ª tentativa (data) - opcional
  - [ ] Acionou a central? (checkbox) - opcional
  - [ ] Reclame Aqui (checkbox) - opcional
  - [ ] BACEN? (checkbox) - opcional
  - [ ] Procon? (checkbox) - opcional
  - [ ] PIX liberado ou excluído? (checkbox) - opcional
  - [ ] Aceitou liquidação Antecipada? (checkbox) - opcional
  - [ ] Casos críticos (checkbox) - opcional
  - [ ] Enviar para cobrança? (checkbox) - **OBRIGATÓRIO**

- [ ] **Resolução**
  - [ ] Status (dropdown) - obrigatório
  - [ ] Finalizado em (data) - opcional
  - [ ] Valor Negociado (moeda) - opcional
  - [ ] Observações (textarea) - opcional
  - [ ] Protocolos Central (texto) - opcional

#### 2.2. Validação Condicional do Prazo BACEN
- [ ] Selecionar Origem = "Bacen Celcoin" → Prazo BACEN deve ficar obrigatório (aparecer *)
- [ ] Selecionar Origem = "Bacen Via Capital" → Prazo BACEN deve ficar obrigatório (aparecer *)
- [ ] Selecionar Origem = "Consumidor.Gov" → Prazo BACEN deve ficar opcional (sem *)
- [ ] Selecionar Origem = "Reclame Aqui" → Prazo BACEN deve ficar opcional (sem *)
- [ ] Selecionar Origem = "Procon" → Prazo BACEN deve ficar opcional (sem *)

#### 2.3. Teste de Anexos
- [ ] Adicionar imagem (JPG, PNG) - deve aparecer preview
- [ ] Adicionar PDF - deve aparecer preview com ícone
- [ ] Adicionar múltiplos arquivos
- [ ] Remover anexo antes de salvar
- [ ] Salvar ficha com anexos
- [ ] Abrir ficha salva e verificar se anexos aparecem
- [ ] Clicar em imagem para visualizar em nova janela
- [ ] Clicar em PDF para baixar

#### 2.4. Teste de Salvamento
- [ ] Preencher todos os campos obrigatórios
- [ ] Salvar ficha
- [ ] Verificar se aparece mensagem de sucesso
- [ ] Verificar se ficha aparece na lista
- [ ] Abrir ficha salva e verificar se todos os dados estão corretos

### 3. Teste Ficha N2

#### 3.1. Campos Obrigatórios
- [ ] **Detalhes da Reclamação (PRIMEIRA SEÇÃO)**
  - [ ] Motivo Reduzido (dropdown) - obrigatório
  - [ ] Prazo N2 (data) - obrigatório
  - [ ] Motivo da Reclamação (textarea) - obrigatório
  - [ ] Anexos (PDFs e Imagens) - opcional

- [ ] **Dados Básicos**
  - [ ] Data de entrada Atendimento - obrigatório
  - [ ] Data Entrada N2 - obrigatório
  - [ ] Data de Entrada - obrigatório
  - [ ] Responsável (dropdown) - obrigatório
  - [ ] Mês (dropdown) - obrigatório

- [ ] **Dados do Cliente**
  - [ ] Nome Completo - obrigatório
  - [ ] CPF (com máscara) - obrigatório
  - [ ] Telefone (com máscara) - opcional
  - [ ] Origem (dropdown: apenas "Ouvidoria N2") - obrigatório

- [ ] **Campos Específicos N2**
  - [ ] N2 Portabilidade? (checkbox) - opcional
  - [ ] N2 conseguiu contato com cliente? (checkbox) - opcional
  - [ ] Casos críticos (checkbox) - opcional
  - [ ] PIX liberado ou excluído? (checkbox) - opcional
  - [ ] Enviar para cobrança? (checkbox) - **OBRIGATÓRIO**

- [ ] **Resolução**
  - [ ] Status (dropdown) - obrigatório
  - [ ] Finalizado em (data) - opcional
  - [ ] Valor Negociado (moeda) - opcional
  - [ ] Observações (textarea) - opcional
  - [ ] Protocolos Central (texto) - opcional

#### 3.2. Teste de Salvamento N2
- [ ] Preencher todos os campos obrigatórios
- [ ] Salvar ficha
- [ ] Verificar se aparece mensagem de sucesso
- [ ] Verificar se ficha aparece na lista
- [ ] Abrir ficha salva e verificar se todos os dados estão corretos

### 4. Teste de Validações

#### 4.1. Validação de Campos Obrigatórios
- [ ] Tentar salvar ficha BACEN sem preencher campos obrigatórios
- [ ] Verificar se aparece mensagem de erro para cada campo não preenchido
- [ ] Tentar salvar ficha N2 sem preencher campos obrigatórios
- [ ] Verificar se aparece mensagem de erro para cada campo não preenchido

#### 4.2. Validação de CPF
- [ ] Inserir CPF inválido (ex: 111.111.111-11)
- [ ] Verificar se aparece mensagem de erro
- [ ] Inserir CPF válido
- [ ] Verificar se aceita

#### 4.3. Validação de Máscaras
- [ ] CPF deve formatar automaticamente (000.000.000-00)
- [ ] Telefone deve formatar automaticamente ((00) 00000-0000)
- [ ] Valor Negociado deve formatar como moeda (R$ 0,00)

### 5. Teste de Funcionalidades

#### 5.1. Busca
- [ ] Buscar por nome
- [ ] Buscar por CPF
- [ ] Buscar por motivo reduzido
- [ ] Verificar se resultados aparecem corretamente

#### 5.2. Filtros
- [ ] Filtrar por status
- [ ] Verificar se lista é filtrada corretamente

#### 5.3. Edição de Ficha
- [ ] Abrir ficha salva
- [ ] Clicar em "Editar"
- [ ] Modificar campos
- [ ] Salvar alterações
- [ ] Verificar se alterações foram salvas

#### 5.4. Copiar para Email
- [ ] Abrir ficha
- [ ] Clicar em "📧 Copiar para Email"
- [ ] Verificar se informações foram copiadas formatadas
- [ ] Colar em editor de texto e verificar formatação

### 6. Teste de Dashboard
- [ ] Verificar se métricas aparecem corretamente
- [ ] Verificar se números são legíveis
- [ ] Verificar se cards estão funcionando

### 7. Teste de Responsividade
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar se formulários se adaptam
- [ ] Verificar se modais funcionam em mobile

## 🐛 Problemas Conhecidos a Verificar

1. **Validação Condicional do Prazo BACEN**
   - Verificar se o asterisco (*) aparece/desaparece corretamente
   - Verificar se a validação funciona no submit

2. **Campo Enviar para Cobrança**
   - Verificar se está marcado como obrigatório visualmente
   - Verificar se validação funciona (checkbox obrigatório)

3. **Anexos**
   - Verificar se anexos são salvos corretamente
   - Verificar se anexos aparecem ao abrir ficha
   - Verificar tamanho máximo (10MB)

4. **Dropdown Responsável**
   - Verificar se lista de usuários está completa
   - Verificar se seleção funciona

5. **Dropdown Mês**
   - Verificar se opções estão corretas (3/2025 a 11/2025)
   - Verificar se é obrigatório

## 📝 Notas de Teste

- Anotar qualquer erro encontrado
- Anotar comportamento inesperado
- Anotar sugestões de melhoria












