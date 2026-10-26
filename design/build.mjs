/**
 * Builds Pagi's images into design/out/ with headless Chrome:
 *   - menu, beans, hero and catering photos from design/photos/src/ (CC0, see credits.json),
 *     cropped to one shape and given one shared colour grade so they read as a single shoot
 *   - the gift card artwork, drawn here in the brand colours
 * Usage: node design/build.mjs
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = new URL('..', import.meta.url);
const src = fileURLToPath(new URL('design/photos/src/', root));
const out = fileURLToPath(new URL('design/out/', root));

/* name → [width, height, focal x, focal y]. Focal point is where the crop centres (0–1). */
const PHOTOS = {
  'plate-full': [1200, 900, 0.5, 0.55],
  'eggs-benedict': [1200, 900, 0.5, 0.5],
  platter: [1200, 900, 0.5, 0.5],
  pancakes: [1200, 900, 0.5, 0.56],
  'toast-avo': [1200, 900, 0.5, 0.5],
  'toast-salmon': [1200, 900, 0.55, 0.5],
  'toast-egg': [1200, 900, 0.5, 0.48],
  'bowl-pink': [1200, 900, 0.5, 0.45],
  'bowl-green': [1200, 900, 0.62, 0.5],
  'bowl-salad': [1200, 900, 0.5, 0.45],
  ciabatta: [1200, 900, 0.5, 0.5],
  'cup-flat-white': [1200, 900, 0.55, 0.5],
  'cup-matcha': [1200, 900, 0.5, 0.5],
  'cup-iced-latte': [1200, 900, 0.5, 0.55],
  'beans-kintamani': [1200, 900, 0.45, 0.5],
  'beans-bajawa': [1200, 900, 0.5, 0.55],
  catering: [1200, 900, 0.5, 0.5],
  hero: [900, 1200, 0.5, 0.5],
};
// One grade for every photo: a touch warmer and crisper, so different sources sit together.
const GRADE = 'saturate(1.06) contrast(1.04) brightness(1.02) sepia(0.06)';

const giftCard = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <rect width="1200" height="900" fill="#E9DDCB"/>
  <g transform="rotate(-5 600 450)">
    <rect x="236" y="214" width="728" height="460" rx="28" fill="#1F1B17" opacity=".18" transform="translate(10 22)"/>
    <rect x="236" y="214" width="728" height="460" rx="28" fill="#B5552F"/>
    <circle cx="880" cy="300" r="150" fill="#C8693F"/>
    <text x="292" y="318" font-family="Instrument Serif, Georgia, serif" font-size="96" fill="#F3EDE4">Pagi</text>
    <text x="294" y="360" font-family="Inter, system-ui, sans-serif" font-size="20" letter-spacing="6" fill="#F3EDE4" opacity=".85">PERERENAN · BALI</text>
    <text x="292" y="600" font-family="Instrument Serif, Georgia, serif" font-size="48" fill="#F3EDE4">Brunch is on us</text>
    <text x="294" y="638" font-family="Inter, system-ui, sans-serif" font-size="18" letter-spacing="5" fill="#F3EDE4" opacity=".8">GIFT CARD</text>
  </g>
</svg>`;

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(src).href);

for (const [name, [w, h, fx, fy]] of Object.entries(PHOTOS)) {
  const dataUrl = await page.evaluate(
    async ({ url, w, h, fx, fy, grade }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      // Cover crop around the focal point.
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = w / scale;
      const sh = h / scale;
      const sx = Math.min(Math.max(img.naturalWidth * fx - sw / 2, 0), img.naturalWidth - sw);
      const sy = Math.min(Math.max(img.naturalHeight * fy - sh / 2, 0), img.naturalHeight - sh);
      const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
      const ctx = c.getContext('2d');
      ctx.filter = grade;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.84);
    },
    { url: pathToFileURL(`${src}${name}.jpg`).href, w, h, fx, fy, grade: GRADE }
  );
  await writeFile(`${out}${name}.jpg`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  process.stdout.write('.');
}

// Gift card: rendered with the brand fonts from the theme.
const fonts = ['instrument-serif.woff2', 'inter-var.woff2'].map((f) => pathToFileURL(fileURLToPath(new URL(`theme/assets/${f}`, root))).href);
await page.setViewport({ width: 1200, height: 900 });
await page.setContent(`<!doctype html><style>
  @font-face { font-family: 'Instrument Serif'; src: url('${fonts[0]}') format('woff2'); }
  @font-face { font-family: Inter; src: url('${fonts[1]}') format('woff2'); font-weight: 100 900; }
  html, body { margin: 0 } svg { display: block }
</style>${giftCard()}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${out}gift-card.jpg`, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1200, height: 900 } });
await browser.close();
console.log(`\n${Object.keys(PHOTOS).length + 1} images → design/out/`);
