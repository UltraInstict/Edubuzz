# Edubuzz.co.za — Production Security Deployment Checklist

## Pre-Deployment Verification

### Environment Variables (.env)
- [ ] `PB_URL` set to internal PocketBase URL (not localhost)
- [ ] `SITE_URL` set to `https://edubuzz.co.za`
- [ ] `CSRF_SECRET` changed from default to 64-char random string
- [ ] `INDEXNOW_KEY` set to unique 32+ char key
- [ ] `PB_ADMIN_EMAIL` set (no hardcoded fallback)
- [ ] `PB_ADMIN_PASSWORD` set (no hardcoded fallback)
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` configured
- [ ] `PAYFAST_PASSPHRASE` set for PayFast ITN validation

### PocketBase Setup
- [ ] Collection access rules applied (see pb_hooks/collection-rules.pb.md)
- [ ] Audit logs collection created (fields: event, details, created)
- [ ] Admin password rotated to strong unique password
- [ ] SMTP configured in PocketBase settings
- [ ] File upload limits set (max 6MB per file)
- [ ] `employers` collection: blocked, suspended fields added

### SSL/TLS
- [ ] Let's Encrypt certificate installed and auto-renewal configured
- [ ] SSL Labs grade A+ verified
- [ ] HSTS preload submitted to hstspreload.org

### Nginx
- [ ] Config validated: `nginx -t`
- [ ] HSTS header present on HTTPS responses
- [ ] CSP header present and functional
- [ ] All security headers present (verify with securityheaders.com)
- [ ] Anti-bot rules active and tested
- [ ] Rate limiting functional on all API endpoints
- [ ] Static asset caching configured correctly
- [ ] Hidden files blocked (.env, .git, etc.)

### Application Build
- [ ] Production build passes: `npm run build`
- [ ] No console warnings or errors at build time
- [ ] Server starts correctly: `node dist/server/entry.mjs`
- [ ] Health check endpoint responds (e.g., /robots.txt)

### PM2 / Process Management
- [ ] PM2 configured with auto-restart
- [ ] Memory limit set (recommended: 512MB)
- [ ] Startup script installed: `pm2 startup`

## Security Verification Checklist

### Authentication
- [ ] Login functional with CSRF token
- [ ] Account lockout after 5 failed attempts
- [ ] Rate limiting on /api/auth/login (5 req/min)
- [ ] Password complexity enforced (10+ chars, upper+lower+digit+special)
- [ ] Session cookies set with HttpOnly, Secure, SameSite=Lax
- [ ] Admin session timeout set to 8 hours
- [ ] Logout clears auth cookie

### API Security
- [ ] All POST/PUT endpoints require CSRF token
- [ ] Rate limiting on all public endpoints
- [ ] File upload endpoints require proper MIME type
- [ ] File uploads randomized filenames
- [ ] Malware signature scanning active on uploads
- [ ] No stack traces in error responses
- [ ] Content-Type headers set correctly
- [ ] X-Content-Type-Options: nosniff on all responses

### Data Protection
- [ ] PocketBase collection rules applied and tested
- [ ] Employer data not exposed to public
- [ ] Applicant data only visible to admins
- [ ] CV files stored with randomized names
- [ ] No sensitive data in client-side JavaScript
- [ ] .env excluded from git (.gitignore verified)

### Content Moderation
- [ ] Spam keyword detection active on job posting
- [ ] Suspicious contact pattern detection active
- [ ] Employer quality verification active
- [ ] Moderation results logged

## Backup Verification

### Initial Backup
- [ ] Run manual backup: `bash scripts/backup.sh daily`
- [ ] Verify backup file created with non-zero size
- [ ] Verify backup is GPG encrypted
- [ ] Test decrypt: `gpg -d backup.tar.gz.gpg > backup.tar.gz`

### Automated Backups
- [ ] Daily cron job configured: `0 2 * * * /home/edubuzz/edubuzz/scripts/backup.sh daily`
- [ ] Weekly cron job: `0 3 * * 0 /home/edubuzz/edubuzz/scripts/backup.sh weekly`
- [ ] Monthly cron job: `0 4 1 * * /home/edubuzz/edubuzz/scripts/backup.sh monthly`
- [ ] Backup directory writable by edubuzz user
- [ ] GPG key present and not expiring

### Disaster Recovery Test
- [ ] Documented recovery procedure tested
- [ ] Fresh VPS can be restored from backup within 30 minutes
- [ ] Restored PocketBase starts and serves data correctly
- [ ] Restored Nginx config passes validation

## Monitoring Setup

### External Monitoring
- [ ] Uptime monitoring configured (UptimeRobot or similar)
- [ ] SSL certificate expiry monitoring
- [ ] Domain expiry monitoring

### Application Monitoring
- [ ] Error tracking configured (Sentry or similar)
- [ ] Audit logging active and writing to PocketBase
- [ ] PM2 logs rotated (pm2-logrotate installed)

### Security Monitoring
- [ ] Nginx access logs monitored for 4xx/5xx spikes
- [ ] Failed login attempts tracked via audit_logs
- [ ] Suspicious IP patterns reviewed weekly
- [ ] File integrity monitoring on critical paths

## Post-Deployment

### Search Engines
- [ ] Google Search Console property verified
- [ ] Bing Webmaster Tools property verified
- [ ] Sitemap index submitted to both
- [ ] robots.txt validated in GSC
- [ ] IndexNow key verified at /.well-known/indexnow.txt

### Performance
- [ ] PageSpeed Insights score > 90
- [ ] Core Web Vitals passing (LCP, FID, CLS)
- [ ] TTFB under 300ms on homepage
- [ ] Gzip compression verified (check response headers)

### Final Checklist
- [ ] All environment variables set and verified
- [ ] All collection rules applied
- [ ] Rate limits tested with load testing
- [ ] File upload security tested
- [ ] CSRF tokens validated on all forms
- [ ] Session handling verified (login, timeout, logout)
- [ ] Backup script tested and scheduled
- [ ] Monitoring alerts configured
- [ ] Production build deployed and serving traffic
- [ ] Error pages (404, 500) display correctly
