// Acceptance tests for Project 1. They check what the program does, not how,
// so they pass for any correct report.js, whatever code Claude writes.
// PROJECT_DIR lets the kit run these tests against the reference solution.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));
const script = path.join(dir, 'report.js');
const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: 'utf8' });

test('report.js exists', () => {
  assert.ok(fs.existsSync(script), 'create report.js in the project folder');
});

test('writes report.md with the month in the title', () => {
  const r = run();
  assert.equal(r.status, 0, r.stderr);
  const md = fs.readFileSync(path.join(dir, 'report.md'), 'utf8');
  assert.match(md, /^# Spending report: September 2026/m);
});

test('prints the same report to the screen', () => {
  const r = run();
  assert.match(r.stdout, /Spending report: September 2026/);
  assert.match(r.stdout, /\| Category \| Spent \| Share \|/);
});

test('adds up money in and money out', () => {
  const md = (run(), fs.readFileSync(path.join(dir, 'report.md'), 'utf8'));
  assert.match(md, /Money in: \$4,200\.00/);
  assert.match(md, /Money out: \$2,653\.84/);
});

test('sorts categories from most to least spent, with shares', () => {
  const md = (run(), fs.readFileSync(path.join(dir, 'report.md'), 'utf8'));
  const rows = md.split('\n').filter((l) => /^\| (?!Category|-)/.test(l));
  const names = rows.map((l) => l.split('|')[1].trim());
  assert.deepEqual(names, ['Bills', 'Groceries', 'Transport', 'Software', 'Eating out', 'Other']);
  assert.match(md, /\| Bills \| \$2,107\.59 \| 79\.4% \|/);
  assert.match(md, /\| Other \| \$27\.50 \| 1\.0% \|/);
});

test('keeps descriptions that contain commas in one piece', () => {
  const md = (run(), fs.readFileSync(path.join(dir, 'report.md'), 'utf8'));
  assert.match(md, /\| Eating out \| \$46\.00 \|/);   // includes "BLUE DOOR CAFE, OAKLAND"
});

test('skips bad rows and says which lines', () => {
  const md = (run(), fs.readFileSync(path.join(dir, 'report.md'), 'utf8'));
  assert.match(md, /Skipped 2 rows \(lines 8, 13\)/);
});

test('works on a different CSV file', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'exp-'));
  const csv = path.join(tmp, 'small.csv');
  fs.writeFileSync(csv, 'Date,Description,Amount\n2026-10-01,SAFEWAY,-10.00\n2026-10-02,PAYCHECK,50.00\n');
  try {
    const r = run(csv);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Spending report: October 2026/);
    assert.match(r.stdout, /\| Groceries \| \$10\.00 \| 100\.0% \|/);
  } finally {
    run();   // put Daniel's September report back in report.md
  }
});

test('explains a missing file and exits with code 1', () => {
  const r = run('no-such-file.csv');
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /not found/i);
});
