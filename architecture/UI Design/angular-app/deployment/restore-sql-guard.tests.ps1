Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'restore-sql-guard.psm1') -Force
$nl = [Environment]::NewLine
$base = "CREATE TABLE example (id int, note text);$nl-- Dump completed on test"
$allowed = @(
    $base,
    ("CREATE TABLE example (note text);$nl INSERT INTO example VALUES ('qa@transportseva.test; USE transportseva; DROP TABLE users;');$nl-- Dump completed on test"),
    ("CREATE TABLE example (note text);$nl INSERT INTO example VALUES ('quote\' and transportseva.users; USE transportseva;');$nl-- Dump completed on test"),
    ("CREATE TABLE example (note text);$nl INSERT INTO example VALUES ('quote'' and transportseva.users');$nl-- Dump completed on test")
)
$forbidden = @(
    "USE transportseva;$nl$base",
    "CREATE DATABASE transportseva;$nl$base",
    "DROP DATABASE transportseva;$nl$base",
    "ALTER DATABASE transportseva;$nl$base",
    "DROP TABLE users;$nl$base",
    "INSERT INTO transportseva.users VALUES (1);$nl$base",
    ('INSERT INTO ' + [char]96 + 'transportseva' + [char]96 + ".users VALUES (1);$nl$base"),
    "/*!40000 USE transportseva */;$nl$base",
    "SET @test=1; USE transportseva;$nl$base",
    "SOURCE other.sql;$nl$base",
    'CREATE TABLE example (id int);'
)
foreach ($sql in $allowed) { Assert-RestoreDumpSafety -Sql $sql -ExpectedTables 1 }
foreach ($sql in $forbidden) {
    $rejected = $false
    try { Assert-RestoreDumpSafety -Sql $sql -ExpectedTables 1 } catch { $rejected = $true }
    if (!$rejected) { throw 'An unsafe/incomplete SQL fixture was accepted.' }
}
Write-Output ('PASS: ' + ($allowed.Count + $forbidden.Count) + ' SQL guard cases; no database writes.')
