# sitemap.xml 자동 생성 (배포 전 실행)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$base = "https://oneulweb.com"
$today = Get-Date -Format "yyyy-MM-dd"

$urls = @(
  @{ loc = "$base/"; priority = "1.0"; changefreq = "weekly" }
)

Get-ChildItem (Join-Path $root "portfolio\*.html") | Sort-Object Name | ForEach-Object {
  $urls += @{
    loc = "$base/portfolio/$($_.Name)"
    priority = "0.7"
    changefreq = "monthly"
  }
}

$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
"@

foreach ($u in $urls) {
  $xml += @"

  <url>
    <loc>$($u.loc)</loc>
    <lastmod>$today</lastmod>
    <changefreq>$($u.changefreq)</changefreq>
    <priority>$($u.priority)</priority>
  </url>
"@
}

$xml += @"

</urlset>
"@

$out = Join-Path $root "sitemap.xml"
[System.IO.File]::WriteAllText($out, $xml.Trim() + "`n", [System.Text.UTF8Encoding]::new($false))
Write-Host "Wrote $($urls.Count) URLs to sitemap.xml"
