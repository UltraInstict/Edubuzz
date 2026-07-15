import type { APIRoute } from 'astro';
import { getAdminPB, requireAdminApi } from '../../../lib/auth';
import { cleanString, json } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const data = await request.json();
    const id = cleanString(data.id, 80);
    await (await getAdminPB()).collection('employers').update(id, { verified: Boolean(data.verified) });
    return json({ ok: true });
  } catch {
    return json({ message: 'Could not update employer.' }, { status: 500 });
  }
};
