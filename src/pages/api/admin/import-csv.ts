import type { APIRoute } from 'astro';
import { randomBytes } from 'crypto';
import { getAdminPB, requireAdmin, auditLog } from '../../../lib/auth';
import { ok, fail, cleanString } from '../../../lib/api';

/**
 * CSV importer for admin/import.
 *
 * Accepts multipart/form-data with:
 *   - file:     CSV file (required)
 *   - active:   'true' | 'false'  (default false → goes in as pending review)
 *   - featured: 'true' | 'false'  (default false)
 *
 * Returns: { success, data: { imported, skipped, errors[] } }
 */

type Row = Record<string, string>;

/** Tolerant CSV parser. Handles quoted fields, embedded commas, and CRLF/LF line endings. */
function parseCsv(text: string): Row[] {
  // Strip BOM and any leading non-CSV warning lines (sometimes a tool prepends "npm warn …" output).
  let cleaned = text.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r?\n/);

  // Skip leading lines that don't look like a CSV header (must contain a comma and at least one alpha character).
  let headerLineIndex = 0;
  while (headerLineIndex < lines.length) {
    const line = lines[headerLineIndex];
    if (line && line.includes(',') && /[a-z]/i.test(line)) break;
    headerLineIndex++;
  }
  if (headerLineIndex >= lines.length) return [];

  const rows: string[][] = [];
  let current: string[] = [];
  let buf = '';
  let inQuotes = false;

  // Re-join lines after the chosen header so we can handle quoted newlines properly.
  const csvBody = lines.slice(headerLineIndex).join('\n');

  for (let i = 0; i < csvBody.length; i++) {
    const ch = csvBody[i];
    if (inQuotes) {
      if (ch === '"' && csvBody[i + 1] === '"') {
        buf += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        buf += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        current.push(buf);
        buf = '';
      } else if (ch === '\n') {
        current.push(buf);
        rows.push(current);
        current = [];
        buf = '';
      } else if (ch === '\r') {
        // skip
      } else {
        buf += ch;
      }
    }
  }
  if (buf.length || current.length) {
    current.push(buf);
    rows.push(current);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const out: Row[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || (r.length === 1 && !r[0])) continue;
    const obj: Row = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (r[j] ?? '').trim();
    }
    out.push(obj);
  }
  return out;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function randomSuffix(): string {
  // 6 hex chars = 16M combinations — collisions effectively zero per import batch
  return randomBytes(3).toString('hex');
}

function parseBool(value: unknown, defaultValue = false): boolean {
  if (value === true || value === 'true' || value === '1' || value === 'on') return true;
  if (value === false || value === 'false' || value === '0' || value === 'off') return false;
  return defaultValue;
}

function parseNumber(value: string): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
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
    return fail('No CSV file uploaded.', 400);
  }
  if (file.size > 10 * 1024 * 1024) {
    return fail('CSV is too large (max 10MB).', 400);
  }

  const setActive = parseBool(fd.get('active'), false);
  const setFeatured = parseBool(fd.get('featured'), false);

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return fail('Could not read file contents.', 400);
  }

  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    return fail('CSV is empty or has no recognisable header row.', 400);
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
    const row = rows[i];
    const lineNum = i + 2; // +2 for header line + 1-based numbering

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
      source: cleanString(row.source, 40) || 'csv_import',
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
      errors.push(`Row ${lineNum} (${title}): ${msg}`);
    }
  }

  auditLog('csv_import', { adminId: user?.id, imported, skipped, errorCount: errors.length });

  return ok({ imported, skipped, errors });
};
