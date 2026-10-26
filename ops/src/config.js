import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { configFromShop } from '../../lib/slots.js';

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch {
  /* .env is optional; real deployments inject env vars */
}

const env = process.env;
const catalog = JSON.parse(readFileSync(new URL('../../scripts/catalog.json', import.meta.url), 'utf8'));

export const config = {
  shop: env.SHOPIFY_SHOP,
  apiVersion: env.SHOPIFY_API_VERSION || '2026-07',
  adminToken: env.SHOPIFY_ADMIN_TOKEN,
  clientId: env.SHOPIFY_CLIENT_ID,
  clientSecret: env.SHOPIFY_CLIENT_SECRET,
  kitchenPassword: env.KITCHEN_PASSWORD,
  port: Number(env.PORT || 8788),
  dbPath: env.DB_PATH || fileURLToPath(new URL('../data/pagi-ops.sqlite', import.meta.url)),
  timeZone: catalog.shop.timezone,
  slots: configFromShop(catalog.shop),
  catering: catalog.catering,
};

export function requireConfig(...keys) {
  const missing = keys.filter((k) => !config[k]);
  if (missing.length) throw new Error(`Missing config: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`);
}
