/**
 * SIGURNA implementacija: Host zaglavlje se NE koristi za generisanje URL-ova.
 * Domen je hardkodovan u konfiguraciji.
 */

const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'localhost:3000,127.0.0.1:3000')
    .split(',')
    .map(h => h.trim());

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function validateHost(req, res, next) {
  const host = req.headers.host || '';
  if (!ALLOWED_HOSTS.includes(host)) {
    console.warn(`[SECURITY] Odbijen Host: "${host}" | IP: ${req.ip}`);
    return res.status(400).render('error', {
      title: 'Neispravan zahtev',
      message: `Host "${host}" nije dozvoljen.`,
    });
  }
  next();
}

function getBaseUrl() {
  return BASE_URL;
}

function buildAbsoluteUrl(req, pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_URL}${path}`;
}

module.exports = { getBaseUrl, buildAbsoluteUrl, validateHost, ALLOWED_HOSTS, BASE_URL };