import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';
import { createQueue } from '../src/queue.js';
import { createSlotSync } from '../src/state.js';
import { kitchenOrder } from '../src/orders.js';
import { config as real } from '../src/config.js';

const SECRET = 'shpss_test';
const silent = { info() {}, warn() {}, error() {} };

function setup({ now = '2026-10-27T09:05', password } = {}) {
  const db = openDb(':memory:');
  const queue = createQueue({ baseDelayMs: 1, log: silent });
  const writes = [];
  const calls = [];
  const admin = {
    async graphql(query, variables) {
      calls.push({ query, variables });
      if (query.includes('shop { id }')) return { shop: { id: 'gid://shopify/Shop/1' } };
      if (query.includes('metafieldsSet')) {
        writes.push(JSON.parse(variables.metafields[0].value));
        return { metafieldsSet: { userErrors: [] } };
      }
      if (query.includes('draftOrderCreate')) return { draftOrderCreate: { draftOrder: { id: 'gid://shopify/DraftOrder/9', name: '#D9' }, userErrors: [] } };
      return { tagsAdd: { userErrors: [] } };
    },
    assertNoUserErrors: (p) => p,
  };
  const config = { ...real, clientSecret: SECRET, kitchenPassword: password };
  const clock = { now };
  const sync = createSlotSync({ db, admin, config, now: () => clock.now, log: silent });
  const app = createApp({ config, db, queue, admin, sync, log: silent });
  return { app, db, queue, writes, calls, clock, sync };
}

let n = 0;
async function webhook(app, topic, payload, { secret = SECRET, id = `w${++n}` } = {}) {
  const body = JSON.stringify(payload);
  return app.request('/webhooks', {
    method: 'POST',
    body,
    headers: {
      'x-shopify-topic': topic,
      'x-shopify-webhook-id': id,
      'x-shopify-hmac-sha256': createHmac('sha256', secret).update(body).digest('base64'),
    },
  });
}

function proxied(path, params = {}) {
  const p = new URLSearchParams({ shop: 'pagi-dev.myshopify.com', path_prefix: '/apps/pagi', timestamp: String(Math.floor(Date.now() / 1000)), ...params });
  const msg = [...p.keys()].sort().map((k) => `${k}=${p.get(k)}`).join('');
  p.set('signature', createHmac('sha256', SECRET).update(msg).digest('hex'));
  return `${path}?${p}`;
}

const order = (over = {}) => ({
  id: 5001,
  name: '#1001',
  email: 'ana@example.com',
  customer: { first_name: 'Ana', last_name: 'Putri' },
  note_attributes: [
    { name: 'fulfilment', value: 'pickup' },
    { name: 'pickup_slot', value: '2026-10-27T10:00' },
  ],
  line_items: [
    { sku: 'MENU-PAGI-PLATE', title: 'The Pagi Plate', quantity: 2, properties: [{ name: 'Eggs', value: 'Poached' }, { name: '_mods', value: 'gid://x/1' }, { name: 'Add-ons', value: 'Extra bacon' }] },
    { sku: 'ADD-BACON', title: 'Extra bacon', quantity: 2, properties: [] },
    { sku: 'BEAN-KIN-250', title: 'Kintamani house blend', quantity: 1, properties: [] },
  ],
  ...over,
});

test('an order webhook becomes kitchen tickets: dishes only, choices kept, private props hidden', () => {
  const o = kitchenOrder(order());
  assert.equal(o.dishes, 2);
  assert.equal(o.slot, '2026-10-27T10:00');
  assert.deepEqual(o.items, [{ title: 'The Pagi Plate', quantity: 2, notes: ['Eggs: Poached', 'Add-ons: Extra bacon'] }]);
  assert.equal(kitchenOrder(order({ line_items: [{ sku: 'BEAN-KIN-250', quantity: 1 }] })), null);
  assert.equal(kitchenOrder(order({ note_attributes: [] })), null);
});

test('webhooks need a valid HMAC', async () => {
  const { app } = setup();
  assert.equal((await webhook(app, 'orders/create', order(), { secret: 'wrong' })).status, 401);
});

test('an order uses slot capacity, publishes the state once, and redelivery changes nothing', async () => {
  const { app, db, queue, writes, calls } = setup();
  await webhook(app, 'orders/create', order(), { id: 'same' });
  await webhook(app, 'orders/create', order(), { id: 'same' });
  await webhook(app, 'orders/create', order(), { id: 'other-id-same-order' });
  await queue.idle();
  assert.deepEqual(db.usedFrom('2026-10-27'), { '2026-10-27T10:00': 2 });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].used['2026-10-27T10:00'], 2);
  assert.ok(writes[0].closed.includes('2026-10-27T09:15')); // already passed at 09:05 + 20 min lead
  const tags = calls.filter((c) => c.query.includes('tagsAdd'));
  assert.deepEqual(tags[0].variables.tags, ['slot:2026-10-27T10:00', 'pickup']);
});

