#!/bin/bash
# === EDUBUZZ PRODUCTION BACKUP SCRIPT ===
# Automated encrypted backup for PocketBase DB + uploads + config
# Schedule: daily via cron at 2am SAST
#
# Usage: ./backup.sh [daily|weekly|monthly]
#   daily   — keep 7 days
#   weekly  — keep 4 weeks
#   monthly — keep 6 months

set -euo pipefail

RETENTION_TYPE="${1:-daily}"
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
BACKUP_ROOT="/home/edubuzz/backups"
BACKUP_DIR="${BACKUP_ROOT}/${RETENTION_TYPE}"
BACKUP_FILE="${BACKUP_DIR}/edubuzz_${RETENTION_TYPE}_${TIMESTAMP}.tar.gz.gpg"
PB_DIR="/home/edubuzz/pb_data"
UPLOADS_DIR="/home/edubuzz/edubuzz/dist/client"
ENV_FILE="/home/edubuzz/edubuzz/.env"
GPG_RECIPIENT="admin@edubuzz.co.za"
HEALTH_URL="http://127.0.0.1:4321/api/health"

echo "[$(date -u)] Starting ${RETENTION_TYPE} backup..."

# ── Pre-backup health check ──────────────────────────────────────────
if curl -sf "${HEALTH_URL}" > /dev/null 2>&1; then
  echo "[$(date -u)] Pre-backup health check: OK"
else
  echo "[$(date -u)] WARNING: Health check failed, proceeding anyway"
fi

mkdir -p "${BACKUP_DIR}"

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

# ── Backup PocketBase data ──────────────────────────────────────────
if [ -d "${PB_DIR}" ]; then
  cp -r "${PB_DIR}" "${TEMP_DIR}/pb_data"
  echo "[$(date -u)] Backed up PocketBase data"
else
  echo "[$(date -u)] WARNING: PocketBase data directory not found"
fi

# ── Backup environment config ────────────────────────────────────────
if [ -f "${ENV_FILE}" ]; then
  cp "${ENV_FILE}" "${TEMP_DIR}/.env.backup"
  echo "[$(date -u)] Backed up environment config"
fi

# ── Backup static uploads ────────────────────────────────────────────
if [ -d "${UPLOADS_DIR}" ]; then
  cp -r "${UPLOADS_DIR}/_astro" "${TEMP_DIR}/_astro" 2>/dev/null || true
fi

# ── Backup PM2 config ────────────────────────────────────────────────
if [ -f "/home/edubuzz/edubuzz/ecosystem.config.cjs" ]; then
  cp /home/edubuzz/edubuzz/ecosystem.config.cjs "${TEMP_DIR}/ecosystem.config.cjs"
fi

# ── Backup Nginx config ──────────────────────────────────────────────
if [ -f "/home/edubuzz/edubuzz/nginx.conf" ]; then
  cp /home/edubuzz/edubuzz/nginx.conf "${TEMP_DIR}/nginx.conf"
fi

# ── Create and encrypt archive ───────────────────────────────────────
tar -czf "${TEMP_DIR}/backup.tar.gz" -C "${TEMP_DIR}" pb_data .env.backup _astro ecosystem.config.cjs nginx.conf 2>/dev/null || \
  tar -czf "${TEMP_DIR}/backup.tar.gz" -C "${TEMP_DIR}" pb_data .env.backup

gpg --batch --yes --trust-model always -e -r "${GPG_RECIPIENT}" -o "${BACKUP_FILE}" "${TEMP_DIR}/backup.tar.gz"

BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}" 2>/dev/null || echo "0")
echo "[$(date -u)] Backup created: ${BACKUP_FILE} (${BACKUP_SIZE} bytes)"

# ── Validate backup integrity ────────────────────────────────────────
if gpg --batch --quiet --decrypt "${BACKUP_FILE}" > /dev/null 2>&1; then
  echo "[$(date -u)] Backup integrity: VERIFIED"
else
  echo "[$(date -u)] ERROR: Backup integrity check failed!"
fi

# ── Retention cleanup ────────────────────────────────────────────────
case "${RETENTION_TYPE}" in
  daily)
    find "${BACKUP_DIR}" -name "edubuzz_daily_*.tar.gz.gpg" -mtime +7 -delete
    ;;
  weekly)
    find "${BACKUP_DIR}" -name "edubuzz_weekly_*.tar.gz.gpg" -mtime +31 -delete
    ;;
  monthly)
    find "${BACKUP_DIR}" -name "edubuzz_monthly_*.tar.gz.gpg" -mtime +183 -delete
    ;;
esac

echo "[$(date -u)] Backup complete."

