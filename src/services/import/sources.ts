/**
 * Import pipeline — verified employer connector config (frozen Source Library).
 *
 * This is the machine-readable slice of docs/source-library that the four ATS
 * connectors run against. ONE connector per platform serves every employer
 * listed under it — adding an employer is a one-line entry here, never new code.
 *
 * `enabled: true`  → endpoint confirmed public/keyless this session; safe to run.
 * `enabled: false` → platform confirmed but a token/site slug still needs a
 *                    one-time confirmation before it will return jobs.
 *
 * Policy: every apply URL produced is the employer's OWN official ATS page.
 */

import type { SourceAdapter } from './types';
import { GreenhouseAdapter } from './adapters/greenhouse';
import { LeverAdapter } from './adapters/lever';
import { SmartRecruitersAdapter } from './adapters/smartrecruiters';
import { WorkdayAdapter } from './adapters/workday';

export type Connector = 'workday' | 'greenhouse' | 'smartrecruiters' | 'lever';

export interface EmployerSource {
  /** Source Library id. */
  id: string;
  employer: string;
  connector: Connector;
  /** Run this source in live imports. */
  enabled: boolean;
  /** Greenhouse board token / Lever company slug / SmartRecruiters company id. */
  token?: string;
  /** Workday: full host + career-site path. */
  host?: string;
  site?: string;
  confidence: 'verified' | 'high' | 'likely' | 'medium' | 'low';
  notes?: string;
}

/**
 * Frozen from docs/source-library (v1.1) + live API verification.
 * `enabled: true`  = board confirmed live via the public API AND South-Africa-relevant.
 * `enabled: false` = confirmed live but GLOBAL (off-mission for a SA jobs site),
 *                    or token/site still needs confirmation. `count` = jobs seen
 *                    on the board at verification time (not all necessarily SA).
 */
