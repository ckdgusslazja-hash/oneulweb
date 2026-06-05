# Git commit 후 자동 push (수동 commit 시에도 Vercel 배포)
$root = Split-Path $PSScriptRoot -Parent
$hookDir = Join-Path $root ".git\hooks"
$hookPath = Join-Path $hookDir "post-commit"

if (-not (Test-Path $hookDir)) {
  Write-Host ".git/hooks not found. Run git init first."
  exit 1
}

@'
#!/bin/sh
git push origin main 2>/dev/null
'@ | Set-Content -Path $hookPath -Encoding ASCII -NoNewline

Write-Host "Installed post-commit hook: $hookPath"
Write-Host "Every git commit will auto-push to GitHub → Vercel deploy."
