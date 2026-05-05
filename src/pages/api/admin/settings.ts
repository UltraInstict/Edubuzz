import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;
  try {
    const data = await request.json();
    const pb = await getAdminPB();
    for (const [key, value] of Object.entries(data)) {
      const cleanKey = cleanString(key, 80);
      const cleanValue = cleanString(value, 5000);
      try {
        const existing: any = await pb.collection('admin_settings').getFirstListItem(`key="${cleanKey}"`);
        await pb.collection('admin_settings').update(existing.id, { value: cleanValue });
      } catch {
        await pb.collection('admin_settings').create({ key: cleanKey, value: cleanValue });
      }
    }
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not save settings.' }, { status: 500 });
  }
};
