import type { APIRoute } from 'astro';
import { getServicePB, getAdminPB } from '../../../lib/auth';
import { getAdminSettings } from '../../../services/jobService';
import { runImports } from '../../../services/import/pipeline/orchestrator';
import { PocketBaseJobStore, PocketBaseEmployerStore } from '../../../services/import/pipeline/pocketbaseStores';
import { EmployerResolver } from '../../../services/import/pipeline/employerResolver';
import { AdzunaAdapter } from '../../../services/import/adapters/adzuna';
import { RssAdapter } from '../../../services/import/adapters/rss';
import type { SourceAdapter } from '../../../services/import/types';

/**
 * Automated import runner (Priority 1).
 *
 * Intended to be invoked by cron directly against the Node app port (bypassing
 * nginx), e.g.:  curl "http://127.0.0.1:4321/api/cron/import?token=$IMPORT_CRON_SECRET"
 *
 * Reuses the full ingestion pipeline (acquire → normalize → validate → dedupe →
 * employer resolution → persist) authenticated as the least-privilege service
 * account. Sources:
 *   - Adzuna API  (if ADZUNA_APP_ID + ADZUNA_APP_KEY are set)  ← primary volume
 *   - active RSS feeds configured in the xml_sources collection
 */

function authorized(url: URL, request: Request): boolean {
  const secret = process.env.IMPORT_CRON_SECRET || process.env.CSRF_SECRET;
  if (!secret) return false;
  const token = url.searchParams.get('token') || request.headers.get('x-cron-token') || '';
  return token === secret;
}

async function buildAdapters(): Promise<SourceAdapter[]> {
  const adapters: SourceAdapter[] = [];

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (appId && appKey) {
    adapters.push(
      new AdzunaAdapter({
        key: 'adzuna:za',
        appId,
        appKey,
        country: process.env.ADZUNA_COUNTRY || 'za',
        resultsPerPage: 50,
        maxPages: Number(process.env.ADZUNA_MAX_PAGES || 20),
        what: process.env.ADZUNA_WHAT || undefined,
        where: process.env.ADZUNA_WHERE || undefined,
        defaultCategory: 'General',
      })
    );
  }

  // Active RSS feeds from xml_sources (read via superuser; read-only).
  try {
    const pb = await getAdminPB();
    const sources = await pb
      .collection('xml_sources')
      .getFullList({ filter: 'active=true' })
      .catch(() => []);
    for (const s of sources as any[]) {
      if ((s.format || 'rss') === 'rss' && s.feed_url) {
        adapters.push(new RssAdapter({ key: `feed:${s.id}`, url: s.feed_url }));
      }
    }
  } catch {
    /* xml_sources optional */
  }

  return adapters;
}

async function run(): Promise<Response> {
  const settings = await getAdminSettings(['import_enabled']).catch(() => ({ import_enabled: 'false' }));
  if (settings.import_enabled !== 'true') {
    return json({ success: true, skipped: 'import_enabled is false' });
  }

  const adapters = await buildAdapters();
  if (!adapters.length) {
    return json({
      success: false,
      error: 'No import sources configured. Set ADZUNA_APP_ID/ADZUNA_APP_KEY or add an active RSS xml_sources record.',
    });
  }

  const pb = await getServicePB();
  const jobStore = new PocketBaseJobStore(pb, { persistFingerprint: true });
  const employerResolver = new EmployerResolver(new PocketBaseEmployerStore(pb));

  const results = await runImports(adapters, {
    jobStore,
    employerResolver,
    linkEmployers: true,
    console: true,
  });

  const summary = results.map((r) => ({
    source: r.source,
    acquired: r.acquired,
    imported: r.imported,
    updated: r.updated,
    duplicates: r.duplicates,
    rejected: r.rejected,
    warnings: r.warnings,
    rejectionBreakdown: r.rejectionBreakdown,
    durationMs: r.durationMs,
    errors: r.errors.slice(0, 5),
  }));

  const totals = summary.reduce(
    (a, s) => ({
      imported: a.imported + s.imported,
      updated: a.updated + s.updated,
      duplicates: a.duplicates + s.duplicates,
      rejected: a.rejected + s.rejected,
    }),
    { imported: 0, updated: 0, duplicates: 0, rejected: 0 }
  );

  return json({ success: true, totals, sources: summary });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!authorized(url, request)) return json({ success: false, error: 'Unauthorized' }, 401);
  try {
    return await run();
  } catch (err: any) {
    return json({ success: false, error: err?.message || 'import failed' }, 500);
  }
};

export const POST = GET;
