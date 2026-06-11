# Edubuzz.co.za — Complete Feature Inventory & Setup Reference

---

## PART 1: FEATURE INVENTORY

### CORE JOB MARKETPLACE

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 1 | **Homepage search** | Search bar + province dropdown + type filter pills on `/` | `src/pages/index.astro` | `jobs` collection | `getJobs()`, `JobCard` |
| 2 | **Job detail page** | Full job view, apply form, quick-apply modal, share buttons, save button, JSON-LD | `src/pages/job/[slug].astro` | `jobs`, `applications` | `Breadcrumbs`, `Sidebar`, `JobCard` |
| 3 | **Browse all jobs** | Paginated job list with search + filters at `/jobs` | `src/pages/jobs/index.astro` | `jobs` | `SearchForm`, `JobCard` |
| 4 | **Category pages** | Jobs filtered by category at `/category/{slug}` | `src/pages/category/[slug].astro` | `jobs`, `categories` | `Breadcrumbs`, `Sidebar` |
| 5 | **Province pages** | Jobs filtered by province at `/province/{slug}` | `src/pages/province/[slug].astro` | `jobs` | `Breadcrumbs`, `Sidebar` |
| 6 | **Company profiles** | Employer profile + their active jobs at `/company/{slug}` | `src/pages/company/[slug].astro` | `jobs`, `employers` | `Breadcrumbs`, `EmptyState` |
| 7 | **Company + Category** | Company jobs by category at `/company/{slug}/{category}` | `src/pages/company/[slug]/[category].astro` | `jobs`, `employers` | `Breadcrumbs`, `EmptyState` |
| 8 | **All companies** | Verified employer directory at `/companies` with province filter | `src/pages/companies/index.astro` | `employers`, `jobs` | `EmptyState` |
| 9 | **Salary range pages** | Jobs by salary bracket at `/jobs/salary/{range}` | `src/pages/jobs/salary/[range].astro` | `jobs` | — |
| 10 | **Job type pages** | Jobs by type at `/jobs/type/{type}` | `src/pages/jobs/type/[type].astro` | `jobs` | — |
| 11 | **Categories browser** | Category grid with live counts at `/categories` | `src/pages/categories.astro` | `categories`, `jobs` | Service layer |
| 12 | **Provinces browser** | Province grid at `/provinces` | `src/pages/provinces.astro` | — | — |

### APPLICATION SYSTEM

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 13 | **Full application** | Submit CV (PDF/DOC/DOCX), name, email, phone, cover letter | `POST /api/apply` | `applications` | CSRF, malware scan, rate limit |
| 14 | **Quick apply** | Capture name/email before redirect to full form | `POST /api/apply-quick` | `applications` | CSRF, rate limit |
| 15 | **CV upload security** | MIME validation, filename randomization, malware signature scan | `src/pages/api/apply.ts` | `applications` | `crypto.randomBytes` |
| 16 | **Application confirmation** | Auto-email applicant via PocketBase SMTP | `pb_hooks/main.pb.js` | SMTP in PB settings | PocketBase SMTP |

### EMPLOYER SYSTEM

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 17 | **Employer registration** | Signup form → creates user + employer record | `POST /api/auth/register` | `users`, `employers` | CSRF, password policy |
| 18 | **Employer login** | Login with role-based redirect (admin→/admin, employer→/employer/dashboard) | `POST /api/auth/login` | `users` | CSRF, account lockout |
| 19 | **Employer dashboard** | Active listings, monthly views, applications, CTR%, plan status | `/employer/dashboard` | `jobs`, `analytics_events`, `applications`, `employers` | `getEmployerMetrics()` |
| 20 | **Post job (employer)** | Create job listing as logged-in employer (sets `employer_id`) | `POST /api/employer/save-job` | `jobs` | CSRF, IndexNow ping |
| 21 | **Edit job (employer)** | Edit own job listing | `/employer/edit-job/{id}` | `jobs` | CSRF |
| 22 | **Job analytics (employer)** | 30-day view trend chart, CTR, referrers, device breakdown | `/employer/analytics/{jobId}` | `analytics_events`, `jobs` | SVG chart |
| 23 | **View applications** | Employer sees applications for their jobs | `/employer/applications/{jobId}` | `applications`, `jobs` | Auth |
| 24 | **Company profile** | Edit company name, logo, website, description | `/employer/company-profile` | `employers` | Auth, CSRF |
| 25 | **Upgrade/Boost** | PayFast R299 featured listing upgrade | `/employer/upgrade` | `jobs` (featured), `payments` | PayFast |
| 26 | **Logout** | Clear auth cookie | `/logout` | — | Auth |

