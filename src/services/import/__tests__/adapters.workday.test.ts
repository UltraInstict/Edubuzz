import { describe, it, expect } from 'vitest';
import { mapWorkdayDetail, type WorkdayConfig } from '../adapters/workday';

const config: WorkdayConfig = {
  key: 'workday:absa',
  host: 'absa.wd3.myworkdayjobs.com',
  site: 'Absa_Careers',
  company: 'Absa Group',
};

describe('mapWorkdayDetail', () => {
  const item = {
    title: 'Data Analyst',
    externalPath: '/job/Johannesburg/Data-Analyst_R-12345',
    locationsText: 'Johannesburg',
    postedOn: 'Posted 2 Days Ago',
    bulletFields: ['R-12345'],
  };
  const detail = {
    jobPostingInfo: {
      title: 'Data Analyst',
      jobDescription: '<p>Analyse <strong>data</strong>.</p>',
      location: 'Johannesburg, Gauteng',
      timeType: 'Full time',
      jobReqId: 'R-12345',
      startDate: '2026-07-05',
      endDate: '2026-08-05',
      externalUrl:
        'https://absa.wd3.myworkdayjobs.com/en-US/Absa_Careers/job/Johannesburg/Data-Analyst_R-12345',
    },
  };

  it('maps detail into a RawJob with full description + official apply URL', () => {
    const j = mapWorkdayDetail(config, item as any, detail as any);
    expect(j.externalId).toBe('R-12345');
    expect(j.title).toBe('Data Analyst');
    expect(j.company).toBe('Absa Group');
    expect(j.applyUrl).toBe(detail.jobPostingInfo.externalUrl);
    expect(j.location).toBe('Johannesburg, Gauteng');
    expect(j.employmentType).toBe('Full time');
    expect(j.descriptionHtml).toBe('<p>Analyse <strong>data</strong>.</p>');
    expect(j.postedDate).toBe('2026-07-05');
    expect(j.closingDate).toBe('2026-08-05');
  });

  it('falls back to a constructed apply URL and list fields when detail is missing', () => {
    const j = mapWorkdayDetail(config, item as any, null);
    expect(j.applyUrl).toBe(
      'https://absa.wd3.myworkdayjobs.com/Absa_Careers/job/Johannesburg/Data-Analyst_R-12345'
    );
    expect(j.title).toBe('Data Analyst');
    expect(j.externalId).toBe('R-12345');
    expect(j.location).toBe('Johannesburg');
  });
});
