import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin, auditLog } from '../../../lib/auth';
import { ok, fail } from '../../../lib/api';

const COLLECTION_MISSING_MSG =
  'affiliate_links collection is missing from PocketBase. Please create it — see POCKETBASE_SETUP.md.';

function isCollectionMissing(err: any): boolean {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const status = err?.status ?? err?.response?.status ?? 0;
  if (status === 404 && (msg.includes('collection') || msg.includes('missing'))) return true;
  if (msg.includes('missing or invalid collection context')) return true;
  if (msg.includes('collection') && msg.includes('not found')) return true;
  return false;
}

// ── Basic URL validation (format check only, not live reachability) ──
function isValidUrlFormat(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const VALID_ZONES = new Set(['strip', 'sidebar', 'infeed', 'jobs-top', 'all']);

/**
 * Accept any common spelling and normalise to the canonical lowercase value.
 * This keeps existing PocketBase records (which may use capitalised labels
 * like "Sidebar" or "Jobs Page Top") interoperable with the admin form.
 */
function pickZone(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!raw) return 'sidebar';
  const lower = raw.toLowerCase();
  const aliasMap: Record<string, string> = {
    'sidebar': 'sidebar',
    'strip': 'strip',
    'strip (full-width banner)': 'strip',
    'infeed': 'infeed',
    'in-feed': 'infeed',
    'in-feed (between job cards)': 'infeed',
    'jobs-top': 'jobs-top',
    'jobs page top': 'jobs-top',
    'jobs_top': 'jobs-top',
    'jobstop': 'jobs-top',
    'all': 'all',
    'all zones': 'all',
  };
  if (aliasMap[lower]) return aliasMap[lower];
  if (VALID_ZONES.has(lower)) return lower;
  return 'sidebar';
}

const VALID_DISPLAY_TYPES = new Set(['text', 'image', 'html']);

function pickDisplayType(value: unknown): string {
  const s = String(value ?? '').trim();
  return VALID_DISPLAY_TYPES.has(s) ? s : 'text';
}

