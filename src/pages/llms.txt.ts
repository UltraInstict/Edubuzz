import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';

  const content = `# Edubuzz.co.za — South African Job Marketplace

> Edubuzz connects employers with qualified candidates across South Africa's key employment sectors including government, health, IT, education, finance, engineering and more.

## Core Pages
- [Homepage](${base}/): Job search, featured jobs, and latest listings
- [Browse All Jobs](${base}/jobs): Complete job listings with filters
- [Browse by Category](${base}/categories): All job categories with counts
- [Browse by Province](${base}/provinces): Jobs filtered by South African province
- [Companies](${base}/companies): Verified employer profiles

## Popular Job Searches
- [Remote Jobs](${base}/remote-jobs): Work from home opportunities
- [Internships](${base}/internships): Entry-level and internship positions
- [Graduate Jobs](${base}/graduate-jobs): Graduate programmes and entry-level
- [Learnerships](${base}/learnerships): SETA-accredited learnerships
- [Bursaries](${base}/bursaries): Scholarships and funding opportunities

## Job Categories
- [Government Jobs](${base}/category/government): Public sector vacancies
- [Healthcare Jobs](${base}/category/health): Medical and healthcare positions
- [IT & Tech Jobs](${base}/category/it-tech): Technology and software roles
- [Education Jobs](${base}/category/education): Teaching and academic positions
- [Finance Jobs](${base}/category/finance): Banking, accounting, financial services
- [Engineering Jobs](${base}/category/engineering): Engineering and technical roles

## For Employers
- [Post a Job](${base}/post-job): Create job listings
- [Pricing](${base}/pricing): Advertising plans and rates
- [Advertise](${base}/advertise): Employer advertising options

## Feeds & APIs
- [Sitemap Index](${base}/sitemap.xml): XML sitemap index
- [RSS Feed](${base}/feeds/rss.xml): Latest jobs RSS feed
- [Indeed XML Feed](${base}/feeds/jobs.xml): Indeed-compatible XML feed

## About
- [About Edubuzz](${base}/about): About the platform
- [Contact](${base}/contact): Get in touch
- [Privacy Policy](${base}/privacy): Privacy information
- [Terms of Use](${base}/terms): Terms and conditions

---

*Edubuzz helps South Africans find meaningful employment across all sectors. Updated daily with new job listings.*
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
