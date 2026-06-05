const express = require('express');
const { buildAbsoluteUrl, getBaseUrl } = require('../lib/host');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'SecureBank',
    baseUrl: getBaseUrl(),
  });
});

router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', {
    title: 'Kontrolna tabla',
    profileUrl: buildAbsoluteUrl(req, `/profile/${req.session.userId}`),
    baseUrl: getBaseUrl(),
  });
});

router.get('/profile/:id', requireAuth, (req, res) => {
  if (String(req.session.userId) !== req.params.id && req.session.role !== 'admin') {
    req.session.flash = { type: 'danger', message: 'Nemate pristup ovom profilu.' };
    return res.redirect('/dashboard');
  }

  res.render('profile', {
    title: 'Profil',
    userId: req.params.id,
    canonicalUrl: buildAbsoluteUrl(req, `/profile/${req.params.id}`),
  });
});

router.get('/redirect', (req, res) => {
  const path = req.query.path || '/';
  const target = buildAbsoluteUrl(req, path);
  res.render('redirect-preview', {
    title: 'Preusmeravanje',
    target,
    path,
    host: getBaseUrl(),
  });
});

router.post('/redirect', (req, res) => {
  const path = req.body.path || '/';
  const target = buildAbsoluteUrl(req, path);
  return res.redirect(target);
});

router.get('/api/absolute-url', (req, res) => {
  const path = req.query.path || '/';
  res.json({
    host: getBaseUrl(),
    absoluteUrl: buildAbsoluteUrl(req, path),
    note: 'URL je generisan iz BASE_URL konfiguracije (sigurna verzija).',  });
});

module.exports = router;
