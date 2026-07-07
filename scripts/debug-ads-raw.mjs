import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword('praiseleeto@gmail.com','PbCFfkcMOhL9CvgGjB9Fs23Q!9X');

// Check actual collection schema
const cols = await pb.collections.getFullList();
const mc = cols.find(c => c.name === 'monetization_campaigns');
console.log('Collection exists:', !!mc);
if (mc) {
  console.log('Collection fields:', JSON.stringify(Object.keys(mc.fields || mc.schema || {})));
  console.log('Raw schema:', JSON.stringify(mc).slice(0, 300));
}

// Get raw records
const camps = await pb.collection('monetization_campaigns').getList(1, 1).catch(e => {
  console.log('ERROR getting campaigns:', e.message);
  return {items:[]};
});
if (camps.items.length > 0) {
  const first = camps.items[0];
  console.log('\nFirst campaign raw keys:', Object.keys(first));
  console.log('First campaign raw:', JSON.stringify(first).slice(0, 200));
}

// Let me also dump the full list as raw objects
const all = await pb.collection('monetization_campaigns').getFullList().catch(() => []);
if (all.length > 0) {
  console.log('\nAll campaigns (first 3):');
  all.slice(0,3).forEach((c,i) => {
    console.log(`  [${i}]`, JSON.stringify(c));
  });
}

// Check affiliate_links for zone values actually stored
const affs = await pb.collection('affiliate_links').getFullList().catch(() => []);
if (affs.length > 0) {
  console.log('\nAffiliate links (first 2):');
  affs.slice(0,2).forEach((a,i) => {
    console.log(`  [${i}] zone=${a.zone} active=${a.active} display_type=${a.display_type}`);
  });
}
