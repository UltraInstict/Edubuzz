# Edubuzz Next-Generation Architecture
## From XML Aggregator to AI-Powered Job Intelligence Platform

**Generated:** 2025-07-15
**Objective:** Compete with Indeed SA and Careers24 — not by copying them, but by being structurally superior.

---

## Executive Summary

Current job boards fail at one thing: **structured, scannable job content**. Indeed has 3.5M listings but each page is a wall of inconsistent HTML. Careers24 has 40K South African jobs but pages look like 2015. LinkedIn requires an account and hides salary data.

Edubuzz's competitive advantage: **every job page is AI-structured into consistent, scannable sections** — Responsibilities, Requirements, Benefits, Skills, Salary — regardless of the source format. A user can compare two jobs side-by-side because both follow the same information architecture.

**The pipeline:**
```
Job URL → Firecrawl Extraction → AI Normalization → Structured JSON → PocketBase → Premium SSR Page
```

**Not:** `XML Feed → Summary → Wall of Text → Same as Everyone Else`

---

## Part 1: Next-Generation Ingestion Pipeline

### 1.1 Why Firecrawl Instead of XML Feeds

| Dimension | XML Feeds | Firecrawl Scraping |
|-----------|-----------|-------------------|
| Content depth | Summary only (usually 100-300 chars) | Full page content (2000-10000 chars) |
| Data available | Title, company, location, short description | Full requirements, responsibilities, benefits, skills |
| Source coverage | Only sites that publish feeds (rare in SA) | Any job posting URL — company career pages, government portals |
| Salary data | Rarely included | Often present on career pages |
| Logo/branding | Never included | Can extract from page metadata |
| Apply URL | Usually included | Always extractable |
| SA sources | DPSA has XML. Most SA companies don't publish feeds. | Can scrape any SA company career page, government portal, university job board |

**The insight:** Most South African employers post jobs on their own career pages (Standard Bank Careers, Netcare Careers, Shoprite Careers) — not in XML feeds. Firecrawl can reach them. XML feeds cannot.

### 1.2 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOURCE DISCOVERY                              │
├─────────────────────────────────────────────────────────────────┤
│  RSS/XML Feed URLs    Company Career Pages    Government Portals│
│  (existing)           (new - Firecrawl)       (new - Firecrawl) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    URL EXTRACTION                                │
├─────────────────────────────────────────────────────────────────┤
│  RSS: Parse feed → extract <link> elements                      │
│  Sitemap: Parse sitemap.xml → extract job URLs                  │
│  Career Page: Firecrawl.crawl(url) → discover job listing URLs  │
│                                                                  │
│  Result: Array of individual job posting URLs                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FIRECRAWL EXTRACTION                          │
├─────────────────────────────────────────────────────────────────┤
│  For each job URL:                                               │
│    1. Firecrawl.scrapeUrl(url, { formats: ['markdown', 'html'] })│
│    2. Extract: title, company, location, description, apply_url  │
│    3. Extract: salary, requirements, benefits (if present)       │
│    4. Extract: company logo from <meta property="og:image">      │
│                                                                  │
│  Cost: ~R0.15 per page (Firecrawl pricing)                      │
│  Rate: 100 pages/minute (well within limits)                    │
│  Cache: Store raw extraction for 7 days to avoid re-scraping    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI NORMALIZATION                              │
├─────────────────────────────────────────────────────────────────┤
│  Input: Raw Firecrawl extraction (markdown, 2000-10000 chars)   │
│  Model: Claude 3.5 Sonnet or GPT-4o-mini                        │
│                                                                  │
│  System Prompt:                                                  │
│    "You are a job posting normalizer for a South African job     │
│     board. Extract structured data from the following job        │
│     posting. Output valid JSON matching the schema below.        │
│     Never fabricate information. If a field is not present in    │
│     the source material, return null."                           │
│                                                                  │
│  Output Schema:                                                  │
│    {                                                             │
│      "title": "...",                                             │
│      "company": "...",                                           │
│      "company_description": "...",                               │
│      "province": "Gauteng|Western Cape|...",                     │
│      "city": "...",                                              │
│      "salary_min": number|null,                                  │
│      "salary_max": number|null,                                  │
│      "salary_period": "monthly|annual|hourly",                   │
│      "job_type": "Full-time|Part-time|Contract|...",             │
│      "experience_level": "entry|mid|senior|executive|null",      │
│      "education_required": "...",                                │
│      "responsibilities": ["..."],                                │
│      "requirements": ["..."],                                    │
│      "benefits": ["..."],                                        │
│      "skills": ["..."],                                          │
│      "closing_date": "YYYY-MM-DD|null",                          │
│      "apply_url": "https://...",                                 │
│      "source_url": "https://...",                                │
│      "ai_summary": "2-3 sentence professional summary"           │
│    }                                                             │
│                                                                  │
│  Cost: ~R0.02/job (GPT-4o-mini) or ~R0.08/job (Claude Sonnet)  │
│  Validation: Reject if title/company/province missing           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE & DEDUPLICATION                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Check source_url against existing jobs (exact match)        │
│  2. Check title+company+province (fuzzy match, Levenshtein <3)  │
│  3. If duplicate: update existing record, reset expires +30d    │
│  4. If new: create record, auto-generate slug                   │
│  5. Link to category (keyword matching or AI classification)    │
│  6. Update company record (create if new, increment job_count)  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Source Configuration Schema

