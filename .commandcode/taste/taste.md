# workflow
See [workflow/taste.md](workflow/taste.md)
# testing
- When fixing layout/CSS bugs, verify at the actual viewport width where the bug manifests — not just at a single arbitrary width. If the issue is about desktop alignment, test at 1280px, 1440px, and 1920px specifically; mobile-width verification is insufficient evidence. Confidence: 0.75
# design-system
See [design-system/taste.md](design-system/taste.md)
# code-quality
- Admin-facing API error messages must include specific detail from the underlying error (e.g. "Could not save: [specific reason]") rather than a single generic string like "Could not save affiliate link." Confidence: 0.85
- Delete dead code (unused components, unused CSS) rather than leaving it in the codebase. Confidence: 0.70
- After design system changes, run grep verification to catch hardcoded hex colors, inconsistent border-radius, leftover <style> blocks, and card padding drift. Confidence: 0.75
- Prefer configuration over hardcoding; use config-driven patterns so behavior can be changed without code changes. Confidence: 0.70
- Default new data entities to active:false until required fields pass validation; allow saving incomplete drafts rather than blocking saves entirely. Confidence: 0.70

# data-integrity
- When production data loss occurs (collections dropping to 0 records), investigate the root cause immediately rather than reseeding with placeholder data; reseeding masks the bug and prevents diagnosis. Confidence: 0.85
- Log all content-resolution failures (missing references, empty fields, fetch errors) as a single terse server-side line with the entity ID, zone, and reason; never silently discard rendering errors. Confidence: 0.70

# communication
- Provide evidence-backed audit reports with raw command output; avoid summary claims like "everything is fixed" or "looks good." Confidence: 0.85
- When verifying a fix, check the specific resource (image URL, API endpoint, asset) directly with curl and show the full HTTP response; do not rely solely on top-level pages returning 200. Confidence: 0.65
- Always explain WHY a change is recommended, not just what the change is. Confidence: 0.80
- For significant architectural changes, propose the approach first and wait for explicit approval before implementing; do not build and then report. Confidence: 0.75

# workflow
See [workflow/taste.md](workflow/taste.md)
- When writing architectural plan files in plan mode, use `~/.commandcode/plans/<filename>.md` (the home directory path), NOT the project-local `.commandcode/plans/` path. The plan mode enforces the home directory location. Confidence: 0.70
# design-system
- Always use --update-env flag on pm2 restart to ensure process picks up .env changes. Confidence: 0.85
- For the standard deploy sequence, use `npm ci` (not `npm install`) to ensure a clean, reproducible build from the lockfile. Confidence: 0.70
- If PM2 logs show "ClientResponseError 400: Failed to authenticate", this means PM2 is running with stale credentials in memory. The fix is `pm2 restart edubuzz --update-env` — do NOT edit source files for this error. Confidence: 0.80
- After adding a new env var and restarting PM2, verify the env var propagated by running `pm2 env <app-name> | grep -i <VAR>`; if missing, use `pm2 delete <app-name> && pm2 start ecosystem.config.cjs --env production` to force a full restart. Confidence: 0.65
- After deploying to production, curl-verify all key pages return 200 to confirm the deploy succeeded before declaring done. Confidence: 0.75
