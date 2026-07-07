import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(
  process.env.PB_ADMIN_EMAIL || 'praiseleeto@gmail.com',
  process.env.PB_ADMIN_PASSWORD || 'PbCFfkcMOhL9CvgGjB9Fs23Q!9X'
);

const cols = await pb.collections.getFullList();

// PocketBase: empty string rule = allow all, null = only superusers
for (const name of ['monetization_campaigns', 'house_ads', 'affiliate_links']) {
  const c = cols.find(x => x.name === name);
  if (!c) continue;
  try {
    await pb.collections.update(c.id, {
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    console.log('Opened rules for', name);
  } catch (e) {
    console.log('Failed', name, e.message?.slice(0,80));
  }
}

// Verify
const anon = new PocketBase('http://127.0.0.1:8090');
for (const name of ['monetization_campaigns', 'affiliate_links']) {
  try {
    const r = await anon.collection(name).getList(1, 3);
    console.log(`Public read ${name}: ${r.totalItems} records OK`);
    if (r.items.length > 0) {
      for (const item of r.items) {
        console.log('  ', item.id?.slice(0,8), item.active, item.zone || item.campaign_type);
      }
    }
  } catch (e) {
    console.log(`Public read ${name}: FAILED ${e.status}`);
  }
}
