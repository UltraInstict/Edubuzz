# PocketBase Collection Setup

If any of these collections don't exist in your PocketBase instance, create them manually via the admin UI at `http://localhost:8090/_/`.

## Required Collections

### affiliate_links
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| name | Text | ✅ | — | Offer/link name |
| url | Text | ✅ | — | MaxBounty tracking URL |
| category | Text | — | `general` | Category for contextual matching |
| zone | Text | — | `sidebar` | `strip` / `sidebar` / `infeed` / `all` |
| active | Bool | — | `true` | Toggle on/off |
| clicks | Number | — | `0` | Auto-incremented on click |
| banner_html | Text | — | — | Optional HTML/JS banner creative |
| image_url | Text | — | — | Optional banner image URL |

**API Rules:** List/View = `""` (public), Create/Update/Delete = `@request.auth.id != ""`

---

### affiliate_clicks
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| link_id | Text | ✅ | ID of the affiliate_links record |
| job_id | Text | — | Job page where click occurred |
| device | Text | — | `mobile` / `tablet` / `desktop` |
| created | Date | — | Auto-set |

**API Rules:** List/View = admin only, Create = `""` (public)

---

### xml_sources
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| name | Text | ✅ | — | Feed name (e.g. "Indeed SA") |
| feed_url | Text | ✅ | — | Full URL to the XML/JSON/RSS feed |
| format | Text | — | `xml` | `xml` / `json` / `rss` / `indeed_xml` |
| active | Bool | — | `true` | Toggle crawling on/off |
| import_count | Number | — | `0` | Total jobs imported from this source |
| last_crawled | Date | — | — | Timestamp of last successful crawl |
| last_job_count | Number | — | `0` | Jobs found in last crawl |
| error_log | Text | — | — | Error message from last failed crawl |

**API Rules:** admin only (all operations)

---

### admin_settings
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| key | Text | ✅ (unique) | Setting key name |
| value | Text | — | Setting value |

**API Rules:** admin only

**Required keys for ad system:**
- `adsense_enabled` — `true` or `false`
- `adsense_publisher_id` — e.g. `ca-pub-XXXXXXXXXXXXXXXX`
- `adsense_slot_strip` — AdSense slot ID for strip zone
- `adsense_slot_sidebar` — AdSense slot ID for sidebar zone
- `adsense_slot_infeed` — AdSense slot ID for infeed zone
- `adsense_preview_mode` — `true` to show placeholder boxes

---

### analytics_events
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| job_id | Text | — | Job record ID |
| event | Text | ✅ | `job_viewed` / `job_searched` / `job_applied` / `job_shared` / `job_saved` |
| ref | Text | — | Referrer domain |
| device | Text | — | `mobile` / `tablet` / `desktop` |
| bot | Text | — | Bot name if detected |
| created | Date | — | Auto-set |

**API Rules:** List/View = admin only, Create = `""` (public)

---

### saved_jobs
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | Text | ✅ | User record ID |
| job_id | Text | ✅ | Job record ID |
| created | Date | — | Auto-set |

**API Rules:** List/View/Create/Delete = `@request.auth.id != ""`

---

### payments
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| amount | Number | ✅ | Payment amount in ZAR |
| status | Text | ✅ | `complete` / `pending` / `failed` |
| job_id | Text | — | Job that was featured |
| employer_id | Text | — | Employer who paid |
| created | Date | — | Auto-set |

**API Rules:** admin only

---

### audit_logs
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| event | Text | ✅ | Event name |
| details | Text | — | JSON details |
| created | Date | — | Auto-set |

**API Rules:** admin only

---

## One-Time Data Fix: Enable xml_export on all active jobs

After creating collections, run this in PocketBase admin JS console or via API:

```
// Set xml_export=true on all active jobs so outbound feeds have content
const jobs = await pb.collection('jobs').getFullList({ filter: 'active=true' });
for (const job of jobs) {
  await pb.collection('jobs').update(job.id, { xml_export: true });
}
```

Or use the Edubuzz admin panel: go to /admin/jobs, each job now has an "Export" toggle.


---

## Critical: API Rules Configuration

For each collection below, set the API rules in **PocketBase admin → [collection] → Settings → API Rules**.

The Edubuzz server uses an admin-authenticated client (`getAdminPB`) for all server-side reads, so technically `null` (admin only) is enough. But during development it's easier to set them open. Pick the appropriate level for your stage.

| Collection | List/Search Rule | View Rule | Create Rule | Update/Delete Rule |
|---|---|---|---|---|
| `jobs` | `""` (public) | `""` | `null` (admin only) | `null` |
| `categories` | `""` | `""` | `null` | `null` |
| `employers` | `verified=true` | `verified=true` | `null` | `null` |
| `applications` | `null` | `null` | `""` (public) | `null` |
| `pending_jobs` | `null` | `null` | `""` | `null` |
| `job_alerts` | `null` | `null` | `""` | `null` |
| `analytics_events` | `null` | `null` | `""` | `null` |
| `saved_jobs` | `@request.auth.id != ""` | `@request.auth.id != ""` | `@request.auth.id != ""` | `@request.auth.id != ""` |
| `payments` | `null` | `null` | `null` | `null` |
| `audit_logs` | `null` | `null` | `null` | `null` |
| `admin_settings` | `null` | `null` | `null` | `null` |
| `xml_sources` | `null` | `null` | `null` | `null` |
| `affiliate_links` | `""` (public — needed for SmartAdSlot) | `""` | `null` | `null` |
| `affiliate_clicks` | `null` | `null` | `""` | `null` |

