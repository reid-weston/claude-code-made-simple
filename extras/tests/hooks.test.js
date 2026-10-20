// Checks the two example hooks the way Claude Code runs them: JSON on stdin,
// the exit code and stderr out. Exit 2 means "blocked".
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const hooks = path.join(__dirname, '..', 'hooks');
const project = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-'));
fs.mkdirSync(path.join(project, 'tests'));
fs.writeFileSync(path.join(project, 'tests', 'existing.test.js'), '// a test\n');

const run = (script, input, cwd = project) => spawnSync(process.execPath, [path.join(hooks, script)], {
  input: JSON.stringify(input), encoding: 'utf8', cwd, env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
});
const edit = (file) => ({ hook_event_name: 'PreToolUse', tool_name: 'Edit', cwd: project, tool_input: { file_path: file } });

test('protect-tests blocks a change to an existing test', () => {
  const r = run('protect-tests.js', edit(path.join(project, 'tests', 'existing.test.js')));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Blocked: tests\/existing\.test\.js/);
});

test('protect-tests also guards existing tests inside a worktree', () => {
  const wt = path.join(project, '.claude', 'worktrees', 'holidays', 'tests');
  fs.mkdirSync(wt, { recursive: true });
  fs.writeFileSync(path.join(wt, 'existing.test.js'), '// a test\n');
  assert.equal(run('protect-tests.js', edit(path.join(wt, 'existing.test.js'))).status, 2);
  assert.equal(run('protect-tests.js', edit(path.join(wt, 'new.test.js'))).status, 0);
});

test('protect-tests allows a new test file and any other file', () => {
  assert.equal(run('protect-tests.js', edit(path.join(project, 'tests', 'new.test.js'))).status, 0);
  assert.equal(run('protect-tests.js', edit(path.join(project, 'server.js'))).status, 0);
  assert.equal(run('protect-tests.js', edit('tests/new-relative.test.js')).status, 0);
});

test('test-before-commit blocks when npm test fails and allows when it passes', () => {
  const failing = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-'));
  fs.writeFileSync(path.join(failing, 'package.json'), JSON.stringify({ scripts: { test: 'node -e "process.exit(1)"' } }));
  const blocked = run('test-before-commit.js', {}, failing);
  assert.equal(blocked.status, 2);
  assert.match(blocked.stderr, /Blocked: npm test fails/);

  const passing = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-'));
  fs.writeFileSync(path.join(passing, 'package.json'), JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }));
  assert.equal(run('test-before-commit.js', {}, passing).status, 0);
});

test('the settings file registers both hooks with node, so they work on every platform', () => {
  const s = JSON.parse(fs.readFileSync(path.join(hooks, 'settings.json'), 'utf8'));
  const all = s.hooks.PreToolUse.flatMap((m) => m.hooks);
  assert.ok(all.every((h) => h.command === 'node' && h.args[0].includes('${CLAUDE_PROJECT_DIR}/.claude/hooks/')));
  assert.ok(all.some((h) => h.if === 'Bash(git commit *)'));
  assert.ok(all.some((h) => h.if === 'PowerShell(git commit *)'), 'on Windows Claude may commit through PowerShell');
});
