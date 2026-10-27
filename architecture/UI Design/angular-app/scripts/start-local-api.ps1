param(
    [string]$ApiPath = (Join-Path $PSScriptRoot '..\..\..\..\..\transportseva-api'),
    [ValidateRange(1024, 65535)][int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$taskApiRoot = (Resolve-Path -LiteralPath $ApiPath).Path
$taskPublic = Join-Path $taskApiRoot 'public'
$taskRouter = Join-Path $taskApiRoot 'vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php'
if (!(Test-Path -LiteralPath (Join-Path $taskPublic 'index.php')) -or !(Test-Path -LiteralPath $taskRouter)) {
    throw 'Select the existing TransportSeva Laravel API directory.'
}
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    throw "Port $Port is already in use. Stop its verified API server first; this script never kills processes."
}
$taskPhp = (Get-Command php -CommandType Application).Source
$taskModules = & $taskPhp -m
$taskOptions = @()
if ($taskModules -notcontains 'Zend OPcache') {
    $taskCache = Join-Path (Split-Path $taskPhp) 'ext\php_opcache.dll'
    if (!(Test-Path -LiteralPath $taskCache)) {
        throw 'The selected PHP installation has no OPcache extension. Configure a supported PHP installation first.'
    }
    $taskOptions += @('-d', ('zend_extension=' + $taskCache))
}
# These overrides affect this process only, not php.ini or other projects.
# Timestamp checks stay enabled with no delay, so source edits take effect.
$taskOptions += @('-d', 'opcache.enable_cli=1', '-d', 'opcache.validate_timestamps=1', '-d', 'opcache.revalidate_freq=0')
Write-Output "TransportSeva local API: http://127.0.0.1:$Port (OPcache enabled; source validation enabled)"
Write-Output 'Local development only. Restart this process after changing .env. No database migration or reset is performed.'
Push-Location -LiteralPath $taskPublic
try {
    & $taskPhp @taskOptions -S "127.0.0.1:$Port" -t $taskPublic $taskRouter
    if ($LASTEXITCODE -ne 0) { throw "The local API server exited with code $LASTEXITCODE." }
} finally {
    Pop-Location
}
