/**
 * Monetization Engine — unified campaign resolution with tiered priority.
 *
 * Tier chain (fixed order):
 *   1. Sponsored Job
 *   2. Sponsored Employer
 *   3. AdSense
 *   4. Affiliate (image, html, text — display_type controls rendering)
 *   5. House Ad
 *   6. Empty (render nothing)
 *
 * Within each tier: sort by priority DESC, random rotation at equal priority.
 *
 * 60-second in-memory cache for active campaigns, settings, house ads.
 * Never caches writes.
 * 3-consecutive-failure deactivation with audit logging.
 */

import { getAdminPB } from '../lib/auth';
import PocketBase from 'pocketbase';
import {
  type AffiliateLink,
  getCategoryForAffiliate,
  PB_FILE_BASE,
} from './affiliateService';
import { getAdminSettings } from './jobService';

const PB_URL = import.meta.env.PB_URL || 'http://127.0.0.1:8090';

// ─── Cache ──────────────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; ts: number; }
const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60_000;

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && (Date.now() - entry.ts) < CACHE_TTL_MS) return entry.data;
  cache.delete(key);
  return null;
}

function cacheSet<T>(key: string, data: T): void {
  cache.set(key, { data, ts: Date.now() });
}

function cacheClear(prefix?: string): void {
  if (prefix) {
    for (const k of cache.keys()) { if (k.startsWith(prefix)) cache.delete(k); }
  } else {
    cache.clear();
  }
}

// ─── Broken campaign tracking ───────────────────────────────────────────────

const brokenFailures = new Map<string, number>();
const MAX_CONSECUTIVE_FAILURES = 3;

async function recordContentFailure(campaign: Campaign): Promise<void> {
  const count = (brokenFailures.get(campaign.id) || 0) + 1;
  brokenFailures.set(campaign.id, count);
  console.error(`[monetization] campaign ${campaign.id.slice(0,8)} zone=${campaign.zone}: content resolution failed (${count}/${MAX_CONSECUTIVE_FAILURES})`);

  if (count >= MAX_CONSECUTIVE_FAILURES) {
    try {
      const pb = await getAdminPB();
      await pb.collection('monetization_campaigns').update(campaign.id, { active: false });
      console.error(`[monetization] campaign ${campaign.id.slice(0,8)}: auto-deactivated after ${count} consecutive content failures`);
      cacheClear('campaigns:');
    } catch (err: any) {
      console.error(`[monetization] failed to auto-deactivate campaign ${campaign.id.slice(0,8)}: ${err?.message || err}`);
    }
    brokenFailures.delete(campaign.id);
  }
}

