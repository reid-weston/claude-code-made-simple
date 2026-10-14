// Harbor Lane stock tool. Run: node cli.js <command>
const path = require('node:path');
const { loadInventory, search } = require('./lib/inventory');
const { lowStock, totalValue, reorderList } = require('./lib/stock');
const { formatMoney, round2 } = require('./lib/money');

const file = process.env.INVENTORY_FILE || path.join(__dirname, 'data', 'inventory.csv');
const [command, ...rest] = process.argv.slice(2);
const items = loadInventory(file);

function usage() {
  console.log('Usage: node cli.js <low | value | reorder | search <text>>');
}

if (command === 'low') {
  for (const i of lowStock(items)) console.log(`${i.sku}  ${i.name}  (${i.quantity} left, reorder at ${i.reorderLevel})`);
} else if (command === 'value') {
  console.log(`Total stock value: ${formatMoney(totalValue(items))}`);
} else if (command === 'reorder') {
  const list = reorderList(items);
  for (const r of list) console.log(`${r.sku}  order ${r.order}  ${formatMoney(r.cost)}  ${r.name}`);
  console.log(`Order total: ${formatMoney(round2(list.reduce((s, r) => s + r.cost, 0)))}`);
} else if (command === 'search') {
  for (const i of search(items, rest.join(' '))) console.log(`${i.sku}  ${i.name}  (${i.quantity} in stock)`);
} else {
  usage();
  process.exitCode = 1;
}