New PocketBase collection: `job_sources`
```
{
  id: string,
  name: string,                     // "Standard Bank Careers"
  source_type: "rss" | "sitemap" | "career_page" | "xml_feed",
  feed_url: string,                 // The URL to fetch job listings from
  extraction_method: "xml_parse" | "firecrawl_crawl" | "firecrawl_scrape",
  scrape_selector: string,          // CSS selector for job links (career pages)
  active: boolean,
  crawl_frequency_hours: number,    // How often to re-crawl (default: 24)
  last_crawled: datetime,
  jobs_found: number,               // Total jobs discovered in last crawl
  jobs_imported: number,            // New jobs created in last crawl
  error_log: text,                  // Last error message if any
  created: datetime,
  updated: datetime
}
```

### 1.4 Cost Analysis

| Pipeline Stage | Cost per Job | Monthly (1000 jobs/day) |
|---------------|-------------|------------------------|
| Firecrawl extraction | R0.15 | R4,500 |
| AI normalization (GPT-4o-mini) | R0.02 | R600 |
| AI normalization (Claude Sonnet) | R0.08 | R2,400 |
| PocketBase storage | R0.00 | R0 (self-hosted) |
| **Total (GPT-4o-mini)** | **R0.17** | **R5,100** |
| **Total (Claude Sonnet)** | **R0.23** | **R6,900** |

At R15,000/month revenue from 30 featured listings at R499, the pipeline cost is 34-46% of revenue. Sustainable.

### 1.5 Pilot Sources (South African)

| Source | Type | Estimated Jobs | Priority |
|--------|------|---------------|----------|
| DPSA Vacancies | RSS/XML | 200-500/month | ★★★★★ |
| Standard Bank Careers | Career page | 50-100/month | ★★★★★ |
| Netcare Careers | Career page | 30-80/month | ★★★★★ |
| Shoprite Careers | Career page | 40-100/month | ★★★★ |
| University job boards (UCT, Wits, Stellenbosch) | Sitemap | 50-150/month | ★★★★ |
| Western Cape Government | Career page | 100-300/month | ★★★★ |
| Indeed SA (public listings) | Career page | 500-2000/month | ★★★ (legal risk) |
| PNet (public listings) | Career page | 300-1000/month | ★★★ (legal risk) |

**Legal note:** Scraping public job listings for aggregation is generally acceptable when:
- Jobs are publicly posted without login requirement
- We link back to the original source (apply_url)
- We don't reproduce copyrighted content verbatim (AI summary solves this)
- We respect robots.txt

