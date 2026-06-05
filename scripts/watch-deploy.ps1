# 파일 저장 시 자동 commit + push → Vercel 배포
# Usage: npm run watch  또는  .\scripts\watch-deploy.ps1

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
  Write-Host "Git not found."
  exit 1
}

$debounceSeconds = 3
$pending = $false
$timer = $null

function Deploy-Changes {
  param([string]$GitPath, [string]$RootPath)
  Set-Location $RootPath
  & $GitPath add -A
  $status = & $GitPath status --porcelain
  if (-not $status) { return }

  $msg = "auto deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  & $GitPath -c user.email="deploy@oneulweb.com" -c user.name="oneulweb" commit -m $msg
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pushing to GitHub..."
  & $GitPath push origin main
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Done — Vercel will deploy shortly."
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $root
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

$ignore = @('\.git\\', '\\\.vercel\\', 'node_modules')

$action = {
  $path = $Event.SourceEventArgs.FullPath
  foreach ($pattern in $ignore) {
    if ($path -match $pattern) { return }
  }
  if ($path -notmatch '\.(html|css|js|json|md|ps1)$') { return }

  $script:pending = $true
  if ($script:timer) { $script:timer.Dispose() }
  $script:timer = New-Object System.Timers.Timer
  $script:timer.Interval = $debounceSeconds * 1000
  $script:timer.AutoReset = $false
  $script:timer.Add_Elapsed({
    if ($script:pending) {
      $script:pending = $false
      Deploy-Changes -GitPath $using:git -RootPath $using:root
    }
  })
  $script:timer.Start()
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

Write-Host "Watching $root for changes (${debounceSeconds}s debounce)..."
Write-Host "Press Ctrl+C to stop."
while ($true) { Start-Sleep -Seconds 1 }
