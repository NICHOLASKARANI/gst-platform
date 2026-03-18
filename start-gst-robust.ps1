# GST Platform - Robust Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST PLATFORM - ROBUST STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kill any existing processes
Write-Host "
?? Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name http-server -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "
?? Starting services with error logging..." -ForegroundColor Green

# Create log files
$logDir = "C:\Users\HomePC\Projects\gst-platform\logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force
}

# Start Auth Service with logging
Write-Host "
?? Starting Auth Service (port 8005)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "
    cd C:\Users\HomePC\Projects\gst-platform\services\auth-service;
    Write-Host '?? Auth Service Starting...' -ForegroundColor Green;
    node server.js 2>&1 | Out-File -FilePath "C:\Users\HomePC\Projects\gst-platform\logs\auth.log" -Append;
    if ($LASTEXITCODE -ne 0) {
        Write-Host '? Auth Service crashed!' -ForegroundColor Red;
        Read-Host 'Press Enter to exit';
    }
"
Start-Sleep -Seconds 3

# Start Payment Service with logging
Write-Host "?? Starting Payment Service (port 8006)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "
    cd C:\Users\HomePC\Projects\gst-platform\services\payment-service;
    Write-Host '?? Payment Service Starting...' -ForegroundColor Green;
    node mpesa.js 2>&1 | Out-File -FilePath "C:\Users\HomePC\Projects\gst-platform\logs\payment.log" -Append;
    if ($LASTEXITCODE -ne 0) {
        Write-Host '? Payment Service crashed!' -ForegroundColor Red;
        Read-Host 'Press Enter to exit';
    }
"
Start-Sleep -Seconds 3

# Start Web Server with logging
Write-Host "?? Starting Web Server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "
    cd C:\Users\HomePC\Projects\gst-platform;
    Write-Host '?? Web Server Starting...' -ForegroundColor Green;
    npx http-server apps\web -p 3000 2>&1 | Out-File -FilePath "C:\Users\HomePC\Projects\gst-platform\logs\web.log" -Append;
    if ($LASTEXITCODE -ne 0) {
        Write-Host '? Web Server crashed!' -ForegroundColor Red;
        Read-Host 'Press Enter to exit';
    }
"

Write-Host "
========================================" -ForegroundColor Cyan
Write-Host "? SERVICES STARTING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "?? Access your GST platform:" -ForegroundColor White
Write-Host "   ?? Website: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   ?? Auth API: http://localhost:8005/health" -ForegroundColor Yellow
Write-Host "   ?? Payment API: http://localhost:8006/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "?? To check logs:" -ForegroundColor Yellow
Write-Host "   Get-Content C:\Users\HomePC\Projects\gst-platform\logs\auth.log -Tail 20" -ForegroundColor Gray
Write-Host "   Get-Content C:\Users\HomePC\Projects\gst-platform\logs\payment.log -Tail 20" -ForegroundColor Gray
Write-Host "   Get-Content C:\Users\HomePC\Projects\gst-platform\logs\web.log -Tail 20" -ForegroundColor Gray
Write-Host ""
Write-Host "?? To stop all services, close the PowerShell windows" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
