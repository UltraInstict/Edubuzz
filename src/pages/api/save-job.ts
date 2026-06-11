import type { APIRoute } from 'astro';
import { getAuthPb } from '../../lib/auth';
import { ok, fail } from '../../lib/api';

/**
 * Toggle save/unsave a job for the logged-in user.
 * Collection: saved_jobs { user_id, job_id, created }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { jobId, action } = await request.json();
    if (!jobId) return fail('Job ID required.', 400);
    if (action !== 'save' && action !== 'toggle') return fail('Invalid action.', 400);

    const authPb = getAuthPb(request);
    if (!authPb.authStore.isValid) return fail('Login required to save jobs.', 401);

    const userId = authPb.authStore.model?.id;
    if (!userId) return fail('Login required to save jobs.', 401);

    const existing = await authPb.collection('saved_jobs').getList(1, 1, {
      filter: `user_id="${userId}"&&job_id="${String(jobId).replace(/"/g, '\\"')}"`,
    }).catch(() => ({ totalItems: 0, items: [] as any[] }));

    if (existing.totalItems > 0) {
      await authPb.collection('saved_jobs').delete(existing.items[0].id);
      return ok({ saved: false });
    }

    await authPb.collection('saved_jobs').create({ user_id: userId, job_id: jobId });
    return ok({ saved: true });
  } catch {
    return fail('Failed to process request.', 500);
  }
};
