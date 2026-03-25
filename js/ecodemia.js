// ecodemia.js — Shared site functionality

// ─── PATH HELPERS ─────────────────────────────────────────────────────────────
function relPath(target) { return '../' + target; }

const PAGES = {
  homeDesktop:      'environmental_news_homepage/code.html',
  homeMobile:       'environmental_news_home_mobile/code.html',
  articleDesktop:   'article_detail_page/code.html',
  articleMobile:    'article_detail_mobile/code.html',
  categoryDesktop:  'category_page/code.html',
  categoryMobile:   'category_page_mobile/code.html',
  searchDesktop:    'search_results_reforestation/code.html',
  searchMobile:     'search_results_mobile/code.html',
  merchDesktop:     'merchandise_collections/code.html',
  merchMobile:      'merch_collections_mobile/code.html',
  productDesktop:   'product_detail_field_jacket/code.html',
  productMobile:    'product_detail_mobile/code.html',
  cart:             'shopping_cart_mobile/code.html',
  checkout:         'checkout_mobile/code.html',
  supportDesktop:   'support_the_living_archive/code.html',
  supportMobile:    'support_mobile/code.html',
  articleView:      'article_view/code.html',
};

function isMobile() { return window.innerWidth < 768; }
function page(key)  { return relPath(PAGES[key]); }

// ─── LANGUAGE SYSTEM ──────────────────────────────────────────────────────────
const LANG_KEY = 'ecodemia_lang';
function getLang() { return localStorage.getItem(LANG_KEY) || 'en'; }
function setLang(lang) { localStorage.setItem(LANG_KEY, lang); location.reload(); }

// Keyed translations – used for JS-generated strings (modals, toasts, nav, drawer)
const T = {
  en: {
    'nav.climate':   'Climate',    'nav.wildlife': 'Wildlife',
    'nav.energy':    'Energy',     'nav.living':   'Living',
    'nav.tech':      'Tech',       'nav.policy':   'Policy',
    'nav.live':      'Live Updates','nav.support':  'Support Us',
    'nav.subscribe': 'Subscribe',  'nav.home':     'Home',
    'nav.search':    'Search',     'nav.shop':     'Shop',
    'subscribe.title':   'Join Ecodemia',
    'subscribe.desc':    'Weekly dispatches on the state of our planet. No fluff.',
    'subscribe.placeholder': 'Your email address',
    'subscribe.cta':     'Join Now',
    'subscribe.dismiss': 'Not now',
    'subscribe.success.title': "You're in!",
    'subscribe.success.body':  "Welcome to Ecodemia's dispatch.",
    'newsletter.success':      "You're in! Welcome to Ecodemia.",
    'cart.added':        'Added to your archive selection',
    'support.thanks':    'Thank you',
    'support.thanks.body': 'Your contribution makes the record permanent.',
    'checkout.success.title': 'Purchase Complete',
    'checkout.success.body':  'Your archive selection is on its way. A carbon-neutral shipment confirmation has been sent.',
    'checkout.return':   'Return to Archive',
    'policy.privacy.title': 'Privacy Policy',
    'policy.privacy.body':  'Ecodemia collects only the email address you voluntarily provide for our newsletter. We do not sell or share your data with third parties. Data is stored securely and you may unsubscribe at any time.',
    'policy.terms.title':   'Terms of Service',
    'policy.terms.body':    'By using Ecodemia you agree to engage with our content for personal, non-commercial purposes. All editorial content is © 2025 Ecodemia. Merchandise purchases are final unless defective.',
    'policy.close':     'Close',
  },
  de: {
    'nav.climate':   'Klima',       'nav.wildlife': 'Tierwelt',
    'nav.energy':    'Energie',     'nav.living':   'Leben',
    'nav.tech':      'Technologie', 'nav.policy':   'Politik',
    'nav.live':      'Aktuell',     'nav.support':  'Unterstützen',
    'nav.subscribe': 'Abonnieren',  'nav.home':     'Startseite',
    'nav.search':    'Suche',       'nav.shop':     'Shop',
    'subscribe.title':   'Ecodemia beitreten',
    'subscribe.desc':    'Wöchentliche Analysen zum Zustand unseres Planeten. Ohne Fülltext.',
    'subscribe.placeholder': 'Deine E-Mail-Adresse',
    'subscribe.cta':     'Jetzt mitmachen',
    'subscribe.dismiss': 'Nicht jetzt',
    'subscribe.success.title': 'Du bist dabei!',
    'subscribe.success.body':  'Willkommen beim Ecodemia-Newsletter.',
    'newsletter.success':      'Du bist dabei! Willkommen bei Ecodemia.',
    'cart.added':        'Zur Archiv-Auswahl hinzugefügt',
    'support.thanks':    'Vielen Dank',
    'support.thanks.body': 'Dein Beitrag macht das Archiv dauerhaft.',
    'checkout.success.title': 'Kauf abgeschlossen',
    'checkout.success.body':  'Deine Archiv-Auswahl ist unterwegs. Eine CO₂-neutrale Versandbestätigung wurde gesendet.',
    'checkout.return':   'Zurück zum Archiv',
    'policy.privacy.title': 'Datenschutzerklärung',
    'policy.privacy.body':  'Ecodemia erfasst ausschließlich die E-Mail-Adresse, die du freiwillig für unseren Newsletter angibst. Wir verkaufen oder teilen deine Daten nicht mit Dritten. Die Daten werden sicher gespeichert und du kannst dich jederzeit abmelden.',
    'policy.terms.title':   'Nutzungsbedingungen',
    'policy.terms.body':    'Mit der Nutzung von Ecodemia stimmst du zu, unsere Inhalte ausschließlich für persönliche, nicht kommerzielle Zwecke zu nutzen. Alle redaktionellen Inhalte sind © 2025 Ecodemia. Käufe von Merchandise sind endgültig, sofern kein Defekt vorliegt.',
    'policy.close':     'Schließen',
  }
};

