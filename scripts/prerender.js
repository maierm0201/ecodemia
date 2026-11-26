// prerender.js — builds, at build time, the same markup that the page scripts
// render in the browser, so the raw HTML already contains the headline, the
// article text, the sources and the article lists. Crawlers that do not run
// JavaScript (news aggregators, social previews, some search engines) see the
// full page; in the browser the page scripts render the same markup again.
//
// Keep this in step with article_view/code.html, category_page/code.html,
// environmental_news_homepage/code.html and js/ecodemia.js.

'use strict';

const fs = require('fs');
const path = require('path');
const { marked } = require('../js/vendor/marked.min.js');
const R = require('../js/routes.js');
const { splitSources } = require('./frontmatter.js');

const ROOT = path.join(__dirname, '..');

const T = {
  en: { climate: 'Climate', wildlife: 'Wildlife', energy: 'Energy', living: 'Living', tech: 'Tech', policy: 'Policy',
        minRead: 'min read', sources: 'sources', source: 'source', checked: 'Checked', updated: 'Updated', published: 'Published' },
  de: { climate: 'Klima', wildlife: 'Tierwelt', energy: 'Energie', living: 'Leben', tech: 'Technologie', policy: 'Politik',
        minRead: 'Min. Lesezeit', sources: 'Quellen', source: 'Quelle', checked: 'Geprüft', updated: 'Aktualisiert', published: 'Veröffentlicht' },
};

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function parseDate(s) {
  if (!s) return null;
  const dm = String(s).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const d = dm ? new Date(Date.UTC(+dm[3], +dm[2] - 1, +dm[1])) : new Date(s);
  return isNaN(d) ? null : d;
}

