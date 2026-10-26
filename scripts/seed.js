/**
 * Seeds a development store for Pagi through the Admin GraphQL API:
 *   1. metafield definitions (dish modifiers, diet badges, the shop's slot state)
 *   2. add-on products (hidden from search and collections; the Cart Transform adds them)
 *   3. menu products, each with a `pagi.modifiers` metafield holding the add-on variant IDs
 *   4. coffee beans and the gift card
 *   5. a collection per menu category, plus beans; the catering page; home page images
 *   6. Indonesian translations (the `id` locale) for every product and collection
 *   7. the Cart Transform (menu-addons) and the checkout Validation (pickup-slot)
 *
 * Usage: node scripts/seed.js   (needs SHOPIFY_SHOP + token; see .env.example)
 * Run `shopify app deploy` first so both Functions exist.
 */
import { readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdminClient } from './lib/admin.js';
import { configFromShop } from '../lib/slots.js';
import { modifiersFor } from '../lib/modifiers.js';

export { modifiersFor };

const root = fileURLToPath(new URL('..', import.meta.url));
const exists = (p) => stat(p).then(() => true, () => false);
export const sku = (prefix, handle) => `${prefix}-${handle.replace(/^addon-/, '').toUpperCase()}`;

/* ---------------------------------------------------------------------- */
/* Pure builders (unit-tested)                                             */
/* ---------------------------------------------------------------------- */

/** Images the home page template picks by file name. */
export const SHOP_IMAGES = ['hero', 'beans-kintamani', 'gift-card', 'catering'];

export const DEFINITIONS = [
  { ownerType: 'PRODUCT', key: 'modifiers', name: 'Modifiers', type: 'json', description: 'Choice groups and allowed add-ons. Read by the theme and both Functions.' },
  { ownerType: 'PRODUCT', key: 'diet', name: 'Diet', type: 'list.single_line_text_field', description: 'v, vg, gf' },
  { ownerType: 'SHOP', key: 'slot_state', name: 'Slot state', type: 'json', description: 'Closed slots and dishes per slot. Written by pagi-ops.' },
];

const oneVariant = (price, skuValue, extra = {}) => ({
  productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
  variants: [{ optionValues: [{ optionName: 'Title', name: 'Default Title' }], price: String(price), sku: skuValue, inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false, requiresShipping: true }, ...extra }],
});

export function addonInput(a) {
  return {
    title: a.title,
    handle: a.handle,
    vendor: 'Pagi',
    productType: 'Add-on',
    status: 'ACTIVE',
    tags: ['add-on'],
    ...oneVariant(a.price, sku('ADD', a.handle)),
    // Purchasable (the Cart Transform needs that) but kept out of search and sitemaps.
    metafields: [{ namespace: 'seo', key: 'hidden', type: 'number_integer', value: '1' }],
  };
}

export function menuInput(item, catalog, addonVariant, files = []) {
  return {
    title: item.title,
    handle: item.handle,
    descriptionHtml: `<p>${item.description}</p>`,
    vendor: 'Pagi',
    productType: 'Menu',
    status: 'ACTIVE',
    tags: [`category:${item.category}`, ...item.diet.map((d) => `diet:${d}`), ...(item.featured ? ['featured'] : [])],
    ...oneVariant(item.price, sku('MENU', item.handle)),
    metafields: [
      { namespace: 'pagi', key: 'modifiers', type: 'json', value: JSON.stringify(modifiersFor(item, catalog, addonVariant)) },
      { namespace: 'pagi', key: 'diet', type: 'list.single_line_text_field', value: JSON.stringify(item.diet) },
    ],
    files: files.map((f) => ({ originalSource: f, alt: item.title, contentType: 'IMAGE' })),
  };
}

export function beanInput(b, files = []) {
  return {
    title: b.title,
    handle: b.handle,
    descriptionHtml: `<p>${b.description}</p>`,
    vendor: 'Pagi',
    productType: 'Coffee beans',
    status: 'ACTIVE',
    tags: ['beans'],
    productOptions: [{ name: 'Size', values: b.variants.map((v) => ({ name: v.size })) }],
    variants: b.variants.map((v) => ({
      optionValues: [{ optionName: 'Size', name: v.size }],
      price: String(v.price),
      sku: `BEAN-${b.handle.toUpperCase()}-${v.grams}`,
      inventoryPolicy: 'DENY',
      inventoryItem: { tracked: true, requiresShipping: true, measurement: { weight: { value: v.grams, unit: 'GRAMS' } } },
    })),
    files: files.map((f) => ({ originalSource: f, alt: b.title, contentType: 'IMAGE' })),
  };
}

export function giftCardInput(g, files = []) {
  return {
    title: g.title,
    handle: g.handle,
    vendor: 'Pagi',
    productType: 'Gift card',
    giftCard: true,
    status: 'ACTIVE',
    tags: ['gift-card'],
    productOptions: [{ name: 'Amount', values: g.denominations.map((d) => ({ name: `Rp${d / 1000}k` })) }],
    variants: g.denominations.map((d) => ({ optionValues: [{ optionName: 'Amount', name: `Rp${d / 1000}k` }], price: String(d), sku: `GIFT-${d / 1000}K` })),
    files: files.map((f) => ({ originalSource: f, alt: g.title, contentType: 'IMAGE' })),
  };
}

