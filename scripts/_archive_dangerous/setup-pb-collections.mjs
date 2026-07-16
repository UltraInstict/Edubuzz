import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const pb = new PocketBase('http://127.0.0.1:8090');
const email = process.env.PB_ADMIN_EMAIL;
const pass = process.env.PB_ADMIN_PASSWORD;

await pb.collection('_superusers').authWithPassword(email, pass);
console.log('Auth OK');

const cols = await pb.collections.getFullList();
const names = cols.map(c => c.name);
console.log('Existing:', names.join(', '));

if (!names.includes('monetization_campaigns')) {
  await pb.collections.create({
    name: 'monetization_campaigns',
    type: 'base',
    schema: [
      {name:'name',type:'text',required:true},
      {name:'campaign_type',type:'select',required:true,options:{values:['affiliate_image','affiliate_html','affiliate_text','adsense_manual','house_ad','sponsored_job','sponsored_employer']}},
      {name:'zone',type:'select',required:true,options:{values:['strip','sidebar','infeed','jobs-top','homepage-hero','all']}},
      {name:'priority',type:'number',required:true,options:{min:0,max:200}},
      {name:'active',type:'bool',required:true},
      {name:'start_date',type:'date',required:false},
      {name:'end_date',type:'date',required:false},
      {name:'category_target',type:'text',required:false},
      {name:'reference_id',type:'text',required:true},
      {name:'impressions',type:'number',required:false},
      {name:'clicks',type:'number',required:false},
    ]
  });
  console.log('Created monetization_campaigns');
} else {
  console.log('monetization_campaigns already exists');
}

if (!names.includes('house_ads')) {
  await pb.collections.create({
    name: 'house_ads',
    type: 'base',
    schema: [
      {name:'title',type:'text',required:true},
      {name:'description',type:'text',required:false},
      {name:'cta_text',type:'text',required:false},
      {name:'image_file',type:'file',required:false,options:{maxSelect:1,maxSize:5242880}},
      {name:'link_url',type:'text',required:true},
      {name:'active',type:'bool',required:true},
    ]
  });
  console.log('Created house_ads');
} else {
  console.log('house_ads already exists');
}

// Seed campaigns from affiliate links
if (names.includes('affiliate_links')) {
  const links = await pb.collection('affiliate_links').getFullList().catch(() => []);
  console.log(`Found ${links.length} affiliate links`);

  const campaigns = await pb.collection('monetization_campaigns').getFullList().catch(() => []);
  const existingRefs = new Set(campaigns.map(c => `${c.reference_id}|${c.campaign_type}`));

  let created = 0;
  for (const link of links) {
    const displayType = link.display_type || 'text';
    const validType = ['text','image','html'].includes(displayType) ? displayType : 'text';
    const campaignType = `affiliate_${validType}`;

    if (existingRefs.has(`${link.id}|${campaignType}`)) continue;

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
  console.log(`Seeded ${created} campaigns from ${links.length} affiliate links`);
}

console.log('Done');
