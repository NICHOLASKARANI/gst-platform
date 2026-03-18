# GST Platform - Clean Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GLOBAL SATELLITE TRACKER - STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$port)
    $connections = netstat -ano | findstr ":$port"
    return $connections.Length -gt 0
}

# Kill processes on ports if needed
$ports = @(3000, 8001, 8002, 8003, 8080)
foreach ($port in $ports) {
    if (Test-Port $port) {
        Write-Host "⚠️ Port $port is in use. Finding process..." -ForegroundColor Yellow
        $process = netstat -ano | findstr ":$port" | Select-Object -First 1
        if ($process) {
            $parts = $process -split '\s+'
            $pid = $parts[-1]
            Write-Host "   Killing process $pid" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
}

Write-Host "
🚀 Starting services..." -ForegroundColor Green

# Start Satellite Engine
Write-Host "
🛰️  Starting Satellite Engine (port 8001)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\satellite-engine; .\venv\Scripts\Activate.ps1; Write-Host '🛰️  Satellite Engine Starting...' -ForegroundColor Green; python main.py"
Start-Sleep -Seconds 3

# Start Weather AI Service
Write-Host "🌤️  Starting Weather AI Service (port 8002)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\weather-ai-service; .\venv\Scripts\Activate.ps1; Write-Host '🌤️  Weather AI Service Starting...' -ForegroundColor Green; python main.py"
Start-Sleep -Seconds 3

# Start Location Service
Write-Host "📍 Starting Location Service (port 8003)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\location-service; Write-Host '📍 Location Service Starting...' -ForegroundColor Green; npx ts-node src\index.ts"
Start-Sleep -Seconds 3

# Start API Gateway
Write-Host "🚪 Starting API Gateway (port 8080)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\api-gateway; Write-Host '🚪 API Gateway Starting...' -ForegroundColor Green; npx ts-node src\index.ts"
Start-Sleep -Seconds 3

# Start Web Server
Write-Host "🌐 Starting Web Server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; Write-Host '🌐 Web Server Starting...' -ForegroundColor Green; npx http-server apps\web -p 3000"

Write-Host "
========================================" -ForegroundColor Cyan
Write-Host "✅ ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Access your GST platform:" -ForegroundColor White
Write-Host "   🌐 Main Website: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   🛰️  Satellite API: http://localhost:8001" -ForegroundColor Yellow
Write-Host "   🌤️  Weather API: http://localhost:8002" -ForegroundColor Yellow
Write-Host "   📍 Location API: http://localhost:8003" -ForegroundColor Yellow
Write-Host "   🚪 API Gateway: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor White
Write-Host "   🛰️  Satellite Engine: http://localhost:8001/api/health" -ForegroundColor Gray
Write-Host "   🌤️  Weather AI: http://localhost:8002/api/health" -ForegroundColor Gray
Write-Host "   📍 Location: http://localhost:8003/api/health" -ForegroundColor Gray
Write-Host "   🚪 Gateway: http://localhost:8080/health" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop all services, close the PowerShell windows" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