### PUBLIC JOB POSTING

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 27 | **Public post job** | Anyone can submit job (no auth), goes to pending | `POST /api/post-job` | `jobs` (active=false) | CSRF, moderation scan, rate limit |
| 29 | **Spam/moderation scan** | 15 spam keywords + 4 pattern checks on public posts | `src/lib/moderation.ts` | — | `scanJobContent()` |
| 30 | **Pricing page** | 3 tiers (Basic/Featured/Sponsored) | `/pricing` | — | — |
| 31 | **Advertise page** | Employer advertising info | `/advertise` | — | — |

### ADMIN SYSTEM

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 32 | **Admin dashboard** | Active/pending/expired jobs, employers, applications today, revenue | `/admin` | `jobs`, `employers`, `applications`, `payments`, `job_alerts` | `getAdminMetrics()` |
| 33 | **Job management** | List, filter (status/province/source), approve/reject/feature/delete jobs | `/admin/jobs` | `jobs` | Admin auth, IndexNow |
| 34 | **Employer management** | List, verify/unverify employers | `/admin/employers` | `employers` | Admin auth |
| 35 | **Import jobs** | CSV, JSON, XML feed import | `/admin/import`, `POST /api/admin/import-jobs` | `jobs`, `xml_sources` | Admin auth, XML parser |
| 36 | **XML feed management** | Add/manage XML feed sources for import | `/admin/xml-feeds` | `xml_sources` | Admin auth |
| 37 | **Applications view** | View all applications across all jobs | `/admin/applications` | `applications` | Admin auth |
| 38 | **Alert management** | View job alert subscribers | `/admin/alerts` | `job_alerts` | Admin auth |
| 39 | **Admin settings** | Key-value settings store | `/admin/settings` | `admin_settings` | Admin auth |
| 42 | **Send alerts** | Manually trigger job alert emails | `POST /api/admin/send-alerts` | `job_alerts` | Admin auth, SMTP |

### PSEO (PROGRAMMATIC SEO)

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 43 | **Remote jobs page** | Remote jobs with category pills, FAQ schema | `/remote-jobs` | `jobs`, `categories` | `FAQPage` JSON-LD |
| 44 | **Internships page** | Internship landing with FAQ schema | `/internships` | `jobs`, `categories` | `FAQPage` JSON-LD |
| 45 | **Graduate jobs page** | Graduate/entry-level with FAQ schema | `/graduate-jobs` | `jobs`, `categories` | `FAQPage` JSON-LD |
| 46 | **Learnerships page** | SETA learnerships with FAQ schema | `/learnerships` | `jobs`, `categories` | `FAQPage` JSON-LD |
| 47 | **Bursaries page** | Bursary/funding with FAQ schema | `/bursaries` | `jobs`, `categories` | `FAQPage` JSON-LD |
| 48 | **Jobs-in-province pages** | `/jobs-in-gauteng`, `/jobs-in-western-cape`, etc. with cross-links | `src/pages/jobs-in-[province].astro` | `jobs`, `categories` | `CollectionPage` JSON-LD |
| 49 | **Category-jobs-in-province pages** | `/government-jobs-in-gauteng`, etc. — 150 category×province combos | `src/pages/[category]-jobs-in-[province].astro` | `jobs`, `categories` | `CollectionPage` JSON-LD |

