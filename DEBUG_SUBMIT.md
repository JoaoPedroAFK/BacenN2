# 🔍 Debug - Problema no Submit de Reclamações

## ✅ Alterações Aplicadas

Adicionei logs de debug detalhados para identificar o problema quando você clica em "Salvar Reclamação".

## 🔍 Como Diagnosticar

### 1. Abra o Console do Navegador

1. **No Chrome/Edge:** Pressione `F12` ou `Ctrl+Shift+I`
2. **Vá na aba "Console"**
3. **Limpe o console** (ícone de lixeira ou `Ctrl+L`)

### 2. Tente Salvar uma Reclamação

1. Preencha o formulário
2. Clique em "💾 Salvar Reclamação BACEN"
3. **Observe as mensagens no console**

### 3. Mensagens Esperadas

Se tudo estiver funcionando, você verá:

```
✅ Formulário BACEN encontrado, adicionando listener de submit
🚀 handleSubmitBacen chamado
📎 Anexos coletados: X
✅ Validando ficha...
✅ Validação passou
💾 Salvando ficha...
📦 Usando Supabase
✅ Salvo no Supabase
🧹 Limpando formulário...
✅ Reclamação salva com sucesso!
```

### 4. Possíveis Problemas

#### ❌ Se não aparecer "🚀 handleSubmitBacen chamado"
- **Problema:** O evento de submit não está sendo capturado
- **Solução:** Verifique se há erros JavaScript anteriores no console

#### ❌ Se aparecer "❌ Validação falhou"
- **Problema:** Algum campo obrigatório não está preenchido
- **Solução:** Verifique a mensagem de erro que aparece na tela

#### ❌ Se aparecer "⚠️ Supabase não configurado"
- **Problema:** Supabase não está inicializado
- **Solução:** 
  1. Verifique se o script do Supabase está carregando
  2. Verifique se as credenciais estão corretas em `js/supabase-config.js`
  3. O sistema usará localStorage como fallback

#### ❌ Se aparecer "❌ Erro ao salvar no Supabase"
- **Problema:** Erro ao conectar com Supabase
- **Solução:** 
  1. Verifique se as tabelas foram criadas no Supabase
  2. Verifique se as políticas RLS estão configuradas
  3. O sistema tentará usar localStorage como fallback

## 🔧 Verificações Adicionais

### Verificar se Supabase está carregado:

No console, digite:
```javascript
console.log('Supabase:', window.supabase);
console.log('Config:', window.SUPABASE_CONFIG);
console.log('DB:', window.supabaseDB);
```

### Verificar se o formulário existe:

No console, digite:
```javascript
console.log('Form:', document.getElementById('form-bacen'));
```

### Testar salvamento manual:

No console, digite:
```javascript
// Simular submit
const form = document.getElementById('form-bacen');
if (form) {
    form.dispatchEvent(new Event('submit'));
}
```

## 📋 Checklist

- [ ] Console do navegador aberto (F12)
- [ ] Tentou salvar uma reclamação
- [ ] Verificou as mensagens no console
- [ ] Copiou as mensagens de erro (se houver)
- [ ] Verificou se Supabase está configurado
- [ ] Verificou se as tabelas foram criadas no Supabase

## 🚀 Próximos Passos

1. **Teste no navegador** seguindo os passos acima
2. **Copie as mensagens do console** (especialmente erros)
3. **Envie as informações** para que eu possa corrigir o problema específico

## 💡 Nota Importante

O sistema tem **fallback automático** para localStorage. Mesmo se o Supabase não estiver funcionando, os dados devem ser salvos localmente. Se nada acontecer ao clicar em salvar, pode ser um problema com o JavaScript não carregando corretamente.

---

**Última atualização:** Logs de debug adicionados - aguardando feedback do console

