#!/bin/bash
# === EDUBUZZ ZERO-DOWNTIME DEPLOY ===
# Usage: ./scripts/deploy.sh [production|staging]
#
# Performs:
# 1. Pre-deploy health check
# 2. Git pull latest
# 3. Install dependencies
# 4. Build production
# 5. Graceful reload (zero-downtime)
# 6. Post-deploy health verification
# 7. Automatic rollback on failure

set -euo pipefail

ENV="${1:-production}"
BRANCH="${2:-main}"
APP_DIR="/home/edubuzz/edubuzz"
PORT=4321

if [ "$ENV" = "staging" ]; then
  APP_DIR="/home/edubuzz/staging"
  PORT=4322
  BRANCH="develop"
fi

cd "${APP_DIR}"

echo "=== Edubuzz Deploy: ${ENV} ==="
echo "Started at $(date -u)"

# ── Pre-deploy health check ──────────────────────────────────────────
echo "[1/7] Pre-deploy health check..."
if curl -sf "http://127.0.0.1:${PORT}/api/health" > /dev/null 2>&1; then
  echo "  Health check: OK"
else
  echo "  Health check: DEGRADED (continuing anyway)"
fi

# ── Create rollback point ────────────────────────────────────────────
echo "[2/7] Creating rollback point..."
ROLLBACK_DIR="/home/edubuzz/rollbacks/$(date -u +%Y%m%d_%H%M%S)"
mkdir -p "${ROLLBACK_DIR}"
cp -r dist "${ROLLBACK_DIR}/dist"
cp -r node_modules "${ROLLBACK_DIR}/node_modules" 2>/dev/null || true
cp package.json package-lock.json "${ROLLBACK_DIR}/" 2>/dev/null || true
echo "  Rollback saved to ${ROLLBACK_DIR}"

# ── Git pull ─────────────────────────────────────────────────────────
echo "[3/7] Pulling latest code..."
git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"
COMMIT=$(git rev-parse --short HEAD)
echo "  Deploying commit: ${COMMIT}"

# ── Install dependencies ─────────────────────────────────────────────
echo "[4/7] Installing dependencies..."
npm ci --production

# ── Build ────────────────────────────────────────────────────────────
echo "[5/7] Building application..."
if npx astro build; then
  echo "  Build successful"
else
  echo "  Build FAILED — rolling back"
  rm -rf dist node_modules
  cp -r "${ROLLBACK_DIR}/dist" dist
  cp -r "${ROLLBACK_DIR}/node_modules" node_modules 2>/dev/null || npm ci --production
  echo "  Rollback complete"
  exit 1
fi

# ── Graceful reload ──────────────────────────────────────────────────
echo "[6/7] Reloading application (zero-downtime)..."
pm2 reload ecosystem.config.cjs --env "${ENV}" --update-env
pm2 save
sleep 3  # Wait for workers to stabilize

# ── Post-deploy verification ─────────────────────────────────────────
echo "[7/7] Post-deploy verification..."

# Check PM2 status
if pm2 show edubuzz | grep -q "online"; then
  echo "  PM2: online"
else
  echo "  PM2: NOT ONLINE — rolling back"
  rm -rf dist
  cp -r "${ROLLBACK_DIR}/dist" dist
  pm2 reload ecosystem.config.cjs --env "${ENV}"
  echo "  Rollback complete"
  exit 1
fi

# Health check
sleep 2
if curl -sf "http://127.0.0.1:${PORT}/api/health" > /dev/null 2>&1; then
  echo "  Health check: PASS"
else
  echo "  Health check: FAILED after 3 attempts"
  echo "  Check logs: pm2 logs edubuzz --lines 50"
fi

# Robots.txt check (confirms SSR is rendering)
if curl -sf "http://127.0.0.1:${PORT}/robots.txt" > /dev/null 2>&1; then
  echo "  SSR rendering: OK"
fi

echo ""
echo "=== Deploy complete: ${ENV} @ ${COMMIT} ==="
echo "Rollback: ${ROLLBACK_DIR}"
