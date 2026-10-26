/**
 * Renders Pagi's menu illustrations to design/out/ with headless Chrome: flat, top-down food on
 * a coloured table, one per `art` key in scripts/catalog.json, plus the hero and the gift card.
 * Everything is drawn here as SVG (no stock photos), so the repo can be rebuilt from scratch.
 * Usage: node design/build.mjs
 */
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = new URL('..', import.meta.url);
const out = fileURLToPath(new URL('design/out/', root));
const font = pathToFileURL(fileURLToPath(new URL('theme/assets/fraunces-soft.woff2', root))).href;
const catalog = JSON.parse(await readFile(new URL('scripts/catalog.json', root), 'utf8'));

const INK = '#2A1E16';
const C = {
  plate: '#FFFDF8', rim: '#EFE6D8', yolk: '#F6B42C', white: '#FFF9EE', toast: '#E2A65E', crust: '#B9773A',
  avo: '#9CBB4E', avoDark: '#6E8B2E', bacon: '#C9574A', fat: '#F2C6B4', tomato: '#E2533B', mush: '#9C7350',
  green: '#5F8F3E', greenLight: '#8DB85A', salmon: '#F08A64', beet: '#B23A6A', pink: '#E64B8B', banana: '#F7E3A1',
  granola: '#C98D4B', kiwi: '#8FBF3F', coconut: '#FFFFFF', berry: '#3E3A7A', rice: '#F3E7C9', chick: '#E3C07E',
  coffee: '#7A4A2A', crema: '#D9A877', milk: '#F6E7D2', matcha: '#8FB24B', jamu: '#F0A12B', wood: '#C99263', woodDark: '#A9744A',
};

/* Deterministic scatter, so a rebuild gives the same pictures. */
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const shadow = `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#2A1E16" flood-opacity=".18"/></filter>
<filter id="sh2" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#2A1E16" flood-opacity=".18"/></filter>`;

