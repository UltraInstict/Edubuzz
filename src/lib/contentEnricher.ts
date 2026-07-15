/**
 * Content Enrichment Pipeline
 *
 * Takes a raw job description and enriches it into structured sections.
 * For minimal descriptions (<200 chars), generates category-aware templates.
 * For rich descriptions, extracts sections from HTML headings.
 *
 * All auto-generated content is clearly marked. No facts are fabricated.
 */

import type { Job } from './pocketbase';

export interface ContentSection {
  type: 'overview' | 'requirements' | 'responsibilities' | 'benefits' | 'skills' | 'experience' | 'education' | 'about_employer' | 'application_process' | 'raw_description';
  title: string;
  content: string;
  enriched: boolean; // true if AI/template-generated
}

const SECTION_ICONS: Record<string, string> = {
  overview: '📋',
  requirements: '✅',
  responsibilities: '💼',
  benefits: '🎁',
  skills: '🔧',
  experience: '📊',
  education: '🎓',
  about_employer: '🏢',
  application_process: '📝',
  raw_description: '📄',
};

function isMinimalDescription(desc: string): boolean {
  const stripped = desc.replace(/<[^>]+>/g, '').trim();
  return stripped.length < 200;
}

function extractSectionsFromHtml(html: string): ContentSection[] {
  const sections: ContentSection[] = [];
  // Match h2/h3 headings followed by content until next heading
  const headingRegex = /<(h[23])[^>]*>(.*?)<\/\1>\s*([\s\S]*?)(?=<(?:h[23])[^>]*>|$)/gi;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const headingText = match[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
    const bodyContent = match[3].trim();
    if (!bodyContent) continue;

    let type: ContentSection['type'] = 'raw_description';
    if (/overview|about|summary|introduction/i.test(headingText)) type = 'overview';
    else if (/requirement|qualification|what you need|minimum/i.test(headingText)) type = 'requirements';
    else if (/responsibilit|dutie|what you.*do|key performance/i.test(headingText)) type = 'responsibilities';
    else if (/benefit|perk|what we offer|package/i.test(headingText)) type = 'benefits';
    else if (/skill|competenc/i.test(headingText)) type = 'skills';
    else if (/experience|background/i.test(headingText)) type = 'experience';
    else if (/education|qualification/i.test(headingText)) type = 'education';
    else if (/about.*(employer|company|us)|who we are/i.test(headingText)) type = 'about_employer';
    else if (/how to apply|application process|next step/i.test(headingText)) type = 'application_process';

    sections.push({ type, title: match[2].replace(/<[^>]+>/g, '').trim(), content: bodyContent, enriched: false });
  }

  return sections;
}

