/**
 * The offline preview server, running inside a Service Worker.
 *
 * web-build.mjs bundles this file with server.mjs. Node's fs/http/path are replaced by small
 * shims (theme files are embedded in the bundle), so the same renderer that powers
 * `npm run preview` answers every request under the site's base path, in the browser: pages,
 * the Ajax Cart API, Section Rendering, predictive search, recommendations. Nothing is
 * rewritten in the theme; URLs are re-based on the way out.
 */
import { handler } from './web-shims.mjs';
import './server.mjs';

const BASE = new URL('./', self.location.href).pathname.replace(/\/$/, ''); // e.g. /pagi-shopify/store
const STATIC = /^\/(assets|img)\//;
const REBASE = /(["'(\s=,])\/(?!\/)(assets|img|products|collections|cart|search|recommendations|apps|pages|password|account|localization|contact|policies|checkout|kitchen|id)\b/g;
// Links to the bare root ("/", "/#menu", "/?x") point at the store, not the domain.
const ROOT = /(\s(?:href|action)=["'])\/(?=["'#?])/g;
const rebase = (text) => text.replace(REBASE, `$1${BASE}/$2`).replace(ROOT, `$1${BASE}/`);

// A small, fixed note on every page so nobody mistakes the demo for a live shop.
const BADGE = `<div style="position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.25)">Live demo · theme, Functions and kitchen board run in your browser · <a href="${BASE}/../" style="color:#ffd27a">about</a></div>`;
/* A Service Worker is stopped when idle, losing in-memory state. The cart lives in the
   renderer's memory, so cart-changing requests are kept and replayed when it starts again. */
const LOG = 'preview-cart-log';
let replayed = null;
async function replay() {
  const cache = await caches.open(LOG);
  const hit = await cache.match('log');
  for (const r of hit ? await hit.json() : []) await run(r.method, r.path, r.type, r.body);
}
async function remember(entry) {
  const cache = await caches.open(LOG);
  const hit = await cache.match('log');
  const log = hit ? await hit.json() : [];
  log.push(entry);
  await cache.put('log', new Response(JSON.stringify(log)));
}

/* Cookies: a synthetic Response can't set them (Set-Cookie is dropped), and requests seen by a
   worker don't expose them. So the worker keeps its own jar for cookies the renderer sets, and
   reads the page's own document.cookie values through cookieStore where the browser has it. */
const JAR = 'preview-cookies';
async function jar() {
  const hit = await (await caches.open(JAR)).match('jar');
  return hit ? await hit.json() : {};
}
async function cookieHeader() {
  const all = await jar();
  if (self.cookieStore) for (const c of await self.cookieStore.getAll()) all[c.name] = c.value;
  return Object.entries(all).map(([k, v]) => `${k}=${v}`).join('; ');
}
async function keepCookies(setCookie) {
  if (!setCookie) return;
  const all = await jar();
  for (const c of [].concat(setCookie)) {
    const [pair] = String(c).split(';');
    const i = pair.indexOf('=');
    all[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  await (await caches.open(JAR)).put('jar', new Response(JSON.stringify(all)));
}

async function run(method, path, type, body, extra = {}) {
  const chunks = body ? [new TextEncoder().encode(body)] : [];
  const req = {
    method,
    url: path,
    headers: { 'content-type': type || '', cookie: await cookieHeader(), ...extra },
    async *[Symbol.asyncIterator]() { yield* chunks; },
  };
  return new Promise((resolve) => {
    let status = 200;
    let headers = {};
    const res = {
      writeHead(s, h) { status = s; headers = h || {}; },
      setHeader(k, v) { headers[k] = v; },
      end(content) { resolve({ status, headers, content }); },
    };
    handler(req, res);
  });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  let path = url.pathname.slice(BASE.length) || '/';
  if (STATIC.test(path) || path === '/sw.js' || path === '/boot.html') return; // real files on GitHub Pages
  event.respondWith((async () => {
    replayed ??= replay();
    await replayed;
    const method = event.request.method;
    const type = event.request.headers.get('content-type') || '';
    const body = method === 'GET' ? null : await event.request.text();
    const target = path + url.search;
    // The renderer works in store paths ("/products/x"), so the referrer loses the base too.
    const ref = event.request.referrer ? new URL(event.request.referrer) : null;
    const referer = ref && ref.pathname.startsWith(BASE) ? (ref.pathname.slice(BASE.length) || '/') + ref.search : '';
    const out = await run(method, target, type, body, { referer });
    await keepCookies(out.headers['Set-Cookie'] || out.headers['set-cookie']);
    // Everything that changes state: the cart, placed orders, the kitchen board.
    if (method === 'POST' && /^(\/id)?\/(cart\/(add|change|update)|checkout\/complete|kitchen\/)/.test(path) && out.status < 400) await remember({ method, path: target, type, body });
    const contentType = out.headers['Content-Type'] || out.headers['content-type'] || 'text/html; charset=utf-8';
    let content = out.content ?? '';
    if (/html|json/.test(contentType) && typeof content === 'string') content = rebase(content);
    if (contentType.includes('html') && event.request.mode === 'navigate') content = content.replace('</body>', `${BADGE}</body>`);
    const location = out.headers.Location || out.headers.location;
    if (out.status >= 300 && out.status < 400 && location)
      return Response.redirect(/^https?:/.test(location) ? location : BASE + location, out.status);
    return new Response(content, { status: out.status, headers: { 'Content-Type': contentType } });
  })());
});
