/**
 * Import pipeline — generic HTML career-page adapter.
 *
 * For employers NOT on a keyless ATS (Greenhouse/Lever/etc.), many still expose
 * a plain HTML vacancies list on their own site. This ONE connector serves all
 * of them via a per-employer CSS-selector config — adding an employer is a
 * config entry (in the Source Library), never new code.
 *
 * Strategy:
 *   1. Fetch the careers listing page (following optional pagination).
 *   2. `list` selector → one node per vacancy card/row.
 *   3. Within each card, `title` / `location` / `applyUrl` (+ optional
 *      `description`, `closingDate`) selectors extract the fields.
 *   4. Optionally fetch each detail page and pull schema.org JSON-LD to enrich
 *      the description (reusing the structured-HTML extractor).
 *
 * The apply URL is always resolved against the employer's own domain, so it
 * stays an official employer page (never a third-party board — enforced again
 * downstream by the validator).
 *
 * `parseCareerListing` is PURE (html + config → RawJob[]) and unit-testable.
 * Non-SA / expired / duplicate rejection all happen downstream in the shared
 * pipeline (validate.ts + orchestrator), exactly like every other adapter.
 */

import type { RawJob, SourceAdapter } from '../types';
import { fetchText } from './http';
import { extractJsonLdJobs } from './structuredHtml';
import {
  attrOf,
  innerHtmlOf,
  parseHtml,
  queryAll,
  queryFirst,
  resolveUrl,
  textOf,
  type HNode,
} from './htmlQuery';

/** Per-employer selector configuration (stored in the Source Library). */
export interface CareerSelectors {
  /** Selector matching each vacancy card/row (required). */
  list: string;
  /** Title selector, relative to a card. Defaults to the card's own text. */
  title?: string;
  /** Location selector, relative to a card. */
  location?: string;
  /** Apply/detail link selector, relative to a card. Defaults to first <a>. */
  applyUrl?: string;
  /** Description selector, relative to a card (listing-level snippet). */
  description?: string;
  /** Closing-date selector, relative to a card. */
  closingDate?: string;
  /** Employment-type selector, relative to a card. */
  employmentType?: string;
  /** Category/department selector, relative to a card. */
  category?: string;
  /** "Next page" link selector (its href is followed). */
  pagination?: string;
}

export interface HtmlCareerConfig {
  /** Adapter key stored as jobs.source (e.g. 'html:acme'). */
  key: string;
  /** Employer display name. */
  company: string;
  /** One or more listing page URLs to start from. */
  listUrls: string[];
  selectors: CareerSelectors;
  /** Follow up to N "next page" links per start URL (default 0 = none). */
  maxPages?: number;
  /**
   * Fetch each detail page and enrich the description from schema.org JSON-LD.
   * Off by default (one request per listing page only). Bounded by maxDetail.
   */
  fetchDetail?: boolean;
  /** Max detail pages to fetch when fetchDetail is on (default 40). */
  maxDetail?: number;
  baseUrl?: string;
}

/** Extract text from the first node matching `sel` inside `card`. */
function pick(card: HNode, sel: string | undefined): string {
  if (!sel) return '';
  return textOf(queryFirst(card, sel));
}

/**
 * Parse a career-listing HTML document into RawJob[]. Pure, no I/O.
 * `pageUrl` is used to resolve relative apply links to absolute URLs.
 */
export function parseCareerListing(
  html: string,
  config: Pick<HtmlCareerConfig, 'company' | 'selectors'>,
  pageUrl: string
): RawJob[] {
  const root = parseHtml(html);
  const { selectors: sel, company } = config;
  const cards = queryAll(root, sel.list);

  return cards
    .map((card): RawJob => {
      const title = (sel.title ? pick(card, sel.title) : textOf(card)).trim();

      // Apply/detail link: explicit selector, else the first <a href> in card.
      let linkNode: HNode | null = null;
      if (sel.applyUrl) linkNode = queryFirst(card, sel.applyUrl);
      if (!linkNode) linkNode = queryFirst(card, 'a');
      const href = attrOf(linkNode, 'href');
      const applyUrl = resolveUrl(href, pageUrl);

      const location = pick(card, sel.location) || undefined;
      const descNode = sel.description ? queryFirst(card, sel.description) : null;
      const descriptionHtml = descNode ? innerHtmlOf(descNode) : undefined;

      return {
        externalId: applyUrl || undefined,
        sourceUrl: applyUrl || undefined,
        applyUrl: applyUrl || undefined,
        title: title || undefined,
        company,
        location,
        descriptionHtml,
        employmentType: pick(card, sel.employmentType) || undefined,
        category: pick(card, sel.category) || undefined,
        closingDate: pick(card, sel.closingDate) || undefined,
      };
    })
    .filter((j) => j.title && j.applyUrl);
}

export class HtmlCareerAdapter implements SourceAdapter {
  readonly strategy = 'structured_html' as const;
  readonly key: string;
  constructor(private readonly config: HtmlCareerConfig) {
    this.key = config.key;
  }

  async acquire(): Promise<RawJob[]> {
    const maxPages = Math.max(0, this.config.maxPages ?? 0);
    const collected: RawJob[] = [];
    const seenPages = new Set<string>();

    for (const start of this.config.listUrls) {
      let pageUrl = start;
      for (let page = 0; page <= maxPages; page++) {
        if (!pageUrl || seenPages.has(pageUrl)) break;
        seenPages.add(pageUrl);

        let html: string;
        try {
          html = await fetchText(pageUrl);
        } catch {
          break; // a single failed page must not abort the whole source
        }

        collected.push(...parseCareerListing(html, this.config, pageUrl));

        // Follow pagination if configured.
        if (this.config.selectors.pagination && page < maxPages) {
          const root = parseHtml(html);
          const next = queryFirst(root, this.config.selectors.pagination);
          const nextHref = attrOf(next, 'href');
          pageUrl = nextHref ? resolveUrl(nextHref, pageUrl) : '';
        } else {
          break;
        }
      }
    }

    // Optional detail-page enrichment: fill in descriptions from JSON-LD.
    if (this.config.fetchDetail) {
      const limit = this.config.maxDetail ?? 40;
      let fetched = 0;
      for (const job of collected) {
        if (fetched >= limit) break;
        if (job.descriptionHtml || !job.applyUrl) continue;
        try {
          const detailHtml = await fetchText(job.applyUrl);
          const ld = extractJsonLdJobs(detailHtml, job.applyUrl)[0];
          if (ld) {
            job.descriptionHtml = ld.descriptionHtml || job.descriptionHtml;
            job.city = job.city || ld.city;
            job.province = job.province || ld.province;
            job.country = job.country || ld.country;
            job.employmentType = job.employmentType || ld.employmentType;
            job.closingDate = job.closingDate || ld.closingDate;
          }
          fetched++;
        } catch {
          // skip detail failures
        }
      }
    }

    return collected;
  }
}