### SEO INFRASTRUCTURE

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 50 | **Sitemap index** | Points to 6 sub-sitemaps | `/sitemap.xml` | All collections | — |
| 51 | **Jobs sitemap** | All active non-expired jobs with lastmod | `/sitemaps/jobs.xml` | `jobs` | — |
| 52 | **Categories sitemap** | All category pages | `/sitemaps/categories.xml` | `categories` | — |
| 53 | **Provinces sitemap** | Province + jobs-in-province pages | `/sitemaps/provinces.xml` | — | — |
| 54 | **Companies sitemap** | Verified employer pages | `/sitemaps/companies.xml` | `employers` | — |
| 55 | **PSEO sitemap** | 150 category×province combos + salary ranges + job types | `/sitemaps/pseo.xml` | — | — |
| 56 | **Static pages sitemap** | About, contact, pricing, privacy, terms, etc. | `/sitemaps/static.xml` | — | — |
| 57 | **Robots.txt** | Crawler rules for all engines + AI crawlers + LLMs directive | `/robots.txt` | — | — |
| 58 | **IndexNow** | Auto-pings Bing + Yandex on job create/update/delete | `src/lib/indexnow.ts` | `jobs` | `INDEXNOW_KEY` env |
| 59 | **IndexNow key** | Serves key at `/.well-known/indexnow.txt` and `/{key}.txt` | `src/pages/.well-known/indexnow.txt.ts` | — | — |
| 60 | **LLMs.txt** | AI crawler discovery file with all key URLs | `/llms.txt` | — | — |
| 61 | **JSON-LD schemas** | WebSite, Organization, JobPosting, BreadcrumbList, ItemList, FAQPage, CollectionPage | Layout + page components | — | — |
| 62 | **OG image generation** | Dynamic 1200×630 SVG for social sharing | `/api/og-image/{jobId}` | `jobs` | — |

### FEEDS

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 63 | **Indeed XML feed** | Indeed-compatible XML for all active jobs | `/feeds/jobs.xml` | `jobs` | — |
| 64 | **Province XML feeds** | Indeed XML filtered by province | `/feeds/jobs-{province}.xml` | `jobs` | — |
| 65 | **Category XML feeds** | Indeed XML filtered by category | `/feeds/jobs-{category}.xml` | `jobs`, `categories` | — |
| 66 | **RSS feed** | RSS 2.0 with Atom self-link | `/feeds/rss.xml` | `jobs` | — |
| 67 | **Atom feed** | Atom 1.0 feed | `/feeds/atom.xml` | `jobs` | — |

### RETENTION & GROWTH

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 68 | **Save job** | Heart button, toggle save/unsave, persists to `saved_jobs` | `POST /api/save-job` | `saved_jobs` | Auth (PocketBase) |
| 69 | **Job alerts** | Email alerts when matching jobs are posted | `POST /api/alerts` | `job_alerts` | CSRF, SMTP via PB hooks |
| 70 | **Growth event tracking** | 21 funnel events: view, search, apply, share, save, signup, etc. | `POST /api/growth-track` | `growth_events` | — |
| 71 | **Social sharing** | WhatsApp (primary SA channel), LinkedIn, X/Twitter, copy link | Job detail page | — | `trackFunnel('job_shared')` |
| 72 | **Referral codes** | `EDU-XXXXXXXX` employer referral codes | `src/services/growthService.ts` | `referrals` | — |

### AI & INTELLIGENCE

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 73 | **Skill extraction** | Extract technical, soft, qualification, tool skills from job descriptions | `src/services/matchingService.ts` | — | — |
| 74 | **Job matching** | Multi-dimensional weighted matching score (skills, category, province, salary) | `src/services/matchingService.ts` | — | — |
| 76 | **Recommendations** | Collaborative filtering ("also viewed"), content-based, personalized, trending | `src/services/recommendationService.ts` | `analytics_events`, `jobs` | — |
| 77 | **Recommendations API** | `GET /api/recommendations?type=trending\|personalized` | `src/pages/api/recommendations.ts` | `analytics_events`, `jobs` | — |
| 78 | **Autocomplete** | Job title/company/category autocomplete | `GET /api/autocomplete?q=soft` | `jobs` | 5-min cache |
| 79 | **Typo tolerance** | Levenshtein distance correction for search queries | `src/services/searchService.ts` | — | — |
| 80 | **Query understanding** | NLP parsing: extract job type, province, salary from free-text | `src/services/searchService.ts` | — | — |
| 81 | **Province normalisation** | 30+ city→province mappings (joburg→Gauteng, durban→KZN) | `src/services/searchService.ts` | — | — |
| 82 | **Intelligent ranking** | Engagement-weighted + quality-scored ranking | `src/services/rankingService.ts` | `analytics_events` | — |
| 83 | **Fake job detection** | 7 signal categories: salary red flags, scam contacts, suspicious patterns | `src/services/moderationService.ts` | — | — |
| 84 | **Duplicate detection** | Bigram Dice coefficient similarity check | `src/services/moderationService.ts` | `jobs` | — |
| 85 | **Content quality scoring** | Title/description checks, actionable suggestions | `src/services/moderationService.ts` | — | — |
| 86 | **Employer behavior analysis** | Bulk posting detection, low-effort, response rate monitoring | `src/services/moderationService.ts` | — | — |
| 87 | **Search result ranking** | Keyword relevance bonus + exact phrase bonus on top of engagement rank | `src/services/rankingService.ts` | — | — |

