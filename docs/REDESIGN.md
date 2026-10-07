# Edubuzz editorial redesign

## Experience

The public site uses warm ivory, forest green and lime accents, with a photographic homepage, three clear journey entry points and consistent editorial cards. Education, careers, resources, salaries, employers and industries share this identity. Article imagery is illustrative, and the original campus scene is AI-generated.

`/start` is a two-question pathfinder linking visitors to relevant existing guides. It does not calculate admission or funding eligibility and does not store answers. Its discovery links are included in the static sitemap and `llms.txt`.

## Main implementation

- `src/styles/global.css`: responsive visual system, keyboard focus and reduced-motion styles.
- `src/components/GuideCard.astro`: shared illustrated guide card.
- `src/lib/editorialImages.ts`: topic-to-image mapping.
- `src/pages/start.astro`: accessible pathfinder with 12 answer combinations.
- `public/images/README.md`: image origins and generation prompt.
- `public/og-default.jpg`: local social-sharing image.

The generated hero is served as a responsive WebP (approximately 49 KB or 122 KB), rather than the 2.4 MB master PNG. All image files are local.

## Advertising

`ads.txt` always serves the configured publisher's seller record. The public layout emits the AdSense ownership meta tag when a valid `PUBLIC_ADSENSE_CLIENT` is configured, independently of the ad-rendering switch.

`ADS_ENABLED` remains false. After the site is approved, enable that flag, rebuild and restart the production application. The layout loads the script only on eligible public, indexable pages. Main editorial pages are eligible; the pathfinder, contact and about pages are not. Manual placements still need their slot IDs and enabled settings in the existing monetization admin. Article placement aliases map to the existing zones: `content-top` → `jobs-top`, `in-content` → `infeed`, `content-bottom` → `strip`.

## Verification

Build with `npm run build` and run existing regression tests with `npm test`.

The browser checks in `scripts/verify-redesign.cjs` use Playwright with installed Chrome. Set `EDUBUZZ_QA_MODULES` to the directory containing Playwright if it is not installed in this project's dependencies. Set `EDUBUZZ_QA_URL` to the local running server origin (default `http://127.0.0.1:4325`). Run `node scripts/verify-redesign.cjs`.

The script checks routes at 1440, 768, 390 and 320 pixel widths, internal links, image loading, one main heading per page, horizontal overflow, the mobile menu, 12 pathfinder combinations, AdSense verification and the sharing image. Contact success, server failure and network interruption are simulated locally; no email is sent. Screenshots and the JSON report are saved under `output/redesign/`, excluded from Git.

Local verification does not establish production SMTP delivery or Google approval. Deployment must use the existing server procedure and be checked against the live site afterwards.
