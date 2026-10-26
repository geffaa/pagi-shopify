/**
 * Scripted demo recording of the Pagi storefront (via the offline preview).
 *   PREVIEW_NOW=2026-10-27T08:40 node preview/server.mjs &   then   node demo/record.mjs
 * Output: demo/out/pagi-demo.mp4
 *
 * Scenes are recorded with Puppeteer's screencast (needs ffmpeg), then joined and encoded to
 * H.264. The page clock is pinned to the same Bali morning as the preview server.
 */
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:9595';
const OUT = new URL('./out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const NOW = Date.parse('2026-10-27T00:40:00Z'); // 08:40 in Bali

const W = 1440;
const H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  defaultViewport: null,
  args: [`--window-size=${W},${H}`, '--hide-scrollbars'],
});

/* ---------- overlay helpers (cursor + caption), injected on every page ---------- */

const OVERLAY = `
  (() => {
    if (window.__demo) return;
    window.__demo = true;
    const css = document.createElement('style');
    css.textContent = \`
      #demo-cursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; margin: -3px 0 0 -3px; pointer-events: none;
        transition: transform 60ms linear; }
      #demo-cursor.down { transform: scale(.82); }
      #demo-cap { position: fixed; z-index: 2147483646; left: 50%; bottom: 28px; transform: translate(-50%, 12px); opacity: 0;
        background: #1F1B17; color: #F3EDE4; font: 500 15px/1.35 Inter, system-ui, sans-serif; border-radius: 999px;
        letter-spacing: .01em; padding: 12px 18px 11px; max-width: 760px; text-align: center; pointer-events: none;
        transition: opacity 240ms ease, transform 240ms ease; box-shadow: 0 0 0 1px rgba(238,235,228,.12); }
      #demo-cap.on { opacity: 1; transform: translate(-50%, 0); }
      #demo-cap b { color: #E89A72; font-weight: 600; }
    \`;
    const add = () => {
      document.head.appendChild(css);
      const c = document.createElement('div');
      c.id = 'demo-cursor';
      c.innerHTML = '<svg viewBox="0 0 22 22" width="22" height="22"><path d="M3 2l15 9-7 1.6L7.5 20z" fill="#1F1B17" stroke="#F3EDE4" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      const cap = document.createElement('div');
      cap.id = 'demo-cap';
      document.body.append(c, cap);
      const pos = JSON.parse(sessionStorage.getItem('demo-pos') || '[720,450]');
      c.style.left = pos[0] + 'px'; c.style.top = pos[1] + 'px';
      addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; sessionStorage.setItem('demo-pos', JSON.stringify([e.clientX, e.clientY])); }, true);
      addEventListener('mousedown', () => c.classList.add('down'), true);
      addEventListener('mouseup', () => c.classList.remove('down'), true);
      // keep overlay above open <dialog>s (top layer): re-parent into the open dialog
      new MutationObserver(() => {
        const d = [...document.querySelectorAll('dialog[open]')].pop();
        const host = d || document.body;
        if (c.parentNode !== host) host.append(c, cap);
      }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open'] });
    };
    if (document.body) add(); else addEventListener('DOMContentLoaded', add);
  })();
`;

async function newPage(viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(OVERLAY);
  // Same clock as the preview server, so the opening-hours bar agrees with the slots.
  await page.evaluateOnNewDocument((t) => {
    const offset = t - Date.now();
    const RealDate = Date;
    globalThis.Date = class extends RealDate {
      constructor(...a) { super(...(a.length ? a : [RealDate.now() + offset])); }
      static now() { return RealDate.now() + offset; }
    };
  }, NOW);
  return page;
}

async function caption(page, html, hold = 0) {
  await page.evaluate((h) => {
    const cap = document.getElementById('demo-cap');
    if (!cap) return;
    if (!h) return cap.classList.remove('on');
    cap.innerHTML = h;
    cap.classList.add('on');
  }, html);
  if (hold) await sleep(hold);
}

