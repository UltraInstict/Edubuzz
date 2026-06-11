"""
generate_jobs.py
================
Job listing CSV generator for Work-Force (work-force.co.za),
formatted for WP Job Manager + WP All Import.

Run:
    python generate_jobs.py

Output:
    generated_jobs.csv  (in the current working directory)

Notes
-----
* Streaming writer: rows are written one-at-a-time. Memory stays flat
  even at 500,000 rows.
* Pure stdlib only: random, csv, datetime, os, sys.
* The job description body reads as a neutral employer advert. It does
  not reference Work-Force, the WP Job Manager Applications plugin
  handles applications natively via its own Apply button.
* Title field contains the job title only. Location lives in the
  _job_location custom field. Job type lives in both the
  job_listing_type taxonomy column and the _job_type custom field.
* Post date = today's date. _job_expires = today + 30 days.
"""

import csv
import os
import random
import re
import sys
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# COMPLIANCE — Employment Equity Act (No. 55 of 1998), s.6(1)
# Do NOT add requirements or duties based on age, gender, race, nationality
# (unless citizenship is a legal requirement for the specific role), marital
# status, disability, religion, appearance, or any other protected ground.
# The lint_text() function below scans every row before it is written.
# Any match aborts the script loudly instead of writing a bad row.
# ---------------------------------------------------------------------------

BANNED_PATTERNS = [
    re.compile(r"\baged?\s+(?:between\s+)?\d+", re.I),
    re.compile(r"\bunder\s+\d+\s+(?:years?|yrs?)\b", re.I),
    re.compile(r"\bover\s+\d+\s+(?:years?|yrs?)\b", re.I),
    re.compile(r"\bsouth\s+african\s+citizen\b", re.I),
    re.compile(r"\b(?:male|female)\s+(?:candidate|applicant|only)\b", re.I),
    re.compile(r"\b(?:well[-\s]?groomed|attractive)\s+appearance\b", re.I),
    re.compile(r"\bprofessional\s+appearance\b", re.I),
    re.compile(r"\bmother[-\s]tongue\b", re.I),
    re.compile(r"\bnative\s+(?:english|speaker)\b", re.I),
]


def lint_text(text, row_id):
    """Abort loudly if any banned phrase is found in generated text."""
    for pat in BANNED_PATTERNS:
        m = pat.search(text)
        if m:
            raise ValueError(
                "Row {rid}: banned phrase {phrase!r} matched pattern {pat!r}".format(
                    rid=row_id, phrase=m.group(0), pat=pat.pattern
                )
            )

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------

# Number of job listings to generate. Change this single value to scale
# from 100 to 500,000. Memory stays flat thanks to streaming writes.
NUM_ROWS = 10000

OUTPUT_FILE = "generated_jobs.csv"
PROGRESS_EVERY = 25

# Fixed author / status values
POST_TYPE = "job_listing"
STATUS = "publish"
AUTHOR_ID = "2"
AUTHOR_USERNAME = "Work-Force"
AUTHOR_EMAIL = "admin@work-force.co.za"
AUTHOR_FIRST_NAME = ""
AUTHOR_LAST_NAME = "Work-Force"
COMMENT_STATUS = "closed"
PING_STATUS = "closed"
PERMALINK_PREFIX = "https://work-force.co.za/job/"

COMPANY_NAME = "Work-Force"

# Application email rotation
APPLICATION_EMAILS = [
    "recruitment@work-force.co.za",
    "careers@work-force.co.za",
    "jobs@work-force.co.za",
    "applications@work-force.co.za",
]

# CSV headers — exact order required by WP All Import + WP Job Manager.
# job_listing_category and job_listing_type are taxonomy columns.
# _job_type is the postmeta field that mirrors the taxonomy value.
CSV_HEADERS = [
    "ID", "Title", "Content", "Excerpt", "Date", "Post Type", "Permalink",
    "Image URL", "Image Title", "Image Caption", "Image Description",
    "Image Alt Text", "Image Featured", "Attachment URL",
    "job_listing_category", "job_listing_type", "Status",
    "Author ID", "Author Username", "Author Email",
    "Author First Name", "Author Last Name",
    "Slug", "Format", "Template", "Parent", "Parent Slug", "Order",
    "Comment Status", "Ping Status", "Post Modified Date",
    "_job_location", "_job_type", "_job_expires",
    "_company_name", "_application",
]

JOB_TYPES = ["Full Time", "Part Time", "Internship", "Temporary"]

# ---------------------------------------------------------------------------
# PROVINCES, CITIES, GEOGRAPHIC FLAVOUR
# ---------------------------------------------------------------------------

PROVINCES_CITIES = {
    "Gauteng": [
        "Johannesburg", "Pretoria", "Sandton", "Midrand", "Centurion",
        "Roodepoort", "Soweto", "Kempton Park", "Boksburg", "Benoni",
        "Germiston", "Krugersdorp", "Vanderbijlpark", "Vereeniging",
    ],
    "Western Cape": [
        "Cape Town", "Stellenbosch", "Paarl", "Bellville", "Somerset West",
        "George", "Worcester", "Mossel Bay", "Knysna", "Hermanus",
        "Oudtshoorn", "Saldanha", "Vredenburg",
    ],
    "KwaZulu-Natal": [
        "Durban", "Pietermaritzburg", "Umhlanga", "Ballito", "Pinetown",
        "Richards Bay", "Newcastle", "Empangeni", "Ladysmith", "Margate",
        "Port Shepstone", "Westville",
    ],
    "Eastern Cape": [
        "Gqeberha", "East London", "Mthatha", "Uitenhage", "Queenstown",
        "Grahamstown", "King William's Town", "Mdantsane", "Cradock",
        "Jeffreys Bay", "Butterworth", "Aliwal North",
    ],
    "Limpopo": [
        "Polokwane", "Tzaneen", "Mokopane", "Thohoyandou", "Lephalale",
        "Musina", "Bela-Bela", "Modimolle", "Phalaborwa", "Giyani",
        "Louis Trichardt", "Burgersfort",
    ],
    "Mpumalanga": [
        "Mbombela", "Witbank", "Secunda", "Middelburg", "Standerton",
        "Ermelo", "Barberton", "Hazyview", "Sabie", "Komatipoort",
        "White River", "Bethal",
    ],
    "North West": [
        "Rustenburg", "Mahikeng", "Klerksdorp", "Potchefstroom", "Brits",
        "Hartbeespoort", "Lichtenburg", "Vryburg", "Mmabatho", "Zeerust",
        "Schweizer-Reneke", "Christiana",
    ],
    "Free State": [
        "Bloemfontein", "Welkom", "Sasolburg", "Bethlehem", "Kroonstad",
        "Parys", "Harrismith", "Phuthaditjhaba", "Virginia", "Odendaalsrus",
        "Ficksburg", "Senekal",
    ],
    "Northern Cape": [
        "Kimberley", "Upington", "Kathu", "Kuruman", "Springbok",
        "De Aar", "Postmasburg", "Calvinia", "Colesberg", "Prieska",
        "Hartswater", "Douglas",
    ],
}

GEO_FLAVOUR = {
    "Gauteng": [
        "minutes from the Sandton CBD",
        "easy access via the N1 and N14 corridors",
        "close to OR Tambo International Airport",
        "in the heart of the Rosebank business precinct",
        "near the Midrand technology hub",
        "well-connected by Gautrain and major arterials",
    ],
    "Western Cape": [
        "near the V&amp;A Waterfront precinct",
        "on the N2 corridor toward the Cape Winelands",
        "within reach of Century City",
        "close to the Stellenbosch agricultural belt",
        "near the Cape Town International Airport hub",
        "with views toward Table Mountain",
    ],
    "KwaZulu-Natal": [
        "close to the Durban Harbour logistics hub",
        "on the Umhlanga Ridge business corridor",
        "minutes from King Shaka International Airport",
        "near the Berea office node",
        "along the lush KZN North Coast",
        "within the Pietermaritzburg administrative centre",
    ],
    "Eastern Cape": [
        "within the Coega Industrial Development Zone",
        "close to the East London Industrial Park",
        "in the growing Buffalo City Metro",
        "near the Port of Ngqura logistics hub",
        "along the Sunshine Coast tourism belt",
        "near the Mthatha regional service centre",
    ],
    "Limpopo": [
        "in the Lephalale energy corridor",
        "in the heart of the Tzaneen agricultural belt",
        "close to the Musina border trade post",
        "near the Polokwane regional hub",
        "within the Phalaborwa mining belt",
        "on the Great North Road corridor",
    ],
    "Mpumalanga": [
        "near the Secunda petrochemical hub",
        "on the Nelspruit gateway to Mozambique",
        "close to the Komatipoort border post",
        "within the Highveld coal corridor",
        "near the Kruger Lowveld tourism belt",
        "along the N4 Maputo Development Corridor",
    ],
    "North West": [
        "in the Rustenburg platinum belt",
        "close to the Mahikeng administrative hub",
        "near the Sun City corridor",
        "within the Klerksdorp gold and farming belt",
        "along the N4 Trans-Kalahari corridor",
        "near the Hartbeespoort tourism node",
    ],
    "Free State": [
        "close to the Bloemfontein judicial hub",
        "in the Welkom gold fields",
        "near the Sasolburg industrial complex",
        "along the N1 central corridor",
        "near the Bethlehem agricultural belt",
        "within the Maluti-A-Phofung logistics node",
    ],
    "Northern Cape": [
        "in the Kathu iron ore belt",
        "near the Kimberley diamond heritage centre",
        "within the Upington solar corridor",
        "close to the Sishen mining hub",
        "along the N14 trade route",
        "near the Orange River agricultural zone",
    ],
}

# ---------------------------------------------------------------------------
# CATEGORIES
# ---------------------------------------------------------------------------

CATEGORIES = [
    "Retail Jobs", "Finance Jobs", "IT Jobs", "Health Jobs", "Logistics Jobs",
    "Marketing Jobs", "Administration Jobs", "HR Jobs",
    "Legal and Security Jobs", "Engineering Jobs", "In-Service Training",
    "Teaching Jobs", "Hospitality Jobs",
]

# ---------------------------------------------------------------------------
# JOB TITLES — minimum 14 per category
# ---------------------------------------------------------------------------

