import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

// Get all campaigns with no filter
const all = await pb.collection('monetization_campaigns').getFullList();
console.log('All campaigns:', all.length);
for (const c of all) {
  console.log('  id='+c.id.slice(0,8), 'zone=['+c.zone+']', 'active='+c.active, 'name='+c.name, 'type='+c.campaign_type, 'ref='+c.reference_id?.slice(0,8));
}

// Try simple filter
for (const filter of [
  'active=true',
  'zone="sidebar"',
  'zone="Sidebar"',
  'zone="all"',
  'active=true&&zone="sidebar"',
  'active=true&&(zone="sidebar"||zone="all")',
]) {
  try {
    const r = await pb.collection('monetization_campaigns').getFullList({filter});
    console.log(`\nOK filter="${filter}" -> ${r.length} results`);
    for (const c of r) console.log('  zone=['+c.zone+'] name='+c.name);
  } catch (e) {
    console.log(`\nFAIL filter="${filter}" -> ${e.message.slice(0,100)}`);
  }
}

console.log('\nDone.');
