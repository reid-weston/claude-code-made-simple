// A tiny HTML reader for the tests, so they need no packages.
// It finds tags and their attributes; it doesn't build a full page tree.
const fs = require('node:fs');
const path = require('node:path');

const dir = path.resolve(process.env.PROJECT_DIR || path.join(__dirname, '..'));

function read(file) {
  const p = path.join(dir, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function attrs(text) {
  const out = {};
  for (const m of (text || '').matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

// Every opening tag: { name, attrs, index }
function tags(html, name) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  const list = [];
  for (const m of clean.matchAll(/<([a-zA-Z][\w-]*)(\s[^>]*)?>/g)) {
    const t = { name: m[1].toLowerCase(), attrs: attrs(m[2]), index: m.index };
    if (!name || t.name === name) list.push(t);
  }
  return list;
}

// The text inside the first <tag>...</tag>, or the whole page's text.
function inner(html, tag) {
  const m = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(html);
  return m ? m[1] : null;
}

function text(html) {
  return (html || '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#36;/g, '$').replace(/&mdash;/g, '—')
    .replace(/&rsquo;|&#8217;/g, '’').replace(/\s+/g, ' ')
    .trim();
}

// A local link without ./, ?query or #hash; null for web, mail and phone links.
function local(href) {
  if (href === undefined || /^(https?:|mailto:|tel:|#|data:|\/\/)/i.test(href)) return null;
  const clean = href.split(/[?#]/)[0].replace(/^\.\//, '');
  return clean === '' || clean === '.' || clean === './' ? 'index.html' : clean.replace(/\/$/, '/index.html');
}

module.exports = { dir, read, tags, inner, text, local };
