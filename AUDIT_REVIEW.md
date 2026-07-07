=====================================
EDUBUZZ PLATFORM AUDIT — REVIEW NOTES
=====================================

Hi Thumi, here's everything I found in the full audit.
Please read through before we move forward.

=====================================
WHAT'S FIXED & DEPLOYED
=====================================

✅ Stray HTML bugs removed from Sidebar.astro and job/[slug].astro
   (literal "ipt>" and "yle>" text rendering in HTML output)

✅ Dead SmartAdSlot.astro deleted
   (was causing "SmartAdSlot is not defined" crashes on server)

✅ getCategoriesWithCounts OOM risk capped at 5000 perPage
   (was fetching ALL jobs without limit in services/jobService.ts)

✅ monetization_campaigns PocketBase collection CREATED

✅ house_ads PocketBase collection CREATED

✅ 7 campaigns seeded from 7 existing affiliate links

✅ Clean build deployed, all HTTP 200, PM2 stable

=====================================
CRITICAL: DATABASE IS EMPTY
=====================================

The database has ZERO jobs and ZERO employers.
264KB total. Categories exist (15) but have no data.
All content was lost at some point.

The backup script at scripts/backup.sh has WRONG PATHS:
  PB_DIR="/home/edubuzz/pb_data"     ← WRONG
  Should be: /home/edubuzz/pocketbase/pb_data/

No backups exist. Nothing to restore from.

=====================================
WHAT NEEDS TO HAPPEN TO RESTORE DATA
=====================================

Option A: Re-import from XML feeds
  - Check if xml_sources collection has feed URLs configured
  - Add feed sources in /admin/import UI
  - Trigger crawl to pull jobs from SA job aggregators

Option B: Import from CSV/JSON files
  - Use /admin/import → CSV Upload or JSON Import

Option C: Re-seed from scratch
  - If you have old data exports, we can import them

I need you to tell me which path to take.

=====================================
ADVERTISING STATUS
=====================================

✅ monetization_campaigns collection exists with 7 campaigns
✅ All 7 affiliate links are active
✅ MonetizationSlot component renders ads on all pages
✅ Click tracking works

But ads will show on pages that call <MonetizationSlot>.
Pages that still reference SmartAdSlot (none now) are fixed.

=====================================
ARCHITECTURE ISSUES FOUND
=====================================

TWO COMPETING DATA LAYERS:
  lib/pocketbase.ts  — 17 pages import from here
  services/jobService.ts — only 1 page imports from here

Both export identical functions (getJobs, getCategories, etc).
12+ functions in jobService.ts are completely unused.
This needs consolidation but is NOT urgent.

DUPLICATED PAGINATION:
  12 pages inline identical pagination HTML (~720 lines total).
  Pagination.astro component exists but nobody uses it.
  Low priority fix.

HARDCODED URLs:
  54 instances of "https://edubuzz.co.za" across 36 files.
  lib/constants.ts already has SITE_URL defined.
  Feed generators, sitemaps, breadcrumbs all hardcode it.
  Works on production, breaks on staging/local.

DEAD CODE:
  SmartAdSlot.astro — DELETED ✅
  Pagination.astro — exists, unused
  lib/generate_jobs.py — Python script in TypeScript source
  lib/moderation.ts — overlaps with services/moderationService.ts

=====================================
SERVER STATE
=====================================

OS: Ubuntu 22.04 (x86_64)
Node v22.23.0, npm 10.9.8
RAM: 1.9GB total, ~440MB free (tight)
Disk: 38GB, 9% used (good)
PM2: edubuzz in cluster mode on port 4321
PocketBase: systemd service on port 127.0.0.1:8090
Nginx: CloudPanel, HTTPS with Let's Encrypt, HSTS preload
No cron jobs configured for expire-jobs or backups

=====================================
PRIORITY ORDER (MY RECOMMENDATION)
=====================================

1. RESTORE JOB DATA — site is empty, this is urgent
2. Fix backup script paths + add to cron
3. Add expire-jobs to cron (daily)
4. Data layer consolidation (can wait)
5. Replace 54 hardcoded URLs with SITE_URL constant
6. Migrate pages to shared Pagination component
7. Delete remaining dead code

=====================================
QUESTIONS FOR YOU
=====================================

1. How were jobs originally imported?
   XML feeds? CSV? Manual entry?

2. Do you have any data exports or old database files?

3. Should I:
   a) Set up XML feed sources and import fresh?
   b) Try to recover old database from VPS snapshots?
   c) Something else?

4. The backup script is broken. Should I fix it now?

5. Are you OK with me consolidating the data layer
   (moving all pages to services/jobService.ts)?
   It's a safe, mechanical change — just renames imports.

6. There are 54 hardcoded "https://edubuzz.co.za" URLs.
   Should I replace them with the SITE_URL constant?
   This would allow staging/local to work properly.

Let me know what you want to tackle first.
