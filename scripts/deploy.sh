#!/bin/bash
set -e

echo "=== DEPLOY PHASE 1C ==="
echo "$(date): Starting deploy"

# 1. Stop PM2 app (no downtime, but cleaner)
# pm2 stop edubuzz

# 2. Clean old dist
echo "Cleaning old dist..."
rm -rf /home/edubuzz/app/dist.bak
mv /home/edubuzz/app/dist /home/edubuzz/app/dist.bak 2>/dev/null || true
mkdir -p /home/edubuzz/app/dist/server /home/edubuzz/app/dist/client

# 3. Extract new build
echo "Extracting new build..."
tar -xzf /tmp/phase1c-build.tar.gz -C /home/edubuzz/app/dist/

# 4. Deploy hooks
echo "Deploying hooks..."
cp /home/edubuzz/app/pb_hooks/main.pb.js /home/edubuzz/pocketbase/pb_hooks/main.pb.js
cp /home/edubuzz/app/pb_hooks/schema.js /home/edubuzz/pocketbase/pb_hooks/schema.js

# 5. Restart PocketBase to pick up hooks
echo "Restarting PocketBase..."
systemctl restart pocketbase
sleep 4
curl -s http://127.0.0.1:8090/api/health
echo ""

# 6. Copy scripts to app
cp /tmp/monet-fix.cjs /home/edubuzz/app/scripts/monet-fix.cjs 2>/dev/null || true

# 7. Restart PM2
echo "Restarting PM2..."
pm2 restart edubuzz --update-env
sleep 3

# 8. Verify
echo ""
echo "=== HEALTH CHECKS ==="
curl -s -o /dev/null -w "Homepage: %{http_code}\n" https://edubuzz.co.za/
curl -s -o /dev/null -w "Jobs: %{http_code}\n" https://edubuzz.co.za/jobs
pm2 list 2>/dev/null | grep edubuzz

echo ""
echo "=== DEPLOY COMPLETE ==="
