# 🚀 Guia Final - Configuração Supabase

## ✅ Status Atual

- ✅ **Chave API configurada** em `js/supabase-config.js`
- ✅ **Código integrado** - Sistema pronto para usar Supabase
- ⏳ **Aguardando**: Criação das tabelas no Supabase

---

## 📋 Checklist Rápido (5 minutos)

### Passo 1: Criar Tabelas no Supabase

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/sql/new
   ```

2. **Abra o arquivo `supabase-setup.sql`** (na pasta do projeto)

3. **Copie TODO o conteúdo** do arquivo SQL

4. **Cole no SQL Editor** do Supabase

5. **Execute** (botão "Run" ou `Ctrl+Enter`)

6. **Verifique** em **Table Editor** → Deve aparecer 3 tabelas:
   - ✅ `fichas_bacen`
   - ✅ `fichas_n2`
   - ✅ `fichas_chatbot`

### Passo 2: Testar o Sistema

1. **Abra o sistema:**
   - Abra `index.html` no navegador

2. **Abra o Console (F12)** e verifique:
   ```
   ✅ Supabase DB inicializado
   ```

3. **Crie uma ficha de teste:**
   - Vá para BACEN, N2 ou Chatbot
   - Preencha o formulário
   - Clique em "Salvar"

4. **Verifique no Supabase:**
   - Vá em **Table Editor** → `fichas_bacen` (ou outra)
   - A ficha deve aparecer na tabela! ✅

---

## 🔧 Configuração Atual

### Credenciais (já configuradas)

```javascript
// Arquivo: js/supabase-config.js
URL: https://qiglypxoicicxvyocrzk.supabase.co
Chave: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estrutura

- **3 Tabelas**: `fichas_bacen`, `fichas_n2`, `fichas_chatbot`
- **Armazenamento**: PostgreSQL (Supabase)
- **Fallback**: localStorage (se Supabase não estiver disponível)
- **Anexos**: Armazenados em JSONB (base64)

---

## 🐛 Problemas Comuns

### ❌ "Supabase não inicializado"

**Solução:**
1. Verifique se o script está no HTML (já está)
2. Verifique o Console (F12) para erros
3. Verifique se as tabelas foram criadas

### ❌ "relation does not exist"

**Solução:**
- Execute o script SQL novamente no Supabase
- Verifique em **Table Editor** se as tabelas existem

### ❌ Dados não aparecem no Supabase

**Solução:**
1. Abra o Console (F12)
2. Procure por erros
3. Verifique se as tabelas foram criadas
4. Verifique se as políticas RLS estão ativas

---

## 📊 Verificação Rápida (Console)

Abra o Console (F12) e execute:

```javascript
// Verificar configuração
console.log(window.SUPABASE_CONFIG);

// Verificar inicialização
console.log(window.supabaseDB);

// Testar busca
window.supabaseDB.obterFichas('bacen').then(fichas => {
    console.log('✅ Fichas encontradas:', fichas.length);
});
```

---

## 🔄 Migrar Dados do localStorage (Opcional)

Se você já tem dados salvos localmente:

1. Abra o Console (F12)
2. Execute:
   ```javascript
   window.supabaseDB.migrarDadosLocalStorage()
   ```
3. Aguarde: `✅ Migração concluída!`

---

## ✅ Próximos Passos

1. **Execute o script SQL** no Supabase (Passo 1 acima)
2. **Teste criando uma ficha** (Passo 2 acima)
3. **Verifique os dados** no Table Editor do Supabase
4. **Pronto!** Sistema funcionando com armazenamento persistente 🎉

---

## 📞 Links Úteis

- **Projeto Supabase:** https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk
- **SQL Editor:** https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk/editor

---

## 🎯 Resumo

**O que já está feito:**
- ✅ Código integrado
- ✅ Chave API configurada
- ✅ Script SQL pronto

**O que você precisa fazer:**
1. Executar o script SQL no Supabase (5 minutos)
2. Testar criando uma ficha
3. Verificar os dados no Supabase

**Tempo estimado:** 5-10 minutos

---

**Última atualização:** Sistema pronto - aguardando criação das tabelas no Supabase