/** The Validation's configuration: hours and capacity, so the kitchen can change them without a deploy. */
export function validationInput(shop) {
  return {
    functionHandle: 'pickup-slot',
    title: 'Pickup and delivery slots',
    enable: true,
    blockOnFailure: true,
    metafields: [{ namespace: '$app', key: 'function-configuration', type: 'json', value: JSON.stringify(configFromShop(shop)) }],
  };
}

/** Indonesian strings for a resource, keyed like translatableContent. */
export const translationsFor = (x) =>
  Object.fromEntries(
    [
      ['title', x.title_id],
      ['body_html', x.description_id && `<p>${x.description_id}</p>`],
    ].filter(([, v]) => v)
  );

/* ---------------------------------------------------------------------- */
/* GraphQL                                                                 */
/* ---------------------------------------------------------------------- */

const G = {
  context: `{ publications(first: 20) { nodes { id name } } shop { id } }`,
  mfDef: `mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { userErrors { message code } } }`,
  staged: `mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
  productSet: `mutation($input: ProductSetInput!, $identifier: ProductSetIdentifiers) { productSet(input: $input, identifier: $identifier, synchronous: true) { product { id variants(first: 1) { nodes { id } } } userErrors { field message } } }`,
  publish: `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
  collection: `query($h: String!) { collectionByIdentifier(identifier: { handle: $h }) { id } }`,
  collectionCreate: `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { message } } }`,
  pageCreate: `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message code } } }`,
  metafieldsSet: `mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`,
  fileCreate: `mutation($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id } userErrors { message } } }`,
  locale: `mutation { shopLocaleEnable(locale: "id") { userErrors { message } } shopLocaleUpdate(locale: "id", shopLocale: { published: true }) { userErrors { message } } }`,
  translatable: `query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`,
  translate: `mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } } }`,
  transforms: `{ cartTransforms(first: 10) { nodes { id functionId } } }`,
  transformCreate: `mutation { cartTransformCreate(functionHandle: "menu-addons", blockOnFailure: false) { cartTransform { id } userErrors { field message } } }`,
  validations: `{ validations(first: 10) { nodes { id title } } }`,
  validationCreate: `mutation($v: ValidationCreateInput!) { validationCreate(validation: $v) { validation { id } userErrors { field message } } }`,
  validationUpdate: `mutation($id: ID!, $v: ValidationUpdateInput!) { validationUpdate(id: $id, validation: $v) { userErrors { field message } } }`,
};

