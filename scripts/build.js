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

// Minimal YAML front-matter parser (no external deps)
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  match[1].split(/\r?\n/).forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = val;
  });
  return { data, body: match[2] };
}

// Strip Markdown syntax to produce a plain-text excerpt
function stripMarkdown(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')   // images
    .replace(/\[[^\]]+\]\([^)]+\)/g, '$1')  // links → text
    .replace(/#{1,6}\s/g, '')               // headings
    .replace(/\*\*|__|\*|_|~~|`/g, '')      // emphasis / code
    .replace(/\n+/g, ' ')
    .trim();
}

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

if (!fs.existsSync(ARTICLES_DIR)) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
  console.log('No articles directory found — wrote empty articles.json');
  process.exit(0);
}

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

const articles = files.map(filename => {
  const raw            = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf8');
  const { data, body } = parseFrontMatter(raw);
  const slug           = filename.replace(/\.md$/, '');
  const plain          = stripMarkdown(body);
  return {
    slug,
    title:       data.title       || slug,
    date:        data.date        || '',
    category:    data.category    || '',
    cover_image: data.cover_image || '',
    excerpt:     data.excerpt     || (plain.slice(0, 200) + (plain.length > 200 ? '…' : '')),
  };
});

// Newest first
articles.sort((a, b) => (b.date > a.date ? 1 : -1));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2));
console.log(`✓ Generated content/articles.json with ${articles.length} article${articles.length !== 1 ? 's' : ''}`);
