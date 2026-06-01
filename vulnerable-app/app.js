const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');

require('./db/database');

const { attachUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bvs-host-header-injection-demo',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);

app.use(attachUser);

app.use((req, res, next) => {
  res.locals.requestHost = req.headers.host;
  next();
});

app.use('/', pagesRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: '404',
    message: 'Stranica nije pronađena.',
  });
});

app.listen(PORT, () => {
  console.log(`SecureBank (ranjiva verzija) http://localhost:${PORT}`);
  console.log('Test nalozi: admin@bank.local / admin123 | marko@example.com / user123');
});
