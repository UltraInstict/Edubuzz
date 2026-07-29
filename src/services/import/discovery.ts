/**
 * Import pipeline — employer discovery + import queue (Phase 4B, Milestone 1).
 *
 * Two responsibilities, both pure/deterministic and unit-testable:
 *
 *  1. DISCOVERY — given an employer careers page (URL + fetched HTML), decide
 *     what we can honestly assert: which ATS hosts it, whether it looks like a
 *     real vacancies list, and whether it looks South African. Produces a
 *     candidate Source Library entry with verification_status='pending' (never
 *     'verified' automatically — a human/live import must promote it).
 *
 *  2. IMPORT QUEUE — turn the Source Library into an ordered run list, building
 *     a SourceAdapter for every VERIFIED, connector-wired entry (ATS connectors
 *     via the existing engine; own-site lists via the HTML career adapter).
 *     'pending'/'unverified' rows are queued as NOT runnable (reported, never
 *     imported) so the runner can never publish unverified jobs.
 */

import type { SourceAdapter } from './types';
import type { AtsType, SourceType } from './ats';
import { classifySource, detectAts, isJobBoardUrl, sourceDomain } from './ats';
import { buildAdapter, type EmployerSource } from './sources';
import { HtmlCareerAdapter } from './adapters/htmlCareer';
import { parseHtml, queryAll, attrOf, textOf } from './adapters/htmlQuery';
import { defineSource, type SourceLibraryEntry, type VerificationStatus } from './sourceLibrary';

// ── Discovery ────────────────────────────────────────────────────────────────

export interface DiscoveryProbe {
  careers_url: string;
  domain: string;
  ats_type: AtsType;
  source_type: SourceType;
  /** Count of links that look like individual vacancies/apply actions. */
  likelyJobLinks: number;
  hasVacancies: boolean;
  isJobBoard: boolean;
  /** SA signals found (domain TLD, "south africa", province names). */
  saSignals: string[];
  looksSouthAfrican: boolean;
}

const VACANCY_HINT = /(job|vacan|career|position|opportunit|apply|posting|role)/i;
const SA_TEXT_SIGNALS = [
  'south africa', 'gauteng', 'western cape', 'kwazulu-natal', 'kwazulu natal',
  'eastern cape', 'limpopo', 'mpumalanga', 'north west', 'free state',
  'northern cape', 'johannesburg', 'cape town', 'durban', 'pretoria', 'sandton',
];

/** Inspect a careers page. PURE (url + html → probe). Never throws. */
export function probeCareersPage(url: string, html: string): DiscoveryProbe {
  const domain = sourceDomain(url);
  const ats_type = detectAts(url);
  const source_type = classifySource(url);
  const isJobBoard = isJobBoardUrl(url);

  let likelyJobLinks = 0;
  try {
    const root = parseHtml(html || '');
    for (const a of queryAll(root, 'a')) {
      const href = attrOf(a, 'href');
      const text = textOf(a);
      if (VACANCY_HINT.test(href) || VACANCY_HINT.test(text)) likelyJobLinks++;
    }
  } catch {
    // malformed HTML → 0 links; still return a probe
  }

  const haystack = `${url} ${(html || '').slice(0, 200000)}`.toLowerCase();
  const saSignals: string[] = [];
  if (/\.(co|ac|gov|org)\.za(\b|\/)/.test(domain) || /\.za(\b|\/)/.test(domain)) {
    saSignals.push('tld:.za');
  }
  for (const sig of SA_TEXT_SIGNALS) if (haystack.includes(sig)) saSignals.push(sig);

  return {
    careers_url: url,
    domain,
    ats_type,
    source_type,
    likelyJobLinks,
    hasVacancies: likelyJobLinks > 0,
    isJobBoard,
    saSignals: [...new Set(saSignals)],
    looksSouthAfrican: saSignals.length > 0,
  };
}

export interface DiscoveryCandidate {
  entry: SourceLibraryEntry;
  probe: DiscoveryProbe;
  /** Why this was accepted-as-pending or rejected. */
  decision: 'pending' | 'rejected';
  reason: string;
}

/**
 * Turn a probe into a Source Library candidate. NEVER returns 'verified':
 * discovery only proposes; verification (a live import that yields SA jobs) is
 * what promotes an entry. Job-board URLs and non-SA-looking pages are rejected.
 */
