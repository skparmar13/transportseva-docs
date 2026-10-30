Set-StrictMode -Version Latest
function Assert-RestoreDumpSafety {
    param([Parameter(Mandatory)][string]$Sql, [Parameter(Mandatory)][int]$ExpectedTables)
    # Inspect SQL structure, not domains or text inside escaped data literals.
    # Retain executable version comments so USE inside them is also rejected.
    $statements = [regex]::Replace($Sql, "'(?:''|\\.|[^'\\])*'", "''", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $statements = [regex]::Replace($statements, '"(?:""|\\.|[^"\\])*"', '""', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $qualifiedSource = '(?i)(?<![a-zA-Z0-9_])(?:' + [char]96 + 'transportseva' + [char]96 + '|transportseva)\s*\.'
    if ($statements -match '(?im)(?:^|;)\s*(?:/\*![0-9]+\s+)?(?:USE\s|(?:CREATE|DROP|ALTER)\s+DATABASE|DROP\s+TABLE|SOURCE\s|\\[!.])' -or $statements -match $qualifiedSource) {
        throw 'Dump contains database switching, destructive SQL or source-qualified references. No import attempted.'
    }
    if ([regex]::Matches($statements, '(?m)^CREATE TABLE ').Count -ne $ExpectedTables -or $Sql -notmatch '(?m)^-- Dump completed on ') {
        throw 'Incomplete dump. No import attempted.'
    }
}
Export-ModuleMember -Function Assert-RestoreDumpSafety
