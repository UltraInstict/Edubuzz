import { describe, it, expect } from 'vitest';
import { parseCareerListing, type CareerSelectors } from '../adapters/htmlCareer';

const LISTING = `
<html><body>
  <div id="results">
    <article class="vacancy">
      <h2 class="v-title">Registered Nurse</h2>
      <div class="v-loc">Durban, KwaZulu-Natal</div>
      <div class="v-desc"><p>Care for patients in a busy ward. Registration with SANC required.</p></div>
      <a class="v-link" href="/vacancies/registered-nurse">View &amp; apply</a>
    </article>
    <article class="vacancy">
      <h2 class="v-title">Pharmacist</h2>
      <div class="v-loc">Cape Town</div>
      <div class="v-desc"><p>Dispense medication and advise patients.</p></div>
      <a class="v-link" href="/vacancies/pharmacist">View &amp; apply</a>
    </article>
    <article class="vacancy">
      <h2 class="v-title"></h2>
      <a class="v-link" href="/vacancies/empty">No title row</a>
    </article>
  </div>
</body></html>`;

const selectors: CareerSelectors = {
  list: 'article.vacancy',
  title: '.v-title',
  location: '.v-loc',
  description: '.v-desc',
  applyUrl: 'a.v-link',
};

describe('parseCareerListing', () => {
  it('extracts one RawJob per vacancy card with resolved absolute apply URLs', () => {
    const jobs = parseCareerListing(LISTING, { company: 'Test Hospital', selectors }, 'https://testhospital.co.za/careers');
    expect(jobs).toHaveLength(2); // third card dropped (no title)
    expect(jobs[0].title).toBe('Registered Nurse');
    expect(jobs[0].company).toBe('Test Hospital');
    expect(jobs[0].location).toBe('Durban, KwaZulu-Natal');
    expect(jobs[0].applyUrl).toBe('https://testhospital.co.za/vacancies/registered-nurse');
    expect(jobs[0].descriptionHtml).toContain('SANC');
  });

  it('falls back to first anchor when no applyUrl selector is given', () => {
    const jobs = parseCareerListing(
      LISTING,
      { company: 'Test Hospital', selectors: { list: 'article.vacancy', title: '.v-title', location: '.v-loc' } },
      'https://testhospital.co.za/careers'
    );
    expect(jobs[0].applyUrl).toContain('/vacancies/registered-nurse');
  });

  it('drops cards without a title or apply URL', () => {
    const html = '<div><article class="vacancy"><h2 class="v-title">No link</h2></article></div>';
    const jobs = parseCareerListing(html, { company: 'X', selectors }, 'https://x.co.za');
    expect(jobs).toHaveLength(0);
  });

  it('returns empty array when the list selector matches nothing', () => {
    const jobs = parseCareerListing('<div>nothing here</div>', { company: 'X', selectors }, 'https://x.co.za');
    expect(jobs).toEqual([]);
  });
});
