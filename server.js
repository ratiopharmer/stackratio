// Current Cycle, self-hosted. Serves the public site and the account, key and brain APIs.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual, randomInt } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const dataDir = join(root, 'data');
const storePath = join(dataDir, 'store.json');
const bootstrapPath = join(dataDir, 'bootstrap.txt');
const PORT = Number(process.env.PORT || 4173);
const MONTH = 30 * 24 * 60 * 60;
const SESSION = 30 * 24 * 60 * 60;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

let brain = null;
let live = null;
let lex = {};
let store = null;
let writing = Promise.resolve();

function emptyStore() {
  return { users: {}, keys: [], sessions: {}, funnel: {} };
}

async function loadJson(name, fallback) {
  try { return JSON.parse(await readFile(join(dataDir, name), 'utf8')); }
  catch { return fallback; }
}

function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

function blankDay(day) {
  return { day, home: 0, free: 0, access: 0, account: 0, discord: 0, accounts: 0, keys: 0, keys_month: 0, keys_life: 0 };
}

function hit(event, extra) {
  const row = store.funnel[dayKey()] || blankDay(dayKey());
  if (row[event] != null) row[event] += 1;
  if (extra) Object.assign(row, extra);
  store.funnel[dayKey()] = row;
}

function keyCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join('');
  return `CC-${block()}-${block()}-${block()}`;
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 32).toString('hex');
  return { passSalt: salt, passHash: hash };
}

function checkPassword(user, password) {
  if (!user?.passHash || !user.passSalt) return false;
  const got = scryptSync(String(password), user.passSalt, 32);
  const want = Buffer.from(user.passHash, 'hex');
  return got.length === want.length && timingSafeEqual(got, want);
}

function publicUser(name) {
  const user = store.users[name];
  const now = Date.now() / 1000;
  const own = store.keys.filter((k) => k.used_by === name && !k.revoked);
  const life = own.find((k) => k.plan === 'life');
  const month = own.filter((k) => k.plan === 'month').sort((a, b) => (b.until || 0) - (a.until || 0))[0];
  let access;
  if (user.revoked) access = { ok: false, revoked: true };
  else if (life) access = { ok: true, plan: 'life', admin: !!user.admin };
  else if (month && month.until > now) access = { ok: true, plan: 'month', until: month.until, admin: !!user.admin };
  else if (month) access = { ok: false, plan: 'month', until: month.until, admin: !!user.admin };
  else if (user.admin) access = { ok: true, admin: true };
  else access = { ok: false, admin: false };
  return {
    user: name,
    temp: !!user.temp,
    admin: !!user.admin,
    revoked: !!user.revoked,
    plan: access.plan || '',
    until: access.until || 0,
    access,
    stack: user.stack || { items: [], goal: '', weight: '', note: '' },
  };
}

function adminPayload(extra = {}) {
  return {
    keys: store.keys,
    users: Object.keys(store.users).map((name) => {
      const pub = publicUser(name);
      return { user: name, temp: pub.temp, admin: pub.admin, revoked: pub.revoked, plan: pub.plan, until: pub.until };
    }),
    ...extra,
  };
}

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function sessionUser(req) {
  const token = cookies(req).cc_session;
  const row = token && store.sessions[token];
  if (!row || row.exp < Date.now() / 1000) return null;
  if (!store.users[row.user]) return null;
  return row.user;
}

function setSession(res, req, name) {
  const token = randomBytes(24).toString('hex');
  store.sessions[token] = { user: name, exp: Date.now() / 1000 + SESSION };
  const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';
  const admin = store.users[name]?.admin ? `cc_adm=1; Path=/; Max-Age=${SESSION}; SameSite=Lax${secure}` : 'cc_adm=; Path=/; Max-Age=0; SameSite=Lax';
  res.setHeader('Set-Cookie', [
    `cc_session=${token}; Path=/; HttpOnly; Max-Age=${SESSION}; SameSite=Lax${secure}`,
    admin,
  ]);
}

