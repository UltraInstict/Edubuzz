/**
 * Import pipeline — Source Library model (Phase 4B, Milestone 1).
 *
 * The Source Library is the authoritative registry of South African employers
 * Edubuzz imports from. It is the "table" the discovery engine writes into and
 * the import runner reads from. It is kept in code (versioned, reviewable,
 * deterministic) — the same pattern as services/import/sources.ts — and can be
 * mirrored into a PocketBase `source_library` collection later without changing
 * this contract.
 *
 * HARD RULES encoded here:
 *   - Every entry is a REAL employer with its OWN official careers URL.
 *   - `verification_status` gates imports: only 'verified' entries are ever
 *     imported. 'pending'/'unverified' are discovered-but-not-live (never
 *     imported, never activated) until a human/live check promotes them.
 *   - Nothing is fabricated: unknown ATS → 'unknown', unknown province →
 *     'National'. We record what we know and mark the rest for verification.
 */

import type { AtsType } from './ats';
import { detectAts } from './ats';
import type { Connector } from './sources';
import type { CareerSelectors } from './adapters/htmlCareer';

export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

export type Industry =
  | 'banking'
  | 'insurance'
  | 'retail'
  | 'mining'
  | 'telecoms'
  | 'logistics'
  | 'technology'
  | 'healthcare'
  | 'university'
  | 'municipality'
  | 'soe'
  | 'government'
  | 'manufacturing'
  | 'energy'
  | 'construction'
  | 'agriculture'
  | 'hospitality'
  | 'professional_services'
  | 'other';

export interface SourceLibraryEntry {
  /** Stable id (slug). */
  id: string;
  company_name: string;
  website: string;
  careers_url: string;
  /** ATS platform behind the careers URL (detected from the URL if not set). */
  ats_type: AtsType;
  industry: Industry;
  /** Head-office province, or 'National' for multi-province employers. */
  province: string;
  verification_status: VerificationStatus;
  /** ISO timestamp of the last liveness/verification check, or null. */
  last_checked_at: string | null;
  /** ISO timestamp of the last successful import from this source, or null. */
  last_import_at: string | null;
  notes: string;
  /**
   * How a VERIFIED source is imported. For keyless ATS connectors this maps to
   * the existing engine (sources.ts). For own-site HTML lists it is 'html' with
   * per-employer `selectors`. Absent until verified.
   */
  connector?: Connector | 'html';
  /** Greenhouse board token / Lever slug / SmartRecruiters id / Ashby board / Recruitee company. */
  token?: string;
  /** HTML adapter selectors (only for connector==='html'). */
  selectors?: CareerSelectors;
  /** HTML adapter start URLs (only for connector==='html'; defaults to careers_url). */
  listUrls?: string[];
}

/** Input to `defineSource` — ats_type is derived from careers_url if omitted. */
type SourceInput = Omit<SourceLibraryEntry, 'ats_type' | 'last_checked_at' | 'last_import_at'> & {
  ats_type?: AtsType;
  last_checked_at?: string | null;
  last_import_at?: string | null;
};

/** Normalize a seed entry: derive ats_type from the careers URL when unknown. */
export function defineSource(input: SourceInput): SourceLibraryEntry {
  const detected = input.ats_type ?? detectAts(input.careers_url);
  return {
    ...input,
    ats_type: detected,
    last_checked_at: input.last_checked_at ?? null,
    last_import_at: input.last_import_at ?? null,
  };
}
