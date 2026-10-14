# Invoice Tracker: one-page spec

## Who it's for and the problem
Daniel Ortiz, a freelance bookkeeper, sends about 15 invoices a month from a spreadsheet.
He loses track of which are paid, and chases late payers too late.

## What it does
1. Daniel adds an invoice: client name, amount, date issued and date due. Each invoice
   gets the next number, `INV-0001`, `INV-0002` and so on. Numbers are never reused.
2. An invoice is **unpaid** until he marks it paid. An unpaid invoice whose due date has
   passed is **overdue**.
3. He marks an invoice paid, with the date it was paid (today if he doesn't say).
   Marking a paid invoice paid again is an error.
4. He sees all invoices, earliest due date first, and can show only unpaid, overdue or
   paid ones.
5. A summary shows the total outstanding (all unpaid, including overdue), the total
   overdue, and the total paid this month.

## What it doesn't do (yet)
No logins, no emailing invoices, no PDFs, no taxes, no currencies other than US dollars.
It runs on Daniel's own computer only.

## Data
- client: required text
- amount: required, more than 0, at most 2 decimal places
- issued, due: required dates (YYYY-MM-DD); due can't be before issued
- description: optional text
- paidOn: a date, or empty while unpaid

## Screens and API
- `GET /`: one page with the invoice list, the summary, a form to add an invoice and a
  "Mark paid" button on each unpaid invoice
- `POST /api/invoices`: add an invoice; `201` with the invoice; `400` with `{ "error" }`
  if a field breaks the rules above
- `GET /api/invoices` and `GET /api/invoices?status=unpaid|overdue|paid`: the list.
  Each invoice has `id`, `number`, `client`, `amount`, `issued`, `due`, `description`,
  `status` (`unpaid`, `overdue` or `paid`) and `paidOn`
- `POST /api/invoices/:id/pay` with an optional `{ "paidOn" }`: `200` with the invoice,
  `404` if there's no such invoice, `409` if it's already paid
- `GET /api/summary`: `{ "outstanding", "overdue", "paidThisMonth" }` as numbers

## Done when
- `npm test` passes: the starter tests in `tests/` and the tests Claude writes from this spec
- Daniel can add, list and mark invoices paid in the browser

## Rules
- Node.js 22.13 or newer; SQLite for storage (built-in `node:sqlite` or a package)
- `npm start` and `node server.js` start it. `PORT` and `DB_PATH` work as in Project 4.
- `TODAY` (YYYY-MM-DD), if set, replaces today's date, so tests can check overdue invoices.
