import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const BASE = 'http://localhost:4321';
const PB = 'http://127.0.0.1:8090';

async function main() {
  // Step 1: Login via Astro API
  const loginPage = await fetch(`${BASE}/login`);
  const html = await loginPage.text();
  const csrfMatch = html.match(/name="_csrf" value="([^"]+)"/);
  const csrf = csrfMatch?.[1];

  const form = new URLSearchParams();
  form.set('_csrf', csrf);
  form.set('email', 'admin@work-force.co.za');
  form.set('password', 'Admin123~!');

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', body: form,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const loginData = await loginRes.json();
  console.log('Login:', JSON.stringify(loginData));

  const cookies = loginRes.headers.getSetCookie?.()?.join('; ') || '';
  const tokenMatch = cookies.match(/pb_auth=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) { console.log('No token in cookie!'); return; }

  // Step 2: Simulate what getAuthPb does 
  const pb = new PocketBase(PB);
  pb.authStore.save(token, null);

  // Step 3: Simulate what getUser does - authRefresh
  try {
    const record = await pb.collection('users').authRefresh();
    console.log('authRefresh user:', JSON.stringify({id: record.record.id, email: record.record.email, role: record.record.role}));
    const userId = record.record.id;

    // Step 4: Simulate employer query
    const employerList = await pb.collection('employers').getList(1, 1, {
      filter: `user_id="${userId}"`,
    });
    console.log('Employer query:', JSON.stringify({totalItems: employerList.totalItems, items: employerList.items.map(e => ({id: e.id, company: e.company_name, userId: e.user_id}))}));

    if (employerList.totalItems === 0) {
      console.log('NO EMPLOYER RECORD FOUND — redirecting to /register');
    }

    // Step 5: Check all employers to see what user_ids exist
    const allEmployers = await pb.collection('employers').getList(1, 50);
    console.log('All employers:', allEmployers.items.map(e => ({id: e.id, company: e.company_name, userId: e.user_id})));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().catch(console.error);
