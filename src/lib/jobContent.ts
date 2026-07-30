/**
 * Job-page content helpers.
 *
 * Builds the value-add editorial layer for job detail pages (application
 * advice, interview preparation, FAQs, related-guide resolution) strictly
 * from REAL job record fields. Nothing here may invent salary figures,
 * dates, qualifications, benefits or employer facts — when a field is
 * absent the copy says so honestly or the section is omitted by the page.
 */

import { slugify } from '../services/import/normalize';
import { SALARY_GUIDES, type SalaryGuide } from '../content/salary-guides';
import { INDUSTRY_HUBS, type IndustryHub } from '../content/industry-hubs';
import { PROVINCE_HUBS, type ProvinceHub } from '../content/province-hubs';

export interface JobContentInput {
  title?: string;
  company?: string;
  category?: string;
  province?: string;
  city?: string;
  job_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  apply_url?: string;
  apply_email?: string;
  expires?: string;
  created?: string;
  responsibilities?: string;
  requirements?: string;
  company_website?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Minimum stripped-description length for a job page to serve ads. */
export const MIN_DESCRIPTION_FOR_ADS = 250;

export function isJobPageAdsEligible(descriptionTextLength: number): boolean {
  return descriptionTextLength >= MIN_DESCRIPTION_FOR_ADS;
}

export function findSalaryGuide(category?: string): SalaryGuide | undefined {
  if (!category) return undefined;
  const slug = slugify(category);
  return SALARY_GUIDES.find(g => g.categorySlug === slug);
}

export function findIndustryHub(category?: string): IndustryHub | undefined {
  if (!category) return undefined;
  const slug = slugify(category);
  return INDUSTRY_HUBS.find(h => h.categorySlug === slug);
}

export function findProvinceHub(province?: string): ProvinceHub | undefined {
  if (!province) return undefined;
  const slug = slugify(province);
  return PROVINCE_HUBS.find(h => h.slug === slug);
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function locationLabel(job: JobContentInput): string {
  if (job.city && job.province) return `${job.city}, ${job.province}`;
  if (job.province) return job.province;
  return 'South Africa';
}

function isRemoteJob(job: JobContentInput): boolean {
  return /remote/i.test(job.job_type || '') || /remote/i.test(job.title || '') || slugify(job.province || '') === 'remote';
}

function isGovernmentJob(job: JobContentInput): boolean {
  return slugify(job.category || '') === 'government';
}

function salaryDisclosed(job: JobContentInput): boolean {
  return Boolean((job.salary_min && job.salary_min > 0) || (job.salary_max && job.salary_max > 0));
}

/**
 * Application steps grounded in the real apply method and closing date.
 * Generic guidance is framed as guidance; specific facts come only from
 * the job record.
 */
export function buildApplicationSteps(job: JobContentInput): string[] {
  const steps: string[] = [
    'Read the full job description and requirements on this page carefully before applying — tailor your application to what the employer actually asks for.',
    'Update your CV and save it as a PDF. Make sure your contact details, most recent experience and qualifications are easy to find.',
  ];

  if (job.apply_email) {
    steps.push('Submit your application through the application form on this page. It goes directly to the employer together with your CV and cover letter.');
  } else if (job.apply_url) {
    steps.push(`Click the apply button on this page to complete your application on ${job.company ? `${job.company}'s` : "the employer's"} own careers site. The employer manages the shortlisting process directly.`);
  }

  if (isGovernmentJob(job)) {
    steps.push('For government posts, complete and sign a Z83 application form (the standard public service application form) and quote the exact reference number from the advert. Incomplete Z83 forms are routinely disqualified.');
  }

  steps.push('Have certified copies of your ID and qualifications ready. Many South African employers request them once you are shortlisted.');

  const closing = formatDate(job.expires);
  if (closing) {
    steps.push(`Applications close on ${closing}. Submit well before the deadline — late applications are normally not considered.`);
  } else {
    steps.push('The employer has not stated a closing date, so apply as soon as possible — listings can be removed once enough applications are received.');
  }

  steps.push('Keep a record of what you submitted and when. If you have not heard back within a few weeks of the closing date, it is acceptable to follow up politely.');

  return steps;
}

/**
 * Interview preparation guidance. References the real job title, company
 * and (when present) the listed responsibilities/requirements — never
 * invents interview details on the employer's behalf.
 */
export function buildInterviewTips(job: JobContentInput): string[] {
  const company = job.company || 'the employer';
  const tips: string[] = [];

  if (job.company_website) {
    tips.push(`Research ${company} before the interview — their website, recent news and the customers or communities they serve. Interviewers expect you to know why you want to work there specifically.`);
  } else {
    tips.push(`Research ${company} before the interview — look for their official website, social profiles and any recent news. Interviewers expect you to know why you want to work there specifically.`);
  }

  if (job.responsibilities || job.requirements) {
    tips.push('Go through the responsibilities and requirements listed above and prepare a specific example from your own experience for each of the key ones. Most interview questions will be drawn from that list.');
  } else {
    tips.push('Go through the job description above and prepare a specific example from your own experience for each of the main duties. Most interview questions will be drawn from what the advert emphasises.');
  }

  tips.push('Structure your answers with the STAR method — Situation, Task, Action, Result. Concrete stories with measurable outcomes are far stronger than general claims about your abilities.');

  if (isGovernmentJob(job)) {
    tips.push('For government interviews, expect a panel. Bring certified copies of your ID, qualifications and driver\'s licence (if applicable), and be ready to speak to the exact requirements in the advert.');
  } else {
    tips.push('Prepare two or three thoughtful questions to ask the panel — about the team, how success is measured in the role, or growth opportunities. It signals genuine interest.');
  }

  if (isRemoteJob(job)) {
    tips.push('This is a remote role, so the interview may happen over video. Test your camera, microphone and internet connection beforehand, and choose a quiet, well-lit space.');
  } else {
    tips.push(`Plan your logistics early. Confirm whether the interview is in person${job.city ? ` in ${job.city}` : ''} or online, and arrive or log in at least ten minutes early.`);
  }

  return tips;
}

/**
 * FAQs answered purely from real job fields. Missing facts are stated
 * honestly — these double as FAQPage structured data.
 */
export function buildJobFaqs(job: JobContentInput, salaryDisplay: string): FaqItem[] {
  const faqs: FaqItem[] = [];
  const title = job.title || 'this position';
  const company = job.company || 'the employer';
  const closing = formatDate(job.expires);

  faqs.push({
    q: `What is the closing date for the ${title} job at ${company}?`,
    a: closing
      ? `Applications for the ${title} position at ${company} close on ${closing}. Apply before the deadline — late applications are usually not considered.`
      : `${company} has not specified a closing date for the ${title} position. Apply as soon as possible, because the listing can be removed once enough applications are received.`,
  });

  faqs.push({
    q: `What is the salary for the ${title} position?`,
    a: salaryDisclosed(job)
      ? `The advertised salary for this position is ${salaryDisplay}. Final offers depend on your experience and qualifications.`
      : `The salary for the ${title} position is not disclosed in the listing. It will typically be discussed during the interview process or included in the offer stage.`,
  });

  if (isRemoteJob(job)) {
    faqs.push({
      q: `Is the ${title} job at ${company} remote?`,
      a: `Yes. This position is advertised as remote, which means you can work from anywhere in South Africa unless the employer states otherwise in the description above.`,
    });
  } else {
    faqs.push({
      q: `Where is the ${title} job at ${company} based?`,
      a: `This position is based in ${locationLabel(job)}. Check the job description for any travel, hybrid or relocation details the employer may have included.`,
    });
  }

  if (job.apply_email) {
    faqs.push({
      q: `How do I apply for the ${title} job at ${company}?`,
      a: 'Apply directly on this page using the application form. You will need your name, email address and an up-to-date CV in PDF format. Your application goes straight to the employer.',
    });
  } else if (job.apply_url) {
    faqs.push({
      q: `How do I apply for the ${title} job at ${company}?`,
      a: `Click the apply button on this page — you will be taken to ${company}'s official careers site to complete your application. Only applications submitted through the employer's official channel are considered.`,
    });
  }

  if (job.job_type) {
    faqs.push({
      q: `What type of employment is the ${title} position?`,
      a: `This is a ${job.job_type} position in the ${job.category || 'general'} sector${job.province ? `, based in ${locationLabel(job)}` : ''}.`,
    });
  }

  return faqs;
}
