import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;

  try {
    const data = await request.json();
    const id = cleanString(data.jobId, 80);
    const action = cleanString(data.action, 40);
    if (!id || !action) return json({ message: 'Job ID and action are required.' }, { status: 400 });

    const pb = await getAdminPB();
    if (action === 'approve') await pb.collection('jobs').update(id, { active: true });
    else if (action === 'reject' || action === 'pause') await pb.collection('jobs').update(id, { active: false });
    else if (action === 'toggle_featured') {
      const job: any = await pb.collection('jobs').getOne(id, { fields: 'featured' });
      await pb.collection('jobs').update(id, { featured: !job.featured });
    } else if (action === 'delete') await pb.collection('jobs').delete(id);
    else return json({ message: 'Unknown action.' }, { status: 400 });

    return json({ ok: true });
  } catch {
    return json({ message: 'Could not update job.' }, { status: 500 });
  }
};
