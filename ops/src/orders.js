/**
 * Shopify order webhook → what the kitchen needs. Pure, so it's unit-tested on its own.
 *
 * The cart drawer stores the slot as cart attributes, which arrive as `note_attributes`.
 * Dishes are recognised by SKU (MENU-…, set by the seed script): order webhooks don't carry the
 * product type, and the add-on lines the Cart Transform adds (ADD-…) are not dishes.
 */
const attr = (order, name) => order.note_attributes?.find((a) => a.name === name)?.value ?? null;
const isDish = (line) => String(line.sku ?? '').startsWith('MENU-');

export function kitchenOrder(order) {
  const slot = attr(order, 'pickup_slot');
  const fulfilment = attr(order, 'fulfilment');
  const dishLines = (order.line_items ?? []).filter(isDish);
  if (!slot || !dishLines.length) return null; // beans and gift cards: nothing for the kitchen
  return {
    id: String(order.id),
    name: order.name,
    slot,
    fulfilment: fulfilment === 'delivery' ? 'delivery' : 'pickup',
    dishes: dishLines.reduce((n, l) => n + Number(l.quantity), 0),
    customer: [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ') || order.shipping_address?.name || null,
    email: order.email || order.customer?.email || null,
    phone: order.phone || order.shipping_address?.phone || order.customer?.phone || null,
    items: dishLines.map((l) => ({
      title: l.title,
      quantity: Number(l.quantity),
      // Visible line properties: the choices ("Eggs: Poached") and a readable add-on list.
      notes: (l.properties ?? []).filter((p) => p.name && !p.name.startsWith('_') && p.value).map((p) => `${p.name}: ${p.value}`),
    })),
  };
}

/** Tags make slots filterable in Shopify admin too: "slot:2026-10-27T09:15", "pickup". */
export const orderTags = (o) => [`slot:${o.slot}`, o.fulfilment];
