import { createHash, randomBytes } from 'node:crypto';

const SECRET = 'change-this-in-env';
const BASE = 'http://127.0.0.1:4321';

async function testRegister(email, password, name, company) {
  const nonce = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(nonce + SECRET).digest('hex');
  const csrfToken = `${nonce}.${hash}`;

  const fd = new FormData();
  fd.set('_csrf', csrfToken);
  fd.set('name', name);
  fd.set('email', email);
  fd.set('password', password);
  fd.set('company', company);

  const res = await fetch(`${BASE}/api/auth/register`, { method: 'POST', body: fd });
  const text = await res.text();
  console.log(`[${email}] STATUS: ${res.status} — ${text}`);
  if (res.headers.get('set-cookie')) console.log('  Set-Cookie: YES');
}

// Wait for server
await new Promise(r => setTimeout(r, 3000));

// Test with work-force (already has user record, no employer)
await testRegister('admin@work-force.co.za', 'Admin123~!', 'Work-Force Admin', 'Work-Force');
// Test with edubuzz (already has user record, no employer)
await testRegister('admin@edubuzz.co.za', 'Admin1234!', 'EduBuzz Admin', 'EduBuzz Admin');
