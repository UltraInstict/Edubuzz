/**
 * Import pipeline — RSS / Atom adapter (Milestone 2).
 *
 * RSS is the #2 preferred acquisition strategy after official APIs. Many SA job
 * boards expose RSS/Atom. `parseRssFeed` is PURE (string in → RawJob[] out) so
 * it is fully unit-testable; `RssAdapter` wires it to the HTTP fetcher.
 *
 * Field mapping is config-driven so a new RSS source is added by declaring a
 * feed URL + optional field map — never by touching the core engine.
 */

import { XMLParser } from 'fast-xml-parser';
import type { RawJob, SourceAdapter } from '../types';
import { fetchText } from './http';

export interface RssFieldMap {
  title?: string;
  link?: string;
  description?: string;
  company?: string;
  location?: string;
  category?: string;
  salary?: string;
  employmentType?: string;
  closingDate?: string;
  postedDate?: string;
  guid?: string;
}

export interface RssAdapterConfig {
  key: string;
  url: string;
  /** Override where each RawJob field is read from on an <item>/<entry>. */
  fieldMap?: RssFieldMap;
  /** Default company when the feed doesn't carry one (e.g. single-employer feed). */
  defaultCompany?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseTagValue: false,
});

function textOf(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node.trim();
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  if (Array.isArray(node)) return textOf(node[0]);
  if (typeof node === 'object') {
    const o = node as Record<string, unknown>;
    // CDATA / text nodes land under '#text'
    if ('#text' in o) return textOf(o['#text']);
    return '';
  }
  return '';
}

/** Extract an href from an Atom <link> which may be a string or {@_href}. */
function linkOf(node: unknown): string {
  if (Array.isArray(node)) {
    // Prefer rel="alternate" or the first with href
    for (const n of node) {
      const href = linkOf(n);
      if (href) return href;
    }
    return '';
  }
  if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (o['@_href']) return String(o['@_href']).trim();
    if ('#text' in o) return textOf(o['#text']);
  }
  return textOf(node);
}

function pick(item: Record<string, unknown>, path: string | undefined, fallbacks: string[]): unknown {
  if (path && item[path] != null) return item[path];
  for (const f of fallbacks) {
    if (item[f] != null) return item[f];
  }
  return undefined;
}

/**
 * Parse an RSS 2.0 or Atom feed body into RawJob[]. Pure, no I/O.
 * Unknown/empty feeds yield an empty array (never throws on missing items).
 */
export function parseRssFeed(xml: string, config: Partial<RssAdapterConfig> = {}): RawJob[] {
  if (!xml || !xml.trim()) return [];
  let doc: any;
  try {
    doc = parser.parse(xml);
  } catch {
    return [];
  }

  // RSS 2.0: rss.channel.item[]  | Atom: feed.entry[]
  const channel = doc?.rss?.channel ?? doc?.['rdf:RDF'] ?? doc?.channel;
  const feed = doc?.feed;
  let items: unknown =
    channel?.item ?? feed?.entry ?? doc?.item ?? [];
  if (!Array.isArray(items)) items = items ? [items] : [];

  const fm = config.fieldMap || {};

  return (items as Record<string, unknown>[])
    .map((item): RawJob => {
      const title = textOf(pick(item, fm.title, ['title']));
      const link =
        linkOf(pick(item, fm.link, ['link'])) ||
        textOf(pick(item, undefined, ['guid', 'id']));
      const description = textOf(pick(item, fm.description, ['description', 'summary', 'content', 'content:encoded']));
      const company = textOf(pick(item, fm.company, ['company', 'dc:creator', 'author'])) || config.defaultCompany || '';
      const location = textOf(pick(item, fm.location, ['location', 'job:location', 'georss:featurename']));
      const category = textOf(pick(item, fm.category, ['category', 'job:category']));
      const salary = textOf(pick(item, fm.salary, ['salary', 'job:salary']));
      const employmentType = textOf(pick(item, fm.employmentType, ['job:type', 'employmentType']));
      const closingDate = textOf(pick(item, fm.closingDate, ['job:closingDate', 'expires', 'closingDate']));
      const postedDate = textOf(pick(item, fm.postedDate, ['pubDate', 'published', 'updated', 'dc:date']));
      const guid = textOf(pick(item, fm.guid, ['guid', 'id']));

      return {
        title: title || undefined,
        applyUrl: link || undefined,
        sourceUrl: link || undefined,
        externalId: guid || link || undefined,
        descriptionHtml: description || undefined,
        company: company || undefined,
        location: location || undefined,
        category: category || undefined,
        salaryText: salary || undefined,
        employmentType: employmentType || undefined,
        closingDate: closingDate || undefined,
        postedDate: postedDate || undefined,
      };
    })
    .filter((j) => j.title || j.applyUrl);
}

export class RssAdapter implements SourceAdapter {
  readonly strategy = 'rss' as const;
  readonly key: string;
  constructor(private readonly config: RssAdapterConfig) {
    this.key = config.key;
  }
  async acquire(): Promise<RawJob[]> {
    const xml = await fetchText(this.config.url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
    return parseRssFeed(xml, this.config);
  }
}