function table(w, h, color, seed = 1) {
  const r = rng(seed);
  const flecks = Array.from({ length: 70 }, () => `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(1 + r() * 2.5).toFixed(1)}" fill="#fff" opacity=".18"/>`).join('');
  return `<rect width="${w}" height="${h}" fill="${color}"/>${flecks}`;
}
const plate = (x, y, r) => `<g filter="url(#sh)"><circle cx="${x}" cy="${y}" r="${r}" fill="${C.plate}"/></g><circle cx="${x}" cy="${y}" r="${r * 0.8}" fill="none" stroke="${C.rim}" stroke-width="3"/>`;
const blob = (x, y, r, fill, seed, n = 9, wobble = 0.22) => {
  const q = rng(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + q() * wobble);
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  });
  const d = pts.map((p, i) => {
    const n2 = pts[(i + 1) % pts.length];
    const m = [(p[0] + n2[0]) / 2, (p[1] + n2[1]) / 2];
    return `${i === 0 ? `M${((pts.at(-1)[0] + p[0]) / 2).toFixed(1)} ${((pts.at(-1)[1] + p[1]) / 2).toFixed(1)}` : ''} Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  });
  return `<path d="${d.join(' ')}Z" fill="${fill}"/>`;
};
const friedEgg = (x, y, s = 1, seed = 3) => `${blob(x, y, 62 * s, C.white, seed, 10, 0.3)}<circle cx="${x + 6 * s}" cy="${y - 4 * s}" r="${22 * s}" fill="${C.yolk}"/><circle cx="${x}" cy="${y - 10 * s}" r="${6 * s}" fill="#fff" opacity=".6"/>`;
const poached = (x, y, s = 1, seed = 5) => `${blob(x, y, 40 * s, C.white, seed, 8, 0.25)}<ellipse cx="${x + 4}" cy="${y - 4}" rx="${14 * s}" ry="${10 * s}" fill="${C.yolk}" opacity=".55"/>`;
const scrambled = (x, y, s = 1, seed = 7) => {
  const q = rng(seed);
  return Array.from({ length: 9 }, () => blob(x + (q() - 0.5) * 90 * s, y + (q() - 0.5) * 60 * s, (18 + q() * 14) * s, q() > 0.5 ? '#F7CD52' : '#F3BD3A', Math.floor(q() * 1e6), 7, 0.4)).join('');
};
const bacon = (x, y, a = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M-80 0 q20 -16 40 0 t40 0 t40 0 t40 0" fill="none" stroke="${C.bacon}" stroke-width="26" stroke-linecap="round"/><path d="M-80 0 q20 -16 40 0 t40 0 t40 0 t40 0" fill="none" stroke="${C.fat}" stroke-width="6" stroke-linecap="round" transform="translate(0 6)"/></g>`;
const tomato = (x, y, r = 34) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.tomato}"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="#F0745A"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x + Math.cos((a * Math.PI) / 180) * r * 0.4}" cy="${y + Math.sin((a * Math.PI) / 180) * r * 0.4}" rx="${r * 0.12}" ry="${r * 0.2}" transform="rotate(${a} ${x + Math.cos((a * Math.PI) / 180) * r * 0.4} ${y + Math.sin((a * Math.PI) / 180) * r * 0.4})" fill="#FBD8A0"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.16}" fill="${C.tomato}"/>`;
const mushroom = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 4 a30 26 0 0 1 60 0z" fill="${C.mush}"/><rect x="-9" y="2" width="18" height="22" rx="7" fill="#E7D3B5"/><path d="M-22 4h44" stroke="#7A5638" stroke-width="3"/></g>`;
const leaf = (x, y, a, s = 1, fill = C.green) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0 C 20 -26 60 -26 80 0 C 60 26 20 26 0 0Z" fill="${fill}"/><path d="M6 0 H72" stroke="#ffffff" stroke-opacity=".35" stroke-width="3"/></g>`;
const greens = (x, y, seed = 11, n = 7, s = 1) => {
  const q = rng(seed);
  return Array.from({ length: n }, () => leaf(x + (q() - 0.5) * 80 * s, y + (q() - 0.5) * 60 * s, q() * 360, (0.6 + q() * 0.4) * s, q() > 0.5 ? C.green : C.greenLight)).join('');
};
const toast = (x, y, a = 0, s = 1, inner = C.toast) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})" filter="url(#sh2)"><path d="M-110 -70 q0 -40 50 -40 q30 -28 60 0 q50 0 50 40 v120 q0 20 -20 20 h-120 q-20 0 -20 -20z" transform="translate(30 0)" fill="${C.crust}"/><path d="M-100 -62 q0 -32 44 -32 q30 -24 56 0 q44 0 44 32 v108 q0 12 -12 12 h-120 q-12 0 -12 -12z" transform="translate(30 0)" fill="${inner}"/></g>`;
const avoSmash = (x, y, s = 1, seed = 13) => {
  const q = rng(seed);
  const flakes = Array.from({ length: 22 }, () => `<circle cx="${x + (q() - 0.5) * 150 * s}" cy="${y + (q() - 0.5) * 120 * s}" r="${2 + q() * 2.5}" fill="${q() > 0.5 ? '#C8332B' : '#F2F0E6'}"/>`).join('');
  return `${blob(x, y, 78 * s, C.avo, seed, 11, 0.3)}${blob(x + 12, y - 8, 46 * s, '#B5CF6A', seed + 1, 9, 0.4)}${flakes}`;
};
const salmon = (x, y, a = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${[0, 1, 2].map((i) => `<path d="M-70 ${i * 26 - 26} q35 -22 70 0 t70 0" fill="none" stroke="${C.salmon}" stroke-width="22" stroke-linecap="round"/><path d="M-60 ${i * 26 - 30} q30 -16 60 0" fill="none" stroke="#FFD8C6" stroke-width="3" opacity=".8"/>`).join('')}</g>`;
const dill = (x, y, seed = 17) => {
  const q = rng(seed);
  return Array.from({ length: 6 }, () => `<path d="M${x + (q() - 0.5) * 120} ${y + (q() - 0.5) * 80} l${(q() - 0.5) * 30} ${(q() - 0.5) * 30}" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>`).join('');
};
const bowl = (x, y, r, fill) => `<g filter="url(#sh)"><circle cx="${x}" cy="${y}" r="${r}" fill="#F4EDE2"/></g><circle cx="${x}" cy="${y}" r="${r * 0.86}" fill="${fill}"/>`;
const banana = (x, y) => `<circle cx="${x}" cy="${y}" r="20" fill="${C.banana}"/><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#D9B969" stroke-width="2" stroke-dasharray="3 3"/>`;
const kiwi = (x, y) => `<circle cx="${x}" cy="${y}" r="28" fill="#7A5A33"/><circle cx="${x}" cy="${y}" r="25" fill="${C.kiwi}"/><circle cx="${x}" cy="${y}" r="9" fill="#F3F0C8"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${x + Math.cos(i * 0.63) * 15}" cy="${y + Math.sin(i * 0.63) * 15}" r="2" fill="${INK}"/>`).join('')}`;
const granola = (x, y, seed, n = 18, spread = 70) => {
  const q = rng(seed);
  return Array.from({ length: n }, () => blob(x + (q() - 0.5) * spread * 2, y + (q() - 0.5) * spread, 7 + q() * 6, q() > 0.4 ? C.granola : '#A86E36', Math.floor(q() * 1e6), 6, 0.5)).join('');
};
const berries = (x, y, seed, n = 7) => {
  const q = rng(seed);
  return Array.from({ length: n }, () => `<circle cx="${x + (q() - 0.5) * 80}" cy="${y + (q() - 0.5) * 50}" r="${9 + q() * 4}" fill="${C.berry}"/>`).join('');
};
const coconut = (x, y, seed) => {
  const q = rng(seed);
  return Array.from({ length: 10 }, () => `<rect x="${x + (q() - 0.5) * 120}" y="${y + (q() - 0.5) * 70}" width="14" height="5" rx="2" transform="rotate(${q() * 180} ${x} ${y})" fill="#fff"/>`).join('');
};
const cup = (x, y, r, drink, art = '') => `<g filter="url(#sh)"><circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="#F4EDE2"/></g><circle cx="${x}" cy="${y}" r="${r * 1.45 - 10}" fill="none" stroke="${C.rim}" stroke-width="3"/><path d="M${x + r * 0.95} ${y - 14} h${r * 0.42} a14 14 0 0 1 0 28 h-${r * 0.42}" fill="#fff" stroke="${C.rim}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r * 0.84}" fill="${drink}"/>${art}`;
const heart = (x, y, s, color = C.milk) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 26 C -40 0 -30 -30 0 -14 C 30 -30 40 0 0 26Z" fill="${color}"/><path transform="translate(${x} ${y}) scale(${s})" d="M0 26 V-30" stroke="${color}" stroke-width="3"/>`;
const ice = (x, y, seed) => {
  const q = rng(seed);
  return Array.from({ length: 4 }, () => `<rect x="${x + (q() - 0.5) * 60 - 14}" y="${y + (q() - 0.5) * 60 - 14}" width="28" height="28" rx="6" fill="#fff" opacity=".55" transform="rotate(${q() * 60} ${x} ${y})"/>`).join('');
};
const board = (x, y, w, h) => `<g filter="url(#sh)"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="40" fill="${C.wood}"/></g>${[0.2, 0.45, 0.7].map((t) => `<path d="M${x - w / 2 + 30} ${y - h / 2 + h * t} q${w / 2} 18 ${w - 60} 0" fill="none" stroke="${C.woodDark}" stroke-width="3" opacity=".5"/>`).join('')}<circle cx="${x + w / 2 - 40}" cy="${y}" r="10" fill="${C.woodDark}"/>`;
const ramekin = (x, y, fill) => `<g filter="url(#sh2)"><circle cx="${x}" cy="${y}" r="52" fill="#fff"/></g><circle cx="${x}" cy="${y}" r="42" fill="${fill}"/>`;
const crumbs = (w, h, seed, color = C.crust) => {
  const q = rng(seed);
  return Array.from({ length: 16 }, () => `<circle cx="${q() * w}" cy="${q() * h}" r="${1.5 + q() * 3}" fill="${color}" opacity=".5"/>`).join('');
};

