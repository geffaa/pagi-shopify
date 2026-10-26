/**
 * PAGI — global.js (module, no dependencies)
 * Cart, dialogs, the pickup/delivery slot picker and the opening-hours bar. Page modules
 * (dish.js, catering.js) use the helpers on window.Pagi; importing this file again would load
 * it twice because of Shopify's ?v= asset URLs.
 */
const config = JSON.parse(document.getElementById('theme-config')?.textContent || '{}');
const { routes = {}, strings = {}, shop = {} } = config;
const locale = config.locale === 'id' ? 'id-ID' : 'en-GB';

export function publish(name, data = {}) {
  try {
    window.Shopify?.analytics?.publish?.(`pagi:${name}`, data);
  } catch {
    /* analytics never breaks the page */
  }
}

let toastTimer;
export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3200);
}

/**
 * Formats subunits like Liquid's `money` does. The layout renders a sample (12345600 | money,
 * e.g. "Rp123.456") and the prefix and separators are read back from it.
 */
export function formatMoney(cents, sample = config.moneySample || 'Rp123.456') {
  const m = sample.match(/^(.*?)123(\D?)456(?:(\D)00)?(.*)$/);
  const value = Number(cents) / 100;
  if (!m) return String(Math.round(value));
  const [, prefix, thousands, decimal, suffix] = m;
  const [int, frac] = value.toFixed(decimal ? 2 : 0).split('.');
  return `${prefix}${int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands)}${decimal ? decimal + frac : ''}${suffix}`;
}

/* ---------------------------------------------------------------------- */
/* Cart: every change re-renders the cart sections in the same response.  */
/* ---------------------------------------------------------------------- */

const parse = (html) => new DOMParser().parseFromString(html, 'text/html');

function cartSections() {
  const ids = new Set(['cart-drawer']);
  document.querySelectorAll('[data-cart-root]').forEach((el) => ids.add(el.dataset.cartRoot));
  return [...ids];
}

function renderSections(sections = {}) {
  let count;
  for (const [id, html] of Object.entries(sections)) {
    if (!html) continue;
    const next = parse(html).querySelector(`[data-cart-root="${id}"]`);
    const current = document.querySelector(`[data-cart-root="${id}"]`);
    if (next && current) current.replaceWith(next);
    if (next?.dataset.count !== undefined) count = next.dataset.count;
  }
  if (count !== undefined) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.dataset.count = count;
    });
  }
}

async function cartPost(path, body, { sections = true } = {}) {
  const ids = sections ? cartSections() : [];
  const isForm = body instanceof FormData;
  if (isForm && ids.length) {
    body.append('sections', ids.join(','));
    body.append('sections_url', window.location.pathname);
  }
  const res = await fetch(`${path}.js`, {
    method: 'POST',
    headers: isForm ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: isForm ? body : JSON.stringify(ids.length ? { ...body, sections: ids, sections_url: window.location.pathname } : body),
  });
  const data = await res.json();
  if (!res.ok || data.status) throw new Error(data.description || data.message || strings.error);
  if (ids.length) renderSections(data.sections);
  return data;
}

export async function addToCart(body) {
  const data = await cartPost(routes.cartAdd, body);
  openDialog('cart-drawer');
  return data;
}
export const changeLine = (line, quantity) => cartPost(routes.cartChange, { line, quantity });
/** Cart attributes only: no re-render, so the slot picker doesn't flicker. */
export const saveAttributes = (attributes) => cartPost(routes.cartUpdate, { attributes }, { sections: false });

/* ---------------------------------------------------------------------- */
/* Dialogs                                                                 */
/* ---------------------------------------------------------------------- */

