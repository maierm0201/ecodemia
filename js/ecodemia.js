// ecodemia.js — Shared site functionality (navigation, language, footer, policies)

// ─── PATH HELPERS ─────────────────────────────────────────────────────────────
function relPath(target) {
  // Absolute URLs (clean routes like /climate, /article/foo) pass through unchanged
  if (target.startsWith('/') || target.startsWith('http')) return target;
  return '../' + target;
}

const PAGES = {
  homeDesktop: '/',
  homeMobile:  '/',
  about:       '/about',
  articleView: 'article_view/code.html',
};

function isMobile() { return window.innerWidth < 768; }
function page(key)  { return relPath(PAGES[key]); }

// ─── LANGUAGE SYSTEM ──────────────────────────────────────────────────────────
const LANG_KEY = 'ecodemia_lang';
function getLang() { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; } }
function setLang(lang) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} location.reload(); }

// Keyed translations – used for JS-generated strings (nav, drawer, footer, modals)
const T = {
  en: {
    'nav.climate':  'Climate',      'nav.wildlife': 'Wildlife',
    'nav.energy':   'Energy',       'nav.living':   'Living',
    'nav.tech':     'Tech',         'nav.policy':   'Policy',
    'nav.live':     'Live Updates', 'nav.about':    'About',
    'nav.home':     'Home',
    'footer.tagline': 'Independent, bilingual reporting on climate, nature and the energy transition, with every article linked to its sources.',
    'footer.sections': 'Sections',
    'footer.about':    'About',
    'footer.aboutUs':  'About Ecodemia',
    'footer.standards':'Editorial standards',
    'footer.corrections':'Corrections',
    'footer.privacy':  'Privacy',
    'footer.terms':    'Terms of use',
    'footer.copy':     '© 2026 Ecodemia',
    'policy.privacy.title': 'Privacy',
    'policy.privacy.body':  'Ecodemia does not set cookies, run analytics or ask for personal data. Your language choice is stored only in your own browser. To display pages, your browser loads fonts from Google Fonts, and scripts from cdn.tailwindcss.com and cdn.jsdelivr.net; these providers receive your IP address. The site is hosted by Vercel. A full privacy policy will be published here.',
    'policy.terms.title':   'Terms of use',
    'policy.terms.body':    'Ecodemia articles may be read and shared via link. Texts are © Ecodemia. Photos remain the property of their creators and are used under the licences named below each image. Links to external sources lead to third-party websites for whose content Ecodemia is not responsible.',
    'policy.close':     'Close',
    'stat.source':      'Source',
  },
  de: {
    'nav.climate':  'Klima',        'nav.wildlife': 'Tierwelt',
    'nav.energy':   'Energie',      'nav.living':   'Leben',
    'nav.tech':     'Technologie',  'nav.policy':   'Politik',
    'nav.live':     'Aktuell',      'nav.about':    'Über uns',
    'nav.home':     'Startseite',
    'footer.tagline': 'Unabhängige, zweisprachige Berichterstattung über Klima, Natur und Energiewende – jeder Artikel mit seinen Quellen verlinkt.',
    'footer.sections': 'Rubriken',
    'footer.about':    'Über uns',
    'footer.aboutUs':  'Über Ecodemia',
    'footer.standards':'Redaktionelle Standards',
    'footer.corrections':'Korrekturen',
    'footer.privacy':  'Datenschutz',
    'footer.terms':    'Nutzungsbedingungen',
    'footer.copy':     '© 2026 Ecodemia',
    'policy.privacy.title': 'Datenschutz',
    'policy.privacy.body':  'Ecodemia setzt keine Cookies, nutzt keine Analyse-Tools und fragt keine personenbezogenen Daten ab. Deine Sprachwahl wird nur in deinem eigenen Browser gespeichert. Zur Darstellung lädt dein Browser Schriften von Google Fonts, und Skripte von cdn.tailwindcss.com und cdn.jsdelivr.net; diese Anbieter erhalten dabei deine IP-Adresse. Gehostet wird die Seite bei Vercel. Eine vollständige Datenschutzerklärung wird hier veröffentlicht.',
    'policy.terms.title':   'Nutzungsbedingungen',
    'policy.terms.body':    'Ecodemia-Artikel dürfen gelesen und per Link geteilt werden. Texte © Ecodemia. Fotos bleiben Eigentum ihrer Urheber und werden unter den jeweils unter dem Bild genannten Lizenzen verwendet. Links zu externen Quellen führen zu Websites Dritter, für deren Inhalte Ecodemia nicht verantwortlich ist.',
    'policy.close':     'Schließen',
    'stat.source':      'Quelle',
  }
};

