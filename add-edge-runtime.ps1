$files = @(
    # API Routes
    "src\app\api\admin\astrologers\[id]\approve\route.ts",
    "src\app\api\admin\astrologers\[id]\route.ts",
    "src\app\api\admin\astrologers\[id]\status\route.ts",
    "src\app\api\admin\astrologers\route.ts",
    "src\app\api\admin\auth\login\route.ts",
    "src\app\api\admin\chat\sessions\[sessionId]\end\route.ts",
    "src\app\api\admin\chat\sessions\[sessionId]\messages\route.ts",
    "src\app\api\admin\chat\sessions\route.ts",
    "src\app\api\admin\consultations\[id]\status\route.ts",
    "src\app\api\admin\content\route.ts",
    "src\app\api\admin\dashboard\route.ts",
    "src\app\api\admin\pandits\[id]\approve\route.ts",
    "src\app\api\admin\payments\[id]\status\route.ts",
    "src\app\api\admin\payments\route.ts",
    "src\app\api\admin\pooja-bookings\[id]\status\route.ts",
    "src\app\api\admin\pooja-bookings\route.ts",
    "src\app\api\admin\subscriptions\approve\route.ts",
    "src\app\api\admin\subscriptions\cancel\route.ts",
    "src\app\api\admin\subscriptions\reject\route.ts",
    "src\app\api\admin\subscriptions\reminder\route.ts",
    "src\app\api\admin\subscriptions\route.ts",
    "src\app\api\admin\users\[id]\status\route.ts",
    "src\app\api\admin\users\route.ts",
    "src\app\api\admin\whatsapp\bulk-send\route.ts",
    "src\app\api\astrologer\auth\login\login\route.ts",
    "src\app\api\astrologer\auth\login\route.ts",
    "src\app\api\astrologer\sessions\route.ts",
    "src\app\api\astrologers\list\route.ts",
    "src\app\api\astrologers\route.ts",
    "src\app\api\auth\forgot-password\route.ts",
    "src\app\api\auth\login\route.ts",
    "src\app\api\auth\me\route.ts",
    "src\app\api\auth\reset-password\route.ts",
    "src\app\api\auth\signup\route.ts",
    "src\app\api\auth\verify-code\route.ts",
    "src\app\api\bookings\route.ts",
    "src\app\api\chat\ai\route.ts",
    "src\app\api\chat\astrologer\end\route.ts",
    "src\app\api\chat\astrologer\messages\route.ts",
    "src\app\api\chat\astrologer\start\route.ts",
    "src\app\api\chat-sessions\route.ts",
    "src\app\api\cities\search\route.ts",
    "src\app\api\consultations\route.ts",
    "src\app\api\contact\route.ts",
    "src\app\api\kundali\generate\route.ts",
    "src\app\api\kundali\health\route.ts",
    "src\app\api\kundali\route.ts",
    "src\app\api\mahurat\generate\route.ts",
    "src\app\api\notifications\route.ts",
    "src\app\api\pandits\route.ts",
    "src\app\api\payment\create-order\route.ts",
    "src\app\api\payment\qr-code\route.ts",
    "src\app\api\payment\verify\route.ts",
    "src\app\api\payments\route.ts",
    "src\app\api\pooja-booking\route.ts",
    "src\app\api\pooja-rating\route.ts",
    "src\app\api\subscription\request\route.ts",
    "src\app\api\subscriptions\route.ts",
    "src\app\api\upload\chat-file\route.ts",
    "src\app\api\upload\image\route.ts",
    "src\app\api\user\chat-status\route.ts",
    "src\app\api\user\payment-verifications\route.ts",
    "src\app\api\user\subscription-status\route.ts",
    "src\app\api\users\route.ts",
    "src\app\api\whatsapp\disconnect\route.ts",
    "src\app\api\whatsapp\reconnect\route.ts",
    "src\app\api\whatsapp\status\route.ts",
    "src\app\api\route.ts",
    # Dynamic Pages
    "src\app\about\page.tsx",
    "src\app\admin\chat\page.tsx",
    "src\app\admin\content\page.tsx",
    "src\app\admin\login\page.tsx",
    "src\app\admin\page.tsx",
    "src\app\admin\pandits\page.tsx",
    "src\app\admin\payments\page.tsx",
    "src\app\admin\subscriptions\page.tsx",
    "src\app\admin\users\page.tsx",
    "src\app\astrologer\chat\[id]\page.tsx",
    "src\app\astrologer\dashboard\page.tsx",
    "src\app\astrologer\login\page.tsx",
    "src\app\consultation\page.tsx",
    "src\app\contact\page.tsx",
    "src\app\login\page.tsx",
    "src\app\numerology\page.tsx",
    "src\app\palmistry\page.tsx",
    "src\app\profile\page.tsx",
    "src\app\signup\page.tsx",
    "src\app\talk-to-astrologer\[id]\page.tsx",
    "src\app\talk-to-astrologer\page.tsx"
)

$edgeRuntimeExport = "export const runtime = 'edge';`n"
$processedCount = 0
$skippedCount = 0

foreach ($file in $files) {
    $fullPath = Join-Path "c:\Users\AAYUSH\viprakarma-main\viprakarma-main\viprakarma-main\viprakarma-main" $file
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Check if already has edge runtime export
        if ($content -match "export const runtime\s*=\s*['""]edge['""]") {
            Write-Host "Skipped (already has edge runtime): $file" -ForegroundColor Yellow
            $skippedCount++
            continue
        }
        
        # Add edge runtime export at the top of the file
        $newContent = $edgeRuntimeExport + $content
        Set-Content -Path $fullPath -Value $newContent -NoNewline
        
        Write-Host "Updated: $file" -ForegroundColor Green
        $processedCount++
    } else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Processed: $processedCount files" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "  Total: $($files.Count) files" -ForegroundColor Cyan
