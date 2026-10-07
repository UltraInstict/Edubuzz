const assert = require('node:assert/strict');
const origin = process.env.EDUBUZZ_QA_URL || 'http://127.0.0.1:4332';
const client = 'ca-pub-4848750388169101';
const record = 'google.com, pub-4848750388169101, DIRECT, f08c47fec0942fa0';
async function main() {
  const eligible = ['/', '/education', '/careers', '/resources', '/companies', '/salary', '/industry', ...['shoprite', 'capitec', 'standard-bank', 'woolworths', 'pick-n-pay', 'clicks', 'mr-price', 'nedbank', 'fnb', 'dis-chem'].map(x => '/company/' + x)];
  const excluded = ['/about', '/contact', '/start', '/privacy', '/terms', '/cookie-policy', '/login', '/register', '/404'];
  for (const route of [...eligible, ...excluded]) {
    const response = await fetch(origin + route);
    const html = await response.text();
    assert.ok(response.status === 200 || excluded.includes(route), `${route}: HTTP ${response.status}`);
    const scripts = html.match(/<script\b[^>]*src="[^"]*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^>]*>/g) || [];
    assert.equal(scripts.length, eligible.includes(route) ? 1 : 0, `${route}: loader count`);
    for (const script of scripts) {
      assert.ok(script.includes(`client=${client}`) && script.includes('async') && script.includes('crossorigin="anonymous"'), `${route}: loader configuration`);
    }
  }
  const ads = await fetch(origin + '/ads.txt');
  assert.equal(ads.status, 200);
  assert.ok(ads.headers.get('content-type').startsWith('text/plain'));
  assert.equal((await ads.text()).trim(), record);
  console.log(`AdSense verified: ${eligible.length} eligible routes, ${excluded.length} excluded routes, exact public ads.txt. No Google ad requests or clicks performed.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
