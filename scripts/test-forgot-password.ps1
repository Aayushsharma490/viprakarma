try {
    $body = @{
        email = "viprakarma@gmail.com"
    } | ConvertTo-Json

    Write-Host "Testing Forgot Password API..."
    Write-Host "Request Body: $body"
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/forgot-password" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!"
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n❌ ERROR!"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:"
        Write-Host $responseBody
    }
}
