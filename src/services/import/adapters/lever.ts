/**
 * Import pipeline — Lever postings adapter.
 *
 * ONE connector serves ALL Lever employers (per-company config). Uses the
 * public, keyless postings API in JSON mode, which returns each posting with
 * its FULL HTML description (intro + lists + closing) — no scraping, no JS.
 * The apply URL is the employer's own Lever posting page (official).
 *
 *   https://api.lever.co/v0/postings/{company}?mode=json&limit=100&offset=0
 *
 * `parseLeverPostings`/`buildLeverDescription` are PURE and unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson } from './http';

export interface LeverConfig {
  /** Adapter key stored as jobs.source (e.g. 'lever:acme'). */
  key: string;
  /** Lever company slug (the {company} in the API path). */
  company: string;
  /** Employer display name (defaults to company slug). */
  companyName?: string;
  baseUrl?: string;
}

interface LeverList {
  text?: string;
  content?: string; // HTML
}

interface LeverPosting {
  id?: string;
  text?: string; // title
  categories?: { commitment?: string; department?: string; location?: string; team?: string };
  description?: string; // HTML intro
  descriptionPlain?: string;
  lists?: LeverList[];
  additional?: string; // HTML closing
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  country?: string;
  salaryRange?: { min?: number; max?: number; currency?: string; interval?: string };
}

const INTERVAL_TO_PERIOD: Record<string, string> = {
  'per-year-salary': 'annual',
  'per-month-salary': 'monthly',
  'per-week-salary': 'weekly',
  'per-day-wage': 'daily',
  'per-hour-wage': 'hourly',
};

/** Assemble the FULL posting HTML exactly as Lever publishes it (never truncated). */
export function buildLeverDescription(p: LeverPosting): string {
  const parts: string[] = [];
  if (p.description) parts.push(p.description);
  for (const l of p.lists || []) {
    const heading = l.text ? `<h3>${l.text}</h3>` : '';
    const body = l.content ? `<ul>${l.content}</ul>` : '';
    if (heading || body) parts.push(`${heading}${body}`);
  }
  if (p.additional) parts.push(p.additional);
  return parts.join('\n');
}

/** Map Lever postings to RawJob[]. Pure, no I/O. */
export function parseLeverPostings(postings: LeverPosting[], companyName: string): RawJob[] {
  if (!Array.isArray(postings)) return [];
  return postings
    .map((p): RawJob => {
      const cat = p.categories || {};
      const applyUrl = p.applyUrl || p.hostedUrl;
      const interval = p.salaryRange?.interval;
      return {
        externalId: p.id,
        sourceUrl: p.hostedUrl,
        applyUrl,
        title: p.text,
        company: companyName,
        location: cat.location,
        country: p.country,
        descriptionHtml: buildLeverDescription(p),
        employmentType: cat.commitment,
        category: cat.department || cat.team,
        salaryMin: p.salaryRange?.min,
        salaryMax: p.salaryRange?.max,
        salaryCurrency: p.salaryRange?.currency,
        salaryPeriod: interval ? INTERVAL_TO_PERIOD[interval] : undefined,
        postedDate: typeof p.createdAt === 'number' ? new Date(p.createdAt).toISOString() : undefined,
        extra: { department: cat.department, team: cat.team },
      };
    })
    .filter((j) => j.title && j.applyUrl);
}

export class LeverAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: LeverConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const base = this.config.baseUrl || 'https://api.lever.co';
    const companyName = this.config.companyName || this.config.company;
    const limit = 100;
    let offset = 0;
    const all: RawJob[] = [];
    // Lever paginates via limit/skip; stop when a page returns fewer than `limit`.
    for (let page = 0; page < 50; page++) {
      const url = `${base}/v0/postings/${encodeURIComponent(this.config.company)}?mode=json&limit=${limit}&skip=${offset}`;
      const batch = await fetchJson<LeverPosting[]>(url, { retries: 3 });
      const arr = Array.isArray(batch) ? batch : [];
      all.push(...parseLeverPostings(arr, companyName));
      if (arr.length < limit) break;
      offset += limit;
    }
    return all;
  }
}
