// Ship It checks for Project 6. Copy this folder into your Project 4 folder and run:
//   node --test "checks/*.test.js"
// They ask git about the repository, so they pass however you set it up.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));
const git = (...args) => {
  const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '').trim() };
};
const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();

test('the project folder is its own git repository', () => {
  const top = git('rev-parse', '--show-toplevel');
  assert.ok(top.ok, 'run git init in your project folder (or ask Claude to)');
  assert.ok(same(fs.realpathSync(top.out), fs.realpathSync(dir)), `the repository starts at ${top.out}, not in this folder`);
  assert.ok(Number(git('rev-list', '--count', 'HEAD').out) >= 2, 'make at least two commits');
});

test('.gitignore keeps out dependencies, secrets and the database', () => {
  for (const f of ['node_modules/express/index.js', '.env', 'bookings.db']) {
    assert.ok(git('check-ignore', '-q', '--no-index', f).ok, `${f} should be ignored: add it to .gitignore`);
  }
});

test('no secrets or database files were ever committed', () => {
  const ever = git('log', '--all', '--name-only', '--format=').out.split('\n').map((s) => s.trim()).filter(Boolean);
  const bad = ever.filter((f) => /(^|\/)\.env$/.test(f) || /\.(db|sqlite)$/.test(f));
  assert.deepEqual([...new Set(bad)], [], 'remove these from the history before you push (Chapter 14 shows how)');
});

test('the repository is on GitHub', () => {
  const url = git('remote', 'get-url', 'origin');
  assert.ok(url.ok, 'add your GitHub repository as the remote called origin');
  assert.match(url.out, /github\.com[:/]/, 'origin should point to github.com');
});

test('a workflow runs the tests on every push and pull request', () => {
  const wf = path.join(dir, '.github', 'workflows');
  const files = fs.existsSync(wf) ? fs.readdirSync(wf).filter((f) => /\.ya?ml$/.test(f)) : [];
  assert.ok(files.length, 'add a workflow file in .github/workflows/');
  const text = files.map((f) => fs.readFileSync(path.join(wf, f), 'utf8')).join('\n');
  assert.match(text, /\bpush\b/, 'run on push');
  assert.match(text, /\bpull_request\b/, 'run on pull_request');
  assert.match(text, /npm (run )?test/, 'run npm test');
});

test('a pull request was merged and main was pulled since', () => {
  // GitHub names the merge commit "Merge pull request #<n> ...", which tells it apart from merges made on your computer.
  const merged = git('log', '--merges', '--grep=^Merge pull request #', '--format=%H', '-n', '1').out;
  assert.ok(merged, 'merge a pull request on GitHub, then git pull on main');
});
