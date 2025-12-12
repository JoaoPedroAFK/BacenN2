# ✅ Checklist de Implementação - Documento V2

## 🎯 STATUS GERAL: ~70% Completo

### ✅ CONCLUÍDO

#### 1. Menu CANAIS
- [x] Menu "CANAIS" adicionado em `index.html`
- [x] Menu "CANAIS" adicionado em `bacen.html`
- [x] Menu "CANAIS" adicionado em `n2.html`
- [x] Menu "CANAIS" adicionado em `chatbot.html`
- [x] Estilos CSS para menu CANAIS

#### 2. Substituição "Ficha" → "Reclamação"
- [x] Títulos atualizados em `bacen.html`
- [x] Títulos atualizados em `n2.html`
- [x] Títulos atualizados em `chatbot.html`
- [x] Botões atualizados
- [ ] **PENDENTE**: Substituir em arquivos JavaScript (variáveis, funções, mensagens)

#### 3. Formulário BACEN
- [x] **1º Item: Dados Básicos** (primeiro)
  - [x] Data entrada, Responsável, Nome completo, CPF, Origem, Telefone
  - [x] Removido "Dados do Cliente"
- [x] **2º Item: Detalhes da Reclamação** (segundo)
  - [x] Motivo Reduzido com todas as opções especificadas (19 opções)
  - [x] Motivo Reclamação
  - [x] Prazo Bacen
- [x] **3º Item: Tentativas de Contato**
  - [x] 1ª e 2ª tentativa
  - [x] Botão para adicionar mais tentativas
  - [x] Função JavaScript `adicionarTentativaBacen()`
  - [x] Função JavaScript `obterTentativasBacen()`
- [x] **4º Item: Acionamentos ao Canais de Atendimento e Protocolos**
  - [x] Todos os campos com protocolos condicionais
- [x] **5º Item: Liberação do PIX**
  - [x] Subitem "Enviar para cobrança" (Sim/Não)
- [x] **6º Item: Observações (desfecho)**
- [x] **7º Item: Casos Críticos (Blacklist)**

#### 4. Formulário N2
- [x] **1º Item: Dados Básicos** (primeiro)
  - [x] Data entrada, Responsável, Nome completo, CPF, Origem, Telefone
  - [x] Removido "Dados do Cliente"
- [x] **2º Item: Detalhes da Reclamação** (segundo)
  - [x] Motivo Reduzido atualizado (19 opções)
  - [x] Motivo Reclamação
  - [x] Prazo Bacen
- [x] **3º Item: Tentativas de Contato**
  - [x] 1ª e 2ª tentativa
  - [x] Botão para adicionar mais tentativas
  - [x] Função JavaScript `adicionarTentativaN2()`
  - [x] Função JavaScript `obterTentativasN2()`
- [x] **4º Item: Acionamentos ao Canais de Atendimento e Protocolos**
- [x] **5º Item: Liberação do PIX**
- [x] **6º Item: Observações (desfecho)**
- [x] **7º Item: Casos Críticos (Blacklist)**

#### 5. Formulário Chatbot
- [x] **1º Item: Dados Básicos**
  - [x] Data entrada, Responsável, Nome completo, CPF, Origem (Atendimento), Telefone
- [x] **2º Item: Detalhes da Avaliação**
  - [x] Nota de Avaliação, Avaliação do Cliente, Produto, Motivo, Resposta do Bot
- [x] **3º Item: Liberação do PIX**
  - [x] Subitem "Enviar para cobrança" (Sim/Não)
- [x] **4º Item: Observações (desfecho)**
- [x] **5º Item: Casos Críticos (Blacklist)**

### ⚠️ PENDENTE

#### 1. Substituição "Ficha" → "Reclamação" (JavaScript)
- [ ] Substituir em `js/bacen-page.js` (variáveis, funções, mensagens)
- [ ] Substituir em `js/n2-page.js`
- [ ] Substituir em `js/chatbot-page.js`
- [ ] Substituir em `js/fichas-especificas.js`
- [ ] Substituir em `js/gerenciador-fichas-perfil.js`
- [ ] Substituir em `js/lista-casos-abertos.js`
- [ ] Substituir em outros arquivos JavaScript

#### 2. Exportação para Excel
- [ ] Implementar biblioteca para exportação Excel (ex: SheetJS)
- [ ] Adicionar função `exportarParaExcel()` em cada página
- [ ] Adicionar botão "Exportar Excel" nos relatórios
- [ ] Testar exportação

#### 3. Ajustes JavaScript
- [ ] Atualizar `handleSubmitBacen` para salvar `tentativasContato` corretamente
- [ ] Atualizar `handleSubmitN2` para salvar `tentativasContato` corretamente
- [ ] Atualizar funções de exibição para mostrar múltiplas tentativas
- [ ] Remover referências a `primeiraTentativa` e `segundaTentativa` (usar array)
- [ ] Atualizar validações

#### 4. Campos Chatbot
- [ ] Verificar se campo "Nome Completo" está sendo coletado corretamente
- [ ] Verificar se campo "Telefone" está sendo coletado corretamente
- [ ] Verificar se campo "Origem" está sendo coletado corretamente

#### 5. Compatibilidade
- [ ] Atualizar `js/atalhos-teclado.js` para usar "nova-reclamacao" em vez de "nova-ficha"
- [ ] Verificar outros arquivos que referenciam "nova-ficha"

## 📊 RESUMO POR PRIORIDADE

### 🔴 ALTA PRIORIDADE
1. Substituir "Ficha" por "Reclamação" em JavaScript
2. Implementar exportação Excel
3. Corrigir coleta de dados (tentativas, campos Chatbot)

### 🟡 MÉDIA PRIORIDADE
1. Atualizar funções de exibição para múltiplas tentativas
2. Remover campos obsoletos (primeiraTentativa, segundaTentativa)
3. Atualizar validações

### 🟢 BAIXA PRIORIDADE
1. Limpeza de código
2. Documentação
3. Testes finais

---

**Última atualização**: Formulários reorganizados, menu CANAIS adicionado, múltiplas tentativas implementadas

