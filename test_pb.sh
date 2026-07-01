#!/bin/bash
set -e

# Authenticate
TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== Token OK ==="

# Step 1: Get the collection schema
echo "=== Getting admin_settings collection ==="
curl -s "http://127.0.0.1:8090/api/collections/admin_settings" \
  -H "Authorization: $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Collection ID:', d.get('id'))
print('Fields:')
for f in d.get('fields', []):
    name = f.get('name')
    ftype = f.get('type')
    required = f.get('required', False)
    print(f'  {name}: type={ftype}, required={required}')
"

echo ""
echo "=== Getting a record and trying to PATCH it ==="
RECORDS=$(curl -s "http://127.0.0.1:8090/api/collections/admin_settings/records?perPage=3" \
  -H "Authorization: $TOKEN")

echo "$RECORDS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for item in d.get('items', []):
    print(f'  id={item[\"id\"]} key={item.get(\"key\")} value={item.get(\"value\")}')
" 2>/dev/null

FIRST_ID=$(echo "$RECORDS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('items', [])
if items:
    print(items[0]['id'])
" 2>/dev/null)

echo ""
echo "=== Attempting PATCH on record $FIRST_ID ==="
curl -s -v -X PATCH "http://127.0.0.1:8090/api/collections/admin_settings/records/$FIRST_ID" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"value":"test"}' 2>&1

echo ""
echo "=== Testing read-only: GET on same record ==="
curl -s "http://127.0.0.1:8090/api/collections/admin_settings/records/$FIRST_ID" \
  -H "Authorization: $TOKEN"
