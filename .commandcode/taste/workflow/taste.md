# workflow
- When writing architectural plan files in plan mode, use `~/.commandcode/plans/<filename>.md` (the home directory path), NOT the project-local `.commandcode/plans/` path. The plan mode enforces the home directory location. Confidence: 0.70
- Complete Phase 1 (core functionality, stability, verification) before beginning Phase 2 (enhancements, monetization); do not interleave phases or start enhancement work until the foundation is confirmed stable. Do not redesign UI, tweak CSS, or optimize performance until the platform functions correctly. Confidence: 0.85
- Before implementing any significant architectural change, produce a structured readiness review covering: breaking changes, database migrations, schema updates, production risks, rollback risks, missing admin functionality, future scalability issues, and unverified assumptions. Then produce final schema/state diagrams, request/render flows, admin workflows, and deployment sequences. Do not begin coding until this review is complete. Confidence: 0.75

# implementation-reporting
- After each completed task provide: ✔ What changed ✔ Why ✔ Files changed ✔ Database changes ✔ Deployment status ✔ Production verification ✔ Next task. Confidence: 0.95
- After deploying to production, curl-verify all key pages return 200 against the live public URL (not localhost) to confirm the deploy succeeded before declaring done. Confidence: 0.85
- When verifying a visual/layout fix, test in an actual browser (incognito) on the live public URL, not just curl or grep DOM element counts; rendered output is what matters. Confidence: 0.80
