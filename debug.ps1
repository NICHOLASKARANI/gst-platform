# GST Debug Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GST DEBUG - CHECKING SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "?? Node.js version: " -NoNewline
node --version

# Check if dependencies are installed
Write-Host "
?? Checking Auth Service..." -ForegroundColor Yellow
if (Test-Path "services\auth-service\node_modules") {
    Write-Host "? Auth Service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "? Auth Service dependencies MISSING" -ForegroundColor Red
    Write-Host "   Run: cd services\auth-service && npm install"
}

Write-Host "
?? Checking Payment Service..." -ForegroundColor Yellow
if (Test-Path "services\payment-service\node_modules") {
    Write-Host "? Payment Service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "? Payment Service dependencies MISSING" -ForegroundColor Red
    Write-Host "   Run: cd services\payment-service && npm install"
}

Write-Host "
?? Checking ports..." -ForegroundColor Yellow

# Check port 8005
$port8005 = netstat -ano | findstr :8005
if ($port8005) {
    Write-Host "?? Port 8005 is IN USE" -ForegroundColor Yellow
    $port8005
} else {
    Write-Host "? Port 8005 is FREE" -ForegroundColor Green
}

# Check port 8006
$port8006 = netstat -ano | findstr :8006
if ($port8006) {
    Write-Host "?? Port 8006 is IN USE" -ForegroundColor Yellow
    $port8006
} else {
    Write-Host "? Port 8006 is FREE" -ForegroundColor Green
}

# Check port 3000
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "?? Port 3000 is IN USE" -ForegroundColor Yellow
    $port3000
} else {
    Write-Host "? Port 3000 is FREE" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
