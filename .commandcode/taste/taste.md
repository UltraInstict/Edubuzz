# workflow
- After editing configuration files, run `npm run build` and show the full output including any errors. Confidence: 0.75

# design-system
See [design-system/taste.md](design-system/taste.md)
# code-quality
- Delete dead code (unused components, unused CSS) rather than leaving it in the codebase. Confidence: 0.70
- After design system changes, run grep verification to catch hardcoded hex colors, inconsistent border-radius, leftover <style> blocks, and card padding drift. Confidence: 0.75
