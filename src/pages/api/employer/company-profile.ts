import type { APIRoute } from 'astro';
import { getAdminPB, getEmployerSession } from '../../../lib/auth';
import { cleanString, isHttpsUrl, json } from '../../../lib/api';
import { slugify } from '../../../lib/slugify';
import { validateToken } from '../../../lib/csrf';

export const POST: APIRoute = async ({ request }) => {
  const session = await getEmployerSession(request);
  if (!session) return json({ message: 'Login required.' }, { status: 401 });

  try {
    const form = await request.formData();
    if (!validateToken(form.get('_csrf') as string))
      return json({ message: 'Invalid request.' }, { status: 403 });
    const company_name = cleanString(form.get('company_name'), 120);
    const company_slug = slugify(cleanString(form.get('company_slug'), 120) || company_name);
    const website = cleanString(form.get('website'), 300);
    if (!company_name || !company_slug) return json({ message: 'Company name and slug are required.' }, { status: 400 });
    if (website && !isHttpsUrl(website)) return json({ message: 'Website must start with https://.' }, { status: 400 });

    const payload = new FormData();
    payload.set('company_name', company_name);
    payload.set('company_slug', company_slug);
    payload.set('website', website);
    payload.set('description', cleanString(form.get('description'), 5000));
    payload.set('province', cleanString(form.get('province'), 80));
    payload.set('city', cleanString(form.get('city'), 80));
    const logo = form.get('logo');
    if (logo instanceof File && logo.size > 0) payload.set('logo', logo);

    const pb = await getAdminPB();
    await pb.collection('employers').update(session.employer.id, payload);
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not save company profile.' }, { status: 500 });
  }
};
