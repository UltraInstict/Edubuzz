# workflow
- After editing configuration files, run `npm run build` and show the full output including any errors. Confidence: 0.75
- Prefer the smallest safe change; do not rewrite large files unless a regression requires it. Confidence: 0.70
- Prioritize production stability over visual perfection. Confidence: 0.70
- Commit security/sensitive changes (credential rotation, secrets removal) separately from style/feature changes with distinct commit messages. Confidence: 0.70
- Do not use batch regex scripts or Node replacement scripts on any files. Fix each file individually with targeted edits. Confidence: 0.85
- Never guess at the root cause of an error; surface the real error output from the system first, present it for verification, then apply a targeted fix based on evidence. Confidence: 0.70
