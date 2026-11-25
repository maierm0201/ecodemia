// api/auth.js — Step 1: redirect the browser to GitHub's OAuth authorization page.
// A random `state` value is stored in a short-lived cookie and checked again in
// api/callback.js, so a login can only finish in the browser that started it.
const crypto = require('crypto');

module.exports = (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host'] || req.headers.host;
  const state = crypto.randomBytes(24).toString('hex');

  const params = new URLSearchParams({
    client_id:    'Ov23li6AkXpqvY0oYJym',
    redirect_uri: `${proto}://${host}/api/callback`,
    scope:        'repo',
    state,
  });

  res.setHeader('Set-Cookie',
    `ecodemia_oauth_state=${state}; Path=/api; Max-Age=600; HttpOnly; Secure; SameSite=Lax`);
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
};
