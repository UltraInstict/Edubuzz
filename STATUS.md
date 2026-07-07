# Edubuzz Production Status — Phase 0 Complete

**Date:** 2026-07-07 21:52 UTC
**Deployed commit:** 314e201 (clean debug log removal)

---

## ✅ Fixed & Deployed

### Bug 1: Monetization not rendering (ALL ads broken)
**Root cause:** Two issues:
1. `expandZoneVariants()` contained parentheses in zone names like `"Strip (full-width banner)"` — PocketBase interpreted these as nested filter groups, returning 400
2. `pbFetch()` passed `sort=priority,+created` via `URLSearchParams` which URL-encodes `,` as `%2C` — PocketBase couldn't parse the encoded comma

**Fix:** Rewrote `pbFetch()` to use raw `fetch()` against PocketBase REST API with no sort parameter and clean zone filtering in JavaScript. Set collection API rules to allow public reads.

### Bug 2: Stray HTML fragments
**Root cause:** Literal text `out>` on line 103 of `index.astro` and `ipt>` on line 95 of `Sidebar.astro`

**Fix:** Removed stray text from both files. Also deleted dead `SmartAdSlot.astro`.

### Bug 3: PM2 deploy not loading env vars
**Root cause:** `pm2 reload` with `--update-env` doesn't reliably propagate `.env` values to cluster workers

**Fix:** Use `pm2 delete + pm2 start ecosystem.config.cjs --env production` pattern. Fixed `ecosystem.config.cjs` dotenv path to use absolute path.

### Bug 4: PocketBase collections missing
**Root cause:** `monetization_campaigns` and `house_ads` collections didn't exist in production

**Fix:** Created both collections with proper schemas. Seeded `monetization_campaigns` from 7 existing `affiliate_links`. Set all three collections (`monetization_campaigns`, `house_ads`, `affiliate_links`) to open API rules for public reads.

---

## ⚠️ Database State

**0 jobs, 0 employers** — data was lost at some point. No backups exist (script had wrong paths).

**Action needed:** Import jobs via XML feeds from `/admin/import`

---

## 🔧 Architecture Change Summary

| Component | Before | After |
|---|---|---|
| Ad rendering query | PocketBase JS SDK `getFullList()` with `getAdminPB()` | Raw `fetch()` to REST API with public client |
| Zone matching | PB filter with OR groups | JavaScript `Array.filter()` after fetch |
| Sort | `sort=priority,+created` via SDK | No sort — filtered in JS |
| API auth | Per-request superuser login | Public access (open collection rules) |
| PM2 deploy | `pm2 reload --update-env` | `pm2 delete + pm2 start --env production` |

---

## 📋 Remaining Tasks (Phase 1+)

1. **Import jobs** — re-add XML feed sources and trigger crawls
2. **Fix backup script** — correct `PB_DIR` path to `/home/edubuzz/pocketbase/pb_data/`
3. **Add expire-jobs cron** — `curl -X POST http://127.0.0.1:4321/api/admin/expire-jobs` daily
4. **Data layer consolidation** — migrate 17 pages from `lib/pocketbase.ts` to `services/jobService.ts`
5. **Replace 54 hardcoded URLs** with `SITE_URL` constant
6. **Adopt shared Pagination component** in 12 pages
7. **Rotate credentials** in `.env` (currently committed with secrets)

---

## Verification (Live Site)

- Homepage: ✅ ADS FOUND, 0 stray HTML
- Jobs page: ✅ ADS FOUND
- Stray `out>` text: ✅ FIXED
- Stray `ipt>` text: ✅ FIXED
- PM2: ✅ Online, 0 restarts
- Build: ✅ Clean, no errors