JOB_TITLES = {
    "Retail Jobs": [
        "Retail Sales Assistant", "Store Manager", "Cashier",
        "Visual Merchandiser", "Stock Controller", "Floor Supervisor",
        "Customer Service Representative", "Branch Manager",
        "Sales Consultant", "Retail Buyer", "Loss Prevention Officer",
        "Department Manager", "Shift Supervisor", "Inventory Clerk",
        "Retail Operations Coordinator",
    ],
    "Finance Jobs": [
        "Junior Accountant", "Senior Accountant", "Bookkeeper",
        "Financial Analyst", "Credit Controller", "Tax Consultant",
        "Audit Clerk", "Payroll Administrator", "Finance Manager",
        "Cost Accountant", "Treasury Analyst", "Accounts Payable Clerk",
        "Accounts Receivable Clerk", "Internal Auditor",
        "Financial Controller",
    ],
    "IT Jobs": [
        "Software Developer", "Junior Developer", "Senior Software Engineer",
        "DevOps Engineer", "Network Administrator", "IT Support Technician",
        "Systems Analyst", "Database Administrator", "Cybersecurity Analyst",
        "Cloud Engineer", "QA Tester", "Frontend Developer",
        "Backend Developer", "Full Stack Developer", "IT Project Manager",
    ],
    "Health Jobs": [
        "Registered Nurse", "Enrolled Nurse", "Pharmacist Assistant",
        "Pharmacist", "Clinical Technologist", "Medical Receptionist",
        "Healthcare Administrator", "Caregiver", "Physiotherapy Assistant",
        "Radiographer", "Occupational Health Practitioner",
        "Nursing Auxiliary", "Medical Records Clerk", "Phlebotomist",
        "Clinic Coordinator",
    ],
    "Logistics Jobs": [
        "Warehouse Assistant", "Forklift Operator", "Code 14 Driver",
        "Dispatch Clerk", "Logistics Coordinator", "Supply Chain Analyst",
        "Warehouse Supervisor", "Fleet Controller", "Picker Packer",
        "Inventory Controller", "Distribution Manager", "Receiving Clerk",
        "Transport Planner", "Shipping Clerk", "Procurement Officer",
    ],
    "Marketing Jobs": [
        "Digital Marketing Specialist", "Marketing Coordinator",
        "Brand Manager", "Content Creator", "Social Media Manager",
        "SEO Specialist", "Marketing Analyst", "Graphic Designer",
        "Copywriter", "Public Relations Officer",
        "Email Marketing Specialist", "Marketing Assistant",
        "Campaign Manager", "Communications Officer", "Marketing Executive",
    ],
    "Administration Jobs": [
        "Office Administrator", "Receptionist", "Personal Assistant",
        "Executive Assistant", "Data Capturer", "Administrative Clerk",
        "Office Manager", "Records Officer", "Admin Coordinator",
        "Front Desk Officer", "Filing Clerk", "Administrative Officer",
        "Switchboard Operator", "Secretary", "Office Assistant",
    ],
    "HR Jobs": [
        "HR Officer", "HR Administrator", "Recruitment Consultant",
        "Talent Acquisition Specialist", "HR Business Partner", "HR Manager",
        "Payroll and HR Officer", "Training Coordinator",
        "Industrial Relations Officer", "Employee Wellness Officer",
        "HR Generalist", "Skills Development Facilitator",
        "Learning and Development Officer", "HR Assistant",
        "Compensation and Benefits Analyst",
    ],
    "Legal and Security Jobs": [
        "Legal Secretary", "Paralegal", "Conveyancing Secretary",
        "Compliance Officer", "Security Officer", "Armed Response Officer",
        "Site Security Supervisor", "Risk and Compliance Analyst",
        "Investigator", "Control Room Operator", "Legal Researcher",
        "Loss Prevention Officer", "Static Guard", "Access Control Officer",
        "Litigation Secretary",
    ],
    "Engineering Jobs": [
        "Mechanical Engineer", "Electrical Engineer", "Civil Engineer",
        "Project Engineer", "Site Engineer", "Maintenance Technician",
        "Production Engineer", "Quality Engineer", "Safety Officer",
        "Draughtsman", "Industrial Engineer", "Mechatronics Technician",
        "Plant Engineer", "Engineering Foreman",
        "Instrumentation Technician",
    ],
    "In-Service Training": [
        "In-Service Trainee Engineering", "In-Service Trainee Finance",
        "In-Service Trainee IT", "In-Service Trainee HR",
        "In-Service Trainee Marketing", "In-Service Trainee Logistics",
        "In-Service Trainee Administration", "Workplace Learner Retail",
        "Workplace Learner Hospitality", "Internship Project Management",
        "Internship Quality Assurance", "Internship Public Relations",
        "Internship Health Sciences", "Internship Supply Chain",
        "Internship Legal Services",
    ],
    "Teaching Jobs": [
        "Foundation Phase Teacher", "Intermediate Phase Teacher",
        "Senior Phase Teacher", "FET Phase Teacher", "Mathematics Teacher",
        "English Teacher", "Life Sciences Teacher",
        "Physical Sciences Teacher", "Accounting Teacher",
        "Business Studies Teacher", "Special Needs Educator",
        "Pre-Primary Teacher", "School Librarian", "Teaching Assistant",
        "Subject Head of Department",
    ],
    "Hospitality Jobs": [
        "Waitron", "Bartender", "Sous Chef", "Head Chef", "Kitchen Assistant",
        "Front Office Receptionist", "Lodge Manager",
        "Food and Beverage Supervisor", "Housekeeping Supervisor",
        "Room Attendant", "Banqueting Coordinator", "Restaurant Manager",
        "Barista", "Concierge", "Guest Relations Officer",
    ],
}

# ---------------------------------------------------------------------------
# DUTY POOLS — 14+ per category
# ---------------------------------------------------------------------------

