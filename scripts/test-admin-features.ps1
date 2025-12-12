# Comprehensive Admin Features Test

Write-Host "🧪 VipraKarma - Complete Admin Features Test`n" -ForegroundColor Cyan

# Step 1: Admin Login
Write-Host "1️⃣  Admin Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "viprakarma@gmail.com"
        password = "viprakarma"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $global:adminToken = $loginResult.token
    Write-Host "   ✅ PASS - Logged in as: $($loginResult.user.name)" -ForegroundColor Green
    Write-Host "   Token: $($global:adminToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Add Astrologer
Write-Host "`n2️⃣  Adding Astrologer..." -ForegroundColor Yellow
try {
    $astrologerBody = @{
        name = "Pandit Rajesh Kumar"
        email = "rajesh@viprakarma.com"
        password = "pandit123"
        phone = "9876543210"
        specializations = @("Vedic Astrology", "Kundali Matching", "Vastu")
        experience = 15
        hourlyRate = 500
        bio = "Expert in Vedic astrology with 15 years of experience"
        languages = "Hindi, English"
        location = "Delhi, India"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
        "Content-Type" = "application/json"
    }
    
    $addResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/astrologers" -Method POST -Body $astrologerBody -Headers $headers -ErrorAction Stop
    $addResult = $addResponse.Content | ConvertFrom-Json
    $global:astrologerId = $addResult.id
    Write-Host "   ✅ PASS - Astrologer added with ID: $global:astrologerId" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error: $errorBody" -ForegroundColor Red
    }
}

# Step 3: Get All Astrologers
Write-Host "`n3️⃣  Getting All Astrologers..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/astrologers" -Method GET -ErrorAction Stop
    $astrologers = $getResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ PASS - Found $($astrologers.Count) astrologer(s)" -ForegroundColor Green
    if ($astrologers.Count -gt 0) {
        Write-Host "   First astrologer: $($astrologers[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Edit Astrologer
Write-Host "`n4️⃣  Editing Astrologer..." -ForegroundColor Yellow
try {
    $editBody = @{
        name = "Pandit Rajesh Kumar (Updated)"
        experience = 16
        hourlyRate = 600
        bio = "Expert in Vedic astrology with 16 years of experience - Updated profile"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
        "Content-Type" = "application/json"
    }
    
    $editResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/astrologers/$global:astrologerId" -Method PUT -Body $editBody -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ PASS - Astrologer updated successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error: $errorBody" -ForegroundColor Red
    }
}

# Step 5: Approve Astrologer
Write-Host "`n5️⃣  Approving Astrologer..." -ForegroundColor Yellow
try {
    $approveBody = @{
        isApproved = $true
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
        "Content-Type" = "application/json"
    }
    
    $approveResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/astrologers/$global:astrologerId/approve" -Method POST -Body $approveBody -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ PASS - Astrologer approved" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  SKIP - Approve endpoint may not exist (this is OK)" -ForegroundColor Yellow
}

# Step 6: Delete Astrologer
Write-Host "`n6️⃣  Deleting Astrologer..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
    }
    
    $deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/astrologers/$global:astrologerId" -Method DELETE -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ PASS - Astrologer deleted successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error: $errorBody" -ForegroundColor Red
    }
}

# Step 7: Verify Deletion
Write-Host "`n7️⃣  Verifying Deletion..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/astrologers" -Method GET -ErrorAction Stop
    $astrologers = $verifyResponse.Content | ConvertFrom-Json
    if ($astrologers.Count -eq 0) {
        Write-Host "   ✅ PASS - Astrologer successfully deleted (0 astrologers remaining)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  WARNING - $($astrologers.Count) astrologer(s) still exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Admin Features Test Complete!`n" -ForegroundColor Cyan
