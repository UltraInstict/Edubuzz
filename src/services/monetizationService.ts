/**
 * Monetization Engine — unified campaign resolution layer.
 *
 * All monetization decisions flow through this module. Pages call
 * resolveSlot() and receive a renderable result. The engine handles
 * campaign priority, zone matching, scheduling, category targeting,
 * and content resolution from existing collections (affiliate_links,
 * jobs, employers, admin_settings).
 *
 * Existing PocketBase collections (affiliate_links, affiliate_clicks,
 * admin_settings) remain unchanged. monetization_campaigns is the
 * orchestration layer — a thin wrapper with priority, scheduling,
 * and zone metadata. Content stays in source collections.
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

/** Direct HTTP fetch to PocketBase REST API — bypasses SDK entirely for SSR reliability. */
async function pbFetch(collection: string, opts?: { filter?: string; sort?: string }): Promise<any[]> {
  const params = new URLSearchParams();
  params.set('perPage', '500');
  // Drop sort — PB 400s on sort=priority,+created. We filter in JS anyway.
  let urlStr = `${PB_URL}/api/collections/${collection}/records?${params.toString()}`;
  const res = await fetch(urlStr);
  if (!res.ok) throw new Error(`PB ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.items || [];
}

/** Get a single record by ID. */
async function pbFetchOne(collection: string, id: string): Promise<any | null> {
  const url = `${PB_URL}/api/collections/${collection}/records/${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/** Plain client for admin writes (CRUD, seed). */
function getPB(): PocketBase {
  return new PocketBase(PB_URL);
}

// ─── Types ────────────────────────────────────────────────────────────────

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
}

export interface SlotContext {
  category?: string;
  jobId?: string;
}

// ─── Zone Expansion ───────────────────────────────────────────────────────

function expandZoneVariants(zone: string): string[] {
  const lower = zone.toLowerCase().trim();
  const map: Record<string, string[]> = {
    'sidebar':      ['sidebar', 'Sidebar'],
    'strip':        ['strip', 'Strip'],
    'infeed':       ['infeed', 'In-feed'],
    'jobs-top':     ['jobs-top', 'jobs_top', 'Jobs Page Top', 'Jobs-Top', 'jobsTop'],
    'homepage-hero':['homepage-hero', 'homepage_hero', 'Homepage Hero'],
  };
  const variants = map[lower] || [zone];
  return Array.from(new Set([...variants, 'all', 'All', 'ALL']));
}

// ─── Date Helpers ─────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function esc(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ─── Campaign Resolution ──────────────────────────────────────────────────

/**
 * Resolve which campaign (if any) should render in a given zone.
 *
 * 1. Fetches active campaigns for the zone, ordered by priority.
 * 2. Tries contextual category match first, then wildcard, then fallback.
 * 3. Resolves the campaign's reference_id to actual content from source collection.
 * 4. Returns null if nothing matches.
 */
export async function resolveSlot(
  zone: string,
  context?: SlotContext,
): Promise<ResolvedSlot> {
  const campaigns = await getActiveCampaigns(zone);

  if (campaigns.length === 0) {
    return { type: 'empty', content: null };
  }

  const category = context?.category;
  const matchCategory = category ? getCategoryForAffiliate(category) : undefined;

  // Step 1: Try exact category match
  if (matchCategory && matchCategory !== 'general') {
    for (const campaign of campaigns) {
      const target = (campaign.category_target || '').toLowerCase();
      if (target === matchCategory) {
        const resolved = await resolveCampaignContent(campaign);
        if (resolved) return resolved;
      }
    }
  }

  // Step 2: Try wildcard category (general, empty, null)
  for (const campaign of campaigns) {
    const target = (campaign.category_target || '').toLowerCase();
    if (target === '' || target === 'general' || target === 'null') {
      const resolved = await resolveCampaignContent(campaign);
      if (resolved) return resolved;
    }
  }

  // Step 3: Try any remaining campaign in priority order
  for (const campaign of campaigns) {
    const resolved = await resolveCampaignContent(campaign);
    if (resolved) return resolved;
  }

  return { type: 'empty', content: null };
}

async function getActiveCampaigns(zone: string): Promise<Campaign[]> {
  const variants = expandZoneVariants(zone);

  try {
    const result = await pbFetch('monetization_campaigns', {
      sort: 'priority,+created',
    });
    // Filter by active status, zone, and schedule in JS
    const now = todayIso();
    const filtered = (result as unknown as Campaign[]).filter((c) => {
      if (!c.active) return false;
      if (!variants.includes(c.zone)) return false;
      if (c.start_date && c.start_date > now) return false;
      if (c.end_date && c.end_date < now) return false;
      return true;
    });
    return filtered;
  } catch (err: any) {
    console.error('[monetization] getActiveCampaigns failed for zone', zone);
    console.error('[monetization] status:', err?.status);
    console.error('[monetization] message:', err?.message);
    console.error('[monetization] data:', JSON.stringify(err?.data || {}));
    console.error('[monetization] response:', JSON.stringify(err?.response || {}));
    return [];
  }
}

async function resolveCampaignContent(campaign: Campaign): Promise<ResolvedSlot | null> {
  const type = campaign.campaign_type;
  const refId = campaign.reference_id;

  try {
    switch (type) {
      case 'affiliate_image':
      case 'affiliate_html':
      case 'affiliate_text': {
        const content = await resolveAffiliateContent(refId);
        if (!content) return null;
        return { type, campaignId: campaign.id, content };
      }

      case 'adsense_manual': {
        const content = await resolveAdSenseContent(refId);
        if (!content) return null;
        return { type, campaignId: campaign.id, content };
      }

      case 'house_ad': {
        const content = await resolveHouseAdContent(refId);
        if (!content) return null;
        return { type, campaignId: campaign.id, content };
      }

      case 'sponsored_job': {
        const content = await resolveSponsoredJobContent(refId);
        if (!content) return null;
        return { type, campaignId: campaign.id, content };
      }

      case 'sponsored_employer': {
        const content = await resolveSponsoredEmployerContent(refId);
        if (!content) return null;
        return { type, campaignId: campaign.id, content };
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ─── Content Resolvers ────────────────────────────────────────────────────

async function resolveAffiliateContent(linkId: string): Promise<AffiliateContent | null> {
  try {
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

    return {
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
  } catch {
    return null;
  }
}

async function resolveAdSenseContent(slotKey: string): Promise<AdSenseContent | null> {
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

    return {
      publisher_id: publisherId,
      slot_id: slotId,
      format: formatMap[slotKey] || 'horizontal',
    };
  } catch {
    return null;
  }
}

async function resolveHouseAdContent(adId: string): Promise<HouseAdContent | null> {
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

    return {
      id: ad.id,
      title: ad.title,
      description: ad.description || '',
      cta_text: ad.cta_text || 'Learn more',
      image_url: imageUrl,
      link_url: ad.link_url,
    };
  } catch {
    return null;
  }
}

async function resolveSponsoredJobContent(jobId: string): Promise<SponsoredJobContent | null> {
  try {
    const pb = getPB();
    const today = todayIso();
    const record = await pb.collection('jobs').getOne(jobId);
    if (!record) return null;

    const job = record as any;
    if (!job.active || (job.expires && job.expires < today)) return null;

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      slug: job.slug,
      city: job.city,
      province: job.province,
    };
  } catch {
    return null;
  }
}

async function resolveSponsoredEmployerContent(employerId: string): Promise<SponsoredEmployerContent | null> {
  try {
    const pb = getPB();
    const record = await pb.collection('employers').getOne(employerId);
    if (!record) return null;

    const emp = record as any;
    return {
      id: emp.id,
      company_name: emp.company_name,
      company_slug: emp.company_slug,
      logo: emp.logo,
      description: emp.description,
    };
  } catch {
    return null;
  }
}

// ─── Campaign CRUD ────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<Campaign[]> {
  try {
    const pb = getPB();
    const result = await pb.collection('monetization_campaigns').getFullList({
      sort: 'priority,zone,-created',
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
    return record as unknown as Campaign;
  } catch {
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const pb = await getAdminPB();
    await pb.collection('monetization_campaigns').delete(id);
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
    return updated as unknown as Campaign;
  } catch {
    return null;
  }
}

// ─── House Ad CRUD ────────────────────────────────────────────────────────

export async function listHouseAds(): Promise<HouseAdContent[]> {
  try {
    const pb = await getAdminPB();
    const result = await pb.collection('house_ads').getFullList({
      sort: '-created',
    });
    return result.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      cta_text: r.cta_text || 'Learn more',
      image_url: '',
      link_url: r.link_url,
    }));
  } catch {
    return [];
  }
}

export async function createHouseAd(data: {
  title: string;
  description?: string;
  cta_text?: string;
  link_url: string;
}): Promise<HouseAdContent | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('house_ads').create({
      ...data,
      active: true,
    });
    return {
      id: record.id,
      title: (record as any).title,
      description: (record as any).description || '',
      cta_text: (record as any).cta_text || 'Learn more',
      image_url: '',
      link_url: (record as any).link_url,
    };
  } catch {
    return null;
  }
}

