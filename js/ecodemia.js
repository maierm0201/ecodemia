// ecodemia.js — Shared site functionality

// ─── PATH HELPERS ─────────────────────────────────────────────────────────────
// Every HTML page sits exactly one folder deep (subfolder/code.html),
// so one '../' always reaches the site root — works for file:// and GitHub Pages.
function relPath(target) {
  return '../' + target;
}

// Page shortcuts
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
};

function isMobile() { return window.innerWidth < 768; }
function page(key) { return relPath(PAGES[key]); }

// ─── ECO LOGO ─────────────────────────────────────────────────────────────────
function initEcoLogo() {
  // Ensure bold italic Newsreader is loaded
  if (!document.querySelector('link[href*="Newsreader"][href*="1,700"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700&display=swap';
    document.head.insertBefore(link, document.head.firstChild);
  }
  // Inject .eco-logo CSS
  if (!document.getElementById('eco-logo-style')) {
    const s = document.createElement('style');
    s.id = 'eco-logo-style';
    s.textContent = `.eco-logo{font-family:'Newsreader',serif!important;font-style:normal!important;font-weight:700!important;color:#1B4332!important;text-decoration:none!important;}`;
    document.head.appendChild(s);
  }
  // Wire all .eco-logo elements to link to homepage
  const homePath = isMobile() ? page('homeMobile') : page('homeDesktop');
  document.querySelectorAll('.eco-logo').forEach(el => {
    if (el.tagName === 'A') {
      el.href = homePath;
    } else {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => { window.location.href = homePath; });
    }
  });
}

// ─── UNIVERSAL DESKTOP NAV ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Climate',      category: 'climate',  href: 'category_page/code.html?category=climate'  },
  { label: 'Wildlife',     category: 'wildlife', href: 'category_page/code.html?category=wildlife' },
  { label: 'Energy',       category: 'energy',   href: 'category_page/code.html?category=energy'   },
  { label: 'Living',       category: 'living',   href: 'category_page/code.html?category=living'   },
  { label: 'Tech',         category: 'tech',     href: 'category_page/code.html?category=tech'     },
  { label: 'Policy',       category: 'policy',   href: 'category_page/code.html?category=policy'   },
  { label: 'Live Updates', category: 'live',     href: 'category_page/code.html?category=live'     },
  { label: 'Support Us',   category: null,       href: 'support_the_living_archive/code.html'      },
];

function initUniversalDesktopNav() {
  if (isMobile()) return;
  // Find the nav links container — works across all desktop nav structures
  const container = document.querySelector('.fixed [class*="md:flex"]');
  if (!container) return;
  const currentCat = new URLSearchParams(window.location.search).get('category') || '';
  const isSupport   = window.location.pathname.includes('support_the_living_archive');
  container.className = 'hidden md:flex items-center gap-8';
  container.innerHTML = NAV_ITEMS.map(item => {
    const active = (item.category && item.category === currentCat) || (isSupport && item.label === 'Support Us');
    const cls = active
      ? "font-['Newsreader'] text-lg tracking-tight text-[#1B4332] border-b-2 border-[#1B4332] transition-colors duration-300"
      : "font-['Newsreader'] text-lg tracking-tight text-[#717973] hover:text-[#1B4332] transition-colors duration-300";
    return `<a class="${cls}" href="${relPath(item.href)}">${item.label}</a>`;
  }).join('');
}

// ─── NAVIGATION WIRING ────────────────────────────────────────────────────────
function initNavigation() {
  // Desktop top-nav links by data-nav attribute
  document.querySelectorAll('[data-nav]').forEach(el => {
    const key = el.dataset.nav;
    if (PAGES[key]) el.href = page(key);
  });

  // Mobile bottom-nav: wire by data-nav too
  // Logo / brand links
  document.querySelectorAll('[data-nav-home]').forEach(el => {
    el.href = isMobile() ? page('homeMobile') : page('homeDesktop');
  });

  // Search triggers (icon buttons without a form)
  document.querySelectorAll('.search-trigger').forEach(el => {
    el.addEventListener('click', () => {
      window.location.href = isMobile() ? page('searchMobile') : page('searchDesktop');
    });
  });

  // Shopping bag icon → cart
  document.querySelectorAll('.cart-trigger').forEach(el => {
    el.addEventListener('click', () => {
      window.location.href = page('cart');
    });
  });
}