function t(key) {
  const lang = getLang();
  return (T[lang] && T[lang][key]) || T.en[key] || key;
}

// Text-node replacements – exact-match on trimmed text content of HTML elements
// English is the default in HTML; only the 'de' map is needed.
const TEXT_REPLACE = {
  de: {
    // ── Common ───────────────────────────────────────────────────────────────
    'Subscribe':                     'Abonnieren',

    // ── Footer ───────────────────────────────────────────────────────────────
    'Sections':                      'Rubriken',
    'Archive':                       'Archiv',
    'Social':                        'Soziales',
    'Privacy Policy':                'Datenschutz',
    'Terms of Service':              'Nutzungsbedingungen',
    'Accessibility':                 'Barrierefreiheit',
    'About Us':                      'Über uns',
    'Annual Reports':                'Jahresberichte',
    'Contact':                       'Kontakt',
    'Climate Change':                'Klimawandel',
    'Renewable Energy':              'Erneuerbare Energie',
    'Conservation':                  'Naturschutz',
    'Policy & Law':                  'Politik & Recht',
    '© 2025 Ecodemia. All rights reserved.':
      '© 2025 Ecodemia. Alle Rechte vorbehalten.',
    'A permanent record of our changing environment, documenting the intersection of humanity and the natural world.':
      'Eine dauerhafte Aufzeichnung unserer sich verändernden Umwelt – an der Schnittstelle von Mensch und Natur.',

    // ── Homepage ─────────────────────────────────────────────────────────────
    'Latest News':                   'Aktuelle Nachrichten',
    'In-Depth Reporting':            'Hintergrundberichte',
    'View Full Archive':             'Vollständiges Archiv',
    'View Archive':                  'Archiv anzeigen',
    'From the Archive':              'Aus dem Archiv',
    'Archive Spotlight':             'Archiv-Highlight',
    'The Ecodemia Daily Brief':      'Der Ecodemia Tagesüberblick',
    'Weekly environmental intelligence for those who want to understand the crisis, not just read about it.':
      'Wöchentliche Umweltanalysen für alle, die die Krise verstehen – nicht nur darüber lesen wollen.',
    'Load More Stories':             'Mehr Artikel laden',
    'Load More':                     'Mehr laden',
    'All':                           'Alle',

    // ── Article / Archive ────────────────────────────────────────────────────
    'Further Reading':               'Weitere Artikel',
    'Cover Story':                   'Titelgeschichte',
    'Archive Directory':             'Archiv-Verzeichnis',
    'Must Read':                     'Pflichtlektüre',
    'Min Read':                      'Min. Lesezeit',
    'min read':                      'Min. Lesezeit',
    'Archive Insight':               'Archiv-Einblick',
    'Loading article…':              'Artikel wird geladen…',
    'Article Not Found':             'Artikel nicht gefunden',
    'This article may have been moved or is not yet published.':
      'Dieser Artikel wurde möglicherweise verschoben oder ist noch nicht veröffentlicht.',
    'Back to Archive':               'Zurück zum Archiv',

    // ── Search ───────────────────────────────────────────────────────────────
    'Search the archive...':         'Archiv durchsuchen...',
    'Filter by topic':               'Nach Thema filtern',
    'Filter Results':                'Ergebnisse filtern',
    'View More Archives':            'Mehr Archiv',
    'View more results':             'Mehr Ergebnisse',
    'Forests & Rewilding':           'Wälder & Renaturierung',
    'Environmental Science':         'Umweltwissenschaft',
    'Oceans & Marine Life':          'Ozeane & Meeresleben',

    // ── Shop ─────────────────────────────────────────────────────────────────
    'All Products':                  'Alle Produkte',
    'Tops & Tees':                   'Tops & T-Shirts',
    'Outerwear':                     'Oberbekleidung',
    'Accessories':                   'Accessoires',
    'Add to Bag':                    'In den Warenkorb',
    'Add To Bag':                    'In den Warenkorb',
    'ADD TO BAG':                    'IN DEN WARENKORB',
    'Sold Out':                      'Ausverkauft',
    'Transparent Production':        'Transparente Produktion',
    'New Arrival':                   'Neuankömmling',

    // ── Product ──────────────────────────────────────────────────────────────
    'Select Size':                   'Größe auswählen',
    'Size Guide':                    'Größentabelle',
    'Details':                       'Details',
    'Material':                      'Material',
    'Care':                          'Pflege',
    'Ships within 3–5 business days':'Lieferung in 3–5 Werktagen',

    // ── Cart ─────────────────────────────────────────────────────────────────
    'Your Cart':                     'Dein Warenkorb',
    'Your archive selection':        'Deine Archiv-Auswahl',
    'Carbon Impact':                 'CO₂-Bilanz',
    'Subtotal':                      'Zwischensumme',
    'Climate Levy':                  'Klimabeitrag',
    'Total':                         'Gesamtbetrag',
    'Checkout':                      'Zur Kasse',
    'Free shipping on orders over $100': 'Kostenloser Versand ab 100 €',
    'Edit Cart':                     'Warenkorb bearbeiten',
    'Order Summary':                 'Bestellübersicht',
    'Remove':                        'Entfernen',

    // ── Checkout ─────────────────────────────────────────────────────────────
    'Payment':                       'Zahlung',
    'Shipping':                      'Versand',
    'Card Number':                   'Kartennummer',
    'Expiry':                        'Ablaufdatum',
    'CVV':                           'Prüfnummer',
    'Name on Card':                  'Name auf der Karte',
    'Place Order':                   'Bestellung aufgeben',
    'Terms of Curation':             'Nutzungsbedingungen',

    // ── Support ──────────────────────────────────────────────────────────────
    'Support Independent Environmental Journalism':
      'Unabhängigen Umweltjournalismus unterstützen',
    'Monthly':                       'Monatlich',
    'Annual':                        'Jährlich',
    'One-time':                      'Einmalig',
    'per month':                     'pro Monat',
    'per year':                      'pro Jahr',
    'Donate':                        'Spenden',
    'Custom Amount':                 'Eigener Betrag',

    // ── Placeholders (handled separately) ────────────────────────────────────
    '__placeholder__Your email address': 'Deine E-Mail-Adresse',
    '__placeholder__Enter your email':   'E-Mail-Adresse eingeben',
    '__placeholder__Your email':         'Deine E-Mail',
    '__placeholder__Your name':          'Dein Name',
    '__placeholder__Your name (optional)': 'Name (optional)',
    '__placeholder__Card number':        'Kartennummer',
    '__placeholder__Search the archive...': 'Archiv durchsuchen...',

    // ── Support – desktop ─────────────────────────────────────────────────────
    'Institutional Support':    'Institutionelle Unterstützung',
    'Protect the record.':      'Das Archiv schützen.',
    'Power the change.':        'Den Wandel vorantreiben.',
    'The Entryway':             'Der Einstieg',
    'Seed':                     'Saat',
    'Growth Phase':             'Wachstumsphase',
    'Sapling':                  'Setzling',
    'Recommended':              'Empfohlen',
    'Legacy Support':           'Vermächtnis-Unterstützung',
    'Old-Growth':               'Urwuchs',
    '/ month':                  '/ Monat',
    'Weekly Impact Digests':    'Wöchentliche Wirkungsberichte',
    'Member Identity Badge':    'Mitglieds-Badge',
    'Quarterly Hard-Copy Journal': 'Vierteljährliches Druckmagazin',
    'Early Access to Field Data':  'Frühzeitiger Zugang zu Felddaten',
    'Voting on Archive Priority Areas': 'Mitsprache bei Archiv-Schwerpunkten',
    'Annual Impact Summit Invitations': 'Einladungen zum Jahres-Gipfeltreffen',
    'Direct Access to Lead Researchers': 'Direktzugang zu leitenden Forschern',
    'Name inscribed in the Digital Ledger': 'Namenseintrag im digitalen Ledger',
    'Select Plan':              'Plan auswählen',
    'Choose Sapling':           'Setzling wählen',
    'Select Frequency':         'Häufigkeit wählen',
    'Proceed to Payment':       'Weiter zur Zahlung',
    'Secure Encrypted Transaction via Stripe': 'Sichere verschlüsselte Transaktion über Stripe',
    'Carbon Neutral Platform':  'CO₂-neutrale Plattform',
    'Your contribution processing is powered by 100% renewable infrastructure.':
      'Deine Beitragszahlung wird durch 100 % erneuerbare Energie betrieben.',
    'Active Data points monitored': 'Aktive Datenpunkte überwacht',
    'Verified Field Researchers':   'Verifizierte Feldforscher',
    'Open access for scientists':   'Offener Zugang für Wissenschaftler',
    'Ethics Policy':            'Ethik-Richtlinien',
    'Editorial Team':           'Redaktionsteam',
    'Carbon Transparency Report': 'CO₂-Transparenzbericht',
    '© 2025 Ecodemia. Dedicated to the permanent record of our changing planet.':
      '© 2025 Ecodemia. Für das dauerhafte Archiv unseres sich verändernden Planeten.',

    // ── Support – mobile ──────────────────────────────────────────────────────
    'Supporter Engagement':     'Unterstützer-Engagement',
    'Protect the record':       'Das Archiv schützen',
    'Select Your Tier':         'Tarif auswählen',
    'Essential Support':        'Grundlegende Unterstützung',
    'Active Growth':            'Aktives Wachstum',
    'Most Vital':               'Am wichtigsten',
    'Enduring Legacy':          'Bleibendes Vermächtnis',
    'Select':                   'Auswählen',
    'Select Tier':              'Tarif wählen',
    'Every dollar strengthens the archive.': 'Jeder Beitrag stärkt das Archiv.',
    'Process Contribution':     'Beitrag einreichen',
    'Secure Encrypted Payment': 'Sicheres verschlüsseltes Payment',
    'Current Impact':           'Aktuelle Wirkung',
    'Offsets the carbon footprint of 1,000 digital readers per month.':
      'Kompensiert den CO₂-Fußabdruck von 1.000 digitalen Lesern pro Monat.',
    'Funds field reporting for one deep-dive ecological investigative piece.':
      'Finanziert die Feldrecherche für einen tiefgreifenden ökologischen Investigativbericht.',
    'Secures long-term archiving for our physical editorial prints in climate-safe vaults.':
      'Sichert die Langzeitarchivierung unserer Druckerzeugnisse in klimasicheren Tresoren.',
    'Hectares of ancient forest coverage documented and protected through investigative reporting this year.':
      'Hektar uralter Waldfläche, die durch investigativen Journalismus dokumentiert und geschützt wurden.',
    'Categories':               'Kategorien',
    'Email Address':            'E-Mail-Adresse',
    'Amount (USD)':             'Betrag (USD)',

    // ── Support placeholders ──────────────────────────────────────────────────
    '__placeholder__Other amount':  'Anderer Betrag',
    '__placeholder__Full Name':     'Vollständiger Name',
    '__placeholder__Email Address': 'E-Mail-Adresse',
  }
};

