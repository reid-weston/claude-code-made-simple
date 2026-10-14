// Bookings, Live checks for Project 7. Copy this folder into your Project 4 folder and run:
//   node --test "checks/*.test.js"
// Set DEPLOY_URL to your live address to run the live check too.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));
const pkg = () => {
  const f = path.join(dir, 'package.json');
  assert.ok(fs.existsSync(f), 'run the checks from your Project 4 folder');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};

const freePort = () => new Promise((resolve) => {
  const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
});

function run(env, waitForPort) {
  const db = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'live-')), 'bookings.db');
  const child = spawn(process.execPath, ['server.js'], { cwd: dir, env: { ...process.env, DB_PATH: db, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const exited = new Promise((resolve) => child.once('exit', (code) => resolve(code)));
  const stop = () => { if (child.exitCode === null) child.kill(); return exited; };
  const ready = (async () => {
    if (!waitForPort) return;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error(`server.js exited:\n${log}`);
      try { await fetch(`http://127.0.0.1:${waitForPort}/health`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
    }
    throw new Error(`server.js didn't listen on PORT ${waitForPort}:\n${log}`);
  })();
  return { ready, exited, stop, log: () => log };
}

test('package.json can start the app and says which Node.js it needs', () => {
  const p = pkg();
  assert.ok(p.scripts?.start, 'add a "start" script');
  assert.match(p.scripts.start, /node\b/, 'the start script runs node');
  assert.ok(p.engines?.node, 'add "engines": { "node": ">=22.13" }');
});

test('listens on PORT and answers /health', async () => {
  const port = await freePort();
  const app = run({ PORT: String(port), ADMIN_KEY: 'check-key', NODE_ENV: 'production' }, port);
  try {
    await app.ready;
    const r = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { status: 'ok' });
  } finally { await app.stop(); }
});

test('refuses to start in production without ADMIN_KEY', async () => {
  const port = await freePort();
  const env = { PORT: String(port), NODE_ENV: 'production', ADMIN_KEY: '' };
  const app = run(env, 0);
  const code = await Promise.race([app.exited, new Promise((r) => setTimeout(() => r('still running'), 5000))]);
  await app.stop();
  assert.notEqual(code, 'still running', 'the server started anyway: stop with an error when ADMIN_KEY is missing');
  assert.notEqual(code, 0, 'exit with a non-zero code');
  assert.match(app.log(), /ADMIN_KEY/, 'say that ADMIN_KEY is missing');
});

test('the live site works', { skip: !process.env.DEPLOY_URL && 'set DEPLOY_URL to check the live site' }, async () => {
  const base = process.env.DEPLOY_URL.replace(/\/$/, '');
  const health = await fetch(base + '/health', { signal: AbortSignal.timeout(90000) });
  assert.equal(health.status, 200, 'the live /health answers 200 (a sleeping free app can take a minute to wake)');
  const home = await fetch(base + '/');
  assert.match(await home.text(), /<form/i, 'the live booking page has a form');
  assert.equal((await fetch(base + '/api/bookings')).status, 401, 'the live admin routes refuse requests without the key');
});