// ─── CART ─────────────────────────────────────────────────────────────────────
const CART_KEY = 'ecodemia_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadges();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if (existing) { existing.qty++; } else { cart.push({ ...item, qty: 1 }); }
  saveCart(cart);
  showToast('Added to your archive selection');
}

function updateCartBadges() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white font-label text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-xl z-[999] transition-opacity';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2000);
}

// ─── ADD-TO-BAG BUTTONS ───────────────────────────────────────────────────────
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
          b.classList.remove('selected', 'bg-primary-container', 'text-on-primary', 'border-primary-container', 'bg-primary', 'text-white', 'text-on-primary');
          b.classList.add('border-outline-variant');
        });
        btn.classList.add('selected', 'bg-primary-container', 'text-on-primary', 'border-primary-container');
        btn.classList.remove('border-outline-variant');
      });
    });
  });
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  // Populate all search input fields with URL param
  if (q) {
    document.querySelectorAll('.search-input').forEach(el => { el.value = q; });
    document.querySelectorAll('.search-query-display').forEach(el => { el.textContent = q; });
  }

  // Desktop search form (search bar in header)
  document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value.trim()) {
        const dest = isMobile() ? page('searchMobile') : page('searchDesktop');
        window.location.href = dest + '?q=' + encodeURIComponent(input.value.trim());
      }
    });
    // Also trigger on Enter in input
    const inp = form.querySelector('input');
    inp?.addEventListener('keydown', e => {
      if (e.key === 'Enter') form.dispatchEvent(new Event('submit'));
    });
  });

  // Search filter checkboxes on search results page
  document.querySelectorAll('.topic-filter').forEach(cb => {
    cb.addEventListener('change', filterSearchResults);
  });
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
  // Inject drawer if not already present
  if (!document.getElementById('eco-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'eco-drawer';
    drawer.className = 'fixed inset-y-0 left-0 w-72 bg-[#f9faf6] z-[200] transform -translate-x-full transition-transform duration-300 shadow-2xl flex flex-col';
    drawer.innerHTML = `
      <div class="flex items-center justify-between px-6 h-16 border-b border-outline-variant/20">
        <span class="font-['Newsreader'] font-bold text-xl text-[#1B4332]">Ecodemia</span>
        <button id="eco-drawer-close" class="text-outline"><span class="material-symbols-outlined">close</span></button>
      </div>
      <nav class="flex flex-col p-6 gap-5 flex-1">
        <a href="${page('homeMobile')}" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Home</a>
        <a href="${page('categoryMobile')}?category=climate" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Climate</a>
        <a href="${page('categoryMobile')}?category=wildlife" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Wildlife</a>
        <a href="${page('categoryMobile')}?category=energy" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Energy</a>
        <a href="${page('categoryMobile')}?category=living" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Living</a>
        <a href="${page('categoryMobile')}?category=tech" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Tech</a>
        <a href="${page('categoryMobile')}?category=policy" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Policy</a>
        <a href="${page('categoryMobile')}?category=live" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Live Updates</a>
        <a href="${page('searchMobile')}" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Search</a>
        <a href="${page('merchMobile')}" class="font-label text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Shop</a>
        <a href="${page('supportMobile')}" class="font-label text-xs font-bold uppercase tracking-widest text-primary border border-primary rounded-full px-4 py-2 text-center hover:bg-primary hover:text-white transition-colors mt-2">Support Us</a>
      </nav>
      <div class="p-6 border-t border-outline-variant/20">
        <p class="font-body text-xs text-outline">© 2025 Ecodemia</p>
      </div>
    `;
    document.body.appendChild(drawer);

    const overlay = document.createElement('div');
    overlay.id = 'eco-overlay';
    overlay.className = 'fixed inset-0 bg-black/30 z-[199] hidden';
    document.body.appendChild(overlay);

    function openDrawer()  { drawer.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); }
    function closeDrawer() { drawer.classList.add('-translate-x-full');    overlay.classList.add('hidden'); }

    document.querySelectorAll('.menu-trigger').forEach(btn => btn.addEventListener('click', openDrawer));
    document.getElementById('eco-drawer-close').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
  }
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────
function initNewsletters() {
  function handleSubmit(input, container) {
    if (!input) return;
    const val = input.value.trim();
    if (/\S+@\S+\.\S+/.test(val)) {
      input.value = '';
      const msg = document.createElement('p');
      msg.className = 'text-primary font-label text-xs uppercase tracking-widest mt-2 transition-opacity';
      msg.textContent = "You're in! Welcome to Ecodemia.";
      container.appendChild(msg);
      setTimeout(() => { msg.style.opacity = '0'; setTimeout(() => msg.remove(), 400); }, 3000);
    } else {
      input.focus();
      input.classList.add('border-error');
      setTimeout(() => input.classList.remove('border-error'), 1500);
    }
  }

  // Standalone newsletter forms
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      handleSubmit(form.querySelector('input[type="email"]'), form);
    });
  });

  // Inline arrow-button email inputs
  document.querySelectorAll('.newsletter-submit').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('div') || btn.parentElement;
      const input = wrap?.querySelector('input[type="email"]');
      handleSubmit(input, wrap?.parentElement || wrap);
    });
  });

  // Subscribe buttons that open a simple modal
  document.querySelectorAll('.subscribe-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showSubscribeModal();
    });
  });
}

