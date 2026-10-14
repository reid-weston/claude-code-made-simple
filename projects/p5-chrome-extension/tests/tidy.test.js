// Acceptance tests for Tab Tidy's logic. They call the three functions in tidy.js with
// made-up tabs and check the answers, so any correct tidy.js passes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.resolve(process.env.PROJECT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const file = path.join(dir, 'tidy.js');
const load = async () => {
  assert.ok(fs.existsSync(file), 'create tidy.js');
  return import(pathToFileURL(file).href);
};

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2030, 2, 4, 12, 0, 0);
let next = 1;
const tab = (url, more = {}) => ({ id: next, index: next++, url, title: url, pinned: false, active: false, lastAccessed: NOW, ...more });

test('finds tabs that show the same page', async () => {
  const { findDuplicates } = await load();
  next = 1;
  const tabs = [
    tab('https://example.com/news'),          // 1 keep (furthest left)
    tab('https://www.example.com/news/'),     // 2 same page
    tab('https://EXAMPLE.com/news#comments'), // 3 same page
    tab('https://example.com/news?page=2'),   // 4 different page (query)
    tab('https://other.org/'),                // 5 only one
  ];
  assert.deepEqual([...findDuplicates(tabs)].sort((a, b) => a - b), [2, 3]);
});

test('keeps a pinned or active duplicate and never closes one', async () => {
  const { findDuplicates } = await load();
  next = 1;
  const tabs = [
    tab('https://docs.example.com/guide'),                  // 1 close
    tab('https://docs.example.com/guide', { active: true }), // 2 keep (active)
    tab('https://docs.example.com/guide'),                  // 3 close
    tab('https://mail.example.com/', { pinned: true }),     // 4 keep (pinned)
    tab('https://mail.example.com/', { active: false }),    // 5 close
    tab('https://mail.example.com', { pinned: true }),      // 6 pinned: never closed
  ];
  assert.deepEqual([...findDuplicates(tabs)].sort((a, b) => a - b), [1, 3, 5]);
  assert.deepEqual(findDuplicates([]), []);
});

test('groups tabs by site, biggest group first', async () => {
  const { groupByDomain } = await load();
  next = 1;
  const tabs = [
    tab('https://www.news.example/a'), tab('https://news.example/b'),
    tab('https://shop.example/x'), tab('https://shop.example/y'), tab('http://shop.example/z'),
    tab('https://alpha.example/1'), tab('https://alpha.example/2'),
    tab('https://single.example/'), tab('chrome://settings'), tab('chrome://settings/privacy'),
  ];
  assert.deepEqual(groupByDomain(tabs), [
    { domain: 'shop.example', count: 3, tabIds: [3, 4, 5] },
    { domain: 'alpha.example', count: 2, tabIds: [6, 7] },
    { domain: 'news.example', count: 2, tabIds: [1, 2] },
  ]);
});

test('finds tabs you have not looked at for a week, oldest first', async () => {
  const { staleTabs } = await load();
  next = 1;
  const tabs = [
    tab('https://a.example/', { lastAccessed: NOW - 8 * DAY }),                  // 1 stale
    tab('https://b.example/', { lastAccessed: NOW - 30 * DAY }),                 // 2 stale, oldest
    tab('https://c.example/', { lastAccessed: NOW - 2 * DAY }),                  // 3 recent
    tab('https://d.example/', { lastAccessed: NOW - 40 * DAY, pinned: true }),   // 4 pinned
    tab('https://e.example/', { lastAccessed: NOW - 40 * DAY, active: true }),   // 5 active
  ];
  assert.deepEqual(staleTabs(tabs, NOW), [2, 1]);
  assert.deepEqual(staleTabs(tabs, NOW, 1), [2, 1, 3]);
});
