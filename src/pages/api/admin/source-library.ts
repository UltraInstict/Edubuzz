import type { APIRoute } from 'astro';
import { requireAdminApi } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';
import { SOURCE_LIBRARY_SEED } from '../../../services/import/sourceLibrary.seed';
import { buildImportQueue, libraryStats } from '../../../services/import/discovery';

/**
 * Admin visibility — Source Library + import-queue health (Phase 4B, M1).
 *
 * Read-only. Surfaces the Source Library for the admin dashboard:
 *   - every source with verification_status, ats_type, industry, province,
 *     last_checked_at / last_import_at
 *   - aggregate stats (by status / industry / ATS / province)
 *   - the import queue: which sources are runnable (verified + connector-wired)
 *     vs held (pending/unverified) and why
 *
 * Only 'verified' sources are runnable — pending/unverified are shown for
 * verification workflow but are never imported.
 *
 * GET /api/admin/source-library
 *   ?status=verified|pending|unverified|rejected   filter
 *   ?industry=banking|retail|...                    filter
 */
export const GET: APIRoute = async ({ request, url }) => {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const statusFilter = url.searchParams.get('status');
    const industryFilter = url.searchParams.get('industry');

    let library = SOURCE_LIBRARY_SEED;
    if (statusFilter) library = library.filter((s) => s.verification_status === statusFilter);
    if (industryFilter) library = library.filter((s) => s.industry === industryFilter);

    const queue = buildImportQueue(library);

    return ok({
      stats: libraryStats(SOURCE_LIBRARY_SEED),
      queue: {
        runnable: queue.filter((q) => q.runnable).map((q) => ({ id: q.entry.id, company: q.entry.company_name, connector: q.entry.connector })),
        held: queue.filter((q) => !q.runnable).map((q) => ({ id: q.entry.id, company: q.entry.company_name, reason: q.reason })),
      },
      sources: library.map((s) => ({
        id: s.id,
        company_name: s.company_name,
        website: s.website,
        careers_url: s.careers_url,
        ats_type: s.ats_type,
        industry: s.industry,
        province: s.province,
        verification_status: s.verification_status,
        last_checked_at: s.last_checked_at,
        last_import_at: s.last_import_at,
        connector: s.connector ?? null,
        notes: s.notes,
      })),
    });
  } catch (err: any) {
    return fail(err?.message || 'Failed to load source library', 500);
  }
};
