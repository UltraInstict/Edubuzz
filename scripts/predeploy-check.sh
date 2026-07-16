#!/usr/bin/env bash
# ── PRE-DEPLOY DRIFT GUARD ───────────────────────────────────────────────────
# Run ON THE SERVER, in the app dir, BEFORE `npm ci && npm run build`.
# Refuses to proceed (non-zero exit) if the working tree is dirty or not exactly
# in sync with origin/main.
#
# Why: a silently-drifted server (uncommitted edits + behind origin, with a
# hand-built dist) caused the company-page crash. Deploys must only ever build
# from a clean checkout that matches origin/main.
#
# Canonical deploy sequence:
#   git fetch origin && bash scripts/predeploy-check.sh \
#     && git pull --ff-only origin main \
#     && npm ci && npm run build \
#     && pm2 reload edubuzz --update-env
set -uo pipefail

APP_DIR="${1:-/home/edubuzz/app}"
cd "${APP_DIR}" || { echo "GUARD FAIL: app dir '${APP_DIR}' not found"; exit 2; }

git fetch origin --quiet 2>/dev/null || { echo "GUARD FAIL: git fetch failed"; exit 2; }

DIRTY=$(git status --porcelain --untracked-files=no)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

FAIL=0
if [ -n "${DIRTY}" ]; then
  echo "GUARD FAIL: uncommitted changes in working tree:"
  echo "${DIRTY}"
  FAIL=1
fi
if [ "${BRANCH}" != "main" ]; then
  echo "GUARD FAIL: not on 'main' (currently on '${BRANCH}')"
  FAIL=1
fi
if [ "${LOCAL}" != "${REMOTE}" ]; then
  echo "GUARD FAIL: HEAD (${LOCAL:0:8}) != origin/main (${REMOTE:0:8}) — server is behind or diverged"
  FAIL=1
fi

if [ "${FAIL}" -ne 0 ]; then
  echo "GUARD: refusing to build/deploy. Resolve drift first"
  echo "       (commit & push intended changes, or 'git reset --hard origin/main' to discard server-local edits)."
  exit 1
fi

echo "GUARD OK: clean tree, on main, in sync with origin/main (${LOCAL:0:8})."
