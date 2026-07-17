/**
 * Import pipeline — public surface (Milestone 1).
 *
 * Barrel exports + `toCanonicalJob`, which composes the pure core
 * (normalize → salary → location → dedupe signals → confidence) to turn a
 * RawJob from any adapter into a CanonicalJob ready for validation + storage.
 *
 * `core` maps ONLY to columns that exist on the live `jobs` collection today.
 * AI/structured extras live in `enrichment` and are persisted only after the
 * M3 schema extension is approved.
 */

export * from './types';
export * from './normalize';
export * from './validate';
export * from './dedupe';
export * from './ats';

import type {
  CanonicalEnrichment,
  CanonicalJob,
  RawJob,
  SalaryPeriod,
} from './types';
import {
  cleanHtml,
  normalizeEmploymentType,
  normalizeLocation,
  parseSalary,
  slugify,
  toPlainText,
} from './normalize';
import { buildDedupeSignals } from './dedupe';
import { detectAts, sourceDomain, classifySource } from './ats';

export interface SourceMeta {
  /** Adapter key, stored as jobs.source (e.g. 'rss:gov-vacancies'). */
  source: string;
  /** Pre-computed confidence (e.g. AI ai_confidence). 0–100. */
  confidence?: number;
  /** Enrichment already extracted by an adapter/AI (merged into enrichment). */
  enrichment?: Partial<CanonicalEnrichment>;
}

/** Heuristic confidence 0–100 based on completeness of core fields. */
export function scoreConfidence(job: Pick<CanonicalJob, 'core' | 'enrichment'>): number {
  let score = 0;
  const c = job.core;
  if (c.title?.trim()) score += 25;
  if (c.company?.trim()) score += 20;
  if (c.province?.trim() || c.city?.trim() || job.enrichment.remote) score += 15;
  if (c.apply_url?.trim() || c.apply_email?.trim()) score += 15;
  const descLen = toPlainText(c.description).length;
  if (descLen >= 400) score += 20;
  else if (descLen >= 120) score += 12;
  else if (descLen > 0) score += 5;
  if (typeof c.salary_min === 'number' || typeof c.salary_max === 'number') score += 5;
  return Math.min(100, score);
}

/**
 * Compose a RawJob into a CanonicalJob. Pure — no I/O.
 * Employer resolution + persistence happen later in the pipeline (M4).
 */
export function toCanonicalJob(raw: RawJob, meta: SourceMeta): CanonicalJob {
  const title = (raw.title || '').trim();
  const company = (raw.company || '').trim();

  const descriptionHtml = raw.descriptionHtml || raw.descriptionText || '';
  const description = cleanHtml(descriptionHtml);

  const location = normalizeLocation({
    location: raw.location,
    province: raw.province,
    city: raw.city,
    country: raw.country,
    type: raw.employmentType,
    description: toPlainText(descriptionHtml, 2000),
  });

  const jobType = normalizeEmploymentType(raw.employmentType);

  // Salary: prefer explicit numeric fields, else parse free text.
  const explicitMin = toNumber(raw.salaryMin);
  const explicitMax = toNumber(raw.salaryMax);
  const parsed = parseSalary(raw.salaryText);
  const period: SalaryPeriod =
    (raw.salaryPeriod as SalaryPeriod) || parsed.period || 'monthly';
  const salaryMin = explicitMin ?? parsed.monthlyMin;
  const salaryMax = explicitMax ?? parsed.monthlyMax;

  const applyUrl = (raw.applyUrl || raw.sourceUrl || '').trim();
  const applyEmail = (raw.applyEmail || '').trim();
  const sourceRef = (raw.externalId || raw.sourceUrl || '').trim();

  // Official-source apply policy: apply URL is the employer's official page.
  const applyTarget = applyUrl || raw.sourceUrl || '';
  const enrichment: CanonicalEnrichment = {
    country: location.country,
    remote: location.remote || jobType === 'Remote',
    salary_currency: raw.salaryCurrency || parsed.currency,
    salary_period: period,
    closing_date: raw.closingDate || undefined,
    official_careers_url:
      (raw.extra?.companyWebsite as string) || undefined,
    source_domain: sourceDomain(applyTarget) || undefined,
    source_type: applyTarget ? classifySource(applyTarget) : undefined,
    ats_type: applyTarget ? detectAts(applyTarget) : undefined,
    ...(meta.enrichment || {}),
  };

  const core: CanonicalJob['core'] = {
    title,
    company,
    slug: title && company ? slugify(`${title}-${company}`) : slugify(title || company),
    category: (raw.category || '').trim(),
    province: location.province,
    city: location.city,
    description,
    job_type: jobType,
    salary_min: salaryMin,
    salary_max: salaryMax,
    apply_url: applyUrl,
    apply_email: applyEmail,
    source: meta.source,
    source_ref: sourceRef,
    expires: raw.closingDate || undefined,
  };

  const partial: Pick<CanonicalJob, 'core' | 'enrichment'> = { core, enrichment };
  const confidence =
    typeof meta.confidence === 'number' ? meta.confidence : scoreConfidence(partial);

  const job: CanonicalJob = {
    core,
    enrichment,
    confidence,
    dedupe: {
      sourceUrl: raw.sourceUrl?.trim() || undefined,
      externalId: raw.externalId?.trim() || undefined,
      fingerprint: '',
      titleKey: '',
      employerKey: '',
      locationKey: '',
    },
  };

  job.dedupe = buildDedupeSignals(job);
  return job;
}

function toNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return isFinite(value) && value > 0 ? value : undefined;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[, ]/g, ''));
    return isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}
