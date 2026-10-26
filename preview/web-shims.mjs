/**
 * Just enough of Node for preview/server.mjs to run in a browser. Files come from the virtual
 * file system that web-build.mjs embeds (theme, catalog, and the names of the product images).
 */
/* global __VFS__ */
const files = __VFS__;
const key = (p) => (p instanceof URL ? p.pathname : String(p).replace(/^file:\/\//, ''));
const get = (p) => {
  const k = key(p);
  if (!(k in files)) {
    const e = new Error(`ENOENT: ${k}`);
    e.code = 'ENOENT';
    throw e;
  }
  return files[k];
};

export const readFileSync = (p) => get(p);
export const existsSync = (p) => key(p) in files;
export const readFile = async (p) => get(p);
export const extname = (p) => (String(p).match(/\.[^./]*$/) || [''])[0];
export const fileURLToPath = (u) => key(u);

export let handler = null;
export const createServer = (h) => {
  handler = h;
  return { listen: () => {} };
};

globalThis.process ??= { env: {} };
globalThis.Buffer ??= {
  concat: (chunks) => {
    const all = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let at = 0;
    for (const c of chunks) { all.set(c, at); at += c.length; }
    return { toString: () => new TextDecoder().decode(all) };
  },
};

/** liquidjs's file system interface, over the embedded files (used for {% render %} and layouts). */
export const liquidFs = {
  sep: '/',
  dirname: (p) => p.replace(/\/[^/]*$/, ''),
  resolve: (root, file, ext) => {
    const name = file.endsWith(ext) ? file : file + ext;
    return name.startsWith('/') ? name : `${root.replace(/\/$/, '')}/${name}`;
  },
  contains: (root, file) => file.startsWith(root),
  exists: async (p) => p in files,
  existsSync: (p) => p in files,
  readFile: async (p) => get(p),
  readFileSync: (p) => get(p),
};