### ANALYTICS & TRACKING

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 88 | **Page view tracking** | Track views with bot detection, device, referrer | `src/lib/analytics.ts` | `analytics_events` | `trackEvent()` |
| 89 | **Click tracking** | Track job card clicks | `/api/track` | `analytics_events` | — |
| 90 | **Apply tracking** | Track apply button clicks | `/api/track` | `analytics_events` | — |
| 91 | **Share tracking** | Track WhatsApp/LinkedIn/X shares | `/api/track` | `analytics_events` | — |
| 92 | **Bot detection** | 14 crawler patterns (Googlebot, ChatGPT, Perplexity, etc.) | `src/lib/analytics.ts` | — | — |

### PAYMENTS & MONETIZATION

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 93 | **PayFast payment** | Initiate R299 featured listing payment | `POST /api/payments/initiate` | — | `PAYFAST_PASSPHRASE` |
| 94 | **PayFast ITN** | Instant Transaction Notification callback → activate featured | `POST /api/payments/notify` | `jobs` (featured) | `PAYFAST_PASSPHRASE` |
| 95 | **Revenue tracking** | Admin dashboard queries `payments` collection for monthly revenue | `src/services/jobService.ts` | `payments` | — |
| 96 | **Subscription model** | 4-tier design: Free, Starter (R299), Professional (R799), Enterprise (R1,999) | Designed in `GROWTH.md` | `subscriptions`, `employers` | Not yet built |

### UI & DESIGN SYSTEM

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 97 | **Design tokens** | CSS custom properties for colors, typography, spacing, shadows | `src/styles/tokens.css` | — | — |
| 98 | **Skeleton loader** | Shimmer loading placeholder: text/card/circle variants | `src/components/ui/Skeleton.astro` | — | — |
| 99 | **Empty state** | Centered empty state with icon, title, description, CTA | `src/components/ui/EmptyState.astro` | — | — |
| 100 | **Error state** | Red error display with retry button | `src/components/ui/ErrorState.astro` | — | — |
| 101 | **Trust badge** | Verified/Featured/New/Urgent status badges | `src/components/ui/TrustBadge.astro` | — | — |
| 102 | **Data table** | Reusable table with configurable columns and empty state | `src/components/ui/DataTable.astro` | — | — |
| 103 | **Breadcrumbs** | Auto-generates BreadcrumbList JSON-LD with navigation | `src/components/Breadcrumbs.astro` | — | — |
| 104 | **Layout** | HTML shell: SEO meta, nav bar, footer, stats bar, JSON-LD schemas | `src/layouts/Layout.astro` | `jobs`, `categories` | — |
| 105 | **Job card** | Reusable job listing card with compact mode | `src/components/JobCard.astro` | — | `timeAgo`, `formatSalary` |
| 106 | **Sidebar** | Categories with counts, provinces, popular searches, job alert form | `src/components/Sidebar.astro` | `categories`, `jobs` | — |
| 107 | **Search form** | Search bar + province dropdown + filter pills | `src/components/SearchForm.astro` | — | — |
| 108 | **Admin nav** | Admin tab navigation: Dashboard, Jobs, Employers, Growth, Import, Settings | `src/components/AdminNav.astro` | — | — |
| 109 | **Ad slot** | Google AdSense placeholder | `src/components/AdSlot.astro` | — | — |
| 110 | **Sponsored strip** | Promotional CTA banner | `src/components/SponsoredStrip.astro` | — | — |

