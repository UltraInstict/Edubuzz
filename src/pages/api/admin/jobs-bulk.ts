import type { APIRoute } from 'astro';
import { getAdminPB, requireAdminApi, auditLog } from '../../../lib/auth';
import { ok, fail, cleanString } from '../../../lib/api';

/**
 * Bulk actions for the admin Jobs screen (admin-only).
 * Body: { ids: string[], action: 'feature'|'unfeature'|'activate'|'deactivate'|'approve'|'delete' }
 *
 * Mirrors the single-record /api/admin/job-action semantics but for many ids.
 * Confirmation is enforced in the UI. Does NOT touch import/cron/schema/public code.
 * IndexNow pings are intentionally omitted for bulk ops (the daily sitemap/IndexNow
 * job covers listing changes) to avoid hundreds of outbound calls per action.
 */

const PATCH_ACTIONS: Record<string, Record<string, unknown>> = {
  feature: { featured: true },
  unfeature: { featured: false },
  activate: { active: true },
  approve: { active: true },
  deactivate: { active: false },
};

const MAX_IDS = 1000;
const CONCURRENCY = 8;

export const POST: APIRoute = async ({ request }) => {
  const { error, user } = await requireAdminApi(request);
  if (error) return error;

  let data: any;
  try {
    data = await request.json();
  } catch {
    return fail('Invalid request body.', 400);
  }

  const action = cleanString(data?.action, 40);
  const rawIds: unknown = data?.ids;
  if (!Array.isArray(rawIds) || rawIds.length === 0) return fail('No jobs selected.', 400);
  if (action !== 'delete' && !PATCH_ACTIONS[action]) return fail('Unknown bulk action.', 400);

  const ids = Array.from(
    new Set(rawIds.map((x) => cleanString(x, 80)).filter(Boolean))
  ).slice(0, MAX_IDS);
  if (!ids.length) return fail('No valid job ids.', 400);

  const pb = await getAdminPB();
  const patch = PATCH_ACTIONS[action];
  let processed = 0;
  const failed: string[] = [];

  // Bounded concurrency so a bulk action on hundreds of jobs stays responsive.
  let cursor = 0;
  async function worker() {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      try {
        if (action === 'delete') await pb.collection('jobs').delete(id);
        else await pb.collection('jobs').update(id, patch);
        processed++;
      } catch {
        failed.push(id);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker));

  auditLog(`admin_job_bulk_${action}`, {
    adminId: user?.id,
    requested: ids.length,
    processed,
    failed: failed.length,
  });

  return ok({ action, requested: ids.length, processed, failed: failed.length, failedIds: failed.slice(0, 20) });
};