DUTY_POOLS = {
    "Retail Jobs": [
        "Greet customers and provide a friendly, helpful in-store experience",
        "Operate point-of-sale systems and process payments accurately",
        "Maintain visual merchandising standards on the sales floor",
        "Replenish stock and rotate displays in line with promotional cycles",
        "Conduct daily cash-ups and reconcile takings against the POS report",
        "Respond to customer queries, complaints and product returns",
        "Support stock counts and assist with cycle-count investigations",
        "Promote loyalty programmes and capture customer information lawfully",
        "Monitor shrinkage indicators and flag suspicious activity",
        "Keep the store, change rooms and stockroom clean and organised",
        "Assist with receiving deliveries and verifying goods against invoices",
        "Up-sell and cross-sell products in line with branch sales targets",
        "Train new team members on store procedures and product knowledge",
        "Prepare daily, weekly and monthly sales reports for the store manager",
        "Ensure compliance with health, safety and consumer protection regulations",
    ],
    "Finance Jobs": [
        "Capture supplier invoices, journals and bank transactions accurately",
        "Reconcile bank accounts, supplier statements and intercompany loans",
        "Prepare monthly management accounts and supporting schedules",
        "Assist with VAT, PAYE and provisional tax submissions to SARS",
        "Maintain the fixed asset register and process monthly depreciation",
        "Process payment runs and resolve supplier queries timeously",
        "Support the year-end audit by preparing requested working papers",
        "Monitor debtors' age analysis and follow up on overdue accounts",
        "Compile cash-flow forecasts and variance commentary for management",
        "Review expense claims against company policy and approval limits",
        "Maintain accurate general ledger entries and trial balance integrity",
        "Assist with budget preparation and quarterly re-forecasting cycles",
        "Implement and monitor internal controls to mitigate financial risk",
        "Provide ad hoc financial analysis to support business decisions",
        "Liaise with external auditors, banks and regulatory bodies",
    ],
    "IT Jobs": [
        "Design, develop and maintain features across the application stack",
        "Write clean, testable code that follows the team's coding standards",
        "Participate in code reviews and contribute to technical design discussions",
        "Diagnose and resolve production incidents within agreed SLAs",
        "Build and maintain CI/CD pipelines for reliable, repeatable releases",
        "Monitor system health using observability tools and respond to alerts",
        "Maintain technical documentation, architecture diagrams and runbooks",
        "Collaborate with product and design teams during sprint planning",
        "Optimise database queries and back-end performance hot-spots",
        "Implement security best practices in line with POPIA obligations",
        "Mentor junior engineers through pairing and structured feedback",
        "Manage user access, identity and endpoint security across the estate",
        "Plan and execute infrastructure upgrades with minimal downtime",
        "Automate repetitive operational tasks using scripts and tooling",
        "Investigate and resolve user-reported support tickets at L2 and L3",
    ],
    "Health Jobs": [
        "Provide compassionate, patient-centred care in line with scope of practice",
        "Administer prescribed medications and document treatments accurately",
        "Monitor vital signs and escalate clinical concerns to the attending clinician",
        "Maintain accurate clinical records in line with SANC and POPIA",
        "Support infection prevention and control protocols across the unit",
        "Participate in multi-disciplinary ward rounds and care planning",
        "Educate patients and families on treatment plans and self-care",
        "Manage stock levels of consumables and report shortages timeously",
        "Assist with admissions, discharges and patient transfers",
        "Operate and care for clinical equipment in line with manufacturer guidelines",
        "Respond appropriately to medical emergencies and code calls",
        "Maintain a clean, safe and welcoming clinical environment",
        "Support quality improvement audits and clinical governance reviews",
        "Liaise with medical aids and process pre-authorisations where required",
        "Mentor student nurses and junior staff during their rotations",
    ],
    "Logistics Jobs": [
        "Receive, verify and put away incoming stock against delivery notes",
        "Pick, pack and dispatch orders accurately within agreed cut-offs",
        "Operate forklifts and material handling equipment safely",
        "Maintain accurate inventory records on the warehouse management system",
        "Conduct daily, weekly and monthly stock counts and investigate variances",
        "Plan delivery routes to maximise vehicle utilisation and on-time delivery",
        "Liaise with transporters, drivers and customers on dispatch schedules",
        "Ensure full compliance with road traffic, OHS Act and customs requirements",
        "Maintain housekeeping standards in racking, aisles and yard areas",
        "Process returns, claims and damaged stock through the agreed workflow",
        "Coordinate cross-docking and consolidation with inbound and outbound teams",
        "Monitor third-party logistics partners against agreed KPIs",
        "Support cycle-count and full inventory takes with the finance team",
        "Prepare daily dispatch and receiving reports for site management",
        "Investigate stock losses and contribute to shrinkage reduction plans",
    ],
    "Marketing Jobs": [
        "Plan and execute integrated marketing campaigns across digital and traditional channels",
        "Manage paid media budgets across Google, Meta and LinkedIn",
        "Create on-brand content for web, social, email and in-store",
        "Track campaign performance against KPIs and produce monthly reports",
        "Maintain the editorial and content calendar across owned channels",
        "Brief and manage external creative, media and PR agencies",
        "Optimise organic search performance through on-page and technical SEO",
        "Manage email marketing journeys, segmentation and lifecycle automation",
        "Support sales teams with collateral, presentations and trade activations",
        "Conduct market research and competitor analysis to inform positioning",
        "Manage brand assets, tone of voice and corporate identity guidelines",
        "Coordinate events, sponsorships and community activations",
        "Monitor brand reputation and respond to customer comments online",
        "Ensure all marketing complies with POPIA and consumer protection codes",
        "Test, learn and iterate on creative, channels and audience targeting",
    ],
    "Administration Jobs": [
        "Manage diaries, meetings and travel logistics for the leadership team",
        "Answer incoming calls and route enquiries to the correct department",
        "Maintain a tidy, professional reception and meeting-room environment",
        "Capture data accurately into internal systems and registers",
        "Process invoices, requisitions and expense claims for approval",
        "File, scan and archive documents in line with retention policies",
        "Coordinate office supplies, courier bookings and facilities requests",
        "Prepare meeting packs, agendas and minutes for internal forums",
        "Support HR with onboarding logistics for new starters",
        "Maintain visitor registers and ensure compliance with access protocols",
        "Liaise with suppliers, contractors and service providers",
        "Track and report on departmental KPIs through standard templates",
        "Provide administrative support to projects and special initiatives",
        "Update intranet pages, notice boards and internal directories",
        "Handle confidential information with discretion and in line with POPIA",
    ],
    "HR Jobs": [
        "Manage end-to-end recruitment from briefing to onboarding",
        "Maintain accurate employee records on the HRIS",
        "Coordinate performance management cycles and calibration sessions",
        "Support managers with disciplinary, grievance and incapacity processes",
        "Drive engagement, wellness and culture initiatives across sites",
        "Process monthly payroll inputs and resolve employee queries",
        "Coordinate training, learnerships and bursary programmes with SETAs",
        "Compile workforce reports for EE, B-BBEE and skills development submissions",
        "Advise managers on application of the LRA, BCEA and EEA",
        "Manage relationships with unions and prepare for wage negotiations",
        "Support organisational design, job evaluation and grading processes",
        "Roll out HR policies and procedures and train managers on application",
        "Run exit interviews and feed insights into retention strategies",
        "Manage benefits, pension or provident fund and medical aid administration",
        "Champion transformation and inclusion across all people processes",
    ],
    "Legal and Security Jobs": [
        "Draft, review and amend commercial contracts and service agreements",
        "Manage matter files, court diaries and litigation deadlines",
        "Conduct legal research and prepare opinions for the legal team",
        "Liaise with the Sheriff, Master's Office and external counsel",
        "Maintain FICA and KYC records in line with regulatory requirements",
        "Patrol assigned premises and conduct visible security deterrence",
        "Operate access control points and verify visitor credentials",
        "Monitor CCTV systems and respond to alarms and incidents",
        "Compile accurate occurrence books and incident reports",
        "Conduct searches and inspections in line with site procedures",
        "Coordinate with SAPS and emergency services during incidents",
        "Support investigations into theft, fraud and policy breaches",
        "Maintain PSIRA registration and uphold the security industry code of conduct",
        "Run compliance training for staff on POPIA, FICA and ethics",
        "Track legal and regulatory changes and advise the business on impact",
    ],
    "Engineering Jobs": [
        "Plan, execute and close out engineering projects within scope, time and budget",
        "Prepare technical drawings, BOMs and specifications for production",
        "Conduct site inspections and progress meetings with contractors",
        "Diagnose breakdowns and implement corrective and preventative maintenance",
        "Develop and maintain maintenance schedules for plant and equipment",
        "Drive continuous improvement using lean and Six Sigma tools",
        "Ensure full compliance with the OHS Act and applicable SANS standards",
        "Manage technical procurement and evaluate supplier proposals",
        "Lead root-cause analyses on production losses and quality defects",
        "Mentor apprentices, learners and junior engineers on site",
        "Maintain calibration, asset and plant maintenance records",
        "Support commissioning of new plant, equipment and process changes",
        "Conduct risk assessments and HAZOP studies on critical processes",
        "Prepare technical reports and project documentation for sign-off",
        "Liaise with regulatory bodies on permits, licences and inspections",
    ],
    "In-Service Training": [
        "Shadow experienced professionals and learn department-specific processes",
        "Complete structured training modules and submit reflections to your mentor",
        "Capture data, prepare reports and assist with departmental administration",
        "Support live projects under the guidance of senior team members",
        "Attend on-site and online learning sessions linked to your qualification",
        "Maintain a workplace logbook in line with your institution's requirements",
        "Participate in team meetings, planning sessions and problem-solving forums",
        "Complete assessments and submit deliverables on time and to standard",
        "Apply theory from your studies to real workplace scenarios",
        "Build a professional portfolio of evidence for your qualification",
        "Develop core workplace skills such as communication, teamwork and time management",
        "Network with internal and external stakeholders during projects",
        "Provide feedback to your mentor on learning gaps and goals",
        "Comply with all company policies, codes of conduct and safety rules",
        "Support transformation and youth-development objectives of the organisation",
    ],
    "Teaching Jobs": [
        "Plan, prepare and deliver lessons aligned to the CAPS curriculum",
        "Assess learner progress through formative and summative assessments",
        "Maintain accurate mark sheets, attendance and learner profile records",
        "Provide individualised support to learners with diverse needs",
        "Foster a safe, inclusive and disciplined classroom environment",
        "Communicate regularly with parents and guardians on learner progress",
        "Participate in subject moderation and departmental planning meetings",
        "Integrate technology and active-learning strategies into lessons",
        "Supervise extra-mural activities, study sessions and excursions",
        "Mentor student teachers and contribute to peer-learning initiatives",
        "Maintain SACE registration and engage in continuous professional development",
        "Support whole-school improvement plans and quality assurance processes",
        "Manage classroom resources, learner materials and digital platforms",
        "Implement school disciplinary procedures fairly and consistently",
        "Contribute to the school's enrichment programmes and community outreach",
    ],
    "Hospitality Jobs": [
        "Welcome guests warmly and ensure a smooth check-in and check-out experience",
        "Take orders accurately and deliver food and beverages to standard",
        "Maintain cleanliness in front-of-house and back-of-house areas",
        "Set up rooms, function venues and outlets ahead of guest arrivals",
        "Prepare and present food in line with kitchen recipes and standards",
        "Operate point-of-sale systems and reconcile end-of-shift takings",
        "Respond promptly to guest requests, complaints and special needs",
        "Comply with food safety, hygiene and health regulations at all times",
        "Manage stock, breakages and consumables for your section",
        "Coordinate with kitchen, housekeeping and front-office teams",
        "Promote menu items, daily specials and loyalty programmes",
        "Support events, banquets and conference operations",
        "Maintain the required uniform and presentation standards during all shifts",
        "Train casual staff on service standards and SOPs",
        "Drive guest satisfaction scores and online review ratings",
    ],
}

# ---------------------------------------------------------------------------
# REQUIREMENT POOLS — 14+ per category
# ---------------------------------------------------------------------------