### SECURITY

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 111 | **CSRF protection** | SHA-256 HMAC tokens on all forms | `src/lib/csrf.ts` | — | `CSRF_SECRET` env |
| 112 | **Rate limiting** | In-memory 5 req/min per IP + Nginx zones | `src/lib/api.ts` + `nginx.conf` | — | — |
| 113 | **Account lockout** | 5 failed attempts → 15-min lockout | `src/lib/auth.ts` | — | — |
| 114 | **Password policy** | 10+ chars, upper+lower+digit+special, common password blocklist | `src/pages/api/auth/register.ts` | — | — |
| 115 | **RBAC hierarchy** | candidate → employer → moderator → admin → superadmin | `src/lib/auth.ts` | `users.role` | — |
| 116 | **Secure cookies** | HttpOnly, Secure, SameSite=Lax, role-based TTL | `src/lib/auth.ts` | — | — |
| 117 | **CV malware scan** | Byte-level signature detection (EXE/DLL/ELF/script) | `src/pages/api/apply.ts` | — | — |
| 118 | **Nginx security** | HSTS, CSP, anti-bot UA block, exploit path blocking, rate limiting | `nginx.conf` | — | — |
| 119 | **PocketBase rules** | Collection-level access rules (public/employer/admin/mod) | `pb_hooks/collection-rules.pb.md` | All collections | — |
| 120 | **Audit logging** | All CRUD operations logged to `audit_logs` collection | `pb_hooks/main.pb.js` | `audit_logs` | — |
| 121 | **Content moderation** | Spam keyword + pattern detection on public job posts | `src/lib/moderation.ts` | — | — |

### INFRASTRUCTURE & DEVOPS

| # | Feature | What It Does | Route/File | PocketBase Needed | Dependencies |
|---|---------|-------------|------------|-------------------|-------------|
| 122 | **PM2 cluster** | Multi-worker process management with auto-restart | `ecosystem.config.cjs` | — | PM2 installed |
| 123 | **Structured logging** | JSON-format logs with request context and process metrics | `src/lib/logger.ts` | — | — |
| 124 | **Health check** | `GET /api/health` — DB latency, memory, uptime | `src/pages/api/health.ts` | — | — |
| 125 | **CI/CD pipeline** | Build check → deploy to production/staging via GitHub Actions | `.github/workflows/ci.yml` | — | GitHub Secrets |
| 126 | **Zero-downtime deploy** | Graceful `pm2 reload` with rollback point | `scripts/deploy.sh` | — | — |
| 127 | **Backup system** | Encrypted daily/weekly/monthly GPG backups with integrity validation | `scripts/backup.sh` | All data | GPG key |
| 128 | **Restore system** | Full restore from encrypted backup with verification | `scripts/restore.sh` | All data | — |
| 129 | **Incident runbooks** | 7 alert types with step-by-step recovery procedures | `RUNBOOKS.md` | — | — |

### STATIC PAGES

| # | Feature | Route |
|---|---------|-------|
| 130 | About page | `/about` |
| 131 | Contact page (+ form with CSRF + honeypot) | `/contact` |
| 132 | Privacy policy | `/privacy` |
| 133 | Terms of use | `/terms` |
| 134 | Resources page | `/resources` |
| 135 | Salary guide | `/salary-guide` |
| 136 | Featured listings | `/featured-listings` |
| 137 | Job alerts page | `/job-alerts` |
| 138 | Login page | `/login` |
| 139 | Register page | `/register` |
| 140 | Custom 404/410 page | `/404` (handles both not-found and expired jobs) |

---

## PART 2: POCKETBASE SETUP

### Step 1: Install & Start PocketBase

```bash
# Download PocketBase binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase

# Create systemd service
sudo tee /etc/systemd/system/pocketbase.service <<'EOF'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=edubuzz
WorkingDirectory=/home/edubuzz
ExecStart=/home/edubuzz/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Mock systemd for dev:

sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

### Step 2: Create Admin Account

Visit `http://127.0.0.1:8090/_/` and create the admin account. Same email/password as `PB_ADMIN_EMAIL`/`PB_ADMIN_PASSWORD` in `.env`.

### Step 3: Create Collections

Go to Admin UI → Collections → New Collection. Create each collection below.

#### Required Collections

