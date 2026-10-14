// Loads the stock list from a CSV file exported by the till.
// Columns: sku,name,category,quantity,reorder_level,reorder_to,unit_cost
const fs = require('node:fs');

function loadInventory(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  return lines.slice(2).map((line) => {
    const cols = line.split(',');
    return {
      sku: cols[0],
      name: cols[1],
      category: cols[2],
      quantity: parseInt(cols[3], 10),
      reorderLevel: parseInt(cols[4], 10),
      reorderTo: parseInt(cols[5], 10),
      unitCost: parseInt(cols[6], 10),
    };
  });
}

function findItem(items, sku) {
  return items.find((i) => i.sku === sku);
}

// Search by name or SKU.
function search(items, query) {
  return items.filter((i) => i.name.includes(query) || i.sku.includes(query));
}

// Record a sale and return the new quantity.
function sell(items, sku, qty) {
  const item = findItem(items, sku);
  if (!item) throw new Error(`Unknown SKU: ${sku}`);
  if (!(qty > 0)) throw new Error('Quantity must be more than 0');
  item.quantity -= qty;
  return item.quantity;
}

module.exports = { loadInventory, findItem, search, sell };
