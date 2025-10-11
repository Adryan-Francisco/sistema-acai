# Script para iniciar Evolution API localmente
# Execute: .\start-evolution.ps1

Write-Host "🚀 Iniciando Evolution API..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar Docker:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Baixe e instale o Docker Desktop para Windows" -ForegroundColor White
    Write-Host "3. Reinicie o computador" -ForegroundColor White
    Write-Host "4. Execute este script novamente" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 ALTERNATIVA: Use a Evolution API na nuvem (Render/Railway)" -ForegroundColor Green
    Write-Host "   Veja: docs/GUIA_RAPIDO_WHATSAPP.md" -ForegroundColor White
    exit 1
}

Write-Host "✅ Docker encontrado!" -ForegroundColor Green
Write-Host ""

# Verificar se o container já existe
$containerExists = docker ps -a --filter "name=evolution-api" --format "{{.Names}}" 2>$null

if ($containerExists) {
    Write-Host "📦 Container já existe. Removendo..." -ForegroundColor Yellow
    docker stop evolution-api 2>$null
    docker rm evolution-api 2>$null
}

# Criar e iniciar container
Write-Host "🐳 Criando container Evolution API..." -ForegroundColor Cyan
docker run -d `
    --name evolution-api `
    -p 8080:8080 `
    atendai/evolution-api

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Evolution API iniciada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Aguarde 30 segundos para o servidor iniciar" -ForegroundColor White
    Write-Host "2. Acesse: http://localhost:8080/manager" -ForegroundColor Yellow
    Write-Host "3. Crie uma instância e conecte seu WhatsApp" -ForegroundColor White
    Write-Host "4. Configure o .env com as credenciais" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Configuração do .env:" -ForegroundColor Cyan
    Write-Host "VITE_WHATSAPP_PROVIDER=evolution" -ForegroundColor Gray
    Write-Host "VITE_EVOLUTION_API_URL=http://localhost:8080" -ForegroundColor Gray
    Write-Host "VITE_EVOLUTION_API_KEY=seu-token-aqui" -ForegroundColor Gray
    Write-Host "VITE_EVOLUTION_INSTANCE=nome-da-instancia" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📱 Abrindo navegador em 5 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:8080/manager"
} else {
    Write-Host ""
    Write-Host "❌ Erro ao iniciar Evolution API" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique se:" -ForegroundColor Yellow
    Write-Host "• Docker Desktop está rodando" -ForegroundColor White
    Write-Host "• A porta 8080 não está em uso" -ForegroundColor White
    Write-Host "• Você tem permissão de administrador" -ForegroundColor White
}
