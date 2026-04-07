# GST Platform - FINAL WORKING STARTUP
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST PLATFORM - STARTING SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kill any existing processes
Write-Host "
?? Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name http-server -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "
?? Starting services..." -ForegroundColor Green

# Start Auth Service
Write-Host "
?? Starting Auth Service (port 8005)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\auth-service; Write-Host '?? Auth Service Starting...' -ForegroundColor Green; node server.js"
Start-Sleep -Seconds 3

# Start Payment Service
Write-Host "?? Starting Payment Service (port 8006)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\payment-service; Write-Host '?? Payment Service Starting...' -ForegroundColor Green; node mpesa.js"
Start-Sleep -Seconds 3

# Start Quantum Service
Write-Host "`n?? Starting Quantum Service (port 8008)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform\services\quantum-service; Write-Host '?? Quantum Service Starting...' -ForegroundColor Green; npm install; node server.js"
Start-Sleep -Seconds 3
# Start Web Server
Write-Host "?? Starting Web Server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit", "-Command", "cd C:\Users\HomePC\Projects\gst-platform; Write-Host '?? Web Server Starting...' -ForegroundColor Green; npx http-server apps\web -p 3000"

Write-Host "
========================================" -ForegroundColor Cyan
Write-Host "? SERVICES STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "?? Access your GST platform:" -ForegroundColor White
Write-Host "   ?? Website: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   ?? Auth API: http://localhost:8005/health" -ForegroundColor Yellow
Write-Host "   ?? Payment API: http://localhost:8006/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "?? Test the APIs in a new window:" -ForegroundColor Yellow
Write-Host "   curl http://localhost:8005/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:8006/health" -ForegroundColor Gray
Write-Host ""
Write-Host "?? To stop all services, close the PowerShell windows" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan


