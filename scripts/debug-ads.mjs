import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

console.log('=== MONETIZATION CAMPAIGNS ===');
const camps = await pb.collection('monetization_campaigns').getFullList().catch(() => []);
console.log('Count:', camps.length);
for (const c of camps) {
  console.log(c.id.slice(0,8), 'type='+c.campaign_type, 'zone='+c.zone, 'active='+c.active, 'ref='+(c.reference_id||'').slice(0,8), 'name='+(c.name||'').slice(0,40));
}

console.log('\n=== AFFILIATE LINKS ===');
const affs = await pb.collection('affiliate_links').getFullList().catch(() => []);
console.log('Count:', affs.length);
for (const a of affs) {
  console.log(a.id.slice(0,8), 'zone='+a.zone, 'active='+a.active, 'display='+a.display_type, 'name='+(a.name||'').slice(0,40));
}

console.log('\n=== ADMIN SETTINGS ===');
const settings = await pb.collection('admin_settings').getFullList().catch(() => []);
const importantKeys = ['adsense_enabled','adsense_publisher_id','adsense_slot_strip','adsense_slot_sidebar','adsense_slot_infeed','adsense_preview_mode'];
for (const k of importantKeys) {
  const s = settings.find(r => r.key === k);
  console.log(k + ' = ' + (s ? s.value : 'MISSING'));
}

console.log('\n=== HOUSE ADS ===');
const house = await pb.collection('house_ads').getFullList().catch(() => []);
console.log('Count:', house.length);

console.log('\n=== JOBS ===');
const all = await pb.collection('jobs').getList(1,1);
console.log('Total jobs:', all.totalItems);
const active = await pb.collection('jobs').getList(1,1,{filter:'active=true'});
console.log('Active jobs:', active.totalItems);
const today = new Date().toISOString().slice(0,10);
console.log('Today:', today);
const live = await pb.collection('jobs').getList(1,1,{filter:'active=true&expires>\"'+today+'\"'}).catch(() => ({totalItems:'ERROR'}));
console.log('Live (active + not expired):', live.totalItems);

console.log('\nDone.');
