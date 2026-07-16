#!/usr/bin/env bash
# Complete M3 safely: install fixed hooks -> restart PB -> restore lost record
# -> backfill all -> verify. Idempotent.
set -euo pipefail
APP=/home/edubuzz/app
HOOKS=/home/edubuzz/pocketbase/pb_hooks
PWF=/root/.m3_service_pw
export SERVICE_PASSWORD="$(cat "$PWF")"
export SERVICE_EMAIL="import-service@edubuzz.local"

echo "== safety backup (current state) =="
bash "$APP/scripts/backup.sh" daily >/dev/null 2>&1 && echo "backup ok"

echo "== install FIXED hooks =="
cp "$HOOKS/main.pb.js" "$HOOKS/main.pb.js.oldbak_$(date -u +%H%M%S)"
cp /tmp/main.pb.js "$HOOKS/main.pb.js"
cp /tmp/main.pb.js "$APP/pb_hooks/main.pb.js" 2>/dev/null || true
echo "e.next count in installed hooks: $(grep -c 'e.next()' "$HOOKS/main.pb.js")"

echo "== restart pocketbase =="
systemctl restart pocketbase
for i in $(seq 1 20); do curl -s http://127.0.0.1:8090/api/health >/dev/null 2>&1 && break; sleep 1; done
curl -s http://127.0.0.1:8090/api/health && echo

echo "== extract lost record from pre-migration backup =="
BK=/home/edubuzz/backups/daily/edubuzz_daily_20260716_150854.zip.gpg
rm -rf /tmp/rec; mkdir -p /tmp/rec
gpg --batch --yes -d "$BK" > /tmp/rec/b.zip 2>/dev/null
unzip -q /tmp/rec/b.zip -d /tmp/rec/x
BDB=$(find /tmp/rec/x -name data.db | head -1)
sqlite3 -json "$BDB" "SELECT * FROM jobs WHERE id='r98d46e931103c8';" > /tmp/lost.json
echo "lost.json bytes: $(wc -c < /tmp/lost.json)"

echo "== restore lost record =="
PB_URL="http://127.0.0.1:8090" node /tmp/recovery.mjs

echo "== backfill all jobs =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/migrate.mjs 2>&1 | grep -E 'backfill|COMPLETE|FAIL|slug.required|rules'

echo "== verify =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/verify.mjs 2>&1 | grep -E 'total|passed|failed|VERIFY|count|linked'
echo "== final count =="
sqlite3 /home/edubuzz/pocketbase/pb_data/data.db "SELECT count(*) FROM jobs;"
echo "M3_RECOVER_DONE"
