#!/usr/bin/env bash
# M3 stage 2: apply the (copy-validated) migration to PRODUCTION :8090.
set -euo pipefail
APP=/home/edubuzz/app
PWF=/root/.m3_service_pw
[ -f "$PWF" ] || { echo "service pw file missing; run copy-test first"; exit 1; }
export SERVICE_PASSWORD="$(cat "$PWF")"
export SERVICE_EMAIL="import-service@edubuzz.local"

echo "== final pre-migration backup =="
bash "$APP/scripts/backup.sh" daily

echo "== migrate PRODUCTION :8090 =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/migrate.mjs

echo "== verify PRODUCTION :8090 =="
PB_URL="http://127.0.0.1:8090" ENV_PATH="$APP/.env" node /tmp/verify.mjs
echo "PROD_MIGRATION_DONE"
