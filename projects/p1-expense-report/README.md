# Expense Report

Turn a bank's CSV export into a one-page spending report.

## How to run

```
node report.js                         # reads data/transactions.csv
node report.js path/to/other.csv       # any other export
```

## What it must do

1. Read a CSV file with the columns `Date,Description,Amount`.
   - `Date` is `YYYY-MM-DD`.
   - `Amount` is a number. Negative = money spent, positive = money received.
   - A description may contain commas, in which case it is wrapped in double quotes.
2. Put every spending row in a category using `data/categories.json`.
   A row belongs to the first category with a keyword found anywhere in its
   description, ignoring upper/lower case. No match = `Other`.
3. Skip rows whose date or amount is not valid, and remember their line numbers.
4. Write `report.md` next to `report.js`, and print the same text to the screen:
   - a title with the month of the first valid row, e.g. `# Spending report: September 2026`
   - `Money in: $X` and `Money out: $Y`
   - a table `| Category | Spent | Share |`, one row per category that has spending,
     sorted from most to least spent. Amounts look like `$1,234.56`, shares like `42.0%`.
   - if any rows were skipped: `Skipped 2 rows (lines 8, 13)` (line 1 is the header)
5. If the CSV file doesn't exist, print a message containing `not found` and exit with code 1.

## Rules
- Plain Node.js (version 22 or newer). No npm packages.
- One file: `report.js`.

## Check your work

```
npm test
```

All tests in `tests/` must pass. Don't change the tests.