// Walk DOM text nodes and replace known English strings with translated equivalents.
// Only replaces when the trimmed text content of a node exactly matches a key.
function applyTextReplacements(lang) {
  if (lang === 'en') return;
  const map = TEXT_REPLACE[lang];
  if (!map) return;

  document.documentElement.lang = lang;

  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA']);
  function walk(node) {
    if (SKIP.has(node.nodeName)) return;
    if (node.nodeType === 3) {           // Text node
      const trimmed = node.textContent.trim();
      if (trimmed && map[trimmed] !== undefined) {
        node.textContent = node.textContent.replace(trimmed, map[trimmed]);
      }
    } else {
      node.childNodes.forEach(walk);
    }
  }
  walk(document.body);

  // Placeholders use a prefixed key to avoid collision with text nodes
  document.querySelectorAll('[placeholder]').forEach(el => {
    const key = '__placeholder__' + el.placeholder;
    if (map[key]) el.placeholder = map[key];
  });
}

function updateLangToggle(lang) {
  document.querySelectorAll('.eco-lang-toggle').forEach(wrap => {
    wrap.querySelectorAll('[data-lang]').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.className = active
        ? 'font-label text-[11px] uppercase tracking-widest font-bold text-[#1B4332]'
        : 'font-label text-[11px] uppercase tracking-widest text-[#717973] hover:text-[#1B4332] transition-colors';
    });
  });
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

