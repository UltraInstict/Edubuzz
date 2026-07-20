import { describe, it, expect } from 'vitest';
import {
  buildSmartRecruitersDescription,
  mapSmartRecruitersJob,
} from '../adapters/smartrecruiters';

describe('buildSmartRecruitersDescription', () => {
  it('concatenates all job-ad sections in order, FULL text, with headings', () => {
    const html = buildSmartRecruitersDescription({
      jobAd: {
        sections: {
          jobDescription: { title: 'Job Description', text: '<p>Do the work</p>' },
          companyDescription: { title: 'Company Description', text: '<p>About us</p>' },
          qualifications: { title: 'Qualifications', text: '<p>Degree</p>' },
          additionalInformation: { title: 'Additional Information', text: '<p>Notes</p>' },
        },
      },
    });
    // company first, then job, then qualifications, then additional
    expect(html.indexOf('About us')).toBeLessThan(html.indexOf('Do the work'));
    expect(html.indexOf('Do the work')).toBeLessThan(html.indexOf('Degree'));
    expect(html.indexOf('Degree')).toBeLessThan(html.indexOf('Notes'));
    expect(html).toContain('<h3>Company Description</h3>');
  });
});

describe('mapSmartRecruitersJob', () => {
  const item = {
    id: '743999',
    name: 'Claims Consultant',
    releasedDate: '2026-07-10T08:00:00.000Z',
    location: { city: 'Centurion', region: 'Gauteng', country: 'za', remote: false },
    typeOfEmployment: { label: 'Full-time' },
    department: { label: 'Claims' },
    company: { identifier: 'OUTsurance', name: 'OUTsurance' },
  };
  const detail = {
    id: '743999',
    jobAd: { sections: { jobDescription: { title: 'Job Description', text: '<p>Handle claims</p>' } } },
    location: { city: 'Centurion', region: 'Gauteng', country: 'za', remote: false },
    typeOfEmployment: { label: 'Full-time' },
  };

  it('builds the official apply URL and merges list+detail fields', () => {
    const j = mapSmartRecruitersJob('OUTsurance', 'OUTsurance', item as any, detail as any);
    expect(j.externalId).toBe('743999');
    expect(j.applyUrl).toBe('https://jobs.smartrecruiters.com/OUTsurance/743999');
    expect(j.title).toBe('Claims Consultant');
    expect(j.city).toBe('Centurion');
    expect(j.province).toBe('Gauteng');
    expect(j.employmentType).toBe('Full-time');
    expect(j.category).toBe('Claims');
    expect(j.descriptionHtml).toContain('<p>Handle claims</p>');
    expect(j.postedDate).toBe('2026-07-10T08:00:00.000Z');
  });

  it('marks remote roles and tolerates a missing detail', () => {
    const remoteItem = { ...item, location: { remote: true } };
    const j = mapSmartRecruitersJob('OUTsurance', 'OUTsurance', remoteItem as any, null);
    expect(j.location).toBe('Remote');
    expect(j.descriptionHtml).toBeUndefined();
    expect(j.applyUrl).toBe('https://jobs.smartrecruiters.com/OUTsurance/743999');
  });
});
