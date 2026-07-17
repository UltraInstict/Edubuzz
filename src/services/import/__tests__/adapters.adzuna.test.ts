import { describe, it, expect } from 'vitest';
import { mapAdzunaResults } from '../adapters/adzuna';

const sample = [
  {
    id: '4200012345',
    title: 'Software Engineer',
    description: 'Build backend services for a fintech in Johannesburg.',
    created: '2026-07-10T00:00:00Z',
    redirect_url: 'https://www.adzuna.co.za/land/ad/4200012345',
    company: { display_name: 'Acme Fintech' },
    location: { display_name: 'Johannesburg, Gauteng', area: ['South Africa', 'Gauteng', 'Johannesburg'] },
    salary_min: 480000,
    salary_max: 720000,
    contract_time: 'full_time',
    contract_type: 'permanent',
    category: { label: 'IT Jobs', tag: 'it-jobs' },
  },
  {
    id: '4200099999',
    title: 'Registered Nurse',
    redirect_url: 'https://www.adzuna.co.za/land/ad/4200099999',
    company: { display_name: 'Netcare' },
    location: { display_name: 'Cape Town, Western Cape', area: ['South Africa', 'Western Cape', 'Cape Town'] },
  },
];

describe('mapAdzunaResults', () => {
  const jobs = mapAdzunaResults(sample as any);

  it('maps all results with apply/source links', () => {
    expect(jobs).toHaveLength(2);
    expect(jobs[0].applyUrl).toBe('https://www.adzuna.co.za/land/ad/4200012345');
    expect(jobs[0].sourceUrl).toBe(jobs[0].applyUrl);
    expect(jobs[0].externalId).toBe('4200012345');
  });

  it('extracts province and city from area array', () => {
    expect(jobs[0].province).toBe('Gauteng');
    expect(jobs[0].city).toBe('Johannesburg');
    expect(jobs[1].province).toBe('Western Cape');
    expect(jobs[1].city).toBe('Cape Town');
  });

  it('maps salary (annual) and employment type', () => {
    expect(jobs[0].salaryMin).toBe(480000);
    expect(jobs[0].salaryMax).toBe(720000);
    expect(jobs[0].salaryCurrency).toBe('ZAR');
    expect(jobs[0].salaryPeriod).toBe('annual');
    expect(jobs[0].employmentType).toContain('permanent');
    expect(jobs[0].employmentType).toContain('full_time');
  });

  it('maps category and posted date', () => {
    expect(jobs[0].category).toBe('IT Jobs');
    expect(jobs[0].postedDate).toBe('2026-07-10T00:00:00Z');
  });

  it('applies defaultCategory when missing', () => {
    const j = mapAdzunaResults([{ title: 'X', redirect_url: 'https://x/1' }] as any, { defaultCategory: 'General' });
    expect(j[0].category).toBe('General');
  });

  it('returns [] for empty/invalid', () => {
    expect(mapAdzunaResults([] as any)).toEqual([]);
    // @ts-expect-error runtime guard
    expect(mapAdzunaResults(null)).toEqual([]);
  });
});
