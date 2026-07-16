/**
 * Import pipeline — duplicate detection (Milestone 1).
 *
 * Builds multi-signal dedupe fingerprints so we never rely on title alone.
 * Signals: source URL, external ID, and a deterministic fingerprint of
 * employer + title + location (all normalized). Also exposes a similarity
 * helper for near-duplicate detection across the corpus.
 *
 * PURE + dependency-free (uses a stable string hash, no node:crypto) so it
 * runs identically in unit tests, Node, and edge runtimes.
 */

import type { CanonicalJob, DedupeSignals, RawJob } from './types';
import { normalizeKey } from './normalize';

/**
 * FNV-1a 32-bit hash → hex. Deterministic, fast, no dependencies.
 * Sufficient for grouping/fingerprinting (not a cryptographic hash).
 */
export function stableHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619 (FNV prime), kept in 32-bit range
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Drop noise words from a title so "Snr Developer" ≈ "Senior Developer (x2)". */
function canonicalTitle(title: string): string {
  const expanded = normalizeKey(title)
    .replace(/\bsnr\b/g, 'senior')
    .replace(/\bjnr\b/g, 'junior')
    .replace(/\bmgr\b/g, 'manager')
    .replace(/\bdev\b/g, 'developer')
    .replace(/\beng\b/g, 'engineer');
  const NOISE = new Set([
    'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'at',
    'x2', 'x3', 'urgent', 'new', 'vacancy', 'position', 'wanted', 'needed',
    'permanent', 'temp', 'temporary', 'fulltime', 'parttime',
  ]);
  return expanded
    .split(' ')
    .filter((w) => w && !NOISE.has(w) && !/^\d+$/.test(w))
    .join(' ')
    .trim();
}

/** Build all dedupe signals for a canonical job. */
export function buildDedupeSignals(job: CanonicalJob): DedupeSignals {
  const titleKey = canonicalTitle(job.core.title);
  const employerKey = normalizeKey(job.core.company);
  const locationKey = normalizeKey(
    [job.core.city, job.core.province].filter(Boolean).join(' ')
  );
  const fingerprint = stableHash(`${employerKey}|${titleKey}|${locationKey}`);

  return {
    sourceUrl: job.dedupe?.sourceUrl,
    externalId: job.dedupe?.externalId,
    fingerprint,
    titleKey,
    employerKey,
    locationKey,
  };
}

/** Build partial signals directly from a RawJob (used before full canonicalize). */
export function rawDedupeKeys(raw: RawJob): Pick<DedupeSignals, 'sourceUrl' | 'externalId'> {
  return {
    sourceUrl: raw.sourceUrl?.trim() || undefined,
    externalId: raw.externalId?.trim() || undefined,
  };
}

/**
 * Decide if two jobs are duplicates using layered signals.
 * Returns the strongest matching signal, or null if distinct.
 */
export function duplicateMatch(
  a: DedupeSignals,
  b: DedupeSignals
): 'external_id' | 'source_url' | 'fingerprint' | 'similarity' | null {
  if (a.externalId && b.externalId && a.externalId === b.externalId) return 'external_id';
  if (a.sourceUrl && b.sourceUrl && normalizeUrl(a.sourceUrl) === normalizeUrl(b.sourceUrl)) {
    return 'source_url';
  }
  if (a.fingerprint && a.fingerprint === b.fingerprint) return 'fingerprint';
  // Near-duplicate: same employer + same location + very similar title.
  if (
    a.employerKey &&
    a.employerKey === b.employerKey &&
    a.locationKey === b.locationKey &&
    titleSimilarity(a.titleKey, b.titleKey) >= 0.85
  ) {
    return 'similarity';
  }
  return null;
}

/** Strip protocol/trailing-slash/query noise so URLs compare cleanly. */
export function normalizeUrl(url: string): string {
  return (url || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');
}

/**
 * Token-based Jaccard similarity of two title keys (0–1).
 * Simple, order-independent, good enough for near-dup grouping.
 */
export function titleSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const sa = new Set(a.split(' ').filter(Boolean));
  const sb = new Set(b.split(' ').filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}
