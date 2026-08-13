import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.origin || import.meta.env.SITE_URL || 'https://edubuzz.co.za';

  const content = `# Edubuzz.co.za — South African Education & Career Information

> Edubuzz helps South Africans understand what to study, which careers exist, how to enter them, what they pay, and how to apply.

## Core Pages
- [Homepage](${base}/): Education, careers, resources and employer guides
- [Education](${base}/education): TVET colleges, NSFAS, NATED programmes, study pathways
- [Careers](${base}/careers): Comprehensive occupation guides with training routes and salaries
- [Resources](${base}/resources): CV, interview and application guides
- [Salary Guides](${base}/salary): Salary information for key South African occupations
- [Companies](${base}/companies): Employer guides for major South African employers

## Education Guides
- [TVET Colleges in South Africa](${base}/education/tvet-colleges-in-south-africa)
- [NSFAS Funding Explained](${base}/education/nsfas-funding-explained)
- [N4–N6 NATED Programmes](${base}/education/n4-n6-nated-programmes-explained)
- [University vs TVET](${base}/education/university-vs-tvet-which-path-fits-you)
- [What to Do After Matric](${base}/education/what-to-do-after-matric)

## Career Guides
- [How to Become an Electrician](${base}/careers/how-to-become-an-electrician)
- [How to Become a Nurse](${base}/careers/how-to-become-a-nurse)
- [How to Become a Teacher](${base}/careers/how-to-become-a-teacher)
- [How to Become an Accountant](${base}/careers/how-to-become-an-accountant)
- [How to Become a Data Analyst](${base}/careers/how-to-become-a-data-analyst)
- [Careers Without a Degree](${base}/careers/careers-without-a-degree)

## Sitemaps
- [Sitemap Index](${base}/sitemap.xml): XML sitemap index

## About
- [About Edubuzz](${base}/about): About the site
- [Contact](${base}/contact): Get in touch
- [Privacy Policy](${base}/privacy): Privacy information
- [Terms of Use](${base}/terms): Terms and conditions

---

*Edubuzz provides researched, original education and career information for South Africans.*
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
