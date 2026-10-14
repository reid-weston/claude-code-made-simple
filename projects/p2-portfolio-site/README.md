# Bright Nest Website

A three-page website for Bright Nest Interiors, ready to publish for free on GitHub Pages.

## What's in this folder

- `content/site-content.md`: every word and fact for the site, from Priya Nair
- `images/`: the logo and three project pictures
- `tests/`: checks that the site is complete, linked and accessible

## What it must have

1. Three pages in this folder: `index.html` (home), `services.html` and `contact.html`.
2. Every page:
   - starts with `<!DOCTYPE html>`, has `<html lang="en">`, a `<meta charset="utf-8">`
     and a viewport meta tag, so it works on phones
   - has a `<title>` that includes "Bright Nest"
   - has exactly one `<h1>`, and headings never skip a level (no `<h3>` straight after an `<h1>`)
   - has the same navigation, with links to all three pages
   - links one shared stylesheet, `styles.css`, and uses no `style="..."` attributes
   - has a footer with the business name and email address
3. Home page: the logo (`images/logo.svg`), the tagline, the About text and the three
   recent projects, each with its picture.
4. Services page: the four services with their prices, exactly as in the content file.
5. Contact page: the email address as a `mailto:` link, the phone number, the hours, and a
   contact form with name, email and message fields. Every field has a `<label>` connected
   to it, the email field has `type="email"`, all three are `required`, and the form's
   `action` is `mailto:hello@brightnest.example`.
6. Every image has `alt` text that describes it. Every link to a page or image in this
   folder points to a file that exists.
7. `styles.css` includes at least one `@media` rule so the layout adapts to small screens.

## Rules

- Plain HTML and CSS. No frameworks, no build step, no packages.
- Use only the words and facts in `content/site-content.md`.

## Check your work

```
npm test
```

All tests in `tests/` must pass. Don't change the tests. Then open `index.html` in your
browser and look at every page, on a wide window and a narrow one.
