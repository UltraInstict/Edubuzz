import { describe, it, expect } from 'vitest';
import { parseGreenhouseJobs } from '../adapters/greenhouse';
import { decodeHtmlEntities } from '../adapters/http';

describe('decodeHtmlEntities', () => {
  it('decodes named and numeric entities back to HTML', () => {
    expect(decodeHtmlEntities('&lt;p&gt;Hi &amp; bye&lt;/p&gt;')).toBe('<p>Hi & bye</p>');
    expect(decodeHtmlEntities('caf&#233; &#x2014; ok')).toBe('café — ok');
  });
});

describe('parseGreenhouseJobs', () => {
  const payload = {
    jobs: [
      {
        id: 6067881,
        title: 'Software Engineer',
        absolute_url: 'https://boards.greenhouse.io/takealotcom/jobs/6067881',
        updated_at: '2026-07-01T10:00:00Z',
        location: { name: 'Cape Town' },
        departments: [{ name: 'Engineering' }],
        content: '&lt;p&gt;Build things. Full &lt;strong&gt;stack&lt;/strong&gt;.&lt;/p&gt;',
      },
      { id: 2, title: '', absolute_url: 'https://boards.greenhouse.io/takealotcom/jobs/2' },
    ],
    meta: { total: 2 },
  };

  it('maps postings and decodes the FULL description exactly (no truncation)', () => {
    const jobs = parseGreenhouseJobs(payload as any, 'Takealot Group');
    expect(jobs).toHaveLength(1); // empty-title row dropped
    const j = jobs[0];
    expect(j.externalId).toBe('6067881');
    expect(j.title).toBe('Software Engineer');
    expect(j.company).toBe('Takealot Group');
    expect(j.applyUrl).toBe('https://boards.greenhouse.io/takealotcom/jobs/6067881');
    expect(j.location).toBe('Cape Town');
    expect(j.category).toBe('Engineering');
    // Description is the decoded original HTML, complete.
    expect(j.descriptionHtml).toBe('<p>Build things. Full <strong>stack</strong>.</p>');
    expect(j.postedDate).toBe('2026-07-01T10:00:00Z');
  });

  it('returns [] for empty/invalid payloads', () => {
    expect(parseGreenhouseJobs({} as any, 'X')).toEqual([]);
    expect(parseGreenhouseJobs({ jobs: null } as any, 'X')).toEqual([]);
  });
});