REQUIREMENT_POOLS = {
    "Retail Jobs": [
        "Matric / National Senior Certificate (Grade 12)",
        "Minimum of 1-2 years' experience in a customer-facing retail role",
        "Comfortable operating point-of-sale systems and handling cash",
        "Strong verbal communication skills in English; second language an advantage",
        "Ability to stand for long periods and work shifts including weekends",
        "Honest, dependable and security-aware in line with shrinkage controls",
        "Numerate and accurate, with attention to detail on cash-ups",
        "A clear criminal record verified through approved screening providers",
        "Customer-first mindset with a friendly, approachable manner",
        "Experience with stock counting and basic inventory principles",
        "Ability to work as part of a team in a fast-paced retail environment",
        "Willingness to work public holidays and end-of-month peaks",
        "Basic computer literacy (MS Office, email)",
        "Visual merchandising flair or formal training is an advantage",
        "Awareness of consumer protection and B-BBEE principles",
    ],
    "Finance Jobs": [
        "B.Com or National Diploma in Accounting, Finance or related field",
        "2-4 years' experience in a similar finance role",
        "Solid working knowledge of IFRS for SMEs and SA tax basics",
        "Hands-on experience with Sage, Pastel, SAP or Xero",
        "Advanced Excel skills, including pivot tables and lookups",
        "Strong understanding of VAT, PAYE and SARS e-filing",
        "Excellent attention to detail and analytical thinking",
        "Ability to meet tight reporting deadlines under pressure",
        "Good written and verbal communication with non-finance stakeholders",
        "Experience supporting external audits is an advantage",
        "Understanding of internal controls and segregation of duties",
        "Working towards SAICA, SAIPA or CIMA designation is preferred",
        "Sound ethical conduct and discretion when handling sensitive data",
        "Awareness of B-BBEE financial reporting requirements",
        "Clear credit and criminal record",
    ],
    "IT Jobs": [
        "Relevant IT qualification (degree, diploma or recognised certifications)",
        "2-5 years' commercial software development experience",
        "Strong proficiency in Java, C#, Python, JavaScript or TypeScript",
        "Hands-on experience with relational and NoSQL databases",
        "Experience with Git, branching strategies and pull-request workflows",
        "Working knowledge of cloud platforms (AWS, Azure or GCP)",
        "Familiarity with CI/CD pipelines and infrastructure-as-code",
        "Understanding of secure development principles aligned with POPIA",
        "Strong problem-solving skills and ability to debug complex systems",
        "Comfortable working in agile delivery teams",
        "Good written and verbal communication for technical and non-technical audiences",
        "Experience with containerisation (Docker, Kubernetes) is an advantage",
        "Exposure to monitoring and observability tooling",
        "Ability to mentor junior team members on best practices",
        "Reliable home internet for hybrid work where applicable",
    ],
    "Health Jobs": [
        "Relevant clinical qualification from a recognised institution",
        "Current registration with SANC or relevant professional body",
        "BLS, ACLS or PALS certification where applicable to the role",
        "Proven clinical experience appropriate to the level advertised",
        "Sound clinical judgement and ability to work calmly under pressure",
        "Strong patient-centred communication and interpersonal skills",
        "Working knowledge of POPIA as it applies to patient information",
        "Computer literacy and experience with electronic health records",
        "Willingness to work shifts, weekends and public holidays as required",
        "Up-to-date immunisations as required by occupational health policy",
        "Clear criminal record verified through approved screening",
        "Strong infection prevention and control awareness",
        "Demonstrated ability to work in multi-disciplinary teams",
        "Commitment to ongoing CPD and clinical learning",
        "Empathy, integrity and respect for patient dignity",
    ],
    "Logistics Jobs": [
        "Matric / National Senior Certificate (Grade 12)",
        "Relevant logistics, supply chain or warehousing qualification (preferred)",
        "Valid forklift licence for warehouse-based roles",
        "Valid Code 10 or Code 14 driver's licence with PrDP for driving roles",
        "2+ years' experience in warehousing, distribution or logistics",
        "Experience using a Warehouse Management System (WMS)",
        "Understanding of inbound, outbound and stock-take processes",
        "Strong numeracy and accuracy on stock counts and pick lists",
        "Physically able to perform manual handling duties safely",
        "Awareness of OHS Act, traffic regulations and hazardous goods rules",
        "Ability to work shifts, including night shifts and weekends",
        "Good communication skills with drivers, suppliers and customers",
        "Computer literacy in MS Office and basic ERP modules",
        "Clear criminal record and proof of address",
        "Willingness to work in a fast-paced, target-driven environment",
    ],
    "Marketing Jobs": [
        "Bachelor's degree or diploma in Marketing, Communications or related field",
        "2-4 years' experience in a marketing or communications role",
        "Proven experience managing paid media campaigns",
        "Strong copywriting skills with a portfolio of published work",
        "Hands-on experience with Google Analytics, Search Console and Tag Manager",
        "Working knowledge of CMS platforms (WordPress preferred)",
        "Experience with email marketing platforms (Mailchimp, HubSpot, etc.)",
        "Comfortable creating short-form video and social media content",
        "Solid understanding of SEO and content marketing principles",
        "Strong project management and organisational skills",
        "Excellent written and verbal communication in English",
        "Awareness of POPIA and consumer protection requirements",
        "Creative thinker who can also analyse data and report on ROI",
        "Ability to work cross-functionally with sales, design and product teams",
        "Familiarity with the South African media and influencer landscape",
    ],
    "Administration Jobs": [
        "Matric / National Senior Certificate (Grade 12)",
        "Relevant administrative or office management qualification (advantageous)",
        "1-3 years' experience in an administrative or front-office role",
        "Strong proficiency in MS Office (Word, Excel, Outlook, PowerPoint)",
        "Excellent telephone and email etiquette",
        "Strong organisational skills and the ability to multitask",
        "High attention to detail and accuracy in data capture",
        "Ability to work independently and manage competing deadlines",
        "Discretion when handling confidential and POPIA-sensitive information",
        "Professional, courteous manner with strong customer-service orientation",
        "Good written and verbal communication in English",
        "Reliable, punctual and committed to high service standards",
        "Experience supporting senior managers is an advantage",
        "Comfortable working with finance, HR and operational systems",
        "Clear criminal record and contactable references",
    ],
    "HR Jobs": [
        "Bachelor's degree or diploma in Human Resources or Industrial Psychology",
        "3-5 years' generalist HR experience in a structured environment",
        "Sound knowledge of the LRA, BCEA, EEA and Skills Development Act",
        "Hands-on experience with HRIS and payroll systems",
        "Experience supporting CCMA, disciplinary and grievance processes",
        "Strong stakeholder management and influencing skills",
        "Excellent written and verbal communication in English",
        "Ability to handle sensitive employee information with discretion",
        "Sound understanding of EE and B-BBEE compliance reporting",
        "Strong analytical skills with the ability to interpret HR metrics",
        "Project management skills for HR initiatives and rollouts",
        "Member or affiliate of SABPP or IPM is an advantage",
        "Coaching mindset with the ability to support line managers",
        "Comfortable in a unionised environment where applicable",
        "Commitment to fairness, transformation and ethical conduct",
    ],
    "Legal and Security Jobs": [
        "Relevant qualification: LLB, paralegal diploma or PSIRA grading as required",
        "Active PSIRA registration at the appropriate grade for security roles",
        "2+ years' relevant experience in legal or security operations",
        "Sound understanding of POPIA and applicable legal frameworks",
        "Excellent attention to detail when reviewing documents and evidence",
        "Strong written and verbal communication skills",
        "Computer literacy and experience with case or incident management systems",
        "Clear criminal record verified through approved screening",
        "Sound ethical judgement and ability to maintain confidentiality",
        "Physical fitness for site-based security roles",
        "Valid driver's licence and own reliable transport (often required)",
        "Willingness to work shifts, weekends and public holidays as required",
        "Ability to remain calm and professional in high-pressure incidents",
        "Strong report-writing skills with accurate, factual content",
        "Commitment to ongoing professional development and refresher training",
    ],
    "Engineering Jobs": [
        "BEng, BTech or National Diploma in Engineering",
        "Registered or working toward registration with a recognised engineering body",
        "3-5 years' relevant engineering experience in industry",
        "Sound knowledge of the OHS Act and applicable SANS standards",
        "Working knowledge of CAD packages (AutoCAD, SolidWorks or similar)",
        "Experience with project management tools and methodologies",
        "Strong analytical, problem-solving and root-cause analysis skills",
        "Experience leading site teams or contractors is an advantage",
        "Hands-on commissioning and maintenance experience",
        "Familiarity with lean manufacturing and continuous improvement",
        "Excellent written and verbal communication, including technical reporting",
        "Valid driver's licence and willingness to travel between sites",
        "Computer literacy in MS Office and relevant engineering software",
        "Awareness of B-BBEE and skills development obligations",
        "Commitment to safe, ethical and sustainable engineering practice",
    ],
    "In-Service Training": [
        "Currently studying toward a recognised qualification at NQF Level 5 or higher",
        "Letter from your TVET college or university confirming the in-service training requirement",
        "Strong academic record in your chosen field",
        "Legally entitled to work in South Africa for the duration of the placement",
        "Available to commit to the full duration of the in-service placement",
        "Computer literacy in MS Office (Word, Excel, Outlook)",
        "Good verbal and written communication skills in English",
        "Willingness to learn, take feedback and adapt quickly",
        "Reliable transport to the placement location",
        "Clear criminal record verified through approved screening",
        "Strong work ethic and professional behaviour at all times",
        "Ability to maintain a workplace logbook and submit assessments on time",
        "Available for the full duration of the placement",
        "Commitment to youth-development and transformation objectives",
        "References from your institution or previous employers",
    ],
    "Teaching Jobs": [
        "Bachelor of Education (B.Ed) or PGCE in the relevant phase",
        "Current SACE registration or proof of application",
        "Relevant subject specialisation aligned to the vacancy",
        "Working knowledge of the CAPS curriculum and assessment policies",
        "2+ years' classroom experience (less for early-career roles)",
        "Strong classroom management and discipline strategies",
        "Excellent written and verbal communication in English",
        "Experience integrating technology into lessons is an advantage",
        "Ability to support learners with diverse learning needs",
        "Commitment to safeguarding and learner well-being",
        "Clear criminal record and child-protection clearance",
        "Willingness to participate in extra-mural activities",
        "Strong collaboration with phase, subject and pastoral teams",
        "Commitment to continuous professional development",
        "Empathy, patience and a genuine love of teaching",
    ],
    "Hospitality Jobs": [
        "Matric / National Senior Certificate (Grade 12)",
        "Relevant hospitality qualification or culinary diploma (advantageous)",
        "1-3 years' experience in a similar hospitality environment",
        "Sound knowledge of food safety and HACCP principles",
        "Strong customer service orientation and warm guest interaction",
        "Ability to work shifts, weekends and public holidays",
        "Physically able to stand for long periods in a fast-paced environment",
        "Good verbal communication skills in English; second language an advantage",
        "Willing to follow the company's uniform and grooming policy on shift",
        "Team player who can work collaboratively across departments",
        "Computer literacy and experience with POS systems",
        "Clear criminal record and contactable references",
        "Awareness of tourism grading and quality expectations",
        "Ability to remain calm and gracious under pressure",
        "Genuine passion for hospitality, food and creating memorable experiences",
    ],
}

# ---------------------------------------------------------------------------
# HEADING POOLS — minimum 5 alternatives per section type where used
# ---------------------------------------------------------------------------

HEADINGS = {
    "overview": [
        "About the Opportunity", "The Role", "What This Role Involves",
        "Overview", "About This Position",
    ],
    "duties": [
        "Key Responsibilities", "What You'll Be Doing", "Your Role",
        "Daily Duties", "Core Functions", "Key Outputs",
    ],
    "requirements": [
        "Minimum Requirements", "What You'll Need", "Candidate Profile",
        "Who We're Looking For", "Essential Criteria",
    ],
    "why_join": [
        "Why Join Us", "Why This Role", "What We Offer",
    ],
    "team": [
        "About the Team", "Meet the Team", "Your Team",
    ],
    "day": [
        "A Typical Day", "Day in the Life", "What Your Day Looks Like",
    ],
    "growth": [
        "Career Growth", "Your Future Here", "Growing With Us",
    ],
    "environment": [
        "The Environment", "Where You'll Work", "Your Workplace",
    ],
    "diversity": [
        "Diversity and Inclusion", "Equal Opportunity",
        "Our Commitment to Transformation",
    ],
    "faq": [
        "Frequently Asked Questions", "Common Questions",
    ],
}

LOCATION_HEADING_PATTERNS = [
    "Working in {city}", "Based in {city}", "About {city}",
]

# ---------------------------------------------------------------------------
# WRITING TONES
# ---------------------------------------------------------------------------

TONES = ["CORPORATE", "ENERGETIC", "INCLUSIVE", "OPERATIONAL"]

# ---------------------------------------------------------------------------
# OPENING PARAGRAPH BUILDERS — neutral employer voice, no Work-Force mention
# ---------------------------------------------------------------------------

def opening_corporate(title, city, province, jt_phrase, category):
    pool = [
        ("A vacancy has been confirmed for a {title} based in {city}, {province}. "
         "The successful candidate will join an established team within the {category_lower} function."),
        ("An opportunity has arisen for a {title} in {city}. "
         "Suitably qualified candidates from across {province} are invited to apply."),
        ("The organisation is recruiting a {title} for its {city} operation. "
         "The role forms part of a wider {category_lower} portfolio across {province}."),
    ]
    return random.choice(pool).format(
        title=title, city=city, province=province,
        category_lower=category.lower(),
    )


