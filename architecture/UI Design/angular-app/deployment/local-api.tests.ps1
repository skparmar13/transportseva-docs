$ErrorActionPreference = 'Stop'
$launcher = Join-Path $PSScriptRoot 'local-api.ps1'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\test-results\local-api'))
$runtimeRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.local-runtime\api'))
$stateFile = Join-Path $runtimeRoot 'port-8087.json'
if (-not (Test-Path -LiteralPath $stateFile)) { throw 'Start the launcher on test port 8087 first.' }
$savedState = [IO.File]::ReadAllText($stateFile)
$state = $savedState | ConvertFrom-Json
$checks = [Collections.Generic.List[string]]::new()
function Assert-Check([bool]$condition, [string]$name) {
    if (-not $condition) { throw "Failed: $name" }
    $checks.Add($name)
}
$probeProcess = $null
try {
    $response = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8087/api/loads/recent?per_page=20' -TimeoutSec 30
    Assert-Check ($response.StatusCode -eq 200 -and (($response.Content | ConvertFrom-Json).success)) 'Real public endpoint responds'
    $privateStatus = 0
    try { Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8087/api/account/profile' -Headers @{Accept='application/json'} -TimeoutSec 30 | Out-Null }
    catch { $privateStatus = [int]$_.Exception.Response.StatusCode }
    Assert-Check ($privateStatus -eq 401) 'Anonymous private endpoint remains denied'

    $ErrorActionPreference = 'Continue'
    $busyOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -Port 8087 2>&1
    $busyExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    Assert-Check ($busyExit -ne 0) 'Occupied port is refused'
    Assert-Check ((Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json).ProcessId -eq $state.ProcessId) 'Occupied-port attempt preserves ownership'

    $state.StartedAtUtc = '2000-01-01T00:00:00Z'
    [IO.File]::WriteAllText($stateFile, ($state | ConvertTo-Json -Depth 5), [Text.UTF8Encoding]::new($false))
    $ErrorActionPreference = 'Continue'
    $refusedOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -Port 8087 -Stop 2>&1
    $refusedExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    Assert-Check ($refusedExit -ne 0) 'Mismatched creation time cannot stop a process'
    Assert-Check ((Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8087/up' -TimeoutSec 30).StatusCode -eq 200) 'Refused stop preserves the server'
    [IO.File]::WriteAllText($stateFile, $savedState, [Text.UTF8Encoding]::new($false))
    $state = $savedState | ConvertFrom-Json

    # Standalone, loopback-only fixture: no route or debug endpoint is added to the app.
    $probeRoot = Join-Path $root 'edit-probe'
    New-Item -ItemType Directory -Path $probeRoot -Force | Out-Null
    $probePath = Join-Path $probeRoot 'index.php'
    $probeCode = @'
<?php
$cache = opcache_get_status(false);
echo json_encode(['version'=>1,'enabled'=>$cache['opcache_enabled']??false,'cached'=>opcache_is_script_cached(__FILE__),'validate'=>ini_get('opcache.validate_timestamps'),'revalidate'=>ini_get('opcache.revalidate_freq')]);
'@
    [IO.File]::WriteAllText($probePath, $probeCode, [Text.UTF8Encoding]::new($false))
    $dll = Join-Path (Split-Path -Parent $state.PhpBinary) 'ext\php_opcache.dll'
    $argsForProbe = @('-d',"zend_extension=$dll",'-d','opcache.enable_cli=1','-d','opcache.validate_timestamps=1',
        '-d','opcache.revalidate_freq=0','-d','opcache.cache_id=transportseva-edit-probe','-S','127.0.0.1:8091','-t',$probeRoot)
    $probeSocket = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,8091)
    try { $probeSocket.Start() } finally { $probeSocket.Stop() }
    $probeArguments = ($argsForProbe | ForEach-Object { '"' + $_ + '"' }) -join ' '
    $probeProcess = Start-Process -FilePath $state.PhpBinary -ArgumentList $probeArguments -WorkingDirectory $probeRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $probeRoot 'out.log') -RedirectStandardError (Join-Path $probeRoot 'err.log')
    Start-Sleep -Milliseconds 2200
    $before = Invoke-RestMethod 'http://127.0.0.1:8091/index.php' -TimeoutSec 15
    $before = Invoke-RestMethod 'http://127.0.0.1:8091/index.php' -TimeoutSec 15
    Assert-Check ($before.enabled -and $before.validate -eq '1' -and $before.revalidate -eq '0') 'Opcode cache checks source timestamps on every request'
    Assert-Check ([bool]$before.cached) 'Fixture is actually cached before editing'
    Assert-Check ($before.version -eq 1) 'Initial fixture code runs'
    [IO.File]::WriteAllText($probePath, $probeCode.Replace("'version'=>1", "'version'=>2"), [Text.UTF8Encoding]::new($false))
    $after = Invoke-RestMethod 'http://127.0.0.1:8091/index.php' -TimeoutSec 15
    Assert-Check ($after.version -eq 2 -and -not $probeProcess.HasExited) 'Source edit is visible without restarting the worker'
} finally {
    [IO.File]::WriteAllText($stateFile, $savedState, [Text.UTF8Encoding]::new($false))
    if ($probeProcess -and -not $probeProcess.HasExited) { Stop-Process -InputObject $probeProcess }
}
$stopOutput = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -Port 8087 -Stop 2>&1
Assert-Check ($LASTEXITCODE -eq 0) 'Verified launcher ownership permits stopping its own server'
$result = [ordered]@{ Passed=$checks.Count; Checks=$checks.ToArray() }
[IO.File]::WriteAllText((Join-Path $root 'launcher-checks.json'), ($result | ConvertTo-Json -Depth 3), [Text.UTF8Encoding]::new($false))
$result | ConvertTo-Json -Depth 3
