import PocketBase from 'pocketbase';

// ─── Client ────────────────────────────────────────────────────────────────
const PB_URL = 'http://127.0.0.1:8090';

export function getPB(): PocketBase {
  return new PocketBase(PB_URL);
}

// ─── Types ──────────────────────────────────────────────────────────────────
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
  job_type: string;
  source: string;
  featured: boolean;
  ai_written: boolean;
  active: boolean;
  expires?: string;
  created: string;
  updated: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  job_count?: number;
}

export interface Application {
  id: string;
  job: string;
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume?: string;
  created: string;
}

export interface PendingJob {
  id: string;
  employer_name: string;
  employer_email: string;
  company: string;
  title: string;
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

// ─── Jobs ───────────────────────────────────────────────────────────────────
export async function getJobs(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  province?: string;
  category?: string;
  job_type?: string;
} = {}): Promise<{ items: Job[]; totalItems: number; totalPages: number }> {
  const pb = getPB();
  const { page = 1, perPage = 20, search, province, category, job_type } = opts;

  const filters: string[] = ['active = true'];
  if (search) filters.push(`(title ~ "${search}" || company ~ "${search}" || description ~ "${search}")`);
  if (province) filters.push(`province = "${province}"`);
  if (category) filters.push(`category = "${category}"`);
  if (job_type) filters.push(`job_type = "${job_type}"`);

  const result = await pb.collection('jobs').getList(page, perPage, {
    filter: filters.join(' && '),
    sort: '-featured,-created',
  });

  return {
    items: result.items as unknown as Job[],
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const pb = getPB();
  try {
    const result = await pb.collection('jobs').getFirstListItem(`slug = "${slug}"`);
    return result as unknown as Job;
  } catch {
    return null;
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  const pb = getPB();
  try {
    return await pb.collection('jobs').getOne(id) as unknown as Job;
  } catch {
    return null;
  }
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  const pb = getPB();
  const result = await pb.collection('jobs').getList(1, limit, {
    filter: 'active = true && featured = true',
    sort: '-created',
  });
  return result.items as unknown as Job[];
}

export async function getRelatedJobs(category: string, excludeId: string, limit = 4): Promise<Job[]> {
  const pb = getPB();
  const result = await pb.collection('jobs').getList(1, limit, {
    filter: `active = true && category = "${category}" && id != "${excludeId}"`,
    sort: '-created',
  });
  return result.items as unknown as Job[];
}

export async function getAllJobSlugs(): Promise<string[]> {
  const pb = getPB();
  const result = await pb.collection('jobs').getFullList({
    filter: 'active = true',
    fields: 'slug',
  });
  return result.map((j: any) => j.slug);
}

// ─── Categories ─────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const pb = getPB();
  const result = await pb.collection('categories').getFullList({ sort: 'name' });
  return result as unknown as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const pb = getPB();
  try {
    return await pb.collection('categories').getFirstListItem(`slug = "${slug}"`) as unknown as Category;
  } catch {
    return null;
  }
}

// ─── Applications ────────────────────────────────────────────────────────────
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

// ─── Pending jobs (employer posts) ──────────────────────────────────────────
export async function submitEmployerJob(data: Omit<PendingJob, 'id' | 'status' | 'created'>): Promise<PendingJob> {
  const pb = getPB();
  return await pb.collection('pending_jobs').create({ ...data, status: 'pending' }) as unknown as PendingJob;
}

// ─── Job alerts ─────────────────────────────────────────────────────────────
export async function createJobAlert(data: {
  email: string;
  keyword: string;
  province?: string;
  category?: string;
}): Promise<JobAlert> {
  const pb = getPB();
  return await pb.collection('job_alerts').create(data) as unknown as JobAlert;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export async function getSiteStats(): Promise<{ jobs: number; companies: number; categories: number }> {
  const pb = getPB();
  try {
    const [jobsResult, categoriesResult] = await Promise.all([
      pb.collection('jobs').getList(1, 1, { filter: 'active = true' }),
      pb.collection('categories').getList(1, 1),
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Negotiable';
  const fmt = (n: number) => `R${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} p/a`;
  if (min) return `From ${fmt(min)} p/a`;
  return `Up to ${fmt(max!)} p/a`;
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Free State',
];

export const JOB_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Remote',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Government:     'bg-accent-light text-accent',
  Health:         'bg-success-light text-success',
  'IT & Tech':    'bg-purple-light text-purple',
  Engineering:    'bg-warn-light text-warn',
  Finance:        'bg-danger-light text-danger',
  Education:      'bg-green-50 text-green-700',
  Retail:         'bg-orange-50 text-orange-600',
  Logistics:      'bg-cyan-50 text-cyan-700',
  HR:             'bg-pink-50 text-pink-700',
  Administration: 'bg-gray-100 text-gray-600',
  Marketing:      'bg-indigo-50 text-indigo-700',
  Hospitality:    'bg-amber-50 text-amber-700',
};
