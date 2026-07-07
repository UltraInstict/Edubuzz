#!/bin/bash
# Activate all affiliate links and monetization campaigns.
PB="http://127.0.0.1:8090"
EMAIL="praiseleeto@gmail.com"
PASS="PbCFfkcMOhL9CvgGjB9Fs23Q!9X"

TOKEN=$(curl -s -X POST "${PB}/api/admins/auth-with-password" \
  -H 'Content-Type: application/json' \
  -d "{\"identity\":\"${EMAIL}\",\"password\":\"${PASS}\"}" | \
  python3 -c 'import json,sys; print(json.load(sys.stdin).get("token",""))')

echo "Auth: ${TOKEN:0:10}..."

# Activate all affiliate links
for id in l0lnj6f2ocg3z9c 86wd33eqao7feg0 uwpbuema50ujcfk ws85yfbcxs1ljes xruwhjn08u9q9q6 bet6kgyqz4ity4w 7i1sbbr0n4o0qu6; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH \
    "${PB}/api/collections/affiliate_links/records/${id}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' \
    -d '{"active":true}')
  echo "affiliate ${id}: ${CODE}"
done

# Activate strip and infeed campaigns
for id in nqjgfzm0bkwwrgh bxziy5fcvltwwjt; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH \
    "${PB}/api/collections/monetization_campaigns/records/${id}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' \
    -d '{"active":true}')
  echo "campaign ${id}: ${CODE}"
done

echo "Done. Reloading PM2..."
pm2 reload edubuzz --update-env
