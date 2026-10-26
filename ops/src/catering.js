import { addDays } from '../../lib/slots.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Checks a catering request. Returns { errors } or { request } (normalised). */
export function checkCatering(body, { catering, today }) {
  const errors = {};
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const phone = String(body.phone ?? '').trim();
  const date = String(body.date ?? '');
  const guests = Number(body.guests);
  const pkg = catering.packages.find((p) => p.key === body.package);
  if (!name || name.length > 120) errors.name = 'Tell us your name.';
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Enter a valid email.';
  if (phone && !/^\+?[\d\s-]{7,20}$/.test(phone)) errors.phone = 'Enter a phone number with digits only.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < addDays(today, catering.min_days_ahead))
    errors.date = `Choose a date at least ${catering.min_days_ahead} days from today.`;
  if (!Number.isInteger(guests) || guests < catering.min_guests || guests > catering.max_guests)
    errors.guests = `We cater for ${catering.min_guests} to ${catering.max_guests} guests.`;
  if (!pkg) errors.package = 'Choose a package.';
  if (Object.keys(errors).length) return { errors };
  const notes = String(body.notes ?? '').trim().slice(0, 1000);
  return { request: { name, email, phone: phone || null, date, guests, package: pkg.key, pkg, notes: notes || null } };
}

const DRAFT = `
  mutation Draft($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) { draftOrder { id name } userErrors { field message } }
  }`;

/**
 * A draft order the team prices and sends from Shopify admin ("Send invoice"), so the customer
 * pays a deposit through Shopify checkout. Staying in Shopify keeps catering revenue in the same
 * reports and payouts as the café's online orders.
 */
export async function createCateringDraft(admin, r, id) {
  const data = await admin.graphql(DRAFT, {
    input: {
      email: r.email,
      phone: r.phone ?? undefined,
      note: [`Catering request #${id}`, `Event date: ${r.date}`, `Guests: ${r.guests}`, r.notes && `Notes: ${r.notes}`].filter(Boolean).join('\n'),
      tags: ['catering', `event:${r.date}`],
      customAttributes: [
        { key: 'event_date', value: r.date },
        { key: 'guests', value: String(r.guests) },
        { key: 'contact_name', value: r.name },
      ],
      lineItems: [
        {
          title: `${r.pkg.title} (per guest)`,
          quantity: r.guests,
          originalUnitPriceWithCurrency: { amount: String(r.pkg.per_guest), currencyCode: 'IDR' },
          requiresShipping: false,
          taxable: false, // prices already include PB1
        },
      ],
    },
  });
  admin.assertNoUserErrors(data.draftOrderCreate, 'draftOrderCreate');
  return data.draftOrderCreate.draftOrder;
}
