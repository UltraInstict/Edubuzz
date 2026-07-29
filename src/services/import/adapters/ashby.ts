/**
 * Import pipeline — Ashby Posting API adapter.
 *
 * ONE connector serves ALL Ashby employers (per-board config). Uses the public,
 * keyless Posting API which returns every posting AND its FULL HTML description
 * in a single call — no scraping, no JavaScript, no pagination:
 *
 *   https://api.ashbyhq.com/posting-api/job-board/{board}?includeCompensation=true
 *
 * The apply URL is the employer's own Ashby job page (official application
 * page), satisfying the official-source policy.
 *
 * `parseAshbyJobs` is PURE (payload → RawJob[]) and unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson } from './http';

export interface AshbyConfig {
  /** Adapter key stored as jobs.source (e.g. 'ashby:acme'). */
  key: string;
  /** Ashby job-board name (the {board} in the API path). */
  board: string;
  /** Employer display name. */
  company: string;
  baseUrl?: string;
}

interface AshbyCompensation {
  compensationTierSummary?: string;
  summaryComponents?: Array<{ compensationType?: string; interval?: string; currencyCode?: string; minValue?: number; maxValue?: number }>;
}

interface AshbyJob {
  id?: string;
  title?: string;
  location?: string;
  secondaryLocations?: Array<{ location?: string }>;
  department?: string;
  team?: string;
  employmentType?: string;
  isRemote?: boolean;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  address?: { postalAddress?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } };
  compensation?: AshbyCompensation;
  shouldDisplayCompensationOnJobPostings?: boolean;
}

interface AshbyResponse { jobs?: AshbyJob[] }

const INTERVAL_TO_PERIOD: Record<string, string> = {
  YEAR: 'annual', MONTH: 'monthly', WEEK: 'weekly', DAY: 'daily', HOUR: 'hourly',
};

function pickSalary(comp?: AshbyCompensation): Pick<RawJob, 'salaryMin' | 'salaryMax' | 'salaryCurrency' | 'salaryPeriod'> {
  const c = comp?.summaryComponents?.find((s) => s.compensationType === 'Salary' && (s.minValue || s.maxValue));
  if (!c) return {};
  return {
    salaryMin: c.minValue,
    salaryMax: c.maxValue,
    salaryCurrency: c.currencyCode,
    salaryPeriod: c.interval ? INTERVAL_TO_PERIOD[c.interval] : undefined,
  };
}

/** Map an Ashby board payload to RawJob[]. Pure, no I/O. */
export function parseAshbyJobs(payload: AshbyResponse, company: string): RawJob[] {
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  return jobs
    .map((j): RawJob => {
      const addr = j.address?.postalAddress;
      const apply = j.applyUrl || j.jobUrl;
      return {
        externalId: j.id ? String(j.id) : apply,
        sourceUrl: j.jobUrl,
        applyUrl: apply, // employer's official Ashby application page
        title: j.title,
        company,
        location: j.location || j.secondaryLocations?.map((s) => s.location).filter(Boolean).join(', ') || undefined,
        city: addr?.addressLocality,
        province: addr?.addressRegion,
        country: addr?.addressCountry,
        descriptionHtml: j.descriptionHtml || undefined,
        descriptionText: j.descriptionPlain || undefined,
        employmentType: j.employmentType,
        category: j.department || j.team,
        postedDate: j.publishedAt,
        ...pickSalary(j.compensation),
        extra: { department: j.department, team: j.team, remote: !!j.isRemote },
      };
    })
    .filter((j) => j.title && j.applyUrl);
}

export class AshbyAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: AshbyConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const base = this.config.baseUrl || 'https://api.ashbyhq.com';
    const url = `${base}/posting-api/job-board/${encodeURIComponent(this.config.board)}?includeCompensation=true`;
    const payload = await fetchJson<AshbyResponse>(url, { retries: 3 });
    return parseAshbyJobs(payload, this.config.company);
  }
}
