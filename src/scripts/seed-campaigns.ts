/**
 * Seed monetization_campaigns from existing affiliate_links.
 *
 * One-time idempotent migration. Run after creating the monetization_campaigns
 * PocketBase collection. Each affiliate_links record gets a campaign wrapper
 * with campaign_type = affiliate_{display_type}, priority = 80.
 *
 * Existing affiliate_links data is NOT modified.
 *
 * Usage:
 *   npx tsx src/scripts/seed-campaigns.ts
 *
 * Or triggered from admin UI via POST /api/admin/monetization/seed-campaigns
 */

import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

async function main() {
  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    console.error('❌ PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  console.log('✅ Authenticated to PocketBase');

  // Fetch existing affiliate links
  const affiliateLinks = await pb.collection('affiliate_links').getFullList().catch(() => []);
  console.log(`Found ${affiliateLinks.length} affiliate links`);

  // Fetch existing campaigns to avoid duplicates
  const existingCampaigns = await pb.collection('monetization_campaigns').getFullList({
    fields: 'reference_id,campaign_type',
  }).catch(() => []);
  const campaignRefs = new Set(
    existingCampaigns.map((c: any) => `${c.reference_id}|${c.campaign_type}`),
  );

  let created = 0;
  let skipped = 0;

  for (const link of affiliateLinks) {
    const l = link as any;
    const displayType = l.display_type || 'text';
    const validType = ['text', 'image', 'html'].includes(displayType) ? displayType : 'text';
    const campaignType = `affiliate_${validType}`;

    const existingKey = `${l.id}|${campaignType}`;
    if (campaignRefs.has(existingKey)) {
      skipped++;
      continue;
    }

    await pb.collection('monetization_campaigns').create({
      name: l.name || 'Affiliate Link',
      campaign_type: campaignType,
      zone: l.zone || 'all',
      priority: 80,
      active: l.active ?? true,
      category_target: l.category || '',
      reference_id: l.id,
      impressions: 0,
      clicks: l.clicks || 0,
    });

    created++;
  }

  console.log(`✅ Done: ${created} created, ${skipped} skipped (already exist), ${affiliateLinks.length} total affiliate links`);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
