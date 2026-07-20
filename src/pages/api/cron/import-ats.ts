import type { APIRoute } from 'astro';
import { getServicePB } from '../../../lib/auth';
import { runImports } from '../../../services/import/pipeline/orchestrator';
import {
  PocketBaseJobStore,
  PocketBaseEmployerStore,
} from '../../../services/import/pipeline/pocketbaseStores';
import { EmployerResolver } from '../../../services/import/pipeline/employerResolver';
import { buildEmployerAdapters, EMPLOYER_SOURCES } from '../../../services/import/sources';
import type { Connector } from '../../../services/import/sources';

/**
 * ATS import runner — Workday, Greenhouse, SmartRecruiters, Lever.
 *
 * Runs the four keyless ATS connectors against the verified employers in the
 * frozen Source Library (services/import/sources.ts) through the full pipeline:
 *   acquire → canonicalize → validate → dedupe → employer-resolve →
 *   create/update → expire-removed → structured logging.
 *
 * Every job's apply URL is the employer's OWN official ATS page; the validation
 * layer rejects any apply URL that points at a competing job board. Full HTML
 * descriptions are stored exactly as published (never summarised/truncated).
 *
 * Invoke (bypassing nginx), e.g.:
 *   curl "http://127.0.0.1:4321/api/cron/import-ats?token=$IMPORT_CRON_SECRET"
 * Optional query params:
 *   ?ids=takealot,outsurance      restrict to Source Library ids
 *   ?connectors=greenhouse,lever  restrict to connectors
 *   ?includeDisabled=1            also run sources pending token confirmation
 *   ?dryRun=1                     acquire + validate only; write nothing to the DB
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

function csvList(v: string | null): string[] | undefined {
  if (!v) return undefined;
  const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!authorized(url, request)) return json({ success: false, error: 'Unauthorized' }, 401);

  const ids = csvList(url.searchParams.get('ids'));
  const connectors = csvList(url.searchParams.get('connectors')) as Connector[] | undefined;
  const includeDisabled = url.searchParams.get('includeDisabled') === '1';
  const dryRun = url.searchParams.get('dryRun') === '1';

  const adapters = buildEmployerAdapters({ ids, connectors, includeDisabled });
  if (!adapters.length) {
    return json({
      success: false,
      error: 'No enabled ATS sources match the request. Confirm tokens/sites in services/import/sources.ts or pass ?includeDisabled=1.',
      configured: EMPLOYER_SOURCES.map((s) => ({ id: s.id, connector: s.connector, enabled: s.enabled })),
    });
  }

  try {
    const started = Date.now();

    // Dry run: exercise acquisition + the pipeline with in-memory stores so we
    // can report real acquired/valid counts without touching the database.
    const pb = dryRun ? null : await getServicePB();
    const jobStore = dryRun
      ? new InMemoryJobStore()
      : new PocketBaseJobStore(pb!, { persistFingerprint: true });
    const employerResolver = dryRun
      ? undefined
      : new EmployerResolver(new PocketBaseEmployerStore(pb!));

    const results = await runImports(adapters, {
      jobStore,
      employerResolver,
      linkEmployers: !dryRun,
      expireMissing: !dryRun,
      console: true,
    });

    const perSource = results.map((r) => ({
      source: r.source,
      acquired: r.acquired,
      imported: r.imported,
      updated: r.updated,
      duplicates: r.duplicates,
      expired: r.expired,
      rejected: r.rejected,
      warnings: r.warnings,
      rejectionBreakdown: r.rejectionBreakdown,
      durationMs: r.durationMs,
      failures: r.errors.slice(0, 10),
    }));

    const report = {
      jobsImported: sum(perSource, 'imported'),
      jobsUpdated: sum(perSource, 'updated'),
      duplicatesSkipped: sum(perSource, 'duplicates'),
      jobsExpired: sum(perSource, 'expired'),
      jobsRejected: sum(perSource, 'rejected'),
      // Companies imported = distinct employer sources that yielded ≥1 live job.
      companiesImported: perSource.filter((r) => r.imported > 0 || r.updated > 0).length,
      importDurationMs: Date.now() - started,
      failures: perSource.flatMap((s) => s.failures),
    };

    return json({ success: true, dryRun, report, sources: perSource });
  } catch (err: any) {
    return json({ success: false, error: err?.message || 'ATS import failed' }, 500);
  }
};

export const POST = GET;

function sum(rows: Array<Record<string, number>>, key: string): number {
  return rows.reduce((a, r) => a + (r[key] || 0), 0);
}

/** Minimal in-memory JobStore for dry runs (no DB writes). */
class InMemoryJobStore {
  private readonly rows = new Map<string, { id: string; source: string; source_ref?: string; content_hash?: string }>();
  private seq = 0;
  async findExisting(signals: { source: string; externalId?: string; sourceUrl?: string; fingerprint?: string }) {
    for (const r of this.rows.values()) {
      if (signals.externalId && r.source === signals.source && r.source_ref === signals.externalId) return { ...r };
      if (signals.sourceUrl && r.source_ref === signals.sourceUrl) return { ...r };
    }
    return null;
  }
  async create(core: any) {
    const id = `mem_${++this.seq}`;
    this.rows.set(id, { id, source: core.source, source_ref: core.source_ref, content_hash: core.content_hash });
    return { id };
  }
  async update(id: string, core: any) {
    const cur = this.rows.get(id);
    if (cur) this.rows.set(id, { ...cur, content_hash: core.content_hash });
  }
}
