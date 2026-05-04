// ============================================================
//  EDUBUZZ — PocketBase Collections Setup
//  Run PocketBase, go to http://localhost:8090/_/
//  Create these collections exactly as described.
// ============================================================

// ── 1. jobs ──────────────────────────────────────────────────
// Type: Base collection
// Fields:
//   title         Text        required
//   slug          Text        required, unique
//   company       Text        required
//   category      Text        
//   province      Text        
//   city          Text        
//   description   Editor      (rich text)
//   apply_url     URL
//   apply_email   Email
//   salary_min    Number
//   salary_max    Number
//   job_type      Select      values: Full-time,Part-time,Contract,Internship,Temporary,Remote
//   source        Text        default: "manual"
//   featured      Bool        default: false
//   ai_written    Bool        default: false
//   active        Bool        default: true
//   expires       Date
// API Rules: List/View = "" (public), Create/Update/Delete = @request.auth.id != ""

// ── 2. categories ────────────────────────────────────────────
// Type: Base collection
// Fields:
//   name          Text        required, unique
//   slug          Text        required, unique
//   icon          Text        (emoji, e.g. 🏥)
//   color         Text        (Tailwind class hint)
//   job_count     Number      (updated manually or via hook)
// API Rules: List/View = "" (public), all others = admin only

// ── 3. applications ──────────────────────────────────────────
// Type: Base collection
// Fields:
//   job           Relation    → jobs (required)
//   name          Text        required
//   email         Email       required
//   phone         Text
//   cover_letter  Text (long)
//   resume        File        (single file, max 5MB)
// API Rules: List/View = admin only, Create = "" (public)

// ── 4. pending_jobs ──────────────────────────────────────────
// Type: Base collection
// Fields:
//   employer_name  Text       required
//   employer_email Email      required
//   company        Text       required
//   title          Text       required
//   description    Editor     required
//   province       Text       required
//   city           Text
//   job_type       Select     same values as jobs
//   salary_min     Number
//   salary_max     Number
//   apply_url      URL
//   apply_email    Email
//   status         Select     values: pending,approved,rejected  default: pending
// API Rules: List/View = admin only, Create = "" (public)

// ── 5. job_alerts ────────────────────────────────────────────
// Type: Base collection
// Fields:
//   email         Email       required
//   keyword       Text
//   province      Text
//   category      Text
// API Rules: List/View = admin only, Create = "" (public)

// ── 6. blog_posts (optional) ─────────────────────────────────
// Type: Base collection
// Fields:
//   title         Text        required
//   slug          Text        required, unique
//   content       Editor
//   excerpt       Text
//   cover         File
//   published     Bool        default: false
// API Rules: List/View = "" (public)

// ============================================================
//  SEED CATEGORIES (paste into PocketBase admin one by one)
// ============================================================
const SEED_CATEGORIES = [
  { name: 'Government',     slug: 'government',     icon: '🏛', color: 'accent' },
  { name: 'Health',         slug: 'health',          icon: '🏥', color: 'success' },
  { name: 'IT & Tech',      slug: 'it-tech',         icon: '💻', color: 'purple' },
  { name: 'Engineering',    slug: 'engineering',     icon: '⚙️',  color: 'warn' },
  { name: 'Finance',        slug: 'finance',         icon: '💰', color: 'danger' },
  { name: 'Education',      slug: 'education',       icon: '🎓', color: 'success' },
  { name: 'Retail',         slug: 'retail',          icon: '🛒', color: 'warn' },
  { name: 'Logistics',      slug: 'logistics',       icon: '🚚', color: 'muted' },
  { name: 'HR',             slug: 'hr',              icon: '👥', color: 'accent' },
  { name: 'Administration', slug: 'administration',  icon: '📋', color: 'muted' },
  { name: 'Marketing',      slug: 'marketing',       icon: '📣', color: 'accent' },
  { name: 'Hospitality',    slug: 'hospitality',     icon: '🍽',  color: 'warn' },
  { name: 'Cleaning',       slug: 'cleaning',        icon: '🧹', color: 'muted' },
  { name: 'Security',       slug: 'security',        icon: '🔒', color: 'danger' },
  { name: 'Internship',     slug: 'internship',      icon: '🎯', color: 'success' },
];

// ============================================================
//  SEED JOBS — paste these into PocketBase admin manually
//  or use the PocketBase SDK in a seed script
// ============================================================
const SEED_JOBS = [
  {
    title: 'Junior Software Developer',
    company: 'Edubuzz (Demo)',
    category: 'IT & Tech',
    province: 'Gauteng',
    city: 'Johannesburg',
    job_type: 'Full-time',
    salary_min: 240000,
    salary_max: 360000,
    description: '<p><strong>About the role:</strong></p><p>We are looking for a passionate Junior Software Developer to join our growing team in Johannesburg. You will work on exciting web projects using modern technologies.</p><ul><li>Build and maintain web applications</li><li>Collaborate with senior developers</li><li>Write clean, well-documented code</li></ul>',
    source: 'manual',
    active: true,
    featured: true,
  },
  {
    title: 'Registered Nurse',
    company: 'Netcare Group',
    category: 'Health',
    province: 'Western Cape',
    city: 'Cape Town',
    job_type: 'Full-time',
    salary_min: 300000,
    salary_max: 420000,
    description: '<p>Netcare is seeking a qualified Registered Nurse for our Cape Town facilities.</p><ul><li>Patient care and monitoring</li><li>Administer medication as prescribed</li><li>Maintain accurate patient records</li></ul>',
    source: 'manual',
    active: true,
  },
  {
    title: 'General Worker',
    company: 'Shoprite Group',
    category: 'Retail',
    province: 'Gauteng',
    city: 'Soweto',
    job_type: 'Full-time',
    salary_min: 60000,
    salary_max: 80000,
    description: '<p>Shoprite is hiring General Workers for our Gauteng stores. No experience required — we will train you.</p><ul><li>Packing shelves and maintaining store cleanliness</li><li>Assisting customers</li><li>Stock management</li></ul>',
    source: 'manual',
    active: true,
  },
];

module.exports = { SEED_CATEGORIES, SEED_JOBS };
