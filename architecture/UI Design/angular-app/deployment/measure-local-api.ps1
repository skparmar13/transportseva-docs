param(
    [Uri]$BaseUri = 'http://127.0.0.1:8080',
    [ValidateRange(1, 10)][int]$Samples = 5
)
$ErrorActionPreference = 'Stop'
if (-not $BaseUri.IsLoopback -or $BaseUri.Scheme -ne 'http' -or $BaseUri.UserInfo -or $BaseUri.Query -or $BaseUri.Fragment -or $BaseUri.AbsolutePath -ne '/') {
    throw 'Use a plain loopback HTTP origin for the local API benchmark.'
}
$origin = $BaseUri.GetLeftPart([UriPartial]::Authority)
$rows = @()
foreach ($sample in 1..$Samples) {
    foreach ($path in @('/up','/api/public/reviews?limit=6','/api/loads/recent?per_page=20')) {
        $raw = & curl.exe --silent --show-error --noproxy '*' --output NUL --max-time 45 --write-out '%{time_total}|%{time_starttransfer}|%{http_code}' "$origin$path"
        if ($LASTEXITCODE -ne 0) { throw 'Local API timing request failed.' }
        $parts = $raw -split '\|'
        $rows += [pscustomobject]@{ Sample=$sample; Path=$path; Status=[int]$parts[2]; Milliseconds=[Math]::Round([double]::Parse($parts[0],[Globalization.CultureInfo]::InvariantCulture)*1000,2); FirstByteMilliseconds=[Math]::Round([double]::Parse($parts[1],[Globalization.CultureInfo]::InvariantCulture)*1000,2) }
    }
}
$summary = @($rows | Group-Object Path | ForEach-Object {
    $stats = $_.Group | Measure-Object Milliseconds -Average -Minimum -Maximum
    [pscustomobject]@{ Path=$_.Name; Samples=$_.Count; AverageMs=[Math]::Round($stats.Average,2); MinimumMs=$stats.Minimum; MaximumMs=$stats.Maximum }
})
$result = [ordered]@{ BaseUri=$origin; CapturedAtUtc=[DateTime]::UtcNow.ToString('o'); AllSuccessful=(@($rows | Where-Object Status -ne 200).Count -eq 0); Summary=$summary; Requests=$rows }
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\test-results\local-api'))
New-Item -ItemType Directory -Path $root -Force | Out-Null
[IO.File]::WriteAllText((Join-Path $root "benchmark-$($BaseUri.Port).json"),($result | ConvertTo-Json -Depth 5),[Text.UTF8Encoding]::new($false))
$result | ConvertTo-Json -Depth 5
if (-not $result.AllSuccessful) { exit 1 }
