# Host Header Injection – BVS Projekat

---

## 1. O ranjivosti

**Host Header Injection** nastaje kada web aplikacija koristi vrednost HTTP `Host` zaglavlja bez prethodne validacije. Napadač može da pošalje proizvoljnu vrednost i prevari aplikaciju da generiše URL-ove koji sadrže napadačev domen.

### Posledice

| Tip napada | Opis |
|-----------|------|
| Password Reset Poisoning | Link za reset lozinke sadrži napadačev domen |
| Open Redirect | Korisnik se preusmerava na phishing sajt |
| Cache Poisoning | CDN/proxy kešira kompromitovani sadržaj |

### Ranjiv kod

```js
function getBaseUrl(req) {
  const host = req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${proto}://${host}`;
}
```

---

## 2. Pokretanje aplikacije

```bash
cd vulnerable-app
npm install
npm start
```

Aplikacija je dostupna na **http://localhost:3000**

| Email | Lozinka | Uloga |
|-------|---------|-------|
| admin@bank.local | admin123 | admin |
| marko@example.com | user123 | user |

### Pokretanje putem Docker-a

```bash
docker-compose -f docker/docker-compose.yml up --build
```

---

## 3. Demonstracija napada

### 3.1 Password Reset Poisoning

```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Host: evil-attacker.com" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=marko@example.com"
```

Generiše: `http://evil-attacker.com/reset-password/<TOKEN>`

Dokaz: http://localhost:3000/admin → tabela "Reset tokeni" → kolona `host_used`

### 3.2 Open Redirect

```bash
curl -v -H "Host: phishing-bank.com" \
  "http://localhost:3000/redirect?path=/dashboard"
```

### 3.3 Automatski demo svih napada

```bash
bash scripts/run-all-exploits.sh
```

---

## 4. Burp Suite demonstracija

1. Pokrenuti Burp Suite → Proxy → `127.0.0.1:8080`
2. Otvoriti http://localhost:3000/forgot-password
3. Uneti `marko@example.com` i kliknuti Submit
4. U **Proxy → HTTP history** pronaći `POST /forgot-password`
5. Desni klik → **Send to Repeater**
6. Izmeniti: `Host: evil-attacker.com`
7. Kliknuti **Send**
8. Proveriti admin panel – `host_used = evil-attacker.com`

---

## 5. Zaštita (secure-version grana)

### Sigurna implementacija

```js
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'localhost:3000,127.0.0.1:3000')
  .split(',').map(h => h.trim());

function validateHost(req, res, next) {
  const host = req.headers.host || '';
  if (!ALLOWED_HOSTS.includes(host)) {
    return res.status(400).render('error', {
      title: 'Neispravan zahtev',
      message: `Host "${host}" nije dozvoljen.`,
    });
  }
  next();
}

function buildAbsoluteUrl(req, pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_URL}${path}`;
}
```

### Testiranje zaštite

```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Host: evil.com" \
  -d "email=marko@example.com"
# Rezultat: 400 Bad Request – Host "evil.com" nije dozvoljen.
```

---

## 6. Razlika ranjivo vs sigurno

| | Ranjiva verzija | Sigurna verzija |
|--|----------------|-----------------|
| `lib/host.js` | Čita `req.headers.host` | Koristi `BASE_URL` iz konfiguracije |
| Host validacija | Nema | `validateHost` middleware + whitelist |
| `trust proxy` | `true` | `false` |
| Napad uspeva | ✅ Da | ❌ Ne (HTTP 400) |

---

## 7. Git grane

| Grana | Opis |
|-------|------|
| `feat/01-scaffold` | Express + SQLite osnova |
| `feat/02-auth` | Login, register, sesije |
| `feat/03-host-injection` | Ranjivi password reset, admin, redirect |
| `feat/04-exploit-demo` | Exploit skripte, Burp Suite dokumentacija |
| `secure-version` | Whitelist validacija, Docker |

---

## 8. Reference

- [OWASP – Host Header Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/17-Testing_for_Host_Header_Injection)
- [PortSwigger – Host header attacks](https://portswigger.net/web-security/host-header)
- [PortSwigger – Password Reset Poisoning](https://portswigger.net/web-security/host-header/exploiting/password-reset-poisoning)
- [Express.js dokumentacija](https://expressjs.com/)