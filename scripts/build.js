#!/usr/bin/env node
/**
 * Ecodemia build script
 * Scans content/articles/*.md and generates content/articles.json
 * Runs on every deploy (npm run build), before scripts/build-site.js.
 */

const fs   = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const OUTPUT_FILE  = path.join(__dirname, '..', 'content', 'articles.json');

const { parseFrontMatter, SOURCES_RE } = require('./frontmatter.js');

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

// The article body ends with "---" and a "**Sources:** [label](url) · …" line (SOURCES_RE)
function withoutSources(md) {
  const m = (md || '').match(SOURCES_RE);
  return m ? md.slice(0, m.index) : (md || '');
}
function countSources(md) {
  const m = (md || '').match(SOURCES_RE);
  if (!m) return 0;
  return (m[2].match(/\]\(https?:\/\//g) || []).length;
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
    subtitle:    data.subtitle    || '',
    subtitle_de: data.subtitle_de || '',
    date:        data.date        || '',
    category:    (data.category   || '').toLowerCase(),
    cover_image: data.cover_image || '',
    excerpt:     data.excerpt     || (plain.slice(0, 200)   + (plain.length   > 200 ? '…' : '')),
    excerpt_de:  data.excerpt_de  || (plainDE.slice(0, 200) + (plainDE.length > 200 ? '…' : '')),
    // Reading time in minutes (≈200 words/min), from the article text without the source list
    read_time:    Math.max(1, Math.round(stripMarkdown(withoutSources(bodyText)).split(/\s+/).filter(Boolean).length / 200)),
    read_time_de: bodyTextDE ? Math.max(1, Math.round(stripMarkdown(withoutSources(bodyTextDE)).split(/\s+/).filter(Boolean).length / 200)) : 0,
    // Number of linked sources in the trailing "**Sources:**" block
    source_count: countSources(bodyText),
    checked:      data.checked     || '',
    updated:      data.updated     || '',
    cover_alt:    data.cover_alt    || '',
    cover_alt_de: data.cover_alt_de || '',
  };
});

// Newest first — handles both ISO and DD.MM.YYYY
articles.sort((a, b) => parseDate(b.date) - parseDate(a.date));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
console.log(`✓ Generated content/articles.json with ${articles.length} article${articles.length !== 1 ? 's' : ''}`);