function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) || T.en[key] || key;
}

// Text-node replacements – exact-match on trimmed text content of HTML elements.
// English is the default in HTML; only the 'de' map is needed.
const TEXT_REPLACE = {
  de: {
    // Homepage
    'Latest':                        'Neueste Artikel',
    'The Latest':                    'Neueste Artikel',
    'All Articles':                  'Alle Artikel',
    'View all articles':             'Alle Artikel ansehen',
    'By the Numbers':                'In Zahlen',
    'Live Updates from Trusted Newsrooms': 'Aktuelles aus seriösen Redaktionen',
    'Headlines from the Guardian, BBC, Mongabay, Grist and CleanTechnica, refreshed throughout the day. Every headline links to the original source.':
      'Schlagzeilen von Guardian, BBC, Mongabay, Grist und CleanTechnica, mehrmals täglich aktualisiert. Jede Schlagzeile verlinkt auf die Originalquelle.',
    'Open live updates':             'Zu den Live-Updates',

    // Article / Category
    'Further Reading':               'Weitere Artikel',
    'Cover Story':                   'Titelgeschichte',
    'Latest Story':                  'Neuester Artikel',
    'Archive Directory':             'Archiv-Verzeichnis',
    'More from Ecodemia':            'Mehr von Ecodemia',
    'Min Read':                      'Min. Lesezeit',
    'min read':                      'Min. Lesezeit',
    'Loading article…':              'Artikel wird geladen…',
    'Loading…':                      'Wird geladen…',
    'Article Not Found':             'Artikel nicht gefunden',
    'This article may have been moved or is not yet published.':
      'Dieser Artikel wurde möglicherweise verschoben oder ist noch nicht veröffentlicht.',
    'Back to Archive':               'Zurück zum Archiv',
    'No articles in this section yet.': 'In dieser Rubrik gibt es noch keine Artikel.',
    'We only publish researched, sourced reporting. New articles for this section are in preparation.':
      'Wir veröffentlichen nur recherchierte Artikel mit Quellen. Neue Beiträge für diese Rubrik sind in Vorbereitung.',
    'Browse all articles':           'Alle Artikel ansehen',
  }
};

// Walk DOM text nodes and replace known English strings with translated equivalents.
function applyTextReplacements(lang) {
  if (lang === 'en') return;
  const map = TEXT_REPLACE[lang];
  if (!map) return;
  document.documentElement.lang = lang;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA']);
  function walk(node) {
    if (SKIP.has(node.nodeName)) return;
    if (node.nodeType === 3) {
      const trimmed = node.textContent.trim();
      if (trimmed && map[trimmed] !== undefined) {
        node.textContent = node.textContent.replace(trimmed, map[trimmed]);
      }
    } else {
      node.childNodes.forEach(walk);
    }
  }
  walk(document.body);
}

function buildLangToggleHTML(lang) {
  return `
    <div class="eco-lang-toggle flex items-center gap-1.5">
      <button data-lang="en" onclick="setLang('en')"
        class="font-label text-[11px] uppercase tracking-widest ${lang === 'en' ? 'font-bold text-[#1B4332]' : 'text-[#717973] hover:text-[#1B4332] transition-colors'}">EN</button>
      <span class="text-[#717973]/30 text-xs select-none">|</span>
      <button data-lang="de" onclick="setLang('de')"
        class="font-label text-[11px] uppercase tracking-widest ${lang === 'de' ? 'font-bold text-[#1B4332]' : 'text-[#717973] hover:text-[#1B4332] transition-colors'}">DE</button>
    </div>`;
}

function initI18n() { applyTextReplacements(getLang()); }

