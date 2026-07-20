/**
 * Import pipeline — orchestrator (Milestone 4).
 *
 * Runs a single SourceAdapter through the full pipeline:
 *   acquire → canonicalize → validate → in-batch dedupe → existing dedupe →
 *   employer resolution → create/update → logging.
 *
 * Storage + employer resolution are injected, so the whole engine is unit-
 * testable with in-memory fakes. Employer linking is gated behind
 * `linkEmployers` (default false) until the M3 schema adds `jobs.employer_id`.
 */

import type { CanonicalJob, SourceAdapter } from '../types';
import { toCanonicalJob, type SourceMeta } from '../index';
import { validateJob } from '../validate';
import { buildDedupeSignals, duplicateMatch, stableHash } from '../dedupe';
import { ImportLogger, type ImportRunResult } from './logger';
import type { JobStore } from './stores';
import type { EmployerResolver } from './employerResolver';

export interface OrchestratorOptions {
  jobStore: JobStore;
  employerResolver?: EmployerResolver;
  /** Attach resolved employer_id to stored jobs (requires M3 schema). */
  linkEmployers?: boolean;
  /**
   * After a successful run, deactivate jobs from this source that were NOT
   * seen this run (employer removed the listing). Only runs when the store
   * supports `expireMissing` AND the run acquired at least one job (so a
   * transient empty fetch never mass-expires a source). Default false.
   */
  expireMissing?: boolean;
  /** Emit console output alongside the in-memory event buffer. */
  console?: boolean;
  /** Per-record meta passthrough (e.g. AI confidence override). */
  meta?: Omit<SourceMeta, 'source'>;
}

/** Stable content hash of the fields that matter for "did this change?". */
export function contentHash(job: CanonicalJob): string {
  const c = job.core;
  return stableHash(
    [
      c.title,
      c.company,
      c.description,
      c.province,
      c.city,
      c.job_type,
      c.salary_min ?? '',
      c.salary_max ?? '',
      c.apply_url,
      c.apply_email,
      c.expires ?? '',
    ].join('|')
  );
}

export async function runImport(
  adapter: SourceAdapter,
  opts: OrchestratorOptions
): Promise<ImportRunResult> {
  const log = new ImportLogger(adapter.key, { console: opts.console });

  let raw;
  try {
    raw = await adapter.acquire();
  } catch (err) {
    log.error(`acquire failed: ${err instanceof Error ? err.message : String(err)}`);
    return log.finalize();
  }
  log.counters.acquired = raw.length;
  log.info(`acquired ${raw.length} raw jobs`);

  // Track fingerprints seen within THIS run for in-batch dedupe.
  const seen: CanonicalJob['dedupe'][] = [];
  // Track every source_ref successfully processed this run (for expiry).
  const seenRefs = new Set<string>();

  for (const r of raw) {
    let job: CanonicalJob;
    try {
      job = toCanonicalJob(r, { source: adapter.key, ...(opts.meta || {}) });
    } catch (err) {
      log.error(`canonicalize failed: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
    log.counters.canonicalized++;

    const validation = validateJob(job);
    if (!validation.ok) {
      log.recordRejection(validation.rejections);
      log.debug('rejected', { title: job.core.title, reasons: validation.rejections });
      continue;
    }
    if (validation.warnings.length) {
      log.warn('flagged', { title: job.core.title, warnings: validation.warnings });
    }

    // 1) In-batch duplicate?
    const dup = seen.find((s) => duplicateMatch(s, job.dedupe));
    if (dup) {
      log.counters.duplicates++;
      log.debug('duplicate (in-batch)', { title: job.core.title });
      continue;
    }
    seen.push(job.dedupe);

    // 2) Existing record?
    let existing = null;
    try {
      existing = await opts.jobStore.findExisting({ ...job.dedupe, source: adapter.key });
    } catch (err) {
      log.error(`findExisting failed: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    // 3) Employer resolution (optional link).
    let employerId: string | undefined;
    if (opts.employerResolver) {
      try {
        const res = await opts.employerResolver.resolve(job);
        if (res) employerId = res.employer.id;
      } catch (err) {
        log.warn(`employer resolve failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    const link = opts.linkEmployers ? { employer_id: employerId } : {};
    const hash = contentHash(job);
    const fingerprint = job.dedupe.fingerprint;
    // Mark as live this run so the expiry pass never deactivates it.
    if (job.core.source_ref) seenRefs.add(job.core.source_ref);

    try {
      if (existing) {
        if (existing.contentHash && existing.contentHash === hash) {
          log.counters.duplicates++;
          log.debug('unchanged (skip update)', { id: existing.id });
        } else {
          await opts.jobStore.update(existing.id, {
            ...job.core,
            ...link,
            fingerprint,
            content_hash: hash,
          });
          log.counters.updated++;
          log.debug('updated', { id: existing.id, title: job.core.title });
        }
      } else {
        const { id } = await opts.jobStore.create({
          ...job.core,
          ...link,
          fingerprint,
          content_hash: hash,
        });
        log.counters.imported++;
        log.debug('created', { id, title: job.core.title });
      }
    } catch (err) {
      log.error(`persist failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Expiry: deactivate listings the employer removed. Guarded so a transient
  // empty/failed fetch can never mass-expire a source.
  if (opts.expireMissing && typeof opts.jobStore.expireMissing === 'function' && seenRefs.size > 0) {
    try {
      const expired = await opts.jobStore.expireMissing(adapter.key, seenRefs);
      log.counters.expired = expired;
      if (expired > 0) log.info(`expired ${expired} removed listings`);
    } catch (err) {
      log.error(`expireMissing failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const result = log.finalize();
  log.info('run complete', {
    imported: result.imported,
    updated: result.updated,
    duplicates: result.duplicates,
    rejected: result.rejected,
    expired: result.expired,
  });
  return result;
}

/** Run several adapters sequentially, returning one result per source. */
export async function runImports(
  adapters: SourceAdapter[],
  opts: OrchestratorOptions
): Promise<ImportRunResult[]> {
  const results: ImportRunResult[] = [];
  for (const adapter of adapters) {
    results.push(await runImport(adapter, opts));
  }
  return results;
}
