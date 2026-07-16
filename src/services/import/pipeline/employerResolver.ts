/**
 * Import pipeline — employer resolution (Milestone 4).
 *
 * Given a canonical job, find-or-create the employer, merge in newly-discovered
 * details (website/location), and return the employer id for linking. Matching
 * is by normalized name + slug so "Acme (Pty) Ltd", "ACME Pty Ltd" and
 * "acme pty ltd" resolve to the same employer instead of creating duplicates.
 *
 * The store is injected (EmployerStore) so this is fully unit-testable.
 */

import type { CanonicalJob } from '../types';
import { normalizeKey, slugify } from '../normalize';
import type { EmployerStore, EmployerRef } from './stores';

/** Company-suffix noise removed before matching (keeps display name intact). */
const COMPANY_NOISE = /\b(pty|ltd|limited|inc|incorporated|llc|cc|proprietary|group|holdings|sa|rsa|international|intl)\b/g;

/** Normalized matching key for a company name. */
export function employerMatchKey(name: string): string {
  return normalizeKey(name).replace(COMPANY_NOISE, '').replace(/\s+/g, ' ').trim();
}

/** Deterministic employer slug from a company name. */
export function employerSlug(name: string): string {
  return slugify(name);
}

export interface ResolveResult {
  employer: EmployerRef;
  created: boolean;
  updated: boolean;
}

export class EmployerResolver {
  /** In-run cache so repeated companies in one batch hit the store once. */
  private readonly cache = new Map<string, EmployerRef>();

  constructor(private readonly store: EmployerStore) {}

  async resolve(job: CanonicalJob): Promise<ResolveResult | null> {
    const name = (job.core.company || '').trim();
    if (!name) return null;

    const key = employerMatchKey(name);
    const slug = employerSlug(name);

    const cached = this.cache.get(key);
    if (cached) return { employer: cached, created: false, updated: false };

    const existing = await this.store.findByNameOrSlug(name, slug);
    if (existing) {
      // Backfill missing website/location from this listing if we now know them.
      const patch: Partial<Omit<EmployerRef, 'id'>> = {};
      const website = job.enrichment.company_website;
      if (website && !existing.website) patch.website = website;
      if (job.core.province && !existing.province) patch.province = job.core.province;
      if (job.core.city && !existing.city) patch.city = job.core.city;

      let updated = false;
      if (Object.keys(patch).length) {
        await this.store.update(existing.id, patch);
        updated = true;
      }
      const merged = { ...existing, ...patch };
      this.cache.set(key, merged);
      return { employer: merged, created: false, updated };
    }

    const created = await this.store.create({
      company_name: name,
      company_slug: slug,
      website: job.enrichment.company_website,
      province: job.core.province || undefined,
      city: job.core.city || undefined,
    });
    this.cache.set(key, created);
    return { employer: created, created: true, updated: false };
  }
}
