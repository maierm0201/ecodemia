// seo.js — length rules for search titles and meta descriptions, shared by the
// build (warnings) and anyone checking a draft:
//   node scripts/seo.js "Some title" "Some description"
//
// Google cuts titles by pixel width (about 580 px at 20 px Arial on desktop),
// not by characters, so titles are checked both ways. Descriptions are cut at
// about 155–160 characters on desktop and fewer on mobile.

'use strict';

const LIMITS = {
  title: { min: 30, max: 60, px: 580 },
  desc:  { min: 120, max: 155 },
};

// Arial advance widths in 1/1000 em (lower ASCII, umlauts and a few symbols)
const W = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333,
  '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '<': 584, '=': 584,
  '>': 584, '?': 556, '@': 1015, '[': 278, ']': 278, '_': 556, '|': 260, '’': 222, '‘': 222, '“': 333,
  '”': 333, '„': 333, '–': 556, '—': 1000, '…': 1000, '·': 278, '°': 400, '€': 556, '₂': 333, '³': 333,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  ä: 556, ö: 556, ü: 556, Ä: 667, Ö: 778, Ü: 722, ß: 611, é: 556, è: 556, ñ: 556, ș: 500, Ș: 667, â: 556,
};

// Estimated rendered width in pixels at the given font size (Google desktop titles: 20 px)
function pxWidth(s, size) {
  let u = 0;
  for (const ch of String(s)) u += W[ch] != null ? W[ch] : (/\d/.test(ch) ? 556 : 600);
  return Math.round(u / 1000 * (size || 20));
}

const len = s => [...String(s || '')].length;

// Problems with a title or description, as short strings (empty array = fine)
function check(kind, s) {
  const L = LIMITS[kind], out = [], n = len(s);
  if (!s) return ['missing'];
  if (n < L.min) out.push(n + ' chars, under ' + L.min);
  if (n > L.max) out.push(n + ' chars, over ' + L.max);
  if (L.px && pxWidth(s) > L.px) out.push('about ' + pxWidth(s) + ' px wide, over ' + L.px);
  if (/\s$|^\s/.test(s)) out.push('leading or trailing space');
  if (/"/.test(s)) out.push('straight double quote');
  return out;
}

module.exports = { LIMITS, pxWidth, len, check };

if (require.main === module) {
  const [t, d] = process.argv.slice(2);
  if (t) console.log('title  ' + len(t) + ' chars, ~' + pxWidth(t) + ' px  ' + (check('title', t).join('; ') || 'ok'));
  if (d) console.log('desc   ' + len(d) + ' chars  ' + (check('desc', d).join('; ') || 'ok'));
}
