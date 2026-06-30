# Checkup Report — Edubuzz.co.za

**Date:** 2026-06-29
**Surface:** Full site (homepage, jobs, about, pricing, contact, resources, privacy, terms, post-job, login, register, sidebar, job card, layout)
**Register:** Product (job board)
**Score:** 42/60

---

## Vital Signs Summary

| Vital | Status | Score |
|---|---|---|
| Intentionality | Watch | 7/10 |
| Readability | Healthy | 9/10 |
| Usability | Healthy | 8/10 |
| Responsiveness | Watch | 6/10 |
| Speed | Healthy | 9/10 |
| Accessibility | Critical | 3/10 |
| **Total** | | **42/60** |

---

## Intentionality — Watch (7/10)

**Evidence:** The design system is mostly deliberate: green-800 primary, gray-200 borders, rounded-md everywhere, Inter font, consistent card pattern (bg-white border border-gray-200 rounded-md p-5). Nav is clean: text logo, two text links, one green CTA button. Ad slots are consistent placeholder divs.

**Issue:** Dual color naming system. Rewritten pages (index, about, pricing, contact, etc.) use standard Tailwind classes (text-gray-900, text-green-800, border-gray-200). Unrewritten pages (internships, graduate-jobs, learnerships, bursaries, remote-jobs, province/[slug], category/[slug], jobs-in-[province], and 6 programmatic SEO pages) still use custom aliases (text-navy, text-muted, border-border, bg-accent, hover:bg-accent-dark). These are mapped via @theme in global.css so they render, but the system is split. A maintainer seeing both `text-gray-900` and `text-navy` for the same color will not know they are equivalent.

**Prescription:** Migrate the 18 remaining pages from custom aliases to standard Tailwind classes. One pass with find-and-replace: text-navy → text-gray-900, text-muted → text-gray-600, border-border → border-gray-200, bg-accent → bg-green-800, hover:bg-accent-dark → hover:bg-green-900, bg-accent-light → bg-green-50, text-accent → text-green-800.

---

## Readability — Healthy (9/10)

**Evidence:** Body text is text-sm (14px) with leading-relaxed across all audited pages. H1 is text-2xl font-bold. H2 is text-xl font-semibold. H3 is text-base font-semibold. Hierarchy is clear and consistent. Content pages use max-w-2xl (672px) which falls within the 60-76ch measure range. JobCard uses text-base for title, text-sm for company, text-xs for meta — good scanning hierarchy. Sidebar section titles are text-xs uppercase tracking-wide — appropriate for navigation labels.

**Minor note:** Resources page body text is in `<p class="text-sm text-gray-600 leading-relaxed">` with no `<a>` tags wrapping body text — no link bleeding visible in source. The user report may have been seeing a cached version.

---

## Usability — Healthy (8/10)

**Evidence:** Homepage has search bar with province filter + job type pills. Jobs listing below with empty state. Sidebar with categories, provinces, most searched, and alert signup. Post a Job has complete form with all required fields and pricing sidebar. Contact has form with subject dropdown and email fallback. Login/Register forms are functional.

**Issue:** The user report says "Browse Jobs page: left content area is completely empty" — the source shows an empty state div is present (`<div class="bg-white border border-gray-200 rounded-md p-8 text-center">`). This is likely a data issue (0 active jobs in PocketBase) rather than a design issue. The empty state IS rendered in the template.

**Issue:** The user report says "Filter pills on Jobs page: missing" — the source clearly shows filter pills in the jobs page template. This may have been a caching issue or the user was looking at a different state.

---

## Responsiveness — Watch (6/10)

**Evidence:** Nav uses md: breakpoints (hidden md:flex for desktop links, md:hidden for mobile menu). Grid layouts use lg:grid-cols-[1fr_300px] which collapses to single column on mobile. Pricing cards use md:grid-cols-3. Footer uses md:grid-cols-4. All collapse correctly.

**Issue:** Post a Job form uses `grid-cols-2` for field pairs (employer name/email, company/title, category/province, city/type, salary min/max) with no responsive fallback. On a 375px viewport, two form fields side by side will be cramped — each field gets ~170px which is too narrow for comfortable text input. These should be `grid-cols-1 sm:grid-cols-2` to stack on mobile.

