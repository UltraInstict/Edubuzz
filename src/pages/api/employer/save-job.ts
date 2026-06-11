import type { APIRoute } from 'astro';
import { getAdminPB, getEmployerSession, auditLog } from '../../../lib/auth';
import { cleanString, isEmail, isHttpsUrl, ok, fail } from '../../../lib/api';
import { validateToken } from '../../../lib/csrf';
import { pingIndexNow } from '../../../lib/indexnow';

export const POST: APIRoute = async ({ request }) => {
  const session = await getEmployerSession(request);
  if (!session) return fail('Login required.', 401);

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string)) return fail('Invalid request.', 403);

    const id = cleanString(data.id, 80);
    const title = cleanString(data.title, 120);
    const company = cleanString(data.company || session.employer.company_name, 120);
    const category = cleanString(data.category, 80);
    const province = cleanString(data.province, 80);
    const city = cleanString(data.city, 80);
    const job_type = cleanString(data.job_type, 40);
    const description = cleanString(data.description, 10000);
    const apply_email = cleanString(data.apply_email, 120).toLowerCase();
    const apply_url = cleanString(data.apply_url, 300);

    if (!title || !company || !province || !job_type || !description) {
      return fail('Please complete all required fields.', 400);
    }
    if (apply_email && !isEmail(apply_email)) return fail('Invalid application email.', 400);
    if (apply_url && !isHttpsUrl(apply_url)) return fail('Application URL must start with https://.', 400);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    const payload = {
      title,
      company,
      slug,
      category,
      province,
      city,
      job_type,
      description,
      apply_email,
      apply_url,
      salary_min: data.salary_min ? Number(data.salary_min) : null,
      salary_max: data.salary_max ? Number(data.salary_max) : null,
      active: false,
      employer_id: session.employer.id,
      source: 'manual',
      xml_export: true,
      expires: data.draft ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    const pb = await getAdminPB();
    if (id) {
      const existing: any = await pb.collection('jobs').getOne(id, { fields: 'id,employer_id,slug' });
      if (existing.employer_id !== session.employer.id) return fail('Forbidden.', 403);
      const updated = await pb.collection('jobs').update(id, payload) as any;
      auditLog('employer_job_updated', { employerId: session.employer.id, jobId: id });
      pingIndexNow([`https://edubuzz.co.za/job/${updated.slug}`]).catch(() => {});
      return ok({ id });
    }

    const job: any = await pb.collection('jobs').create(payload);
    auditLog('employer_job_created', { employerId: session.employer.id, jobId: job.id });
    pingIndexNow([`https://edubuzz.co.za/job/${job.slug}`]).catch(() => {});
    return ok({ id: job.id });
  } catch {
    return fail('Could not save job.', 500);
  }
};
