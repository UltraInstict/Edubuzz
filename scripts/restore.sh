#!/bin/bash
# === EDUBUZZ RESTORE SCRIPT ===
# Restore from encrypted backup
# Usage: ./scripts/restore.sh /path/to/backup.tar.gz.gpg [target_dir]

set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET="${2:-/home/edubuzz}"

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "Usage: restore.sh <backup.tar.gz.gpg> [target_dir]"
  echo "  backup.tar.gz.gpg — path to encrypted backup file"
  echo "  target_dir         — restore destination (default: /home/edubuzz)"
  exit 1
fi

echo "=== Edubuzz Restore ==="
echo "Backup: ${BACKUP_FILE}"
echo "Target: ${TARGET}"
echo ""

# ── Decrypt ──────────────────────────────────────────────────────────
echo "[1/5] Decrypting backup..."
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

gpg --batch --decrypt "${BACKUP_FILE}" > "${TEMP_DIR}/backup.tar.gz" 2>&1
echo "  Decrypted OK"

# ── Extract ──────────────────────────────────────────────────────────
echo "[2/5] Extracting backup..."
tar -xzf "${TEMP_DIR}/backup.tar.gz" -C "${TEMP_DIR}"
echo "  Extracted OK"

# ── Stop services ────────────────────────────────────────────────────
echo "[3/5] Stopping services..."
pm2 stop edubuzz 2>/dev/null || true
echo "  Services stopped"

# ── Restore data ─────────────────────────────────────────────────────
echo "[4/5] Restoring data..."

# Restore PocketBase
if [ -d "${TEMP_DIR}/pb_data" ]; then
  echo "  Restoring PocketBase data..."
  if [ -d "${TARGET}/pb_data" ]; then
    cp -r "${TARGET}/pb_data" "${TARGET}/pb_data.bak.$(date +%Y%m%d_%H%M%S)"
  fi
  cp -r "${TEMP_DIR}/pb_data" "${TARGET}/pb_data"
fi

# Restore env
if [ -f "${TEMP_DIR}/.env.backup" ]; then
  echo "  Restoring .env config..."
  cp "${TEMP_DIR}/.env.backup" "${TARGET}/edubuzz/.env"
fi

# Restore uploads
if [ -d "${TEMP_DIR}/_astro" ]; then
  echo "  Restoring static uploads..."
  mkdir -p "${TARGET}/edubuzz/dist/client/_astro"
  cp -r "${TEMP_DIR}/_astro"/* "${TARGET}/edubuzz/dist/client/_astro/" 2>/dev/null || true
fi

# Restore configs
if [ -f "${TEMP_DIR}/nginx.conf" ]; then
  echo "  Restoring Nginx config..."
  cp "${TEMP_DIR}/nginx.conf" /etc/nginx/sites-available/edubuzz 2>/dev/null || \
    cp "${TEMP_DIR}/nginx.conf" "${TARGET}/edubuzz/nginx.conf.restored"
fi

if [ -f "${TEMP_DIR}/ecosystem.config.cjs" ]; then
  echo "  Restoring PM2 config..."
  cp "${TEMP_DIR}/ecosystem.config.cjs" "${TARGET}/edubuzz/ecosystem.config.cjs"
fi

# ── Restart services ─────────────────────────────────────────────────
echo "[5/5] Restarting services..."
cd "${TARGET}/edubuzz"
pm2 start ecosystem.config.cjs --env production
pm2 save

# Reload Nginx if config was restored
if [ -f "/etc/nginx/sites-available/edubuzz" ]; then
  nginx -t && systemctl reload nginx
fi

sleep 3

# Health check
if curl -sf "http://127.0.0.1:4321/api/health" > /dev/null 2>&1; then
  echo "  Health check: PASS"
else
  echo "  Health check: FAILED — check pm2 logs edubuzz"
fi

echo ""
echo "=== Restore complete ==="
echo "PocketBase: ${TARGET}/pb_data"
echo "Previous data backed up to: ${TARGET}/pb_data.bak.*"
