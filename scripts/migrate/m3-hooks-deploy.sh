#!/usr/bin/env bash
# Deploy corrected pb_hooks to prod, reload PB, then complete the backfill.
set -euo pipefail
APP=/home/edubuzz/app
HOOKS=/home/edubuzz/pocketbase/pb_hooks
PWF=/root/.m3_service_pw
export SERVICE_PASSWORD="$(cat "$PWF")"
export SERVICE_EMAIL="import-service@edubuzz.local"

echo "== backup current prod hooks =="
cp "$HOOKS/main.pb.js" "$HOOKS/main.pb.js.pre_m3_$(date -u +%Y%m%d_%H%M%S).bak"

echo "== install corrected hooks =="
cp /tmp/main.pb.js "$HOOKS/main.pb.js"
# keep the app repo copy in sync too
cp /tmp/main.pb.js "$APP/pb_hooks/main.pb.js" 2>/dev/null || true

echo "== restart pocketbase (brief reload) =="
systemctl restart pocketbase
for i in $(seq 1 20); do curl -s http://127.0.0.1:8090/api/health >/dev/null 2>&1 && break; sleep 1; done
curl -s http://127.0.0.1:8090/api/health && echo

echo "== re-run backfill migration on prod (idempotent) =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/migrate.mjs

echo "== verify prod =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/verify.mjs
echo "HOOKS_DEPLOY_DONE"
