// Activate inactive campaigns and fix affiliate link active status
const PB = 'http://127.0.0.1:8090';

const ADMIN = {
  identity: 'praiseleeto@gmail.com',
  password: 'PbCFfkcMOhL9CvgGjB9Fs23Q!9X',
};

async function main() {
  // Auth
  const authRes = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN),
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) {
    console.error('Auth failed:', JSON.stringify(authData));
    process.exit(1);
  }
  console.log('Auth OK, token:', token.slice(0, 10) + '...');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Activate all affiliate links
  const affRes = await fetch(`${PB}/api/collections/affiliate_links/records?perPage=50`, { headers });
  const affData = await affRes.json();
  const affItems = affData.items || [];
  console.log(`Affiliate links: ${affItems.length} total`);

  for (const a of affItems) {
    if (!a.active) {
      const res = await fetch(`${PB}/api/collections/affiliate_links/records/${a.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ active: true }),
      });
      console.log(`  ${a.id.slice(0, 8)}: active -> true (${res.status})`);
    }
  }

  // Activate all campaigns
  const campRes = await fetch(`${PB}/api/collections/monetization_campaigns/records?perPage=50`, { headers });
  const campData = await campRes.json();
  const campItems = campData.items || [];
  console.log(`Campaigns: ${campItems.length} total`);

  for (const c of campItems) {
    if (!c.active) {
      const res = await fetch(`${PB}/api/collections/monetization_campaigns/records/${c.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ active: true }),
      });
      console.log(`  ${c.id.slice(0, 8)} zone=${c.zone}: active -> true (${res.status})`);
    } else {
      console.log(`  ${c.id.slice(0, 8)} zone=${c.zone}: already active`);
    }
  }

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
