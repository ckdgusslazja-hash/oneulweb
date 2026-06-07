# Agent 작업 종료 시 변경사항 commit + push → Vercel 자동 배포
$ErrorActionPreference = "Continue"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $root

$log = Join-Path $root "scripts\auto-deploy.log"
function Write-Log($msg) {
  $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
  Add-Content -Path $log -Value $line -Encoding UTF8
}

$git = $null
foreach ($p in @("git", "${env:ProgramFiles}\Git\bin\git.exe")) {
  if (Get-Command $p -ErrorAction SilentlyContinue) {
    $git = (Get-Command $p).Source
    break
  }
}
if (-not $git) {
  Write-Log "FAIL: git not found"
  exit 1
}

& $git add -A
$status = & $git status --porcelain
if (-not $status) {
  Write-Log "SKIP: no changes"
  exit 0
}

$msg = "auto deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
& $git -c user.email="reven9269@naver.com" -c user.name="oneulweb" commit -m $msg
if ($LASTEXITCODE -ne 0) {
  Write-Log "FAIL: commit exit $LASTEXITCODE"
  exit 1
}

$pushOut = & $git push origin main 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Log "FAIL: push - $pushOut"
  exit 1
}

Write-Log "OK: pushed to origin/main"
exit 0
