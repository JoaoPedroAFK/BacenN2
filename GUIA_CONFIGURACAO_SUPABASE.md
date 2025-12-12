# 🔧 Guia de Configuração do Supabase

Este guia explica como configurar o Supabase para armazenar as fichas de forma persistente.

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Projeto criado no Supabase
3. Acesso ao dashboard do projeto

## 🚀 Passo a Passo

### 1. Obter Credenciais do Supabase

1. Acesse o dashboard do seu projeto:
   ```
   https://supabase.com/dashboard/project/qiglypxoicicxvyocrzk
   ```

2. Vá em **Settings** → **API**

3. Copie as seguintes informações:
   - **Project URL**: Exemplo: `https://qiglypxoicicxvyocrzk.supabase.co`
   - **anon/public key**: Chave pública anônima

### 2. Configurar o Arquivo JavaScript

1. Abra o arquivo: `js/supabase-config.js`

2. Substitua as credenciais:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://qiglypxoicicxvyocrzk.supabase.co', // SUA URL AQUI
       anonKey: 'SUA_ANON_KEY_AQUI' // SUA CHAVE AQUI
   };
   ```

### 3. Criar as Tabelas no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**

2. Clique em **New query**

3. Abra o arquivo `supabase-setup.sql` e copie todo o conteúdo

4. Cole no SQL Editor do Supabase

5. Clique em **Run** para executar

6. Verifique se as tabelas foram criadas:
   - Vá em **Table Editor**
   - Você deve ver 3 tabelas:
     - `fichas_bacen`
     - `fichas_n2`
     - `fichas_chatbot`

### 4. Configurar Políticas de Segurança (RLS)

As políticas já estão incluídas no script SQL. Elas permitem:
- ✅ Leitura pública (anon key)
- ✅ Inserção pública (anon key)
- ✅ Atualização pública (anon key)
- ✅ Exclusão pública (anon key)

**⚠️ IMPORTANTE**: Para produção, considere implementar autenticação e políticas mais restritivas.

### 5. Testar a Integração

1. Abra o sistema no navegador

2. Abra o Console do Desenvolvedor (F12)

3. Verifique se aparece:
   ```
   ✅ Supabase DB inicializado
   ```

4. Crie uma ficha de teste

5. Verifique no Supabase:
   - Vá em **Table Editor** → `fichas_bacen` (ou `fichas_n2`, `fichas_chatbot`)
   - A ficha deve aparecer na tabela

## 🔄 Migração de Dados do localStorage

Se você já tem dados salvos no localStorage, pode migrá-los para o Supabase:

1. Abra o Console do Desenvolvedor (F12)

2. Execute:
   ```javascript
   window.supabaseDB.migrarDadosLocalStorage()
   ```

3. Aguarde a mensagem de conclusão

4. Verifique as tabelas no Supabase

## 🐛 Solução de Problemas

### Erro: "Supabase não inicializado"

**Causa**: Credenciais não configuradas ou biblioteca não carregada.

**Solução**:
1. Verifique se o arquivo `js/supabase-config.js` tem as credenciais corretas
2. Verifique se o script do Supabase está carregado no HTML
3. Verifique o Console do navegador para erros

### Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas.

**Solução**:
1. Execute o script SQL novamente no Supabase
2. Verifique se as tabelas existem em **Table Editor**

### Erro: "permission denied"

**Causa**: Políticas RLS não configuradas.

**Solução**:
1. Execute novamente a parte de políticas RLS do script SQL
2. Verifique em **Authentication** → **Policies** se as políticas existem

### Dados não aparecem no Supabase

**Causa**: Sistema usando localStorage como fallback.

**Solução**:
1. Verifique o Console do navegador
2. Verifique se as credenciais estão corretas
3. Verifique se há erros de conexão

## 📊 Estrutura das Tabelas

### fichas_bacen
- Armazena todas as fichas do tipo BACEN
- Campos principais: `id`, `cpf`, `nomeCompleto`, `status`, `dataCriacao`, etc.
- Campo `anexos` é do tipo JSONB (armazena array de anexos)

### fichas_n2
- Armazena todas as fichas do tipo N2
- Estrutura similar à BACEN, com campos específicos do N2

### fichas_chatbot
- Armazena todas as fichas do tipo Chatbot
- Estrutura específica para demandas do chatbot

## 🔒 Segurança

### Para Produção

1. **Implementar Autenticação**:
   - Use Supabase Auth para autenticar usuários
   - Crie políticas RLS baseadas em usuários

2. **Restringir Acesso**:
   - Limite operações de escrita apenas para usuários autenticados
   - Implemente roles/permissões

3. **Backup**:
   - Configure backups automáticos no Supabase
   - Exporte dados regularmente

## 📞 Suporte

Se encontrar problemas:
1. Verifique o Console do navegador (F12)
2. Verifique os logs do Supabase em **Logs** → **Postgres Logs**
3. Consulte a documentação: https://supabase.com/docs

## ✅ Checklist de Configuração

- [ ] Credenciais do Supabase configuradas em `js/supabase-config.js`
- [ ] Script SQL executado no Supabase
- [ ] Tabelas criadas e visíveis no Table Editor
- [ ] Políticas RLS configuradas
- [ ] Teste de criação de ficha funcionando
- [ ] Dados aparecendo no Supabase
- [ ] Migração de dados do localStorage (se necessário)

---

**Pronto!** Seu sistema agora está usando Supabase para armazenamento persistente. 🎉

