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
 * dist/climate.html at /climate and dist/de/index.html at /de/. The headline,
 * article text, sources and article lists are prerendered into the HTML
 * (scripts/prerender.js); the page scripts render the same markup again in the
 * browser. Each page also gets JSON-LD structured data, and the build prints
 * warnings for missing or badly sized search titles and descriptions
 * (scripts/seo.js).
 *
 * Also generates robots.txt, sitemap.xml (with language alternates) and the
 * RSS feeds (feed.xml in English, feed-de.xml in German).
 *
 * Run after scripts/build.js, which writes content/articles.json.
 */

const fs   = require('fs');
const path = require('path');
const R    = require('../js/routes.js');
const P    = require('./prerender.js');
const SEO  = require('./seo.js');
const { parseFrontMatter } = require('./frontmatter.js');

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
// Search titles (<title>) and meta descriptions per page and language.
// Rules (checked at build time, see scripts/seo.js): titles 30–60 characters and
// under ~580 px, main search term first; descriptions 120–155 characters, a
// concrete summary that only states what the page itself says.
// ogTitle is the shorter title for social cards (defaults to the title without
// the " | Ecodemia" suffix).
const PAGES = {
  home: {
    tpl: 'environmental_news_homepage/code.html',
    title: { en: 'Ecodemia: Climate, Energy and Nature News for Europe',
             de: 'Ecodemia: Nachrichten zu Klima, Energie und Umwelt' },
    desc: { en: 'Independent environmental news on climate, energy, wildlife and EU policy, focused on Germany, Austria and Switzerland. Every article lists its sources.',
            de: 'Unabhängige Umweltnachrichten zu Klima, Energiewende, Artenschutz und EU-Politik, mit Fokus auf Deutschland, Österreich und die Schweiz. Mit allen Quellen.' },
  },
  live: {
    tpl: 'live_updates/code.html',
    title: { en: 'Live Environmental News Headlines | Ecodemia', de: 'Umwelt-Nachrichten aktuell: Schlagzeilen | Ecodemia' },
    ogTitle: { en: 'Live environmental headlines', de: 'Aktuelle Umweltschlagzeilen' },
    desc: { en: 'Environmental headlines from the Guardian, BBC, Mongabay, Grist and CleanTechnica, refreshed throughout the day. Each links to the original publisher.',
            de: 'Umweltschlagzeilen von Guardian, BBC, Mongabay, Grist und CleanTechnica, mehrmals täglich aktualisiert, in der Originalsprache und mit Link zur Quelle.' },
  },
  about: {
    tpl: 'about_page/code.html',
    title: { en: 'About Ecodemia: Editorial Standards and Corrections', de: 'Über Ecodemia: Redaktionelle Standards und Korrekturen' },
    desc: { en: 'Ecodemia is an independent environmental news site in English and German. How we source every article, label forecasts, use AI tools and correct errors.',
            de: 'Ecodemia: unabhängige Umweltnachrichten auf Deutsch und Englisch. Wie wir jede Quelle belegen, Prognosen kennzeichnen, KI nutzen und Fehler korrigieren.' },
  },
  imprint: {
    tpl: 'imprint_page/code.html',
    title: { en: 'Imprint and Media Disclosure | Ecodemia', de: 'Impressum und Offenlegung | Ecodemia' },
    desc: { en: 'Imprint of Ecodemia: media owner, publisher and contact, with the disclosure under § 5 ECG and §§ 24 and 25 of the Austrian Media Act (MedienG).',
            de: 'Impressum von Ecodemia: Medieninhaber, Herausgeber und Kontakt sowie die Offenlegung gemäß § 5 ECG und §§ 24 und 25 Mediengesetz (Österreich).' },
  },
  privacy: {
    tpl: 'privacy_page/code.html',
    title: { en: 'Privacy Policy: How Ecodemia Handles Data', de: 'Datenschutzerklärung | Ecodemia' },
    desc: { en: 'Ecodemia privacy policy under the GDPR: no cookies for readers, no analytics or advertising, no forms. What our host processes and what rights you have.',
            de: 'Datenschutz bei Ecodemia nach DSGVO: keine Cookies für Lesende, keine Analyse- oder Werbedienste, keine Formulare. Was der Hoster verarbeitet, Ihre Rechte.' },
  },
  climate: {
    title: { en: 'Climate News and Science for Europe | Ecodemia', de: 'Klimawandel: Nachrichten und Analysen | Ecodemia' },
    desc: { en: 'Climate change news and analysis: climate science, extreme weather, El Niño, heat in cities and what a warming world means for Europe. With all sources.',
            de: 'Nachrichten zum Klimawandel: Klimaforschung, Extremwetter, El Niño, Hitze in Städten und was die Erderwärmung für Europa bedeutet. Mit allen Quellen.' },
  },
  wildlife: {
    title: { en: 'Wildlife and Biodiversity News | Ecodemia', de: 'Artenvielfalt und Naturschutz: Nachrichten | Ecodemia' },
    desc: { en: 'Biodiversity news: wolves in Germany, Romania’s old-growth forests, deep-sea mining and the laws that decide the future of species and habitats.',
            de: 'Nachrichten zu Artenvielfalt und Naturschutz: der Wolf in Deutschland, Rumäniens Ur- und Altwälder, Tiefseebergbau und die Gesetze für Arten und Habitate.' },
  },
  energy: {
    title: { en: 'Energy Transition News: Solar, Wind, Prices | Ecodemia', de: 'Energiewende: Solar, Windkraft und Strompreise | Ecodemia' },
    desc: { en: 'News on the energy transition: solar and offshore wind, grids, storage and electricity prices in Germany, Austria and Switzerland, with every source.',
            de: 'Nachrichten zur Energiewende: Photovoltaik, Offshore-Windkraft, Netze, Speicher und Strompreise in Deutschland, Österreich und der Schweiz. Mit Quellen.' },
  },
  living: {
    title: { en: 'Sustainable Living: Heating, Solar, Food | Ecodemia', de: 'Nachhaltig leben: Heizen, Solar, Ernährung | Ecodemia' },
    desc: { en: 'Climate questions at home: heat pump or gas boiler, balcony solar, the climate cost of meat, and the rules in Germany, Austria and Switzerland.',
            de: 'Klimafragen im Alltag: Wärmepumpe oder Gasheizung, Balkonkraftwerke, die Klimabilanz von Fleisch und die Regeln in Deutschland, Österreich und der Schweiz.' },
  },
  tech: {
    title: { en: 'Climate Tech News: Batteries, CO₂ Removal, AI | Ecodemia', de: 'Klimatechnologie: Akkus, CO₂-Entnahme, KI | Ecodemia' },
    desc: { en: 'Climate technology news: sodium-ion batteries, direct air capture of CO₂ and the electricity use of AI data centres, with the figures and their sources.',
            de: 'Nachrichten zu Klimatechnologie: Natrium-Ionen-Akkus, CO₂-Abscheidung aus der Luft und der Stromverbrauch von KI-Rechenzentren, mit Zahlen und Quellen.' },
  },
  policy: {
    title: { en: 'EU Climate Policy and Environmental Law | Ecodemia', de: 'Klimapolitik und Umweltrecht der EU | Ecodemia' },
    desc: { en: 'EU climate and environmental policy explained: CBAM, the deforestation law, nature restoration, the 2035 car rules and the UN climate talks at COP31.',
            de: 'EU-Klimapolitik und Umweltrecht erklärt: CO₂-Grenzausgleich CBAM, Entwaldungsverordnung, Renaturierungsgesetz, Verbrenner-Aus 2035 und die COP31.' },
  },
};
SECTIONS.forEach(s => Object.assign(PAGES[s], { tpl: 'category_page/code.html', section: s }));

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

