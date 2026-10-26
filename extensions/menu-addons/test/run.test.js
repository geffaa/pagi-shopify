import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartTransformRun as run } from '../src/cart_transform_run.js';
import { checkMods } from '../../../lib/modifiers.js';

const V = (n) => `gid://shopify/ProductVariant/${n}`;
const groups = { groups: [
  { key: 'add_protein', min: 0, max: 2, addons: [V(11), V(12)] },
  { key: 'add_greens', min: 0, max: 1, addons: [V(21)] },
] };
const line = (id, mods, { meta = groups, variant = V(1), quantity = 1 } = {}) => ({
  id: `gid://shopify/CartLine/${id}`,
  quantity,
  mods: mods == null ? null : { value: mods },
  merchandise: { __typename: 'ProductVariant', id: variant, product: { modifiers: meta ? { value: JSON.stringify(meta) } : null } },
});
const input = (...lines) => ({ cart: { lines } });

test('a dish without add-ons is left alone', () => {
  assert.deepEqual(run(input(line(1, null), line(2, ''))), { operations: [] });
});

test('a dish with add-ons expands into the dish plus each add-on', () => {
  const { operations } = run(input(line(1, `${V(11)},${V(21)}`)));
  assert.deepEqual(operations, [{
    lineExpand: {
      cartLineId: 'gid://shopify/CartLine/1',
      expandedCartItems: [{ merchandiseId: V(1), quantity: 1 }, { merchandiseId: V(11), quantity: 1 }, { merchandiseId: V(21), quantity: 1 }],
    },
  }]);
});

test('a repeated add-on becomes a quantity (two extra eggs)', () => {
  const items = run(input(line(1, `${V(11)}, ${V(11)}`))).operations[0].lineExpand.expandedCartItems;
  assert.deepEqual(items[1], { merchandiseId: V(11), quantity: 2 });
});

test('an add-on that is not on the dish is ignored, not charged', () => {
  assert.deepEqual(run(input(line(1, V(99)))), { operations: [] });
});

test('going over a group maximum leaves the line untouched', () => {
  assert.deepEqual(run(input(line(1, `${V(21)},${V(21)}`))), { operations: [] });
  assert.equal(checkMods([V(21), V(21)], groups.groups).reason, 'too_many');
});

test('a dish whose metafield is missing or broken never expands', () => {
  assert.deepEqual(run(input(line(1, V(11), { meta: null }))), { operations: [] });
  const broken = line(2, V(11));
  broken.merchandise.product.modifiers = { value: '{not json' };
  assert.deepEqual(run(input(broken)), { operations: [] });
});

test('gift cards and other non-variant merchandise are skipped', () => {
  const l = line(1, V(11));
  l.merchandise = { __typename: 'CustomProduct' };
  assert.deepEqual(run(input(l)), { operations: [] });
});
