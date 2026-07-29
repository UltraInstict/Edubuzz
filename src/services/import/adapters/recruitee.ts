/**
 * Import pipeline — Recruitee offers adapter.
 *
 * ONE connector serves ALL Recruitee employers (per-company config). Uses the
 * public, keyless offers API which returns every published offer AND its FULL
 * HTML description in a single call — no scraping, no JavaScript:
 *
 *   https://{company}.recruitee.com/api/offers/
 *
 * The apply URL is the employer's own Recruitee careers page (official).
 *
 * `parseRecruiteeOffers` is PURE (payload → RawJob[]) and unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson } from './http';

export interface RecruiteeConfig {
  /** Adapter key stored as jobs.source (e.g. 'recruitee:acme'). */
  key: string;
  /** Recruitee company subdomain (the {company} in {company}.recruitee.com). */
  company: string;
  /** Employer display name. */
  companyName?: string;
  baseUrl?: string;
}

interface RecruiteeOffer {
  id?: number;
  title?: string;
  slug?: string;
  status?: string; // 'published'
  description?: string; // HTML
  requirements?: string; // HTML
  location?: string;
  city?: string;
  state_name?: string;
  country_code?: string;
  country?: string;
  careers_url?: string;
  careers_apply_url?: string;
  department?: string;
  employment_type_code?: string;
  category_code?: string;
  remote?: boolean;
  published_at?: string;
  min_hours?: number;
  max_hours?: number;
}

interface RecruiteeResponse { offers?: RecruiteeOffer[] }

const EMPLOYMENT_CODE: Record<string, string> = {
  fulltime: 'Full-time', full_time: 'Full-time', parttime: 'Part-time',
  part_time: 'Part-time', contract: 'Contract', temporary: 'Temporary',
  internship: 'Internship', freelance: 'Contract',
};

/** Assemble the FULL offer HTML exactly as Recruitee publishes it. */
export function buildRecruiteeDescription(o: RecruiteeOffer): string {
  const parts: string[] = [];
  if (o.description) parts.push(o.description);
  if (o.requirements) parts.push(`<h3>Requirements</h3>${o.requirements}`);
  return parts.join('\n');
}

/** Map a Recruitee offers payload to RawJob[]. Pure, no I/O. Published only. */
export function parseRecruiteeOffers(payload: RecruiteeResponse, companyName: string): RawJob[] {
  const offers = Array.isArray(payload?.offers) ? payload.offers : [];
  return offers
    .filter((o) => !o.status || o.status === 'published')
    .map((o): RawJob => {
      const apply = o.careers_apply_url || o.careers_url;
      const code = (o.employment_type_code || '').toLowerCase();
      return {
        externalId: o.id != null ? String(o.id) : o.slug,
        sourceUrl: o.careers_url,
        applyUrl: apply, // employer's official Recruitee careers page
        title: o.title,
        company: companyName,
        location: o.location || [o.city, o.state_name].filter(Boolean).join(', ') || undefined,
        city: o.city,
        province: o.state_name,
        country: o.country || o.country_code,
        descriptionHtml: buildRecruiteeDescription(o),
        employmentType: EMPLOYMENT_CODE[code] || o.employment_type_code,
        category: o.department || o.category_code,
        postedDate: o.published_at,
        extra: { department: o.department, remote: !!o.remote },
      };
    })
    .filter((j) => j.title && j.applyUrl);
}

export class RecruiteeAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: RecruiteeConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const base = this.config.baseUrl || `https://${this.config.company}.recruitee.com`;
    const companyName = this.config.companyName || this.config.company;
    const url = `${base}/api/offers/`;
    const payload = await fetchJson<RecruiteeResponse>(url, { retries: 3 });
    return parseRecruiteeOffers(payload, companyName);
  }
}