function clearFailureCount(campaignId: string): void {
  brokenFailures.delete(campaignId);
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type CampaignType =
  | 'affiliate_image'
  | 'affiliate_html'
  | 'affiliate_text'
  | 'adsense_manual'
  | 'house_ad'
  | 'sponsored_job'
  | 'sponsored_employer';

export type MonetizationZone =
  | 'strip'
  | 'sidebar'
  | 'infeed'
  | 'jobs-top'
  | 'homepage-hero'
  | 'all';

export interface Campaign {
  id: string;
  name: string;
  campaign_type: CampaignType;
  zone: MonetizationZone;
  priority: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  category_target?: string;
  reference_id: string;
  impressions: number;
  clicks: number;
  created: string;
  updated: string;
  ad_width?: number;
  ad_height?: number;
}

export interface AffiliateContent {
  id: string;
  name: string;
  description?: string;
  url: string;
  display_type: 'text' | 'image' | 'html';
  banner_html?: string;
  image_url?: string;
  banner_file?: string;
  banner_width?: number;
  banner_height?: number;
  bannerFileUrl?: string;
  collectionId?: string;
}

export interface HouseAdContent {
  id: string;
  title: string;
  description?: string;
  cta_text: string;
  image_url?: string;
  link_url: string;
}

export interface SponsoredJobContent {
  id: string;
  title: string;
  company: string;
  slug: string;
  city?: string;
  province?: string;
}

export interface SponsoredEmployerContent {
  id: string;
  company_name: string;
  company_slug: string;
  logo?: string;
  description?: string;
}

export interface AdSenseContent {
  publisher_id: string;
  slot_id: string;
  format: 'horizontal' | 'rectangle' | 'fluid';
}

export interface ResolvedSlot {
  type: CampaignType | 'empty';
  campaignId?: string;
  content: AffiliateContent | HouseAdContent | SponsoredJobContent | SponsoredEmployerContent | AdSenseContent | null;
  ad_width?: number;
  ad_height?: number;
}

export interface SlotContext {
  category?: string;
  jobId?: string;
}

// ─── Tier ordering (higher index = lower priority) ──────────────────────────

const TYPE_TIER: Record<string, number> = {
  'sponsored_job':       0,
  'sponsored_employer':  0,
  'adsense_manual':      1,
  'affiliate_image':     2,
  'affiliate_html':      2,
  'affiliate_text':      2,
  'house_ad':            3,
};

// ─── Zone expansion (PocketBase filter-friendly) ────────────────────────────

function zoneFilterVariants(zone: string): string {
  const lower = zone.toLowerCase().trim();
  const map: Record<string, string[]> = {
    'sidebar':      ['sidebar', 'Sidebar', 'all', 'All', 'ALL'],
    'strip':        ['strip', 'Strip', 'Strip (full-width banner)', 'all', 'All', 'ALL'],
    'infeed':       ['infeed', 'In-feed', 'In-feed (between job cards)', 'all', 'All', 'ALL'],
    'jobs-top':     ['jobs-top', 'jobs_top', 'Jobs Page Top', 'Jobs-Top', 'jobsTop', 'all', 'All', 'ALL'],
    'homepage-hero':['homepage-hero', 'homepage_hero', 'Homepage Hero', 'all', 'All', 'ALL'],
  };
  const variants = map[lower] || [zone, 'all', 'All', 'ALL'];
  return variants.map(v => `zone="${v.replace(/"/g, '\\"')}"`).join('||');
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Filtered PocketBase fetch (filter at query level, not JS) ──────────────

async function pbQuery(collection: string, filter: string): Promise<any[]> {
  const params = new URLSearchParams();
  params.set('perPage', '500');
  params.set('filter', filter);
  const url = `${PB_URL}/api/collections/${collection}/records?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PB ${res.status} on ${collection}`);
  const data = await res.json();
  return data.items || [];
}

async function pbFetchOne(collection: string, id: string): Promise<any | null> {
  const url = `${PB_URL}/api/collections/${collection}/records/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

function getPB(): PocketBase { return new PocketBase(PB_URL); }

// ─── Campaign Resolution ────────────────────────────────────────────────────

export async function resolveSlot(
  zone: string,
  context?: SlotContext,
): Promise<ResolvedSlot> {
  // Master switch — respects the "monetization_enabled" admin setting
  const settings = await getAdminSettings(['monetization_enabled']).catch(() => ({ monetization_enabled: 'true' } as Record<string, string>));
  if (settings.monetization_enabled === 'false') {
    return { type: 'empty', content: null };
  }

  const campaigns = await getActiveCampaigns(zone);

  if (campaigns.length === 0) {
    return { type: 'empty', content: null };
  }

  const category = context?.category;
  const matchCategory = category ? getCategoryForAffiliate(category) : undefined;

  // Group by tier
  const byTier = new Map<number, Campaign[]>();
  for (const c of campaigns) {
    const tier = TYPE_TIER[c.campaign_type] ?? 99;
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier)!.push(c);
  }
  const tiers = [...byTier.keys()].sort((a, b) => a - b);

  for (const tier of tiers) {
    const tierCampaigns = byTier.get(tier)!;
    // Sort by priority DESC
    tierCampaigns.sort((a, b) => b.priority - a.priority);

    // Collect highest-priority group
    const topPriority = tierCampaigns[0].priority;
    const candidates = tierCampaigns.filter(c => c.priority === topPriority);

    // Try category match first within candidates
    let match = tryCategoryMatch(candidates, matchCategory);
    if (match) {
      const resolved = await resolveCampaignContent(match);
      if (resolved) return resolved;
    }

    // Try wildcard/general within all tier campaigns
    match = tryWildcardMatch(tierCampaigns);
    if (match) {
      const resolved = await resolveCampaignContent(match);
      if (resolved) return resolved;
    }

    // Try any remaining (random rotation within top-priority group)
    // Shuffle candidates for rotation
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    for (const c of shuffled) {
      const resolved = await resolveCampaignContent(c);
      if (resolved) return resolved;
    }

    // Fall through to try ALL tier campaigns (not just top-priority)
    const remaining = tierCampaigns.filter(c => c.priority !== topPriority);
    for (const c of remaining.sort(() => Math.random() - 0.5)) {
      const resolved = await resolveCampaignContent(c);
      if (resolved) return resolved;
    }
  }

  return { type: 'empty', content: null };
}

function tryCategoryMatch(campaigns: Campaign[], matchCategory?: string): Campaign | null {
  if (!matchCategory || matchCategory === 'general') return null;
  return campaigns.find(c => {
    const target = (c.category_target || '').toLowerCase();
    return target === matchCategory;
  }) || null;
}

function tryWildcardMatch(campaigns: Campaign[]): Campaign | null {
  return campaigns.find(c => {
    const target = (c.category_target || '').toLowerCase();
    return target === '' || target === 'general' || target === 'null';
  }) || null;
}

// ─── Active campaigns with cache and PB-level filtering ─────────────────────

async function getActiveCampaigns(zone: string): Promise<Campaign[]> {
  const cacheKey = `campaigns:${zone}`;
  const cached = cacheGet<Campaign[]>(cacheKey);
  if (cached) return cached;

  try {
    const zoneFilter = zoneFilterVariants(zone);
    const now = todayIso();

    // Filter active + zone + schedule at PocketBase level
    const filter = `active=true&&(${zoneFilter})`;
    const items = await pbQuery('monetization_campaigns', filter);

    // Post-filter dates in JS (PocketBase date comparison is brittle across formats)
    const campaigns = (items as unknown as Campaign[]).filter((c) => {
      if (c.start_date && c.start_date > now) return false;
      if (c.end_date && c.end_date < now) return false;
      return true;
    });

    cacheSet(cacheKey, campaigns);
    return campaigns;
  } catch (err: any) {
    console.error('[monetization] getActiveCampaigns failed for zone', zone, err?.message);
    return [];
  }
}

// ─── Content resolvers ──────────────────────────────────────────────────────

async function resolveCampaignContent(campaign: Campaign): Promise<ResolvedSlot | null> {
  const base = { campaignId: campaign.id, ad_width: campaign.ad_width, ad_height: campaign.ad_height };
  const type = campaign.campaign_type;
  const refId = campaign.reference_id;

  try {
    switch (type) {
      case 'affiliate_image':
      case 'affiliate_html':
      case 'affiliate_text': {
        const content = await resolveAffiliateContent(refId);
        if (!content) {
          await recordContentFailure(campaign);
          return null;
        }
        clearFailureCount(campaign.id);
        return { ...base, type, content };
      }

      case 'adsense_manual': {
        const content = await resolveAdSenseContent(refId);
        if (!content) {
          await recordContentFailure(campaign);
          return null;
        }
        clearFailureCount(campaign.id);
        return { ...base, type, content };
      }

      case 'house_ad': {
        const content = await resolveHouseAdContent(refId);
        if (!content) {
          await recordContentFailure(campaign);
          return null;
        }
        clearFailureCount(campaign.id);
        return { ...base, type, content };
      }

      case 'sponsored_job': {
        const content = await resolveSponsoredJobContent(refId);
        if (!content) {
          await recordContentFailure(campaign);
          return null;
        }
        clearFailureCount(campaign.id);
        return { ...base, type, content };
      }

      case 'sponsored_employer': {
        const content = await resolveSponsoredEmployerContent(refId);
        if (!content) {
          await recordContentFailure(campaign);
          return null;
        }
        clearFailureCount(campaign.id);
        return { ...base, type, content };
      }

      default:
        return null;
    }
  } catch {
    await recordContentFailure(campaign);
    return null;
  }
}

async function resolveAffiliateContent(linkId: string): Promise<AffiliateContent | null> {
  try {
    const cacheKey = `affiliate:${linkId}`;
    const cached = cacheGet<AffiliateContent>(cacheKey);
    if (cached) return cached;

    const record = await pbFetchOne('affiliate_links', linkId);
    if (!record) return null;

    const l = record as any;
    let display: 'text' | 'image' | 'html' = (l.display_type as any) || 'text';
    if (!['text', 'image', 'html'].includes(display)) display = 'text';

    let bannerFileUrl = '';
    if (l.banner_file && l.id && l.collectionId) {
      const filename = Array.isArray(l.banner_file) ? l.banner_file[0] : l.banner_file;
      if (filename) {
        bannerFileUrl = `${PB_FILE_BASE}/files/${l.collectionId}/${l.id}/${filename}`;
      }
    }

    const result: AffiliateContent = {
      id: l.id,
      name: l.name,
      description: l.description,
      url: l.url,
      display_type: display,
      banner_html: l.banner_html,
      image_url: l.image_url,
      banner_file: l.banner_file,
      banner_width: l.banner_width,
      banner_height: l.banner_height,
      bannerFileUrl,
      collectionId: l.collectionId,
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

async function resolveAdSenseContent(slotKey: string): Promise<AdSenseContent | null> {
  const cacheKey = `adsense:${slotKey}`;
  const cached = cacheGet<AdSenseContent>(cacheKey);
  if (cached) return cached;

  try {
    const settings = await getAdminSettings([
      'adsense_enabled',
      'adsense_publisher_id',
      `adsense_slot_${slotKey}`,
    ]).catch(() => ({} as Record<string, string>));

    const enabled = settings.adsense_enabled === 'true';
    const publisherId = (settings.adsense_publisher_id || '').trim();
    const slotId = (settings[`adsense_slot_${slotKey}`] || '').trim();

    if (!enabled || !publisherId || !slotId) return null;

    const formatMap: Record<string, 'horizontal' | 'rectangle' | 'fluid'> = {
      strip: 'horizontal',
      sidebar: 'rectangle',
      infeed: 'fluid',
      'jobs-top': 'horizontal',
      'homepage-hero': 'horizontal',
      all: 'horizontal',
    };

    const result: AdSenseContent = {
      publisher_id: publisherId,
      slot_id: slotId,
      format: formatMap[slotKey] || 'horizontal',
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

async function resolveHouseAdContent(adId: string): Promise<HouseAdContent | null> {
  const cacheKey = `housead:${adId}`;
  const cached = cacheGet<HouseAdContent>(cacheKey);
  if (cached) return cached;

  try {
    const pb = getPB();
    const record = await pb.collection('house_ads').getOne(adId);
    if (!record || !(record as any).active) return null;

    const ad = record as any;
    let imageUrl = '';
    if (ad.image_file && ad.id && ad.collectionId) {
      const filename = Array.isArray(ad.image_file) ? ad.image_file[0] : ad.image_file;
      if (filename) {
        imageUrl = `${PB_FILE_BASE}/files/${ad.collectionId}/${ad.id}/${filename}`;
      }
    }

    const result: HouseAdContent = {
      id: ad.id,
      title: ad.title,
      description: ad.description || '',
      cta_text: ad.cta_text || 'Learn more',
      image_url: imageUrl,
      link_url: ad.link_url,
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

async function resolveSponsoredJobContent(jobId: string): Promise<SponsoredJobContent | null> {
  const cacheKey = `spjob:${jobId}`;
  const cached = cacheGet<SponsoredJobContent>(cacheKey);
  if (cached) return cached;

  try {
    const pb = getPB();
    const today = todayIso();
    const record = await pb.collection('jobs').getOne(jobId);
    if (!record) return null;

    const job = record as any;
    if (!job.active || (job.expires && job.expires < today)) return null;

    const result: SponsoredJobContent = {
      id: job.id,
      title: job.title,
      company: job.company,
      slug: job.slug,
      city: job.city,
      province: job.province,
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

async function resolveSponsoredEmployerContent(employerId: string): Promise<SponsoredEmployerContent | null> {
  const cacheKey = `spemp:${employerId}`;
  const cached = cacheGet<SponsoredEmployerContent>(cacheKey);
  if (cached) return cached;

  try {
    const pb = getPB();
    const record = await pb.collection('employers').getOne(employerId);
    if (!record) return null;

    const emp = record as any;
    const result: SponsoredEmployerContent = {
      id: emp.id,
      company_name: emp.company_name,
      company_slug: emp.company_slug,
      logo: emp.logo,
      description: emp.description,
    };
    cacheSet(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

// ─── Campaign CRUD (admin, no cache) ────────────────────────────────────────

export async function listCampaigns(): Promise<Campaign[]> {
  try {
    const pb = getPB();
    const result = await pb.collection('monetization_campaigns').getFullList({
      sort: 'priority,-created',
    });
    return result as unknown as Campaign[];
  } catch {
    return [];
  }
}

export async function createCampaign(data: {
  name: string;
  campaign_type: CampaignType;
  zone: MonetizationZone;
  priority?: number;
  active?: boolean;
  start_date?: string;
  end_date?: string;
  category_target?: string;
  reference_id: string;
  ad_width?: number;
  ad_height?: number;
}): Promise<Campaign | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('monetization_campaigns').create({
      ...data,
      priority: data.priority ?? 80,
      active: data.active ?? true,
      impressions: 0,
      clicks: 0,
    });
    cacheClear('campaigns:');
    return record as unknown as Campaign;
  } catch {
    return null;
  }
}

export async function updateCampaign(
  id: string,
  data: Partial<{
    name: string;
    campaign_type: CampaignType;
    zone: MonetizationZone;
    priority: number;
    active: boolean;
    start_date: string;
    end_date: string;
    category_target: string;
    reference_id: string;
  }>,
): Promise<Campaign | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('monetization_campaigns').update(id, data);
    cacheClear('campaigns:');
    return record as unknown as Campaign;
  } catch {
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const pb = await getAdminPB();
    await pb.collection('monetization_campaigns').delete(id);
    cacheClear('campaigns:');
    return true;
  } catch {
    return false;
  }
}

export async function toggleCampaign(id: string): Promise<Campaign | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('monetization_campaigns').getOne(id) as any;
    const updated = await pb.collection('monetization_campaigns').update(id, {
      active: !record.active,
    });
    cacheClear('campaigns:');
    return updated as unknown as Campaign;
  } catch {
    return null;
  }
}

// ─── House Ad CRUD ──────────────────────────────────────────────────────────

export async function listHouseAds(): Promise<HouseAdContent[]> {
  try {
    const pb = await getAdminPB();
    const result = await pb.collection('house_ads').getFullList({ sort: '-created' });
    return result.map((r: any) => ({
      id: r.id, title: r.title, description: r.description || '',
      cta_text: r.cta_text || 'Learn more', image_url: '', link_url: r.link_url,
    }));
  } catch { return []; }
}

export async function createHouseAd(data: {
  title: string; description?: string; cta_text?: string; link_url: string;
}): Promise<HouseAdContent | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('house_ads').create({ ...data, active: true });
    return { id: record.id, title: (record as any).title, description: (record as any).description || '', cta_text: (record as any).cta_text || 'Learn more', image_url: '', link_url: (record as any).link_url };
  } catch { return null; }
}

export async function deleteHouseAd(id: string): Promise<boolean> {
  try {
    const pb = await getAdminPB();
    await pb.collection('house_ads').delete(id);
    return true;
  } catch { return false; }
}

// ─── Click Tracking ──────────────────────────────────────────────────────────

export async function trackCampaignClick(campaignId: string, linkId?: string): Promise<void> {
  try {
    const pb = await getAdminPB();
    await pb.collection('monetization_campaigns').update(campaignId, { 'clicks+': 1 });
    if (linkId) {
      await pb.collection('affiliate_links').update(linkId, { 'clicks+': 1 });
    }
    cacheClear('campaigns:');
  } catch {}
}

export async function trackCampaignImpression(campaignId: string): Promise<void> {
  try {
    const pb = await getAdminPB();
    await pb.collection('monetization_campaigns').update(campaignId, { 'impressions+': 1 });
  } catch {}
}

// ─── Seed Migration ─────────────────────────────────────────────────────────

export async function seedCampaignsFromAffiliates(): Promise<{ created: number; skipped: number; total: number }> {
  let created = 0, skipped = 0;
  try {
    const pb = await getAdminPB();
    const [existingLinks, existingCampaigns] = await Promise.all([
      pb.collection('affiliate_links').getFullList().catch(() => [] as any[]),
      pb.collection('monetization_campaigns').getFullList({ fields: 'reference_id,campaign_type' }).catch(() => [] as any[]),
    ]);
    const campaignRefs = new Set((existingCampaigns as any[]).map((c: any) => `${c.reference_id}|${c.campaign_type}`));
    for (const link of existingLinks as any[]) {
      const displayType = link.display_type || 'text';
      const campaignType = `affiliate_${['text', 'image', 'html'].includes(displayType) ? displayType : 'text'}`;
      if (campaignRefs.has(`${link.id}|${campaignType}`)) { skipped++; continue; }
      await pb.collection('monetization_campaigns').create({
        name: link.name || 'Affiliate Link', campaign_type: campaignType,
        zone: link.zone || 'all', priority: 80, active: link.active ?? true,
        category_target: link.category || '', reference_id: link.id,
        impressions: 0, clicks: link.clicks || 0,
      });
      created++;
    }
    cacheClear('campaigns:');
    return { created, skipped, total: (existingLinks as any[]).length };
  } catch { return { created, skipped, total: 0 }; }
}
