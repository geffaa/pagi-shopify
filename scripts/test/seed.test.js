import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../catalog.json' with { type: 'json' };
import { SHOP_IMAGES, addonInput, giftCardInput, menuInput, modifiersFor, validationInput } from '../seed.js';
import { existsSync, readFileSync } from 'node:fs';
import { checkMods, parseModifiers } from '../../lib/modifiers.js';
import { cartValidationsGenerateRun } from '../../extensions/pickup-slot/src/cart_validations_generate_run.js';

const ids = Object.fromEntries(catalog.addons.map((a, i) => [a.handle, `gid://shopify/ProductVariant/${100 + i}`]));

test('the catalog is consistent: groups, add-ons and categories all exist', () => {
  const addons = new Set(catalog.addons.map((a) => a.handle));
  const cats = new Set(catalog.categories.map((c) => c.handle));
  for (const [key, g] of Object.entries(catalog.groups)) {
    assert.ok(g.min <= g.max && g.max <= g.options.length, key);
    for (const o of g.options) if (o.addon) assert.ok(addons.has(o.addon), `${key} → ${o.addon}`);
  }
  for (const m of catalog.menu) {
    assert.ok(cats.has(m.category), m.handle);
    for (const g of m.groups) assert.ok(catalog.groups[g], `${m.handle} → ${g}`);
    assert.ok(m.title_id && m.description_id, `${m.handle} needs Indonesian copy`);
  }
});

test('a dish metafield lists the add-on variants the Functions will accept', () => {
  const plate = catalog.menu.find((m) => m.handle === 'the-pagi-plate');
  const groups = parseModifiers({ value: menuInput(plate, catalog, ids).metafields[0].value });
  const protein = groups.find((g) => g.key === 'add_protein');
  assert.equal(protein.max, 3);
  assert.ok(protein.addons.includes(ids['addon-bacon']));
  const bread = groups.find((g) => g.key === 'bread');
  assert.deepEqual(bread.options.map((o) => [o.label, o.price, Boolean(o.variant)]), [['Sourdough', 0, false], ['Gluten-free bread', 15000, true]]);
  // Same rules the Cart Transform and Validation apply:
  assert.equal(checkMods([ids['addon-bacon'], ids['addon-bacon']], groups).ok, true);
  assert.equal(checkMods([ids['addon-oat-milk']], groups).reason, 'not_allowed');
});

test('menu items are typed "Menu" with MENU- SKUs, which is what ops and the Validation rely on', () => {
  const m = menuInput(catalog.menu[0], catalog, ids);
  assert.equal(m.productType, 'Menu');
  assert.match(m.variants[0].sku, /^MENU-/);
  assert.match(addonInput(catalog.addons[0]).variants[0].sku, /^ADD-/);
  assert.equal(addonInput(catalog.addons[0]).metafields[0].key, 'hidden');
});

test('gift card variants are the catalog denominations', () => {
  const g = giftCardInput(catalog.gift_card);
  assert.equal(g.giftCard, true);
  assert.deepEqual(g.variants.map((v) => v.price), ['100000', '250000', '500000']);
});

test('the Validation configuration matches the shop hours and is read as such by the Function', () => {
  const v = validationInput(catalog.shop);
  const config = { value: v.metafields[0].value };
  const cart = (slot) => ({
    cart: { fulfilment: { value: 'pickup' }, slot: { value: slot }, lines: [{ quantity: 1, mods: null, merchandise: { __typename: 'ProductVariant', product: { title: 'x', productType: 'Menu', modifiers: null } } }] },
    shop: { localTime: { date: '2026-10-27' }, slotState: null },
    validation: { config },
  });
  assert.equal(cartValidationsGenerateRun(cart('2026-10-27T15:30')).operations.length, 0);
  assert.equal(cartValidationsGenerateRun(cart('2026-10-27T15:45')).operations.length, 1);
});

test('every image the theme and catalog name exists in design/out', () => {
  const out = (n) => new URL(`../../design/out/${n}.jpg`, import.meta.url);
  for (const art of [...catalog.menu, ...catalog.beans, catalog.gift_card].map((x) => x.art)) assert.ok(existsSync(out(art)), art);
  const index = readFileSync(new URL('../../theme/templates/index.json', import.meta.url), 'utf8');
  for (const [, name] of index.matchAll(/shop_images\/([\w-]+)\.jpg/g)) {
    assert.ok(SHOP_IMAGES.includes(name), `${name} is not uploaded by the seed`);
    assert.ok(existsSync(out(name)), name);
  }
});
