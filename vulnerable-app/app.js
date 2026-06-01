const express = require('express');
const path = require('path');
const session = require('express-session');

require('./db/database');

const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get('/', (req, res) => {
  res.render('index', { title: 'SecureBank' });
});

app.use((req, res) => {
  res.status(404).render('error', {
    title: '404',
    message: 'Stranica nije pronađena.',
  });
});

app.listen(PORT, () => {
  console.log(`SecureBank http://localhost:${PORT}`);
});