def opening_energetic(title, city, province, jt_phrase, category):
    pool = [
        ("Looking for your next move as a {title} in {city}? "
         "A role has just opened that gives you real responsibility and a clear path forward in {province}."),
        ("Step into a {title} role in {city} and make your mark across {province}. "
         "The team is hiring now and wants to hear from sharp, committed candidates."),
        ("Bring your skills as a {title} to {city} and join a team that moves fast. "
         "This {province} role is one to watch."),
    ]
    return random.choice(pool).format(
        title=title, city=city, province=province,
    )


def opening_inclusive(title, city, province, jt_phrase, category):
    pool = [
        ("Applications are warmly invited for a {title} role based in {city}. "
         "We welcome candidates from every background across {province} who are ready to grow with us."),
        ("Whether you are a seasoned {title} or stepping into the role for the first time, "
         "there is space for you in {city}. The team hires on merit and across communities in {province}."),
        ("We believe great workplaces are built on great people. "
         "We are looking for a {title} in {city}, and we encourage applicants from across {province} to consider this opportunity."),
    ]
    return random.choice(pool).format(
        title=title, city=city, province=province,
    )


def opening_operational(title, city, province, jt_phrase, category):
    pool = [
        ("Role: {title}. Location: {city}, {province}. "
         "The team is hiring and seeks a candidate who can step in and deliver from week one."),
        ("A {title} is needed in {city}. "
         "The role focuses on consistent delivery, accurate work and clear communication across the {province} operation."),
        ("A {title} position is being filled in {city}. "
         "Suitable candidates from across {province} are invited to submit their applications for review."),
    ]
    return random.choice(pool).format(
        title=title, city=city, province=province,
    )


OPENING_BUILDERS = {
    "CORPORATE": opening_corporate,
    "ENERGETIC": opening_energetic,
    "INCLUSIVE": opening_inclusive,
    "OPERATIONAL": opening_operational,
}

# ---------------------------------------------------------------------------
# OVERVIEW PARAGRAPH POOLS — neutral employer voice
# ---------------------------------------------------------------------------

OVERVIEW_P1 = [
    "This {title} role sits within the {category_lower} function in {city}. "
    "It offers a defined scope, clear measures of success, "
    "and the support of an experienced team across {province}.",
    "The organisation is investing in its {city} operation, and this {title} position reflects that commitment. "
    "The successful candidate will work across the {category_lower} function and contribute to the wider {province} business.",
    "The {title} position is part of an ongoing recruitment drive across {province}. "
    "The brief has been shaped carefully, with a focus on delivery in {city} and across the {category_lower} space.",
    "An experienced {title} is needed to support operations in {city}. "
    "The role forms part of how the business keeps its {category_lower} portfolio strong in {province}.",
    "This {title} role has been briefed against a clear set of outcomes for {city}. "
    "The successful candidate will work alongside an established team and will be expected to contribute meaningfully to the {category_lower} pipeline across {province}.",
    "The {title} vacancy forms part of how the {city} branch keeps performing. "
    "It pairs day-to-day delivery with longer-running priorities that keep the {category_lower} side of the business moving forward.",
]

OVERVIEW_P2 = [
    "Day-to-day, the role balances focused delivery with the kind of collaboration that keeps things moving. "
    "The successful candidate is trusted to make sensible decisions inside the agreed scope, "
    "with line-management support whenever a sounding board is useful.",
    "The organisation keeps reporting lines clean and expectations realistic. "
    "Performance is measured against a small, agreed set of metrics, and there are no surprise yardsticks for the {title} taking on this position.",
    "The role suits a candidate who values consistency and clear communication. "
    "The {city} operation runs on accurate work, steady relationships and a genuine respect for the people in the team.",
    "Expect a structured first ninety days, with onboarding milestones, regular check-ins, "
    "and an early focus on getting comfortable with the systems and processes that underpin the {city} team.",
    "The successful applicant is given the room to plan, deliver and review their work without unnecessary noise. "
    "The organisation has built its {city} team on trust, and the {title} role will feel that from week one.",
    "Communication runs both ways. Managers across the {category_lower} team in {province} make time for one-to-ones, "
    "and people are expected to speak up early when something needs attention.",
]

OVERVIEW_P3 = [
    "Stakeholders for this position include line managers, peers across the {category_lower} team and trusted external partners. "
    "Building those relationships early makes the next twelve months in {city} much easier.",
    "Quality is everyone's job. Whether the {title} is processing a transaction, supporting a colleague or handling a customer query, "
    "the standard expected in {province} is consistently high and consistently fair.",
    "Tools, systems and information are there to support the role rather than slow it down. "
    "The company continues to invest in the technology that backs its {city} teams, and the new {title} will feel that from the first week.",
    "Reasonable working hours and respectful planning are part of how the role runs. "
    "The team values strong delivery, and load is balanced fairly across the {category_lower} group in {city}.",
    "The role has been written to be sustainable, not just busy. "
    "Strong output is expected, and managers in {city} also pay attention to recovery, learning and the kind of breathing room that keeps people doing good work over time.",
    "Internal documentation, process notes and shared playbooks make it easier for the {title} to step into the {category_lower} workflow quickly. "
    "Institutional knowledge is well-organised, so people are not reinventing the wheel from one week to the next.",
]

# ---------------------------------------------------------------------------
# REQUIREMENTS CLOSING SENTENCE
# ---------------------------------------------------------------------------

REQUIREMENTS_CLOSERS = [
    "If most of these boxes are ticked, you are encouraged to put your name forward.",
    "Candidates who meet most of these criteria are welcome to be considered for the role.",
    "Each application is reviewed carefully, and strong matches against the criteria above will move forward in the process.",
    "If your CV speaks to the points above, this role is worth a closer look.",
    "Potential is considered alongside experience, so candidates who tick most of these boxes should still be considered.",
]


# Extra paragraphs that can be appended to optional sections for density
OPTIONAL_EXTENSIONS = {
    "why_join": [
        "The company reinvests in its people: paid training, internal moves and the chance to take on bigger projects "
        "are all part of how careers in {city} keep progressing.",
        "Benefits are clear and consistent. Beyond the package on offer, the role includes the supports you would expect "
        "from an established South African employer in {province}.",
        "Recognition matters here. Strong performers are noticed quickly, "
        "and many promotions across the business have started in the {city} teams.",
    ],
    "team": [
        "The team mix in {city} reflects a balance of experienced operators and emerging talent, "
        "with deliberate space for diverse voices and backgrounds.",
        "Collaboration is the default working mode. Whether picking up a quick query or working through a complex project, "
        "you will find colleagues willing to lean in and help.",
        "Line management is hands-on without being heavy. Expect regular one-to-ones, honest feedback "
        "and the support needed to do good work consistently.",
    ],
    "location": [
        "Many candidates already living within reach of {city} cite the location as one of the role's quiet wins, "
        "with shorter commutes and a real sense of being plugged into the local {province} economy.",
        "Accessibility is taken seriously: where the role allows, the team works toward a balance "
        "of in-office presence and flexibility for candidates based in and around {city}.",
        "If you are relocating, the team can share practical pointers on neighbourhoods, transport and the typical pace of life in {city}, {province}.",
    ],
    "day": [
        "No two days look exactly the same — and that variety is part of what keeps the role engaging for the right candidate in {city}.",
        "The {city} office buzzes through peak hours and settles into focused, productive lulls in between, "
        "giving you time to plan and reset before the next stretch of work.",
        "The rhythm rewards people who plan ahead but also pivot quickly when {province} operations throw up the unexpected.",
    ],
    "growth": [
        "Growth conversations happen at a regular cadence — not just at year-end — "
        "so the path forward stays current and realistic for every {city} team member.",
        "Internal mobility is encouraged. People who start in {city} have moved into roles in other branches, "
        "specialist functions and project teams across {province}.",
        "Training is a mix of formal courses, structured on-the-job learning and exposure to broader projects, "
        "all geared at building practical skills.",
    ],
    "environment": [
        "Health, safety and well-being are taken seriously. Current policies and procedures are maintained, "
        "and the {city} site adheres to the standards expected of a responsible South African employer.",
        "A respectful, professional environment is the standard in {province}. Bullying, harassment and unfair conduct have no place here, "
        "and managers are trained to act decisively when concerns are raised.",
        "The working environment is set up to give the team the focus needed for deeper work, "
        "while keeping collaboration and quick problem-solving close at hand.",
    ],
    "diversity": [
        "Practical steps back the words. Structured EE reporting, transformation initiatives "
        "and learnership programmes give real opportunities to candidates from across {province}.",
        "Inclusive hiring extends through onboarding and into how teams operate every day. "
        "Respectful, fair conduct is expected from every team member in {city}.",
        "B-BBEE compliance is more than a scorecard here. "
        "It informs how the business invests in skills development, supplier diversity and community engagement across the country.",
    ],
}

# ---------------------------------------------------------------------------
# WHY JOIN US (3 variants) — neutral employer voice
# ---------------------------------------------------------------------------

def why_growth(category, city, province):
    return (
        "The company invests in the people who join it. From structured onboarding to ongoing skills development, "
        "you will find clear paths to grow your career in {category} from your base in {city}. "
        "Many colleagues across {province} have moved into senior roles after starting in positions just like this one."
    ).format(category=category.lower(), city=city, province=province)


def why_culture(category, city, province):
    return (
        "You will join a team that values respectful collaboration, honest feedback and shared wins. "
        "The {city} colleagues take pride in supporting one another and in doing the {category} side of the business properly, day in and day out."
    ).format(city=city, category=category.lower())


def why_impact(category, city, province):
    return (
        "Few roles let you see the impact of your work as quickly as this one. "
        "Every shift, project and decision in {city} contributes to real outcomes for clients and colleagues across the {category} space in {province}."
    ).format(city=city, category=category.lower(), province=province)


WHY_BUILDERS = [why_growth, why_culture, why_impact]

# ---------------------------------------------------------------------------
# TEAM (2 variants) — neutral employer voice
# ---------------------------------------------------------------------------

