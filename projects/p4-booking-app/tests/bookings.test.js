// Acceptance tests for Project 4. They start server.js and use it the way a browser
// would, over HTTP, so they pass for any correct app, whatever framework or code it uses.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { start, api, ADMIN_KEY } = require('./server');

const MONDAY = '2030-03-04';
const SATURDAY = '2030-03-09';
const ALL = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const booking = (over = {}) => ({ name: 'Ana Lima', email: 'ana@example.com', date: MONDAY, time: '10:00', notes: 'Living room', ...over });

let app, http;
before(async () => { app = await start(); http = api(app.base); });
after(async () => { if (app) await app.stop(); });

test('serves a booking page with a form', async () => {
  const r = await http.get('/');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') || '', /text\/html/);
  assert.match(await r.text(), /<form/i);
});

test('lists the free times on a weekday, earliest first', async () => {
  const r = await http.get(`/api/slots?date=${MONDAY}`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { date: MONDAY, slots: ALL });
});

test('has no times at weekends or in the past, and rejects a bad date', async () => {
  assert.deepEqual((await (await http.get(`/api/slots?date=${SATURDAY}`)).json()).slots, []);
  assert.deepEqual((await (await http.get('/api/slots?date=2020-01-06')).json()).slots, []);
  assert.equal((await http.get('/api/slots?date=next-tuesday')).status, 400);
  assert.equal((await http.get('/api/slots')).status, 400);
});

test('books a free slot, which then disappears from the list', async () => {
  const r = await http.post('/api/bookings', booking());
  assert.equal(r.status, 201);
  const b = await r.json();
  assert.ok(b.id !== undefined && b.id !== null, 'the new booking has an id');
  assert.equal(b.name, 'Ana Lima');
  assert.equal(b.time, '10:00');
  const { slots } = await (await http.get(`/api/slots?date=${MONDAY}`)).json();
  assert.deepEqual(slots, ALL.filter((t) => t !== '10:00'));
});

test('refuses to double-book a slot', async () => {
  const r = await http.post('/api/bookings', booking({ name: 'Second Person', email: 'two@example.com' }));
  assert.equal(r.status, 409);
  assert.ok((await r.json()).error, 'explain the problem in "error"');
});

test('rejects bookings that break the rules', async () => {
  const bad = [
    booking({ name: '', time: '11:00' }),
    booking({ email: 'not-an-email', time: '11:00' }),
    booking({ date: SATURDAY, time: '11:00' }),
    booking({ date: '2020-01-06', time: '11:00' }),
    booking({ time: '12:00' }),
    booking({ time: '09:30' }),
  ];
  for (const b of bad) {
    const r = await http.post('/api/bookings', b);
    assert.equal(r.status, 400, `expected 400 for ${JSON.stringify(b)}`);
    assert.ok((await r.json()).error, 'explain the problem in "error"');
  }
});

test('only the admin can list bookings', async () => {
  assert.equal((await http.get('/api/bookings')).status, 401);
  assert.equal((await http.get('/api/bookings', 'wrong-key')).status, 401);
  await http.post('/api/bookings', booking({ name: 'Early Bird', email: 'early@example.com', time: '09:00' }));
  const r = await http.get('/api/bookings', ADMIN_KEY);
  assert.equal(r.status, 200);
  const list = await r.json();
  assert.deepEqual(list.map((b) => b.time), ['09:00', '10:00'], 'earliest first');
});

test('the admin can cancel a booking, which frees the slot', async () => {
  const list = await (await http.get('/api/bookings', ADMIN_KEY)).json();
  const early = list.find((b) => b.time === '09:00');
  assert.equal((await http.del(`/api/bookings/${early.id}`)).status, 401, 'cancelling needs the admin key');
  assert.equal((await http.del(`/api/bookings/${early.id}`, ADMIN_KEY)).status, 204);
  assert.equal((await http.del(`/api/bookings/${early.id}`, ADMIN_KEY)).status, 404);
  const { slots } = await (await http.get(`/api/slots?date=${MONDAY}`)).json();
  assert.ok(slots.includes('09:00'), '09:00 is free again');
});

test('serves the admin page', async () => {
  const r = await http.get('/admin.html');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<(input|form)/i);
});

test('keeps bookings after a restart', async () => {
  await app.stop();
  app = await start(app.db);
  http = api(app.base);
  const list = await (await http.get('/api/bookings', ADMIN_KEY)).json();
  assert.ok(list.some((b) => b.name === 'Ana Lima' && b.date === MONDAY && b.time === '10:00'));
});
