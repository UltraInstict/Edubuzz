#!/bin/bash
set -e
TOKEN=$(curl -s http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H 'Content-Type: application/json' \
  -d '{"identity":"praiseleeto@gmail.com","password":"PbCFfkcMOhL9CvgGjB9Fs23Q!9X"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])" 2>/dev/null)

echo "=== Affiliate links with banner files ==="
curl -s "http://127.0.0.1:8090/api/collections/affiliate_links/records?perPage=50" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for item in d.get('items', []):
    name = item.get('name','')
    cid = item.get('collectionId','')
    rid = item.get('id','')
    bfile = item.get('banner_file','')
    if bfile:
        print(f'  name={name} collectionId={cid} id={rid} banner_file={bfile}')
        print(f'  URL: https://edubuzz.co.za/pb-api/files/{cid}/{rid}/{bfile}')
" 2>/dev/null
