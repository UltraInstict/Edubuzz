import { describe, it, expect } from 'vitest';
import { parseAshbyJobs } from '../adapters/ashby';

describe('parseAshbyJobs', () => {
  it('maps postings to RawJob with apply URL, description and location', () => {
    const payload = {
      jobs: [
        {
          id: 'abc-1',
          title: 'Backend Engineer',
          location: 'Cape Town, South Africa',
          department: 'Engineering',
          team: 'Platform',
          employmentType: 'FullTime',
          isRemote: false,
          publishedAt: '2026-07-01T00:00:00Z',
          jobUrl: 'https://jobs.ashbyhq.com/acme/abc-1',
          applyUrl: 'https://jobs.ashbyhq.com/acme/abc-1/application',
          descriptionHtml: '<p>Build things</p>',
          address: { postalAddress: { addressLocality: 'Cape Town', addressRegion: 'Western Cape', addressCountry: 'ZA' } },
          compensation: {
            summaryComponents: [
              { compensationType: 'Salary', interval: 'MONTH', currencyCode: 'ZAR', minValue: 50000, maxValue: 70000 },
            ],
          },
        },
      ],
    };
    const jobs = parseAshbyJobs(payload, 'Acme');
    expect(jobs).toHaveLength(1);
    const j = jobs[0];
    expect(j.title).toBe('Backend Engineer');
    expect(j.company).toBe('Acme');
    expect(j.applyUrl).toContain('/application');
    expect(j.city).toBe('Cape Town');
    expect(j.province).toBe('Western Cape');
    expect(j.country).toBe('ZA');
    expect(j.category).toBe('Engineering');
    expect(j.salaryMin).toBe(50000);
    expect(j.salaryPeriod).toBe('monthly');
    expect(j.descriptionHtml).toContain('Build things');
  });

  it('drops entries without a title or apply URL', () => {
    const jobs = parseAshbyJobs({ jobs: [{ title: '', jobUrl: 'x' }, { title: 'No URL' }] } as any, 'Acme');
    expect(jobs).toHaveLength(0);
  });

  it('handles empty / missing payload safely', () => {
    expect(parseAshbyJobs({} as any, 'Acme')).toEqual([]);
    expect(parseAshbyJobs({ jobs: [] }, 'Acme')).toEqual([]);
  });
});