export function candidateFromProbe(
  probe: DiscoveryProbe,
  meta: { company_name: string; website?: string; industry?: SourceLibraryEntry['industry']; province?: string; notes?: string }
): DiscoveryCandidate {
  const base = {
    id: sourceDomain(probe.careers_url).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown',
    company_name: meta.company_name,
    website: meta.website || `https://${probe.domain}`,
    careers_url: probe.careers_url,
    ats_type: probe.ats_type,
    industry: meta.industry || 'other',
    province: meta.province || 'National',
    last_checked_at: new Date().toISOString(),
  };

  if (probe.isJobBoard) {
    return {
      entry: defineSource({ ...base, verification_status: 'rejected', notes: 'Rejected: URL is a competing job board, not an employer official page.' }),
      probe,
      decision: 'rejected',
      reason: 'job_board_url',
    };
  }
  if (!probe.looksSouthAfrican) {
    return {
      entry: defineSource({ ...base, verification_status: 'rejected', notes: 'Rejected: no South-African signals on the careers page (SA-only policy).' }),
      probe,
      decision: 'rejected',
      reason: 'not_south_african',
    };
  }

  const status: VerificationStatus = 'pending';
  const notes =
    meta.notes ||
    `Discovered ${probe.ats_type !== 'unknown' ? `${probe.ats_type} ` : ''}careers page with ~${probe.likelyJobLinks} vacancy links. Pending live-import verification before enabling.`;
  return {
    entry: defineSource({ ...base, verification_status: status, notes }),
    probe,
    decision: 'pending',
    reason: 'discovered_pending',
  };
}

// ── Import queue ───────────────────────────────────────────────────────────────

export interface QueueItem {
  entry: SourceLibraryEntry;
  adapter: SourceAdapter | null;
  runnable: boolean;
  reason: string;
}

/** Build a SourceAdapter for a VERIFIED, connector-wired library entry. */
export function adapterForEntry(entry: SourceLibraryEntry): SourceAdapter | null {
  if (entry.verification_status !== 'verified' || !entry.connector) return null;

  if (entry.connector === 'html') {
    if (!entry.selectors) return null;
    return new HtmlCareerAdapter({
      key: `html:${entry.id}`,
      company: entry.company_name,
      listUrls: entry.listUrls?.length ? entry.listUrls : [entry.careers_url],
      selectors: entry.selectors,
      maxPages: 3,
    });
  }

  // ATS connector — reuse the existing engine via an EmployerSource shim.
  const shim: EmployerSource = {
    id: entry.id,
    employer: entry.company_name,
    connector: entry.connector,
    enabled: true,
    token: entry.token,
    confidence: 'verified',
  };
  return buildAdapter(shim);
}

/**
 * Order the Source Library into an import run list. Verified+runnable first;
 * everything else is reported as not-runnable (never imported). Only entries
 * with an apply/careers method that survives ATS wiring become runnable.
 */
export function buildImportQueue(
  library: SourceLibraryEntry[],
  opts: { includePending?: boolean } = {}
): QueueItem[] {
  const items: QueueItem[] = library.map((entry) => {
    if (entry.verification_status === 'verified') {
      const adapter = adapterForEntry(entry);
      return adapter
        ? { entry, adapter, runnable: true, reason: 'verified' }
        : { entry, adapter: null, runnable: false, reason: 'verified_but_no_connector' };
    }
    return { entry, adapter: null, runnable: false, reason: `status:${entry.verification_status}` };
  });

  // Runnable first for predictable execution order.
  return items.sort((a, b) => Number(b.runnable) - Number(a.runnable));
}

/** Convenience: just the runnable adapters (what the import runner executes). */
export function verifiedAdapters(library: SourceLibraryEntry[]): SourceAdapter[] {
  return buildImportQueue(library)
    .filter((q) => q.runnable && q.adapter)
    .map((q) => q.adapter as SourceAdapter);
}

// ── Stats (admin visibility) ──────────────────────────────────────────────────

export interface LibraryStats {
  total: number;
  byStatus: Record<VerificationStatus, number>;
  byIndustry: Record<string, number>;
  byAts: Record<string, number>;
  byProvince: Record<string, number>;
  verifiedRunnable: number;
}

export function libraryStats(library: SourceLibraryEntry[]): LibraryStats {
  const byStatus = { verified: 0, pending: 0, unverified: 0, rejected: 0 } as Record<VerificationStatus, number>;
  const byIndustry: Record<string, number> = {};
  const byAts: Record<string, number> = {};
  const byProvince: Record<string, number> = {};
  for (const e of library) {
    byStatus[e.verification_status] = (byStatus[e.verification_status] || 0) + 1;
    byIndustry[e.industry] = (byIndustry[e.industry] || 0) + 1;
    byAts[e.ats_type] = (byAts[e.ats_type] || 0) + 1;
    byProvince[e.province] = (byProvince[e.province] || 0) + 1;
  }
  const verifiedRunnable = buildImportQueue(library).filter((q) => q.runnable).length;
  return { total: library.length, byStatus, byIndustry, byAts, byProvince, verifiedRunnable };
}
