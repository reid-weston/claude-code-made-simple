// Acceptance tests for Tab Tidy's files: what Chrome needs to load the extension safely.
// Loading it in Chrome and trying the buttons is still your job (see the chapter).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(process.env.PROJECT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : null);
const manifest = () => {
  const text = read('manifest.json');
  assert.ok(text, 'create manifest.json');
  return JSON.parse(text);
};

test('manifest.json describes a Manifest V3 extension called Tab Tidy', () => {
  const m = manifest();
  assert.equal(m.manifest_version, 3);
  assert.equal(m.name, 'Tab Tidy');
  assert.match(String(m.version || ''), /^\d+(\.\d+){0,3}$/, 'a version such as "1.0.0"');
  assert.ok((m.description || '').length > 10, 'a short description');
});

test('the toolbar icon opens popup.html, and every icon file exists', () => {
  const m = manifest();
  assert.equal(m.action?.default_popup, 'popup.html');
  assert.ok(read('popup.html'), 'create popup.html');
  const icons = { ...(m.icons || {}), ...(m.action?.default_icon || {}) };
  assert.ok(Object.keys(icons).length >= 3, 'list icons for 16, 48 and 128 pixels');
  for (const f of Object.values(icons)) assert.ok(fs.existsSync(path.join(dir, f)), `${f} doesn't exist`);
});

test('asks only for the permissions it needs', () => {
  const m = manifest();
  const perms = m.permissions || [];
  assert.ok(perms.includes('tabs'), 'needs the "tabs" permission to read tab addresses');
  for (const p of perms) assert.ok(['tabs', 'tabGroups'].includes(p), `"${p}" isn't needed`);
  assert.ok(!m.host_permissions?.length, 'no host_permissions');
  assert.ok(!JSON.stringify(m).includes('<all_urls>'), 'no <all_urls>');
});

test('the popup loads only files from this folder', () => {
  const html = read('popup.html') || '';
  const srcs = [...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  assert.ok(srcs.length > 0, 'popup.html loads a script');
  for (const s of srcs) {
    assert.ok(!/^(https?:)?\/\//i.test(s), `${s}: extensions can't load code from the web`);
    assert.ok(fs.existsSync(path.join(dir, s.split(/[?#]/)[0])), `${s} doesn't exist`);
  }
  assert.ok(!/<script\b(?![^>]*\bsrc=)[^>]*>\s*\S/i.test(html), 'move inline <script> code into a file (Chrome blocks inline scripts)');
});
