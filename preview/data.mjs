/**
 * Mock storefront data for the Pagi preview, built from scripts/catalog.json and shaped like the
 * Liquid objects the theme reads, in English or Indonesian (Shopify serves translations under
 * /id/ once the `id` locale is published). Prices are in subunits, as Liquid sees them.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Drop } from 'liquidjs';
import { modifiersFor } from '../lib/modifiers.js';

const root = new URL('..', import.meta.url);
export const catalog = JSON.parse(await readFile(new URL('scripts/catalog.json', root), 'utf8'));
const img = new URL('design/out/', root);

/** A value that prints as itself in Liquid but also exposes `.value` (metafields). */
export class Field extends Drop {
  constructor(value) {
    super();
    this.value = value;
  }
  valueOf() {
    return typeof this.value === 'object' ? JSON.stringify(this.value) : this.value;
  }
  toString() {
    return String(this.valueOf());
  }
}

const image = (file, alt) => {
  if (!existsSync(new URL(file, img))) return null;
  const media = { id: file, src: `/img/${file}`, width: 1200, height: 900, aspect_ratio: 4 / 3, alt, media_type: 'image' };
  media.preview_image = media;
  return media;
};
const gid = (id) => `gid://shopify/ProductVariant/${id}`;
export const variantGid = gid;

/* ---------------------------------------------------------------------- */
/* Raw products, with numeric ids like Shopify's                           */
/* ---------------------------------------------------------------------- */

let nextId = 7000;
const raw = [];
const addonVariant = {};
for (const a of catalog.addons) {
  const vid = nextId++;
  addonVariant[a.handle] = gid(vid);
  raw.push({ id: nextId++, handle: a.handle, type: 'Add-on', title: a.title, title_id: a.title_id, art: null, variants: [{ id: vid, title: 'Default Title', price: a.price }], hidden: true });
}
for (const m of catalog.menu) {
  raw.push({
    id: nextId++,
    handle: m.handle,
    type: 'Menu',
    title: m.title,
    title_id: m.title_id,
    description: m.description,
    description_id: m.description_id,
    art: m.art,
    category: m.category,
    tags: [`category:${m.category}`, ...m.diet.map((d) => `diet:${d}`)],
    variants: [{ id: nextId++, title: 'Default Title', price: m.price }],
    meta: { modifiers: modifiersFor(m, catalog, addonVariant), diet: m.diet },
  });
}
for (const b of catalog.beans) {
  raw.push({
    id: nextId++,
    handle: b.handle,
    type: 'Coffee beans',
    title: b.title,
    title_id: b.title_id,
    description: b.description,
    description_id: b.description_id,
    art: b.art,
    tags: ['beans'],
    variants: b.variants.map((v) => ({ id: nextId++, title: v.size, price: v.price })),
  });
}
const g = catalog.gift_card;
raw.push({
  id: nextId++,
  handle: g.handle,
  type: 'Gift card',
  title: g.title,
  title_id: g.title_id,
  description: 'Sent by email in a minute. Works online and at the counter.',
  description_id: 'Dikirim lewat email dalam semenit. Bisa dipakai online dan di kasir.',
  art: g.art,
  gift: true,
  tags: ['gift-card'],
  variants: g.denominations.map((d) => ({ id: nextId++, title: `Rp${d / 1000}k`, price: d })),
});

/** variant id (number or GID) → { p, v } */
export const variantIndex = new Map();
for (const p of raw) for (const v of p.variants) {
  variantIndex.set(String(v.id), { p, v });
  variantIndex.set(gid(v.id), { p, v });
}

const LOCALES = { en: { prefix: '' }, id: { prefix: '/id' } };
const pick = (obj, key, locale) => (locale === 'id' && obj[`${key}_id`]) || obj[key];

/** The Liquid-facing catalog for one locale. */
export function buildCatalog(locale = 'en') {
  const prefix = LOCALES[locale].prefix;
  const products = {};
  for (const p of raw) {
    const media = p.art ? [image(`${p.art}.png`, p.title)].filter(Boolean) : [];
    const variants = p.variants.map((v) => ({ id: v.id, title: v.title, price: v.price * 100, available: true, compare_at_price: null }));
    const desc = pick(p, 'description', locale);
    products[p.handle] = {
      id: p.id,
      handle: p.handle,
      title: pick(p, 'title', locale),
      type: p.type,
      url: `${prefix}/products/${p.handle}`,
      tags: p.tags ?? [],
      description: desc ? `<p>${desc}</p>` : '',
      media,
      featured_media: media[0] ?? null,
      featured_image: media[0] ?? null,
      variants,
      selected_or_first_available_variant: variants[0],
      price: variants[0].price,
      available: true,
      'gift_card?': Boolean(p.gift),
      has_only_default_variant: variants.length === 1 && variants[0].title === 'Default Title',
      metafields: { pagi: p.meta ? { modifiers: new Field(p.meta.modifiers), diet: new Field(p.meta.diet) } : {} },
      _category: p.category,
    };
  }
  const menu = Object.values(products).filter((p) => p.type === 'Menu');
  const collections = {};
  for (const c of catalog.categories) {
    const list = menu.filter((p) => p._category === c.handle);
    collections[c.handle] = { handle: c.handle, title: pick(c, 'title', locale), url: `${prefix}/collections/${c.handle}`, description: '', products: list, products_count: list.length };
  }
  const beans = Object.values(products).filter((p) => p.type === 'Coffee beans');
  collections.beans = {
    handle: 'beans',
    title: locale === 'id' ? 'Biji kopi' : 'Coffee beans',
    url: `${prefix}/collections/beans`,
    description: locale === 'id' ? '<p>Disangrai setiap minggu di Canggu.</p>' : '<p>Roasted weekly in Canggu.</p>',
    products: beans,
    products_count: beans.length,
  };
  collections.all = { handle: 'all', title: 'All', url: `${prefix}/collections/all`, description: '', products: menu, products_count: menu.length };
  return { products, collections, prefix };
}

export function menus(locale) {
  const prefix = LOCALES[locale].prefix;
  const id = locale === 'id';
  return {
    'main-menu': {
      links: [
        { title: 'Menu', url: `${prefix}/#menu` },
        { title: id ? 'Biji kopi' : 'Beans', url: `${prefix}/collections/beans` },
        { title: id ? 'Kartu hadiah' : 'Gift cards', url: `${prefix}/products/pagi-gift-card` },
        { title: id ? 'Katering' : 'Catering', url: `${prefix}/pages/catering` },
      ],
    },
    footer: {
      links: [
        { title: id ? 'Katering' : 'Catering', url: `${prefix}/pages/catering` },
        { title: id ? 'Kartu hadiah' : 'Gift cards', url: `${prefix}/products/pagi-gift-card` },
        { title: id ? 'Papan dapur (demo)' : 'Kitchen board (demo)', url: '/kitchen' },
        { title: id ? 'Privasi' : 'Privacy', url: `${prefix}/policies/privacy-policy` },
      ],
    },
  };
}

export const pages = (locale) => ({
  catering: { handle: 'catering', title: locale === 'id' ? 'Katering' : 'Catering', url: `${LOCALES[locale].prefix}/pages/catering`, template_suffix: 'catering', content: '' },
});

export const shopImages = Object.fromEntries(
  ['hero-pagi', 'beans-kintamani', 'gift-card', 'platter'].map((n) => [`${n}.png`, { src: `/img/${n}.png`, width: n === 'hero-pagi' ? 1600 : 1200, height: n === 'hero-pagi' ? 1200 : 900, aspect_ratio: 4 / 3, alt: '' }])
);
