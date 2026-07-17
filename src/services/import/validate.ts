/**
 * Import pipeline — quality gate (Milestone 1).
 *
 * Pure validation of a CanonicalJob against the data-quality contract:
 * reject outright on hard failures; flag (warn) on soft issues. Every
 * rejection/warning carries a machine-readable RejectionReason so the
 * importer can log WHY a job was dropped (data-quality reports in M5).
 */

import type { CanonicalJob, RejectionReason, ValidationResult } from './types';
import { isJobBoardUrl } from './ats';

/** Minimum meaningful description length (plain-text chars). */
export const MIN_DESCRIPTION_CHARS = 120;

/** Confidence below this is rejected; between this and WARN is flagged. */
export const MIN_CONFIDENCE = 40;
export const WARN_CONFIDENCE = 60;

function plainTextLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

function hasApplyMethod(job: CanonicalJob): boolean {
  const url = (job.core.apply_url || '').trim();
  const email = (job.core.apply_email || '').trim();
  const validUrl = /^https?:\/\/.+/i.test(url);
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return validUrl || validEmail;
}

function isExpired(job: CanonicalJob): boolean {
  const exp = job.core.expires || job.enrichment.closing_date;
  if (!exp) return false;
  const t = Date.parse(exp);
  if (isNaN(t)) return false;
  // Compare against start of today (date-only) to avoid TZ edge rejections.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return t < today.getTime();
}

/**
 * Validate a canonical job. Hard rejections set ok=false; warnings alone
 * keep ok=true (job stored but flagged for review).
 */
export function validateJob(job: CanonicalJob): ValidationResult {
  const rejections: RejectionReason[] = [];
  const warnings: RejectionReason[] = [];

  if (!job.core.title || !job.core.title.trim()) rejections.push('missing_title');
  if (!job.core.company || !job.core.company.trim()) rejections.push('missing_employer');

  const hasLocation =
    !!job.core.province?.trim() ||
    !!job.core.city?.trim() ||
    job.enrichment.remote === true;
  if (!hasLocation) rejections.push('missing_location');

  if (!hasApplyMethod(job)) rejections.push('missing_apply_method');

  // Official-source policy: never route applicants through a competing job board.
  if (isJobBoardUrl(job.core.apply_url)) rejections.push('job_board_apply');

  const descLen = plainTextLength(job.core.description || '');
  if (descLen === 0) {
    rejections.push('missing_description');
  } else if (descLen < MIN_DESCRIPTION_CHARS) {
    warnings.push('thin_description');
  }

  if (!job.core.source || !job.core.source.trim()) rejections.push('missing_source');

  if (typeof job.confidence === 'number') {
    if (job.confidence < MIN_CONFIDENCE) rejections.push('low_confidence');
    else if (job.confidence < WARN_CONFIDENCE) warnings.push('low_confidence');
  }

  if (isExpired(job)) rejections.push('expired');

  return {
    ok: rejections.length === 0,
    rejections,
    warnings,
  };
}

/** Human-readable label for a rejection reason (for admin reports/logs). */
export function describeReason(reason: RejectionReason): string {
  const map: Record<RejectionReason, string> = {
    missing_title: 'No job title',
    missing_employer: 'No employer/company',
    missing_location: 'No usable location',
    missing_apply_method: 'No valid apply URL or email',
    missing_description: 'No description',
    thin_description: 'Description too short',
    missing_source: 'No source identifier',
    low_confidence: 'Extraction confidence below threshold',
    expired: 'Closing date already passed',
    job_board_apply: 'Apply URL is a competing job board (must be employer official page)',
  };
  return map[reason] || reason;
}
