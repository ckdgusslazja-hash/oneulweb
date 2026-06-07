/**
 * 포트폴리오 데모 HTML → 썸네일 이미지 일괄 캡처
 * 출력: images/portfolio/{slug}.webp (1440×900, iframe과 동일 비율)
 */
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS_DIR = path.join(ROOT, 'portfolio', 'demos');
const OUT_DIR = path.join(ROOT, 'images', 'portfolio');

const WIDTH = 1440;
const HEIGHT = 900;

const toFileUrl = (filePath) => {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:///${normalized}`;
};

const files = (await readdir(DEMOS_DIR))
  .filter((f) => f.endsWith('.html'))
  .sort();

await mkdir(OUT_DIR, { recursive: true });

console.log(`캡처 대상: ${files.length}개 → ${OUT_DIR}\n`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

let ok = 0;
let fail = 0;

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const outPath = path.join(OUT_DIR, `${slug}.webp`);
  const demoPath = path.join(DEMOS_DIR, file);
  const url = toFileUrl(demoPath);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((r) => setTimeout(r, 800));

    await page.screenshot({
      path: outPath,
      type: 'webp',
      quality: 88,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    ok += 1;
    console.log(`✓ ${slug}.webp`);
  } catch (err) {
    fail += 1;
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

await browser.close();

console.log(`\n완료: ${ok} 성공, ${fail} 실패`);