// ─── ECO LOGO ─────────────────────────────────────────────────────────────────
function initEcoLogo() {
  if (!document.getElementById('eco-logo-style')) {
    const s = document.createElement('style');
    s.id = 'eco-logo-style';
    s.textContent = `.eco-logo{font-family:'Newsreader',serif!important;font-style:normal!important;font-weight:700!important;color:#1B4332!important;text-decoration:none!important;}`;
    document.head.appendChild(s);
  }
  document.querySelectorAll('.eco-logo').forEach(el => {
    if (el.tagName === 'A') { el.href = '/'; }
    else { el.style.cursor = 'pointer'; el.addEventListener('click', () => { window.location.href = '/'; }); }
  });
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { labelKey: 'nav.climate',  category: 'climate',  href: '/climate'  },
  { labelKey: 'nav.wildlife', category: 'wildlife', href: '/wildlife' },
  { labelKey: 'nav.energy',   category: 'energy',   href: '/energy'   },
  { labelKey: 'nav.living',   category: 'living',   href: '/living'   },
  { labelKey: 'nav.tech',     category: 'tech',     href: '/tech'     },
  { labelKey: 'nav.policy',   category: 'policy',   href: '/policy'   },
  { labelKey: 'nav.live',     category: 'live',     href: '/live'     },
  { labelKey: 'nav.about',    category: 'about',    href: '/about'    },
];

function currentSection() {
  return new URLSearchParams(window.location.search).get('category')
    || window.location.pathname.split('/').filter(Boolean)[0] || '';
}

function initUniversalDesktopNav() {
  const container = document.querySelector('.fixed [class*="md:flex"]');
  const lang = getLang();
  if (container) {
    const cur = currentSection();
    container.className = 'hidden lg:flex items-center gap-7';
    container.innerHTML = NAV_ITEMS.map(item => {
      const active = item.category === cur;
      const cls = active
        ? "font-['Newsreader'] text-lg tracking-tight text-[#1B4332] border-b-2 border-[#1B4332] transition-colors duration-300"
        : "font-['Newsreader'] text-lg tracking-tight text-[#717973] hover:text-[#1B4332] transition-colors duration-300";
      return `<a class="${cls}" href="${item.href}">${t(item.labelKey)}</a>`;
    }).join('');
  }

  // Right side of the top bar: language toggle + menu button (below lg)
  const rightSide = document.querySelector('nav.fixed > div > div:last-child, header.fixed > div > div:last-child');
  if (rightSide) {
    if (!rightSide.querySelector('.eco-lang-toggle')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'hidden sm:flex items-center gap-1.5';
      wrapper.innerHTML = buildLangToggleHTML(lang);
      rightSide.appendChild(wrapper);
    }
    let trigger = rightSide.querySelector('.menu-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.className = 'menu-trigger text-on-surface';
      trigger.setAttribute('aria-label', 'Menu');
      trigger.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      rightSide.appendChild(trigger);
    }
    trigger.classList.remove('md:hidden');
    trigger.classList.add('lg:hidden');
  }
}

// Remove leftovers from the original template that have no working backend:
// search (no search page yet), subscribe/newsletter (no newsletter yet), shop/cart.
function initChrome() {
  document.querySelectorAll('.search-trigger, .subscribe-btn, .cart-trigger, .cart-badge, .newsletter-form')
    .forEach(el => el.remove());
}

// ─── MOBILE MENU DRAWER ───────────────────────────────────────────────────────
function initMobileMenu() {
  if (document.getElementById('eco-drawer')) return;
  const lang = getLang();
  const link = (href, key) =>
    `<a href="${href}" class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t(key)}</a>`;
  const drawer = document.createElement('div');
  drawer.id = 'eco-drawer';
  drawer.className = 'fixed inset-y-0 left-0 w-72 bg-[#f9faf6] z-[200] shadow-2xl flex flex-col';
  // Inline styles: Tailwind's CDN build does not reliably reset transforms when classes toggle
  drawer.style.transform = 'translateX(-100%)';
  drawer.style.transition = 'transform 300ms ease';
  drawer.innerHTML = `
    <div class="flex items-center justify-between px-6 h-16 border-b border-[#c1c8c2]/20">
      <span class="eco-logo text-xl">Ecodemia</span>
      <button id="eco-drawer-close" class="text-[#717973]" aria-label="Close"><span class="material-symbols-outlined">close</span></button>
    </div>
    <nav class="flex flex-col p-6 gap-5 flex-1">
      ${link('/', 'nav.home')}
      ${NAV_ITEMS.map(i => link(i.href, i.labelKey)).join('\n')}
    </nav>
    <div class="p-6 border-t border-[#c1c8c2]/20 flex items-center justify-between">
      <p class="font-body text-xs text-[#717973]">${t('footer.copy')}</p>
      ${buildLangToggleHTML(lang)}
    </div>`;
  document.body.appendChild(drawer);

  const overlay = document.createElement('div');
  overlay.id = 'eco-overlay';
  overlay.className = 'fixed inset-0 bg-black/30 z-[199] hidden';
  document.body.appendChild(overlay);

  const open  = () => { drawer.style.transform = 'translateX(0)';     overlay.classList.remove('hidden'); };
  const close = () => { drawer.style.transform = 'translateX(-100%)'; overlay.classList.add('hidden'); };
  document.querySelectorAll('.menu-trigger').forEach(btn => btn.addEventListener('click', open));
  document.getElementById('eco-drawer-close').addEventListener('click', close);
  overlay.addEventListener('click', close);
}

