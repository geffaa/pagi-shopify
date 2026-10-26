/**
 * The preview's stand-in for Shopify orders and the pagi-ops database: orders by slot, paused
 * slots, and a few seeded orders so the slot picker and the kitchen board look like a real
 * morning. Slot maths comes from lib/slots.js, the same code the backend runs.
 */
import { availability, configFromShop, localNow, slotState, slotTimes, addDays } from '../lib/slots.js';
import { catalog } from './data.mjs';

export const cfg = configFromShop(catalog.shop);
export const now = () => process.env.PREVIEW_NOW || localNow(catalog.shop.timezone);

const NAMES = ['Ana', 'Wayan', 'Lucas', 'Made', 'Sophie', 'Ketut', 'Noah', 'Putu', 'Mia', 'Komang', 'Jack', 'Dewi', 'Liam', 'Nyoman', 'Emma'];
const DISHES = catalog.menu.filter((m) => m.category !== 'drinks');

/** Deterministic per slot, so a reload doesn't reshuffle the morning. */
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  // Final mix, so strings that differ only in the last character don't land close together.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function seedOrders(at) {
  const orders = [];
  const today = at.slice(0, 10);
  for (const date of [today, addDays(today, 1)]) {
    for (const time of slotTimes(cfg)) {
      const slot = `${date}T${time}`;
      const r = hash(slot);
      const rush = time >= '08:45' && time <= '10:15';
      // Tomorrow's 09:00 and 09:15 are fully booked; 09:30 has two dishes left.
      const target = date !== today && time === '09:00' ? 12 : date !== today && time === '09:15' ? 12 : date !== today && time === '09:30' ? 10 : rush ? Math.floor(r * 11) : r > 0.55 ? Math.floor(r * 6) : 0;
      let left = target;
      let k = 0;
      while (left > 0) {
        const qty = Math.min(left, 1 + Math.floor(hash(slot + k) * 3));
        const dish = DISHES[Math.floor(hash(slot + 'd' + k) * DISHES.length)];
        orders.push({
          slot,
          fulfilment: hash(slot + 'f' + k) > 0.7 ? 'delivery' : 'pickup',
          dishes: qty,
          customer: NAMES[Math.floor(hash(slot + 'n' + k) * NAMES.length)],
          items: [{ title: dish.title, quantity: qty, notes: dish.groups.includes('eggs') ? ['Eggs: Poached'] : [] }],
          status: slot < at ? 'collected' : 'new',
          cancelled: 0,
        });
        left -= qty;
        k++;
      }
    }
  }
  // Number them so the last seeded order is #1000 and the next real one is #1001.
  orders.forEach((o, i) => {
    const number = 1000 - orders.length + i + 1;
    Object.assign(o, { id: String(number), name: `#${number}` });
  });
  return orders;
}

const state = { orders: null, paused: new Set(), number: 1000, day: null };
function ensure() {
  const day = now().slice(0, 10);
  if (state.day !== day) {
    state.orders = seedOrders(now());
    state.day = day;
  }
}

export function usedFrom(from) {
  ensure();
  const used = {};
  for (const o of state.orders) if (!o.cancelled && o.slot >= from) used[o.slot] = (used[o.slot] ?? 0) + o.dishes;
  return used;
}
export const paused = () => [...state.paused].sort();
export const togglePause = (slot) => (state.paused.has(slot) ? state.paused.delete(slot) : state.paused.add(slot));
export function ordersOn(date) {
  ensure();
  return state.orders.filter((o) => !o.cancelled && o.slot.startsWith(date)).sort((a, b) => a.slot.localeCompare(b.slot) || Number(a.id) - Number(b.id));
}
export function setStatus(id, status) {
  ensure();
  const o = state.orders.find((x) => x.id === String(id));
  if (o) o.status = status;
  return o?.slot;
}
export function addOrder(o) {
  ensure();
  const number = ++state.number;
  state.orders.push({ ...o, id: String(number), name: `#${number}`, status: 'new', cancelled: 0 });
  return `#${number}`;
}

export const slotsResponse = () => {
  const at = now();
  return { now: at, earliest: null, days: availability({ now: at, used: usedFrom(at.slice(0, 10)), paused: paused(), cfg }) };
};
/** What pagi-ops would have published to the shop metafield at this moment. */
export const publishedState = () => {
  const at = now();
  return slotState({ now: at, used: usedFrom(at.slice(0, 10)), paused: paused(), cfg });
};
