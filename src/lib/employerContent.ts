/**
 * Employer-page content helpers.
 *
 * Aggregates an employer's LIVE job listings into factual page content
 * (where they hire, which fields, which job types, advertised salary
 * range) and builds FAQs from it. Everything is derived from real job
 * and employer records — when data is absent the page omits the section.
 */

import type { FaqItem } from './jobContent';

export interface EmployerJobInput {
  title?: string;
  slug?: string;
  job_type?: string;
  category?: string;
  province?: string;
  city?: string;
  salary_min?: number | null;
  salary_max?: number | null;
}

export interface EmployerFacts {
  totalListings: number;
  jobTypes: string[];
  categories: string[];
  provinces: string[];
  cities: string[];
  learnershipJobs: EmployerJobInput[];
  internshipJobs: EmployerJobInput[];
  graduateJobs: EmployerJobInput[];
  hasGovernmentRoles: boolean;
  salaryCount: number;
  salaryMin?: number;
  salaryMax?: number;
}

export interface EmployerInfoInput {
  company_name: string;
  province?: string;
  city?: string;
  website?: string;
}

function uniqueSorted(values: (string | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v || '').trim();
    if (t) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function aggregateEmployerJobs(jobs: EmployerJobInput[]): EmployerFacts {
  const facts: EmployerFacts = {
    totalListings: jobs.length,
    jobTypes: uniqueSorted(jobs.map(j => j.job_type)),
    categories: uniqueSorted(jobs.map(j => j.category)),
    provinces: uniqueSorted(jobs.map(j => j.province)),
    cities: uniqueSorted(jobs.map(j => j.city)),
    learnershipJobs: jobs.filter(j => /learnership/i.test(j.job_type || '') || /learnership/i.test(j.title || '')),
    internshipJobs: jobs.filter(j => /intern/i.test(j.job_type || '') || /internship/i.test(j.title || '')),
    graduateJobs: jobs.filter(j => /graduate|trainee|entry.level/i.test(j.job_type || '') || /graduate programme/i.test(j.title || '')),
    hasGovernmentRoles: jobs.some(j => (j.category || '').toLowerCase() === 'government'),
    salaryCount: 0,
  };

  let min: number | undefined;
  let max: number | undefined;
  for (const j of jobs) {
    const lo = j.salary_min && j.salary_min > 0 ? j.salary_min : undefined;
    const hi = j.salary_max && j.salary_max > 0 ? j.salary_max : undefined;
    if (!lo && !hi) continue;
    facts.salaryCount++;
    if (lo && (min === undefined || lo < min)) min = lo;
    if (hi && (max === undefined || hi > max)) max = hi;
  }
  facts.salaryMin = min;
  facts.salaryMax = max;
  return facts;
}

function listJoin(items: string[], max = 4): string {
  if (items.length <= max) return items.join(', ');
  return `${items.slice(0, max).join(', ')} and ${items.length - max} more`;
}

/**
 * Employer FAQs derived from real listings and employer record fields.
 */
export function buildEmployerFaqs(employer: EmployerInfoInput, facts: EmployerFacts): FaqItem[] {
  const name = employer.company_name;
  const faqs: FaqItem[] = [];

  if (facts.totalListings > 0) {
    faqs.push({
      q: `How many jobs does ${name} have open right now?`,
      a: `${name} currently has ${facts.totalListings} advertised vacanc${facts.totalListings === 1 ? 'y' : 'ies'} on Edubuzz. New positions are added as the employer advertises them, so check this page regularly.`,
    });
  } else {
    faqs.push({
      q: `Does ${name} have any jobs open right now?`,
      a: `${name} does not have any advertised vacancies on Edubuzz at the moment. New positions appear here as soon as they are advertised — browse similar employers or set up a job alert in the meantime.`,
    });
  }

  if (facts.provinces.length > 0) {
    faqs.push({
      q: `Where does ${name} hire?`,
      a: `Based on current vacancies, ${name} is hiring in ${listJoin(facts.provinces)}${facts.cities.length > 0 ? `, including ${listJoin(facts.cities)}` : ''}.`,
    });
  } else if (employer.province) {
    faqs.push({
      q: `Where is ${name} based?`,
      a: `${name} is based in ${[employer.city, employer.province].filter(Boolean).join(', ')}, South Africa.`,
    });
  }

  if (facts.categories.length > 0) {
    faqs.push({
      q: `What types of roles does ${name} hire for?`,
      a: `Current vacancies at ${name} cover ${listJoin(facts.categories)}. Browse the live listings on this page for the full picture.`,
    });
  }

  const entryRoutes: string[] = [];
  if (facts.learnershipJobs.length > 0) entryRoutes.push(`${facts.learnershipJobs.length} learnership${facts.learnershipJobs.length === 1 ? '' : 's'}`);
  if (facts.internshipJobs.length > 0) entryRoutes.push(`${facts.internshipJobs.length} internship${facts.internshipJobs.length === 1 ? '' : 's'}`);
  if (facts.graduateJobs.length > 0) entryRoutes.push(`${facts.graduateJobs.length} graduate programme${facts.graduateJobs.length === 1 ? '' : 's'}`);
  faqs.push({
    q: `Does ${name} offer learnerships, internships or graduate programmes?`,
    a: entryRoutes.length > 0
      ? `Yes — ${name} is currently advertising ${listJoin(entryRoutes)}. These entry-level opportunities are listed on this page and typically fill quickly, so apply early.`
      : `${name} is not currently advertising any learnerships, internships or graduate programmes on Edubuzz. These opportunities are usually announced at specific intake times during the year, so check back regularly.`,
  });

  faqs.push({
    q: `How do I apply for a job at ${name}?`,
    a: 'Open any listing on this page and follow the application instructions — some roles accept applications directly through Edubuzz, while others take you to the employer\'s official careers site. Always apply through the official channel shown on the listing.',
  });

  return faqs;
}
