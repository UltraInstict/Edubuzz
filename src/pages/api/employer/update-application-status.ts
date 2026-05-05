import type { APIRoute } from 'astro';
import { getAdminPB, getEmployerSession } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

const statuses = new Set(['pending', 'reviewed', 'shortlisted', 'rejected']);

export const POST: APIRoute = async ({ request }) => {
  const session = await getEmployerSession(request);
  if (!session) return json({ message: 'Login required.' }, { status: 401 });

  try {
    const data = await request.json();
    const applicationId = cleanString(data.applicationId, 80);
    const status = cleanString(data.status, 40);
    if (!applicationId || !statuses.has(status)) return json({ message: 'Invalid status.' }, { status: 400 });

    const pb = await getAdminPB();
    const application: any = await pb.collection('applications').getOne(applicationId);
    const jobId = application.job_id || application.job;
    const job: any = await pb.collection('jobs').getOne(jobId, { fields: 'id,employer_id' });
    if (job.employer_id !== session.employer.id) return json({ message: 'Forbidden.' }, { status: 403 });

    await pb.collection('applications').update(applicationId, { status });
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not update application.' }, { status: 500 });
  }
};
