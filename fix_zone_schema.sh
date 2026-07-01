#!/bin/bash
set -e

# Authenticate with PocketBase superuser API
RESP=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}')

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "Authenticated."

# Get current collection schema
COLL_ID=$(curl -s http://127.0.0.1:8090/api/collections/affiliate_links \
  -H "Authorization: $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id'))" 2>/dev/null)
echo "Collection ID: $COLL_ID"

# Get full collection for update
COLL_RESP=$(curl -s "http://127.0.0.1:8090/api/collections/$COLL_ID" \
  -H "Authorization: $TOKEN")

echo "Current zone field values from GET:"
echo "$COLL_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for f in d.get('fields', []):
    if f.get('name') == 'zone':
        print(json.dumps(f.get('values', []), indent=2))
"

# Build updated payload with "all" added to zone values
PAYLOAD=$(echo "$COLL_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for f in d.get('fields', []):
    if f.get('name') == 'zone':
        current = f.get('values', [])
        if 'all' not in current:
            f['values'] = current + ['all']
            print('Added \"all\" to zone values', file=sys.stderr)
        else:
            print('\"all\" already in zone values', file=sys.stderr)
print(json.dumps(d))
")

echo "Updating collection..."
UPDATE_RESP=$(curl -s -X PATCH "http://127.0.0.1:8090/api/collections/$COLL_ID" \
  -H "Authorization: $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD")

echo "$UPDATE_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('id'):
    print('Collection updated successfully!')
    for f in d.get('fields', []):
        if f.get('name') == 'zone':
            print('Zone values now:', json.dumps(f.get('values', [])))
else:
    print('Error:', json.dumps(d, indent=2))
"