let mouse = { x: 720, y: 450 };
async function moveTo(page, x, y, steps = 28) {
  const from = { ...mouse };
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease in-out
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await sleep(12);
  }
  mouse = { x, y };
}

async function center(page, selector, index = 0) {
  // Bring off-screen targets into view first, the way a person would scroll to them.
  const moved = await page.evaluate(
    (s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return false;
      const r = el.getBoundingClientRect();
      // Reachable = on screen and clear of the sticky add-to-order bar at the bottom.
      if (r.top >= 80 && r.top + Math.min(r.height, 60) <= innerHeight - 140) return false;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return true;
    },
    selector,
    index
  );
  if (moved) await sleep(700);
  const box = await page.evaluate(
    (s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    selector,
    index
  );
  if (!box) throw new Error(`not found: ${selector}[${index}]`);
  return box;
}

async function clickOn(page, selector, index = 0, { pause = 250 } = {}) {
  const { x, y } = await center(page, selector, index);
  await moveTo(page, x, y);
  await sleep(pause);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
}

async function hoverOn(page, selector, index = 0) {
  const { x, y } = await center(page, selector, index);
  await moveTo(page, x, y);
}

/** Smooth scroll to an absolute Y (or element top minus offset). */
async function scrollTo(page, target, { offset = 0, duration = 1200 } = {}) {
  await page.evaluate(
    async (target, offset, duration) => {
      const y = typeof target === 'number' ? target : document.querySelector(target).getBoundingClientRect().top + scrollY - offset;
      const start = scrollY;
      const t0 = performance.now();
      await new Promise((done) => {
        const step = (now) => {
          const t = Math.min(1, (now - t0) / duration);
          const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
          scrollTo(0, start + (y - start) * e);
          t < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
    },
    target,
    offset,
    duration
  );
  await sleep(150);
}

async function typeSlow(page, selector, text) {
  await page.focus(selector);
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(85);
  }
}

async function slide(page, html) {
  await page.setContent(
    `<!doctype html><html><head><style>
      @font-face { font-family: 'Instrument Serif'; src: url('${BASE}/assets/instrument-serif.woff2') format('woff2'); } @font-face { font-family: Inter; src: url('${BASE}/assets/inter-var.woff2') format('woff2'); font-weight: 100 900; }
      html, body { margin: 0; height: 100%; background: #F3EDE4; color: #1F1B17; font-family: Inter, system-ui, sans-serif; }
      .s { height: 100%; box-sizing: border-box; padding: 64px 80px; display: grid; }
      .lab { font-weight: 500; font-size: 16px; color: #6B6158; }
      h1 { font-family: 'Instrument Serif', serif; font-size: 170px; line-height: .9; font-weight: 400; letter-spacing: -.02em; margin: 0; }
      h2 { font-family: 'Instrument Serif', serif; font-size: 76px; line-height: 1; font-weight: 400; letter-spacing: -.01em; margin: 0; }
      .dots { display: flex; gap: 14px; }
      .dots i { width: 64px; height: 64px; border-radius: 50%; display: block; box-shadow: inset -8px -8px 0 rgba(0,0,0,.1); }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
      .card { border-radius: 22px; padding: 24px; background: #FBF8F3; border: 1px solid #E2D8CA; }
      .num { font-family: 'Instrument Serif', serif; font-size: 64px; font-weight: 400; line-height: 1; }
      pre { font: 500 14px/1.6 ui-monospace, Menlo, monospace; background: #1F1B17; color: #F3EDE4; padding: 20px 24px; margin: 0; border-radius: 24px; }
      .ok { color: #9BC79A } .k { color: #E89A72 }
    </style></head><body>${html}</body></html>`,
    { waitUntil: 'load' }
  );
  await page.evaluate(() => document.fonts.ready);
}

/* ---------------------------------------------------------------------- */

const clips = [];

/** Static slides: screenshot → looped clip. Deterministic, unlike screencasting a page that doesn't repaint. */
async function still(name, page, html, seconds) {
  await page.bringToFront();
  await slide(page, html);
  await sleep(300);
  const path = `${OUT}${name}.png`;
  await page.screenshot({ path });
  clips.push({ path, seconds });
  console.log(`✓ ${name}`);
}

async function record(name, page, fn) {
  const path = `${OUT}${name}.webm`;
  await page.bringToFront(); // background tabs stop painting, which stalls the screencast
  const rec = await page.screencast({ path });
  try {
    await fn();
  } finally {
    await rec.stop();
  }
  clips.push({ path });
  console.log(`✓ ${name}`);
}

const desktop = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle0' });

await still(
  '01-title',
  desktop,
  `<div class="s" style="align-content:space-between">
    <div class="lab" style="display:flex;justify-content:space-between"><span>Portfolio · Shopify developer</span><span>Yodhimas Geffananda</span></div>
    <div style="display:grid;gap:28px">
      <p class="lab" style="color:#B5552F;letter-spacing:.14em;text-transform:uppercase;font-weight:600">Pererenan, Bali</p>
      <h1>Pagi</h1>
      <p style="font-size:30px;font-weight:600;margin:0;max-width:32ch">Order-ahead pickup and delivery for a brunch café, without a delivery app's commission.</p>
    </div>
    <div class="lab" style="display:flex;gap:28px;flex-wrap:wrap"><span>Cart Transform Function</span><span>Checkout Validation Function</span><span>App proxy + webhooks</span><span>EN / ID</span><span>Liquid · vanilla JS</span></div>
  </div>`,
  3.6
);

await record('02-home', desktop, async () => {
  await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await sleep(400);
  await caption(desktop, 'A fictional café in Pererenan, Bali. Customers order ahead and skip the queue.', 2600);
  await scrollTo(desktop, '#menu', { offset: 10, duration: 1400 });
  await caption(desktop, 'Menu categories are ordinary collections; diet badges come from a metafield.');
  await hoverOn(desktop, '.dish', 0);
  await sleep(700);
  await hoverOn(desktop, '.dish', 2);
  await sleep(1300);
  await caption(desktop, '');
});

await record('03-dish', desktop, async () => {
  await desktop.goto(`${BASE}/products/the-pagi-plate`, { waitUntil: 'networkidle0' });
  await caption(desktop, 'Choice groups come from the dish’s metafield: required picks, limits, paid add-ons.');
  await sleep(1000);
  await clickOn(desktop, 'input[value="Poached"]');
  await sleep(500);
  await clickOn(desktop, 'input[name="choice-add_protein"]', 1);
  await sleep(500);
  await clickOn(desktop, 'input[name="choice-add_greens"]', 0);
  await sleep(600);
  await caption(desktop, 'Add-ons are hidden products. A <b>Cart Transform Function</b> attaches them to the dish line.');
  await hoverOn(desktop, '.buy__btn');
  await sleep(1500);
  await clickOn(desktop, '.buy__btn');
  await sleep(1400);
  await caption(desktop, 'One line in the cart, priced with its add-ons: Rp125.000 + bacon + avocado.', 2400);
  await caption(desktop, '');
});

await record('04-slot', desktop, async () => {
  await caption(desktop, 'Pickup or delivery, then a time. Every 15 minutes, 12 dishes each: the kitchen’s real limit.');
  await clickOn(desktop, '#cart-drawer .seg__opt', 1);
  await sleep(900);
  await clickOn(desktop, '#cart-drawer .seg__opt', 0);
  await sleep(500);
  await clickOn(desktop, '#cart-drawer [data-day]', 1);
  await sleep(700);
  await caption(desktop, 'Times come live from the backend through the app proxy. Full ones are disabled.');
  await hoverOn(desktop, '#cart-drawer .time', 4);
  await sleep(1100);
  await clickOn(desktop, '#cart-drawer .time', 6); // 09:30, two dishes left
  await sleep(500);
  await clickOn(desktop, '#cart-drawer .line [data-step="1"]');
  await sleep(1200);
  await clickOn(desktop, '#cart-drawer .line [data-step="1"]');
  await sleep(1400);
  await caption(desktop, 'Three plates for a slot with two left. Checkout will catch that.', 1600);
});

await record('05-checkout', desktop, async () => {
  await clickOn(desktop, '#cart-drawer [data-checkout]');
  await desktop.waitForSelector('.panel');
  await caption(desktop, 'A <b>Checkout Validation Function</b> refuses slots that are closed, full or too small.');
  await sleep(2800);
  await clickOn(desktop, '.btn--ghost');
  await desktop.waitForSelector('cart-items');
  await sleep(700);
  const t = await desktop.$$eval('.cart-page__body .time', (els) => els.findIndex((e) => e.textContent.includes('11:00')));
  await clickOn(desktop, '.cart-page__body .time', t);
  await sleep(1000);
  await clickOn(desktop, '.cart-page__body [data-checkout]');
  await desktop.waitForSelector('.panel form');
  await caption(desktop, '11:00 has room, so the order goes through.');
  await sleep(1200);
  await clickOn(desktop, '.panel form button');
  await sleep(1600);
  await caption(desktop, '');
});

await record('06-kitchen', desktop, async () => {
  await clickOn(desktop, '.panel .btn');
  await desktop.waitForSelector('main');
  await caption(desktop, 'The kitchen board in the ops backend: orders by slot, from the orders webhook.');
  await scrollTo(desktop, 0, { duration: 200 });
  await sleep(900);
  const idx = await desktop.$$eval('.slot h2', (els) => els.findIndex((e) => e.textContent.trim().startsWith('11:00')));
  await scrollTo(desktop, `.slot:nth-of-type(${idx + 1})`, { offset: 120, duration: 1800 });
  await caption(desktop, 'Each ticket carries the choices and the note. Staff mark it ready or pause a slot.');
  await sleep(900);
  await Promise.all([desktop.waitForNavigation({ waitUntil: 'networkidle0' }), clickOn(desktop, 'form[action*="orders/1001/"] button')]);
  // The screencast only gets frames on repaint: move and caption so the reloaded board shows.
  await caption(desktop, 'Ready. The board comes back to the same slot.');
  await hoverOn(desktop, '.card.ready');
  await sleep(2200);
  await caption(desktop, '');
});

await record('07-id-catering', desktop, async () => {
  await desktop.goto(`${BASE}/pages/catering`, { waitUntil: 'networkidle0' });
  await caption(desktop, 'Catering requests become <b>draft orders</b> the team prices and invoices from Shopify admin.');
  await sleep(800);
  await clickOn(desktop, 'catering-form [name=package]', 2);
  await sleep(400);
  await clickOn(desktop, '[name=guests]');
  await desktop.$eval('[name=guests]', (el) => el.select());
  await typeSlow(desktop, '[name=guests]', '30');
  await sleep(1400);
  await caption(desktop, 'Bahasa Indonesia for local guests: theme strings, products and section copy.');
  await Promise.all([desktop.waitForNavigation({ waitUntil: 'networkidle0' }), clickOn(desktop, '#header-lang button[value="id"]')]);
  await sleep(2600);
  await caption(desktop, '');
});

const phoneHost = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await phoneHost.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
await phoneHost.setContent(
  `<!doctype html><html><head><style>
    @font-face { font-family: 'Instrument Serif'; src: url('${BASE}/assets/instrument-serif.woff2') format('woff2'); } @font-face { font-family: Inter; src: url('${BASE}/assets/inter-var.woff2') format('woff2'); font-weight: 100 900; }
    html,body{margin:0;height:100%;background:#B5552F;font-family:Inter,system-ui,sans-serif;color:#F3EDE4}
    .wrap{height:100%;display:grid;grid-template-columns:1fr 430px 1fr;align-items:center}
    .phone{width:390px;height:780px;border:12px solid #1F1B17;border-radius:46px;overflow:hidden;background:#F3EDE4;justify-self:center}
    iframe{width:390px;height:780px;border:0;display:block}
    .copy{padding:0 56px}
    h2{font-family:'Instrument Serif',serif;font-size:64px;line-height:.95;font-weight:400;letter-spacing:-.01em;margin:0 0 18px}
    p{font-size:19px;line-height:1.45;max-width:28ch}
  </style></head><body><div class="wrap">
    <div class="copy"><h2>Ordered from a sunbed</h2><p>Most orders come from phones. The slot picker is a grid of big buttons, and the add button stays in reach.</p></div>
    <div class="phone"><iframe src="${BASE}/products/avo-smash"></iframe></div>
    <div class="copy"><h2 style="font-size:46px">No app,<br>no commission</h2><p>Orders, payments and payouts stay in Shopify.</p></div>
  </div></body></html>`,
  { waitUntil: 'load' }
);
await phoneHost.evaluate(() => document.fonts.ready);
await sleep(1500);
const frame = () => phoneHost.frames().find((f) => f.url().includes('/products/'));
await record('08-mobile', phoneHost, async () => {
  await sleep(700);
  const protein = await frame().$$('input[name="choice-add_protein"]');
  await protein[0].evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await sleep(700);
  await protein[0].evaluate((b) => b.click());
  await sleep(700);
  await frame().$eval('.buy__btn', (b) => b.click());
  await sleep(1500);
  const times = await frame().$$('#cart-drawer .time:not([disabled])');
  await times[3].evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await sleep(800);
  await times[3].evaluate((b) => b.click());
  await sleep(1800);
});

const outro = await newPage({ width: W, height: H, deviceScaleFactor: 1 });
await outro.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
await still(
  '09-outro',
  outro,
  `<div class="s" style="grid-template-rows:auto auto 1fr auto;gap:30px">
    <div class="lab">Behind the storefront</div>
    <h2>Rules enforced at checkout,<br>tested outside the store</h2>
    <pre><span style="color:#B8A898">$ npm test</span>

<span class="ok">✓</span> lines with valid add-ons expand into the dish plus its add-ons
<span class="ok">✓</span> an order bigger than what is left in the slot is blocked with the number left
<span class="ok">✓</span> a slot the backend marked closed (passed or full) is blocked
<span class="ok">✓</span> an order uses slot capacity, publishes the state once, and redelivery changes nothing
<span class="ok">✓</span> catering requests are checked, stored and turned into a draft order
<span class="ok">✓</span> customer redaction removes personal details but keeps slot counts

<span class="k">39/39 passed</span>   ·   e2e <span class="k">12/12 passed</span></pre>
    <div class="grid">
      <div class="card"><div class="num">2</div><div class="lab">Shopify Functions</div></div>
      <div class="card"><div class="num">39</div><div class="lab">Unit tests</div></div>
      <div class="card"><div class="num">12/12</div><div class="lab">End-to-end checks</div></div>
      <div class="card"><div class="num">0</div><div class="lab">Theme Check offenses</div></div>
    </div>
  </div>`,
  6
);

await browser.close();

/* ---------- join + encode ---------- */
const parts = clips.flatMap((c) => (c.seconds ? ['-loop', '1', '-framerate', '30', '-t', String(c.seconds), '-i', c.path] : ['-i', c.path]));
const filter =
  clips.map((_, i) => `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x131312,fps=30,setsar=1[v${i}]`).join(';') +
  ';' +
  clips.map((_, i) => `[v${i}]`).join('') +
  `concat=n=${clips.length}:v=1:a=0[out]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...parts, '-filter_complex', filter, '-map', '[out]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}pagi-demo.mp4`]);
console.log(`→ ${OUT}pagi-demo.mp4`);
