import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PB_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(PB_URL);

/** Strip unsafe HTML. Allow only whitelisted tags; strip all attributes except href on <a>. */
export function sanitizeHtml(raw: string | undefined): string {
  if (!raw) return '';
  const ALLOWED = /^(b|i|em|strong|p|br|ul|ol|li|a|h[1-6]|div|span)$/i;
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<(\/?)(\w+)([^>]*)>/g, (_match: string, slash: string, tag: string, attrs: string) => {
      if (!ALLOWED.test(tag)) return '';
      const cleanTag = tag.toLowerCase();
      if (cleanTag === 'br') return '<br>';
      if (cleanTag === 'a' && !slash) {
        const href = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
        const safe = href ? ` href="${href[1].replace(/"/g, '&quot;')}"` : '';
        return `<a${safe}>`;
      }
      return `<${slash}${cleanTag}>`;
    });
}

export function getPB(): PocketBase {
  return new PocketBase(PB_URL);
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;
  company_logo?: string;
  category: string;
  province: string;
  city: string;
  description: string;
  apply_url?: string;
  apply_email?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_type: string;
  source: string;
  source_ref?: string;
  employer_id?: string;
  views?: number;
  clicks?: number;
  apply_clicks?: number;
  featured_expires?: string;
  xml_export?: boolean;
  og_image?: string;
  featured: boolean;
  active: boolean;
  expires?: string;
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  job_count?: number;
}

export interface Application {
  id: string;
  job: string;
  job_id?: string;
  name: string;
  applicant_name?: string;
  email: string;
  applicant_email?: string;
  phone: string;
  applicant_phone?: string;
  cover_letter: string;
  cv_file?: string;
  status?: string;
  ip_address?: string;
  resume?: string;
  created: string;
}

export interface Employer {
  id: string;
  user_id?: string;
  company_name: string;
  company_slug: string;
  logo?: string;
  website?: string;
  description?: string;
  province?: string;
  city?: string;
  verified?: boolean;
  plan?: string;
  plan_expires?: string;
  contact_email: string;
  stripe_customer?: string;
  created: string;
}

export interface PendingJob {
  id: string;
  employer_name: string;
  employer_email: string;
  company: string;
  title: string;
  category?: string;
  description: string;
  province: string;
  city: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  apply_url?: string;
  apply_email?: string;
  status: 'pending' | 'approved' | 'rejected';
  created: string;
}

export interface JobAlert {
  id: string;
  email: string;
  keyword: string;
  province?: string;
  category?: string;
  created: string;
}

export const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
  'Remote',
];

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Learnership',
  'Graduate Programme',
  'Bursary',
  'Temporary',
  'Remote',
];

