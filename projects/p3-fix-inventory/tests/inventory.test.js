// Acceptance tests for the Harbor Lane stock tool. Some pass and some fail: the failing
// ones describe bugs Maya has reported. They call the functions in lib/ and run cli.js,
// and check results only, so any correct fix passes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));
const csv = path.join(dir, 'data', 'inventory.csv');
const { loadInventory, search, sell } = require(path.join(dir, 'lib', 'inventory.js'));
const { lowStock, reorderQuantity, totalValue, reorderList } = require(path.join(dir, 'lib', 'stock.js'));
const { formatMoney } = require(path.join(dir, 'lib', 'money.js'));
const cli = (...args) => spawnSync(process.execPath, [path.join(dir, 'cli.js'), ...args], { cwd: dir, encoding: 'utf8' });
const items = () => loadInventory(csv);

test('loads every item in the CSV, starting with the first row', () => {
  const list = items();
  assert.equal(list.length, 10);
  assert.equal(list[0].sku, 'HL-1001');
  assert.equal(list[0].quantity, 42);
});

test('reads unit costs to the cent', () => {
  const primer = items().find((i) => i.sku === 'HL-1006');
  assert.equal(primer.unitCost, 27.5);
});

test('counts an item at its reorder level as low', () => {
  const skus = lowStock(items()).map((i) => i.sku).sort();
  assert.deepEqual(skus, ['HL-1002', 'HL-1003', 'HL-1005', 'HL-1008', 'HL-1010']);
});

test('orders enough to bring a low item back up to reorder_to', () => {
  const list = items();
  const pine = list.find((i) => i.sku === 'HL-1003');
  assert.equal(reorderQuantity(pine), 52);
  const glue = list.find((i) => i.sku === 'HL-1002');
  assert.equal(reorderQuantity(glue), 28);
  const concrete = list.find((i) => i.sku === 'HL-1007');
  assert.equal(reorderQuantity(concrete), 0, 'items that are not low need nothing');
});

test('adds up the stock value to the cent', () => {
  assert.equal(totalValue(items()), 2184.7);
  assert.match(cli('value').stdout, /Total stock value: \$2,184\.70/);
});

test('prices the Monday order correctly', () => {
  const list = reorderList(items());
  assert.equal(list.length, 5);
  assert.match(cli('reorder').stdout, /Order total: \$1,343\.68/);
});

test('search ignores upper and lower case', () => {
  assert.deepEqual(search(items(), 'GLUE').map((i) => i.sku), ['HL-1002']);
  assert.deepEqual(search(items(), 'hl-1007').map((i) => i.sku), ['HL-1007']);
});

test('formats money with a dollar sign, commas and cents', () => {
  assert.equal(formatMoney(1234.5), '$1,234.50');
  assert.equal(formatMoney(0), '$0.00');
});

test('a sale reduces the quantity', () => {
  const list = items();
  assert.equal(sell(list, 'HL-1007', 4), 60);
  assert.equal(list.find((i) => i.sku === 'HL-1007').quantity, 60);
});

test('a sale of an unknown SKU is refused', () => {
  assert.throws(() => sell(items(), 'HL-9999', 1), /Unknown SKU/);
});

test('an unknown command shows how to use the tool', () => {
  const r = cli('dance');
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /Usage/);
});
