/**
 * Offline preview for the Pagi theme: renders the real theme files with liquidjs plus Shopify
 * tags and filters, against mock data from the seed catalog, in English or Indonesian (/id/).
 * It also runs the project's real code where Shopify or the backend would:
 *   - the menu-addons Cart Transform prices dishes with their add-ons
 *   - /apps/pagi/slots and /apps/pagi/catering answer like the app proxy (lib/slots.js, ops code)
 *   - a stand-in checkout runs the pickup-slot Validation and refuses bad carts
 *   - placed orders land on the kitchen board (ops/src/kitchen.js)
 * It approximates Shopify; a development store is the source of truth.
 *   node preview/server.mjs  →  http://localhost:9595
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Hash, Drop } from 'liquidjs';
import { Field, buildCatalog, catalog, menus, pages, shopImages, variantGid, variantIndex } from './data.mjs';
import * as store from './store.mjs';
import { checkoutPage, thankYouPage } from './checkout.mjs';
import { cartTransformRun } from '../extensions/menu-addons/src/cart_transform_run.js';
import { cartValidationsGenerateRun } from '../extensions/pickup-slot/src/cart_validations_generate_run.js';
import { renderBoard } from '../ops/src/kitchen.js';
import { checkCatering } from '../ops/src/catering.js';

const root = new URL('..', import.meta.url);
const themeDir = new URL('theme/', root);
const PORT = Number(process.env.PORT || 9595);
const read = (p) => readFile(new URL(p, themeDir), 'utf8');
const LOCALES = {
  en: JSON.parse(readFileSync(new URL('locales/en.default.json', themeDir), 'utf8')),
  id: JSON.parse(readFileSync(new URL('locales/id.json', themeDir), 'utf8')),
};
// Translate & Adapt stand-in: Indonesian for the section settings in templates/*.json.
const CONTENT_ID = JSON.parse(readFileSync(new URL('preview/content.id.json', root), 'utf8'));
const LANGUAGES = [
  { iso_code: 'en', name: 'English', endonym_name: 'English' },
  { iso_code: 'id', name: 'Indonesian', endonym_name: 'Bahasa Indonesia' },
];

/* Money: IDR without decimals, like the store's "Rp{{amount_no_decimals_with_comma_separator}}" format. */
const money = (cents) => `Rp${Math.round(Number(cents || 0) / 100).toLocaleString('de-DE')}`;

/* ---------------------------------------------------------------------- */
/* Settings                                                                */
/* ---------------------------------------------------------------------- */

class Color extends Drop {
  constructor(hex) {
    super();
    this.hex = hex;
    const n = parseInt(hex.slice(1), 16);
    Object.assign(this, { red: (n >> 16) & 255, green: (n >> 8) & 255, blue: n & 255 });
  }
  valueOf() {
    return this.hex;
  }
  toString() {
    return this.hex;
  }
}

function resolveSetting(type, value, g) {
  if (value == null || value === '') return null;
  const data = g.__data;
  const prefixUrl = (u) => (typeof u === 'string' && u.startsWith('/') && !u.startsWith('/apps/') && !u.startsWith('/kitchen') ? data.prefix + u : u);
  switch (type) {
    case 'color': return new Color(value);
    case 'collection': return data.collections[value] ?? null;
    case 'collection_list': return value.map((h) => data.collections[h]).filter(Boolean);
    case 'product': return data.products[value] ?? null;
    case 'image_picker': return shopImages[String(value).replace('shopify://shop_images/', '')] ?? null;
    case 'link_list': return menus(g.__locale)[value] ?? { links: [] };
    case 'url': return prefixUrl(value);
    case 'text': case 'textarea': return g.__locale === 'id' ? CONTENT_ID[value] ?? value : value;
    default: return value;
  }
}
function resolveSettings(defs = [], values = {}, g) {
  const out = {};
  for (const s of defs) if (s.id) out[s.id] = resolveSetting(s.type, values[s.id] ?? s.default, g);
  return out;
}
const schemaSettings = JSON.parse(readFileSync(new URL('config/settings_schema.json', themeDir), 'utf8')).flatMap((g) => g.settings ?? []);
const settingsValues = JSON.parse(readFileSync(new URL('config/settings_data.json', themeDir), 'utf8')).presets.Default;

