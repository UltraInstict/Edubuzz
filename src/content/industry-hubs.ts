/**
 * Industry authority hub content.
 *
 * Evergreen, South Africa-specific editorial for each major industry. Live jobs
 * and employers are pulled from PocketBase in the template via categorySlug.
 */

export interface IndustryFAQ {
  q: string;
  a: string;
}

export interface IndustryHub {
  slug: string;            // URL slug, e.g. 'government'
  name: string;            // display name
  categorySlug?: string;   // maps to a job category slug for live jobs
  title: string;
  description: string;
  overview: string;        // HTML
  salaryRange: string;
  qualifications: string;  // HTML list
  entryRoutes: string;     // HTML
  progression: string;     // HTML
  salarySlugs: string[];   // related salary guide slugs
  resourceSlugs: string[]; // related resource article slugs
  faqs: IndustryFAQ[];
}

export const INDUSTRY_HUBS: IndustryHub[] = [
  {
    slug: 'government',
    name: 'Government',
    categorySlug: 'government',
    title: 'Careers in Government in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to government careers in South Africa. Public service salary levels, the Z83 process, learnerships, internships and how to apply for DPSA jobs.',
    overview: `
<p>Government is one of the largest employers in South Africa, spanning national departments, provincial administrations, municipalities and state-owned entities. Public service careers offer stability, structured salary levels, a government pension (GEPF), medical aid subsidy and clear progression.</p>
<p>Vacancies appear across every field imaginable, from clerks, administrators and drivers to nurses, teachers, engineers, police officers and senior managers. Most national and provincial posts are advertised in the weekly DPSA vacancy circular.</p>
`,
    salaryRange: 'R10,000 – R85,000+ per month (Salary Levels 1–15)',
    qualifications: `
<ul>
  <li>Requirements vary by post, from Grade 10 for entry roles to degrees for professional posts.</li>
  <li>A fully completed and signed Z83 application form is compulsory.</li>
  <li>A comprehensive CV; certified documents are usually requested from shortlisted candidates.</li>
  <li>South African citizenship is required for most posts.</li>
</ul>
`,
    entryRoutes: `
<p>Common entry points include government internships (12–24 months), learnerships, and Salary Level 1–5 posts such as data capturers, admin clerks and general assistants. Many departments run annual graduate and internship intakes.</p>
`,
    progression: `
<p>Public servants progress through salary levels and notches with experience and performance, from clerk (Level 5) to senior admin officer, assistant director, deputy director and director. Professional streams (health, engineering, legal) follow occupation-specific dispensations.</p>
`,
    salarySlugs: ['police-officer-salary-south-africa', 'traffic-officer-salary-south-africa', 'administrative-clerk-salary-south-africa', 'nurse-salary-south-africa'],
    resourceSlugs: ['how-to-apply-for-government-jobs', 'cv-writing-guide-south-africa', 'common-interview-questions-and-answers'],
    faqs: [
      { q: 'How do I apply for government jobs in South Africa?', a: 'Find the post in the weekly DPSA circular or on the department website, complete the official Z83 form in full, attach a comprehensive CV, and submit before the closing date using the method stated in the advert.' },
      { q: 'What is the Z83 form?', a: 'The Z83 is the compulsory official application form for all South African public service jobs. It must be fully completed and signed; incomplete forms are disqualified.' },
      { q: 'Do government jobs offer good benefits?', a: 'Yes. Public service roles include a government pension (GEPF), medical aid subsidy, housing allowance and strong job security, which add significant value beyond the base salary.' },
    ],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    categorySlug: 'health',
    title: 'Careers in Healthcare in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to healthcare careers in South Africa. Nursing, allied health, salaries, qualifications, HPCSA/SANC registration, and where the jobs are.',
    overview: `
<p>Healthcare is one of South Africa\u2019s most in-demand sectors, employing hundreds of thousands across public hospitals, private groups like Netcare, Life Healthcare and Mediclinic, clinics and community services. Nurses, in particular, are in short supply locally and internationally.</p>
<p>The sector spans nursing, medicine, allied health (physiotherapy, radiography, pharmacy), emergency care and support roles, with strong demand across every province.</p>
`,
    salaryRange: 'R15,000 – R120,000+ per month (support to specialist)',
    qualifications: `
<ul>
  <li>Matric with Mathematics and Life Sciences for most clinical studies.</li>
  <li>An accredited qualification from a university or nursing college.</li>
  <li>Registration with the relevant council: SANC (nursing) or HPCSA (medical and allied health).</li>
  <li>Annual registration renewal and continuing professional development (CPD).</li>
</ul>
`,
    entryRoutes: `
<p>Entry points include enrolled nursing auxiliary and enrolled nurse qualifications, learnerships, in-service training for allied health diplomas, and support roles such as ward assistants and porters that can lead to further study.</p>
`,
    progression: `
<p>Nurses progress from enrolled auxiliary to enrolled nurse, professional nurse, specialist, and unit or nursing manager. Allied health and medical professionals specialise and move into senior clinical and management posts.</p>
`,
    salarySlugs: ['nurse-salary-south-africa', 'general-worker-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers', 'what-is-a-learnership'],
    faqs: [
      { q: 'What healthcare jobs are most in demand in South Africa?', a: 'Nursing is the most in-demand, along with pharmacists, radiographers, physiotherapists and emergency care practitioners. Both public and private employers recruit these roles continuously.' },
      { q: 'Do I need to register with a council to work in healthcare?', a: 'Yes. Nurses register with the South African Nursing Council (SANC), and doctors and allied health professionals register with the Health Professions Council of South Africa (HPCSA). Registration must be renewed annually.' },
      { q: 'How do I start a nursing career?', a: 'Study an accredited nursing qualification at a university or nursing college, register with SANC, and you can begin as an enrolled nurse or professional nurse depending on your qualification.' },
    ],
  },
  {
    slug: 'education',
    name: 'Education',
    categorySlug: 'education',
    title: 'Careers in Education in South Africa (2026) — Teaching Jobs & Salaries',
    description: 'A complete guide to education careers in South Africa. Teaching qualifications, SACE registration, salaries, TVET lecturing and how to find school and college jobs.',
    overview: `
<p>Education is a large and stable employer in South Africa, spanning public and private schools, TVET colleges, universities and early childhood development. Teachers, lecturers and education support staff are needed across every province, with particular demand for Maths, Science and technical subject specialists.</p>
`,
    salaryRange: 'R18,000 – R55,000+ per month (teachers), higher for management',
    qualifications: `
<ul>
  <li>A Bachelor of Education (B.Ed.), or a degree plus a PGCE.</li>
  <li>Registration with the South African Council for Educators (SACE).</li>
  <li>A police clearance certificate.</li>
  <li>For TVET lecturing, relevant subject or trade qualifications.</li>
</ul>
`,
    entryRoutes: `
<p>Funza Lushaka bursaries fund students to become teachers in priority subjects. Graduates enter as Post Level 1 educators, and there are teaching assistant and ECD practitioner routes for those starting out.</p>
`,
    progression: `
<p>Teachers progress from Post Level 1 to Head of Department, Deputy Principal and Principal, and can move into district and provincial education administration.</p>
`,
    salarySlugs: ['teacher-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers', 'tvet-colleges-and-nsfas-guide'],
    faqs: [
      { q: 'How do I become a teacher in South Africa?', a: 'Complete a Bachelor of Education degree, or any bachelor\u2019s degree followed by a PGCE, then register with the South African Council for Educators (SACE) before you can teach.' },
      { q: 'Is there demand for teachers in South Africa?', a: 'Yes, especially for Mathematics, Physical Science, technical subjects and Foundation Phase teachers. Rural and priority schools often have the strongest demand.' },
      { q: 'What is the Funza Lushaka bursary?', a: 'It is a government bursary that funds students to study teaching in priority subject areas, in return for teaching at a public school for the number of years they were funded.' },
    ],
  },
  {
    slug: 'engineering',
    name: 'Engineering',
    categorySlug: 'engineering',
    title: 'Careers in Engineering in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to engineering careers in South Africa. Disciplines, ECSA registration, salaries, artisan trades, learnerships and where the jobs are.',
    overview: `
<p>Engineering is one of the highest-paid and most in-demand fields in South Africa, spanning civil, mechanical, electrical, chemical, mining and industrial disciplines. The sector includes both professional engineers and the skilled artisan trades that keep industry, mining and infrastructure running.</p>
<p>Registered professional engineers and qualified artisans both appear on the national scarce-skills list.</p>
`,
    salaryRange: 'R12,000 – R120,000+ per month (artisan to principal engineer)',
    qualifications: `
<ul>
  <li>For professional engineering: a recognised BEng/BSc Eng or BTech, and ECSA registration.</li>
  <li>For artisans: a TVET N-course pathway plus an apprenticeship and trade test.</li>
  <li>Matric with strong Mathematics and Physical Science to enter either route.</li>
</ul>
`,
    entryRoutes: `
<p>Two main routes: the professional route (engineering degree, then candidate engineer to Pr Eng), and the artisan route (TVET N-courses, apprenticeship, trade test). Learnerships and apprenticeships in mining, manufacturing and Eskom are common entry points.</p>
`,
    progression: `
<p>Engineers progress from candidate to professional (Pr Eng), senior, principal and engineering manager. Artisans progress from apprentice to qualified, then to foreman, supervisor and into their own contracting businesses.</p>
`,
    salarySlugs: ['engineer-salary-south-africa', 'electrician-salary-south-africa', 'plumber-salary-south-africa', 'welder-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'what-is-a-learnership', 'tvet-colleges-and-nsfas-guide'],
    faqs: [
      { q: 'What engineering jobs are in demand in South Africa?', a: 'Electrical, mechanical, civil and mining engineers are in demand, along with qualified artisans such as electricians, millwrights, fitters and welders, all of which appear on the scarce-skills list.' },
      { q: 'Do I need a degree to work in engineering?', a: 'Not always. The professional route needs an engineering degree and ECSA registration, but the artisan route uses TVET N-courses, an apprenticeship and a trade test, and pays well without a degree.' },
      { q: 'How do I become an artisan?', a: 'Study the relevant N-courses at a TVET college, complete an apprenticeship combining theory and workplace training, then pass the trade test to qualify.' },
    ],
  },
  {
    slug: 'mining',
    name: 'Mining',
    categorySlug: 'mining',
    title: 'Careers in Mining in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to mining careers in South Africa. Roles, salaries, learnerships, safety tickets, and where the platinum, gold and coal jobs are.',
    overview: `
<p>Mining is a cornerstone of the South African economy and a major employer, especially in the North West, Limpopo, Mpumalanga and the Free State. The sector offers well-paid roles from entry-level mineworkers to artisans, engineers, geologists and mine managers, and often pays above other sectors even at entry level due to strong union agreements.</p>
`,
    salaryRange: 'R10,000 – R120,000+ per month (entry to management)',
    qualifications: `
<ul>
  <li>Entry roles need matric or a Grade 10–12 depending on the position.</li>
  <li>Medical fitness and safety inductions (red ticket) are required underground.</li>
  <li>Artisan and engineering roles need trade tests or degrees.</li>
  <li>Blasting and rock-breaking roles require specific certificates.</li>
</ul>
`,
    entryRoutes: `
<p>Mining houses run large learnership and apprenticeship programmes covering trades, mining operations, and engineering. Entry roles such as general mineworker and machine operator can lead to further training and specialisation.</p>
`,
    progression: `
<p>Careers progress from general worker and operator to team leader, miner, shift supervisor, and into artisan, engineering and management streams. Qualified artisans and mining engineers are especially well paid.</p>
`,
    salarySlugs: ['general-worker-salary-south-africa', 'electrician-salary-south-africa', 'welder-salary-south-africa', 'engineer-salary-south-africa'],
    resourceSlugs: ['what-is-a-learnership', 'cv-writing-guide-south-africa', 'tvet-colleges-and-nsfas-guide'],
    faqs: [
      { q: 'What qualifications do I need for mining jobs?', a: 'Entry roles typically need matric or Grade 10–12 plus medical fitness and safety induction. Artisan and engineering roles require trade tests or degrees, and some roles need blasting certificates.' },
      { q: 'Do mining jobs pay well in South Africa?', a: 'Yes. Because of strong union agreements and the demanding nature of the work, mining often pays above other sectors even at entry level, and artisan and engineering roles are among the best paid in the country.' },
      { q: 'Where are the mining jobs in South Africa?', a: 'The main mining regions are the North West and Limpopo (platinum), Mpumalanga (coal), and the Free State and Gauteng (gold), though operations exist across several provinces.' },
    ],
  },
  {
    slug: 'retail',
    name: 'Retail',
    categorySlug: 'retail',
    title: 'Careers in Retail in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to retail careers in South Africa. Cashier, sales and management roles, salaries, learnerships and how to grow from the shop floor to store manager.',
    overview: `
<p>Retail is one of the biggest employers of entry-level workers in South Africa. Major chains like Shoprite, Pick n Pay, Woolworths, Clicks, Dis-Chem and TFG hire thousands of cashiers, sales assistants, merchandisers and managers across every province.</p>
<p>It is one of the most accessible sectors for first-time job seekers, with strong internal promotion into supervisory and management roles.</p>
`,
    salaryRange: 'R5,000 – R30,000+ per month (cashier to store manager)',
    qualifications: `
<ul>
  <li>Matric is preferred for most roles at large chains.</li>
  <li>Good customer service and communication skills.</li>
  <li>A clear criminal record for cash-handling roles.</li>
  <li>Retail learnerships can substitute for experience.</li>
</ul>
`,
    entryRoutes: `
<p>Cashier, sales assistant and merchandiser roles are the main entry points, along with retail learnerships that combine work with an accredited qualification. Many retailers offer structured management trainee programmes.</p>
`,
    progression: `
<p>Retail rewards internal promotion: cashier to senior cashier or cash office, then floor supervisor, assistant store manager and store manager, with paths into area and regional management.</p>
`,
    salarySlugs: ['cashier-salary-south-africa', 'general-worker-salary-south-africa', 'warehouse-worker-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers', 'what-is-a-learnership'],
    faqs: [
      { q: 'What retail jobs are available for beginners?', a: 'Cashier, sales assistant, packer and merchandiser roles are the most common entry points, and many large retailers offer learnerships that combine work with an accredited qualification.' },
      { q: 'Can you build a career in retail?', a: 'Yes. Retail is known for internal promotion. Many store and area managers began as cashiers or sales assistants and progressed through supervisory roles with experience and training.' },
      { q: 'Do I need matric to work in retail?', a: 'Large chains generally prefer matric, especially for cash-handling roles, but some entry positions and learnerships accept applicants still completing their schooling.' },
    ],
  },
  {
    slug: 'logistics',
    name: 'Logistics',
    categorySlug: 'logistics',
    title: 'Careers in Logistics in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to logistics and supply chain careers in South Africa. Driver, warehouse and controller roles, salaries, licences and how to progress.',
    overview: `
<p>Logistics and supply chain is a fast-growing sector in South Africa, driven by e-commerce, retail distribution and the ports of Durban and Cape Town. It employs drivers, forklift operators, warehouse staff, controllers and supply-chain professionals across the country.</p>
`,
    salaryRange: 'R5,000 – R40,000+ per month (general worker to manager)',
    qualifications: `
<ul>
  <li>Warehouse roles need matric and physical fitness; a forklift licence is a big advantage.</li>
  <li>Driving roles need the correct licence code (8, 10 or 14) and a valid PrDP.</li>
  <li>Supply-chain management roles benefit from a relevant diploma or degree.</li>
</ul>
`,
    entryRoutes: `
<p>General warehouse worker, picker/packer and driver roles are the main entry points. Getting a forklift licence or upgrading your driving code quickly improves pay and options.</p>
`,
    progression: `
<p>Warehouse workers progress to forklift driver, storeman, team leader and warehouse manager. Drivers move from Code 8 to Code 14 and into long-haul, cross-border and fleet-control roles.</p>
`,
    salarySlugs: ['driver-salary-south-africa', 'warehouse-worker-salary-south-africa', 'general-worker-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers'],
    faqs: [
      { q: 'What licences do I need for logistics jobs?', a: 'Warehouse roles benefit from a forklift licence, while professional driving requires the correct licence code (8, 10 or 14) plus a Professional Driving Permit (PrDP).' },
      { q: 'Is logistics a growing industry in South Africa?', a: 'Yes. The growth of e-commerce, retail distribution and the major ports drives steady demand for drivers, warehouse staff, controllers and supply-chain professionals.' },
      { q: 'How do I get into logistics with no experience?', a: 'Start as a general warehouse worker or picker/packer, then add a forklift licence or upgrade your driving code to move into better-paid, more secure roles.' },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance',
    categorySlug: 'finance',
    title: 'Careers in Finance in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to finance and banking careers in South Africa. Roles, qualifications, SAICA/SAIPA routes, salaries, learnerships and where the jobs are.',
    overview: `
<p>Finance and banking is a major, well-paid sector concentrated in Gauteng and the Western Cape. It spans banking, accounting, auditing, insurance, investment and financial administration, with employers including the major banks, insurers, auditing firms and the JSE-listed corporates.</p>
`,
    salaryRange: 'R8,000 – R100,000+ per month (clerk to qualified professional)',
    qualifications: `
<ul>
  <li>Bookkeeping and finance-clerk roles need matric with Accounting or Maths.</li>
  <li>Professional routes need a relevant degree plus SAICA (CA), SAIPA or CIMA articles.</li>
  <li>Banking roles range from matric-level tellers to degree-level analysts.</li>
</ul>
`,
    entryRoutes: `
<p>Bank teller, finance clerk and debtors/creditors clerk roles are common entry points, alongside bank and finance learnerships and graduate programmes. Trainee accountant (articles) positions are the route to becoming a CA(SA).</p>
`,
    progression: `
<p>Careers progress from clerk to bookkeeper, accountant, financial manager and financial director. Qualified CAs, actuaries and investment professionals are among the best-paid roles in the country.</p>
`,
    salarySlugs: ['administrative-clerk-salary-south-africa', 'cashier-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'salary-negotiation-guide-south-africa', 'what-is-a-learnership'],
    faqs: [
      { q: 'What qualifications do I need for a finance career?', a: 'Entry roles need matric with Accounting or Maths. Professional roles require a relevant degree plus articles through SAICA (to become a CA), SAIPA or CIMA.' },
      { q: 'Are there finance learnerships in South Africa?', a: 'Yes. The major banks, insurers and auditing firms run finance and banking learnerships and graduate programmes every year, which are a strong entry route for matriculants and graduates.' },
      { q: 'Which finance jobs pay the most?', a: 'Chartered Accountants (CA(SA)), actuaries, investment analysts and financial managers are among the best-paid finance professionals, especially in Johannesburg and Cape Town.' },
    ],
  },
  {
    slug: 'it',
    name: 'IT & Technology',
    categorySlug: 'it-tech',
    title: 'Careers in IT in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to IT and technology careers in South Africa. Developer, support and data roles, salaries, qualifications, bootcamps and where the jobs are.',
    overview: `
<p>IT and technology is the fastest-growing career field in South Africa, concentrated in Gauteng and Cape Town but increasingly remote-friendly. Demand is strong for software developers, data specialists, cloud engineers, cybersecurity and IT support, and many roles are accessible without a traditional degree.</p>
`,
    salaryRange: 'R12,000 – R100,000+ per month (support to senior engineer)',
    qualifications: `
<ul>
  <li>Degrees in Computer Science or IT, or diplomas from TVET colleges and private providers.</li>
  <li>Industry certifications (CompTIA, Microsoft, AWS, Cisco) carry real weight.</li>
  <li>Coding bootcamps and demonstrable portfolios can substitute for formal degrees.</li>
</ul>
`,
    entryRoutes: `
<p>IT support and help-desk roles, learnerships, and junior developer positions are common entry points. A strong portfolio of projects and recognised certifications can open doors even without a degree.</p>
`,
    progression: `
<p>Careers progress from support and junior developer to intermediate and senior engineer, then to specialist, team lead, architect and engineering manager. Remote and international contract work is increasingly common.</p>
`,
    salarySlugs: ['call-centre-agent-salary-south-africa', 'administrative-clerk-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'salary-negotiation-guide-south-africa', 'graduate-cv-south-africa'],
    faqs: [
      { q: 'Do I need a degree for an IT career in South Africa?', a: 'Not necessarily. While degrees help, many IT professionals enter through diplomas, coding bootcamps, industry certifications (like CompTIA, AWS or Microsoft) and a strong portfolio of projects.' },
      { q: 'What IT jobs are most in demand?', a: 'Software developers, data engineers and analysts, cloud and DevOps engineers, cybersecurity specialists and IT support are consistently in demand across South Africa.' },
      { q: 'Can I work remotely in tech from South Africa?', a: 'Yes. Technology is one of the most remote-friendly fields, and many South African developers work remotely for local and international companies.' },
    ],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality & Tourism',
    categorySlug: 'hospitality',
    title: 'Careers in Hospitality & Tourism in South Africa (2026) — Jobs & Salaries',
    description: 'A complete guide to hospitality and tourism careers in South Africa. Hotel, restaurant and lodge roles, salaries, qualifications and where the jobs are.',
    overview: `
<p>Hospitality and tourism is a major employer in South Africa, especially in the Western Cape, KwaZulu-Natal and around the Kruger National Park. The sector spans hotels, restaurants, lodges, resorts, travel and events, with strong seasonal demand and clear paths from entry level into management.</p>
`,
    salaryRange: 'R5,000 – R35,000+ per month (entry to management)',
    qualifications: `
<ul>
  <li>Many entry roles need only matric and the right attitude.</li>
  <li>Hospitality diplomas and chef qualifications help for specialised and management roles.</li>
  <li>Customer service, languages and a friendly manner are highly valued.</li>
</ul>
`,
    entryRoutes: `
<p>Waiter, housekeeper, front-desk and kitchen assistant roles are common entry points, along with hospitality learnerships and in-service training for tourism and chef qualifications.</p>
`,
    progression: `
<p>Careers progress from entry roles to supervisor, then department head (front office, food and beverage, housekeeping) and into hotel or lodge management.</p>
`,
    salarySlugs: ['general-worker-salary-south-africa', 'receptionist-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers', 'internship-guide-south-africa'],
    faqs: [
      { q: 'What jobs are available in hospitality?', a: 'Common roles include waiters, bartenders, housekeepers, front-desk staff, kitchen assistants and chefs, along with supervisory and management positions in hotels, lodges and restaurants.' },
      { q: 'Do I need a qualification to work in hospitality?', a: 'Many entry roles need only matric and good customer service. Hospitality diplomas and chef qualifications help you access specialised and management positions.' },
      { q: 'Where are the hospitality jobs in South Africa?', a: 'The Western Cape, KwaZulu-Natal coast and areas around the Kruger National Park have the strongest demand, with busy seasonal peaks over summer and holidays.' },
    ],
  },
  {
    slug: 'security',
    name: 'Security',
    categorySlug: 'general',
    title: 'Careers in Security in South Africa (2026) — Jobs, Grades & Salaries',
    description: 'A complete guide to security careers in South Africa. PSIRA grades, armed response, salaries, training and how to register and find security jobs.',
    overview: `
<p>Private security is one of the largest employers in South Africa, with strong and steady demand across residential, commercial, retail and industrial sectors. Roles range from access-control officers to armed response, cash-in-transit, close protection and control-room operators.</p>
`,
    salaryRange: 'R4,500 – R18,000+ per month (Grade E to armed/supervisor)',
    qualifications: `
<ul>
  <li>Accredited security training and PSIRA registration and grading (E to A).</li>
  <li>A clear criminal record and physical fitness.</li>
  <li>A firearm competency certificate for armed posts.</li>
  <li>Matric is preferred but some grades accept less.</li>
</ul>
`,
    entryRoutes: `
<p>Entry is through accredited PSIRA training and grading at Grade E or D, working as a general security officer. Higher grades and specialised training (armed response, control room) unlock better pay.</p>
`,
    progression: `
<p>Officers progress through PSIRA grades from E to A, into armed response and specialised roles, then site supervisor, and security or operations manager.</p>
`,
    salarySlugs: ['security-guard-salary-south-africa', 'general-worker-salary-south-africa'],
    resourceSlugs: ['cv-writing-guide-south-africa', 'common-interview-questions-and-answers'],
    faqs: [
      { q: 'How do I become a security guard in South Africa?', a: 'Complete accredited security training, register and get graded with PSIRA (Grades E to A), and ensure you have a clear criminal record. Armed posts also require a firearm competency certificate.' },
      { q: 'What are PSIRA grades?', a: 'PSIRA grades run from E (entry) to A (most senior). Higher grades qualify you for better-paid roles such as supervision, armed response and specialised security.' },
      { q: 'Is there demand for security jobs?', a: 'Yes. Private security is one of the largest and most consistent employers in South Africa, with steady demand across residential, retail, commercial and industrial sectors.' },
    ],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    categorySlug: 'general',
    title: 'Careers in Manufacturing in South Africa (2026) — Jobs, Salaries & Routes',
    description: 'A complete guide to manufacturing careers in South Africa. Operator, artisan and production roles, salaries, learnerships and where the factory jobs are.',
    overview: `
<p>Manufacturing is a significant employer in South Africa, concentrated in Gauteng, the Eastern Cape (automotive), KwaZulu-Natal and the Western Cape. It spans automotive, food and beverage, chemicals, steel and consumer goods, employing machine operators, artisans, quality controllers and production managers.</p>
`,
    salaryRange: 'R5,000 – R45,000+ per month (operator to management)',
    qualifications: `
<ul>
  <li>Operator roles need matric or Grade 10–12 and on-the-job training.</li>
  <li>Artisan roles need TVET N-courses, an apprenticeship and a trade test.</li>
  <li>Safety awareness and reliability are highly valued.</li>
</ul>
`,
    entryRoutes: `
<p>General worker and machine operator roles are the main entry points, along with manufacturing and engineering learnerships and apprenticeships offered by large producers such as the automotive plants.</p>
`,
    progression: `
<p>Careers progress from general worker and operator to team leader and supervisor, and through the artisan route (apprentice to qualified artisan to foreman) into production and plant management.</p>
`,
    salarySlugs: ['general-worker-salary-south-africa', 'welder-salary-south-africa', 'warehouse-worker-salary-south-africa'],
    resourceSlugs: ['what-is-a-learnership', 'cv-writing-guide-south-africa', 'tvet-colleges-and-nsfas-guide'],
    faqs: [
      { q: 'What jobs are available in manufacturing?', a: 'Common roles include machine operators, general workers, artisans (fitters, welders, electricians), quality controllers, and production supervisors and managers.' },
      { q: 'How do I get a factory job with no experience?', a: 'Start as a general worker or machine operator, where employers train on the job, and pursue a manufacturing or engineering learnership to gain accredited skills and better pay.' },
      { q: 'Where are the manufacturing jobs in South Africa?', a: 'Gauteng is the largest manufacturing hub, followed by the Eastern Cape (automotive), KwaZulu-Natal and the Western Cape.' },
    ],
  },
];
