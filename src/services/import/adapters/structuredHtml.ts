/**
 * Import pipeline — structured HTML adapter (Milestone 2).
 *
 * Acquisition strategy #5: many job pages embed schema.org JobPosting data as
 * JSON-LD (<script type="application/ld+json">). This is far cheaper and more
 * reliable than scraping rendered HTML, so we try it before Firecrawl/Playwright.
 * `extractJsonLdJobs` is PURE (HTML string → RawJob[]) and unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchText } from './http';

interface JobPostingLd {
  '@type'?: string | string[];
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganization?: { name?: string; sameAs?: string; url?: string } | string;
  jobLocation?: any;
  applicantLocationRequirements?: any;
  jobLocationType?: string;
  baseSalary?: any;
  directApply?: boolean;
  url?: string;
  identifier?: any;
}

function typeIncludesJobPosting(t: unknown): boolean {
  if (!t) return false;
  if (Array.isArray(t)) return t.some((x) => String(x).toLowerCase() === 'jobposting');
  return String(t).toLowerCase() === 'jobposting';
}

/** Recursively collect JobPosting nodes from a parsed JSON-LD value. */
function collectJobPostings(node: any, out: JobPostingLd[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const n of node) collectJobPostings(n, out);
    return;
  }
  if (typeIncludesJobPosting(node['@type'])) out.push(node);
  if (Array.isArray(node['@graph'])) collectJobPostings(node['@graph'], out);
}

function orgName(org: JobPostingLd['hiringOrganization']): string | undefined {
  if (!org) return undefined;
  if (typeof org === 'string') return org;
  return org.name;
}
function orgSite(org: JobPostingLd['hiringOrganization']): string | undefined {
  if (!org || typeof org === 'string') return undefined;
  return org.sameAs || org.url;
}

function firstAddress(loc: any): { city?: string; region?: string; country?: string } {
  const l = Array.isArray(loc) ? loc[0] : loc;
  const addr = l?.address || l;
  if (!addr || typeof addr !== 'object') return {};
  const country =
    typeof addr.addressCountry === 'string'
      ? addr.addressCountry
      : addr.addressCountry?.name;
  return {
    city: addr.addressLocality,
    region: addr.addressRegion,
    country,
  };
}

function salaryText(baseSalary: any): string | undefined {
  if (!baseSalary) return undefined;
  const v = baseSalary.value || baseSalary;
  const unit = v?.unitText || baseSalary.unitText;
  const currency = baseSalary.currency || '';
  if (v?.minValue || v?.maxValue) {
    const parts = [v.minValue, v.maxValue].filter((x) => x != null).join(' - ');
    return `${currency} ${parts} ${unit || ''}`.trim();
  }
  if (v?.value) return `${currency} ${v.value} ${unit || ''}`.trim();
  return undefined;
}

const EMP_TYPE_LD: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACTOR: 'Contract',
  TEMPORARY: 'Temporary',
  INTERN: 'Internship',
  VOLUNTEER: 'Temporary',
  PER_DIEM: 'Contract',
  OTHER: 'Full-time',
};

function mapEmploymentType(t: JobPostingLd['employmentType']): string | undefined {
  if (!t) return undefined;
  const first = Array.isArray(t) ? t[0] : t;
  return EMP_TYPE_LD[String(first).toUpperCase()] || String(first);
}

/** Extract all schema.org JobPosting entries from an HTML document. Pure. */
export function extractJsonLdJobs(html: string, pageUrl = ''): RawJob[] {
  if (!html) return [];
  const blocks = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (!blocks) return [];

  const postings: JobPostingLd[] = [];
  for (const block of blocks) {
    const jsonText = block
      .replace(/<script[^>]*>/i, '')
      .replace(/<\/script>/i, '')
      .trim();
    try {
      collectJobPostings(JSON.parse(jsonText), postings);
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }

  return postings.map((p): RawJob => {
    const addr = firstAddress(p.jobLocation);
    const remote = /remote|telecommute/i.test(String(p.jobLocationType || ''));
    const externalId =
      (typeof p.identifier === 'object' ? p.identifier?.value : p.identifier) ||
      p.url ||
      pageUrl;
    return {
      title: p.title,
      company: orgName(p.hiringOrganization),
      sourceUrl: p.url || pageUrl || undefined,
      applyUrl: p.url || pageUrl || undefined,
      externalId: externalId ? String(externalId) : undefined,
      descriptionHtml: p.description,
      city: addr.city,
      province: addr.region,
      country: addr.country,
      location: remote ? 'Remote' : [addr.city, addr.region].filter(Boolean).join(', ') || undefined,
      employmentType: mapEmploymentType(p.employmentType),
      salaryText: salaryText(p.baseSalary),
      postedDate: p.datePosted,
      closingDate: p.validThrough,
      extra: { companyWebsite: orgSite(p.hiringOrganization) },
    };
  }).filter((j) => j.title || j.applyUrl);
}

export interface StructuredHtmlConfig {
  key: string;
  /** A single page URL, or a list of detail-page URLs to extract from. */
  urls: string[];
}

export class StructuredHtmlAdapter implements SourceAdapter {
  readonly strategy = 'structured_html' as const;
  readonly key: string;
  constructor(private readonly config: StructuredHtmlConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const all: RawJob[] = [];
    for (const url of this.config.urls) {
      try {
        const html = await fetchText(url);
        all.push(...extractJsonLdJobs(html, url));
      } catch {
        // skip failed pages; a single bad URL must not fail the batch
      }
    }
    return all;
  }
}
