# Bright Nest Bookings

A booking app for Bright Nest Interiors: clients book one-hour consultations, Priya
sees and cancels them. Node.js server, SQLite database, plain HTML pages.

## Commands
- `npm start`: run the app at http://localhost:3000 (reads settings from `.env`)
- `npm test`: run the acceptance tests. Run them before you say any task is done.

## Layout
- `server.js`: the server and the API
- `public/`: the booking page (`index.html`) and the admin page (`admin.html`)
- `tests/`: acceptance tests; `tests/server.js` starts the app for them

## Rules
- Never change an existing test. You may add new tests in new files.
- Opening hours are in README.md. Ask before changing them.
- Use parameterized SQL queries, never text joined into SQL.
- Put text from the server on pages with textContent, never innerHTML.
- Secrets live in `.env` and are never committed. Never print the admin key.
- Keep it plain: no new packages without asking me first.

## How I like to work
- Plan first for anything bigger than a small fix.
- One change per commit, with a message that says why.
- Explain changes in plain English; I'm not a developer.
