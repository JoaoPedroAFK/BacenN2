# Script PowerShell para iniciar o servidor local
# Execute: .\INICIAR_SERVIDOR.ps1

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Iniciando Servidor Local - Sistema BACEN Velotax" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instale o Node.js:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Após instalar, reinicie este script." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Verificar se server.js existe
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Arquivo server.js não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar na pasta correta." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ Arquivo server.js encontrado" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📍 O servidor será iniciado em: http://localhost:3000" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
node server.js