/* ---------------------------------------------------------------------- */
/* Engine                                                                  */
/* ---------------------------------------------------------------------- */

const engine = new Liquid({ root: fileURLToPath(themeDir), partials: fileURLToPath(new URL('snippets/', themeDir)), extname: '.liquid', strictFilters: true });
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));

class ImageUrl {
  constructor(img, width) {
    this.img = img;
    this.width = width;
  }
  toString() {
    return `${this.img.src}${this.width ? `?width=${this.width}` : ''}`;
  }
  toJSON() {
    return this.toString();
  }
}

const filters = {
  t(key, ...args) {
    const vars = kw(args);
    const lookup = (dict) => key.split('.').reduce((o, k) => o?.[k], dict);
    let v = lookup(LOCALES[this.context.globals.__locale ?? 'en']) ?? lookup(LOCALES.en);
    if (v && typeof v === 'object') v = Number(vars.count) === 1 ? v.one : v.other;
    if (typeof v !== 'string') return `translation missing: ${key}`;
    return v.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vars[k] ?? ''));
  },
  money: (c) => money(c),
  money_with_currency: (c) => `${money(c)} IDR`,
  money_without_trailing_zeros: (c) => money(c),
  asset_url: (n) => `/assets/${n}`,
  shopify_asset_url: (n) => `https://cdn.shopify.com/s/shopify/${n}`,
  stylesheet_tag: (u) => `<link href="${u}" rel="stylesheet">`,
  preload_tag: (u, ...a) => `<link href="${u}" rel="preload" as="${kw(a).as}" type="${kw(a).type}" crossorigin>`,
  image_url: (img, ...a) => (img ? new ImageUrl(img.preview_image ?? img, kw(a).width) : ''),
  image_tag(url, ...a) {
    if (!url) return '';
    const o = kw(a);
    const img = url.img ?? {};
    const attrs = { src: String(url), alt: o.alt ?? img.alt ?? '', width: img.width, height: img.height };
    if (o.widths) attrs.srcset = String(o.widths).split(',').map((w) => `${img.src}?width=${w.trim()} ${w.trim()}w`).join(', ');
    for (const [k, v] of Object.entries(o)) if (!['widths', 'preload', 'alt', 'height'].includes(k)) attrs[k] = v;
    return `<img ${Object.entries(attrs).filter(([, v]) => v != null).map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`).join(' ')}>`;
  },
  default_pagination: () => '',
  format_code: (s) => String(s).replace(/(.{4})/g, '$1 ').trim(),
  handleize: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  handle: (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
};
for (const [n, f] of Object.entries(filters)) engine.registerFilter(n, f);

engine.registerTag('schema', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    while (remain.length && remain.shift().name !== 'endschema');
  }
  *render() {}
});

const FORM_ACTIONS = { product: '/cart/add', localization: '/localization' };
engine.registerTag('form', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    const m = token.args.match(/^\s*'([^']+)'\s*(?:,\s*([a-z_.]+)(?=\s*(?:,|$)))?\s*,?(.*)$/s);
    this.type = m[1];
    this.hash = new Hash(m[3] ?? '');
    this.tpls = [];
    const s = liquid.parser.parseStream(remain).on('tag:endform', () => s.stop()).on('template', (t) => this.tpls.push(t));
    s.start();
  }
  *render(ctx, emitter) {
    const attrs = yield this.hash.render(ctx);
    const prefix = ctx.globals.__data?.prefix ?? '';
    emitter.write(`<form method="post" action="${prefix}${FORM_ACTIONS[this.type] ?? '/'}" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}><input type="hidden" name="form_type" value="${this.type}">`);
    ctx.push({ form: { errors: null, 'posted_successfully?': false } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
    emitter.write('</form>');
  }
});

engine.registerTag('paginate', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    this.tpls = [];
    const s = liquid.parser.parseStream(remain).on('tag:endpaginate', () => s.stop()).on('template', (t) => this.tpls.push(t));
    s.start();
  }
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1 } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
  }
});

async function renderSection(type, data = {}, id = type, globals, index = 1) {
  const src = await read(`sections/${type}.liquid`);
  const match = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  const schema = match ? JSON.parse(match[1]) : {};
  const blockDefs = Object.fromEntries((schema.blocks ?? []).map((b) => [b.type, b]));
  const blocks = (data.block_order ?? Object.keys(data.blocks ?? {})).map((bid) => ({
    id: bid,
    type: data.blocks[bid].type,
    settings: resolveSettings(blockDefs[data.blocks[bid].type]?.settings, data.blocks[bid].settings, globals),
    shopify_attributes: '',
  }));
  const section = { id, index, settings: resolveSettings(schema.settings, data.settings, globals), blocks };
  const html = await engine.parseAndRender(src, { section }, { globals });
  const tag = schema.tag ?? 'div';
  return `<${tag} id="shopify-section-${id}" class="shopify-section">${html}</${tag}>`;
}

for (const name of ['section', 'sections']) {
  engine.registerTag(name, class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.arg = token.args.trim().replace(/['"]/g, '');
    }
    *render(ctx, emitter) {
      const globals = ctx.getAll();
      if (name === 'section') return emitter.write(yield renderSection(this.arg, {}, this.arg, globals));
      const group = JSON.parse(yield read(`sections/${this.arg}.json`));
      for (const key of group.order) emitter.write(yield renderSection(group.sections[key].type, group.sections[key], `sections--1__${key}`, globals));
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Cart, priced by the real menu-addons Cart Transform                     */
/* ---------------------------------------------------------------------- */

let lines = [];
let attributes = {};

function transformInput() {
  return {
    cart: {
      lines: lines.map((l, i) => {
        const { p } = variantIndex.get(String(l.id));
        return {
          id: `gid://shopify/CartLine/${i}`,
          quantity: l.quantity,
          mods: l.properties._mods ? { value: l.properties._mods } : null,
          merchandise: { __typename: 'ProductVariant', id: variantGid(l.id), product: { title: p.title, productType: p.type, modifiers: p.meta ? { value: JSON.stringify(p.meta.modifiers) } : null } },
        };
      }),
    },
  };
}

