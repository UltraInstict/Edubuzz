import type { APIRoute } from 'astro';
import { randomBytes } from 'crypto';
import { getAdminPB, requireAdmin, auditLog } from '../../../lib/auth';
import { ok, fail, cleanString } from '../../../lib/api';

/**
 * JSON importer for admin/import.
 *
 * Accepts multipart/form-data with:
 *   - file:     JSON file (required) — array of job objects OR { jobs: [...] }
 *   - active:   'true' | 'false'  (default false)
 *   - featured: 'true' | 'false'  (default false)
 *
 * Returns: { success, data: { imported, skipped, errors[] } }
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function randomSuffix(): string {
  return randomBytes(3).toString('hex');
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

const COLLECTION_MISSING_MSG =
  'jobs collection error. Check that PocketBase is running and the jobs collection exists.';

export const POST: APIRoute = async ({ request }) => {
  const { redirect, user } = await requireAdmin(request);
  if (redirect) return redirect;

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return fail('Invalid form data.', 400);
  }

  const file = fd.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return fail('No JSON file uploaded.', 400);
  }
  if (file.size > 10 * 1024 * 1024) {
    return fail('JSON file is too large (max 10MB).', 400);
  }

  const setActive = parseBool(fd.get('active'), false);
  const setFeatured = parseBool(fd.get('featured'), false);

  let jsonText: string;
  try {
    jsonText = await file.text();
  } catch {
    return fail('Could not read file contents.', 400);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err: any) {
    return fail(`Invalid JSON: ${err?.message || 'parse error'}`, 400);
  }

  // Accept either a bare array or an object with a `jobs` array
  let rows: any[] = [];
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (parsed && Array.isArray(parsed.jobs)) {
    rows = parsed.jobs;
  } else {
    return fail('JSON must be an array of job objects or an object with a "jobs" array.', 400);
  }

  if (rows.length === 0) {
    return fail('JSON contains no job entries.', 400);
  }

  let pb;
  try {
    pb = await getAdminPB();
  } catch {
    return fail('Could not connect to PocketBase.', 503);
  }

  const expiresIso = new Date(Date.now() + 30 * 86400000).toISOString();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || {};
    const lineNum = i + 1;

    const title = cleanString(row.title, 120);
    if (!title) {
      skipped++;
      continue;
    }

    const company = cleanString(row.company, 120) || 'Unknown';
    const slug = `${slugify(title)}-${randomSuffix()}`;

    const data: Record<string, any> = {
      title,
      slug,
      company,
      category: cleanString(row.category, 80) || 'General',
      province: cleanString(row.province, 80) || 'Remote',
      city: cleanString(row.city, 80),
      description: cleanString(row.description, 10000),
      apply_url: cleanString(row.apply_url, 300),
      apply_email: cleanString(row.apply_email, 120),
      job_type: cleanString(row.job_type, 40) || 'Full-time',
      source: cleanString(row.source, 40) || 'json_import',
      active: setActive,
      featured: setFeatured,
      expires: expiresIso,
      xml_export: true,
    };

    const sMin = parseNumber(row.salary_min);
    const sMax = parseNumber(row.salary_max);
    if (sMin !== null) data.salary_min = sMin;
    if (sMax !== null) data.salary_max = sMax;

    try {
      await pb.collection('jobs').create(data);
      imported++;
    } catch (err: any) {
      const msg = err?.message || String(err);
      const status = err?.status ?? err?.response?.status ?? 0;
      if (status === 404 && msg.toLowerCase().includes('collection')) {
        return fail(COLLECTION_MISSING_MSG, 400);
      }
      errors.push(`Entry ${lineNum} (${title}): ${msg}`);
    }
  }

  auditLog('json_import', { adminId: user?.id, imported, skipped, errorCount: errors.length });

  return ok({ imported, skipped, errors });
};
