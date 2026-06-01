# Host Header Injection – BVS projekat

**Autor:** Marko Andrić, indeks 106/24  
**Predmet:** Bezbednost web servisa  
**Tema:** Host Header Injection ranjivost

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

## Test (curl)

```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Host: evil.com" \
  -d "email=marko@example.com"
```

## Git grane

- `feat/01-scaffold` – Express + SQLite shell
- `feat/02-auth` – registracija i prijava
- `feat/03-host-injection` – Host Header Injection + README

## Reference

- [OWASP – Host Header Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/17-Testing_for_Host_Header_Injection)
- [PortSwigger – Host header attacks](https://portswigger.net/web-security/host-header)
