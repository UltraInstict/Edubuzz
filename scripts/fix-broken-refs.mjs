// Fix broken campaign references — re-assign to existing affiliate links
const PB = 'http://127.0.0.1:8090';

async function main() {
  // Auth
  const authRes = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'praiseleeto@gmail.com', password: 'PbCFfkcMOhL9CvgGjB9Fs23Q!9X' }),
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed:', JSON.stringify(authData)); process.exit(1); }
  console.log('Auth OK');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Get all affiliate links
  const affRes = await fetch(`${PB}/api/collections/affiliate_links/records?perPage=20`, { headers });
  const affData = await affRes.json();
  const links = affData.items || [];
  console.log('Available affiliate links:', links.length);
  for (const l of links) {
    console.log(`  ${l.id.slice(0,8)} display=${l.display_type} active=${l.active}`);
  }

  // Get all campaigns
  const campRes = await fetch(`${PB}/api/collections/monetization_campaigns/records?perPage=20`, { headers });
  const campData = await campRes.json();
  const campaigns = campData.items || [];

  // Check which campaigns have broken references
  const broken = [];
  for (const c of campaigns) {
    const res = await fetch(`${PB}/api/collections/affiliate_links/records/${c.reference_id}`, { headers });
    if (!res.ok) {
      broken.push(c);
      console.log(`BROKEN: ${c.id.slice(0,8)} zone=${c.zone} ref=${c.reference_id.slice(0,8)}`);
    }
  }

  // Fix broken references — assign to first available image link
  const imageLink = links.find(l => l.display_type === 'image');
  const textLink = links.find(l => l.display_type === 'text');

  for (const c of broken) {
    const newRef = c.campaign_type === 'affiliate_image' ? imageLink?.id : textLink?.id;
    if (!newRef) { console.log(`  No suitable link for ${c.id.slice(0,8)}`); continue; }
    const patchRes = await fetch(`${PB}/api/collections/monetization_campaigns/records/${c.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ reference_id: newRef }),
    });
    console.log(`FIXED: ${c.id.slice(0,8)} ${c.zone} -> ref ${newRef.slice(0,8)} (${patchRes.status})`);
  }

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
