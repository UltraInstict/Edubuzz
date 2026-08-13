/**
 * Company career guides — informational employer pages for major South African
 * employers. Facts are limited to widely-known, verifiable general information;
 * specifics (current vacancies, exact requirements) must be confirmed on the
 * employer's official careers portal. No invented programmes or figures.
 */

export interface CompanyGuideFAQ {
  q: string;
  a: string;
}

export interface CompanyGuide {
  slug: string;
  name: string;
  sector: string;
  founded?: string;
  title: string;
  description: string;
  overview: string;         // HTML — about the employer (general, verifiable)
  careerAreas: string[];    // broad fields the employer recruits for
  entryLevel: string;       // HTML — entry-level opportunities known generally
  howToApply: string;       // HTML — application process guidance
  faqs: CompanyGuideFAQ[];
  officialSite: string;     // official careers site
  careerLinks: string[];    // related career guide slugs
}

export const COMPANY_GUIDES: CompanyGuide[] = [
  {
    slug: 'shoprite',
    name: 'Shoprite',
    sector: 'Retail',
    title: 'Shoprite Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Shoprite in South Africa: the official application process, typical entry-level roles, learnership and bursary options, and FAQs for applicants.',
    overview: `
<p>Shoprite Holdings is South Africa's largest retailer and one of the biggest private-sector employers in the country, operating supermarkets under brands such as Shoprite, Checkers, Checkers Hyper, Usave, OK Furniture and House & Home. The group has thousands of stores across South Africa and more than a dozen other African countries.</p>
<p>Because of its scale, Shoprite recruits continuously — from cashiers, packers and general assistants to butchery, bakery and deli staff, store management, supply chain roles and head-office positions in finance, IT, marketing and HR.</p>
`,
    careerAreas: ['Retail store operations', 'Supply chain and distribution', 'Finance and accounting', 'Information technology', 'Marketing', 'Human resources', 'Butchery, bakery and fresh foods'],
    entryLevel: `
<p>Shoprite commonly recruits entry-level roles such as cashiers, general assistants and packers — positions that generally require a matric certificate (though specific requirements vary per store and role). The group also runs learnerships, graduate programmes and bursary schemes; details, availability and requirements change regularly, so the official careers portal is the authoritative source.</p>
`,
    howToApply: `
<ol>
  <li>Visit the official Shoprite careers website (linked below) — the group does not charge fees for applications.</li>
  <li>Search or browse current opportunities by keyword and location.</li>
  <li>Create a profile and complete the online application form for the role you want.</li>
  <li>Keep your CV updated and tailored: emphasise customer service, cash handling (if applicable) and reliability.</li>
  <li>Watch for learnership and bursary announcements, which open seasonally each year.</li>
</ol>
<p>Be alert to scams: Shoprite never asks applicants to pay for a job, and legitimate vacancies are advertised through official channels only.</p>
`,
    faqs: [
      { q: 'How do I apply for a job at Shoprite?', a: 'Applications go through the official Shoprite careers website. Create a profile, search for vacancies, and submit your CV through the online form. There is no fee to apply.' },
      { q: 'What qualifications do I need to work at Shoprite?', a: 'For many store-level entry roles a matric certificate is the typical requirement, while specialist and management roles require relevant qualifications and experience. Check the specific advert — requirements vary per role.' },
      { q: 'Does Shoprite offer learnerships?', a: 'Yes — Shoprite runs learnership and skills programmes, particularly in retail operations. Availability is seasonal, so monitor the careers portal for open applications.' },
      { q: 'How long does the Shoprite application process take?', a: 'Timelines vary by role and store. After submitting online, shortlisted candidates are contacted for interviews. If you have not heard back, the role may have been filled — keep applying to new vacancies.' },
    ],
    officialSite: 'https://www.shopriteholdings.co.za/careers.html',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  },
  {
    slug: 'capitec',
    name: 'Capitec Bank',
    sector: 'Banking',
    title: 'Capitec Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Capitec Bank in South Africa: the application process, typical roles, what Capitec looks for in candidates, and FAQs.',
    overview: `
<p>Capitec is one of South Africa's fastest-growing retail banks, known for simple, affordable banking and a large branch network. It is also consistently rated among the country's top employers. Careers at Capitec span branch banking (service consultants and managers), IT and data, finance, risk, marketing and call centres.</p>
<p>Capitec's hiring process is known for being structured and thorough, with a strong emphasis on values fit and customer service orientation.</p>
`,
    careerAreas: ['Branch banking and client service', 'Information technology and data', 'Finance and risk', 'Call centre operations', 'Marketing', 'Human resources'],
    entryLevel: `
<p>Capitec recruits entry-level bank service consultants and call centre agents, roles that typically require a matric certificate (requirements vary per role and are stated in each advert). The bank also runs graduate programmes in fields such as IT, data and finance — availability is seasonal and published on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Capitec careers website (linked below) — this is the only official channel.</li>
  <li>Complete the online application and attach your CV. Capitec uses structured assessments as part of screening.</li>
  <li>Prepare for a values-based interview: customer focus, energy and honesty matter at Capitec.</li>
  <li>Shortlisted candidates complete assessments, interviews and background checks before offers.</li>
</ol>
`,
    faqs: [
      { q: 'How do I get a job at Capitec?', a: 'Apply online through the official Capitec careers portal. The process typically includes application screening, assessments, interviews and background checks.' },
      { q: 'What does Capitec look for in candidates?', a: 'Customer focus, energy, integrity and the ability to learn quickly. For client-facing roles, communication skills and a professional appearance matter.' },
      { q: 'Does Capitec hire without experience?', a: 'Yes, entry-level service consultant and call centre roles are often open to candidates without banking experience, with matric as the typical minimum requirement. Check each advert.' },
      { q: 'Does Capitec offer graduate programmes?', a: 'Yes — Capitec runs graduate and internship programmes, especially in IT, data science and finance. Availability is seasonal; monitor the careers portal.' },
    ],
    officialSite: 'https://www.capitecbank.co.za/careers',
    careerLinks: ['how-to-become-a-data-analyst', 'entry-level-careers-in-south-africa'],
  },
  {
    slug: 'standard-bank',
    name: 'Standard Bank',
    sector: 'Banking',
    title: 'Standard Bank Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Standard Bank South Africa: graduate programmes, the application process, what the bank looks for, and FAQs for applicants.',
    overview: `
<p>Standard Bank is one of Africa's largest banks by assets, headquartered in Johannesburg with operations across the continent. It recruits across retail and business banking, corporate and investment banking, technology, data, finance, risk, legal and support functions.</p>
<p>The bank is a major graduate employer, running structured graduate programmes in banking, engineering, technology, data and finance — applications typically open well before programme start dates.</p>
`,
    careerAreas: ['Retail and business banking', 'Corporate and investment banking', 'Technology and data', 'Finance and risk', 'Legal and compliance', 'Human resources and operations'],
    entryLevel: `
<p>Standard Bank recruits entry-level roles in branches and call centres (typical minimum: matric), plus highly competitive graduate programmes for degree holders. Internships and learnerships are also offered periodically. Specific requirements are always stated in the individual advert.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Standard Bank careers website (linked below).</li>
  <li>Create a profile, upload your CV and academic transcripts, and answer the screening questions fully.</li>
  <li>Graduate programme applications open months in advance — set reminders and apply early.</li>
  <li>The process typically includes online assessments, interviews (often panel or case-based) and background checks.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a Standard Bank graduate programme?', a: 'Through the official Standard Bank careers portal, where all graduate programmes are advertised. Applications open in cycles — register on the portal and apply early with your CV and transcripts.' },
      { q: 'What degrees does Standard Bank hire?', a: 'Finance, accounting, economics, IT, computer science, engineering, mathematics, statistics and data science are common for graduate programmes — but entry-level roles exist across many fields.' },
      { q: 'Does Standard Bank hire without a degree?', a: 'Yes — branch, call centre and operations roles typically require matric with on-the-job training. Degree requirements apply to specialist and graduate programme roles.' },
      { q: 'How long does Standard Bank take to respond to applications?', a: 'Timelines vary by role and programme. Graduate programme cycles can take months from application to offer; branch roles are often faster. Check your application status on the careers portal.' },
    ],
    officialSite: 'https://www.standardbank.com/sbg/standard-bank-group/careers',
    careerLinks: ['how-to-become-a-data-analyst', 'how-to-become-an-accountant'],
  },
  {
    slug: 'woolworths',
    name: 'Woolworths',
    sector: 'Retail',
    title: 'Woolworths Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Woolworths South Africa: the official application process, typical roles, learnerships and FAQs for applicants.',
    overview: `
<p>Woolworths is a premium South African retailer spanning food, fashion, beauty and home, with stores across the country. It is a major employer of store staff, supply chain and distribution workers, and head-office professionals in buying, planning, finance, IT and marketing.</p>
<p>Woolworths also operates one of South Africa's better-known retail academy systems, offering structured training and development for store staff.</p>
`,
    careerAreas: ['Store operations (food, fashion, beauty)', 'Supply chain and distribution', 'Buying and planning', 'Finance', 'Information technology', 'Marketing and digital'],
    entryLevel: `
<p>Entry-level roles at Woolworths include store assistants and seasonal staff, with matric commonly required (check each advert). The company recruits for its retail academy and offers learnerships at various times during the year — announcements are made on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Woolworths careers website (linked below).</li>
  <li>Create a profile and search for vacancies by area and role type.</li>
  <li>Complete the online application, including any assessments requested.</li>
  <li>Shortlisted candidates are interviewed — typically focusing on customer service and availability.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply at Woolworths?', a: 'All applications go through the official Woolworths careers portal. There is no fee to apply, and vacancies are advertised online.' },
      { q: 'What qualifications do I need to work at Woolworths?', a: 'Store-level roles typically require matric; specialist roles require relevant qualifications. Each advert states its own requirements.' },
      { q: 'Does Woolworths offer learnerships?', a: 'Yes, Woolworths offers learnerships and retail academy training at various times. Monitor the careers portal for open applications.' },
      { q: 'Does Woolworths hire seasonal staff?', a: 'Yes, particularly over the festive season. Seasonal positions are advertised on the careers portal and can lead to permanent roles.' },
    ],
    officialSite: 'https://careers.woolworths.co.za',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  },
  {
    slug: 'pick-n-pay',
    name: 'Pick n Pay',
    sector: 'Retail',
    title: 'Pick n Pay Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Pick n Pay in South Africa: the application process, typical store and support roles, learnerships and FAQs.',
    overview: `
<p>Pick n Pay is one of South Africa's largest supermarket chains, with stores under the Pick n Pay and Boxer brands across the country and the region. Career opportunities include store operations, fresh food departments (bakery, butchery, deli), distribution, and head-office roles in buying, finance, IT and marketing.</p>
`,
    careerAreas: ['Store operations', 'Fresh food departments', 'Distribution and logistics', 'Buying and planning', 'Finance', 'Information technology'],
    entryLevel: `
<p>Entry-level roles such as packers, cashiers and general assistants are recruited regularly; typical requirements include matric, though specific roles may differ. Pick n Pay advertises learnerships and skills programmes periodically on its official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Pick n Pay careers website (linked below).</li>
  <li>Search vacancies by keyword and location, and complete the online application form.</li>
  <li>Attach an up-to-date CV tailored to retail: customer service, till work and reliability stand out.</li>
  <li>Successful applicants are contacted for interviews at store or regional level.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a job at Pick n Pay?', a: 'Through the official Pick n Pay careers portal. Create a profile, apply to advertised vacancies, and wait to be contacted. Applications are free.' },
      { q: 'What is the minimum requirement to work at Pick n Pay?', a: 'Most store-level roles require matric, though some general assistant roles may have different requirements. Check each advert.' },
      { q: 'Does Pick n Pay offer learnerships?', a: 'Yes — Pick n Pay runs learnerships and skills development programmes, advertised on its careers portal at various times of the year.' },
      { q: 'Can I apply in store with a paper CV?', a: 'The standard process is online via the careers portal. In-store drop-offs are generally not part of the formal process — apply online instead.' },
    ],
    officialSite: 'https://www.pnp.co.za/careers',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  },
  {
    slug: 'clicks',
    name: 'Clicks Group',
    sector: 'Retail / Health',
    title: 'Clicks Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Clicks Group in South Africa: store, pharmacy and distribution roles, the application process, learnerships and FAQs.',
    overview: `
<p>Clicks Group is South Africa's leading health and beauty retailer, operating Clicks stores, The Body Shop, and United Pharmaceutical Distributors (UPD). Careers span retail store operations, pharmacy support, distribution and logistics, and head-office functions such as buying, marketing, finance and IT.</p>
`,
    careerAreas: ['Retail store operations', 'Pharmacy and healthcare retail', 'Distribution and logistics (UPD)', 'Buying and merchandising', 'Finance', 'Marketing'],
    entryLevel: `
<p>Entry-level retail roles such as shop assistants and cashiers are recruited regularly, with matric as the typical minimum (check each advert). Clicks also offers learnerships in pharmacy support and retail — these are popular and competitive, and are advertised on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Clicks careers website (linked below).</li>
  <li>Search for vacancies by role and location, then complete the online application.</li>
  <li>For learnership applications, follow the instructions exactly and apply within the advertised window.</li>
  <li>Interviews typically cover customer service, product knowledge interest, and availability.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a job at Clicks?', a: 'All applications go through the official Clicks careers portal. Applications are free, and vacancies are advertised online.' },
      { q: 'What qualifications do I need to work at Clicks?', a: 'Retail roles typically require matric. Pharmacy-related roles require relevant qualifications registered with the South African Pharmacy Council where applicable.' },
      { q: 'Does Clicks offer pharmacy learnerships?', a: 'Yes — Clicks is known for pharmacy support and retail learnerships, advertised on its careers portal. They are competitive, so apply early within the window.' },
      { q: 'Does Clicks hire for UPD distribution centres?', a: 'Yes. UPD, the group\'s pharmaceutical distributor, recruits warehouse and logistics staff. These roles are advertised on the same careers portal.' },
    ],
    officialSite: 'https://www.clicksgroup.co.za/careers',
    careerLinks: ['entry-level-careers-in-south-africa', 'how-to-become-a-nurse'],
  },
  {
    slug: 'mr-price',
    name: 'Mr Price Group',
    sector: 'Retail',
    title: 'Mr Price Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Mr Price Group in South Africa: store and head-office roles, graduate programmes, the application process and FAQs.',
    overview: `
<p>Mr Price Group is a leading South African value-fashion retailer, operating brands including Mr Price, Mr Price Sport, Mr Price Home, Miladys and Sheet Street. The group is known for its young, energetic culture and promotes heavily from within. Careers span store operations, merchandising, buying and planning, IT, finance and distribution.</p>
`,
    careerAreas: ['Store operations', 'Buying, planning and merchandising', 'Distribution and logistics', 'Information technology', 'Finance', 'Marketing and digital'],
    entryLevel: `
<p>Mr Price recruits entry-level store associates regularly; matric is typically required (check each advert). The group also runs graduate programmes and internships, particularly in buying, planning, IT and finance — advertised seasonally on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Mr Price careers website (linked below).</li>
  <li>Search vacancies by brand, location and function; complete the online application.</li>
  <li>For graduate programmes, apply during the advertised window with your CV and academic record.</li>
  <li>Interviews are typically behavioural and culture-focused — enthusiasm and energy matter at Mr Price.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply at Mr Price?', a: 'Through the official Mr Price careers portal. All vacancies are advertised online, and applications are free.' },
      { q: 'What is it like to work at Mr Price?', a: 'The group is known for a fast-paced, youthful culture with strong internal promotion. Performance and attitude are rewarded quickly.' },
      { q: 'Does Mr Price offer graduate programmes?', a: 'Yes — graduate programmes run in areas such as buying, planning, IT and finance. Apply via the careers portal during the advertised intake.' },
      { q: 'What qualifications do I need to work at Mr Price?', a: 'Store roles typically require matric; specialist and graduate roles require relevant degrees or diplomas. Each advert states its requirements.' },
    ],
    officialSite: 'https://mrpcareers.co.za',
    careerLinks: ['entry-level-careers-in-south-africa', 'how-to-become-a-data-analyst'],
  },
  {
    slug: 'nedbank',
    name: 'Nedbank',
    sector: 'Banking',
    title: 'Nedbank Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Nedbank in South Africa: graduate programmes, the application process, typical roles and FAQs for applicants.',
    overview: `
<p>Nedbank is one of South Africa's largest banks, headquartered in Johannesburg. It recruits across retail and business banking, corporate and investment banking, wealth management, technology, data, finance, risk and operations — and is a regular graduate employer.</p>
`,
    careerAreas: ['Retail and business banking', 'Corporate and investment banking', 'Technology and data', 'Finance and risk', 'Wealth management', 'Operations and support'],
    entryLevel: `
<p>Nedbank recruits entry-level branch and call centre staff (typical minimum: matric) and runs graduate programmes in banking, finance, technology and data. Requirements are stated per advert on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Nedbank careers website (linked below).</li>
  <li>Create a profile, upload your CV and academic documents, and complete the application fully.</li>
  <li>Graduate programme applications open in cycles — apply early and prepare for online assessments.</li>
  <li>The selection process typically includes assessments, interviews and background screening.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a Nedbank graduate programme?', a: 'Through the official Nedbank careers portal during the advertised intake. Submit your CV and transcripts, and complete the assessments requested.' },
      { q: 'Does Nedbank hire matriculants?', a: 'Yes — entry-level branch, call centre and operations roles are often open to matriculants, with training provided. Check each advert for requirements.' },
      { q: 'What degrees does Nedbank look for?', a: 'Finance, accounting, economics, IT, data science, mathematics and engineering are common for graduate programmes — but the bank recruits across many fields.' },
      { q: 'How long does Nedbank take to respond?', a: 'Timelines vary by role. Graduate intakes can take months; branch roles are typically faster. Track your application on the careers portal.' },
    ],
    officialSite: 'https://www.nedbank.co.za/content/nedbank/desktop/gt/en/about-us/careers.html',
    careerLinks: ['how-to-become-an-accountant', 'how-to-become-a-data-analyst'],
  },
  {
    slug: 'fnb',
    name: 'FNB (First National Bank)',
    sector: 'Banking',
    title: 'FNB Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at FNB in South Africa: graduate programmes, the application process, typical roles and FAQs for applicants.',
    overview: `
<p>First National Bank (FNB) is one of South Africa's oldest and largest banks, part of the FirstRand group. FNB is known for digital banking innovation and recruits across retail banking, technology, data, finance, risk and support functions, with a strong graduate programme tradition.</p>
`,
    careerAreas: ['Retail banking', 'Technology and digital', 'Data and analytics', 'Finance and risk', 'Operations', 'Marketing and communications'],
    entryLevel: `
<p>FNB recruits entry-level branch and call centre roles (typical minimum: matric) and runs well-established graduate and internship programmes, particularly in technology, data and finance. Intakes are advertised on the official careers portal.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official FNB careers website (linked below).</li>
  <li>Create a profile, upload your CV and academic record, and answer the screening questions fully.</li>
  <li>For graduate programmes, apply within the advertised window — applications are competitive.</li>
  <li>Expect online assessments, interviews and background checks as part of selection.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a job at FNB?', a: 'Through the official FNB careers portal. All vacancies are advertised online and applications are free.' },
      { q: 'Does FNB hire without a degree?', a: 'Yes — branch, call centre and operations roles are often open to matriculants. Specialist roles require relevant qualifications.' },
      { q: 'Does FNB offer graduate programmes?', a: 'Yes — FNB and the wider FirstRand group run graduate and internship programmes across technology, data, finance and business. Apply via the careers portal.' },
      { q: 'What is FNB\'s hiring process like?', a: 'Typically: online application, screening, assessments (aptitude or technical), interviews, and background checks before an offer.' },
    ],
    officialSite: 'https://www.fnb.co.za/about-us/careers.html',
    careerLinks: ['how-to-become-a-data-analyst', 'how-to-become-an-accountant'],
  },
  {
    slug: 'dis-chem',
    name: 'Dis-Chem',
    sector: 'Retail / Health',
    title: 'Dis-Chem Careers: How to Apply, Requirements & FAQ (2026)',
    description: 'How to apply for jobs at Dis-Chem Pharmacies in South Africa: store, pharmacy and distribution roles, learnerships, the application process and FAQs.',
    overview: `
<p>Dis-Chem is one of South Africa's largest pharmacy and healthcare retailers, with stores across the country and a growing wholesale and distribution business. Careers span retail store operations, pharmacy, clinics, distribution centres and head-office functions.</p>
`,
    careerAreas: ['Retail store operations', 'Pharmacy (with SAPC registration where required)', 'Clinics and healthcare services', 'Distribution and logistics', 'Buying and merchandising', 'Finance and support'],
    entryLevel: `
<p>Dis-Chem recruits entry-level shop assistants and cashiers regularly; matric is the typical minimum for store roles (check each advert). Pharmacy-related roles require the relevant South African Pharmacy Council registration and qualifications. Learnerships and internships are advertised on the official careers portal when open.</p>
`,
    howToApply: `
<ol>
  <li>Apply through the official Dis-Chem careers website (linked below).</li>
  <li>Search vacancies by role and location; complete the online application form.</li>
  <li>Attach a CV tailored to retail or pharmacy support, depending on the role.</li>
  <li>Shortlisted candidates complete interviews; pharmacy roles also verify SAPC registration.</li>
</ol>
`,
    faqs: [
      { q: 'How do I apply for a job at Dis-Chem?', a: 'Through the official Dis-Chem careers portal. Applications are free and all vacancies are advertised online.' },
      { q: 'What qualifications do I need to work at Dis-Chem?', a: 'Store roles typically require matric. Pharmacy assistant and pharmacist roles require the relevant qualifications and SAPC registration.' },
      { q: 'Does Dis-Chem offer learnerships?', a: 'Yes — Dis-Chem advertises learnerships and internships, including pharmacy support and retail programmes, on its careers portal at various times.' },
      { q: 'Does Dis-Chem hire nurses for its clinics?', a: 'Yes — Dis-Chem clinics employ registered nurses and other healthcare professionals. These roles require SANC registration and are advertised on the careers portal.' },
    ],
    officialSite: 'https://www.dischem.co.za/careers',
    careerLinks: ['entry-level-careers-in-south-africa', 'how-to-become-a-nurse'],
  },
];