---

## Part 2: Enhanced Data Schema

### 2.1 Jobs Collection — Expanded Fields

```
Current fields (keep):
  title, slug, company, category, province, city, description,
  apply_url, apply_email, salary_min, salary_max, job_type, source,
  source_ref, employer_id, views, clicks, apply_clicks, featured,
  active, expires, created, updated

NEW fields to add:
  company_description     Text(500)     — 1-2 sentence company overview
  company_logo            File          — Company logo image
  company_website         URL           — Link to company website
  salary_period           Select        — monthly, annual, hourly
  experience_level        Select        — entry, mid, senior, executive
  education_required      Text(200)     — "Degree in Computer Science" etc.
  responsibilities        Editor        — Rich text, bullet-pointed
  requirements            Editor        — Rich text, bullet-pointed
  benefits                Editor        — Rich text, bullet-pointed
  skills                  JSON          — Array of skill keywords
  closing_date            Date          — Application deadline
  source_url              URL           — Original job posting URL
  ai_summary              Text(500)     — AI-generated 2-3 sentence summary
  ai_confidence           Number        — 0-100 confidence score from AI
  enrichment_source       Select        — firecrawl, xml_feed, manual, employer
  last_scraped            DateTime      — When Firecrawl last extracted this job
```

### 2.2 Companies Collection (New)

```
{
  id: string,
  name: string,                     // "Standard Bank"
  slug: string,                     // "standard-bank"
  description: text,                // Company overview
  logo: file,                       // Company logo
  website: url,                     // Company website
  industry: text,                   // "Banking & Finance"
  province: text,                   // HQ province
  city: text,                       // HQ city
  employee_count: select,           // "1-50", "51-200", "201-1000", "1000+"
  founded_year: number,
  social_links: json,               // { linkedin, twitter, facebook }
  job_count: number,                // Active jobs (auto-updated)
  avg_salary_min: number,
  avg_salary_max: number,
  verified: boolean,                // Employer-claimed profile
  created: datetime,
  updated: datetime
}
```

### 2.3 Saved Jobs Collection (New)

```
{
  id: string,
  user_id: string,
  job_id: string,
  note: text,                       // Optional user note
  saved_at: datetime,
}
```

API Rules:
- List: `@request.auth.id = user_id`
- Create: `@request.auth.id != ""`
- Delete: `@request.auth.id = user_id`

### 2.4 Job Alerts Collection (Enhanced)

```
{
  id: string,
  email: string,
  keyword: text,
  province: text,
  category: text,
  job_type: text,
  salary_min: number,               // NEW
  salary_max: number,               // NEW
  experience_level: text,           // NEW
  frequency: select,                // instant, daily, weekly
  last_sent: datetime,
  active: boolean,
  created: datetime,
}
```

### 2.5 Search Queries Collection (New — for Trending)

```
{
  id: string,
  query: text,
  results_count: number,
  province: text,
  category: text,
  created: datetime,
}
```

API Rules:
- Create: `""` (public, for tracking)
- List: admin only

---

## Part 3: Premium Frontend Architecture

### 3.1 Homepage Redesign

