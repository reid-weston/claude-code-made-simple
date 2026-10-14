# Bright Nest Bookings

A small web app where clients book a one-hour design consultation with Priya Nair,
and Priya sees and cancels bookings. Bookings are stored in a SQLite database, so they
survive a restart.

## How to run

```
npm start            # then open http://localhost:3000
```

Settings come from environment variables. Copy `.env.example` to `.env` and fill it in;
`npm start` reads it. Never commit `.env`.

| Variable | What it is | Default |
|---|---|---|
| `PORT` | The port the server listens on | `3000` |
| `DB_PATH` | Where the SQLite database file lives | `bookings.db` in this folder |
| `ADMIN_KEY` | The password Priya uses for the admin routes | none: admin routes refuse everyone |

## What it must do

### Opening hours
Consultations start on the hour at 09:00, 10:00, 11:00, 13:00, 14:00, 15:00 and 16:00,
Monday to Friday. There are no consultations at 12:00, at weekends or in the past.

### The API (all JSON)
1. `GET /api/slots?date=YYYY-MM-DD` returns `{ "date": "...", "slots": ["09:00", ...] }`:
   the free start times that day, earliest first. A weekend or past date has no slots.
   A missing or invalid date is a `400`.
2. `POST /api/bookings` with `{ "name", "email", "date", "time", "notes" }` (notes optional)
   creates a booking and returns `201` with the booking, including a new `id`.
   - `400` with `{ "error": "..." }` if the name is empty, the email doesn't look like an
     email address, or the date and time aren't a free consultation slot as defined above
     (weekend, past, 12:00, not on the hour...).
   - `409` with `{ "error": "..." }` if that slot is already booked.
3. `GET /api/bookings` lists every booking, earliest first. Admin only.
4. `DELETE /api/bookings/:id` cancels a booking and returns `204`, or `404` if there's no
   such booking. Admin only. The slot becomes free again.
5. Admin only means the request has a header `x-admin-key` equal to `ADMIN_KEY`.
   Anything else gets `401`.

### The pages
6. `GET /` serves a booking page: pick a date, see the free times, fill in name, email
   and notes, and book. Show a clear confirmation or the error message.
7. `GET /admin.html` serves a page where Priya enters her admin key and sees and cancels
   bookings.

### Storage
8. Bookings are stored in SQLite at `DB_PATH` and are still there after a restart.

## Rules
- Node.js 22.13 or newer. Use Node's built-in `node:sqlite` module, or a package such as
  `better-sqlite3`, for the database. A web framework such as Express is fine too.
- `npm start` starts the server. `node server.js` must work too.

## Check your work

```
npm test
```

All tests in `tests/` must pass. Don't change the tests.