function initI18n() {
  const lang = getLang();
  applyTextReplacements(lang);
}

// ─── ECO LOGO ─────────────────────────────────────────────────────────────────
function initEcoLogo() {
  if (!document.getElementById('eco-logo-style')) {
    const s = document.createElement('style');
    s.id = 'eco-logo-style';
    s.textContent = `.eco-logo{font-family:'Newsreader',serif!important;font-style:normal!important;font-weight:700!important;color:#1B4332!important;text-decoration:none!important;}`;
    document.head.appendChild(s);
  }
  const homePath = isMobile() ? page('homeMobile') : page('homeDesktop');
  document.querySelectorAll('.eco-logo').forEach(el => {
    if (el.tagName === 'A') { el.href = homePath; }
    else { el.style.cursor = 'pointer'; el.addEventListener('click', () => { window.location.href = homePath; }); }
  });
}

// ─── UNIVERSAL DESKTOP NAV ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { labelKey: 'nav.climate',  category: 'climate',  href: 'category_page/code.html?category=climate'  },
  { labelKey: 'nav.wildlife', category: 'wildlife', href: 'category_page/code.html?category=wildlife' },
  { labelKey: 'nav.energy',   category: 'energy',   href: 'category_page/code.html?category=energy'   },
  { labelKey: 'nav.living',   category: 'living',   href: 'category_page/code.html?category=living'   },
  { labelKey: 'nav.tech',     category: 'tech',     href: 'category_page/code.html?category=tech'     },
  { labelKey: 'nav.policy',   category: 'policy',   href: 'category_page/code.html?category=policy'   },
  { labelKey: 'nav.live',     category: 'live',     href: 'category_page/code.html?category=live'     },
  { labelKey: 'nav.support',  category: null,       href: 'support_the_living_archive/code.html'      },
];

function initUniversalDesktopNav() {
  if (isMobile()) return;
  const container = document.querySelector('.fixed [class*="md:flex"]');
  if (!container) return;
  const currentCat = new URLSearchParams(window.location.search).get('category') || '';
  const isSupport   = window.location.pathname.includes('support_the_living_archive');
  const lang        = getLang();
  container.className = 'hidden md:flex items-center gap-8';
  container.innerHTML = NAV_ITEMS.map(item => {
    const active = (item.category && item.category === currentCat) || (isSupport && item.labelKey === 'nav.support');
    const cls = active
      ? "font-['Newsreader'] text-lg tracking-tight text-[#1B4332] border-b-2 border-[#1B4332] transition-colors duration-300"
      : "font-['Newsreader'] text-lg tracking-tight text-[#717973] hover:text-[#1B4332] transition-colors duration-300";
    return `<a class="${cls}" href="${relPath(item.href)}">${t(item.labelKey)}</a>`;
  }).join('');

  // Inject language toggle after Subscribe button area
  const rightSide = document.querySelector('.fixed .flex.items-center.gap-5, .fixed .flex.items-center.gap-6');
  if (rightSide && !rightSide.querySelector('.eco-lang-toggle')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-1.5 ml-2 pl-3 border-l border-[#c1c8c2]/30';
    wrapper.innerHTML = buildLangToggleHTML(lang);
    rightSide.appendChild(wrapper);
  }

  // Translate Subscribe button
  document.querySelectorAll('.subscribe-btn').forEach(btn => { btn.textContent = t('nav.subscribe'); });
}

// ─── NAVIGATION WIRING ────────────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    const key = el.dataset.nav;
    if (PAGES[key]) el.href = page(key);
  });
  document.querySelectorAll('[data-nav-home]').forEach(el => {
    el.href = isMobile() ? page('homeMobile') : page('homeDesktop');
  });
  document.querySelectorAll('.search-trigger').forEach(el => {
    el.addEventListener('click', () => {
      window.location.href = isMobile() ? page('searchMobile') : page('searchDesktop');
    });
  });
  document.querySelectorAll('.cart-trigger').forEach(el => {
    el.addEventListener('click', () => { window.location.href = page('cart'); });
  });
}

// ─── CART ─────────────────────────────────────────────────────────────────────
const CART_KEY = 'ecodemia_cart';
function getCart()      { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadges(); }

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if (existing) { existing.qty++; } else { cart.push({ ...item, qty: 1 }); }
  saveCart(cart);
  showToast(t('cart.added'));
}

function updateCartBadges() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white font-label text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-xl z-[999] transition-opacity';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 2000);
}

// ─── ADD-TO-BAG ───────────────────────────────────────────────────────────────
function initAddToBag() {
  document.querySelectorAll('.add-to-bag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name  || 'Archival Item';
      const price = btn.dataset.price || '0';
      const id    = btn.dataset.id    || name.toLowerCase().replace(/\s+/g, '-');
      const size  = document.querySelector('.size-btn.selected')?.dataset.size || 'M';
      addToCart({ id, name, price: parseFloat(price), size });
    });
  });
}

