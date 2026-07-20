/**
 * Import pipeline — PocketBase-backed stores (Milestone 4).
 *
 * Concrete JobStore/EmployerStore over PocketBase. The orchestrator itself is
 * store-agnostic and unit-tested with fakes; these implementations are what
 * production wires up once a live import runs.
 *
 * NOTE: `fingerprint`/`content_hash` and `employer_id` linking depend on the
 * M3 schema extension. Until those columns exist, construct the JobStore with
 * `persistFingerprint: false` / run the orchestrator with `linkEmployers:false`
 * so no unknown-field writes are attempted. findExisting falls back to the
 * (source, source_ref) pair which exists on the current schema.
 */

import type PocketBase from 'pocketbase';
import type { CanonicalCore, DedupeSignals } from '../types';
import type { EmployerRef, EmployerStore, ExistingJobRef, JobStore } from './stores';

function esc(value: string): string {
  return (value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export interface PbJobStoreOptions {
  /** Write fingerprint/content_hash columns (enable only after M3). */
  persistFingerprint?: boolean;
}

export class PocketBaseJobStore implements JobStore {
  constructor(
    private readonly pb: PocketBase,
    private readonly opts: PbJobStoreOptions = {}
  ) {}

  async findExisting(signals: DedupeSignals & { source: string }): Promise<ExistingJobRef | null> {
    const filters: string[] = [];
    // Strongest available signal on the current schema: source + source_ref.
    if (signals.source && signals.externalId) {
      filters.push(`(source="${esc(signals.source)}"&&source_ref="${esc(signals.externalId)}")`);
    }
    if (signals.sourceUrl) {
      filters.push(`source_ref="${esc(signals.sourceUrl)}"`);
    }
    if (this.opts.persistFingerprint && signals.fingerprint) {
      filters.push(`fingerprint="${esc(signals.fingerprint)}"`);
    }
    if (!filters.length) return null;

    try {
      const rec: any = await this.pb
        .collection('jobs')
        .getFirstListItem(filters.join('||'));
      return {
        id: rec.id,
        source: rec.source,
        source_ref: rec.source_ref,
        title: rec.title,
        company: rec.company,
        province: rec.province,
        city: rec.city,
        fingerprint: rec.fingerprint,
        contentHash: rec.content_hash,
      };
    } catch {
      return null; // not found
    }
  }

  private toRecord(
    core: Partial<CanonicalCore> & { employer_id?: string; fingerprint?: string; content_hash?: string }
  ): Record<string, unknown> {
    const rec: Record<string, unknown> = {
      title: core.title,
      slug: core.slug,
      company: core.company,
      category: core.category,
      province: core.province,
      city: core.city,
      description: core.description,
      job_type: core.job_type,
      salary_min: core.salary_min,
      salary_max: core.salary_max,
      apply_url: core.apply_url,
      apply_email: core.apply_email,
      source: core.source,
      source_ref: core.source_ref,
      expires: core.expires,
    };
    if (core.employer_id) rec.employer_id = core.employer_id;
    if (this.opts.persistFingerprint) {
      if (core.fingerprint) rec.fingerprint = core.fingerprint;
      if (core.content_hash) rec.content_hash = core.content_hash;
    }
    // Drop undefined so we never overwrite with nulls on update.
    for (const k of Object.keys(rec)) if (rec[k] === undefined) delete rec[k];
    return rec;
  }

  async create(
    core: CanonicalCore & { employer_id?: string; fingerprint?: string; content_hash?: string }
  ): Promise<{ id: string }> {
    const base = this.toRecord(core);
    const baseSlug = (core.slug || '').toString();
    // Retry on unique-slug conflict with deterministic suffixes (-2, -3, ...).
    for (let attempt = 0; attempt < 6; attempt++) {
      const slug = attempt === 0 || !baseSlug ? baseSlug : `${baseSlug}-${attempt + 1}`;
      try {
        const rec = await this.pb.collection('jobs').create({
          ...base,
          ...(slug ? { slug } : {}),
          active: true,
        });
        return { id: (rec as any).id };
      } catch (err: any) {
        const isSlugConflict =
          err?.status === 400 && JSON.stringify(err?.data?.data || {}).includes('slug');
        if (!isSlugConflict || attempt === 5) throw err;
      }
    }
    throw new Error('failed to create job after slug-conflict retries');
  }

  async update(
    id: string,
    core: Partial<CanonicalCore> & { employer_id?: string; fingerprint?: string; content_hash?: string }
  ): Promise<void> {
    await this.pb.collection('jobs').update(id, this.toRecord(core));
  }

  /**
   * Deactivate active jobs for `source` whose source_ref was not seen this run.
   * Sets active=false and expires=now so they drop out of listings/XML export
   * immediately. Returns the number expired. Never deletes (audit-safe).
   */
  async expireMissing(source: string, seenRefs: Set<string>): Promise<number> {
    const existing: any[] = await this.pb
      .collection('jobs')
      .getFullList({
        filter: `source="${esc(source)}" && active=true`,
        fields: 'id,source_ref',
      })
      .catch(() => []);

    const nowIso = new Date().toISOString().replace('T', ' ').replace('Z', '');
    let expired = 0;
    for (const rec of existing) {
      const ref = (rec.source_ref || '').toString();
      if (ref && seenRefs.has(ref)) continue; // still live
      try {
        await this.pb.collection('jobs').update(rec.id, { active: false, expires: nowIso });
        expired++;
      } catch {
        // skip individual failures; a bad row must not abort the sweep
      }
    }
    return expired;
  }
}

export class PocketBaseEmployerStore implements EmployerStore {
  constructor(private readonly pb: PocketBase) {}

  async findByNameOrSlug(name: string, slug: string): Promise<EmployerRef | null> {
    try {
      const rec: any = await this.pb
        .collection('employers')
        .getFirstListItem(`company_slug="${esc(slug)}"||company_name="${esc(name)}"`);
      return {
        id: rec.id,
        company_name: rec.company_name,
        company_slug: rec.company_slug,
        website: rec.website,
        province: rec.province,
        city: rec.city,
      };
    } catch {
      return null;
    }
  }

  async create(data: {
    company_name: string;
    company_slug: string;
    website?: string;
    province?: string;
    city?: string;
    contact_email?: string;
  }): Promise<EmployerRef> {
    const rec: any = await this.pb.collection('employers').create({
      company_name: data.company_name,
      company_slug: data.company_slug,
      website: data.website,
      province: data.province,
      city: data.city,
      // contact_email is a required field on employers; auto-created stubs use
      // a clearly non-deliverable placeholder (not fabricated job data).
      contact_email: data.contact_email || 'no-reply@edubuzz.local',
    });
    return {
      id: rec.id,
      company_name: rec.company_name,
      company_slug: rec.company_slug,
      website: rec.website,
      province: rec.province,
      city: rec.city,
    };
  }

  async update(id: string, patch: Partial<Omit<EmployerRef, 'id'>>): Promise<void> {
    await this.pb.collection('employers').update(id, patch);
  }
}
