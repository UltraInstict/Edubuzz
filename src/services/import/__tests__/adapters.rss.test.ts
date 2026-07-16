import { describe, it, expect } from 'vitest';
import { parseRssFeed } from '../adapters/rss';

const RSS_2 = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Gov Vacancies</title>
    <item>
      <title>Registered Nurse</title>
      <link>https://gov.example/jobs/rn-1</link>
      <description><![CDATA[<p>Nursing role in a public hospital.</p>]]></description>
      <category>Healthcare</category>
      <pubDate>Mon, 01 Jul 2024 10:00:00 GMT</pubDate>
      <guid>rn-1</guid>
    </item>
    <item>
      <title>Data Clerk</title>
      <link>https://gov.example/jobs/dc-2</link>
      <description>Capture data accurately.</description>
      <guid>dc-2</guid>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Careers</title>
  <entry>
    <title>Software Engineer</title>
    <link href="https://co.example/jobs/se-9" rel="alternate"/>
    <summary>Build backend services.</summary>
    <id>se-9</id>
    <updated>2024-06-01T12:00:00Z</updated>
  </entry>
</feed>`;

describe('parseRssFeed (RSS 2.0)', () => {
  const jobs = parseRssFeed(RSS_2);

  it('parses all items', () => {
    expect(jobs).toHaveLength(2);
  });

  it('maps title, link and description', () => {
    expect(jobs[0].title).toBe('Registered Nurse');
    expect(jobs[0].applyUrl).toBe('https://gov.example/jobs/rn-1');
    expect(jobs[0].sourceUrl).toBe('https://gov.example/jobs/rn-1');
    expect(jobs[0].descriptionHtml).toContain('Nursing role');
    expect(jobs[0].category).toBe('Healthcare');
    expect(jobs[0].externalId).toBe('rn-1');
    expect(jobs[0].postedDate).toContain('2024');
  });

  it('applies defaultCompany when configured', () => {
    const withCompany = parseRssFeed(RSS_2, { defaultCompany: 'Dept of Health' });
    expect(withCompany[0].company).toBe('Dept of Health');
  });
});

describe('parseRssFeed (Atom)', () => {
  const jobs = parseRssFeed(ATOM);
  it('parses atom entries and href links', () => {
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Software Engineer');
    expect(jobs[0].applyUrl).toBe('https://co.example/jobs/se-9');
    expect(jobs[0].descriptionHtml).toBe('Build backend services.');
  });
});

describe('parseRssFeed edge cases', () => {
  it('returns [] on empty or invalid input', () => {
    expect(parseRssFeed('')).toEqual([]);
    expect(parseRssFeed('not xml at all')).toEqual([]);
  });

  it('handles a single item (non-array)', () => {
    const single = `<rss><channel><item><title>Only One</title><link>https://x/1</link></item></channel></rss>`;
    const jobs = parseRssFeed(single);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Only One');
  });
});
