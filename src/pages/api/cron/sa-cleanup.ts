import type { APIRoute } from 'astro';
import { getAdminPB } from '../../../lib/auth';
import { resolveSA } from '../../../lib/saLocation';

/**
 * SA-only cleanup — quarantine foreign active jobs.
 *
 * Every active job is checked with the deterministic SA resolver (same gate the
 * import pipeline uses). Any job that is NOT resolvably South African is
 * QUARANTINED: active=false + xml_export=false so it drops out of listings,
 * feeds and sitemaps immediately. Jobs are NEVER deleted (audit-safe); each
 * quarantine is written to audit_logs with the reason.
 *
 * Invoke (bypassing nginx):
 *   curl "http://127.0.0.1:4321/api/cron/sa-cleanup?token=$CSRF_SECRET"
 * Query params:
 *   ?dryRun=1   report only; write nothing (also returns live schema fields).
 */

function authorized(url: URL, request: Request): boolean {
  const secret = process.env.IMPORT_CRON_SECRET || process.env.CSRF_SECRET;
  if (!secret) return false;
  const token = url.searchParams.get('token') || request.headers.get('x-cron-token') || '';
  return token === secret;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!authorized(url, request)) return json({ success: false, error: 'Unauthorized' }, 401);
  const dryRun = url.searchParams.get('dryRun') === '1';

  let pb;
  try {
    pb = await getAdminPB();
  } catch (err: any) {
    return json({ success: false, error: `PB auth failed: ${err?.message || err}` }, 503);
  }

  let all: any[] = [];
  try {
    all = await pb.collection('jobs').getFullList({
      batch: 500,
      fields: 'id,title,company,province,city,active,expires,source,xml_export',
      sort: '-created',
    });
  } catch (err: any) {
    return json({ success: false, error: `fetch jobs failed: ${err?.message || err}` }, 500);
  }

  const active = all.filter((j) => j.active);
  const foreign = active.filter(
    (j) => !resolveSA({ province: j.province, city: j.city, location: j.city }).isSA
  );

  const reasons: Record<string, number> = {};
  for (const j of foreign) {
    const r = resolveSA({ province: j.province, city: j.city, location: j.city }).reason;
    reasons[r] = (reasons[r] || 0) + 1;
  }

  const report = {
    totalJobs: all.length,
    activeJobs: active.length,
    foreignActive: foreign.length,
    reasons,
    sampleForeign: foreign.slice(0, 20).map((j) => ({ id: j.id, company: j.company, province: j.province, city: j.city })),
    sampleFields: all[0] ? Object.keys(all[0]) : [],
  };

  if (dryRun) {
    return json({ success: true, dryRun: true, report });
  }

  // Live: quarantine each foreign active job.
  let quarantined = 0;
  const failures: string[] = [];
  const nowIso = new Date().toISOString().replace('T', ' ').replace('Z', '');
  for (const j of foreign) {
    const reason = resolveSA({ province: j.province, city: j.city, location: j.city }).reason;
    try {
      await pb.collection('jobs').update(j.id, { active: false, xml_export: false, expires: nowIso });
      quarantined++;
      try {
        await pb.collection('audit_logs').create({
          event: 'job_quarantined_foreign',
          details: JSON.stringify({ jobId: j.id, company: j.company, province: j.province, city: j.city, reason: `not_south_africa:${reason}` }),
        });
      } catch { /* audit is best-effort */ }
    } catch (err: any) {
      failures.push(`${j.id}: ${err?.message || err}`);
    }
  }

  return json({ success: true, dryRun: false, report: { ...report, quarantined, failures: failures.slice(0, 20) } });
};

export const POST = GET;
