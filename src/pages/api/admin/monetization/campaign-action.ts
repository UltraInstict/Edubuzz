/**
 * Admin API — Monetization Campaign CRUD
 *
 * POST /api/admin/monetization/campaign-action
 *
 * Actions: create, update, toggle, delete, seed (migrate affiliate links)
 */
import { requireAdmin, auditLog } from '../../../../lib/auth';
import { ok, fail } from '../../../../lib/api';
import {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaign,
  seedCampaignsFromAffiliates,
  createHouseAd,
  deleteHouseAd,
} from '../../../../services/monetizationService';
import type { CampaignType, MonetizationZone } from '../../../../services/monetizationService';

const VALID_CAMPAIGN_TYPES: CampaignType[] = [
  'affiliate_image', 'affiliate_html', 'affiliate_text',
  'adsense_manual', 'house_ad', 'sponsored_job', 'sponsored_employer',
];

const VALID_ZONES: MonetizationZone[] = [
  'strip', 'sidebar', 'infeed', 'jobs-top', 'homepage-hero', 'all',
];

export const POST: Astro.APIRoute = async ({ request }) => {
  const { redirect } = await requireAdmin(request);
  if (redirect) return redirect;

  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(fd.entries());
    }

    const action = String(body.action || '');

    switch (action) {
      case 'create': {
        const campaign_type = String(body.campaign_type || '');
        const zone = String(body.zone || '');
        const name = String(body.name || '');

        if (!name) return fail('Campaign name is required.');
        if (!VALID_CAMPAIGN_TYPES.includes(campaign_type as CampaignType)) {
          return fail(`Invalid campaign type: ${campaign_type}`);
        }
        if (!VALID_ZONES.includes(zone as MonetizationZone)) {
          return fail(`Invalid zone: ${zone}`);
        }

        const campaign = await createCampaign({
          name,
          campaign_type: campaign_type as CampaignType,
          zone: zone as MonetizationZone,
          priority: Number(body.priority) || 80,
          active: body.active !== 'false',
          start_date: body.start_date || undefined,
          end_date: body.end_date || undefined,
          category_target: body.category_target || '',
          reference_id: String(body.reference_id || ''),
        });

        if (!campaign) return fail('Failed to create campaign.');
        auditLog('monetization_campaign_created', { campaignId: campaign.id, name, type: campaign_type });
        return ok({ campaign });
      }

      case 'update': {
        const id = String(body.id || '');
        if (!id) return fail('Campaign ID is required.');

        const updates: Record<string, any> = {};
        if (body.name !== undefined) updates.name = String(body.name);
        if (body.campaign_type !== undefined) {
          if (!VALID_CAMPAIGN_TYPES.includes(body.campaign_type)) return fail('Invalid campaign type.');
          updates.campaign_type = body.campaign_type;
        }
        if (body.zone !== undefined) {
          if (!VALID_ZONES.includes(body.zone)) return fail('Invalid zone.');
          updates.zone = body.zone;
        }
        if (body.priority !== undefined) updates.priority = Number(body.priority);
        if (body.active !== undefined) updates.active = body.active !== 'false';
        if (body.start_date !== undefined) updates.start_date = body.start_date || null;
        if (body.end_date !== undefined) updates.end_date = body.end_date || null;
        if (body.category_target !== undefined) updates.category_target = String(body.category_target);
        if (body.reference_id !== undefined) updates.reference_id = String(body.reference_id);

        const campaign = await updateCampaign(id, updates);
        if (!campaign) return fail('Failed to update campaign.');
        auditLog('monetization_campaign_updated', { campaignId: id });
        return ok({ campaign });
      }

      case 'toggle': {
        const id = String(body.id || '');
        if (!id) return fail('Campaign ID is required.');
        const campaign = await toggleCampaign(id);
        if (!campaign) return fail('Failed to toggle campaign.');
        auditLog('monetization_campaign_toggled', { campaignId: id });
        return ok({ campaign });
      }

      case 'delete': {
        const id = String(body.id || '');
        if (!id) return fail('Campaign ID is required.');
        const success = await deleteCampaign(id);
        if (!success) return fail('Failed to delete campaign.');
        auditLog('monetization_campaign_deleted', { campaignId: id });
        return ok({ deleted: true });
      }

      case 'seed': {
        const result = await seedCampaignsFromAffiliates();
        auditLog('monetization_seed_completed', result as any);
        return ok(result);
      }

      case 'create_house': {
        const title = String(body.title || '');
        if (!title) return fail('House ad title is required.');
        const ad = await createHouseAd({
          title,
          description: String(body.description || ''),
          cta_text: String(body.cta_text || ''),
          link_url: String(body.link_url || ''),
        });
        if (!ad) return fail('Failed to create house ad.');
        auditLog('house_ad_created', { id: ad.id, title });
        return ok({ houseAd: ad });
      }

      case 'delete_house': {
        const id = String(body.id || '');
        if (!id) return fail('House ad ID is required.');
        const success = await deleteHouseAd(id);
        if (!success) return fail('Failed to delete house ad.');
        auditLog('house_ad_deleted', { id });
        return ok({ deleted: true });
      }

      default:
        return fail(`Unknown action: ${action}`);
    }
  } catch (err: any) {
    console.error('[campaign-action] Error:', err?.message || err);
    return fail(err?.message || 'Internal server error');
  }
};
