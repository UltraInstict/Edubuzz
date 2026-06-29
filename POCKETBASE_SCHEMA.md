# Edubuzz PocketBase Schema

Create these collections in the PocketBase Admin UI (`_/`).

---

## 1. `users` (Auth Collection — PocketBase built-in)

PocketBase provides this by default. Enable the **Auth** option.

| Field | Type | Rules |
|---|---|---|
| `name` | Text | Required |
| `email` | Email | Required, unique |
| `password` | Password | Required (managed by PB) |
| `passwordConfirm` | Password | Required on create |
| `role` | Select | Options: `candidate`, `employer`, `moderator`, `admin`, `superadmin`. Default: `candidate`. |

---

## 2. `jobs`

| Field | Type | Rules |
|---|---|---|
| `title` | Text (120) | Required |
| `slug` | Text (80) | Required, unique |
| `company` | Text (120) | Required |
| `company_logo` | File | Optional |
| `category` | Text (80) | Required, references `categories.name` |
| `province` | Text (80) | Required |
| `city` | Text (80) | Default `""` |
| `description` | Text (10000) | Required |
| `apply_url` | URL (300) | Optional |
| `apply_email` | Email (120) | Optional |
| `salary_min` | Number | Optional |
| `salary_max` | Number | Optional |
| `salary_currency` | Text (10) | Default `"ZAR"` |
| `job_type` | Text (40) | Required |
| `source` | Text (40) | Values: `feed`, `manual`, `import`, `employer`, `xml_feed` |
| `source_ref` | Text (200) | Optional (used for feed dedup) |
| `employer_id` | Text (80) | Optional, references `employers.id` |
| `views` | Number | Default `0` |
| `clicks` | Number | Default `0` |
| `apply_clicks` | Number | Default `0` |
| `featured` | Bool | Default `false` |
| `featured_expires` | DateTime | Optional |
| `expires` | DateTime | Required. Auto-set to +30d on create. |
| `active` | Bool | Default `true` |
| `xml_export` | Bool | Default `true` |
| `og_image` | Text | Optional (OG image path) |
| `employer_website` | URL | Optional |
| `reposted_at` | DateTime | Optional |

---

## 3. `categories`

| Field | Type | Rules |
|---|---|---|
| `name` | Text (80) | Required |
| `slug` | Text (80) | Required, unique |
| `icon` | Text | Optional |
| `color` | Text (10) | Optional, hex colour |
| `job_count` | Number | Default `0` |

---

## 4. `employers`

| Field | Type | Rules |
|---|---|---|
| `user_id` | Text (80) | Optional, references `users.id` |
| `company_name` | Text (120) | Required |
| `company_slug` | Text (80) | Required, unique |
| `logo` | File | Optional |
| `website` | URL (300) | Optional |
| `description` | Text (5000) | Optional |
| `province` | Text (80) | Optional |
| `city` | Text (80) | Optional |
| `verified` | Bool | Default `false` |
| `plan` | Text (40) | Default `"free"`. Options: `free`, `basic`, `pro`, `enterprise`. |
| `plan_expires` | DateTime | Optional |
| `contact_email` | Email | Required |
| `stripe_customer` | Text | Optional (legacy) |
| `blocked` | Bool | Default `false` |
| `suspended` | Bool | Default `false` |
| `company_email` | Email | Optional (used as fallback for expiry reminders) |

---

## 5. `applications`

| Field | Type | Rules |
|---|---|---|
| `job` | Text (80) | Required, references `jobs.id` |
| `job_id` | Text (80) | Optional, alternative job reference |
| `name` | Text (80) | Required |
| `email` | Email (120) | Required |
| `phone` | Text (30) | Optional |
| `text` | Text (5000) | Cover letter (field is called `text` in FormData create, but read as `cover_letter` elsewhere) |
| `cover_letter` | Text (5000) | Alias/fallback for cover letter text |
| `cv_file` | File | Optional, PDF/DOC/DOCX only, max 5MB |
| `resume` | Text | Optional (legacy) |
| `status` | Select | Options: `pending`, `reviewed`, `shortlisted`, `rejected`. Default: `"pending"`. |
| `ip_address` | Text (45) | Optional |
| `applicant_name` | Text (80) | Optional fallback for `name` |
| `applicant_email` | Email (120) | Optional fallback for `email` |
| `applicant_phone` | Text (30) | Optional fallback for `phone` |

---

## 6. `pending_jobs`

Jobs submitted by employers, awaiting admin approval. On approval, PB hook copies to `jobs`.

| Field | Type | Rules |
|---|---|---|
| `employer_name` | Text (80) | Required |
| `employer_email` | Email (120) | Required |
| `company` | Text (120) | Required |
| `title` | Text (120) | Required |
| `category` | Text (80) | Default `"General"` |
| `description` | Text (10000) | Required |
| `province` | Text (80) | Required |
| `city` | Text (80) | Default `""` |
| `job_type` | Text (40) | Required |
| `salary_min` | Number | Optional |
| `salary_max` | Number | Optional |
| `apply_url` | URL (300) | Optional |
| `apply_email` | Email (120) | Optional |
| `status` | Select | Options: `pending`, `approved`, `rejected`. Default: `"pending"`. |

