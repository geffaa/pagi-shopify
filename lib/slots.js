/**
 * Pickup and delivery slots: one implementation for the ops backend, the preview and the tests.
 *
 * Times are shop-local strings ("2026-10-27T09:15"), because the kitchen thinks in Bali time
 * and the checkout Function only knows the shop's local date. A slot holds a number of dishes
 * (the kitchen's real limit), not a number of orders.
 */

export const configFromShop = (shop) => ({
  open: shop.hours.open,
  kitchen_close: shop.hours.kitchen_close,
  slot_minutes: shop.slot_minutes,
  lead_minutes: shop.lead_minutes,
  days_ahead: shop.days_ahead,
  dishes_per_slot: shop.dishes_per_slot,
});

const pad = (n) => String(n).padStart(2, '0');
export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHhmm = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** The shop's wall-clock time, as "YYYY-MM-DDTHH:MM". */
export function localNow(timeZone, at = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(at)
      .map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function slotTimes(cfg) {
  const out = [];
  for (let t = toMinutes(cfg.open); t <= toMinutes(cfg.kitchen_close); t += cfg.slot_minutes) out.push(toHhmm(t));
  return out;
}

/** Every slot from today to the last bookable day. */
export function windowSlots(now, cfg) {
  const today = now.slice(0, 10);
  const days = Array.from({ length: cfg.days_ahead + 1 }, (_, i) => addDays(today, i));
  return days.flatMap((d) => slotTimes(cfg).map((t) => `${d}T${t}`));
}

/** Too soon to cook for: earlier than now + lead time. String comparison works on this format. */
export function earliest(now, cfg) {
  const t = toMinutes(now.slice(11)) + cfg.lead_minutes;
  const date = addDays(now.slice(0, 10), Math.floor(t / 1440));
  return `${date}T${toHhmm(t % 1440)}`;
}

/**
 * Per-slot view of the window. `used` maps slot → dishes already ordered; `paused` lists slots
 * the kitchen switched off (a big catering order, a short staff day).
 */
export function availability({ now, used = {}, paused = [], cfg }) {
  const first = earliest(now, cfg);
  const off = new Set(paused);
  const days = new Map();
  for (const slot of windowSlots(now, cfg)) {
    const left = Math.max(0, cfg.dishes_per_slot - Number(used[slot] ?? 0));
    const reason = slot < first ? 'passed' : off.has(slot) ? 'paused' : left === 0 ? 'full' : null;
    const date = slot.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push({ slot, time: slot.slice(11), left: reason ? 0 : left, open: !reason, reason });
  }
  return [...days].map(([date, slots]) => ({ date, slots }));
}

/**
 * What the checkout Function reads from the `pagi.slot_state` shop metafield. Functions can't
 * see the clock or call out, so the backend publishes which slots are closed and how full the
 * open ones are; the Function enforces it.
 */
export function slotState(args) {
  const closed = [];
  const used = {};
  for (const day of availability(args)) {
    for (const s of day.slots) {
      if (!s.open) closed.push(s.slot);
      else if (args.used?.[s.slot]) used[s.slot] = Number(args.used[s.slot]);
    }
  }
  return { closed, used };
}

/** Dishes in a cart or order: lines of product type "Menu" (add-ons are not dishes). */
export const countDishes = (lines, isDish) => lines.reduce((n, l) => n + (isDish(l) ? Number(l.quantity) : 0), 0);
