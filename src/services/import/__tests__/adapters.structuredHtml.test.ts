import { describe, it, expect } from 'vitest';
import { extractJsonLdJobs } from '../adapters/structuredHtml';
import { scrapeResultToRawJobs } from '../adapters/firecrawl';

const PAGE = `<!doctype html><html><head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Financial Analyst",
  "description": "<p>Analyse budgets and forecasts.</p>",
  "datePosted": "2024-05-01",
  "validThrough": "2024-12-31",
  "employmentType": "FULL_TIME",
  "hiringOrganization": { "@type": "Organization", "name": "Big Bank", "sameAs": "https://bigbank.co.za" },
  "jobLocation": { "@type": "Place", "address": { "addressLocality": "Sandton", "addressRegion": "Gauteng", "addressCountry": "ZA" } },
  "baseSalary": { "@type": "MonetaryAmount", "currency": "ZAR", "value": { "minValue": 40000, "maxValue": 60000, "unitText": "MONTH" } },
  "url": "https://bigbank.co.za/careers/fa-100",
  "identifier": { "@type": "PropertyValue", "value": "FA-100" }
}
</script>
</head><body>...</body></html>`;

const GRAPH_PAGE = `<script type="application/ld+json">
{ "@context":"https://schema.org", "@graph":[
  { "@type":"WebSite" },
  { "@type":"JobPosting", "title":"Teacher", "url":"https://sch.co/1", "hiringOrganization":"Springfield School",
    "description":"Teach maths", "jobLocationType":"TELECOMMUTE" }
]}
</script>`;

describe('extractJsonLdJobs', () => {
  it('extracts a JobPosting with org, location, salary and dates', () => {
    const jobs = extractJsonLdJobs(PAGE, 'https://bigbank.co.za/careers/fa-100');
    expect(jobs).toHaveLength(1);
    const j = jobs[0];
    expect(j.title).toBe('Financial Analyst');
    expect(j.company).toBe('Big Bank');
    expect(j.city).toBe('Sandton');
    expect(j.province).toBe('Gauteng');
    expect(j.country).toBe('ZA');
    expect(j.employmentType).toBe('Full-time');
    expect(j.salaryText).toContain('40000');
    expect(j.salaryText).toContain('60000');
    expect(j.closingDate).toBe('2024-12-31');
    expect(j.externalId).toBe('FA-100');
    expect(j.extra?.companyWebsite).toBe('https://bigbank.co.za');
  });

  it('extracts JobPosting nested in @graph and flags remote', () => {
    const jobs = extractJsonLdJobs(GRAPH_PAGE);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Teacher');
    expect(jobs[0].company).toBe('Springfield School');
    expect(jobs[0].location).toBe('Remote');
  });

  it('returns [] when no JSON-LD present or malformed', () => {
    expect(extractJsonLdJobs('<html><body>no ld</body></html>')).toEqual([]);
    expect(extractJsonLdJobs('<script type="application/ld+json">{bad json}</script>')).toEqual([]);
    expect(extractJsonLdJobs('')).toEqual([]);
  });
});

describe('scrapeResultToRawJobs (firecrawl adapter helper)', () => {
  it('prefers structured JSON-LD from scraped HTML', () => {
    const jobs = scrapeResultToRawJobs({
      success: true,
      url: 'https://bigbank.co.za/careers/fa-100',
      html: PAGE,
      markdown: '# Financial Analyst',
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Financial Analyst');
    expect(jobs[0].extra?.acquiredVia).toBe('firecrawl+jsonld');
  });

  it('falls back to raw content flagged for AI normalization', () => {
    const jobs = scrapeResultToRawJobs({
      success: true,
      url: 'https://x.co/job/1',
      html: '<html><body>Unstructured job page</body></html>',
      markdown: 'Unstructured job page',
      metadata: { title: 'Some Role' },
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].extra?.acquiredVia).toBe('firecrawl+raw');
    expect(jobs[0].extra?.needsAiNormalization).toBe(true);
  });

  it('returns [] for failed scrapes', () => {
    expect(scrapeResultToRawJobs({ success: false, url: 'x', error: 'boom' })).toEqual([]);
  });
});
