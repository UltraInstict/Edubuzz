/**
 * Test job data generator for Edubuzz.
 *
 * Generates ~100 realistic South African job listings as CSV.
 * Run:  npx tsx scripts/generate-test-jobs.ts > test-jobs.csv
 * Then import via Admin → Import → paste CSV.
 */

const companies = [
  { name: 'Capitec Bank', province: 'Western Cape', city: 'Stellenbosch' },
  { name: 'Old Mutual', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Discovery Health', province: 'Gauteng', city: 'Sandton' },
  { name: 'Nedbank', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Vodacom', province: 'Gauteng', city: 'Midrand' },
  { name: 'MTN Group', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Shoprite Holdings', province: 'Western Cape', city: 'Brackenfell' },
  { name: 'Pick n Pay', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Sasol', province: 'Gauteng', city: 'Sandton' },
  { name: 'Anglo American', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Standard Bank', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Sanlam', province: 'Western Cape', city: 'Bellville' },
  { name: 'Afrihost', province: 'Gauteng', city: 'Midrand' },
  { name: 'Takealot', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Woolworths SA', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Naspers', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Multichoice', province: 'Gauteng', city: 'Randburg' },
  { name: 'Transnet', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Eskom', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Mr Price Group', province: 'KwaZulu-Natal', city: 'Durban' },
  { name: 'Tiger Brands', province: 'Gauteng', city: 'Sandton' },
  { name: 'Bidvest', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Aspen Pharmacare', province: 'KwaZulu-Natal', city: 'Durban' },
  { name: 'FNB South Africa', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Absa Group', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Momentum Metropolitan', province: 'Gauteng', city: 'Centurion' },
  { name: 'Netcare', province: 'Gauteng', city: 'Sandton' },
  { name: 'Life Healthcare', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Imperial Logistics', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'Massmart', province: 'Gauteng', city: 'Sandton' },
  { name: 'Growthpoint Properties', province: 'Gauteng', city: 'Sandton' },
  { name: 'Exxaro Resources', province: 'Gauteng', city: 'Centurion' },
  { name: 'Kumba Iron Ore', province: 'Gauteng', city: 'Centurion' },
  { name: 'Motus Holdings', province: 'Gauteng', city: 'Johannesburg' },
  { name: 'African Rainbow Minerals', province: 'Gauteng', city: 'Sandton' },
  { name: 'Impala Platinum', province: 'North West', city: 'Rustenburg' },
  { name: 'Sibanye-Stillwater', province: 'Gauteng', city: 'Westonaria' },
  { name: 'Harmony Gold', province: 'Gauteng', city: 'Randfontein' },
  { name: 'Clicks Group', province: 'Western Cape', city: 'Cape Town' },
  { name: 'Dis-Chem Pharmacies', province: 'Gauteng', city: 'Midrand' },
];

const jobTemplates: Record<string, string[]> = {
  'IT and Tech': [
    'Senior Software Developer', 'Junior Software Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Engineer', 'Data Analyst', 'Data Scientist',
    'IT Support Technician', 'Network Administrator', 'Cybersecurity Analyst',
    'System Administrator', 'Database Administrator', 'QA Engineer',
    'Mobile App Developer', 'Product Manager', 'Scrum Master',
    'IT Project Manager', 'Business Intelligence Analyst', 'UX/UI Designer',
    'Frontend Developer', 'Backend Developer', 'Solutions Architect',
  ],
  Engineering: [
    'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
    'Chemical Engineer', 'Industrial Engineer', 'Structural Engineer',
    'Project Engineer', 'Maintenance Engineer', 'Design Engineer',
    'Process Engineer', 'Mining Engineer', 'Senior Civil Engineer',
    'Junior Mechanical Engineer', 'Principal Electrical Engineer',
    'Quality Engineer', 'Field Service Engineer', 'Automation Engineer',
  ],
  'IT and Tech': [
    'Software Engineer', 'Web Developer', 'IT Manager',
    'Technical Support Lead', 'Systems Analyst', 'Security Engineer',
  ],
  Government: [
    'Administrative Officer', 'Policy Analyst', 'Project Coordinator',
    'Data Capturer', 'HR Officer', 'Finance Clerk', 'Procurement Officer',
    'Compliance Officer', 'Community Development Worker', 'Programme Manager',
    'Director: Corporate Services', 'Supply Chain Officer', 'Auditor',
    'Communications Officer', 'Records Manager',
  ],
  Health: [
    'Registered Nurse', 'Staff Nurse', 'Pharmacist', 'Pharmacy Assistant',
    'Medical Doctor', 'General Practitioner', 'Dental Assistant',
    'Physiotherapist', 'Occupational Therapist', 'Radiographer',
    'Clinical Technologist', 'Medical Receptionist', 'Care Worker',
    'Enrolled Nurse', 'Healthcare Administrator',
  ],
};

const jobTypes = ['Full-time', 'Contract', 'Part-time', 'Remote', 'Hybrid'];
const descriptions = [
  'Join our team and help drive innovation in a fast-paced environment. You will collaborate with cross-functional teams to deliver high-quality solutions.',
  'An exciting opportunity to work on challenging projects that make a real impact. We offer competitive compensation, flexible work arrangements, and room to grow.',
  'We are looking for a motivated professional to join our growing team. The ideal candidate is proactive, detail-oriented, and ready to take ownership.',
  'Be part of a company that values integrity, innovation, and teamwork. You will work alongside experienced professionals on meaningful projects.',
  'Take the next step in your career with a leading South African company. We invest in our people through training, mentorship, and clear career paths.',
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startDaysBack: number, endDaysBack: number): string {
  const now = Date.now();
  const offset = randInt(startDaysBack, endDaysBack) * 86400000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

function generateSalary(): [number, number] {
  const tiers = [
    [8000, 12000], [12000, 18000], [15000, 25000],
    [20000, 35000], [25000, 40000], [30000, 50000],
    [40000, 65000], [50000, 80000], [60000, 95000],
    [70000, 110000], [45000, 70000], [55000, 85000],
  ];
  return pick(tiers);
}

function generateJobs(count: number) {
  const jobs: Record<string, string>[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    const company = pick(companies);
    const categories = Object.keys(jobTemplates);
    const category = pick(categories);
    const title = pick(jobTemplates[category]);
    const jobType = pick(jobTypes);
    const [salaryMin, salaryMax] = generateSalary();
    const id = `${company.name}-${title}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (seen.has(id)) continue;
    seen.add(id);

    jobs.push({
      title,
      company: company.name,
      province: company.province,
      city: company.city,
      category,
      job_type: jobType,
      salary_min: String(salaryMin),
      salary_max: String(salaryMax),
      description: pick(descriptions),
      apply_email: `careers@${company.name.toLowerCase().replace(/\s+/g, '')}.co.za`,
      created: randomDate(0, 30),
      expires: randomDate(-60, -30),
    });
  }

  return jobs;
}

const jobs = generateJobs(100);

const headers = ['title', 'company', 'province', 'city', 'category', 'job_type', 'salary_min', 'salary_max', 'description', 'apply_email', 'created', 'expires'];
const csvRows = [headers.join(',')];

for (const job of jobs) {
  const row = headers.map((h) => {
    const val = String(job[h] ?? '');
    return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
  });
  csvRows.push(row.join(','));
}

console.log(csvRows.join('\n'));
