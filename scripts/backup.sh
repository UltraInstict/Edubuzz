#!/bin/bash
# === EDUBUZZ PRODUCTION BACKUP SCRIPT (PocketBase-native) ===
# Creates a consistent PocketBase backup via the admin API (not a raw cp of a
# live SQLite dir, which risks WAL inconsistency), copies it to the retention
# folder, verifies integrity, and prunes old backups.
#
# Usage: ./backup.sh [daily|weekly|monthly]
#
# Requires: PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD in /home/edubuzz/app/.env
# Optional: if a GPG key for $GPG_RECIPIENT exists, the archive is also
#           encrypted at rest; otherwise the plain zip is kept (still valid).

set -euo pipefail

RETENTION_TYPE="${1:-daily}"
TS=$(date -u +%Y%m%d_%H%M%S)
APP_DIR="/home/edubuzz/app"
PB_DATA_BACKUPS="/home/edubuzz/pocketbase/pb_data/backups"
BACKUP_ROOT="/home/edubuzz/backups"
BACKUP_DIR="${BACKUP_ROOT}/${RETENTION_TYPE}"
GPG_RECIPIENT="admin@edubuzz.co.za"

# Load credentials + PB_URL from the app .env
set -a
# shellcheck disable=SC1091
. "${APP_DIR}/.env"
set +a
PB_URL="${PB_URL:-http://127.0.0.1:8090}"

echo "[$(date -u)] Starting ${RETENTION_TYPE} backup (PB-native)..."
mkdir -p "${BACKUP_DIR}"

# ── Authenticate as superuser ────────────────────────────────────────
AUTH_BODY=$(EMAIL="${PB_ADMIN_EMAIL}" PW="${PB_ADMIN_PASSWORD}" python3 -c \
  'import json,os;print(json.dumps({"identity":os.environ["EMAIL"],"password":os.environ["PW"]}))')
TOKEN=$(printf '%s' "${AUTH_BODY}" | curl -s -X POST \
  "${PB_URL}/api/collections/_superusers/auth-with-password" \
  -H 'Content-Type: application/json' --data-binary @- \
  | grep -o '"token":"[^"]*"' | sed 's/.*:"//; s/"//')
if [ -z "${TOKEN}" ]; then
  echo "[$(date -u)] ERROR: PocketBase superuser auth failed — backup aborted." >&2
  exit 1
fi

# ── Create PB-native backup ──────────────────────────────────────────
NAME="edubuzz_${RETENTION_TYPE}_${TS}.zip"
HTTP=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${PB_URL}/api/backups" \
  -H "Authorization: ${TOKEN}" -H 'Content-Type: application/json' \
  -d "{\"name\":\"${NAME}\"}")
if [ "${HTTP}" != "204" ] && [ "${HTTP}" != "200" ]; then
  echo "[$(date -u)] ERROR: backup create returned HTTP ${HTTP} — aborted." >&2
  exit 1
fi
SRC="${PB_DATA_BACKUPS}/${NAME}"
# small settle time for the file to flush
for _ in 1 2 3 4 5; do [ -f "${SRC}" ] && break; sleep 1; done
if [ ! -f "${SRC}" ]; then
  echo "[$(date -u)] ERROR: expected backup file not found at ${SRC}" >&2
  exit 1
fi

# ── Copy to retention folder ─────────────────────────────────────────
DEST="${BACKUP_DIR}/${NAME}"
cp "${SRC}" "${DEST}"
# The PB copy inside pb_data/backups is transient; remove it to avoid bloat.
rm -f "${SRC}"
SIZE=$(stat -c%s "${DEST}" 2>/dev/null || echo 0)
echo "[$(date -u)] Backup created: ${DEST} (${SIZE} bytes)"

# ── Integrity check (valid zip) ──────────────────────────────────────
if unzip -t "${DEST}" >/dev/null 2>&1; then
  echo "[$(date -u)] Backup integrity: VERIFIED (valid zip)"
else
  echo "[$(date -u)] ERROR: backup zip failed integrity check!" >&2
  exit 1
fi

# ── Optional encryption at rest (only if a GPG key is available) ─────
if gpg --list-keys "${GPG_RECIPIENT}" >/dev/null 2>&1; then
  if gpg --batch --yes --trust-model always -e -r "${GPG_RECIPIENT}" -o "${DEST}.gpg" "${DEST}"; then
    rm -f "${DEST}"
    echo "[$(date -u)] Encrypted at rest -> ${DEST}.gpg"
  fi
else
  echo "[$(date -u)] NOTE: no GPG key for ${GPG_RECIPIENT}; storing unencrypted zip."
fi

# ── Retention cleanup ────────────────────────────────────────────────
case "${RETENTION_TYPE}" in
  daily)   find "${BACKUP_DIR}" -name "edubuzz_daily_*.zip*"   -mtime +7   -delete ;;
  weekly)  find "${BACKUP_DIR}" -name "edubuzz_weekly_*.zip*"  -mtime +31  -delete ;;
  monthly) find "${BACKUP_DIR}" -name "edubuzz_monthly_*.zip*" -mtime +183 -delete ;;
esac

echo "[$(date -u)] Backup complete."
