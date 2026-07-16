# workflow
See [workflow/taste.md](workflow/taste.md)
# testing
- When fixing layout/CSS bugs, verify at the actual viewport width where the bug manifests — not just at a single arbitrary width. If the issue is about desktop alignment, test at 1280px, 1440px, and 1920px specifically; mobile-width verification is insufficient evidence. Confidence: 0.75
- When verifying a visual/layout fix, test in an actual browser (incognito) on the live public URL, not just curl or grep DOM element counts; rendered output is what matters. Independently verify each symptom — do not reuse verification output from one symptom in another symptom's report. Confidence: 0.80
# design-system
See [design-system/taste.md](design-system/taste.md)
# infrastructure
- For scheduled jobs, use systemd timers or crontab, not PM2 cron_restart — PM2 cron_restart restarts the entire app process, which is the wrong tool for scheduled task execution. Confidence: 0.75

# deployment
- Ship every feature immediately: after EVERY feature/change, run the full cycle: Build, Test, Verify locally, Deploy to production, Verify on live URL. No feature is complete until it is visible and verified on the production public URL. Confidence: 0.90
- After each completed task, provide a structured report: ✔ What changed ✔ Why ✔ Files changed ✔ Database changes ✔ Deployment status ✔ Production verification ✔ Next task. No task may be marked done without the full report. Confidence: 0.85

# code-quality
See [code-quality/taste.md](code-quality/taste.md)
# api-design
- All admin API endpoints must return JSON responses; never return HTML redirects. When authentication fails, return 401 JSON — never redirect fetch() requests. Confidence: 0.85
# data-integrity
See [data-integrity/taste.md](data-integrity/taste.md)
# architecture
- Consolidate duplicate data access layers (PocketBase access, jobService, affiliateService, monetizationService) into a single source of truth; no duplicate data access paths. Confidence: 0.85
- The import/ingestion engine must be designed as a pluggable connector architecture — Firecrawl is only ONE connector type. New connectors (RSS, XML, JSON, CSV, Playwright, career APIs, sitemap crawlers) must be addable without modifying the core engine. Each connector normalizes into the same unified schema. Confidence: 0.80

# security
- Reference .env by key name only when discussing credentials in agent sessions; never paste real credentials into prompts or code. Confidence: 0.75

# communication
- Provide evidence-backed audit reports with raw command output; avoid summary claims like "everything is fixed" or "looks good." Confidence: 0.85
- When verifying a fix, check the specific resource against the live public URL (not localhost) with curl and show the full HTTP response; do not rely solely on localhost checks or top-level pages returning 200. Confidence: 0.80
- Always explain WHY a change is recommended, not just what the change is. Confidence: 0.80
- For significant architectural changes, propose the approach first and wait for explicit approval before implementing; do not build and then report. Confidence: 0.85
- Every completed fix must include: root cause, files changed, reason, and evidence (screenshots/PocketBase logs/browser verification where applicable). No issue may be marked fixed without proving the live production site behaves correctly. Confidence: 0.85

# workflow
See [workflow/taste.md](workflow/taste.md)

# debugging
- Always fix the root cause of a problem, not the symptom. If the same root cause manifests in multiple places, fix it once at the source rather than patching each symptom individually. Confidence: 0.90
- When diagnosing a bug, verify the current deployed state first (git log, process status, file mtimes) before forming hypotheses; do not assume prior root causes still apply. Rule in/out each specific cause independently, and fix only what is confirmed broken — not both possible causes speculatively. Confidence: 0.75
- When investigating a visual layout bug, check actual data/record content (e.g. field values via API) before assuming CSS margins are the cause; an empty or null data field producing a blank rendered block is a data/content issue, not a CSS spacing issue. Confidence: 0.75
- Do not assume previous agents' fixes are correct; treat prior reports only as evidence to verify independently against the actual repository code, schemas, and live production state. Confidence: 0.85

# decision-priorities
- When making trade-off decisions for this project, prioritize: 1) Revenue, 2) SEO, 3) Performance, 4) Stability, 5) Maintainability — in that order. Confidence: 0.85
- Core job rendering and site stability take precedence over monetization work; do not implement monetization features (campaign resolution, ad slots, tracking) until all pages reliably display jobs and pass verification. Confidence: 0.85

# performance
- Filter monetization campaigns at the PocketBase query level (by zone, active, date, category) rather than fetching all campaigns and filtering in JavaScript. Confidence: 0.75
- Never cache writes; only cache reads (active campaigns, settings, house ads) with a 60-second in-memory TTL. Confidence: 0.70

# monetization
- Track impressions client-side via navigator.sendBeacon() or fetch(keepalive:true), never during SSR. Confidence: 0.85
- For empty/fallback ad slots, render nothing at all — no wrapper div, no spacer, no empty container, zero DOM impact. Confidence: 0.85
- Deactivate a campaign only after 3 consecutive content-resolution failures, not after a single failure; log each failure with entity ID and reason. Confidence: 0.75

# rendering
- For any content block (description panel, ad zone, or any optional section) with no actual content, use conditional rendering in the template to omit the wrapping element entirely; do not render an empty container and rely on CSS :empty or display:none to hide it, as whitespace or comment nodes defeat those selectors. This applies universally, not just to ad slots. Confidence: 0.80

# code-quality
- Do NOT leave TODO comments in production code; every change must be production-ready with no deferred work. Confidence: 0.70
# design-system
- Always use --update-env flag on pm2 restart to ensure process picks up .env changes. Confidence: 0.85
- For the standard deploy sequence, use `npm ci` (not `npm install`) to ensure a clean, reproducible build from the lockfile. Confidence: 0.70
- If PM2 logs show "ClientResponseError 400: Failed to authenticate", this means PM2 is running with stale credentials in memory. The fix is `pm2 restart edubuzz --update-env` — do NOT edit source files for this error. Confidence: 0.80
- After adding a new env var and restarting PM2, verify the env var propagated by running `pm2 env <app-name> | grep -i <VAR>`; if missing, use `pm2 delete <app-name> && pm2 start ecosystem.config.cjs --env production` to force a full restart. Confidence: 0.65
- After deploying to production, curl-verify all key pages return 200 against the live public URL (not localhost) to confirm the deploy succeeded before declaring done. Confidence: 0.85
