#!/bin/bash
set -e

TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== Raw PATCH response ==="
curl -s -X PATCH "http://127.0.0.1:8090/api/collections/admin_settings/records/oql0jp8xy8io832" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"value":"test3"}' \
  -w "\n\n=== HTTP_STATUS: %{http_code} ===\n"

echo ""
echo "=== Verifying record ==="
curl -s "http://127.0.0.1:8090/api/collections/admin_settings/records/oql0jp8xy8io832" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;d=json.load(sys.stdin);print('value:',repr(d.get('value')));print('updated:',d.get('updated'))"
