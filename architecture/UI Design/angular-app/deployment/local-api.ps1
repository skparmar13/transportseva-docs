param(
    [string]$BackendRoot = (Join-Path $PSScriptRoot '..\..\..\..\..\transportseva-api'),
    [string]$PhpBinary = '',
    [ValidateRange(1024, 65535)][int]$Port = 8080,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'
$apiRoot = (Resolve-Path -LiteralPath $BackendRoot).Path
$publicRoot = Join-Path $apiRoot 'public'
$router = Join-Path $apiRoot 'vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php'
foreach ($required in @('artisan', 'public\index.php', 'vendor\autoload.php', 'Modules\Booking\Http\Controllers\LoadController.php')) {
    if (-not (Test-Path -LiteralPath (Join-Path $apiRoot $required) -PathType Leaf)) { throw "TransportSeva backend file missing: $required" }
}
$artifactRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.local-runtime\api'))
$statePath = Join-Path $artifactRoot "port-$Port.json"

if ($Stop) {
    if (-not (Test-Path -LiteralPath $statePath)) { throw 'No launcher ownership record; no process was stopped.' }
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $owned = Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$state.ProcessId)"
    if (-not $owned) { Write-Output 'The recorded local API is already stopped.'; return }
    $started = [DateTime]::Parse($state.StartedAtUtc).ToUniversalTime()
    $sameStart = [Math]::Abs(($owned.CreationDate.ToUniversalTime() - $started).TotalSeconds) -lt 1
    $sameRoot = [string]::Equals($state.BackendRoot, $apiRoot, [StringComparison]::OrdinalIgnoreCase)
    $sameExe = [string]::Equals($owned.ExecutablePath, $state.PhpBinary, [StringComparison]::OrdinalIgnoreCase)
    $sameRouter = $owned.CommandLine.IndexOf($router, [StringComparison]::OrdinalIgnoreCase) -ge 0
    $samePort = $owned.CommandLine -match ('(?<![0-9])127\.0\.0\.1:' + $Port + '(?![0-9])')
    if (-not ($sameStart -and $sameRoot -and $sameExe -and $sameRouter -and $samePort)) { throw 'The process no longer matches launcher ownership; no process was stopped.' }
    Stop-Process -Id $owned.ProcessId
    Write-Output "Stopped owned TransportSeva API on port $Port."
    return
}

if (-not $PhpBinary) { $PhpBinary = (Get-Command php -ErrorAction Stop).Source }
$PhpBinary = (Resolve-Path -LiteralPath $PhpBinary).Path
$probe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try { $probe.Start() } finally { $probe.Stop() }

$phpArguments = @()
$modules = & $PhpBinary -m
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the selected PHP executable.' }
if (-not ($modules -contains 'Zend OPcache')) {
    $dll = Join-Path (Split-Path -Parent $PhpBinary) 'ext\php_opcache.dll'
    if (-not (Test-Path -LiteralPath $dll -PathType Leaf)) { throw 'The selected PHP installation has no OPcache DLL. No server was started.' }
    $phpArguments += @('-d', "zend_extension=$dll")
}
$phpArguments += @('-d','opcache.enable=1','-d','opcache.enable_cli=1',
    '-d','opcache.validate_timestamps=1','-d','opcache.revalidate_freq=0',
    '-d','opcache.cache_id=transportseva-local-api','-S',"127.0.0.1:$Port",$router)
# Start-Process joins ArgumentList on Windows; quote complete arguments once.
$quotedArguments = ($phpArguments | ForEach-Object {
    if ($_ -match '["\r\n]' -or $_.EndsWith('\')) { throw 'Unsupported PHP argument; no server was started.' }
    '"' + $_ + '"'
}) -join ' '
New-Item -ItemType Directory -Path $artifactRoot -Force | Out-Null
$runId = [Guid]::NewGuid().ToString('N').Substring(0, 12)
$stdout = Join-Path $artifactRoot "$Port-$runId.out.log"
$stderr = Join-Path $artifactRoot "$Port-$runId.err.log"
$process = Start-Process -FilePath $PhpBinary -ArgumentList $quotedArguments -WorkingDirectory $publicRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
try {
    $warmup = @()
    foreach ($path in @('/up','/api/public/reviews?limit=6','/api/loads/recent?per_page=20')) {
        if ($process.HasExited) { throw "Local API exited. Inspect $stderr" }
        $watch = [Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port$path" -TimeoutSec 45
        $watch.Stop()
        if ($response.StatusCode -ne 200) { throw 'Local API warmup failed.' }
        $warmup += [pscustomobject]@{ Path = $path; Milliseconds = [Math]::Round($watch.Elapsed.TotalMilliseconds, 2) }
    }
    $metadata = Get-CimInstance Win32_Process -Filter "ProcessId=$($process.Id)"
    $state = [ordered]@{ ProcessId=$process.Id; Port=$Port; BackendRoot=$apiRoot; PhpBinary=$PhpBinary; StartedAtUtc=$metadata.CreationDate.ToUniversalTime().ToString('o'); Stdout=$stdout; Stderr=$stderr; ValidateTimestamps=$true; RevalidateSeconds=0; Warmup=$warmup }
    [IO.File]::WriteAllText($statePath, ($state | ConvertTo-Json -Depth 5), [Text.UTF8Encoding]::new($false))
    $state | ConvertTo-Json -Depth 5
} catch {
    if (-not $process.HasExited) { Stop-Process -InputObject $process }
    throw
}