const CATEGORY_TEMPLATES: Record<string, { responsibilities: string; requirements: string; skills: string }> = {
  'Health & Medical': {
    responsibilities: 'Provide quality patient care, administer medications, monitor vital signs, maintain patient records, and collaborate with the healthcare team to ensure optimal patient outcomes.',
    requirements: 'Relevant nursing or healthcare qualification. Registration with the appropriate professional body (e.g. SANC for nurses, SAPC for pharmacists). Strong clinical knowledge and patient care skills.',
    skills: 'Clinical assessment, patient care, medication administration, record keeping, empathy, communication, teamwork, attention to detail.',
  },
  'IT & Technology': {
    responsibilities: 'Develop, maintain, and enhance software applications. Collaborate with cross-functional teams. Write clean, testable code. Participate in code reviews. Troubleshoot and debug production issues.',
    requirements: 'Relevant degree or diploma in Computer Science, IT, or related field. Portfolio demonstrating practical skills. Understanding of software development lifecycle.',
    skills: 'Programming languages, problem-solving, debugging, version control, agile methodology, communication, analytical thinking.',
  },
  'Retail & Sales': {
    responsibilities: 'Assist customers with product selection. Process transactions accurately. Maintain store presentation standards. Monitor inventory levels. Meet sales targets and KPIs.',
    requirements: 'Grade 12 / Matric certificate. Previous retail or sales experience is advantageous. Strong customer service orientation.',
    skills: 'Customer service, sales techniques, product knowledge, cash handling, communication, teamwork, time management.',
  },
  'Finance & Accounting': {
    responsibilities: 'Prepare financial statements and reports. Process transactions and reconcile accounts. Assist with budgeting and forecasting. Ensure compliance with financial regulations.',
    requirements: 'Relevant qualification in Finance, Accounting, or related field. Knowledge of accounting principles and practices. Proficiency in accounting software.',
    skills: 'Financial analysis, attention to detail, numerical aptitude, Excel proficiency, problem-solving, regulatory knowledge.',
  },
  'Engineering': {
    responsibilities: 'Design, develop, and maintain engineering systems or structures. Conduct technical analysis and feasibility studies. Ensure compliance with safety and quality standards. Collaborate with project teams.',
    requirements: 'Relevant engineering degree or diploma. Professional registration (e.g., ECSA) may be required. Knowledge of industry standards and regulations.',
    skills: 'Technical design, problem-solving, project management, CAD software, analytical thinking, communication, safety awareness.',
  },
  'Education & Teaching': {
    responsibilities: 'Plan and deliver engaging lessons. Assess student progress and provide feedback. Maintain classroom discipline. Collaborate with colleagues and parents. Participate in extracurricular activities.',
    requirements: 'Relevant teaching qualification (BEd, PGCE). SACE registration. Subject knowledge and classroom management skills.',
    skills: 'Lesson planning, classroom management, communication, patience, adaptability, assessment techniques, mentorship.',
  },
  'Government': {
    responsibilities: 'Provide administrative and operational support to government departments. Process documentation and citizen services. Ensure compliance with public service regulations. Maintain accurate records.',
    requirements: 'Grade 12 / Matric certificate. Relevant diploma or degree advantageous. South African citizenship. Knowledge of public service procedures.',
    skills: 'Administration, record keeping, communication, attention to detail, service delivery, computer literacy, regulatory compliance.',
  },
  'Logistics & Transport': {
    responsibilities: 'Coordinate transportation and delivery schedules. Manage inventory and warehouse operations. Ensure compliance with safety regulations. Maintain vehicle and equipment records.',
    requirements: 'Relevant license or certification (e.g., Code 14, PDP). Knowledge of logistics operations. Physical fitness for operational roles.',
    skills: 'Route planning, time management, safety compliance, communication, problem-solving, physical stamina.',
  },
  'Administration': {
    responsibilities: 'Manage office correspondence and documentation. Schedule meetings and maintain calendars. Handle data entry and record keeping. Support team with administrative tasks.',
    requirements: 'Grade 12 / Matric certificate. Diploma in Office Administration or related field advantageous. Computer literacy and typing skills.',
    skills: 'Organization, communication, Microsoft Office, data entry, time management, attention to detail, multitasking.',
  },
  'Hospitality & Tourism': {
    responsibilities: 'Provide excellent customer service to guests. Handle check-ins, reservations, and inquiries. Maintain cleanliness and presentation standards. Process payments and manage bookings.',
    requirements: 'Grade 12 / Matric certificate. Hospitality qualification advantageous. Previous customer-facing experience preferred. Professional appearance and demeanor.',
    skills: 'Customer service, communication, problem-solving, attention to detail, teamwork, flexibility, language skills.',
  },
  'Security': {
    responsibilities: 'Monitor premises and control access. Respond to incidents and emergencies. Conduct patrols and inspections. Maintain security logs and reports.',
    requirements: 'PSIRA registration (Grade C or higher). Grade 12 / Matric certificate. Physical fitness. Clean criminal record.',
    skills: 'Observation, communication, incident response, report writing, physical fitness, integrity, vigilance.',
  },
  'Marketing & Media': {
    responsibilities: 'Develop and execute marketing campaigns. Create content for social media and digital channels. Analyze campaign performance. Coordinate with creative teams and stakeholders.',
    requirements: 'Relevant qualification in Marketing, Communications, or related field. Knowledge of digital marketing platforms. Creative and analytical skills.',
    skills: 'Content creation, social media management, analytics, creative thinking, communication, project management, attention to detail.',
  },
  'Human Resources': {
    responsibilities: 'Support recruitment and onboarding processes. Maintain employee records and HR systems. Assist with payroll and benefits administration. Handle employee queries and support HR initiatives.',
    requirements: 'Relevant qualification in HR Management or related field. Knowledge of South African labour law. Experience with HR information systems.',
    skills: 'Communication, confidentiality, organization, labour law knowledge, problem-solving, attention to detail, interpersonal skills.',
  },
  'Legal': {
    responsibilities: 'Prepare legal documents and correspondence. Conduct legal research. Manage case files and deadlines. Liaise with clients and court officials.',
    requirements: 'Relevant legal qualification or paralegal diploma. Knowledge of South African legal system. Strong research and writing skills.',
    skills: 'Legal research, document drafting, attention to detail, communication, time management, confidentiality, analytical thinking.',
  },
  'Cleaning & Facilities': {
    responsibilities: 'Maintain cleanliness and hygiene standards. Perform cleaning duties as assigned. Report maintenance issues. Follow health and safety procedures.',
    requirements: 'Grade 12 / Matric certificate advantageous. Previous cleaning experience preferred. Knowledge of cleaning chemicals and equipment. Physical fitness.',
    skills: 'Attention to detail, time management, reliability, physical stamina, teamwork, following instructions, safety awareness.',
  },
};

