/**
 * Stand-in for Shopify's checkout, so the demo can show the Validation doing its job. On a
 * real store none of this is theme code: checkout is Shopify's, and the pickup-slot Function
 * runs inside it and blocks "Pay now" with the same messages.
 */
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const shell = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>
body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#f6f6f7;color:#1a1a1a}
.wrap{max-width:980px;margin:auto;padding:24px 16px;display:grid;gap:24px}
@media(min-width:860px){.wrap{grid-template-columns:1.2fr 1fr}}
.panel{background:#fff;border:1px solid #e3e3e3;border-radius:12px;padding:20px;display:grid;gap:14px;align-content:start}
h1{font-size:22px;margin:0}h2{font-size:17px;margin:0}
.note{font-size:13px;color:#616161;background:#fff8e6;border:1px solid #f1d7a0;border-radius:8px;padding:10px 12px}
.err{background:#fff1f0;border:1px solid #f3b7b1;color:#8e1f0b;border-radius:8px;padding:12px 14px}
.err li{margin:2px 0}
label{display:grid;gap:4px;font-size:14px}input{font:inherit;padding:12px;border:1px solid #c9c9c9;border-radius:8px}
button,.btn{font:inherit;font-weight:600;padding:14px 18px;border:0;border-radius:8px;background:#1a1a1a;color:#fff;cursor:pointer;text-align:center;text-decoration:none}
.btn--ghost{background:#fff;color:#1a1a1a;border:1px solid #c9c9c9}
.row{display:flex;justify-content:space-between;gap:12px}.muted{color:#616161;font-size:14px}.total{font-weight:700;font-size:18px}
</style></head><body><div class="wrap">${body}</div></body></html>`;

export function checkoutPage({ cart, money, errors, slotLabel, base = '' }) {
  const lines = cart.items
    .map((i) => `<div class="row"><span>${i.quantity}× ${esc(i.product.title)}<br><span class="muted">${Object.entries(i.properties).filter(([k, v]) => !k.startsWith('_') && v).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</span></span><span>${money(i.final_line_price)}</span></div>`)
    .join('');
  const summary = `<section class="panel"><h2>Order summary</h2>${lines}<div class="row total"><span>Total</span><span>${money(cart.total_price)}</span></div>
    <p class="muted">${slotLabel ? esc(slotLabel) : 'No pickup or delivery time'}</p></section>`;
  const blocked = errors.length
    ? `<div class="err"><b>Your order can't be placed yet</b><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>
       <a class="btn btn--ghost" href="${base}/cart">Return to cart</a>`
    : `<form method="post" action="${base}/checkout/complete" style="display:grid;gap:14px">
         <label>Name for the order<input name="name" value="Demo guest" required></label>
         <label>WhatsApp<input name="phone" value="+62 812 0000 0000"></label>
         <button type="submit">Place order (demo, no payment)</button>
       </form>`;
  return shell(
    'Checkout',
    `<section class="panel"><h1>Checkout</h1>
      <p class="note">Demo checkout. On Shopify this page is Shopify's own; the pickup-slot Validation Function runs here and gives these exact messages. This one ran the same Function code on your cart.</p>
      ${blocked}</section>${summary}`
  );
}

export const thankYouPage = ({ name, slotLabel, date = '', base = '' }) =>
  shell(
    'Order placed',
    `<section class="panel"><h1>Order ${esc(name)} placed</h1><p>${esc(slotLabel)}</p>
      <p class="muted">Your order now counts against that slot's kitchen capacity, so the slot picker shows fewer dishes left.</p>
      <a class="btn" href="${base}/kitchen${date ? `?date=${date}` : ''}">See it on the kitchen board</a><a class="btn btn--ghost" href="${base}/">Back to the shop</a></section>`
  );