const W = 1200;
const H = 900;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${shadow}</defs>${body}</svg>`;
/** base: the plate, bowl or board; food: drawn around the centre, then scaled up onto it. */
const dish = (bg, seed, base, food = '', k = 1.6) =>
  svg(W, H, `${table(W, H, bg, seed)}${crumbs(W, H, seed + 3)}${base}<g transform="translate(600 450) scale(${k}) translate(-600 -450)">${food}</g>`);

const ART = {
  'plate-full': () => dish('#E9C6A8', 1, plate(600, 450, 330), `${friedEgg(520, 360, 1.1, 2)}${friedEgg(650, 330, 1, 4)}${bacon(560, 520, -12, 1)}${bacon(580, 570, -8, 0.95)}${tomato(760, 470, 44)}${mushroom(440, 470, 1.2)}${mushroom(470, 540, 1)}${greens(700, 600, 4, 6)}${toast(400, 330, -24, 0.55)}`, 1.45),
  'plate-green': () => dish('#C9D7B0', 2, plate(600, 450, 330), `${greens(520, 420, 8, 12, 1.3)}${avoSmash(690, 380, 0.7, 9)}${blob(690, 560, 70, C.beet, 21, 10, 0.3)}${mushroom(500, 570, 1.1)}${tomato(780, 520, 34)}${toast(430, 320, -18, 0.5)}`, 1.45),
  platter: () => dish('#F2D9A8', 3, board(600, 450, 920, 620), `${toast(330, 340, -10, 0.6)}${avoSmash(560, 320, 0.7, 31)}${tomato(760, 300, 40)}${tomato(830, 360, 30)}${greens(450, 560, 32, 8)}${friedEgg(650, 560, 0.9, 33)}${ramekin(860, 560, C.beet)}${mushroom(330, 560, 1.1)}${bacon(520, 640, 6, 0.6)}`, 1.4),
  'toast-avo': () => dish('#D8E2C6', 4, plate(600, 450, 320), `${toast(600, 450, -8, 1.35)}${avoSmash(600, 440, 1.2, 41)}${poached(620, 420, 1.2, 42)}`, 1.5),
  'toast-salmon': () => dish('#C7DCE6', 5, plate(600, 450, 320), `${toast(600, 450, 6, 1.35, '#F3E6C9')}${salmon(600, 440, -8, 1.3)}${dill(600, 440, 51)}${blob(700, 360, 26, '#fff', 52)}`, 1.5),
  'toast-mushroom': () => dish('#E6D2BE', 6, plate(600, 450, 320), `${toast(600, 450, -4, 1.35)}${mushroom(540, 410, 1.5)}${mushroom(640, 400, 1.3)}${mushroom(590, 490, 1.4)}${mushroom(680, 480, 1.1)}${greens(560, 450, 61, 5, 0.7)}`, 1.5),
  'bowl-pink': () => dish('#F6D3DF', 7, bowl(600, 450, 320, C.pink), `${banana(520, 380)}${banana(560, 350)}${banana(600, 330)}${kiwi(700, 420)}${granola(560, 530, 71)}${coconut(680, 520, 72)}${berries(470, 470, 73)}`, 1.75),
  'bowl-green': () => dish('#D9E8C4', 8, bowl(600, 450, 320, '#7FAE4A'), `${kiwi(520, 380)}${kiwi(600, 350)}${banana(700, 400)}${banana(720, 450)}${granola(600, 540, 81)}${coconut(520, 500, 82)}`, 1.75),
  'bowl-grain': () => dish('#EAD7B7', 9, bowl(600, 450, 320, C.rice), `${blob(500, 380, 90, C.green, 91, 10, 0.3)}${greens(500, 380, 92, 7)}${blob(700, 380, 80, C.beet, 93, 10, 0.25)}${Array.from({ length: 14 }, (_, i) => `<circle cx="${560 + (i % 5) * 26}" cy="${540 + Math.floor(i / 5) * 24}" r="12" fill="${C.chick}"/>`).join('')}${avoSmash(720, 540, 0.45, 94)}`, 1.55),
  sandwich: () => dish('#E3D3C0', 10, plate(600, 450, 330), `<g filter="url(#sh2)"><rect x="380" y="330" width="440" height="240" rx="70" fill="#E6B573"/></g><rect x="400" y="350" width="400" height="200" rx="60" fill="#F0C98E"/>${Array.from({ length: 18 }, (_, i) => `<circle cx="${420 + (i % 6) * 70}" cy="${380 + Math.floor(i / 6) * 60}" r="3" fill="#C99257"/>`).join('')}<path d="M600 330 v240" stroke="#C99257" stroke-width="4"/>${greens(470, 600, 101, 5)}${tomato(780, 620, 26)}`, 1.1),
  'cup-flat-white': () => dish('#D8C3AE', 11, '', `${cup(580, 450, 190, C.crema, heart(580, 450, 3))}`, 1),
  'cup-matcha': () => dish('#D5E3C2', 12, '', `${cup(580, 450, 190, C.matcha, `${ice(560, 440, 121)}<path d="M480 470 q100 -60 200 0" fill="none" stroke="#fff" stroke-width="10" opacity=".5"/>`)}`, 1),
  'cup-jamu': () => dish('#F6DDB2', 13, '', `<g filter="url(#sh)"><circle cx="560" cy="450" r="150" fill="#fff" opacity=".7"/></g><circle cx="560" cy="450" r="130" fill="${C.jamu}"/><circle cx="560" cy="450" r="130" fill="none" stroke="#fff" stroke-width="10" opacity=".6"/>${blob(820, 600, 46, '#E7A13A', 131, 7, 0.5)}<g transform="rotate(30 850 330)"><rect x="790" y="300" width="130" height="50" rx="25" fill="#D99A3A"/><rect x="820" y="270" width="36" height="60" rx="18" fill="#D99A3A"/></g>${leaf(380, 650, -30, 1.2)}`, 1),
};

/* Beans: a kraft bag, front on. */
function beanBag(b, tone, seed) {
  const label = b.title.replace(' single origin', '').replace(' house blend', '');
  return svg(W, H, `${table(W, H, tone, seed)}
    <g filter="url(#sh)"><path d="M420 150 h360 l30 640 q0 20 -20 20 h-380 q-20 0 -20 -20z" fill="#C8A47A"/></g>
    <path d="M420 150 h360 v40 h-360z" fill="#B48C60"/>
    <rect x="460" y="330" width="280" height="300" rx="20" fill="#FFF8EE"/>
    <circle cx="600" cy="400" r="30" fill="#F2A93B"/>
    <text x="600" y="490" text-anchor="middle" font-family="Fraunces" font-size="54" font-weight="650" fill="${INK}">pagi</text>
    <text x="600" y="545" text-anchor="middle" font-family="Fraunces" font-size="30" font-weight="500" fill="${INK}">${label}</text>
    <text x="600" y="595" text-anchor="middle" font-family="sans-serif" font-size="20" letter-spacing="3" fill="#6F5E50">${b.variants[0].size.toUpperCase()} · ARABICA</text>
    ${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${240 + (i % 3) * 50 + (i > 5 ? 640 : 0)} ${640 + Math.floor((i % 6) / 3) * 50}) rotate(${i * 40})"><ellipse rx="22" ry="15" fill="#5A3520"/><path d="M-18 0 q18 -8 36 0" stroke="#2E1A0E" stroke-width="3" fill="none"/></g>`).join('')}`);
}
const giftCard = () =>
  svg(W, H, `${table(W, H, '#F6D79C', 14)}
    <g filter="url(#sh)" transform="rotate(-6 600 450)"><rect x="250" y="230" width="700" height="440" rx="36" fill="${INK}"/></g>
    <g transform="rotate(-6 600 450)">
      <circle cx="840" cy="330" r="120" fill="#F2A93B" opacity=".9"/>
      <text x="300" y="330" font-family="Fraunces" font-size="72" font-weight="650" fill="#FFF8EE">pagi</text>
      <text x="300" y="600" font-family="Fraunces" font-size="40" font-weight="500" fill="#FFF8EE">Brunch is on us</text>
      <text x="300" y="640" font-family="sans-serif" font-size="20" letter-spacing="4" fill="#E9C6A8">GIFT CARD · PERERENAN</text>
    </g>`);
