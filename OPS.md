# Edubuzz.co.za — Operations & Reliability Architecture

## Infrastructure Audit

### Current State

| Component | Status | Risk Level |
|-----------|--------|-----------|
| Astro SSR (Node) | Single process, manual start | Medium |
| PocketBase (Go) | Single binary, SQLite backend | Medium |
| Nginx | Reverse proxy + SSL + caching | Low |
| PM2 | Not configured | High |
| Backups | Encrypted daily/weekly/monthly GPG | Low |
| Monitoring | None | Critical |
| Logging | Console only (stdout/stderr) | High |
| CI/CD | None | High |
| Health checks | None | Critical |
| Staging env | None | Medium |
| Load testing | None | Medium |

### Risks Identified

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| No process monitoring | Downtime undetected | High | PM2 with auto-restart |
| No health checks | Silent failures | High | /api/health endpoint |
| No alerting | Delayed response | High | Cron-based health checks |
| Single-threaded Node | CPU bottleneck under load | Medium | PM2 cluster mode |
| No CI/CD | Manual deploy errors | Medium | GitHub Actions pipeline |
| No staging | Untested production deploys | Medium | Staging branch + env |
| SQLite single file | Data corruption risk | Low | Encrypted backups, health checks |
| No load balancing | Single point of failure | Low | Nginx upstream + PM2 cluster |

---

## Systems Built

### 1. PM2 Process Management (`ecosystem.config.cjs`)
- Cluster mode: `instances: max` (one worker per CPU core)
- Auto-restart on crash: `max_restarts: 10`, 5s delay
- Memory protection: auto-restart at 512MB heap
- JSON log output for structured log ingestion
- Production and staging environment configs
- PM2 deploy config for git-based deployments

### 2. Structured Logging (`src/lib/logger.ts`)
- JSON-format logs with timestamp, service, environment, and level
- Request metrics: method, path, status, duration, user-agent, IP
- Process metrics: RSS, heap used, heap total, uptime, PID
- Automatic 5-min process metric logging in production
- Compatible with Loki, BetterStack, Datadog, ELK

### 3. Health Checks (`GET /api/health`)
- Light mode: returns `200 OK` or `503 DEGRADED`
- Full mode (`?full=1`): JSON with DB latency, memory, uptime, checks
- Database connectivity verification
- Memory threshold monitoring (alert at 450MB)
- Uptime reporting
- No-cache headers for monitoring freshness

### 4. CI/CD Pipeline (`.github/workflows/ci.yml`)
- Build check on every push and PR
- Type checking (`astro check`)
- Production build verification
- Bundle size reporting
- Auto-deploy to production on `main` push
- Auto-deploy to staging on `develop` push
- Post-deploy health verification
- SSH-based deployment with secrets

### 5. Zero-Downtime Deploy (`scripts/deploy.sh`)
- Pre-deploy health check
- Automatic rollback point creation
- Git pull + dependency install + build
- Graceful `pm2 reload` (zero-downtime)
- Post-deploy verification (health check + robots.txt)
- Automatic rollback on build or startup failure

### 6. Backup System (`scripts/backup.sh`)
- GPG-encrypted tarballs
- Pre-backup health verification
- Backup integrity validation (decrypt test)
- Backs up: PB data, .env, uploads, PM2 config, Nginx config
- Three-tier retention: daily (7), weekly (4), monthly (6)

### 7. Restore System (`scripts/restore.sh`)
- Decrypt + extract + stop services + restore + restart + verify
- Pre-restore backup of current data
- Automatic health verification after restore

### 8. Incident Runbooks (`RUNBOOKS.md`)
- 4 severity levels (S0-Critical to S3-Low)
- 7 alert definitions with response times
- Step-by-step runbooks for each alert type
- Escalation contacts
- Automated recovery systems documentation
- Cron job schedule

---

## Performance Optimizations Applied

### Nginx
- `proxy_buffer_size 4k; proxy_buffers 8 16k; proxy_busy_buffers_size 32k` — optimizes SSR throughput
- `proxy_connect_timeout 5s` — fail fast on backend issues
- `proxy_read_timeout 30s` — prevent hung connections
- Dedicated rate limit zones per endpoint type
- Static asset caching: 1 year immutable
- HTML caching: 60s with stale-while-revalidate 300s + stale-if-error 86400s

