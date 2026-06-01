const express = require('express');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users').all();
  const tokens = db
    .prepare(
      `SELECT prt.id, prt.token, prt.reset_link, prt.host_used, prt.used, prt.created_at, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       ORDER BY prt.created_at DESC
       LIMIT 20`
    )
    .all();
  const emails = db
    .prepare(
      `SELECT re.id, re.to_email, re.subject, re.body, re.created_at, u.email AS user_email
       FROM reset_emails re
       JOIN users u ON u.id = re.user_id
       ORDER BY re.created_at DESC
       LIMIT 10`
    )
    .all();

  res.render('admin', {
    title: 'Admin panel',
    users,
    tokens,
    emails,
  });
});

module.exports = router;
