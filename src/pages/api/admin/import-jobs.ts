import type { APIRoute } from 'astro';
import { getAdminPB, requireAdmin } from '../../../lib/auth';
import { cleanString, isHttpsUrl, json } from '../../../lib/api';
import { parseXmlFeed, type RawJob } from '../../../lib/xmlParser';
import { PROVINCES, provinceName } from '../../../lib/slugify';

type ImportResult = { imported: number; skipped: number; errors: number };

function addDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function normaliseProvince(value = '') {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return PROVINCES[slug] || provinceName(slug) || value || 'Remote';
}

async function importJobs(jobs: RawJob[], source = 'import'): Promise<ImportResult> {
  const pb = await getAdminPB();
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const raw of jobs) {
    const title = cleanString(raw.title, 120);
    const company = cleanString(raw.company, 120);
    const source_ref = cleanString(raw.id || raw.apply_url || `${title}-${company}`, 200);
    const jobSource = cleanString(raw.source || source, 40) || 'import';
    if (!title || !company) {
      errors++;
      continue;
    }
    if (source_ref) {
      const existing = await pb.collection('jobs').getList(1, 1, {
        filter: `source_ref="${source_ref.replace(/"/g, '\\"')}"&&source="${jobSource}"`,
        fields: 'id',
      });
      if (existing.totalItems > 0) {
        skipped++;
        continue;
      }
    }
    if (raw.apply_url && !isHttpsUrl(raw.apply_url)) {
      errors++;
      continue;
    }
    try {
      await pb.collection('jobs').create({
        title,
        company,
        description: cleanString(raw.description, 10000),
        province: normaliseProvince(raw.province),
        city: cleanString(raw.city, 80),
        category: cleanString(raw.category, 80) || 'General',
        job_type: cleanString(raw.job_type, 40) || 'Full-time',
        salary_min: raw.salary_min ?? null,
        salary_max: raw.salary_max ?? null,
        apply_url: cleanString(raw.apply_url, 300),
        apply_email: cleanString(raw.apply_email, 120),
        source: jobSource,
        source_ref,
        active: true,
        expires: raw.expires || addDays(30),
        xml_export: true,
      });
      imported++;
    } catch {
      errors++;
    }
  }

  return { imported, skipped, errors };
}

function parseCsv(data: string): RawJob[] {
  const [headerLine, ...rows] = data.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map((h) => h.trim());
  return rows.map((row) => {
    const values = row.split(',').map((v) => v.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])) as RawJob;
  });
}

export const POST: APIRoute = async ({ request }) => {
  const { redirect } = requireAdmin(request);
  if (redirect) return redirect;

  try {
    const body = await request.json();
    if (body.type === 'xml_feed') {
      const pb = await getAdminPB();
      const source: any = await pb.collection('xml_sources').getOne(cleanString(body.feedId, 80));
      const response = await fetch(source.feed_url);
      const xml = await response.text();
      const result = await importJobs(parseXmlFeed(xml, source.format), 'xml_feed');
      await pb.collection('xml_sources').update(source.id, {
        last_imported: new Date().toISOString(),
        'import_count+': result.imported,
      });
      return json(result);
    }
    if (body.type === 'csv') return json(await importJobs(parseCsv(String(body.data || ''))));
    if (body.type === 'json' && Array.isArray(body.data)) return json(await importJobs(body.data));
    return json({ message: 'Unsupported import type.' }, { status: 400 });
  } catch {
    return json({ message: 'Import failed.' }, { status: 500 });
  }
};