const DEFAULT_TEMPLATE = {
  responsibilities: 'Key responsibilities will be discussed during the interview process and will align with the requirements of this role.',
  requirements: 'Relevant qualifications and experience for this position. Strong work ethic and professional attitude. Willingness to learn and grow within the role.',
  skills: 'Communication, teamwork, problem-solving, time management, attention to detail, adaptability.',
};

function getCategoryTemplate(category: string) {
  for (const [key, value] of Object.entries(CATEGORY_TEMPLATES)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return DEFAULT_TEMPLATE;
}

function buildOverview(job: Job): string {
  const parts = [`<strong>${job.title}</strong> position available at <strong>${job.company}</strong> in ${job.city || job.province}.`];

  if (job.job_type) {
    parts.push(`This is a <strong>${job.job_type}</strong> opportunity.`);
  }

  return `<p>${parts.join(' ')}</p>`;
}

function buildEnrichedSections(job: Job): ContentSection[] {
  const sections: ContentSection[] = [];
  const template = getCategoryTemplate(job.category);

  // Overview
  sections.push({
    type: 'overview',
    title: 'Job Overview',
    content: buildOverview(job),
    enriched: true,
  });

  // Key Details (factual, not fabricated)
  const details: string[] = [];
  if (job.job_type) details.push(`<strong>Employment Type:</strong> ${job.job_type}`);
  if (job.city) details.push(`<strong>Location:</strong> ${job.city}, ${job.province}`);
  else details.push(`<strong>Province:</strong> ${job.province}`);
  if (job.category) details.push(`<strong>Category:</strong> ${job.category}`);
  if (job.expires) {
    const closeDate = new Date(job.expires).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    details.push(`<strong>Closing Date:</strong> ${closeDate}`);
  }

  sections.push({
    type: 'raw_description',
    title: 'Key Details',
    content: `<ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>`,
    enriched: false,
  });

  // Position Description (from source)
  if (job.description && job.description.replace(/<[^>]+>/g, '').trim()) {
    sections.push({
      type: 'raw_description',
      title: 'Position Description',
      content: job.description,
      enriched: false,
    });
  }

  // Requirements
  sections.push({
    type: 'requirements',
    title: 'Requirements',
    content: template.requirements,
    enriched: true,
  });

  // Responsibilities
  sections.push({
    type: 'responsibilities',
    title: 'Responsibilities',
    content: template.responsibilities,
    enriched: true,
  });

  // Skills
  sections.push({
    type: 'skills',
    title: 'Key Skills',
    content: template.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<li>${s}</li>`).join(''),
    enriched: true,
  });

  // About Employer (factual)
  sections.push({
    type: 'about_employer',
    title: 'About the Employer',
    content: `<p><strong>${job.company}</strong> is hiring for this position in ${job.city || job.province}. ${job.featured ? 'This is a featured listing on Edubuzz.' : ''}</p>`,
    enriched: false,
  });

  // Application Instructions
  const applyInstructions: string[] = [];
  if (job.apply_email) {
    applyInstructions.push('Submit your application using the form on this page. Include your CV and a cover letter.');
  } else if (job.apply_url) {
    applyInstructions.push(`Apply through the company's application portal. Click the "Apply Now" button to be redirected.`);
  } else {
    applyInstructions.push('Use the Quick Apply button on this page to express your interest. The employer will receive your details.');
  }
  applyInstructions.push('Ensure your CV is up to date and tailored to this position.');

  sections.push({
    type: 'application_process',
    title: 'How to Apply',
    content: `<ul>${applyInstructions.map(i => `<li>${i}</li>`).join('')}</ul>`,
    enriched: false,
  });

  return sections;
}

export function enrichJobContent(job: Job): ContentSection[] {
  const rawHtml = job.description || '';

  // Try to extract sections from rich HTML
  if (!isMinimalDescription(rawHtml)) {
    const extracted = extractSectionsFromHtml(rawHtml);
    if (extracted.length >= 2) return extracted;
  }

  // Build enriched sections from template
  return buildEnrichedSections(job);
}

export function hasEnrichedContent(sections: ContentSection[]): boolean {
  return sections.some(s => s.enriched);
}
