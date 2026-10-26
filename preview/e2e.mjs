/**
 * End-to-end checks against the Pagi preview (node preview/server.mjs, fresh start), or the
 * in-browser demo with BASE=https://…/store WARMUP=1.
 *   node preview/e2e.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://localhost:9595';
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
async function check(name, fn) {
  try {
    await Promise.race([fn(), new Promise((_, r) => setTimeout(() => r(new Error('timed out after 20s')), 20000))]);
    results.push(true);
    console.log(`✓ ${name}`);
  } catch (e) {
    results.push(false);
    console.log(`✗ ${name}\n    ${e.message}`);
  }
}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
if (process.env.WARMUP) {
  const warm = await browser.newPage();
  await warm.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  await warm.waitForFunction(() => navigator.serviceWorker?.controller && !document.title.startsWith('Opening'), { timeout: 30000 });
  await warm.close();
}
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => r.status() >= 400 && !r.url().includes('/apps/pagi/catering') && errors.push(`${r.status()} ${r.url()}`));
// Scroll to the middle first: the sticky "Add to order" bar can cover inputs near the bottom.
const tap = async (target) => {
  const el = typeof target === 'string' ? await page.$(target) : target;
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await el.click();
};
const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());
const api = (path, body) =>
  page.evaluate(
    async (p, b) => (await fetch(p, b ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) } : {})).json(),
    `${new URL(BASE).pathname.replace(/\/$/, '')}${path}`,
    body
  );
const tomorrowTab = async () => {
  await page.waitForSelector('#cart-drawer[open] [data-day]');
  await sleep(450); // the drawer slides in
  const days = await page.$$('#cart-drawer [data-day]');
  // "Tomorrow" is the second tab before 15:10 Bali time, the first after (today has no slots left).
  const labels = await Promise.all(days.map((d) => d.evaluate((el) => el.dataset.day)));
  const slots = await api('/apps/pagi/slots');
  const tomorrow = slots.days[1].date;
  await days[labels.indexOf(tomorrow)].click();
  return tomorrow;
};

await check('home: five categories and thirteen dishes priced in rupiah', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' });
  assert((await page.$$('.menu__tabs .chip')).length === 5, 'category tabs');
  const prices = await page.$$eval('.menu .dish .price', (els) => els.map((e) => e.textContent.trim()));
  assert(prices.length === 13, `dishes: ${prices.length}`);
  assert(prices.every((p) => /^Rp\d{2,3}\.000$/.test(p)), prices.join(','));
  // The logo goes to the store's home, also when the store lives under a path (GitHub Pages).
  const logo = await page.$eval('.header .wordmark', (a) => a.href);
  assert(new URL(logo).pathname === new URL(BASE).pathname.replace(/\/?$/, '/'), logo);
});

await check('language switch: Indonesian copy and dish names under /id/', async () => {
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#header-lang button[value="id"]')]);
  assert(new URL(page.url()).pathname.endsWith('/id'), page.url());
  assert((await text('.hero h1')) === 'Brunch, siap saat kamu datang', await text('.hero h1'));
  assert((await page.$$eval('.dish__title', (els) => els.map((e) => e.textContent.trim()))).includes('Piring Pagi'), 'no Piring Pagi');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#header-lang button[value="en"]')]);
});

await check('dish: add-ons update the total and each group caps its choices', async () => {
  await page.goto(`${BASE}/products/the-pagi-plate`, { waitUntil: 'networkidle0' });
  assert((await text('[data-total]')) === 'Rp125.000', await text('[data-total]'));
  await page.click('input[value="Poached"]');
  const protein = await page.$$('input[name="choice-add_protein"]');
  await tap(protein[1]); // bacon
  assert((await text('[data-total]')) === 'Rp150.000', await text('[data-total]'));
  await tap(protein[0]);
  await tap(protein[2]);
  assert(await protein[3].evaluate((i) => i.disabled), 'fourth protein still selectable');
});

await check('platter: three sides are required before it can be added', async () => {
  await page.goto(`${BASE}/products/build-your-platter`, { waitUntil: 'networkidle0' });
  const sides = await page.$$('input[name="choice-platter_sides"]');
  await tap(sides[0]);
  await page.click('.buy__btn');
  await sleep(200);
  assert(/Choose 3 for Pick three sides/.test(await text('[data-error]')), await text('[data-error]'));
  assert(!(await page.$('#cart-drawer[open]')), 'drawer opened anyway');
});

await check('cart: the dish line includes its add-ons (Cart Transform) and checkout waits for a time', async () => {
  await page.goto(`${BASE}/products/the-pagi-plate`, { waitUntil: 'networkidle0' });
  await tap('input[value="Poached"]');
  await tap((await page.$$('input[name="choice-add_protein"]'))[1]);
  await page.click('.buy__btn');
  await page.waitForSelector('#cart-drawer[open] .line');
  assert((await text('#cart-drawer .line__price')) === 'Rp150.000', await text('#cart-drawer .line__price'));
  const meta = await text('#cart-drawer .line__meta');
  assert(meta.includes('Eggs: Poached') && meta.includes('Add protein: Bacon') && !meta.includes('gid://'), meta);
  assert(await page.$eval('#cart-drawer [data-checkout]', (b) => b.disabled), 'checkout enabled without a time');
});

let chosen;
await check('slots: full times are disabled; choosing one saves it on the cart', async () => {
  const tomorrow = await tomorrowTab();
  const full = await page.$(`#cart-drawer [data-slot="${tomorrow}T09:00"]`);
  assert(await full.evaluate((b) => b.disabled && b.textContent.includes('Full')), '09:00 should be full');
  assert((await text(`#cart-drawer [data-slot="${tomorrow}T09:30"] small`)) === '2 left', 'low badge');
  chosen = `${tomorrow}T11:00`;
  await page.click(`#cart-drawer [data-slot="${chosen}"]`);
  await sleep(300);
  const cart = await api('/cart.js');
  assert(cart.attributes.pickup_slot === chosen && cart.attributes.fulfilment === 'pickup', JSON.stringify(cart.attributes));
  assert(!(await page.$eval('#cart-drawer [data-checkout]', (b) => b.disabled)), 'checkout still disabled');
});

await check('checkout: the Validation refuses a slot outside kitchen hours', async () => {
  await api('/cart/update.js', { attributes: { pickup_slot: `${chosen.slice(0, 10)}T06:00` } });
  await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' });
  assert(/08:00–15:30/.test(await text('.err')), await text('.panel'));
  await api('/cart/update.js', { attributes: { pickup_slot: chosen } });
});

await check('checkout: placing the order puts it on the kitchen board and uses slot capacity', async () => {
  const before = (await api('/apps/pagi/slots')).days.flatMap((d) => d.slots).find((s) => s.slot === chosen).left;
  await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' });
  assert(!(await page.$('.err')), 'unexpected checkout error');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('form button[type=submit]')]);
  assert(/Order #1001 placed/.test(await text('h1')), await text('h1'));
  const after = (await api('/apps/pagi/slots')).days.flatMap((d) => d.slots).find((s) => s.slot === chosen).left;
  assert(after === before - 1, `left ${before} → ${after}`);
  await page.goto(`${BASE}/kitchen?date=${chosen.slice(0, 10)}`, { waitUntil: 'networkidle0' });
  const board = await page.$eval('main', (m) => m.textContent);
  assert(board.includes('#1001') && board.includes('Eggs: Poached') && board.includes('Add protein: Bacon'), 'order not on board');
});

await check('checkout: an order bigger than what the slot has left is refused', async () => {
  await page.goto(`${BASE}/collections/drinks`, { waitUntil: 'networkidle0' });
  for (let i = 0; i < 3; i++) {
    await tap('quick-add button');
    await page.waitForSelector('#cart-drawer[open]');
    await sleep(450); // let the drawer finish sliding in
    await page.click('#cart-drawer [data-close-dialog]');
    await sleep(150);
  }
  const tomorrow = (await api('/apps/pagi/slots')).days[1].date;
  await api('/cart/update.js', { attributes: { fulfilment: 'pickup', pickup_slot: `${tomorrow}T09:30` } });
  await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0' });
  assert(/Only 2 more dishes fit in the 09:30 slot/.test(await text('.err')), await text('.panel'));
});

await check('beans only: no time needed, checkout open straight away', async () => {
  await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle0' });
  while (await page.$('.cart-page__body [data-remove]')) {
    await page.click('.cart-page__body [data-remove]');
    await sleep(300);
  }
  await page.goto(`${BASE}/products/kintamani-house-blend`, { waitUntil: 'networkidle0' });
  await page.click('.buy__btn');
  await page.waitForSelector('#cart-drawer[open] .line');
  assert(!(await page.$('#cart-drawer fulfilment-picker')), 'slot picker shown for beans');
  assert(!(await page.$eval('#cart-drawer [data-checkout]', (b) => b.disabled)), 'checkout disabled');
});

await check('catering: field errors from the backend, then a reference', async () => {
  await page.goto(`${BASE}/pages/catering`, { waitUntil: 'networkidle0' });
  await page.click('catering-form [type=submit]');
  await page.waitForFunction(() => document.querySelector('[data-err="name"]').textContent.length > 0);
  assert((await text('[data-err="email"]')).length > 0, 'no email error');
  await page.type('[name=name]', 'Maya');
  await page.type('[name=email]', 'maya@villa.example');
  const date = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  await page.$eval('[name=date]', (el, d) => (el.value = d), date);
  await page.$eval('[name=guests]', (el) => (el.value = '24'));
  await page.click('catering-form [type=submit]');
  await page.waitForSelector('[data-done]:not([hidden])');
  assert(/C-0001/.test(await text('[data-done]')), await text('[data-done]'));
});

await check('no script errors or failed requests', async () => {
  assert(!errors.length, errors.join('\n'));
});

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exitCode = passed === results.length ? 0 : 1;
