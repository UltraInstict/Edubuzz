# workflow
- After editing configuration files, run `npm run build` and show the full output including any errors. Confidence: 0.75
- Prefer the smallest safe change; do not rewrite large files unless a regression requires it. Confidence: 0.70
- Prioritize production stability over visual perfection. Confidence: 0.70
- Commit security/sensitive changes (credential rotation, secrets removal) separately from style/feature changes with distinct commit messages. Confidence: 0.70
- Do not use batch regex scripts or Node replacement scripts on any files. Fix each file individually with targeted edits. Confidence: 0.85
- On Windows, use a temp file instead of bash heredocs (`<<'EOF'`) for multi-line input like git commit messages; `cmd.exe` and PowerShell don't support heredoc syntax. Confidence: 0.70
