const assert = require('node:assert/strict');
const origin = process.env.EDUBUZZ_QA_URL || 'http://127.0.0.1:4330';
(async () => {
  const slugs = ['shoprite', 'capitec', 'standard-bank', 'woolworths', 'pick-n-pay', 'clicks', 'mr-price', 'nedbank', 'fnb', 'dis-chem'];
  const xml = await (await fetch(origin + '/sitemaps/companies.xml')).text();
  assert.equal((xml.match(/<url>/g) || []).length, 10);
  assert.equal((xml.match(/<lastmod>2026-10-07<\/lastmod>/g) || []).length, 10);
  for (const slug of slugs) {
    const response = await fetch(origin + '/company/' + slug);
    assert.equal(response.status, 200);
    const html = await response.text();
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const article = schemas.find(s => s['@type'] === 'Article');
    assert.equal(article.dateModified, '2026-10-07');
    assert.equal(article.datePublished, undefined);
    assert.ok(html.includes('Sources and verification limits'));
    for (const anchor of ['routes', 'prepare', 'apply', 'sources']) assert.ok(html.includes(`id="${anchor}"`));
    console.log(`${slug}: HTTP, schema, sources and guide navigation passed.`);
  }
  console.log('All 10 company guides and the curated sitemap passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
