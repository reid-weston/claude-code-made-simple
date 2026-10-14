# Tab Tidy

A Chrome extension for people with too many tabs open. Select its icon and a small
window (the popup) shows how many duplicate, grouped and forgotten tabs you have, with
one button to tidy each kind.

## What's in this folder

- `icons/`: the extension's icons
- `tests/`: checks for the tab logic and the extension's files

## What it must do

### The tab logic: `tidy.js`
Put the logic in `tidy.js`, an ES module that exports these three functions. Each takes
a list of tabs shaped like Chrome's own tab objects: `{ id, index, url, title, pinned,
active, lastAccessed }` (`lastAccessed` is a time in milliseconds).

1. `findDuplicates(tabs)` returns the `id`s of tabs to close because another tab shows
   the same page. Two URLs are the same page if they differ only in a `#fragment`, a
   trailing `/`, a leading `www.` or the upper/lower case of the host name. From each set
   of duplicates keep one tab: a pinned one if there is one, otherwise the active one,
   otherwise the one furthest left (lowest `index`). Never close a pinned or active tab.
2. `groupByDomain(tabs)` returns `[{ domain, count, tabIds }]` for every site with two or
   more tabs, the site name without `www.`, most tabs first, then A to Z, with each
   site's `tabIds` in tab order (left to right). Only `http` and `https` tabs count.
3. `staleTabs(tabs, now, days = 7)` returns the `id`s of tabs not looked at for more than
   `days` days before `now`, oldest first. Never pinned or active tabs.

### The extension
4. `manifest.json` uses Manifest V3, is named "Tab Tidy", has a version and a description,
   uses the icons in `icons/`, and opens `popup.html` when you select the toolbar icon.
5. It asks for as few permissions as possible: `tabs`, plus `tabGroups` if you group tabs.
   No host permissions and no `<all_urls>`.
6. `popup.html` shows the three counts and a button for each action, and every file it
   loads is in this folder (Chrome extensions can't load code from the web).

## Rules
- Plain JavaScript, HTML and CSS. No packages, no build step.

## Check your work

```
npm test
```

All tests in `tests/` must pass. Don't change the tests. Then load the folder in Chrome
(`chrome://extensions`, **Developer mode**, **Load unpacked**) and try every button.
