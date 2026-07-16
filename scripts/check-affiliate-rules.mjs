const PB = 'http://127.0.0.1:8090';
const CREDS = JSON.stringify({ identity: process.env.PB_ADMIN_EMAIL, password: process.env.PB_ADMIN_PASSWORD });

async function main() {
  const authRes = await fetch(PB + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: CREDS,
  });
  const auth = await authRes.json();
  if (!auth.token) { console.error('Auth failed'); process.exit(1); }
  const H = { 'Authorization': 'Bearer ' + auth.token, 'Content-Type': 'application/json' };

  // Check data with auth
  let res = await fetch(PB + '/api/collections/affiliate_links/records?perPage=20', { headers: H });
  let data = await res.json();
  console.log('With auth — affiliate_links totalItems:', data.totalItems, 'items:', data.items?.length || 0);
  for (const i of (data.items || [])) {
    console.log(' ', i.id.slice(0,8), i.name?.slice(0,30), 'active:', i.active);
  }

  // Check without auth
  res = await fetch(PB + '/api/collections/affiliate_links/records?perPage=20');
  data = await res.json();
  console.log('Without auth — totalItems:', data.totalItems, 'items:', data.items?.length || 0);

  // Check the actual rules
  res = await fetch(PB + '/api/collections/affiliate_links');
  data = await res.json();
  console.log('Collection rules — listRule:', JSON.stringify(data.listRule), 'viewRule:', JSON.stringify(data.viewRule));

  // Force set rules
  res = await fetch(PB + '/api/collections/affiliate_links', {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ listRule: ' ', viewRule: ' ' }),
  });
  const patch = await res.json();
  console.log('Patched — listRule:', JSON.stringify(patch.listRule), 'viewRule:', JSON.stringify(patch.viewRule));

  // Test again
  res = await fetch(PB + '/api/collections/affiliate_links/records?perPage=20');
  data = await res.json();
  console.log('After patch — totalItems:', data.totalItems);
}
main().catch(e => { console.error(e); process.exit(1); });
