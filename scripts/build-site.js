#!/usr/bin/env node
/**
 * Assembles the public website in dist/.
 *
 * Only the files listed in PUBLIC are copied, so repository files such as
 * build scripts, design notes, old Netlify/Stackbit config and the editorial
 * folder are never served.
 *
 * Every page exists once per language as a real HTML file at its clean URL
 * (English at the root, German under /de/, see js/routes.js), built from the
 * page templates (*\/code.html) with its own <html lang>, title, description,
 * canonical, hreflang and Open Graph/Twitter tags. Vercel's cleanUrls serves
 * dist/climate.html at /climate and dist/de/index.html at /de/. Article bodies
 * are still rendered in the browser from content/articles/<slug>.md.
 *
 * Also generates robots.txt, sitemap.xml (with language alternates) and the
 * RSS feeds (feed.xml in English, feed-de.xml in German).
 *
 * Run after scripts/build.js, which writes content/articles.json.
 */

const fs   = require('fs');
const path = require('path');
const R    = require('../js/routes.js');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://www.ecodemia.org';
const OG_FALLBACK = '/assets/brand/social/og-image-light-1200x630.png';

// Everything the website needs, relative to the repository root.
// The page templates (*/code.html) are build input only and are not copied.
const PUBLIC = [
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

const SECTIONS = R.SECTIONS;
const LANGS = ['en', 'de'];

// Page types: template, title and description per language
const SECTION_NAMES = {
  climate: { en: 'Climate', de: 'Klima' }, wildlife: { en: 'Wildlife', de: 'Tierwelt' },
  energy: { en: 'Energy', de: 'Energie' }, living: { en: 'Living', de: 'Leben' },
  tech: { en: 'Tech', de: 'Technologie' }, policy: { en: 'Policy', de: 'Politik' },
};
const PAGES = {
  home: {
    tpl: 'environmental_news_homepage/code.html',
    title: { en: 'Ecodemia | Climate, nature and energy news in English and German',
             de: 'Ecodemia | Nachrichten zu Klima, Natur und Energie auf Deutsch und Englisch' },
    fullTitle: true,
    desc: { en: 'Ecodemia: independent, bilingual reporting on climate, wildlife, energy and environmental policy. Every article lists its sources.',
            de: 'Ecodemia: unabhängige, zweisprachige Berichterstattung über Klima, Tierwelt, Energie und Umweltpolitik. Jeder Artikel nennt seine Quellen.' },
  },
  live: {
    tpl: 'live_updates/code.html',
    title: { en: 'Live Updates', de: 'Aktuell' },
    desc: { en: 'Environmental headlines from the Guardian, BBC, Mongabay, Grist and CleanTechnica, refreshed throughout the day.',
            de: 'Umweltschlagzeilen von Guardian, BBC, Mongabay, Grist und CleanTechnica, mehrmals täglich aktualisiert.' },
  },
  about: {
    tpl: 'about_page/code.html',
    title: { en: 'About Ecodemia', de: 'Über Ecodemia' },
    desc: { en: 'What Ecodemia is, our editorial standards and our corrections policy.',
            de: 'Was Ecodemia ist, unsere redaktionellen Standards und wie wir Fehler korrigieren.' },
  },
  imprint: {
    tpl: 'imprint_page/code.html',
    title: { en: 'Imprint', de: 'Impressum' },
    desc: { en: 'Imprint and disclosure for Ecodemia under § 5 ECG and §§ 24, 25 of the Austrian Media Act.',
            de: 'Impressum und Offenlegung von Ecodemia gemäß § 5 ECG und §§ 24, 25 Mediengesetz.' },
  },
  privacy: {
    tpl: 'privacy_page/code.html',
    title: { en: 'Privacy policy', de: 'Datenschutzerklärung' },
    desc: { en: 'Ecodemia privacy policy under the GDPR: no cookies, no analytics, no advertising.',
            de: 'Datenschutzerklärung von Ecodemia gemäß DSGVO: keine Cookies, keine Analyse, keine Werbung.' },
  },
};
SECTIONS.forEach(s => {
  PAGES[s] = {
    tpl: 'category_page/code.html', section: s,
    title: SECTION_NAMES[s],
    desc: { en: R.SECTION_INFO[s].en.desc, de: R.SECTION_INFO[s].de.desc },
  };
});

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
const iso = s => { const d = parseDate(s); return d ? isoDay(d) : ''; };

function xml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
const attr = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Absolute URL on the site (paths in the route table are already URL-encoded)
const abs = p => /^https?:\/\//.test(p) ? p : SITE + encodeURI(decodeURI(p));
// Output file for a clean URL: / → index.html, /de/ → de/index.html, /climate → climate.html
const fileFor = url => url.endsWith('/') ? url.slice(1) + 'index.html' : decodeURIComponent(url.slice(1)) + '.html';

// ---------------------------------------------------------------------------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
PUBLIC.forEach(copy);

const articles = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'articles.json'), 'utf8'));
const newest = articles.map(a => parseDate(a.updated) || parseDate(a.date)).filter(Boolean)
  .sort((a, b) => b - a)[0] || new Date();

