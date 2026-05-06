import type { APIRoute } from 'astro';
import { getAdminPB, getEmployerSession } from '../../../lib/auth';
import { cleanString, isEmail, isHttpsUrl, json } from '../../../lib/api';
import { validateToken } from '../../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  const session = await getEmployerSession(request);
  if (!session) return json({ message: 'Login required.' }, { status: 401 });

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string))
      return json({ message: 'Invalid request.' }, { status: 403 });
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
      return json({ message: 'Please complete all required fields.' }, { status: 400 });
    }
    if (apply_email && !isEmail(apply_email)) return json({ message: 'Invalid application email.' }, { status: 400 });
    if (apply_url && !isHttpsUrl(apply_url)) return json({ message: 'Application URL must start with https://.' }, { status: 400 });

    const payload = {
      title,
      company,
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
      const existing: any = await pb.collection('jobs').getOne(id, { fields: 'id,employer_id' });
      if (existing.employer_id !== session.employer.id) return json({ message: 'Forbidden.' }, { status: 403 });
      await pb.collection('jobs').update(id, payload);
      return json({ ok: true, id });
    }

    const job: any = await pb.collection('jobs').create(payload);
    return json({ ok: true, id: job.id });
  } catch {
    return json({ message: 'Could not save job.' }, { status: 500 });
  }
};
