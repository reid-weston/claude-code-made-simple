// Money helpers. All amounts are US dollars.
function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatMoney(n) {
  return '$' + round2(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = { round2, formatMoney };
