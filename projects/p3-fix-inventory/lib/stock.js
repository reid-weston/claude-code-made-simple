// Stock checks for the Monday order.
const { round2 } = require('./money');

// Items that need reordering: at or below their reorder level.
function lowStock(items) {
  return items.filter((i) => i.quantity < i.reorderLevel);
}

// How many to order to bring an item back up to its reorder_to level.
// Items that aren't low need 0.
function reorderQuantity(item) {
  if (item.quantity > item.reorderLevel) return 0;
  return item.reorderTo - item.reorderLevel;
}

function totalValue(items) {
  return round2(items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0));
}

function reorderList(items) {
  return lowStock(items).map((i) => {
    const qty = reorderQuantity(i);
    return { sku: i.sku, name: i.name, order: qty, cost: round2(qty * i.unitCost) };
  });
}

module.exports = { lowStock, reorderQuantity, totalValue, reorderList };
