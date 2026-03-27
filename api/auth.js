// api/auth.js — Step 1: redirect the browser to GitHub's OAuth authorization page
module.exports = (req, res) => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host'] || req.headers.host;

  const params = new URLSearchParams({
    client_id:    'Ov23li6AkXpqvY0oYJym',
    redirect_uri: `${proto}://${host}/api/callback`,
    scope:        'repo,user',
    state:        Math.random().toString(36).slice(2),
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
};
