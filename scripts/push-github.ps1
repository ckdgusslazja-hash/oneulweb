# Push oneulweb to GitHub (sellervion과 동일 방식)
# Usage: .\scripts\push-github.ps1

param(
  [string]$RepoUrl = "https://github.com/ckdgusslazja-hash/oneulweb.git"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$git = $null
foreach ($p in @("git", "${env:ProgramFiles}\Git\bin\git.exe")) {
  if (Get-Command $p -ErrorAction SilentlyContinue) {
    $git = (Get-Command $p).Source
    break
  }
}

if (-not $git) {
  Write-Host "Git not found. Install from https://git-scm.com/download/win"
  exit 1
}

Write-Host "Working dir: $root"

if (-not (Test-Path ".git")) {
  & $git init
}

& $git add .
$status = & $git status --porcelain
if ($status) {
  & $git commit -m "oneulweb.com deploy"
} else {
  Write-Host "Nothing to commit"
}

& $git branch -M main 2>$null

$remotes = & $git remote 2>$null
if ($remotes -match "origin") {
  & $git remote set-url origin $RepoUrl
} else {
  & $git remote add origin $RepoUrl
}

Write-Host "Pushing to $RepoUrl"
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "Done. Import at https://vercel.com/new"
  Write-Host "Domain: https://oneulweb.com"
}