function showSubscribeModal() {
  if (document.getElementById('subscribe-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'subscribe-modal';
  modal.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-6';
  modal.innerHTML = `
    <div class="bg-[#f9faf6] rounded-xl p-8 w-full max-w-md shadow-2xl">
      <h3 class="font-headline text-3xl text-primary mb-2">Join Ecodemia</h3>
      <p class="text-on-surface-variant text-sm mb-6">Weekly dispatches on the state of our planet. No fluff.</p>
      <form id="subscribe-modal-form" class="flex flex-col gap-4">
        <input type="email" placeholder="Your email address" class="w-full bg-transparent border-b-2 border-outline/40 focus:border-primary focus:ring-0 font-body py-3 outline-none transition-colors" required/>
        <button type="submit" class="bg-primary text-white px-8 py-3 rounded-full font-label text-sm font-bold tracking-widest hover:opacity-90 transition-opacity">Join Now</button>
      </form>
      <button id="subscribe-modal-close" class="mt-4 w-full text-outline font-label text-xs uppercase tracking-widest">Not now</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('subscribe-modal-close').addEventListener('click', () => modal.remove());
  document.getElementById('subscribe-modal-form').addEventListener('submit', e => {
    e.preventDefault();
    modal.querySelector('div').innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-outlined text-primary text-5xl mb-4 block" style="font-variation-settings:'FILL' 1;">check_circle</span>
        <h3 class="font-headline text-2xl text-primary mb-2">You're in!</h3>
        <p class="text-on-surface-variant">Welcome to Ecodemia's dispatch.</p>
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

      // Update button active states
      document.querySelectorAll('.filter-btn').forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('bg-primary',         isActive);
        b.classList.toggle('text-on-primary',    isActive);
        b.classList.toggle('bg-surface-container-low', !isActive);
        b.classList.toggle('text-on-surface-variant',  !isActive);
        b.classList.toggle('bg-primary-container', false);
      });

      // Show/hide cards
      document.querySelectorAll('[data-category]').forEach(card => {
        const match = category === 'all' || (card.dataset.category || '').toLowerCase() === category;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ─── LOAD MORE ────────────────────────────────────────────────────────────────
function initLoadMore() {
  const btn = document.querySelector('.load-more-btn');
  if (!btn) return;
  document.querySelectorAll('.article-hidden').forEach(el => {
    el.classList.add('hidden');
  });
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
  // Tier select buttons
  document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input = document.querySelector('#custom-amount, .donation-amount-input');
      if (input && amount) input.value = amount;
      document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('ring-2', 'ring-primary'));
      btn.closest('.tier-card')?.classList.add('ring-2', 'ring-primary');
    });
  });

  // Quick-amount buttons
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount || btn.textContent.replace('$', '').trim();
      const input = document.querySelector('#custom-amount, .donation-amount-input');
      if (input) input.value = amount;
      document.querySelectorAll('.amount-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('bg-surface-container-low');
      });
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('bg-surface-container-low');
    });
  });

  // Frequency toggle
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

  // Support / donation form submission
  document.querySelectorAll('.support-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name  = form.querySelector('input[placeholder*="Name"], input[type="text"]')?.value;
      const email = form.querySelector('input[type="email"]')?.value;
      if (email && /\S+@\S+\.\S+/.test(email)) {
        form.innerHTML = `
          <div class="text-center py-10">
            <span class="material-symbols-outlined text-primary text-5xl mb-4 block" style="font-variation-settings:'FILL' 1;">check_circle</span>
            <h3 class="font-headline text-2xl text-primary mb-2">Thank you${name ? ', ' + name : ''}!</h3>
            <p class="text-on-surface-variant">Your contribution makes the record permanent.</p>
          </div>
        `;
      }
    });
  });

  // Simple tier "Select" / "Select Plan" buttons (prefill amount + scroll to form)
  document.querySelectorAll('.tier-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input = document.querySelector('#custom-amount, .donation-amount-input');
      if (input && amount) {
        input.value = amount;
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    });
  });
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function initCartPage() {
  // Quantity controls
  document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const display = btn.closest('.qty-group')?.querySelector('.qty-display');
      if (display) display.textContent = String(parseInt(display.textContent) + 1).padStart(2, '0');
      recalcCart();
    });
  });
  document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const display = btn.closest('.qty-group')?.querySelector('.qty-display');
      if (display) {
        const val = Math.max(1, parseInt(display.textContent) - 1);
        display.textContent = String(val).padStart(2, '0');
      }
      recalcCart();
    });
  });

  // Remove item
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.cart-item')?.remove();
      recalcCart();
    });
  });

  // Proceed to checkout
  document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    window.location.href = page('checkout');
  });
}

function recalcCart() {
  let subtotal = 0;
  document.querySelectorAll('.cart-item').forEach(item => {
    const qty   = parseInt(item.querySelector('.qty-display')?.textContent || '1');
    const price = parseFloat(item.querySelector('.item-price')?.dataset.price || '0');
    subtotal += qty * price;
    const priceEl = item.querySelector('.item-price');
    if (priceEl) priceEl.textContent = '$' + (qty * price).toFixed(2);
  });
  const levy = subtotal * 0.03;
  const total = subtotal + levy;
  const subtotalEl  = document.querySelector('.cart-subtotal');
  const levyEl      = document.querySelector('.cart-levy');
  const totalEl     = document.querySelector('.cart-total');
  if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
  if (levyEl)     levyEl.textContent     = '$' + levy.toFixed(2);
  if (totalEl)    totalEl.textContent    = '$' + total.toFixed(2);
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
          <h2 class="font-headline text-3xl text-primary mb-4">Purchase Complete</h2>
          <p class="text-on-surface-variant mb-8">Your archive selection is on its way. A carbon-neutral shipment confirmation has been sent.</p>
          <a class="bg-primary text-white px-8 py-3 rounded-full font-label text-xs uppercase tracking-widest" href="${page('homeMobile')}">Return to Archive</a>
        </div>
      `;
    }
    localStorage.removeItem(CART_KEY);
    updateCartBadges();
  });
}

