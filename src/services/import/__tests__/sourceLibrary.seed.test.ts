import { describe, it, expect } from 'vitest';
import { SOURCE_LIBRARY_SEED } from '../sourceLibrary.seed';
import { isJobBoardUrl } from '../ats';

describe('Source Library seed integrity', () => {
  it('contains at least 50 employers', () => {
    expect(SOURCE_LIBRARY_SEED.length).toBeGreaterThanOrEqual(50);
  });

  it('has unique ids', () => {
    const ids = SOURCE_LIBRARY_SEED.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every careers_url and website is an https URL', () => {
    for (const s of SOURCE_LIBRARY_SEED) {
      expect(s.careers_url, s.id).toMatch(/^https:\/\//);
      expect(s.website, s.id).toMatch(/^https:\/\//);
    }
  });

  it('no careers_url points at a competing job board', () => {
    for (const s of SOURCE_LIBRARY_SEED) {
      expect(isJobBoardUrl(s.careers_url), s.id).toBe(false);
    }
  });

  it('every verified entry is wired to an import connector', () => {
    for (const s of SOURCE_LIBRARY_SEED.filter((e) => e.verification_status === 'verified')) {
      expect(s.connector, s.id).toBeTruthy();
      if (s.connector === 'html') expect(s.selectors, s.id).toBeTruthy();
      else expect(s.token, s.id).toBeTruthy();
    }
  });

  it('no pending/unverified entry is wired to run (never auto-import unverified)', () => {
    for (const s of SOURCE_LIBRARY_SEED.filter((e) => e.verification_status !== 'verified')) {
      expect(s.connector, s.id).toBeFalsy();
    }
  });

  it('covers the required industry spread', () => {
    const industries = new Set(SOURCE_LIBRARY_SEED.map((s) => s.industry));
    for (const req of ['banking', 'retail', 'mining', 'university', 'healthcare', 'municipality', 'telecoms', 'logistics', 'insurance', 'technology'] as const) {
      expect(industries.has(req), req).toBe(true);
    }
  });

  it('defaults last_checked_at / last_import_at to null', () => {
    for (const s of SOURCE_LIBRARY_SEED.filter((e) => e.verification_status !== 'verified')) {
      expect(s.last_import_at, s.id).toBeNull();
    }
  });
});