// Language-bound helpers, mirroring window.Eco
function eco(lang) {
  const isDE = lang === 'de';
  const t = k => T[lang][k] || T.en[k] || k;
  const fmtDate = s => {
    const d = parseDate(s);
    return d ? d.toLocaleDateString(isDE ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : (s || '');
  };
  const loc = (a, f) => (isDE && a[f + '_de']) ? a[f + '_de'] : (a[f] || '');
  const readTime = a => ((isDE && a.read_time_de) ? a.read_time_de : a.read_time || 1) + ' ' + t('minRead');
  const sourceCount = n => n ? n + ' ' + (n === 1 ? t('source') : t('sources')) : '';
  const articleUrl = a => R.articleUrl(a.slug, lang);
  const metaHTML = (a, opts) => {
    opts = opts || {};
    const parts = [];
    if (a.updated) parts.push('<span>' + esc(t('updated')) + ' ' + esc(fmtDate(a.updated)) + '</span>');
    else parts.push('<span>' + esc(fmtDate(a.date)) + '</span>');
    if (opts.time !== false) parts.push('<span>' + esc(readTime(a)) + '</span>');
    if (a.source_count) parts.push('<span class="src">' + esc(sourceCount(a.source_count)) + '</span>');
    return '<div class="meta">' + parts.join('') + '</div>';
  };
  const kickerHTML = a => '<span class="kicker" data-cat="' + esc(a.category) + '">' + esc(t(a.category)) + '</span>';
  const sectionInfo = cat => { const s = R.SECTION_INFO[cat]; return s ? Object.assign({ url: s.url }, s[lang] || s.en) : null; };
  const figureHTML = (info, cat) => '<div class="fig"' + (cat ? ' data-cat="' + cat + '"' : '') + '>' +
    '<span class="fig-n">' + esc(info.n) + '</span>' +
    '<span class="fig-l">' + esc(info.l) + '</span>' +
    '<a class="fig-s" href="' + esc(info.url) + '" target="_blank" rel="noopener">' + esc(t('source')) + ': ' + esc(info.s) + ' ↗</a>' +
  '</div>';
  // Internal links in German pages point to their German counterparts
  const localizeLinks = html => isDE ? html.replace(/(<a\b[^>]*\shref=")(\/[^"]*)"/g, (m, a, h) => a + R.localize(h, 'de') + '"') : html;
  return { lang, isDE, t, fmtDate, loc, readTime, sourceCount, articleUrl, metaHTML, kickerHTML, sectionInfo, figureHTML, localizeLinks };
}

// ─── Image size (JPEG, PNG, WebP) without dependencies ──────────────────────
const sizeCache = {};
function imageSize(publicPath) {
  if (!publicPath || !publicPath.startsWith('/')) return null;
  if (publicPath in sizeCache) return sizeCache[publicPath];
  let out = null;
  try {
    const b = fs.readFileSync(path.join(ROOT, decodeURIComponent(publicPath)));
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          out = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    } else if (b.toString('ascii', 1, 4) === 'PNG') {
      out = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    } else if (b.toString('ascii', 8, 12) === 'WEBP' && b.toString('ascii', 12, 16) === 'VP8 ') {
      out = { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    }
  } catch (e) { out = null; }
  return (sizeCache[publicPath] = out);
}

// ─── Article page ────────────────────────────────────────────────────────────
function slugify(s) { return 'sec-' + s.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '').slice(0, 50); }
function encodeUrls(md) {
  return md.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (_, a, u, b) => a + u.trim().replace(/ /g, '%20') + b);
}
function domain(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// d: parsed front matter, body: English body after the front matter
function article(html, d, body, lang, slug, all) {
  const E = eco(lang), isDE = E.isDE;
  const cat = (d.category || '').toLowerCase();
  const title = (isDE && d.title_de) ? d.title_de : (d.title || slug);
  const stand = (isDE && d.subtitle_de) ? d.subtitle_de : (d.subtitle || '');
  const split = splitSources((isDE && d.body_de) ? d.body_de : (d.body || body));
  const sources = split.sources;
  const set = (re, fn) => { const before = html; html = html.replace(re, fn); if (html === before) throw new Error('prerender: no match for ' + re); };

  set(/<body data-page="article">/, () => '<body data-page="article" data-cat="' + esc(cat) + '">');
  set(/\s*<p id="art-status" class="status">[^<]*<\/p>/, () => '');
  set(/<article id="art" hidden>/, () => '<article id="art" data-cat="' + esc(cat) + '">');
  // Related: same section first, then newest others (as in the page script)
  const others = (all || []).filter(a => a.slug !== slug);
  const rel = others.filter(a => a.category === cat).concat(others.filter(a => a.category !== cat)).slice(0, 3);
  set(/<section id="related" class="related wrap" hidden><\/section>/, () => '<section id="related" class="related wrap" data-cat="' + esc(cat) + '"' +
    (rel.length ? '><h2>' + (isDE ? 'Weiterlesen' : 'Read next') + '</h2><div class="cards">' + rel.map(a =>
      '<a class="card" href="' + E.articleUrl(a) + '"><div class="photo">' + (a.cover_image ? '<img src="' + esc(a.cover_image) + '" alt="" loading="lazy">' : '') + '</div>' +
      E.kickerHTML(a) + '<h3 class="hl">' + esc(E.loc(a, 'title')) + '</h3>' + E.metaHTML(a) + '</a>').join('') + '</div></section>' : ' hidden></section>'));
  set(/<span id="art-kicker" class="kicker"><\/span>/, () => '<span id="art-kicker" class="kicker" data-cat="' + esc(cat) + '">' + esc(E.t(cat)) + '</span>');
  set(/<h1 id="art-title"><\/h1>/, () => '<h1 id="art-title">' + esc(title) + '</h1>');
  if (stand) set(/<p id="art-stand" class="stand" hidden><\/p>/, () => '<p id="art-stand" class="stand">' + esc(stand) + '</p>');

  const words = split.body.split(/\s+/).filter(Boolean).length;
  const meta = ['<span>' + esc(E.t('published')) + ' ' + esc(E.fmtDate(d.date)) + '</span>'];
  if (d.updated) meta.push('<span>' + esc(E.t('updated')) + ' ' + esc(E.fmtDate(d.updated)) + '</span>');
  if (d.checked) meta.push('<span>' + esc(E.t('checked')) + ' ' + esc(E.fmtDate(d.checked)) + '</span>');
  meta.push('<span>' + Math.max(1, Math.round(words / 200)) + ' ' + esc(E.t('minRead')) + '</span>');
  if (sources.length) meta.push('<a class="src" href="#sources">' + esc(E.sourceCount(sources.length)) + '</a>');
  meta.push('<span>Ecodemia</span>');
  set(/<div id="art-meta" class="meta"><\/div>/, () => '<div id="art-meta" class="meta">' + meta.join('') + '</div>');

  const note = (isDE && d.update_note_de) ? d.update_note_de : (d.update_note || '');
  if (note) set(/<div id="art-update" class="update-note" hidden><\/div>/, () => '<div id="art-update" class="update-note"><b>' +
    esc(E.t('updated')) + (d.updated ? ' ' + esc(E.fmtDate(d.updated)) : '') + '</b>' + esc(note) + '</div>');

  if (d.cover_image) {
    const alt = (isDE && d.cover_alt_de) ? d.cover_alt_de : (d.cover_alt || '');
    const credit = (isDE && d.cover_credit_de) ? d.cover_credit_de : (d.cover_credit || '');
    const sz = imageSize(d.cover_image);
    set(/<figure id="art-cover" class="art-cover" hidden>\s*<img id="art-img" alt="">\s*<figcaption id="art-credit"><\/figcaption>/, () =>
      '<figure id="art-cover" class="art-cover">\n        <img id="art-img" src="' + esc(d.cover_image) + '" alt="' + esc(alt) + '"' +
      (sz ? ' width="' + sz.w + '" height="' + sz.h + '"' : '') + ' fetchpriority="high">\n        <figcaption id="art-credit">' +
      (credit ? E.localizeLinks(marked.parseInline(credit)) : '') + '</figcaption>');
  }

  const facts = ((isDE && d.key_facts_de) ? d.key_facts_de : (d.key_facts || ''))
    .split('\n').map(l => l.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
  if (facts.length) set(/<aside id="art-facts" class="facts" hidden><\/aside>/, () => '<aside id="art-facts" class="facts" data-cat="' + esc(cat) + '">' +
    E.localizeLinks('<span class="kicker">' + (isDE ? 'Das Wichtigste' : 'Key facts') + '</span><ul>' +
      facts.map(f => '<li>' + marked.parseInline(f) + '</li>').join('') + '</ul>') + '</aside>');

  const md = encodeUrls(split.body).replace(/\[\^(\d+)\]/g, (_, n) => {
    const src = sources[+n - 1];
    return '<a class="cite" href="#src-' + n + '"' + (src ? ' title="' + esc(src.label) + '"' : '') + '>' + n + '</a>';
  });
  let bodyHTML = E.localizeLinks(marked.parse(md))
    .replace(/<a href="(https?:[^"]*)"/g, '<a href="$1" target="_blank" rel="noopener"');
  const heads = [];
  bodyHTML = bodyHTML.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    const id = slugify(stripTags(inner));
    heads.push({ id, text: stripTags(inner) });
    return '<h2 id="' + id + '">' + inner + '</h2>';
  });
  set(/<div id="art-body" class="prose"><\/div>/, () => '<div id="art-body" class="prose">\n' + bodyHTML + '</div>');

  if (heads.length >= 3) {
    const links = heads.map(h => '<a href="#' + h.id + '">' + esc(h.text) + '</a>');
    if (sources.length) links.push('<a href="#sources">' + (isDE ? 'Quellen' : 'Sources') + ' (' + sources.length + ')</a>');
    set(/<nav id="art-toc" class="toc" aria-label="Contents" hidden><\/nav>/, () => '<nav id="art-toc" class="toc" aria-label="' +
      (isDE ? 'Inhalt' : 'Contents') + '"><span class="label">' + (isDE ? 'Inhalt' : 'Contents') + '</span>' + links.join('') + '</nav>');
  } else {
    set(/<div id="art-grid" class="art-grid">/, () => '<div id="art-grid" class="art-grid no-toc">');
  }

  if (sources.length) {
    const about = R.url('about', lang);
    set(/<section id="sources" class="sources" hidden><\/section>/, () => '<section id="sources" class="sources"><h2>' + (isDE ? 'Quellen' : 'Sources') + '</h2><ol>' +
      sources.map((s, i) => '<li id="src-' + (i + 1) + '"><span><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>' +
        '<span class="dom">' + esc(domain(s.url)) + '</span></span></li>').join('') + '</ol>' +
      '<p class="sources-note">' + (isDE
        ? 'Fehler gefunden? Wir korrigieren ihn und vermerken die Änderung. <a href="' + about + '#corrections">Korrekturrichtlinie</a>'
        : 'Found an error? We correct it and note the change. <a href="' + about + '#corrections">Corrections policy</a>') + '</p></section>');
  }
  return { html, headline: title, sources, words };
}