export async function updateHouseAd(
  id: string,
  data: Partial<{ title: string; description: string; cta_text: string; link_url: string; active: boolean }>,
): Promise<HouseAdContent | null> {
  try {
    const pb = await getAdminPB();
    const record = await pb.collection('house_ads').update(id, data);
    return {
      id: record.id,
      title: (record as any).title,
      description: (record as any).description || '',
      cta_text: (record as any).cta_text || 'Learn more',
      image_url: '',
      link_url: (record as any).link_url,
    };
  } catch {
    return null;
  }
}

export async function deleteHouseAd(id: string): Promise<boolean> {
  try {
    const pb = await getAdminPB();
    await pb.collection('house_ads').delete(id);
    return true;
  } catch {
    return false;
  }
}

// ─── Click Tracking ───────────────────────────────────────────────────────

export async function trackCampaignClick(campaignId: string, linkId?: string): Promise<void> {
  try {
    const pb = await getAdminPB();
    await pb.collection('monetization_campaigns').update(campaignId, {
      'clicks+': 1,
    });
    if (linkId) {
      await pb.collection('affiliate_links').update(linkId, {
        'clicks+': 1,
      });
    }
  } catch {}
}

// ─── Seed Migration ───────────────────────────────────────────────────────

export async function seedCampaignsFromAffiliates(): Promise<{ created: number; skipped: number; total: number }> {
  let created = 0;
  let skipped = 0;

  try {
    const pb = await getAdminPB();

    const [existingLinks, existingCampaigns] = await Promise.all([
      pb.collection('affiliate_links').getFullList().catch(() => [] as any[]),
      pb.collection('monetization_campaigns').getFullList({
        fields: 'reference_id,campaign_type',
      }).catch(() => [] as any[]),
    ]);

    const campaignRefs = new Set(
      (existingCampaigns as any[]).map((c) => `${c.reference_id}|${c.campaign_type}`),
    );

    for (const link of existingLinks as any[]) {
      const displayType = link.display_type || 'text';
      const campaignType = `affiliate_${['text', 'image', 'html'].includes(displayType) ? displayType : 'text'}`;

      const existingKey = `${link.id}|${campaignType}`;
      if (campaignRefs.has(existingKey)) {
        skipped++;
        continue;
      }

      await pb.collection('monetization_campaigns').create({
        name: link.name || 'Affiliate Link',
        campaign_type: campaignType,
        zone: link.zone || 'all',
        priority: 80,
        active: link.active ?? true,
        category_target: link.category || '',
        reference_id: link.id,
        impressions: 0,
        clicks: link.clicks || 0,
      });

      created++;
    }

    return { created, skipped, total: (existingLinks as any[]).length };
  } catch {
    return { created, skipped, total: 0 };
  }
}
