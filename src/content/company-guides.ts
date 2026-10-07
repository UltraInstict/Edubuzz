/** Independent preparation advice, not vacancy adverts or employer endorsements. */
export interface CompanyGuideFAQ { q: string; a: string }
export interface CompanyGuide {
  slug: string; name: string; sector: string; title: string; description: string;
  overview: string; careerAreas: string[]; entryLevel: string; howToApply: string;
  preparation: { title: string; text: string }[]; checks: string[];
  faqs: CompanyGuideFAQ[]; officialSite: string; sourceNote: string;
  updated: string; careerLinks: string[];
}
type Input = Omit<CompanyGuide, 'title' | 'description' | 'updated' | 'howToApply'> & { applicationTip: string };
function guide(input: Input): CompanyGuide {
  const { applicationTip, ...content } = input;
  return { ...content, updated: '2026-10-07',
    title: `${input.name} Careers: Application & Preparation Guide`,
    description: `Prepare for applications to ${input.name}: compare career routes, read advert requirements, build relevant CV evidence and find the employer careers channel.`,
    howToApply: `<ol>
      <li><strong>Start at the employer careers page.</strong> Follow its vacancy links rather than a forwarded message. Search for a role and location that fit your circumstances. Registering a profile is not necessarily an application to a vacancy.</li>
      <li><strong>Read the full advert.</strong> Save its title, reference, location, deadline and essential requirements. Separate required qualifications or experience from attributes described as desirable. Ask the verified contact about unclear requirements rather than guessing.</li>
      <li><strong>Prepare relevant evidence.</strong> ${applicationTip} Use accurate dates and explain your own contribution. Do not invent employment, qualifications or systems experience.</li>
      <li><strong>Follow the submission instructions.</strong> Create an account if requested, check uploaded files are readable, complete screening questions and submit before the stated deadline. Share sensitive documents only when requested through a verified channel.</li>
      <li><strong>Keep a record.</strong> Save the confirmation and reference, check your email and spam folder, and use the portal status feature if available. An acknowledgement is not an interview or offer; keep considering other suitable opportunities.</li>
    </ol>`,
  };
}
export const COMPANY_GUIDES: CompanyGuide[] = [
  guide({
    slug: 'shoprite', name: 'Shoprite', sector: 'Retail',
    overview: `<p>For an applicant, the useful distinction is between supermarket-floor work, moving stock through distribution, and specialist work supporting the business. A customer-facing application should not read like an application for IT or accounting.</p><p>This guide helps you prepare for those routes. It does not confirm that a nearby Shoprite or Checkers store is hiring. Use the group careers page to identify the route and instructions for the opportunity you actually want.</p>`,
    careerAreas: ['Store operations', 'Fresh-food work', 'Distribution', 'Technology', 'Finance and support'],
    entryLevel: `<p>Compare duties, not just titles. Till work calls for accuracy and customer communication; stock work calls for checking and organisation; food-department work can involve particular training and safety responsibilities. These are different applications even within one store.</p><p>Do not treat matric as a guaranteed company-wide minimum or assume no experience is needed. Read the education, experience and availability conditions. For training, check the duration and outcome and whether subsequent employment is actually promised in writing.</p>`,
    applicationTip: 'For store work, prioritise customer assistance, accurate money or stock handling, teamwork and dependable attendance. For distribution or specialist work, match your practical or technical experience to the advert.',
    preparation: [
      { title: 'Make a retail CV concrete', text: 'A school fundraiser, community event or family-business task can show useful skills without being labelled formal employment. Explain what you did: helped people locate items, counted stock against a list, or reconciled sales and change. Identify the setting and dates; use numbers only when you can support them.' },
      { title: 'Plan around the actual workplace', text: 'Work out whether you can reach the advertised site at the stated hours. Ask about scheduling if unclear. Willingness to work is not the same as a workable transport plan. Avoid promising unrestricted availability if you have study or caregiving commitments.' },
      { title: 'Prepare service and accuracy examples', text: 'Choose one example of resolving a misunderstanding calmly and one of spotting an error. Explain the situation, your action and result. This is preparation advice, not a claim about Shoprite interview questions; follow the assessment instructions actually supplied by the employer.' },
    ],
    checks: ['Which brand and workplace are named?', 'Is this employment, a talent pool or training?', 'What hours, experience and documents are requested?'],
    faqs: [
      { q: 'Does this page list open Shoprite jobs?', a: 'No. It is an independent preparation guide. Check the official channel for current opportunities and closing dates.' },
      { q: 'Can I use one CV for every role?', a: 'Keep a truthful master CV but select evidence relevant to the advert. Till accuracy, food work, distribution and technical roles need different emphasis.' },
      { q: 'Should I pay someone to secure an interview?', a: 'Do not pay someone promising a job or guaranteed interview. Verify recruitment messages through the employer website before sharing documents.' },
    ],
    officialSite: 'https://www.shopriteholdings.co.za/careers.html',
    sourceNote: 'Employer careers starting point. Automated retrieval was blocked during this review; current intakes, requirements and portal steps are not asserted here.',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  }),
  guide({
    slug: 'capitec', name: 'Capitec Bank', sector: 'Banking',
    overview: `<p>Capitec's official careers page links to jobs, CV registration and early-career opportunities. It describes operations and service work and registration for updates. Registering interest should not be confused with applying to an advertised role.</p><p>Decide whether your strongest evidence is client service, operational accuracy or technical problem-solving. These routes need different preparation. The current advert remains the source for eligibility and selection instructions.</p>`,
    careerAreas: ['Client service', 'Operations', 'Technology and data', 'Early-career opportunities'],
    entryLevel: `<p>The careers page invites graduates, interns and junior candidates to explore early careers. That does not mean every vacancy accepts school leavers or applicants without experience. Compare each role's education and experience requirements.</p><p>For service work, identify evidence of explaining information and checking details. For technical work, identify projects and methods you can discuss. Enthusiasm, a banking account or an unrelated certificate does not replace an essential requirement.</p>`,
    applicationTip: 'Select evidence of clear explanations, careful records or relevant technical projects. Tailor it to service, operations or technology rather than simply saying you want to work at a bank.',
    preparation: [
      { title: 'Explain a process in plain language', text: 'Practise explaining a familiar process to someone who has never used it. Break it into steps and check understanding. On your CV, describe a real occasion when you helped someone understand instructions; do not present the practice exercise as banking experience.' },
      { title: 'Demonstrate accuracy safely', text: 'Use an example of checking a list, detecting an incorrect total or following a procedure. Explain your method and correction. Do not bring customer records, account details or confidential material from a former workplace to demonstrate your ability.' },
      { title: 'Prepare for the actual interview format', text: 'Capitec links to video-interview preparation. If invited remotely, test sound, camera and connection and arrange a quiet space. Ask the verified recruiter about accessibility or technical constraints in advance rather than assuming every applicant uses one format.' },
    ],
    checks: ['Is this junior, graduate or experienced work?', 'Have you applied to a role as well as registered?', 'What assessment instructions were actually provided?'],
    faqs: [
      { q: 'Where should I start?', a: 'Use the official About Us careers page, then follow its jobs or early-careers links and the selected advert instructions.' },
      { q: 'Is a service role automatically open to matriculants?', a: 'No company-wide minimum is established here. The advert determines qualification and experience requirements.' },
      { q: 'Does Edubuzz submit my CV?', a: 'No. Apply directly through the employer channel. Edubuzz does not shortlist candidates.' },
    ],
    officialSite: 'https://www.capitecbank.co.za/about-us/careers/',
    sourceNote: 'Official careers overview: jobs, CV registration, early careers and video-interview preparation. No live vacancies are reproduced.',
    careerLinks: ['how-to-become-a-data-analyst', 'entry-level-careers-in-south-africa'],
  }),
  guide({
    slug: 'standard-bank', name: 'Standard Bank', sector: 'Banking',
    overview: `<p>Standard Bank's careers hub separates teams, early-career routes, hiring journeys and job search. Its early-careers section covers bursaries, internships, learnerships and graduate programmes. These are different opportunities, not four names for the same job.</p><p>Choose a route before preparing an application. The group hub covers multiple countries, so check that the opportunity is in South Africa and that its location and eligibility conditions fit you.</p>`,
    careerAreas: ['Personal and private banking', 'Business and commercial banking', 'Corporate and investment banking', 'Technology and specialist functions', 'Early-career routes'],
    entryLevel: `<p>A bursary concerns funding; a graduate programme is tied to its academic requirements; an internship or learnership has its own conditions and duration. Do not assume these routes accept the same qualification level.</p><p>For employment, compare duties and experience separately from programme requirements. If studies are incomplete, state your expected completion date accurately. Do not describe yourself as a graduate before completing the qualification.</p>`,
    applicationTip: 'For an academic route, identify relevant coursework and projects alongside requested documents. For employment, explain relevant responsibilities and outcomes rather than relying on your qualification title.',
    preparation: [
      { title: 'Translate coursework into evidence', text: 'Choose a project resembling the advertised work. Explain the question, method, your contribution and conclusion. For group work, distinguish your part from the team result. Be ready to discuss limitations rather than just naming software or modules.' },
      { title: 'Compare programmes practically', text: 'Record the location, deadline, qualification discipline, completion conditions and duration. Check any stated rotation or placement arrangements. Do not assume a bursary includes a job offer or an internship guarantees permanent employment.' },
      { title: 'Read the hiring-journey guidance', text: 'Use the employer guidance for your chosen route. Prepare examples of problem-solving, collaboration and learning from feedback, then adapt to your invitation. Avoid supposed leaked questions or assuming every business unit uses the same interview sequence.' },
    ],
    checks: ['Is South Africa the opportunity country?', 'Is this funding, training or employment?', 'Do you meet discipline and completion requirements?'],
    faqs: [
      { q: 'Is there an early-careers section?', a: 'Yes. The official hub links to bursaries, internships, learnerships and graduate programmes. Check each route for current conditions and dates.' },
      { q: 'Must every applicant upload a transcript?', a: 'Follow the specific instructions. This guide does not impose a transcript requirement on every role.' },
      { q: 'How long will a response take?', a: 'No universal response time is established here. Follow any timeline in the advert or invitation and portal status where available.' },
    ],
    officialSite: 'https://www.standardbank.com/sbg/standard-bank-group/careers',
    sourceNote: 'Official careers hub: teams, early-career routes, hiring journeys and job search. Confirm details in the selected programme or advert.',
    careerLinks: ['how-to-become-a-data-analyst', 'how-to-become-an-accountant'],
  }),
  guide({
    slug: 'woolworths', name: 'Woolworths', sector: 'Retail',
    overview: `<p>This guide concerns Woolworths South Africa. Brand searches can return overseas retailers or unrelated opportunities, so check the country and employer before creating an account. Start with the South African careers site below.</p><p>Prepare for the type of work, not only the brand. Customer assistance, stock handling, food operations and office-based work need different evidence. This page does not claim a current academy intake, a particular culture or a vacancy at your nearest store.</p>`,
    careerAreas: ['Store operations', 'Food and fashion retail', 'Supply chain', 'Buying and planning', 'Head-office functions'],
    entryLevel: `<p>For first store applications, read the duties: serving customers, replenishing stock or supporting a department. Check qualifications, experience and scheduling. No universal minimum qualification is established here.</p><p>For trainee or seasonal adverts, check duration and conditions rather than assuming permanent employment. For buying, planning or office roles, address specialist requirements instead of using a general store CV.</p>`,
    applicationTip: 'For customer-facing work, show patient assistance, organisation and following procedures. For buying or planning, prioritise commercial, analytical or product-related evidence you can explain.',
    preparation: [
      { title: 'Prepare a useful service example', text: 'Describe how you established what someone needed, offered an appropriate option and dealt with uncertainty. A volunteer example is useful when labelled honestly. Do not claim product expertise you lack; explain how you checked information or asked for help.' },
      { title: 'Distinguish food and fashion duties', text: 'Read the department and responsibilities. Food-related work may emphasise handling procedures; fashion work may emphasise customer assistance and presentation. Product interest alone is not proof of the training or practical skills required by the advert.' },
      { title: 'Check your commute and commitments', text: 'Estimate transport time and cost for the stated workplace and hours. Ask about contractual hours when invited to discuss the role. Do not assume appointment at your closest store or promise hours you cannot manage alongside study or other responsibilities.' },
    ],
    checks: ['Is this Woolworths South Africa?', 'Which department and workplace are named?', 'Is the contract seasonal, fixed-term or permanent?'],
    faqs: [
      { q: 'Can I use an overseas Woolworths careers site?', a: 'Use the channel for the employer and country named in the advert. This guide links to the South African retailer.' },
      { q: 'Will seasonal work become permanent?', a: 'Do not assume that. Check contract duration and any written progression arrangements.' },
      { q: 'What if an old account stops working?', a: 'Use the current site recovery or help options. Do not send your password to someone offering to repair your application.' },
    ],
    officialSite: 'https://careers.woolworths.co.za/index.php',
    sourceNote: 'South African careers site identified in search. Automated retrieval was unavailable; exact portal behaviour and current adverts need checking on the site.',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  }),
  guide({
    slug: 'pick-n-pay', name: 'Pick n Pay', sector: 'Retail',
    overview: `<p>Pick n Pay careers material distinguishes store operations, supply chain and support-office work. Use that distinction to decide what to search for and what evidence belongs at the top of your CV.</p><p>This is not a combined recruitment guide for every associated retailer. Follow the employer and channel named in the advert. We do not confirm franchise recruitment arrangements, live vacancies or an open learnership intake here.</p>`,
    careerAreas: ['Store operations', 'Fresh-food work', 'Supply chain and logistics', 'Support office'],
    entryLevel: `<p>Compare till, stock and food-department responsibilities instead of applying identically to every title. Read essential education and experience conditions; general-assistant roles do not necessarily share requirements.</p><p>Assess supply-chain roles separately, including shifts and any licences or equipment experience specifically requested. Do not claim machinery competence from watching others use equipment.</p>`,
    applicationTip: 'Show accurate customer or stock work for store operations, organised checking for supply chain, and relevant technical or professional evidence for support-office roles.',
    preparation: [
      { title: 'Explain a stock-handling task', text: 'Describe checking quantities, organising items or reporting a mismatch. A part-time or volunteer example can be useful if accurately labelled. Your method is more informative than an unsupported phrase such as “excellent stock-control skills”.' },
      { title: 'Check who is actually hiring', text: 'Save the organisation and workplace from the advert. A familiar brand does not alone establish who issues the contract or receives applications. For franchise or separate-organisation adverts, verify instructions rather than assuming a central portal applies.' },
      { title: 'Prepare practical questions', text: 'Ask about duties, training and contractual hours when invited to discuss the role. Keep questions specific to the advert. Do not spend money travelling to a location supplied only by an unverified message or treat an interview as a guaranteed appointment.' },
    ],
    checks: ['Is this store, supply-chain or support-office work?', 'Which organisation and site are named?', 'Where does the official advert say to submit?'],
    faqs: [
      { q: 'Should I leave a paper CV in store?', a: 'Follow the specific opportunity instructions. This guide cannot confirm whether a particular store accepts paper CVs; a drop-off is not automatically a completed online application.' },
      { q: 'Is a candidate account enough?', a: 'Check that you applied to the selected listing and received confirmation, rather than only creating a profile.' },
      { q: 'Does this guide cover Boxer applications?', a: 'Do not assume a shared recruitment process. Use the channel of the employer named in the vacancy.' },
    ],
    officialSite: 'https://www.pnp.co.za/careers',
    sourceNote: 'Careers starting point. Search surfaced careers material on the employer preview subdomain; the main page could not be retrieved automatically. Current submission links remain unconfirmed in this review.',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  }),
  guide({
    slug: 'clicks', name: 'Clicks Group', sector: 'Retail / Health',
    overview: `<p>Clicks Group's recruitment portal provides job search with listing references and role categories. Use these to identify a specific opportunity rather than a social-media headline saying “Clicks is hiring”.</p><p>Separate retail work from professional or training routes. A health-and-beauty store vacancy is not automatically a pharmacy position, and retail experience does not qualify someone for every professional role.</p>`,
    careerAreas: ['Retail store work', 'Pharmacy-related routes', 'Distribution', 'Merchandising and support'],
    entryLevel: `<p>For shop-assistant or cashier adverts, read the service, education and experience conditions. For a learnership, check its entry criteria, training outcome, duration and deadline. Training and qualified professional posts are different routes.</p><p>If a pharmacy-related advert specifies registration, check the exact category and evidence required. This guide does not interpret professional eligibility or establish one minimum across Clicks roles.</p>`,
    applicationTip: 'Keep retail service evidence distinct from pharmacy qualifications. Name only credentials you actually hold and apply to the route for which the advert says you are eligible.',
    preparation: [
      { title: 'Help without overstating expertise', text: 'Show listening, checking information and referring questions outside your competence to an appropriate colleague. Retail preparation should demonstrate respectful assistance, not a claim to provide clinical advice. Understand the boundary between product assistance and professional responsibilities.' },
      { title: 'Read training as a commitment', text: 'Record location, duration, attendance conditions and stated outcome. Check whether you can participate for the full period. If an allowance, qualification or later employment is not stated, do not assume it; ask the verified contact.' },
      { title: 'Keep the listing reference', text: 'Save the reference with your confirmation and application date. It distinguishes similar positions and locations. If contacted later, compare the role details against your saved record before sharing additional documents.' },
    ],
    checks: ['Is this retail, training or a professional post?', 'Which qualifications or registration category are named?', 'Have you saved the listing reference and workplace?'],
    faqs: [
      { q: 'Is retail work the same as pharmacy work?', a: 'No. Compare duties and requirements. Pharmacy-related adverts may specify training or credentials not required by general retail adverts.' },
      { q: 'Is every learnership open to everyone?', a: 'Check the target group and entry conditions. A learnership is not interchangeable with a qualified professional vacancy.' },
      { q: 'Why save the listing reference?', a: 'It identifies your application and helps you verify later correspondence against the advert and confirmation.' },
    ],
    officialSite: 'https://careers.clicksgroup.co.za/applicant/index.php?controller=Page&name=jobsearch',
    sourceNote: 'Official recruitment portal search, with listing references and categories. Check professional and programme requirements in each advert.',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  }),
  guide({
    slug: 'mr-price', name: 'Mr Price Group', sector: 'Retail',
    overview: `<p>Mr Price Group's official careers material presents store, buying, planning, creative and support routes. Choose a function rather than treating an interest in fashion as a qualification for every role.</p><p>This guide avoids assumptions about age, personality or automatic promotion. Prepare evidence of the work you can do. Check the South African employer identity to avoid confusion with similarly named overseas businesses.</p>`,
    careerAreas: ['Store operations', 'Buying and planning', 'Creative and marketing', 'Distribution', 'Technology and finance'],
    entryLevel: `<p>For stores, identify practical service and teamwork examples. For buying, planning or creative routes, read the academic, commercial, numerical or portfolio requirements; these differ from store requirements.</p><p>A student-interest registration or talent pool is not necessarily a vacancy application. Check the requested action and save confirmation of your completed role application.</p>`,
    applicationTip: 'Choose service evidence for stores, analytical evidence for planning, and your own relevant creative work for portfolio requests. Explain your contribution rather than relying on brand enthusiasm.',
    preparation: [
      { title: 'Distinguish buying from planning', text: 'Check whether tasks centre on product selection, commercial analysis, stock allocation or another function. Match examples to those duties. Following trends or enjoying shopping should not be presented as professional buying experience.' },
      { title: 'Show your creative contribution', text: 'If a portfolio is requested, select a few relevant pieces and explain the brief, decisions and result. Label student, personal and client work accurately. Credit collaborators and licensed assets; do not present someone else’s designs or campaign results as yours.' },
      { title: 'Make store evidence practical', text: 'Describe keeping an area organised, assisting someone or coordinating a busy task. Explain priorities and outcomes. Avoid unsupported claims that a particular personality, age or appearance guarantees a good fit.' },
    ],
    checks: ['Is this the South African group?', 'Which brand and function are named?', 'Is a portfolio or specific qualification required?'],
    faqs: [
      { q: 'Why has the old .co.za careers link changed?', a: 'This guide now starts at the corporate careers page. The Mr Price customer-service FAQ identifies mrpcareers.com as an official recruitment website.' },
      { q: 'Does fashion interest qualify me for buying?', a: 'Interest can support motivation, but the advert determines essential qualifications, experience and skills.' },
      { q: 'Is promotion guaranteed?', a: 'No guarantee is made here. Assess the role and contract instead of relying on general claims about workplace culture.' },
    ],
    officialSite: 'https://mrpricegroup.com/careers/',
    sourceNote: 'Official group careers overview. The customer-service FAQ also identifies mrpcareers.com; the old .co.za link has been removed.',
    careerLinks: ['entry-level-careers-in-south-africa', 'how-to-become-a-data-analyst'],
  }),
  guide({
    slug: 'nedbank', name: 'Nedbank', sector: 'Banking',
    overview: `<p>Nedbank's joining page explains candidate registration and searching by keyword, category or location. Its careers hub includes early-career information. Distinguish applying to a job from registering for updates.</p><p>Separate client-facing work from specialist finance, risk, technology and data work. Saying you “want to work in banking” does not show which responsibilities you can handle or where you need development.</p>`,
    careerAreas: ['Client-facing banking', 'Operations', 'Finance and risk', 'Technology and data', 'Early-career routes'],
    entryLevel: `<p>Explore programme routes and then read the chosen advert's academic and participation conditions. Do not assume every branch role accepts matric alone or provides the same training.</p><p>For technical or professional work, identify essential skills before applying. Listing a tool is weaker than explaining how you used it. If you lack an essential requirement, seek a suitable junior or training route rather than misrepresenting experience.</p>`,
    applicationTip: 'Show service and procedural accuracy for client-facing work, or methods and project outcomes for technical work. Supply academic documents only as the application requests.',
    preparation: [
      { title: 'Map requirements to evidence', text: 'Write each essential requirement beside a truthful example from studies or work. Mark anything you cannot demonstrate. Use the list to choose roles and organise your CV, not to copy duties as if you had performed them.' },
      { title: 'Prepare an analytical explanation', text: 'Choose a problem you investigated. Explain the information used, checks and conclusion, including uncertainty or limitations. For data work, be ready to explain your calculations or code instead of only presenting a polished chart.' },
      { title: 'Maintain a consistent profile', text: 'Nedbank asks applicants to register. Keep contact details and employment dates consistent, use account recovery if necessary and save vacancy references. Track progress through the employer channel, not a third-party promise of an accelerated application.' },
    ],
    checks: ['Have you applied as well as registered?', 'Which essential requirements can you demonstrate?', 'Does the programme require a completed qualification?'],
    faqs: [
      { q: 'Where should I start?', a: 'Use the group joining page below. It explains registration and links to job search, replacing the old desktop-site URL.' },
      { q: 'Is a profile a job offer?', a: 'No. Registration, application, shortlisting and an offer are separate stages. Keep your submission confirmation.' },
      { q: 'Are branch applications always quicker?', a: 'No such claim is made here. Follow any timeline supplied for the actual vacancy or programme.' },
    ],
    officialSite: 'https://group.nedbank.co.za/careers/join-us.html',
    sourceNote: 'Official joining page: registration and search instructions. Current listings are on the employer-linked jobs portal.',
    careerLinks: ['how-to-become-an-accountant', 'how-to-become-a-data-analyst'],
  }),
  guide({
    slug: 'fnb', name: 'FNB (First National Bank)', sector: 'Banking',
    overview: `<p>Start at FNB's official careers page. As a FirstRand business, recruitment may lead to a group system. Check the business, country and workplace rather than assuming every group vacancy is an FNB role.</p><p>This guide helps with service, operational and specialist preparation. It does not reproduce vacancies or promise a fixed assessment sequence. The advert and verified invitation determine actual requirements and next steps.</p>`,
    careerAreas: ['Client service', 'Banking operations', 'Technology and digital', 'Data and analytics', 'Finance and risk'],
    entryLevel: `<p>Junior employment, graduate opportunities and experienced advisory roles can have different entry requirements. Read qualifications, experience and any professional conditions. Do not assume branch work is automatically available without a degree or experience.</p><p>For graduate routes, state completion status clearly. For technology routes, select projects you understand well enough to explain. Familiarity with online banking is not equivalent to software or data experience.</p>`,
    applicationTip: 'Use service and accuracy evidence for client work, and technical or academic evidence for specialist routes. Check the business and job reference before tailoring your motivation.',
    preparation: [
      { title: 'Verify the business behind the listing', text: 'Save the business name, location and requisition reference. Group systems can contain several businesses and countries. Checking prevents an FNB-specific motivation for another organisation or an application to a country where you cannot work.' },
      { title: 'Explain digital problem-solving', text: 'Describe a project’s purpose, your decisions, testing and possible improvements. Distinguish a tutorial from something you designed. Do not upload confidential workplace code or real customer information as proof of skill.' },
      { title: 'Prepare responsible service examples', text: 'Think through helping someone when you do not know the answer. Explain how you would check the procedure and seek support without inventing information. Use a real example of following a process or correcting an error, not an unsupported claim of banking expertise.' },
    ],
    checks: ['Does the group listing actually name FNB?', 'Is it based in South Africa?', 'Which academic or professional conditions are essential?'],
    faqs: [
      { q: 'Why might recruitment use a group portal?', a: 'FNB is a FirstRand business. Follow links from the official careers page and verify the business in the listing.' },
      { q: 'Does every role use the same selection process?', a: 'No fixed sequence is claimed here. Follow the particular role instructions.' },
      { q: 'Can Edubuzz check my status?', a: 'No. Use the employer portal or verified application contact.' },
    ],
    officialSite: 'https://www.fnb.co.za/careers/',
    sourceNote: 'Official careers page, replacing the old about-us URL. Verify the business and opportunity in the employer-linked system.',
    careerLinks: ['how-to-become-a-data-analyst', 'how-to-become-an-accountant'],
  }),
  guide({
    slug: 'dis-chem', name: 'Dis-Chem', sector: 'Retail / Health',
    overview: `<p>Dis-Chem's group careers page describes retail, e-commerce, distribution and patient-support work and links to recruitment. The old retail-site careers URL redirected to a product search during this review; use the group careers page instead.</p><p>Separate retail applications from professional healthcare applications. Both can involve customers but have different responsibilities and entry conditions. This is preparation guidance, not clinical or professional eligibility advice.</p>`,
    careerAreas: ['Retail store work', 'Pharmacy-related work', 'Distribution', 'E-commerce', 'Support functions'],
    entryLevel: `<p>For a first retail application, read the actual duties and required qualifications. Not every store position is entry-level. Use honest examples of assistance, organisation and checking.</p><p>For professional roles, use the advert's qualification and registration conditions. For training, check its target group and outcome. A retail CV does not replace credential evidence, and a general application does not automatically place you in a training programme.</p>`,
    applicationTip: 'Match retail, distribution or professional evidence to the named route. Keep service experience distinct from credentials and provide evidence only through the verified application channel.',
    preparation: [
      { title: 'Separate service from clinical responsibility', text: 'For retail, show listening, locating information and referring a question appropriately. Do not claim authority to give clinical advice. For professional work, focus on the responsibilities and credentials specified in the advert.' },
      { title: 'Use accurate credential details', text: 'Record exact qualification or registration names and current status. Check the evidence requested and do not describe incomplete courses as complete. Resolve uncertainty with the employer or relevant official body rather than relying on this general guide for eligibility.' },
      { title: 'Show a careful checking method', text: 'Explain a task where accuracy mattered: reconciling a list, organising items or reporting a discrepancy. Describe checks and outcomes without personal data. For distribution, address site and practical requirements instead of assuming store duties apply.' },
    ],
    checks: ['Is this retail, distribution, training or healthcare?', 'Which credentials are explicitly required?', 'Did you reach recruitment from the group careers page?'],
    faqs: [
      { q: 'Where does the group site send applicants?', a: 'Its careers page links to dischem.simplify.hr. Start from the group page to verify that destination.' },
      { q: 'Does retail experience qualify me for pharmacy work?', a: 'Only apply if you meet the specific role requirements. Retail experience does not replace required professional credentials.' },
      { q: 'Are learnerships open now?', a: 'No live intake is confirmed here. Check employer adverts for availability, entry conditions and dates.' },
    ],
    officialSite: 'https://dischemgroup.com/careers/',
    sourceNote: 'Official group careers overview links to dischem.simplify.hr. No current vacancy or professional eligibility is asserted.',
    careerLinks: ['entry-level-careers-in-south-africa', 'careers-without-a-degree'],
  }),
];
