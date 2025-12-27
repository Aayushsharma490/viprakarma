$rootPath = "c:\Users\AAYUSH\viprakarma-main\viprakarma-main\viprakarma-main\viprakarma-main"

# Find all files with edge runtime
$files = Get-ChildItem -Path "$rootPath\src\app" -Filter "*.tsx" -Recurse -File

$removed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if file has 'use client' directive
    if ($content -match "^['\`"]use client['\`"]") {
        # Check if it also has edge runtime
        if ($content -match "export const runtime\s*=\s*['\`"]edge['\`"];?\r?\n") {
            # Remove edge runtime export
            $newContent = $content -replace "export const runtime\s*=\s*['\`"]edge['\`"];?\r?\n", ""
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            
            Write-Host "Removed from: $($file.FullName.Replace($rootPath, ''))" -ForegroundColor Green
            $removed++
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Removed Edge Runtime from $removed client components" -ForegroundColor Green
