import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const root = join(import.meta.dirname, "..");
const base = "https://oneulweb.com";
const today = new Date().toISOString().slice(0, 10);

const portfolioDir = join(root, "portfolio");
const files = readdirSync(portfolioDir).filter((f) => f.endsWith(".html"));

for (const file of files) {
  const slug = basename(file, ".html");
  const path = join(portfolioDir, file);
  let content = readFileSync(path, "utf8");

  const h1 = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const name = h1 ? h1[1].trim() : slug;
  const title = `${name} | oneulweb`;
  const desc = `oneulweb(오늘웹) 포트폴리오 — ${name} 홈페이지 제작 사례. AI 맞춤 웹사이트·쇼핑몰 제작 서비스.`;
  const canonical = `${base}/portfolio/${slug}.html`;

  content = content.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  const seoBlock = `  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="oneulweb">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="ko_KR">`;

  if (content.includes('meta name="description"')) {
    content = content.replace(/<meta name="description"[^>]+>/, `<meta name="description" content="${desc}">`);
    content = content.replace(/<meta property="og:description"[^>]+>/, `<meta property="og:description" content="${desc}">`);
    content = content.replace(/<meta property="og:title"[^>]+>/, `<meta property="og:title" content="${title}">`);
    content = content.replace(/<link rel="canonical"[^>]+>/, `<link rel="canonical" href="${canonical}">`);
    content = content.replace(/<meta property="og:url"[^>]+>/, `<meta property="og:url" content="${canonical}">`);
  } else {
    content = content.replace(
      /(<meta name="viewport"[^>]+>)/,
      `$1\n${seoBlock}`
    );
  }

  writeFileSync(path, content, "utf8");
}

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const urls = [{ loc: `${base}/`, priority: "1.0", changefreq: "weekly" }];
for (const file of files) {
  urls.push({ loc: `${base}/portfolio/${file}`, priority: "0.7", changefreq: "monthly" });
}
for (const u of urls) {
  sitemap += `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
}
sitemap += `</urlset>\n`;
writeFileSync(join(root, "sitemap.xml"), sitemap, "utf8");

console.log(`SEO patched ${files.length} portfolio pages + sitemap.xml`);
