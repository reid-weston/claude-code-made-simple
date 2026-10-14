# Harbor Lane Stock Tool

A small command-line tool that Harbor Lane Supply uses every Monday to check stock and
plan the weekly order. The person who wrote it has left. It runs, but the numbers are
wrong, and Maya Brooks, who runs the office, no longer trusts it.

Your job is to understand the code, find the bugs, and fix them without breaking
anything that works.

## How to run

```
node cli.js low          # items at or below their reorder level
node cli.js value        # total value of the stock, at cost
node cli.js reorder      # what to order, how many, and what it costs
node cli.js search glue  # find items by name or SKU
```

## How it should work

- `data/inventory.csv` is exported from the till. Every row after the header is one item.
- An item is **low** when its quantity is **at or below** its reorder level.
- For a low item, order enough to bring it back up to `reorder_to`. Items that aren't
  low need nothing.
- Stock value is quantity × unit cost for every item, to the cent.
- Search matches the name or the SKU and ignores upper and lower case.
- Selling more of an item than is in stock is an error, and the quantity doesn't change.

The problems Maya has reported are in `ISSUES.md`.

## Rules

- Plain Node.js (version 22 or newer). No npm packages.
- Keep the commands and the files in `lib/` working the way they do now; other scripts
  at Harbor Lane use them.

## Check your work

```
npm test
```

All tests in `tests/` must pass. Don't change the existing tests; you may add new ones.
