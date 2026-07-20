/**
 * Import pipeline — storage interfaces (Milestone 4).
 *
 * The orchestrator is storage-agnostic: it depends only on these interfaces,
 * so it can be exercised with in-memory fakes in unit tests and with the
 * PocketBase-backed implementations in production. This keeps the engine pure
 * and fully testable without a live database.
 */

import type { CanonicalCore, DedupeSignals } from '../types';

/** A minimal view of an already-stored job, used for dedupe/update decisions. */
export interface ExistingJobRef {
  id: string;
  source: string;
  source_ref?: string;
  title?: string;
  company?: string;
  province?: string;
  city?: string;
  /** Persisted fingerprint (available only after M3 adds the column). */
  fingerprint?: string;
  /** Content hash to detect whether an update is actually needed. */
  contentHash?: string;
}

export interface JobStore {
  /**
   * Find an existing job that matches any of the given dedupe signals.
   * Implementations should try the strongest signal first (source+source_ref,
   * then fingerprint if persisted). Returns null when no match.
   */
  findExisting(signals: DedupeSignals & { source: string }): Promise<ExistingJobRef | null>;
  create(core: CanonicalCore & { employer_id?: string; fingerprint?: string; content_hash?: string }): Promise<{ id: string }>;
  update(id: string, core: Partial<CanonicalCore> & { employer_id?: string; fingerprint?: string; content_hash?: string }): Promise<void>;
  /**
   * Deactivate jobs for `source` whose source_ref was NOT seen this run
   * (i.e. the employer removed the listing). Returns the number expired.
   * Optional: stores that can't enumerate may omit it; the orchestrator skips
   * expiry when unavailable.
   */
  expireMissing?(source: string, seenRefs: Set<string>): Promise<number>;
}

export interface EmployerRef {
  id: string;
  company_name: string;
  company_slug: string;
  website?: string;
  province?: string;
  city?: string;
}

export interface EmployerStore {
  findByNameOrSlug(name: string, slug: string): Promise<EmployerRef | null>;
  create(data: {
    company_name: string;
    company_slug: string;
    website?: string;
    province?: string;
    city?: string;
    contact_email?: string;
  }): Promise<EmployerRef>;
  /** Optionally patch missing fields (website/location) discovered on a new listing. */
  update(id: string, patch: Partial<Omit<EmployerRef, 'id'>>): Promise<void>;
}
