import { describe, it, expect } from 'vitest';
import { aggregateEmployerJobs, buildEmployerFaqs, type EmployerJobInput } from '../employerContent';

const jobs: EmployerJobInput[] = [
  { title: 'Admin Clerk', job_type: 'Full-time', category: 'Government', province: 'Gauteng', city: 'Pretoria', salary_min: 15000, salary_max: 20000 },
  { title: 'Finance Intern', job_type: 'Internship', category: 'Finance', province: 'Gauteng', city: 'Johannesburg' },
  { title: 'IT Learnership', job_type: 'Learnership', category: 'IT & Technology', province: 'Western Cape', city: 'Cape Town' },
  { title: 'Graduate Engineer', job_type: 'Graduate Programme', category: 'Engineering', province: 'Gauteng', city: 'Johannesburg', salary_min: 25000, salary_max: 30000 },
];

describe('aggregateEmployerJobs', () => {
  it('counts listings and dedupes dimensions', () => {
    const facts = aggregateEmployerJobs(jobs);
    expect(facts.totalListings).toBe(4);
    expect(facts.provinces).toEqual(['Gauteng', 'Western Cape']);
    expect(facts.categories).toContain('Finance');
    expect(facts.jobTypes).toContain('Internship');
  });

  it('detects entry-level opportunities by job type and title', () => {
    const facts = aggregateEmployerJobs(jobs);
    expect(facts.internshipJobs).toHaveLength(1);
    expect(facts.learnershipJobs).toHaveLength(1);
    expect(facts.graduateJobs).toHaveLength(1);
  });

  it('aggregates advertised salary range only from disclosing jobs', () => {
    const facts = aggregateEmployerJobs(jobs);
    expect(facts.salaryCount).toBe(2);
    expect(facts.salaryMin).toBe(15000);
    expect(facts.salaryMax).toBe(30000);
  });

  it('handles empty job lists without crashing', () => {
    const facts = aggregateEmployerJobs([]);
    expect(facts.totalListings).toBe(0);
    expect(facts.salaryCount).toBe(0);
    expect(facts.salaryMin).toBeUndefined();
  });

  it('flags government roles by category', () => {
    expect(aggregateEmployerJobs(jobs).hasGovernmentRoles).toBe(true);
    expect(aggregateEmployerJobs([{ title: 'Cashier', category: 'Retail' }]).hasGovernmentRoles).toBe(false);
  });
});

describe('buildEmployerFaqs', () => {
  const employer = { company_name: 'Transnet', province: 'Gauteng', city: 'Johannesburg' };

  it('states the real open-position count', () => {
    const faqs = buildEmployerFaqs(employer, aggregateEmployerJobs(jobs));
    expect(faqs.find(f => f.q.includes('How many jobs'))?.a).toContain('4 advertised vacancies');
  });

  it('is honest when there are no vacancies', () => {
    const faqs = buildEmployerFaqs(employer, aggregateEmployerJobs([]));
    expect(faqs.find(f => f.q.includes('any jobs open'))?.a).toContain('does not have any advertised vacancies');
  });

  it('lists real hiring locations from live listings', () => {
    const faqs = buildEmployerFaqs(employer, aggregateEmployerJobs(jobs));
    const where = faqs.find(f => f.q.includes('Where does'));
    expect(where?.a).toContain('Gauteng');
    expect(where?.a).toContain('Western Cape');
  });

  it('reports entry-level routes only when real listings exist', () => {
    const withRoutes = buildEmployerFaqs(employer, aggregateEmployerJobs(jobs));
    expect(withRoutes.find(f => f.q.includes('learnerships'))?.a).toContain('Yes');

    const withoutRoutes = buildEmployerFaqs(employer, aggregateEmployerJobs([jobs[0]]));
    expect(withoutRoutes.find(f => f.q.includes('learnerships'))?.a).toContain('not currently advertising');
  });

  it('never interpolates undefined or null', () => {
    const faqs = buildEmployerFaqs({ company_name: 'Shoprite' }, aggregateEmployerJobs([{ title: 'Cashier' }]));
    const all = faqs.flatMap(f => [f.q, f.a]);
    expect(all.every(t => !/undefined|null|\[object/.test(t))).toBe(true);
  });
});
