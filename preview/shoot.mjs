/**
 * Screenshots for the README and the case-study page, from the preview
 * (PREVIEW_NOW=2026-10-27T08:40 node preview/server.mjs, fresh start).
 *   node preview/shoot.mjs  →  docs/screenshots/*.png
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:9595';
const out = new URL('../docs/screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
// Pin the page clock to the server's Bali morning so the opening-hours bar agrees.
await page.evaluateOnNewDocument((t) => {
  const offset = t - Date.now();
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [RealDate.now() + offset])); }
    static now() { return RealDate.now() + offset; }
  };
}, Date.parse('2026-10-27T00:40:00Z'));
const tap = async (sel, i = 0) => {
  const el = (await page.$$(sel))[i];
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await el.click();
};
const shot = (name) => page.screenshot({ path: `${out}${name}.png` });

await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
await shot('home');
await page.evaluate(() => scrollTo(0, document.querySelector('#menu').offsetTop - 10));
await sleep(200);
await shot('menu');
await page.goto(`${BASE}/products/the-pagi-plate`, { waitUntil: 'networkidle0' });
await tap('input[value="Poached"]');
await tap('input[name="choice-add_protein"]', 1);
await tap('input[name="choice-add_greens"]', 0);
await page.evaluate(() => scrollTo(0, 0));
await sleep(200);
await shot('dish');
await page.click('.buy__btn');
await page.waitForSelector('#cart-drawer[open] .time');
await sleep(500);
await (await page.$$('#cart-drawer [data-day]'))[1].click();
await sleep(200);
await page.click('#cart-drawer .time:nth-child(7)'); // tomorrow 09:30
await sleep(400);
await shot('slots');
for (let i = 0; i < 2; i++) {
  await page.click('#cart-drawer .line [data-step="1"]');
  await sleep(500);
}
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' });
await shot('checkout-refused');
await page.evaluate(async () => {
  const s = await (await fetch('/apps/pagi/slots')).json();
  await fetch('/cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attributes: { pickup_slot: `${s.days[1].date}T11:00` } }) });
});
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' });
await Promise.all([page.waitForNavigation(), page.click('form button[type=submit]')]);
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('.panel .btn')]);
await page.evaluate(() => document.querySelector('#t1100').scrollIntoView({ block: 'start' }));
await page.evaluate(() => scrollBy(0, -300));
await sleep(200);
await shot('kitchen');
await page.goto(`${BASE}/pages/catering`, { waitUntil: 'networkidle0' });
await shot('catering');

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`${BASE}/id/`, { waitUntil: 'networkidle0' });
await shot('mobile-home-id');
await page.goto(`${BASE}/id/products/avo-smash`, { waitUntil: 'networkidle0' });
await shot('mobile-dish-id');
await page.evaluate(() => document.querySelector('.buy__btn').click());
await page.waitForSelector('#cart-drawer[open] .time');
await sleep(500);
await page.evaluate(() => document.activeElement?.blur());
await shot('mobile-slots-id');
await browser.close();
console.log(`screenshots → ${out}`);
