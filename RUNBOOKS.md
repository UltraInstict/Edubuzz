# Edubuzz Incident Runbooks

## Severity Levels

| Level | Name | Response Time | Examples |
|-------|------|--------------|----------|
| S0 | Critical | 15 min | Site down, data loss, payment failure |
| S1 | High | 30 min | Search broken, login failure, 500 errors |
| S2 | Medium | 2 hours | Slow pages, missing jobs, email failures |
| S3 | Low | 24 hours | Minor UI bugs, typo, non-critical |

---

## Alert Definitions

### Alert: Site Down
**Trigger**: Health check returns 5xx for 2+ minutes
**Severity**: S0 - Critical
```
RUNBOOK_S0_SITE_DOWN
1. Verify: curl -I https://edubuzz.co.za
2. Check PM2: pm2 status
3. Check Nginx: systemctl status nginx
4. Check disk space: df -h
5. Check memory: free -m
6. Check logs: pm2 logs edubuzz --lines 50
7. Restart if crashed: pm2 restart edubuzz
8. Escalate if no recovery within 5 min
```

### Alert: High Error Rate
**Trigger**: 5xx rate > 5% for 5 minutes
**Severity**: S1 - High
```
RUNBOOK_S1_HIGH_ERRORS
1. Check logs: pm2 logs edubuzz --lines 100 --err
2. Check recent deploys: git log -1
3. Check PocketBase: curl http://127.0.0.1:8090/api/health
4. Check disk: df -h (PocketBase needs free space for SQLite)
5. Rollback if post-deploy: bash scripts/deploy-rollback.sh
6. Restart PM2: pm2 reload edubuzz
```

### Alert: PocketBase Unreachable
**Trigger**: Health check reports database error
**Severity**: S1 - High
```
RUNBOOK_S1_PB_DOWN
1. Check PocketBase process: ps aux | grep pocketbase
2. Check PB logs: tail -100 /home/edubuzz/pb_data/logs/*.log
3. Restart PocketBase: systemctl restart pocketbase
4. Verify: curl http://127.0.0.1:8090/api/health
5. If PB won't start: restore from latest backup
```

### Alert: High Memory Usage
**Trigger**: Memory > 450MB heap, or total system < 200MB free
**Severity**: S2 - Medium
```
RUNBOOK_S2_HIGH_MEMORY
1. Check: pm2 monit
2. Check memory per worker: pm2 list
3. If heap growing: pm2 reload edubuzz (reloads workers)
4. If memory leak suspected: pm2 restart edubuzz
5. Check latest deploy for memory regressions
6. Long-term: increase PM2 max_memory_restart or add workers
```

### Alert: SSL Certificate Expiry
**Trigger**: Certificate expires within 7 days
**Severity**: S1 - High
```
RUNBOOK_S1_SSL_EXPIRY
1. Check: certbot certificates
2. Renew: certbot renew --dry-run
3. Apply: certbot renew
4. Reload: systemctl reload nginx
5. Verify: curl -vI https://edubuzz.co.za 2>&1 | grep "expire date"
```

### Alert: Disk Space Low
**Trigger**: Disk usage > 85%
**Severity**: S2 - Medium
```
RUNBOOK_S2_DISK_SPACE
1. Check: df -h
2. Find large files: du -sh /home/edubuzz/* | sort -h | tail -10
3. Clean PM2 logs: pm2 flush
4. Clean old backups: find /home/edubuzz/backups -mtime +30 -delete
5. Clean PB logs: find /home/edubuzz/pb_data/logs -mtime +7 -delete
6. Check for core dumps: find / -name "core.*" -size +50M -delete
```

### Alert: Deployment Failure
**Trigger**: CI/CD deploy job fails
**Severity**: S2 - Medium
```
RUNBOOK_S2_DEPLOY_FAIL
1. Check CI logs in GitHub Actions
2. Build locally: npm run build
3. Check disk space on server: df -h
4. Check git status: git status
5. Manual deploy: bash scripts/deploy.sh
6. If build fails, rollback from /home/edubuzz/rollbacks/
```

---

## Escalation Contacts

| Role | Contact | When |
|------|---------|------|
| Primary on-call | Engineering lead | S0/S1 any time |
| DevOps | Infrastructure engineer | S0 server issues, S1 DB issues |
| Backend | Senior developer | S1/S2 API issues |
| Frontend | UI developer | S2/S3 rendering issues |
| Business | Product manager | S0/S1 during business hours |

---

## Automated Recovery Systems

### PM2 Auto-Restart
```
ecosystem.config.cjs:
  max_memory_restart: '512M'   → auto-restart if memory exceeds 512MB
  max_restarts: 10             → stop trying after 10 crashes
  restart_delay: 5000          → wait 5s between restarts
  min_uptime: '30s'            → consider "started" after 30s
```

### Health Check Monitoring
```
GET /api/health      → 200 OK or 503 DEGRADED
GET /api/health?full → detailed JSON with DB latency, memory, uptime
```

### Cron Jobs
```cron
# Backup
0 2 * * * /home/edubuzz/edubuzz/scripts/backup.sh daily
0 3 * * 0 /home/edubuzz/edubuzz/scripts/backup.sh weekly
0 4 1 * * /home/edubuzz/edubuzz/scripts/backup.sh monthly

# Health check (every 5 min)
*/5 * * * * curl -sf http://127.0.0.1:4321/api/health || echo "Health check failed at $(date)" >> /home/edubuzz/logs/health-alerts.log

# PM2 log rotation (daily)
0 1 * * * pm2 flush

# SSL renewal check (weekly)
0 0 * * 1 certbot renew --quiet
```
