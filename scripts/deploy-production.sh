#!/usr/bin/env bash
# Run as edubuzz. Build beside the live assets and retain the previous dist.
set -euo pipefail
cd /home/edubuzz/app
test "$(id -un)" = edubuzz
exec 9>/home/edubuzz/deploy.lock
flock 9
test "$(git branch --show-current)" = main
test -z "$(git status --porcelain --untracked-files=no)"
git pull --ff-only origin main
bash scripts/predeploy-check.sh /home/edubuzz/app
release=$(git rev-parse --short HEAD)
stamp=$(date -u +%Y%m%dT%H%M%SZ)
staged="/home/edubuzz/app/.release-dist-${release}-${stamp}"
previous="/home/edubuzz/app/.previous-dist-${stamp}"
test ! -e "$staged"
test ! -e "$previous"
test -d /home/edubuzz/app/dist
npm ci
npm test
ASTRO_TELEMETRY_DISABLED=1 npm run build -- --outDir "$staged"
test -f "$staged/server/entry.mjs"
test -f "$staged/client/images/edubuzz-campus.webp"
mv /home/edubuzz/app/dist "$previous"
mv "$staged" /home/edubuzz/app/dist
rollback() {
  echo "Health check failed; restoring previous build."
  mv /home/edubuzz/app/dist "/home/edubuzz/app/.failed-dist-${stamp}"
  mv "$previous" /home/edubuzz/app/dist
  pm2 reload edubuzz --update-env
  exit 1
}
pm2 reload edubuzz --update-env || rollback
healthy=false
for attempt in 1 2 3 4 5; do
  if body=$(curl --fail --silent http://127.0.0.1:4321/company/capitec) && [[ "$body" == *'Sources and verification limits'* ]]; then
    healthy=true
    break
  fi
  sleep 2
done
$healthy || rollback
ads=$(curl --fail --silent http://127.0.0.1:4321/ads.txt) || rollback
[[ "$ads" == 'google.com, pub-4848750388169101, DIRECT, f08c47fec0942fa0' ]] || rollback
pm2 save
echo "Release ${release} deployed. Previous build retained at ${previous}"
