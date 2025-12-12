# 🧪 Guia de Teste Local

## ✅ Sistema Pronto para Teste

Todas as alterações foram aplicadas! O sistema está pronto para teste local.

## 🚀 Como Testar Localmente

### 1. Abrir o Sistema
1. Navegue até a pasta do projeto:
   ```
   C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen
   ```
2. Abra o arquivo `index.html` no navegador:
   - Clique com botão direito → "Abrir com" → Seu navegador preferido
   - Ou arraste o arquivo para o navegador

### 2. Testar Menu CANAIS
- ✅ Verifique se o menu "CANAIS" aparece no topo
- ✅ Teste os links: BACEN, N2, Chatbot
- ✅ Verifique se o link ativo está destacado

### 3. Testar Formulário BACEN
1. Acesse a página BACEN
2. Clique em "➕ Nova Reclamação BACEN"
3. Verifique a ordem das seções:
   - ✅ 1º Item: Dados Básicos (primeiro)
   - ✅ 2º Item: Detalhes da Reclamação (segundo)
   - ✅ 3º Item: Tentativas de Contato
   - ✅ 4º Item: Acionamentos ao Canais
   - ✅ 5º Item: Liberação do PIX
   - ✅ 6º Item: Observações (desfecho)
   - ✅ 7º Item: Casos Críticos (Blacklist)

4. Teste os campos:
   - ✅ Responsável: apenas Shirley ou Vanessa
   - ✅ Origem: Bacen Celcoin, Bacen Via Capital, Consumidor.Gov
   - ✅ Motivo Reduzido: todas as 19 opções
   - ✅ Tentativas: adicione mais tentativas usando o botão "➕ Adicionar Tentativa"
   - ✅ Protocolos: aparecem quando você marca os checkboxes

5. Preencha e salve:
   - ✅ Preencha todos os campos obrigatórios
   - ✅ Clique em "💾 Salvar Reclamação BACEN"
   - ✅ Verifique se aparece mensagem de sucesso
   - ✅ Verifique se aparece na lista

### 4. Testar Formulário N2
1. Acesse a página N2
2. Siga os mesmos passos do BACEN
3. Verifique:
   - ✅ Mesma estrutura de seções
   - ✅ Origem: Bacen Celcoin, Bacen Via Capital, Consumidor.Gov
   - ✅ Múltiplas tentativas funcionando

### 5. Testar Formulário Chatbot
1. Acesse a página Chatbot
2. Verifique:
   - ✅ 1º Item: Dados Básicos (com Responsável, Nome, Origem, Telefone)
   - ✅ 2º Item: Detalhes da Avaliação
   - ✅ 3º Item: Liberação do PIX
   - ✅ 4º Item: Observações (desfecho)
   - ✅ 5º Item: Casos Críticos (Blacklist)
   - ✅ Origem: apenas "Atendimento"

### 6. Testar Exportação Excel
1. Acesse qualquer página (BACEN, N2 ou Chatbot)
2. Vá para "📈 Relatórios"
3. Clique em "📊 Exportar Excel"
4. Verifique:
   - ✅ Arquivo Excel é baixado
   - ✅ Nome do arquivo contém data
   - ✅ Dados estão corretos no Excel

### 7. Testar Substituição "Ficha" → "Reclamação"
- ✅ Verifique se todos os títulos dizem "Reclamação"
- ✅ Verifique se os botões dizem "Salvar Reclamação"
- ✅ Verifique se as mensagens dizem "Reclamação salva com sucesso"

## ⚠️ Problemas Conhecidos

### Se o Excel não exportar:
- A biblioteca XLSX será carregada automaticamente
- Se falhar, o sistema tentará exportar como CSV automaticamente

### Se os dados não salvarem:
- Verifique se o Supabase está configurado
- Verifique o console do navegador (F12) para erros
- O sistema usa localStorage como fallback

## 📝 Checklist de Teste

- [ ] Menu CANAIS aparece e funciona
- [ ] Formulário BACEN está na ordem correta
- [ ] Formulário N2 está na ordem correta
- [ ] Formulário Chatbot tem todos os campos
- [ ] Múltiplas tentativas funcionam (BACEN e N2)
- [ ] Motivo Reduzido tem todas as opções
- [ ] Exportação Excel funciona
- [ ] Substituição "Ficha" → "Reclamação" está completa
- [ ] Dados são salvos corretamente
- [ ] Lista de reclamações exibe corretamente

## 🐛 Reportar Problemas

Se encontrar algum problema:
1. Abra o console do navegador (F12)
2. Anote os erros que aparecem
3. Informe qual funcionalidade não está funcionando
4. Tire print se possível

---

**Boa sorte com os testes! 🚀**

