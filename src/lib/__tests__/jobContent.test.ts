import { describe, it, expect } from 'vitest';
import {
  buildApplicationSteps,
  buildInterviewTips,
  buildJobFaqs,
  findIndustryHub,
  findProvinceHub,
  findSalaryGuide,
  isJobPageAdsEligible,
  MIN_DESCRIPTION_FOR_ADS,
  type JobContentInput,
} from '../jobContent';

const baseJob: JobContentInput = {
  title: 'Admin Clerk',
  company: 'City of Cape Town',
  category: 'Government',
  province: 'Western Cape',
  city: 'Cape Town',
  job_type: 'Full-time',
  apply_url: 'https://careers.example.gov.za/apply/123',
  expires: '2026-08-15T00:00:00.000Z',
  created: '2026-07-20T00:00:00.000Z',
};

function noUndefinedStrings(texts: string[]) {
  return texts.every(t => !/undefined|null|\[object/.test(t));
}

describe('buildJobFaqs', () => {
  it('includes the real closing date when present', () => {
    const faqs = buildJobFaqs(baseJob, 'Not disclosed');
    const closing = faqs.find(f => f.q.includes('closing date'));
    expect(closing?.a).toContain('15 August 2026');
  });

  it('is honest when no closing date exists', () => {
    const faqs = buildJobFaqs({ ...baseJob, expires: undefined }, 'Not disclosed');
    const closing = faqs.find(f => f.q.includes('closing date'));
    expect(closing?.a).toContain('has not specified a closing date');
  });

  it('quotes the real salary range when disclosed', () => {
    const faqs = buildJobFaqs({ ...baseJob, salary_min: 15000, salary_max: 22000 }, 'R15 000 - R22 000/month');
    const salary = faqs.find(f => f.q.includes('salary'));
    expect(salary?.a).toContain('R15 000 - R22 000/month');
  });

  it('states salary is not disclosed when absent', () => {
    const faqs = buildJobFaqs(baseJob, 'Not disclosed');
    const salary = faqs.find(f => f.q.includes('salary'));
    expect(salary?.a).toContain('not disclosed');
  });

  it('answers remote FAQ for remote jobs', () => {
    const faqs = buildJobFaqs({ ...baseJob, job_type: 'Remote', province: 'Remote', city: '' }, 'Not disclosed');
    expect(faqs.some(f => f.q.startsWith('Is the') && f.a.includes('remote'))).toBe(true);
  });

  it('answers location FAQ for on-site jobs', () => {
    const faqs = buildJobFaqs(baseJob, 'Not disclosed');
    const loc = faqs.find(f => f.q.includes('based'));
    expect(loc?.a).toContain('Cape Town, Western Cape');
  });

  it('describes the on-page form when apply_email exists', () => {
    const faqs = buildJobFaqs({ ...baseJob, apply_url: undefined, apply_email: 'hr@example.com' }, 'Not disclosed');
    const how = faqs.find(f => f.q.startsWith('How do I apply'));
    expect(how?.a).toContain('application form');
  });

  it('never interpolates undefined or null into any FAQ', () => {
    const minimal: JobContentInput = { title: 'Driver' };
    const faqs = buildJobFaqs(minimal, 'Not disclosed');
    expect(noUndefinedStrings(faqs.flatMap(f => [f.q, f.a]))).toBe(true);
  });
});

describe('buildApplicationSteps', () => {
  it('points to the on-page form when apply_email is set', () => {
    const steps = buildApplicationSteps({ ...baseJob, apply_url: undefined, apply_email: 'hr@example.com' });
    expect(steps.some(s => s.includes('application form on this page'))).toBe(true);
  });

  it('points to the employer careers site when only apply_url is set', () => {
    const steps = buildApplicationSteps(baseJob);
    expect(steps.some(s => s.includes("City of Cape Town's") && s.includes('careers site'))).toBe(true);
  });

  it('adds Z83 guidance only for government jobs', () => {
    expect(buildApplicationSteps(baseJob).some(s => s.includes('Z83'))).toBe(true);
    expect(buildApplicationSteps({ ...baseJob, category: 'Retail' }).some(s => s.includes('Z83'))).toBe(false);
  });

  it('includes the real closing date, or urgency advice when absent', () => {
    expect(buildApplicationSteps(baseJob).some(s => s.includes('15 August 2026'))).toBe(true);
    expect(buildApplicationSteps({ ...baseJob, expires: undefined }).some(s => s.includes('as soon as possible'))).toBe(true);
  });

  it('never interpolates undefined or null', () => {
    const steps = buildApplicationSteps({ title: 'Cashier' });
    expect(noUndefinedStrings(steps)).toBe(true);
  });
});

describe('buildInterviewTips', () => {
  it('references the real company', () => {
    expect(buildInterviewTips(baseJob).some(t => t.includes('City of Cape Town'))).toBe(true);
  });

  it('points at listed responsibilities when present', () => {
    const tips = buildInterviewTips({ ...baseJob, responsibilities: '<ul><li>File documents</li></ul>' });
    expect(tips.some(t => t.includes('responsibilities and requirements listed above'))).toBe(true);
  });

  it('adds video-interview advice for remote roles', () => {
    const tips = buildInterviewTips({ ...baseJob, job_type: 'Remote' });
    expect(tips.some(t => t.includes('camera'))).toBe(true);
  });

  it('never interpolates undefined or null', () => {
    expect(noUndefinedStrings(buildInterviewTips({ title: 'Nurse' }))).toBe(true);
  });
});

describe('related-guide resolution', () => {
  it('resolves a salary guide by category name', () => {
    expect(findSalaryGuide('Education')?.slug).toBe('teacher-salary-south-africa');
  });

  it('returns undefined for unmapped categories', () => {
    expect(findSalaryGuide('Underwater Basket Weaving')).toBeUndefined();
  });

  it('resolves an industry hub by category name', () => {
    expect(findIndustryHub('Government')?.slug).toBe('government');
  });

  it('resolves a province hub by province name', () => {
    expect(findProvinceHub('Gauteng')?.hubSlug).toBe('gauteng-careers');
  });

  it('returns undefined for non-province values', () => {
    expect(findProvinceHub('Remote')).toBeUndefined();
  });
});

describe('isJobPageAdsEligible', () => {
  it('allows ads at or above the threshold', () => {
    expect(isJobPageAdsEligible(MIN_DESCRIPTION_FOR_ADS)).toBe(true);
    expect(isJobPageAdsEligible(5000)).toBe(true);
  });

  it('blocks ads on thin descriptions', () => {
    expect(isJobPageAdsEligible(0)).toBe(false);
    expect(isJobPageAdsEligible(MIN_DESCRIPTION_FOR_ADS - 1)).toBe(false);
  });
});
