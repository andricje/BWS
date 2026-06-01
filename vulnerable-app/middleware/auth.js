function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: 'warning', message: 'Morate biti prijavljeni.' };
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    req.session.flash = { type: 'danger', message: 'Pristup admin panelu je zabranjen.' };
    return res.redirect('/dashboard');
  }
  next();
}

function attachUser(req, res, next) {
  res.locals.currentUser = req.session.userId
    ? {
        id: req.session.userId,
        email: req.session.email,
        name: req.session.name,
        role: req.session.role,
      }
    : null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

module.exports = { requireAuth, requireAdmin, attachUser };
