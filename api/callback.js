// api/callback.js — Step 2: exchange the GitHub code for an access token,
// then hand it back to Decap CMS via postMessage so the popup can close.
module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).end('Missing code parameter');
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

  res.setHeader('Content-Type', 'text/html');

  if (errorMsg) {
    // Send error back to Decap CMS
    res.end(`<!DOCTYPE html><html><body><script>
(function () {
  var msg = 'authorization:github:error:' + JSON.stringify({ error: ${JSON.stringify(errorMsg)} });
  window.opener.postMessage(msg, '*');
  window.close();
})();
<\/script></body></html>`);
    return;
  }

  // Send token back to Decap CMS using its handshake protocol:
  // 1. popup signals "authorizing:github" to the opener
  // 2. opener responds with a message (any origin)
  // 3. popup replies with the token to opener's origin
  res.end(`<!DOCTYPE html><html><body><script>
(function () {
  var TOKEN    = ${JSON.stringify(token)};
  var PROVIDER = 'github';
  function receiveMessage(e) {
    window.removeEventListener('message', receiveMessage);
    window.opener.postMessage(
      'authorization:' + PROVIDER + ':success:' + JSON.stringify({ token: TOKEN, provider: PROVIDER }),
      e.origin
    );
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:' + PROVIDER, '*');
})();
<\/script></body></html>`);
};
