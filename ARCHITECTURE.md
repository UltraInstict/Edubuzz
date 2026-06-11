# Edubuzz.co.za — Architecture & Scalability Roadmap

## Current Architecture Assessment

### Strengths
- SSR-first rendering — good for SEO, TTFB acceptable
- PocketBase provides rapid prototyping velocity
- Nginx reverse proxy handles SSL and caching well
- Schema.org structured data is comprehensive
- IndexNow integration for fast indexing

### Technical Debt (Ranked by Impact)

| Priority | Issue | Impact | Fix Cost |
|----------|-------|--------|----------|
| P0 | No service/repository layer — pages call PB directly | Testability, maintainability | Created `jobService.ts` |
| P0 | Employer dashboard uses `getAdminPB()` — full superuser access | Security | Fixed — uses `getEmployerSession()` |
| P1 | Categories page N+1 queries | DB load, page speed | Fixed — single query with batch counts |
| P1 | `pocketbase.ts` God module (438 lines) | Maintainability | Service layer exists, gradual refactor planned |
| P1 | No caching layer — every request hits PocketBase | Performance under load | Redis plan below |
| P2 | Inconsistent styling (Tailwind + scoped CSS + inline) | Developer experience | Design tokens created |
| P2 | No loading/error/empty states | User experience | Created Skeleton, EmptyState, ErrorState components |
| P3 | Revenue missing from admin dashboard | Business intelligence | Fixed — queries payments collection |
| P3 | SQLite-only — single-file DB at scale | Reliability, concurrency | PostgreSQL migration plan below |

---

## Phase 1: Immediate (Current Sprint)

### 1.1 Service Layer ✅
- [x] `src/services/jobService.ts` — all job/category/employer queries
- [ ] `src/services/applicationService.ts` — application handling
- [ ] `src/services/paymentService.ts` — payment processing
- [ ] `src/services/alertService.ts` — job alert management
- [ ] `src/services/analyticsService.ts` — analytics queries and aggregation

### 1.2 Component Library ✅
- [x] Design tokens (`tokens.css`)
- [x] Skeleton loading component
- [x] EmptyState component
- [x] ErrorState component
- [x] TrustBadge component
- [ ] Card, Button, Input, Select, Badge (standardize existing)
- [ ] DataTable (reusable table with sort/filter/pagination)
- [ ] Modal component
- [ ] Toast/notification component

### 1.3 Caching Strategy
```
Request → Nginx cache (60s) → Astro SSR → PocketBase
                                      ↓
                              Service Layer
                                      ↓
                              In-memory LRU (future)
```

- Nginx: 60s page cache already configured
- Service layer: add `Map`-based TTL cache for frequently-read data (categories, provinces, site stats)
- Future: Redis for session store, query cache, rate limit persistence

---

## Phase 2: Scaling (Next 2-4 Weeks)

### 2.1 PostgreSQL Migration Path

```
Current:     Astro → PocketBase SDK → PocketBase → SQLite
Phase 2a:    Astro → Service Layer → PocketBase SDK → PocketBase → SQLite
Phase 2b:    Astro → Service Layer → PostgreSQL Adapter → PostgreSQL
```

**Migration Strategy (Zero-Downtime):**
1. Create `DatabaseAdapter` interface in `src/services/adapters/`
2. Implement `PocketBaseAdapter` (current)
3. Implement `PostgresAdapter` using `pg` or `drizzle-orm`
4. Feature-flag adapter selection via env var `DB_ADAPTER=postgres`
5. Dual-write during migration window
6. Cut over read traffic once parity verified
7. Keep PB for realtime subscriptions (if needed)

### 2.2 Redis Integration
```env
REDIS_URL=redis://localhost:6379
```

**Use Cases:**
- Session store (replace in-memory login attempts Map)
- Rate limit persistence (replace in-memory Map)
- Query result cache (categories, provinces, site stats — TTL 5min)
- Job view counter buffer (write-behind to DB every 30s)
- Background job queue (BullMQ)

### 2.3 Background Jobs (BullMQ)
```typescript
// src/queues/
//   emailQueue.ts — send application confirmations, alerts
//   indexNowQueue.ts — ping IndexNow after job changes
//   analyticsQueue.ts — aggregate analytics hourly
//   cleanupQueue.ts — expire old jobs, prune audit logs
```

### 2.4 Search Upgrade Path

```
Current:     PocketBase filter (~contains) — string-based, no relevance
Phase 2:     SQLite FTS5 — full-text with relevance ranking
Phase 3:     Meilisearch — instant search, typo tolerance, faceting
```

