/**
 * Builds the in-browser store demo into docs/store/ for GitHub Pages:
 *   sw.js       the preview renderer as a Service Worker (see web-entry.mjs)
 *   index.html  registers the worker, then opens the store
 *   assets/     theme assets, served as plain files
 *   img/        product images
 * Run: node preview/web-build.mjs
 */
import { build } from 'esbuild';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const out = join(repo, 'docs/store');
const VROOT = '/repo/'; // where the bundle believes the repository is

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// Text files the renderer reads, and the image names it checks with existsSync.
const vfs = {};
for (const f of walk(join(repo, 'theme'))) if (!f.includes('/assets/')) vfs[VROOT + relative(repo, f)] = readFileSync(f, 'utf8');
for (const f of ['scripts/catalog.json', 'preview/content.id.json'])
  vfs[VROOT + f] = readFileSync(join(repo, f), 'utf8');
for (const f of walk(join(repo, 'design/out'))) vfs[VROOT + relative(repo, f)] = '';

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const shims = fileURLToPath(new URL('./web-shims.mjs', import.meta.url));
await build({
  entryPoints: [fileURLToPath(new URL('./web-entry.mjs', import.meta.url))],
  bundle: true,
  format: 'esm',
  minify: true,
  outfile: join(out, 'sw.js'),
  define: { __VFS__: JSON.stringify(vfs), 'import.meta.url': JSON.stringify(`file://${VROOT}preview/server.mjs`) },
  plugins: [{
    name: 'node-shims',
    setup(b) {
      b.onResolve({ filter: /^node:(fs|fs\/promises|http|path|url)$/ }, () => ({ path: shims }));
      // The preview's own imports of liquidjs get a Liquid that reads the embedded files.
      const liquid = fileURLToPath(new URL('./web-liquid.mjs', import.meta.url));
      b.onResolve({ filter: /^liquidjs$/ }, () => ({ path: liquid }));
      b.onResolve({ filter: /^liquidjs-real$/ }, () => ({ path: join(repo, 'node_modules/liquidjs/dist/liquid.browser.mjs') }));
      // Module Service Workers may not use top-level await; the catalog read is the only one, and
      // the shim can do it synchronously.
      b.onLoad({ filter: /preview\/data\.mjs$/ }, (args) => ({
        contents: readFileSync(args.path, 'utf8')
          .replace("import { readFile } from 'node:fs/promises';", "import { readFile, readFileSync } from 'node:fs/promises';")
          .replace(/JSON\.parse\(await readFile\(/g, 'JSON.parse(readFileSync('),
        loader: 'js',
        resolveDir: join(repo, 'preview'),
      }));
    },
  }],
  logLevel: 'warning',
});

cpSync(join(repo, 'theme/assets'), join(out, 'assets'), { recursive: true });
cpSync(join(repo, 'design/out'), join(out, 'img'), { recursive: true });
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Opening the store…</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#FFF8EE;color:#2A1E16;text-align:center;padding:24px}</style>
</head><body><div id="m">Opening the store…</div>
<script>
  // The store is rendered in your browser by a Service Worker running the theme's preview renderer.
  // Once it controls this page, reload so the worker answers the request.
  const m = document.getElementById('m');
  // Arriving from 404.html with ?next=/pagi-shopify/store/products/x: go there once the worker runs.
  const next = new URLSearchParams(location.search).get('next');
  const go = () => (next ? location.replace(next) : location.reload());
  if (!('serviceWorker' in navigator)) m.textContent = 'This demo needs a browser with Service Worker support.';
  else if (navigator.serviceWorker.controller) location.replace(next || './?' + Date.now());
  else navigator.serviceWorker.register('./sw.js', { type: 'module', scope: './' })
    .then(() => navigator.serviceWorker.ready)
    .then(() => new Promise((r) => (navigator.serviceWorker.controller ? r() : navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))))
    .then(go)
    .catch((e) => (m.textContent = 'Could not start the demo: ' + e.message));
</script></body></html>`);
writeFileSync(join(repo, 'docs/404.html'), `<!doctype html><meta charset="utf-8"><title>Not found</title>
<script>
  // A deep link into the store before its Service Worker is installed: start it, then come back.
  const i = location.pathname.indexOf('/store/');
  if (i >= 0) location.replace(location.pathname.slice(0, i) + '/store/?next=' + encodeURIComponent(location.pathname + location.search));
  else document.write('<p style="font:16px system-ui;padding:24px">Page not found.</p>');
</script>`);
console.log(`Built ${out} (${Object.keys(vfs).length} embedded files)`);