// ─── ARTICLE LINKS ────────────────────────────────────────────────────────────
function initArticleLinks() {
  document.querySelectorAll('.article-link').forEach(el => {
    if (!el.href || el.href.endsWith('#')) {
      el.href = isMobile() ? page('articleMobile') : page('articleDesktop');
    }
  });
  document.querySelectorAll('.product-link').forEach(el => {
    if (!el.href || el.href.endsWith('#')) {
      el.href = isMobile() ? page('productMobile') : page('productDesktop');
    }
  });
}

// ─── PRIVACY / TERMS MODAL ────────────────────────────────────────────────────
function initPolicyModals() {
  const content = {
    privacy: { title: 'Privacy Policy', body: 'Ecodemia collects only the email address you voluntarily provide for our newsletter. We do not sell or share your data with third parties. Data is stored securely and you may unsubscribe at any time.' },
    terms:   { title: 'Terms of Service', body: 'By using Ecodemia you agree to engage with our content for personal, non-commercial purposes. All editorial content is © 2025 Ecodemia. Merchandise purchases are final unless defective.' },
  };
  document.querySelectorAll('[data-policy]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const key = el.dataset.policy;
      const c = content[key] || content.privacy;
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-6';
      modal.innerHTML = `
        <div class="bg-[#f9faf6] rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h3 class="font-headline text-2xl text-primary mb-4">${c.title}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed mb-6">${c.body}</p>
          <button class="w-full bg-primary text-white py-3 rounded-full font-label text-xs uppercase tracking-widest modal-close-btn">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    });
  });
}

// ─── CATEGORY PAGE ────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  climate:  { title: 'Climate: Tracking a Warming World.',    stat: '421.5', statLabel: 'CO₂ Parts Per Million — the highest annual average ever recorded.',        coverTitle: 'The Silent Thaw: Arctic Permafrost at the Point of No Return',             coverExcerpt: 'New satellite data reveals the permafrost retreat is accelerating faster than even the most aggressive climate models predicted.',          coverAuthor: 'Julian Thorne',    coverRole: 'Environmental Lead',        coverDate: 'March 14, 2024', coverTime: '14 Min Read' },
  wildlife: { title: 'Wildlife: Stories of the Wild.',        stat: '1.2M',  statLabel: 'Acres of Protected Wildlife Corridor Established in 2023.',                 coverTitle: 'The Invisible Monarch: Tracking the Snow Leopard\'s Alpine Migration',    coverExcerpt: 'In the thinning air of the high Himalayas, new GPS data reveals the extraordinary resilience and shifting ranges of Earth\'s most elusive feline predator.', coverAuthor: 'Dr. Elena Vos',    coverRole: 'Chief Conservation Officer', coverDate: 'March 14, 2024', coverTime: '12 Min Read' },
  energy:   { title: 'Energy: The Transition Now.',           stat: '48%',   statLabel: 'Of global electricity will come from renewables by 2030, per IEA projections.', coverTitle: 'Grid of the Future: How Battery Storage is Reshaping Energy Policy',     coverExcerpt: 'As renewable capacity soars, the race to store that power is becoming the defining infrastructure challenge of our era.',                  coverAuthor: 'Amara Soto',       coverRole: 'Energy Correspondent',      coverDate: 'Feb 28, 2024',   coverTime: '10 Min Read' },
  living:   { title: 'Living: Sustainable Futures.',          stat: '40%',   statLabel: 'Of global emissions come from the built environment — homes, offices, and cities.', coverTitle: 'The Carbon Kitchen: How What We Eat is Reshaping the Planet',           coverExcerpt: 'Dietary shifts, food waste, and regenerative agriculture are emerging as the most powerful tools in the consumer\'s climate toolkit.',        coverAuthor: 'Lena Bauer',       coverRole: 'Lifestyle & Sustainability', coverDate: 'March 1, 2024',  coverTime: '9 Min Read'  },
  tech:     { title: 'Tech: Innovation for the Planet.',      stat: '2.3B',  statLabel: 'Dollars invested in climate technology startups in Q1 2024 alone.',           coverTitle: 'The Soil Algorithm: How AI is Revolutionising Carbon Farming',            coverExcerpt: 'Machine learning meets microbiology as a new wave of startups promises to turn agricultural land into verifiable carbon sinks.',             coverAuthor: 'Kai Nakamura',     coverRole: 'Technology Editor',         coverDate: 'March 10, 2024', coverTime: '11 Min Read' },
  policy:   { title: 'Policy: Laws of the Land.',             stat: '197',   statLabel: 'Countries party to the Paris Agreement — yet fewer than 20 are on track to meet their targets.', coverTitle: 'COP29 Debrief: What the Pledges Actually Mean',                  coverExcerpt: 'A forensic look at which national commitments carry legal weight and which remain aspirational targets divorced from enforcement.',            coverAuthor: 'Elena Thorne',     coverRole: 'Policy Correspondent',      coverDate: 'Dec 5, 2023',    coverTime: '13 Min Read' },
  live:     { title: 'Live Updates.',                         stat: '24/7',  statLabel: 'Coverage from our global network of field correspondents and data monitors.',  coverTitle: 'Breaking: Record Coral Bleaching Event Declared Across Great Barrier Reef', coverExcerpt: 'Scientists confirm the fourth mass bleaching event in seven years as ocean temperatures hit unprecedented highs off the Queensland coast.',   coverAuthor: 'Ecodemia Field Desk', coverRole: 'Live Reporting',         coverDate: 'Today',          coverTime: 'Just Now'    },
};

function initCategoryPage() {
  if (!document.querySelector('.category-title')) return;
  const cat = new URLSearchParams(window.location.search).get('category') || 'wildlife';
  const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.wildlife;
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.category-title',       cfg.title);
  set('.category-cover-title', cfg.coverTitle);
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
  initEcoLogo();
  initUniversalDesktopNav();
  initNavigation();
  updateCartBadges();
  initAddToBag();
  initSizeSelector();
  initSearch();
  initMobileMenu();
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
