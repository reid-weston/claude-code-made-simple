# Capstone: a small product from a one-page spec

In every other project, the spec and the tests were written for you. This time you
write the spec, Claude writes the tests from it **before** writing any code, and then
builds the product until every test passes.

## What's in this folder

- `SPEC-TEMPLATE.md`: a one-page spec to fill in for your own idea
- `spec.md`: a finished example, Daniel Ortiz's invoice tracker. Build this one if you
  don't have an idea of your own yet.
- `tests/`: a few starter tests for the invoice tracker, the minimum it must pass

## How it works

1. Write your spec (or read `spec.md` closely). Keep it to one page.
2. Ask Claude to turn every rule in the spec into a test, in `tests/`, and run them.
   They should all fail: there's no product yet.
3. Read the tests. Each rule in the spec should have at least one test. Fix the gaps now.
4. Ask Claude to build the product until every test passes, without changing the tests.

## Check your work

```
npm test
```

Every test must pass: the starter tests and the ones written from your spec.
