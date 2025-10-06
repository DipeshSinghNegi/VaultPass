#!/usr/bin/env bash
set -euo pipefail

ROOT="http://localhost:3000"
COOKIES="/tmp/lc_cookies.txt"

echo "Login..."
curl -s -X POST "$ROOT/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test12345"}' -c "$COOKIES" | jq .

echo "Me:"
curl -s "$ROOT/api/auth/me" -b "$COOKIES" | jq .

echo "Create item..."
CREATED=$(curl -s -X POST "$ROOT/api/vault/create" -H "Content-Type: application/json" -d '{"encrypted":"ZmFrZS1iYXNlNjQtZW5jcnlwdGVk","iv":"ZmFrZS1pdi1iYXNlNjQ="}' -b "$COOKIES")
echo "$CREATED" | jq .
ID=$(echo "$CREATED" | jq -r '.item._id')

echo "List items:"
curl -s "$ROOT/api/vault/list" -b "$COOKIES" | jq .

echo "Update item: $ID"
curl -s -X PUT "$ROOT/api/vault/$ID" -H "Content-Type: application/json" -d '{"encrypted":"bmV3LWVuY3J5cHRlZC1kYXRh","iv":"bmV3LWl2"}' -b "$COOKIES" | jq .

echo "Delete item: $ID"
curl -s -X POST "$ROOT/api/vault/delete" -H "Content-Type: application/json" -d "{\"id\":\"$ID\"}" -b "$COOKIES" | jq .

echo "Smoke finished"
