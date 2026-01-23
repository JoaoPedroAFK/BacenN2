# Script para iniciar todos os servidores para testes locais
# VeloHub - Teste Local

Write-Host "=== VeloHub - Iniciando Servidores para Teste Local ===" -ForegroundColor Cyan
Write-Host ""

$baseDir = "C:\Users\Velotax Suporte\Desktop\Velohub\VeloHub"

# Verificar se estamos no diretório correto
if (-not (Test-Path $baseDir)) {
    Write-Host "❌ Diretório não encontrado: $baseDir" -ForegroundColor Red
    Write-Host "Por favor, ajuste o caminho no script" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Diretório base: $baseDir" -ForegroundColor Green
Write-Host ""

# Verificar estrutura
Write-Host "🔍 Verificando estrutura de diretórios..." -ForegroundColor Cyan
$backendExists = Test-Path "$baseDir\backend"
$frontendExists = Test-Path "$baseDir\src"
$painelExists = Test-Path "$baseDir\painel de serviços"

if (-not $backendExists) {
    Write-Host "⚠️  Backend não encontrado" -ForegroundColor Yellow
}
if (-not $frontendExists) {
    Write-Host "⚠️  Frontend não encontrado" -ForegroundColor Yellow
}
if (-not $painelExists) {
    Write-Host "⚠️  Painel de Serviços não encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== INSTRUÇÕES PARA INICIAR OS SERVIDORES ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abra 3 terminais separados e execute:" -ForegroundColor Yellow
Write-Host ""
Write-Host "TERMINAL 1 - Backend (porta 8090):" -ForegroundColor Green
Write-Host "  cd `"$baseDir\backend`"" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 2 - Frontend VeloHub (porta 8080):" -ForegroundColor Green
Write-Host "  cd `"$baseDir`"" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 3 - Painel de Serviços (porta 3000):" -ForegroundColor Green
Write-Host "  cd `"$baseDir\painel de serviços`"" -ForegroundColor White
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "=== TESTES A REALIZAR ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Tipo 'Estorno':" -ForegroundColor Yellow
Write-Host "   - Selecionar 'Estorno' no dropdown" -ForegroundColor White
Write-Host "   - Verificar checkboxes 'Crédito do Trabalhador' e 'Excedeu 40 dias'" -ForegroundColor White
Write-Host "   - Preencher campo 'Valor'" -ForegroundColor White
Write-Host "   - Testar upload de imagens e vídeos" -ForegroundColor White
Write-Host "   - Enviar solicitação" -ForegroundColor White
Write-Host ""
Write-Host "2. Tipo 'Cancelamento':" -ForegroundColor Yellow
Write-Host "   - Selecionar 'Cancelamento' no dropdown" -ForegroundColor White
Write-Host "   - Verificar campos: Nome do Cliente, Data da Contratação, Valor" -ForegroundColor White
Write-Host "   - Enviar solicitação" -ForegroundColor White
Write-Host ""
Write-Host "3. Verificar no WhatsApp:" -ForegroundColor Yellow
Write-Host "   - Mensagem deve conter todos os campos preenchidos" -ForegroundColor White
Write-Host "   - CPF deve estar sem pontos e traços" -ForegroundColor White
Write-Host "   - Anexos devem ser mencionados na mensagem" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para mais detalhes, consulte: TESTE_LOCAL.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir os terminais..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

