/**
 * 포트폴리오 데모 사이트 — 섹션별 전체 캡처
 * 출력: images/portfolio-sections/{site-slug}/01-hero.webp …
 */
import puppeteer from 'puppeteer';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS_DIR = path.join(ROOT, 'portfolio', 'demos');
const OUT_ROOT = path.join(ROOT, 'images', 'portfolio-sections');

/** @type {{ slug: string; file: string; width: number; label: string }[]} */
const SITES = [
  { slug: 'sellervion', file: 'sellervion.html', width: 1440, label: '셀러비온' },
  { slug: 'susanfather', file: 'susanfather.html', width: 390, label: '수산아빠' },
  { slug: 'cafe-bloom', file: 'cafe-bloom.html', width: 1440, label: 'Cafe Bloom' },
];

const toFileUrl = (filePath) => `file:///${filePath.replace(/\\/g, '/')}`;

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'section';

/** 페이지에서 캡처할 섹션 요소 선별 */
const FIND_SECTIONS = () => {
  const extraSelectors = [
    '.marquee',
    '.sv-reward',
    '.sf-search-wrap',
    'button.sf-promo',
    'nav.sf-cats',
    'nav.sf-bottom',
    'p.sf-footer',
  ];

  const base = [
    ...document.querySelectorAll('header'),
    ...document.querySelectorAll('footer'),
    ...document.querySelectorAll('section'),
    ...document.querySelectorAll('body > nav'),
    ...extraSelectors.flatMap((sel) => [...document.querySelectorAll(sel)]),
  ];

  const visible = base.filter((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.height < 32 || rect.width < 50) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    return true;
  });

  // 중첩 제거 — 자식 섹션은 제외, 최상위 블록만
  const topLevel = visible.filter(
    (el) => !visible.some((other) => other !== el && other.contains(el))
  );

  topLevel.sort((a, b) => {
    if (a === b) return 0;
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  return topLevel.map((el, index) => {
    el.setAttribute('data-capture-id', String(index));
    const id = el.id || '';
    const cls = (typeof el.className === 'string' ? el.className : '')
      .split(/\s+/)
      .filter(Boolean)[0] || '';
    const tag = el.tagName.toLowerCase();
    const label = id || cls || tag;
    return { index, label, tag };
  });
};

await mkdir(OUT_ROOT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const summary = [];

for (const site of SITES) {
  const outDir = path.join(OUT_ROOT, site.slug);
  await mkdir(outDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width: site.width, height: 900, deviceScaleFactor: 2 });

  const demoPath = path.join(DEMOS_DIR, site.file);
  console.log(`\n[${site.label}] ${site.file} (${site.width}px)`);

  await page.goto(toFileUrl(demoPath), { waitUntil: 'networkidle2', timeout: 120000 });
  await page.evaluate(() => document.fonts?.ready);
  await new Promise((r) => setTimeout(r, 1200));

  const sections = await page.evaluate(FIND_SECTIONS);
  const captured = [];

  for (const sec of sections) {
    const handle = await page.$(`[data-capture-id="${sec.index}"]`);
    if (!handle) continue;

    const filename = `${String(sec.index + 1).padStart(2, '0')}-${slugify(sec.label)}.webp`;
    const outPath = path.join(outDir, filename);

    try {
      await handle.screenshot({ path: outPath, type: 'webp', quality: 90 });
      captured.push({ file: filename, label: sec.label, tag: sec.tag });
      console.log(`  ✓ ${filename}`);
    } catch (err) {
      console.error(`  ✗ ${filename}: ${err.message}`);
    }

    await handle.dispose();
  }

  const manifest = {
    site: site.label,
    slug: site.slug,
    viewportWidth: site.width,
    capturedAt: new Date().toISOString(),
    sections: captured,
  };

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  summary.push({ site: site.label, count: captured.length, folder: `images/portfolio-sections/${site.slug}` });

  await page.close();
}

await browser.close();

console.log('\n── 완료 ──');
for (const s of summary) {
  console.log(`${s.site}: ${s.count}개 → ${s.folder}/`);
}
