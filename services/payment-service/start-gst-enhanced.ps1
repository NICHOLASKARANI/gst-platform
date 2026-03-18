# GST Platform - Enhanced Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STARTING GST SERVICES DIRECTLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$port)
    $connections = netstat -ano | findstr ":$port"
    return $connections.Length -gt 0
}

# Kill processes on ports if needed
$ports = @(3000, 8005, 8006)
foreach ($port in $ports) {
    if (Test-Port $port) {
        Write-Host "?? Port $port is in use. Stopping process..." -ForegroundColor Yellow
        $process = netstat -ano | findstr ":$port" | Select-Object -First 1
        if ($process) {
            $parts = $process -split '\s+'
            $pid = $parts[-1]
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "
?? Starting services..." -ForegroundColor Green

# Start Auth Service
Write-Host "
?? Starting Auth Service (port 8005)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\auth-service; Write-Host '?? Auth Service Starting...' -ForegroundColor Green; node server.js"
Start-Sleep -Seconds 2

# Start Payment Service
Write-Host "?? Starting Payment Service (port 8006)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\payment-service; Write-Host '?? Payment Service Starting...' -ForegroundColor Green; node mpesa.js"
Start-Sleep -Seconds 2

# Start Web Server
Write-Host "?? Starting Web Server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; Write-Host '?? Web Server Starting...' -ForegroundColor Green; npx http-server apps\web -p 3000"

Write-Host "
========================================" -ForegroundColor Cyan
Write-Host "? ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "?? Access your GST platform:" -ForegroundColor White
Write-Host "   ?? Website: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   ?? Auth API: http://localhost:8005/health" -ForegroundColor Yellow
Write-Host "   ?? Payment API: http://localhost:8006/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "?? To stop all services, close the PowerShell windows" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
