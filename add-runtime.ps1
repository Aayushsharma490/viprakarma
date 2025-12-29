#!/usr/bin/env pwsh

# Add runtime = 'nodejs' to all API route files
# This ensures Vercel uses Node.js runtime instead of Edge

$apiRoutes = Get-ChildItem -Path "src\app\api" -Filter "route.ts" -Recurse

$count = 0
foreach ($file in $apiRoutes) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if runtime is already defined
    if ($content -notmatch "export const runtime") {
        # Find the first import or export statement
        $lines = Get-Content $file.FullName
        $insertIndex = 0
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import " -or $lines[$i] -match "^export ") {
                $insertIndex = $i
                break
            }
        }
        
        # Insert runtime export after imports
        $newLines = @()
        $inserted = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $newLines += $lines[$i]
            
            # Insert after last import, before first export function
            if (!$inserted -and $i -gt 0 -and $lines[$i] -match "^$" -and $lines[$i-1] -match "^import ") {
                $newLines += ""
                $newLines += "// Force Node.js runtime for Vercel compatibility"
                $newLines += "export const runtime = 'nodejs';"
                $inserted = $true
                $count++
            }
        }
        
        if ($inserted) {
            $newLines | Set-Content $file.FullName
            Write-Host "✅ Added runtime to: $($file.FullName)"
        }
    } else {
        Write-Host "⏭️  Skipped (already has runtime): $($file.FullName)"
    }
}

Write-Host "`n✅ Added runtime='nodejs' to $count API routes"
