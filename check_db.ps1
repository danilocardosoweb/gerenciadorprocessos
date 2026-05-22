$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmZXl3ZmJmYWdqYmFycGNzc2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDA3NjAsImV4cCI6MjA3NjI3Njc2MH0.CM5LZ2WRx76DJavPR0EOfZgGzyvrXLnX4kcDCXVIPt8"
$headers = @{ "apikey" = $key; "Authorization" = "Bearer $key"; "Prefer" = "count=exact" }

$tables = @('tecno_users', 'app_users', 'mapper_users', 'system_users')

foreach ($table in $tables) {
    $url = "https://zfeywfbfagjbarpcsskn.supabase.co/rest/v1/$table?select=*"
    try {
        $r = Invoke-RestMethod -Uri $url -Headers $headers
        Write-Host "=== $table - ENCONTRADA! ($($r.Count) registros) ===" -ForegroundColor Green
        $r | ForEach-Object { Write-Host "  email=$($_.email) name=$($_.name) role=$($_.role) status=$($_.status) password=$($_.password)" }
    } catch {
        $body = ""
        try { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $body = $reader.ReadToEnd() } catch {}
        if ($body -match '404|not found|schema cache') {
            Write-Host ("  " + $table + ": nao existe") -ForegroundColor DarkGray
        } else {
            Write-Host ("  " + $table + ": " + $body) -ForegroundColor Yellow
        }
    }
}
