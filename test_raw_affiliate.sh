#!/bin/bash
set -e
TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== Raw affiliate record with banner (Python JSON dump) ==="
curl -s "http://127.0.0.1:8090/api/collections/affiliate_links/records/eqptr1rftiaii7a" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Raw JSON:')
print(json.dumps(d, indent=2))
print()
print('banner_file type:', type(d.get('banner_file')))
print('banner_file repr:', repr(d.get('banner_file')))
"