function clearSession(res, req) {
  const token = cookies(req).cc_session;
  if (token) delete store.sessions[token];
  res.setHeader('Set-Cookie', [
    'cc_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
    'cc_adm=; Path=/; Max-Age=0; SameSite=Lax',
  ]);
}

function save() {
  writing = writing.then(() => writeFile(storePath, JSON.stringify(store, null, 2))).catch((err) => {
    console.error('store write failed', err);
  });
  return writing;
}

function send(res, status, body, type = 'application/json; charset=utf-8', extra) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': payload.length, 'Cache-Control': 'no-store', ...extra });
  res.end(payload);
}

function originOf(req) {
  const set = (process.env.SITE_URL || '').replace(/\/$/, '');
  if (set) return set;
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return `${proto}://${req.headers.host}`;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw Object.assign(new Error('body too large'), { status: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('invalid json'), { status: 400 }); }
}

function fileFor(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/admin') rel = '/admin.html';
  if (rel === '/' || rel === '') rel = '/index.html';
  rel = normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const full = resolve(publicDir, '.' + rel);
  const base = resolve(publicDir);
  if (full !== base && !full.startsWith(base + '\\') && !full.startsWith(base + '/')) return null;
  return full;
}

async function serveFile(req, res, urlPath) {
  const full = fileFor(urlPath);
  if (!full) return send(res, 400, 'bad path', 'text/plain; charset=utf-8');
  let info;
  try { info = await stat(full); } catch { return send(res, 404, 'not found', 'text/plain; charset=utf-8'); }
  if (!info.isFile()) return send(res, 404, 'not found', 'text/plain; charset=utf-8');
  let body = await readFile(full);
  const type = TYPES[extname(full).toLowerCase()] || 'application/octet-stream';
  if (type.startsWith('text/html') || full.endsWith('.txt') || full.endsWith('.xml') || full.endsWith('manifest.json')) {
    const text = body.toString('utf8').replaceAll('https://currentcycle.xyz', originOf(req));
    body = Buffer.from(text);
  }
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': body.length,
    'Cache-Control': extname(full) === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  res.end(body);
}

function requireUser(req) {
  const name = sessionUser(req);
  if (!name) {
    const err = new Error('not logged in');
    err.status = 401;
    throw err;
  }
  return name;
}

function requireAdmin(req) {
  const name = requireUser(req);
  if (!store.users[name]?.admin) {
    const err = new Error('not an admin');
    err.status = 403;
    throw err;
  }
  return name;
}

function redeemKey(name, raw) {
  const code = String(raw || '').trim().toUpperCase();
  const key = store.keys.find((k) => k.key === code);
  if (!key) throw Object.assign(new Error('key not found'), { status: 400 });
  if (key.revoked) throw Object.assign(new Error('key revoked'), { status: 400 });
  if (key.used_by) throw Object.assign(new Error('key already used'), { status: 400 });
  const now = Date.now() / 1000;
  key.used_by = name;
  key.used_at = now;
  if (key.plan === 'month') {
    const current = store.keys
      .filter((k) => k.used_by === name && k.plan === 'month' && !k.revoked && k.until)
      .reduce((max, k) => Math.max(max, k.until), 0);
    key.until = Math.max(current, now) + MONTH;
    hit('keys');
    const row = store.funnel[dayKey()];
    row.keys_month += 1;
  } else {
    hit('keys');
    const row = store.funnel[dayKey()];
    row.keys_life += 1;
  }
  return key;
}

