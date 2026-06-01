const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { buildAbsoluteUrl } = require('../lib/host');
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

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { title: 'Zaboravljena lozinka' });
});

router.post('/forgot-password', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    req.session.flash = {
      type: 'info',
      message: 'Ako nalog postoji, poslat ćemo link za reset lozinke.',
    };
    return res.redirect('/forgot-password');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetLink = buildAbsoluteUrl(req, `/reset-password/${resetToken}`);
  const hostUsed = req.headers.host || 'unknown';

  db.prepare(
    `INSERT INTO password_reset_tokens (user_id, token, reset_link, host_used)
     VALUES (?, ?, ?, ?)`
  ).run(user.id, resetToken, resetLink, hostUsed);

  const emailBody = [
    'Poštovani,',
    '',
    'Zatražili ste reset lozinke za SecureBank nalog.',
    `Kliknite na link: ${resetLink}`,
    '',
    'Link važi 1 sat. Ako niste vi zatražili reset, ignorišite ovu poruku.',
    '',
    'SecureBank tim',
  ].join('\n');

  db.prepare(
    `INSERT INTO reset_emails (user_id, to_email, subject, body) VALUES (?, ?, ?, ?)`
  ).run(user.id, user.email, 'SecureBank – reset lozinke', emailBody);

  console.log('[EMAIL SIMULATOR] To:', user.email);
  console.log('[EMAIL SIMULATOR] Host header:', hostUsed);
  console.log('[EMAIL SIMULATOR] Reset link:', resetLink);

  req.session.flash = {
    type: 'success',
    message:
      'Link za reset lozinke je generisan (proverite simulirani email u admin panelu).',
  };
  res.redirect('/forgot-password');
});

router.get('/reset-password/:token', (req, res) => {
  const row = db
    .prepare(
      `SELECT prt.*, u.email FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ? AND prt.used = 0`
    )
    .get(req.params.token);

  if (!row) {
    req.session.flash = { type: 'danger', message: 'Nevažeći ili istekao token.' };
    return res.redirect('/login');
  }

  res.render('reset-password', {
    title: 'Nova lozinka',
    token: req.params.token,
    email: row.email,
    resetLink: row.reset_link,
    hostUsed: row.host_used,
  });
});

router.post('/reset-password/:token', (req, res) => {
  const { password, confirmPassword } = req.body;
  const token = req.params.token;

  if (!password || password !== confirmPassword) {
    req.session.flash = { type: 'danger', message: 'Lozinke se ne poklapaju.' };
    return res.redirect(`/reset-password/${token}`);
  }

  const row = db
    .prepare('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0')
    .get(token);

  if (!row) {
    req.session.flash = { type: 'danger', message: 'Nevažeći token.' };
    return res.redirect('/login');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
    passwordHash,
    row.user_id
  );
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id);

  req.session.flash = { type: 'success', message: 'Lozinka je uspešno promenjena.' };
  res.redirect('/login');
});

module.exports = router;
