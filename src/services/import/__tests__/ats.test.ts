import { describe, it, expect } from 'vitest';
import {
  detectAts,
  isJobBoardUrl,
  classifySource,
  sourceDomain,
  evaluateApplyUrl,
} from '../ats';

describe('detectAts', () => {
  it('detects major ATS platforms from apply URLs', () => {
    expect(detectAts('https://absa.wd3.myworkdayjobs.com/en-US/Absa_Careers/job/123')).toBe('workday');
    expect(detectAts('https://boards.greenhouse.io/acme/jobs/456')).toBe('greenhouse');
    expect(detectAts('https://jobs.lever.co/acme/abc-def')).toBe('lever');
    expect(detectAts('https://jobs.smartrecruiters.com/Acme/74000')).toBe('smartrecruiters');
    expect(detectAts('https://acme.icims.com/jobs/9911/x/job')).toBe('icims');
    expect(detectAts('https://acme.taleo.net/careersection/x/jobdetail.ftl')).toBe('taleo');
    expect(detectAts('https://performancemanager.successfactors.eu/career?company=acme')).toBe('successfactors');
    expect(detectAts('https://acme.csod.com/ux/ats/careersite/1/home')).toBe('cornerstone');
    expect(detectAts('https://jobs.ashbyhq.com/acme/uuid')).toBe('ashby');
    expect(detectAts('https://apply.workable.com/acme/j/ABC')).toBe('workable');
  });

  it('returns unknown for custom/company sites', () => {
    expect(detectAts('https://careers.transnet.net/vacancy/123')).toBe('unknown');
    expect(detectAts('')).toBe('unknown');
    expect(detectAts(undefined)).toBe('unknown');
  });
});

describe('isJobBoardUrl', () => {
  it('flags competing job boards', () => {
    expect(isJobBoardUrl('https://www.adzuna.co.za/land/ad/123')).toBe(true);
    expect(isJobBoardUrl('https://za.indeed.com/viewjob?jk=abc')).toBe(true);
    expect(isJobBoardUrl('https://www.careers24.com/jobs/adverts/123')).toBe(true);
    expect(isJobBoardUrl('https://www.pnet.co.za/jobs/x')).toBe(true);
    expect(isJobBoardUrl('https://www.linkedin.com/jobs/view/123')).toBe(true);
  });

  it('does not flag official employer/ATS domains', () => {
    expect(isJobBoardUrl('https://boards.greenhouse.io/acme/jobs/1')).toBe(false);
    expect(isJobBoardUrl('https://careers.standardbank.com/job/1')).toBe(false);
    expect(isJobBoardUrl('https://www.dpsa.gov.za/vacancies')).toBe(false);
  });
});

describe('classifySource', () => {
  it('classifies by domain', () => {
    expect(classifySource('https://www.dpsa.gov.za/vacancies/1')).toBe('government');
    expect(classifySource('https://www.uct.ac.za/careers/1')).toBe('university');
    expect(classifySource('https://careers.standardbank.com/job/1')).toBe('company');
    expect(classifySource('https://za.indeed.com/viewjob?jk=1')).toBe('job_board');
    expect(classifySource('')).toBe('unknown');
  });
});

describe('sourceDomain', () => {
  it('extracts hostname without www', () => {
    expect(sourceDomain('https://www.Absa.co.za/careers')).toBe('absa.co.za');
    expect(sourceDomain('boards.greenhouse.io/acme')).toBe('boards.greenhouse.io');
  });
});

describe('evaluateApplyUrl', () => {
  it('marks employer/ATS links as official', () => {
    const p = evaluateApplyUrl('https://boards.greenhouse.io/acme/jobs/1');
    expect(p.official).toBe(true);
    expect(p.isJobBoard).toBe(false);
    expect(p.ats).toBe('greenhouse');
  });

  it('marks job-board links as non-official policy violations', () => {
    const p = evaluateApplyUrl('https://za.indeed.com/viewjob?jk=1');
    expect(p.official).toBe(false);
    expect(p.isJobBoard).toBe(true);
    expect(p.sourceType).toBe('job_board');
  });

  it('non-http is not official', () => {
    expect(evaluateApplyUrl('mailto:jobs@acme.com').official).toBe(false);
    expect(evaluateApplyUrl('').official).toBe(false);
  });
});
