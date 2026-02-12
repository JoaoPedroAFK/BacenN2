# 🔑 Como Obter o Service Account Key

## ⚠️ IMPORTANTE

O Application Default Credentials **NÃO funciona** no Windows local.  
Você **DEVE** usar Service Account Key.

## 📋 Passo a Passo

### 1. Acesse o Firebase Console

Abra no navegador:
```
https://console.firebase.google.com/project/bacen-n2/settings/serviceaccounts/adminsdk
```

### 2. Gerar Nova Chave

1. Na página, você verá a seção **"Contas de serviço"**
2. Clique no botão **"Gerar nova chave privada"**
3. Uma caixa de diálogo aparecerá avisando sobre segurança
4. Clique em **"Gerar chave"**

### 3. Salvar o Arquivo

1. O navegador vai baixar um arquivo JSON
2. O nome será algo como: `bacen-n2-firebase-adminsdk-xxxxx.json`
3. **Renomeie** o arquivo para: `service-account-key.json`

### 4. Colocar na Pasta Correta

Mova o arquivo `service-account-key.json` para:
```
C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts\service-account-key.json
```

### 5. Executar o Script

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts"
npm start
```

## ✅ Verificação

Após colocar o arquivo, verifique se está na pasta correta:

```powershell
cd "C:\Users\Velotax Suporte\Downloads\Bacen Projeto\Bacen\scripts"
dir service-account-key.json
```

Deve mostrar o arquivo.

## 🔒 Segurança

⚠️ **NUNCA** commite o arquivo `service-account-key.json` no Git!  
O arquivo já está no `.gitignore` para proteção.

## 🐛 Problemas?

Se o arquivo não for encontrado:
- Verifique se o nome está exatamente: `service-account-key.json`
- Verifique se está na pasta `scripts/`
- Verifique se não há espaços extras no nome

