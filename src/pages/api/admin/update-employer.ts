import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;
  try {
    const data = await request.json();
    const id = cleanString(data.id, 80);
    await (await getAdminPB()).collection('employers').update(id, { verified: Boolean(data.verified) });
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not update employer.' }, { status: 500 });
  }
};