| Collection | Type | Fields |
|-----------|------|--------|
| `jobs` | Base | `title` (text), `slug` (text, unique), `company` (text), `category` (text), `province` (text), `city` (text), `description` (text), `apply_url` (text), `apply_email` (text), `salary_min` (number), `salary_max` (number), `salary_currency` (text), `job_type` (text), `source` (text), `source_ref` (text), `employer_id` (text), `views` (number), `clicks` (number), `apply_clicks` (number), `featured` (bool), `featured_expires` (date), `active` (bool), `expires` (date), `ai_written` (bool), `xml_export` (bool), `og_image` (text) |
| `categories` | Base | `name` (text), `slug` (text, unique), `icon` (text), `color` (text), `job_count` (number) |
| `employers` | Base | `user_id` (text), `company_name` (text), `company_slug` (text, unique), `logo` (text), `website` (text), `description` (text), `province` (text), `city` (text), `verified` (bool), `blocked` (bool), `suspended` (bool), `plan` (text), `plan_expires` (date), `contact_email` (text) |
| `applications` | Base | `job` (relation → jobs), `name` (text), `email` (text), `phone` (text), `text` (text), `cv_file` (file), `status` (text) |
| `users` | Auth | Built-in PocketBase auth collection. Add `role` field (select: candidate/employer/moderator/admin/superadmin). Add `blocked` (bool), `suspended` (bool) |
| `pending_jobs` | Base | `employer_name` (text), `employer_email` (text), `company` (text), `title` (text), `category` (text), `description` (text), `province` (text), `city` (text), `job_type` (text), `salary_min` (number), `salary_max` (number), `apply_url` (text), `apply_email` (text), `status` (select: pending/approved/rejected) |
| `job_alerts` | Base | `email` (text), `keyword` (text), `province` (text), `category` (text) |
| `analytics_events` | Base | `job_id` (text), `event` (text), `ref` (text), `device` (text), `bot` (text), `created` (date) |

#### Optional Collections (Needed for Specific Features)

| Collection | Needed For | Fields |
|-----------|-----------|--------|
| `growth_events` | Growth analytics, funnel tracking | `event` (text), `job_id` (text), `employer_id` (text), `ref` (text), `device` (text), `source` (text), `metadata` (text/JSON), `created` (date) |
| `saved_jobs` | Save job feature | `user_id` (text), `job_id` (text), `created` (date) |
| `payments` | Revenue tracking in admin | `amount` (number), `status` (text), `job_id` (text), `employer_id` (text), `created` (date) |
| `audit_logs` | Security audit trail | `event` (text), `details` (text), `created` (date) |
| `referrals` | Referral system | `employer_id` (text), `code` (text), `signups` (number), `created` (date) |
| `admin_settings` | Admin config | `key` (text, unique), `value` (text) |
| `xml_sources` | XML feed import | `name` (text), `feed_url` (text), `format` (text), `active` (bool), `import_count` (number), `last_imported` (date) |

### Step 4: Apply Collection Access Rules

For each collection in PocketBase Admin → Edit → "Manage rules" tab, apply the rules from `pb_hooks/collection-rules.pb.md`. Summary:

| Collection | List/Search | View | Create | Update | Delete |
|-----------|------------|------|--------|--------|--------|
| `jobs` | `active=true && expires>@now` | `active=true \|\| admin/mod` | `admin \|\| employer` | `admin \|\| own employer` | `admin only` |
| `categories` | Public | Public | Admin only | Admin only | Admin only |
| `employers` | `verified=true \|\| admin/mod` | `verified=true \|\| own \|\| admin` | Admin only | `own \|\| admin` | Admin only |
| `applications` | `admin/mod/employer` | `admin/mod` | Public (with CSRF) | `admin/mod` | Admin only |
| `users` | Auth required | `own \|\| admin` | `role=employer` (public) | `own \|\| admin` | Admin only |
| `pending_jobs` | `admin/mod` | `admin/mod` | Public (with CSRF) | Admin only | Admin only |
| `job_alerts` | Admin only | Admin only | Public (with CSRF) | — | Admin only |
| `analytics_events` | Admin only | Admin only | Public (internal) | — | Admin only |
| `growth_events` | Admin only | Admin only | Public (internal) | — | Admin only |
| `saved_jobs` | `own` | `own` | Auth required | `own` | `own` |
| `payments` | Admin only | Admin only | Admin only | Admin only | Admin only |
| `audit_logs` | Admin only | Admin only | Internal only | No one | No one |
| `admin_settings` | Admin only | Admin only | Admin only | Admin only | Admin only |

