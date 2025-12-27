# Remove Edge Runtime from all page.tsx files
$files = Get-ChildItem -Path "src\app" -Filter "page.tsx" -Recurse -File

foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    $newLines = $lines | Where-Object { $_ -notmatch "export const runtime\s*=\s*['\`"]edge['\`"]" }
    
    if ($lines.Count -ne $newLines.Count) {
        $newLines | Set-Content $file.FullName
        Write-Host "Removed from: $($file.FullName)"
    }
}

Write-Host "Done!"
