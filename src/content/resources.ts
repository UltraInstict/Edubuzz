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
  {
    slug: 'cv-templates-south-africa',
    title: 'Free CV Templates for South Africa (2026) — Formats That Work',
    h1: 'CV Templates for South Africa',
    description: 'Choose the right CV template for South African job applications. Chronological, functional and combination formats explained, with what to include in each section.',
    category: 'cv',
    updated: '2026-07-01',
    readMins: 7,
    popular: true,
    intro: 'The right CV template makes your experience easy to read and helps you get past applicant tracking systems. This guide explains the three main CV formats used in South Africa and when to use each one.',
    body: `
<h2>The three main CV formats</h2>
<p>There is no single "correct" CV template, but there are three proven structures. Choose the one that best presents your situation.</p>

<h3>1. Chronological CV (most common)</h3>
<p>Lists your work experience from newest to oldest. This is the format most South African employers and recruiters expect, and it works best when you have a steady work history in one field.</p>
<ul>
  <li><strong>Best for:</strong> people with continuous, relevant experience.</li>
  <li><strong>Leads with:</strong> your most recent job and achievements.</li>
</ul>

<h3>2. Functional (skills-based) CV</h3>
<p>Focuses on your skills and abilities rather than a timeline. It groups your strengths together and plays down gaps or job changes.</p>
<ul>
  <li><strong>Best for:</strong> school leavers, career changers, or people with employment gaps.</li>
  <li><strong>Leads with:</strong> a skills summary before a short work history.</li>
</ul>

<h3>3. Combination CV</h3>
<p>Blends the two: a strong skills summary at the top, followed by a chronological work history. This is a flexible, modern choice.</p>

<h2>What every South African CV template should include</h2>
<ul>
  <li>Full name and professional contact details (cellphone and email).</li>
  <li>A short professional summary (three or four lines).</li>
  <li>Work experience with achievements, not just duties.</li>
  <li>Education and qualifications, starting with matric.</li>
  <li>Key skills relevant to the role.</li>
  <li>Two contactable references, or "available on request".</li>
</ul>

<h2>Formatting tips that beat the ATS</h2>
<ul>
  <li>Use a clean, single-column layout with standard headings.</li>
  <li>Avoid tables, text boxes, logos and photos that scanners cannot read.</li>
  <li>Use a common font like Arial or Calibri at 10–12pt.</li>
  <li>Save and send as a PDF unless the advert asks for Word.</li>
  <li>Name the file with your full name, for example "Thabo-Mokoena-CV.pdf".</li>
</ul>

<h2>How long should it be?</h2>
<p>Two to three pages is standard in South Africa. Keep entry-level and student CVs to one or two pages, and only include experience relevant to the job you want.</p>

<h2>Ready to apply?</h2>
<p>Once your CV looks the part, put it to work. Browse the latest vacancies across every province and apply directly through the employer\u2019s official portal.</p>
`,
    faqs: [
      { q: 'Which CV format is best in South Africa?', a: 'The chronological format is the most widely expected. If you have gaps or are changing careers, a functional or combination format lets you lead with your skills instead of your timeline.' },
      { q: 'Should I use a fancy CV template with colours and graphics?', a: 'Keep it simple. Heavily designed templates with columns, icons and photos often confuse applicant tracking systems. A clean, single-column layout is safer and just as professional.' },
      { q: 'What file format should I send my CV in?', a: 'Send a PDF unless the advert specifically asks for Word. PDFs keep your formatting intact across devices. Name the file with your full name so recruiters can find it easily.' },
    ],
  },
  {
    slug: 'graduate-cv-south-africa',
    title: 'How to Write a Graduate CV in South Africa (2026)',
    h1: 'Writing a Graduate CV',
    description: 'A step-by-step guide to writing a graduate CV in South Africa. How to present your degree, internships, projects and skills to land your first professional role.',
    category: 'cv',
    updated: '2026-07-01',
    readMins: 7,
    intro: 'As a recent graduate you have knowledge and potential but limited work experience. A strong graduate CV puts your qualification, projects and transferable skills front and centre so employers can see what you offer.',
    body: `
<h2>Lead with a focused summary</h2>
<p>Open with a short professional summary that states your qualification, your field of interest, and what you bring. For example: "Recent BCom Accounting graduate seeking a graduate trainee role, with strong analytical skills and completed SAICA-accredited modules."</p>

<h2>Put education near the top</h2>
<p>As a graduate, your qualification is a major selling point, so place it prominently:</p>
<ul>
  <li>Your degree or diploma, institution and year completed.</li>
  <li>Relevant modules, your major, and academic results if they are strong.</li>
  <li>Any distinctions, deans\u2019 list or awards.</li>
  <li>Your matric and top subjects, especially if recent.</li>
</ul>

<h2>Make the most of limited experience</h2>
<ul>
  <li><strong>Internships and vac work</strong> — describe what you did and learned.</li>
  <li><strong>Academic projects</strong> — final-year projects show applied skills.</li>
  <li><strong>Part-time and holiday jobs</strong> — prove reliability and work ethic.</li>
  <li><strong>Leadership and volunteering</strong> — societies, tutoring, community work.</li>
</ul>

<h2>Highlight the right skills</h2>
<p>Employers hiring graduates look for potential and attitude. List both technical skills (software, methods, tools from your studies) and soft skills (communication, teamwork, problem-solving), and back them with quick examples.</p>

<h2>Tailor for graduate programmes</h2>
<p>Big graduate programmes at banks, auditing firms, SOEs and mining houses are competitive. Read each advert carefully, mirror its key requirements, and apply the moment applications open, because places fill fast.</p>

<h2>Keep it clean and error-free</h2>
<p>Keep your graduate CV to two pages, use a simple layout, and proofread carefully. A single spelling error can cost you an interview when competition is high.</p>

<h2>Next step</h2>
<p>With your graduate CV ready, browse current graduate programmes, internships and entry-level roles and apply directly to employers.</p>
`,
    faqs: [
      { q: 'What should a graduate put on a CV with little experience?', a: 'Lead with your qualification, relevant modules and projects, plus any internships, vac work, part-time jobs, leadership and volunteering. Emphasise transferable skills and your willingness to learn.' },
      { q: 'How long should a graduate CV be?', a: 'Two pages is ideal. Include your education, any experience, projects and skills relevant to the role, and leave out unrelated detail.' },
      { q: 'When should I apply for graduate programmes in South Africa?', a: 'Many large graduate programmes open between March and July for the following year, though some run year-round. Apply as early as possible because they are highly competitive.' },
    ],
  },
  {
    slug: 'common-interview-mistakes-to-avoid',
    title: 'Common Interview Mistakes to Avoid in South Africa (2026)',
    h1: 'Interview Mistakes That Cost You the Job',
    description: 'The most common job interview mistakes South Africans make, and exactly how to avoid them, from poor preparation to bad body language and weak questions.',
    category: 'interview',
    updated: '2026-07-01',
    readMins: 6,
    intro: 'You can have the right qualifications and still lose an interview through avoidable mistakes. Here are the errors that most often cost South African candidates the job, and how to fix each one.',
    body: `
<h2>1. Arriving late (or logging in late)</h2>
<p>Lateness signals unreliability before you say a word. Plan your route and aim to arrive 10 to 15 minutes early. For a video interview, test your link, camera and sound the day before and log in five minutes early.</p>

<h2>2. Not researching the company</h2>
<p>"Why do you want to work here?" catches out unprepared candidates. Spend 20 minutes on the company website and recent news so you can speak specifically about them.</p>

<h2>3. Rambling or memorising answers</h2>
<p>Long, unfocused answers lose the interviewer. Prepare structured responses using the STAR method for behavioural questions, and keep answers to about two minutes.</p>

<h2>4. Badmouthing a previous employer</h2>
<p>Even if you left on bad terms, speak neutrally. Complaining about a past boss makes interviewers wonder how you will talk about them one day.</p>

<h2>5. Weak body language</h2>
<ul>
  <li>Offer a firm handshake and make eye contact.</li>
  <li>Sit up, avoid crossing your arms, and do not fidget with your phone.</li>
  <li>Smile and show genuine interest.</li>
</ul>

<h2>6. Dressing wrong for the role</h2>
<p>Dress one level above the everyday dress code of the job. Neat, clean and professional always beats casual. When in doubt, go more formal.</p>

<h2>7. Having no questions to ask</h2>
<p>When they ask "Do you have any questions?", always say yes. Prepare two, such as "What does success look like in the first six months?" It shows real interest.</p>

<h2>8. Lying or exaggerating</h2>
<p>Never inflate your experience or qualifications. Verification and reference checks are standard, and dishonesty ends applications and careers.</p>

<h2>9. Forgetting to follow up</h2>
<p>A short thank-you email within 24 hours keeps you front of mind and shows professionalism. Reaffirm your interest and mention one thing you enjoyed discussing.</p>

<h2>Put it into practice</h2>
<p>Avoid these mistakes and you will already be ahead of most candidates. When you are ready, browse current openings and apply directly to employers.</p>
`,
    faqs: [
      { q: 'What is the biggest interview mistake?', a: 'Poor preparation is the most damaging. Not researching the company, having no questions ready, and giving unstructured answers all signal a lack of genuine interest and effort.' },
      { q: 'Should I follow up after an interview?', a: 'Yes. Send a brief, polite thank-you email within 24 hours. It shows professionalism, keeps you front of mind, and lets you reaffirm your interest in the role.' },
      { q: 'What should I do if I do not know the answer to a question?', a: 'Stay calm and honest. Take a moment to think, answer what you can, and if you truly do not know, say you would find out. Interviewers value honesty over bluffing.' },
    ],
  },
  {
    slug: 'salary-negotiation-guide-south-africa',
    title: 'How to Negotiate Your Salary in South Africa (2026)',
    h1: 'How to Negotiate Your Salary',
    description: 'A practical salary negotiation guide for South Africans. When to raise pay, how to research your market value, and exactly what to say to get a better offer.',
    category: 'interview',
    updated: '2026-07-01',
    readMins: 7,
    popular: true,
    intro: 'Negotiating your salary can add thousands of rands a year, yet many South Africans accept the first offer out of fear. Done professionally, negotiation is expected and rarely costs you the job. Here is how to do it well.',
    body: `
<h2>Know your market value first</h2>
<p>Before you can negotiate, you need a realistic number. Research typical pay for the role, your experience level and your city using salary guides and job adverts. Walk in with a range, not a single figure.</p>

<h2>Let them raise money first</h2>
<p>Where possible, avoid naming a number early. If asked your expectation, give a researched range and add that you are open to discussing the full package. This keeps your options open.</p>

<h2>Consider the whole package</h2>
<p>Salary is not the only lever. Factor in:</p>
<ul>
  <li>Medical aid and pension or provident fund contributions.</li>
  <li>Bonus structure and 13th cheque.</li>
  <li>Travel or cellphone allowances.</li>
  <li>Leave, flexibility and remote-work options.</li>
  <li>Training and development opportunities.</li>
</ul>

<h2>Time it right</h2>
<p>The strongest moment to negotiate is after they have made an offer, when they have chosen you but before you have accepted. For existing jobs, tie the conversation to a performance review or a new responsibility.</p>

<h2>What to actually say</h2>
<p>Be warm, confident and specific. For example: "Thank you, I\u2019m excited about the role. Based on my experience and the market for this position, I was hoping for something closer to R[amount]. Is there flexibility?" Then pause and let them respond.</p>

<h2>Back it up with value</h2>
<p>Justify your ask with what you bring, not personal need. Reference your skills, results and relevant experience, not your rent or debts.</p>

<h2>Stay professional either way</h2>
<p>If they cannot move on salary, ask about other benefits or a review in six months. Never make threats or ultimatums, and always keep the tone positive.</p>

<h2>Know your worth</h2>
<p>Use our salary guides to benchmark your role before any negotiation, then apply to positions that match your target with confidence.</p>
`,
    faqs: [
      { q: 'Is it rude to negotiate salary in South Africa?', a: 'No. Professional, respectful negotiation is expected and rarely costs you the job. Employers often build in room to negotiate, and accepting the first offer can leave money on the table.' },
      { q: 'When is the best time to negotiate salary?', a: 'After you receive a formal offer but before you accept. That is when the employer has decided they want you, which gives you the most leverage.' },
      { q: 'What if the employer cannot increase the salary?', a: 'Negotiate the wider package: medical aid, pension, bonuses, allowances, extra leave, remote flexibility, or a salary review in six months. These add real value beyond the base figure.' },
    ],
  },
  {
    slug: 'job-application-email-guide',
    title: 'How to Write a Job Application Email in South Africa (With Examples)',
    h1: 'How to Write a Job Application Email',
    description: 'Learn how to write a professional job application email in South Africa. Subject lines, structure, what to attach, and a full example you can adapt.',
    category: 'cover-letter',
    updated: '2026-07-01',
    readMins: 5,
    intro: 'Many South African jobs are applied for by email. Your email is your first impression, so a clear subject line, a short professional message and correctly named attachments can set you apart before anyone opens your CV.',
    body: `
<h2>Get the subject line right</h2>
<p>Recruiters sort dozens of emails a day. Use a clear subject line with the job title and your name, for example: "Application: Admin Clerk (Ref 123) – Nomsa Dlamini". If there is a reference number, include it.</p>

<h2>Structure of a strong application email</h2>
<ul>
  <li><strong>Greeting</strong> — "Dear Hiring Manager" or the named contact.</li>
  <li><strong>Opening line</strong> — state the job and where you saw it.</li>
  <li><strong>Middle</strong> — two or three sentences on why you fit the key requirements.</li>
  <li><strong>Closing</strong> — note your attachments, availability, and thank them.</li>
  <li><strong>Signature</strong> — your name and cellphone number.</li>
</ul>

<h2>Attach the right documents</h2>
<ul>
  <li>Attach your CV as a PDF named with your full name.</li>
  <li>Include any documents the advert asks for (ID, certificates, Z83 for government).</li>
  <li>Keep total attachment size reasonable so it does not bounce.</li>
</ul>

<h2>Full example</h2>
<p><em>Subject: Application: Sales Assistant (Ref SA-2026) – Sipho Ndlovu</em></p>
<p><em>Dear Hiring Manager,</em></p>
<p><em>I am applying for the Sales Assistant position advertised on Edubuzz. I have two years\u2019 retail experience, a strong sales record and excellent customer service skills, and I am confident I can contribute to your team.</em></p>
<p><em>My CV is attached. I am available to start immediately and would welcome the opportunity to discuss my application. Thank you for your time and consideration.</em></p>
<p><em>Kind regards,<br/>Sipho Ndlovu<br/>071 234 5678</em></p>

<h2>Before you hit send</h2>
<ul>
  <li>Proofread for spelling and the correct company name.</li>
  <li>Check the attachment is actually attached.</li>
  <li>Send from a professional email address, not a nickname.</li>
</ul>

<h2>Ready to apply?</h2>
<p>Browse the latest vacancies and apply directly to employers with a professional email and a well-structured CV.</p>
`,
    faqs: [
      { q: 'What should the subject line of a job application email be?', a: 'Include the job title, any reference number, and your name, for example "Application: Driver (Ref 45) – John Smith". This helps recruiters find and sort your application quickly.' },
      { q: 'Should my email be the same as my cover letter?', a: 'When you apply by email, the body of your email acts as your cover letter. Keep it short and professional, and attach your CV as a PDF.' },
      { q: 'What documents should I attach?', a: 'Always attach your CV as a PDF named with your full name. Add anything the advert requests, such as certified copies, certificates, or a completed Z83 form for government posts.' },
    ],
  },
  {
    slug: 'how-to-write-a-resignation-letter',
    title: 'How to Write a Resignation Letter in South Africa (With Template)',
    h1: 'How to Write a Resignation Letter',
    description: 'A simple guide to resigning professionally in South Africa. Notice periods, what to include, a full resignation letter template, and how to leave on good terms.',
    category: 'career',
    updated: '2026-07-01',
    readMins: 5,
    intro: 'Resigning the right way protects your reputation and your future references. A short, professional resignation letter and the correct notice period help you leave on good terms. Here is exactly how to do it.',
    body: `
<h2>Know your notice period</h2>
<p>Under the Basic Conditions of Employment Act, notice periods are typically:</p>
<ul>
  <li>One week if employed for six months or less.</li>
  <li>Two weeks if employed for more than six months but less than a year.</li>
  <li>Four weeks (one month) if employed for a year or more.</li>
</ul>
<p>Your contract may specify a longer period, so check it. Always give notice in writing.</p>

<h2>What to include in the letter</h2>
<ul>
  <li>The date.</li>
  <li>A clear statement that you are resigning.</li>
  <li>Your last working day, based on your notice period.</li>
  <li>A brief thank-you (you do not need to give reasons).</li>
  <li>Your signature.</li>
</ul>

<h2>Resignation letter template</h2>
<p><em>[Date]</em></p>
<p><em>Dear [Manager\u2019s name],</em></p>
<p><em>I am writing to formally resign from my position as [job title] at [company name]. In line with my notice period, my last working day will be [date].</em></p>
<p><em>Thank you for the opportunities and support during my time here. I will do everything I can to ensure a smooth handover before I leave.</em></p>
<p><em>Kind regards,<br/>[Your name]</em></p>

<h2>Leave on good terms</h2>
<ul>
  <li>Tell your manager in person before sending the letter, if you can.</li>
  <li>Offer to help train your replacement and hand over properly.</li>
  <li>Stay positive and professional until your last day.</li>
  <li>Do not badmouth the company, even on your way out.</li>
</ul>

<h2>Your rights on leaving</h2>
<p>You are entitled to be paid for your notice period and any accrued leave. Request a certificate of service, which your employer must provide by law.</p>

<h2>Moving on</h2>
<p>Once you have resigned professionally, focus forward. Browse new opportunities and apply for the role that takes your career further.</p>
`,
    faqs: [
      { q: 'How much notice must I give when resigning in South Africa?', a: 'Under the BCEA, notice is one week if employed under six months, two weeks up to a year, and four weeks after a year. Your contract may require more, so always check it.' },
      { q: 'Do I have to give a reason for resigning?', a: 'No. A resignation letter only needs to state that you are resigning and your last working day. A brief thank-you is professional, but you are not obliged to explain your reasons.' },
      { q: 'Am I entitled to be paid out when I resign?', a: 'Yes. You should be paid for your notice period and any accrued annual leave. You are also entitled to a certificate of service from your employer.' },
    ],
  },
  {
    slug: 'how-to-pass-a-government-job-interview',
    title: 'How to Pass a Government Job Interview in South Africa (2026)',
    h1: 'How to Pass a Government Job Interview',
    description: 'Preparing for a South African government job interview? Learn the panel format, competency questions, documents to bring, and how to stand out for a public service post.',
    category: 'interview',
    updated: '2026-07-01',
    readMins: 8,
    featured: true,
    categorySlug: 'government',
    intro: 'Government interviews in South Africa follow a stricter, more formal process than most private-sector interviews. Understanding the panel format and preparing for competency-based questions gives you a real advantage in a very competitive field.',
    body: `
<h2>Understand the panel format</h2>
<p>Public service interviews are almost always conducted by a panel, usually three to five people including the line manager, a human resources representative and sometimes a subject expert. Each panellist scores your answers against a set list of criteria, so consistency and clarity matter more than charm.</p>

<h2>Know the post and the department</h2>
<p>Re-read the advert and the job description carefully. Panels expect you to understand the department\u2019s mandate, the key responsibilities of the post, and how it fits into service delivery. Read the department\u2019s strategic plan or annual report summary if you can find it.</p>

<h2>Prepare for competency-based questions</h2>
<p>Government panels favour structured, competency-based questions such as "Tell us about a time you had to meet a tight deadline" or "How would you handle a difficult member of the public?" Use the STAR method (Situation, Task, Action, Result) to keep your answers clear and evidence-based.</p>

<h2>Common government interview questions</h2>
<ul>
  <li>Why do you want to work in the public service?</li>
  <li>What do you understand about this department\u2019s role?</li>
  <li>Describe a time you delivered a service under pressure.</li>
  <li>How do you handle confidential information?</li>
  <li>What does Batho Pele mean to you?</li>
</ul>
<p>The Batho Pele ("People First") principles underpin public service in South Africa. Knowing the eight principles and being able to speak to them shows you understand the ethos of government work.</p>

<h2>Bring the right documents</h2>
<ul>
  <li>Certified copies of your ID, qualifications and driver\u2019s licence.</li>
  <li>Your CV and a copy of the advert with the reference number.</li>
  <li>Originals for verification.</li>
</ul>

<h2>Dress and conduct</h2>
<p>Dress formally, arrive early, and treat every panellist with equal respect. Address the panel as a whole, make eye contact with whoever asked the question, and stay calm and measured.</p>

<h2>After the interview</h2>
<p>Government processes can be slow, involving verification, vetting and approvals. Be patient, and if you are shortlisted you may be asked for competency assessments or security clearance.</p>

<h2>Next step</h2>
<p>Prepare thoroughly, and browse the latest government vacancies to put your preparation to work.</p>
`,
    faqs: [
      { q: 'What questions are asked in a government job interview?', a: 'Expect competency-based questions about service delivery, handling pressure and confidentiality, plus questions on the department\u2019s mandate and the Batho Pele principles. Use the STAR method to structure your answers.' },
      { q: 'What are the Batho Pele principles?', a: 'Batho Pele ("People First") is the set of eight public service principles guiding how government serves the public, covering consultation, service standards, access, courtesy, information, openness, redress and value for money.' },
      { q: 'What must I bring to a government interview?', a: 'Bring certified copies of your ID, qualifications and driver\u2019s licence, your CV, the advert with its reference number, and the original documents for verification.' },
    ],
  },
  {
    slug: 'how-to-apply-for-jobs-online',
    title: 'How to Apply for Jobs Online in South Africa (2026 Step-by-Step)',
    h1: 'How to Apply for Jobs Online in South Africa',
    description: 'A step-by-step guide to applying for jobs online in South Africa. How to use job portals, upload your CV, apply through employer sites, and avoid online scams.',
    category: 'job-search',
    updated: '2026-07-01',
    readMins: 7,
    featured: true,
    intro: 'Most jobs in South Africa are now advertised and applied for online. Knowing how to search effectively, present your application, and apply through the right channels puts you ahead of applicants who apply carelessly.',
    body: `
<h2>Get your documents ready first</h2>
<p>Before you start, prepare digital copies you can upload quickly:</p>
<ul>
  <li>An up-to-date CV saved as a PDF, named with your full name.</li>
  <li>Certified copies of your ID and qualifications (scanned as clear PDFs).</li>
  <li>A short, adaptable cover letter or email template.</li>
</ul>

<h2>Search the right way</h2>
<p>Use specific search terms and filters. Search by job title and province, and set up job alerts so new openings come to you. Applying within a day or two of a listing going live noticeably improves your chances.</p>

<h2>Apply through the official channel</h2>
<p>Always apply through the employer\u2019s official application link or portal. Applying at the source means your application reaches the hiring team and your details stay with a legitimate employer. Follow the instructions exactly, because some employers reject applications that skip a required step.</p>

<h2>Tailor every application</h2>
<p>Read the advert, identify the key requirements, and make sure your CV and message speak directly to them. A focused application to ten relevant jobs beats a generic blast to fifty.</p>

<h2>Uploading your CV</h2>
<ul>
  <li>Use PDF unless the portal asks for Word.</li>
  <li>Keep the file size reasonable so it uploads without errors.</li>
  <li>Double-check that the correct, final version uploaded.</li>
</ul>

<h2>Track your applications</h2>
<p>Keep a simple spreadsheet of where and when you applied, the reference number and any deadlines. It helps you follow up and avoid applying twice.</p>

<h2>Stay safe online</h2>
<ul>
  <li>Never pay to apply for a job or an interview.</li>
  <li>Do not share your full ID number or banking details before verifying the employer.</li>
  <li>Be cautious of offers that arrive without you applying.</li>
</ul>

<h2>Start applying</h2>
<p>With your documents ready and your approach focused, browse the latest jobs and apply directly to employers.</p>
`,
    faqs: [
      { q: 'What do I need to apply for jobs online?', a: 'A PDF CV named with your full name, scanned certified copies of your ID and qualifications, a professional email address, and a short adaptable cover letter or email template.' },
      { q: 'How do I apply for a job online safely?', a: 'Apply only through the employer\u2019s official link or portal, never pay any fee, and do not share your full ID or banking details until you have verified that the employer is genuine.' },
      { q: 'Why are my online applications not getting responses?', a: 'Common reasons include applying late, not tailoring your CV to the advert, missing required steps, or an unclear CV. Apply early, follow instructions exactly, and match your CV to each job.' },
    ],
  },
  {
    slug: 'how-to-check-if-a-job-is-legitimate',
    title: 'How to Check if a Job is Legitimate in South Africa (Avoid Scams)',
    h1: 'How to Check if a Job is Legitimate',
    description: 'Protect yourself from job scams in South Africa. Learn the warning signs of fake job offers, how to verify an employer, and what to do if you are targeted.',
    category: 'job-search',
    updated: '2026-07-01',
    readMins: 6,
    popular: true,
    intro: 'Job scams target desperate and hopeful job seekers alike, and they are common in South Africa. Learning to spot the warning signs protects your money, your identity and your safety.',
    body: `
<h2>The biggest red flag: money</h2>
<p>No legitimate employer will ever ask you to pay for a job, an interview, "training materials", a uniform, or a "registration fee". If money is requested at any stage, it is a scam. Walk away and report it.</p>

<h2>Other common warning signs</h2>
<ul>
  <li><strong>An offer with no application.</strong> Being "hired" for a job you never applied for is a classic scam.</li>
  <li><strong>Too good to be true.</strong> Very high pay for little work or few requirements is a lure.</li>
  <li><strong>Pressure and urgency.</strong> Scammers rush you so you do not think clearly.</li>
  <li><strong>Personal email addresses.</strong> Legitimate companies use their own domain, not Gmail or Yahoo.</li>
  <li><strong>Poor spelling and grammar</strong> in official-looking messages.</li>
  <li><strong>Requests for your ID, bank details or documents</strong> before any verified process.</li>
</ul>

<h2>How to verify an employer</h2>
<ul>
  <li>Search the company name plus the word "scam" and see what comes up.</li>
  <li>Check the company has a real website and verifiable contact details.</li>
  <li>Confirm the job appears on the employer\u2019s own careers page.</li>
  <li>Be wary if the only contact is a WhatsApp number.</li>
  <li>Verify that the person contacting you has a company email address.</li>
</ul>

<h2>Protect your personal information</h2>
<p>Never share your full ID number, banking details, or certified documents until you have confirmed the employer is genuine and you are in a real hiring process. Identity theft using stolen documents is a serious risk.</p>

<h2>What to do if you are targeted</h2>
<ul>
  <li>Stop all contact and do not pay anything.</li>
  <li>Report the scam to the police and, if money was taken, your bank immediately.</li>
  <li>Warn others so they do not fall for the same scheme.</li>
</ul>

<h2>Apply with confidence</h2>
<p>Stick to reputable job sources and apply through official employer channels. Browse verified opportunities and apply directly with peace of mind.</p>
`,
    faqs: [
      { q: 'How do I know if a job offer is a scam?', a: 'The clearest sign is any request for money to secure a job, interview or training. Other red flags include offers without an application, personal email addresses, pressure to act fast, and early requests for your ID or banking details.' },
      { q: 'Should I pay a fee to get a job?', a: 'Never. Legitimate employers do not charge you to apply, interview or start work. Any request for a registration, training or placement fee is a scam.' },
      { q: 'What should I do if I gave a scammer my details?', a: 'Stop contact immediately, report it to the police, and if you shared banking details or paid money, contact your bank at once. Monitor your accounts and consider a fraud alert to protect against identity theft.' },
    ],
  },
  {
    slug: 'nsfas-application-guide',
    title: 'NSFAS Application Guide 2026 — Requirements, Dates & How to Apply',
    h1: 'NSFAS Application Guide',
    description: 'A complete NSFAS application guide for South African students. Who qualifies, the income threshold, required documents, how to apply online, and what NSFAS covers.',
    category: 'tvet',
    updated: '2026-07-01',
    readMins: 8,
    featured: true,
    popular: true,
    intro: 'The National Student Financial Aid Scheme (NSFAS) funds hundreds of thousands of students at public universities and TVET colleges each year. This guide explains who qualifies, what it covers, and exactly how to apply.',
    body: `
<h2>What is NSFAS?</h2>
<p>NSFAS is a government bursary scheme that funds qualifying students from poor and working-class families to study at South Africa\u2019s public universities and TVET colleges. For most students it is a bursary, not a loan, meaning it does not have to be repaid provided you meet the conditions.</p>

<h2>Who qualifies for NSFAS?</h2>
<ul>
  <li>South African citizens.</li>
  <li>Students from households with a combined income below the NSFAS threshold (generally up to R350,000 per year; higher for students with disabilities).</li>
  <li>SASSA grant recipients automatically meet the financial requirement.</li>
  <li>Students accepted to, or already studying at, a public university or TVET college.</li>
</ul>

<h2>What does NSFAS cover?</h2>
<ul>
  <li>Tuition fees.</li>
  <li>An accommodation allowance (or transport allowance for students living at home).</li>
  <li>A learning materials allowance.</li>
  <li>A living or personal care allowance, depending on your situation.</li>
</ul>

<h2>Documents you need</h2>
<ul>
  <li>Your ID or birth certificate.</li>
  <li>Parents\u2019 or guardians\u2019 IDs and proof of income (payslips, or an affidavit if unemployed).</li>
  <li>Your latest academic results.</li>
  <li>Proof of any SASSA grant, if applicable.</li>
</ul>

<h2>How to apply, step by step</h2>
<ol>
  <li>Create an account on the official NSFAS portal (my.nsfas.org.za).</li>
  <li>Complete your personal and household details.</li>
  <li>Upload the required supporting documents.</li>
  <li>Submit before the application deadline.</li>
  <li>Track your application status online.</li>
</ol>

<h2>When to apply</h2>
<p>NSFAS applications usually open around September and close early in the year for the following academic year. Apply as early as possible and make sure your documents are complete, as incomplete applications are delayed or rejected.</p>

<h2>After you apply</h2>
<p>Check your status regularly and respond quickly to any request for more information. Once approved, keep meeting the academic requirements to keep your funding.</p>

<h2>Next step</h2>
<p>While you study, explore learnerships, internships and graduate programmes to build experience alongside your qualification.</p>
`,
    faqs: [
      { q: 'Who qualifies for NSFAS funding?', a: 'South African citizens from households earning below the NSFAS income threshold (generally up to R350,000 per year, higher for students with disabilities) who are accepted at or studying at a public university or TVET college. SASSA grant recipients qualify automatically.' },
      { q: 'Does NSFAS have to be paid back?', a: 'For most students NSFAS is a bursary, not a loan, so it does not have to be repaid provided you meet the academic and other conditions of the funding.' },
      { q: 'When do NSFAS applications open?', a: 'Applications generally open around September and close early in the new year for that academic year. Apply as early as possible with complete documents to avoid delays.' },
    ],
  },
  {
    slug: 'tvet-college-application-guide',
    title: 'TVET College Application Guide 2026 — Courses, Dates & How to Apply',
    h1: 'How to Apply to a TVET College',
    description: 'A step-by-step guide to applying to a TVET college in South Africa. Courses offered, entry requirements, application dates, fees, NSFAS funding and how to register.',
    category: 'tvet',
    updated: '2026-07-01',
    readMins: 7,
    featured: true,
    intro: 'TVET colleges offer practical, career-focused qualifications that lead directly to work, and NSFAS can cover the cost. This guide walks you through choosing a course and applying to one of South Africa\u2019s 50 public TVET colleges.',
    body: `
<h2>What TVET colleges offer</h2>
<p>South Africa\u2019s public TVET colleges provide vocational and occupational qualifications aimed at the workplace:</p>
<ul>
  <li><strong>NC(V)</strong> \u2013 National Certificate (Vocational), NQF 2\u20134, a practical alternative to matric.</li>
  <li><strong>NATED / Report 191</strong> \u2013 N1\u2013N6 courses in engineering, business and utility studies.</li>
  <li><strong>Occupational and skills programmes</strong> \u2013 shorter, trade-focused training.</li>
</ul>

<h2>Entry requirements</h2>
<ul>
  <li>For NC(V): Grade 9 or higher.</li>
  <li>For NATED engineering (N1): usually Grade 9 with Maths and Science, or relevant subjects.</li>
  <li>Some programmes require matric or specific subjects.</li>
</ul>

<h2>How to choose a course</h2>
<p>Pick a field with real demand and a clear career path, such as electrical, civil or mechanical engineering, boilermaking, plumbing, business studies, hospitality or IT. Think about the trade or career you want at the end, then work backwards to the right course.</p>

<h2>How to apply, step by step</h2>
<ol>
  <li>Choose a public TVET college near you and check which courses it offers.</li>
  <li>Get the application form from the college website or campus.</li>
  <li>Complete the form and gather your documents: certified ID, latest school results and proof of residence.</li>
  <li>Submit before the closing date, in person or online where available.</li>
  <li>Apply for NSFAS funding at the same time if you qualify.</li>
</ol>

<h2>Fees and funding</h2>
<p>TVET fees are far lower than university, and NSFAS fully funds qualifying students at public colleges, covering tuition and allowances. Never pay a "guaranteed placement" fee to a third party \u2013 apply directly to the college.</p>

<h2>Application dates</h2>
<p>Applications typically open in the second half of the year for the following year, with some colleges accepting mid-year (trimester) intakes. Apply early because popular courses fill up.</p>

<h2>Next step</h2>
<p>Once you are studying, look for in-service training and apprenticeships that turn your qualification into workplace experience.</p>
`,
    faqs: [
      { q: 'What qualifications can I study at a TVET college?', a: 'TVET colleges offer NC(V) qualifications (NQF 2\u20134, an alternative to matric), NATED N1\u2013N6 courses in engineering, business and utility studies, and shorter occupational and skills programmes.' },
      { q: 'Do I need matric to study at a TVET college?', a: 'Not always. NC(V) programmes accept Grade 9 or higher, and many NATED engineering courses start at N1 with Grade 9 and relevant subjects. Some advanced programmes do require matric.' },
      { q: 'Does NSFAS pay for TVET college?', a: 'Yes. NSFAS fully funds qualifying students at public TVET colleges, covering tuition and providing allowances. For TVET students it is a bursary, not a loan.' },
    ],
  },
  {
    slug: 'uif-paye-sdl-explained',
    title: 'UIF, PAYE and SDL Explained — Understanding Your SA Payslip (2026)',
    h1: 'UIF, PAYE and SDL Explained',
    description: 'Confused by the deductions on your South African payslip? A clear guide to UIF, PAYE and SDL, what each one is, who pays it, and how to claim UIF when you need it.',
    category: 'career',
    updated: '2026-07-01',
    readMins: 7,
    popular: true,
    intro: 'Your first payslip can be confusing, with deductions like UIF, PAYE and SDL reducing your take-home pay. This guide explains exactly what each one is, who pays it, and why it matters to you.',
    body: `
<h2>PAYE (Pay As You Earn)</h2>
<p>PAYE is income tax deducted from your salary by your employer and paid to SARS on your behalf. The amount depends on how much you earn \u2013 the more you earn, the higher the percentage. If your income is below the annual tax threshold, you pay no PAYE.</p>
<ul>
  <li>Paid by: you (deducted from your salary).</li>
  <li>Goes to: SARS (income tax).</li>
  <li>Why it matters: it is your income tax; you may get a refund at tax time if too much was deducted.</li>
</ul>

<h2>UIF (Unemployment Insurance Fund)</h2>
<p>UIF is a safety net that pays you benefits if you lose your job, cannot work due to illness, or take maternity leave. Both you and your employer contribute 1% of your salary each, so 2% in total goes to the fund.</p>
<ul>
  <li>Paid by: you (1%) and your employer (1%).</li>
  <li>Goes to: the Unemployment Insurance Fund.</li>
  <li>Why it matters: you can claim from it if you become unemployed or go on maternity or illness leave.</li>
</ul>

<h2>SDL (Skills Development Levy)</h2>
<p>SDL funds skills training and learnerships in South Africa. Importantly, it is paid by your employer, not deducted from your salary. It should not reduce your take-home pay.</p>
<ul>
  <li>Paid by: your employer (1% of payroll), not you.</li>
  <li>Goes to: SETAs, to fund skills development and learnerships.</li>
  <li>Why it matters: it funds the learnerships and training many workers benefit from.</li>
</ul>

<h2>How to claim UIF</h2>
<p>If you lose your job, you can claim UIF benefits. You will generally need:</p>
<ul>
  <li>Your ID.</li>
  <li>Your UI-19 form (your employer declares your employment and end date).</li>
  <li>A certificate of service.</li>
  <li>Your banking details.</li>
</ul>
<p>Apply through the Department of Employment and Labour, online via uFiling or at a labour centre. Claim as soon as possible after your employment ends.</p>

<h2>Check your payslip</h2>
<p>Make sure your payslip shows PAYE and UIF deducted correctly, and that SDL is not being deducted from your salary. If something looks wrong, ask your HR or payroll department to explain.</p>

<h2>Know your rights</h2>
<p>Understanding your payslip helps you plan and protects you. For more on your rights at work, read our other career guides and browse current opportunities.</p>
`,
    faqs: [
      { q: 'What is the difference between UIF, PAYE and SDL?', a: 'PAYE is your income tax deducted and paid to SARS. UIF is unemployment insurance, with you and your employer each contributing 1%. SDL is a skills levy paid by your employer only, funding training and learnerships.' },
      { q: 'Is SDL deducted from my salary?', a: 'No. The Skills Development Levy is paid by your employer based on total payroll and should not be deducted from your salary. Only PAYE and your 1% UIF share come off your pay.' },
      { q: 'How do I claim UIF if I lose my job?', a: 'Apply through the Department of Employment and Labour via uFiling online or at a labour centre. You need your ID, UI-19 form, certificate of service and banking details, and should claim as soon as possible after your job ends.' },
    ],
  },
  {
    slug: 'graduate-jobs-vs-learnerships',
    title: 'Graduate Jobs vs Learnerships in South Africa — Which is Right for You?',
    h1: 'Graduate Jobs vs Learnerships',
    description: 'Not sure whether to pursue a graduate job or a learnership in South Africa? Compare pay, qualifications, experience and career outcomes to choose the right path.',
    category: 'career',
    updated: '2026-07-01',
    readMins: 6,
    intro: 'If you are starting out, you may be weighing up a graduate job against a learnership. They serve different needs, and the right choice depends on your qualifications, your goals and where you are in your journey. Here is how they compare.',
    body: `
<h2>What is a graduate job?</h2>
<p>A graduate job (or graduate programme) is for people who have already completed a diploma or degree. It is a paid, permanent or fixed-term role, often structured to develop you into a specialist or manager. Graduate programmes at big employers can be rotational and competitive.</p>

<h2>What is a learnership?</h2>
<p>A learnership combines work and study. You earn a stipend while gaining an accredited NQF qualification and real workplace experience. Learnerships are ideal if you have matric (or sometimes less) and want to enter the workforce and earn a qualification at the same time.</p>

<h2>Side-by-side comparison</h2>
<ul>
  <li><strong>Entry requirement:</strong> Graduate job needs a completed qualification; learnership usually needs matric or less.</li>
  <li><strong>Pay:</strong> Graduate jobs pay a salary; learnerships pay a stipend to cover basic costs.</li>
  <li><strong>Outcome:</strong> Graduate job builds a career in your field; learnership gives you an accredited qualification plus experience.</li>
  <li><strong>Duration:</strong> Graduate programmes run 12\u201324 months or are permanent; learnerships are usually 12 months.</li>
  <li><strong>Best for:</strong> Graduates vs school leavers and career changers.</li>
</ul>

<h2>Which should you choose?</h2>
<ul>
  <li><strong>Choose a graduate job</strong> if you have a diploma or degree and want to start your professional career and earn a full salary.</li>
  <li><strong>Choose a learnership</strong> if you have matric (or are still building qualifications), want to earn while you learn, and need both a recognised qualification and work experience.</li>
</ul>

<h2>Can a learnership lead to a permanent job?</h2>
<p>Often, yes. Many employers keep on strong learners after the programme, and the qualification plus experience makes you far more employable elsewhere too.</p>

<h2>Next step</h2>
<p>Whichever path fits you, browse current graduate programmes and learnerships and apply early, as both fill quickly.</p>
`,
    faqs: [
      { q: 'Is a learnership better than a graduate job?', a: 'Neither is universally better. A graduate job suits those with a completed qualification who want to start a professional career, while a learnership suits school leavers who want to earn a stipend while gaining an accredited qualification and experience.' },
      { q: 'Do learnerships pay less than graduate jobs?', a: 'Yes. Learnerships pay a stipend meant to cover transport and basic costs while you study and work, whereas graduate jobs pay a full salary. However, a learnership adds a qualification and experience that raise your future earning power.' },
      { q: 'Can I do a graduate programme without experience?', a: 'Yes. Graduate programmes are designed for recent graduates with little or no work experience. They provide structured training to develop you, so they focus on your qualification and potential rather than prior experience.' },
    ],
  },
  {
    slug: 'what-employers-look-for-in-graduates',
    title: 'What Employers Look for in Graduates in South Africa (2026)',
    h1: 'What Employers Look for in Graduates',
    description: 'What do South African employers really want from graduates? Beyond your degree, learn the skills, attitudes and experience that win graduate jobs and programmes.',
    category: 'career',
    updated: '2026-07-01',
    readMins: 7,
    intro: 'A qualification gets you noticed, but it is rarely enough on its own. South African employers hiring graduates look for a mix of skills, attitude and evidence of potential. Knowing what they value helps you stand out in a competitive field.',
    body: `
<h2>1. The right attitude</h2>
<p>Employers consistently rank attitude above marks for entry-level hires. They want graduates who are willing to learn, take feedback well, show initiative and are reliable. A humble, eager attitude often beats a slightly higher qualification.</p>

<h2>2. Communication skills</h2>
<p>Being able to write clearly, speak confidently and listen well matters in every job. Graduates who can explain their ideas and work with others are far more employable.</p>

<h2>3. Practical experience</h2>
<p>Any experience helps: vacation work, internships, part-time jobs, volunteering or student projects. It shows you can apply knowledge and function in a workplace. If you have little experience, highlight academic projects and any responsibility you have held.</p>

<h2>4. Problem-solving</h2>
<p>Employers value graduates who can think, not just recite. Being able to break down a problem, weigh options and suggest a solution is a skill you can demonstrate with examples in interviews.</p>

<h2>5. Digital and technical skills</h2>
<p>Comfort with the tools of your field, plus general digital literacy (email, spreadsheets, online collaboration), is expected. In technical fields, relevant software or certifications add real weight.</p>

<h2>6. Teamwork and interpersonal skills</h2>
<p>Very little work happens alone. Evidence that you can work in a team, from group projects to sports and societies, reassures employers you will fit in.</p>

<h2>7. Commercial awareness</h2>
<p>Understanding how the organisation makes money or delivers its service, and how your role contributes, sets you apart. Research the employer and its industry before you apply.</p>

<h2>How to show these on your CV and in interviews</h2>
<ul>
  <li>Give specific examples with results, not vague claims.</li>
  <li>Use your academic projects, part-time work and activities as evidence.</li>
  <li>Tailor each application to the skills the advert emphasises.</li>
  <li>Prepare STAR-method stories for interviews.</li>
</ul>

<h2>Next step</h2>
<p>Sharpen your CV with our graduate CV guide, then browse current graduate programmes and entry-level roles and apply.</p>
`,
    faqs: [
      { q: 'What do employers look for in graduates besides a degree?', a: 'Attitude, communication skills, any practical experience, problem-solving, digital skills, teamwork and commercial awareness. For entry-level hires, employers often value a willingness to learn and reliability above marks.' },
      { q: 'How can I stand out as a graduate with no experience?', a: 'Highlight academic projects, part-time or vacation work, volunteering and leadership in societies or sports. Show transferable skills with specific examples and demonstrate a strong, eager attitude.' },
      { q: 'Do marks matter for graduate jobs?', a: 'Marks can help you pass initial screening, especially for competitive programmes, but employers weigh attitude, skills and experience heavily. A well-rounded graduate often beats one with higher marks alone.' },
    ],
  },
  {
    slug: 'remote-jobs-south-africa-guide',
    title: 'Remote Jobs in South Africa — A Realistic Guide (2026)',
    h1: 'Remote Jobs in South Africa: A Realistic Guide',
    description: 'A realistic guide to remote jobs in South Africa. Which roles are genuinely remote, what you need to work from home, how to find legitimate remote work and avoid scams.',
    category: 'job-search',
    updated: '2026-07-01',
    readMins: 8,
    featured: true,
    intro: 'Remote work has grown fast in South Africa, but there is a lot of hype and plenty of scams. This honest guide explains which jobs are realistically remote, what you need to do them, and how to find genuine opportunities.',
    body: `
<h2>Which jobs are realistically remote?</h2>
<p>Not every job can be done from home. The roles most commonly available remotely in South Africa include:</p>
<ul>
  <li><strong>Technology</strong> \u2013 software development, testing, data, IT support.</li>
  <li><strong>Customer support and BPO</strong> \u2013 including international campaigns.</li>
  <li><strong>Digital marketing</strong> \u2013 content, social media, SEO, design.</li>
  <li><strong>Writing and admin</strong> \u2013 copywriting, virtual assistance, bookkeeping.</li>
  <li><strong>Sales</strong> \u2013 inside sales and account management.</li>
</ul>
<p>Roles that require physical presence \u2013 retail, warehousing, healthcare, trades, security \u2013 are generally not remote.</p>

<h2>What you actually need</h2>
<ul>
  <li>A reliable internet connection (fibre or a strong LTE signal) and a backup for load shedding.</li>
  <li>A power backup plan \u2013 an inverter, UPS or power bank matters in South Africa.</li>
  <li>A quiet, dedicated workspace.</li>
  <li>A capable laptop and, for support roles, a headset.</li>
  <li>Self-discipline and good time management.</li>
</ul>

<h2>Local vs international remote work</h2>
<p>You can work remotely for a South African employer, or for an international company that pays in foreign currency (which can pay significantly more). International roles are competitive and usually require proven skills and often overlap with certain time zones.</p>

<h2>How to find genuine remote jobs</h2>
<ul>
  <li>Search reputable job boards and filter for "remote".</li>
  <li>Apply through official employer channels.</li>
  <li>Build a portfolio or profile that proves your skills.</li>
  <li>Network on LinkedIn and in relevant online communities.</li>
</ul>

<h2>Avoiding remote-work scams</h2>
<p>Remote work attracts scams. Be very cautious of:</p>
<ul>
  <li>"Work from home" offers that ask you to pay upfront for kits or training.</li>
  <li>Data-capturing or "envelope stuffing" schemes promising high pay for no skill.</li>
  <li>Roles that require you to receive and forward money or parcels.</li>
</ul>
<p>Legitimate remote employers never ask you to pay to start.</p>

<h2>Be realistic</h2>
<p>Genuine remote jobs usually require real, marketable skills. If you are starting out, building a skill (like coding, design or digital marketing) dramatically improves your remote prospects.</p>

<h2>Start your search</h2>
<p>Browse current remote openings and apply directly to legitimate employers.</p>
`,
    faqs: [
      { q: 'What remote jobs are available in South Africa?', a: 'The most common genuinely remote roles are in technology (development, IT support, data), customer support and BPO, digital marketing, writing and admin, and inside sales. Physical roles like retail and trades cannot be done remotely.' },
      { q: 'What do I need to work remotely in South Africa?', a: 'A reliable internet connection with a load-shedding backup, a power backup like a UPS or inverter, a quiet workspace, a capable laptop, and strong self-discipline and time management.' },
      { q: 'How do I avoid remote-job scams?', a: 'Never pay upfront for kits, training or registration. Avoid schemes promising high pay for no skill and any role that asks you to receive and forward money or parcels. Apply through official employer channels only.' },
    ],
  },
  {
    slug: 'best-careers-without-a-degree-south-africa',
    title: 'Best Careers Without a Degree in South Africa (2026)',
    h1: 'Best Careers Without a Degree in South Africa',
    description: 'You do not always need a degree to build a good career in South Africa. Explore well-paid trades, skills and roles you can enter through TVET, learnerships and experience.',
    category: 'career',
    updated: '2026-07-01',
    readMins: 8,
    featured: true,
    popular: true,
    intro: 'A university degree is not the only route to a stable, well-paid career in South Africa. Many of the country\u2019s most in-demand and best-paid jobs are reached through trades, TVET qualifications, learnerships and experience. Here are some of the best.',
    body: `
<h2>Skilled trades (artisans)</h2>
<p>Qualified artisans are on South Africa\u2019s scarce-skills list and can earn very well, especially in mining, manufacturing and construction. Most start with a TVET N-course and an apprenticeship, then pass a trade test.</p>
<ul>
  <li><strong>Electrician</strong> \u2013 strong demand, good self-employment potential.</li>
  <li><strong>Plumber</strong> \u2013 excellent self-employment income.</li>
  <li><strong>Welder</strong> \u2013 coded welders are highly paid.</li>
  <li><strong>Boilermaker, fitter and turner, millwright</strong> \u2013 sought-after in industry.</li>
</ul>

<h2>Driving and logistics</h2>
<p>A Code 10 or Code 14 licence with a PrDP opens well-paid driving work, and warehouse roles with a forklift licence offer steady progression to supervisor.</p>

<h2>Security</h2>
<p>With PSIRA training and grading, you can build a security career from officer to armed response and management, no degree required.</p>

<h2>Sales</h2>
<p>Sales rewards results over qualifications. Strong salespeople in insurance, property, retail and tech can earn well through commission.</p>

<h2>Technology</h2>
<p>Tech is increasingly skills-first. Through coding bootcamps, TVET IT courses, certifications and a strong portfolio, you can enter software development, IT support and data roles without a degree.</p>

<h2>Beauty, hospitality and personal services</h2>
<p>Hairdressing, beauty therapy, chef and hospitality careers are built on practical qualifications and experience, with strong self-employment potential.</p>

<h2>Emergency and protection services</h2>
<p>Police (SAPS), traffic officers and emergency services offer stable government careers entered with matric plus in-service training.</p>

<h2>How to get started without a degree</h2>
<ul>
  <li>Enrol at a TVET college for a practical qualification.</li>
  <li>Apply for learnerships and apprenticeships to earn while you learn.</li>
  <li>Get licensed or certified for your field (trade test, PSIRA, forklift, PrDP).</li>
  <li>Build experience and a reputation \u2013 reliability opens doors.</li>
</ul>

<h2>Next step</h2>
<p>Explore learnerships, TVET options and entry-level roles, and browse current jobs that match a skills-first career path.</p>
`,
    faqs: [
      { q: 'What is the best career without a degree in South Africa?', a: 'Skilled trades like electrician, plumber and coded welder are among the best, as qualified artisans are scarce and well paid. Driving (Code 14), technology through bootcamps, sales, and security also offer strong careers without a degree.' },
      { q: 'Can I earn good money without a degree in South Africa?', a: 'Yes. Qualified artisans, coded welders, Code 14 drivers, skilled salespeople and self-taught tech workers can earn well. Trades and technical skills often pay more than many degree-based entry roles.' },
      { q: 'How do I start a career without going to university?', a: 'Enrol at a TVET college, apply for learnerships and apprenticeships to earn while you learn, get the relevant licence or certification for your field, and build experience and a reputation for reliability.' },
    ],
  },
];
