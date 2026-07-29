import { describe, it, expect } from 'vitest';
import {
  parseSitemapJobUrls,
  isProbablySAJobUrl,
  parseSuccessFactorsJob,
} from '../adapters/successfactors';
import { toCanonicalJob } from '../index';
import { validateJob } from '../validate';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.google.com/schemas/sitemap/0.9">
  <url><loc>https://jobs.sasol.com/job/Secunda-Chemical-Plant-Operator-%28CPO%29/1416093733/</loc><lastmod>2026-07-25</lastmod></url>
  <url><loc>https://jobs.sasol.com/job/Sandton-Logistics-Scheduler/1418576933/</loc></url>
  <url><loc>https://jobs.sasol.com/job/Lake-Charles-Outside-Machinist/1189130201/</loc></url>
  <url><loc>https://jobs.sasol.com/job/Houston-Manager-Technical-Marketing/1380447533/</loc></url>
  <url><loc>https://jobs.sasol.com/search/</loc></url>
</urlset>`;

// Compact fixture mirroring the real SuccessFactors CSB detail-page markup.
const SA_JOB = `<html><head>
  <title>Chemical Plant Operator (CPO) Job Details | Sasol</title>
  <link rel="canonical" href="https://jobs.sasol.com/job/Secunda-Chemical-Plant-Operator-%28CPO%29/1416093733/" />
</head><body>
  <div class="jobDisplayShell" itemscope itemtype="http://schema.org/JobPosting">
    <span itemprop="jobLocation" itemscope itemtype="http://schema.org/Place">
      <span itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
        <meta itemprop="streetAddress" content="Secunda, South Africa">
      </span>
    </span>
    <meta itemprop="datePosted" content="Fri Jul 17 00:00:00 UTC 2026">
    <div class="jobTitle"><h1 id="job-title" itemprop="title">Chemical Plant Operator (CPO)</h1></div>
    <p id="job-location" class="jobLocation"><strong>Location:</strong> Secunda, Mpumalanga</p>
    <div class="job">
      <span itemprop="description" class="jobdescription">
        <p>Sasol is a global integrated chemicals and energy company. To coordinate and direct maintenance and repair services for a specific process within a production line, through control panel management and troubleshooting. Closing Date 31 July 2026.</p>
      </span>
    </div>
  </div>
</body></html>`;

const US_JOB = SA_JOB
  .replace('Secunda, South Africa', 'Lake Charles, United States')
  .replace('Secunda, Mpumalanga', 'Lake Charles, Louisiana')
  .replace('Chemical Plant Operator (CPO)', 'Outside Machinist');

describe('parseSitemapJobUrls', () => {
  it('extracts only /job/ detail URLs, de-duplicated', () => {
    const urls = parseSitemapJobUrls(SITEMAP);
    expect(urls).toHaveLength(4);
    expect(urls.every((u) => u.includes('/job/'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/search/'))).toBe(false);
  });

  it('returns [] for empty/garbage input', () => {
    expect(parseSitemapJobUrls('')).toEqual([]);
    expect(parseSitemapJobUrls('<html>no sitemap</html>')).toEqual([]);
  });
});

describe('isProbablySAJobUrl (slug pre-filter)', () => {
  it('keeps SA-location slugs and drops clearly-foreign ones', () => {
    expect(isProbablySAJobUrl('https://jobs.sasol.com/job/Secunda-Chemical-Plant-Operator/1/')).toBe(true);
    expect(isProbablySAJobUrl('https://jobs.sasol.com/job/Sandton-Logistics-Scheduler/2/')).toBe(true);
    expect(isProbablySAJobUrl('https://jobs.sasol.com/job/Houston-Manager-Technical-Marketing/3/')).toBe(false);
  });

  it('keeps uncertain slugs (lets the downstream gate decide)', () => {
    expect(isProbablySAJobUrl('https://jobs.sasol.com/job/Bronkhorstspruit-Operator/9/')).toBe(true);
  });
});

describe('parseSuccessFactorsJob', () => {
  it('extracts title, description, city + country from CSB microdata', () => {
    const job = parseSuccessFactorsJob(SA_JOB, 'https://jobs.sasol.com/job/Secunda-Chemical-Plant-Operator-%28CPO%29/1416093733/', 'Sasol');
    expect(job).not.toBeNull();
    expect(job!.title).toBe('Chemical Plant Operator (CPO)');
    expect(job!.company).toBe('Sasol');
    expect(job!.city).toBe('Secunda');
    expect(job!.country).toBe('South Africa');
    expect(job!.applyUrl).toContain('/job/Secunda-');
    expect(job!.descriptionHtml).toContain('chemicals and energy');
    expect(job!.postedDate).toContain('Jul 17');
  });

  it('returns null when there is no job title', () => {
    expect(parseSuccessFactorsJob('<html><body>interstitial</body></html>', 'https://x', 'Sasol')).toBeNull();
  });

  it('produces a canonical SA job that PASSES validation', () => {
    const raw = parseSuccessFactorsJob(SA_JOB, 'https://jobs.sasol.com/job/x/1/', 'Sasol')!;
    const job = toCanonicalJob(raw, { source: 'successfactors:sasol' });
    const result = validateJob(job);
    expect(result.ok).toBe(true);
    expect(job.core.province).toBe('Mpumalanga'); // resolved from "Secunda"
  });

  it('produces a canonical US job that is REJECTED as non-SA', () => {
    const raw = parseSuccessFactorsJob(US_JOB, 'https://jobs.sasol.com/job/y/2/', 'Sasol')!;
    const job = toCanonicalJob(raw, { source: 'successfactors:sasol' });
    const result = validateJob(job);
    expect(result.ok).toBe(false);
    expect(result.rejections).toContain('non_south_africa');
  });
});
