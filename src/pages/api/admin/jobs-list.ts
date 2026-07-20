import type { APIRoute } from 'astro';
import { requireAdminApi } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';
import {
  listAdminJobsFiltered,
  listAdminJobIds,
  getAdminJobsSummary,
  type AdminJobFilters,
} from '../../../services/jobService';

/**
 * Admin Jobs screen data source (admin-only, read-only).
 * Powers instant filtering/search/sort/pagination without full page reloads.
 * Does NOT touch the import pipeline, cron, schema, or any public route.
 *
 *   GET /api/admin/jobs-list?status=&province=&source=&featured=&imported=&company=&search=&sort=&page=&perPage=
 *   GET /api/admin/jobs-list?...&mode=ids   → { ids, totalItems, capped } for "select all filtered"
 *   GET /api/admin/jobs-list?...&summary=1  → also include dataset summary counts
 */
export const GET: APIRoute = async ({ request, url }) => {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const p = url.searchParams;
  const filters: AdminJobFilters = {
    status: p.get('status') || '',
    province: p.get('province') || '',
    source: p.get('source') || '',
    featured: p.get('featured') || '',
    imported: p.get('imported') || '',
    company: p.get('company') || '',
    search: p.get('search') || '',
    sort: p.get('sort') || 'newest',
    page: parseInt(p.get('page') || '1', 10) || 1,
    perPage: parseInt(p.get('perPage') || '50', 10) || 50,
  };

  try {
    if (p.get('mode') === 'ids') {
      const res = await listAdminJobIds(filters, 1000);
      return ok(res);
    }
    const list = await listAdminJobsFiltered(filters);
    const summary = p.get('summary') === '1' ? await getAdminJobsSummary() : undefined;
    return ok({ ...list, ...(summary ? { summary } : {}) });
  } catch (err: any) {
    return fail(err?.message || 'Failed to load jobs.', 500);
  }
};
