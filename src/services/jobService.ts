/**
 * Job Service — clear separation between data access and business logic.
 * All PocketBase queries for jobs, categories, employers live here.
 * Astro pages should only call these functions, never PocketBase directly.
 */

import PocketBase from 'pocketbase';
import type { Job, Category, Employer } from '../lib/pocketbase';

const PB_URL = import.meta.env.PB_URL ?? 'http://127.0.0.1:8090';

function pb(): PocketBase {
  return new PocketBase(PB_URL);
}

const JOB_LIST_FIELDS = [
  'id', 'title', 'slug', 'company', 'category', 'province', 'city',
  'job_type', 'salary_min', 'salary_max', 'featured', 'active', 'expires',
  'created', 'views', 'clicks', 'apply_clicks', 'apply_url', 'apply_email',
  'employer_id', 'source',
].join(',');

const JOB_FULL_FIELDS = [
  ...JOB_LIST_FIELDS.split(','),
  'description', 'employer_website', 'company_logo',
  'xml_export', 'og_image', 'updated',
].join(',');

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function esc(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export interface JobFilter {
  page?: number;
  perPage?: number;
  search?: string;
  province?: string;
  category?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  sort?: 'recent' | 'salary_desc' | 'salary_asc';
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  perPage: number;
}

// ─── JOBS ──────────────────────────────────────────────────────────────────

export async function listJobs(filter: JobFilter = {}): Promise<PaginatedResult<Partial<Job>>> {
  const { page = 1, perPage = 20, search, province, category, jobType, salaryMin, salaryMax, sort = 'recent' } = filter;
  const filters: string[] = [`active=true`, `expires>"${todayIso()}"`];

  if (search?.trim()) {
    const q = esc(search.trim());
    filters.push(`(title~"${q}"||company~"${q}"||description~"${q}")`);
  }
  if (province) filters.push(`province="${esc(province)}"`);
  if (category) filters.push(`category="${esc(category)}"`);
  if (jobType) filters.push(`job_type="${esc(jobType)}"`);
  if (salaryMin) filters.push(`salary_max>=${salaryMin}`);
  if (salaryMax) filters.push(`salary_min<=${salaryMax}`);

  const sortMap: Record<string, string> = {
    recent: '-featured,-created',
    salary_desc: '-salary_max,-salary_min',
    salary_asc: 'salary_min,salary_max',
  };

  const result = await pb().collection('jobs').getList(page, perPage, {
    filter: filters.join('&&'),
    sort: sortMap[sort] || '-featured,-created',
    fields: JOB_LIST_FIELDS,
  });

  return {
    items: result.items as unknown as Partial<Job>[],
    totalItems: result.totalItems,
    totalPages: result.totalPages,
    page,
    perPage,
  };
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    return await pb().collection('jobs').getFirstListItem(`slug="${esc(slug)}"`, {
      fields: JOB_FULL_FIELDS,
    }) as unknown as Job;
  } catch {
    return null;
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    return await pb().collection('jobs').getOne(id, { fields: JOB_FULL_FIELDS }) as unknown as Job;
  } catch {
    return null;
  }
}

export async function getFeaturedJobs(limit = 6): Promise<Partial<Job>[]> {
  const result = await pb().collection('jobs').getList(1, limit, {
    filter: `active=true&&expires>"${todayIso()}"&&featured=true`,
    sort: '-created',
    fields: JOB_LIST_FIELDS,
  });
  return result.items as unknown as Partial<Job>[];
}

export async function getRelatedJobs(category: string, excludeId: string, limit = 4): Promise<Partial<Job>[]> {
  if (!category) return [];
  const result = await pb().collection('jobs').getList(1, limit, {
    filter: `active=true&&expires>"${todayIso()}"&&category="${esc(category)}"&&id!="${esc(excludeId)}"`,
    sort: '-created',
    fields: 'id,title,slug,company,city,province,category,job_type,created,featured,salary_min,salary_max',
  });
  return result.items as unknown as Partial<Job>[];
}

export async function getAllJobSlugs(): Promise<string[]> {
  const result = await pb().collection('jobs').getFullList({
    filter: `active=true&&expires>"${todayIso()}"`,
    fields: 'slug',
  });
  return result.map((j: any) => j.slug);
}

// ─── CATEGORIES ────────────────────────────────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  const result = await pb().collection('categories').getFullList({
    sort: '-job_count,name',
    fields: 'id,name,slug,job_count',
  });
  return result as unknown as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await pb().collection('categories').getFirstListItem(`slug="${esc(slug)}"`) as unknown as Category;
  } catch {
    return null;
  }
}

