# Remove Edge Runtime from ALL API routes
$files = Get-ChildItem -Path "src\app\api" -Filter "route.ts" -Recurse -File

$removed = 0

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $newLines = $lines | Where-Object { $_ -notmatch "export const runtime\s*=\s*['\`"]edge['\`"]" }
    
    if ($lines.Count -ne $newLines.Count) {
        $newLines | Set-Content $file.FullName
        $removed++
    }
}

Write-Host "Removed Edge Runtime from $removed API routes"
Write-Host "All routes will now use Node.js runtime (compatible with Cloudflare Workers)"
