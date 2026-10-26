import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * SQLite via node:sqlite. Holds what the kitchen needs and Shopify doesn't index for us:
 * dishes per slot, the board's status per order, paused slots and catering requests.
 */
export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS webhook_events (
      webhook_id  TEXT PRIMARY KEY,
      topic       TEXT NOT NULL,
      received_at TEXT NOT NULL DEFAULT (datetime('now')),
      status      TEXT NOT NULL DEFAULT 'queued',
      error       TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      slot       TEXT NOT NULL,
      fulfilment TEXT NOT NULL,
      dishes     INTEGER NOT NULL,
      customer   TEXT,
      email      TEXT,
      phone      TEXT,
      items      TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'new',
      cancelled  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_orders_slot ON orders (slot) WHERE cancelled = 0;
    CREATE TABLE IF NOT EXISTS paused_slots (slot TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS catering (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      email          TEXT NOT NULL,
      phone          TEXT,
      event_date     TEXT NOT NULL,
      guests         INTEGER NOT NULL,
      package        TEXT NOT NULL,
      notes          TEXT,
      draft_order_id TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const plain = (rows) => rows.map((r) => ({ ...r }));

  return {
    raw: db,
    recordWebhook(id, topic) {
      return db.prepare('INSERT OR IGNORE INTO webhook_events (webhook_id, topic) VALUES (?, ?)').run(id, topic).changes === 1;
    },
    markWebhook(id, status, error = null) {
      db.prepare('UPDATE webhook_events SET status = ?, error = ? WHERE webhook_id = ?').run(status, error, id);
    },

    /** Idempotent: a redelivered order doesn't count twice. */
    addOrder(o) {
      return db
        .prepare(
          `INSERT OR IGNORE INTO orders (id, name, slot, fulfilment, dishes, customer, email, phone, items)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(o.id, o.name, o.slot, o.fulfilment, o.dishes, o.customer ?? null, o.email ?? null, o.phone ?? null, JSON.stringify(o.items)).changes;
    },
    cancelOrder(id) {
      return db.prepare('UPDATE orders SET cancelled = 1 WHERE id = ?').run(String(id)).changes;
    },
    setStatus(id, status) {
      return db.prepare('UPDATE orders SET status = ? WHERE id = ? AND cancelled = 0').run(status, String(id)).changes;
    },
    order(id) {
      const r = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
      return r ? { ...r, items: JSON.parse(r.items) } : null;
    },
    ordersOn(date) {
      return plain(db.prepare("SELECT * FROM orders WHERE cancelled = 0 AND slot LIKE ? || 'T%' ORDER BY slot, created_at").all(date)).map((r) => ({
        ...r,
        items: JSON.parse(r.items),
      }));
    },
    /** slot → dishes, for slots at or after `from`. */
    usedFrom(from) {
      const rows = db.prepare('SELECT slot, SUM(dishes) AS n FROM orders WHERE cancelled = 0 AND slot >= ? GROUP BY slot').all(from);
      return Object.fromEntries(rows.map((r) => [r.slot, Number(r.n)]));
    },

    paused() {
      return db.prepare('SELECT slot FROM paused_slots ORDER BY slot').all().map((r) => r.slot);
    },
    togglePause(slot) {
      if (db.prepare('DELETE FROM paused_slots WHERE slot = ?').run(slot).changes) return false;
      db.prepare('INSERT INTO paused_slots (slot) VALUES (?)').run(slot);
      return true;
    },

    addCatering(c) {
      return Number(
        db
          .prepare('INSERT INTO catering (name, email, phone, event_date, guests, package, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(c.name, c.email, c.phone ?? null, c.date, c.guests, c.package, c.notes ?? null).lastInsertRowid
      );
    },
    setCateringDraft(id, draftId) {
      db.prepare('UPDATE catering SET draft_order_id = ? WHERE id = ?').run(draftId, id);
    },

    /** Privacy: drop personal details but keep the slot counts the kitchen planned with. */
    redactCustomer(email) {
      const a = db.prepare("UPDATE orders SET customer = 'redacted', email = NULL, phone = NULL WHERE email = ?").run(email).changes;
      const b = db.prepare('DELETE FROM catering WHERE email = ?').run(email).changes;
      return a + b;
    },
    dataFor(email) {
      return {
        orders: plain(db.prepare('SELECT name, slot, fulfilment, customer, phone FROM orders WHERE email = ?').all(email)),
        catering: plain(db.prepare('SELECT event_date, guests, package, phone, notes FROM catering WHERE email = ?').all(email)),
      };
    },
    purge() {
      db.exec('DELETE FROM orders; DELETE FROM paused_slots; DELETE FROM catering;');
    },
  };
}
