import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin, auditLog } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';

/**
 * Expire jobs whose `expires` date is in the past.
 *
 * Sets `active = false` on each. Designed to be called by:
 *   - cron: every day at midnight
 *   - PM2 cron job
 *   - external uptime-monitor webhook
 *
 * Auth: admin required.
 *
 * Returns: { success, data: { expired: N } }
 */
export const POST: APIRoute = async ({ request }) => {
  const { redirect, user } = await requireAdmin(request);
  if (redirect) return redirect;

  let pb;
  try {
    pb = await getAdminPB();
  } catch {
    return fail('Could not connect to PocketBase.', 503);
  }

  const nowIso = new Date().toISOString();

  try {
    // Pull the IDs of every active job that has expired.
    const expired = await pb.collection('jobs').getFullList({
      filter: `active=true&&expires<"${nowIso}"`,
      fields: 'id,slug,title',
      sort: '-created',
    }).catch(() => [] as any[]);

    let count = 0;
    for (const job of expired as any[]) {
      try {
        await pb.collection('jobs').update(job.id, { active: false });
        count++;
      } catch (err: any) {
        console.error(`[expire-jobs] Failed for ${job.id}:`, err?.message || err);
      }
    }

    auditLog('jobs_expired', { adminId: user?.id, count });
    return ok({ expired: count });
  } catch (err: any) {
    return fail(`Could not expire jobs: ${err?.message || 'unknown error'}`, 500);
  }
};