```
┌─────────────────────────────────────────────────────────┐
│ HERO SECTION                                             │
│ "Find your next career in South Africa"                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Job title or keyword]  [Province ▼]  [Search Jobs] │ │
│ └──────────────────────────────────────────────────────┘ │
│ Popular: Nurse | Software Developer | Teacher | Driver   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TRENDING NOW                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │🔥 Nurses │ │💻 Devs   │ │📊 Admin  │ │🚚 Drivers│    │
│ │ 342 jobs │ │ 289 jobs │ │ 198 jobs │ │ 156 jobs │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FEATURED JOBS (rich cards)                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Logo] Senior Software Developer         [Featured]│ │
│ │ Standard Bank · Johannesburg · R80k-R120k/month    │ │
│ │ Full-time · Senior · Degree required               │ │
│ │ Skills: Python, AWS, PostgreSQL                     │ │
│ │ Posted 2 days ago · Closes 15 Aug                  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BROWSE BY CATEGORY                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │💻 IT │ │🏥 Hlth│ │💰 Fin│ │⚙️ Eng│ │🎓 Edu│ │🛒 Ret│ │
│ │ 456  │ │ 312  │ │ 289  │ │ 178  │ │ 145  │ │ 234  │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TOP EMPLOYERS                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Standard  │ │Netcare   │ │Shoprite  │ │Eskom     │    │
│ │Bank      │ │          │ │          │ │          │    │
│ │23 jobs   │ │18 jobs   │ │31 jobs   │ │12 jobs   │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ LATEST JOBS (rich cards, paginated)                      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Job Card Redesign

```
┌─────────────────────────────────────────────────────┐
│ [Logo 48x48]  Senior Software Developer        [NEW]│
│               Standard Bank · Johannesburg, GP       │
│               R80,000 - R120,000 / month             │
│               Full-time · Senior · Degree            │
│                                                       │
│ Build scalable fintech platforms using Python and    │
│ AWS. Join SA's largest bank's digital team.          │
│                                                       │
│ Skills: Python · AWS · PostgreSQL · Docker           │
│                                                       │
│ Posted 2 days ago · Closes 15 Aug    [♡ Save] [→]   │
└─────────────────────────────────────────────────────┘
```

Key differences from current:
- Company logo (48x48, fallback to initials)
- Salary badge (prominent, formatted)
- Experience level + education (at a glance)
- AI summary (2 lines, not the raw description)
- Skills as pills (scannable)
- Save button (client-side, no login required initially)
- "NEW" badge for jobs posted <48h

### 3.3 Job Detail Page (The Core Differentiator)

```
┌─────────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Jobs > IT & Technology > Senior Dev  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ HERO                                                     │
│ ┌──────┐                                                │
│ │ Logo │ Senior Software Developer                      │
│ │64x64 │ Standard Bank                                  │
│ └──────┘ Johannesburg, Gauteng · Full-time              │
│          Posted 2 days ago · Closes 15 August 2025      │
│                                                          │
│ ┌──────────────────────────┐  ┌──────────────────────┐  │
│ │ R80,000 - R120,000/month │  │ [  APPLY NOW  ]      │  │
│ └──────────────────────────┘  └──────────────────────┘  │
│                                                          │
│ Tags: [Senior] [Degree] [Python] [AWS] [PostgreSQL]     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AI SUMMARY                                               │
│ "Standard Bank is seeking a Senior Software Developer    │
│  to build scalable fintech platforms in Johannesburg.    │
│  The role requires 5+ years of Python/AWS experience     │
│  and a relevant degree. Salary range R80k-R120k/month." │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RESPONSIBILITIES                                         │
│ • Design and implement microservices architecture        │
│ • Lead technical design reviews for new features         │
│ • Mentor junior developers and conduct code reviews      │
│ • Collaborate with product managers on roadmap           │
│ • Ensure 99.9% uptime for banking APIs                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ REQUIREMENTS                                             │
│ • 5+ years professional Python development              │
│ • Experience with AWS (EC2, Lambda, RDS, S3)            │
│ • Strong SQL skills (PostgreSQL preferred)               │
│ • Degree in Computer Science or equivalent               │
│ • Understanding of financial services regulations        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BENEFITS                                                 │
│ • Medical aid contribution                               │
│ • Pension fund (15% employer contribution)               │
│ • 25 days annual leave                                   │
│ • Flexible working (3 days remote)                       │
│ • R30,000 annual learning budget                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SKILLS                                                   │
│ [Python] [AWS] [PostgreSQL] [Docker] [Kubernetes]       │
│ [REST APIs] [Microservices] [CI/CD] [Git]               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ABOUT STANDARD BANK                                      │
│ Standard Bank is Africa's largest bank by assets,        │
│ serving 27 million customers across 20 countries.        │
│ Founded 1862. 45,000 employees. Banking & Finance.       │
│ [View all 23 jobs →]  [Visit website →]                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [  APPLY NOW  ]  [  ♡ Save Job  ]  [  Share  ]         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SIMILAR JOBS                                             │
│ [Card] Backend Dev @ Nedbank R70k-100k                  │
│ [Card] Full Stack @ Capitec R65k-95k                    │
│ [Card] Data Eng @ FNB R75k-110k                         │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Search Page

