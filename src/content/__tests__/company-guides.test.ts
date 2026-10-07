import { describe, expect, it } from 'vitest';
import { COMPANY_GUIDES } from '../company-guides';
import { CAREER_GUIDES } from '../career-guides';
import { ARTICLES } from '../resources';
import { GET } from '../../pages/sitemaps/companies.xml';

describe('reviewed company guides', () => {
  it('keeps ten unique canonical guides', () => {
    expect(COMPANY_GUIDES).toHaveLength(10);
    expect(new Set(COMPANY_GUIDES.map(g => g.slug)).size).toBe(10);
  });
  for (const guide of COMPANY_GUIDES) {
    it(`${guide.slug} has specific preparation, source limits and valid related guides`, () => {
      expect(new URL(guide.officialSite).protocol).toBe('https:');
      expect(guide.updated).toBe('2026-10-07');
      expect(guide.sourceNote.length).toBeGreaterThan(60);
      expect(guide.preparation).toHaveLength(3);
      expect(new Set(guide.preparation.map(p => p.title)).size).toBe(3);
      for (const item of guide.preparation) expect(item.text.length).toBeGreaterThan(150);
      expect(guide.checks).toHaveLength(3);
      for (const slug of guide.careerLinks) expect(CAREER_GUIDES.some(c => c.slug === slug)).toBe(true);
      expect(guide.howToApply).toContain('verified channel');
    });
  }
  it('links only to relevant, existing application resources', () => {
    for (const slug of ['how-to-write-your-first-cv-no-experience', 'how-to-apply-for-jobs-online', 'star-method-interview-technique', 'how-to-check-if-a-job-is-legitimate']) {
      expect(ARTICLES.some(a => a.slug === slug)).toBe(true);
    }
  });
  it('sitemaps only curated pages using actual content update dates', async () => {
    const response = await GET({ site: new URL('https://edubuzz.co.za') } as any);
    const xml = await response.text();
    expect((xml.match(/<url>/g) || [])).toHaveLength(10);
    expect((xml.match(/<lastmod>2026-10-07<\/lastmod>/g) || [])).toHaveLength(10);
    expect(xml).not.toContain('shoprite-group');
  });
});
