/**
 * Import pipeline — SAP SuccessFactors "Career Site Builder" (CSB) adapter.
 *
 * A large share of South Africa's biggest employers (Sasol, and many banks,
 * retailers, mining & energy groups) run their careers site on SAP
 * SuccessFactors CSB at `jobs.{company}.com`. These sites are NOT keyless-API
 * (unlike Greenhouse/Lever), BUT they are fully server-rendered and expose:
 *
 *   1. A public sitemap.xml listing every live job URL (/job/{Slug}/{id}/).
 *   2. schema.org JobPosting MICRODATA on each detail page:
 *        <h1 id="job-title" itemprop="title">…</h1>
 *        <meta itemprop="streetAddress" content="Secunda, South Africa">
 *        <meta itemprop="datePosted" content="…">
 *        <span itemprop="description">…full HTML…</span>
 *
 * ONE connector therefore serves EVERY SA employer on SuccessFactors CSB via a
 * per-employer host — adding an employer is a config entry, never new code.
 *
 * Flow: sitemap → (SA slug pre-filter for efficiency) → fetch detail pages
 * (bounded concurrency) → parse microdata → RawJob. The apply URL is the
 * employer's own SuccessFactors job page (official application page). Non-SA
 * roles (the sites are usually multi-country) are rejected downstream by the
 * shared SA gate on the parsed country.
 *
 * `parseSitemapJobUrls` and `parseSuccessFactorsJob` are PURE + unit-testable.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchText, mapLimit } from './http';
import { resolveSA } from '../../../lib/saLocation';
import {
  attrOf,
  innerHtmlOf,
  parseHtml,
  queryFirst,
  textOf,
} from './htmlQuery';

export interface SuccessFactorsConfig {
  /** Adapter key stored as jobs.source (e.g. 'successfactors:sasol'). */
  key: string;
  /** Employer display name. */
  company: string;
  /** CSB host, e.g. 'https://jobs.sasol.com'. */
  host: string;
  /** Override sitemap URL (defaults to `${host}/sitemap.xml`). */
  sitemapUrl?: string;
  /** Max detail pages to fetch per run (bounds cost). Default 200. */
  maxJobs?: number;
  /** Concurrent detail fetches. Default 6. */
  concurrency?: number;
  /**
   * Skip sitemap URLs whose slug location is clearly foreign before fetching
   * (efficiency only — the authoritative SA gate still runs downstream on the
   * parsed country). Default true.
   */
  saSlugPrefilter?: boolean;
}

/** Extract job detail URLs from a sitemap.xml (or sitemap index). Pure. */
export function parseSitemapJobUrls(xml: string): string[] {
  if (!xml) return [];
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  // Keep only individual job detail pages (SF CSB uses /job/{slug}/{id}/).
  return [...new Set(locs.filter((u) => /\/job\//i.test(u)))];
}

/** The location part of a CSB slug (the text before the job title). */
function slugLocation(url: string): string {
  const m = url.match(/\/job\/([^/]+)\//i);
  if (!m) return '';
  const slug = decodeURIComponent(m[1]).replace(/[-+]/g, ' ');
  // The city is the leading token(s); pass the whole slug to the resolver — a
  // foreign token anywhere flags it, an SA token anywhere keeps it.
  return slug;
}

/** True if a sitemap URL is worth fetching (not clearly foreign). */
export function isProbablySAJobUrl(url: string): boolean {
  const loc = slugLocation(url);
  if (!loc) return true; // can't tell → fetch and let the gate decide
  const sa = resolveSA({ location: loc, city: loc });
  // Keep SA matches AND uncertain ones; only drop when a FOREIGN token matched.
  return sa.isSA || sa.reason === 'uncertain';
}

/** Split an SF streetAddress ("Secunda, South Africa") into city + country. */
function splitAddress(addr: string): { city?: string; country?: string } {
  if (!addr) return {};
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };
  return { city: parts.slice(0, -1).join(', '), country: parts[parts.length - 1] };
}

/**
 * Parse a SuccessFactors CSB job detail page into a RawJob. Pure, no I/O.
 * Returns null when the page has no usable title (e.g. an interstitial).
 */
export function parseSuccessFactorsJob(html: string, pageUrl: string, company: string): RawJob | null {
  if (!html) return null;
  const root = parseHtml(html);

  const title =
    textOf(queryFirst(root, '#job-title')) ||
    textOf(queryFirst(root, '[itemprop="title"]'));
  if (!title) return null;

  const descNode =
    queryFirst(root, '[itemprop="description"]') || queryFirst(root, '.jobdescription');
  const descriptionHtml = descNode ? innerHtmlOf(descNode) : undefined;

  const streetAddr = attrOf(queryFirst(root, '[itemprop="streetAddress"]'), 'content');
  const { city, country } = splitAddress(streetAddr);

  // Visible location fallback (e.g. "<p id="job-location">Secunda, Mpumalanga</p>").
  const visibleLoc = textOf(queryFirst(root, '#job-location')).replace(/^location:?/i, '').trim();

  const datePosted = attrOf(queryFirst(root, '[itemprop="datePosted"]'), 'content') || undefined;

  return {
    externalId: pageUrl,
    sourceUrl: pageUrl,
    applyUrl: pageUrl, // employer's own SuccessFactors job page (official)
    title,
    company,
    // Prefer the visible location (carries the SA province, e.g. "Secunda,
    // Mpumalanga"); keep city/country from the schema.org microdata. Country
    // is the authoritative signal for the downstream SA gate.
    location: visibleLoc || streetAddr || undefined,
    city: city || undefined,
    country: country || undefined,
    descriptionHtml,
    postedDate: datePosted,
  };
}

export class SuccessFactorsAdapter implements SourceAdapter {
  readonly strategy = 'structured_html' as const;
  readonly key: string;
  constructor(private readonly config: SuccessFactorsConfig) {
    this.key = config.key;
  }

  async acquire(): Promise<RawJob[]> {
    const host = this.config.host.replace(/\/+$/, '');
    const sitemapUrl = this.config.sitemapUrl || `${host}/sitemap.xml`;
    const maxJobs = this.config.maxJobs ?? 200;
    const concurrency = this.config.concurrency ?? 6;
    const prefilter = this.config.saSlugPrefilter !== false;

    let xml: string;
    try {
      xml = await fetchText(sitemapUrl);
    } catch {
      return [];
    }

    let urls = parseSitemapJobUrls(xml);
    if (prefilter) urls = urls.filter(isProbablySAJobUrl);
    urls = urls.slice(0, maxJobs);
    if (!urls.length) return [];

    const parsed = await mapLimit(urls, concurrency, async (url) => {
      try {
        const html = await fetchText(url);
        return parseSuccessFactorsJob(html, url, this.config.company);
      } catch {
        return null;
      }
    });

    return parsed.filter((j): j is RawJob => j != null);
  }
}
