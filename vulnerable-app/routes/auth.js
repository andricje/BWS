const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { title: 'Registracija' });
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    req.session.flash = { type: 'danger', message: 'Sva polja su obavezna.' };
    return res.redirect('/register');
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email.trim().toLowerCase(), passwordHash, name.trim());
    req.session.flash = { type: 'success', message: 'Nalog je kreiran. Možete se prijaviti.' };
    res.redirect('/login');
  } catch (err) {
    const message =
      err.message && err.message.includes('UNIQUE')
        ? 'Email je već registrovan.'
        : 'Greška pri registraciji.';
    req.session.flash = { type: 'danger', message };
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { title: 'Prijava' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get((email || '').trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    req.session.flash = { type: 'danger', message: 'Pogrešan email ili lozinka.' };
    return res.redirect('/login');
  }

  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.name = user.name;
  req.session.role = user.role;
  req.session.flash = { type: 'success', message: `Dobrodošli, ${user.name}!` };
  res.redirect('/dashboard');
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
