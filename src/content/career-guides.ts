/**
 * Career guides — comprehensive occupation guides for South African careers.
 *
 * One deep page per occupation (training, requirements, entry routes, salary
 * pointers, progression, employers, FAQs) — never thin pages. Salary detail
 * lives in the linked /salary guides where available.
 */

export interface CareerFAQ {
  q: string;
  a: string;
}

export interface CareerGuide {
  slug: string;
  title: string;
  h1: string;
  description: string;
  occupation: string;
  updated: string;
  readMins: number;
  featured?: boolean;
  popular?: boolean;
  intro: string;
  body: string;
  faqs: CareerFAQ[];
  salarySlug?: string;       // linked /salary guide
  educationLinks: string[];  // linked /education guide slugs
  resourceLinks: string[];   // linked /resources article slugs
  companyLinks?: { slug: string; label: string }[]; // linked /company pages
}

export const CAREER_GUIDES: CareerGuide[] = [
  {
    slug: 'how-to-become-an-electrician',
    title: 'How to Become an Electrician in South Africa: Training, Requirements, Career Path & Salary',
    h1: 'How to Become an Electrician in South Africa',
    description: 'The complete path to becoming a qualified electrician in South Africa: entry requirements, TVET and apprenticeship routes, trade test, registration, salaries and employers.',
    occupation: 'Electrician',
    updated: '2026-08-01',
    readMins: 10,
    featured: true,
    popular: true,
    intro: 'Electricians are among the most consistently in-demand artisans in South Africa — needed in every town for domestic, commercial and industrial work, with strong demand abroad as well. Becoming a qualified electrician takes study plus practical training, and it ends with a trade test. Here is the full route.',
    body: `
<h2>What electricians do</h2>
<p>Electricians install, maintain and repair electrical systems: wiring in homes and buildings, distribution boards, motors and control systems in factories, and electrical infrastructure in mines and utilities. The work splits roughly into domestic, commercial and industrial specialisations, with industrial work generally paying the most.</p>

<h2>Where electricians work</h2>
<ul>
  <li>Electrical contracting companies (domestic and commercial installations)</li>
  <li>Mines and heavy industry (maintenance electricians)</li>
  <li>Municipalities and Eskom (infrastructure and distribution)</li>
  <li>Manufacturing plants and food processing facilities</li>
  <li>Self-employment — many qualified electricians run their own contracting businesses</li>
</ul>

<h2>Entry requirements</h2>
<p>You need at least a Grade 9 certificate to begin the trade, but matric with Mathematics and Physical Sciences is strongly recommended and required by many employers and colleges for apprenticeships.</p>

<h2>Training routes</h2>
<ol>
  <li><strong>TVET college route</strong>: Study Electrical Engineering N1–N6 (or NC(V) Electrical Infrastructure Construction) at a public TVET college. The NATED route takes you through theory levels, and the practical component is usually completed through an apprenticeship or learnership.</li>
  <li><strong>Apprenticeship route</strong>: Find an apprenticeship with an employer (often through SETA-funded programmes). Apprenticeships combine on-the-job training with college or training-centre blocks, and they end in the trade test.</li>
  <li><strong>Learnership route</strong>: Some employers offer electrical learnerships, particularly utilities and large industrial companies.</li>
</ol>

<h2>Trade test and registration</h2>
<p>To be recognised as a qualified electrician you must pass the national trade test at an accredited trade test centre. After passing, you can register as an installation electrician or qualify for the single-phase tester or master electrician registration with the Department of Employment and Labour. Registration affects what work you may legally sign off — master electricians can issue Certificates of Compliance, which is where much of the contracting value lies.</p>

<h2>Salary expectations</h2>
<p>Apprentice electricians earn a training allowance. Newly qualified electricians typically earn in the R12,000–R20,000 per month range, with experienced and industrial electricians earning significantly more. Master electricians and business owners can earn considerably higher incomes. See the full breakdown in our electrician salary guide.</p>

<h2>Career progression</h2>
<ul>
  <li>Apprentice / trainee → Qualified electrician (trade tested)</li>
  <li>Specialise: industrial automation, PLC programming, solar/PV installation, hazardous areas</li>
  <li>Supervisor / foreman → Site or project manager</li>
  <li>Single-phase tester → Master electrician → own contracting business</li>
</ul>

<h2>Who hires electricians?</h2>
<p>Electrical contractors, mining houses, manufacturing companies, municipalities, property maintenance firms and solar installation companies all hire regularly. ESKOM and large construction firms also run apprenticeship intakes. Many electricians start with a contractor and later work for themselves.</p>
`,
    faqs: [
      { q: 'How long does it take to become a qualified electrician in South Africa?', a: 'Typically three to four years: the N1–N6 theory or equivalent, workplace experience through an apprenticeship or learnership, then the trade test. TVET study alone does not make you a qualified artisan — the trade test is required.' },
      { q: 'Do I need matric to become an electrician?', a: 'Not strictly — you can start from Grade 9 with NC(V) programmes. However, matric with Mathematics and Physical Sciences makes the theory far easier and is required by many apprenticeship employers.' },
      { q: 'How much does an electrician earn in South Africa?', a: 'Qualified electricians generally earn from around R12,000 to R30,000+ per month depending on industry and experience. Industrial and specialised electricians earn more. See our full salary guide for ranges.' },
      { q: 'Is there demand for electricians?', a: 'Yes — consistently. The shortage of qualified artisans in South Africa is well documented, and electricians are also on many countries\' scarce-skills lists, which supports international opportunities.' },
    ],
    salarySlug: 'electrician-salary-south-africa',
    educationLinks: ['tvet-colleges-in-south-africa', 'n4-n6-nated-programmes-explained'],
    resourceLinks: ['what-is-a-learnership', 'cv-writing-guide-south-africa'],
  },
  {
    slug: 'how-to-become-a-nurse',
    title: 'How to Become a Nurse in South Africa: Qualifications, Registration & Career Path',
    h1: 'How to Become a Nurse in South Africa',
    description: 'The complete route to becoming a nurse in South Africa: qualification levels (ENA, EN, Professional Nurse), where to study, SANC registration, salaries and specialisations.',
    occupation: 'Nurse',
    updated: '2026-08-01',
    readMins: 10,
    featured: true,
    popular: true,
    intro: 'Nursing is one of South Africa\'s most in-demand professions, with chronic shortages locally and strong international demand. The career has clear qualification levels, each with its own training route and scope of practice. This guide explains every step from school to registration.',
    body: `
<h2>Nursing qualification levels</h2>
<p>South African nursing has three registered categories:</p>
<ul>
  <li><strong>Enrolled Nursing Auxiliary (ENA)</strong> — a one-year Higher Certificate. Auxiliaries support basic patient care under supervision.</li>
  <li><strong>Enrolled Nurse (EN)</strong> — a two-year Diploma. Enrolled nurses deliver direct patient care and can supervise auxiliaries.</li>
  <li><strong>Professional Nurse (PN)</strong> — a four-year Bachelor of Nursing (or equivalent diploma route). Professional nurses lead care, administer complex treatment and supervise teams.</li>
</ul>
<p>All three categories must register with the South African Nursing Council (SANC) to practise, and registration must be renewed annually.</p>

<h2>Where to study</h2>
<p>Professional nurse degrees are offered at universities with nursing faculties (for example the University of Cape Town, Wits, Stellenbosch, UKZN, and many others), while enrolled nurse programmes are offered at public nursing colleges and some private institutions. Public nursing colleges are often more affordable and are linked to hospitals for clinical training. Always confirm the institution and programme are SANC-accredited before enrolling.</p>

<h2>Entry requirements</h2>
<p>For the Bachelor of Nursing you need matric with a bachelor\'s pass, including Life Sciences and often Mathematics or Mathematical Literacy at specified levels — requirements vary by university. Enrolled nurse programmes usually require matric with Life Sciences. Strong English is important throughout, and a clear criminal record is required for clinical placement.</p>

<h2>The training experience</h2>
<p>Nursing training combines theory with extensive clinical practice in hospitals and clinics. Expect long shifts during clinical blocks, including nights and weekends. The work is demanding but provides job security and the ability to specialise later.</p>

<h2>Specialisations and progression</h2>
<ul>
  <li>Midwifery, critical care (ICU), theatre nursing, oncology, paediatrics, psychiatry</li>
  <li>Advanced practice: nurse educator, nurse manager, clinical nurse specialist</li>
  <li>Management track: unit manager → nursing services manager</li>
  <li>International opportunities: South African nurses are recruited by the UK, Middle East and elsewhere, subject to each country\'s registration requirements</li>
</ul>

<h2>Where nurses work</h2>
<p>Public hospitals and clinics (the largest employer), private hospital groups such as Netcare, Life Healthcare and Mediclinic, mining and industrial health services, schools, NGOs and home-based care providers.</p>

<h2>Salary expectations</h2>
<p>Public sector nurses are paid on the OSD scale: ENAs start lower, enrolled nurses in the middle, and professional nurses earn from around R28,000 per month upward, with specialists and managers earning significantly more. Rural allowances and shift pay add to base salaries. See our full nurse salary guide for detailed ranges.</p>
`,
    faqs: [
      { q: 'How long does it take to become a nurse in South Africa?', a: 'One year for an Enrolled Nursing Auxiliary, two years for an Enrolled Nurse, and four years for a Professional Nurse (Bachelor of Nursing).' },
      { q: 'Do nurses need to register?', a: 'Yes. All nurses must register with the South African Nursing Council (SANC) before practising, and renew registration annually.' },
      { q: 'What subjects do I need for nursing?', a: 'For the degree route: a bachelor\'s pass with Life Sciences, and usually Mathematics or Mathematical Literacy. University-specific requirements vary, so check each institution.' },
      { q: 'Is nursing a good career in South Africa?', a: 'Yes. Demand is consistently high, employment is stable, progression is clear, and the qualification is internationally recognised, opening opportunities abroad.' },
    ],
    salarySlug: 'nurse-salary-south-africa',
    educationLinks: ['nsfas-funding-explained', 'university-vs-tvet-which-path-fits-you'],
    resourceLinks: ['common-interview-questions-and-answers', 'cv-writing-guide-south-africa'],
  },
  {
    slug: 'how-to-become-a-teacher',
    title: 'How to Become a Teacher in South Africa: Qualifications, SACE & Career Path',
    h1: 'How to Become a Teacher in South Africa',
    description: 'How to qualify as a teacher in South Africa: B.Ed or PGCE routes, SACE registration, subject choices, public vs private schools, salaries and career progression.',
    occupation: 'Teacher',
    updated: '2026-08-01',
    readMins: 9,
    featured: true,
    intro: 'Teaching is South Africa\'s single largest professional occupation and a career with real social impact. There are two main qualification routes — a Bachelor of Education or a degree plus PGCE — followed by registration with SACE. Here is how to become a teacher, step by step.',
    body: `
<h2>The two qualification routes</h2>
<ol>
  <li><strong>Bachelor of Education (B.Ed.)</strong> — a four-year degree that combines academic subjects with teaching methodology and practical teaching. This is the most direct route for school leavers.</li>
  <li><strong>Degree + PGCE</strong> — complete any relevant bachelor\'s degree, then a one-year Postgraduate Certificate in Education (PGCE). This is the common route for people who decide on teaching after starting another degree.</li>
</ol>
<p>Both routes must include teaching practice, and both lead to registration with the South African Council for Educators (SACE).</p>

<h2>Choosing your phase and subjects</h2>
<p>Teachers specialise in a phase — Foundation Phase (Grades R–3), Intermediate Phase (Grades 4–6), Senior Phase (Grades 7–9) or FET (Grades 10–12). Your subject choices matter enormously for employability. Mathematics, Physical Sciences, Accounting and languages such as isiZulu and English are consistently in short supply, which makes those teachers easier to place. Foundation Phase teaching needs a strong all-round foundation rather than deep subject specialisation.</p>

<h2>Entry requirements</h2>
<p>For a B.Ed. you need a bachelor\'s pass in matric. Universities set their own APS requirements — generally higher for popular institutions — and some phases require specific subjects. For example, B.Ed. Senior/FET Mathematics requires matric Mathematics at a strong level. PGCE admission requires a completed bachelor\'s degree with sufficient credits in the teaching subjects.</p>

<h2>SACE registration</h2>
<p>All educators in public and most private schools must register with SACE. Registration is done once qualified, and annual fees apply. SACE also handles the continuing professional development (CPD) point system teachers must maintain.</p>

<h2>Public vs private schools</h2>
<p>Public school posts are advertised by provincial education departments and paid on the OSD salary scale with pension (GEPF), medical aid subsidy and housing allowance. Private schools set their own packages, which can be higher or lower than the state scale. New teachers often start with temporary or substitute posts before securing a permanent position — persistence and willingness to relocate help considerably.</p>

<h2>Career progression</h2>
<ul>
  <li>Post Level 1: classroom teacher</li>
  <li>Post Level 2: Head of Department</li>
  <li>Post Level 3: Deputy Principal</li>
  <li>Post Level 4: Principal</li>
  <li>Beyond schools: subject advisor, curriculum specialist, district or provincial official</li>
</ul>

<h2>Salary expectations</h2>
<p>Entry-level public school teachers (Post Level 1) typically start from around R18,000–R24,000 per month depending on qualifications (REQV level). HODs, deputies and principals earn progressively more. See our full teacher salary guide for the detailed ranges.</p>
`,
    faqs: [
      { q: 'What is the fastest way to become a teacher in South Africa?', a: 'If you already have a bachelor\'s degree, a one-year PGCE is the fastest route. From matric, the four-year B.Ed. is the most direct path.' },
      { q: 'Do I need SACE registration to teach?', a: 'Yes. SACE registration is required to teach in public schools and most private schools. You register after completing your teaching qualification.' },
      { q: 'Which teaching subjects are in highest demand?', a: 'Mathematics, Physical Sciences, Accounting, and African languages such as isiZulu are consistently in short supply. Teachers with these subjects are typically easier to place.' },
      { q: 'Can I teach with a diploma?', a: 'The minimum qualification for teaching in South Africa is a degree (B.Ed. or degree + PGCE) for most posts. Some ECD practitioner posts accept NQF Level 4–6 ECD qualifications.' },
    ],
    salarySlug: 'teacher-salary-south-africa',
    educationLinks: ['university-vs-tvet-which-path-fits-you', 'nsfas-funding-explained'],
    resourceLinks: ['common-interview-questions-and-answers', 'cover-letter-guide-south-africa'],
  },
  {
    slug: 'how-to-become-an-accountant',
    title: 'How to Become an Accountant in South Africa: Qualifications & Career Path',
    h1: 'How to Become an Accountant in South Africa',
    description: 'Routes to becoming an accountant in South Africa: BCom degrees, professional bodies (SAICA, SAIPA, CIMA, ACCA), articles, and the career path from bookkeeper to CA(SA).',
    occupation: 'Accountant',
    updated: '2026-08-01',
    readMins: 9,
    intro: 'Accounting is one of the most reliable professional careers in South Africa, with demand across every industry. There are several professional routes — from bookkeeping to the Chartered Accountant (CA(SA)) designation — and the route you choose shapes your salary, responsibilities and timeline. Here is how the profession works and how to enter it.',
    body: `
<h2>The accounting career ladder</h2>
<p>South African accounting has distinct professional levels:</p>
<ul>
  <li><strong>Bookkeeper / Accounts clerk</strong> — entry-level, typically an ICB or similar certificate. Handles daily recording of transactions.</li>
  <li><strong>Accountant (SAIPA / BAP(SA))</strong> — a degree plus professional designation. Prepares financial statements, tax and management reports, and advises small and medium businesses.</li>
  <li><strong>Management Accountant (CIMA)</strong> — focuses on costing, budgeting and decision support inside organisations.</li>
  <li><strong>Chartered Accountant CA(SA)</strong> — the SAICA route: a SAICA-accredited degree, CTA (or equivalent), three years of training (articles) and two board exams. The most demanding and best-paid route.</li>
</ul>

<h2>Study routes</h2>
<ol>
  <li><strong>BCom Accounting</strong> at a university — the standard degree route. To pursue CA(SA), the degree must be SAICA-accredited and you continue to CTA/Honours.</li>
  <li><strong>Diploma in Accounting</strong> at a university of technology or TVET NATED N4–N6 in Financial Management — leads to bookkeeping, accounts clerk and assistant accountant roles, with pathways to professional bodies later.</li>
  <li><strong>Professional-body qualifications</strong> — ICB for bookkeeping, and CIMA/ACCA which can be studied part-time while working.</li>
</ul>

<h2>Articles / practical training</h2>
<p>To qualify as a CA(SA), you must complete a three-year training contract (articles) at an accredited training office — an audit firm or an approved financial organisation. SAIPA members complete a structured learnership-style programme of three years. Practical experience is where the theory becomes usable, and competition for articles at top firms is strong — your degree marks matter.</p>

<h2>Who employs accountants?</h2>
<p>Audit firms (the Big Four and mid-tier), banks, insurance companies, retailers, manufacturers, mines, government departments and every medium-to-large business. Accountants also work in practice serving small businesses, and many end up as financial managers, CFOs or entrepreneurs.</p>

<h2>Salary expectations</h2>
<p>Salaries rise steeply with qualification level. Trainee accountants earn a modest salary during articles; newly qualified CAs(SA) command premium packages, and senior financial roles are among the best-paid in the country. Bookkeepers and assistant accountants earn more modestly but the qualification route is shorter.</p>

<h2>Which route should you choose?</h2>
<ul>
  <li>Strong matric maths and top marks, aiming for the best-paid track → SAICA CA(SA) route</li>
  <li>Want a professional designation without the CTA hurdle → SAIPA or CIMA</li>
  <li>Need to start working quickly → ICB bookkeeping or TVET NATED, then build up</li>
</ul>
`,
    faqs: [
      { q: 'What is the difference between a CA(SA) and an accountant?', a: 'A CA(SA) is a Chartered Accountant who completed the SAICA route: accredited degree, CTA, three years of articles and two board exams. General accountants may hold degrees or diplomas with other professional designations. CA(SA) is the most demanding and best-remunerated designation.' },
      { q: 'How long does it take to become a CA(SA)?', a: 'Typically seven years: three years of degree, one year of CTA/Honours, and three years of articles. Some universities offer accelerated routes.' },
      { q: 'Do I need Mathematics for accounting?', a: 'For the CA(SA) route, universities generally require Mathematics at a strong matric level. For diplomas and bookkeeping routes, Mathematical Literacy is often acceptable.' },
      { q: 'Is accounting still a good career?', a: 'Yes. Financial skills remain in steady demand, the career is relatively recession-resistant, and the qualification is portable — South African accountants work all over the world.' },
    ],
    educationLinks: ['university-vs-tvet-which-path-fits-you', 'nsfas-funding-explained'],
    resourceLinks: ['cv-writing-guide-south-africa', 'cover-letter-guide-south-africa'],
    companyLinks: [{ slug: 'standard-bank', label: 'Standard Bank' }, { slug: 'nedbank', label: 'Nedbank' }],
  },
  {
    slug: 'how-to-become-a-data-analyst',
    title: 'How to Become a Data Analyst in South Africa: Skills, Study & Career Path',
    h1: 'How to Become a Data Analyst in South Africa',
    description: 'How to start a data analyst career in South Africa: qualifications, the skills employers actually test (Excel, SQL, Power BI), entry routes and salary expectations.',
    occupation: 'Data Analyst',
    updated: '2026-08-01',
    readMins: 9,
    popular: true,
    intro: 'Data analysis is one of the fastest-growing white-collar careers in South Africa, with demand from banks, insurers, retailers, telcos and tech companies. It is also one of the few high-paying fields where practical skills can outweigh a specific degree. Here is what the role involves and how to enter it.',
    body: `
<h2>What data analysts do</h2>
<p>Data analysts turn raw data into decisions: they pull data from systems, clean and structure it, build reports and dashboards, and explain what the numbers mean for the business. Typical tasks include sales analysis, customer behaviour analysis, fraud detection support, and building the KPI dashboards managers rely on.</p>

<h2>The core skills employers test</h2>
<ul>
  <li><strong>Excel</strong> — pivot tables, lookups, formulas. Still the most tested skill in South African analyst interviews.</li>
  <li><strong>SQL</strong> — querying databases. Essential for any role touching company data.</li>
  <li><strong>Power BI or Tableau</strong> — building dashboards and visualisations.</li>
  <li><strong>Statistics basics</strong> — averages, distributions, significance. Enough to avoid misleading conclusions.</li>
  <li><strong>Communication</strong> — presenting findings to non-technical people is half the job.</li>
</ul>
<p>Python or R are increasingly expected for more advanced roles, but the fundamentals above are where every analyst starts.</p>

<h2>Study routes</h2>
<ol>
  <li><strong>Degree route</strong>: BSc or BCom in statistics, mathematics, computer science, economics, actuarial science, or information systems. Actuarial science is the most competitive but opens the widest doors.</li>
  <li><strong>Shorter route</strong>: an NQF-registered certificate or diploma in data analytics, plus a portfolio of real projects. Many employers value demonstrated SQL and Power BI skills over the name of the qualification.</li>
  <li><strong>Self-taught route</strong>: free and low-cost online courses in SQL and Power BI, then build a portfolio using public datasets. This works when combined with strong evidence of skill.</li>
</ol>

<h2>Getting your first analyst job</h2>
<p>The classic entry point is a junior analyst or graduate programme at a bank, insurer or retailer. Many companies run structured graduate programmes that teach their specific tools. Alternative entry points include data capturer, reporting assistant, or business support roles where you can start producing reports and grow into the analyst title. A portfolio — even dashboards built on public data — makes a real difference at junior level.</p>

<h2>Career progression</h2>
<ul>
  <li>Junior / graduate analyst → Data Analyst → Senior Analyst</li>
  <li>Specialise: Data Scientist (more statistics and machine learning), Data Engineer (building data pipelines), or Analytics Manager (leading teams)</li>
  <li>Industry moves: banking, insurance, retail, telecoms, healthcare, consulting</li>
</ul>

<h2>Salary expectations</h2>
<p>Junior analysts typically start in the R15,000–R25,000 per month range depending on the employer and qualifications. Experienced analysts earn R30,000–R50,000+, and data scientists or specialists earn more. Finance and consulting pay at the top of the range.</p>
`,
    faqs: [
      { q: 'Do I need a degree to become a data analyst in South Africa?', a: 'Not strictly. Many employers hire analysts with diplomas or strong portfolios if SQL and Power BI skills are proven. However, a relevant degree makes the first job much easier to get, and the biggest employers often require one.' },
      { q: 'Which is more important, Python or SQL?', a: 'For an analyst role, SQL. Most South African analyst interviews test SQL before anything else. Python becomes more relevant as you move toward data science.' },
      { q: 'How do I get experience without a job?', a: 'Build a portfolio: download public datasets (e.g. from Stats SA or Kaggle), analyse them, and publish dashboards. Volunteer for reporting tasks in any job you already have. Show evidence rather than certificates.' },
      { q: 'Is data analysis a good career in South Africa?', a: 'Yes. Demand has grown consistently, salaries are above average for graduates, and the skills transfer across industries and countries.' },
    ],
    educationLinks: ['university-vs-tvet-which-path-fits-you'],
    resourceLinks: ['cv-writing-guide-south-africa', 'what-employers-look-for-in-graduates'],
    companyLinks: [{ slug: 'standard-bank', label: 'Standard Bank' }, { slug: 'capitec-bank', label: 'Capitec Bank' }],
  },
  {
    slug: 'careers-without-a-degree',
    title: 'Careers You Can Start Without a Degree in South Africa (2026)',
    h1: 'Careers You Can Start Without a Degree in South Africa',
    description: 'Practical, well-paid careers in South Africa that do not need a university degree: trades, sales, IT support, driving, security management, call centres and more.',
    updated: '2026-08-01',
    readMins: 8,
    popular: true,
    intro: 'A degree is not the only route to a good career. South Africa has strong demand for tradespeople, sales professionals, technicians and operators — many of whom out-earn degree holders. This guide covers the careers with the best realistic prospects that do not require university.',
    body: `
<h2>Skilled trades (artisan careers)</h2>
<p>Artisans are in chronic short supply in South Africa. Becoming a qualified artisan involves a learnership or apprenticeship plus a trade test — you earn while you train instead of paying fees.</p>
<ul>
  <li><strong>Electrician</strong> — domestic, commercial and industrial electrical work. Strong self-employment potential.</li>
  <li><strong>Plumber</strong> — new installations and maintenance, always in demand.</li>
  <li><strong>Welder</strong> — manufacturing, mining and fabrication; coded welders earn well.</li>
  <li><strong>Diesel mechanic / auto mechanic</strong> — vehicle fleets, dealerships and independent workshops.</li>
  <li><strong>Millwright</strong> — the highest-paid artisan trade, combining electrical and mechanical skills.</li>
</ul>

<h2>Transport and logistics</h2>
<ul>
  <li><strong>Code 14 truck driver</strong> — steady demand, with dangerous-goods and cross-border endorsements adding pay.</li>
  <li><strong>Forklift / reach truck operator</strong> — warehouse roles with quick certification.</li>
  <li><strong>Fleet controller / dispatcher</strong> — office-based coordination of vehicles and deliveries.</li>
</ul>

<h2>Sales and customer service</h2>
<ul>
  <li><strong>Retail sales and store management</strong> — large retailers promote from within; store managers earn well.</li>
  <li><strong>Call centre agent</strong> — a common first job, with paths into team leadership and operations.</li>
  <li><strong>Insurance and financial product sales</strong> — commission-based roles where performance drives income; RE and FAIS accreditation is required and is obtained through training.</li>
  <li><strong>Real estate agent</strong> — requires the NQF 4 Real Estate qualification and an internship, then commission-based earnings.</li>
</ul>

<h2>IT and technical support</h2>
<ul>
  <li><strong>IT support technician</strong> — A+ / N+ certifications open doors without a degree.</li>
  <li><strong>Network and fibre technician</strong> — the fibre rollout created steady demand for installers and maintenance techs.</li>
  <li><strong>Junior developer</strong> — harder without a degree, but portfolios and coding bootcamps do work for motivated candidates.</li>
</ul>

<h2>Security and facilities</h2>
<ul>
  <li><strong>Security guard → supervisor → site manager</strong> — PSIRA grading creates a formal progression ladder.</li>
  <li><strong>CCTV and control room operator</strong> — technical security roles with better pay than guarding.</li>
</ul>

<h2>Beauty, food and personal services</h2>
<ul>
  <li><strong>Chef / cook</strong> — hospitality kitchens hire on skill, with head chef roles paying well.</li>
  <li><strong>Hairdresser / beautician</strong> — strong self-employment path after a learnership or college course.</li>
</ul>

<h2>How to start</h2>
<ol>
  <li>Pick a career with real demand (artisan trades are the safest bet).</li>
  <li>Enter through a learnership, apprenticeship or entry-level job — paid training beats unpaid study for these paths.</li>
  <li>Get the required registrations (PSIRA, trade test, Code 14 licence) as early as possible.</li>
  <li>Build income and experience, then upgrade to a qualification part-time if you want management roles later.</li>
</ol>
`,
    faqs: [
      { q: 'What is the best career without a degree in South Africa?', a: 'For reliability, artisan trades such as electrician, plumber and millwright are the strongest choice: chronic demand, paid training routes, and good self-employment potential. Sales and IT support also offer strong paths.' },
      { q: 'Can I earn well without a degree?', a: 'Yes. Qualified artisans, Code 14 drivers with endorsements, successful salespeople, and experienced store or site managers all regularly earn more than many graduates.' },
      { q: 'What is a learnership and how is it different from studying?', a: 'A learnership combines work experience with a formal qualification — you are employed and paid a stipend while you train. It usually ends with an NQF-registered qualification and often a job offer.' },
      { q: 'Are there careers without matric too?', a: 'Some entry points exist without matric (general work, some security and driving roles), but matric — or an NC(V) from a TVET college — unlocks the learnerships and apprenticeships that lead to real careers. Upgrading matric is worth the investment.' },
    ],
    educationLinks: ['tvet-colleges-in-south-africa', 'what-to-do-after-matric'],
    resourceLinks: ['best-careers-without-a-degree-south-africa', 'what-is-a-learnership'],
  },
  {
    slug: 'entry-level-careers-in-south-africa',
    title: 'Entry-Level Careers in South Africa: Where to Start (2026)',
    h1: 'Entry-Level Careers in South Africa: Where to Start',
    description: 'Realistic entry-level career options for South African school leavers and graduates: retail, call centres, administration, trades, security, driving and graduate programmes.',
    updated: '2026-08-01',
    readMins: 7,
    intro: 'Your first job matters less than the direction it points you in. South Africa\'s entry-level market rewards people who start, learn, and move up — in retail, call centres, administration, trades and graduate programmes. Here is an honest overview of where first jobs actually exist and how to use them.',
    body: `
<h2>Where entry-level jobs actually are</h2>
<ul>
  <li><strong>Retail</strong> — cashiers, shop assistants, merchandisers. Large chains (Shoprite, Pick n Pay, Clicks, Mr Price, Woolworths) recruit continuously and promote from within.</li>
  <li><strong>Call centres</strong> — sales and service agents. High turnover means high intake; the work is demanding but builds communication skills.</li>
  <li><strong>Administration</strong> — data capturers, clerks, receptionists, office assistants. Every organisation needs them.</li>
  <li><strong>Security</strong> — guarding with PSIRA grading, with clear progression to supervisor and site manager.</li>
  <li><strong>Driving and logistics</strong> — Code 10/14 driving, delivery work, warehouse roles.</li>
  <li><strong>Hospitality</strong> — waiters, baristas, kitchen staff, front-of-house.</li>
  <li><strong>General work</strong> — cleaning, facilities, construction labouring; often the on-ramp to learnerships.</li>
</ul>

<h2>Graduate and internship programmes</h2>
<p>Banks, insurers, retailers and government departments run structured graduate programmes (12–24 months) with salaries, mentorship and a strong chance of permanent placement. Applications usually open months in advance and are competitive — apply to several at once, and treat the application form as your first interview.</p>

<h2>Learnerships — the underrated option</h2>
<p>Learnerships pay a stipend while you earn a qualification. They exist in almost every sector and are frequently the fastest way from "no experience" to "qualified with a job offer". Check SETA websites, company career pages and government vacancy circulars.</p>

<h2>How to make a first job work for you</h2>
<ol>
  <li>Take jobs that teach transferable skills: customer handling, cash, systems, supervision.</li>
  <li>Ask for extra responsibilities — this is how internal promotions happen.</li>
  <li>Use employer study assistance if offered.</li>
  <li>Keep records of achievements for your next application.</li>
  <li>Move roles every two to three years if you are not progressing.</li>
</ol>

<h2>What employers want at entry level</h2>
<p>Punctuality, reliability, basic numeracy and communication, and a positive attitude. Employers hire attitude and train skill — a clean, well-presented CV and showing up on time genuinely put you ahead of most applicants.</p>
`,
    faqs: [
      { q: 'What is the easiest job to get with no experience in South Africa?', a: 'Retail cashier or shop assistant, call centre agent, security guard and general worker roles have the lowest entry barriers and hire at volume. Register with local stores and staffing agencies, and keep your CV one page.' },
      { q: 'Are government jobs a good option for entry-level applicants?', a: 'Yes. Government internships and learnerships are paid and structured, and entry-level posts (data capturer, admin clerk) are advertised in the DPSA circular. The process is formal — the Z83 form is compulsory — but the opportunities are real.' },
      { q: 'How do I find a learnership?', a: 'Check SETA websites, the DPSA circular, company career pages (banks, retailers, mines), and local newspapers. Apply with a targeted CV and follow each programme\'s application instructions exactly.' },
      { q: 'Should I take any job or wait for the right one?', a: 'Take a job. Income, references and experience compound — and it is easier to find the next job while employed. You can keep applying for better roles while working.' },
    ],
    educationLinks: ['what-to-do-after-matric'],
    resourceLinks: ['how-to-write-your-first-cv-no-experience', 'job-search-tips-south-africa', 'how-to-check-if-a-job-is-legitimate'],
    companyLinks: [{ slug: 'shoprite-group', label: 'Shoprite' }, { slug: 'clicks-group', label: 'Clicks' }],
  },
  {
    slug: 'how-to-become-a-police-officer',
    title: 'How to Become a Police Officer in South Africa (SAPS): Requirements & Process',
    h1: 'How to Become a Police Officer in South Africa',
    description: 'SAPS recruitment requirements, the application and training process, physical and medical standards, salary expectations and career progression in the South African Police Service.',
    occupation: 'Police Officer',
    updated: '2026-08-01',
    readMins: 8,
    intro: 'Joining the South African Police Service is a structured, competitive process — from application through fitness and psychometric tests to basic training. This guide covers the official requirements, what training involves, and what the career looks like.',
    body: `
<h2>Basic requirements</h2>
<p>To apply for SAPS entry-level constable positions, applicants generally must:</p>
<ul>
  <li>Be a South African citizen</li>
  <li>Be at least 18 and under 30 years old (age limits can vary per intake — check the advert)</li>
  <li>Have a matric (senior certificate); additional qualifications help but are not required for entry posts</li>
  <li>Have no criminal record (minor traffic offences may be considered case by case)</li>
  <li>Hold a valid driver\'s licence (at least a learner\'s licence for the driving component; a code B licence is a strong advantage)</li>
  <li>Be medically and physically fit</li>
</ul>

<h2>The application process</h2>
<ol>
  <li>Complete the official SAPS application form during an advertised intake (check the SAPS website and newspapers).</li>
  <li>Submit certified copies of your ID, matric certificate, driver\'s licence and other documents listed in the advert.</li>
  <li>Pass the initial screening: fingerprints and criminal record check.</li>
  <li>Pass the physical fitness assessment, psychometric tests and a medical examination.</li>
  <li>Attend a final selection interview.</li>
  <li>If selected, complete basic police training at a SAPS academy (typically around nine months), which includes law, firearms, physical training and practical policing.</li>
</ol>

<h2>What training involves</h2>
<p>Basic training is residential at a SAPS academy. Recruits receive a training allowance rather than a full salary. The programme covers criminal law, the Criminal Procedure Act, firearms proficiency, self-defence, community policing and field training. After graduation, new constables are deployed to stations for further on-the-job development.</p>

<h2>Salary and benefits</h2>
<p>SAPS members are paid according to public service salary levels, with allowances for standby and dangerous duties. Entry-level constables earn in the range covered by our police officer salary guide. Benefits include the government pension (GEPF), medical aid subsidy and housing allowance.</p>

<h2>Career progression</h2>
<ul>
  <li>Constable → Sergeant → Warrant Officer (commissioned officer path via further training)</li>
  <li>Specialised units: detectives, K9, flying squad, public order policing, forensics, crime intelligence</li>
  <li>Officer ranks: Lieutenant, Captain, Major, Lieutenant Colonel, Colonel and beyond</li>
</ul>
<p>Advancement combines years of service, courses, and promotion exams — and specialised units offer the most interesting long-term careers.</p>
`,
    faqs: [
      { q: 'Can I join SAPS without matric?', a: 'Matric is a standard requirement for entry-level constable posts. If you do not have matric, upgrading through the Department of Basic Education or an NC(V) at a TVET college is the practical first step.' },
      { q: 'How long is SAPS basic training?', a: 'Basic police training is generally around nine months at a SAPS academy, followed by field training at a station.' },
      { q: 'How much do police officers earn in South Africa?', a: 'Entry-level constables are paid on public service salary levels with allowances. See our police officer salary guide for detailed ranges.' },
      { q: 'What disqualifies you from joining SAPS?', a: 'A criminal record, failing the fitness or psychometric tests, visible tattoos that breach policy, and false information in your application are the common disqualifiers.' },
    ],
    salarySlug: 'police-officer-salary-south-africa',
    educationLinks: ['what-to-do-after-matric'],
    resourceLinks: ['how-to-apply-for-government-jobs', 'common-interview-questions-and-answers'],
  },
  {
    slug: 'how-to-become-a-plumber',
    title: 'How to Become a Plumber in South Africa: Training, Trade Test & Career Path',
    h1: 'How to Become a Plumber in South Africa',
    description: 'The route to becoming a qualified plumber in South Africa: TVET and apprenticeship training, the trade test, PIRB registration, salary expectations and self-employment.',
    occupation: 'Plumber',
    updated: '2026-08-01',
    readMins: 8,
    intro: 'Plumbing is a trade with permanent demand — every building, home and factory needs it, and qualified plumbers are scarce. Like other artisan trades, the route runs through a learnership or apprenticeship and ends in a trade test. Here is the full path.',
    body: `
<h2>What plumbers do</h2>
<p>Plumbers install and repair water supply, drainage and sanitation systems: pipes, geysers, basins, toilets, gutters and industrial piping. Work ranges from new-home installations to emergency call-outs, maintenance contracts and large construction projects.</p>

<h2>Entry requirements</h2>
<p>You can start from Grade 9 through a TVET college NC(V) route, but matric with Mathematics is strongly recommended for the NATED route and for apprenticeship applications. Practical aptitude, physical fitness and reliability matter as much as academics.</p>

<h2>Training routes</h2>
<ol>
  <li><strong>Apprenticeship</strong> — the classic route: work under a qualified plumber while attending training blocks. Funded by the employer with SETA support, ending in the trade test.</li>
  <li><strong>TVET college route</strong> — study Plumbing N1–N6 or NC(V) Civil Engineering and Building Construction, then complete the practical component through workplace experience or a learnership.</li>
  <li><strong>Learnership route</strong> — structured learnerships combine the qualification and workplace experience with a stipend.</li>
</ol>

<h2>Trade test and registration</h2>
<p>Qualification requires passing the national trade test at an accredited centre. After the trade test you can register with the Plumbing Industry Registration Board (PIRB), which is increasingly required to issue Certificates of Compliance for plumbing work — the equivalent of the electrical CoC. Registered plumbers doing compliant work are the ones insurers and property buyers recognise.</p>

<h2>Salary expectations</h2>
<p>Apprentices earn a training allowance. Qualified plumbers typically earn from around R12,000–R20,000 per month employed, with experienced and specialised plumbers earning more. Self-employed plumbers set their own rates and can earn substantially more once established. See our plumber salary guide for ranges.</p>

<h2>Career progression</h2>
<ul>
  <li>Apprentice → Qualified plumber (trade tested + PIRB registered)</li>
  <li>Specialise: solar water heating, industrial piping, gas installation (with additional registration)</li>
  <li>Site supervisor → project manager → estimator</li>
  <li>Start your own plumbing business — one of the most common artisan entrepreneur paths</li>
</ul>
`,
    faqs: [
      { q: 'How long does it take to qualify as a plumber?', a: 'Typically three to four years: theory (N1–N6 or equivalent) plus workplace experience, then the trade test.' },
      { q: 'Do plumbers need to register?', a: 'Qualified plumbers should register with the Plumbing Industry Registration Board (PIRB) to legally issue Certificates of Compliance. Registration follows the trade test.' },
      { q: 'Can plumbers earn good money in South Africa?', a: 'Yes. Employed qualified plumbers earn steadily, and self-employed plumbers with a good reputation can earn considerably more. Emergency and after-hours work commands premium rates.' },
      { q: 'Is plumbing a good career choice?', a: 'Yes. Demand is constant, the trade cannot be automated away, and the skills travel well — South African plumbers work in the UK, Australia and the Middle East.' },
    ],
    salarySlug: 'plumber-salary-south-africa',
    educationLinks: ['tvet-colleges-in-south-africa', 'n4-n6-nated-programmes-explained'],
    resourceLinks: ['what-is-a-learnership', 'cv-writing-guide-south-africa'],
  },
  {
    slug: 'how-to-become-a-security-guard',
    title: 'How to Become a Security Guard in South Africa: PSIRA Grades & Career Path',
    h1: 'How to Become a Security Guard in South Africa',
    description: 'How to become a registered security guard in South Africa: PSIRA grading, training requirements, where to work, salary expectations and progression to supervisor and manager.',
    occupation: 'Security Guard',
    updated: '2026-08-01',
    readMins: 7,
    intro: 'Private security is one of South Africa\'s largest employers, and it is an accessible first career with a formal grading ladder. The entry point is PSIRA registration — without it you cannot legally work as a guard. Here is how the system works and how to progress through it.',
    body: `
<h2>PSIRA grading explained</h2>
<p>The Private Security Industry Regulatory Authority (PSIRA) grades security officers from E to A. Each grade comes with training and determines what duties you may perform:</p>
<ul>
  <li><strong>Grade E</strong> — entry level: access control, basic guarding, patrols under supervision</li>
  <li><strong>Grade D</strong> — general guarding and patrol duties</li>
  <li><strong>Grade C</strong> — supervision of guards, site responsibility</li>
  <li><strong>Grade B</strong> — site manager level</li>
  <li><strong>Grade A</strong> — senior management level</li>
</ul>
<p>Armed response, cash-in-transit and close protection require additional, specialised training and registrations.</p>

<h2>Getting started</h2>
<ol>
  <li>Meet the basics: be at least 18, a South African citizen or permanent resident, with no serious criminal record. Matric helps but is not required for Grade E entry at all training providers.</li>
  <li>Complete Grade E (or D) training at a PSIRA-accredited training provider — the course covers the law, access control, communication and basic emergency procedures, and takes a few weeks.</li>
  <li>Register with PSIRA — your employer usually assists, and the registration fee applies.</li>
  <li>Apply to security companies. Large firms (Fidelity, G4S, and many regional companies) recruit continuously.</li>
</ul>

<h2>Where security officers work</h2>
<p>Shopping centres, office parks, residential estates, factories, mines, schools, events and government facilities. Working conditions vary widely — a corporate office day shift differs enormously from a 12-hour night shift at a construction site. Choose employers and sites deliberately.</p>

<h2>Salary expectations</h2>
<p>Entry-level guards earn around the minimum wage for the sector (set by the security sectoral determination), with higher grades and specialised roles earning more. Supervisors and site managers earn progressively better packages. See our security guard salary guide for ranges.</p>

<h2>Progressing in security</h2>
<ul>
  <li>Upgrade your grade (D → C → B) through accredited training as you gain experience</li>
  <li>Specialise: armed response, CCTV/control room operations, cash-in-transit, close protection</li>
  <li>Move into site supervision and then operations management</li>
  <li>Study further: security management diplomas open corporate security management roles</li>
</ul>
`,
    faqs: [
      { q: 'How do I get a PSIRA certificate?', a: 'Complete training at a PSIRA-accredited provider for the grade you want, then register with PSIRA (usually through your employer). The certificate is issued once registration is approved.' },
      { q: 'How much does security training cost?', a: 'Grade E/D training costs vary by provider but is relatively affordable, and many employers offer it as part of recruitment or deduct it over the first months of employment. Always verify the provider is PSIRA-accredited.' },
      { q: 'Can I work as a security guard without matric?', a: 'Yes. Grade E and D entry-level training does not universally require matric, though some employers prefer it. Matric becomes more important at supervisor and management level.' },
      { q: 'Is security a stable career?', a: 'Yes. Demand for guarding is structural in South Africa, and the grading system provides a formal progression path. The hours can be long and conditions vary, so choosing a good employer matters.' },
    ],
    salarySlug: 'security-guard-salary-south-africa',
    educationLinks: ['what-to-do-after-matric'],
    resourceLinks: ['cv-writing-guide-south-africa', 'how-to-check-if-a-job-is-legitimate'],
    companyLinks: [{ slug: 'fidelity-services-group', label: 'Fidelity Services Group' }],
  },
];