```
┌────────────────────┬────────────────────────────────────┐
│ FILTERS (sidebar)  │ RESULTS (main)                      │
│                    │                                      │
│ Job Type           │ 289 jobs for "Senior Software       │
│ ☑ Full-time        │ Developer" in Gauteng               │
│ ☐ Part-time        │                                      │
│ ☐ Contract         │ Sort: [Relevance ▼] [Date] [Salary]│
│ ☐ Remote           │                                      │
│                    │ ┌────────────────────────────────┐ │
│ Salary Range       │ │ [Rich Job Card]                │ │
│ R0 ───●────●── R200k│ │ [Rich Job Card]                │ │
│                    │ │ [Rich Job Card]                │ │
│ Experience         │ │ [Rich Job Card]                │ │
│ ☐ Entry            │ │ [Rich Job Card]                │ │
│ ☑ Mid              │ │ ...                            │ │
│ ☑ Senior           │ └────────────────────────────────┘ │
│ ☐ Executive        │                                      │
│                    │ [1] [2] [3] ... [15] [Next →]       │
│ Education          │                                      │
│ ☐ Matric           │                                      │
│ ☐ Diploma          │                                      │
│ ☑ Degree           │                                      │
│ ☐ Postgraduate     │                                      │
│                    │                                      │
│ Date Posted        │                                      │
│ ☑ Last 24 hours    │                                      │
│ ☐ Last 7 days      │                                      │
│ ☐ Last 30 days     │                                      │
│                    │                                      │
│ Skills             │                                      │
│ [Python] [AWS] [+] │                                      │
└────────────────────┴────────────────────────────────────┘
```

**Search improvements:**
1. **Relevance ranking**: Featured first → keyword match score → recency
2. **Salary range slider**: Filter by min/max salary
3. **Date posted filter**: Last 24h, 7 days, 30 days
4. **Skills filter**: Autocomplete from skills JSON field
5. **Experience filter**: Entry, mid, senior, executive
6. **Education filter**: Matric, diploma, degree, postgraduate

### 3.5 Company Page

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────┐                                                │
│ │ Logo │ Standard Bank                                   │
│ │96x96 │ Banking & Finance · Founded 1862               │
│ └──────┘ Johannesburg, Gauteng · 45,000 employees       │
│          [Visit Website →] [LinkedIn →]                  │
└─────────────────────────────────────────────────────────┘
│ ABOUT                                                    │
│ Standard Bank is Africa's largest bank by assets...      │
└─────────────────────────────────────────────────────────┘
│ COMPANY STATS                                            │
│ 23 Open Jobs | R65k Avg Salary | 8 Categories | Gauteng │
└─────────────────────────────────────────────────────────┘
│ OPEN POSITIONS (23)                                      │
│ [Rich Job Card] [Rich Job Card] [Rich Job Card] ...     │
└─────────────────────────────────────────────────────────┘
```

### 3.6 Category Page

```
│ 💻 IT & Technology Jobs in South Africa                  │
│ 456 active positions across all provinces                │
│                                                          │
│ R55k Avg Salary | Gauteng Top Province | 67% Full-time  │
│                                                          │
│ Trending: [Python Developer] [Data Engineer] [DevOps]   │
│                                                          │
│ [Rich Job Cards, filtered by category, paginated]        │
```

---

## Part 4: Feature Architecture

### 4.1 Recommendation Engine

**Strategy:** Category + Province + Experience affinity (client-side, privacy-friendly)

```
When a user views a job:
  1. Record: { job_id, category, province, job_type, experience_level }
  2. Store in sessionStorage (no account required, no tracking)

