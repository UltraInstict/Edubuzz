/**
 * Import pipeline — Workday CXS adapter.
 *
 * ONE connector serves MANY large employers (per-tenant config). Workday career
 * sites expose a public, keyless CXS JSON API:
 *   - list:   POST https://{host}/wday/cxs/{tenant}/{site}/jobs
 *             body { limit, offset, appliedFacets:{}, searchText:"" }   (limit<=20)
 *   - detail: GET  https://{host}/wday/cxs/{tenant}/{site}{externalPath}
 *
 * The list is paginated (limit/offset, max 20/page); the FULL HTML description
 * lives on the detail record (`jobPostingInfo.jobDescription`), so we fetch each
 * job's detail and keep the description exactly as published (never summarised).
 * The apply URL is the employer's official myworkdayjobs page.
 *
 * Verified tenant host: Absa (absa.wd3.myworkdayjobs.com).
 *
 * Pure helpers (`mapWorkdayDetail`) are unit-testable; the adapter wires them to
 * the paginated POST + detail GET.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson, mapLimit, postJson } from './http';

export interface WorkdayConfig {
  /** Adapter key stored as jobs.source (e.g. 'workday:absa'). */
  key: string;
  /** Full host, e.g. 'absa.wd3.myworkdayjobs.com'. */
  host: string;
  /** Workday tenant (e.g. 'absa'). Defaults to the first host label. */
  tenant?: string;
  /** Career site path segment (e.g. 'Absa_Careers'). */
  site: string;
  /** Employer display name. */
  company: string;
  /** Max detail lookups in flight (default 4). */
  concurrency?: number;
}

interface WdListItem {
  title?: string;
  externalPath?: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
}
interface WdListResponse {
  total?: number;
  jobPostings?: WdListItem[];
}
interface WdDetailResponse {
  jobPostingInfo?: {
    id?: string;
    title?: string;
    jobDescription?: string; // FULL HTML
    location?: string;
    additionalLocations?: string[];
    postedOn?: string;
    startDate?: string;
    endDate?: string;
    timeType?: string; // 'Full time' / 'Part time'
    jobReqId?: string;
    externalUrl?: string;
    remoteType?: string;
  };
}

function tenantOf(config: WorkdayConfig): string {
  return config.tenant || config.host.split('.')[0];
}

/** Map a Workday list item + its detail into a RawJob. Pure. */
export function mapWorkdayDetail(
  config: WorkdayConfig,
  item: WdListItem,
  detail: WdDetailResponse | null
): RawJob {
  const info = detail?.jobPostingInfo;
  const tenant = tenantOf(config);
  const path = item.externalPath || '';
  const fallbackUrl = path ? `https://${config.host}/${config.site}${path}` : undefined;
  const applyUrl = info?.externalUrl || fallbackUrl;
  const externalId =
    info?.jobReqId ||
    (item.bulletFields && item.bulletFields[0]) ||
    info?.id ||
    path ||
    undefined;
  const location = info?.location || item.locationsText || undefined;
  const remote = /remote/i.test(String(info?.remoteType || location || ''));
  return {
    externalId: externalId ? String(externalId) : undefined,
    sourceUrl: applyUrl,
    applyUrl,
    title: info?.title || item.title,
    company: config.company,
    location: remote ? 'Remote' : location,
    descriptionHtml: info?.jobDescription,
    employmentType: info?.timeType,
    postedDate: info?.startDate || undefined,
    closingDate: info?.endDate || undefined,
    extra: { tenant, postedOn: item.postedOn, workdaySite: config.site },
  };
}

export class WorkdayAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: WorkdayConfig) {
    this.key = config.key;
  }

  async acquire(): Promise<RawJob[]> {
    const { host, site } = this.config;
    const tenant = tenantOf(this.config);
    const listUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;
    const detailBase = `https://${host}/wday/cxs/${tenant}/${site}`;
    const limit = 20; // Workday enforces a 20-item page cap.
    let offset = 0;
    const items: WdListItem[] = [];

    // 1) Paginate the listings via POST.
    for (let page = 0; page < 500; page++) {
      const res = await postJson<WdListResponse>(
        listUrl,
        { appliedFacets: {}, limit, offset, searchText: '' },
        { retries: 3 }
      );
      const batch = Array.isArray(res?.jobPostings) ? res.jobPostings : [];
      items.push(...batch);
      const total = res?.total ?? items.length;
      offset += limit;
      if (batch.length < limit || offset >= total) break;
    }

    // 2) Fetch each job's FULL detail (bounded concurrency), then map.
    const details = await mapLimit(items, this.config.concurrency ?? 4, async (item) => {
      const path = item.externalPath || '';
      if (!path) return null;
      try {
        return await fetchJson<WdDetailResponse>(`${detailBase}${path}`, { retries: 3 });
      } catch {
        return null; // one bad detail must not fail the batch
      }
    });

    return items
      .map((item, i) => mapWorkdayDetail(this.config, item, details[i]))
      .filter((j) => j.title && j.applyUrl);
  }
}
