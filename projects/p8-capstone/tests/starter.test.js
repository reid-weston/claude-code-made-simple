// Starter tests for the capstone: the minimum the invoice tracker in spec.md must pass.
// The tests Claude writes from the spec go in their own files next to this one.
// TODAY is set to 2030-03-15 for these tests, so "overdue" doesn't depend on the real date.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { start, api } = require('./server');

let app, http;
before(async () => { app = await start(); http = api(app.base); });
after(async () => { if (app) await app.stop(); });

const add = (over = {}) => http.post('/api/invoices', { client: 'Hartley\'s Bakery', amount: 450, issued: '2030-03-01', due: '2030-03-31', ...over });

test('serves the invoice page', async () => {
  const r = await http.get('/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<form/i);
});

test('numbers invoices in order', async () => {
  const a = await (await add()).json();
  const b = await (await add({ client: 'Rosa\'s Garage', amount: 1200.5, issued: '2030-02-01', due: '2030-03-01' })).json();
  assert.equal(a.number, 'INV-0001');
  assert.equal(b.number, 'INV-0002');
  assert.equal(a.status, 'unpaid');
});

test('rejects invoices that break the rules', async () => {
  for (const bad of [{ client: '' }, { amount: 0 }, { amount: -5 }, { amount: 10.123 }, { due: 'soon' }, { issued: '2030-03-10', due: '2030-03-01' }]) {
    const r = await add(bad);
    assert.equal(r.status, 400, `expected 400 for ${JSON.stringify(bad)}`);
    assert.ok((await r.json()).error);
  }
});

test('marks an unpaid invoice overdue after its due date, and lists by due date', async () => {
  const list = await (await http.get('/api/invoices')).json();
  assert.deepEqual(list.map((i) => i.number), ['INV-0002', 'INV-0001'], 'earliest due date first');
  assert.equal(list[0].status, 'overdue');
  const overdue = await (await http.get('/api/invoices?status=overdue')).json();
  assert.deepEqual(overdue.map((i) => i.number), ['INV-0002']);
});

test('marks an invoice paid, once', async () => {
  const [inv] = await (await http.get('/api/invoices?status=overdue')).json();
  const r = await http.post(`/api/invoices/${inv.id}/pay`, { paidOn: '2030-03-12' });
  assert.equal(r.status, 200);
  const paid = await r.json();
  assert.equal(paid.status, 'paid');
  assert.equal(paid.paidOn, '2030-03-12');
  assert.equal((await http.post(`/api/invoices/${inv.id}/pay`, {})).status, 409);
  assert.equal((await http.post('/api/invoices/99999/pay', {})).status, 404);
});

test('sums what is outstanding, overdue and paid this month', async () => {
  await add({ client: 'Lakeside Dental', amount: 300, issued: '2030-01-05', due: '2030-02-05' });
  const s = await (await http.get('/api/summary')).json();
  assert.deepEqual(s, { outstanding: 750, overdue: 300, paidThisMonth: 1200.5 });
});