// ─── FOOTER (one honest footer for every page) ────────────────────────────────
function initFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const a = (href, label, extra) =>
    `<li><a class="font-['Inter'] text-sm text-[#717973] hover:text-[#1B4332]" href="${href}" ${extra || ''}>${label}</a></li>`;
  footer.className = 'w-full py-16 px-6 md:px-8 bg-[#f3f4f0] border-t border-[#c1c8c2]/20';
  footer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-screen-2xl mx-auto">
      <div>
        <a class="eco-logo text-xl mb-4 block" href="/">Ecodemia</a>
        <p class="font-['Inter'] text-sm text-[#717973] max-w-xs leading-relaxed">${t('footer.tagline')}</p>
      </div>
      <div>
        <h4 class="font-label text-xs font-bold uppercase tracking-widest text-[#1a1c1a] mb-6">${t('footer.sections')}</h4>
        <ul class="grid grid-cols-2 gap-y-3 gap-x-6">
          ${NAV_ITEMS.filter(i => i.category !== 'about').map(i => a(i.href, t(i.labelKey))).join('')}
        </ul>
      </div>
      <div>
        <h4 class="font-label text-xs font-bold uppercase tracking-widest text-[#1a1c1a] mb-6">${t('footer.about')}</h4>
        <ul class="space-y-3">
          ${a('/about', t('footer.aboutUs'))}
          ${a('/about#standards', t('footer.standards'))}
          ${a('/about#corrections', t('footer.corrections'))}
          ${a('#', t('footer.privacy'), 'data-policy="privacy"')}
          ${a('#', t('footer.terms'), 'data-policy="terms"')}
        </ul>
      </div>
    </div>
    <div class="max-w-screen-2xl mx-auto mt-12 pt-6 border-t border-[#c1c8c2]/20 flex items-center justify-between">
      <p class="font-['Inter'] text-xs text-[#717973]">${t('footer.copy')}</p>
      ${buildLangToggleHTML(getLang())}
    </div>`;
}

// ─── PRIVACY / TERMS MODAL ────────────────────────────────────────────────────
function initPolicyModals() {
  const content = {
    privacy: { title: t('policy.privacy.title'), body: t('policy.privacy.body') },
    terms:   { title: t('policy.terms.title'),   body: t('policy.terms.body')   },
  };
  document.querySelectorAll('[data-policy]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const c = content[el.dataset.policy] || content.privacy;
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-6';
      modal.innerHTML = `
        <div class="bg-[#f9faf6] rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h3 class="font-headline text-2xl text-primary mb-4">${c.title}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed mb-6">${c.body}</p>
          <button class="w-full bg-primary text-white py-3 rounded-full font-label text-xs uppercase tracking-widest modal-close-btn">${t('policy.close')}</button>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', ev => { if (ev.target === modal) modal.remove(); });
    });
  });
}

