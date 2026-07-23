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
  {
    slug: 'traffic-officer-salary-south-africa',
    title: 'Traffic Officer Salary in South Africa (2026) — Pay & Requirements',
    h1: 'Traffic Officer Salary in South Africa',
    description: 'What do traffic officers earn in South Africa? Salary ranges, the traffic officer training requirements, career path and where to find metro police and traffic jobs.',
    occupation: 'Traffic Officer',
    updated: '2026-07-01',
    categorySlug: 'government',
    averageSalary: 'R16,000 – R26,000 per month',
    salaryRange: 'R12,000 – R38,000 per month',
    entryLevel: 'R12,000 – R16,000 per month (Trainee / Junior)',
    midLevel: 'R17,000 – R26,000 per month (Traffic Officer)',
    seniorLevel: 'R27,000 – R38,000 per month (Senior / Supervisor / Chief)',
    intro: 'Traffic officers keep South Africa\u2019s roads safe and enforce the National Road Traffic Act. It is a stable government career with structured pay, benefits and clear progression through the metro police and provincial traffic departments.',
    body: `
<h2>How traffic officer pay works</h2>
<p>Traffic officers are employed by municipalities (metro police departments) and provincial traffic authorities. Pay follows the relevant government salary scales, with allowances for shift work, danger and overtime added to the base salary. Metro police officers in the big cities generally sit at the higher end.</p>

<h2>Who employs traffic officers</h2>
<ul>
  <li><strong>Metro police departments</strong> — Johannesburg (JMPD), Cape Town, Tshwane, eThekwini and Ekurhuleni.</li>
  <li><strong>Provincial traffic departments</strong> — each province runs its own traffic law enforcement.</li>
  <li><strong>Municipal traffic units</strong> — smaller towns and district municipalities.</li>
</ul>

<h2>Allowances and benefits</h2>
<p>On top of the base salary, traffic officers typically receive a government pension, medical aid subsidy, housing allowance, uniform allowance, and shift or standby allowances. These push the total package well above the base figure.</p>
`,
    careerPath: `
<ul>
  <li><strong>Trainee Traffic Officer</strong> — complete the Basic Traffic Officer\u2019s Diploma.</li>
  <li><strong>Traffic Officer</strong> — operational road law enforcement.</li>
  <li><strong>Senior Traffic Officer</strong> — more experience, higher notch.</li>
  <li><strong>Traffic Supervisor / Inspector</strong> — team leadership.</li>
  <li><strong>Chief Traffic Officer</strong> — department management.</li>
</ul>
`,
    requirements: `
<ul>
  <li>South African citizenship.</li>
  <li>Matric (Grade 12).</li>
  <li>A valid Code B (or higher) driver\u2019s licence.</li>
  <li>No criminal record.</li>
  <li>Physically fit (fitness test).</li>
  <li>Completion of the accredited Basic Traffic Officer\u2019s Diploma (about 12 months at a registered traffic college).</li>
</ul>
`,
    faqs: [
      { q: 'What is the starting salary for a traffic officer in South Africa?', a: 'A newly qualified traffic officer typically earns between R12,000 and R16,000 per month in base salary, plus allowances for shifts, danger and overtime that increase the total package.' },
      { q: 'How do I become a traffic officer?', a: 'You need matric, a valid driver\u2019s licence and a clear criminal record, then you must complete the accredited Basic Traffic Officer\u2019s Diploma at a registered traffic training college, which takes about a year.' },
      { q: 'Is a traffic officer a government job?', a: 'Yes. Traffic officers are employed by municipalities and provincial governments, so they receive government benefits including pension, medical aid subsidy and job security.' },
    ],
  },
  {
    slug: 'receptionist-salary-south-africa',
    title: 'Receptionist Salary in South Africa (2026) — Front Office Pay Guide',
    h1: 'Receptionist Salary in South Africa',
    description: 'What do receptionists earn in South Africa? Average front-desk salaries, skills that increase pay, career path into office management and where to find jobs.',
    occupation: 'Receptionist',
    updated: '2026-07-01',
    categorySlug: 'general',
    averageSalary: 'R8,000 – R14,000 per month',
    salaryRange: 'R6,500 – R20,000 per month',
    entryLevel: 'R6,500 – R9,000 per month',
    midLevel: 'R10,000 – R15,000 per month',
    seniorLevel: 'R16,000 – R20,000 per month (Senior / Front Office Manager)',
    intro: 'Receptionists are the first face of any organisation. It is a popular entry point into office work across South Africa, with clear paths into administration, HR and office management for those who build their skills.',
    body: `
<h2>What affects a receptionist\u2019s salary</h2>
<ul>
  <li><strong>Industry</strong> — corporate, medical, legal and hospitality reception roles pay differently.</li>
  <li><strong>Company size</strong> — larger firms and head offices pay more.</li>
  <li><strong>Location</strong> — Johannesburg and Cape Town rates are higher than smaller towns.</li>
  <li><strong>Extra duties</strong> — switchboard, bookings, invoicing and admin add value and pay.</li>
</ul>

<h2>Skills that boost your pay</h2>
<p>Strong computer skills (MS Office), a professional telephone manner, bilingualism, and experience with booking or practice-management systems all help you earn at the top of the range. Medical and legal receptionists who know the relevant systems are especially in demand.</p>
`,
    careerPath: `
<ul>
  <li><strong>Receptionist</strong> — front desk and switchboard.</li>
  <li><strong>Senior Receptionist / Front Office Coordinator</strong> — manage the front-of-house.</li>
  <li><strong>Administrator / Office Assistant</strong> — broader admin duties.</li>
  <li><strong>Personal Assistant</strong> — support executives.</li>
  <li><strong>Office Manager</strong> — run the whole office.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric (Grade 12).</li>
  <li>Computer literacy (email, MS Office).</li>
  <li>A friendly, professional manner.</li>
  <li>Good spoken English; additional languages are an advantage.</li>
  <li>A short reception or office administration course helps but is not essential.</li>
</ul>
`,
    faqs: [
      { q: 'What is the average receptionist salary in South Africa?', a: 'Most receptionists earn between R8,000 and R14,000 per month. Medical, legal and corporate head-office receptionists with specialised system skills can earn more.' },
      { q: 'Do you need qualifications to be a receptionist?', a: 'Matric and good computer and communication skills are usually enough for an entry-level role. A short office administration or reception course can help you stand out.' },
      { q: 'Can a receptionist become an office manager?', a: 'Yes. Reception is a common starting point. By taking on admin duties and building experience, many receptionists progress to PA, administrator and office manager roles.' },
    ],
  },
  {
    slug: 'engineer-salary-south-africa',
    title: 'Engineer Salary in South Africa (2026) — By Discipline & Experience',
    h1: 'Engineer Salary in South Africa',
    description: 'What do engineers earn in South Africa? Salary ranges for civil, mechanical, electrical and mining engineers, the ECSA registration path, and where the jobs are.',
    occupation: 'Engineer',
    updated: '2026-07-01',
    categorySlug: 'engineering',
    averageSalary: 'R35,000 – R70,000 per month',
    salaryRange: 'R25,000 – R120,000+ per month',
    entryLevel: 'R25,000 – R38,000 per month (Graduate / Candidate Engineer)',
    midLevel: 'R40,000 – R70,000 per month (Registered Professional Engineer)',
    seniorLevel: 'R75,000 – R120,000+ per month (Principal / Engineering Manager)',
    intro: 'Engineering is one of the highest-paying professions in South Africa, and registered professional engineers are on the scarce-skills list. Pay varies by discipline, sector and whether you are ECSA-registered.',
    body: `
<h2>Salary by discipline</h2>
<ul>
  <li><strong>Mining &amp; metallurgical</strong> — among the highest paid, especially on-site.</li>
  <li><strong>Electrical &amp; electronic</strong> — strong demand in energy and manufacturing.</li>
  <li><strong>Mechanical</strong> — broad demand across industry.</li>
  <li><strong>Civil &amp; structural</strong> — infrastructure, construction and consulting.</li>
  <li><strong>Chemical &amp; process</strong> — petrochemical, mining and manufacturing.</li>
</ul>

<h2>The ECSA registration effect</h2>
<p>Registering with the Engineering Council of South Africa (ECSA) as a Professional Engineer (Pr Eng) or Professional Engineering Technologist significantly increases earning power. It usually requires a recognised degree plus about three years of supervised experience and a competency review.</p>

<h2>Consulting vs industry</h2>
<p>Consulting engineers who take on professional liability and sign off designs can charge premium rates, while in-house industry roles offer stability and benefits. On-site mining and construction roles often add living-out and site allowances.</p>
`,
    careerPath: `
<ul>
  <li><strong>Graduate / Candidate Engineer</strong> — degree plus in-training experience.</li>
  <li><strong>Professional Engineer (Pr Eng)</strong> — ECSA-registered after ~3 years.</li>
  <li><strong>Senior Engineer</strong> — leads projects and mentors juniors.</li>
  <li><strong>Principal Engineer / Technical Lead</strong> — deep specialist authority.</li>
  <li><strong>Engineering Manager / Director</strong> — leads teams and business units.</li>
</ul>
`,
    requirements: `
<ul>
  <li>A recognised BEng / BSc Eng or BTech / Advanced Diploma in engineering.</li>
  <li>ECSA registration for professional roles (Pr Eng, Pr Tech Eng).</li>
  <li>Matric with strong Mathematics and Physical Science to enter the degree.</li>
  <li>Continuing professional development (CPD) to maintain registration.</li>
</ul>
`,
    faqs: [
      { q: 'Which engineering discipline pays the most in South Africa?', a: 'Mining, metallurgical and chemical engineering tend to pay the most, especially on-site, followed by electrical and mechanical. Actual pay depends on sector, experience and ECSA registration.' },
      { q: 'Do I need to register with ECSA?', a: 'You can work as a graduate or candidate engineer without registration, but registering with ECSA as a Professional Engineer significantly increases your salary and lets you sign off designs.' },
      { q: 'How long does it take to become a professional engineer?', a: 'After a four-year engineering degree, you typically need around three years of supervised practical experience before you can apply for ECSA professional registration.' },
    ],
  },
  {
    slug: 'plumber-salary-south-africa',
    title: 'Plumber Salary in South Africa (2026) — Qualified Artisan Pay',
    h1: 'Plumber Salary in South Africa',
    description: 'What do plumbers earn in South Africa? Salary ranges for apprentices and qualified plumbers, self-employment income, PIRB registration and where to find work.',
    occupation: 'Plumber',
    updated: '2026-07-01',
    categorySlug: 'engineering',
    averageSalary: 'R14,000 – R28,000 per month',
    salaryRange: 'R9,000 – R45,000 per month',
    entryLevel: 'R9,000 – R14,000 per month (Apprentice / Assistant)',
    midLevel: 'R15,000 – R28,000 per month (Qualified Plumber)',
    seniorLevel: 'R29,000 – R45,000 per month (Master Plumber / Contractor)',
    intro: 'Plumbing is a sought-after trade in South Africa with strong demand and excellent self-employment potential. Qualified, PIRB-registered plumbers who issue Certificates of Compliance can earn well above a standard salary.',
    body: `
<h2>Employed vs self-employed</h2>
<p>Employed plumbers earn a monthly salary, often set by the bargaining council for the sector. Self-employed plumbers charge per job or per hour (commonly R350–R650+ per hour for domestic call-outs), and established plumbing businesses can earn considerably more.</p>

<h2>What increases a plumber\u2019s income</h2>
<ul>
  <li><strong>PIRB registration</strong> — allows you to issue Certificates of Compliance (CoCs).</li>
  <li><strong>Gas installation qualification</strong> — LPG work is in high demand.</li>
  <li><strong>Solar geyser and heat-pump skills</strong> — growing market.</li>
  <li><strong>Running your own business</strong> — the biggest earnings lever.</li>
</ul>
`,
    careerPath: `
<ul>
  <li><strong>Plumbing Assistant / Apprentice</strong> — learn on the job plus TVET N-courses.</li>
  <li><strong>Qualified Plumber</strong> — pass the trade test.</li>
  <li><strong>PIRB-Registered Plumber</strong> — issue CoCs.</li>
  <li><strong>Master Plumber / Contractor</strong> — run your own business.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric or N2 with relevant subjects (Maths, Engineering Science).</li>
  <li>A plumbing apprenticeship and a passed trade test.</li>
  <li>Registration with the Plumbing Industry Registration Board (PIRB) to issue CoCs.</li>
  <li>A driver\u2019s licence is a strong advantage for call-out work.</li>
</ul>
`,
    faqs: [
      { q: 'How much does a qualified plumber earn in South Africa?', a: 'An employed qualified plumber typically earns R15,000 to R28,000 per month. Self-employed and PIRB-registered plumbers who run their own businesses can earn considerably more.' },
      { q: 'How do I become a qualified plumber?', a: 'Complete a plumbing apprenticeship combining TVET N-courses with workplace training, then pass the trade test. Register with the PIRB to issue Certificates of Compliance.' },
      { q: 'Is plumbing a good career in South Africa?', a: 'Yes. Plumbing is on the scarce-skills list, demand is consistent, and the self-employment potential is strong, especially with gas and solar geyser skills.' },
    ],
  },
  {
    slug: 'welder-salary-south-africa',
    title: 'Welder Salary in South Africa (2026) — Coded Welder Pay Guide',
    h1: 'Welder Salary in South Africa',
    description: 'What do welders earn in South Africa? Salary ranges for general and coded welders, the highest-paying certifications, and where to find welding jobs.',
    occupation: 'Welder',
    updated: '2026-07-01',
    categorySlug: 'engineering',
    averageSalary: 'R12,000 – R28,000 per month',
    salaryRange: 'R8,000 – R55,000 per month',
    entryLevel: 'R8,000 – R13,000 per month (General Welder)',
    midLevel: 'R14,000 – R28,000 per month (Qualified / Coded Welder)',
    seniorLevel: 'R30,000 – R55,000 per month (Coded Welder — pressure/pipe, mining, offshore)',
    intro: 'Welding is a practical trade with a wide pay range in South Africa. General welders earn modest wages, but coded welders who pass strict weld tests for pressure vessels, pipelines and structural work are highly paid and in demand.',
    body: `
<h2>Why coding matters so much</h2>
<p>The biggest factor in a welder\u2019s pay is coding — passing certified weld tests to recognised standards (for example ASME or ISO) for specific processes and positions. Coded welders in petrochemical, mining and power-generation environments earn far more than general fabrication welders.</p>

<h2>High-paying welding sectors</h2>
<ul>
  <li><strong>Petrochemical &amp; refineries</strong> — Sasol, refineries, shutdown work.</li>
  <li><strong>Power generation</strong> — Eskom stations and boiler work.</li>
  <li><strong>Mining</strong> — structural and plant maintenance.</li>
  <li><strong>Pipeline &amp; pressure vessel</strong> — coded pipe welding.</li>
</ul>

<h2>Processes and pay</h2>
<p>Specialising in TIG and coded pipe welding generally pays more than basic MIG or arc welding. Shutdown and contract work can pay premium day rates but is less stable than permanent employment.</p>
`,
    careerPath: `
<ul>
  <li><strong>General / Production Welder</strong> — basic MIG/arc welding.</li>
  <li><strong>Qualified Welder</strong> — trade-tested.</li>
  <li><strong>Coded Welder</strong> — passed certified weld tests (pressure/pipe).</li>
  <li><strong>Welding Inspector / Supervisor</strong> — QA and team leadership.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Grade 10–12 or N-level with technical subjects.</li>
  <li>A welding qualification from a TVET college or training centre.</li>
  <li>Weld coding certificates for higher-paid work.</li>
  <li>Knowledge of safety standards and PPE use.</li>
</ul>
`,
    faqs: [
      { q: 'How much does a coded welder earn in South Africa?', a: 'Coded welders in petrochemical, mining and power-generation work can earn from R30,000 to over R55,000 per month, well above general production welders who earn R8,000 to R13,000.' },
      { q: 'What is a coded welder?', a: 'A coded welder has passed certified weld tests to a recognised standard for a specific process and position, qualifying them for high-integrity work like pressure vessels and pipelines.' },
      { q: 'How do I increase my welding salary?', a: 'Get coded in TIG and pipe welding, gain experience in petrochemical or power-generation environments, and consider shutdown contract work which pays premium rates.' },
    ],
  },
  {
    slug: 'call-centre-agent-salary-south-africa',
    title: 'Call Centre Agent Salary in South Africa (2026) — Pay & Growth',
    h1: 'Call Centre Agent Salary in South Africa',
    description: 'What do call centre agents earn in South Africa? Salary ranges for inbound, outbound and international BPO agents, commission, and career progression.',
    occupation: 'Call Centre Agent',
    updated: '2026-07-01',
    categorySlug: 'general',
    averageSalary: 'R7,000 – R14,000 per month',
    salaryRange: 'R5,500 – R22,000 per month',
    entryLevel: 'R5,500 – R8,000 per month (Junior / Inbound)',
    midLevel: 'R9,000 – R14,000 per month (Experienced / International BPO)',
    seniorLevel: 'R15,000 – R22,000 per month (Team Leader / QA)',
    intro: 'South Africa is a major global call centre and BPO hub, especially Cape Town and Johannesburg. Agent pay varies widely between local campaigns and international outsourcing, where salaries and incentives are higher.',
    body: `
<h2>Local vs international campaigns</h2>
<p>Agents on local South African campaigns typically earn at the lower end, while those on international (UK, US, Australia) BPO campaigns earn more, often with attractive commission and performance incentives on top of the basic salary.</p>

<h2>What increases earnings</h2>
<ul>
  <li><strong>Sales campaigns</strong> — commission can double a basic salary for strong performers.</li>
  <li><strong>International accounts</strong> — higher base pay plus night-shift allowances.</li>
  <li><strong>Specialised support</strong> — technical or financial support pays more.</li>
  <li><strong>Bilingual skills</strong> — Afrikaans and other languages add value.</li>
</ul>
`,
    careerPath: `
<ul>
  <li><strong>Call Centre Agent</strong> — inbound or outbound.</li>
  <li><strong>Senior Agent / Subject Matter Expert</strong> — handle escalations.</li>
  <li><strong>Team Leader</strong> — manage a team of agents.</li>
  <li><strong>Quality Assurance / Trainer</strong> — coach and monitor.</li>
  <li><strong>Operations Manager</strong> — run the contact centre.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric (Grade 12).</li>
  <li>Clear spoken English; a neutral accent helps for international campaigns.</li>
  <li>Basic computer skills.</li>
  <li>Good communication and patience.</li>
  <li>Willingness to work shifts, including night shifts for international accounts.</li>
</ul>
`,
    faqs: [
      { q: 'How much do call centre agents earn in South Africa?', a: 'Most agents earn between R7,000 and R14,000 per month. International BPO campaigns and sales roles with commission can pay significantly more for strong performers.' },
      { q: 'Do call centre agents earn commission?', a: 'On sales and some retention campaigns, yes. Commission and performance incentives can substantially increase a strong agent\u2019s take-home pay above the basic salary.' },
      { q: 'Is a call centre a good first job?', a: 'Yes. It only requires matric and good communication, offers structured training, and provides a clear path to team leader, QA and management roles.' },
    ],
  },
  {
    slug: 'security-guard-salary-south-africa',
    title: 'Security Guard Salary in South Africa (2026) — PSIRA Grades & Pay',
    h1: 'Security Guard Salary in South Africa',
    description: 'What do security guards earn in South Africa? PSIRA grades A to E, minimum wages by area, armed response pay, and how to register and find security jobs.',
    occupation: 'Security Guard',
    updated: '2026-07-01',
    categorySlug: 'general',
    averageSalary: 'R5,500 – R9,500 per month',
    salaryRange: 'R4,500 – R18,000 per month',
    entryLevel: 'R4,500 – R6,500 per month (Grade E/D)',
    midLevel: 'R7,000 – R10,000 per month (Grade C/B)',
    seniorLevel: 'R11,000 – R18,000 per month (Grade A / Armed Response / Supervisor)',
    intro: 'Private security is one of the largest employers in South Africa. Pay is governed by PSIRA grades and a sectoral minimum wage, with armed response, specialised and supervisory roles earning the most.',
    body: `
<h2>PSIRA grades explained</h2>
<p>The Private Security Industry Regulatory Authority (PSIRA) grades officers from E (entry) up to A (most senior). Higher grades unlock better-paid roles. Your grade, the area you work in, and whether the post is armed all affect your wage, which is set by a sectoral determination.</p>

<h2>Higher-paying security roles</h2>
<ul>
  <li><strong>Armed response officers</strong> — require a firearm competency certificate.</li>
  <li><strong>Cash-in-transit</strong> — higher risk, higher pay.</li>
  <li><strong>Close protection (bodyguard)</strong> — specialised training, premium rates.</li>
  <li><strong>Control room operators</strong> — CCTV and alarm monitoring.</li>
</ul>
`,
    careerPath: `
<ul>
  <li><strong>Grade E/D Officer</strong> — entry-level guarding.</li>
  <li><strong>Grade C/B Officer</strong> — access control, patrolling.</li>
  <li><strong>Grade A Officer / Armed Response</strong> — senior, armed posts.</li>
  <li><strong>Site Supervisor</strong> — manage a team on site.</li>
  <li><strong>Security Manager</strong> — oversee contracts and operations.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric is preferred; some grades accept lower.</li>
  <li>PSIRA registration and grading (E through A).</li>
  <li>A clear criminal record.</li>
  <li>Physical fitness.</li>
  <li>A firearm competency certificate for armed posts.</li>
</ul>
`,
    faqs: [
      { q: 'What is the minimum wage for security guards in South Africa?', a: 'Security wages are set by a sectoral determination based on PSIRA grade and area. Entry grades in metro areas start around R4,500 to R6,500 per month, with higher grades and armed posts paying more.' },
      { q: 'What are PSIRA grades?', a: 'PSIRA grades range from E (entry-level) to A (most senior). Higher grades qualify you for better-paid roles such as supervision, armed response and specialised security.' },
      { q: 'How do I become a security guard?', a: 'Complete accredited security training, register and get graded with PSIRA, and ensure you have a clear criminal record. Armed posts also require a firearm competency certificate.' },
    ],
  },
  {
    slug: 'warehouse-worker-salary-south-africa',
    title: 'Warehouse Worker Salary in South Africa (2026) — Pay & Progression',
    h1: 'Warehouse Worker Salary in South Africa',
    description: 'What do warehouse workers earn in South Africa? Pay for pickers, packers and forklift drivers, overtime, and how to move up in logistics and distribution.',
    occupation: 'Warehouse Worker',
    updated: '2026-07-01',
    categorySlug: 'logistics',
    averageSalary: 'R6,000 – R11,000 per month',
    salaryRange: 'R4,800 – R16,000 per month',
    entryLevel: 'R4,800 – R6,500 per month (Picker / Packer / General)',
    midLevel: 'R7,000 – R11,000 per month (Forklift Driver / Storeman)',
    seniorLevel: 'R12,000 – R16,000 per month (Team Leader / Warehouse Supervisor)',
    intro: 'Warehouse and distribution roles are in constant demand as e-commerce and retail logistics grow in South Africa. A forklift licence is one of the fastest ways to lift your pay above the entry level.',
    body: `
<h2>Roles and pay</h2>
<ul>
  <li><strong>Picker / Packer / General Worker</strong> — entry-level, minimum-wage range.</li>
  <li><strong>Forklift Driver</strong> — a valid forklift licence adds a clear premium.</li>
  <li><strong>Storeman / Stock Controller</strong> — responsible for inventory accuracy.</li>
  <li><strong>Dispatch Clerk</strong> — manages outgoing orders.</li>
</ul>

<h2>How to earn more</h2>
<p>Getting a forklift or reach-truck licence is the single most effective step. Learning warehouse management systems (WMS), scanning and stock control, and reliability with overtime and shifts all help you progress to storeman, controller and supervisor roles.</p>
`,
    careerPath: `
<ul>
  <li><strong>General Warehouse Worker</strong> — picking, packing, loading.</li>
  <li><strong>Forklift Driver</strong> — licensed machine operation.</li>
  <li><strong>Storeman / Stock Controller</strong> — inventory management.</li>
  <li><strong>Team Leader / Supervisor</strong> — manage a shift or section.</li>
  <li><strong>Warehouse Manager</strong> — run the facility.</li>
</ul>
`,
    requirements: `
<ul>
  <li>Matric is preferred but not always required for entry roles.</li>
  <li>Physical fitness for manual handling.</li>
  <li>A forklift licence for driver roles (a big advantage).</li>
  <li>Basic numeracy and attention to detail.</li>
  <li>Willingness to work shifts and overtime.</li>
</ul>
`,
    faqs: [
      { q: 'How much does a warehouse worker earn in South Africa?', a: 'Entry-level pickers and packers earn around R4,800 to R6,500 per month. Forklift drivers and storemen earn more, and supervisors can reach R12,000 to R16,000.' },
      { q: 'Does a forklift licence increase my pay?', a: 'Yes. A valid forklift or reach-truck licence is one of the quickest ways to move above the general-worker wage and into a better-paid, more secure role.' },
      { q: 'How do I get a warehouse job with no experience?', a: 'Many warehouses hire general workers with matric and a willingness to learn. Getting a forklift licence and gaining reliable experience quickly opens better-paid roles.' },
    ],
  },
  {
    slug: 'driver-salary-south-africa',
    title: 'Driver Salary in South Africa (2026) — Code 10 & Code 14 Pay',
    h1: 'Driver Salary in South Africa',
    description: 'What do drivers earn in South Africa? Pay for Code 8, 10 and 14 drivers, delivery and truck drivers, PrDP requirements, and where to find driving jobs.',
    occupation: 'Driver',
    updated: '2026-07-01',
    categorySlug: 'logistics',
    averageSalary: 'R8,000 – R16,000 per month',
    salaryRange: 'R6,000 – R28,000 per month',
    entryLevel: 'R6,000 – R9,000 per month (Code 8 / Delivery)',
    midLevel: 'R10,000 – R16,000 per month (Code 10 / Code 14)',
    seniorLevel: 'R17,000 – R28,000 per month (Long-haul / Cross-border / Specialised)',
    intro: 'Drivers keep South Africa\u2019s economy moving. Pay rises sharply with your licence code and Professional Driving Permit (PrDP), with long-haul and cross-border truck drivers earning the most.',
    body: `
<h2>Pay by licence code</h2>
<ul>
  <li><strong>Code 8 (B)</strong> — light delivery and courier roles, entry pay.</li>
  <li><strong>Code 10 (C1)</strong> — medium trucks and larger delivery vehicles.</li>
  <li><strong>Code 14 (EC)</strong> — articulated trucks and heavy haulage, highest pay.</li>
</ul>

<h2>What raises a driver\u2019s salary</h2>
<ul>
  <li><strong>A valid PrDP</strong> — required for goods and passengers.</li>
  <li><strong>Dangerous goods (hazchem) endorsement</strong> — higher-paid loads.</li>
  <li><strong>Long-haul and cross-border routes</strong> — trip allowances add up.</li>
  <li><strong>A clean driving record</strong> — trusted with better routes and vehicles.</li>
</ul>
`,
    careerPath: `
<ul>
  <li><strong>Code 8 Delivery Driver</strong> — light vehicles and couriers.</li>
  <li><strong>Code 10 Driver</strong> — medium trucks.</li>
  <li><strong>Code 14 Driver</strong> — heavy and articulated trucks.</li>
  <li><strong>Long-haul / Cross-border Driver</strong> — premium routes.</li>
  <li><strong>Fleet Controller / Transport Supervisor</strong> — off-road management.</li>
</ul>
`,
    requirements: `
<ul>
  <li>A valid driver\u2019s licence for the relevant code (8, 10 or 14).</li>
  <li>A Professional Driving Permit (PrDP).</li>
  <li>A clean driving record.</li>
  <li>Matric is preferred; a hazchem endorsement helps for specialised loads.</li>
  <li>Knowledge of vehicle inspections and road safety.</li>
</ul>
`,
    faqs: [
      { q: 'How much does a Code 14 truck driver earn in South Africa?', a: 'Code 14 drivers typically earn R10,000 to R16,000 per month, and experienced long-haul or cross-border drivers can earn R17,000 to R28,000 including trip allowances.' },
      { q: 'Do I need a PrDP to drive professionally?', a: 'Yes. A Professional Driving Permit is legally required to drive goods vehicles and passengers for reward, and most employers will not hire a professional driver without one.' },
      { q: 'How can I earn more as a driver?', a: 'Upgrade your licence code to Code 14, get a PrDP and a dangerous-goods endorsement, keep a clean record, and move into long-haul or cross-border routes.' },
    ],
  },
];
