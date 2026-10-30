[CmdletBinding()]
param(
    [string]$MysqlBin = 'C:\laragon\bin\mysql\mariadb-10.11.16-winx64\bin',
    [string]$TargetDatabase = ('transportseva_restore_verify_' + (Get-Date -Format 'yyyyMMdd_HHmmss')),
    [switch]$Execute
)

# Local instance only. Never imports an arbitrary dump or drops existing data.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'restore-sql-guard.psm1') -Force
$sourceDatabase = 'transportseva'
if ($TargetDatabase -cnotmatch '^transportseva_restore_verify_[0-9]{8}_[0-9]{6}$') {
    throw 'Target must be a new transportseva_restore_verify_YYYYMMDD_HHMMSS database.'
}
$mysqlPath = (Resolve-Path -LiteralPath (Join-Path $MysqlBin 'mysql.exe')).Path
$dumpPath = (Resolve-Path -LiteralPath (Join-Path $MysqlBin 'mysqldump.exe')).Path
$workspacePath = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$backupDirectory = Join-Path $workspacePath '.local-backups'
$artifactPath = Join-Path $backupDirectory ($TargetDatabase + '.sql')

function Read-LocalSql([string]$Sql) {
    $output = @(& $mysqlPath '-h127.0.0.1' '-uroot' '--batch' '--skip-column-names' '--default-character-set=utf8mb4' "--execute=$Sql")
    if ($LASTEXITCODE -ne 0) { throw 'Local database query failed.' }
    return $output
}
if (@(Read-LocalSql "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$TargetDatabase'").Count -ne 0) {
    throw 'Target database already exists; refusing overwrite or reuse.'
}
$tableNames = @(Read-LocalSql "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$sourceDatabase' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME")
if ($tableNames.Count -eq 0) { throw 'Source database has no tables.' }
foreach ($tableName in $tableNames) {
    if ($tableName -cnotmatch '^[a-zA-Z0-9_]+$') { throw 'Unsupported table identifier; manual review required.' }
}
$specialObjects = @(Read-LocalSql "SELECT (SELECT COUNT(*) FROM information_schema.VIEWS WHERE TABLE_SCHEMA='$sourceDatabase') + (SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA='$sourceDatabase') + (SELECT COUNT(*) FROM information_schema.EVENTS WHERE EVENT_SCHEMA='$sourceDatabase') + (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA='$sourceDatabase')")
if ([int]$specialObjects[0] -ne 0) { throw 'Views/routines/events/triggers need a reviewed restore plan. Refusing partial coverage.' }
$nonTransactional = @(Read-LocalSql "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='$sourceDatabase' AND TABLE_TYPE='BASE TABLE' AND ENGINE <> 'InnoDB'")
if ([int]$nonTransactional[0] -ne 0) { throw 'A snapshot needs a reviewed plan for non-InnoDB tables.' }
$collation = @(Read-LocalSql "SELECT CONCAT(DEFAULT_CHARACTER_SET_NAME,' ',DEFAULT_COLLATION_NAME) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$sourceDatabase'")
if ($collation[0] -cnotmatch '^[a-zA-Z0-9_]+ [a-zA-Z0-9_]+$') { throw 'Unsupported database character set.' }
$charsetParts = $collation[0].Split(' ')

function Get-TableFingerprint([string]$Database, [string]$Table) {
    $row = @(Read-LocalSql "CHECKSUM TABLE $Database.$Table EXTENDED")
    $checksum = ($row[0] -split [char]9)[-1]
    if ($checksum -notmatch '^[0-9]+$') { throw "No comparable checksum for $Table." }
    $count = @(Read-LocalSql "SELECT COUNT(*) FROM $Database.$Table")
    return ([string]$count[0] + ':' + $checksum)
}
if (!$Execute) {
    [pscustomobject]@{
        Mode = 'DRY RUN - no files or databases created'
        Source = $sourceDatabase
        Tables = $tableNames.Count
        NewTarget = $TargetDatabase
        Artifact = $artifactPath
        Execution = 'Add -Execute to export and restore into this new isolated local database.'
    }
    return
}
if (Test-Path -LiteralPath $artifactPath) { throw 'Artifact exists; refusing overwrite.' }
if (!(Test-Path -LiteralPath $backupDirectory)) { New-Item -ItemType Directory -Path $backupDirectory | Out-Null }
$before = @{}
foreach ($tableName in $tableNames) { $before[$tableName] = Get-TableFingerprint $sourceDatabase $tableName }
# No --databases: it injects USE transportseva into a dump.
& $dumpPath '-h127.0.0.1' '-uroot' '--single-transaction' '--quick' '--hex-blob' '--default-character-set=utf8mb4' '--skip-add-drop-table' '--skip-triggers' "--result-file=$artifactPath" $sourceDatabase
if ($LASTEXITCODE -ne 0) { throw 'Export failed; no target database has been created.' }
$sqlText = [System.IO.File]::ReadAllText($artifactPath)
Assert-RestoreDumpSafety -Sql $sqlText -ExpectedTables $tableNames.Count
$sqlText = $null
if (@(Read-LocalSql "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$TargetDatabase'").Count -ne 0) { throw 'Target appeared during export; refusing import.' }
# Without IF NOT EXISTS: a racing CREATE fails instead of reusing the database.
Read-LocalSql "CREATE DATABASE $TargetDatabase CHARACTER SET $($charsetParts[0]) COLLATE $($charsetParts[1])" | Out-Null
$importErrorPath = Join-Path $backupDirectory ($TargetDatabase + '-import.stderr')
$importProcess = Start-Process -FilePath $mysqlPath -ArgumentList @('-h127.0.0.1', '-uroot', '--default-character-set=utf8mb4', "--database=$TargetDatabase") -RedirectStandardInput $artifactPath -RedirectStandardError $importErrorPath -PassThru -Wait -WindowStyle Hidden
if ($importProcess.ExitCode -ne 0) { throw "Import failed. Isolated target and private error file retained: $TargetDatabase" }
$restoredTables = @(Read-LocalSql "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$TargetDatabase' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME")
if (($restoredTables -join ',') -cne ($tableNames -join ',')) { throw 'Restored inventory differs. Both databases retained.' }
foreach ($tableName in $tableNames) {
    $restored = Get-TableFingerprint $TargetDatabase $tableName
    $sourceNow = Get-TableFingerprint $sourceDatabase $tableName
    if ($sourceNow -ne $before[$tableName]) { throw "Source changed during drill ($tableName); result inconclusive. Both databases retained." }
    if ($restored -ne $before[$tableName]) { throw "Restored row count/checksum differs ($tableName). Both databases retained." }
}
[pscustomobject]@{
    Result = 'PASS - local database restore only'
    Source = $sourceDatabase
    RetainedTarget = $TargetDatabase
    VerifiedTables = $tableNames.Count
    Checks = 'Exact table inventory, row counts and EXTENDED checksums; source unchanged during drill'
    Artifact = $artifactPath
    Bytes = (Get-Item -LiteralPath $artifactPath).Length
    SHA256 = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash
    Exclusions = 'Uploaded files, deployment host, delivery and application boot against restored DB not tested'
}
