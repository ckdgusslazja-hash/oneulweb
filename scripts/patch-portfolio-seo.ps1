# portfolio/*.html SEO meta tags (UTF-8)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$base = "https://oneulweb.com"
$utf8 = New-Object System.Text.UTF8Encoding $false

Get-ChildItem (Join-Path $root "portfolio\*.html") | ForEach-Object {
  $slug = $_.BaseName
  $content = [System.IO.File]::ReadAllText($_.FullName, $utf8)

  $name = $slug
  if ($content -match '<h1[^>]*>([^<]+)</h1>') {
    $name = $matches[1].Trim()
  }

  $title = "$name | oneulweb"
  $desc = "oneulweb(오늘웹) 포트폴리오 — $name 홈페이지 제작 사례. AI 맞춤 웹사이트·쇼핑몰 제작 서비스."
  $canonical = "$base/portfolio/$slug.html"

  $content = $content -replace '<title>[^<]*</title>', "<title>$title</title>"

  $descMeta = "<meta name=`"description`" content=`"$desc`">"
  if ($content -match 'meta name="description"') {
    $content = $content -replace '<meta name="description"[^>]+>', $descMeta
    $content = $content -replace '<meta property="og:description"[^>]+>', "<meta property=`"og:description`" content=`"$desc`">"
    $content = $content -replace '<meta property="og:title"[^>]+>', "<meta property=`"og:title`" content=`"$title`">"
  } else {
    $seoBlock = @"
  $descMeta
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="$canonical">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="oneulweb">
  <meta property="og:title" content="$title">
  <meta property="og:description" content="$desc">
  <meta property="og:url" content="$canonical">
  <meta property="og:locale" content="ko_KR">
"@
    $content = $content -replace '(<meta name="viewport"[^>]+>)', "`$1`n$seoBlock"
  }

  [System.IO.File]::WriteAllText($_.FullName, $content, $utf8)
}

Write-Host "Patched portfolio SEO meta tags."
