// Downloads the public Current Cycle site into public/ and the public API snapshots into data/.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://currentcycle.xyz';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const dataDir = join(root, 'data');

const seeds = [
  '/',
  '/brain.html',
  '/konto.html',
  '/chat.html',
  '/blut.html',
  '/bloodwork-on-cycle.html',
  '/rechner.html',
  '/admin',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/favicon.svg',
  '/theme.css',
  '/intro.js',
  '/i18n.js',
  '/database-stats.js',
  '/admin-cloud.js',
  '/nav.js',
  '/hero-showcase.js',
  '/hero-showcase.css',
  '/errors.js',
  '/field.js',
  '/shapes.js',
  '/brain-showcase.png',
  '/media/og.png',
  '/fonts/schibsted-grotesk-latin.woff2',
  '/vendor/three.r128.min.js',
  '/google02f5b042d7bb9a34.html',
];

const skip = new Set(['/discord', '/api', '/api/']);
const queued = new Set();
const saved = [];
const failed = [];

function localPath(pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') return join(publicDir, 'index.html');
  if (rel.endsWith('/')) rel += 'index.html';
  rel = rel.replace(/^\/+/, '');
  const full = resolve(publicDir, rel);
  if (full !== publicDir && !full.startsWith(publicDir + '\\') && !full.startsWith(publicDir + '/')) {
    throw new Error('path escapes public: ' + pathname);
  }
  return full;
}

function collect(text) {
  const found = new Set();
  const patterns = [
    /\b(?:src|href)=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /["'](\/[^"'\\\s>]+\.(?:js|css|png|jpe?g|webp|svg|gif|ico|woff2?|json|html|txt|xml))(?:\?[^"']*)?["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      const raw = (m[1] || '').trim();
      if (!raw || raw.startsWith('data:') || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) continue;
      if (/[$\s{},]/.test(raw)) continue;
      let url;
      try { url = new URL(raw, ORIGIN); } catch { continue; }
      if (url.origin !== ORIGIN) continue;
      const path = url.pathname;
      if (skip.has(path) || path.startsWith('/api/')) continue;
      found.add(path);
    }
  }
  return found;
}

async function pull(pathname) {
  if (queued.has(pathname) || skip.has(pathname)) return;
  queued.add(pathname);
  const res = await fetch(ORIGIN + pathname, { redirect: 'manual' });
  if (res.status >= 300 && res.status < 400) {
    failed.push(pathname + ' -> ' + (res.headers.get('location') || res.status));
    return;
  }
  if (!res.ok) {
    failed.push(pathname + ' ' + res.status);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = localPath(pathname === '/admin' ? '/admin.html' : pathname);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  saved.push(pathname + ' ' + buf.length);
  const type = res.headers.get('content-type') || '';
  if (/text|javascript|json|xml|svg/.test(type)) {
    for (const next of collect(buf.toString('utf8'))) {
      if (!queued.has(next)) await pull(next);
    }
  }
}

await mkdir(publicDir, { recursive: true });
await mkdir(dataDir, { recursive: true });
for (const path of seeds) await pull(path);

const brainRes = await fetch(ORIGIN + '/api/public/brain', { cache: 'no-store' });
if (!brainRes.ok) throw new Error('brain ' + brainRes.status);
const brain = await brainRes.json();
await writeFile(join(dataDir, 'brain.json'), JSON.stringify(brain));

const liveRes = await fetch(ORIGIN + '/api/public/live', { cache: 'no-store' });
if (!liveRes.ok) throw new Error('live ' + liveRes.status);
await writeFile(join(dataDir, 'live.json'), Buffer.from(await liveRes.arrayBuffer()));

const ids = new Set([
  'testosterone', 'trt', 'cruise', 'hcg', 'primobolan', 'nandrolone', 'trenbolone', 'masteron',
  'anavar', 'dianabol', 'winstrol', 'estradiol', 'aromasin', 'anastrozole', 'pct', 'nolvadex',
  'prolactin', 'clomid', 'cabergoline', 'bloodwork', 'kidney', 'lipids', 'liver', 'hematocrit',
  'bloodpressure', 'hgh', 'insulin', 'peptide', 'retatrutide', 'bpc157', 'tb500', 'tirzepatide',
  'semaglutide', 'cut', 'bulk', 'libido', 'hairloss', 'sleep', 'acne',
  ...Object.keys(brain.terms || {}),
]);
const lex = {};
const list = [...ids];
let cursor = 0;
async function worker() {
  while (cursor < list.length) {
    const id = list[cursor++];
    try {
      const res = await fetch(ORIGIN + '/api/public/lex?term=' + encodeURIComponent(id), { cache: 'no-store' });
      if (!res.ok) { lex[id] = { term: id, entries: [] }; continue; }
      lex[id] = await res.json();
    } catch {
      lex[id] = { term: id, entries: [] };
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
await writeFile(join(dataDir, 'lex.json'), JSON.stringify(lex));

console.log('saved', saved.length);
console.log('terms', list.length);
console.log('failed', failed.length);
for (const line of failed) console.log('FAIL', line);
const check = await readFile(join(publicDir, 'index.html'));
console.log('index', check.length);