async function handleApi(req, res, url) {
  const path = url.pathname;
  if (path.startsWith('/api/account') || path.startsWith('/api/admin') || path === '/api/free') {
    return send(res, 404, { error: 'not found' });
  }
  if (req.method === 'GET' && path === '/api/public/brain') return send(res, 200, brain || { notes: 0, terms: {} });
  if (req.method === 'GET' && path === '/api/public/live') return send(res, 200, live || { now: Date.now() / 1000, totals: { words_read: 0, read: 0 } });
  if (req.method === 'GET' && path === '/api/public/lex') {
    const term = url.searchParams.get('term') || '';
    return send(res, 200, lex[term] || { term, entries: [] });
  }
  if (req.method === 'GET' && path === '/api/admin/cloud') {
    requireAdmin(req);
    return send(res, 200, brain || {});
  }
  if (req.method === 'GET' && path === '/api/admin/funnel') {
    requireAdmin(req);
    const days = Object.values(store.funnel).sort((a, b) => (a.day < b.day ? 1 : -1)).slice(0, 7);
    return send(res, 200, { days });
  }
  if (req.method === 'GET' && path === '/api/admin/live') {
    requireAdmin(req);
    const now = Date.now() / 1000;
    return send(res, 200, {
      notes: brain?.notes || 0,
      queue: 0,
      today: { in: 0, note: 0, empty: 0, posts: 0, words: 0 },
      seen: { crawler: 0, codex: 0 },
      codex_mode: false,
      now,
      events: live?.events || [],
      queue_items: [],
    });
  }
  if (req.method === 'GET' && path === '/api/admin/keys') {
    requireAdmin(req);
    return send(res, 200, adminPayload());
  }
  if (req.method === 'POST' && path === '/api/hit') {
    const body = await readBody(req);
    const allowed = ['home', 'free', 'access', 'account', 'discord'];
    if (allowed.includes(body.e)) { hit(body.e); await save(); }
    return send(res, 204, '');
  }
  if (req.method === 'POST' && path === '/api/free') {
    return send(res, 503, { error: 'The AI backend is not part of this copy. The database, calculator and accounts run locally.' });
  }
  if (path === '/api/account/me' && req.method === 'GET') {
    const name = requireUser(req);
    return send(res, 200, publicUser(name));
  }
  if (path === '/api/account/logout' && req.method === 'POST') {
    clearSession(res, req);
    await save();
    return send(res, 200, { ok: true });
  }
  if (path === '/api/account/login' && req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.user || '').trim();
    const user = store.users[name];
    if (!user || !checkPassword(user, body.pass || '')) {
      return send(res, 401, { error: 'name or password is wrong' });
    }
    setSession(res, req, name);
    await save();
    return send(res, 200, publicUser(name));
  }
  if (path === '/api/account/register' && req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.user || '').trim();
    const pass = String(body.pass || '');
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(name)) return send(res, 400, { error: 'name must be 3–24 letters, numbers, . _ -' });
    if (store.users[name]) return send(res, 400, { error: 'name is taken' });
    if (pass.length < 8) return send(res, 400, { error: 'password must be at least 8 characters' });
    store.users[name] = { ...hashPassword(pass), temp: false, admin: false, stack: { items: [], goal: '', weight: '', note: '' } };
    try { redeemKey(name, body.key); }
    catch (err) { delete store.users[name]; throw err; }
    hit('accounts');
    setSession(res, req, name);
    await save();
    return send(res, 200, publicUser(name));
  }
  if (path === '/api/account/redeem' && req.method === 'POST') {
    const name = requireUser(req);
    const body = await readBody(req);
    redeemKey(name, body.key);
    await save();
    return send(res, 200, { access: publicUser(name).access });
  }
  if (path === '/api/account/stack' && req.method === 'POST') {
    const name = requireUser(req);
    const body = await readBody(req);
    const items = Array.isArray(body.items) ? body.items.slice(0, 40).map((item) => ({
      name: String(item.name || '').slice(0, 60),
      amount: String(item.amount || '').slice(0, 20),
      unit: String(item.unit || 'mg').slice(0, 12),
      rhythm: String(item.rhythm || '').slice(0, 40),
    })).filter((item) => item.name.trim()) : [];
    store.users[name].stack = {
      items,
      goal: String(body.goal || '').slice(0, 20),
      weight: String(body.weight || '').slice(0, 10),
      note: String(body.note || '').slice(0, 600),
    };
    await save();
    return send(res, 200, { ok: true });
  }
  if (path === '/api/account/password' && req.method === 'POST') {
    const name = requireUser(req);
    const body = await readBody(req);
    const user = store.users[name];
    if (!checkPassword(user, body.old || '')) return send(res, 400, { error: 'current password is wrong' });
    if (String(body.new || '').length < 8) return send(res, 400, { error: 'password must be at least 8 characters' });
    Object.assign(user, hashPassword(String(body.new)), { temp: false });
    const keep = cookies(req).cc_session;
    for (const [token, row] of Object.entries(store.sessions)) {
      if (row.user === name && token !== keep) delete store.sessions[token];
    }
    await save();
    return send(res, 200, { ok: true });
  }
  if (path === '/api/account/delete' && req.method === 'POST') {
    const name = requireUser(req);
    const body = await readBody(req);
    if (!checkPassword(store.users[name], body.pass || '')) return send(res, 400, { error: 'password is wrong' });
    if (store.users[name].admin) return send(res, 400, { error: 'the admin account stays' });
    delete store.users[name];
    for (const [token, row] of Object.entries(store.sessions)) if (row.user === name) delete store.sessions[token];
    clearSession(res, req);
    await save();
    return send(res, 200, { ok: true });
  }
  if (path === '/api/admin/keys' && req.method === 'POST') {
    requireAdmin(req);
    const body = await readBody(req);
    if (body.op === 'create') {
      const count = Math.min(50, Math.max(1, Number(body.count) || 1));
      const plan = body.plan === 'life' ? 'life' : 'month';
      const note = String(body.note || '').slice(0, 80);
      const now = Date.now() / 1000;
      for (let i = 0; i < count; i += 1) {
        store.keys.unshift({ key: keyCode(), plan, note, created: now, used_by: '', used_at: 0, revoked: false });
      }
      await save();
      return send(res, 200, adminPayload());
    }
    if (body.op === 'revoke' || body.op === 'restore' || body.op === 'delete') {
      const key = store.keys.find((k) => k.key === body.key);
      if (!key) return send(res, 404, { error: 'key not found' });
      if (body.op === 'delete') {
        if (key.used_by) return send(res, 400, { error: 'used keys stay in the list' });
        store.keys = store.keys.filter((k) => k !== key);
      } else key.revoked = body.op === 'revoke';
      await save();
      return send(res, 200, adminPayload());
    }
    if (body.op === 'reset_pass') {
      const user = store.users[body.user];
      if (!user || user.admin) return send(res, 400, { error: 'account not found' });
      const password = keyCode().slice(3).replaceAll('-', '').slice(0, 12).toLowerCase();
      Object.assign(user, hashPassword(password), { temp: true });
      for (const [token, row] of Object.entries(store.sessions)) if (row.user === body.user) delete store.sessions[token];
      await save();
      return send(res, 200, adminPayload({ reset_user: body.user, password }));
    }
    return send(res, 400, { error: 'unknown op' });
  }
  return send(res, 404, { error: 'not found' });
}

