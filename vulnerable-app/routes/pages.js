const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'SecureBank' });
});

router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { title: 'Kontrolna tabla' });
});

module.exports = router;
