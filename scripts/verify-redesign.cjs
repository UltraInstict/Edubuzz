const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.EDUBUZZ_QA_MODULES || path.join(__dirname, '../node_modules')] }));

async function main() {
  const output = path.join(__dirname, '../output/redesign');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const issues = [];
  const origin = process.env.EDUBUZZ_QA_URL || 'http://127.0.0.1:4325';
  const fast = process.env.EDUBUZZ_QA_FAST === '1';
  const routes = ['/', '/start', '/education', '/careers', '/resources', '/companies', '/salary', '/industry', '/about', '/contact', '/education/nsfas-funding-explained', '/careers/how-to-become-an-electrician', '/resources/cv-writing-guide-south-africa', '/salary/teacher-salary-south-africa', '/industry/engineering', '/resources?page=abc', '/resources?page=999', '/resources?category=invalid'];
  const discoveredLinks = new Set();
  routes.push(...['shoprite', 'capitec', 'standard-bank', 'woolworths', 'pick-n-pay', 'clicks', 'mr-price', 'nedbank', 'fnb', 'dis-chem'].map(slug => '/company/' + slug));
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      // Keep local QA reproducible; production analytics do not need to run here.
      await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      page.on('pageerror', error => issues.push(`${width}: ${error.message}`));
      page.on('response', response => {
        if (new URL(response.url()).origin === origin && response.status() >= 400) issues.push(`${width}: asset or page HTTP ${response.status()} ${response.url()}`);
      });
      for (const route of routes) {
        const response = await page.goto(origin + route, { waitUntil: fast ? 'load' : 'networkidle' });
        if (response.status() !== 200) issues.push(`${width} ${route}: HTTP ${response.status()}`);
        if (new URL(page.url()).pathname === '/404') issues.push(`${width} ${route}: redirected to 404`);
        for (const href of await page.locator('a[href^="/"]').evaluateAll(elements => elements.map(a => a.getAttribute('href')))) discoveredLinks.add(href);
        await page.evaluate(async (fast) => {
          await document.fonts.ready;
          for (let y = 0; y < document.body.scrollHeight; y += 800) {
            window.scrollTo({ top:y, behavior:'instant' });
            await new Promise(resolve => setTimeout(resolve, fast ? 10 : 80));
          }
          await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {})));
          window.scrollTo({ top:0, behavior:'instant' });
          await new Promise(resolve => setTimeout(resolve, fast ? 30 : 200));
        }, fast);
        const findings = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          headings: document.querySelectorAll('h1').length,
          brokenImages: Array.from(document.images).filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
        }));
        if (findings.overflow || findings.headings !== 1 || findings.brokenImages.length) issues.push(`${width} ${route}: ${JSON.stringify(findings)}`);
        if (['/', '/start', '/education', '/careers', '/resources', '/companies', '/salary', '/contact', '/company/shoprite', '/company/capitec'].includes(route) && [1440,390].includes(width)) {
          await page.screenshot({ path: path.join(output, `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage: true });
          if (route === '/') {
            await page.evaluate(() => window.scrollTo({ top:0, behavior:'instant' }));
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(output, `home-top-${width}.png`) });
          }
        }
      }
      await page.close();
      console.log(`Verified ${routes.length} routes at ${width}px.`);
    }
    const page = await browser.newPage();
    await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.goto(origin);
    const links = [...discoveredLinks];
    for (const link of links) {
      const response = await page.request.get(origin + link);
      if (response.status() !== 200) issues.push(`Homepage link ${link}: ${response.status()}`);
      if (new URL(response.url()).pathname === '/404') issues.push(`Internal link ${link}: redirected to 404`);
    }
    const ads = await page.request.get(origin + '/ads.txt');
    if ((await ads.text()).trim() !== 'google.com, pub-4848750388169101, DIRECT, f08c47fec0942fa0') issues.push('ads.txt publisher record mismatch');
    await page.goto(origin);
    if (!(await page.locator('meta[name="google-adsense-account"]').count())) issues.push('AdSense ownership meta tag missing');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    if (!og || (await page.request.get(origin + new URL(og).pathname)).status() !== 200) issues.push('Social sharing image missing');
    for (const stage of ['school', 'study', 'work']) for (const interest of ['options', 'practical', 'funding', 'apply']) {
      await page.goto(origin + '/start');
      await page.selectOption('#stage', stage);
      await page.selectOption('#interest', interest);
      await page.click('#pathfinder-form button');
      if (!(await page.locator('#pathfinder-results').isVisible()) || !(await page.locator('#result-links a').count())) issues.push(`Pathfinder ${stage}/${interest}: no result`);
      await page.click('#start-again');
      if (!(await page.locator('#pathfinder-form').isVisible())) issues.push('Pathfinder reset failed');
    }
    await page.setViewportSize({ width:390, height:844 });
    await page.goto(origin);
    await page.click('.site-nav summary');
    await page.locator('.site-nav details a[href="/education"]').click();
    if (new URL(page.url()).pathname !== '/education') issues.push('Mobile menu navigation failed');
    // Mock form outcomes locally: these checks send no email or external message.
    for (const outcome of ['success','error','network']) {
      await page.goto(origin + '/contact');
      await page.route('**/api/contact', route => outcome === 'network' ? route.abort() : route.fulfill({ status:outcome === 'success' ? 200 : 500, contentType:'application/json', body:JSON.stringify(outcome === 'success' ? { success:true } : { success:false, error:'Please try again.' }) }));
      await page.fill('#contact-name','QA Example');
      await page.fill('#contact-email','qa@example.test');
      await page.selectOption('#contact-subject','Technical Issue');
      await page.fill('#contact-message','Local verification only.');
      await page.click('#contact-form button');
      await page.waitForFunction(() => !document.querySelector('#message').hidden);
      const message = await page.locator('#message').textContent();
      if (outcome === 'success' ? !message.includes('Message sent') : message.includes('Message sent')) issues.push(`Contact ${outcome}: wrong feedback`);
      if (await page.locator('#contact-form button').isDisabled()) issues.push(`Contact ${outcome}: retry disabled`);
      if ((await page.inputValue('#contact-message')) !== 'Local verification only.') issues.push(`Contact ${outcome}: message lost`);
      await page.unroute('**/api/contact');
    }
    const report = { routes: routes.length, viewports: 4, internalLinks: links.length, pathfinderScenarios: 12, contactScenarios: 3, issues, screenshots: output };
    await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (issues.length) process.exitCode = 1;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
