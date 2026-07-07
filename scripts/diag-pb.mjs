import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

const zone = 'sidebar';
const today = new Date().toISOString().slice(0,10);
const variants = ['sidebar','Sidebar','all','All','ALL'];
const zoneOrs = variants.map(v => `zone="${v}"`).join('||');

// Fixed filter
const fixedFilter = [
  'active=true',
  `(${zoneOrs})`,
  `(start_date=""||start_date<="${today}")`,
  `(end_date=""||end_date>="${today}")`,
].join('&&');

console.log('Fixed filter:', fixedFilter);
try {
  const result = await pb.collection('monetization_campaigns').getFullList({
    filter: fixedFilter,
    sort: 'priority,+created',
  });
  console.log('Results:', result.length);
  for (const c of result) {
    try {
      console.log('  id='+(c.id||'?').slice(0,8), 'zone='+(c.zone||'?'), 'active='+c.active, 'type='+(c.campaign_type||'?'), 'ref='+((c.reference_id||'?')+'').slice(0,8));
    } catch(e2) {
      console.log('  RAW:', JSON.stringify(c).slice(0,100));
    }
  }
} catch(e) {
  console.log('ERROR:', e.message?.slice(0,200));
}
console.log('Done.');
