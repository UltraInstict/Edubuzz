# ⚠️ DANGEROUS SCRIPTS — DO NOT RUN AGAINST PRODUCTION

These scripts are quarantined here on purpose. They are **destructive or
schema/rule-mutating** ad-hoc maintenance tools from earlier debugging sessions.
Running any of them against the live PocketBase can **delete collections, wipe
records, or rewrite security rules**.

## Why they were quarantined (Phase 0, backend hardening mission)

The prior audit traced the "affiliate_links / monetization_campaigns dropped to
zero" incidents to manual execution of scripts like these — specifically
`fix-pb-schema.mjs`, which calls `pb.collections.delete(...)` (deleting a
collection destroys **all** its records, then recreates it empty). The normal
deploy pipeline (`git pull → npm ci → npm run build → pm2 reload`) does **not**
run these — the data loss was operator-run scripts.

They are kept (not deleted) so we can see exactly what they did.

## What's here and what it does

| Script | Danger |
|--------|--------|
| `fix-pb-schema.mjs` | `collections.delete()` → **destroys** monetization_campaigns and recreates it empty |
| `fix-pb-rules.mjs` | Rewrites list/view/create/update/delete **API rules** on collections |
| `fix-pb-api-rules.mjs` | Rewrites `affiliate_links` / `jobs` API rules |
| `setup-pb-collections.mjs` | Creates/mutates collections; reseeds campaigns |
| `seed-affiliates.mjs` | Deletes/recreates `affiliate_links` content and re-points campaign refs |
| `cleanup.cjs` | Bulk cleanup script (record deletion) |

## Rules

1. **Never run these from a deploy, cron, or agent session.**
2. Schema / rule / bulk-data changes go through the reviewed migration process
   with an explicit backup + approval (see the mission's Phase 2/3 gates).
3. Hardcoded superuser credentials were scrubbed from these files during
   quarantine; they now reference `process.env` only. The exposed credential was
   **rotated** on 2026-07-16 (the old password no longer authenticates).
4. If you genuinely need one of these, copy the specific operation into a
   reviewed, backup-guarded migration script — do not run the file as-is.