### Node.js (Astro SSR)
- PM2 cluster mode: N workers per N CPU cores
- Memory limit enforcement at process level
- Structured JSON logging (lower overhead than string interpolation)
- Health check endpoint for external monitoring

### PocketBase
- SQLite WAL mode (default in PocketBase)
- Connection pooling through PocketBase SDK
- Query result caching through service layer
- Expired record cleanup via hooks

---

## Monitoring Architecture

```
Application
    │
    ├── PM2 metrics (CPU, memory, restarts)
    │   └── pm2 status / pm2 monit
    │
    ├── Health check endpoint (/api/health)
    │   └── Cron every 5 min → log alerts
    │
    ├── Structured JSON logs
    │   ├── PM2 log files → Loki ingestion (future)
    │   └── Console → BetterStack/syslog (future)
    │
    ├── Nginx access/error logs
    │   └── System journal / syslog
    │
    └── CI/CD deploy logs
        └── GitHub Actions dashboard
```

### External Monitoring (Recommended)
- **UptimeRobot** (free tier): ping `/api/health` every 60s
- **BetterStack** (free tier): structured log ingestion, heartbeat monitoring
- **Sentry** (free tier): JavaScript error tracking (add Astro integration)
- **Grafana + Prometheus + Loki** (self-hosted): full observability stack

---

## Scalability Readiness

### Current Capacity (Single VPS)
- Astro SSR: 4 workers (4-core VPS) via PM2 cluster
- PocketBase: single instance
- Nginx: reverse proxy + static serving
- Estimated: 500+ concurrent users, 50 req/s

### Horizontal Scaling Path
```
Phase 1 (Current):   Nginx → PM2 cluster (4 workers) → PocketBase
Phase 2 (4 weeks):   Nginx → upstream backend pool → Redis cache → PocketBase
Phase 3 (8 weeks):   Cloudflare → Load balancer → Astro cluster (2+ VPS) → PostgreSQL → Redis
```

### Key Scaling Metrics
- CPU usage per worker (PM2)
- Memory heap per worker
- PocketBase query latency (health check)
- Request rate per second (Nginx access log)
- Error rate (5xx / total requests)

---

## Production Hardening Checklist

### Pre-Deploy
- [ ] `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` set in `.env`
- [ ] `CSRF_SECRET` generated with `openssl rand -hex 32`
- [ ] `INDEXNOW_KEY` generated with `openssl rand -hex 16`
- [ ] SMTP credentials set and tested
- [ ] GPG key present for backups
- [ ] Build passes: `npm run build`

### Deploy
- [ ] Run `bash scripts/deploy.sh production`
- [ ] Verify PM2: `pm2 status` shows all workers online
- [ ] Health check: `curl https://edubuzz.co.za/api/health`
- [ ] Verify robots.txt renders
- [ ] Check logs: `pm2 logs edubuzz --lines 20`

### Post-Deploy
- [ ] Run manual backup: `bash scripts/backup.sh daily`
- [ ] Verify backup decrypt: `gpg -d backup.tar.gz.gpg > /dev/null`
- [ ] Set up cron jobs per RUNBOOKS.md
- [ ] Configure UptimeRobot for `/api/health`
- [ ] Verify SSL: `curl -vI https://edubuzz.co.za 2>&1 | grep -E "(expire|issuer)"`
- [ ] Check HSTS: response includes `Strict-Transport-Security`
- [ ] Verify CSP: response includes `Content-Security-Policy`
- [ ] Submit to Google Search Console and Bing Webmaster Tools

---

## Operational Risk Analysis

| Risk | Probability | Impact | RPN | Controls |
|------|-----------|--------|-----|----------|
| VPS hardware failure | Low | High | 12 | GPG backups + restore script + offsite replication |
| DDoS attack | Low | High | 8 | Nginx rate limiting + Cloudflare (future) |
| SQLite corruption | Low | High | 12 | Daily encrypted backups + integrity validation |
| Accidental deploy | Medium | Medium | 9 | Rollback points + deploy verification |
| SSL expiry | Low | High | 6 | Auto-renewal certbot + 7-day alert |
| Memory leak | Medium | Medium | 9 | PM2 auto-restart at 512MB + monitoring |
| Zero-day in Astro/PocketBase | Low | Medium | 4 | CI/CD dependency audit + regular updates |
| Credential leak | Low | Critical | 8 | .env not in git, secrets in GitHub Actions |
