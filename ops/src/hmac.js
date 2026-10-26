import { createHmac, timingSafeEqual } from 'node:crypto';

function safeEqual(a, b) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Webhooks: base64 HMAC-SHA256 of the raw request body, keyed with the app's
 * client secret. Must be computed on the raw bytes, before any JSON parsing.
 */
export function verifyWebhook(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const received = Buffer.from(String(hmacHeader), 'base64');
  return safeEqual(expected, received);
}

/**
 * App proxy: hex HMAC-SHA256 over the query string with `signature` removed,
 * params sorted by key, each written as key=value (repeated keys joined by
 * commas) and concatenated with no separator.
 * Also rejects requests older than `maxAgeSeconds` to limit replay.
 */
export function verifyProxySignature(searchParams, secret, { maxAgeSeconds = 300, now = Date.now() } = {}) {
  const params = new URLSearchParams(searchParams);
  const signature = params.get('signature');
  if (!signature || !secret) return false;
  params.delete('signature');

  const grouped = new Map();
  for (const [key, value] of params) {
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  const message = [...grouped.keys()]
    .sort()
    .map((key) => `${key}=${grouped.get(key).join(',')}`)
    .join('');

  const expected = createHmac('sha256', secret).update(message).digest();
  const received = Buffer.from(signature, 'hex');
  if (!safeEqual(expected, received)) return false;

  const timestamp = Number(params.get('timestamp'));
  if (maxAgeSeconds && (!timestamp || Math.abs(now / 1000 - timestamp) > maxAgeSeconds)) return false;
  return true;
}

/** Signature we attach to outbound calls so partners can verify they came from us. */
export function signOutbound(body, secret) {
  return createHmac('sha256', secret).update(body).digest('base64');
}
