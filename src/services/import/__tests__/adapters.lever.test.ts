import { describe, it, expect } from 'vitest';
import { buildLeverDescription, parseLeverPostings } from '../adapters/lever';

describe('buildLeverDescription', () => {
  it('assembles the FULL posting HTML (intro + lists + closing)', () => {
    const html = buildLeverDescription({
      description: '<div>About the role</div>',
      lists: [{ text: 'Responsibilities', content: '<li>Do X</li><li>Do Y</li>' }],
      additional: '<div>Benefits</div>',
    });
    expect(html).toContain('<div>About the role</div>');
    expect(html).toContain('<h3>Responsibilities</h3>');
    expect(html).toContain('<ul><li>Do X</li><li>Do Y</li></ul>');
    expect(html).toContain('<div>Benefits</div>');
  });
});

describe('parseLeverPostings', () => {
  const postings = [
    {
      id: 'abc-123',
      text: 'Backend Engineer',
      categories: { commitment: 'Full-time', department: 'Engineering', location: 'Johannesburg', team: 'Core' },
      description: '<p>Join us</p>',
      lists: [{ text: 'What you will do', content: '<li>Ship</li>' }],
      additional: '<p>Perks</p>',
      hostedUrl: 'https://jobs.lever.co/acme/abc-123',
      applyUrl: 'https://jobs.lever.co/acme/abc-123/apply',
      createdAt: 1735689600000,
      country: 'ZA',
      salaryRange: { min: 600000, max: 900000, currency: 'ZAR', interval: 'per-year-salary' },
    },
    { id: 'x', categories: {}, hostedUrl: 'https://jobs.lever.co/acme/x' }, // no title → dropped
  ];

  it('maps postings with full description, apply URL, location and salary', () => {
    const jobs = parseLeverPostings(postings as any, 'Acme');
    expect(jobs).toHaveLength(1);
    const j = jobs[0];
    expect(j.externalId).toBe('abc-123');
    expect(j.title).toBe('Backend Engineer');
    expect(j.company).toBe('Acme');
    expect(j.applyUrl).toBe('https://jobs.lever.co/acme/abc-123/apply');
    expect(j.sourceUrl).toBe('https://jobs.lever.co/acme/abc-123');
    expect(j.location).toBe('Johannesburg');
    expect(j.employmentType).toBe('Full-time');
    expect(j.category).toBe('Engineering');
    expect(j.salaryMin).toBe(600000);
    expect(j.salaryMax).toBe(900000);
    expect(j.salaryCurrency).toBe('ZAR');
    expect(j.salaryPeriod).toBe('annual');
    expect(j.descriptionHtml).toContain('<p>Join us</p>');
    expect(j.descriptionHtml).toContain('<h3>What you will do</h3>');
    expect(j.postedDate).toBe(new Date(1735689600000).toISOString());
  });

  it('returns [] for non-arrays', () => {
    expect(parseLeverPostings(null as any, 'X')).toEqual([]);
  });
});
