# GST Platform Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GLOBAL SATELLITE TRACKER - STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start Satellite Engine (in new window)
Write-Host "
🚀 Starting Satellite Engine..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\satellite-engine; .\venv\Scripts\Activate.ps1; python main.py"

# Start Weather AI Service
Write-Host "🌤️  Starting Weather AI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\weather-ai-service; .\venv\Scripts\Activate.ps1; python main.py"

# Start Location Service
Write-Host "📍 Starting Location Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\location-service; npm install; npx ts-node src\index.ts"

# Start API Gateway
Write-Host "🚪 Starting API Gateway..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\api-gateway; npm install; npx ts-node src\index.ts"

# Start Web Server
Write-Host "🌐 Starting Web Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; npx http-server apps\web -p 3000"

Write-Host "
✅ All services starting!" -ForegroundColor Green
Write-Host "📱 Access your GST platform at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