// ─── Section page ────────────────────────────────────────────────────────────
function photo(E, a, eager, withAlt) {
  return '<div class="photo">' + (a.cover_image ? '<img src="' + esc(a.cover_image) + '" alt="' + (withAlt ? esc(E.loc(a, 'cover_alt')) : '') + '"' +
    (eager ? '' : ' loading="lazy"') + '>' : '') + '</div>';
}

function section(html, all, lang, cat) {
  const E = eco(lang), isDE = E.isDE, info = E.sectionInfo(cat);
  const list = all.filter(a => a.category === cat);
  const n = list.length;
  html = html.replace('<body data-page="section">', '<body data-page="section" data-cat="' + cat + '">')
    .replace('<main class="wrap" id="sec-main">', '<main class="wrap" id="sec-main" data-cat="' + cat + '">')
    .replace('<span id="sec-title">&nbsp;</span>', '<span id="sec-title">' + esc(E.t(cat)) + '</span>')
    .replace('<p id="sec-desc" class="stand"></p>', '<p id="sec-desc" class="stand">' + esc(info.desc) + '</p>')
    .replace('<p id="sec-count" class="meta count"></p>', '<p id="sec-count" class="meta count">' +
      (isDE ? (n === 1 ? '1 Artikel' : n + ' Artikel') : (n === 1 ? '1 article' : n + ' articles')) + '</p>')
    .replace('<div id="sec-fig"></div>', '<div id="sec-fig">' + E.figureHTML(info, cat) + '</div>');
  if (n) {
    const a = list[0];
    html = html.replace('<div id="sec-lead"></div>', '<div id="sec-lead"><a class="sec-lead" href="' + E.articleUrl(a) + '">' + photo(E, a, true) +
      '<div class="txt"><h2 class="hl">' + esc(E.loc(a, 'title')) + '</h2><p class="stand">' + esc(E.loc(a, 'excerpt')) + '</p>' + E.metaHTML(a) + '</div></a></div>')
      .replace('<div id="sec-list"></div>', '<div id="sec-list">' + list.slice(1).map(x =>
        '<a class="list-item" href="' + E.articleUrl(x) + '"><div class="txt"><h2 class="hl">' + esc(E.loc(x, 'title')) + '</h2>' +
        '<p class="stand">' + esc(E.loc(x, 'excerpt')) + '</p>' + E.metaHTML(x) + '</div>' + photo(E, x) + '</a>').join('') + '</div>');
  }
  const others = all.filter(a => a.category !== cat).slice(0, 5);
  if (others.length) {
    html = html.replace('<div id="side-list"></div>', '<div id="side-list">' + others.map(x =>
      '<a class="side-item" href="' + E.articleUrl(x) + '">' + E.kickerHTML(x) + '<h3 class="hl">' + esc(E.loc(x, 'title')) + '</h3></a>').join('') + '</div>')
      .replace('<aside class="side-box" id="side" hidden>', '<aside class="side-box" id="side">');
  }
  return html;
}

