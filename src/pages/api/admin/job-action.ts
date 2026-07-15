import type { APIRoute } from 'astro';
import { getAdminPB, requireAdminApi, auditLog } from '../../../lib/auth';
import { cleanString, ok, fail } from '../../../lib/api';
import { pingJobCreated, pingJobUpdated, pingJobDeleted } from '../../../lib/indexnow';

export const POST: APIRoute = async ({ request }) => {
  const { error, user } = await requireAdminApi(request);
  if (error) return error;

  try {
    const data = await request.json();
    const id = cleanString(data.jobId, 80);
    const action = cleanString(data.action, 40);
    if (!id || !action) return fail('Job ID and action are required.', 400);

    const pb = await getAdminPB();
    let updatedJob: any;
    let slug = '';

    if (action === 'approve') {
      updatedJob = await pb.collection('jobs').update(id, { active: true });
      slug = updatedJob?.slug;
    } else if (action === 'reject' || action === 'pause') {
      const job: any = await pb.collection('jobs').getOne(id, { fields: 'slug' });
      await pb.collection('jobs').update(id, { active: false });
      slug = job?.slug;
    } else if (action === 'toggle_featured') {
      const job: any = await pb.collection('jobs').getOne(id, { fields: 'featured,slug' });
      updatedJob = await pb.collection('jobs').update(id, { featured: !job.featured });
      slug = updatedJob?.slug;
    } else if (action === 'repost') {
      const job: any = await pb.collection('jobs').getOne(id, { fields: 'slug' });
      const expires = new Date(Date.now() + 30 * 86400000).toISOString();
      updatedJob = await pb.collection('jobs').update(id, {
        active: true,
        expires,
        featured: false,
        reposted_at: new Date().toISOString(),
      });
      slug = updatedJob?.slug;
    } else if (action === 'delete') {
      const job: any = await pb.collection('jobs').getOne(id, { fields: 'slug' });
      await pb.collection('jobs').delete(id);
      slug = job?.slug;
    } else {
      return fail('Unknown action.', 400);
    }

    auditLog(`admin_job_${action}`, { jobId: id, adminId: user?.id, slug });

    if (slug) {
      if (action === 'approve' || action === 'repost') pingJobCreated(slug).catch(() => {});
      else if (action === 'delete') pingJobDeleted(slug).catch(() => {});
      else pingJobUpdated(slug).catch(() => {});
    }

    return ok({ jobId: id, action });
  } catch (err: any) {
    const pbStatus = err?.status ?? err?.response?.status ?? 'unknown';
    const pbMessage = err?.message ?? String(err);
    const pbData = err?.data?.data ? JSON.stringify(err.data.data) : '';
    console.error(`[job-action] action=${action} jobId=${id} pbStatus=${pbStatus} message=${pbMessage} data=${pbData}`);
    return fail(`Could not update job. (${pbMessage.slice(0, 120)})`, 500);
  }
};