// ---------------------------------------------------------------------------
// SEO checks: collected while building, printed at the end (they never fail the build)
const warnings = [];
function checkSeo(where, field, value, kind, fellBack) {
  if (fellBack) warnings.push(where + ': ' + field + ' missing, using ' + fellBack);
  const problems = SEO.check(kind, value).filter(p => p !== 'missing');
  if (problems.length) warnings.push(where + ': ' + (fellBack ? 'fallback for ' : '') + field + ' ' + problems.join('; '));
}

// Structured data (schema.org JSON-LD). The organisation and website nodes go
// on every page so that @id references resolve within the page.
const ORG_ID = SITE + '/#organization', WEBSITE_ID = SITE + '/#website';
const LOGO = '/assets/brand/mark/ecodemia-glyph-color-512.png';
function orgNodes() {
  return [
    {
      '@type': 'NewsMediaOrganization', '@id': ORG_ID, name: 'Ecodemia', url: SITE + '/',
      logo: { '@type': 'ImageObject', url: abs(LOGO), width: 512, height: 512 },
      email: 'info@ecodemia.org',
      address: { '@type': 'PostalAddress', addressLocality: 'Graz', addressCountry: 'AT' },
      publishingPrinciples: abs(R.url('about', 'en')) + '#standards',
      correctionsPolicy: abs(R.url('about', 'en')) + '#corrections',
    },
    { '@type': 'WebSite', '@id': WEBSITE_ID, url: SITE + '/', name: 'Ecodemia', inLanguage: ['en', 'de'], publisher: { '@id': ORG_ID } },
  ];
}
function breadcrumb(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) =>
    ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) })) };
}
function jsonLd(nodes) {
  // "<" is escaped so that no text inside can close the script element
  return '<script type="application/ld+json">' +
    JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c') + '</script>';
}

