# Agent 작업 종료 시 변경사항을 GitHub에 push → Vercel 자동 배포
$ErrorActionPreference = "SilentlyContinue"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $root

$git = $null
foreach ($p in @("git", "${env:ProgramFiles}\Git\bin\git.exe")) {
  if (Get-Command $p -ErrorAction SilentlyContinue) {
    $git = (Get-Command $p).Source
    break
  }
}
if (-not $git) { exit 0 }

& $git add -A
$status = & $git status --porcelain
if (-not $status) { exit 0 }

$msg = "auto deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
& $git -c user.email="deploy@oneulweb.com" -c user.name="oneulweb" commit -m $msg
& $git push origin main 2>&1 | Out-Null

exit 0
