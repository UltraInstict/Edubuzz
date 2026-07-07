# Edubuzz Platform Audit — Complete Findings & Bug Report

**Date:** 2026-07-07
**Scope:** Repository (117 files), Server (VPS/Services/PocketBase), Database (17 collections)
**Status:** Production is degraded — ads missing, homepage potentially zero jobs, rendering bugs active

---

## 1. CRITICAL BUGS — EXACT ROOT CAUSES

### 1.1 Affiliate Ads Disappeared

**Root Cause:** `MonetizationSlot.astro` replaced `SmartAdSlot.astro` in 5 pages, but the `monetization_campaigns` PocketBase collection **does not exist yet**. `resolveSlot()` queries this collection, catches the error, and returns `{type: 'empty', content: null}` — so NO ads render.

**Fix:**
1. Create `monetization_campaigns` collection in PocketBase Admin with fields:
   - name (text), campaign_type (select: affiliate_image|affiliate_html|affiliate_text|adsense_manual|house_ad|sponsored_job|sponsored_employer)
   - zone (select: strip|sidebar|infeed|jobs-top|homepage-hero|all)
   - priority (number, default 80), active (bool, default true)
   - start_date (date, optional), end_date (date, optional)
   - category_target (text, optional), reference_id (text)
   - impressions (number), clicks (number)
2. Visit `/admin/monetization` → click "Import Affiliate Links as Campaigns"

**Fallback fix:** If `monetization_campaigns` doesn't exist, `MonetizationSlot.astro` silently renders nothing — this is by design but means ads are blank until the collection exists.

---

### 1.2 Homepage Shows Zero Jobs

**Root Cause:** If all jobs have `expires` dates in the past but are still marked `active=true`, the filter `active=true && expires>"YYYY-MM-DD"` returns zero results. The `expire-jobs` API (`POST /api/admin/expire-jobs`) may not be running on a cron schedule.

**Verification needed:** Check PocketBase for jobs where `active=true && expires < today`.

**Fix:** Run `POST /api/admin/expire-jobs` (admin only), then repost or re-import jobs with future expiry dates.

---

### 1.3 Category Counts Show Zero

**Root Cause:** `categories.job_count` is a static field never auto-updated. Two competing implementations compute live counts differently:
- `lib/pocketbase.ts` `getCategoriesWithCounts()` — caps at 500 jobs (`perPage:500`), silently trims counts beyond 500
- `services/jobService.ts` `getCategoriesWithCounts()` — fetches ALL jobs via `getFullList()` without limit, will OOM at scale

Some pages sort by the stale `job_count` field (`getCategories()`), others compute live counts (`getCategoriesWithCounts()`).

**Fix:** `getCategoriesWithCounts()` in `jobService.ts` needs a `perPage:5000` cap. Use the service layer version everywhere.

---

### 1.4 Dynamic Rendering Fails — `company/[slug].astro`

**Root Cause:** Line 4: `import EmptyState from '../../components/ui/EmptyState.astro'` — this file **does not exist**. There is no `src/components/ui/EmptyState.astro`. The page will throw 500 error on any company page.

**Fix:** Add `src/components/ui/EmptyState.astro` if missing, or replace import with inline markup.

---

### 1.5 Stray HTML `ipt>` — 4 Files

| File | Line | Code |
|------|------|------|
| `Sidebar.astro` | 95 | `ipt>` after `</script>` |
| `SmartAdSlot.astro` | 218 | `ipt>` after `</script>` |
| `job/[slug].astro` | 706 | `yle>` after `</style>` |
| `admin/affiliates.astro` | 280 | `ipt>` after `</script>` |

**Root Cause:** Likely copy-paste error where `</script>` was accidentally typed as `</script>ipt>` in an earlier edit. The `ipt>` is rendered as literal text in the HTML output.

**Fix:** Delete the stray text from each file.

---

### 1.6 Monetization Stopped Rendering

**Root Cause:** Same as bug 1.1 — `monetization_campaigns` collection missing. `MonetizationSlot.astro` silently renders nothing. Also:
- `SmartAdSlot.astro` is dead code (not imported by any page)
- `MonetizationSlot.astro` has no fallback to AdSense from `admin_settings` alone
- The seed migration (`seedCampaignsFromAffiliates()`) has never been run

**Fix:** Same as 1.1 — create collection + run seed.

---

## 2. ARCHITECTURE VIOLATIONS

### 2.1 Two Competing Data Layers (HIGH)

| Layer | File | Used By |
|-------|------|---------|
| **lib/pocketbase.ts** | 439 lines, 25+ exported functions | 17 pages, 2 components |
| **services/jobService.ts** | 627 lines, 30+ exported functions | 1 page (`categories.astro`) |

