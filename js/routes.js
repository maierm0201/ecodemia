// routes.js — the one EN↔DE route table, shared by the browser (window.EcoRoutes)
// and the build (require('../js/routes.js')). English lives at the root,
// German under /de/ with translated path names. Article slugs are the same in
// both languages: /article/<slug> ↔ /de/artikel/<slug>.

(function (root) {
  'use strict';

  // key → { en, de } paths. Section keys match the article `category` field.
  const PAGES = {
    home:     { en: '/',         de: '/de/' },
    climate:  { en: '/climate',  de: '/de/klima' },
    wildlife: { en: '/wildlife', de: '/de/tierwelt' },
    energy:   { en: '/energy',   de: '/de/energie' },
    living:   { en: '/living',   de: '/de/leben' },
    tech:     { en: '/tech',     de: '/de/technologie' },
    policy:   { en: '/policy',   de: '/de/politik' },
    live:     { en: '/live',     de: '/de/aktuell' },
    about:    { en: '/about',    de: '/de/ueber-uns' },
    imprint:  { en: '/imprint',  de: '/de/impressum' },
    privacy:  { en: '/privacy',  de: '/de/datenschutz' },
    support:  { en: '/support',  de: '/de/unterstuetzen' },
    terms:    { en: '/terms',    de: '/de/nutzungsbedingungen' },
    thanks:   { en: '/support/thanks', de: '/de/unterstuetzen/danke' },
  };
  const SECTIONS = ['climate', 'wildlife', 'energy', 'living', 'tech', 'policy'];
  const ARTICLE = { en: '/article/', de: '/de/artikel/' };

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

  function langOfPath(p) { return /^\/de(\/|$)/.test(p || '') ? 'de' : 'en'; }

  // URL of a page key (or { article: slug }) in a language
  function url(key, lang) {
    lang = lang === 'de' ? 'de' : 'en';
    if (key && typeof key === 'object') return ARTICLE[lang] + encodeURIComponent(key.article);
    return PAGES[key] ? PAGES[key][lang] : PAGES.home[lang];
  }
  function articleUrl(slug, lang) { return url({ article: slug }, lang); }

  // Which page a path is: { key } or { article: slug }, plus its language; null if unknown
  function match(p) {
    p = (p || '/').replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '');
    const lang = langOfPath(p);
    if (lang === 'de' && p === '/de') p = '/de/';
    for (const k in PAGES) if (PAGES[k][lang] === p) return { key: k, lang };
    const m = p.match(lang === 'de' ? /^\/de\/artikel\/([^/]+)$/ : /^\/article\/([^/]+)$/);
    if (m) return { article: decodeURIComponent(m[1]), lang };
    return null;
  }

  // Translate an internal link (path, optional #hash/?query) into another language.
  // Unknown paths are returned unchanged.
  function localize(href, lang) {
    const m = String(href).match(/^(\/[^?#]*)([?#].*)?$/);
    if (!m) return href;
    const hit = match(m[1]);
    if (!hit) return href;
    return (hit.article ? articleUrl(hit.article, lang) : url(hit.key, lang)) + (m[2] || '');
  }

  const api = { PAGES, SECTIONS, ARTICLE, SECTION_INFO, langOfPath, url, articleUrl, match, localize };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EcoRoutes = api;
})(typeof window !== 'undefined' ? window : this);
