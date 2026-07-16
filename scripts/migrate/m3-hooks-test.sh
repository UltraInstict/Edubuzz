#!/usr/bin/env bash
# Test the corrected pb_hooks on a throwaway copy of (migrated) production.
set -euo pipefail
APP=/home/edubuzz/app
PB=/home/edubuzz/pocketbase/pocketbase
COPY=/tmp/m3_hooks_copy
HOOKS=/tmp/m3_hooks_dir
PORT=8092

echo "== backup (current migrated state) =="
bash "$APP/scripts/backup.sh" daily
BK=$(ls -t /home/edubuzz/backups/daily/edubuzz_daily_*.zip* 2>/dev/null | head -1)
echo "backup=$BK"

rm -rf "$COPY" "$HOOKS"; mkdir -p "$COPY/extract" "$HOOKS"
if [[ "$BK" == *.gpg ]]; then gpg --batch --yes -d "$BK" > "$COPY/backup.zip"; else cp "$BK" "$COPY/backup.zip"; fi
unzip -q "$COPY/backup.zip" -d "$COPY/extract"
DATADIR=$(dirname "$(find "$COPY/extract" -name data.db | head -1)")
echo "datadir=$DATADIR"

# only main.pb.js in the test hooks dir (isolate; schema.js is just docs/exports)
cp /tmp/main.pb.js "$HOOKS/main.pb.js"

echo "== boot copy PB with NEW hooks on :$PORT =="
"$PB" serve --dir "$DATADIR" --hooksDir "$HOOKS" --http "127.0.0.1:$PORT" >/tmp/m3_pb8092.log 2>&1 &
PBPID=$!
trap 'kill $PBPID 2>/dev/null || true' EXIT
for i in $(seq 1 15); do curl -s "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1 && break; sleep 1; done
echo "--- boot log (hook errors would appear here) ---"
grep -iE 'error|panic|fail' /tmp/m3_pb8092.log | head -20 || echo "(no error lines)"
echo "--- end boot log ---"

echo "== run hooks test =="
PB_URL="http://127.0.0.1:$PORT" ENV_PATH="$APP/.env" node /tmp/hooks-test.mjs

kill $PBPID 2>/dev/null || true; trap - EXIT; sleep 1
echo "HOOKS_COPY_TEST_DONE"
