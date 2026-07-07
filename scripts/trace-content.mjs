import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

// 1. Get active campaigns
const camps = await pb.collection('monetization_campaigns').getFullList({
  filter: 'active=true',
});
console.log('Active campaigns:', camps.length);

// 2. For each campaign, try to resolve its affiliate link
let failures = 0;
for (const c of camps) {
  const refId = c.reference_id;
  console.log(`\nCampaign: ${c.name} (${c.campaign_type}) -> ref=${refId}`);
  
  // Check if affiliate link exists and is active
  try {
    const link = await pb.collection('affiliate_links').getOne(refId);
    console.log(`  Affiliate link: ${link.name} active=${link.active} display=${link.display_type} zone=${link.zone}`);
    
    if (link.active === false) {
      console.log('  FAIL: link is inactive');
      failures++;
    }
    // Check display type
    if (c.campaign_type === 'affiliate_image' && link.display_type !== 'image') {
      console.log('  WARNING: campaign type is affiliate_image but link display is', link.display_type);
    }
    if (!link.url) console.log('  FAIL: no URL');
    if (link.display_type === 'image' && !link.banner_file && !link.image_url) {
      console.log('  FAIL: image type but no banner_file or image_url');
      failures++;
    }
  } catch(e) {
    console.log(`  FAIL: affiliate link ${refId} not found - ${e.message?.slice(0,100)}`);
    failures++;
  }
}
console.log(`\nTotal failures: ${failures}/${camps.length}`);