def team_collaborative(category, city, province):
    return (
        "You will join a tight-knit, collaborative team that knows the {category} side of the business inside out. "
        "The {city} group is a healthy mix of experienced operators and newer joiners, all of whom share a strong commitment to delivery and to one another."
    ).format(category=category.lower(), city=city)


def team_fast_paced(category, city, province):
    return (
        "The team you will be working with is fast-paced and energetic. "
        "Things move quickly across the {city} office, and the people who thrive here are the ones who plan ahead, communicate openly and pick up the slack when {province} operations get busy."
    ).format(city=city, province=province)


TEAM_BUILDERS = [team_collaborative, team_fast_paced]

# ---------------------------------------------------------------------------
# LOCATION CONTEXT — neutral employer voice
# ---------------------------------------------------------------------------

LOCATION_TEMPLATES = [
    "The role is based in {city}, {flav}. "
    "Public transport links and parking are within easy reach, making the daily commute manageable for candidates living across {city} and the broader {province} region.",
    "{city} continues to grow as an employment hub in {province}, {flav_with}. "
    "This role gives you a foothold in one of its busier business communities, with access to the local services, suppliers and partners that keep the work moving.",
    "Working in {city} means a place {flav}, with a steady flow of activity and a strong local economy. "
    "The team has built solid relationships across the {province} region, and the {city} office benefits from those long-standing connections.",
]

# ---------------------------------------------------------------------------
# A DAY IN THE LIFE — narrative paragraph per category, neutral voice
# ---------------------------------------------------------------------------

DAY_IN_LIFE = {
    "Retail Jobs": (
        "Your day usually starts before the doors open, walking the floor, checking displays "
        "and making sure tills are float-ready. As customers arrive, you switch into service mode, "
        "moving between till points, fitting rooms and the stockroom, helping shoppers find what they need "
        "and keeping a quiet eye on shrinkage. By the afternoon, you might be receiving a delivery, "
        "training a new team member or planning the next promotion, and by close of business you're "
        "cashing up, balancing reports and getting the store ready to do it all again tomorrow."
    ),
    "Finance Jobs": (
        "Most days begin by working through your inbox, prioritising urgent supplier or audit queries "
        "before settling into the books. You move between reconciliations, journal entries and review "
        "meetings, breaking out spreadsheets when something doesn't tie up. Mid-morning calls with "
        "operations or sales help you understand the numbers behind the numbers, and the afternoon is "
        "usually given to deeper work: management reports, tax submissions or supporting a junior "
        "with a tricky reconciliation. By the time you log off, you have nudged the business closer to a clean month-end."
    ),
    "IT Jobs": (
        "Your day tends to start with a quick standup, where the team shares progress and surfaces blockers. "
        "From there, you settle into focused build time, breaking tickets into manageable chunks and "
        "pairing with colleagues when something gets thorny. Afternoons mix code reviews, planning "
        "discussions and the occasional production incident — everyone pulls together, fixes the issue "
        "and feeds the lessons back into the next sprint. By the time you sign off, you've shipped value, learned something new, and left clean code behind you."
    ),
    "Health Jobs": (
        "You start your shift with a thorough handover, picking up patient histories, treatment plans "
        "and any concerns from the previous team. The morning is paced but purposeful — vital signs, "
        "medication rounds, bedside conversations — and you're constantly switching between clinical "
        "tasks and the very human work of reassuring patients and families. Multi-disciplinary rounds "
        "give you a chance to advocate for your patients, and by the time you hand over again, "
        "you have done meaningful work that makes a real difference to the people in your care."
    ),
    "Logistics Jobs": (
        "Your day kicks off in the yard or at the dock, checking schedules, briefing your team and "
        "lining up the day's priorities. You move between receiving, picking, dispatch and the WMS, "
        "keeping a close eye on accuracy and time slots. There are constant conversations — with drivers, "
        "controllers, customers and the warehouse floor — and the better you communicate, the smoother things run. "
        "By the end of the shift, the racks are tidy, the trucks are out, and the next inbound load is already on its way."
    ),
    "Marketing Jobs": (
        "You usually start by scanning campaign dashboards over coffee, checking performance against "
        "targets and flagging anything that needs attention. Mornings are often given to creative work — "
        "briefing designers, refining copy, planning the next content drop — while afternoons mix "
        "stakeholder meetings, agency calls and a steady stream of approvals. In between, you're "
        "watching what competitors are doing, listening to what customers are saying online, and "
        "shaping the next set of experiments to push the brand forward."
    ),
    "Administration Jobs": (
        "Your day starts at the front of the business, ready to greet visitors, answer the switchboard "
        "and make sure the leadership diaries are in order. Through the morning you balance calls, "
        "couriers, capturing data and supporting projects with neat, accurate work. After lunch, you "
        "might be preparing minutes from a board pack, helping HR onboard a new starter, or chasing a "
        "courier across town. By close of day, every desk you support knows you have it covered, and "
        "the office is set up for a calm, productive tomorrow."
    ),
    "HR Jobs": (
        "Your day is people-shaped from the moment you log in. You move between recruitment screens, "
        "manager calls, payroll queries and the occasional sensitive conversation that needs your full "
        "attention. Mid-morning you might be running an onboarding session for new starters, and by "
        "the afternoon you're back at your desk preparing EE or B-BBEE reports. Through it all, "
        "you balance compliance with care, making sure that policies are followed and people are heard."
    ),
    "Legal and Security Jobs": (
        "Your day is built on focus and detail. You work through matter files or post lists, review "
        "evidence or contracts and check that every required record is in place. Communication with "
        "site teams, attorneys, clients or SAPS is constant, and you keep your reports factual, "
        "precise and timely. When something out of the ordinary happens, you respond calmly and "
        "follow procedure, knowing that good documentation today protects the business tomorrow."
    ),
    "Engineering Jobs": (
        "Mornings often begin on site, walking through plant or project areas with the team and "
        "picking up where yesterday's work ended. You move between technical reviews, contractor "
        "discussions and hands-on troubleshooting, balancing safety, cost and quality at every "
        "decision point. The afternoon might involve drawings, reports or a planning session for an "
        "upcoming shutdown. By the time you knock off, you have kept production running, advanced the "
        "project plan and helped the team go home safely."
    ),
    "In-Service Training": (
        "Your day starts with a quick check-in with your mentor and a review of the tasks you'll "
        "shadow or own. You spend time observing experienced colleagues, asking questions and "
        "trying small pieces of work yourself. As the day progresses, you capture notes for your "
        "logbook, attend team huddles and contribute where you can. The mix of structured learning, "
        "real workplace exposure and supportive feedback helps you turn classroom theory into "
        "skills you can actually use."
    ),
    "Teaching Jobs": (
        "Your day begins before the bell, with last-minute lesson prep, learner check-ins and a "
        "moment to set the tone for the classroom. Lessons follow the rhythm of the timetable, but "
        "no two are quite the same — you adapt explanations, encourage quiet learners, and gently "
        "redirect those who need it. Breaks are spent marking, planning or supporting colleagues, "
        "and after-school hours might bring a meeting, an extra-mural or a parent conversation. "
        "By the time you head home, you have shaped young minds in small but lasting ways."
    ),
    "Hospitality Jobs": (
        "Your shift usually starts with a brief from the duty manager, a quick station check and a "
        "look at the day's bookings or specials. As guests arrive, you slip into a steady rhythm — "
        "warm welcomes, accurate orders and seamless coordination with the kitchen and bar. Service "
        "peaks demand calm focus and tight teamwork, and quieter moments are spent resetting tables, "
        "polishing glassware or training a new starter. When the last guest leaves happy, you know "
        "you have delivered a memorable hospitality experience."
    ),
}

# ---------------------------------------------------------------------------
# CAREER GROWTH (2 variants) — neutral employer voice
# ---------------------------------------------------------------------------

def growth_v1(category, city, province):
    return (
        "This role can grow with you. Strong performers in the {category} team in {city} "
        "have moved into senior, supervisory and specialist positions, "
        "and that journey is supported through coaching, training and exposure to bigger projects."
    ).format(category=category.lower(), city=city)


def growth_v2(category, city, province):
    return (
        "Career progression here is real, not a slogan. "
        "The {category} space in {city} offers a clear runway from delivery into team leadership and beyond, "
        "and managers sit down with each team member regularly to map out the next step in {province}."
    ).format(category=category.lower(), city=city, province=province)


GROWTH_BUILDERS = [growth_v1, growth_v2]

# ---------------------------------------------------------------------------
# WORK ENVIRONMENT (category-specific) — neutral
# ---------------------------------------------------------------------------

ENVIRONMENT = {
    "Retail Jobs": (
        "The work environment is fast-paced and customer-facing. "
        "Expect long periods on your feet, weekend and public-holiday shifts, "
        "and the energy that comes with a busy retail floor."
    ),
    "Finance Jobs": (
        "The environment is structured and deadline-driven, with peaks around month-end, "
        "year-end and audit cycles. The wider team is collaborative, but focused work is the norm."
    ),
    "IT Jobs": (
        "The environment is hybrid-friendly where the role allows, with collaborative tooling, "
        "modern source-control workflows and a strong emphasis on shared ownership of code and incidents."
    ),
    "Health Jobs": (
        "The environment is clinical, regulated and patient-centred. "
        "Shift work, infection control protocols and clear scope-of-practice boundaries are part of every working day."
    ),
    "Logistics Jobs": (
        "The environment is operationally driven and physical at times, "
        "with shift-based work, strict safety standards and a strong focus on accuracy and on-time delivery."
    ),
    "Marketing Jobs": (
        "The environment is creative, deadline-driven and data-aware. "
        "Cross-functional work with sales, product and design is the norm, and ideas are tested with real audiences quickly."
    ),
    "Administration Jobs": (
        "The environment is professional and structured. "
        "Expect a calm, well-organised office, a steady flow of support requests, and a strong culture of confidentiality."
    ),
    "HR Jobs": (
        "The environment blends desk-based administrative work with frequent interactions across the business. "
        "Confidentiality, fairness and compliance underpin the work."
    ),
    "Legal and Security Jobs": (
        "The environment is process-driven and regulation-aware. "
        "Whether you are at a desk or on site, attention to detail, calm conduct and accurate reporting are non-negotiable."
    ),
    "Engineering Jobs": (
        "The environment combines office-based design and planning with site-based execution. "
        "Safety, quality and continuous improvement sit at the heart of how the team works."
    ),
    "In-Service Training": (
        "The environment is structured for learning, with experienced mentors, clear expectations "
        "and steady feedback. You will be treated as part of the team while you build practical skills."
    ),
    "Teaching Jobs": (
        "The environment is school-based, with structured timetables, a strong focus on learner well-being "
        "and a culture of professional collaboration across phases and subjects."
    ),
    "Hospitality Jobs": (
        "The environment is service-led and people-centred. "
        "Expect varied hours, a high tempo during peaks, and a team culture built on hospitality and pride in the guest experience."
    ),
}

