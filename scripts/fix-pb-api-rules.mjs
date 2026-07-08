// Fix affiliate_links API rules — they're null (superuser-only), need to be empty string (public read)
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env for creds
const envPath = '/home/edubuzz/app/.env';
const env = {};
const lines = readFileSync(envPath, 'utf8').split('\n');
for (const line of lines) {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const PB = 'http://127.0.0.1:8090';
const CREDS = { identity: env.PB_ADMIN_EMAIL, password: env.PB_ADMIN_PASSWORD };

async function main() {
  const authRes = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDS),
  });
  const auth = await authRes.json();
  if (!auth.token) { console.error('Auth failed:', JSON.stringify(auth)); process.exit(1); }
  const headers = { 'Authorization': `Bearer ${auth.token}`, 'Content-Type': 'application/json' };

  // Fix affiliate_links
  let res = await fetch(`${PB}/api/collections/affiliate_links`, { headers });
  let col = await res.json();
  console.log('affiliate_links before:', { listRule: col.listRule, viewRule: col.viewRule });

  res = await fetch(`${PB}/api/collections/affiliate_links`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ listRule: '', viewRule: '' }),
  });
  col = await res.json();
  console.log('affiliate_links after:', { listRule: col.listRule, viewRule: col.viewRule });

  // Also fix jobs collection just in case
  res = await fetch(`${PB}/api/collections/jobs`, { headers });
  col = await res.json();
  console.log('jobs:', { listRule: col.listRule, viewRule: col.viewRule });
  if (!col.listRule) {
    await fetch(`${PB}/api/collections/jobs`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ listRule: '', viewRule: '' }),
    });
    console.log('jobs rules fixed');
  }
  console.log('Done');
}
main().catch(e => { console.error(e); process.exit(1); });
