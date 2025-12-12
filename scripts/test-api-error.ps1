try {
    Write-Host "Testing API endpoint..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/astrologers" -Method GET -ErrorAction Stop
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error! Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nFull Error Response:" -ForegroundColor Yellow
        Write-Host $responseBody
        
        # Try to parse as JSON
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host "`nParsed Error:" -ForegroundColor Yellow
            Write-Host "  Error: $($errorJson.error)"
            if ($errorJson.details) {
                Write-Host "  Details: $($errorJson.details)"
            }
        } catch {
            Write-Host "Could not parse error as JSON"
        }
    }
}