**Meilisearch Integration:**
- Index jobs on create/update/delete via PocketBase hooks
- Faceted filters: province, category, job_type, salary_range
- Typo-tolerant search: "gautung" → "Gauteng"
- Geo-search: "jobs near me" with coordinates
- Autocomplete API: `GET /api/search/autocomplete?q=soft`

---

## Phase 3: Growth (1-3 Months)

### 3.1 CDN Integration
- Cloudflare or BunnyCDN in front of Nginx
- Cache static assets globally
- Image optimization (WebP conversion)
- DDoS protection
- Edge caching for SSR pages (stale-while-revalidate)

### 3.2 Object Storage
- Move CV uploads from PocketBase to S3-compatible storage (Backblaze B2 / Wasabi)
- Signed URLs for secure download
- Virus scanning via ClamAV before storage

### 3.3 Horizontal Scaling
```
                    Cloudflare
                         ↓
                 Load Balancer
               /        |        \
          Nginx 1    Nginx 2    Nginx 3
               \        |        /
              Astro SSR Cluster (PM2 × 4)
                         ↓
              PocketBase / PostgreSQL
                         ↓
                    Redis Cache
```

### 3.4 Database Scaling
- PostgreSQL with connection pooling (PgBouncer)
- Read replicas for analytics queries
- Partitioning for `analytics_events` by month
- Materialized views for dashboard metrics

---

## Monetization Architecture

### Current State
- Featured job listings (R299 once-off via PayFast)
- Employer plans: free only

### Revenue Model Design

```
Tier           Price     Jobs    Featured    Analytics    Support
────────────────────────────────────────────────────────────
Free           R0/mo     2       0           Basic        Email
Starter        R299/mo   5       1           Dashboard    Email
Professional   R799/mo   15      3           Advanced     Priority
Enterprise     R1,999/mo 50      10          Full         Dedicated
```

### Implementation
1. Create `subscriptions` collection in PocketBase
2. Add `plan_id`, `plan_expires`, `job_limit`, `featured_limit` to `employers`
3. Subscription lifecycle: create → payment → activate → renew/expire
4. Job posting check: enforce `job_limit` per plan
5. Featured check: enforce `featured_limit` per plan
6. Recurring billing via PayFast subscriptions API

### Sponsorship Inventory
- Homepage hero banner (R1,500/week)
- Category page top banner (R750/week)
- Search results sponsored slot (R500/week)
- Email newsletter inclusion (R250/send)
- Company profile spotlight (R1,000/month)

---

## Analytics Architecture

### Event Schema (PocketBase `analytics_events`)
```json
{
  "id": "uuid",
  "event": "view|click|apply_click|share|search|alert_signup|page_view",
  "job_id": "optional job reference",
  "ref": "referrer domain",
  "device": "desktop|tablet|mobile",
  "bot": "detected bot name or empty",
  "page_type": "homepage|job_detail|category|province|search",
  "ip": "hashed IP for dedup",
  "created": "ISO timestamp"
}
```

### Dashboard Queries (Materialized)
- Applications per day (7-day rolling)
- Impressions per job
- CTR per job
- Top traffic sources
- Conversion funnel: view → click → apply
- Employer performance score
- Revenue by plan/month

---

## Developer Experience

### Recommended Tooling
- **Testing**: Vitest for unit/integration tests
- **Linting**: ESLint + Prettier
- **Type Checking**: Astro check
- **CI/CD**: GitHub Actions:
  - Build check on PR
  - Deploy to VPS on main merge
- **Monitoring**: PM2 logs + Sentry for errors
- **Schema Versioning**: PocketBase migrations tracked in git

### Code Organization (Target)
```
src/
  components/
    ui/           # Design system primitives (Button, Card, Input, etc.)
    layout/       # Layout, Header, Footer, Sidebar
    jobs/         # JobCard, JobList, SearchForm
    admin/        # AdminNav, DataTable, FilterBar
    employer/     # Employer dashboard widgets
  services/       # Business logic + data access
    adapters/     # Database adapter interface + implementations
  styles/         # Global styles, tokens, utilities
  pages/          # Astro routes
  lib/            # Low-level utilities (auth, csrf, mailer, indexnow)
  queues/         # Background job definitions
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SQLite corruption under concurrent writes | Medium | High | PostgreSQL migration in Phase 2 |
| PocketBase single point of failure | Medium | High | Backup script, monitoring, failover plan |
| Rate limit bypass via header spoofing | Medium | Medium | Redis-based IP tracking, WAF rules |
| Payment processing failure | Low | High | PayFast ITN verification, reconciliation job |
| CV file storage bloat | Medium | Low | Object storage migration, retention policy |
