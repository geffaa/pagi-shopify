import { Hono } from 'hono';
import { basicAuth } from 'hono/basic-auth';
import { HTTPException } from 'hono/http-exception';
import { verifyProxySignature, verifyWebhook } from './hmac.js';
import { kitchenOrder, orderTags } from './orders.js';
import { renderBoard } from './kitchen.js';
import { checkCatering, createCateringDraft } from './catering.js';
import { gid } from '../../scripts/lib/admin.js';

const TAGS = `mutation Tag($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { field message } } }`;

/** Webhook topic → handler. Handlers are idempotent: Shopify delivers at least once. */
export const handlers = {
  async 'orders/create'(order, { db, admin, sync }) {
    const o = kitchenOrder(order);
    if (!o) return;
    if (db.addOrder(o)) await sync();
    if (admin) admin.assertNoUserErrors((await admin.graphql(TAGS, { id: gid('Order', o.id), tags: orderTags(o) })).tagsAdd, 'tagsAdd');
  },
  async 'orders/cancelled'(order, { db, sync }) {
    if (db.cancelOrder(order.id)) await sync(); // the slot's dishes free up again
  },
  async 'app/uninstalled'(_p, { db }) {
    db.purge();
  },
  async 'customers/data_request'(p, { db, log }) {
    log.info(`[privacy] data request for ${p.customer?.email}: ${JSON.stringify(db.dataFor(p.customer?.email))}`);
  },
  async 'customers/redact'(p, { db }) {
    db.redactCustomer(p.customer?.email);
  },
  async 'shop/redact'(_p, { db }) {
    db.purge();
  },
};

/**
 * HTTP surface, as a factory so tests inject an in-memory DB, a fake Admin client and a clock.
 *   POST /webhooks              every topic, HMAC-verified
 *   GET  /proxy/slots           app proxy (/apps/pagi/slots): open slots for the cart drawer
 *   POST /proxy/catering        app proxy (/apps/pagi/catering): request → draft order
 *   GET  /kitchen               the board, behind a password
 */
export function createApp({ config, db, queue, admin, sync, log = console }) {
  const app = new Hono();
  const signed = (c) => verifyProxySignature(new URL(c.req.url).searchParams, config.clientSecret);

  app.get('/healthz', (c) => c.json({ ok: true, queue: queue.size }));

  app.post('/webhooks', async (c) => {
    const raw = Buffer.from(await c.req.arrayBuffer());
    if (!verifyWebhook(raw, c.req.header('x-shopify-hmac-sha256'), config.clientSecret)) return c.json({ error: 'invalid hmac' }, 401);
    const topic = c.req.header('x-shopify-topic');
    const id = c.req.header('x-shopify-webhook-id') || c.req.header('x-shopify-event-id');
    const handler = handlers[topic];
    if (!handler) return c.json({ ignored: topic });
    if (!db.recordWebhook(id, topic)) return c.json({ duplicate: true });
    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8'));
    } catch {
      db.markWebhook(id, 'failed', 'invalid json');
      return c.json({ error: 'invalid json' }, 400);
    }
    // Acknowledge now, work in the queue: Shopify wants an answer within 5 seconds.
    queue.push(`${topic}#${id}`, () => handler(payload, { db, admin, sync: sync.sync, log }), {
      onDone: () => db.markWebhook(id, 'done'),
      onFail: (e) => db.markWebhook(id, 'failed', e.message),
    });
    return c.json({ queued: true });
  });

  app.get('/proxy/slots', (c) => {
    if (!signed(c)) return c.json({ error: 'invalid signature' }, 401);
    c.header('Cache-Control', 'no-store');
    return c.json(sync.availability());
  });

  app.post('/proxy/catering', async (c) => {
    if (!signed(c)) return c.json({ error: 'invalid signature' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const { errors, request } = checkCatering(body, { catering: config.catering, today: sync.availability().now.slice(0, 10) });
    if (errors) return c.json({ errors }, 422);
    const id = db.addCatering(request);
    if (admin) {
      const draft = await createCateringDraft(admin, request, id);
      db.setCateringDraft(id, draft.id);
    }
    return c.json({ reference: `C-${String(id).padStart(4, '0')}`, message: `Thanks, ${request.name}. We'll email ${request.email} a quote within a day.` }, 201);
  });

  if (config.kitchenPassword) {
    const auth = basicAuth({ username: 'kitchen', password: config.kitchenPassword });
    app.use('/kitchen', auth);
    app.use('/kitchen/*', auth);
  }
  // Back to the board, scrolled to the slot that was just changed.
  const back = (c, slot) => c.redirect(`/kitchen?date=${encodeURIComponent(c.req.query('date') ?? '')}${slot ? `#t${slot.slice(11).replace(':', '')}` : ''}`, 303);
  app.get('/kitchen', (c) => {
    const today = sync.availability().now.slice(0, 10);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(c.req.query('date') ?? '') ? c.req.query('date') : today;
    return c.html(renderBoard({ date, orders: db.ordersOn(date), paused: db.paused(), cfg: config.slots, used: db.usedFrom(`${date}T00:00`) }));
  });
  app.post('/kitchen/orders/:id/:status{ready|collected}', (c) => {
    db.setStatus(c.req.param('id'), c.req.param('status'));
    return back(c, db.order(c.req.param('id'))?.slot);
  });
  app.post('/kitchen/slots/:slot/pause', async (c) => {
    const slot = c.req.param('slot');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(slot)) return c.text('bad slot', 400);
    db.togglePause(slot);
    await sync.sync();
    return back(c, slot);
  });

  app.onError((err, c) => {
    if (err instanceof HTTPException) return err.getResponse();
    log.error(err);
    return c.json({ error: 'internal error' }, 500);
  });
  return app;
}
