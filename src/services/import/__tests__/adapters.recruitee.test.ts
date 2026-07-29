import { describe, it, expect } from 'vitest';
import { parseRecruiteeOffers, buildRecruiteeDescription } from '../adapters/recruitee';

describe('parseRecruiteeOffers', () => {
  it('maps published offers to RawJob with apply URL and combined description', () => {
    const payload = {
      offers: [
        {
          id: 101,
          title: 'Data Analyst',
          status: 'published',
          description: '<p>Analyse data</p>',
          requirements: '<ul><li>SQL</li></ul>',
          city: 'Johannesburg',
          state_name: 'Gauteng',
          country: 'South Africa',
          careers_url: 'https://acme.recruitee.com/o/data-analyst',
          careers_apply_url: 'https://acme.recruitee.com/o/data-analyst/c/new',
          department: 'Analytics',
          employment_type_code: 'fulltime',
          published_at: '2026-07-01',
        },
      ],
    };
    const jobs = parseRecruiteeOffers(payload, 'Acme');
    expect(jobs).toHaveLength(1);
    const j = jobs[0];
    expect(j.title).toBe('Data Analyst');
    expect(j.applyUrl).toContain('/c/new');
    expect(j.city).toBe('Johannesburg');
    expect(j.province).toBe('Gauteng');
    expect(j.country).toBe('South Africa');
    expect(j.employmentType).toBe('Full-time');
    expect(j.category).toBe('Analytics');
    expect(j.descriptionHtml).toContain('Analyse data');
    expect(j.descriptionHtml).toContain('Requirements');
  });

  it('excludes non-published offers', () => {
    const jobs = parseRecruiteeOffers({ offers: [{ title: 'Draft', status: 'draft', careers_url: 'x' }] } as any, 'Acme');
    expect(jobs).toHaveLength(0);
  });

  it('drops offers without title or apply URL', () => {
    const jobs = parseRecruiteeOffers({ offers: [{ title: '', careers_url: 'x' }, { title: 'No URL' }] } as any, 'Acme');
    expect(jobs).toHaveLength(0);
  });

  it('buildRecruiteeDescription combines description + requirements', () => {
    const html = buildRecruiteeDescription({ description: '<p>A</p>', requirements: '<p>B</p>' });
    expect(html).toContain('A');
    expect(html).toContain('Requirements');
    expect(html).toContain('B');
  });

  it('handles empty payload safely', () => {
    expect(parseRecruiteeOffers({} as any, 'Acme')).toEqual([]);
  });
});