> **`null`** = admin auth required (server uses `getAdminPB()`)
> **`""`** = empty string = anyone can access

If you see "no records" on admin pages even though records exist in PocketBase admin UI:
1. Confirm your `.env` has correct `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` matching a `_superusers` account
2. Confirm the collection name spelling exactly matches the code (`affiliate_links`, `xml_sources`, `admin_settings`)
3. Set the List rule to `""` temporarily as a debug step — if records appear, the issue was an over-restrictive rule

---

## Required `admin_settings` seed records

The settings page does an **upsert** (update if exists, create if missing). But to avoid empty selects, seed these key/value pairs in the `admin_settings` collection:

| key | value (initial) |
|---|---|
| `site_name` | `Edubuzz` |
| `tagline` | `South African jobs, updated daily.` |
| `jobs_per_page` | `20` |
| `featured_listing_price` | `299` |
| `adsense_enabled` | `false` |
| `adsense_publisher_id` | `` (empty) |
| `adsense_slot_strip` | `` |
| `adsense_slot_sidebar` | `` |
| `adsense_slot_infeed` | `` |
| `adsense_preview_mode` | `false` |
| `import_enabled` | `true` |


---

## UPDATED: affiliate_links collection (Batch 2)

The `affiliate_links` collection now supports banner uploads, custom dimensions, and a `jobs-top` zone. Update existing collection or recreate:

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | Text | ✅ | — | Ad title (full headline) |
| url | Text | ✅ | — | Affiliate tracking URL |
| category | Text | — | `general` | `general` matches all categories |
| zone | Text | — | `sidebar` | `strip` / `sidebar` / `infeed` / `jobs-top` / `all` |
| active | Bool | — | `true` | |
| clicks | Number | — | `0` | |
| banner_html | Text | — | — | MaxBounty creative HTML/JS code |
| banner_file | File | — | — | Single image, accept `image/*`, max 2MB |
| image_url | Text | — | — | External banner image URL |
| banner_width | Number | — | — | px (any IAB size) |
| banner_height | Number | — | — | px |

**Render priority** in SmartAdSlot:
1. `banner_html` (raw creative)
2. `banner_file` (uploaded image — preferred over URL)
3. `image_url` (external image)
4. Plain text link with ad title

---

## Where ads now appear

| Page | Slot | Zone |
|---|---|---|
| Homepage | Below hero | `strip` |
| Homepage | Sidebar (between Browse Jobs and Most Searched) | `sidebar` |
| /jobs | Below hero | `strip` |
| /jobs | Sidebar | `sidebar` |
| /jobs | Every 5 cards in feed | `infeed` |
| /job/[slug] | Top of main column | `jobs-top` |
| /job/[slug] | Below job description | `infeed` |
| /job/[slug] | Sidebar | `sidebar` |
| /category/[slug], /province/[slug], PSEO pages | Sidebar | `sidebar` |

A link with `zone="all"` shows in every zone.


---

## Batch 4: Add `description` to affiliate_links

The text-ad redesign needs a short subtitle. Add this single field to the existing `affiliate_links` collection:

| Field | Type | Required | Notes |
|---|---|---|---|
| `description` | Text | — | Optional subtitle, max 120 characters |

When this field is empty, SmartAdSlot will fall back to a truncated version of the ad title (only if the title is longer than 40 chars, to avoid duplicating it).


---

## Batch 7: Required PocketBase changes

### 1. Rename `affiliate_links.select` → `affiliate_links.zone`

If your `affiliate_links` collection has the placement field named `select` (a leftover from when it was a Select control labelled before being given a proper field name), rename it:

1. Open PocketBase admin → `affiliate_links` collection
2. Click the `select` field → change name to `zone`
3. Keep field type as **Select (single)** with values: `strip`, `sidebar`, `infeed`, `jobs-top`, `all`
4. Save

After the rename, every existing record will keep its zone value but the field will now be called `zone`. The codebase already references `zone` everywhere, so no further code changes are needed.

### 2. Add `reposted_at` to `jobs` (optional but recommended)

For the new Repost action in admin/jobs:

| Field | Type | Required | Notes |
|---|---|---|---|
| `reposted_at` | Date | — | Set automatically when an admin reposts an expired job |

If you don't add this field, repost still works — PocketBase will just silently drop the unknown field on update. The job's `active`, `expires`, and `featured` will still be reset correctly.

---

## New API endpoint: POST /api/admin/expire-jobs

Cron-callable endpoint that finds every `active=true` job whose `expires` is in the past and sets `active=false`. Returns `{ success: true, data: { expired: N } }`.

Recommended cron schedule: daily at midnight (Africa/Johannesburg).

System cron example:
```
0 0 * * * curl -X POST -H "Cookie: pb_auth=$ADMIN_TOKEN" https://edubuzz.co.za/api/admin/expire-jobs
```

PM2 cron equivalent in `ecosystem.config.cjs`:
```js
{
  name: 'edubuzz-expire-jobs',
  script: 'curl',
  args: '-X POST -H "Cookie: pb_auth=..." http://127.0.0.1:4321/api/admin/expire-jobs',
  cron_restart: '0 0 * * *',
  autorestart: false,
}
```
