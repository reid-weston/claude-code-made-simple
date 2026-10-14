// Acceptance tests for Project 2. They read the finished pages and check what a visitor
// (or a screen reader) gets, not how the HTML is written, so any correct site passes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { dir, read, tags, inner, text, local } = require('./html');

const PAGES = ['index.html', 'services.html', 'contact.html'];
const page = (f) => read(f) || '';

test('the three pages exist', () => {
  for (const f of PAGES) assert.ok(read(f) !== null, `create ${f}`);
});

test('every page is a proper HTML page that works on phones', () => {
  for (const f of PAGES) {
    const html = page(f);
    assert.match(html, /^\s*<!doctype html>/i, `${f}: start with <!DOCTYPE html>`);
    assert.equal(tags(html, 'html')[0]?.attrs.lang, 'en', `${f}: <html lang="en">`);
    assert.ok(tags(html, 'meta').some((m) => (m.attrs.charset || '').toLowerCase() === 'utf-8'), `${f}: <meta charset="utf-8">`);
    assert.ok(tags(html, 'meta').some((m) => m.attrs.name === 'viewport'), `${f}: viewport meta tag`);
    assert.match(text(inner(html, 'title')), /Bright Nest/, `${f}: <title> includes Bright Nest`);
  }
});

test('every page has one h1 and headings never skip a level', () => {
  for (const f of PAGES) {
    const levels = tags(page(f)).filter((t) => /^h[1-6]$/.test(t.name)).map((t) => +t.name[1]);
    assert.equal(levels.filter((l) => l === 1).length, 1, `${f}: exactly one <h1>`);
    levels.forEach((l, i) => {
      if (i > 0) assert.ok(l <= levels[i - 1] + 1, `${f}: <h${l}> comes straight after <h${levels[i - 1]}>`);
    });
  }
});

test('every page has navigation to all three pages', () => {
  for (const f of PAGES) {
    const nav = inner(page(f), 'nav');
    assert.ok(nav, `${f}: add a <nav>`);
    const targets = tags(nav, 'a').map((a) => local(a.attrs.href));
    for (const p of PAGES) assert.ok(targets.includes(p), `${f}: the navigation links to ${p}`);
  }
});

test('every page uses the shared styles.css and no inline styles', () => {
  assert.ok(read('styles.css') !== null, 'create styles.css');
  for (const f of PAGES) {
    const html = page(f);
    const sheets = tags(html, 'link').filter((l) => (l.attrs.rel || '').toLowerCase() === 'stylesheet').map((l) => local(l.attrs.href));
    assert.ok(sheets.includes('styles.css'), `${f}: link styles.css`);
    assert.ok(!tags(html).some((t) => 'style' in t.attrs), `${f}: move style="..." attributes into styles.css`);
  }
});

test('every page has a footer with the business name and email', () => {
  for (const f of PAGES) {
    const footer = text(inner(page(f), 'footer'));
    assert.match(footer, /Bright Nest Interiors/, `${f}: footer names the business`);
    assert.match(footer, /hello@brightnest\.example/, `${f}: footer shows the email address`);
  }
});

test('the home page shows the logo, tagline, about text and three projects', () => {
  const html = page('index.html');
  const imgs = tags(html, 'img').map((i) => local(i.attrs.src));
  assert.ok(imgs.includes('images/logo.svg'), 'show images/logo.svg');
  const t = text(html);
  assert.match(t, /Calm, practical rooms for real life/, 'show the tagline');
  assert.match(t, /two-person design studio in Oakland/, 'show the About text');
  for (const [name, img] of [['Hendricks', 'hendricks'], ['Lakeshore', 'lakeshore'], ['Fruitvale', 'fruitvale']]) {
    assert.match(t, new RegExp(name), `show the ${name} project`);
    assert.ok(imgs.includes(`images/project-${img}.svg`), `show images/project-${img}.svg`);
  }
});

test('the services page lists the four services with their prices', () => {
  const t = text(page('services.html'));
  for (const [service, price] of [['Full-room design', '$1,200'], ['Color consultation', '$250'],
    ['Furniture sourcing', '15%'], ['Home staging', '$900']]) {
    assert.ok(t.includes(service), `list ${service}`);
    assert.ok(t.includes(price), `show the price ${price}`);
  }
});

test('the contact page has the details and an accessible form', () => {
  const html = page('contact.html');
  const t = text(html);
  assert.ok(tags(html, 'a').some((a) => /^mailto:hello@brightnest\.example/i.test(a.attrs.href || '')), 'link the email with mailto:');
  assert.match(t, /\(510\) 555-0142/, 'show the phone number');
  assert.match(t, /Monday to Friday/, 'show the hours');
  const form = tags(html, 'form')[0];
  assert.ok(form, 'add a <form>');
  assert.match(form.attrs.action || '', /^mailto:hello@brightnest\.example/i, 'form action is mailto:hello@brightnest.example');
  const fields = tags(html).filter((x) => (x.name === 'input' && !/^(submit|button|hidden|reset)$/i.test(x.attrs.type || '')) || x.name === 'textarea');
  assert.ok(fields.length >= 3, 'add name, email and message fields');
  assert.ok(fields.some((x) => (x.attrs.type || '').toLowerCase() === 'email'), 'the email field has type="email"');
  assert.ok(fields.some((x) => x.name === 'textarea'), 'the message field is a <textarea>');
  const labelFor = tags(html, 'label').map((l) => l.attrs.for).filter(Boolean);
  const wrapped = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => m[1]);
  for (const x of fields) {
    const id = x.attrs.id;
    const labelled = (id && labelFor.includes(id)) || wrapped.some((w) => w.includes(html.slice(x.index, html.indexOf('>', x.index) + 1)));
    assert.ok(labelled, `give the ${x.attrs.name || x.attrs.type || x.name} field a <label>`);
    assert.ok('required' in x.attrs, `make the ${x.attrs.name || x.attrs.type || x.name} field required`);
  }
  assert.ok(tags(html).some((x) => (x.name === 'button' && (x.attrs.type || 'submit') === 'submit') || (x.name === 'input' && x.attrs.type === 'submit')), 'add a submit button');
});

test('every image has alt text and every local link works', () => {
  for (const f of PAGES) {
    const html = page(f);
    for (const img of tags(html, 'img')) {
      assert.ok((img.attrs.alt || '').trim().length > 2, `${f}: <img src="${img.attrs.src}"> needs alt text`);
    }
    const refs = [...tags(html, 'a').map((a) => a.attrs.href), ...tags(html, 'img').map((i) => i.attrs.src),
      ...tags(html, 'link').map((l) => l.attrs.href), ...tags(html, 'script').map((s) => s.attrs.src)];
    for (const r of refs.map(local).filter(Boolean)) {
      assert.ok(fs.existsSync(path.join(dir, r)), `${f}: the link to ${r} points to a file that doesn't exist`);
    }
  }
});

test('the layout adapts to small screens', () => {
  assert.match(read('styles.css') || '', /@media[^{]*\((max|min)-width/, 'add an @media rule for small screens in styles.css');
});