// ─── Homepage ────────────────────────────────────────────────────────────────
function home(html, all, lang) {
  const E = eco(lang), isDE = E.isDE;
  html = html.replace('<section id="figures" class="figures" aria-label="By the numbers"></section>',
    () => '<section id="figures" class="figures" aria-label="By the numbers">' +
      ['climate', 'wildlife', 'energy'].map(c => E.figureHTML(E.sectionInfo(c), c)).join('') + '</section>');
  if (!all.length) return html;
  const a = all[0];
  html = html.replace('<div id="lead" class="lead"><p class="status">Loading…</p></div>', () =>
    '<div id="lead" class="lead"><a href="' + E.articleUrl(a) + '" style="display:grid;gap:14px">' + photo(E, a, true, true) +
      E.kickerHTML(a) + '<h2 class="hl">' + esc(E.loc(a, 'title')) + '</h2>' +
      '<p class="stand">' + esc(E.loc(a, 'subtitle') || E.loc(a, 'excerpt')) + '</p></a>' + E.metaHTML(a) + '</div>')
    .replace('<div id="latest-list"></div>', () => '<div id="latest-list">' + all.slice(1, 6).map(x =>
      '<a class="latest-item" href="' + E.articleUrl(x) + '">' + E.kickerHTML(x) +
      '<h3 class="hl">' + esc(E.loc(x, 'title')) + '</h3>' + E.metaHTML(x, { time: false }) + '</a>').join('') + '</div>');
  const shown = { [a.slug]: true }, order = [];
  all.forEach(x => { if (order.indexOf(x.category) === -1 && R.SECTIONS.indexOf(x.category) !== -1) order.push(x.category); });
  html = html.replace('<div id="sections"></div>', () => '<div id="sections">' + order.map(cat => {
    const items = all.filter(x => x.category === cat && !shown[x.slug]).slice(0, 3);
    if (!items.length) return '';
    return '<section class="sec-row" data-cat="' + cat + '">' +
      '<div class="sec-row-head"><h2><i></i>' + esc(E.t(cat)) + '</h2><a href="' + R.url(cat, lang) + '">' + (isDE ? 'Alle Artikel' : 'All articles') + ' →</a></div>' +
      '<div class="cards">' + items.map(x => '<a class="card" href="' + E.articleUrl(x) + '">' + photo(E, x, false, true) +
        '<h3 class="hl">' + esc(E.loc(x, 'title')) + '</h3>' +
        '<p class="stand">' + esc(E.loc(x, 'excerpt')) + '</p>' + E.metaHTML(x) + '</a>').join('') + '</div></section>';
  }).join('') + '</div>');
  return html;
}

module.exports = { article, section, home, imageSize, esc };
