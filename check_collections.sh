#!/bin/bash
set -e

TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== All collections ==="
curl -s "http://127.0.0.1:8090/api/collections?page=1&perPage=50" \
  -H "Authorization: $TOKEN" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for i in d.get('items',[]):
    name=i.get('name','')
    print(f'  {name}')
    if name == 'audit_logs':
        print('    *** audit_logs EXISTS ***')
"