**Issue:** Homepage search bar uses `flex` without `flex-wrap`. On narrow viewports, the input + select + button in a row may overflow. The jobs page search has `style="max-width:640px"` but also no flex-wrap.

**Prescription:** Add `grid-cols-1 sm:grid-cols-2` to all 2-column form grids in post-job.astro. Add `flex-wrap` to search bar forms on index.astro and jobs/index.astro.

---

## Speed — Healthy (9/10)

**Evidence:** CSS is properly generated via Tailwind v4 with @tailwindcss/vite plugin. Layout.css is 22.3KB with all utility classes present (bg-green-800, grid, flex confirmed). Loaded via `<link rel="stylesheet">` in HTML head. Inter font loaded with print/onload trick + noscript fallback. No large images. Job cards are text-based. Ad slots are lightweight placeholder divs. Pages are server-rendered (Astro SSR) so HTML arrives complete.

**Minor note:** The `reoptimize dependencies` message appeared in one build after adding @tailwindcss/vite — this is a one-time Vite cache rebuild, not an ongoing issue.

---

## Accessibility — Critical (3/10)

**Evidence:** Nav has `aria-label="Main navigation"`. Contact form honeypot uses `sr-only`. Mobile menu uses `<details>/<summary>` which is keyboard accessible. Job cards are `<a>` tags — keyboard navigable. Form inputs on contact and post-job pages have visible labels.

**Critical Issue 1 — Insufficient focus styles.** All form inputs use `focus:outline-none focus:border-green-800`. Removing the default outline and replacing it with only a border color change is not sufficient. A 1px border color shift from gray-200 to green-800 does not meet the 3:1 contrast requirement for focus indicators (WCAG 2.4.7). Keyboard users cannot see where they are.

**Critical Issue 2 — Homepage search has no visible label.** The search input has `placeholder="Job title, keyword, or company"` but no `<label>` element or `aria-label`. Screen reader users have no programmatic label for this input. The province select and search button also lack labels.

**Critical Issue 3 — No skip-to-content link.** Keyboard users must tab through the entire nav, stats bar, and ad slot before reaching page content. A skip link is standard for any page with repeated navigation.

**Issue 4 — Ad slot "Advertisement" text.** Uses text-gray-400 (#9ca3af) on bg-gray-50 (#f9fafb) — contrast ratio is approximately 2.5:1, below the 4.5:1 minimum for normal text. This is decorative but still fails if interpreted as informational.

**Prescription:**
1. Add visible focus rings: replace `focus:outline-none` with `focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-1` on all inputs and buttons. Or use `focus:outline-2 focus:outline-offset-2 focus:outline-green-800`.
2. Add `aria-label="Search jobs by title, keyword, or company"` to the homepage search input. Add `aria-label="Filter by province"` to the province select.
3. Add a skip link: `<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-gray-200">Skip to content</a>` at the top of `<body>`, with `id="main-content"` on the content wrapper.
4. Change ad slot label to text-gray-500 (#6b7280) for 4.5:1 contrast minimum.

---

## Composition Vital Sign

**Work pattern:** Explore (job seekers searching and browsing) + Decide (employers posting jobs).

**Assessment:** The composition matches the work. Homepage leads with search (explore), filter pills, and job listings. Sidebar supports discovery with categories, provinces, and alerts. Post a Job is a clear form with pricing context. The layout is appropriate for a job board.

**Note:** The stats bar showing "0 active jobs" undermines trust. This is a data issue, not a design issue, but it affects the composition's effectiveness.

---

## Prompt Fidelity Vital Sign

**Name:** Edubuzz — present in nav, footer, meta tags. Correct.
**Category:** Job board — visible from search, filter pills, job cards. Correct.
**Artifact:** Job listings — present and central. Correct.
**Evidence:** Job cards show title, company, location, salary, type. Search and filters work. Empty states guide next steps. Adequate.

---

## Summary

The interface is structurally sound. Typography, layout, and container systems are consistent across rewritten pages. The two critical issues are accessibility: focus styles and missing labels. The watch items are the dual color naming system (18 pages need migration) and form grid responsiveness on mobile. Speed and readability are healthy.

**Next move:** Fix accessibility criticals first (focus rings, labels, skip link). Then migrate the 18 remaining pages from custom color aliases to standard Tailwind classes. Then add responsive form grid fallbacks.