async function boot() {
  await mkdir(dataDir, { recursive: true });
  brain = await loadJson('brain.json', null);
  live = await loadJson('live.json', null);
  lex = await loadJson('lex.json', {});
  store = await loadJson('store.json', null);
  if (!store) {
    store = emptyStore();
    const adminName = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || keyCode().slice(3).replaceAll('-', '').toLowerCase();
    store.users[adminName] = { ...hashPassword(adminPass), temp: false, admin: true, stack: { items: [], goal: '', weight: '', note: '' } };
    const demo = keyCode();
    store.keys.push({ key: demo, plan: 'life', note: 'first key', created: Date.now() / 1000, used_by: '', used_at: 0, revoked: false });
    await writeFile(bootstrapPath, `admin: ${adminName}\npassword: ${adminPass}\nfirst lifetime key: ${demo}\n`);
    await save();
    console.log(`first admin written to data/bootstrap.txt`);
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const retired = new Set(['/discord', '/chat.html', '/blut.html', '/konto.html', '/brain.html', '/admin', '/admin.html', '/bloodwork-on-cycle.html']);
    if (retired.has(url.pathname)) {
      res.writeHead(302, { Location: '/' });
      res.end();
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method', 'text/plain; charset=utf-8');
    await serveFile(req, res, url.pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    send(res, status, { error: err.message || 'error' });
  }
});

await boot();
server.listen(PORT, () => {
  console.log(`Current Cycle copy listening on http://localhost:${PORT}`);
});