export const EMPLOYER_SOURCES: EmployerSource[] = [
  // --- Greenhouse (SA-relevant, enabled) ------------------------------------
  { id: 'takealot', employer: 'Takealot Group', connector: 'greenhouse', token: 'takealotcom', enabled: true, confidence: 'verified', notes: 'Verified live (~62 postings), SA e-commerce.' },
  { id: 'ozow', employer: 'Ozow', connector: 'greenhouse', token: 'ozow', enabled: true, confidence: 'verified', notes: 'Verified live (~11), SA fintech.' },
  { id: 'luno', employer: 'Luno', connector: 'greenhouse', token: 'luno', enabled: true, confidence: 'verified', notes: 'Verified live (~6), SA-HQ crypto (some roles international).' },
  { id: 'entersekt', employer: 'Entersekt', connector: 'greenhouse', token: 'entersekt', enabled: true, confidence: 'verified', notes: 'Verified live (~5), SA (Stellenbosch) fintech security.' },
  { id: 'offerzen', employer: 'OfferZen', connector: 'greenhouse', token: 'offerzen', enabled: true, confidence: 'verified', notes: 'Verified live (~2), SA developer marketplace.' },
  { id: 'sabertech', employer: 'Saber', connector: 'greenhouse', token: 'sabertech', enabled: true, confidence: 'verified', notes: 'Verified live (~1); confirm SA relevance on first import.' },
  { id: 'jumo', employer: 'JUMO', connector: 'greenhouse', token: 'jumo', enabled: true, confidence: 'verified', notes: 'Verified live via boards.greenhouse.io/jumo. Cape Town-HQ pan-African fintech; SA gate keeps only SA-located roles.' },
  { id: 'srm', employer: 'S-RM', connector: 'greenhouse', token: 'srm', enabled: true, confidence: 'verified', notes: 'Verified live via boards.greenhouse.io/srm; has Cape Town SOC roles. SA gate keeps only SA-located roles.' },

  // --- SmartRecruiters (SA-relevant, enabled) -------------------------------
  { id: 'standard_bank', employer: 'Standard Bank Group', connector: 'smartrecruiters', token: 'StandardBankGroup', enabled: true, confidence: 'verified', notes: 'Verified live (~131), SA bank. api.smartrecruiters.com/v1/companies/StandardBankGroup/postings.' },
  { id: 'outsurance', employer: 'OUTsurance', connector: 'smartrecruiters', token: 'OUTsurance', enabled: true, confidence: 'verified', notes: 'Verified live (~10), SA insurer.' },
  { id: 'deloitte_za', employer: 'Deloitte Africa', connector: 'smartrecruiters', token: 'Deloitte6', enabled: true, confidence: 'verified', notes: 'Verified live (~293); Deloitte Africa tenant — may include non-SA African roles.' },
  { id: 'life_healthcare', employer: 'Life Healthcare', connector: 'smartrecruiters', token: 'LifeHealthcare', enabled: true, confidence: 'verified', notes: 'Verified live (~1), SA hospital group.' },

  // --- Confirmed live but GLOBAL / off-mission (configured, NOT enabled) -----
  { id: 'pwc_global', employer: 'PwC (Global)', connector: 'workday', host: 'pwc.wd3.myworkdayjobs.com', site: 'Global_Experienced_Careers', enabled: false, confidence: 'verified', notes: 'Verified live (~4412) but GLOBAL. Do NOT enable for a SA jobs site without a South-Africa location filter, or it floods the DB with non-SA roles.' },
  { id: 'impact_com', employer: 'impact.com', connector: 'greenhouse', token: 'impact', enabled: false, confidence: 'verified', notes: 'Verified live (~74) but mostly non-SA (global martech; small Cape Town office).' },
  { id: 'visa', employer: 'Visa', connector: 'smartrecruiters', token: 'Visa', enabled: false, confidence: 'verified', notes: 'Verified live (~2) but global.' },
  { id: 'tala', employer: 'Tala', connector: 'lever', token: 'tala', enabled: false, confidence: 'verified', notes: 'Verified live (~10) but global fintech (no SA-specific roles confirmed).' },
  { id: 'copia', employer: 'Copia Global', connector: 'lever', token: 'copia', enabled: false, confidence: 'verified', notes: 'Verified live (~8) but Kenya-based (not SA).' },

  // --- Confirmed platform, token/site NOT yet confirmed (NOT enabled) -------
  { id: 'absa', employer: 'Absa Group', connector: 'workday', host: 'absa.wd3.myworkdayjobs.com', site: 'Absa_Careers', enabled: false, confidence: 'high', notes: 'Tenant host verified; CXS career-site slug not yet confirmed (Absa_Careers/absa both returned no data on probe). Confirm slug before enabling.' },
];

export interface BuildOptions {
  /** Include disabled sources too (e.g. for a dry-run once tokens confirmed). */
  includeDisabled?: boolean;
  /** Restrict to specific Source Library ids. */
  ids?: string[];
  /** Restrict to specific connectors. */
  connectors?: Connector[];
}

/** Build a SourceAdapter for a single employer source. */
export function buildAdapter(s: EmployerSource): SourceAdapter | null {
  switch (s.connector) {
    case 'greenhouse':
      if (!s.token) return null;
      return new GreenhouseAdapter({ key: `greenhouse:${s.token}`, token: s.token, company: s.employer });
    case 'lever':
      if (!s.token) return null;
      return new LeverAdapter({ key: `lever:${s.token}`, company: s.token, companyName: s.employer });
    case 'smartrecruiters':
      if (!s.token) return null;
      return new SmartRecruitersAdapter({ key: `smartrecruiters:${s.token}`, company: s.token, companyName: s.employer });
    case 'workday':
      if (!s.host || !s.site) return null;
      return new WorkdayAdapter({ key: `workday:${s.id}`, host: s.host, site: s.site, company: s.employer });
    default:
      return null;
  }
}

/** Build adapters for the configured employer sources. */
export function buildEmployerAdapters(opts: BuildOptions = {}): SourceAdapter[] {
  return EMPLOYER_SOURCES.filter((s) => (opts.includeDisabled ? true : s.enabled))
    .filter((s) => (opts.ids ? opts.ids.includes(s.id) : true))
    .filter((s) => (opts.connectors ? opts.connectors.includes(s.connector) : true))
    .map(buildAdapter)
    .filter((a): a is SourceAdapter => a != null);
}
