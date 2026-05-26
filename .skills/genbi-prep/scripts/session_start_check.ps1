param(
    [string]$Root = "."
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

$scriptPath = Join-Path $Root ".skills/genbi-prep/scripts/check_genbi_prep.py"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    Write-Error "找不到 GenBI prep checker：$scriptPath"
}

python -X utf8 $scriptPath --root $Root
exit $LASTEXITCODE
