param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Join-Path $Root ".agents/skills/genbi-prep/scripts/check_genbi_prep.py"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    Write-Error "GenBI prep checker not found: $scriptPath"
}

$pythonCandidates = @()
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCommand) {
    $pythonCandidates += $pythonCommand.Source
}
$pythonCandidates += Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

$pythonExe = $pythonCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $pythonExe) {
    Write-Error "Python was not found. Install python or run check_genbi_prep.py with Codex bundled Python."
}

& $pythonExe -X utf8 $scriptPath --root $Root
exit $LASTEXITCODE
