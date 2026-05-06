import type { APIRoute } from 'astro';
import { getPB } from '../../lib/pocketbase';
import { checkRateLimit, cleanString, isEmail, isHttpsUrl, json } from '../../lib/api';
import { validateToken } from '../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  if (!checkRateLimit(request)) {
    return json({ message: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  try {
    const data = await request.json();
    if (!validateToken(data._csrf as string))
      return json({ message: 'Invalid request.' }, { status: 403 });
    const employer_name = cleanString(data.employer_name, 80);
    const employer_email = cleanString(data.employer_email, 120).toLowerCase();
    const company = cleanString(data.company, 120);
    const title = cleanString(data.title, 120);
    const category = cleanString(data.category, 80);
    const province = cleanString(data.province, 80);
    const city = cleanString(data.city, 80);
    const job_type = cleanString(data.job_type, 40);
    const description = cleanString(data.description, 10000);
    const apply_url = cleanString(data.apply_url, 300);
    const apply_email = cleanString(data.apply_email, 120).toLowerCase();

    if (!employer_name || !employer_email || !company || !title || !province || !job_type || !description) {
      return json({ message: 'Please complete all required fields.' }, { status: 400 });
    }
    if (!isEmail(employer_email)) {
      return json({ message: 'Enter a valid employer email address.' }, { status: 400 });
    }
    if (apply_email && !isEmail(apply_email)) {
      return json({ message: 'Enter a valid application email address.' }, { status: 400 });
    }
    if (apply_url && !isHttpsUrl(apply_url)) {
      return json({ message: 'Application URL must start with https://.' }, { status: 400 });
    }

    const salary_min = data.salary_min ? Number.parseInt(String(data.salary_min), 10) : null;
    const salary_max = data.salary_max ? Number.parseInt(String(data.salary_max), 10) : null;

    const pb = getPB();
    await pb.collection('pending_jobs').create({
      employer_name,
      employer_email,
      company,
      title,
      category,
      description,
      province,
      city,
      job_type,
      salary_min: Number.isFinite(salary_min) ? salary_min : null,
      salary_max: Number.isFinite(salary_max) ? salary_max : null,
      apply_url,
      apply_email,
      status: 'pending',
    });

    return json({ ok: true });
  } catch {
    return json({ message: 'Failed to submit job.' }, { status: 500 });
  }
};
