// api/callback.js — Step 2: check the state, exchange the GitHub code for an
// access token, then hand it back to Decap CMS via postMessage so the popup can close.
//
// The token is only ever posted to the site's own origins, never to '*', so a
// foreign page that opens this popup cannot receive it.
const crypto = require('crypto');

const ALLOWED_ORIGINS = ['https://www.ecodemia.org', 'https://ecodemia.org'];

function readCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? m[1] : '';
}

function sameString(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  const { code, state } = req.query;
  const proto  = req.headers['x-forwarded-proto'] || 'https';
  const host   = req.headers['x-forwarded-host'] || req.headers.host;
  const self   = `${proto}://${host}`;
  const allowed = ALLOWED_ORIGINS.includes(self) ? ALLOWED_ORIGINS : ALLOWED_ORIGINS.concat(self);

  res.setHeader('Set-Cookie', 'ecodemia_oauth_state=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
  res.setHeader('Cache-Control', 'no-store');

  if (!code) {
    res.status(400).end('Missing code parameter');
    return;
  }
  if (!sameString(state, readCookie(req, 'ecodemia_oauth_state'))) {
    res.status(400).end('Login expired or started in another browser. Close this window and try again.');
    return;
  }

  let token, errorMsg;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id:     'Ov23li6AkXpqvY0oYJym',
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await response.json();
    if (data.error) {
      errorMsg = data.error_description || data.error;
    } else {
      token = data.access_token;
    }
  } catch (err) {
    errorMsg = 'Server error during token exchange';
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // Decap CMS handshake: the popup announces itself, the CMS answers, and the
  // popup replies with the result, but only to an allowed origin.
  const payload = errorMsg
    ? 'authorization:github:error:' + JSON.stringify({ error: errorMsg })
    : 'authorization:github:success:' + JSON.stringify({ token, provider: 'github' });

  res.end(`<!DOCTYPE html><html><body><script>
(function () {
  var ALLOWED = ${JSON.stringify(allowed)};
  var PAYLOAD = ${JSON.stringify(payload).replace(/</g, '\\u003c')};
  if (!window.opener) { document.body.textContent = 'Please start the login from the Ecodemia admin page.'; return; }
  function receiveMessage(e) {
    if (ALLOWED.indexOf(e.origin) === -1) return;
    window.removeEventListener('message', receiveMessage);
    window.opener.postMessage(PAYLOAD, e.origin);
  }
  window.addEventListener('message', receiveMessage, false);
  ALLOWED.forEach(function (o) {
    try { window.opener.postMessage('authorizing:github', o); } catch (err) {}
  });
})();
<\/script></body></html>`);
};
