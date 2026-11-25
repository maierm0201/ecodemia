// ecodemia.js — shared site code: header, footer, mobile menu, language, helpers.
// Every page sets <body data-page="…" data-cat="…"> and has <div id="site-header"></div>
// and <div id="site-footer"></div>. Page scripts use window.Eco.

(function () {
  'use strict';

  // ─── Language ──────────────────────────────────────────────────────────────
  // The language comes only from the URL: German pages live under /de/.
  // Built pages also carry it on <html data-lang>, plus data-page / data-slug.
  const R = window.EcoRoutes;
  const html = document.documentElement;
  const lang = (html.dataset.lang === 'de' || html.dataset.lang === 'en') ? html.dataset.lang : R.langOfPath(location.pathname);
  const isDE = lang === 'de';
  html.lang = lang;
  // The language used to be kept in localStorage; clear that old entry once.
  try { if (localStorage.getItem('ecodemia_lang') !== null) localStorage.removeItem('ecodemia_lang'); } catch (e) {}

  const SECTIONS = R.SECTIONS;

  // The current page in route-table terms: { key } or { article: slug }, null on 404
  const is404 = document.body && document.body.dataset.page === '404';
  const here = is404 ? null : html.dataset.slug ? { article: html.dataset.slug }
    : (html.dataset.pageKey ? { key: html.dataset.pageKey } : R.match(location.pathname));
  function hereUrl(l) { return here ? (here.article ? R.articleUrl(here.article, l) : R.url(here.key, l)) : R.url('home', l); }
  function href(key) { return R.url(key, lang); }
  // Point internal links (/article/…, /climate, /about#…) inside an element to this language
  function localizeLinks(el) {
    if (!isDE || !el) return;
    el.querySelectorAll('a[href^="/"]').forEach(a => a.setAttribute('href', R.localize(a.getAttribute('href'), lang)));
  }

  const T = {
    en: {
      climate: 'Climate', wildlife: 'Wildlife', energy: 'Energy', living: 'Living', tech: 'Tech', policy: 'Policy',
      live: 'Live', about: 'About', home: 'Home', menu: 'Menu', close: 'Close',
      tagline: 'Independent, bilingual reporting on climate, nature and the energy transition. Every article lists its sources.',
      sections: 'Sections', aboutHead: 'About', aboutUs: 'About Ecodemia', standards: 'Editorial standards',
      corrections: 'Corrections', privacy: 'Privacy', terms: 'Terms of use', imprint: 'Imprint',
      minRead: 'min read', sources: 'sources', source: 'source', checked: 'Checked', updated: 'Updated', published: 'Published',
      termsTitle: 'Terms of use',
      termsBody: 'Ecodemia articles may be read and shared via link. Texts are © the media owner named in the imprint. Photos remain the property of their creators and are used under the licences named below each image. Links to external sources lead to third-party websites for whose content Ecodemia is not responsible.',
    },
    de: {
      climate: 'Klima', wildlife: 'Tierwelt', energy: 'Energie', living: 'Leben', tech: 'Technologie', policy: 'Politik',
      live: 'Aktuell', about: 'Über uns', home: 'Startseite', menu: 'Menü', close: 'Schließen',
      tagline: 'Unabhängige, zweisprachige Berichterstattung über Klima, Natur und Energiewende. Jeder Artikel nennt seine Quellen.',
      sections: 'Rubriken', aboutHead: 'Über uns', aboutUs: 'Über Ecodemia', standards: 'Redaktionelle Standards',
      corrections: 'Korrekturen', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', imprint: 'Impressum',
      minRead: 'Min. Lesezeit', sources: 'Quellen', source: 'Quelle', checked: 'Geprüft', updated: 'Aktualisiert', published: 'Veröffentlicht',
      termsTitle: 'Nutzungsbedingungen',
      termsBody: 'Ecodemia-Artikel dürfen gelesen und per Link geteilt werden. Texte © des im Impressum genannten Medieninhabers. Fotos bleiben Eigentum ihrer Urheber und werden unter den jeweils unter dem Bild genannten Lizenzen verwendet. Links zu externen Quellen führen zu Websites Dritter, für deren Inhalte Ecodemia nicht verantwortlich ist.',
    },
  };
  function t(key) { return (T[lang] && T[lang][key]) || T.en[key] || key; }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function parseDate(s) {
    if (!s) return null;
    if (s instanceof Date) return s;
    const dm = String(s).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    const d = dm ? new Date(+dm[3], +dm[2] - 1, +dm[1]) : new Date(s);
    return isNaN(d) ? null : d;
  }
  function fmtDate(s, opts) {
    const d = parseDate(s);
    if (!d) return s || '';
    return d.toLocaleDateString(isDE ? 'de-DE' : 'en-GB', opts || { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function loc(a, field) {
    const de = a[field + '_de'];
    return (isDE && de) ? de : (a[field] || '');
  }
  function readTime(a) {
    const n = (isDE && a.read_time_de) ? a.read_time_de : a.read_time;
    return (n || 1) + ' ' + t('minRead');
  }
  function sourceCount(n) { return n ? n + ' ' + (n === 1 ? t('source') : t('sources')) : ''; }
  function articleUrl(a) { return R.articleUrl(a.slug, lang); }

  // Meta line used on cards, lists and the article page
  function metaHTML(a, opts) {
    opts = opts || {};
    const parts = [];
    if (opts.kicker !== false) {} // kicker rendered separately
    if (a.updated) parts.push('<span>' + esc(t('updated')) + ' ' + esc(fmtDate(a.updated)) + '</span>');
    else parts.push('<span>' + esc(fmtDate(a.date)) + '</span>');
    if (opts.time !== false) parts.push('<span>' + esc(readTime(a)) + '</span>');
    if (a.source_count) parts.push('<span class="src">' + esc(sourceCount(a.source_count)) + '</span>');
    return '<div class="meta">' + parts.join('') + '</div>';
  }
  function kickerHTML(a, extra) {
    return '<span class="kicker" data-cat="' + esc(a.category) + '">' + esc(t(a.category)) + (extra ? ' · ' + esc(extra) : '') + '</span>';
  }

  let articlesPromise = null;
  function articles() {
    if (!articlesPromise) {
      articlesPromise = fetch('/content/articles.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error('articles.json ' + r.status); return r.json(); });
    }
    return articlesPromise;
  }

  // Section descriptions and sourced figures live in routes.js (shared with the build)
  const SECTION_INFO = R.SECTION_INFO;
  function sectionInfo(cat) {
    const s = SECTION_INFO[cat]; if (!s) return null;
    return Object.assign({ url: s.url }, s[lang] || s.en);
  }
  function figureHTML(info, cat) {
    return '<div class="fig"' + (cat ? ' data-cat="' + cat + '"' : '') + '>' +
      '<span class="fig-n">' + esc(info.n) + '</span>' +
      '<span class="fig-l">' + esc(info.l) + '</span>' +
      '<a class="fig-s" href="' + esc(info.url) + '" target="_blank" rel="noopener">' + esc(t('source')) + ': ' + esc(info.s) + ' ↗</a>' +
    '</div>';
  }

  // ─── Header ────────────────────────────────────────────────────────────────
  const NAV = SECTIONS.map(s => ({ href: href(s), key: s, cat: s })).concat([
    { href: href('live'), key: 'live' }, { href: href('about'), key: 'about' },
  ]);
  const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const CLOSE_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function langToggle() {
    const a = (l, label) => '<a href="' + esc(hereUrl(l)) + '" hreflang="' + l + '" lang="' + l + '"' +
      (l === lang ? ' aria-current="true"' : '') + '>' + label + '</a>';
    return '<div class="lang" role="group" aria-label="' + (isDE ? 'Sprache' : 'Language') + '">' + a('en', 'EN') + '<span>|</span>' + a('de', 'DE') + '</div>';
  }

  // On English pages, offer the German version to readers whose browser prefers German.
  // Nothing is stored and nobody is redirected.
  function prefersGerman() {
    const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (const l of langs) {
      const p = String(l).toLowerCase().slice(0, 2);
      if (p === 'de') return true;
      if (p === 'en') return false;
    }
    return false;
  }
  function deHint() {
    if (isDE || !here || !prefersGerman()) return '';
    return '<a class="lang-hint" href="' + esc(hereUrl('de')) + '" hreflang="de" lang="de">Auf Deutsch lesen →</a>';
  }

  function renderHeader() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const current = document.body.dataset.cat || document.body.dataset.page || '';
    const today = new Date().toLocaleDateString(isDE ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const navLinks = NAV.map(n => {
      const cur = n.key === current ? ' aria-current="page"' : '';
      return n.cat
        ? '<a href="' + n.href + '" data-cat="' + n.cat + '"' + cur + '><i></i>' + esc(t(n.key)) + '</a>'
        : '<a class="nav-plain" href="' + n.href + '"' + cur + '>' + esc(t(n.key)) + '</a>';
    }).join('');
    host.innerHTML =
      '<div class="datebar"><div class="wrap"><span>' + esc(today) + '</span><div class="lang-wrap">' + deHint() + langToggle() + '</div></div></div>' +
      '<header class="masthead"><div class="wrap">' +
        '<a class="logo" href="' + href('home') + '" aria-label="' + (isDE ? 'Ecodemia, Startseite' : 'Ecodemia, home') + '">eco<b>demia</b></a>' +
        '<nav class="nav" aria-label="Sections">' + navLinks + '</nav>' +
        '<button type="button" class="menu-btn" aria-label="' + esc(t('menu')) + '" aria-expanded="false" aria-controls="eco-drawer">' + MENU_SVG + '</button>' +
      '</div></header>';
    // The masthead must be a direct child of body for position: sticky to span the page
    const mast = host.querySelector('.masthead');
    host.parentNode.insertBefore(host.querySelector('.datebar'), host);
    host.parentNode.insertBefore(mast, host);
    host.remove();
  }

  function renderDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'eco-drawer';
    drawer.className = 'drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<div class="drawer-head"><a class="logo" href="' + href('home') + '">eco<b>demia</b></a><button type="button" class="drawer-close" aria-label="' + esc(t('close')) + '">' + CLOSE_SVG + '</button></div>' +
      '<nav aria-label="Sections"><a href="' + href('home') + '"><i style="background:var(--ink)"></i>' + esc(t('home')) + '</a>' +
        NAV.map(n => '<a href="' + n.href + '"' + (n.cat ? ' data-cat="' + n.cat + '"' : '') + '><i' + (n.cat ? '' : ' style="background:var(--rule)"') + '></i>' + esc(t(n.key)) + '</a>').join('') +
      '</nav>' +
      '<div class="drawer-foot"><span>© 2026 Ecodemia</span>' + langToggle() + '</div>';
    const scrim = document.createElement('div');
    scrim.className = 'scrim'; scrim.hidden = true;
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    const btn = document.querySelector('.menu-btn');
    const open = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.hidden = false; btn && btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.hidden = true; btn && btn.setAttribute('aria-expanded', 'false'); };
    btn && btn.addEventListener('click', open);
    drawer.querySelector('.drawer-close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ─── Footer ────────────────────────────────────────────────────────────────
  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    const li = (href, label, attr) => '<li><a href="' + href + '"' + (attr || '') + '>' + esc(label) + '</a></li>';
    host.outerHTML =
      '<footer class="site-footer"><div class="wrap">' +
        '<div><a class="logo" href="' + href('home') + '">eco<b>demia</b></a><p>' + esc(t('tagline')) + '</p></div>' +
        '<div><span class="label">' + esc(t('sections')) + '</span><ul class="cols2">' +
          SECTIONS.map(s => li(href(s), t(s))).join('') + li(href('live'), t('live')) +
        '</ul></div>' +
        '<div><span class="label">' + esc(t('aboutHead')) + '</span><ul>' +
          li(href('about'), t('aboutUs')) + li(href('about') + '#standards', t('standards')) + li(href('about') + '#corrections', t('corrections')) +
          li(href('imprint'), t('imprint')) + li(href('privacy'), t('privacy')) +
          li('#', t('terms'), ' data-policy="terms"') +
        '</ul></div>' +
      '</div><div class="footer-base"><div class="wrap"><span>© 2026 Ecodemia</span>' + langToggle() + '</div></div></footer>';
  }

  function initPolicies() {
    document.querySelectorAll('[data-policy]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const which = 'terms';
      const dlg = document.createElement('div');
      dlg.className = 'scrim';
      dlg.style.display = 'grid'; dlg.style.placeItems = 'center'; dlg.style.zIndex = '300'; dlg.style.padding = '20px';
      dlg.innerHTML = '<div role="dialog" aria-modal="true" style="background:var(--paper);max-width:520px;padding:28px;border-radius:4px;display:grid;gap:14px">' +
        '<h2 style="font-size:24px">' + esc(t(which + 'Title')) + '</h2>' +
        '<p style="font-family:var(--f-body);font-size:17px;color:var(--sub);line-height:1.5">' + esc(t(which + 'Body')) + '</p>' +
        '<button type="button" style="justify-self:start;font:600 14px var(--f-head);background:var(--ink);color:var(--paper);padding:10px 18px;border-radius:3px">' + esc(t('close')) + '</button></div>';
      document.body.appendChild(dlg);
      const close = () => dlg.remove();
      dlg.querySelector('button').addEventListener('click', close);
      dlg.addEventListener('click', ev => { if (ev.target === dlg) close(); });
      dlg.querySelector('button').focus();
    }));
  }

  // ─── Public API for page scripts ───────────────────────────────────────────
  window.Eco = {
    lang, isDE, t, esc, fmtDate, parseDate, loc, readTime, sourceCount, articleUrl,
    metaHTML, kickerHTML, articles, sectionInfo, figureHTML, SECTIONS, href, localizeLinks, routes: R,
  };

  function init() {
    renderHeader();
    renderDrawer();
    renderFooter();
    initPolicies();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
