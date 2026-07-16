import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

// 1. Delete the broken collection (all records are empty anyway)
try {
  await pb.collections.delete('pbc_2946816249');
  console.log('Deleted broken monetization_campaigns');
} catch (e) {
  console.log('Delete failed (may not exist):', e.message.slice(0,80));
}

// 2. Recreate with proper fields
try {
  await pb.collections.create({
    name: 'monetization_campaigns',
    type: 'base',
    fields: [
      {type:'text',name:'name',required:true},
      {type:'text',name:'campaign_type',required:true},
      {type:'text',name:'zone',required:true},
      {type:'number',name:'priority',required:false},
      {type:'bool',name:'active',required:false},
      {type:'text',name:'reference_id',required:true},
      {type:'text',name:'category_target',required:false},
      {type:'text',name:'start_date',required:false},
      {type:'text',name:'end_date',required:false},
      {type:'number',name:'impressions',required:false},
      {type:'number',name:'clicks',required:false},
    ]
  });
  console.log('Created monetization_campaigns with proper fields');
} catch (e) {
  console.log('Create failed:', e.message.slice(0,120));
}

// 3. Find the new collection ID
const cols = await pb.collections.getFullList();
const mc = cols.find(c => c.name === 'monetization_campaigns');
console.log('New collection ID:', mc ? mc.id : 'NOT FOUND');

// 4. Seed from affiliate links
if (mc) {
  const affs = await pb.collection('affiliate_links').getFullList();
  console.log('Seeding from', affs.length, 'affiliate links');
  let created = 0;
  for (const a of affs) {
    if (!a.active) continue; // only seed active ones
    await pb.collection('monetization_campaigns').create({
      name: a.name || 'Affiliate Link',
      campaign_type: 'affiliate_' + (a.display_type || 'text'),
      zone: a.zone || 'all',
      priority: 80,
      active: true,
      reference_id: a.id,
      category_target: a.category || '',
      impressions: 0,
      clicks: a.clicks || 0,
    });
    created++;
  }
  console.log('Seeded', created, 'active campaigns');
}

// 5. Verify
const camps = await pb.collection('monetization_campaigns').getFullList().catch(() => []);
console.log('Campaigns after seed:', camps.length);
for (const c of camps.slice(0, 5)) {
  console.log('  ', c.id.slice(0,8), 'type='+c.campaign_type, 'zone='+c.zone, 'active='+c.active, 'name='+(c.name||'?').slice(0,25));
}

console.log('\nDone.');
