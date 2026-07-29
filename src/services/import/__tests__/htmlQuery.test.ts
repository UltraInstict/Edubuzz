import { describe, it, expect } from 'vitest';
import {
  parseHtml,
  queryAll,
  queryFirst,
  textOf,
  attrOf,
  resolveUrl,
  innerHtmlOf,
} from '../adapters/htmlQuery';

const HTML = `
<html><body>
  <ul class="jobs">
    <li class="job-card" data-type="job">
      <h3 class="title">Software Engineer</h3>
      <span class="loc">Cape Town, Western Cape</span>
      <a class="apply" href="/jobs/software-engineer">Apply</a>
    </li>
    <li class="job-card" data-type="job">
      <h3 class="title">Data Analyst</h3>
      <span class="loc">Johannesburg</span>
      <a class="apply" href="https://acme.co.za/jobs/data-analyst">Apply</a>
    </li>
  </ul>
  <script>var x = "<li class='job-card'>not real</li>";</script>
</body></html>`;

describe('htmlQuery', () => {
  it('selects by class and returns all cards (ignoring script content)', () => {
    const root = parseHtml(HTML);
    const cards = queryAll(root, '.job-card');
    expect(cards).toHaveLength(2);
  });

  it('extracts text and attributes with descendant selectors', () => {
    const root = parseHtml(HTML);
    const cards = queryAll(root, 'li.job-card');
    expect(textOf(queryFirst(cards[0], '.title'))).toBe('Software Engineer');
    expect(textOf(queryFirst(cards[0], '.loc'))).toBe('Cape Town, Western Cape');
    expect(attrOf(queryFirst(cards[0], 'a.apply'), 'href')).toBe('/jobs/software-engineer');
  });

  it('supports attribute selectors with values', () => {
    const root = parseHtml(HTML);
    expect(queryAll(root, '[data-type="job"]')).toHaveLength(2);
    expect(queryAll(root, '[data-type="nope"]')).toHaveLength(0);
  });

  it('supports selector lists (comma = OR) without duplicates', () => {
    const root = parseHtml(HTML);
    expect(queryAll(root, '.title, .loc')).toHaveLength(4);
  });

  it('resolves relative and absolute URLs against a base', () => {
    expect(resolveUrl('/jobs/x', 'https://acme.co.za/careers')).toBe('https://acme.co.za/jobs/x');
    expect(resolveUrl('https://other.com/y', 'https://acme.co.za')).toBe('https://other.com/y');
  });

  it('serializes inner HTML of a subtree', () => {
    const root = parseHtml('<div class="d"><p>Hello <b>world</b></p></div>');
    const d = queryFirst(root, '.d');
    expect(innerHtmlOf(d)).toContain('<p>');
    expect(innerHtmlOf(d)).toContain('<b>world</b>');
  });

  it('never throws on malformed HTML', () => {
    expect(() => parseHtml('<div><span>unclosed <a href=')).not.toThrow();
    expect(parseHtml('').tag).toBe('');
  });
});
