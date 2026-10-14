---
name: test-and-commit
description: Runs the tests, and only if every test passes, commits the changes with a clear message. Use when I say "test and commit" or "save this if it works".
disable-model-invocation: true
argument-hint: "[what changed, in a few words]"
---

Save the current work safely.

1. Run `npm test`.
2. If any test fails, stop. Show me the names of the failing tests and the first
   lines of each error. Don't commit, and don't change any test.
3. If every test passes, run `git status` and `git diff --stat`, and check that no
   `.env` file, database file or `node_modules` folder is about to be committed.
   If one is, stop and tell me.
4. Commit everything else with a message of one short line that says what changed
   and why. If I wrote something after the command, use it: $ARGUMENTS
5. Tell me the commit message and how many tests passed.
