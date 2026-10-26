/**
 * Pickup and delivery slots for food orders.
 *
 * A cart with dishes (product type "Menu") needs a slot, chosen in the cart drawer and stored as
 * cart attributes: `fulfilment` (pickup | delivery) and `pickup_slot` ("2026-10-27T09:15", shop
 * time). This check runs at checkout and blocks it with a message when:
 *   - the slot is missing or malformed, before today, or more than `days_ahead` days out;
 *   - the time is outside the kitchen's hours or not on a slot boundary;
 *   - the slot has passed or is full: Functions can't read the clock or call a server, so the
 *     ops backend writes `pagi.slot_state` on the shop ({ closed: [...], used: { slot: dishes } })
 *     whenever an order comes in and every few minutes;
 *   - this order alone would go over what the kitchen has left in that slot;
 *   - an add-on isn't one the dish offers (see lib/modifiers.js).
 * Beans and gift cards ship or arrive by email, so carts with only those need no slot.
 */
import { checkMods, parseMods, parseModifiers } from '../../../lib/modifiers.js';

export const DEFAULTS = { open: '08:00', kitchen_close: '15:30', slot_minutes: 15, days_ahead: 2, dishes_per_slot: 12 };

export function parseConfig(metafield) {
  try {
    return { ...DEFAULTS, ...JSON.parse(metafield?.value ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

function parseState(metafield) {
  try {
    const s = JSON.parse(metafield?.value ?? '{}');
    return { closed: Array.isArray(s.closed) ? s.closed : [], used: s.used && typeof s.used === 'object' ? s.used : {} };
  } catch {
    return { closed: [], used: {} };
  }
}

const minutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const dayIndex = (iso) => Math.floor(Date.UTC(...iso.split('-').map((n, i) => Number(n) - (i === 1 ? 1 : 0))) / 86_400_000);
const label = (slot) => slot.slice(11, 16);

export function validateCart(input) {
  const errors = [];
  const add = (message) => errors.push({ message, target: '$.cart' });
  const cfg = parseConfig(input.validation?.config);
  const state = parseState(input.shop?.slotState);

  const dishes = input.cart.lines.filter((l) => l.merchandise?.__typename === 'ProductVariant' && l.merchandise.product?.productType === 'Menu');
  for (const l of dishes) {
    const { ok } = checkMods(parseMods(l.mods), parseModifiers(l.merchandise.product.modifiers));
    if (!ok) add(`One of the add-ons on ${l.merchandise.product.title} isn't available. Remove it and add it again.`);
  }
  if (!dishes.length) return errors;

  const fulfilment = input.cart.fulfilment?.value;
  if (fulfilment !== 'pickup' && fulfilment !== 'delivery') {
    add('Choose pickup or delivery for your food order.');
    return errors;
  }
  const slot = input.cart.slot?.value ?? '';
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(slot);
  if (!m) {
    add(`Choose a ${fulfilment} time for your food order.`);
    return errors;
  }
  const [, date, time] = m;
  const today = input.shop?.localTime?.date;
  if (today) {
    const ahead = dayIndex(date) - dayIndex(today);
    if (ahead < 0) return add(`That ${fulfilment} time has passed. Choose another.`), errors;
    if (ahead > cfg.days_ahead) return add(`We take orders up to ${cfg.days_ahead} days ahead.`), errors;
  }
  const t = minutes(time);
  if (t < minutes(cfg.open) || t > minutes(cfg.kitchen_close) || (t - minutes(cfg.open)) % cfg.slot_minutes !== 0) {
    add(`The kitchen takes orders for ${cfg.open}–${cfg.kitchen_close}. Choose a time in those hours.`);
    return errors;
  }
  if (state.closed.includes(slot)) {
    add(`${label(slot)} is no longer available. Choose another time.`);
    return errors;
  }
  const count = dishes.reduce((n, l) => n + l.quantity, 0);
  const left = cfg.dishes_per_slot - Number(state.used[slot] ?? 0);
  if (count > left) add(left > 0 ? `Only ${left} more dishes fit in the ${label(slot)} slot. Choose a later time or split the order.` : `${label(slot)} is full. Choose another time.`);
  return errors;
}

export function cartValidationsGenerateRun(input) {
  const errors = validateCart(input);
  return { operations: errors.length ? [{ validationAdd: { errors } }] : [] };
}
