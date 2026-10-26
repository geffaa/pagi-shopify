import { slotTimes } from '../../lib/slots.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * The kitchen board: today's (or any day's) orders grouped by slot, on the pass tablet.
 * Server-rendered, no build step, refreshes itself every 30 seconds. Over-capacity slots are
 * flagged: two checkouts can both pass before the published state catches up.
 */
export function renderBoard({ date, orders, paused, cfg, used }) {
  const bySlot = Map.groupBy(orders, (o) => o.slot.slice(11));
  const off = new Set(paused);
  const rows = slotTimes(cfg)
    .map((time) => {
      const slot = `${date}T${time}`;
      const list = bySlot.get(time) ?? [];
      const n = used[slot] ?? 0;
      const over = n > cfg.dishes_per_slot;
      const cards = list
        .map(
          (o) => `<article class="card ${o.status}">
  <header><b>${esc(o.name)}</b> <span class="tag ${o.fulfilment}">${o.fulfilment}</span> <span>${esc(o.customer ?? '')}</span></header>
  <ul>${o.items.map((i) => `<li><b>${i.quantity}×</b> ${esc(i.title)}${i.notes.length ? `<small>${i.notes.map(esc).join(' · ')}</small>` : ''}</li>`).join('')}</ul>
  <form method="post" action="kitchen/orders/${esc(o.id)}/${o.status === 'ready' ? 'collected' : 'ready'}?date=${date}">
    ${o.status === 'collected' ? '<em>Collected</em>' : `<button>${o.status === 'ready' ? 'Collected' : 'Ready'}</button>`}
  </form>
</article>`
        )
        .join('');
      return `<section id="t${time.replace(':', '')}" class="slot${over ? ' over' : ''}${off.has(slot) ? ' paused' : ''}${list.length ? '' : ' empty'}">
  <h2>${time} <span>${n}/${cfg.dishes_per_slot} dishes${over ? ' · over capacity' : ''}</span>
    <form method="post" action="kitchen/slots/${slot}/pause?date=${date}"><button class="link">${off.has(slot) ? 'Resume' : 'Pause'}</button></form></h2>
  ${cards}
</section>`;
    })
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="30"><title>Kitchen · ${date}</title>
<style>
body{margin:0;font:15px/1.4 system-ui,sans-serif;background:#1d1a16;color:#f4ece0}
main{padding:16px;display:grid;gap:10px;max-width:1100px;margin:auto}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:0 0 8px;display:flex;gap:10px;align-items:center}h2 span{font-weight:400;opacity:.7}
.slot{background:#2a2520;border-radius:10px;padding:10px 12px;scroll-margin-top:120px}.slot.empty{opacity:.45}.slot.over{outline:2px solid #ff7a59}.slot.paused{background:repeating-linear-gradient(45deg,#2a2520 0 10px,#332c25 10px 20px)}
.card{background:#f4ece0;color:#1d1a16;border-radius:8px;padding:8px 10px;margin:6px 0;display:grid;grid-template-columns:1fr auto;gap:4px 12px}
.card header{grid-column:1/-1}.card ul{margin:0;padding-left:18px}.card small{display:block;color:#6b5d4d}.card.ready{background:#d5ecc2}.card.collected{opacity:.5}
.tag{font-size:12px;padding:1px 8px;border-radius:99px;background:#e9b44c}.tag.delivery{background:#8fc1e3}
button{font:inherit;padding:8px 16px;border:0;border-radius:6px;background:#1d1a16;color:#f4ece0;cursor:pointer}button.link{background:none;color:inherit;opacity:.7;padding:0;text-decoration:underline}
form{margin:0;align-self:end}h2 form{margin-left:auto}
</style></head><body><main>
<h1>Kitchen · ${date}</h1>
<form method="get" action="kitchen"><input type="date" name="date" value="${date}"> <button>Show</button></form>
${rows}
</main></body></html>`;
}