export function openDialog(id) {
  const d = document.getElementById(id);
  if (!d || d.open) return;
  d._opener = document.activeElement;
  d.showModal();
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-dialog]');
  if (opener && document.getElementById(opener.dataset.openDialog)) {
    e.preventDefault();
    return openDialog(opener.dataset.openDialog);
  }
  const closer = e.target.closest('[data-close-dialog]');
  if (closer) return closer.closest('dialog')?.close();
  if (e.target instanceof HTMLDialogElement && e.target.open) {
    const r = e.target.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
  }
});
document.addEventListener('close', (e) => e.target._opener?.focus?.({ preventScroll: true }), true);

/* ---------------------------------------------------------------------- */
/* Components                                                              */
/* ---------------------------------------------------------------------- */

class CartItems extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => {
      const line = e.target.closest('[data-line]');
      if (!line) return;
      const input = line.querySelector('[data-qty]');
      if (e.target.closest('[data-remove]')) return this.set(line, 0);
      const step = e.target.closest('[data-step]');
      if (step) this.set(line, Math.max(0, Number(input.value) + Number(step.dataset.step)));
    });
    this.addEventListener('change', (e) => {
      if (e.target.matches('[data-qty]')) this.set(e.target.closest('[data-line]'), Math.max(0, Number(e.target.value) || 0));
    });
  }

  async set(line, qty) {
    line.classList.add('line--busy');
    try {
      await changeLine(Number(line.dataset.line), qty);
    } catch (err) {
      line.classList.remove('line--busy');
      toast(err.message);
    }
  }
}
customElements.define('cart-items', CartItems);

/** Beans and gift cards: a variant picker and a plain add. */
class ProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.form.addEventListener('change', (e) => {
      if (e.target.name === 'id' && e.target.dataset.price) this.querySelector('[data-total]').textContent = formatMoney(e.target.dataset.price);
    });
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = this.form.querySelector('[type=submit]');
      const error = this.querySelector('[data-error]');
      btn.setAttribute('aria-busy', 'true');
      error.hidden = true;
      try {
        await addToCart(new FormData(this.form));
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }
}
customElements.define('product-form', ProductForm);

/** One-tap add for dishes without choices (a jamu shot). */
class QuickAdd extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', async () => {
      const btn = this.querySelector('button');
      btn.setAttribute('aria-busy', 'true');
      try {
        await addToCart({ items: [{ id: Number(this.dataset.variant), quantity: 1 }] });
      } catch (err) {
        toast(err.message);
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }
}
customElements.define('quick-add', QuickAdd);

/* ---------------------------------------------------------------------- */
/* Pickup / delivery slot picker                                           */
/* ---------------------------------------------------------------------- */

let slotCache = null;
async function loadSlots(force = false) {
  if (!force && slotCache && Date.now() - slotCache.at < 60_000) return slotCache.data;
  const res = await fetch(shop.slots, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`slots ${res.status}`);
  const data = await res.json();
  slotCache = { at: Date.now(), data };
  return data;
}

const addDays = (date, n) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

class FulfilmentPicker extends HTMLElement {
  async connectedCallback() {
    this.selected = this.dataset.slot || '';
    this.fulfilment = this.dataset.fulfilment || 'pickup';
    this.msg = this.querySelector('[data-slot-msg]');
    this.addEventListener('change', (e) => e.target.name === 'fulfilment' && this.setFulfilment(e.target.value));
    this.addEventListener('click', (e) => {
      const day = e.target.closest('[data-day]');
      if (day) {
        this.day = day.dataset.day;
        return this.render();
      }
      const t = e.target.closest('[data-slot]');
      if (t && !t.disabled) this.choose(t.dataset.slot);
      if (e.target.closest('[data-retry]')) this.load(true);
    });
    await this.load();
  }

