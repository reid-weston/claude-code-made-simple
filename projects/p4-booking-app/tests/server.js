// Starts the app as a real server for the tests: a free port, a fresh database file
// and a known admin key. Not a test file itself.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));
const ADMIN_KEY = 'test-admin-key-123';

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

async function start(dbPath) {
  const port = await freePort();
  const db = dbPath || path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bn-')), 'bookings.db');
  const child = spawn(process.execPath, ['server.js'], {
    cwd: dir, env: { ...process.env, PORT: String(port), DB_PATH: db, ADMIN_KEY, NODE_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`server.js exited early:\n${log}`);
    try { await fetch(base + '/'); return { base, db, stop: () => stop(child) }; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  child.kill();
  throw new Error(`server.js didn't start listening on PORT within 10 seconds:\n${log}`);
}

function stop(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.once('exit', resolve);
    child.kill();
  });
}

const api = (base) => ({
  get: (p, key) => fetch(base + p, { headers: key ? { 'x-admin-key': key } : {} }),
  post: (p, body) => fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  del: (p, key) => fetch(base + p, { method: 'DELETE', headers: key ? { 'x-admin-key': key } : {} }),
});

module.exports = { dir, start, api, ADMIN_KEY };
