/**
 * Old job URL → informational page mapping (AdSense phase).
 *
 * Each old job URL redirects to the single most relevant informational page:
 * a career guide, industry hub, or employer page. Never a blanket homepage
 * redirect — relevance is preserved for both users and search engines.
 */

import { slugify } from '../services/import/normalize';

const CATEGORY_TO_INDUSTRY: Record<string, string> = {
  government: '/industry/government',
  'health-medical': '/industry/healthcare',
  'it-technology': '/industry/it',
  engineering: '/industry/engineering',
  'finance-accounting': '/industry/finance',
  'education-teaching': '/industry/education',
  'retail-sales': '/industry/retail',
  'logistics-transport': '/industry/logistics',
  'human-resources': '/careers',
  administration: '/careers',
  'marketing-media': '/careers',
  'hospitality-tourism': '/industry/hospitality',
  'cleaning-facilities': '/careers',
  security: '/industry/security',
  legal: '/careers',
};

const TITLE_TO_CAREER: { pattern: RegExp; target: string }[] = [
  { pattern: /electric/i, target: '/careers/how-to-become-an-electrician' },
  { pattern: /plumb/i, target: '/careers/how-to-become-a-plumber' },
  { pattern: /nurse|nursing/i, target: '/careers/how-to-become-a-nurse' },
  { pattern: /teacher|teaching|educator/i, target: '/careers/how-to-become-a-teacher' },
  { pattern: /accountant|accounting|auditor|bookkeeper/i, target: '/careers/how-to-become-an-accountant' },
  { pattern: /data analyst|analytics|business intelligence|\bbi\b/i, target: '/careers/how-to-become-a-data-analyst' },
  { pattern: /police|saps/i, target: '/careers/how-to-become-a-police-officer' },
  { pattern: /security guard|security officer|control room/i, target: '/careers/how-to-become-a-security-guard' },
];

/**
 * Determine the best informational redirect target for a job record.
 * Falls back to the industry hub for its category, then /careers.
 */
export function getJobRedirectTarget(job: { title?: string; category?: string; company?: string }): string {
  const title = job.title || '';
  const category = slugify(job.category || '');

  // 1) Occupation-specific career guide (title match)
  for (const rule of TITLE_TO_CAREER) {
    if (rule.pattern.test(title)) return rule.target;
  }

  // 2) Category → industry hub
  const industry = CATEGORY_TO_INDUSTRY[category];
  if (industry) return industry;

  // 3) Generic career information
  return '/careers';
}

/** Redirect target for listing routes (category, province, job-type pages). */
export function getListingRedirectTarget(categorySlug?: string): string {
  if (categorySlug) {
    const industry = CATEGORY_TO_INDUSTRY[slugify(categorySlug)];
    if (industry) return industry;
  }
  return '/careers';
}
