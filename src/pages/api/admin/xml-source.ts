import type { APIRoute } from 'astro';
import { getAdminPB, requireAdminApi, auditLog } from '../../../lib/auth';
import { cleanString, ok, fail } from '../../../lib/api';

const VALID_FORMATS = new Set(['xml', 'json', 'rss', 'indeed_xml', 'generic_rss', 'jobsora']);

function isAcceptableUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/i.test(value);
}

export const POST: APIRoute = async ({ request }) => {
  const { error, user } = await requireAdminApi(request);
  if (error) return error;

  try {
    const data = await request.json();
    const id = cleanString(data.id, 80);
    const action = cleanString(data._action || '', 20);
    const pb = await getAdminPB();

    // Delete branch
    if (action === 'delete') {
      if (!id) return fail('Feed id is required for delete.', 400);
      await pb.collection('xml_sources').delete(id);
      auditLog('xml_source_deleted', { adminId: user?.id, sourceId: id });
      return ok({ id });
    }

    // Add/Edit branch
    const name = cleanString(data.name, 120);
    const feed_url = cleanString(data.feed_url, 300);
    const format = cleanString(data.format, 40) || 'xml';
    const active = data.active === true || data.active === 'true';

    if (!name) return fail('Feed name is required.', 400);
    if (!isAcceptableUrl(feed_url)) return fail('Feed URL must be a valid http(s) URL.', 400);
    if (!VALID_FORMATS.has(format)) return fail('Invalid format.', 400);

    const payload = { name, feed_url, format, active };

    if (id) {
      await pb.collection('xml_sources').update(id, payload);
      auditLog('xml_source_updated', { adminId: user?.id, sourceId: id });
      return ok({ id });
    }

    const created = await pb.collection('xml_sources').create({
      ...payload,
      import_count: 0,
    });
    auditLog('xml_source_created', { adminId: user?.id, sourceId: (created as any).id });
    return ok({ id: (created as any).id });
  } catch {
    return fail('Could not save feed.', 500);
  }
};
