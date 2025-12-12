# Test forgot password
$body = @{
    email = "viprakarma@gmail.com"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/forgot-password" -Method POST -Body $body -ContentType "application/json"
Write-Host "Forgot Password Response:"
$response.Content

# Test admin login
$loginBody = @{
    email = "viprakarma@gmail.com"
    password = "viprakarma"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host "`nAdmin Login Response:"
$loginResponse.Content

# Test astrologers API
$astrologersResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/astrologers" -Method GET
Write-Host "`nAstrologers API Response:"
$astrologersResponse.Content
