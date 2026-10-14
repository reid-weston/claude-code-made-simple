# Bookings, Live

Put the Bright Nest booking app on the internet, on a free hosting plan, so Priya can
send clients a link.

You work in your **Project 4 folder** (now a GitHub repository, after Project 6). The
checks in `checks/deploy.test.js` prove the app is ready for a host, and, once it's live,
that the live site works.

## Get started

1. Copy the `checks` folder from here into your Project 4 folder (next to the Ship It check).
2. In your Project 4 folder, run:

```
node --test "checks/*.test.js"
```

## What it must have

1. `package.json` has a `start` script that runs the server, and an `engines` entry that
   says which Node.js version it needs, such as `"node": ">=22.13"`.
2. The server listens on the port in the `PORT` environment variable. Hosts choose the port.
3. `GET /health` answers `200` with `{ "status": "ok" }`. Hosts use it to see the app is up.
4. When `NODE_ENV` is `production` and `ADMIN_KEY` isn't set, the server refuses to start
   and prints a message that mentions `ADMIN_KEY`. A live app must never run with open
   admin routes.
5. The live site works: set `DEPLOY_URL` to its address and run the checks again. The
   live check is skipped until you do.

```
DEPLOY_URL=https://your-app.onrender.com node --test "checks/*.test.js"            # Mac, Linux
$env:DEPLOY_URL="https://your-app.onrender.com"; node --test "checks/*.test.js"    # Windows PowerShell
```

Your app's own tests must still pass:

```
npm test
```

## Rules

- The admin key lives only in `.env` on your computer and in the host's environment
  settings. Never in git.
- Don't change the checks.
