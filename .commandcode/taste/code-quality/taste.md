# code-quality
- Admin-facing API error messages must include specific detail from the underlying error (e.g. "Could not save: [specific reason]") rather than a single generic string like "Could not save affiliate link." Confidence: 0.85
- Delete dead code (unused components, unused CSS) rather than leaving it in the codebase. Confidence: 0.70
- After design system changes, run grep verification to catch hardcoded hex colors, inconsistent border-radius, leftover <style> blocks, and card padding drift. Confidence: 0.75
- Prefer configuration over hardcoding; use config-driven patterns so behavior can be changed without code changes. Confidence: 0.70
- Default new data entities to active:false until required fields pass validation; allow saving incomplete drafts rather than blocking saves entirely. Confidence: 0.70
- Verify every assumption against the actual repository code, schemas, and data; never invent schemas, APIs, or collection fields that don't exist in the real PocketBase or codebase. Confidence: 0.85
- Do NOT leave TODO comments in production code; every change must be production-ready with no deferred work. Confidence: 0.70
- Reject imported jobs that lack any of: title, employer (company), apply method (apply_url or apply_email), location (province or city), or useful description (less than 50 meaningful characters after stripping HTML). Also reject jobs with low AI extraction confidence (<60). Do not import junk data. Confidence: 0.80