// ─── SIZE SELECTOR ────────────────────────────────────────────────────────────
function initSizeSelector() {
  document.querySelectorAll('.size-group').forEach(group => {
    group.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.size-btn').forEach(b => {
          b.classList.remove('selected','bg-primary-container','text-on-primary','border-primary-container','bg-primary','text-white');
          b.classList.add('border-outline-variant');
        });
        btn.classList.add('selected','bg-primary-container','text-on-primary','border-primary-container');
        btn.classList.remove('border-outline-variant');
      });
    });
  });
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (q) {
    document.querySelectorAll('.search-input').forEach(el => { el.value = q; });
    document.querySelectorAll('.search-query-display').forEach(el => { el.textContent = q; });
  }
  document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value.trim()) {
        const dest = isMobile() ? page('searchMobile') : page('searchDesktop');
        window.location.href = dest + '?q=' + encodeURIComponent(input.value.trim());
      }
    });
    const inp = form.querySelector('input');
    inp?.addEventListener('keydown', e => { if (e.key === 'Enter') form.dispatchEvent(new Event('submit')); });
  });
  document.querySelectorAll('.topic-filter').forEach(cb => cb.addEventListener('change', filterSearchResults));
  filterSearchResults();
}

function filterSearchResults() {
  const checked = [...document.querySelectorAll('.topic-filter:checked')].map(c => c.value.toLowerCase());
  document.querySelectorAll('.search-result').forEach(result => {
    const topic = (result.dataset.topic || '').toLowerCase();
    result.style.display = (!checked.length || checked.includes(topic)) ? '' : 'none';
  });
}

// ─── MOBILE MENU DRAWER ───────────────────────────────────────────────────────
function initMobileMenu() {
  if (!document.getElementById('eco-drawer')) {
    const lang = getLang();
    const drawer = document.createElement('div');
    drawer.id = 'eco-drawer';
    drawer.className = 'fixed inset-y-0 left-0 w-72 bg-[#f9faf6] z-[200] transform -translate-x-full transition-transform duration-300 shadow-2xl flex flex-col';
    drawer.innerHTML = `
      <div class="flex items-center justify-between px-6 h-16 border-b border-[#c1c8c2]/20">
        <span class="eco-logo text-xl">Ecodemia</span>
        <button id="eco-drawer-close" class="text-[#717973]"><span class="material-symbols-outlined">close</span></button>
      </div>
      <nav class="flex flex-col p-6 gap-5 flex-1">
        <a href="${page('homeMobile')}"              class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.home')}</a>
        <a href="${page('categoryMobile')}?category=climate"  class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.climate')}</a>
        <a href="${page('categoryMobile')}?category=wildlife" class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.wildlife')}</a>
        <a href="${page('categoryMobile')}?category=energy"   class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.energy')}</a>
        <a href="${page('categoryMobile')}?category=living"   class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.living')}</a>
        <a href="${page('categoryMobile')}?category=tech"     class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4336] transition-colors">${t('nav.tech')}</a>
        <a href="${page('categoryMobile')}?category=policy"   class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.policy')}</a>
        <a href="${page('categoryMobile')}?category=live"     class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.live')}</a>
        <a href="${page('searchMobile')}"            class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.search')}</a>
        <a href="${page('merchMobile')}"             class="font-label text-sm uppercase tracking-widest text-[#1a1c1a] hover:text-[#1B4332] transition-colors">${t('nav.shop')}</a>
        <a href="${page('supportMobile')}"           class="font-label text-xs font-bold uppercase tracking-widest text-[#1B4332] border border-[#1B4332] rounded-full px-4 py-2 text-center hover:bg-[#1B4332] hover:text-white transition-colors mt-2">${t('nav.support')}</a>
      </nav>
      <div class="p-6 border-t border-[#c1c8c2]/20 flex items-center justify-between">
        <p class="font-body text-xs text-[#717973]">© 2025 Ecodemia</p>
        ${buildLangToggleHTML(lang)}
      </div>
    `;
    document.body.appendChild(drawer);

    const overlay = document.createElement('div');
    overlay.id = 'eco-overlay';
    overlay.className = 'fixed inset-0 bg-black/30 z-[199] hidden';
    document.body.appendChild(overlay);

    const open  = () => { drawer.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); };
    const close = () => { drawer.classList.add('-translate-x-full');    overlay.classList.add('hidden'); };

    document.querySelectorAll('.menu-trigger').forEach(btn => btn.addEventListener('click', open));
    document.getElementById('eco-drawer-close').addEventListener('click', close);
    overlay.addEventListener('click', close);
  }
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
function initNewsletters() {
  function handleSubmit(input, container) {
    if (!input) return;
    if (/\S+@\S+\.\S+/.test(input.value.trim())) {
      input.value = '';
      const msg = document.createElement('p');
      msg.className = 'text-primary font-label text-xs uppercase tracking-widest mt-2 transition-opacity';
      msg.textContent = t('newsletter.success');
      container.appendChild(msg);
      setTimeout(() => { msg.style.opacity = '0'; setTimeout(() => msg.remove(), 400); }, 3000);
    } else {
      input.focus(); input.classList.add('border-error');
      setTimeout(() => input.classList.remove('border-error'), 1500);
    }
  }
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => { e.preventDefault(); handleSubmit(form.querySelector('input[type="email"]'), form); });
  });
  document.querySelectorAll('.newsletter-submit').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('div') || btn.parentElement;
      handleSubmit(wrap?.querySelector('input[type="email"]'), wrap?.parentElement || wrap);
    });
  });
  document.querySelectorAll('.subscribe-btn').forEach(btn => {
    btn.addEventListener('click', showSubscribeModal);
  });
}