function cartFor(data) {
  const input = transformInput();
  const expanded = {};
  for (const op of cartTransformRun(input).operations) expanded[op.lineExpand.cartLineId] = op.lineExpand.expandedCartItems;
  const items = lines.map((l, i) => {
    const { p, v } = variantIndex.get(String(l.id));
    const product = data.products[p.handle];
    const variant = product.variants.find((x) => String(x.id) === String(l.id));
    // An expanded line costs the sum of its components, per unit of the line.
    const parts = expanded[`gid://shopify/CartLine/${i}`];
    const unit = parts ? parts.reduce((s, c) => s + variantIndex.get(c.merchandiseId).v.price * 100 * c.quantity, 0) : v.price * 100;
    return {
      key: `${l.id}:${i}`,
      url: product.url,
      image: product.featured_media,
      product,
      variant,
      quantity: l.quantity,
      properties: l.properties,
      item_components: parts ? parts.slice(1).map((c) => ({ title: variantIndex.get(c.merchandiseId).p.title, quantity: c.quantity })) : [],
      original_line_price: unit * l.quantity,
      final_line_price: unit * l.quantity,
    };
  });
  return {
    items,
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    total_price: items.reduce((s, i) => s + i.final_line_price, 0),
    attributes,
    currency: { iso_code: 'IDR' },
  };
}