// ---------------------------------------------------------------------------
// Static pages per language
const tplCache = {};
const tpl = rel => tplCache[rel] || (tplCache[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8'));

// Keep only this language's text: drop the other data-lang-block, fill data-en/data-de
// elements, and on German pages point internal links to their German counterparts.
function localizeBody(html, lang) {
  const other = lang === 'de' ? 'en' : 'de';
  html = html.replace(new RegExp('\\n?[ \\t]*<!-- [^\\n]*-->\\n(?=[ \\t]*<div data-lang-block="' + other + '")', 'g'), '\n');
  html = html.replace(new RegExp('\\n?[ \\t]*<div data-lang-block="' + other + '"[^>]*>[\\s\\S]*?</div>', 'g'), '');
  html = html.replace(new RegExp('(<div data-lang-block="' + lang + '")\\s+hidden'), '$1');
  html = html.replace(/(<(\w+)\b[^>]*?\sdata-en="([^"]*)"[^>]*?\sdata-de="([^"]*)"[^>]*>)[^<]*(<\/\2>)/g,
    (m, open, tag, en, de, close) => open + (lang === 'de' ? de : en) + close);
  if (lang === 'de') html = html.replace(/(<a\b[^>]*\shref=")(\/[^"]*)"/g, (m, a, h) => a + R.localize(h, 'de') + '"');
  return html;
}

function headTags(o) {
  const u = o.urls;
  const img = abs(o.image || OG_FALLBACK);
  const t = [
    '<meta name="description" content="' + attr(o.desc) + '">',
    '<link rel="canonical" href="' + attr(abs(u[o.lang])) + '">',
    '<link rel="alternate" hreflang="en" href="' + attr(abs(u.en)) + '">',
    '<link rel="alternate" hreflang="de" href="' + attr(abs(u.de)) + '">',
    '<link rel="alternate" hreflang="x-default" href="' + attr(abs(u.en)) + '">',
    '<meta property="og:site_name" content="Ecodemia">',
    '<meta property="og:type" content="' + (o.article ? 'article' : 'website') + '">',
    '<meta property="og:title" content="' + attr(o.ogTitle) + '">',
    '<meta property="og:description" content="' + attr(o.desc) + '">',
    '<meta property="og:url" content="' + attr(abs(u[o.lang])) + '">',
    '<meta property="og:locale" content="' + (o.lang === 'de' ? 'de_AT' : 'en_GB') + '">',
    '<meta property="og:locale:alternate" content="' + (o.lang === 'de' ? 'en_GB' : 'de_AT') + '">',
    '<meta property="og:image" content="' + attr(img) + '">',
  ];
  if (!o.image) t.push('<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">');
  if (o.imageAlt) t.push('<meta property="og:image:alt" content="' + attr(o.imageAlt) + '">');
  if (o.article) {
    if (o.article.published) t.push('<meta property="article:published_time" content="' + o.article.published + '">');
    if (o.article.modified) t.push('<meta property="article:modified_time" content="' + o.article.modified + '">');
    if (o.article.section) t.push('<meta property="article:section" content="' + attr(o.article.section) + '">');
  }
  t.push(
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + attr(o.ogTitle) + '">',
    '<meta name="twitter:description" content="' + attr(o.desc) + '">',
    '<meta name="twitter:image" content="' + attr(img) + '">');
  if (o.imageAlt) t.push('<meta name="twitter:image:alt" content="' + attr(o.imageAlt) + '">');
  return t.join('\n');
}

function renderPage(o) {
  let html = localizeBody(tpl(o.tpl), o.lang);
  // Marker for js/ecodemia.js and the page scripts: language, page key or slug, section
  const marker = ' data-lang="' + o.lang + '"' +
    (o.slug ? ' data-slug="' + attr(o.slug) + '"' : ' data-page-key="' + o.key + '"') +
    (o.section ? ' data-section="' + o.section + '"' : '');
  html = html.replace(/<html lang="[^"]*">/, () => '<html lang="' + o.lang + '"' + marker + '>');
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + attr(o.title) + '</title>');
  html = html.replace(/\r?\n<meta name="description"[^>]*>/, '');
  html = html.replace(/(<meta name="viewport"[^>]*>)/, (m) => m + '\n' + headTags(o));
  const out = path.join(DIST, fileFor(o.urls[o.lang]));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

let pageCount = 0;
for (const key of Object.keys(PAGES)) {
  const p = PAGES[key];
  const urls = { en: R.url(key, 'en'), de: R.url(key, 'de') };
  for (const lang of LANGS) {
    renderPage({
      tpl: p.tpl, lang, key, section: p.section, urls,
      title: p.fullTitle ? p.title[lang] : p.title[lang] + ' | Ecodemia',
      ogTitle: p.fullTitle ? 'Ecodemia' : p.title[lang],
      desc: p.desc[lang],
    });
    pageCount++;
  }
}
for (const a of articles) {
  const urls = { en: R.articleUrl(a.slug, 'en'), de: R.articleUrl(a.slug, 'de') };
  for (const lang of LANGS) {
    const de = lang === 'de';
    const title = (de && a.title_de) || a.title;
    renderPage({
      tpl: 'article_view/code.html', lang, slug: a.slug, urls,
      title: title + ' | Ecodemia', ogTitle: title,
      desc: (de && a.excerpt_de) || a.excerpt || (de && a.subtitle_de) || a.subtitle,
      image: a.cover_image, imageAlt: (de && a.cover_alt_de) || a.cover_alt,
      article: {
        published: iso(a.date), modified: iso(a.updated),
        section: SECTION_NAMES[a.category] ? SECTION_NAMES[a.category][lang] : '',
      },
    });
    pageCount++;
  }
}

// robots.txt
fs.writeFileSync(path.join(DIST, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ' + SITE + '/sitemap.xml\n');

// sitemap.xml — every page in both languages, each listing its alternates
const pairs = [
  ...Object.keys(PAGES).map(k => ({ en: R.url(k, 'en'), de: R.url(k, 'de'),
    lastmod: (k === 'home' || PAGES[k].section) ? newest : null })),
  ...articles.map(a => ({ en: R.articleUrl(a.slug, 'en'), de: R.articleUrl(a.slug, 'de'),
    lastmod: parseDate(a.updated) || parseDate(a.date) })),
];
const urls = [];
pairs.forEach(p => LANGS.forEach(l => urls.push(Object.assign({ loc: p[l] }, p))));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.map(u => '  <url><loc>' + xml(abs(u.loc)) + '</loc>' +
    (u.lastmod ? '<lastmod>' + isoDay(u.lastmod) + '</lastmod>' : '') +
    '<xhtml:link rel="alternate" hreflang="en" href="' + xml(abs(u.en)) + '"/>' +
    '<xhtml:link rel="alternate" hreflang="de" href="' + xml(abs(u.de)) + '"/>' +
    '<xhtml:link rel="alternate" hreflang="x-default" href="' + xml(abs(u.en)) + '"/>' +
    '</url>').join('\n') +
  '\n</urlset>\n');

// RSS feeds
function feed(de) {
  const file = de ? 'feed-de.xml' : 'feed.xml';
  const lang = de ? 'de' : 'en';
  const items = articles.slice(0, 30).map(a => {
    const link = abs(R.articleUrl(a.slug, lang));
    const date = parseDate(a.date);
    return '    <item>\n' +
      '      <title>' + xml((de && a.title_de) || a.title) + '</title>\n' +
      '      <link>' + xml(link) + '</link>\n' +
      '      <guid isPermaLink="true">' + xml(link) + '</guid>\n' +
      (date ? '      <pubDate>' + date.toUTCString() + '</pubDate>\n' : '') +
      (a.category ? '      <category>' + xml(de && SECTION_NAMES[a.category] ? SECTION_NAMES[a.category].de : a.category) + '</category>\n' : '') +
      '      <description>' + xml((de && a.excerpt_de) || a.excerpt) + '</description>\n' +
      '    </item>';
  }).join('\n');
  fs.writeFileSync(path.join(DIST, file),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n' +
    '    <title>Ecodemia</title>\n' +
    '    <link>' + xml(abs(R.url('home', lang))) + '</link>\n' +
    '    <atom:link href="' + SITE + '/' + file + '" rel="self" type="application/rss+xml"/>\n' +
    '    <description>' + xml(de
      ? 'Unabhängige, zweisprachige Berichterstattung über Klima, Natur und Energiewende. Jeder Artikel nennt seine Quellen.'
      : 'Independent, bilingual reporting on climate, nature and the energy transition. Every article lists its sources.') + '</description>\n' +
    '    <language>' + lang + '</language>\n' +
    '    <lastBuildDate>' + newest.toUTCString() + '</lastBuildDate>\n' +
    items + '\n  </channel>\n</rss>\n');
}
feed(false);
feed(true);

console.log('✓ Built dist/ with ' + pageCount + ' pages (' + articles.length + ' articles in 2 languages), sitemap (' +
  urls.length + ' URLs), robots.txt and two RSS feeds');
