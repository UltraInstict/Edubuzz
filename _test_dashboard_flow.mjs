const BASE = 'http://localhost:4321';

async function main() {
  // Step 1: Get CSRF token from login page
  const loginPage = await fetch(`${BASE}/login`);
  const html = await loginPage.text();
  const csrfMatch = html.match(/name="_csrf" value="([^"]+)"/);
  const csrf = csrfMatch?.[1];
  const cookies = loginPage.headers.getSetCookie?.()?.join('; ') || '';

  console.log(`CSRF: ${csrf ? 'found' : 'MISSING'}`);

  // Step 2: Login
  const form = new URLSearchParams();
  form.set('_csrf', csrf ?? '');
  form.set('email', 'admin@work-force.co.za');
  form.set('password', 'Admin123~!');

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    body: form,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  console.log(`Login: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log(JSON.stringify(loginData));

  const authCookies = loginRes.headers.getSetCookie?.()?.join('; ') || '';
  console.log(`Cookie: ${authCookies ? 'SET' : 'MISSING'}`);

  if (!authCookies) return;

  // Step 3: Request employer dashboard with cookie
  const dashRes = await fetch(`${BASE}/employer/dashboard`, {
    headers: { Cookie: authCookies },
    redirect: 'manual',
  });

  console.log(`\nDashboard: ${dashRes.status}`);
  console.log(`Location: ${dashRes.headers.get('location') || 'none'}`);

  if (dashRes.status === 302) {
    const loc = dashRes.headers.get('location');
    console.log(`REDIRECTED TO: ${loc}`);
    
    // Follow the redirect
    const redirectRes = await fetch(`${BASE}${loc}`, {
      headers: { Cookie: authCookies },
      redirect: 'manual',
    });
    console.log(`After redirect: ${redirectRes.status}`);
    console.log(`Location: ${redirectRes.headers.get('location') || 'none'}`);
  } else if (dashRes.ok) {
    const body = await dashRes.text();
    // Check for key elements
    console.log(`Title: ${body.match(/<title>([^<]+)<\/title>/)?.[1] || '??'}`);
    console.log(`H1: ${body.match(/<h1>([^<]+)<\/h1>/)?.[1] || '??'}`);
  }
}

main().catch(console.error);