const JOB_FIELDS = [
  'id',
  'title',
  'slug',
  'company',
  'category',
  'province',
  'city',
  'description',
  'apply_url',
  'apply_email',
  'salary_min',
  'salary_max',
  'salary_currency',
  'job_type',
  'source',
  'source_ref',
  'employer_id',
  'views',
  'clicks',
  'apply_clicks',
  'featured_expires',
  'xml_export',
  'og_image',
  'featured',
  'active',
  'expires',
  'created',
  'updated',
].join(',');

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function escapeFilter(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function activeFilter() {
  return `active=true&&expires>"${todayIso()}"`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function escapePbFilter(value: string) {
  return escapeFilter(value);
}

export function getActiveFilter() {
  return activeFilter();
}

export async function getJobs(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  province?: string;
  category?: string;
  job_type?: string;
  salary_min?: string | number;
  salary_max?: string | number;
  sort?: string;
} = {}): Promise<{ items: Job[]; totalItems: number; totalPages: number }> {
  const pb = getPB();
  const { page = 1, perPage = 20, search, province, category, job_type, salary_min, salary_max, sort } = opts;
  const filters = [activeFilter()];

  if (search?.trim()) {
    const q = escapeFilter(search.trim());
    filters.push(`(title~"${q}"||company~"${q}"||description~"${q}")`);
  }
  if (province) filters.push(`province="${escapeFilter(province)}"`);
  if (category) filters.push(`category="${escapeFilter(category)}"`);
  if (job_type) filters.push(`job_type="${escapeFilter(job_type)}"`);
  if (salary_min) filters.push(`salary_max>=${Number(salary_min)}`);
  if (salary_max) filters.push(`salary_min<=${Number(salary_max)}`);

  const sortMap: Record<string, string> = {
    recent: '-featured,-created',
    relevant: '-featured,-created',
    salary_desc: '-salary_max,-salary_min',
    salary_asc: 'salary_min,salary_max',
  };

  const result = await pb.collection('jobs').getList(page, perPage, {
    filter: filters.join('&&'),
    sort: sortMap[sort || 'recent'] || '-featured,-created',
    fields: JOB_FIELDS,
  });

  return {
    items: result.items as unknown as Job[],
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function getJobById(id: string): Promise<Job | null> {
  const pb = getPB();
  try {
    return await pb.collection('jobs').getOne(id, { fields: JOB_FIELDS }) as unknown as Job;
  } catch {
    return null;
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const pb = getPB();
  try {
    const result = await pb.collection('jobs').getFirstListItem(`slug="${escapeFilter(slug)}"`, {
      fields: JOB_FIELDS,
    });
    return result as unknown as Job;
  } catch {
    return null;
  }
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  const pb = getPB();
  const result = await pb.collection('jobs').getList(1, limit, {
    filter: `${activeFilter()}&&featured=true`,
    sort: '-created',
    fields: JOB_FIELDS,
  });
  return result.items as unknown as Job[];
}

export async function getRelatedJobs(category: string, excludeId: string, limit = 4): Promise<Job[]> {
  if (!category) return [];
  const pb = getPB();
  const result = await pb.collection('jobs').getList(1, limit, {
    filter: `${activeFilter()}&&category="${escapeFilter(category)}"&&id!="${escapeFilter(excludeId)}"`,
    sort: '-created',
    fields: 'id,title,slug,company,city,province,category,job_type,created,featured,salary_min,salary_max,description,active,expires',
  });
  return result.items as unknown as Job[];
}

export async function getAllJobSlugs(): Promise<string[]> {
  const pb = getPB();
  const result = await pb.collection('jobs').getFullList({
    filter: activeFilter(),
    fields: 'slug',
  });
  return result.map((job: any) => job.slug);
}

export async function getCategories(limit?: number): Promise<Category[]> {
  const pb = getPB();
  if (limit) {
    const result = await pb.collection('categories').getList(1, limit, {
      sort: '-job_count,name',
      fields: 'id,name,slug,job_count',
    });
    return result.items as unknown as Category[];
  }
  const result = await pb.collection('categories').getFullList({
    sort: '-job_count,name',
    fields: 'id,name,slug,job_count',
  });
  return result as unknown as Category[];
}

export async function getCategoriesWithCounts(): Promise<(Category & { count: number })[]> {
  const pb = getPB();
  const [categories, jobs] = await Promise.all([
    pb.collection('categories').getFullList({ sort: 'name', fields: 'id,name,slug' }),
    pb.collection('jobs').getFullList({ filter: activeFilter(), fields: 'category', perPage: 5000 }),
  ]);
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    const cat = (job as any).category;
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  }
  return (categories as any[]).map((cat: any) => ({
    ...cat,
    count: counts[cat.name] || 0,
  }));
}

export async function getEmployers(opts: { page?: number; perPage?: number; province?: string; verifiedOnly?: boolean } = {}) {
  const client = getPB();
  const filters: string[] = [];
  if (opts.province) filters.push(`province="${escapeFilter(opts.province)}"`);
  if (opts.verifiedOnly) filters.push('verified=true');
  return await client.collection('employers').getList(opts.page || 1, opts.perPage || 20, {
    filter: filters.join('&&'),
    sort: '-verified,company_name',
  });
}

export async function getEmployerBySlug(slug: string): Promise<Employer | null> {
  const client = getPB();
  try {
    return await client.collection('employers').getFirstListItem(`company_slug="${escapeFilter(slug)}"`) as unknown as Employer;
  } catch {
    return null;
  }
}

export async function getEmployerForUser(userId: string): Promise<Employer | null> {
  const client = getPB();
  try {
    return await client.collection('employers').getFirstListItem(`user_id="${escapeFilter(userId)}"`) as unknown as Employer;
  } catch {
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const pb = getPB();
  try {
    return await pb.collection('categories').getFirstListItem(`slug="${escapeFilter(slug)}"`) as unknown as Category;
  } catch {
    return null;
  }
}

export async function submitApplication(data: {
  job: string;
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
}): Promise<Application> {
  const pb = getPB();
  return await pb.collection('applications').create(data) as unknown as Application;
}

export async function submitEmployerJob(data: Omit<PendingJob, 'id' | 'status' | 'created'>): Promise<PendingJob> {
  const pb = getPB();
  return await pb.collection('pending_jobs').create({ ...data, status: 'pending' }) as unknown as PendingJob;
}

export async function createJobAlert(data: {
  email: string;
  keyword: string;
  province?: string;
  category?: string;
}): Promise<JobAlert> {
  const pb = getPB();
  return await pb.collection('job_alerts').create(data) as unknown as JobAlert;
}

export async function getSiteStats(): Promise<{ jobs: number; companies: number; categories: number }> {
  const pb = getPB();
  try {
    const [jobsResult, categoriesResult] = await Promise.all([
      pb.collection('jobs').getList(1, 1, { filter: activeFilter(), fields: 'id' }),
      pb.collection('categories').getList(1, 1, { fields: 'id' }),
    ]);
    return {
      jobs: jobsResult.totalItems,
      companies: 0,
      categories: categoriesResult.totalItems,
    };
  } catch {
    return { jobs: 0, companies: 0, categories: 0 };
  }
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (value: number) => `R${Number(value).toLocaleString('en-ZA')}`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}/month`;
  if (min) return `From ${fmt(min)}/month`;
  return `Up to ${fmt(max!)}/month`;
}

export function isSalaryDisclosed(min?: number | null, max?: number | null) {
  return Boolean(min || max);
}