function headTags(o) {
  const u = o.urls;
  const img = abs(o.image || OG_FALLBACK);
  const size = o.image ? P.imageSize(o.image) : { w: 1200, h: 630 };
  const t = [
    '<meta name="description" content="' + attr(o.desc) + '">',
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
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
  if (size) t.push('<meta property="og:image:width" content="' + size.w + '">', '<meta property="og:image:height" content="' + size.h + '">');
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
  if (o.ld) t.push(jsonLd(typeof o.ld === 'function' ? o.ld() : o.ld));
  return t.join('\n');
}

function renderPage(o) {
  let html = localizeBody(tpl(o.tpl), o.lang);
  if (o.transform) html = o.transform(html);
  // Marker for js/ecodemia.js and the page scripts: language, page key or slug, section
  const marker = ' data-lang="' + o.lang + '"' +
    (o.slug ? ' data-slug="' + attr(o.slug) + '"' : ' data-page-key="' + o.key + '"') +
    (o.section ? ' data-section="' + o.section + '"' : '');
  html = html.replace(/<html lang="[^"]*">/, () => '<html lang="' + o.lang + '"' + marker + '>');
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => '<title>' + attr(o.title) + '</title>');
  html = html.replace(/\r?\n<meta name="description"[^>]*>/, '');
  html = html.replace(/<\/title>/, (m) => m + '\n' + headTags(o));
  const where = o.urls[o.lang];
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warnings.push(where + ': ' + h1 + ' <h1> elements');
  if (/<h1[^>]*>\s*(<i><\/i>)?\s*(<span[^>]*>)?\s*(&nbsp;)?\s*(<\/span>)?\s*<\/h1>/.test(html)) warnings.push(where + ': empty <h1> in the HTML');
  (html.match(/<img\b[^>]*>/g) || []).forEach(tag => { if (!/\salt="/.test(tag)) warnings.push(where + ': <img> without alt'); });
  const out = path.join(DIST, fileFor(where));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

const homeCrumb = lang => ({ name: lang === 'de' ? 'Startseite' : 'Home', url: R.url('home', lang) });
const brandless = s => s.replace(/\s*\|\s*Ecodemia$/, '');

let pageCount = 0;
for (const key of Object.keys(PAGES)) {
  const p = PAGES[key];
  const urls = { en: R.url(key, 'en'), de: R.url(key, 'de') };
  for (const lang of LANGS) {
    const where = urls[lang];
    checkSeo(where, 'title', p.title[lang], 'title');
    checkSeo(where, 'description', p.desc[lang], 'desc');
    const ld = orgNodes();
    if (p.section) {
      ld.push({ '@type': 'CollectionPage', '@id': abs(where) + '#page', url: abs(where), name: brandless(p.title[lang]),
        description: p.desc[lang], inLanguage: lang, isPartOf: { '@id': WEBSITE_ID } },
        breadcrumb([homeCrumb(lang), { name: SECTION_NAMES[key][lang], url: where }]));
    } else if (key !== 'home') {
      ld.push({ '@type': key === 'about' ? 'AboutPage' : 'WebPage', '@id': abs(where) + '#page', url: abs(where),
        name: brandless(p.title[lang]), description: p.desc[lang], inLanguage: lang, isPartOf: { '@id': WEBSITE_ID } });
    }
    renderPage({
      tpl: p.tpl, lang, key, section: p.section, urls,
      title: p.title[lang],
      ogTitle: (p.ogTitle && p.ogTitle[lang]) || brandless(p.title[lang]),
      desc: p.desc[lang], ld,
      transform: key === 'home' ? h => P.home(h, articles, lang)
        : p.section ? h => P.section(h, articles, lang, key) : null,
    });
    pageCount++;
  }
}

for (const a of articles) {
  const urls = { en: R.articleUrl(a.slug, 'en'), de: R.articleUrl(a.slug, 'de') };
  const fm = parseFrontMatter(fs.readFileSync(path.join(ROOT, 'content', 'articles', a.slug + '.md'), 'utf8'));
  for (const lang of LANGS) {
    const de = lang === 'de', sfx = de ? '_de' : '';
    const where = urls[lang];
    const headline = (de && a.title_de) || a.title;
    // Search title: seo_title(_de), else the headline (with the brand suffix if it still fits)
    // seo_* fields are read from the front matter; articles.json (loaded by browsers) leaves them out
    let title = fm.data['seo_title' + sfx], titleFb = '';
    if (!title) {
      title = SEO.len(headline + ' | Ecodemia') <= SEO.LIMITS.title.max ? headline + ' | Ecodemia' : headline;
      titleFb = 'the headline';
    }
    // Meta description: seo_description(_de), else the excerpt
    let desc = fm.data['seo_description' + sfx], descFb = '';
    if (!desc) {
      desc = (de && a.excerpt_de) || a.excerpt || (de && a.subtitle_de) || a.subtitle;
      descFb = 'the excerpt';
    }
    checkSeo(where, 'seo_title' + sfx, title, 'title', titleFb);
    checkSeo(where, 'seo_description' + sfx, desc, 'desc', descFb);
    const imageAlt = (de && a.cover_alt_de) || a.cover_alt;
    if (a.cover_image && !imageAlt) warnings.push(where + ': cover_alt' + sfx + ' missing');

    const section = SECTION_NAMES[a.category] ? SECTION_NAMES[a.category][lang] : '';
    const published = iso(a.date);
    let pre = null;
    renderPage({
      tpl: 'article_view/code.html', lang, slug: a.slug, urls,
      title, ogTitle: headline, desc,
      image: a.cover_image, imageAlt,
      article: { published, modified: iso(a.updated), section },
      transform: h => (pre = P.article(h, fm.data, fm.body, lang, a.slug, articles)).html,
      // Called from headTags, after the article has been prerendered
      ld: () => orgNodes().concat({
        '@type': 'NewsArticle', '@id': abs(where) + '#article',
        mainEntityOfPage: abs(where), url: abs(where),
        headline: SEO.len(headline) <= 110 ? headline : title,
        description: desc,
        image: [abs(a.cover_image || OG_FALLBACK)],
        datePublished: published, dateModified: iso(a.updated) || published,
        inLanguage: lang, articleSection: section, wordCount: pre.words,
        isAccessibleForFree: true,
        author: { '@type': 'Organization', '@id': ORG_ID, name: 'Ecodemia', url: abs(R.url('about', lang)) },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': WEBSITE_ID },
      }, breadcrumb([homeCrumb(lang), ...(section ? [{ name: section, url: R.url(a.category, lang) }] : []), { name: headline, url: where }])),
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
if (warnings.length) {
  console.warn('\n⚠ ' + warnings.length + ' SEO warning' + (warnings.length === 1 ? '' : 's') + ' (rules in scripts/seo.js):');
  warnings.forEach(w => console.warn('  - ' + w));
} else {
  console.log('✓ SEO check: every page has a title and description within the length limits');
}