const around = (x, y, k, body) => `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${body}</g>`;
const hero = () =>
  svg(1600, 1200, `${table(1600, 1200, '#E9C6A8', 20)}${crumbs(1600, 1200, 21)}
    ${plate(560, 480, 330)}${around(560, 480, 1.45, `${friedEgg(490, 410, 1.1, 22)}${friedEgg(610, 385, 1, 23)}${bacon(530, 540, -12, 1)}${bacon(550, 585, -8, 0.95)}${tomato(700, 500, 44)}${mushroom(420, 500, 1.2)}${greens(650, 610, 24, 6)}`)}
    ${bowl(1160, 860, 260, C.pink)}${around(1160, 860, 1.6, `${banana(1100, 800)}${banana(1140, 780)}${kiwi(1230, 840)}${granola(1140, 930, 25, 14, 60)}${berries(1070, 880, 26)}`)}
    ${cup(1300, 260, 130, C.crema, heart(1300, 260, 2))}
    ${around(330, 1010, 1.3, `${toast(330, 1010, 18, 0.9)}${avoSmash(330, 1000, 0.8, 27)}`)}`);

const jobs = {};
for (const m of catalog.menu) jobs[m.art] = ART[m.art]();
catalog.beans.forEach((b, i) => (jobs[b.art] = beanBag(b, ['#E9C6A8', '#C7DCE6'][i % 2], 30 + i)));
jobs[catalog.gift_card.art] = giftCard();
jobs['hero-pagi'] = hero();

await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
const tmp = `${out}_render.html`;
for (const [name, markup] of Object.entries(jobs)) {
  const [, w, h] = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
  await writeFile(tmp, `<!doctype html><html><head><style>
    @font-face { font-family: Fraunces; src: url('${font}') format('woff2'); font-weight: 100 900; }
    html, body { margin: 0; } svg { display: block; } text { font-variation-settings: 'SOFT' 100; }
  </style></head><body>${markup}</body></html>`);
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}${name}.png`, clip: { x: 0, y: 0, width: Number(w), height: Number(h) } });
  process.stdout.write('.');
}
await rm(tmp);
await browser.close();
console.log(`\n${Object.keys(jobs).length} images → design/out/`);
