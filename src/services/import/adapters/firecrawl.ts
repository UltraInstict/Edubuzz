/**
 * Import pipeline — Firecrawl adapter (Milestone 2).
 *
 * Acquisition strategy #6 (fallback for sites with no API/RSS/feed and no
 * usable JSON-LD). Wraps the EXISTING firecrawlService (scrapeJobUrl /
 * discoverJobUrls / batchScrapeJobs) — no scraping logic is duplicated here.
 *
 * For each scraped page we FIRST try the cheap structured path (JSON-LD via
 * extractJsonLdJobs). Only if that yields nothing do we emit a RawJob carrying
 * the raw markdown/HTML for downstream AI normalization (M4). This honours the
 * "cheapest reliable method first" rule even within a single source.
 */

import type { RawJob, SourceAdapter } from '../types';
import { extractJsonLdJobs } from './structuredHtml';
import {
  batchScrapeJobs,
  discoverJobUrls,
  type ScrapeResult,
} from '../../firecrawlService';

export interface FirecrawlConfig {
  key: string;
  /** Career/listing page to crawl for job URLs. */
  careerPageUrl?: string;
  /** Explicit job URLs to scrape (used when discovery isn't needed). */
  jobUrls?: string[];
  /** Optional company name for single-employer career pages. */
  defaultCompany?: string;
  concurrency?: number;
}

/** Turn a Firecrawl scrape result into RawJob[]. Pure (no network). */
export function scrapeResultToRawJobs(
  result: ScrapeResult,
  defaultCompany?: string
): RawJob[] {
  if (!result.success) return [];
  const url = result.metadata?.sourceURL || result.url;

  // Prefer structured JSON-LD if present on the scraped HTML.
  if (result.html) {
    const structured = extractJsonLdJobs(result.html, url);
    if (structured.length) {
      return structured.map((j) => ({
        ...j,
        company: j.company || defaultCompany,
        extra: { ...(j.extra || {}), acquiredVia: 'firecrawl+jsonld' },
      }));
    }
  }

  // Fallback: emit raw content for downstream AI extraction (M4).
  const content = result.markdown || result.html;
  if (!content) return [];
  return [
    {
      title: result.metadata?.title,
      company: defaultCompany,
      sourceUrl: url,
      applyUrl: url,
      externalId: url,
      descriptionHtml: result.html,
      descriptionText: result.markdown,
      extra: {
        acquiredVia: 'firecrawl+raw',
        needsAiNormalization: true,
        ogImage: result.metadata?.ogImage,
        metaDescription: result.metadata?.description,
      },
    },
  ];
}

export class FirecrawlAdapter implements SourceAdapter {
  readonly strategy = 'firecrawl' as const;
  readonly key: string;
  constructor(private readonly config: FirecrawlConfig) {
    this.key = config.key;
  }

  async acquire(): Promise<RawJob[]> {
    let urls = this.config.jobUrls || [];
    if (!urls.length && this.config.careerPageUrl) {
      urls = await discoverJobUrls(this.config.careerPageUrl);
    }
    if (!urls.length) return [];

    const results = await batchScrapeJobs(urls, this.config.concurrency || 5);
    const jobs: RawJob[] = [];
    for (const r of results) {
      jobs.push(...scrapeResultToRawJobs(r, this.config.defaultCompany));
    }
    return jobs;
  }
}
