// api/checkout.js — creates a Stripe Checkout session for reader support and
// returns its URL. The support page (/support, /de/unterstuetzen) calls this
// with fetch() and then sends the browser to Stripe's hosted checkout page, so
// no card data and no Stripe script ever touch ecodemia.org.
//
// Request:  POST application/json { mode: "monthly" | "once", amount: 3–400 (whole euros), lang: "en" | "de" }
// Response: 200 { url } or 4xx/5xx { error } (generic messages only)
//
// Environment variables (set in Vercel, never in the repository):
//   STRIPE_SECRET_KEY        restricted key: Checkout Sessions write, Prices read
//   STRIPE_PRODUCT_MONTHLY   prod_… of "Ecodemia Support (monthly)"
//   STRIPE_PRODUCT_ONCE      prod_… of "Ecodemia Support (one-time)"
//   STRIPE_REQUIRE_TERMS     optional, "1" = supporters must accept the terms of use on
//                            Stripe's page (needs the terms URL set in Stripe first)
//
// Security: same-origin requests only, amount and mode validated here (the
// browser's values are never trusted), a best-effort rate limit per IP, and
// nothing personal is logged. Monthly support uses one €1/month price with the
// amount as quantity; one-time support gets an inline price for the amount.

const MIN_EUR = 3;
const MAX_EUR = 400;
const STRIPE_API = 'https://api.stripe.com/v1';
const PAGE = { en: '/support', de: '/de/unterstuetzen' };

// ─── Best-effort rate limit (per serverless instance; add a Vercel Firewall rule for a hard limit)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

// ─── Stripe REST helpers (no SDK, no dependency)
function form(params, prefix, out) {
  out = out || new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? prefix + '[' + k + ']' : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(method, path, params) {
  const res = await fetch(STRIPE_API + path + (method === 'GET' && params ? '?' + form(params) : ''), {
    method,
    headers: {
      Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
      // Pinned so that Stripe API changes never alter this function unexpectedly
      'Stripe-Version': '2026-11-18.endive',
    },
    body: method === 'POST' ? form(params) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = data.error || {};
    // Type and code only: Stripe error messages can echo request values
    const err = new Error('Stripe ' + res.status + ' ' + (e.type || '') + ' ' + (e.code || ''));
    err.status = res.status;
    throw err;
  }
  return data;
}

// Monthly EUR prices on the monthly product, cached for 10 minutes: { cents: price_id }
let priceCache = { at: 0, map: null };
async function monthlyPrices(product) {
  if (priceCache.map && Date.now() - priceCache.at < WINDOW_MS) return priceCache.map;
  const list = await stripe('GET', '/prices', { product, active: true, type: 'recurring', limit: 100 });
  const map = {};
  for (const p of list.data || []) {
    if (p.currency === 'eur' && p.recurring && p.recurring.interval === 'month' &&
        p.recurring.interval_count === 1 && p.unit_amount && p.billing_scheme === 'per_unit') {
      map[p.unit_amount] = p.id;
    }
  }
  priceCache = { at: Date.now(), map };
  return map;
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return null; }
}

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { error: 'method' });
  }

  // Same-origin only: the browser's Origin must match the host this function runs on
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const origin = req.headers.origin || '';
  if (!host || origin !== 'https://' + host) return reply(res, 403, { error: 'origin' });
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return reply(res, 415, { error: 'type' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return reply(res, 429, { error: 'rate' });

  const { STRIPE_SECRET_KEY, STRIPE_PRODUCT_MONTHLY, STRIPE_PRODUCT_ONCE } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_PRODUCT_MONTHLY || !STRIPE_PRODUCT_ONCE) {
    return reply(res, 503, { error: 'unavailable' });
  }

  const body = readBody(req);
  if (!body) return reply(res, 400, { error: 'input' });
  const mode = body.mode === 'monthly' ? 'monthly' : body.mode === 'once' ? 'once' : null;
  const lang = body.lang === 'de' ? 'de' : 'en';
  const amount = Number(body.amount);
  if (!mode || !Number.isInteger(amount) || amount < MIN_EUR || amount > MAX_EUR) {
    return reply(res, 400, { error: 'input' });
  }
  const cents = amount * 100;
  const page = 'https://' + host + PAGE[lang];

  const session = {
    locale: lang,
    success_url: page + '?status=thanks',
    cancel_url: page + '?status=cancelled',
    billing_address_collection: 'auto',
    // Optional name field, so invoices can be addressed to the supporter
    name_collection: { individual: { enabled: true, optional: true } },
    // Terms checkbox on Stripe's page. Only works once the terms URL is set in Stripe
    // (Settings → Public details), so it is switched on with STRIPE_REQUIRE_TERMS=1.
    consent_collection: process.env.STRIPE_REQUIRE_TERMS === '1' ? { terms_of_service: 'required' } : undefined,
    metadata: { source: 'support-page', lang },
  };

  try {
    if (mode === 'monthly') {
      // Monthly support = the €1/month price × quantity (the amount in euros). One price
      // for everyone means supporters can raise or lower their amount themselves in the
      // Stripe customer portal ("change quantities"), which allows only one monthly price
      // per product. Falls back to an inline €1 price if the €1 price is missing.
      const unit = (await monthlyPrices(STRIPE_PRODUCT_MONTHLY))[100];
      Object.assign(session, {
        mode: 'subscription',
        line_items: [unit ? { price: unit, quantity: amount } : {
          quantity: amount,
          price_data: { currency: 'eur', product: STRIPE_PRODUCT_MONTHLY, unit_amount: 100, recurring: { interval: 'month' } },
        }],
        subscription_data: { metadata: { source: 'support-page', lang } },
      });
    } else {
      Object.assign(session, {
        mode: 'payment',
        line_items: [{ quantity: 1, price_data: { currency: 'eur', product: STRIPE_PRODUCT_ONCE, unit_amount: cents } }],
        customer_creation: 'always',
        invoice_creation: { enabled: true, invoice_data: { metadata: { source: 'support-page', lang } } },
      });
    }
    const s = await stripe('POST', '/checkout/sessions', session);
    // Only Stripe's own checkout host (update this if a custom checkout domain is set up in Stripe)
    if (!s.url || !/^https:\/\/checkout\.stripe\.com\//.test(s.url)) throw new Error('Stripe returned no checkout URL');
    return reply(res, 200, { url: s.url });
  } catch (err) {
    console.error('checkout failed:', err.message);
    return reply(res, 502, { error: 'stripe' });
  }
};