For "Similar Jobs" section:
  Query: same category + same province + different job_id
  Fallback: same category + any province
  Fallback: same job_type + same province

For "Recommended for You" (homepage, after 3+ views):
  Build affinity profile from sessionStorage:
    { "IT & Technology": 5, "Gauteng": 4, "Senior": 3 }
  Query jobs matching top affinities, exclude already-viewed
  Show top 6
```

**No server-side tracking needed initially.** Keeps it simple, GDPR-compliant, fast.

### 4.2 Trending Searches

1. Every search query logged to `search_queries` collection
2. Nightly aggregation (systemd timer) counts queries from last 7 days
3. Top 20 queries cached for 1 hour
4. Display on homepage as "Trending Now" pills

### 4.3 Saved Jobs

**Phase 1 (no account):** localStorage `edubuzz_saved_jobs` = array of job IDs
**Phase 2 (with account):** Migrate to `saved_jobs` collection, sync across devices

### 4.4 Job Alerts (Enhanced)

When a new job is created:
1. Query all active job_alerts
2. Match: keyword, province, category, job_type, salary range, experience
3. Queue email based on frequency (instant / daily / weekly)
4. Send via existing SMTP/Brevo mailer

---

## Part 5: Implementation Priority (Ranked by User Impact)

### ★★★★★ — Make or Break (Week 1-2)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 1 | **Firecrawl ingestion pipeline** — scrape 3 pilot sources, store structured data | Without real jobs, nothing else matters | 3 days |
| 2 | **AI normalization service** — convert raw scrapes to structured JSON | Enables all structured UI features | 2 days |
| 3 | **Enhanced jobs schema** — add responsibilities, requirements, benefits, skills fields | Foundation for rich job pages | 1 day |
| 4 | **Job detail page redesign** — structured sections, AI summary, company sidebar | The page users spend 90% of time on | 3 days |
| 5 | **Deploy pipeline to production** — 3 sources crawling, 50+ real jobs live | Production must match source | 1 day |

### ★★★★★ — Core Experience (Week 3-4)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 6 | **Rich job cards** — logo, salary badge, skills, experience | First impression on every page | 2 days |
| 7 | **Homepage redesign** — hero, trending, featured, categories, employers | Landing page conversion | 2 days |
| 8 | **Search page redesign** — salary slider, experience filter, date filter | Users who can't find jobs leave | 3 days |
| 9 | **Search relevance ranking** — featured first, keyword score, recency | "Why are irrelevant jobs at the top?" | 1 day |
| 10 | **Companies collection + pages** — logo, description, all jobs, stats | Employer branding drives applications | 2 days |

### ★★★★ — Engagement & Retention (Week 5-6)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 11 | **Saved jobs** (localStorage) — heart icon, saved jobs page | Users return to check saved jobs | 1 day |
| 12 | **Job alerts** (enhanced) — salary filter, experience filter, frequency | Email drives return visits | 2 days |
| 13 | **Similar jobs** — category + province matching on detail page | Keeps users browsing | 1 day |
| 14 | **Trending searches** — log queries, aggregate, display on homepage | Social proof, discovery | 1 day |
| 15 | **Category page redesign** — stats, trending, filtered listings | High-traffic SEO pages | 2 days |

### ★★★ — Growth & Scale (Week 7-8)

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 16 | **Recommendation engine** — "Recommended for You" from viewed jobs | Personalization drives engagement | 2 days |
| 17 | **Scale to 10+ sources** — more SA career pages, government portals | More jobs = more users | 3 days |
| 18 | **SEO optimization** — JobPosting schema, sitemap, canonical URLs | Organic traffic | 2 days |
| 19 | **Employer self-service** — post jobs directly, manage listings | Revenue from featured listings | 3 days |
| 20 | **Consolidate data layers** — merge pocketbase.ts and jobService.ts | Reduces bugs | 2 days |

---

## Part 6: Architectural Decisions to Reverse

| Decision | Why Reverse | Replacement |
|----------|-------------|-------------|
| `contentEnricher.ts` fabricated templates | "Communication, teamwork" for every job is padding. Damages trust. | Delete. AI normalization from Firecrawl provides real content. Show "Full description on employer's website" when only summary exists. |
| Two data access layers | `pocketbase.ts` + `jobService.ts` duplicate queries | Single `jobService.ts`. Keep types in pocketbase.ts only. |
| `getAdminSettings()` per-request in Layout | Adds PB query to every page render | Cache settings in-memory with 60s TTL |
| Monetization before content | 5 ad zones, 25 jobs. Pointless. | Disable all monetization until 100+ real jobs |
| No application tracking | `apply_clicks` counter, no funnel | Track: view → click → submit → received |

---

## Part 7: Duplicate Systems to Remove

| System | Duplicate Of | Action |
|--------|-------------|--------|
| `pocketbase.ts` query functions | `jobService.ts` | Delete queries, keep types/constants |
| Inline `slugify()` in `import-jobs.ts` | `lib/slugify.ts` | Use shared slugify |
| `JOB_FIELDS` in `pocketbase.ts` | `JOB_FULL_FIELDS` in `jobService.ts` | Single field list |
| `contentEnricher.ts` | Replaced by AI normalization | Delete entirely |
| `affiliateService.ts` zone matching | `monetizationService.ts` supersedes | Delete affiliateService |

---

## Part 8: Competitive Positioning

| Feature | Indeed SA | Careers24 | Edubuzz (new) |
|---------|-----------|-----------|---------------|
| Structured sections | ❌ Wall of text | ❌ Inconsistent | ✅ Always: Responsibilities, Requirements, Benefits, Skills |
| AI summary | ❌ No | ❌ No | ✅ 2-3 sentence summary on every job |
| Salary transparency | ⚠️ Often hidden | ⚠️ Sometimes | ✅ Always extracted and prominent |
| Skills pills | ❌ Buried in text | ❌ Buried | ✅ Scannable skill tags |
| Company pages | ✅ Basic | ⚠️ Minimal | ✅ Rich: logo, description, stats |
| Smart filtering | ✅ Good | ⚠️ Basic | ✅ Salary slider, experience, education, skills |
| Trending searches | ❌ No | ❌ No | ✅ Real-time from search queries |
| Mobile experience | ✅ Good | ⚠️ Okay | ✅ Excellent (Astro SSR, minimal JS) |
| Page load speed | ⚠️ 3-5s | ⚠️ 3-4s | ✅ <1s (Astro SSR) |
| SA-specific | ⚠️ Global | ✅ Yes | ✅ Yes (provinces, ZAR, SA companies) |

**The structural advantage:** Every job on Edubuzz follows the same information architecture. Comparing a Standard Bank developer role with a Nedbank developer role is instant — salary, requirements, benefits, skills are all in the same places. On Indeed, one might have salary and the other might not. One lists benefits, the other doesn't. Inconsistency makes comparison impossible.

---

## Part 9: Approval Checklist

Before implementation:

- [ ] Firecrawl account created, API key configured
- [ ] AI provider selected (GPT-4o-mini for cost, Claude Sonnet for quality)
- [ ] 3 pilot sources identified and legally cleared
- [ ] PocketBase schema migration approved (new fields, new collections)
- [ ] Production deployment process confirmed
- [ ] Monetization disabled until 100+ real jobs live
- [ ] `contentEnricher.ts` fabricated content removed
- [ ] Architecture document approved

**Timeline:** 10 weeks from approval to 1000+ structured jobs with premium UX.
**Monthly cost:** R5,100-R6,900 (pipeline) + R90 (hosting) = ~R5,200-R7,000/month.
**Break-even:** 14-20 featured listings at R499/month.
