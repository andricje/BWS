/**
 * RANJIVO: aplikacija gradi URL-ove direktno iz Host zaglavlja bez validacije.
 */
function getBaseUrl(req) {
  const host = req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${proto}://${host}`;
}

function buildAbsoluteUrl(req, pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getBaseUrl(req)}${path}`;
}

module.exports = { getBaseUrl, buildAbsoluteUrl };
