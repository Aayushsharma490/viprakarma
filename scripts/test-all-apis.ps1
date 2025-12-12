# Comprehensive API Test Script

Write-Host "🧪 VipraKarma API Test Suite`n" -ForegroundColor Cyan

# Test 1: Forgot Password
Write-Host "1️⃣  Testing Forgot Password..." -ForegroundColor Yellow
try {
    $body = @{ email = "viprakarma@gmail.com" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/forgot-password" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ PASS - Reset Code: $($result.resetCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Admin Login
Write-Host "`n2️⃣  Testing Admin Login..." -ForegroundColor Yellow
try {
    $body = @{ email = "viprakarma@gmail.com"; password = "viprakarma" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ PASS - Token received, User: $($result.user.name)" -ForegroundColor Green
    $global:adminToken = $result.token
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Astrologers
Write-Host "`n3️⃣  Testing Get Astrologers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/astrologers" -Method GET -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ PASS - Found $($result.Count) astrologers" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Notifications
Write-Host "`n4️⃣  Testing Get Notifications..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/notifications" -Method GET -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ PASS - Found $($result.Count) notifications" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test Suite Complete!`n" -ForegroundColor Cyan
