# Content readiness audit — 7 October 2026

Scope: all 10 curated company guides, company template/index/sitemap, About,
and public legal-page claims directly relevant to this review. This is not a
complete fact-check of every education, salary or resource article and is not
an AdSense approval guarantee. Changes are local, not deployed.

## Resolved

- Replaced short employer summaries with route comparisons, three specific
  preparation examples, advert checks and practical submission guidance.
- Removed unsupported employer rankings, culture/appearance/age claims,
  blanket matric requirements, assumed recruitment steps, seasonal intakes,
  promotion promises and response-time comparisons.
- Removed unnecessary corporate-brand lists and nursing links from general
  pharmacy-retail preparation. Professional eligibility is left to the advert.
- Updated careers destinations for Capitec, Clicks, Mr Price, Nedbank, FNB and
  Dis-Chem. The old Dis-Chem URL returned retail search rather than careers.
- Distinguished original preparation advice from employer requirements;
  added independence, update dates, sources and retrieval limitations.
- Replaced arbitrary resource recommendations with CV, online application,
  interview evidence and recruitment-safety guides; related employers now
  match the sector.
- Removed fabricated publication dates and Article schema on unreviewed
  employer records. Company sitemap now lists only curated guides and uses
  actual update dates. Its former code contradicted its exclusion comment.
- Removed unsubstantiated editorial-team and guaranteed-message-reading
  claims from About.
- Removed unsupported anonymous-analytics, automatic 12-month deletion and
  public-account password claims from Privacy. Legal/support pages are not
  ad-eligible. This does not establish legal compliance.

## Source review

Retrieved official careers material for Capitec, Standard Bank, Mr Price,
Nedbank, FNB and Dis-Chem; Clicks official job-search material was available
in search. Shoprite blocked retrieval; Woolworths retrieval failed; Pick n Pay
careers material surfaced on its preview subdomain but the main page could
not be read. Their guides disclose those limits and do not invent portal
steps or open programmes. Manually check these three destinations before
release. Recheck any individual vacancy at the time of applying.

## Remaining release work

1. Deploy and verify production routes, redirects, root ads.txt, ownership
   verification and crawl access. Local success is not server verification.
2. Confirm contact mailbox delivery and operator-owned privacy details:
   retention settings, analytics configuration, data handling and applicable
   consent requirements. Do not enable ads without that operational review.
3. Salary estimates, funding thresholds, application deadlines and broad
   career claims need a separate source-by-source freshness audit. This
   review did not certify them or change their dates to imply freshness.
   Scan examples: the TVET introduction calls it the largest post-school
   system; the teaching introduction claims the single largest professional
   occupation; the government hub generalises benefits and job security.
   These require evidence or narrower wording before being treated as facts.
4. PB-only employer records remain noindexed and outside the sitemap. They
   need substantive review before promotion to public editorial content;
   noindex alone does not exempt content from AdSense policies.

## Approval principle

Google emphasises original, relevant content and clear user experience, not
an approval word-count target. Added paragraphs should solve applicant
questions, not repeat employer marketing or pad pages.

Official references:
- https://support.google.com/adsense/answer/7299563
- https://support.google.com/adsense/answer/81904
- https://support.google.com/adsense/answer/12171612

## Verification

- Production build passed; 26 test files / 225 tests passed.
- All 10 company routes passed HTTP, source-section, anchor and Article
  update-date checks. Company sitemap contains exactly 10 curated guides.
- Browser rerun against a stable completed build: 28 routes at 1440, 768,
  390 and 320 pixels; 108 internal links; 12 pathway scenarios and 3 mocked
  contact outcomes; zero reported issues. Mocked contact checks do not
  establish real email delivery.
- An initial browser run overlapped a local rebuild and reported transient
  asset/page errors. The preview was restarted and the full rerun passed.
