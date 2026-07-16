#!/usr/bin/env bash
# M3 stage 1: pre-migration backup -> restore into a throwaway copy ->
# boot a second PB on :8091 -> run migration on the COPY -> verify -> stop.
# Production (:8090) is NOT touched by this script.
set -euo pipefail

APP=/home/edubuzz/app
PB=/home/edubuzz/pocketbase/pocketbase
COPY=/tmp/m3_copy
PORT=8091

# --- service account password: generate once, persist for reuse on prod ---
PWF=/root/.m3_service_pw
if [ ! -f "$PWF" ]; then
  openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | cut -c1-32 > "$PWF"
fi
export SERVICE_PASSWORD="$(cat "$PWF")"
export SERVICE_EMAIL="import-service@edubuzz.local"
echo "service_email=$SERVICE_EMAIL service_pw_len=${#SERVICE_PASSWORD}"

# --- 1) pre-migration backup (proven M0 path, GPG-encrypted) ---
echo "== pre-migration backup =="
bash "$APP/scripts/backup.sh" daily
BK=$(ls -t /home/edubuzz/backups/daily/edubuzz_daily_*.zip* 2>/dev/null | head -1)
echo "backup_file=$BK"
[ -n "$BK" ] || { echo "no backup found"; exit 1; }

# --- 2) restore backup into throwaway copy ---
echo "== restore into copy =="
rm -rf "$COPY"; mkdir -p "$COPY/extract"
if [[ "$BK" == *.gpg ]]; then
  gpg --batch --yes -d "$BK" > "$COPY/backup.zip"
else
  cp "$BK" "$COPY/backup.zip"
fi
unzip -q "$COPY/backup.zip" -d "$COPY/extract"
# locate the dir that actually contains data.db
DATADIR=$(dirname "$(find "$COPY/extract" -name data.db | head -1)")
echo "datadir=$DATADIR"
[ -n "$DATADIR" ] || { echo "data.db not found in backup"; exit 1; }

# --- 3) boot PB on the copy ---
echo "== boot copy PB on :$PORT =="
"$PB" serve --dir "$DATADIR" --http "127.0.0.1:$PORT" >/tmp/m3_pb8091.log 2>&1 &
PBPID=$!
trap 'kill $PBPID 2>/dev/null || true' EXIT
for i in $(seq 1 15); do
  if curl -s "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then break; fi
  sleep 1
done
curl -s "http://127.0.0.1:$PORT/api/health" && echo
cat /tmp/m3_pb8091.log | tail -5 || true

# --- 4) migrate the COPY ---
echo "== migrate COPY =="
PB_URL="http://127.0.0.1:$PORT" ENV_PATH="$APP/.env" node /tmp/migrate.mjs

# --- 5) verify the COPY ---
echo "== verify COPY =="
PB_URL="http://127.0.0.1:$PORT" ENV_PATH="$APP/.env" node /tmp/verify.mjs

# --- 6) stop copy PB ---
kill $PBPID 2>/dev/null || true
trap - EXIT
sleep 1
echo "COPY_TEST_DONE"
