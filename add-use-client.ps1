# Add 'use client' and force-dynamic to all pages with hooks

$pages = @(
    "src\app\reset-password\page.tsx",
    "src\app\pooja-booking\page.tsx",
    "src\app\pandit\page.tsx",
    "src\app\mahurat\page.tsx",
    "src\app\kundali-matching\page.tsx"
)

foreach ($page in $pages) {
    $fullPath = "c:\Users\AAYUSH\viprakarma-main\viprakarma-main\viprakarma-main\viprakarma-main\$page"
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Check if 'use client' is already present
        if ($content -notmatch "^'use client';") {
            # Add 'use client' and force-dynamic at the top
            $newContent = "'use client';`r`nexport const dynamic = 'force-dynamic';`r`n`r`n" + $content
            Set-Content -Path $fullPath -Value $newContent -NoNewline
            Write-Host "✅ Added 'use client' and force-dynamic to $page"
        } else {
            # Check if force-dynamic is present
            if ($content -notmatch "export const dynamic = 'force-dynamic';") {
                # Add force-dynamic after 'use client'
                $newContent = $content -replace "('use client';)", "`$1`r`nexport const dynamic = 'force-dynamic';"
                Set-Content -Path $fullPath -Value $newContent -NoNewline
                Write-Host "✅ Added force-dynamic to $page"
            } else {
                Write-Host "⏭️  Skipped $page (already has both)"
            }
        }
    } else {
        Write-Host "❌ File not found: $page"
    }
}

Write-Host "`n✅ All pages updated!"
