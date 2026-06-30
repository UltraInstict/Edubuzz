# workflow
- After editing configuration files, run `npm run build` and show the full output including any errors. Confidence: 0.75
- Prefer the smallest safe change; do not rewrite large files unless a regression requires it. Confidence: 0.70
- Prioritize production stability over visual perfection. Confidence: 0.70
- Commit security/sensitive changes (credential rotation, secrets removal) separately from style/feature changes with distinct commit messages. Confidence: 0.70
- Do not use batch regex scripts or Node replacement scripts on any files. Fix each file individually with targeted edits. Confidence: 0.85

# design-system
See [design-system/taste.md](design-system/taste.md)
# code-quality
- Delete dead code (unused components, unused CSS) rather than leaving it in the codebase. Confidence: 0.70
- After design system changes, run grep verification to catch hardcoded hex colors, inconsistent border-radius, leftover <style> blocks, and card padding drift. Confidence: 0.75

# communication
- Provide evidence-backed audit reports with raw command output; avoid summary claims like "everything is fixed" or "looks good." Confidence: 0.75
