// ecodemia.js — shared site code: header, footer, mobile menu, language, helpers.
// Every page sets <body data-page="…" data-cat="…"> and has <div id="site-header"></div>
// and <div id="site-footer"></div>. Page scripts use window.Eco.

(function () {
  'use strict';

  // ─── Language ──────────────────────────────────────────────────────────────
  const LANG_KEY = 'ecodemia_lang';
  function getLang() { try { return localStorage.getItem(LANG_KEY) === 'de' ? 'de' : 'en'; } catch (e) { return 'en'; } }
  function setLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} location.reload(); }
  const lang = getLang();
  const isDE = lang === 'de';
  document.documentElement.lang = lang;

  const SECTIONS = ['climate', 'wildlife', 'energy', 'living', 'tech', 'policy'];

  const T = {
    en: {
      climate: 'Climate', wildlife: 'Wildlife', energy: 'Energy', living: 'Living', tech: 'Tech', policy: 'Policy',
      live: 'Live', about: 'About', home: 'Home', menu: 'Menu', close: 'Close',
      tagline: 'Independent, bilingual reporting on climate, nature and the energy transition. Every article lists its sources.',
      sections: 'Sections', aboutHead: 'About', aboutUs: 'About Ecodemia', standards: 'Editorial standards',
      corrections: 'Corrections', privacy: 'Privacy', terms: 'Terms of use',
      minRead: 'min read', sources: 'sources', source: 'source', checked: 'Checked', updated: 'Updated', published: 'Published',
      privacyTitle: 'Privacy',
      privacyBody: 'Ecodemia does not set cookies, run analytics or ask for personal data. Fonts, scripts and images are served from this website itself; your language choice is stored only in your own browser. The Live page loads headlines through our own server. The site is hosted by Vercel. A full privacy policy will be published here.',
      termsTitle: 'Terms of use',
      termsBody: 'Ecodemia articles may be read and shared via link. Texts are © Ecodemia. Photos remain the property of their creators and are used under the licences named below each image. Links to external sources lead to third-party websites for whose content Ecodemia is not responsible.',
    },
    de: {
      climate: 'Klima', wildlife: 'Tierwelt', energy: 'Energie', living: 'Leben', tech: 'Technologie', policy: 'Politik',
      live: 'Aktuell', about: 'Über uns', home: 'Startseite', menu: 'Menü', close: 'Schließen',
      tagline: 'Unabhängige, zweisprachige Berichterstattung über Klima, Natur und Energiewende. Jeder Artikel nennt seine Quellen.',
      sections: 'Rubriken', aboutHead: 'Über uns', aboutUs: 'Über Ecodemia', standards: 'Redaktionelle Standards',
      corrections: 'Korrekturen', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen',
      minRead: 'Min. Lesezeit', sources: 'Quellen', source: 'Quelle', checked: 'Geprüft', updated: 'Aktualisiert', published: 'Veröffentlicht',
      privacyTitle: 'Datenschutz',
      privacyBody: 'Ecodemia setzt keine Cookies, nutzt keine Analyse-Tools und fragt keine personenbezogenen Daten ab. Schriften, Skripte und Bilder werden von dieser Website selbst ausgeliefert; deine Sprachwahl wird nur in deinem eigenen Browser gespeichert. Die Seite „Aktuell“ lädt Schlagzeilen über unseren eigenen Server. Gehostet wird die Seite bei Vercel. Eine vollständige Datenschutzerklärung wird hier veröffentlicht.',
      termsTitle: 'Nutzungsbedingungen',
      termsBody: 'Ecodemia-Artikel dürfen gelesen und per Link geteilt werden. Texte © Ecodemia. Fotos bleiben Eigentum ihrer Urheber und werden unter den jeweils unter dem Bild genannten Lizenzen verwendet. Links zu externen Quellen führen zu Websites Dritter, für deren Inhalte Ecodemia nicht verantwortlich ist.',
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
  function articleUrl(a) { return '/article/' + encodeURIComponent(a.slug); }

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

  // ─── Section descriptions and sourced figures ─────────────────────────────
  // Every figure must link to its source. Keep them current.
  const SECTION_INFO = {
    climate: {
      en: { desc: 'Climate science, extreme weather and what a warming world means for Europe.', n: '1.47 °C', l: 'Global surface temperature above pre-industrial levels, January–September 2026', s: 'WMO State of the Climate Update 2026' },
      de: { desc: 'Klimawissenschaft, Extremwetter und was eine wärmere Welt für Europa bedeutet.', n: '1,47 °C', l: 'Globale Oberflächentemperatur über vorindustriellem Niveau, Januar–September 2026', s: 'WMO State of the Climate Update 2026' },
      url: 'https://wmo.int/resources/publication-series/state-of-climate-update-cop/state-of-climate-update-cop31',
    },
    wildlife: {
      en: { desc: 'Biodiversity, protected species, oceans and the laws that decide their future.', n: '73 %', l: 'Average decline in monitored wildlife populations since 1970', s: 'WWF/ZSL Living Planet Report 2026' },
      de: { desc: 'Artenvielfalt, geschützte Arten, Meere und die Gesetze, die über ihre Zukunft entscheiden.', n: '73 %', l: 'Durchschnittlicher Rückgang beobachteter Wildtierbestände seit 1970', s: 'WWF/ZSL Living Planet Report 2026' },
      url: 'https://www.worldwildlife.org/news/press-releases/wildlife-population-sizes-decline-73-on-average-but-tiger-elephant-turtle-and-tuna-recoveries-offer-hope/',
    },
    energy: {
      en: { desc: 'Renewables, grids, storage and the economics of the energy transition.', n: '50 %', l: 'Expected low-emission share of global electricity by 2030, up from 42 % in 2025', s: 'IEA Electricity 2026' },
      de: { desc: 'Erneuerbare, Netze, Speicher und die Ökonomie der Energiewende.', n: '50 %', l: 'Erwarteter Anteil emissionsarmer Quellen am weltweiten Strom 2030, nach 42 % im Jahr 2025', s: 'IEA Electricity 2026' },
      url: 'https://www.iea.org/reports/electricity-2026/executive-summary',
    },
    living: {
      en: { desc: 'Homes, food, consumption and everyday choices in a changing climate.', n: '1.49 M', l: 'Balcony solar systems registered in Germany, September 2026', s: 'Market master data register, via kleines kraftwerk' },
      de: { desc: 'Wohnen, Ernährung, Konsum und Alltagsentscheidungen im Klimawandel.', n: '1,49 Mio.', l: 'In Deutschland registrierte Balkonkraftwerke, September 2026', s: 'Marktstammdatenregister, via kleines kraftwerk' },
      url: 'https://kleineskraftwerk.de/blogs/magazin/balkonkraftwerke-2026-vier-module-mehr-leistung',
    },
    tech: {
      en: { desc: 'Climate technology, from batteries and geothermal to the energy use of AI.', n: '≈1 %', l: 'Share of global electricity AI data centres could use by 2030 (239–295 TWh)', s: 'Nature study, 2026' },
      de: { desc: 'Klimatechnologie, von Batterien und Geothermie bis zum Energieverbrauch von KI.', n: '≈1 %', l: 'Anteil am weltweiten Strom, den KI-Rechenzentren bis 2030 erreichen könnten (239–295 TWh)', s: 'Nature-Studie, 2026' },
      url: 'https://www.nature.com/articles/s44458-026-00152-5',
    },
    policy: {
      en: { desc: 'Climate and environmental law in the EU, Germany and at the UN.', n: '90 %', l: 'Net greenhouse gas cut by 2040 versus 1990, now in EU climate law', s: 'ICAP on the amended European Climate Law' },
      de: { desc: 'Klima- und Umweltrecht in der EU, in Deutschland und bei den Vereinten Nationen.', n: '90 %', l: 'Netto-Treibhausgasminderung bis 2040 gegenüber 1990, nun im EU-Klimagesetz', s: 'ICAP zum geänderten EU-Klimagesetz' },
      url: 'https://icapcarbonaction.com/en/news/eu-officially-adopts-2040-climate-target-postpones-ets-2-one-year',
    },
  };
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
  const NAV = SECTIONS.map(s => ({ href: '/' + s, key: s, cat: s })).concat([
    { href: '/live', key: 'live' }, { href: '/about', key: 'about' },
  ]);
  const MENU_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const CLOSE_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function langToggle() {
    return '<div class="lang" role="group" aria-label="Language">' +
      '<button type="button" data-setlang="en" aria-pressed="' + (!isDE) + '">EN</button><span>|</span>' +
      '<button type="button" data-setlang="de" aria-pressed="' + isDE + '">DE</button></div>';
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
      '<div class="datebar"><div class="wrap"><span>' + esc(today) + '</span>' + langToggle() + '</div></div>' +
      '<header class="masthead"><div class="wrap">' +
        '<a class="logo" href="/" aria-label="Ecodemia, home">eco<b>demia</b></a>' +
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
      '<div class="drawer-head"><a class="logo" href="/">eco<b>demia</b></a><button type="button" class="drawer-close" aria-label="' + esc(t('close')) + '">' + CLOSE_SVG + '</button></div>' +
      '<nav aria-label="Sections"><a href="/"><i style="background:var(--ink)"></i>' + esc(t('home')) + '</a>' +
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
        '<div><a class="logo" href="/">eco<b>demia</b></a><p>' + esc(t('tagline')) + '</p></div>' +
        '<div><span class="label">' + esc(t('sections')) + '</span><ul class="cols2">' +
          SECTIONS.map(s => li('/' + s, t(s))).join('') + li('/live', t('live')) +
        '</ul></div>' +
        '<div><span class="label">' + esc(t('aboutHead')) + '</span><ul>' +
          li('/about', t('aboutUs')) + li('/about#standards', t('standards')) + li('/about#corrections', t('corrections')) +
          li('#', t('privacy'), ' data-policy="privacy"') + li('#', t('terms'), ' data-policy="terms"') +
        '</ul></div>' +
      '</div><div class="footer-base"><div class="wrap"><span>© 2026 Ecodemia</span>' + langToggle() + '</div></div></footer>';
  }

  function initPolicies() {
    document.querySelectorAll('[data-policy]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const which = el.dataset.policy === 'terms' ? 'terms' : 'privacy';
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

  function initLangButtons() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-setlang]');
      if (b) setLang(b.dataset.setlang);
    });
  }

  // ─── Public API for page scripts ───────────────────────────────────────────
  window.Eco = {
    lang, isDE, t, esc, fmtDate, parseDate, loc, readTime, sourceCount, articleUrl,
    metaHTML, kickerHTML, articles, sectionInfo, figureHTML, SECTIONS,
  };

  function init() {
    renderHeader();
    renderDrawer();
    renderFooter();
    initPolicies();
    initLangButtons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