### Step 5: Configure SMTP in PocketBase

Go to PocketBase Admin → Settings → SMTP:
- Host: your SMTP host
- Port: 465 (or 587 for STARTTLS)
- Username: noreply@edubuzz.co.za
- Password: your SMTP password

### Step 6: Seed Categories

In PocketBase Admin, create these 15 categories:

```
Government, Health, IT & Tech, Education, Finance, Engineering,
Logistics, Retail, Hospitality, Legal, Marketing, Construction,
Agriculture, Mining, General
```

Each needs a slug (auto-generated from name) and optionally an icon/color.

### Step 7: Deploy PocketBase Hooks

Copy `pb_hooks/main.pb.js` to `/home/edubuzz/pb_hooks/main.pb.js`. PocketBase auto-loads it.

The hooks handle:
- Auto-generating unique slugs for new jobs
- Auto-setting 30-day expiry on new jobs
- Copying approved pending_jobs to live jobs
- Sending application confirmation emails
- Sending job alert emails for matching subscribers
- Auto-deactivating expired jobs
- Audit logging for all CRUD operations

---

## PART 3: SERVER SETUP (UBUNTU VPS)

### Step 1: Install Dependencies

```bash
sudo apt update
sudo apt install -y curl git nginx certbot python3-certbot-nginx gnupg unzip

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
```

### Step 2: Create User & Directories

```bash
sudo useradd -m -s /bin/bash edubuzz
sudo mkdir -p /home/edubuzz/edubuzz /home/edubuzz/logs /home/edubuzz/backups /home/edubuzz/rollbacks
sudo chown -R edubuzz:edubuzz /home/edubuzz
```

### Step 3: Clone Repository

```bash
sudo -u edubuzz bash
cd /home/edubuzz
git clone https://github.com/your-org/edubuzz.git edubuzz
cd edubuzz
npm ci
```

### Step 4: Configure Environment

```bash
cd /home/edubuzz/edubuzz
cp .env.example .env
nano .env  # Fill in all values (see Part 4)
```

### Step 5: SSL Certificate

```bash
sudo certbot --nginx -d edubuzz.co.za -d www.edubuzz.co.za
```

### Step 6: Deploy Nginx Config

```bash
sudo cp /home/edubuzz/edubuzz/nginx.conf /etc/nginx/sites-available/edubuzz
sudo ln -sf /etc/nginx/sites-available/edubuzz /etc/nginx/sites-enabled/edubuzz
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Step 7: Build & Start

```bash
cd /home/edubuzz/edubuzz
npm run build
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Follow the output command
```

### Step 8: Setup Cron Jobs

```bash
crontab -e
```

Add:

```
0 2 * * * /home/edubuzz/edubuzz/scripts/backup.sh daily
0 3 * * 0 /home/edubuzz/edubuzz/scripts/backup.sh weekly
0 4 1 * * /home/edubuzz/edubuzz/scripts/backup.sh monthly
*/5 * * * * curl -sf http://127.0.0.1:4321/api/health || echo "FAIL $(date)" >> /home/edubuzz/logs/health-alerts.log
0 1 * * * pm2 flush
0 0 * * 1 certbot renew --quiet && systemctl reload nginx
```

### Step 9: GitHub Actions Secrets (for CI/CD)

Add these to GitHub repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `SSH_HOST` | Your VPS IP or domain |
| `SSH_USER` | `edubuzz` |
| `SSH_PRIVATE_KEY` | SSH private key for edubuzz user |
| `STAGING_SSH_HOST` | Staging server IP (if applicable) |

---

## PART 4: ENVIRONMENT VARIABLES (.env)

```
# ── Core ─────────────────────────────────────
PB_URL=http://127.0.0.1:8090
SITE_URL=https://edubuzz.co.za

# ── PocketBase Admin Credentials (REQUIRED) ──
PB_ADMIN_EMAIL=admin@edubuzz.co.za
PB_ADMIN_PASSWORD=<strong-password>

