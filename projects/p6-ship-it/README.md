# Ship It

Put your Project 4 booking app on GitHub the way professional teams work: in a git
repository with a clean history, automatic tests on every change, and changes that arrive
through pull requests.

You don't build a new app here. You work in your **Project 4 folder** and use the check
in `checks/ship.test.js` to prove the repository is set up properly.

## Get started

1. Copy the `checks` folder from here into your Project 4 folder.
2. In your Project 4 folder, run:

```
node --test "checks/*.test.js"
```

The checks fail until you've done everything below. They're kept out of `tests/` on
purpose, so your GitHub workflow doesn't run them.

## What it must have

1. Your Project 4 folder is its own git repository (not just a folder inside another one).
2. `.gitignore` keeps out `node_modules/`, `.env` and database files (`*.db`).
3. No `.env` file and no database file has ever been committed.
4. The repository is on GitHub, as the remote called `origin`.
5. A GitHub Actions workflow in `.github/workflows/` runs `npm test` on every push and
   every pull request.
6. At least one change arrived through a pull request that was merged with a merge
   commit, and you've pulled `main` since.

Your app's own tests must still pass:

```
npm test
```

## Rules

- Never commit passwords, API keys or the admin key. They belong in `.env` on your
  computer and in your host's settings, never in git.
- Don't change the checks.
