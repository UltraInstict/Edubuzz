/**
 * Old job URL → informational page mapping (AdSense phase).
 *
 * Each old job URL redirects to the single most relevant informational page:
 * a career guide, industry hub, or employer page. Never a blanket homepage
 * redirect — relevance is preserved for both users and search engines.
 *
 * The alias table below is built from the ACTUAL raw category values found in
 * the PocketBase jobs collection (43 distinct values, 711 records, audited
 * 2026-08-13). Every ambiguous entry was classified by inspecting the real
 * job titles/companies that use it.
 */

import { slugify } from '../services/import/normalize';

const CATEGORY_TO_INDUSTRY: Record<string, string> = {
  // Canonical PB category slugs
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

  // Raw-value variants (normalize.ts slugify turns "&" into "and")
  'finance-and-accounting': '/industry/finance',
  'it-and-technology': '/industry/it',
  'retail-and-sales': '/industry/retail',
  'health-and-medical': '/industry/healthcare',
  'logistics-and-transport': '/industry/logistics',
  'marketing-and-media': '/careers',
  'hospitality-and-tourism': '/industry/hospitality',
  'cleaning-and-facilities': '/careers',
  'education-and-teaching': '/industry/education',

  // Verified ambiguous raw categories (classified from actual records)
  // Standard Bank Group roles: risk, onboarding, client service, branches.
  'standard-job': '/industry/finance',
  'non-perm-job': '/industry/finance',
  other: '/industry/finance',
  general: '/industry/it',
  // Deloitte ECOWAS/West-Africa commission roles — professional services.
  'ecowas-portuguese': '/industry/finance',
  'ecowas-french': '/industry/finance',
  'ecowas-english': '/industry/finance',
  // TFS = Takealot Fulfilment Services (hubs, fulfilment, franchise ops).
  tfs: '/industry/logistics',
  // Takealot planning / trade optimisation / strategy — retail operations.
  'takealot-com-planning': '/industry/logistics',
  'takealot-com-trade-optimisation': '/industry/retail',
  'takealot-strategy-ventures': '/industry/retail',
  // OUTsurance retention & client care — insurance/finance.
  'client-care': '/industry/finance',
  // Leroy Merlin department managers — retail.
  'paint-household': '/industry/retail',
  // Deloitte SAP/ERP/consulting — professional services/IT.
  'operate-et-p': '/industry/it',
  'erp-advisory-implementation-et-p': '/industry/it',
  consulting: '/industry/finance',
  'valuations-modelling': '/industry/finance',
  'm-a-infrastructure-real-estate': '/industry/finance',
  'm-a-real-estate': '/industry/finance',
  'strat-bus-des-strat-transf-sustainability': '/industry/finance',
  'bps-specialist-south-africa': '/industry/finance',
  'l-c-fist-jhb-capital': '/industry/finance',
  // Entersekt service delivery — tech.
  'client-operations': '/industry/it',
  // Luno operations & executive office — fintech.
  operations: '/industry/it',
  // S-RM incident response — security.
  'incident-response': '/industry/security',
  'executive-office': '/industry/it',
  'graduate-job': '/industry/finance',
};

/** Company-based fallbacks for jobs whose category is empty/ambiguous. */
const COMPANY_TO_INDUSTRY: Record<string, string> = {
  'standard bank group': '/industry/finance',
  'standard bank': '/industry/finance',
  deloitte: '/industry/finance',
  sasol: '/industry/mining',
  takealot: '/industry/logistics',
  'leroy merlin': '/industry/retail',
  outsurance: '/industry/finance',
  luno: '/industry/it',
  offerzen: '/industry/it',
  entersekt: '/industry/it',
  's-rm': '/industry/security',
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
 * Order: title-specific career guide → verified category alias →
 * company fallback → /careers.
 */
export function getJobRedirectTarget(job: { title?: string; category?: string; company?: string }): string {
  const title = job.title || '';
  const category = slugify(job.category || '');

  // 1) Occupation-specific career guide (title match)
  for (const rule of TITLE_TO_CAREER) {
    if (rule.pattern.test(title)) return rule.target;
  }

  // 2) Category → industry hub (verified alias table)
  const industry = CATEGORY_TO_INDUSTRY[category];
  if (industry) return industry;

  // 3) Company-based fallback for empty/ambiguous categories
  if (job.company) {
    const companyKey = job.company.toLowerCase().trim();
    for (const [prefix, dest] of Object.entries(COMPANY_TO_INDUSTRY)) {
      if (companyKey.startsWith(prefix)) return dest;
    }
  }

  // 4) Generic career information (final fallback only)
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