# ── Security ─────────────────────────────────
# Generate: openssl rand -hex 32
CSRF_SECRET=<64-char-hex>
INDEXNOW_KEY=<32-char-hex>

# ── SMTP ─────────────────────────────────────
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
SMTP_USER=noreply@edubuzz.co.za
SMTP_PASS=<smtp-password>

# ── Payments ──────────────────────────────────
PAYFAST_PASSPHRASE=<payfast-passphrase>
```

---

## PART 5: FEATURE DEPENDENCY MAP

### Features that work with ZERO additional setup

Just deploy the code + start PocketBase:
- Homepage, job listing, job detail, search
- Category/province/company/companies pages
- All PSEO pages (remote-jobs, internships, etc.)
- Static pages (about, contact, privacy, terms)
- Sitemaps, robots.txt, feeds
- UI components, breadcrumbs, design system
- JSON-LD schemas

### Features that need PocketBase collections created

| Feature | Collections Required |
|---------|---------------------|
| Save job | `saved_jobs` |
| Growth analytics dashboard | `growth_events` |
| Revenue tracking in admin | `payments` |
| Audit logging | `audit_logs` |
| Job alerts | `job_alerts` (SMTP configured) |
| Employer registration | `employers`, `users` (with role field) |
| CV uploads | `applications` (with cv_file field) |
| XML feed import | `xml_sources` |
| Admin settings | `admin_settings` |
| Referral system | `referrals` |
| Employer analytics | `analytics_events` (populated by tracking) |

### Features that need external services

| Feature | External Service |
|---------|-----------------|
| Payment processing | PayFast (`PAYFAST_PASSPHRASE`) |
| Email sending | SMTP server |
| Email confirmation (applicant) | SMTP in PocketBase |
| CI/CD deploys | GitHub Actions + SSH |
| Monitoring | Optional: UptimeRobot, BetterStack, Sentry |

### Features you can safely remove

If you want to simplify the stack, these can be removed without breaking core job board functionality:

| Feature | What to Delete | Impact |
|---------|---------------|--------|
| PSEO landing pages | `remote-jobs.astro`, `internships.astro`, `graduate-jobs.astro`, `learnerships.astro`, `bursaries.astro`, `jobs-in-[province].astro`, `[category]-jobs-in-[province].astro` | Loses long-tail SEO traffic |
| Growth analytics | `admin/growth.astro`, `api/growth-track.ts`, `api/save-job.ts` | Loses funnel tracking and save feature |
| AI matching engine | `services/matchingService.ts` | Loses skill extraction and matching |
| Recommendation engine | `services/recommendationService.ts`, `api/recommendations.ts` | Loses trending/personalized jobs |
| Intelligent ranking | `services/rankingService.ts` | Falls back to `sort: '-featured,-created'` |
| Autocomplete | `api/autocomplete.ts` | Loses search autocomplete |
| Moderation AI | `services/moderationService.ts` | Falls back to basic keyword moderation |
| Design system | `components/ui/*.astro`, `styles/tokens.css` | Loses skeleton/empty/error states |
| Service layer | `services/jobService.ts` | Pages must call PocketBase directly |
| CV parsing | `matchingService.parseCVWithAI()` | Loses structured CV extraction |
| Atom feed | `feeds/atom.xml.ts` | RSS + Indeed feeds remain |
| Category XML feeds | `feeds/jobs-[category].xml.ts` | Main + province feeds remain |
| Sitemap sub-files | `sitemaps/*.xml.ts` | Falls back to single sitemap |
| Health check | `api/health.ts` | No automated monitoring |
| Structured logging | `lib/logger.ts` | Falls back to `console.log` |

### Core features that MUST stay

These are essential for the job board to function:
- `jobs`, `categories`, `employers`, `applications` PocketBase collections
- Homepage, job detail, category/province/company pages
- Apply endpoints (POST /api/apply, /api/apply-quick)
- Auth system (login, register, CSRF)
- Admin dashboard + job management
- Post-job API
- Sitemap + robots.txt
- IndexNow
- Indeed XML feed + RSS feed
- Nginx config
- Layout.astro
- Basic analytics tracking (/api/track)
