import type { APIRoute } from 'astro';
import { getAdminPB, requireAdminApi } from '../../../lib/auth';
import { json } from '../../../lib/api';
import { sendMail } from '../../../lib/mailer';

export const POST: APIRoute = async ({ request }) => {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  const pb = await getAdminPB();
  const alerts = await pb.collection('job_alerts').getFullList().catch(() => []);
  const jobs = await pb.collection('jobs').getList(1, 10, { filter: 'active=true', sort: '-created', fields: 'title,company,slug' }).catch(() => ({ items: [] }));
  for (const alert of alerts as any[]) {
    const html = `<p>Latest Edubuzz jobs:</p>${jobs.items.map((job: any) => `<p><a href="https://edubuzz.co.za/job/${job.slug}">${job.title} at ${job.company}</a></p>`).join('')}`;
    sendMail(alert.email, 'Latest Edubuzz job alerts', html).catch(() => {});
  }
  return json({ ok: true });
};