---

## 7. `job_alerts`

| Field | Type | Rules |
|---|---|---|
| `email` | Email (120) | Required |
| `keyword` | Text (120) | Required |
| `province` | Text (80) | Optional |
| `category` | Text (80) | Optional |

---

## 8. `payments`

| Field | Type | Rules |
|---|---|---|
| `amount` | Number | Required |
| `status` | Text (40) | Values: `COMPLETE`, `complete`, `pending`, `failed` |
| `job_id` | Text (80) | Required, references `jobs.id` |
| `employer_id` | Text (80) | Optional, references `users.id` / `employers.id` |

---

## 9. `analytics_events`

| Field | Type | Rules |
|---|---|---|
| `job_id` | Text (80) | Optional, references `jobs.id` |
| `event` | Select | Options: `view`, `click`, `apply_click`, `share`, `search`, `alert_signup`, `page_view` |
| `ref` | Text (300) | Referrer domain, default `"direct"` |
| `device` | Text (20) | Values: `desktop`, `mobile`, `tablet` |
| `bot` | Text (40) | Bot name if detected, else `""` |
| `page_type` | Text (80) | Optional, used for `page_view` events |
| `created` | DateTime | Auto |

---

## 10. `affiliate_links`

| Field | Type | Rules |
|---|---|---|
| `name` | Text (120) | Required |
| `url` | URL (500) | Required (affiliate/redirect URL) |
| `category` | Select | Options: `finance`, `tech`, `government`, `health`, `education`, `engineering`, `legal`, `marketing`, `hospitality`, `retail`, `construction`, `logistics`, `agriculture`, `mining`, `general`. Default: `"general"`. |
| `zone` | Select | Options: `strip`, `sidebar`, `infeed`, `jobs-top`, `all` |
| `display_type` | Select | Options: `text`, `image`, `html`. Default: `"text"`. |
| `active` | Bool | Default `true` |
| `clicks` | Number | Default `0` |
| `description` | Text (120) | Optional |
| `banner_html` | Text | Optional (custom HTML banner) |
| `image_url` | URL | Optional (external image URL) |
| `banner_file` | File | Optional (uploaded banner image) |
| `banner_width` | Number | Optional |
| `banner_height` | Number | Optional |

---

## 11. `affiliate_clicks`

| Field | Type | Rules |
|---|---|---|
| `link_id` | Text (80) | Required, references `affiliate_links.id` |
| `job_id` | Text (80) | Optional, references `jobs.id` |
| `device` | Text (20) | Values: `desktop`, `mobile`, `tablet`. Default: `"desktop"`. |
| `created` | DateTime | Auto |

---

## 12. `admin_settings`

Key-value store for admin-configurable settings.

| Field | Type | Rules |
|---|---|---|
| `key` | Text (80) | Required, unique |
| `value` | Text (5000) | Required |

---

## 13. `xml_sources`

Feed sources for job XML/RSS import.

| Field | Type | Rules |
|---|---|---|
| `name` | Text (120) | Required |
| `feed_url` | URL (300) | Required |
| `format` | Select | Options: `xml`, `json`, `rss`, `indeed_xml`, `generic_rss`, `jobsora`. Default: `"xml"`. |
| `active` | Bool | Default `true` |
| `last_crawled` | DateTime | Optional |
| `last_job_count` | Number | Optional |
| `import_count` | Number | Default `0` |
| `last_imported` | DateTime | Optional |
| `error_log` | Text | Optional |
| `import_count+` | (auto-increment via hook) | |

---

## 14. `saved_jobs`

Saved/bookmarked jobs by users.

| Field | Type | Rules |
|---|---|---|
| `user_id` | Text (80) | Required, references `users.id` |
| `job_id` | Text (80) | Required, references `jobs.id` |

---

## 15. `audit_logs`

| Field | Type | Rules |
|---|---|---|
| `event` | Text (80) | Required |
| `details` | JSON / Text | Required (JSON string) |

---

## 16. `alerts` (Legacy)

Used by `/api/admin/send-alerts`. Older alert system (separate from `job_alerts`).

| Field | Type | Rules |
|---|---|---|
| `email` | Email | Required |
| `keyword` | Text | Optional |
| `province` | Text | Optional |
| `created` | DateTime | Auto |

---

## Notes

- All collections get auto-fields: `id` (default), `created`, `updated`.
- **`_superusers`** is a PocketBase system collection — do NOT create manually.
- The `jobs.description` field uses a whitelist of HTML tags via `sanitizeHtml()`: `b, i, em, strong, p, br, ul, ol, li, a, h1-h6, div, span`. Attributes are stripped except `href` on `<a>`.
- `pb_hooks/main.pb.js` handles: auto-slug on job create, pending_jobs→jobs copy on approval, application confirmation emails, job alert emails, job expiry reminders.
- Several collections reference each other by string ID — PocketBase does NOT enforce referential integrity; these are logical references.
