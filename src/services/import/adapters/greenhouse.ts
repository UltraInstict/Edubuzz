/**
 * Import pipeline — Greenhouse Job Board adapter.
 *
 * ONE connector serves ALL Greenhouse employers (per-board token config).
 * Uses the public, keyless Job Board API with `content=true`, which returns
 * every posting AND its FULL HTML description in a single call — no scraping,
 * no JavaScript, no pagination. The apply URL is the employer's own Greenhouse
 * board page (official application page), satisfying the official-source policy.
 *
 *   List+content: https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
 *
 * `parseGreenhouseJobs` is PURE (payload → RawJob[]) and unit-testable.
 * Verified employer: Takealot (token "takealotcom").
 */

import type { RawJob, SourceAdapter } from '../types';
import { decodeHtmlEntities, fetchJson } from './http';

export interface GreenhouseConfig {
  /** Adapter key stored as jobs.source (e.g. 'greenhouse:takealotcom'). */
  key: string;
  /** Greenhouse board token (e.g. 'takealotcom'). */
  token: string;
  /** Employer display name — Greenhouse jobs rarely carry company_name. */
  company: string;
  /** Override the API base (tests). */
  baseUrl?: string;
}

interface GhJob {
  id?: number;
  internal_job_id?: number;
  title?: string;
  updated_at?: string;
  absolute_url?: string;
  content?: string; // HTML, entity-encoded
  location?: { name?: string };
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string; location?: string }>;
  company_name?: string;
}

interface GhResponse {
  jobs?: GhJob[];
  meta?: { total?: number };
}

/** Map a Greenhouse board payload to RawJob[]. Pure, no I/O. */
export function parseGreenhouseJobs(payload: GhResponse, company: string): RawJob[] {
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  return jobs
    .map((j): RawJob => {
      const dept = j.departments?.map((d) => d?.name).filter(Boolean).join(', ') || undefined;
      const office = j.offices?.map((o) => o?.location || o?.name).filter(Boolean).join(', ');
      const location = j.location?.name || office || undefined;
      const externalId = j.id != null ? String(j.id) : j.absolute_url;
      return {
        externalId: externalId ? String(externalId) : undefined,
        sourceUrl: j.absolute_url,
        applyUrl: j.absolute_url, // employer's official Greenhouse board page
        title: j.title,
        company: j.company_name || company,
        location,
        // FULL description, exactly as published. Greenhouse HTML-encodes it in
        // JSON; decode entities back to the original HTML (never summarised).
        descriptionHtml: decodeHtmlEntities(j.content),
        employmentType: undefined,
        category: dept,
        postedDate: j.updated_at,
        extra: { department: dept },
      };
    })
    .filter((j) => j.title && j.applyUrl);
}

export class GreenhouseAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: GreenhouseConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const base = this.config.baseUrl || 'https://boards-api.greenhouse.io';
    const url = `${base}/v1/boards/${encodeURIComponent(this.config.token)}/jobs?content=true`;
    const payload = await fetchJson<GhResponse>(url, { retries: 3 });
    return parseGreenhouseJobs(payload, this.config.company);
  }
}
