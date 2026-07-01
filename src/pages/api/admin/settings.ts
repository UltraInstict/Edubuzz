import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin, auditLog } from '../../../lib/auth';
import { cleanString, ok, fail } from '../../../lib/api';

const COLLECTION_MISSING_MSG =
  'admin_settings collection is missing from PocketBase. Please create it — see POCKETBASE_SETUP.md.';

function isCollectionMissing(err: any): boolean {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const status = err?.status ?? err?.response?.status ?? 0;
  if (status === 404 && (msg.includes('collection') || msg.includes('missing'))) return true;
  if (msg.includes('missing or invalid collection context')) return true;
  if (msg.includes("collection") && msg.includes('not found')) return true;
  return false;
}

/**
 * Upsert admin_settings key/value pairs.
 *
 * Each key is processed independently; failures on one key do not abort the others.
 * If the admin_settings collection itself is missing, returns a 400 with a clear,
 * actionable error message so the UI can surface the exact problem.
 */
export const POST: APIRoute = async ({ request }) => {
  const { redirect, user } = await requireAdmin(request);
  if (redirect) return redirect;

  let data: Record<string, unknown> = {};
  try {
    data = await request.json();
  } catch {
    return fail('Invalid JSON body.', 400);
  }

  let pb;
  try {
    pb = await getAdminPB();
  } catch (err: any) {
    return fail('Could not connect to PocketBase. Check that the server is running.', 503);
  }

  const errors: string[] = [];
  let upserted = 0;
  let collectionMissing = false;

  for (const [key, value] of Object.entries(data)) {
    const cleanKey = cleanString(key, 80);
    const cleanValue = cleanString(value, 5000);
    if (!cleanKey) continue;

    try {
      let existing: any = null;
      try {
        existing = await pb.collection('admin_settings').getFirstListItem(`key="${cleanKey.replace(/"/g, '\\"')}"`);
      } catch (lookupErr: any) {
        // 404 from getFirstListItem when no record found — fall through to create
        if (isCollectionMissing(lookupErr)) {
          collectionMissing = true;
          break;
        }
        existing = null;
      }

      if (existing) {
        await pb.collection('admin_settings').update(existing.id, { value: cleanValue });
      } else {
        await pb.collection('admin_settings').create({ key: cleanKey, value: cleanValue });
      }
      upserted++;
    } catch (err: any) {
      if (isCollectionMissing(err)) {
        collectionMissing = true;
        break;
      }
      const fieldErrors = err?.data?.data || err?.response?.data;
      const detail = fieldErrors ? JSON.stringify(fieldErrors) : (err?.message || String(err));
      console.error(`[admin/settings] Failed for key "${cleanKey}":`, detail);
      errors.push(`${cleanKey}: ${detail}`);
    }
  }

  if (collectionMissing) {
    return fail(COLLECTION_MISSING_MSG, 400);
  }

  if (errors.length && upserted === 0) {
    return fail(`Could not save settings. Details: ${errors.join('; ')}`, 400);
  }

  auditLog('admin_settings_saved', { adminId: user?.id, count: upserted });
  return ok({ upserted, errors });
};