/** The Validation's input, as Shopify would build it from the cart and the shop. */
function validationInput() {
  return {
    cart: {
      fulfilment: attributes.fulfilment ? { value: attributes.fulfilment } : null,
      slot: attributes.pickup_slot ? { value: attributes.pickup_slot } : null,
      lines: transformInput().cart.lines.map(({ quantity, mods, merchandise }) => ({ quantity, mods, merchandise })),
    },
    shop: { localTime: { date: store.now().slice(0, 10) }, slotState: { value: JSON.stringify(store.publishedState()) } },
    validation: { config: { value: JSON.stringify(store.cfg) } },
  };
}

/* ---------------------------------------------------------------------- */
/* Requests                                                                */
/* ---------------------------------------------------------------------- */

function context(locale, url, extra = {}) {
  const data = buildCatalog(locale);
  const g = { __data: data, __locale: locale };
  const prefix = data.prefix;
  return {
    ...g,
    settings: resolveSettings(schemaSettings, settingsValues, g),
    shop: { name: 'Pagi', description: catalog.shop.tagline, url: 'https://pagi.example' },
    cart: cartFor(data),
    localization: { language: LANGUAGES.find((l) => l.iso_code === locale), available_languages: LANGUAGES },
    request: { locale: { iso_code: locale }, page_type: extra.template?.name ?? 'index' },
    routes: { root_url: prefix || '/', cart_url: `${prefix}/cart`, cart_add_url: `${prefix}/cart/add`, cart_change_url: `${prefix}/cart/change`, cart_update_url: `${prefix}/cart/update`, all_products_collection_url: `${prefix}/collections/all` },
    canonical_url: url.href,
    page_title: 'Pagi',
    page_description: locale === 'id' ? 'Brunch dan kopi di Pererenan. Pesan duluan, ambil tanpa antre.' : 'Brunch and specialty coffee in Pererenan, Bali. Order ahead and collect without the queue, or get it delivered within 5 km.',
    content_for_header: `<script>window.Shopify = { analytics: { publish(n, d) { console.log('[analytics]', n, JSON.stringify(d)); } } };</script>`,
    ...extra,
  };
}

async function renderTemplate(name, locale, url, extra = {}) {
  const template = JSON.parse(await read(`templates/${name}.json`));
  const globals = context(locale, url, { template: { name: name.split('.')[0] }, ...extra });
  const only = url.searchParams.get('section_id');
  let html = '';
  let i = 0;
  for (const key of template.order) {
    const id = `template--1__${key}`;
    if (only && only !== id) continue;
    html += await renderSection(template.sections[key].type, template.sections[key], id, globals, ++i);
  }
  if (only) return html;
  return engine.parseAndRender(await read('layout/theme.liquid'), {}, { globals: { ...globals, content_for_layout: html } });
}

async function sectionsFor(ids, locale, url) {
  const out = {};
  for (const id of ids) {
    if (id === 'cart-drawer') out[id] = await renderSection('cart-drawer', {}, 'cart-drawer', context(locale, url));
    else if (id.startsWith('template--1__')) out[id] = await renderTemplate('cart', locale, new URL(`/cart?section_id=${id}`, url));
  }
  return out;
}

async function body(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) return JSON.parse(raw || '{}');
  if (type.includes('multipart/form-data')) {
    const out = {};
    for (const part of raw.split(/-{2,}\S+/)) {
      const m = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);
      if (m) out[m[1]] = m[2];
    }
    return out;
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

/** "properties[Eggs]" form keys → { Eggs: ... }, as Shopify's /cart/add does. */
function itemsFrom(b) {
  if (b.items) return b.items.map((it) => ({ id: it.id, quantity: Number(it.quantity || 1), properties: it.properties ?? {} }));
  const properties = {};
  for (const [k, v] of Object.entries(b)) {
    const m = k.match(/^properties\[(.+)\]$/);
    if (m && v !== '') properties[m[1]] = v;
  }
  return [{ id: b.id, quantity: Number(b.quantity || 1), properties }];
}