  async load(force = false) {
    try {
      this.data = await loadSlots(force);
    } catch {
      this.querySelector('[data-times]').innerHTML = `<p class="xsmall">${strings.slotsError} <button type="button" class="link" data-retry>${strings.retry}</button></p>`;
      return;
    }
    const slots = this.data.days.flatMap((d) => d.slots);
    if (this.selected && !slots.find((s) => s.slot === this.selected)?.open) {
      // The slot passed or filled while the cart sat open.
      this.selected = '';
      this.msg.textContent = strings.slotGone;
      saveAttributes({ pickup_slot: '' }).catch(() => {});
    }
    const firstOpen = slots.find((s) => s.open);
    this.day = this.selected.slice(0, 10) || firstOpen?.slot.slice(0, 10) || this.data.days[0]?.date;
    this.render();
    this.gate();
  }

  dayLabel(date) {
    const today = this.data.now.slice(0, 10);
    if (date === today) return strings.today;
    if (date === addDays(today, 1)) return strings.tomorrow;
    return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
  }

  render() {
    const days = this.data.days.filter((d) => d.slots.some((s) => s.reason !== 'passed'));
    this.querySelector('[data-days]').innerHTML = days
      .map((d) => `<button type="button" role="tab" class="chip" data-day="${d.date}" aria-selected="${d.date === this.day}">${this.dayLabel(d.date)}</button>`)
      .join('');
    const day = days.find((d) => d.date === this.day) ?? days[0];
    const visible = day ? day.slots.filter((s) => s.reason !== 'passed') : [];
    this.querySelector('[data-times]').innerHTML = visible.length
      ? visible
          .map((s) => {
            const note = !s.open ? strings.full : s.left <= 3 ? (s.left === 1 ? strings.leftOne : strings.leftOther.replace('{n}', s.left)) : '';
            return `<button type="button" class="time${s.left <= 3 && s.open ? ' time--low' : ''}" data-slot="${s.slot}" aria-pressed="${s.slot === this.selected}" ${s.open ? '' : 'disabled'}>
              <b>${s.time}</b>${note ? `<small>${note}</small>` : ''}</button>`;
          })
          .join('')
      : `<p class="xsmall muted">${strings.noSlots}</p>`;
  }

  gate() {
    const root = this.closest('[data-cart-root]');
    const btn = root?.querySelector('[data-checkout]');
    if (btn) btn.disabled = !this.selected;
    const hint = root?.querySelector('[data-checkout-hint]');
    if (hint) hint.hidden = Boolean(this.selected);
  }

  async choose(slot) {
    this.selected = slot;
    this.render();
    this.gate();
    this.msg.textContent = strings.readyAt.replace('{time}', slot.slice(11));
    try {
      await saveAttributes({ fulfilment: this.fulfilment, pickup_slot: slot });
      publish('slot_chosen', { fulfilment: this.fulfilment, slot });
    } catch (err) {
      toast(err.message);
    }
  }

  async setFulfilment(value) {
    this.fulfilment = value;
    this.querySelectorAll('[data-when]').forEach((el) => (el.hidden = el.dataset.when !== value));
    this.querySelector('[data-delivery-note]').hidden = value !== 'delivery';
    await saveAttributes({ fulfilment: value }).catch((err) => toast(err.message));
  }
}
customElements.define('fulfilment-picker', FulfilmentPicker);

/* ---------------------------------------------------------------------- */
/* Opening status, in shop time whatever the visitor's clock says          */
/* ---------------------------------------------------------------------- */

function shopMinutes() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: shop.timeZone || 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value])
  );
  return Number(p.hour) * 60 + Number(p.minute);
}
const toMin = (hhmm = '00:00') => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));
const bar = document.querySelector('[data-open-status]');
if (bar && shop.open) {
  const now = shopMinutes();
  const state = now < toMin(shop.open) ? 'soon' : now <= toMin(shop.kitchenClose) ? 'open' : 'closed';
  bar.textContent = { open: strings.statusOpen, soon: strings.statusSoon, closed: strings.statusClosed }[state];
  bar.dataset.state = state;
  bar.hidden = false;
}

window.Pagi = { config, routes, strings, publish, toast, formatMoney, addToCart, saveAttributes, openDialog };
