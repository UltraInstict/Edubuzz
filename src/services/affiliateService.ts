/**
 * MaxBounty Affiliate Service
 * Manages affiliate links, contextual placement, click tracking.
 *
 * All read/write operations use the admin-authenticated PocketBase client
 * so admin pages and server-rendered ad slots see records regardless of
 * collection-level API rules.
 */

import { getAdminPB } from '../lib/auth';

export const PB_FILE_BASE = (
  import.meta.env.PUBLIC_PB_URL ||
  process.env.PUBLIC_PB_URL ||
  'https://edubuzz.co.za/pb-api'
).replace(/\/$/, '');

export type AffiliateZone = 'strip' | 'sidebar' | 'infeed' | 'jobs-top' | 'all';
export type AffiliateDisplayType = 'text' | 'image' | 'html';

export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  category: string;
  zone: AffiliateZone;
  display_type?: AffiliateDisplayType;
  active: boolean;
  clicks: number;
  created: string;
  description?: string;
  banner_html?: string;
  image_url?: string;
  banner_file?: string;
  banner_width?: number;
  banner_height?: number;
  collectionId?: string;
}

// ─── Affiliate Links CRUD ─────────────────────────────────────────────────

/**
 * Map a zone identifier (in any common spelling) to the full set of strings
 * we should accept when matching against the `zone` field stored in PocketBase.
 *
 * Different deployments have stored zones differently over time:
 *   - lower-case dashed  ("sidebar", "jobs-top")
 *   - capitalised label  ("Sidebar", "Jobs Page Top")
 *   - synonyms           ("strip" vs "Strip (full-width banner)")
 *
 * To keep ad slots working without forcing a manual data migration we accept
 * any of the known variants. "all" is always a wildcard.
 */
function expandZoneVariants(zone: string): string[] {
  const lower = zone.toLowerCase().trim();
  const map: Record<string, string[]> = {
    'sidebar':  ['sidebar', 'Sidebar'],
    'strip':    ['strip', 'Strip', 'Strip (full-width banner)'],
    'infeed':   ['infeed', 'In-feed', 'In-feed (between job cards)'],
    'jobs-top': ['jobs-top', 'jobs_top', 'Jobs Page Top', 'Jobs-Top', 'jobsTop'],
  };
  const variants = map[lower] || [zone];
  // Always include "all" so wildcard-zoned links match every slot.
  return Array.from(new Set([...variants, 'all', 'All', 'ALL']));
}

/**
 * Returns active affiliate links eligible for the given zone.
 * Zone matching is variant-tolerant (see expandZoneVariants).
 */
export async function getActiveAffiliateLinks(
  category?: string,
  zone?: string,
): Promise<AffiliateLink[]> {
  const filters: string[] = ['active=true'];
  if (zone) {
    const variants = expandZoneVariants(zone);
    const ors = variants.map((v) => `zone="${v.replace(/"/g, '\\"')}"`).join('||');
    filters.push(`(${ors})`);
  }
  if (category) {
    filters.push(`category="${category.replace(/"/g, '\\"')}"`);
  }

  try {
    const pb = await getAdminPB();
    const result = await pb.collection('affiliate_links').getFullList({
      filter: filters.join('&&'),
      sort: '-clicks',
    });
    return result as unknown as AffiliateLink[];
  } catch {
    return [];
  }
}

/**
 * Resolve which affiliate link to render in a given zone.
 *
 * Zone is a HARD filter — if no link matches the zone (or "all"), returns null.
 * Category is a SOFT preference used to pick the most contextually relevant
 * link from those that already match the zone:
 *
 *   1. Within the zone, prefer an exact category match.
 *   2. Otherwise, prefer "general" / empty / null category (wildcard).
 *   3. Otherwise, pick any link in the zone.
 *
 * Among multiple candidates, picks one at random to rotate impressions.
 */
export async function getAffiliateLinkByCategory(category?: string, zone?: string): Promise<AffiliateLink | null> {
  if (!zone) return null;

  const zoneLinks = await getActiveAffiliateLinks(undefined, zone);
  if (zoneLinks.length === 0) return null;

  if (category) {
    const exact = zoneLinks.filter((l) => (l.category || '').toLowerCase() === category.toLowerCase());
    if (exact.length > 0) return pickRandom(exact);
  }

  const wildcards = zoneLinks.filter((l) => {
    const c = (l.category || '').toLowerCase();
    return c === '' || c === 'general' || c === 'null';
  });
  if (wildcards.length > 0) return pickRandom(wildcards);

  return pickRandom(zoneLinks);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ─── Contextual Placement Logic ───────────────────────────────────────────

export function getCategoryForAffiliate(jobCategory?: string): string {
  if (!jobCategory) return 'general';

  const normalized = jobCategory.toLowerCase().trim();

  const mapping: Record<string, string> = {
    'finance': 'finance',
    'it & tech': 'tech',
    'it-tech': 'tech',
    'government': 'government',
    'health': 'health',
    'education': 'education',
    'engineering': 'engineering',
    'legal': 'legal',
    'marketing': 'marketing',
    'hospitality': 'hospitality',
    'retail': 'retail',
    'construction': 'construction',
    'logistics': 'logistics',
    'agriculture': 'agriculture',
    'mining': 'mining',
  };

  return mapping[normalized] || 'general';
}

// ─── Click Tracking ──────────────────────────────────────────────────────

export async function trackAffiliateClick(
  linkId: string,
  request: Request,
  jobId?: string,
): Promise<void> {
  const ua = request.headers.get('user-agent') ?? '';
  const device = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop';

  try {
    const pb = await getAdminPB();
    await pb.collection('affiliate_links').update(linkId, { 'clicks+': 1 });
    await pb.collection('affiliate_clicks').create({
      link_id: linkId,
      job_id: jobId || '',
      device,
      created: new Date().toISOString(),
    });
  } catch {}
}

export async function getAffiliateClickStats(): Promise<{
  totalClicks: number;
  todayClicks: number;
  byLink: { id: string; name: string; clicks: number }[];
}> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const pb = await getAdminPB();
    const [allLinks, todayClicks] = await Promise.all([
      pb.collection('affiliate_links').getFullList({
        sort: '-clicks',
        fields: 'id,name,clicks,active',
      }).catch(() => []),
      pb.collection('affiliate_clicks').getList(1, 1, {
        filter: `created>="${today}"`,
      }).catch(() => ({ totalItems: 0 })),
    ]);

    const total = (allLinks as any[]).reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);

    return {
      totalClicks: total,
      todayClicks: todayClicks.totalItems,
      byLink: (allLinks as any[]).map((l: any) => ({
        id: l.id,
        name: l.name,
        clicks: l.clicks || 0,
      })),
    };
  } catch {
    return { totalClicks: 0, todayClicks: 0, byLink: [] };
  }
}

/** Full list of affiliate links (admin only) */
export async function listAllAffiliateLinks(): Promise<AffiliateLink[]> {
  try {
    const pb = await getAdminPB();
    const result = await pb.collection('affiliate_links').getFullList({
      sort: '-clicks',
    });
    return result as unknown as AffiliateLink[];
  } catch (err: any) {
    console.error('[listAllAffiliateLinks] Failed:', err?.message || err);
    return [];
  }
}