/**
 * Returns categories with live job counts — ONE query, not N+1.
 * Capped at 5000 jobs to prevent OOM at scale.
 */
export async function getCategoriesWithCounts(): Promise<(Category & { count: number })[]> {
  const [categories, jobs] = await Promise.all([
    pb().collection('categories').getFullList({ sort: 'name', fields: 'id,name,slug' }),
    pb().collection('jobs').getFullList({
      filter: `active=true&&expires>"${todayIso()}"`,
      fields: 'category',
      perPage: 5000,
    }),
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

// ─── EMPLOYERS ─────────────────────────────────────────────────────────────

export async function listEmployers(page = 1, perPage = 20, opts?: {
  province?: string;
  verifiedOnly?: boolean;
}): Promise<PaginatedResult<Employer>> {
  const filters: string[] = [];
  if (opts?.province) filters.push(`province="${esc(opts.province)}"`);
  if (opts?.verifiedOnly) filters.push('verified=true');
  const result = await pb().collection('employers').getList(page, perPage, {
    filter: filters.join('&&'),
    sort: '-verified,company_name',
  });
  return { items: result.items as unknown as Employer[], totalItems: result.totalItems, totalPages: result.totalPages, page, perPage };
}

export async function getEmployerBySlug(slug: string): Promise<Employer | null> {
  try {
    return await pb().collection('employers').getFirstListItem(`company_slug="${esc(slug)}"`) as unknown as Employer;
  } catch {
    return null;
  }
}

// ─── SITE STATS ─────────────────────────────────────────────────────────────

export interface SiteStats {
  jobs: number;
  companies: number;
  categories: number;
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    const [jobsResult, catsResult] = await Promise.all([
      pb().collection('jobs').getList(1, 1, { filter: `active=true&&expires>"${todayIso()}"`, fields: 'id' }),
      pb().collection('categories').getList(1, 1, { fields: 'id' }),
    ]);
    return { jobs: jobsResult.totalItems, companies: 0, categories: catsResult.totalItems };
  } catch {
    return { jobs: 0, companies: 0, categories: 0 };
  }
}

// ─── ANALYTICS ─────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  activeJobs: number;
  pendingJobs: number;
  expiredJobs: number;
  totalEmployers: number;
  applicationsToday: number;
  alertSubscribers: number;
  revenueThisMonth: number;
}

export async function getAdminMetrics(): Promise<DashboardMetrics> {
  const today = todayIso();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [active, pending, expired, employers, appsToday, alerts, payments] = await Promise.all([
    pb().collection('jobs').getList(1, 1, { filter: `active=true&&expires>"${today}"`, fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('jobs').getList(1, 1, { filter: 'active=false', fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('jobs').getList(1, 1, { filter: `expires<"${today}"`, fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('employers').getList(1, 1, { fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('applications').getList(1, 1, { filter: `created>="${today}"`, fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('job_alerts').getList(1, 1, { fields: 'id' }).catch(() => ({ totalItems: 0 })),
    pb().collection('payments').getList(1, 1, {
      filter: `status="COMPLETE"&&created>="${monthStart}"`,
      fields: 'amount',
    }).catch(() => ({ items: [] as any[] })),
  ]);

  const revenue = (payments as any).items?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

  return {
    activeJobs: active.totalItems,
    pendingJobs: pending.totalItems,
    expiredJobs: expired.totalItems,
    totalEmployers: employers.totalItems,
    applicationsToday: appsToday.totalItems,
    alertSubscribers: alerts.totalItems,
    revenueThisMonth: revenue,
  };
}

export interface EmployerMetrics {
  totalJobs: number;
  activeJobs: number;
  totalViews: number;
  totalClicks: number;
  totalApplications: number;
  viewsThisMonth: number;
  applicationsThisMonth: number;
  ctr: number;
}

export async function getEmployerMetrics(employerId: string): Promise<EmployerMetrics> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = todayIso();

  const [jobs, jobIds] = await Promise.all([
    pb().collection('jobs').getFullList({
      filter: `employer_id="${esc(employerId)}"`,
      fields: 'id,active,views,clicks,apply_clicks',
      sort: '-created',
    }).catch(() => []),
    pb().collection('jobs').getFullList({
      filter: `employer_id="${esc(employerId)}"`,
      fields: 'id',
    }).catch(() => []),
  ]);

  const ids = (jobIds as any[]).map((j: any) => `"${j.id}"`).join(',') || '""';
  const active = (jobs as any[]).filter((j: any) => j.active).length;
  const totalViews = (jobs as any[]).reduce((sum: number, j: any) => sum + (j.views || 0), 0);
  const totalClicks = (jobs as any[]).reduce((sum: number, j: any) => sum + (j.clicks || 0), 0);
  const totalApps = (jobs as any[]).reduce((sum: number, j: any) => sum + (j.apply_clicks || 0), 0);

  const [viewsMonth, appsMonth] = await Promise.all([
    pb().collection('analytics_events').getList(1, 1, {
      filter: `job_id~"${employerId}"&&event="view"&&created>="${monthStart}"`,
    }).catch(() => ({ totalItems: 0 })),
    pb().collection('applications').getList(1, 1, {
      filter: `created>="${monthStart}"&&job_id~"${employerId}"`,
    }).catch(() => ({ totalItems: 0 })),
  ]);

  return {
    totalJobs: (jobs as any[]).length,
    activeJobs: active,
    totalViews,
    totalClicks,
    totalApplications: totalApps,
    viewsThisMonth: viewsMonth.totalItems,
    applicationsThisMonth: appsMonth.totalItems,
    ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
  };
}

// ─── ADMIN JOBS ────────────────────────────────────────────────────────────

export async function listAdminJobs(filters: {
  status?: string;
  province?: string;
  source?: string;
  page?: number;
} = {}): Promise<PaginatedResult<any>> {
  const { status, province, source, page = 1 } = filters;
  const f: string[] = [];
  if (status === 'active') f.push('active=true');
  if (status === 'pending') f.push('active=false');
  if (status === 'expired') f.push(`expires<"${todayIso()}"`);
  if (province) f.push(`province="${esc(province)}"`);
  if (source) f.push(`source="${esc(source)}"`);

  const result = await pb().collection('jobs').getList(page, 50, {
    filter: f.join('&&'),
    sort: '-created',
    fields: 'id,slug,title,company,province,active,source,featured,views,created,expires',
  });

  return { items: result.items, totalItems: result.totalItems, totalPages: result.totalPages, page, perPage: 50 };
}

// ─── ADMIN DATA HELPERS ────────────────────────────────────────────────────
// Thin wrappers so admin pages never call pb() directly.

import { getAdminPB } from '../lib/auth';

export async function listAdminApplications(page = 1, perPage = 100) {
  const pb = await getAdminPB();
  return pb.collection('applications').getList(page, perPage, { sort: '-created' })
    .catch(() => ({ items: [] as any[], totalItems: 0, totalPages: 0, page, perPage }));
}

export async function listAdminAlerts(page = 1, perPage = 100) {
  const pb = await getAdminPB();
  return pb.collection('job_alerts').getList(page, perPage, { sort: '-created' })
    .catch(() => ({ items: [] as any[], totalItems: 0, totalPages: 0, page, perPage }));
}

export async function listAdminSettings(): Promise<any[]> {
  const pb = await getAdminPB();
  return pb.collection('admin_settings').getFullList({ sort: 'key' }).catch(() => [] as any[]);
}

export async function listAdminEmployers(): Promise<any[]> {
  const pb = await getAdminPB();
  return pb.collection('employers').getFullList({ sort: '-created' }).catch(() => [] as any[]);
}

export async function listXmlSources(): Promise<any[]> {
  const pb = await getAdminPB();
  return pb.collection('xml_sources').getFullList({ sort: 'name' }).catch(() => [] as any[]);
}

export async function getEmployerByUserId(userId: string): Promise<any | null> {
  if (!userId) return null;
  const pb = await getAdminPB();
  const list = await pb.collection('employers').getList(1, 1, {
    filter: `user_id="${userId.replace(/"/g, '\\"')}"`,
  }).catch(() => ({ items: [] as any[] }));
  return list.items[0] ?? null;
}

export async function listEmployerJobs(employerId: string): Promise<any[]> {
  if (!employerId) return [];
  const pb = await getAdminPB();
  return pb.collection('jobs').getFullList({
    filter: `employer_id="${employerId.replace(/"/g, '\\"')}"`,
    sort: '-created',
  }).catch(() => [] as any[]);
}

export async function listJobApplications(jobId: string): Promise<any[]> {
  if (!jobId) return [];
  const pb = await getAdminPB();
  return pb.collection('applications').getFullList({
    filter: `job="${jobId.replace(/"/g, '\\"')}"`,
    sort: '-created',
  }).catch(() => [] as any[]);
}

/** Get a single job with employer ownership check */
export async function getJobForEmployer(jobId: string, employerId: string): Promise<any | null> {
  if (!jobId || !employerId) return null;
  const pb = await getAdminPB();
  const job = await pb.collection('jobs').getOne(jobId).catch(() => null);
  if (!job) return null;
  if ((job as any).employer_id !== employerId) return null;
  return job;
}

/** List applications filtered by job and optional status */
export async function listJobApplicationsFiltered(jobId: string, status?: string): Promise<any[]> {
  if (!jobId) return [];
  const pb = await getAdminPB();
  const filters = [`job_id="${jobId.replace(/"/g, '\\"')}"`];
  if (status) filters.push(`status="${status.replace(/"/g, '\\"')}"`);
  return pb.collection('applications').getFullList({
    filter: filters.join('&&'),
    sort: '-created',
  }).catch(() => [] as any[]);
}

/** Recent jobs for admin dashboard */
export async function listRecentJobs(limit = 5): Promise<any[]> {
  const pb = await getAdminPB();
  const result = await pb.collection('jobs').getList(1, limit, {
    sort: '-created',
    fields: 'id,title,company,created',
  }).catch(() => ({ items: [] as any[] }));
  return result.items;
}

/** Recent applications for admin dashboard */
export async function listRecentApplications(limit = 5): Promise<any[]> {
  const pb = await getAdminPB();
  const result = await pb.collection('applications').getList(1, limit, {
    sort: '-created',
    fields: 'id,name,created,expand',
  }).catch(() => ({ items: [] as any[] }));
  return result.items;
}

/** Escape a value for use inside a PocketBase filter double-quoted string. */
function pbEsc(v: string): string {
  return String(v ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Sort shortcut → PocketBase sort expression (admin Jobs screen). */
export const ADMIN_JOB_SORTS: Record<string, string> = {
  newest: '-created',
  oldest: 'created',
  employer: 'company',
  province: 'province',
  source: 'source',
  featured_first: '-featured,-created',
  featured_last: 'featured,-created',
};

export interface AdminJobFilters {
  status?: string;      // '', 'active', 'pending', 'expired'
  province?: string;    // exact province
  source?: string;      // exact source value
  featured?: string;    // '', 'yes', 'no'
  imported?: string;    // '', 'yes' (source!=manual), 'no' (source=manual)
  company?: string;     // exact employer/company name
  search?: string;      // matches title/company/slug/source
  sort?: string;        // key of ADMIN_JOB_SORTS
  page?: number;
  perPage?: number;
}

/** Build the PocketBase filter string for the admin Jobs screen (server-side). */
export function buildAdminJobFilter(f: AdminJobFilters): string {
  const parts: string[] = [];
  const today = new Date().toISOString().slice(0, 10);
  if (f.status === 'active') parts.push('active=true');
  else if (f.status === 'pending') parts.push('active=false');
  else if (f.status === 'expired') parts.push(`expires<"${today}"`);
  if (f.province) parts.push(`province="${pbEsc(f.province)}"`);
  if (f.source) parts.push(`source="${pbEsc(f.source)}"`);
  if (f.featured === 'yes') parts.push('featured=true');
  else if (f.featured === 'no') parts.push('featured=false');
  if (f.imported === 'yes') parts.push('source!="manual"');
  else if (f.imported === 'no') parts.push('source="manual"');
  if (f.company) parts.push(`company="${pbEsc(f.company)}"`);
  if (f.search && f.search.trim()) {
    const q = pbEsc(f.search.trim());
    parts.push(`(title~"${q}"||company~"${q}"||slug~"${q}"||source~"${q}")`);
  }
  return parts.join('&&');
}

/** Admin jobs list with full filter/search/sort support (server-side, paginated). */
export async function listAdminJobsFiltered(filters: AdminJobFilters = {}): Promise<{
  items: any[]; totalItems: number; totalPages: number; page: number; perPage: number;
}> {
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(200, Math.max(1, filters.perPage || 50));
  const pb = await getAdminPB();
  const filter = buildAdminJobFilter(filters);
  const sort = ADMIN_JOB_SORTS[filters.sort || 'newest'] || '-created';
  const result = await pb.collection('jobs').getList(page, perPage, {
    filter,
    sort,
    fields: 'id,slug,title,company,province,category,active,source,featured,views,created,updated,expires,employer_id',
  }).catch(() => ({ items: [] as any[], totalItems: 0, totalPages: 0 }));
  return { items: result.items, totalItems: result.totalItems, totalPages: result.totalPages, page, perPage };
}

/** Return matching job ids for the current filter (for "select all filtered"), capped. */
export async function listAdminJobIds(filters: AdminJobFilters, maxIds = 1000): Promise<{ ids: string[]; totalItems: number; capped: boolean }> {
  const pb = await getAdminPB();
  const filter = buildAdminJobFilter(filters);
  const ids: string[] = [];
  let totalItems = 0;
  const per = 500;
  for (let page = 1; page <= Math.ceil(maxIds / per); page++) {
    const res: any = await pb.collection('jobs').getList(page, per, { filter, sort: '-created', fields: 'id' }).catch(() => null);
    if (!res) break;
    totalItems = res.totalItems;
    for (const it of res.items) { if (ids.length < maxIds) ids.push(it.id); }
    if (page >= res.totalPages || ids.length >= maxIds) break;
  }
  return { ids, totalItems, capped: totalItems > ids.length };
}

/** Dynamic dataset counts for the admin Jobs summary bar. */
export async function getAdminJobsSummary(): Promise<{
  total: number; featured: number; active: number; expired: number; imported: number; manual: number;
}> {
  const pb = await getAdminPB();
  const today = new Date().toISOString().slice(0, 10);
  // Each metric is an INDEPENDENT server-side count. `total` uses an always-true
  // predicate (id!="") instead of an empty filter to avoid SDK empty-filter edge
  // cases, and `imported` is counted directly (never total-minus-manual, which
  // could render negative if the total query transiently failed).
  const count = (filter: string) =>
    pb.collection('jobs').getList(1, 1, { filter, fields: 'id' }).then((r) => r.totalItems).catch(() => 0);
  const [total, featured, active, expired, manual, imported] = await Promise.all([
    count('id!=""'),
    count('featured=true'),
    count('active=true'),
    count(`expires<"${today}"`),
    count('source="manual"'),
    count('source!="manual"'),
  ]);
  return { total, featured, active, expired, imported, manual };
}

/** Distinct job `source` values for the admin Source filter (from existing data, capped scan). */
export async function listJobSourceValues(): Promise<string[]> {
  const pb = await getAdminPB();
  const seen = new Set<string>();
  const per = 500;
  for (let page = 1; page <= 4; page++) {
    const res: any = await pb.collection('jobs').getList(page, per, { sort: '-created', fields: 'source' }).catch(() => null);
    if (!res) break;
    for (const it of res.items) { if (it.source) seen.add(it.source); }
    if (page >= res.totalPages) break;
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/** Distinct employer names for the admin Employer filter (from existing data). */
export async function listEmployerNames(): Promise<string[]> {
  const pb = await getAdminPB();
  const rows = await pb.collection('employers').getFullList({ fields: 'company_name', sort: 'company_name' }).catch(() => [] as any[]);
  const seen = new Set<string>();
  for (const r of rows as any[]) {
    const n = (r.company_name || '').trim();
    if (n) seen.add(n);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/** XML sources list with feed job counts */
export async function listXmlSourcesWithCounts(): Promise<{ sources: any[]; feedJobCount: number }> {
  const pb = await getAdminPB();
  const [sources, feedJobs] = await Promise.all([
    pb.collection('xml_sources').getFullList({ sort: '-created' }).catch(() => [] as any[]),
    pb.collection('jobs').getFullList({ filter: 'source="feed"', fields: 'id,source_ref' }).catch(() => [] as any[]),
  ]);
  return { sources, feedJobCount: feedJobs.length };
}

/** List jobs for a specific employer (by id or company name) with filter + paging.
 *
 * Queries TWICE and merges: once by employer_id (relation), once by company name (text).
 * Deduplicates by job id. This handles legacy jobs that have no employer_id set.
 */
export async function listCompanyJobs(employerId: string | undefined, companyName: string, page = 1, perPage = 10): Promise<{ items: any[]; totalItems: number; totalPages: number }> {
  const pb = await getAdminPB();
  const today = todayIso();
  const fields = 'id,title,slug,company,city,province,category,job_type,created,featured,salary_min,salary_max,active,expires,description,views,clicks,apply_clicks';
  const companyEsc = companyName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  const queries: Promise<any>[] = [];

  // Query 1: by employer_id relation
  if (employerId) {
    queries.push(
      pb.collection('jobs').getFullList({
        filter: `employer_id="${employerId.replace(/"/g, '\\"')}"&&active=true&&expires>"${today}"`,
        sort: '-featured,-created',
        fields,
      }).catch(() => [] as any[]),
    );
  }

  // Query 2: by company name string (exact match)
  queries.push(
    pb.collection('jobs').getFullList({
      filter: `company="${companyEsc}"&&active=true&&expires>"${today}"`,
      sort: '-featured,-created',
      fields,
    }).catch(() => [] as any[]),
  );

  const results = await Promise.all(queries);
  const merged: Record<string, any> = {};
  for (const list of results) {
    for (const job of list as any[]) {
      if (!merged[job.id]) merged[job.id] = job;
    }
  }
  const allItems = Object.values(merged).sort((a: any, b: any) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return String(b.created).localeCompare(String(a.created));
  });

  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (page - 1) * perPage;
  const items = allItems.slice(start, start + perPage);

  return { items, totalItems, totalPages };
}

/** Job count per employer (for companies directory) */
export async function getJobCountsByEmployer(): Promise<Record<string, number>> {
  const pb = await getAdminPB();
  const today = todayIso();
  const jobs = await pb.collection('jobs').getFullList({
    filter: `active=true&&expires>"${today}"`,
    fields: 'company,employer_id',
  }).catch(() => [] as any[]);
  const counts: Record<string, number> = {};
  for (const job of jobs) {
    const j = job as any;
    if (j.employer_id) counts[j.employer_id] = (counts[j.employer_id] || 0) + 1;
    if (j.company) counts[j.company] = (counts[j.company] || 0) + 1;
  }
  return counts;
}

/** Analytics data for an employer's job (30-day events) */
export async function getJobAnalyticsEvents(jobId: string, days = 30): Promise<any[]> {
  if (!jobId) return [];
  const pb = await getAdminPB();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return pb.collection('analytics_events').getFullList({
    filter: `job_id="${jobId.replace(/"/g, '\\"')}"&&created>="${since}"`,
    sort: 'created',
  }).catch(() => [] as any[]);
}

// ─── ADMIN SETTINGS HELPER ─────────────────────────────────────────────────

/** Read multiple admin_settings keys in one round-trip. Returns a key→value map. */
export async function getAdminSettings(keys: string[]): Promise<Record<string, string>> {
  if (!keys.length) return {};
  const pb = await getAdminPB();
  const records = await pb.collection('admin_settings').getFullList({ sort: 'key' }).catch(() => [] as any[]);
  const map: Record<string, string> = {};
  for (const k of keys) map[k] = '';
  for (const r of records as any[]) {
    if (keys.includes(r.key)) map[r.key] = r.value ?? '';
  }
  return map;
}

/**
 * PSEO query — match jobs against any of: job_type, category, title (and optionally description).
 *
 * Builds an OR filter combining:
 *   1. An exact job_type match (preferred — uses the canonical select value)
 *   2. Keyword fuzzy match across the supplied fields (fallback for legacy/imported jobs)
 *
 * Used by /learnerships, /remote-jobs, /graduate-jobs, /internships, /bursaries.
 */
export async function listPseoJobs(opts: {
  terms: string[];
  fields?: ('job_type' | 'category' | 'title' | 'description')[];
  jobType?: string;
  page?: number;
  perPage?: number;
}): Promise<{ items: any[]; totalItems: number; totalPages: number }> {
  const { terms, fields = ['job_type', 'category', 'title'], jobType, page = 1, perPage = 20 } = opts;
  const today = todayIso();
  const pb = await getAdminPB();

  const safeTerms = terms
    .filter(Boolean)
    .map((t) => t.replace(/\\/g, '\\\\').replace(/"/g, '\\"'));

  const ors: string[] = [];

  if (jobType) {
    ors.push(`job_type="${jobType.replace(/"/g, '\\"')}"`);
  }

  for (const term of safeTerms) {
    for (const field of fields) {
      ors.push(`${field}~"${term}"`);
    }
  }

  if (ors.length === 0) {
    return { items: [], totalItems: 0, totalPages: 0 };
  }

  const filter = `active=true&&expires>"${today}"&&(${ors.join('||')})`;

  const result = await pb.collection('jobs').getList(page, perPage, {
    filter,
    sort: '-featured,-created',
    fields: 'id,title,slug,company,city,province,category,job_type,created,featured,salary_min,salary_max,active,expires,description,views,clicks,apply_clicks',
  }).catch(() => ({ items: [] as any[], totalItems: 0, totalPages: 0 }));

  return { items: result.items, totalItems: result.totalItems, totalPages: result.totalPages };
}