test('a full slot is published as closed, and cancelling frees it again', async () => {
  const { app, queue, writes } = setup();
  await webhook(app, 'orders/create', order({ id: 1, line_items: [{ sku: 'MENU-BOWL', title: 'Bowl', quantity: 12 }] }));
  await queue.idle();
  assert.ok(writes.at(-1).closed.includes('2026-10-27T10:00'));
  await webhook(app, 'orders/cancelled', { id: 1 });
  await queue.idle();
  assert.ok(!writes.at(-1).closed.includes('2026-10-27T10:00'));
  assert.equal(writes.at(-1).used['2026-10-27T10:00'], undefined);
});

test('time passing closes slots; the sync writes only when something changed', async () => {
  const { sync, writes, clock } = setup();
  await sync.sync();
  await sync.sync();
  assert.equal(writes.length, 1);
  clock.now = '2026-10-27T09:20';
  await sync.sync();
  assert.equal(writes.length, 2);
  assert.ok(writes[1].closed.includes('2026-10-27T09:30'));
});

test('the slots proxy needs a Shopify signature and returns the window', async () => {
  const { app } = setup();
  assert.equal((await app.request('/proxy/slots?shop=x&signature=00')).status, 401);
  const res = await app.request(proxied('/proxy/slots'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.earliest, '2026-10-27T09:25');
  assert.equal(body.days.length, 3);
  assert.equal(body.days[0].slots.find((s) => s.time === '09:30').open, true);
});

test('catering requests are checked, stored and turned into a draft order', async () => {
  const { app, calls } = setup();
  const bad = await app.request(proxied('/proxy/catering'), { method: 'POST', body: JSON.stringify({ name: '', email: 'x', date: '2026-10-28', guests: 4, package: 'nope' }) });
  assert.equal(bad.status, 422);
  assert.deepEqual(Object.keys((await bad.json()).errors).sort(), ['date', 'email', 'guests', 'name', 'package']);

  const res = await app.request(proxied('/proxy/catering'), {
    method: 'POST',
    body: JSON.stringify({ name: 'Maya', email: 'Maya@Villa.example', date: '2026-11-05', guests: 24, package: 'brunch-board', notes: 'Two vegans' }),
  });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).reference, 'C-0001');
  const input = calls.find((c) => c.query.includes('draftOrderCreate')).variables.input;
  assert.equal(input.email, 'maya@villa.example');
  assert.equal(input.lineItems[0].quantity, 24);
  assert.equal(input.lineItems[0].originalUnitPriceWithCurrency.amount, '145000');
  assert.match(input.note, /Two vegans/);
});

test('the kitchen board groups by slot, flags over-capacity and moves tickets along', async () => {
  const { app, db, queue } = setup({ password: 'pass' });
  assert.equal((await app.request('/kitchen')).status, 401);
  const auth = { Authorization: `Basic ${btoa('kitchen:pass')}` };
  await webhook(app, 'orders/create', order());
  await webhook(app, 'orders/create', order({ id: 5002, name: '#1002', line_items: [{ sku: 'MENU-BOWL', title: 'Sunrise bowl', quantity: 11 }] }));
  await queue.idle();
  const html = await (await app.request('/kitchen?date=2026-10-27', { headers: auth })).text();
  assert.match(html, /10:00 <span>13\/12 dishes · over capacity/);
  assert.match(html, /Eggs: Poached · Add-ons: Extra bacon/);
  assert.doesNotMatch(html, /_mods/);
  const ready = await app.request('/kitchen/orders/5001/ready?date=2026-10-27', { method: 'POST', headers: auth });
  assert.equal(ready.status, 303);
  assert.match(ready.headers.get('location'), /^\/kitchen\?date=2026-10-27#t1000$/); // back to the same slot
  assert.equal(db.order('5001').status, 'ready');
});

test('pausing a slot closes it for checkout', async () => {
  const { app, writes } = setup();
  await app.request('/kitchen/slots/2026-10-27T12:00/pause', { method: 'POST' });
  assert.ok(writes.at(-1).closed.includes('2026-10-27T12:00'));
  await app.request('/kitchen/slots/2026-10-27T12:00/pause', { method: 'POST' });
  assert.ok(!writes.at(-1).closed.includes('2026-10-27T12:00'));
});

test('customer redaction removes personal details but keeps slot counts', async () => {
  const { app, db, queue } = setup();
  await webhook(app, 'orders/create', order());
  await webhook(app, 'customers/redact', { customer: { email: 'ana@example.com' } });
  await queue.idle();
  assert.equal(db.order('5001').customer, 'redacted');
  assert.equal(db.order('5001').email, null);
  assert.deepEqual(db.usedFrom('2026-10-27'), { '2026-10-27T10:00': 2 });
});
