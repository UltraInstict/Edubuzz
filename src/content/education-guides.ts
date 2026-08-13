/**
 * Education guides — South African education & study pathway content.
 *
 * Static content collection rendered by /education/[slug]. Written for South
 * African users; figures are indicative and general, not invented statistics.
 */

export interface EducationFAQ {
  q: string;
  a: string;
}

export interface EducationGuide {
  slug: string;
  title: string;
  h1: string;
  description: string;
  updated: string;
  readMins: number;
  intro: string;
  body: string;
  faqs: EducationFAQ[];
  careerLinks: string[];   // related career guide slugs
  resourceLinks: string[]; // related resource article slugs
}

export const EDUCATION_GUIDES: EducationGuide[] = [
  {
    slug: 'tvet-colleges-in-south-africa',
    title: 'TVET Colleges in South Africa: Full Guide (2026)',
    h1: 'TVET Colleges in South Africa: The Complete Guide',
    description: 'What TVET colleges are, the 50 registered public TVET colleges, NATED and NC(V) programmes, how to apply, NSFAS funding and what TVET qualifications are worth.',
    updated: '2026-08-01',
    readMins: 11,
    intro: 'Technical and Vocational Education and Training (TVET) colleges are South Africa\'s largest post-school education system, with 50 registered public colleges spread across every province. They offer practical, career-focused qualifications that lead directly into jobs, apprenticeships or further study. This guide explains what TVET colleges offer, how to choose one, how to apply, and how funding works.',
    body: `
<h2>What is a TVET college?</h2>
<p>TVET colleges are public institutions that provide vocational and occupational training. They focus on practical skills for specific careers — from engineering and IT to business, hospitality and the arts — rather than the academic theory emphasised at universities. Most programmes are registered on the National Qualifications Framework (NQF), which means they are nationally recognised by employers.</p>

<h2>The two main qualification types</h2>
<ul>
  <li><strong>NC(V) — National Certificate (Vocational)</strong>: Levels 2–4, usually three years full-time after Grade 9. Mixes theory and practical work, and can lead to university study if you pass at a high enough level.</li>
  <li><strong>NATED (Report 191) N4–N6</strong>: Post-matric programmes, usually 18 months of theory plus 18–24 months of workplace experience to earn a National Diploma. Popular in engineering, business and services fields.</li>
</ul>
<p>Many colleges also offer shorter occupational certificates and skills programmes aligned to the Quality Council for Trades and Occupations (QCTO).</p>

<h2>How many TVET colleges are there?</h2>
<p>There are 50 registered public TVET colleges in South Africa, operating across hundreds of campuses. Examples include False Bay TVET College and Northlink College (Western Cape), Ekurhuleni East and South West Gauteng colleges (Gauteng), Coastal and Thekwini colleges (KwaZulu-Natal), and Central Johannesburg College. Every province has at least several public colleges.</p>

<h2>What can you study at a TVET college?</h2>
<p>Common fields include:</p>
<ul>
  <li>Engineering studies: Electrical, Mechanical, Civil, Chemical</li>
  <li>Business studies: Management, Marketing, Financial Management, HR</li>
  <li>Information Technology: Computer Systems, Programming</li>
  <li>Hospitality, Tourism and Travel</li>
  <li>Education and Development: Early Childhood Development, Educare</li>
  <li>Artisan trades leading to apprenticeships and trade tests</li>
</ul>

<h2>Entry requirements</h2>
<p>For NC(V) programmes you generally need a Grade 9 pass, although Grade 11 or matric is strongly recommended for many fields. For N4 entry you need a National Senior Certificate (matric) or an NC(V) Level 4. Some programmes have subject requirements — for example, engineering fields often require Mathematics and Physical Sciences.</p>

<h2>How to apply</h2>
<ol>
  <li>Choose a college and programme. Check the college website or the DHET list of registered colleges to confirm the institution is accredited.</li>
  <li>Apply online through the college's own application portal, or in person at a campus. Most colleges have specific application windows, usually opening mid-year for the following academic year.</li>
  <li>Prepare your documents: certified ID copy, latest results, proof of address and, if applicable, proof of household income for NSFAS.</li>
  <li>Apply for NSFAS funding if you qualify — TVET students from households earning under R350,000 a year generally qualify for full bursaries.</li>
  <li>Register once accepted, and note the campus, class times and trimester dates.</li>
</ol>

<h2>Costs and funding</h2>
<p>TVET college fees are significantly lower than university fees, but they still vary by college and programme. NSFAS bursaries cover tuition, accommodation or transport, and learning materials for qualifying students. Many colleges also offer payment plans. Always check that the college is one of the 50 registered public colleges — private "colleges" with similar names are not automatically accredited.</p>

<h2>What happens after a TVET qualification?</h2>
<p>TVET graduates typically follow one of three paths: enter the workplace directly, complete the workplace component of a NATED diploma to qualify for a National Diploma, or continue to a university of technology for further study. TVET qualifications are well regarded for practical roles, especially in engineering, trades and business support.</p>
`,
    faqs: [
      { q: 'Is a TVET college the same as a university?', a: 'No. Universities focus on academic degrees, while TVET colleges focus on vocational and occupational training for specific careers. Both qualifications are nationally recognised, and TVET graduates can progress to university study in many cases.' },
      { q: 'Can I study at a TVET college without matric?', a: 'Yes. NC(V) programmes accept learners from Grade 9 onwards, and you can earn an NQF Level 4 qualification (equivalent to matric) through the NC(V) route. NATED N4 programmes normally require matric.' },
      { q: 'Does NSFAS pay for TVET college fees?', a: 'Yes. NSFAS provides bursaries to qualifying TVET students, including those doing NC(V) and NATED programmes. Eligibility is based mainly on household income, which must generally be under R350,000 per year.' },
      { q: 'How long does a TVET qualification take?', a: 'NC(V) programmes typically take three years. NATED programmes take about 18 months of theory (N4–N6) plus 18–24 months of workplace experience to complete the full National Diploma.' },
    ],
    careerLinks: ['how-to-become-an-electrician', 'how-to-become-a-plumber', 'careers-without-a-degree'],
    resourceLinks: ['tvet-college-application-guide', 'nsfas-application-guide', 'tvet-colleges-and-nsfas-guide'],
  },
  {
    slug: 'nsfas-funding-explained',
    title: 'NSFAS Funding Explained: How to Apply (2026)',
    h1: 'NSFAS Funding Explained: How to Apply and Qualify',
    description: 'How NSFAS works, who qualifies for NSFAS funding, what it covers, how to apply online, common mistakes to avoid, and what happens after you are approved.',
    updated: '2026-08-01',
    readMins: 9,
    intro: 'The National Student Financial Aid Scheme (NSFAS) is the government bursary programme that funds higher education for students from poor and working-class households. If you qualify, NSFAS covers your fees and provides living allowances — and unlike a loan, you do not repay the bursary if you pass. Here is exactly how it works and how to apply.',
    body: `
<h2>What NSFAS covers</h2>
<p>For approved students, NSFAS typically covers:</p>
<ul>
  <li>Registration and tuition fees, paid directly to the institution</li>
  <li>Accommodation allowance (actual cost up to a capped amount, or a private accommodation allowance)</li>
  <li>Transport allowance for students living further than a set distance from campus</li>
  <li>Learning material allowance</li>
  <li>Personal care allowance</li>
</ul>
<p>TVET college students are funded for NC(V) and NATED (Report 191) programmes; university students are funded for undergraduate degrees and some postgraduate qualifications such as PGCE.</p>

<h2>Who qualifies?</h2>
<p>The core requirement is a combined household income of R350,000 or less per year. Applicants who receive SASSA grants qualify automatically. You must be a South African citizen, and you must be registered (or accepted) at a public university or TVET college for an approved qualification. NSFAS does not fund students at private institutions or those doing second qualifications in most cases.</p>

<h2>How to apply</h2>
<ol>
  <li>Create a <strong>myNSFAS</strong> account on the official NSFAS website or mobile app.</li>
  <li>Complete the online application with your ID number, contact details and household information.</li>
  <li>Upload or submit supporting documents: certified ID copies for you and your parents or guardian, proof of household income (payslips, pension statements or an affidavit if unemployed), and your latest results.</li>
  <li>Consent to NSFAS verifying your information with third parties such as SARS, the Department of Home Affairs and SASSA.</li>
  <li>Submit before the application deadline — late applications are generally not considered.</li>
</ol>
<p>Applications usually open in the final quarter of the year for the following academic year. NSFAS announces the exact dates each year.</p>

<h2>Common mistakes that get applications rejected</h2>
<ul>
  <li>Submitting after the deadline</li>
  <li>Using someone else's ID or phone number for the myNSFAS account</li>
  <li>Failing to declare all household income, or documents that don't match the declared income</li>
  <li>Applying for a qualification NSFAS does not fund</li>
  <li>Not accepting the bursary agreement online after approval</li>
</ul>

<h2>Do you have to repay NSFAS?</h2>
<p>The NSFAS bursary is not repaid as long as you complete your qualification within the prescribed period. Historically NSFAS also provided loans (which were repaid once you started earning above a threshold), but the current full-bursary model applies to qualifying students. Always read your specific funding agreement carefully.</p>

<h2>What happens after approval?</h2>
<p>You sign a Bursary Agreement online, after which NSFAS pays your fees and allowances directly. Allowances are usually paid monthly through the institution or directly into your bank account. Keep your academic record on track — continued funding depends on meeting the institution's progression rules.</p>
`,
    faqs: [
      { q: 'Who should not apply for NSFAS?', a: 'Students whose household income exceeds R350,000 per year generally do not qualify, nor do students at private institutions or those studying unaccredited qualifications. Check the NSFAS eligibility rules before applying.' },
      { q: 'Can I apply for NSFAS if I am a SASSA recipient?', a: 'Yes. SASSA recipients automatically meet the means test and are strongly encouraged to apply — the process is simplified for these applicants.' },
      { q: 'Does NSFAS fund TVET college students?', a: 'Yes. NSFAS funds students at the 50 public TVET colleges for NC(V) and NATED programmes, covering fees, allowances and materials.' },
      { q: 'What documents do I need for my NSFAS application?', a: 'A certified copy of your ID, ID copies of parents or guardian, proof of household income (or an affidavit if there is no income), and your latest academic results.' },
    ],
    careerLinks: ['how-to-become-a-teacher', 'how-to-become-a-nurse', 'careers-without-a-degree'],
    resourceLinks: ['nsfas-application-guide', 'tvet-college-application-guide'],
  },
  {
    slug: 'n4-n6-nated-programmes-explained',
    title: 'N4–N6 NATED Programmes Explained (2026)',
    h1: 'N4–N6 NATED Programmes Explained',
    description: 'How the NATED (Report 191) N4–N6 system works, the difference between N4 and NC(V), workplace experience requirements, and how to convert N6 into a National Diploma.',
    updated: '2026-08-01',
    readMins: 8,
    intro: 'The NATED N4–N6 system is one of South Africa\'s most established study routes, especially popular for engineering, business and technical careers. It works differently from a degree: you study in three six-month stages (N4, N5, N6) and then complete workplace experience to earn a full National Diploma. This guide explains the system step by step.',
    body: `
<h2>What is a NATED qualification?</h2>
<p>NATED programmes, formally called Report 191 programmes, are offered at TVET colleges. They are workplace-oriented qualifications designed to prepare you for a specific career. Each "N level" is a six-month study phase, and the three levels build on one another: N4 first, then N5, then N6.</p>

<h2>N4–N6 vs NC(V)</h2>
<ul>
  <li><strong>NATED N4–N6</strong>: For matric holders. Six months per level of classroom study, followed by workplace experience. Leads to a National Diploma (NQF Level 6) once the practical component is complete.</li>
  <li><strong>NC(V)</strong>: A three-year school-like qualification from Grade 9 upwards, mixing theory and practical work. Leads to an NQF Level 4 certificate equivalent to matric.</li>
</ul>
<p>Both are recognised, but they suit different starting points. If you have matric and want a focused career qualification, NATED is usually the faster route.</p>

<h2>What can you study?</h2>
<p>Popular NATED fields include:</p>
<ul>
  <li>Engineering Studies: Electrical, Mechanical, Civil, Chemical</li>
  <li>Business Studies: Business Management, Financial Management, Marketing, Human Resources</li>
  <li>Information Technology</li>
  <li>Hospitality and Catering Services</li>
  <li>Tourism</li>
  <li>Educare (Early Childhood Development)</li>
</ul>

<h2>Entry requirements</h2>
<p>To start N4 you generally need a National Senior Certificate (matric), or an NC(V) Level 4, or an equivalent qualification. Some fields recommend specific matric subjects — Engineering, for example, benefits strongly from Mathematics and Physical Sciences. Individual colleges may set additional requirements, so confirm with the college you plan to attend.</p>

<h2>The workplace experience component</h2>
<p>After completing N6, you need 18–24 months of relevant workplace experience to convert your certificates into a full National Diploma. This is the step many students find hardest — colleges do not place you automatically. Strategies that help:</p>
<ul>
  <li>Apply for learnerships, apprenticeships and internships in your field</li>
  <li>Use your college's work-integrated learning office if one exists</li>
  <li>Network with employers in your area and ask about in-service training</li>
  <li>Look at YES programme and SETA-funded work experience opportunities</li>
</ul>

<h2>Can N6 lead to a degree?</h2>
<p>A completed NATED National Diploma is rated at NQF Level 6. Universities and universities of technology may grant credit for it towards a related degree or advanced diploma, but credit policies differ between institutions — check directly with the institution's admissions office.</p>

<h2>Funding</h2>
<p>NATED programmes at public TVET colleges are funded by NSFAS for qualifying students, including the theory phase. Fees are generally much lower than university fees.</p>
`,
    faqs: [
      { q: 'What is the difference between N4 and a diploma?', a: 'N4 is the first six-month stage of a NATED programme. A National Diploma is only awarded after you complete N4, N5 and N6 plus the required workplace experience.' },
      { q: 'Can I do N4 without matric?', a: 'Generally no — N4 entry requires matric or an equivalent such as NC(V) Level 4. If you do not have matric, the NC(V) route may be a better starting point.' },
      { q: 'How long does N4 to National Diploma take?', a: 'About 18 months of classroom study (N4–N6) plus 18–24 months of workplace experience. In total, usually three to four years.' },
      { q: 'Do employers take NATED qualifications seriously?', a: 'Yes, particularly in engineering, technical and business support roles. The combination of theory plus workplace experience is well regarded, especially when the full National Diploma is completed.' },
    ],
    careerLinks: ['how-to-become-an-electrician', 'how-to-become-a-plumber', 'how-to-become-an-accountant'],
    resourceLinks: ['tvet-college-application-guide', 'what-is-a-learnership'],
  },
  {
    slug: 'university-vs-tvet-which-path-fits-you',
    title: 'University vs TVET College: Which Path Fits You? (2026)',
    h1: 'University vs TVET College: Which Path Fits You?',
    description: 'Compare universities and TVET colleges in South Africa: costs, duration, entry requirements, career outcomes and funding. Decide which post-matric path fits your goals.',
    updated: '2026-08-01',
    readMins: 8,
    intro: 'After matric, the biggest decision is what kind of institution to study at. Universities and TVET colleges both offer recognised qualifications, but they are built for different goals. This guide compares them honestly so you can choose the path that fits your strengths, budget and career plans.',
    body: `
<h2>The core difference</h2>
<p>Universities focus on academic knowledge, research and professional degrees. TVET colleges focus on practical, occupational skills for specific careers. Neither is "better" — they serve different purposes, and many careers only need one or the other.</p>

<h2>Comparing the two routes</h2>
<ul>
  <li><strong>Duration</strong>: A university degree takes three to four years (more for some professions). A TVET NC(V) takes three years; a NATED National Diploma takes three to four years including workplace experience.</li>
  <li><strong>Cost</strong>: University fees are substantially higher. TVET fees are lower, and NSFAS funding covers most qualifying TVET students fully.</li>
  <li><strong>Entry requirements</strong>: Universities require matric with degree or diploma endorsement and specific subjects for many programmes. TVET colleges accept learners from Grade 9 (NC(V)) or matric (NATED).</li>
  <li><strong>Learning style</strong>: Universities are theory-heavy with lectures and exams. TVET is practical, with workshops, simulations and workplace components.</li>
  <li><strong>Career outcomes</strong>: Degrees are needed for regulated professions like medicine, law, accounting (CA route), engineering (PrEng) and teaching. TVET qualifications lead directly into technical, trade, business and support roles.</li>
</ul>

<h2>Choose university if...</h2>
<ul>
  <li>You meet the admission requirements for the degree you want</li>
  <li>Your target career legally requires a degree (doctor, lawyer, teacher, chartered accountant, professional engineer)</li>
  <li>You enjoy academic study and can commit to several years of it</li>
  <li>You plan to do postgraduate study</li>
</ul>

<h2>Choose a TVET college if...</h2>
<ul>
  <li>You want practical skills and faster entry into the job market</li>
  <li>University fees are out of reach and NSFAS-eligible TVET study suits you</li>
  <li>You did not meet university entry requirements but still want a recognised qualification</li>
  <li>You are targeting a trade or technical career (electrician, plumber, welder, business support)</li>
</ul>

<h2>Can you switch paths later?</h2>
<p>Yes. NC(V) Level 4 holders can apply to universities for selected programmes, and TVET graduates can articulate into universities of technology. University graduates can also do short occupational programmes at TVET colleges to add practical skills. The education system allows movement, though credit transfer depends on the institutions involved.</p>

<h2>Funding comparison</h2>
<p>NSFAS funds students at both universities and TVET colleges, using the same R350,000 household income threshold. Because TVET fees are lower, NSFAS funding goes further there. Universities also offer merit bursaries and scholarships from private funders; TVET students can access SETA-funded learnerships that pay a stipend while you train.</p>
`,
    faqs: [
      { q: 'Is a TVET qualification respected by employers?', a: 'Yes, especially for practical and technical roles. Employers in engineering, trades, business and hospitality actively recruit TVET graduates, and the workplace component of NATED diplomas is valued experience.' },
      { q: 'Can I go to university after TVET college?', a: 'In many cases yes. NC(V) Level 4 graduates can apply to universities (requirements vary by institution), and NATED diploma holders may receive credit towards related degrees at universities of technology.' },
      { q: 'Which is cheaper, university or TVET?', a: 'TVET college is significantly cheaper in almost every field. NSFAS covers most qualifying students at both, but TVET fees are lower overall.' },
      { q: 'Do I need Mathematics for TVET engineering?', a: 'It is strongly recommended. Engineering programmes at TVET colleges typically require or prefer Mathematics and Physical Sciences, and the coursework assumes these foundations.' },
    ],
    careerLinks: ['how-to-become-an-electrician', 'how-to-become-a-teacher', 'entry-level-careers-in-south-africa'],
    resourceLinks: ['tvet-colleges-and-nsfas-guide', 'graduate-jobs-vs-learnerships'],
  },
  {
    slug: 'what-to-do-after-matric',
    title: 'What to Do After Matric: Your Options Explained (2026)',
    h1: 'What to Do After Matric: All Your Options Explained',
    description: 'Every realistic path after matric in South Africa: university, TVET college, learnerships, apprenticeships, entry-level jobs, entrepreneurship and upgrading results.',
    updated: '2026-08-01',
    readMins: 9,
    intro: 'Matric done — what now? The options are wider than most school leavers realise: universities, TVET colleges, learnerships, apprenticeships, work, or improving your results. This guide walks through each path, what it requires, and who it suits best.',
    body: `
<h2>Option 1: University</h2>
<p>If you have a bachelor\'s pass and meet the specific subject and APS requirements for your chosen degree, university is the classic route. Degrees are essential for regulated professions (teaching, medicine, law, engineering) and valued in fields like finance, IT and science. Expect three to four years of study, significant fees, and competitive entry at popular institutions.</p>

<h2>Option 2: TVET college</h2>
<p>TVET colleges offer NC(V) and NATED (N4–N6) programmes in practical fields. Fees are lower, entry is more accessible, and qualifications lead directly into trades, technical work and business support roles. This is the fastest route to a recognised career qualification for many school leavers.</p>

<h2>Option 3: Learnerships and apprenticeships</h2>
<p>A learnership combines a formal qualification with paid work experience — you earn a stipend while you learn, and you exit with an NQF-registered qualification. Apprenticeships work the same way for trades (electrician, plumber, welder, millwright), ending in a trade test and artisan status. Both are funded by employers and SETAs, and they are among the best value paths available.</p>

<h2>Option 4: Work</h2>
<p>Entry-level jobs in retail, hospitality, call centres, security and general work do not require post-school qualifications. Starting work gives you income and experience while you decide on further study. Many large employers offer internal learnerships and study assistance to staff — a route many people underestimate.</p>

<h2>Option 5: Upgrade your matric results</h2>
<p>If your results were not what you needed, you can rewrite specific subjects through the Department of Basic Education\'s supplementary exams or register for a matric upgrade programme at an accredited institution. Upgrading Mathematics or Physical Sciences often unlocks university or TVET engineering options that were previously closed.</p>

<h2>Option 6: Start a business</h2>
<p>Entrepreneurship is a legitimate path, particularly in services, trades and informal retail. Youth-focused programmes such as the NYDA and SEDA offer business support, and many TVET colleges include entrepreneurship modules. Start small, validate demand, and reinvest early profits.</p>

<h2>How to decide</h2>
<ol>
  <li>Be honest about your results and what they qualify you for.</li>
  <li>Work backwards from a career: find people doing the job you want and check what qualification they actually needed.</li>
  <li>Consider your budget honestly — including the cost of delaying income.</li>
  <li>Apply early and to multiple options; you can decline offers later.</li>
  <li>Remember no path is final: TVET graduates reach university, workers become learners, and apprentices become business owners.</li>
</ol>
`,
    faqs: [
      { q: 'What should I do if I failed matric?', a: 'You can rewrite failed subjects through the supplementary exams or a registered matric upgrade programme. In the meantime, NC(V) programmes at TVET colleges accept learners from Grade 9, so you can start a recognised qualification without matric.' },
      { q: 'Are learnerships better than studying?', a: 'For many people, yes. Learnerships pay a stipend while you earn a recognised qualification and real experience — no fees and no debt. They suit practical careers well, though some professions still require a full degree.' },
      { q: 'How soon after matric should I apply to university or college?', a: 'Applications usually open the year before you study, often closing mid-year. If you have just finished matric, apply immediately for the next intake and also register for NSFAS during its application window.' },
      { q: 'Can I work and study at the same time?', a: 'Yes. Many TVET colleges offer part-time or trimester-based study, and universities offer distance or part-time options for some qualifications. Learnerships are designed specifically around working while studying.' },
    ],
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree', 'how-to-become-an-electrician'],
    resourceLinks: ['graduate-jobs-vs-learnerships', 'how-to-write-your-first-cv-no-experience'],
  },
];