async function upload(admin, path) {
  const bytes = await readFile(path);
  const filename = basename(path);
  const data = await admin.graphql(G.staged, { input: [{ filename, mimeType: 'image/jpeg', resource: 'IMAGE', httpMethod: 'POST', fileSize: String(bytes.length) }] });
  const target = admin.assertNoUserErrors(data.stagedUploadsCreate, 'stagedUploadsCreate').stagedTargets[0];
  const form = new FormData();
  target.parameters.forEach(({ name, value }) => form.append(name, value));
  form.append('file', new Blob([bytes], { type: 'image/jpeg' }), filename);
  const res = await fetch(target.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload ${filename}: ${res.status}`);
  return target.resourceUrl;
}

export async function seed({ admin, imagesDir = join(root, 'design/out'), log = console.log }) {
  const catalog = JSON.parse(await readFile(join(root, 'scripts/catalog.json'), 'utf8'));
  const ctx = await admin.graphql(G.context);
  const store = ctx.publications.nodes.find((p) => p.name === 'Online Store');
  const publish = async (id) => store && admin.graphql(G.publish, { id, input: [{ publicationId: store.id }] });
  const image = async (art) => {
    const p = join(imagesDir, `${art}.jpg`);
    return (await exists(p)) ? [await upload(admin, p)] : [];
  };
  const put = async (input, label) => {
    const r = await admin.graphql(G.productSet, { input, identifier: { handle: input.handle } });
    const product = admin.assertNoUserErrors(r.productSet, label).product;
    await publish(product.id);
    return product;
  };
  const translations = [];

  // 1. Definitions (TAKEN means a previous run made it)
  for (const d of DEFINITIONS) {
    const r = await admin.graphql(G.mfDef, { d: { ...d, namespace: 'pagi', access: { storefront: 'PUBLIC_READ' } } });
    const errs = r.metafieldDefinitionCreate.userErrors.filter((e) => e.code !== 'TAKEN');
    if (errs.length) throw new Error(`metafield ${d.key}: ${errs[0].message}`);
  }
  log('✓ definitions');

  // 2. Add-ons first: dishes need their variant IDs
  const addonVariant = {};
  for (const a of catalog.addons) {
    const p = await put(addonInput(a), a.handle);
    addonVariant[a.handle] = p.variants.nodes[0].id;
    translations.push([p.id, translationsFor(a)]);
  }
  log(`✓ ${catalog.addons.length} add-ons`);

  // 3. Menu
  const byCategory = {};
  for (const item of catalog.menu) {
    const p = await put(menuInput(item, catalog, addonVariant, await image(item.art)), item.handle);
    (byCategory[item.category] ??= []).push(p.id);
    translations.push([p.id, translationsFor(item)]);
  }
  log(`✓ ${catalog.menu.length} dishes`);

  // 4. Beans and gift card
  const beanIds = [];
  for (const b of catalog.beans) {
    const p = await put(beanInput(b, await image(b.art)), b.handle);
    beanIds.push(p.id);
    translations.push([p.id, translationsFor(b)]);
  }
  const gift = await put(giftCardInput(catalog.gift_card, await image(catalog.gift_card.art)), 'gift card');
  translations.push([gift.id, translationsFor(catalog.gift_card)]);
  log('✓ beans and gift card');

  // 5. Collections and pages
  for (const c of [...catalog.categories.map((c) => ({ ...c, ids: byCategory[c.handle] ?? [] })), { handle: 'beans', title: 'Coffee beans', title_id: 'Biji kopi', ids: beanIds }]) {
    let id = (await admin.graphql(G.collection, { h: c.handle })).collectionByIdentifier?.id;
    if (!id) {
      const r = await admin.graphql(G.collectionCreate, { input: { title: c.title, handle: c.handle, products: c.ids, sortOrder: 'MANUAL' } });
      id = admin.assertNoUserErrors(r.collectionCreate, `collection ${c.handle}`).collection.id;
      await publish(id);
    }
    translations.push([id, translationsFor(c)]);
  }
  for (const page of [{ title: 'Catering', handle: 'catering', templateSuffix: 'catering', isPublished: true }]) {
    const p = await admin.graphql(G.pageCreate, { page });
    const errs = p.pageCreate.userErrors.filter((e) => e.code !== 'TAKEN');
    if (errs.length) throw new Error(`page ${page.handle}: ${errs[0].message}`);
  }
  log('✓ collections and catering page');

  // Home page images, referenced by templates/index.json as shopify://shop_images/<name>.jpg
  for (const name of SHOP_IMAGES) {
    const path = join(imagesDir, `${name}.jpg`);
    if (!(await exists(path))) continue;
    const r = await admin.graphql(G.fileCreate, { files: [{ originalSource: await upload(admin, path), filename: `${name}.jpg`, contentType: 'IMAGE' }] });
    admin.assertNoUserErrors(r.fileCreate, `file ${name}`);
  }
  log('✓ home page images');

  // 6. Bahasa Indonesia
  await admin.graphql(G.locale);
  for (const [id, strings] of translations) {
    const content = (await admin.graphql(G.translatable, { id })).translatableResource.translatableContent;
    const t = content.filter((c) => strings[c.key]).map((c) => ({ locale: 'id', key: c.key, value: strings[c.key], translatableContentDigest: c.digest }));
    if (t.length) admin.assertNoUserErrors((await admin.graphql(G.translate, { id, t })).translationsRegister, 'translationsRegister');
  }
  log(`✓ ${translations.length} resources translated to Indonesian`);

  // 7. Functions. Empty slot state so the Validation has something to read before pagi-ops runs.
  admin.assertNoUserErrors(
    (await admin.graphql(G.metafieldsSet, { m: [{ ownerId: ctx.shop.id, namespace: 'pagi', key: 'slot_state', type: 'json', value: '{"closed":[],"used":{}}' }] })).metafieldsSet,
    'slot_state'
  );
  if (!(await admin.graphql(G.transforms)).cartTransforms.nodes.length) admin.assertNoUserErrors((await admin.graphql(G.transformCreate)).cartTransformCreate, 'cartTransformCreate');
  const v = validationInput(catalog.shop);
  const existing = (await admin.graphql(G.validations)).validations.nodes.find((n) => n.title === v.title);
  if (existing) {
    const { functionHandle, ...update } = v;
    admin.assertNoUserErrors((await admin.graphql(G.validationUpdate, { id: existing.id, v: update })).validationUpdate, 'validationUpdate');
  } else admin.assertNoUserErrors((await admin.graphql(G.validationCreate, { v })).validationCreate, 'validationCreate');
  log('✓ cart transform and slot validation');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.loadEnvFile(join(root, '.env'));
  } catch {
    /* env from shell */
  }
  const e = process.env;
  const admin = createAdminClient({ shop: e.SHOPIFY_SHOP, apiVersion: e.SHOPIFY_API_VERSION || '2026-07', token: e.SHOPIFY_ADMIN_TOKEN, clientId: e.SHOPIFY_CLIENT_ID, clientSecret: e.SHOPIFY_CLIENT_SECRET, log: (m) => console.error(`[admin] ${m}`) });
  seed({ admin }).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
