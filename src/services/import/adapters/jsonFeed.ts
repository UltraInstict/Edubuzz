/**
 * Import pipeline — JSON feed / API adapter (Milestone 2).
 *
 * Covers acquisition strategies #1 (official API) and #4 (JSON feed). A source
 * is declared with the URL, a dot-path to the array of jobs, and a field map
 * from RawJob fields → dot-paths on each record. `mapJsonRecords` is PURE and
 * unit-testable; `JsonFeedAdapter` wires it to the HTTP fetcher.
 */

import type { AcquisitionStrategy, RawJob, SourceAdapter } from '../types';
import { fetchJson } from './http';

/** RawJob field → dot-path on a source record (e.g. 'company.name', 'meta.0.city'). */
export interface JsonFieldMap {
  externalId?: string;
  sourceUrl?: string;
  applyUrl?: string;
  applyEmail?: string;
  title?: string;
  company?: string;
  location?: string;
  province?: string;
  city?: string;
  country?: string;
  descriptionHtml?: string;
  descriptionText?: string;
  salaryText?: string;
  salaryMin?: string;
  salaryMax?: string;
  salaryCurrency?: string;
  salaryPeriod?: string;
  employmentType?: string;
  category?: string;
  closingDate?: string;
  postedDate?: string;
}

export interface JsonFeedConfig {
  key: string;
  url: string;
  strategy?: AcquisitionStrategy; // 'api' | 'json' (default 'json')
  /** Dot-path to the array of records (e.g. 'data.jobs'). Empty = root array. */
  itemsPath?: string;
  fieldMap: JsonFieldMap;
  defaultCompany?: string;
  headers?: Record<string, string>;
}

/** Read a dot-path from an object; supports numeric array indices. */
export function getPath(obj: unknown, path: string | undefined): unknown {
  if (!path) return undefined;
  let cur: any = obj;
  for (const seg of path.split('.')) {
    if (cur == null) return undefined;
    cur = cur[seg];
  }
  return cur;
}

function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v.trim() || undefined;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[, ]/g, ''));
    return isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Map an array of raw source records into RawJob[]. Pure, no I/O. */
export function mapJsonRecords(records: unknown[], config: Pick<JsonFeedConfig, 'fieldMap' | 'defaultCompany'>): RawJob[] {
  if (!Array.isArray(records)) return [];
  const fm = config.fieldMap;
  return records
    .map((rec): RawJob => {
      const link = str(getPath(rec, fm.applyUrl)) || str(getPath(rec, fm.sourceUrl));
      return {
        externalId: str(getPath(rec, fm.externalId)) || link,
        sourceUrl: str(getPath(rec, fm.sourceUrl)) || link,
        applyUrl: str(getPath(rec, fm.applyUrl)) || link,
        applyEmail: str(getPath(rec, fm.applyEmail)),
        title: str(getPath(rec, fm.title)),
        company: str(getPath(rec, fm.company)) || config.defaultCompany,
        location: str(getPath(rec, fm.location)),
        province: str(getPath(rec, fm.province)),
        city: str(getPath(rec, fm.city)),
        country: str(getPath(rec, fm.country)),
        descriptionHtml: str(getPath(rec, fm.descriptionHtml)),
        descriptionText: str(getPath(rec, fm.descriptionText)),
        salaryText: str(getPath(rec, fm.salaryText)),
        salaryMin: num(getPath(rec, fm.salaryMin)),
        salaryMax: num(getPath(rec, fm.salaryMax)),
        salaryCurrency: str(getPath(rec, fm.salaryCurrency)),
        salaryPeriod: str(getPath(rec, fm.salaryPeriod)),
        employmentType: str(getPath(rec, fm.employmentType)),
        category: str(getPath(rec, fm.category)),
        closingDate: str(getPath(rec, fm.closingDate)),
        postedDate: str(getPath(rec, fm.postedDate)),
      };
    })
    .filter((j) => j.title || j.applyUrl);
}

/** Parse a full JSON payload (already-parsed object) into RawJob[]. Pure. */
export function parseJsonFeed(payload: unknown, config: JsonFeedConfig): RawJob[] {
  const items = config.itemsPath ? getPath(payload, config.itemsPath) : payload;
  const arr = Array.isArray(items) ? items : [];
  return mapJsonRecords(arr, config);
}

export class JsonFeedAdapter implements SourceAdapter {
  readonly key: string;
  readonly strategy: AcquisitionStrategy;
  constructor(private readonly config: JsonFeedConfig) {
    this.key = config.key;
    this.strategy = config.strategy || 'json';
  }
  async acquire(): Promise<RawJob[]> {
    const payload = await fetchJson<unknown>(this.config.url, { headers: this.config.headers });
    return parseJsonFeed(payload, this.config);
  }
}
