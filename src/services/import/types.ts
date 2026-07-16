/**
 * Import pipeline — shared types (Milestone 1).
 *
 * These types define the contract between source adapters and the shared
 * ingestion core. A new connector implements `SourceAdapter` and returns
 * `RawJob[]`; everything downstream (normalize → dedupe → validate → store)
 * is handled by the shared core, so adding a source never touches the engine.
 *
 * IMPORTANT: `CanonicalJob.core` maps 1:1 to columns that ALREADY exist on the
 * live `jobs` collection and is safe to persist today. `CanonicalJob.enrichment`
 * holds AI-extracted fields (responsibilities, requirements, skills, …) that do
 * NOT yet exist as columns — they persist only after the M3 schema change is
 * approved and applied. This keeps the core honest about current storage.
 */

export type AcquisitionStrategy =
  | 'api'
  | 'rss'
  | 'xml'
  | 'json'
  | 'structured_html' // schema.org JobPosting / microdata
  | 'firecrawl'
  | 'playwright'
  | 'manual'
  | 'csv';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Learnership'
  | 'Graduate Programme'
  | 'Bursary'
  | 'Temporary'
  | 'Remote';

export type SalaryPeriod = 'monthly' | 'annual' | 'hourly' | 'weekly' | 'daily';

/** Raw item as returned by an adapter, before any normalization. */
export interface RawJob {
  /** Stable identifier from the source, if any (used for dedupe/updates). */
  externalId?: string;
  /** Canonical apply/detail URL at the source. */
  sourceUrl?: string;
  applyUrl?: string;
  applyEmail?: string;
  title?: string;
  company?: string;
  location?: string; // free-text location as given by source
  province?: string;
  city?: string;
  country?: string;
  descriptionHtml?: string;
  descriptionText?: string;
  salaryText?: string; // free-text salary as given by source
  salaryMin?: number | string;
  salaryMax?: number | string;
  salaryCurrency?: string;
  salaryPeriod?: string;
  employmentType?: string;
  category?: string;
  closingDate?: string;
  postedDate?: string;
  /** Arbitrary extra fields the adapter captured (kept for AI/audit). */
  extra?: Record<string, unknown>;
}

export interface ParsedSalary {
  min?: number;
  max?: number;
  currency: string; // ISO, defaults 'ZAR'
  period: SalaryPeriod;
  /** min/max converted to a monthly ZAR figure for consistent storage/sorting. */
  monthlyMin?: number;
  monthlyMax?: number;
  disclosed: boolean;
}

export interface NormalizedLocation {
  province: string; // canonical SA province or '' 
  city: string;
  country: string; // defaults 'South Africa'
  remote: boolean;
}

/** Fields that map directly to existing `jobs` columns — safe to store now. */
export interface CanonicalCore {
  title: string;
  company: string;
  slug: string;
  category: string;
  province: string;
  city: string;
  description: string; // cleaned HTML
  job_type: EmploymentType;
  salary_min?: number;
  salary_max?: number;
  apply_url: string;
  apply_email: string;
  source: string; // adapter key
  source_ref: string; // externalId or sourceUrl (for dedupe/update)
  expires?: string;
}

/** AI/structured extras — persisted only after M3 schema extension is approved. */
export interface CanonicalEnrichment {
  country?: string;
  remote?: boolean;
  salary_currency?: string;
  salary_period?: SalaryPeriod;
  closing_date?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive';
  education_required?: string;
  company_website?: string;
  ai_summary?: string;
  ai_confidence?: number;
}

export interface CanonicalJob {
  core: CanonicalCore;
  enrichment: CanonicalEnrichment;
  /** Signals used for duplicate detection across the corpus. */
  dedupe: DedupeSignals;
  /** 0–100 aggregate confidence used by the quality gate. */
  confidence: number;
}

export interface DedupeSignals {
  sourceUrl?: string;
  externalId?: string;
  /** Deterministic fingerprint of employer+title+location (normalized). */
  fingerprint: string;
  /** Lowercased, punctuation-stripped title for similarity comparison. */
  titleKey: string;
  employerKey: string;
  locationKey: string;
}

export type RejectionReason =
  | 'missing_title'
  | 'missing_employer'
  | 'missing_location'
  | 'missing_apply_method'
  | 'missing_description'
  | 'thin_description'
  | 'missing_source'
  | 'low_confidence'
  | 'expired';

export interface ValidationResult {
  ok: boolean;
  /** Hard failures that reject the job outright. */
  rejections: RejectionReason[];
  /** Soft issues that flag-for-review but don't reject. */
  warnings: RejectionReason[];
}

/** A source connector. Adapters ONLY acquire raw jobs; the core does the rest. */
export interface SourceAdapter {
  /** Stable key, stored as `jobs.source` (e.g. 'rss:gov-vacancies'). */
  readonly key: string;
  readonly strategy: AcquisitionStrategy;
  /** Fetch + parse raw jobs from the source. Must not throw on empty. */
  acquire(): Promise<RawJob[]>;
}
