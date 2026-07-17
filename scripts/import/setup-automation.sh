#!/usr/bin/env bash
# Launch P1/P5: deploy import engine + install daily automated import cron.
set -euo pipefail
APP=/home/edubuzz/app
ENVF="$APP/.env"

echo "== ensure IMPORT_CRON_SECRET =="
if ! grep -q '^IMPORT_CRON_SECRET=' "$ENVF"; then
  echo "IMPORT_CRON_SECRET=$(openssl rand -hex 24)" >> "$ENVF"
fi
SEC=$(grep '^IMPORT_CRON_SECRET=' "$ENVF" | head -1 | cut -d= -f2-)
echo "secret_len=${#SEC}"

echo "== deploy =="
cd "$APP"
# Discard in-place hook edits on the server (identical to repo) so ff-pull is clean.
git checkout -- pb_hooks/main.pb.js 2>/dev/null || true
git pull --ff-only origin main
npm ci --silent
npm run build
pm2 reload edubuzz --update-env
for i in $(seq 1 15); do curl -s "http://127.0.0.1:4321/api/cron/import?token=$SEC" >/dev/null 2>&1 && break; sleep 1; done

echo "== install hourly import cron (no-op until sources+import_enabled configured) =="
mkdir -p /home/edubuzz/logs
CRON_LINE="7 * * * * curl -s \"http://127.0.0.1:4321/api/cron/import?token=$SEC\" >> /home/edubuzz/logs/import.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'api/cron/import' ; echo "$CRON_LINE" ) | crontab -
echo "== crontab now =="
crontab -l | grep -E 'cron/import|expire-jobs|backup' || true

echo "== endpoint smoke (expect skipped or no-sources) =="
curl -s "http://127.0.0.1:4321/api/cron/import?token=$SEC"; echo
echo "SETUP_DONE"
