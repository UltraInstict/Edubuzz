/**
 * Import pipeline — SmartRecruiters Posting API adapter.
 *
 * ONE connector serves ALL SmartRecruiters employers (per-company config).
 * Uses the public, keyless Posting API:
 *   - list:   https://api.smartrecruiters.com/v1/companies/{company}/postings?limit=100&offset=0
 *   - detail: https://api.smartrecruiters.com/v1/companies/{company}/postings/{id}
 *
 * The list is paginated (limit/offset); the FULL HTML description lives on the
 * detail record (`jobAd.sections`), so we fetch each posting's detail and
 * assemble the complete description exactly as published (never summarised).
 * The apply URL is the employer's official SmartRecruiters page.
 *
 * Verified employers: OUTsurance, Deloitte (Deloitte6), Standard Bank.
 *
 * Pure helpers (`mapPostingListItem`, `buildSmartRecruitersDescription`) are
 * unit-testable; the adapter wires them to the paginated fetch + detail lookup.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchJson, mapLimit } from './http';

export interface SmartRecruitersConfig {
  /** Adapter key stored as jobs.source (e.g. 'smartrecruiters:OUTsurance'). */
  key: string;
  /** SmartRecruiters company identifier (the {company} in the API path). */
  company: string;
  /** Employer display name (defaults to company identifier). */
  companyName?: string;
  baseUrl?: string;
  /** Max detail lookups in flight (default 4). */
  concurrency?: number;
}

interface SrLabel { label?: string }
interface SrLocation {
  city?: string; region?: string; country?: string; remote?: boolean;
}
interface SrListItem {
  id?: string;
  name?: string;
  company?: { identifier?: string; name?: string };
  releasedDate?: string;
  location?: SrLocation;
  department?: SrLabel;
  function?: SrLabel;
  typeOfEmployment?: SrLabel;
  experienceLevel?: SrLabel;
}
interface SrListResponse {
  offset?: number;
  limit?: number;
  totalFound?: number;
  content?: SrListItem[];
}
interface SrSection { title?: string; text?: string }
interface SrDetail {
  id?: string;
  name?: string;
  jobAd?: { sections?: Record<string, SrSection> };
  location?: SrLocation;
  typeOfEmployment?: SrLabel;
  department?: SrLabel;
  function?: SrLabel;
  releasedDate?: string;
  company?: { identifier?: string; name?: string };
}

const SECTION_ORDER = [
  'companyDescription',
  'jobDescription',
  'qualifications',
  'additionalInformation',
];

/** Assemble the FULL job-ad HTML from SmartRecruiters sections (never truncated). */
export function buildSmartRecruitersDescription(detail: SrDetail): string {
  const sections = detail?.jobAd?.sections || {};
  const keys = [
    ...SECTION_ORDER.filter((k) => sections[k]),
    ...Object.keys(sections).filter((k) => !SECTION_ORDER.includes(k)),
  ];
  const parts: string[] = [];
  for (const k of keys) {
    const s = sections[k];
    if (!s?.text) continue;
    const heading = s.title ? `<h3>${s.title}</h3>` : '';
    parts.push(`${heading}${s.text}`);
  }
  return parts.join('\n');
}

function locationText(loc?: SrLocation): { location?: string; city?: string; province?: string; country?: string; remote: boolean } {
  const remote = !!loc?.remote;
  const city = loc?.city || undefined;
  const province = loc?.region || undefined;
  const country = loc?.country || undefined;
  const location = remote
    ? 'Remote'
    : [city, province].filter(Boolean).join(', ') || undefined;
  return { location, city, province, country, remote };
}

function applyUrl(company: string, id: string): string {
  return `https://jobs.smartrecruiters.com/${company}/${id}`;
}

/** Map a list item + its detail into a RawJob. Pure. */
export function mapSmartRecruitersJob(
  company: string,
  companyName: string,
  item: SrListItem,
  detail: SrDetail | null
): RawJob {
  const id = String(item.id || detail?.id || '');
  const loc = locationText(detail?.location || item.location);
  const type = detail?.typeOfEmployment?.label || item.typeOfEmployment?.label;
  const dept = detail?.department?.label || item.department?.label || detail?.function?.label || item.function?.label;
  return {
    externalId: id || undefined,
    sourceUrl: id ? applyUrl(company, id) : undefined,
    applyUrl: id ? applyUrl(company, id) : undefined,
    title: item.name || detail?.name,
    company: item.company?.name || detail?.company?.name || companyName,
    location: loc.location,
    city: loc.city,
    province: loc.province,
    country: loc.country,
    descriptionHtml: detail ? buildSmartRecruitersDescription(detail) : undefined,
    employmentType: type,
    category: dept,
    postedDate: item.releasedDate || detail?.releasedDate,
    extra: { department: dept, remote: loc.remote },
  };
}

export class SmartRecruitersAdapter implements SourceAdapter {
  readonly strategy = 'api' as const;
  readonly key: string;
  constructor(private readonly config: SmartRecruitersConfig) {
    this.key = config.key;
  }

  async acquire(): Promise<RawJob[]> {
    const base = this.config.baseUrl || 'https://api.smartrecruiters.com';
    const company = this.config.company;
    const companyName = this.config.companyName || company;
    const limit = 100;
    let offset = 0;
    const items: SrListItem[] = [];

    // 1) Paginate the listings.
    for (let page = 0; page < 200; page++) {
      const url = `${base}/v1/companies/${encodeURIComponent(company)}/postings?limit=${limit}&offset=${offset}`;
      const res = await fetchJson<SrListResponse>(url, { retries: 3 });
      const content = Array.isArray(res?.content) ? res.content : [];
      items.push(...content);
      const total = res?.totalFound ?? items.length;
      offset += limit;
      if (content.length < limit || offset >= total) break;
    }

    // 2) Fetch each posting's FULL detail (bounded concurrency), then map.
    const details = await mapLimit(items, this.config.concurrency ?? 4, async (item) => {
      const id = String(item.id || '');
      if (!id) return null;
      try {
        const url = `${base}/v1/companies/${encodeURIComponent(company)}/postings/${encodeURIComponent(id)}`;
        return await fetchJson<SrDetail>(url, { retries: 3 });
      } catch {
        return null; // a single failed detail must not fail the batch
      }
    });

    return items
      .map((item, i) => mapSmartRecruitersJob(company, companyName, item, details[i]))
      .filter((j) => j.title && j.applyUrl);
  }
}