// ─── CATEGORY PAGE ────────────────────────────────────────────────────────────
// Each section shows one sourced figure. Keep these current and always linked.
const CATEGORY_CONFIG = {
  climate: {
    source: 'https://wmo.int/resources/publication-series/state-of-climate-update-cop/state-of-climate-update-cop31',
    en: { title: 'Climate: Tracking a Warming World.', stat: '1.47 °C', statLabel: 'Global surface temperature above pre-industrial levels, January–September 2026.', sourceName: 'WMO, State of the Climate Update 2026' },
    de: { title: 'Klima: Eine Welt im Wandel.',          stat: '1,47 °C', statLabel: 'Globale Oberflächentemperatur über vorindustriellem Niveau, Januar–September 2026.', sourceName: 'WMO, State of the Climate Update 2026' },
  },
  wildlife: {
    source: 'https://www.worldwildlife.org/news/press-releases/wildlife-population-sizes-decline-73-on-average-but-tiger-elephant-turtle-and-tuna-recoveries-offer-hope/',
    en: { title: 'Wildlife: Stories of the Wild.',       stat: '73 %', statLabel: 'Average decline in monitored wildlife populations since 1970.', sourceName: 'WWF/ZSL, Living Planet Report 2026' },
    de: { title: 'Tierwelt: Geschichten der Wildnis.',   stat: '73 %', statLabel: 'Durchschnittlicher Rückgang beobachteter Wildtierbestände seit 1970.', sourceName: 'WWF/ZSL, Living Planet Report 2026' },
  },
  energy: {
    source: 'https://www.iea.org/reports/electricity-2026/executive-summary',
    en: { title: 'Energy: The Transition Now.',          stat: '50 %', statLabel: 'Expected share of low-emission sources in global electricity by 2030, up from 42 % in 2025.', sourceName: 'IEA, Electricity 2026' },
    de: { title: 'Energie: Die Wende jetzt.',            stat: '50 %', statLabel: 'Erwarteter Anteil emissionsarmer Quellen an der weltweiten Stromerzeugung 2030, nach 42 % im Jahr 2025.', sourceName: 'IEA, Electricity 2026' },
  },
  living: {
    source: 'https://www.wunc.org/2026-10-23/europes-heat-claims-50-000-lives-climate-change-blamed-for-two-thirds-of-deaths',
    en: { title: 'Living: Sustainable Futures.',         stat: '50,391', statLabel: 'Estimated heat-related excess deaths in European cities, June–August 2026.', sourceName: 'Imperial College London & LSHTM, via AP' },
    de: { title: 'Leben: Nachhaltige Zukunft.',          stat: '50.391', statLabel: 'Geschätzte hitzebedingte Übersterblichkeit in europäischen Städten, Juni–August 2026.', sourceName: 'Imperial College London & LSHTM, via AP' },
  },
  tech: {
    source: 'https://www.nature.com/articles/s44458-026-00152-5',
    en: { title: 'Tech: Innovation for the Planet.',     stat: '≈1 %', statLabel: 'Share of global electricity AI data centres could use by 2030 (239–295 TWh).', sourceName: 'Nature study, 2026' },
    de: { title: 'Technologie: Innovation für den Planeten.', stat: '≈1 %', statLabel: 'Anteil am weltweiten Stromverbrauch, den KI-Rechenzentren bis 2030 erreichen könnten (239–295 TWh).', sourceName: 'Nature-Studie, 2026' },
  },
  policy: {
    source: 'https://icapcarbonaction.com/en/news/eu-officially-adopts-2040-climate-target-postpones-ets-2-one-year',
    en: { title: 'Policy: Laws of the Land.',            stat: '90 %', statLabel: 'Net greenhouse gas cut by 2040 versus 1990, now written into EU climate law.', sourceName: 'ICAP on the amended European Climate Law' },
    de: { title: 'Politik: Gesetze der Erde.',           stat: '90 %', statLabel: 'Netto-Treibhausgasminderung bis 2040 gegenüber 1990, nun im EU-Klimagesetz verankert.', sourceName: 'ICAP zum geänderten EU-Klimagesetz' },
  },
};

function initCategoryPage() {
  if (!document.querySelector('.category-title')) return;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  const cat = new URLSearchParams(window.location.search).get('category') || (CATEGORY_CONFIG[seg] ? seg : 'climate');
  const base = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.climate;
  const cfg  = base[getLang()] || base.en;
  const set  = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.category-title',      cfg.title);
  set('.category-stat',       cfg.stat);
  set('.category-stat-label', cfg.statLabel);
  const src = document.querySelector('.category-stat-source');
  if (src) {
    src.href = base.source;
    src.textContent = t('stat.source') + ': ' + cfg.sourceName;
  }
  document.title = cfg.title.split(':')[0] + ' | Ecodemia';
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initChrome();
  initFooter();
  initI18n();                  // text replacements (after footer, before nav injection)
  initEcoLogo();
  initUniversalDesktopNav();
  initMobileMenu();
  initPolicyModals();
  initCategoryPage();
});
