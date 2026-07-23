/**
 * Career resource articles — content registry.
 *
 * Data-driven so a single template (/resources/[slug]) renders every guide with
 * consistent SEO (Article + FAQ + Breadcrumb schema), internal linking, and ad
 * placements. Add an entry here and it is automatically live + in the sitemap.
 *
 * Content is original, written for South African job seekers. No scraping.
 */

export type ResourceCategoryId =
  | 'cv'
  | 'interview'
  | 'cover-letter'
  | 'learnership'
  | 'internship'
  | 'government'
  | 'tvet'
  | 'career'
  | 'job-search';

export interface ResourceFAQ {
  q: string;
  a: string;
}

export interface ResourceArticle {
  slug: string;
  title: string;        // <title> / SEO title
  h1: string;           // page heading
  description: string;  // meta description
  category: ResourceCategoryId;
  updated: string;      // yyyy-mm-dd
  readMins: number;
  featured?: boolean;
  popular?: boolean;
  categorySlug?: string; // maps to a job category slug for related-jobs linking
  intro: string;         // lead paragraph HTML
  body: string;          // article body HTML
  faqs?: ResourceFAQ[];
}

export interface ResourceCategoryMeta {
  id: ResourceCategoryId;
  label: string;
  blurb: string;
}

export const RESOURCE_CATEGORIES: ResourceCategoryMeta[] = [
  { id: 'cv', label: 'CV & Resumes', blurb: 'Write a CV that gets shortlisted by South African employers.' },
  { id: 'interview', label: 'Interviews', blurb: 'Prepare, answer confidently, and make a strong impression.' },
  { id: 'cover-letter', label: 'Cover Letters', blurb: 'Cover letters and application emails that get read.' },
  { id: 'learnership', label: 'Learnerships', blurb: 'Earn a stipend while you gain an accredited qualification.' },
  { id: 'internship', label: 'Internships & Graduates', blurb: 'Graduate programmes, internships and in-service training.' },
  { id: 'government', label: 'Government Jobs', blurb: 'DPSA, municipality, provincial and SOE application guides.' },
  { id: 'tvet', label: 'TVET & Funding', blurb: 'TVET colleges, NSFAS funding and artisan pathways.' },
  { id: 'career', label: 'Career Guides', blurb: 'How to build a career in South Africa\u2019s biggest sectors.' },
  { id: 'job-search', label: 'Job Search Tips', blurb: 'Search smarter, avoid scams, and land interviews faster.' },
];

