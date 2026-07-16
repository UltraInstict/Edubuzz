/**
 * Centralised site constants — single source of truth for all hardcoded values.
 * Import from here instead of hardcoding in pages.
 */

export const SITE_NAME = 'Edubuzz';
export const SITE_URL = 'https://edubuzz.co.za';
export const SITE_DESCRIPTION = 'South African job marketplace connecting employers with qualified candidates across all sectors.';
export const SITE_TAGLINE = 'South African jobs, updated daily.';
export const SITE_LOCALE = 'en_ZA';
export const SITE_LANG = 'en-ZA';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * Resolve the canonical site base URL from env (falls back to the constant).
 * Use in feeds, sitemaps, robots, and any server route that emits absolute URLs
 * so staging never leaks production URLs to crawlers/aggregators.
 */
export function siteBase(): string {
  const fromEnv = (import.meta as any)?.env?.SITE_URL
    || (typeof process !== 'undefined' ? process.env.SITE_URL : '')
    || SITE_URL;
  return String(fromEnv).replace(/\/$/, '');
}

export const CONTACT_EMAIL = 'hello@edubuzz.co.za';
export const ADVERTISE_EMAIL = 'advertise@edubuzz.co.za';

export const SOCIAL_URLS = {
  facebook: 'https://www.facebook.com/edubuzzsa',
  linkedin: 'https://www.linkedin.com/company/edubuzzsa',
  twitter: 'https://twitter.com/edubuzzsa',
};

export const TWITTER_HANDLE = '@edubuzzsa';

export const PRICING = {
  featuredListing: 299,
  bannerAdWeekly: 499,
  categorySponsorMonthly: 299,
  featuredEmployerMonthly: 199,
  listingDurationDays: 30,
  featuredDurationDays: 60,
};

export const DEFAULT_PER_PAGE = 20;

export const MOST_SEARCHED_TERMS = [
  'General Worker', 'Admin', 'Security', 'Cashier', 'Driver',
  'Cleaner', 'Warehouse', 'Receptionist', 'Data Capturer', 'Call Centre',
];