# ---------------------------------------------------------------------------
# DIVERSITY AND INCLUSION (3 variants) — neutral
# ---------------------------------------------------------------------------

DIVERSITY_VARIANTS = [
    "The organisation is committed to transformation and equal opportunity. "
    "Hiring is on merit, and applications are actively encouraged from women, youth, "
    "people with disabilities and other historically disadvantaged groups in line with the Employment Equity plan and B-BBEE objectives.",
    "Diverse teams build stronger workplaces. "
    "Applications are welcome from candidates of every background, language and community across {province}, "
    "and recruitment is fair, transparent and aligned with the EE Act.",
    "Inclusion is a core part of how the team operates. "
    "This is an equal-opportunity employer, and candidates from all communities — including women, youth and persons living with disabilities — are encouraged to apply for this role in {city}.",
]

# ---------------------------------------------------------------------------
# FAQ POOL (LONG-tier only) — no application/HR/CV instructions
# ---------------------------------------------------------------------------

FAQ_POOL = [
    ("Is this position open to recent graduates?",
     "Yes. Provided the minimum requirements listed above are met, graduates are warmly encouraged to put their names forward."),
    ("What shift patterns apply to this role?",
     "Shift patterns vary by site, but the role typically follows the standard operational hours of the relevant branch. The hiring team will walk you through the specifics during the interview."),
    ("Is training provided for this position?",
     "Yes. New joiners receive structured onboarding, and ongoing coaching and skills development are built into how the team operates."),
    ("Is there opportunity for promotion?",
     "Definitely. Strong performers regularly move into senior, supervisory or specialist roles within the business."),
    ("Is this position open to candidates from other provinces?",
     "Yes, although preference is generally given to candidates already based in or near the listed city."),
    ("Are reference and background checks conducted?",
     "Yes. Reference, criminal and qualification checks are part of the standard pre-employment process."),
    ("Is reasonable accommodation supported for applicants with disabilities?",
     "Yes. The hiring team is committed to inclusive recruitment and engages on reasonable accommodation as part of the process."),
]

# ---------------------------------------------------------------------------
# UTILITIES — slug, HTML wrappers, first-word collision
# ---------------------------------------------------------------------------

def slugify(text):
    out = []
    prev_dash = False
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif ch in (" ", "-", "_", "/", ",", "'", "&", ".", "(", ")"):
            if not prev_dash:
                out.append("-")
                prev_dash = True
    slug = "".join(out).strip("-")
    return slug or "job"


def html_p(text):
    return "<p>{0}</p>".format(text)


def html_h2(text):
    return "<h2>{0}</h2>".format(text)


def html_h3(text):
    return "<h3>{0}</h3>".format(text)


def html_ul(items):
    inner = "".join("<li>{0}</li>".format(i) for i in items)
    return "<ul>{0}</ul>".format(inner)


def first_word(sentence):
    s = sentence.strip()
    while s.startswith("<"):
        end = s.find(">")
        if end == -1:
            break
        s = s[end + 1:].lstrip()
    word = ""
    for ch in s:
        if ch.isalpha() or ch == "'":
            word += ch
        else:
            break
    return word.lower()


CONNECTORS = [
    "Importantly,", "In addition,", "Crucially,", "Equally,",
    "Beyond that,", "Notably,", "Practically speaking,", "On top of that,",
]


def avoid_first_word_collision(text, used_first_words):
    fw = first_word(text)
    if fw and fw in used_first_words:
        connector = random.choice(CONNECTORS)
        stripped = text.lstrip()
        if stripped and stripped[0].isalpha():
            stripped = stripped[0].lower() + stripped[1:]
        text = "{c} {p}".format(c=connector, p=stripped)
        fw = first_word(text)
    if fw:
        used_first_words.add(fw)
    return text


def pick_unique_heading(key, used_headings):
    options = HEADINGS[key]
    available = [h for h in options if h not in used_headings]
    chosen = random.choice(available) if available else random.choice(options)
    used_headings.add(chosen)
    return chosen


def pick_location_heading(city, used_headings):
    available = [t for t in LOCATION_HEADING_PATTERNS
                 if t.format(city=city) not in used_headings]
    pattern = random.choice(available) if available else random.choice(LOCATION_HEADING_PATTERNS)
    heading = pattern.format(city=city)
    used_headings.add(heading)
    return heading


def _optional_extension_paragraphs(section_key, ctx, used_first_words):
    """Return tier-scaled extra <p> blocks for an optional section."""
    n = {"SHORT": 2, "MEDIUM": 3, "LONG": 3}[ctx["length_tier"]]
    if n == 0:
        return []
    pool = OPTIONAL_EXTENSIONS.get(section_key, [])
    if not pool:
        return []
    used_pool = ctx.setdefault("_used_extensions", set())
    out = []
    for _ in range(n):
        avail = [p for p in pool if p not in used_pool] or pool
        chosen = random.choice(avail)
        used_pool.add(chosen)
        body = chosen.format(city=ctx["city"], province=ctx["province"])
        body = avoid_first_word_collision(body, used_first_words)
        out.append(html_p(body))
    return out

# ---------------------------------------------------------------------------
# LENGTH TIERS
# ---------------------------------------------------------------------------

# 30/50/20 distribution
LENGTH_TIER_POOL = ["SHORT"] * 30 + ["MEDIUM"] * 50 + ["LONG"] * 20

# Optional sections and their probability of inclusion
OPTIONAL_SECTIONS = [
    ("why_join", 50),
    ("team", 40),
    ("location", 60),
    ("day", 30),
    ("growth", 35),
    ("environment", 45),
    ("diversity", 55),
    # FAQ handled separately for LONG-tier only
]


def pick_optional_sections(length_tier):
    """Return an ordered list of optional section keys for this job."""
    names = [n for n, _ in OPTIONAL_SECTIONS]
    weights = {n: w for n, w in OPTIONAL_SECTIONS}

    if length_tier == "SHORT":
        target = random.randint(2, 3)
    elif length_tier == "MEDIUM":
        target = random.randint(4, 5)
    else:
        target = random.randint(6, len(names))

    pool = list(names)
    chosen = []
    while len(chosen) < target and pool:
        total = sum(weights[n] for n in pool)
        r = random.uniform(0, total)
        upto = 0
        picked = pool[-1]
        for n in pool:
            upto += weights[n]
            if upto >= r:
                picked = n
                break
        pool.remove(picked)
        chosen.append(picked)

    # FAQ: 20% chance, only on LONG tier
    if length_tier == "LONG" and random.random() < 0.20:
        chosen.append("faq")

    random.shuffle(chosen)
    return chosen

# ---------------------------------------------------------------------------
# SECTION BUILDERS
# ---------------------------------------------------------------------------

