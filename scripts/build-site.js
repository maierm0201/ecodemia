#!/usr/bin/env node
/**
 * Assembles the public website in dist/.
 *
 * Only the files listed in PUBLIC are copied, so repository files such as
 * build scripts, design notes, old Netlify/Stackbit config and the editorial
 * folder are never served. Also generates robots.txt, sitemap.xml and the
 * RSS feeds (feed.xml in English, feed-de.xml in German).
 *
 * Run after scripts/build.js, which writes content/articles.json.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://www.ecodemia.org';

// Everything the website needs, relative to the repository root.
const PUBLIC = [
  'environmental_news_homepage/code.html',
  'category_page/code.html',
  'article_view/code.html',
  'live_updates/code.html',
  'about_page/code.html',
  'imprint_page/code.html',
  'privacy_page/code.html',
  'admin/index.html',
  'admin/config.yml',
  'css',
  'js',
  'assets/brand',
  'assets/fonts',
  'assets/images',
  'content/articles',
  'content/articles.json',
  '404.html',
  'favicon.ico',
  'site.webmanifest',
];

const SECTIONS = ['climate', 'wildlife', 'energy', 'living', 'tech', 'policy'];

// ---------------------------------------------------------------------------
function copy(rel) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) throw new Error('Missing public file: ' + rel);
  fs.cpSync(src, path.join(DIST, rel), { recursive: true });
}

function parseDate(s) {
  if (!s) return null;
  const dm = String(s).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const d = dm ? new Date(Date.UTC(+dm[3], +dm[2] - 1, +dm[1])) : new Date(s);
  return isNaN(d) ? null : d;
}
const isoDay = d => d.toISOString().slice(0, 10);

function xml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
PUBLIC.forEach(copy);

const articles = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'articles.json'), 'utf8'));
const newest = articles.map(a => parseDate(a.updated) || parseDate(a.date)).filter(Boolean)
  .sort((a, b) => b - a)[0] || new Date();

// robots.txt
fs.writeFileSync(path.join(DIST, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ' + SITE + '/sitemap.xml\n');

// sitemap.xml
const urls = [
  { loc: SITE + '/', lastmod: newest },
  ...SECTIONS.map(s => ({ loc: SITE + '/' + s, lastmod: newest })),
  { loc: SITE + '/live' },
  { loc: SITE + '/about' },
  { loc: SITE + '/impressum' },
  { loc: SITE + '/datenschutz' },
  ...articles.map(a => ({
    loc: SITE + '/article/' + encodeURIComponent(a.slug),
    lastmod: parseDate(a.updated) || parseDate(a.date),
  })),
];
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + xml(u.loc) + '</loc>' +
    (u.lastmod ? '<lastmod>' + isoDay(u.lastmod) + '</lastmod>' : '') + '</url>').join('\n') +
  '\n</urlset>\n');

// RSS feeds
function feed(de) {
  const file = de ? 'feed-de.xml' : 'feed.xml';
  const items = articles.slice(0, 30).map(a => {
    const link = SITE + '/article/' + encodeURIComponent(a.slug);
    const date = parseDate(a.date);
    return '    <item>\n' +
      '      <title>' + xml((de && a.title_de) || a.title) + '</title>\n' +
      '      <link>' + xml(link) + '</link>\n' +
      '      <guid isPermaLink="true">' + xml(link) + '</guid>\n' +
      (date ? '      <pubDate>' + date.toUTCString() + '</pubDate>\n' : '') +
      (a.category ? '      <category>' + xml(a.category) + '</category>\n' : '') +
      '      <description>' + xml((de && a.excerpt_de) || a.excerpt) + '</description>\n' +
      '    </item>';
  }).join('\n');
  fs.writeFileSync(path.join(DIST, file),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n' +
    '    <title>Ecodemia</title>\n' +
    '    <link>' + SITE + '/</link>\n' +
    '    <atom:link href="' + SITE + '/' + file + '" rel="self" type="application/rss+xml"/>\n' +
    '    <description>' + xml(de
      ? 'Unabhängige, zweisprachige Berichterstattung über Klima, Natur und Energiewende. Jeder Artikel nennt seine Quellen.'
      : 'Independent, bilingual reporting on climate, nature and the energy transition. Every article lists its sources.') + '</description>\n' +
    '    <language>' + (de ? 'de' : 'en') + '</language>\n' +
    '    <lastBuildDate>' + newest.toUTCString() + '</lastBuildDate>\n' +
    items + '\n  </channel>\n</rss>\n');
}
feed(false);
feed(true);

console.log('✓ Built dist/ with ' + articles.length + ' articles, sitemap (' + urls.length + ' URLs), robots.txt and two RSS feeds');
