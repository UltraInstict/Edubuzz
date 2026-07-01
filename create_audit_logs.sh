#!/bin/bash
set -e

TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== Creating audit_logs collection ==="
CREATE_RESP=$(curl -s -X POST "http://127.0.0.1:8090/api/collections" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "audit_logs",
    "type": "base",
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "fields": [
      {"id":"text3624316569","name":"event","type":"text","required":true},
      {"id":"text1574674322","name":"details","type":"text","required":false},
      {"id":"text2471884225","name":"admin_id","type":"text","required":false},
      {"id":"autodate2990389176","name":"created","type":"autodate","onCreate":true,"onUpdate":false}
    ]
  }')

echo "$CREATE_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if d.get('id'):
    print('audit_logs created! ID:', d.get('id'))
else:
    print('Error:', json.dumps(d, indent=2))
    exit(1)
"

echo ""
echo "=== Step 2: Direct PATCH test (bypassing app) ==="
PATCH_RESP=$(curl -s -X PATCH "http://127.0.0.1:8090/api/collections/admin_settings/records/oql0jp8xy8io832" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"value":"test_after_fix"}')

echo "$PATCH_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if d.get('id'):
    print('PATCH SUCCESS! HTTP 200. Value:', d.get('value'))
else:
    print('PATCH FAILED:', json.dumps(d, indent=2))
    exit(1)
"