def section_overview(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("overview", used_headings)
    paras = []
    used_p = ctx.setdefault("_used_overview_p", set())

    # Always include 2 paragraphs from P1 + P2
    p1_pool = [p for p in OVERVIEW_P1 if p not in used_p] or OVERVIEW_P1
    p1 = random.choice(p1_pool)
    used_p.add(p1)
    p1 = p1.format(
        title=ctx["title"], city=ctx["city"], province=ctx["province"],
        category_lower=ctx["category"].lower(),
    )
    p1 = avoid_first_word_collision(p1, used_first_words)
    paras.append(html_p(p1))

    p2_pool = [p for p in OVERVIEW_P2 if p not in used_p] or OVERVIEW_P2
    p2 = random.choice(p2_pool)
    used_p.add(p2)
    p2 = p2.format(
        title=ctx["title"], city=ctx["city"], province=ctx["province"],
        category_lower=ctx["category"].lower(),
    )
    p2 = avoid_first_word_collision(p2, used_first_words)
    paras.append(html_p(p2))

    # Tier-based extra paragraphs from P3 pool
    extras_target = {"SHORT": 1, "MEDIUM": 2, "LONG": 3}[ctx["length_tier"]]
    p3_pool = list(OVERVIEW_P3)
    for _ in range(extras_target):
        avail = [p for p in p3_pool if p not in used_p] or p3_pool
        chosen = random.choice(avail)
        used_p.add(chosen)
        body = chosen.format(
            title=ctx["title"], city=ctx["city"], province=ctx["province"],
            category_lower=ctx["category"].lower(),
        )
        body = avoid_first_word_collision(body, used_first_words)
        paras.append(html_p(body))
        if chosen in p3_pool:
            p3_pool.remove(chosen)

    return html_h2(heading) + "".join(paras)


def section_duties(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("duties", used_headings)
    pool = DUTY_POOLS[ctx["category"]]
    n = random.randint(5, 8)
    items = random.sample(pool, n)
    ctx["_duty_items"] = list(items)
    return html_h2(heading) + html_ul(items)


def section_requirements(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("requirements", used_headings)
    pool = REQUIREMENT_POOLS[ctx["category"]]
    n = random.randint(5, 7)
    items = random.sample(pool, n)
    closer = random.choice(REQUIREMENTS_CLOSERS)
    closer = avoid_first_word_collision(closer, used_first_words)
    return html_h2(heading) + html_ul(items) + html_p(closer)


def section_why_join(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("why_join", used_headings)
    body = random.choice(WHY_BUILDERS)(
        ctx["category"], ctx["city"], ctx["province"]
    )
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "why_join", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_team(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("team", used_headings)
    body = random.choice(TEAM_BUILDERS)(
        ctx["category"], ctx["city"], ctx["province"]
    )
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "team", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_location(ctx, used_headings, used_first_words):
    heading = pick_location_heading(ctx["city"], used_headings)
    flavours = GEO_FLAVOUR.get(ctx["province"], [])
    flav = random.choice(flavours) if flavours else "well-positioned for local commuters"
    flav_with = "with " + flav
    template = random.choice(LOCATION_TEMPLATES)
    body = template.format(
        city=ctx["city"], province=ctx["province"],
        flav=flav, flav_with=flav_with,
    )
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "location", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_day(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("day", used_headings)
    body = DAY_IN_LIFE[ctx["category"]]
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "day", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_growth(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("growth", used_headings)
    body = random.choice(GROWTH_BUILDERS)(
        ctx["category"], ctx["city"], ctx["province"]
    )
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "growth", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_environment(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("environment", used_headings)
    body = ENVIRONMENT[ctx["category"]]
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "environment", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_diversity(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("diversity", used_headings)
    body = random.choice(DIVERSITY_VARIANTS).format(
        city=ctx["city"], province=ctx["province"],
    )
    body = avoid_first_word_collision(body, used_first_words)
    paragraphs = [html_p(body)]
    paragraphs.extend(_optional_extension_paragraphs(
        "diversity", ctx, used_first_words
    ))
    return html_h2(heading) + "".join(paragraphs)


def section_faq(ctx, used_headings, used_first_words):
    heading = pick_unique_heading("faq", used_headings)
    n = random.randint(3, 5)
    qa = random.sample(FAQ_POOL, n)
    parts = [html_h2(heading)]
    for q, a in qa:
        parts.append(html_h3(q))
        a_text = avoid_first_word_collision(a, used_first_words)
        parts.append(html_p(a_text))
    return "".join(parts)


OPTIONAL_BUILDERS = {
    "why_join": section_why_join,
    "team": section_team,
    "location": section_location,
    "day": section_day,
    "growth": section_growth,
    "environment": section_environment,
    "diversity": section_diversity,
    "faq": section_faq,
}

# ---------------------------------------------------------------------------
# DUTY OVERLAP TRACKING (60% cap per category)
# ---------------------------------------------------------------------------

LAST_DUTIES_PER_CATEGORY = {}


def section_duties_with_overlap_cap(ctx, used_headings, used_first_words,
                                    max_attempts=6):
    cat = ctx["category"]
    last_set = LAST_DUTIES_PER_CATEGORY.get(cat, set())

    for _ in range(max_attempts):
        prior_headings = set(used_headings)
        html = section_duties(ctx, used_headings, used_first_words)
        new_set = set(ctx["_duty_items"])
        if not last_set:
            LAST_DUTIES_PER_CATEGORY[cat] = new_set
            return html
        overlap = len(new_set & last_set) / float(len(new_set))
        if overlap < 0.60:
            LAST_DUTIES_PER_CATEGORY[cat] = new_set
            return html
        used_headings.clear()
        used_headings.update(prior_headings)
    LAST_DUTIES_PER_CATEGORY[cat] = set(ctx["_duty_items"])
    return html

# ---------------------------------------------------------------------------
# OPENING SENTENCE UNIQUENESS
# ---------------------------------------------------------------------------

USED_OPENERS = set()


def first_sentence(text):
    end = len(text)
    for ch in ".!?":
        idx = text.find(ch)
        if idx != -1 and idx < end:
            end = idx + 1
    return text[:end].strip()


def make_unique_opener(opener_text):
    sent = first_sentence(opener_text).lower()
    if sent in USED_OPENERS:
        prefix_options = [
            "This is a current vacancy. ",
            "Listing live now. ",
            "Posted recently. ",
        ]
        opener_text = random.choice(prefix_options) + opener_text
        sent = first_sentence(opener_text).lower()
    USED_OPENERS.add(sent)
    return opener_text

# ---------------------------------------------------------------------------
# JOB ASSEMBLY — content ends after Requirements, nothing appended after
# ---------------------------------------------------------------------------

LAST_SECTION_ORDER = None


def build_job_content(ctx):
    global LAST_SECTION_ORDER

    used_headings = set()
    used_first_words = set()

    # 1. Opening paragraph (no heading)
    opener_builder = OPENING_BUILDERS[ctx["tone"]]
    opener = opener_builder(
        ctx["title"], ctx["city"], ctx["province"],
        ctx["jt_phrase"], ctx["category"],
    )
    opener = make_unique_opener(opener)
    opener = avoid_first_word_collision(opener, used_first_words)
    parts = [html_p(opener)]

    # Build optional section list and full ordering
    optional_keys = pick_optional_sections(ctx["length_tier"])
    section_order = ["overview"] + optional_keys + ["duties", "requirements"]

    # Avoid two consecutive jobs with identical section order
    if LAST_SECTION_ORDER is not None and section_order == LAST_SECTION_ORDER:
        if len(optional_keys) > 1:
            random.shuffle(optional_keys)
            section_order = ["overview"] + optional_keys + ["duties", "requirements"]
    LAST_SECTION_ORDER = list(section_order)

    for key in section_order:
        if key == "overview":
            parts.append(section_overview(ctx, used_headings, used_first_words))
        elif key == "duties":
            parts.append(section_duties_with_overlap_cap(
                ctx, used_headings, used_first_words
            ))
        elif key == "requirements":
            parts.append(section_requirements(ctx, used_headings, used_first_words))
        else:
            builder = OPTIONAL_BUILDERS[key]
            parts.append(builder(ctx, used_headings, used_first_words))

    return "".join(parts)

# ---------------------------------------------------------------------------
# EXCERPT BUILDER (plain text, no HTML, no Work-Force mention)
# ---------------------------------------------------------------------------

def build_excerpt(ctx):
    title = ctx["title"]
    city = ctx["city"]
    province = ctx["province"]
    jt_phrase = ctx["jt_phrase"]
    category_lower = ctx["category"].lower()

    options = [
        ("A {title} is wanted in {city}, {province}. "
         "This {jt} suits a candidate with strong delivery skills and a steady professional manner. "
         "Read the full brief and submit your interest today."),
        ("Looking for a role in {category_lower}? A {jt} for a {title} is open in {city}, {province}. "
         "The role offers a clear remit, an experienced team and room to grow."),
        ("A new {jt} for a {title} is now live in {city}, {province}. "
         "Applications are welcome from candidates across the region who are ready to step in and deliver."),
    ]
    return random.choice(options).format(
        title=title, city=city, province=province,
        jt=jt_phrase, category_lower=category_lower,
    )

# ---------------------------------------------------------------------------
# JOB TYPE PHRASING
# ---------------------------------------------------------------------------

JOB_TYPE_PHRASE = {
    "Full Time": "full-time role",
    "Part Time": "part-time role",
    "Internship": "structured internship",
    "Temporary": "temporary contract role",
}

# ---------------------------------------------------------------------------
# ROW BUILDER + STREAMING WRITER
# ---------------------------------------------------------------------------

def build_row(row_id, today_date_str, expiry_date_str):
    province = random.choice(list(PROVINCES_CITIES.keys()))
    city = random.choice(PROVINCES_CITIES[province])
    category = random.choice(CATEGORIES)
    title = random.choice(JOB_TITLES[category])
    job_type = random.choice(JOB_TYPES)
    jt_phrase = JOB_TYPE_PHRASE[job_type]
    tone = random.choice(TONES)
    length_tier = random.choice(LENGTH_TIER_POOL)
    application_email = APPLICATION_EMAILS[(row_id - 1) % len(APPLICATION_EMAILS)]

    ctx = {
        "title": title,
        "city": city,
        "province": province,
        "category": category,
        "job_type": job_type,
        "jt_phrase": jt_phrase,
        "tone": tone,
        "length_tier": length_tier,
        "application_email": application_email,
    }

    content_html = build_job_content(ctx)
    excerpt = build_excerpt(ctx)

    # Compliance check — abort loudly if any banned phrase slipped through
    lint_text(content_html, row_id)
    lint_text(excerpt, row_id)

    # Slug: title + city + row_id (no province)
    slug = "{0}-{1}-{2}".format(
        slugify(title), slugify(city), row_id,
    )
    permalink = "{0}{1}/".format(PERMALINK_PREFIX, slug)
    location_str = "{0}, {1}".format(city, province)

    row = [
        str(row_id),                # ID
        title,                      # Title (job title only)
        content_html,               # Content
        excerpt,                    # Excerpt
        today_date_str,             # Date
        POST_TYPE,                  # Post Type
        permalink,                  # Permalink
        "",                         # Image URL
        "",                         # Image Title
        "",                         # Image Caption
        "",                         # Image Description
        "",                         # Image Alt Text
        "",                         # Image Featured
        "",                         # Attachment URL
        category,                   # job_listing_category
        job_type,                   # job_listing_type (taxonomy)
        STATUS,                     # Status
        AUTHOR_ID,                  # Author ID
        AUTHOR_USERNAME,            # Author Username
        AUTHOR_EMAIL,               # Author Email
        AUTHOR_FIRST_NAME,          # Author First Name (blank)
        AUTHOR_LAST_NAME,           # Author Last Name
        slug,                       # Slug
        "",                         # Format
        "",                         # Template
        "",                         # Parent
        "",                         # Parent Slug
        "0",                        # Order
        COMMENT_STATUS,             # Comment Status
        PING_STATUS,                # Ping Status
        today_date_str,             # Post Modified Date (same as Date)
        location_str,               # _job_location
        job_type,                   # _job_type (postmeta — mirrors taxonomy)
        expiry_date_str,            # _job_expires
        COMPANY_NAME,               # _company_name
        application_email,          # _application
    ]
    return row


def main():
    start = datetime.now()

    today = datetime.today()
    today_str = today.strftime("%Y-%m-%d")
    expiry_str = (today + timedelta(days=30)).strftime("%Y-%m-%d")

    output_path = os.path.join(os.getcwd(), OUTPUT_FILE)

    print("Work-Force job listing generator")
    print("--------------------------------")
    print("Target rows  : {0:,}".format(NUM_ROWS))
    print("Post date    : {0}".format(today_str))
    print("Expires      : {0}".format(expiry_str))
    print("Output file  : {0}".format(output_path))
    print()

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(CSV_HEADERS)

        for row_id in range(1, NUM_ROWS + 1):
            row = build_row(row_id, today_str, expiry_str)
            writer.writerow(row)
            if row_id % PROGRESS_EVERY == 0:
                print("  ... {0:,} rows written".format(row_id))

    end = datetime.now()
    elapsed = (end - start).total_seconds()
    size_bytes = os.path.getsize(output_path)
    size_mb = size_bytes / (1024.0 * 1024.0)

    print()
    print("Done.")
    print("Total rows   : {0:,}".format(NUM_ROWS))
    print("File size    : {0:,} bytes ({1:.2f} MB)".format(size_bytes, size_mb))
    print("Time taken   : {0:.2f} seconds".format(elapsed))
    print("Output       : {0}".format(output_path))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrupted by user.")
        sys.exit(130)
