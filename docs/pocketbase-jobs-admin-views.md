# PocketBase — Jobs collection admin views & filters

Practical admin usability guide for managing imported jobs in the PocketBase Admin UI.

- **PocketBase version:** 0.37.4 (verified: `pocketbase --version`)
- **Admin UI:** https://edubuzz.co.za/_/  → **Collections → jobs**
- **Jobs collection id:** `pbc_799843659`
- **Scope:** no schema change, no data change, no frontend/API change. Everything below is
  filter/sort text you paste into the admin, plus column toggles and browser bookmarks.

Every filter and sort string below was **validated against the production records API** (the admin
filter bar uses the same expression syntax), with live counts shown as of the audit.

---

## What PocketBase 0.37 supports (capability check)

| Requirement | Supported? | How |
|---|---|---|
| Quick filters (featured/active/source/employer/category/province) | ✅ | Paste expression into the list **filter bar** |
| Sorting shortcuts | ✅ | Column header click, or `sort=` in the bookmarked URL |
| Choose which columns show | ✅ | **Columns** control (gear icon) above the list — stored per browser (localStorage) |
| **Inline-edit Featured from the list** | ❌ **Not supported** | List rows are read-only; open the record to toggle `featured` (see §2) |
| **Save named filters/views server-side** | ❌ **Not supported** | PocketBase has no saved-view feature. Use **browser bookmarks** of filtered URLs (see §5) |

> There is no way to persist columns/filters/sort inside the database without editing the
> collection definition (a schema change) — which is explicitly out of scope. The supported,
> zero-schema mechanism is: apply in the UI, then bookmark the URL.

---

## 1. Quick filters (paste into the list filter bar)

Open **Collections → jobs**, click the **filter** (funnel) input, paste one expression, press Enter.

### Featured
```
featured=true
```
```
featured=false
```
_(live: 4 featured, 535 not)_

### Active
```
active=true
```
```
active=false
```
_(live: 539 active, 0 inactive)_

### Source  — template + live values
```
source="<value>"
```
Exact source values currently in the DB (paste one):
| Filter | Count |
|---|--:|
| `source="manual"` | 25 |
| `source="greenhouse:takealotcom"` | 59 |
| `source="greenhouse:ozow"` | 11 |
| `source="greenhouse:luno"` | 6 |
| `source="greenhouse:entersekt"` | 5 |
| `source="greenhouse:offerzen"` | 2 |
| `source="greenhouse:sabertech"` | 1 |
| `source="smartrecruiters:StandardBankGroup"` | 128 |
| `source="smartrecruiters:OUTsurance"` | 10 |
| `source="smartrecruiters:Deloitte6"` | 291 |
| `source="smartrecruiters:LifeHealthcare"` | 1 |

All imported (exclude seeds):
```
source!="manual"
```
All from one platform (prefix match):
```
source~"greenhouse:"
```
```
source~"smartrecruiters:"
```

### Employer
`employer_id` is a **relation**; the human-readable name lives in the `company` text field, so filter on `company`:
```
company="Deloitte"
```
Contains (partial, case-insensitive):
```
company~"Standard Bank"
```
_(live: `company~"Standard Bank"` → 129)_

By relation id (if you have the employer record id):
```
employer_id="<employers_record_id>"
```

### Category
```
category="Engineering"
```
Contains:
```
category~"Finance"
```
> **Caveat:** imported jobs store the employer's raw ATS department in `category` (e.g.
> `"Takealot Engineering"`, `"Deloitte Human Capital - West Africa"`), not the site's 15 canonical
> categories. So category filtering is reliable for the 25 `manual` jobs but noisy for imports.
> Prefer filtering imports by **source** or **company**.

### Province
```
province="Gauteng"
```
Live province values: `Western Cape` 84 · `Gauteng` 78 · `KwaZulu-Natal` 6 · `Eastern Cape` 3 ·
`Mpumalanga` 2 · `Limpopo` 1 · `Free State` 1 · `Remote` 1 · **empty 363**.

Imported jobs with **no province** (data-quality worklist — mostly non-SA Deloitte roles):
```
source!="manual" && province=""
```

### Useful combinations
Featured **and** live:
```
featured=true && active=true
```
Imported, South-Africa-located, active:
```
source!="manual" && active=true && province!=""
```
One employer, newest first (set sort per §3):
```
company~"Takealot"
```

---

## 2. Editing "Featured" (inline not available)

PocketBase 0.37 has **no inline editing** in the records list. To change `featured`:

1. Filter the list (e.g. `featured=false && company~"Takealot"`).
2. **Click the row** to open the record panel.
3. Toggle the **featured** switch → **Save**.

For changing many at once (optional, admin-only, not a code/API change to the app): the admin can use
the built-in **Records API** with a superuser token to `PATCH` `{"featured":true}` per id. This is a
manual ops action, not part of the application. Ask if you want a ready-to-run snippet.

---

## 3. Sorting shortcuts (verified)

Click a column header to sort, or use these `sort=` values in a bookmarked URL:

| Shortcut | Expression |
|---|---|
| Newest | `-created` |
| Oldest | `created` |
| Featured first | `-featured,-created` |
| Employer (A→Z) | `company` |
| Source | `source` |

(Prefix `-` = descending. `-featured` puts featured=true on top; the `,-created` tiebreak shows newest featured first.)

---

## 4. Columns to display

Use the **Columns** control (top-right of the list) to show exactly these and hide the rest
(description/responsibilities/requirements/benefits/hashes make rows unreadable):

`title` · `company` (label as **Employer**) · `source` · `province` · `category` · `featured` · `active` · `created` · `updated`

Column selection is saved in **your browser** (localStorage). Each admin sets it once per browser.

---

## 5. "Saved views" via bookmarks (the supported substitute)

PocketBase can't store named views, but it encodes the current **filter + sort** into the page URL,
so a **browser bookmark reproduces the view** on any machine you're logged into.

To create each saved view:
1. Collections → jobs.
2. Paste the filter (§1) and set the sort (§3).
3. **Bookmark the page** and name it.

Recommended bookmark set:
| Bookmark name | Filter | Sort |
|---|---|---|
| Imported – newest | `source!="manual"` | `-created` |
| Featured (live) | `featured=true && active=true` | `-created` |
| Needs review – no province | `source!="manual" && province=""` | `-created` |
| Standard Bank | `company~"Standard Bank"` | `-created` |
| Deloitte | `source="smartrecruiters:Deloitte6"` | `-created` |
| Takealot | `source="greenhouse:takealotcom"` | `-created` |
| Inactive | `active=false` | `-updated` |
| Not featured | `featured=false` | `-created` |

> Tip: the admin URL base is `https://edubuzz.co.za/_/`. Apply the filter/sort in the UI first, then
> bookmark — PocketBase writes the state into the URL for you (exact query-param encoding varies by
> version, so bookmarking the live URL is more reliable than hand-writing it).

---

## Notes / data-quality flags surfaced while building this
- `featured=true` = 4 records (all pre-existing manual seeds; no imported job is featured yet).
- 363 active jobs have an **empty province** (mostly non-SA Deloitte Africa roles) — see the
  `source!="manual" && province=""` view.
- `category` on imported jobs = raw ATS department text, not the site's canonical categories.