export const ARTICLES: ResourceArticle[] = [
  {
    slug: 'cv-writing-guide-south-africa',
    title: 'CV Writing Guide for South Africa (2026) — Templates & Examples',
    h1: 'How to Write a CV for South Africa',
    description: 'A step-by-step CV writing guide for South African job seekers. Learn the right structure, what to include, ATS tips, and common mistakes to avoid.',
    category: 'cv',
    updated: '2026-07-01',
    readMins: 9,
    featured: true,
    popular: true,
    intro: 'Your CV is the first thing an employer sees, and in a competitive South African job market it has seconds to make an impression. This guide walks you through exactly how to structure a CV that recruiters and applicant tracking systems (ATS) actually read.',
    body: `
<h2>What a South African CV should include</h2>
<p>Keep your CV clear and easy to scan. Most local employers expect a two to three page document with the following sections, in this order:</p>
<ul>
  <li><strong>Personal details</strong> — full name, city, cellphone number and a professional email address. You may include your ID number and driver's licence code, but you are not obliged to add a photo, date of birth or marital status.</li>
  <li><strong>Professional summary</strong> — three or four lines describing who you are, your key strengths and what you are looking for.</li>
  <li><strong>Work experience</strong> — listed newest first, with your job title, employer, dates and three to five bullet points of what you achieved.</li>
  <li><strong>Education and qualifications</strong> — your matric, plus any diplomas, degrees or certificates and the institution.</li>
  <li><strong>Skills</strong> — a short list of practical and soft skills relevant to the role.</li>
  <li><strong>References</strong> — two contactable referees, or the line "References available on request".</li>
</ul>

<h2>Write achievements, not duties</h2>
<p>Recruiters already know what a cashier or an admin clerk does. What sets you apart is the result you delivered. Instead of "responsible for handling customers", write "served an average of 120 customers a day and balanced the till to the cent every shift". Use numbers wherever you honestly can.</p>

<h2>Beat the ATS</h2>
<p>Larger employers and most ATS connectors screen CVs with software before a human sees them. To get through:</p>
<ul>
  <li>Save your CV as a PDF unless the advert asks for Word.</li>
  <li>Use standard headings like "Work Experience" and "Education".</li>
  <li>Mirror keywords from the advert — if it says "SAIPA" or "Code 14", use those exact words if they apply to you.</li>
  <li>Avoid text boxes, tables and images, which many systems cannot read.</li>
</ul>

<h2>Tailor every application</h2>
<p>A generic CV sent to 50 jobs performs worse than a focused CV sent to 10. Read the advert, pick out the key requirements, and make sure the top third of your CV speaks directly to them.</p>

<h2>Common CV mistakes to avoid</h2>
<ul>
  <li>Spelling and grammar errors — always proofread, or ask someone to check.</li>
  <li>An unprofessional email address.</li>
  <li>Long paragraphs instead of bullet points.</li>
  <li>Listing every job since school when only recent, relevant roles matter.</li>
  <li>Forgetting to update your contact number.</li>
</ul>

<h2>Next steps</h2>
<p>Once your CV is ready, start applying. Browse the latest openings across every province and apply directly through the employer's official portal.</p>
`,
    faqs: [
      { q: 'How long should a CV be in South Africa?', a: 'Two to three pages is standard. School leavers and entry-level applicants can keep it to one or two pages. Only include experience that is relevant to the job you want.' },
      { q: 'Should I put a photo on my CV?', a: 'It is optional and not expected. Many employers prefer no photo to avoid bias. Focus your space on skills and achievements instead.' },
      { q: 'Do I need to include my ID number?', a: 'You may include it, and some government applications require it, but it is not compulsory on a general CV. Never share your full ID on public job boards.' },
      { q: 'What is an ATS and why does it matter?', a: 'An applicant tracking system is software that scans CVs for keywords before a recruiter reads them. Using clear headings and the exact terms from the advert helps your CV get through.' },
    ],
  },
  {
    slug: 'how-to-write-your-first-cv-no-experience',
    title: 'How to Write Your First CV With No Experience (South Africa)',
    h1: 'Writing Your First CV With No Work Experience',
    description: 'No work experience yet? Learn how to write a strong first CV using your schoolwork, volunteering, skills and potential to impress South African employers.',
    category: 'cv',
    updated: '2026-07-01',
    readMins: 6,
    popular: true,
    intro: 'Everyone starts somewhere. If you have just finished matric or a qualification and have never had a formal job, you can still write a CV that gets you an interview. The trick is to sell your potential, attitude and transferable skills.',
    body: `
<h2>Lead with a strong summary</h2>
<p>Because you have no work history, your professional summary carries more weight. Keep it honest and enthusiastic, for example: "Motivated matriculant with strong numeracy and a passion for retail, looking for an entry-level position where I can learn and grow."</p>

<h2>Use what you have</h2>
<ul>
  <li><strong>Education</strong> — list your matric subjects and marks if they are good, plus any certificates.</li>
  <li><strong>School and community activities</strong> — being a prefect, sports captain or church volunteer shows responsibility and teamwork.</li>
  <li><strong>Short courses</strong> — free online courses, first aid, computer literacy or a driver's licence all count.</li>
  <li><strong>Skills</strong> — languages you speak, computer skills, and soft skills like reliability and willingness to learn.</li>
</ul>

<h2>Highlight transferable skills</h2>
<p>Helped in a family business? Ran a stokvel's record book? Looked after younger siblings? These show real skills: handling money, organisation and responsibility. Frame them clearly.</p>

<h2>Keep it to one page</h2>
<p>A first CV should be neat and to the point. One page is enough. Make sure your contact details are correct and your email sounds professional.</p>

<h2>Be ready to apply widely</h2>
<p>Entry-level roles, learnerships and internships are the fastest way to get your foot in the door and build the experience your next CV will need.</p>
`,
    faqs: [
      { q: 'What do I put on a CV if I have never worked?', a: 'Focus on your education, school activities, short courses, volunteering and soft skills. Show that you are reliable, willing to learn and have potential.' },
      { q: 'Should I apply for learnerships with no experience?', a: 'Yes. Learnerships are designed for people entering the workforce. They pay a stipend while you earn an accredited qualification and real work experience.' },
    ],
  },
  {
    slug: 'common-interview-questions-and-answers',
    title: 'Common Interview Questions and Answers in South Africa (2026)',
    h1: 'Common Interview Questions and How to Answer Them',
    description: 'The most common job interview questions in South Africa with practical example answers, plus how to prepare and what to ask at the end.',
    category: 'interview',
    updated: '2026-07-01',
    readMins: 10,
    featured: true,
    popular: true,
    intro: 'Interviews feel nerve-wracking, but the questions are more predictable than you think. Prepare honest, structured answers to the questions below and you will walk in far more confident.',
    body: `
<h2>Before the interview</h2>
<p>Research the company, re-read the job advert, and plan your route or test your video link the day before. Print a copy of your CV and bring your ID and any certificates.</p>

<h2>The questions you can expect</h2>
<h3>1. Tell me about yourself</h3>
<p>Give a 60-second summary: who you are professionally, your relevant experience, and why you are excited about this role. Do not recite your whole life story.</p>

<h3>2. Why do you want to work here?</h3>
<p>Show you have done your homework. Mention something specific about the company and connect it to your goals.</p>

<h3>3. What are your strengths?</h3>
<p>Choose two or three strengths that match the job and back each with a quick example.</p>

<h3>4. What is your biggest weakness?</h3>
<p>Be honest but strategic. Name a real area you are improving and explain the steps you are taking, for example a course you are doing.</p>

<h3>5. Tell me about a time you handled a difficult situation</h3>
<p>This is a behavioural question. Use the STAR method — Situation, Task, Action, Result — to keep your answer clear and focused.</p>

<h3>6. Where do you see yourself in five years?</h3>
<p>Show ambition that fits the company. Employers want people who will grow with them.</p>

<h3>7. Why should we hire you?</h3>
<p>Summarise the two or three reasons you are the best fit, tied to the job's key requirements.</p>

<h2>Questions to ask them</h2>
<p>Always have two questions ready, such as "What does success look like in this role in the first six months?" or "What are the biggest opportunities for the team right now?" It shows genuine interest.</p>

<h2>After the interview</h2>
<p>Send a short thank-you email within 24 hours. Reaffirm your interest and mention one thing you enjoyed discussing.</p>
`,
    faqs: [
      { q: 'How do I answer "tell me about yourself"?', a: 'Give a short, professional summary of who you are, your relevant experience and why you want this role. Keep it to about a minute and avoid personal details.' },
      { q: 'What should I ask at the end of an interview?', a: 'Ask about what success looks like in the role, the team you would join, or the next steps in the process. Avoid leading with salary and leave questions.' },
      { q: 'How early should I arrive?', a: 'Aim to arrive 10 to 15 minutes early. For a video interview, log in five minutes before and test your camera and sound in advance.' },
    ],
  },
  {
    slug: 'star-method-interview-technique',
    title: 'The STAR Method: Answer Interview Questions Like a Pro',
    h1: 'The STAR Method for Interview Answers',
    description: 'Learn the STAR method (Situation, Task, Action, Result) to answer behavioural interview questions clearly and confidently, with South African examples.',
    category: 'interview',
    updated: '2026-07-01',
    readMins: 5,
    intro: 'Behavioural questions that start with "Tell me about a time when..." trip up many candidates. The STAR method gives you a simple structure so your answers stay clear and impressive.',
    body: `
<h2>What STAR stands for</h2>
<ul>
  <li><strong>Situation</strong> — set the scene briefly. Where were you and what was happening?</li>
  <li><strong>Task</strong> — what was your responsibility or the challenge you faced?</li>
  <li><strong>Action</strong> — what did you actually do? This is the most important part, so use "I" not "we".</li>
  <li><strong>Result</strong> — what happened? Use a number or clear outcome where possible.</li>
</ul>

<h2>A worked example</h2>
<p><em>"Tell me about a time you dealt with an unhappy customer."</em></p>
<p><strong>Situation:</strong> While working at a busy retail store, a customer returned a faulty appliance and was very angry. <strong>Task:</strong> I had to resolve it while keeping the queue moving. <strong>Action:</strong> I listened, apologised, checked the warranty and arranged an immediate replacement. <strong>Result:</strong> The customer left satisfied and later wrote a positive review mentioning me by name.</p>

<h2>Tips</h2>
<ul>
  <li>Prepare three or four STAR stories that show different skills.</li>
  <li>Keep each answer to about two minutes.</li>
  <li>Practise out loud so it sounds natural, not memorised.</li>
</ul>
`,
    faqs: [
      { q: 'When should I use the STAR method?', a: 'Use it for any behavioural question that asks about a past experience, such as handling conflict, meeting a deadline or solving a problem.' },
      { q: 'Should I say "I" or "we" in my answer?', a: 'Say "I" when describing the actions you took. Interviewers want to know your personal contribution, not just what the team did.' },
    ],
  },
  {
    slug: 'cover-letter-guide-south-africa',
    title: 'How to Write a Cover Letter in South Africa (With Example)',
    h1: 'How to Write a Cover Letter',
    description: 'A simple cover letter guide for South African job seekers, including structure, a full example, and how to write a job application email.',
    category: 'cover-letter',
    updated: '2026-07-01',
    readMins: 6,
    popular: true,
    intro: 'A cover letter is your chance to explain, in your own voice, why you are right for the job. When it is short, specific and tailored, it can be the reason a recruiter opens your CV first.',
    body: `
<h2>The structure of a strong cover letter</h2>
<ul>
  <li><strong>Opening</strong> — state the job you are applying for and where you saw it.</li>
  <li><strong>Middle</strong> — two short paragraphs matching your experience and skills to the job's main requirements.</li>
  <li><strong>Closing</strong> — thank them, state your availability and invite them to contact you.</li>
</ul>

<h2>Keep it to one page</h2>
<p>Three or four short paragraphs is plenty. Recruiters are busy, so make every line earn its place.</p>

<h2>Example cover letter</h2>
<p><em>Dear Hiring Manager,</em></p>
<p><em>I am applying for the Admin Clerk position advertised on Edubuzz. With two years' experience in a busy office and strong Microsoft Office skills, I am confident I can support your team effectively.</em></p>
<p><em>In my previous role I managed filing, diary scheduling and reception for a team of eight, and reduced invoice processing time by keeping records up to date. I am organised, reliable and comfortable working under pressure.</em></p>
<p><em>I have attached my CV and am available to start immediately. I would welcome the opportunity to discuss how I can contribute. Thank you for your consideration.</em></p>
<p><em>Kind regards, [Your name and cellphone number]</em></p>

<h2>Writing a job application email</h2>
<p>When you apply by email, your email body is your cover letter. Use a clear subject line such as "Application: Admin Clerk – [Your Name]", keep the message short, and attach your CV as a PDF named with your full name.</p>
`,
    faqs: [
      { q: 'Do I need a cover letter if I have a CV?', a: 'A tailored cover letter is still worth it for most applications. It lets you connect your experience to the specific job and shows genuine effort.' },
      { q: 'What should the subject line of an application email be?', a: 'Include the job title and your name, for example "Application: Sales Representative – Thabo Mokoena". This helps recruiters find and sort your application.' },
    ],
  },
  {
    slug: 'what-is-a-learnership',
    title: 'What Is a Learnership? Stipends, Requirements & How to Apply',
    h1: 'What Is a Learnership in South Africa?',
    description: 'Everything South African school leavers need to know about learnerships: what they are, the monthly stipend, entry requirements, and how to apply.',
    category: 'learnership',
    updated: '2026-07-01',
    readMins: 7,
    featured: true,
    popular: true,
    categorySlug: 'general',
    intro: 'Learnerships are one of the best routes into the South African workforce, especially if you have little or no experience. They combine classroom learning with real work, pay a monthly stipend, and lead to a nationally recognised qualification.',
    body: `
<h2>How a learnership works</h2>
<p>A learnership is a structured programme, usually 12 months, run by an employer in partnership with a SETA (Sector Education and Training Authority). You spend part of your time learning theory and part gaining practical workplace experience. At the end you receive an accredited NQF qualification.</p>

<h2>Do learnerships pay?</h2>
<p>Yes. Learners receive a monthly stipend to cover transport and basic costs. The exact amount varies by employer and sector, but it is intended to support you while you learn rather than to replace a full salary.</p>

<h2>Entry requirements</h2>
<ul>
  <li>You usually need to be between 18 and 35 years old.</li>
  <li>A matric certificate is common, though some learnerships accept Grade 10 or 11.</li>
  <li>Certain programmes require specific subjects, such as Maths for technical fields.</li>
  <li>People living with disabilities are strongly encouraged to apply, and many programmes have dedicated places.</li>
</ul>

<h2>Why do a learnership?</h2>
<ul>
  <li>You earn while you learn.</li>
  <li>You gain an accredited qualification employers recognise.</li>
  <li>You build real work experience for your CV.</li>
  <li>Many learners are offered permanent roles by the host employer.</li>
</ul>

<h2>Where to find learnerships</h2>
<p>Big banks, retailers, SOEs and government departments advertise learnerships every year, often between September and January. Browse current openings and apply early, because places fill quickly.</p>
`,
    faqs: [
      { q: 'How much is a learnership stipend?', a: 'Stipends vary by employer and sector. They are designed to cover transport and basic living costs while you complete the programme, not to serve as a full salary.' },
      { q: 'Do I need matric for a learnership?', a: 'Many learnerships require matric, but some accept Grade 10 or 11. Always check the specific requirements in the advert before applying.' },
      { q: 'Can I get a permanent job after a learnership?', a: 'Often yes. Employers frequently keep on strong performers, and the accredited qualification plus experience makes you far more employable elsewhere too.' },
    ],
  },
  {
    slug: 'how-to-apply-for-a-learnership',
    title: 'How to Apply for a Learnership in South Africa (Step by Step)',
    h1: 'How to Apply for a Learnership',
    description: 'A step-by-step guide to applying for learnerships in South Africa: what documents you need, how to submit, and how to avoid learnership scams.',
    category: 'learnership',
    updated: '2026-07-01',
    readMins: 5,
    intro: 'Applying for a learnership is straightforward if you prepare your documents in advance and apply as early as possible. Here is exactly what to do.',
    body: `
<h2>Step 1: Prepare your documents</h2>
<ul>
  <li>A certified copy of your ID.</li>
  <li>A certified copy of your matric certificate or latest results.</li>
  <li>An updated CV.</li>
  <li>Proof of residence, if requested.</li>
</ul>

<h2>Step 2: Apply through the official channel</h2>
<p>Apply only through the employer's official careers page or the link in the advert. Follow the instructions exactly — some ask for an online form, others for an email with attachments.</p>

<h2>Step 3: Write a short motivation</h2>
<p>If asked why you want the learnership, be genuine: explain your interest in the field and your commitment to completing the programme.</p>

<h2>Step 4: Apply early and widely</h2>
<p>Learnership intakes are competitive and close quickly. Apply to several programmes that match your qualifications to improve your chances.</p>

<h2>Avoid learnership scams</h2>
<p>Legitimate learnerships never ask you to pay a registration or "training" fee. If someone asks for money to secure your place, walk away and report it.</p>
`,
    faqs: [
      { q: 'Do I have to pay to apply for a learnership?', a: 'No. Genuine learnerships are free to apply for and pay you a stipend. Anyone asking for a fee to secure a place is running a scam.' },
      { q: 'When do learnerships open?', a: 'Many open between September and January for the following year, but they are advertised throughout the year. Apply as soon as you see one that fits.' },
    ],
  },
  {
    slug: 'internship-guide-south-africa',
    title: 'Internships in South Africa: Graduate Programmes & In-Service Training',
    h1: 'The Complete Internship Guide',
    description: 'Understand internships, graduate programmes and in-service training in South Africa, who qualifies, and how to land a place that launches your career.',
    category: 'internship',
    updated: '2026-07-01',
    readMins: 7,
    featured: true,
    categorySlug: 'general',
    intro: 'Internships turn your qualification into real, paid experience. Whether you need in-service training to complete your diploma or a graduate programme to start your career, this guide explains your options.',
    body: `
<h2>Types of internships in South Africa</h2>
<ul>
  <li><strong>Graduate internships</strong> — 12 to 24 month programmes for degree or diploma holders to gain workplace experience.</li>
  <li><strong>In-service training</strong> — required by many TVET and university diplomas so students can complete their qualification (often called P1 and P2, or work-integrated learning).</li>
  <li><strong>Graduate programmes</strong> — structured, often rotational programmes at large employers that fast-track high performers into permanent roles.</li>
</ul>

<h2>Who qualifies?</h2>
<p>Most internships require a completed or nearly completed qualification, South African citizenship, and that you are within a few years of graduating. Some are aimed specifically at unemployed graduates.</p>

<h2>How to stand out</h2>
<ul>
  <li>Apply the moment programmes open — the big graduate intakes fill fast.</li>
  <li>Tailor your CV to highlight your qualification, projects and any part-time work.</li>
  <li>Prepare for assessments — many programmes include online aptitude tests.</li>
  <li>Show enthusiasm to learn; attitude matters as much as marks.</li>
</ul>

<h2>Where to look</h2>
<p>Banks, auditing firms, SOEs, mining houses and government departments run annual graduate and internship intakes. Browse current listings and set a reminder for the ones that open seasonally.</p>
`,
    faqs: [
      { q: 'Are internships paid in South Africa?', a: 'Most formal internships and graduate programmes pay a stipend or salary. In-service training placements may pay less, but they let you complete your qualification.' },
      { q: 'What is in-service training?', a: 'It is the practical workplace experience many TVET and university diplomas require before you can graduate, sometimes called P1/P2 or work-integrated learning.' },
    ],
  },
  {
    slug: 'how-to-apply-for-government-jobs',
    title: 'How to Apply for Government Jobs in South Africa (Z83 Guide)',
    h1: 'How to Apply for Government Jobs',
    description: 'A clear guide to applying for South African government jobs: the new Z83 form, supporting documents, DPSA circulars, and how to avoid common mistakes.',
    category: 'government',
    updated: '2026-07-01',
    readMins: 8,
    featured: true,
    popular: true,
    categorySlug: 'government',
    intro: 'Government jobs offer stability, benefits and clear career paths, which is why they attract huge numbers of applicants. Getting the paperwork exactly right is the first hurdle, so follow this guide carefully.',
    body: `
<h2>Find the vacancy</h2>
<p>National and provincial posts are published in the weekly DPSA (Department of Public Service and Administration) vacancy circular, as well as on individual department websites and job boards. Note the reference number and closing date for each post.</p>

<h2>Complete the new Z83 form</h2>
<p>Every public service application requires the official Z83 application form. Since the updated form was introduced, you must:</p>
<ul>
  <li>Complete all sections in full — incomplete forms are disqualified.</li>
  <li>Sign and date the form.</li>
  <li>Attach a comprehensive CV.</li>
</ul>
<p>You generally do not need to attach certified copies of your qualifications at application stage; shortlisted candidates are asked to bring them to the interview. Always re-read the advert, as requirements can differ.</p>

<h2>Match the requirements exactly</h2>
<p>Government shortlisting is strict. If a post requires a specific NQF level, years of experience or a driver's licence, make sure your CV clearly shows you meet each requirement.</p>

<h2>Submit before the deadline</h2>
<p>Late applications are not accepted. Submit through the method stated in the advert — post, hand delivery, email or an online portal — and keep proof of submission.</p>

<h2>Common mistakes</h2>
<ul>
  <li>Using an old version of the Z83 form.</li>
  <li>Leaving fields blank or forgetting to sign.</li>
  <li>Missing the reference number.</li>
  <li>Applying after the closing date.</li>
</ul>
`,
    faqs: [
      { q: 'Do I need to certify documents for government jobs?', a: 'Under the updated Z83 process, you usually submit only the completed Z83 and a CV. Certified copies are typically requested from shortlisted candidates at interview stage, but always check the advert.' },
      { q: 'Where are government jobs advertised?', a: 'In the weekly DPSA vacancy circular, on department and municipality websites, and on job boards. Each post has a reference number and a strict closing date.' },
      { q: 'Is the Z83 form compulsory?', a: 'Yes. A fully completed and signed Z83 form is required for public service applications. Incomplete forms are disqualified.' },
    ],
  },
  {
    slug: 'tvet-colleges-and-nsfas-guide',
    title: 'TVET Colleges & NSFAS Funding in South Africa: A Student Guide',
    h1: 'TVET Colleges and NSFAS Funding Explained',
    description: 'What TVET colleges offer, the qualifications you can study, how NSFAS funding works, and how these pathways lead to artisan and technical careers.',
    category: 'tvet',
    updated: '2026-07-01',
    readMins: 7,
    popular: true,
    intro: 'TVET (Technical and Vocational Education and Training) colleges offer practical, career-focused qualifications that are in high demand, and NSFAS funding can cover the cost. Here is how the pathway works.',
    body: `
<h2>What TVET colleges offer</h2>
<p>South Africa's 50 public TVET colleges provide vocational qualifications aimed directly at the workplace, including:</p>
<ul>
  <li><strong>NC(V)</strong> — National Certificate (Vocational), NQF levels 2 to 4, an alternative to matric with a practical focus.</li>
  <li><strong>NATED / Report 191</strong> — N1 to N6 courses in engineering, business and utility studies.</li>
  <li><strong>Occupational and skills programmes</strong> — shorter, trade-focused training.</li>
</ul>

<h2>Pathways to artisan careers</h2>
<p>Many technical trades — electrician, boilermaker, fitter and turner, motor mechanic — start at a TVET college. After your N-courses you complete workplace training and a trade test to qualify as an artisan, one of the most sought-after and well-paid skill sets in the country.</p>

<h2>How NSFAS funding works</h2>
<p>The National Student Financial Aid Scheme (NSFAS) funds qualifying students at public TVET colleges and universities. If you come from a household below the income threshold, NSFAS can cover tuition and provide allowances for transport, accommodation and living costs.</p>
<ul>
  <li>Apply online during the NSFAS application window, usually late in the year for the following academic year.</li>
  <li>You will need your ID, proof of household income and academic results.</li>
  <li>NSFAS funding for TVET is a bursary for qualifying students, not a loan you repay.</li>
</ul>

<h2>Why choose TVET?</h2>
<p>TVET qualifications are practical, shorter than a degree, often funded, and lead to skills the economy genuinely needs. For many students it is the fastest route to a stable, well-paid career.</p>
`,
    faqs: [
      { q: 'Does NSFAS cover TVET college fees?', a: 'Yes. NSFAS funds qualifying students at public TVET colleges, covering tuition and providing allowances. For TVET students it is a bursary, not a loan.' },
      { q: 'Is a TVET qualification as good as matric?', a: 'The NC(V) is a recognised NQF level 4 qualification and a practical alternative to matric. For technical careers, TVET training is often more directly useful to employers.' },
      { q: 'How do I become an artisan?', a: 'Study the relevant N-courses at a TVET college, complete workplace experience, and pass a trade test. Qualified artisans are in high demand across mining, manufacturing and construction.' },
    ],
  },
  {
    slug: 'job-search-tips-south-africa',
    title: 'Job Search Tips for South Africa: Find Work Faster & Avoid Scams',
    h1: 'Smart Job Search Tips for South Africa',
    description: 'Practical job search tips for South Africans: where to look, how to apply effectively, staying organised, and spotting job scams before they cost you.',
    category: 'job-search',
    updated: '2026-07-01',
    readMins: 6,
    popular: true,
    intro: 'Looking for work can feel overwhelming, but a focused approach gets results faster than sending your CV everywhere. Use these tips to search smarter and stay safe.',
    body: `
<h2>Apply where jobs are real</h2>
<p>Use reputable job boards and apply directly through employers' official portals. Applying at the source means your application actually reaches the hiring team.</p>

<h2>Set up job alerts</h2>
<p>Rather than checking every day, set up alerts for the roles and provinces you want so new openings come to you. Applying within the first day or two gives you a real advantage.</p>

<h2>Stay organised</h2>
<ul>
  <li>Keep a simple spreadsheet of where and when you applied.</li>
  <li>Save each tailored CV and cover letter.</li>
  <li>Follow up politely if you have not heard back after two weeks.</li>
</ul>

<h2>Use your network</h2>
<p>Many jobs are filled through word of mouth. Tell family, friends and former colleagues you are looking, and keep your LinkedIn profile up to date.</p>

<h2>Spot and avoid job scams</h2>
<p>Scammers target job seekers. Protect yourself:</p>
<ul>
  <li>Never pay for a job, an interview, "training materials" or a uniform upfront.</li>
  <li>Be wary of offers that seem too good to be true or arrive without you applying.</li>
  <li>Do not share your full ID number, banking details or copies of documents before you have verified the employer.</li>
  <li>Check that the company and contact details are real.</li>
</ul>

<h2>Keep going</h2>
<p>Rejection is part of the process. Ask for feedback where you can, keep improving your CV, and stay consistent. The right role often comes after the ones that did not work out.</p>
`,
    faqs: [
      { q: 'How can I tell if a job advert is a scam?', a: 'Warning signs include requests for money, offers without an application, poor grammar, personal email addresses, and pressure to share ID or banking details early. Legitimate employers never charge you to apply.' },
      { q: 'How do I get job alerts?', a: 'Set up alerts on job boards for your chosen role and province so new listings are sent to you. Applying early, within a day or two, improves your chances.' },
    ],
  },
];
