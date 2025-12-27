# Remove Edge Runtime from API routes that use Node.js APIs
$nodejsRoutes = @(
    "src\app\api\auth\forgot-password\route.ts",
    "src\app\api\auth\reset-password\route.ts",
    "src\app\api\auth\signup\route.ts",
    "src\app\api\auth\login\route.ts",
    "src\app\api\admin\auth\login\route.ts",
    "src\app\api\astrologer\auth\login\route.ts",
    "src\app\api\astrologer\auth\login\login\route.ts",
    "src\app\api\upload\image\route.ts",
    "src\app\api\upload\chat-file\route.ts",
    "src\app\api\whatsapp\*\route.ts",
    "src\app\api\admin\whatsapp\*\route.ts",
    "src\app\api\contact\route.ts",
    "src\app\api\kundali\generate\route.ts",
    "src\app\api\mahurat\generate\route.ts"
)

$removed = 0

foreach ($pattern in $nodejsRoutes) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        if ($file) {
            $lines = Get-Content $file.FullName
            $newLines = $lines | Where-Object { $_ -notmatch "export const runtime\s*=\s*['\`"]edge['\`"]" }
            
            if ($lines.Count -ne $newLines.Count) {
                $newLines | Set-Content $file.FullName
                Write-Host "Removed from: $($file.FullName)"
                $removed++
            }
        }
    }
}

Write-Host "`nRemoved Edge Runtime from $removed Node.js-dependent routes"