function parseBool(value: unknown, defaultValue = false): boolean {
  if (value === true || value === 'true' || value === '1' || value === 'on') return true;
  if (value === false || value === 'false' || value === '0' || value === 'off') return false;
  return defaultValue;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Affiliate links — accepts JSON or multipart/form-data.
 *
 * Actions:
 *   add     — create a new link (multipart for file upload)
 *   edit    — update an existing link by id
 *   toggle  — flip the active flag
 *   delete  — remove the record
 */
export const POST: APIRoute = async ({ request }) => {
  const { redirect, user } = await requireAdmin(request);
  if (redirect) return redirect;

  const contentType = request.headers.get('content-type') || '';
  let body: Record<string, any> = {};
  let bannerFile: File | null = null;

  if (contentType.includes('multipart/form-data')) {
    try {
      const fd = await request.formData();
      fd.forEach((value, key) => {
        if (key === 'banner_file' && value instanceof File && value.size > 0) {
          bannerFile = value;
        } else {
          body[key] = value;
        }
      });
    } catch {
      return fail('Invalid form data.', 400);
    }
  } else {
    try {
      body = await request.json();
    } catch {
      return fail('Invalid JSON body.', 400);
    }
  }

  const action = String(body.action || '').trim();
  let pb;
  try {
    pb = await getAdminPB();
  } catch {
    return fail('Could not connect to PocketBase. Check that the server is running.', 503);
  }

  try {
    if (action === 'add' || action === 'edit') {
      const name = String(body.name || '').trim();
      const url = String(body.url || '').trim();
      const displayType = pickDisplayType(body.display_type);
      if (!name || !url) return fail('Ad title and URL are required.', 400);
      if (name.length < 3) return fail('Ad title must be at least 3 characters.', 400);
      if (!isValidUrlFormat(url)) return fail('URL must start with https:// or http://', 400);

      // Validate content requirements per type
      const imageUrl = String(body.image_url || '').trim();
      // bannerFile is extracted above from multipart form data, NOT in body
      const hasImage = !!imageUrl || !!bannerFile;
      const bannerHtml = String(body.banner_html || '').trim();

      if (displayType === 'image' && !hasImage) {
        return fail('Image type requires an uploaded banner or an image URL. Save as draft (active=false) to skip.', 400);
      }
      if (displayType === 'html' && !bannerHtml) {
        return fail('HTML type requires banner HTML code. Save as draft (active=false) to skip.', 400);
      }

      // Default new links to inactive — must be explicitly activated after content is ready
      const explicitlySet = body.active !== undefined;
      const defaultActive = action === 'add' ? false : parseBool(body.active, true);

      const payload: Record<string, any> = {
        name,
        url,
        category: String(body.category || 'general').trim() || 'general',
        zone: pickZone(body.zone),
        display_type: displayType,
        active: explicitlySet ? parseBool(body.active, true) : defaultActive,
        description: String(body.description || '').trim().slice(0, 120),
        banner_html: String(body.banner_html || '').trim(),
        image_url: String(body.image_url || '').trim(),
      };

      const w = parseNumber(body.banner_width);
      const h = parseNumber(body.banner_height);
      if (w !== null) payload.banner_width = w;
      if (h !== null) payload.banner_height = h;

      // Build FormData for PocketBase if a file was uploaded — multipart preserves file
      const useFormData = !!bannerFile;
      const pbBody: any = useFormData ? new FormData() : { ...payload };
      if (useFormData) {
        for (const [k, v] of Object.entries(payload)) {
          if (v !== null && v !== undefined) pbBody.append(k, String(v));
        }
        pbBody.append('banner_file', bannerFile as File);
      }

      let record: any;
      if (action === 'add') {
        const initial = useFormData ? pbBody : { ...payload, clicks: 0 };
        if (useFormData) pbBody.append('clicks', '0');
        record = await pb.collection('affiliate_links').create(initial);
        auditLog('affiliate_link_created', { adminId: user?.id, linkId: record.id });
      } else {
        const id = String(body.id || body.linkId || '').trim();
        if (!id) return fail('Link id is required for edit.', 400);
        record = await pb.collection('affiliate_links').update(id, useFormData ? pbBody : payload);
        auditLog('affiliate_link_updated', { adminId: user?.id, linkId: id });
      }

      return ok({ id: record.id });
    }

    if (action === 'toggle' && body.linkId) {
      const link: any = await pb.collection('affiliate_links').getOne(body.linkId);
      const updated: any = await pb.collection('affiliate_links').update(body.linkId, { active: !link.active });
      auditLog('affiliate_link_toggled', { adminId: user?.id, linkId: body.linkId });
      return ok({ active: !!updated.active });
    }

    if (action === 'delete' && body.linkId) {
      // Check for dependent campaigns before deleting
      const force = parseBool(body.force, false);
      if (!force) {
        const campaignFilter = `reference_id_manual="${body.linkId}"`;
        try {
          const campaigns = await pb.collection('monetization_campaigns').getFullList({ filter: `reference_id="${body.linkId}"` });
          if (campaigns.length > 0) {
            const names = campaigns.map((c: any) => `${c.name} (${c.zone})`).join(', ');
            return fail(`This affiliate link is used by ${campaigns.length} campaign(s): ${names}. Delete anyway?`, 409);
          }
        } catch {
          // Filter query might fail if reference_id doesn't support filter — skip guard
        }
      }
      await pb.collection('affiliate_links').delete(body.linkId);
      auditLog('affiliate_link_deleted', { adminId: user?.id, linkId: body.linkId });
      return ok();
    }

    return fail('Unknown action.', 400);
  } catch (err: any) {
    if (isCollectionMissing(err)) return fail(COLLECTION_MISSING_MSG, 400);
    const fieldErrors = err?.data?.data || err?.response?.data;
    const hasFieldErrors = fieldErrors && Object.keys(fieldErrors).length > 0;
    const topMessage = err?.data?.message || err?.message || String(err);
    const detail = hasFieldErrors
      ? `${topMessage} — ${JSON.stringify(fieldErrors)}`
      : topMessage;
    console.error('[admin/affiliate-action] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return fail(`Failed to create record: ${detail}`, 500);
  }
};
