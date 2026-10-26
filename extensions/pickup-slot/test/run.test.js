import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartValidationsGenerateRun as run } from '../src/cart_validations_generate_run.js';

const V = (n) => `gid://shopify/ProductVariant/${n}`;
const modifiers = { value: JSON.stringify({ groups: [{ key: 'add_protein', max: 2, addons: [V(11)] }] }) };
const dish = (quantity = 1, mods = null) => ({
  quantity,
  mods: mods ? { value: mods } : null,
  merchandise: { __typename: 'ProductVariant', product: { title: 'Avo Smash', productType: 'Menu', modifiers } },
});
const beans = { quantity: 1, mods: null, merchandise: { __typename: 'ProductVariant', product: { title: 'Beans', productType: 'Coffee beans', modifiers: null } } };
const input = (lines, { fulfilment = 'pickup', slot = '2026-10-27T09:15', today = '2026-10-27', state, config } = {}) => ({
  cart: { fulfilment: fulfilment ? { value: fulfilment } : null, slot: slot ? { value: slot } : null, lines },
  shop: { localTime: { date: today }, slotState: state ? { value: JSON.stringify(state) } : null },
  validation: { config: config ? { value: JSON.stringify(config) } : null },
});
const messages = (out) => out.operations.flatMap((o) => o.validationAdd.errors.map((e) => e.message));

test('a valid pickup slot passes', () => {
  assert.deepEqual(run(input([dish(2)])), { operations: [] });
});

test('beans and gift cards need no slot', () => {
  assert.deepEqual(run(input([beans], { fulfilment: null, slot: null })), { operations: [] });
});

test('food without pickup or delivery is blocked', () => {
  assert.match(messages(run(input([dish()], { fulfilment: null })))[0], /pickup or delivery/);
});

test('food without a time is blocked, with the method in the message', () => {
  assert.match(messages(run(input([dish()], { fulfilment: 'delivery', slot: null })))[0], /delivery time/);
});

test('past days and days too far ahead are blocked', () => {
  assert.match(messages(run(input([dish()], { slot: '2026-10-26T09:15' })))[0], /passed/);
  assert.match(messages(run(input([dish()], { slot: '2026-10-30T09:15' })))[0], /2 days ahead/);
});

test('times outside the kitchen hours or off the 15-minute grid are blocked', () => {
  for (const slot of ['2026-10-27T07:45', '2026-10-27T15:45', '2026-10-27T09:10']) {
    assert.match(messages(run(input([dish()], { slot })))[0], /08:00–15:30/, slot);
  }
});

test('a slot the backend marked closed (passed or full) is blocked', () => {
  const out = run(input([dish()], { state: { closed: ['2026-10-27T09:15'] } }));
  assert.match(messages(out)[0], /09:15 is no longer available/);
});

test('an order bigger than what is left in the slot is blocked with the number left', () => {
  const state = { used: { '2026-10-27T09:15': 9 } };
  assert.deepEqual(run(input([dish(3)], { state })), { operations: [] });
  assert.match(messages(run(input([dish(4)], { state })))[0], /Only 3 more dishes/);
  assert.match(messages(run(input([dish(1)], { state: { used: { '2026-10-27T09:15': 12 } } })))[0], /09:15 is full/);
});

test('an add-on the dish does not offer blocks checkout', () => {
  assert.match(messages(run(input([dish(1, V(99))])))[0], /add-ons on Avo Smash/);
  assert.deepEqual(run(input([dish(1, V(11))])), { operations: [] });
});

test('hours and capacity come from the configuration metafield', () => {
  const config = { open: '07:00', kitchen_close: '11:00', slot_minutes: 30, dishes_per_slot: 2 };
  assert.deepEqual(run(input([dish(2)], { slot: '2026-10-27T07:30', config })), { operations: [] });
  assert.equal(messages(run(input([dish(3)], { slot: '2026-10-27T07:30', config }))).length, 1);
  assert.match(messages(run(input([dish()], { slot: '2026-10-27T07:45', config })))[0], /07:00–11:00/);
});

test('broken metafields fall back to safe defaults instead of failing open', () => {
  const i = input([dish()]);
  i.shop.slotState = { value: '{nope' };
  i.validation.config = { value: '{nope' };
  assert.deepEqual(run(i), { operations: [] });
});
