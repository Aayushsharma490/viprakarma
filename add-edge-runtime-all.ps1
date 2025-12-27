$rootPath = "c:\Users\AAYUSH\viprakarma-main\viprakarma-main\viprakarma-main\viprakarma-main"

# Find all route.ts files in api directory
$apiRoutes = Get-ChildItem -Path "$rootPath\src\app\api" -Filter "route.ts" -Recurse -File

# Find all page.tsx files (excluding static pages)
$pages = Get-ChildItem -Path "$rootPath\src\app" -Filter "page.tsx" -Recurse -File | Where-Object {
    $_.FullName -notmatch "\\(home|chat|forgot-password|kundali|mahurat|pandit|pooja-booking|reset-password|subscription)\\page\.tsx$"
}

$allFiles = @($apiRoutes) + @($pages)
$updated = 0
$skipped = 0

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has edge runtime
    if ($content -match "export const runtime\s*=\s*['\`"]edge['\`"]") {
        Write-Host "Skip: $($file.FullName.Replace($rootPath, ''))" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    # Add edge runtime at the top
    $newContent = "export const runtime = 'edge';`n" + $content
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    
    Write-Host "Updated: $($file.FullName.Replace($rootPath, ''))" -ForegroundColor Green
    $updated++
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Updated: $updated files" -ForegroundColor Green
Write-Host "Skipped: $skipped files" -ForegroundColor Yellow
Write-Host "Total: $($allFiles.Count) files" -ForegroundColor Cyan
