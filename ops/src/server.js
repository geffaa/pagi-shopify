import { serve } from '@hono/node-server';
import { config, requireConfig } from './config.js';
import { createApp } from './app.js';
import { openDb } from './db.js';
import { createQueue } from './queue.js';
import { createSlotSync } from './state.js';
import { createAdminClient } from '../../scripts/lib/admin.js';

requireConfig('shop', 'clientSecret', 'kitchenPassword');

const db = openDb(config.dbPath);
const queue = createQueue();
const admin = createAdminClient({ ...config, token: config.adminToken, log: (m) => console.log(`[admin] ${m}`) });
const sync = createSlotSync({ db, admin, config });
const app = createApp({ config, db, queue, admin, sync });

// Slots close as the clock moves; republish every minute (it only writes when something changed).
const tick = () => sync.sync().catch((e) => console.error('[slots]', e.message));
tick();
const timer = setInterval(tick, 60_000);

const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => console.log(`pagi-ops listening on :${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    clearInterval(timer);
    server.close();
    await queue.idle();
    process.exit(0);
  });
}