Both export identical functions (`getJobs`, `getCategories`, `getCategoriesWithCounts`, `getFeaturedJobs`, `getRelatedJobs`, `getJobBySlug`, `getEmployers`, `getEmployerBySlug`, `getSiteStats`, `getCategoryBySlug`). Pages import randomly from one or the other. The service layer contains 12+ functions that are **completely unused** (`listJobs`, `listCategories`, `getAdminMetrics`, `listAdminJobs`, etc.).

| Duplicated Function | lib/pocketbase.ts | services/jobService.ts | Notes |
|---|---|---|---|
| `getJobs` / `listJobs` | ✅ used by all pages | ✅ **UNUSED** | Different interfaces |
| `getCategoriesWithCounts` | ✅ caps at 500 | ✅ no cap (will OOM) | Different behavior |
| `getCategories` / `listCategories` | ✅ | ✅ **UNUSED** | |
| `getFeaturedJobs` | ✅ | ✅ **UNUSED** | |
| `getRelatedJobs` | ✅ | ✅ **UNUSED** | |
| `getJobBySlug` | ✅ | ✅ **UNUSED** | |
| `getEmployers` / `listEmployers` | ✅ | ✅ **UNUSED** | |
| `getEmployerBySlug` | ✅ | ✅ **UNUSED** | |
| `getSiteStats` | ✅ | ✅ **UNUSED** | |
| `getCategoryBySlug` | ✅ | ✅ **UNUSED** | |

**Recommendation:** Pages should use `services/jobService.ts`. Delete duplicate functions from `lib/pocketbase.ts`. This is a one-pass replace operation across 17 files.

---

### 2.2 Duplicated Pagination HTML (HIGH)

12 listing pages inline identical pagination markup (~60 lines each, ~720 lines total). `Pagination.astro` component exists but is never used.

**Files:** `index.astro`, `jobs/index.astro`, `category/[slug].astro`, `province/[slug].astro`, `company/[slug].astro`, `internships.astro`, `learnerships.astro`, `graduate-jobs.astro`, `bursaries.astro`, `remote-jobs.astro`, `[category]-jobs-in-[province].astro`, `jobs-in-[province].astro`

---

### 2.3 Hardcoded URLs (HIGH)

**54 instances** of `https://edubuzz.co.za` hardcoded across 36 files. `lib/constants.ts` defines `SITE_URL` but only `Layout.astro` uses it. All feed generators, sitemap generators, email templates, and breadcrumbs hardcode the domain.

---

### 2.4 Dead Code (MEDIUM)

| File | Why Dead |
|------|----------|
| `SmartAdSlot.astro` | Not imported by any page. Replaced by `MonetizationSlot.astro`. |
| `Pagination.astro` | Exists but all pages inline pagination HTML. |
| `lib/generate_jobs.py` | Python script in `src/lib/` — not executable from Astro. |
| `lib/moderation.ts` vs `services/moderationService.ts` | Overlapping spam detection. `moderation.ts` used by API; `moderationService.ts` more comprehensive but partially unused. |
| `services/jobService.ts` — 12+ unused functions | `listJobs`, `listCategories`, `listAdminJobs`, `listAdminJobsFiltered`, etc. |

---

## 3. POCKETBASE SCHEMA ISSUES

### 3.1 Missing Collections (CRITICAL)

| Collection | Expected | Status |
|---|---|---|
| `monetization_campaigns` | Required by `MonetizationSlot.astro` | **Unknown — may not exist** |
| `house_ads` | Required by monetization system | **Unknown — may not exist** |

### 3.2 Stale Category Counts (MEDIUM)

`categories.job_count` is never auto-updated. Code sorts by this stale field. Live counts computed at query time are correct but inconsistent.

---

## 4. IMMEDIATE FIXES (In Priority Order)

### Production-Critical (Fix Now)

1. **Create `monetization_campaigns` collection** in PocketBase → Run seed migration → Verify ads render
2. **Create `house_ads` collection** in PocketBase
3. **Run `POST /api/admin/expire-jobs`** to fix homepage zero-jobs issue
4. **Fix `company/[slug].astro`** — create or import correct EmptyState path
5. **Remove stray HTML** (`ipt>`, `yle>`) from 4 files
6. **Remove `SmartAdSlot.astro`** — dead code with stray HTML

### Today

7. Migrate 12 pages from inline pagination to `<Pagination>` component
8. Fix `getCategoriesWithCounts()` in `services/jobService.ts` — add `perPage` cap
9. Add `monetization_campaigns` and `house_ads` schemas to `POCKETBASE_SCHEMA.md`

### This Week

10. Begin data layer consolidation — migrate pages from `lib/pocketbase.ts` → `services/jobService.ts`
11. Replace hardcoded `https://edubuzz.co.za` with `SITE_URL` constant in 36 files
12. Delete `lib/generate_jobs.py`, merge `lib/moderation.ts` + `services/moderationService.ts`
