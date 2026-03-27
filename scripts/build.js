#!/usr/bin/env node
/**
 * Ecodemia build script
 * Scans content/articles/*.md and generates content/articles.json
 * Runs automatically on every Netlify deploy.
 */

const fs   = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const OUTPUT_FILE  = path.join(__dirname, '..', 'content', 'articles.json');

// ---------------------------------------------------------------------------
// Front-matter parser — handles plain `key: value` AND YAML block scalars
// (`key: >` or `key: |`) as produced by Netlify Visual Editor.
// ---------------------------------------------------------------------------
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data  = {};
  const lines = match[1].split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip indented lines (they belong to a block scalar already consumed)
    if (line.startsWith(' ') || line.startsWith('\t')) { i++; continue; }

    const colon = line.indexOf(':');
    if (colon === -1) { i++; continue; }

    const key  = line.slice(0, colon).trim();
    const rest = line.slice(colon + 1).trim();

    // YAML block scalar indicator: > (folded) or | (literal)
    if (rest === '>' || rest === '|') {
      const blockLines = [];
      i++;
      while (i < lines.length) {
        const bl = lines[i];
        if (bl === '' || bl.startsWith('  ') || bl.startsWith('\t')) {
          blockLines.push(bl.startsWith('  ') ? bl.slice(2) : (bl.startsWith('\t') ? bl.slice(1) : ''));
          i++;
        } else {
          break; // Un-indented line signals end of block
        }
      }
      // Trim trailing blank lines
      while (blockLines.length && blockLines[blockLines.length - 1] === '') blockLines.pop();
      data[key] = blockLines.join('\n');
    } else {
      data[key] = rest.replace(/^["']|["']$/g, '');
      i++;
    }
  }

  return { data, body: match[2] };
}

// ---------------------------------------------------------------------------
// Date parser — handles both ISO (2024-03-14) and DD.MM.YYYY (26.03.2026)
// ---------------------------------------------------------------------------
function parseDate(str) {
  if (!str) return new Date(0);
  const dm = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dm) return new Date(+dm[3], +dm[2] - 1, +dm[1]);
  const d = new Date(str);
  return isNaN(d) ? new Date(0) : d;
}

// Strip Markdown syntax to produce a plain-text excerpt
function stripMarkdown(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')   // images
    .replace(/\[[^\]]+\]\([^)]+\)/g, '$1')  // links → text
    .replace(/#{1,6}\s/g, '')               // headings
    .replace(/\*\*|__|\*|_|~~|`/g, '')      // emphasis / code
    .replace(/<[^>]+>/g, '')                // HTML tags
    .replace(/\|[^\n]*/g, '')               // table rows
    .replace(/\n+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

if (!fs.existsSync(ARTICLES_DIR)) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
  console.log('No articles directory found — wrote empty articles.json');
  process.exit(0);
}

const files = fs.readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.md') && f !== '.gitkeep');

const articles = files.map(filename => {
  const raw            = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf8');
  const { data, body } = parseFrontMatter(raw);
  const slug           = filename.replace(/\.md$/, '');

  // Body for auto-excerpt: prefer YAML body field, fall back to Markdown section
  const bodyText   = data.body    || body;
  const bodyTextDE = data.body_de || '';
  const plain      = stripMarkdown(bodyText);
  const plainDE    = bodyTextDE ? stripMarkdown(bodyTextDE) : '';

  return {
    slug,
    title:       data.title       || slug,
    title_de:    data.title_de    || '',
    date:        data.date        || '',
    category:    (data.category   || '').toLowerCase(),
    cover_image: data.cover_image || '',
    excerpt:     data.excerpt     || (plain.slice(0, 200)   + (plain.length   > 200 ? '…' : '')),
    excerpt_de:  data.excerpt_de  || (plainDE.slice(0, 200) + (plainDE.length > 200 ? '…' : '')),
  };
});

// Newest first — handles both ISO and DD.MM.YYYY
articles.sort((a, b) => parseDate(b.date) - parseDate(a.date));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
console.log(`✓ Generated content/articles.json with ${articles.length} article${articles.length !== 1 ? 's' : ''}`);
