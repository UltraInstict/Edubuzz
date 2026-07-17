/**
 * Import pipeline — Adzuna API adapter (launch: primary volume source).
 *
 * Adzuna is an official jobs API (https://developer.adzuna.com) with a free
 * tier, full South Africa coverage ("za"), and redirect URLs that preserve
 * attribution and enable click monetization — the standard, compliant way to
 * seed a job aggregator. Strategy #1 (official API).
 *
 * `mapAdzunaResults` is PURE and unit-testable; `AdzunaAdapter.acquire()`
 * paginates the API to pull up to `maxPages * resultsPerPage` jobs per run.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson } from './http';

export interface AdzunaConfig {
  key: string; // adapter key, e.g. 'adzuna:za'
  appId: string;
  appKey: string;
  country?: string; // ISO, default 'za'
  resultsPerPage?: number; // Adzuna max 50
  maxPages?: number; // how many pages to pull per run
  /** Optional query filters. */
  what?: string;
  where?: string;
  /** Category tag to store when Adzuna omits one. */
  defaultCategory?: string;
}

interface AdzunaResult {
  id?: string;
  title?: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_time?: string; // full_time | part_time
  contract_type?: string; // permanent | contract
  category?: { label?: string; tag?: string };
}

interface AdzunaPage {
  count?: number;
  results?: AdzunaResult[];
}

/** Map Adzuna contract fields to a free-text employment type for normalization. */
function employmentType(r: AdzunaResult): string | undefined {
  const parts = [r.contract_type, r.contract_time].filter(Boolean).join(' ');
  return parts || undefined;
}

/** Adzuna location.area = [country, region, city?, suburb?]. */
function locationParts(r: AdzunaResult): { province?: string; city?: string; location?: string } {
  const area = r.location?.area || [];
  // area[0] is the country ("South Africa"); region is area[1]; finest is last.
  const province = area.length > 1 ? area[1] : undefined;
  const city = area.length > 2 ? area[area.length - 1] : undefined;
  return { province, city, location: r.location?.display_name };
}

/** Map a page of Adzuna results into RawJob[]. Pure, no I/O. */
export function mapAdzunaResults(
  results: AdzunaResult[],
  cfg: Pick<AdzunaConfig, 'defaultCategory'> = {}
): RawJob[] {
  if (!Array.isArray(results)) return [];
  return results
    .map((r): RawJob => {
      const loc = locationParts(r);
      return {
        externalId: r.id ? String(r.id) : r.redirect_url,
        sourceUrl: r.redirect_url,
        applyUrl: r.redirect_url,
        title: r.title,
        company: r.company?.display_name,
        location: loc.location,
        province: loc.province,
        city: loc.city,
        country: 'South Africa',
        descriptionHtml: r.description,
        salaryMin: typeof r.salary_min === 'number' ? r.salary_min : undefined,
        salaryMax: typeof r.salary_max === 'number' ? r.salary_max : undefined,
        salaryCurrency: 'ZAR',
        salaryPeriod: 'annual', // Adzuna salaries are annual
        employmentType: employmentType(r),
        category: r.category?.label || cfg.defaultCategory,
        postedDate: r.created,
      };
    })
    .filter((j) => j.title || j.applyUrl);
}

export class AdzunaAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly cfg: AdzunaConfig) {
    this.key = cfg.key;
  }

  async acquire(): Promise<RawJob[]> {
    const country = this.cfg.country || 'za';
    const perPage = Math.min(this.cfg.resultsPerPage || 50, 50);
    const maxPages = this.cfg.maxPages || 10;
    const all: RawJob[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const params = new URLSearchParams({
        app_id: this.cfg.appId,
        app_key: this.cfg.appKey,
        results_per_page: String(perPage),
        content_type: 'application/json',
      });
      if (this.cfg.what) params.set('what', this.cfg.what);
      if (this.cfg.where) params.set('where', this.cfg.where);

      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;
      let payload: AdzunaPage;
      try {
        payload = await fetchJson<AdzunaPage>(url, { retries: 2, timeoutMs: 20000 });
      } catch {
        break; // stop paginating on error; return what we have
      }
      const batch = mapAdzunaResults(payload.results || [], { defaultCategory: this.cfg.defaultCategory });
      all.push(...batch);
      if (!payload.results || payload.results.length < perPage) break; // last page
    }
    return all;
  }
}