const slotLabel = () => (attributes.pickup_slot ? `${attributes.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'} at ${attributes.pickup_slot.slice(11)}, ${attributes.pickup_slot.slice(0, 10)}` : '');
const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const send = (status, content, type = 'text/html; charset=utf-8', headers = {}) => {
    res.writeHead(status, { 'Content-Type': type, ...headers });
    res.end(content);
  };
  const json = (status, data) => send(status, JSON.stringify(data), 'application/json');
  // Alternate locale lives under a path prefix, as on Shopify.
  let path = url.pathname;
  let locale = 'en';
  if (path === '/id' || path.startsWith('/id/')) {
    locale = 'id';
    path = path.slice(3) || '/';
  }
  try {
    if (path === '/favicon.ico') return send(204, '');
    if (path.startsWith('/assets/') || path.startsWith('/img/')) {
      const file = path.startsWith('/assets/') ? new URL(`assets/${path.slice(8)}`, themeDir) : new URL(`design/out/${path.slice(5)}`, root);
      return existsSync(file) ? send(200, await readFile(file), MIME[extname(path)]) : send(404, 'not found');
    }

    if (req.method === 'POST' && path === '/localization') {
      const b = await body(req);
      const from = new URL(req.headers.referer || '/', url);
      const bare = from.pathname.replace(/^\/id(?=\/|$)/, '') || '/';
      return send(302, '', 'text/plain', { Location: (b.locale_code === 'id' ? `/id${bare === '/' ? '' : bare}` : bare) + from.search });
    }

    /* Cart API */
    if (req.method === 'POST' && path === '/cart/add.js') {
      const b = await body(req);
      const items = itemsFrom(b);
      for (const it of items) {
        if (!variantIndex.has(String(it.id))) return json(404, { status: 404, message: 'Cart Error', description: 'Product not found' });
        const same = lines.find((l) => String(l.id) === String(it.id) && JSON.stringify(l.properties) === JSON.stringify(it.properties));
        if (same) same.quantity += it.quantity;
        else lines.push({ id: Number(it.id), quantity: it.quantity, properties: it.properties });
      }
      const ids = Array.isArray(b.sections) ? b.sections : String(b.sections || '').split(',').filter(Boolean);
      return json(200, { items, sections: await sectionsFor(ids, locale, url) });
    }
    if (req.method === 'POST' && path === '/cart/change.js') {
      const b = await body(req);
      const i = Number(b.line) - 1;
      if (Number(b.quantity) === 0) lines.splice(i, 1);
      else lines[i].quantity = Number(b.quantity);
      return json(200, { sections: await sectionsFor(b.sections ?? [], locale, url) });
    }
    if (req.method === 'POST' && path === '/cart/update.js') {
      const b = await body(req);
      for (const [k, v] of Object.entries(b.attributes ?? {})) {
        if (v === '' || v == null) delete attributes[k];
        else attributes[k] = String(v);
      }
      const remove = new Set(Object.entries(b.updates ?? {}).filter(([, q]) => Number(q) === 0).map(([k]) => Number(k.split(':')[1])));
      lines = lines.filter((_, i) => !remove.has(i));
      return json(200, { attributes, sections: await sectionsFor(b.sections ?? [], locale, url) });
    }
    if (path === '/cart.js') return json(200, { attributes, item_count: lines.reduce((s, l) => s + l.quantity, 0) });

    /* App proxy */
    if (path === '/apps/pagi/slots') return json(200, store.slotsResponse());
    if (req.method === 'POST' && path === '/apps/pagi/catering') {
      const { errors, request } = checkCatering(await body(req), { catering: catalog.catering, today: store.now().slice(0, 10) });
      if (errors) return json(422, { errors });
      return json(201, { reference: 'C-0001', message: `Thanks, ${request.name}. We'll email ${request.email} a quote within a day.` });
    }

    /* Checkout stand-in: the Validation decides */
    if ((req.method === 'POST' && path === '/cart') || path === '/checkout') {
      const result = cartValidationsGenerateRun(validationInput());
      const errors = result.operations.flatMap((o) => o.validationAdd.errors.map((e) => e.message));
      if (!lines.length) errors.push('Your cart is empty.');
      return send(200, checkoutPage({ cart: cartFor(buildCatalog(locale)), money, errors, slotLabel: slotLabel() }));
    }
    if (req.method === 'POST' && path === '/checkout/complete') {
      const b = await body(req);
      const errors = cartValidationsGenerateRun(validationInput()).operations;
      if (errors.length || !lines.length) return send(303, '', 'text/plain', { Location: '/checkout' });
      const cart = cartFor(buildCatalog('en'));
      const dishes = cart.items.filter((i) => i.product.type === 'Menu');
      const label = slotLabel();
      const date = attributes.pickup_slot?.slice(0, 10) ?? '';
      let name = null;
      if (dishes.length) {
        name = store.addOrder({
          slot: attributes.pickup_slot,
          fulfilment: attributes.fulfilment === 'delivery' ? 'delivery' : 'pickup',
          dishes: dishes.reduce((n, i) => n + i.quantity, 0),
          customer: String(b.name || 'Guest').slice(0, 60),
          items: dishes.map((i) => ({
            title: i.product.title,
            quantity: i.quantity,
            notes: Object.entries(i.properties).filter(([k, v]) => !k.startsWith('_') && v).map(([k, v]) => `${k}: ${v}`),
          })),
        });
      }
      lines = [];
      attributes = {};
      return send(200, thankYouPage({ name: name ?? '#online', date, slotLabel: label || 'Beans ship in 1–2 days; gift cards are on their way by email.' }));
    }

    /* Kitchen board (pagi-ops in production) */
    if (path === '/kitchen') {
      const today = store.now().slice(0, 10);
      const q = url.searchParams.get('date');
      const date = /^\d{4}-\d{2}-\d{2}$/.test(q ?? '') ? q : today;
      return send(200, renderBoard({ date, orders: store.ordersOn(date), paused: store.paused(), cfg: store.cfg, used: store.usedFrom(`${date}T00:00`) }));
    }
    let m;
    if (req.method === 'POST' && (m = path.match(/^\/kitchen\/orders\/(\d+)\/(ready|collected)$/))) {
      const slot = store.setStatus(m[1], m[2]);
      return send(303, '', 'text/plain', { Location: `/kitchen?date=${url.searchParams.get('date') ?? ''}${slot ? `#t${slot.slice(11).replace(':', '')}` : ''}` });
    }
    if (req.method === 'POST' && (m = path.match(/^\/kitchen\/slots\/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\/pause$/))) {
      store.togglePause(m[1]);
      return send(303, '', 'text/plain', { Location: `/kitchen?date=${url.searchParams.get('date') ?? ''}#t${m[1].slice(11).replace(':', '')}` });
    }

    /* Storefront pages */
    if (path === '/') return send(200, await renderTemplate('index', locale, url));
    if ((m = path.match(/^\/products\/([\w-]+)$/))) {
      const data = buildCatalog(locale);
      const product = data.products[m[1]];
      if (!product) return send(404, await renderTemplate('404', locale, url));
      return send(200, await renderTemplate('product', locale, url, { product, page_title: product.title }));
    }
    if ((m = path.match(/^\/collections\/([\w-]+)$/))) {
      const c = buildCatalog(locale).collections[m[1]];
      if (!c) return send(404, await renderTemplate('404', locale, url));
      return send(200, await renderTemplate('collection', locale, url, { collection: c, page_title: c.title }));
    }
    if ((m = path.match(/^\/pages\/([\w-]+)$/)) && pages(locale)[m[1]]) {
      const page = pages(locale)[m[1]];
      return send(200, await renderTemplate(`page.${page.template_suffix}`, locale, url, { page, page_title: page.title }));
    }
    if (path === '/cart') return send(200, await renderTemplate('cart', locale, url));
    return send(404, await renderTemplate('404', locale, url));
  } catch (e) {
    console.error(e);
    send(500, `<pre>${String(e.stack).replace(/</g, '&lt;')}</pre>`);
  }
}).listen(PORT, () => console.log(`Pagi preview → http://localhost:${PORT}`));
