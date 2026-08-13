/**
 * Public feature flags — AdSense phase kill-switches.
 *
 * During the AdSense review phase the public frontend presents as an
 * information-first education & career website. All job-rendering code paths
 * remain intact behind these flags; flipping JOBS_PUBLIC back to true restores
 * the original job aggregator without code changes.
 */
export const JOBS_PUBLIC = false; // public job listing/detail/search routes
export const ADS_ENABLED = false; // all ad slots + ad scripts (AdSense etc.)
