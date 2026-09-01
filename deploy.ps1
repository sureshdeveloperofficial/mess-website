# PowerShell Deployment Script
$ErrorActionPreference = "Stop"

Write-Host "🚀 ==========================================" -ForegroundColor Cyan
Write-Host "   Starting Mess-Website Deployment Process  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Verify .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found! Please create your .env file before deploying." -ForegroundColor Red
    exit 1
}

# 2. Build and restart Docker containers
Write-Host "🐳 Building and starting Docker container on port 7691..." -ForegroundColor Yellow
docker compose down --remove-orphans
docker compose up -d --build

# 3. Clean up dangling images
Write-Host "🧹 Cleaning up dangling images..." -ForegroundColor Yellow
docker image prune -f

# 4. Check Status
Write-Host "⏳ Checking container status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
docker compose ps

Write-Host "✅ Deployment completed! App is running at http://localhost:7691" -ForegroundColor Green