function showSubscribeModal() {
  if (document.getElementById('subscribe-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'subscribe-modal';
  modal.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-6';
  modal.innerHTML = `
    <div class="bg-[#f9faf6] rounded-xl p-8 w-full max-w-md shadow-2xl">
      <h3 class="font-headline text-3xl text-primary mb-2">${t('subscribe.title')}</h3>
      <p class="text-on-surface-variant text-sm mb-6">${t('subscribe.desc')}</p>
      <form id="subscribe-modal-form" class="flex flex-col gap-4">
        <input type="email" placeholder="${t('subscribe.placeholder')}" class="w-full bg-transparent border-b-2 border-outline/40 focus:border-primary focus:ring-0 font-body py-3 outline-none transition-colors" required/>
        <button type="submit" class="bg-primary text-white px-8 py-3 rounded-full font-label text-sm font-bold tracking-widest hover:opacity-90 transition-opacity">${t('subscribe.cta')}</button>
      </form>
      <button id="subscribe-modal-close" class="mt-4 w-full text-outline font-label text-xs uppercase tracking-widest">${t('subscribe.dismiss')}</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('subscribe-modal-close').addEventListener('click', () => modal.remove());
  document.getElementById('subscribe-modal-form').addEventListener('submit', e => {
    e.preventDefault();
    modal.querySelector('div').innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-outlined text-primary text-5xl mb-4 block" style="font-variation-settings:'FILL' 1;">check_circle</span>
        <h3 class="font-headline text-2xl text-primary mb-2">${t('subscribe.success.title')}</h3>
        <p class="text-on-surface-variant">${t('subscribe.success.body')}</p>
      </div>
    `;
    setTimeout(() => modal.remove(), 2000);
  });
}

// ─── CATEGORY FILTER ──────────────────────────────────────────────────────────
function initCategoryFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = (btn.dataset.category || 'all').toLowerCase();
      document.querySelectorAll('.filter-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('bg-primary', active);
        b.classList.toggle('text-on-primary', active);
        b.classList.toggle('bg-surface-container-low', !active);
        b.classList.toggle('text-on-surface-variant', !active);
        b.classList.toggle('bg-primary-container', false);
      });
      document.querySelectorAll('[data-category]').forEach(card => {
        card.style.display = (category === 'all' || (card.dataset.category || '').toLowerCase() === category) ? '' : 'none';
      });
    });
  });
}

// ─── LOAD MORE ────────────────────────────────────────────────────────────────
function initLoadMore() {
  const btn = document.querySelector('.load-more-btn');
  if (!btn) return;
  document.querySelectorAll('.article-hidden').forEach(el => el.classList.add('hidden'));
  btn.addEventListener('click', () => {
    document.querySelectorAll('.article-hidden').forEach(el => el.classList.remove('hidden', 'article-hidden'));
    btn.style.display = 'none';
  });
}

// ─── HERO CAROUSEL ────────────────────────────────────────────────────────────
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let current = 0;
  const show = n => slides.forEach((s, i) => s.classList.toggle('hidden', i !== n));
  show(0);
  document.querySelector('.carousel-prev')?.addEventListener('click', () => { current = (current - 1 + slides.length) % slides.length; show(current); });
  document.querySelector('.carousel-next')?.addEventListener('click', () => { current = (current + 1) % slides.length; show(current); });
  setInterval(() => { current = (current + 1) % slides.length; show(current); }, 5000);
}

// ─── DONATION / SUPPORT ───────────────────────────────────────────────────────
function initDonationTiers() {
  document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input  = document.querySelector('#custom-amount, .donation-amount-input');
      if (input && amount) input.value = amount;
      document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('ring-2','ring-primary'));
      btn.closest('.tier-card')?.classList.add('ring-2','ring-primary');
    });
  });
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount || btn.textContent.replace('$','').trim();
      const input  = document.querySelector('#custom-amount, .donation-amount-input');
      if (input) input.value = amount;
      document.querySelectorAll('.amount-btn').forEach(b => { b.classList.remove('bg-primary','text-white'); b.classList.add('bg-surface-container-low'); });
      btn.classList.add('bg-primary','text-white');
      btn.classList.remove('bg-surface-container-low');
    });
  });
  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.freq-btn').forEach(b => {
        b.classList.toggle('bg-primary-container', b === btn);
        b.classList.toggle('text-white',            b === btn);
        b.classList.toggle('border-outline',        b !== btn);
        b.classList.toggle('text-on-surface-variant', b !== btn);
      });
    });
  });
  document.querySelectorAll('.support-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('input[placeholder*="Name"], input[type="text"]')?.value;
      const email= form.querySelector('input[type="email"]')?.value;
      if (email && /\S+@\S+\.\S+/.test(email)) {
        form.innerHTML = `
          <div class="text-center py-10">
            <span class="material-symbols-outlined text-primary text-5xl mb-4 block" style="font-variation-settings:'FILL' 1;">check_circle</span>
            <h3 class="font-headline text-2xl text-primary mb-2">${t('support.thanks')}${name ? ', ' + name : ''}!</h3>
            <p class="text-on-surface-variant">${t('support.thanks.body')}</p>
          </div>`;
      }
    });
  });
  document.querySelectorAll('.tier-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input  = document.querySelector('#custom-amount, .donation-amount-input');
      if (input && amount) { input.value = amount; input.scrollIntoView({ behavior:'smooth', block:'center' }); input.focus(); }
    });
  });
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function initCartPage() {
  document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.closest('.qty-group')?.querySelector('.qty-display');
      if (d) d.textContent = String(parseInt(d.textContent) + 1).padStart(2,'0');
      recalcCart();
    });
  });
  document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.closest('.qty-group')?.querySelector('.qty-display');
      if (d) d.textContent = String(Math.max(1, parseInt(d.textContent) - 1)).padStart(2,'0');
      recalcCart();
    });
  });
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => { btn.closest('.cart-item')?.remove(); recalcCart(); });
  });
  document.querySelector('.checkout-btn')?.addEventListener('click', () => { window.location.href = page('checkout'); });
}

