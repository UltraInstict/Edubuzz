import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, isHttpsUrl, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;
  try {
    const data = await request.json();
    const feed_url = cleanString(data.feed_url, 300);
    if (!cleanString(data.name, 120) || !isHttpsUrl(feed_url)) return json({ message: 'Valid name and HTTPS URL are required.' }, { status: 400 });
    await (await getAdminPB()).collection('xml_sources').create({
      name: cleanString(data.name, 120),
      feed_url,
      format: cleanString(data.format, 40) || 'generic_rss',
      active: true,
      import_count: 0,
    });
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not create feed.' }, { status: 500 });
  }
};
