/**
 * Salary guide pages — South African salary data for key occupations.
 *
 * Data-driven: a single template (/salary/[slug]) renders every guide with
 * consistent SEO, internal linking, and structured data.
 */

export interface SalaryFAQ {
  q: string;
  a: string;
}

export interface SalaryGuide {
  slug: string;
  title: string;
  h1: string;
  description: string;
  occupation: string;
  updated: string;
  categorySlug?: string;
  averageSalary: string;
  salaryRange: string;
  entryLevel: string;
  midLevel: string;
  seniorLevel: string;
  intro: string;
  body: string;
  careerPath: string;
  requirements: string;
  faqs: SalaryFAQ[];
}

export const SALARY_GUIDES: SalaryGuide[] = [
  {
    slug: 'teacher-salary-south-africa',
    title: 'Teacher Salary in South Africa (2026) — Average Pay & Career Path',
    h1: 'Teacher Salary in South Africa',
    description: 'What do teachers earn in South Africa? Average salary ranges for primary, high school, and FET teachers, plus requirements, career path and related jobs.',
    occupation: 'Teacher',
    updated: '2026-07-01',
    categorySlug: 'education',
    averageSalary: 'R25,000 – R35,000 per month',
    salaryRange: 'R18,000 – R55,000 per month',
    entryLevel: 'R18,000 – R24,000 per month',
    midLevel: 'R25,000 – R38,000 per month',
    seniorLevel: 'R39,000 – R55,000 per month (HOD, Deputy Principal)',
    intro: 'Teaching is one of South Africa\u2019s most important professions, offering stable employment, government benefits and annual salary notches. Here is what teachers actually earn across different levels and provinces.',
    body: `
<h2>How teacher salaries work in South Africa</h2>
<p>Public school teachers are paid according to the Occupation Specific Dispensation (OSD) for educators, managed by the Department of Basic Education. Salary depends on your qualification level (REQV), years of experience, and position. Private school salaries vary by institution but are often comparable or higher for experienced educators.</p>

<h2>Factors that affect teacher pay</h2>
<ul>
  <li><strong>Qualification level (REQV)</strong> — higher qualifications (Honours, Masters) place you on a higher salary notch.</li>
  <li><strong>Years of experience</strong> — annual notch increases reward loyalty.</li>
  <li><strong>Position</strong> — HODs, Deputy Principals and Principals earn significantly more.</li>
  <li><strong>Province</strong> — base salaries are national but cost-of-living differs.</li>
  <li><strong>Public vs private</strong> — private schools set their own scales.</li>
</ul>

<h2>Benefits beyond salary</h2>
<p>Public school teachers receive a medical aid subsidy, pension contributions (GEPF), housing allowance, and annual leave during school holidays. These benefits add substantial value to the total package.</p>
`,
    careerPath: `
<ul>
  <li><strong>Student teacher / PGCE</strong> — complete your teaching qualification.</li>
  <li><strong>Post Level 1</strong> — classroom teacher (entry).</li>
  <li><strong>Post Level 2</strong> — Head of Department (HOD).</li>
  <li><strong>Post Level 3</strong> — Deputy Principal.</li>
  <li><strong>Post Level 4</strong> — Principal.</li>
  <li><strong>Circuit Manager / District Official</strong> — move into education administration.</li>
</ul>
`,
    requirements: `
<ul>
  <li>A Bachelor of Education (B.Ed.) degree, or</li>
  <li>Any bachelor's degree plus a Postgraduate Certificate in Education (PGCE).</li>
  <li>Registration with the South African Council for Educators (SACE).</li>
  <li>A clear criminal record (police clearance).</li>
  <li>For FET/TVET: relevant trade or subject qualifications may apply.</li>
</ul>
`,
    faqs: [
      { q: 'What is the starting salary for a teacher in South Africa?', a: 'Entry-level public school teachers (Post Level 1 with a B.Ed.) typically start around R18,000 to R24,000 per month, depending on their REQV level and the current OSD salary scales.' },
      { q: 'Do private school teachers earn more?', a: 'It varies. Some prestigious private schools pay above government scales, while smaller schools may pay less. Private schools do not always offer the same pension and medical benefits as government.' },
      { q: 'How often do teachers get salary increases?', a: 'Public school teachers receive annual notch increases (experience-based) plus negotiated cost-of-living adjustments. The combination means steady salary growth over a career.' },
    ],
  },
  {
    slug: 'nurse-salary-south-africa',
    title: 'Nurse Salary in South Africa (2026) — Average Pay & Career Path',
    h1: 'Nurse Salary in South Africa',
    description: 'What do nurses earn in South Africa? Salary ranges for enrolled nurses, professional nurses and specialists, plus requirements and career progression.',
    occupation: 'Nurse',
    updated: '2026-07-01',
    categorySlug: 'health',
    averageSalary: 'R28,000 – R42,000 per month',
    salaryRange: 'R15,000 – R65,000 per month',
    entryLevel: 'R15,000 – R22,000 per month (Enrolled Nurse)',
    midLevel: 'R28,000 – R42,000 per month (Professional Nurse)',
    seniorLevel: 'R43,000 – R65,000 per month (Specialist / Unit Manager)',
    intro: 'Nursing is one of the most in-demand professions in South Africa, with opportunities across public hospitals, private healthcare groups and clinics. Here is what nurses earn at each level.',
    body: `
<h2>Nursing salary levels in South Africa</h2>
<p>Nursing salaries in the public sector follow the Occupation Specific Dispensation (OSD) for nurses, while private hospital groups like Mediclinic, Netcare and Life Healthcare set their own competitive scales. The type of qualification you hold determines your category and pay grade.</p>

<h2>Public vs private sector pay</h2>
<p>Public sector nurses generally earn slightly less in base salary but benefit from government pension (GEPF), medical aid subsidy and job security. Private sector nurses often earn higher base salaries with performance bonuses, but benefits structures differ.</p>

<h2>Factors affecting nurse salaries</h2>
<ul>
  <li><strong>Category</strong> — Enrolled Nursing Auxiliary, Enrolled Nurse, Professional Nurse, Specialist.</li>
  <li><strong>Experience</strong> — OSD grades reward years of service with notch increases.</li>
  <li><strong>Specialisation</strong> — ICU, theatre, midwifery and psychiatric nursing attract premiums.</li>
  <li><strong>Location</strong> — rural allowances in public service; private sector premiums in cities.</li>
  <li><strong>Overtime and shifts</strong> — night duty, weekend and public holiday rates add significantly.</li>
</ul>
`,
    careerPath: `
<ul>
  <li><strong>Enrolled Nursing Auxiliary (ENA)</strong> — 1-year Higher Certificate.</li>
  <li><strong>Enrolled Nurse (EN)</strong> — 2-year Diploma.</li>
  <li><strong>Professional Nurse (PN)</strong> — 4-year B.Nursing degree.</li>
  <li><strong>Specialist Nurse</strong> — postgrad diploma in ICU, midwifery, oncology etc.</li>
  <li><strong>Unit Manager / Nursing Manager</strong> — management track.</li>
  <li><strong>Chief Professional Nurse / Deputy Director Nursing</strong> — senior public service.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric with Mathematics and Life Sciences (or equivalent).</li>
  <li>A nursing qualification from an accredited institution (university or nursing college).</li>
  <li>Registration with the South African Nursing Council (SANC).</li>
  <li>Annual SANC registration renewal.</li>
  <li>CPD (Continuing Professional Development) points maintenance.</li>
</ul>
`,
    faqs: [
      { q: 'What is the starting salary for a nurse in South Africa?', a: 'An Enrolled Nursing Auxiliary (ENA) typically starts around R15,000 per month in the public sector. A newly qualified Professional Nurse (with a 4-year degree) starts around R28,000 to R32,000 per month.' },
      { q: 'Is nursing a good career in South Africa?', a: 'Yes. Nurses are in high demand locally and internationally. The profession offers job security, clear career progression, and the ability to specialise in fields like ICU, midwifery or theatre nursing.' },
      { q: 'Do nurses get rural allowances?', a: 'Public sector nurses stationed in designated rural areas receive a rural allowance on top of their base salary, which can be a meaningful supplement.' },
    ],
  },
  {
    slug: 'electrician-salary-south-africa',
    title: 'Electrician Salary in South Africa (2026) — Qualified Artisan Pay',
    h1: 'Electrician Salary in South Africa',
    description: 'What do electricians earn in South Africa? Salary data for apprentices, qualified artisans, industrial electricians, and master electricians.',
    occupation: 'Electrician',
    updated: '2026-07-01',
    categorySlug: 'engineering',
    averageSalary: 'R22,000 – R35,000 per month',
    salaryRange: 'R12,000 – R55,000 per month',
    entryLevel: 'R12,000 – R18,000 per month (Apprentice / Newly Qualified)',
    midLevel: 'R22,000 – R35,000 per month (Qualified Artisan)',
    seniorLevel: 'R36,000 – R55,000 per month (Master Electrician / Supervisor)',
    intro: 'Electricians are among the most sought-after artisans in South Africa. With a skills shortage driving demand, qualified electricians earn well and have strong job security across construction, mining, manufacturing and maintenance.',
    body: `
<h2>How electricians are paid in South Africa</h2>
<p>Pay depends on your qualification level, whether you have a wireman's licence, your sector, and whether you work for an employer or run your own business. Unionised sectors (mining, manufacturing) often follow bargaining council minimum rates that set a floor well above the national minimum wage.</p>

<h2>Sector differences</h2>
<ul>
  <li><strong>Mining</strong> — highest-paying; underground electricians earn premiums plus allowances.</li>
  <li><strong>Industrial / Manufacturing</strong> — strong demand for PLC and instrumentation skills.</li>
  <li><strong>Construction</strong> — project-based; rates vary by region and contractor.</li>
  <li><strong>Domestic / Residential</strong> — self-employed electricians set their own rates.</li>
  <li><strong>Maintenance (facilities)</strong> — steady, salaried roles in property groups, hospitals, malls.</li>
</ul>

<h2>Self-employment potential</h2>
<p>Many experienced electricians start their own businesses. A registered electrical contractor (with a wireman's licence and CoC authority) can charge R350–R600+ per hour for domestic work, significantly exceeding salaried income.</p>
`,
    careerPath: `
<ul>
  <li><strong>Apprentice</strong> — 3-4 year apprenticeship (N1-N3 + practical).</li>
  <li><strong>Trade Test</strong> — pass the Section 13 trade test to qualify.</li>
  <li><strong>Qualified Electrician</strong> — employed artisan.</li>
  <li><strong>Wireman's Licence</strong> — issue Certificates of Compliance (CoC).</li>
  <li><strong>Master Installation Electrician</strong> — register with DoEL, run your own business.</li>
  <li><strong>Electrical Supervisor / Foreman</strong> — manage teams on projects.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric with Mathematics and Physical Science (or N2+ with relevant subjects).</li>
  <li>Completion of an electrical apprenticeship (Section 13 or Section 28).</li>
  <li>Passing the trade test at an accredited centre.</li>
  <li>Registration with the Department of Employment and Labour (DoEL).</li>
  <li>For independent work: a wireman's licence and registration as an electrical contractor.</li>
</ul>
`,
    faqs: [
      { q: 'How much does a qualified electrician earn in South Africa?', a: 'A qualified electrician with a trade test certificate typically earns R22,000 to R35,000 per month in salaried employment. Mining sector electricians and those with specialisations can earn significantly more.' },
      { q: 'How long does it take to become an electrician?', a: 'A standard apprenticeship takes 3 to 4 years, combining TVET college courses (N1-N3 or higher) with workplace practical training, followed by the trade test.' },
      { q: 'Is there demand for electricians in South Africa?', a: 'Yes. Electricians are on the national scarce skills list. Load shedding, renewable energy growth, and construction activity maintain strong demand across all provinces.' },
    ],
  },
  {
    slug: 'police-officer-salary-south-africa',
    title: 'Police Officer Salary in South Africa (2026) — SAPS Pay Guide',
    h1: 'Police Officer Salary in South Africa',
    description: 'What do police officers earn in South Africa? SAPS salary levels from constable to general, plus benefits, requirements and career progression.',
    occupation: 'Police Officer (SAPS)',
    updated: '2026-07-01',
    categorySlug: 'government',
    averageSalary: 'R22,000 – R30,000 per month',
    salaryRange: 'R17,000 – R85,000 per month',
    entryLevel: 'R17,000 – R22,000 per month (Constable / Student Constable)',
    midLevel: 'R22,000 – R35,000 per month (Sergeant / Warrant Officer)',
    seniorLevel: 'R40,000 – R85,000+ per month (Captain / Colonel / General)',
    intro: 'The South African Police Service (SAPS) is one of the country\u2019s largest employers. Officers earn government salaries with structured benefits, danger pay, and clear rank-based progression.',
    body: `
<h2>How SAPS salaries are structured</h2>
<p>SAPS uses a rank-based salary system. Each rank has a salary notch range, and officers progress through notches with experience. Allowances for danger, shift work, housing and medical aid are added on top of the base salary.</p>

<h2>Key benefits</h2>
<ul>
  <li>Government pension (GEPF) with employer contributions.</li>
  <li>Medical aid subsidy (POLMED or Government Employees Medical Scheme).</li>
  <li>Housing allowance.</li>
  <li>Danger allowance.</li>
  <li>Annual uniform allowance.</li>
  <li>Shift and overtime allowances.</li>
</ul>

<h2>Specialisation opportunities</h2>
<p>Detectives, forensic specialists, the Hawks (DPCI), K9 units, and special task force members may earn additional allowances beyond the standard rank salary.</p>
`,
    careerPath: `
<ul>
  <li><strong>Student Constable</strong> — basic police training (2 years).</li>
  <li><strong>Constable</strong> — first operational rank.</li>
  <li><strong>Sergeant</strong> — first supervisory rank.</li>
  <li><strong>Warrant Officer</strong> — experienced NCO.</li>
  <li><strong>Captain</strong> — station-level management.</li>
  <li><strong>Colonel / Brigadier / General</strong> — senior leadership.</li>
</ul>
`,
    requirements: `
<ul>
  <li>South African citizenship.</li>
  <li>Matric (Grade 12) certificate.</li>
  <li>Between 18 and 30 years old at time of application.</li>
  <li>No criminal record.</li>
  <li>Physically fit (fitness test required).</li>
  <li>Willing to be stationed anywhere in South Africa.</li>
  <li>Valid driver's licence is an advantage.</li>
</ul>
`,
    faqs: [
      { q: 'What is the starting salary for a police officer in South Africa?', a: 'A newly trained constable in SAPS earns approximately R17,000 to R22,000 per month in base salary, with additional allowances for danger pay, housing and medical aid bringing the total package higher.' },
      { q: 'How do I apply to join SAPS?', a: 'SAPS advertises recruitment intakes on their official website and in newspapers. Applications are open to matriculants aged 18-30 with no criminal record. The process includes fitness tests, psychometric assessments, and interviews.' },
      { q: 'Do SAPS members get danger pay?', a: 'Yes. All operational SAPS members receive a danger allowance in addition to their base salary, reflecting the risks of police work.' },
    ],
  },
  {
    slug: 'general-worker-salary-south-africa',
    title: 'General Worker Salary in South Africa (2026) — Minimum Wage & Pay Guide',
    h1: 'General Worker Salary in South Africa',
    description: 'What do general workers earn in South Africa? National minimum wage, average pay by sector, overtime rates, and career progression options.',
    occupation: 'General Worker',
    updated: '2026-07-01',
    categorySlug: 'general',
    averageSalary: 'R5,500 – R9,000 per month',
    salaryRange: 'R4,800 – R14,000 per month',
    entryLevel: 'R4,800 – R6,500 per month (National Minimum Wage)',
    midLevel: 'R7,000 – R9,500 per month (Experienced / Skilled)',
    seniorLevel: 'R10,000 – R14,000 per month (Team Leader / Supervisor)',
    intro: 'General worker roles are the most searched-for jobs in South Africa. While pay starts at the national minimum wage, opportunities to progress exist across manufacturing, logistics, construction and retail.',
    body: `
<h2>National Minimum Wage</h2>
<p>As of 2026, the national minimum wage applies to most general workers. Employers are legally required to pay at least this amount per hour. Some sectors (agriculture, domestic work, expanded public works) have different minimums or transitional arrangements.</p>

<h2>Sector variations</h2>
<ul>
  <li><strong>Manufacturing</strong> — bargaining council rates often exceed the minimum; overtime and shift allowances add up.</li>
  <li><strong>Retail / Warehousing</strong> — standard minimum wage, with some retailers offering above-minimum starting rates.</li>
  <li><strong>Construction</strong> — BCEA rates apply; skilled labourers earn more.</li>
  <li><strong>Mining</strong> — even entry-level positions at mines pay well above the national minimum due to union agreements.</li>
  <li><strong>Agriculture</strong> — the agricultural minimum wage applies (slightly lower but increasing annually).</li>
</ul>

<h2>Overtime and benefits</h2>
<p>General workers are entitled to overtime pay at 1.5x the normal rate, and double time on Sundays and public holidays. UIF, provident fund and transport allowances are common additional benefits in formal employment.</p>
`,
    careerPath: `
<ul>
  <li><strong>General Worker</strong> — entry-level, multiple sectors.</li>
  <li><strong>Skilled Labourer</strong> — gain specific trade skills on the job.</li>
  <li><strong>Machine Operator</strong> — specialise in operating machinery.</li>
  <li><strong>Team Leader / Supervisor</strong> — manage a team of workers.</li>
  <li><strong>Foreman</strong> — oversee larger operations.</li>
  <li><strong>Artisan (via learnership)</strong> — qualify as a tradesperson for significantly higher pay.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric is preferred but not always required.</li>
  <li>Physical fitness for labour-intensive roles.</li>
  <li>Basic literacy and numeracy.</li>
  <li>Willingness to work shifts, weekends and overtime.</li>
  <li>Some roles require a forklift licence or safety certificates.</li>
</ul>
`,
    faqs: [
      { q: 'What is the minimum wage for a general worker in South Africa?', a: 'The national minimum wage is set annually by the government. All employers must pay at least this rate per hour. Check the Department of Employment and Labour website for the current amount.' },
      { q: 'Can a general worker earn more than minimum wage?', a: 'Yes. Experience, sector (especially mining and manufacturing), overtime, shift allowances, and progression to team leader or machine operator roles all increase earnings above the minimum.' },
      { q: 'How can a general worker progress in their career?', a: 'Learnerships, in-house training, and gaining specialised certificates (forklift, safety officer, machine operation) open doors to higher-paying roles without needing a university degree.' },
    ],
  },
  {
    slug: 'cashier-salary-south-africa',
    title: 'Cashier Salary in South Africa (2026) — Retail Pay & Career Growth',
    h1: 'Cashier Salary in South Africa',
    description: 'What do cashiers earn in South Africa? Average retail cashier salaries, who pays the most, benefits, and how to move up from the till.',
    occupation: 'Cashier',
    updated: '2026-07-01',
    categorySlug: 'retail',
    averageSalary: 'R6,000 – R9,000 per month',
    salaryRange: 'R5,000 – R13,000 per month',
    entryLevel: 'R5,000 – R6,500 per month',
    midLevel: 'R7,000 – R9,500 per month (Experienced / Senior Cashier)',
    seniorLevel: 'R10,000 – R13,000 per month (Cash Office / Supervisor)',
    intro: 'Cashier is one of the most common entry-level jobs in South Africa, with thousands of vacancies across supermarkets, clothing stores, fuel stations and fast food outlets. Here is what the role pays and how to grow from it.',
    body: `
<h2>Who pays cashiers in South Africa?</h2>
<p>Major retailers like Shoprite, Pick n Pay, Woolworths, Clicks, Dis-Chem, Checkers and Spar are the biggest employers of cashiers. Fuel stations, fast food chains and independent retailers also hire extensively.</p>

<h2>Factors affecting cashier pay</h2>
<ul>
  <li><strong>Employer</strong> — large chains often pay above the minimum and offer benefits.</li>
  <li><strong>Location</strong> — urban stores may pay slightly more than rural areas.</li>
  <li><strong>Experience</strong> — senior cashiers or those handling cash office duties earn more.</li>
  <li><strong>Shifts</strong> — Sunday and public holiday rates at 1.5x–2x normal pay.</li>
</ul>

<h2>Common benefits</h2>
<p>Formal retail employers typically provide UIF, provident fund, staff discounts, and sometimes medical aid or transport allowances. Many also offer internal training and promotion paths.</p>
`,
    careerPath: `
<ul>
  <li><strong>Cashier</strong> — entry-level till operation.</li>
  <li><strong>Senior Cashier / Cash Office</strong> — handle floats, reconciliation.</li>
  <li><strong>Customer Service Desk</strong> — returns, queries, escalations.</li>
  <li><strong>Floor Supervisor</strong> — manage a section of the store.</li>
  <li><strong>Assistant Store Manager</strong> — operations management.</li>
  <li><strong>Store Manager</strong> — full P&L responsibility.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric (Grade 12) — most large retailers require this.</li>
  <li>Basic numeracy and attention to detail.</li>
  <li>Good communication and customer service skills.</li>
  <li>Willingness to work shifts, weekends and public holidays.</li>
  <li>A clear criminal record (for handling cash).</li>
</ul>
`,
    faqs: [
      { q: 'What is the average cashier salary in South Africa?', a: 'Most cashiers earn between R6,000 and R9,000 per month at major retailers. This excludes overtime, Sunday premiums and benefits like staff discounts and provident fund.' },
      { q: 'Which retail chain pays cashiers the most?', a: 'Pay varies, but Woolworths, Dis-Chem and Clicks are often cited as offering slightly above-average retail wages plus better benefit packages. Large chains generally pay more than independent stores.' },
      { q: 'Can you move up from being a cashier?', a: 'Absolutely. Many store managers started as cashiers. Retailers value internal promotion and offer training programmes to develop cashiers into supervisors and managers.' },
    ],
  },
  {
    slug: 'administrative-clerk-salary-south-africa',
    title: 'Administrative Clerk Salary in South Africa (2026) — Admin Pay Guide',
    h1: 'Administrative Clerk Salary in South Africa',
    description: 'What do admin clerks earn in South Africa? Salary ranges for data capturers, receptionists, office administrators and executive assistants.',
    occupation: 'Administrative Clerk',
    updated: '2026-07-01',
    categorySlug: 'general',
    averageSalary: 'R10,000 – R18,000 per month',
    salaryRange: 'R7,000 – R28,000 per month',
    entryLevel: 'R7,000 – R12,000 per month (Data Capturer / Junior Admin)',
    midLevel: 'R13,000 – R20,000 per month (Admin Officer / Secretary)',
    seniorLevel: 'R21,000 – R28,000 per month (Office Manager / Executive Assistant)',
    intro: 'Administrative roles are the backbone of every organisation in South Africa. From data capturers in government to executive assistants in corporate, admin skills are always in demand.',
    body: `
<h2>Types of admin roles and their pay</h2>
<ul>
  <li><strong>Data Capturer</strong> — R7,000–R12,000/month. Focuses on data entry and filing.</li>
  <li><strong>Receptionist</strong> — R8,000–R14,000/month. Front-of-house duties and switchboard.</li>
  <li><strong>Administrative Clerk</strong> — R10,000–R16,000/month. General office support.</li>
  <li><strong>Secretary / PA</strong> — R14,000–R22,000/month. Diary management, correspondence.</li>
  <li><strong>Office Manager</strong> — R18,000–R28,000/month. Oversees office operations.</li>
  <li><strong>Executive Assistant</strong> — R22,000–R35,000/month. Supports C-suite executives.</li>
</ul>

<h2>Government vs private sector</h2>
<p>Government admin clerks follow the public service salary levels (Level 5–8 for clerks through to senior admin officers). Private sector pay is often higher for equivalent roles, especially in Johannesburg and Cape Town, but lacks the government pension and job security benefits.</p>

<h2>Skills that increase your pay</h2>
<p>Microsoft Office proficiency (especially Excel), SAP, bookkeeping, minute-taking, and bilingualism (English plus Afrikaans or an African language) all command premiums in the admin job market.</p>
`,
    careerPath: `
<ul>
  <li><strong>Data Capturer / Filing Clerk</strong> — entry-level admin.</li>
  <li><strong>Administrative Clerk</strong> — general office support.</li>
  <li><strong>Secretary / Personal Assistant</strong> — executive support.</li>
  <li><strong>Office Manager</strong> — manage office operations and staff.</li>
  <li><strong>Executive Assistant</strong> — strategic support to senior leadership.</li>
  <li><strong>Operations Manager</strong> — broader business operations (with experience).</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric (Grade 12) as a minimum.</li>
  <li>A diploma in Office Administration or Secretarial Studies is an advantage.</li>
  <li>Computer literacy (MS Office Suite, email, internet).</li>
  <li>Good written and verbal communication.</li>
  <li>Organisational skills and attention to detail.</li>
  <li>For government: application via Z83 form process.</li>
</ul>
`,
    faqs: [
      { q: 'What is the salary for an admin clerk in government?', a: 'Government administrative clerks are typically employed at Salary Level 5 (entry) through Level 8 (senior admin officer). Monthly pay ranges from approximately R10,000 to R22,000 depending on level and experience notches.' },
      { q: 'Do you need a degree to work in admin?', a: 'Not necessarily. Many admin roles require matric and a relevant diploma or certificate. Experience and computer skills often matter more than a degree for entry-level positions.' },
      { q: 'Which admin skills are most in demand?', a: 'Advanced Excel, SAP, bookkeeping, minute-taking, and proficiency in multiple South African languages are consistently in demand across both government and private sector admin roles.' },
    ],
  },
];