function recalcCart() {
  let sub = 0;
  document.querySelectorAll('.cart-item').forEach(item => {
    const qty = parseInt(item.querySelector('.qty-display')?.textContent || '1');
    const prc = parseFloat(item.querySelector('.item-price')?.dataset.price || '0');
    sub += qty * prc;
    const el = item.querySelector('.item-price');
    if (el) el.textContent = '$' + (qty * prc).toFixed(2);
  });
  const levy = sub * 0.03;
  const sub_ = document.querySelector('.cart-subtotal');
  const lev_ = document.querySelector('.cart-levy');
  const tot_ = document.querySelector('.cart-total');
  if (sub_) sub_.textContent = '$' + sub.toFixed(2);
  if (lev_) lev_.textContent = '$' + levy.toFixed(2);
  if (tot_) tot_.textContent = '$' + (sub + levy).toFixed(2);
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
function initCheckoutPage() {
  const form = document.querySelector('.checkout-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 pt-24">
          <span class="material-symbols-outlined text-primary text-6xl mb-6 block" style="font-variation-settings:'FILL' 1;">check_circle</span>
          <h2 class="font-headline text-3xl text-primary mb-4">${t('checkout.success.title')}</h2>
          <p class="text-on-surface-variant mb-8">${t('checkout.success.body')}</p>
          <a class="bg-primary text-white px-8 py-3 rounded-full font-label text-xs uppercase tracking-widest" href="${page('homeMobile')}">${t('checkout.return')}</a>
        </div>`;
    }
    localStorage.removeItem(CART_KEY);
    updateCartBadges();
  });
}

// ─── ARTICLE LINKS ────────────────────────────────────────────────────────────
function initArticleLinks() {
  document.querySelectorAll('.article-link').forEach(el => {
    if (!el.href || el.href.endsWith('#')) el.href = isMobile() ? page('articleMobile') : page('articleDesktop');
  });
  document.querySelectorAll('.product-link').forEach(el => {
    if (!el.href || el.href.endsWith('#')) el.href = isMobile() ? page('productMobile') : page('productDesktop');
  });
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
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    });
  });
}

// ─── CATEGORY PAGE ────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  climate: {
    en: { title: 'Climate: Tracking a Warming World.',       stat: '421.5', statLabel: 'CO₂ Parts Per Million — the highest annual average ever recorded.',                         coverTitle: 'The Silent Thaw: Arctic Permafrost at the Point of No Return',              coverExcerpt: 'New satellite data reveals the permafrost retreat is accelerating faster than even the most aggressive climate models predicted.',            coverAuthor: 'Julian Thorne',       coverRole: 'Environmental Lead',         coverDate: 'March 14, 2024',  coverTime: '14 Min Read' },
    de: { title: 'Klima: Eine Welt im Wandel.',               stat: '421,5', statLabel: 'CO₂ Parts per Million – der höchste je gemessene Jahresdurchschnitt.',                      coverTitle: 'Das Stille Tauen: Arktischer Permafrost am Kipppunkt',                      coverExcerpt: 'Neue Satellitendaten zeigen, dass der Rückzug des Permafrosts schneller voranschreitet als die aggressivsten Klimamodelle vorhergesagt haben.', coverAuthor: 'Julian Thorne',       coverRole: 'Umweltkorrespondent',        coverDate: '14. März 2024',   coverTime: '14 Min. Lesezeit' },
  },
  wildlife: {
    en: { title: 'Wildlife: Stories of the Wild.',           stat: '1.2M',  statLabel: 'Acres of Protected Wildlife Corridor Established in 2023.',                                coverTitle: "The Invisible Monarch: Tracking the Snow Leopard's Alpine Migration",        coverExcerpt: "In the thinning air of the high Himalayas, new GPS data reveals the extraordinary resilience and shifting ranges of Earth's most elusive feline predator.", coverAuthor: 'Dr. Elena Vos',       coverRole: 'Chief Conservation Officer', coverDate: 'March 14, 2024',  coverTime: '12 Min Read' },
    de: { title: 'Tierwelt: Geschichten der Wildnis.',       stat: '1,2 Mio.', statLabel: 'Hektar geschützter Wildtierkorridor, etabliert 2023.',                                  coverTitle: 'Der Unsichtbare Monarch: Den Schneeleoparden auf der Alpenwanderschaft folgen', coverExcerpt: 'In der dünnen Luft des Himalajas zeigen neue GPS-Daten die außergewöhnliche Widerstandsfähigkeit des flüchtigsten Feliden der Erde.',       coverAuthor: 'Dr. Elena Vos',       coverRole: 'Leiterin Naturschutz',       coverDate: '14. März 2024',   coverTime: '12 Min. Lesezeit' },
  },
  energy: {
    en: { title: 'Energy: The Transition Now.',              stat: '48%',   statLabel: 'Of global electricity will come from renewables by 2030, per IEA projections.',             coverTitle: 'Grid of the Future: How Battery Storage is Reshaping Energy Policy',         coverExcerpt: 'As renewable capacity soars, the race to store that power is becoming the defining infrastructure challenge of our era.',                    coverAuthor: 'Amara Soto',          coverRole: 'Energy Correspondent',       coverDate: 'Feb 28, 2024',    coverTime: '10 Min Read' },
    de: { title: 'Energie: Die Wende jetzt.',                stat: '48 %',  statLabel: 'Des weltweiten Stroms werden laut IEA-Prognosen bis 2030 aus erneuerbaren Quellen stammen.', coverTitle: 'Das Netz der Zukunft: Wie Batteriespeicher die Energiepolitik umformen',     coverExcerpt: 'Da die erneuerbare Kapazität rasant steigt, wird der Wettlauf um die Speicherung dieser Energie zur entscheidenden Infrastrukturaufgabe.',   coverAuthor: 'Amara Soto',          coverRole: 'Energiekorrespondentin',     coverDate: '28. Feb. 2024',   coverTime: '10 Min. Lesezeit' },
  },
  living: {
    en: { title: 'Living: Sustainable Futures.',             stat: '40%',   statLabel: 'Of global emissions come from the built environment — homes, offices, and cities.',          coverTitle: 'The Carbon Kitchen: How What We Eat is Reshaping the Planet',               coverExcerpt: "Dietary shifts, food waste, and regenerative agriculture are emerging as the most powerful tools in the consumer's climate toolkit.",          coverAuthor: 'Lena Bauer',          coverRole: 'Lifestyle & Sustainability', coverDate: 'March 1, 2024',   coverTime: '9 Min Read'  },
    de: { title: 'Leben: Nachhaltige Zukunft.',              stat: '40 %',  statLabel: 'Der globalen Emissionen stammen aus der bebauten Umwelt – Häuser, Büros und Städte.',         coverTitle: 'Die Kohlenstoff-Küche: Wie unsere Ernährung den Planeten verändert',         coverExcerpt: 'Ernährungsumstellungen, Lebensmittelverschwendung und regenerative Landwirtschaft werden zu den wirksamsten Instrumenten im Verbraucher-Klimakoffer.', coverAuthor: 'Lena Bauer', coverRole: 'Redakteurin Nachhaltigkeit', coverDate: '1. März 2024',    coverTime: '9 Min. Lesezeit'  },
  },
  tech: {
    en: { title: 'Tech: Innovation for the Planet.',         stat: '2.3B',  statLabel: 'Dollars invested in climate technology startups in Q1 2024 alone.',                         coverTitle: 'The Soil Algorithm: How AI is Revolutionising Carbon Farming',              coverExcerpt: 'Machine learning meets microbiology as a new wave of startups promises to turn agricultural land into verifiable carbon sinks.',              coverAuthor: 'Kai Nakamura',        coverRole: 'Technology Editor',          coverDate: 'March 10, 2024',  coverTime: '11 Min Read' },
    de: { title: 'Technologie: Innovation für den Planeten.',stat: '2,3 Mrd.', statLabel: 'Dollar in Klimatechnologie-Startups investiert – allein im ersten Quartal 2024.',         coverTitle: 'Der Boden-Algorithmus: Wie KI die CO₂-Landwirtschaft revolutioniert',       coverExcerpt: 'Maschinelles Lernen trifft auf Mikrobiologie: Eine neue Welle von Startups verspricht, Agrarland in verifizierbare Kohlenstoffsenken zu verwandeln.', coverAuthor: 'Kai Nakamura', coverRole: 'Technologie-Redakteur',      coverDate: '10. März 2024',   coverTime: '11 Min. Lesezeit' },
  },
  policy: {
    en: { title: 'Policy: Laws of the Land.',                stat: '197',   statLabel: 'Countries party to the Paris Agreement — yet fewer than 20 are on track to meet their targets.', coverTitle: 'COP29 Debrief: What the Pledges Actually Mean',                   coverExcerpt: 'A forensic look at which national commitments carry legal weight and which remain aspirational targets divorced from enforcement.',            coverAuthor: 'Elena Thorne',        coverRole: 'Policy Correspondent',       coverDate: 'Dec 5, 2023',     coverTime: '13 Min Read' },
    de: { title: 'Politik: Gesetze der Erde.',               stat: '197',   statLabel: 'Länder im Pariser Abkommen – doch weniger als 20 sind auf Kurs, ihre Ziele zu erreichen.',    coverTitle: 'COP29-Nachbericht: Was die Versprechen wirklich bedeuten',                  coverExcerpt: 'Eine forensische Analyse darüber, welche nationalen Zusagen Rechtskraft haben und welche Wunschvorstellungen ohne Durchsetzungsmechanismus bleiben.', coverAuthor: 'Elena Thorne', coverRole: 'Politikkorrespondentin',     coverDate: '5. Dez. 2023',    coverTime: '13 Min. Lesezeit' },
  },
  live: {
    en: { title: 'Live Updates.',                            stat: '24/7',  statLabel: 'Coverage from our global network of field correspondents and data monitors.',                coverTitle: 'Breaking: Record Coral Bleaching Event Declared Across Great Barrier Reef',  coverExcerpt: 'Scientists confirm the fourth mass bleaching event in seven years as ocean temperatures hit unprecedented highs off the Queensland coast.',  coverAuthor: 'Ecodemia Field Desk', coverRole: 'Live Reporting',             coverDate: 'Today',           coverTime: 'Just Now'    },
    de: { title: 'Aktuell.',                                 stat: '24/7',  statLabel: 'Berichterstattung aus unserem globalen Netz von Feldkorrespondenten und Datenmonitoren.',     coverTitle: 'Eilmeldung: Rekordbrechendes Korallenbleichen am Great Barrier Reef',        coverExcerpt: 'Wissenschaftler bestätigen das vierte Massenbleichereignis in sieben Jahren, während die Meerestemperaturen vor der Küste Queenslands Rekordwerte erreichen.', coverAuthor: 'Ecodemia Feldredaktion', coverRole: 'Livebericht',            coverDate: 'Heute',           coverTime: 'Gerade eben'  },
  },
};

function initCategoryPage() {
  if (!document.querySelector('.category-title')) return;
  const cat  = new URLSearchParams(window.location.search).get('category') || 'wildlife';
  const lang = getLang();
  const base = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.wildlife;
  const cfg  = base[lang] || base.en;
  const set  = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.category-title',         cfg.title);
  set('.category-cover-title',   cfg.coverTitle);
  set('.category-cover-excerpt', cfg.coverExcerpt);
  set('.category-cover-author',  cfg.coverAuthor);
  set('.category-cover-role',    cfg.coverRole);
  set('.category-cover-date',    cfg.coverDate);
  set('.category-cover-time',    cfg.coverTime);
  set('.category-stat',          cfg.stat);
  set('.category-stat-label',    cfg.statLabel);
  document.title = cfg.title.split(':')[0] + ' | Ecodemia';
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initI18n();                  // apply text replacements first (before other inits)
  initEcoLogo();
  initUniversalDesktopNav();   // injects lang toggle + translated nav
  initMobileMenu();            // injects translated drawer + lang toggle
  initNavigation();
  updateCartBadges();
  initAddToBag();
  initSizeSelector();
  initSearch();
  initNewsletters();
  initCategoryFilter();
  initLoadMore();
  initHeroCarousel();
  initDonationTiers();
  initCartPage();
  initCheckoutPage();
  initArticleLinks();
  initPolicyModals();
  initCategoryPage();
});
