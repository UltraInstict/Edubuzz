async function main() {
  const BASE = 'http://localhost:4322';

  // 1. Get CSRF token and login
  const pageRes = await fetch(`${BASE}/login`);
  const html = await pageRes.text();
  const csrfMatch = html.match(/name="_csrf" value="([^"]+)"/);
  if (!csrfMatch) { console.log('FAIL: no CSRF token'); return; }
  const csrf = csrfMatch[1];

  const fd = new URLSearchParams();
  fd.append('_csrf', csrf);
  fd.append('email', 'admin@edubuzz.co.za');
  fd.append('password', 'Admin1234!');

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: fd.toString(),
    redirect: 'manual'
  });

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) { console.log('FAIL: login returned no cookie'); return; }
  const token = setCookie.match(/pb_auth=([^;]+)/)[1];
  console.log('Logged in. Token:', token.substring(0, 20) + '...');

  // 2. Test upgrade page
  console.log('\n=== GET /employer/upgrade ===');
  const upgradeRes = await fetch(`${BASE}/employer/upgrade`, {
    headers: { 'Cookie': `pb_auth=${token}` },
    redirect: 'manual'
  });
  console.log('Status:', upgradeRes.status);
  console.log('Location:', upgradeRes.headers.get('location') || 'none');
  const upgradeHtml = await upgradeRes.text();
  console.log('Content length:', upgradeHtml.length);
  if (upgradeHtml.includes('Pay now')) console.log('Upgrade page loads OK');
  else if (upgradeHtml.includes('Login')) console.log('Got redirected to login (no employer record)');
  else console.log('Unknown content');

  // 3. Test pay button (POST to /api/payments/initiate)
  console.log('\n=== POST /api/payments/initiate ===');
  const payFd = new URLSearchParams();
  payFd.append('jobId', 'test123');
  
  try {
    const payRes = await fetch(`${BASE}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Cookie': `pb_auth=${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payFd.toString(),
      redirect: 'manual'
    });
    console.log('Status:', payRes.status);
    console.log('Location:', payRes.headers.get('location') || 'none');
    const payBody = await payRes.text();
    if (payBody) console.log('Body:', payBody.substring(0, 200));
    console.log('Headers:');
    payRes.headers.forEach((v, k) => console.log('  ' + k + ': ' + v));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

main().catch(e => console.error('Script error:', e.message));
