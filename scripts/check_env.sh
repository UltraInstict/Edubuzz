#!/bin/bash
PID=$(cat /root/.pm2/pids/edubuzz-0.pid 2>/dev/null)
echo "PID: $PID"
if [ -n "$PID" ]; then
  strings /proc/$PID/environ | grep -E 'PB_ADMIN|CSRF_SECRET|PB_URL|SITE_URL'
fi
echo "---"
echo "Contents of .env:"
cat /home/edubuzz/app/.env
echo "---"
echo "PM2 env:"
pm2 env 0 2>/dev/null
