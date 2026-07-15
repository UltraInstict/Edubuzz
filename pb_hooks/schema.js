// ============================================================
//  EDUBUZZ — PocketBase Collections Setup
//  Run PocketBase, go to http://localhost:8090/_/
//  Create these collections exactly as described.
// ============================================================

// ── 1. jobs ──────────────────────────────────────────────────
// Type: Base collection
// Fields:
//   title           Text     required
//   slug            Text     required, unique
//   company         Text     required
//   category        Text
//   province        Text
//   city            Text
//   description     Editor   (rich text)
//   apply_url       URL
//   apply_email     Email
//   salary_min      Number
//   salary_max      Number
//   job_type        Select   values: Full-time,Part-time,Contract,Internship,Learnership,Graduate Programme,Bursary,Temporary,Remote
//   source          Text     default: "manual"
//   source_ref      Text     (unique id from inbound feed)
//   employer_id     Text     (relation, kept as text for portability)
//   views           Number
//   clicks          Number
//   apply_clicks    Number
//   featured        Bool     default: false
//   featured_expires Date
//   active          Bool     default: true
//   expires         Date
//   xml_export      Bool     default: true
//   sponsored       Bool     default: false          ← MONETIZATION: mark job as eligible for sponsored campaigns
//   promotion_type  Text     default: ""             ← MONETIZATION: organic|featured|sponsored|premium
// API Rules: List/View = "" (public), Create/Update/Delete = @request.auth.id != ""
//   sponsored + promotion_type fields restricted to admin-only updates

// ── 2. categories ────────────────────────────────────────────
// Fields:
//   name       Text   required, unique
//   slug       Text   required, unique
//   icon       Text
//   color      Text
//   job_count  Number
// API Rules: List/View = "" (public), all others = admin only

// ── 3. applications ──────────────────────────────────────────
// Fields:
//   job          Relation → jobs (required)
//   name         Text     required
//   email        Email    required
//   phone        Text
//   text         Text (long)   (cover letter)
//   cv_file      File     (single file, max 5MB)
//   status       Select   pending,reviewed,shortlisted,rejected,quick
// API Rules: List/View = admin only, Create = "" (public)

// ── 4. pending_jobs ──────────────────────────────────────────
// Fields:
//   employer_name  Text   required
//   employer_email Email  required
//   company        Text   required
//   title          Text   required
//   category       Text
//   description    Editor required
//   province       Text   required
//   city           Text
//   job_type       Select (same values as jobs)
//   salary_min     Number
//   salary_max     Number
//   apply_url      URL
//   apply_email    Email
//   status         Select pending,approved,rejected  default: pending
// API Rules: List/View = admin only, Create = "" (public)

// ── 5. job_alerts ────────────────────────────────────────────
// Fields:
//   email     Email  required
//   keyword   Text
//   province  Text
//   category  Text
// API Rules: List/View = admin only, Create = "" (public)

// ── 6. employers ─────────────────────────────────────────────
// Fields:
//   user_id        Text
//   company_name   Text  required
//   company_slug   Text  required, unique
//   logo           File
//   website        URL
//   description    Text (long)
//   province       Text
//   city           Text
//   verified       Bool  default: false
//   blocked        Bool  default: false
//   plan           Text
//   plan_expires   Date
//   contact_email  Email
//   sponsored      Bool  default: false         ← MONETIZATION
// API Rules: List/View = "" (public, only verified), all others = admin only

// ── 7. analytics_events ──────────────────────────────────────
// Fields:
//   job_id   Text
//   event    Text   (job_viewed, job_searched, job_applied, job_shared, job_saved)
//   ref      Text
//   device   Text
//   bot      Text
//   created  Date
// API Rules: List/View = admin only, Create = "" (public)

// ── 8. saved_jobs ────────────────────────────────────────────
// Fields:
//   user_id  Text required
//   job_id   Text required
//   created  Date
// API Rules: List/View/Create = @request.auth.id != ""

// ── 9. payments ──────────────────────────────────────────────
// Fields:
//   amount       Number required
//   status       Text   required (complete, pending, failed)
//   job_id       Text
//   employer_id  Text
//   created      Date
// API Rules: admin only

// ── 10. audit_logs ───────────────────────────────────────────
// Fields:
//   event    Text required
//   details  Text (long)
//   created  Date
// API Rules: admin only

// ── 11. admin_settings ───────────────────────────────────────
// Fields:
//   key    Text required, unique
//   value  Text
// API Rules: admin only
//
// Required keys (used by SmartAdSlot):
//   adsense_publisher_id   ca-pub-XXXXXXXXXXXXXXXX
//   adsense_enabled        true | false
//   adsense_slot_strip     <slot id>
//   adsense_slot_sidebar   <slot id>
//   adsense_slot_infeed    <slot id>

// ── 12. xml_sources ──────────────────────────────────────────
// Fields:
//   name             Text   required
//   feed_url         URL    required
//   format           Select xml,json,rss,indeed_xml
//   active           Bool   default: true
//   import_count     Number
//   last_crawled     Date
//   last_job_count   Number
//   error_log        Text (long)
// API Rules: admin only

// ── 13. affiliate_links ──────────────────────────────────────
// Fields:
//   name          Text   required
//   url           URL    required
//   category      Text   (or "all" / "general")
//   zone          Select strip,sidebar,infeed,jobs-top,all
//   display_type  Select text,image,html  default: text
//   active        Bool   default: false  (default inactive for new links)
//   clicks        Number default: 0
//   description   Text
//   banner_html   Text   (HTML snippet for display_type=html)
//   image_url     URL    (external image for display_type=image)
//   banner_file   File   (uploaded image for display_type=image)
//   banner_width  Number
//   banner_height Number
// API Rules: List/View = "" (public), all others = admin only

// ── 14. affiliate_clicks ─────────────────────────────────────
// Fields:
//   link_id  Text required
//   job_id   Text
//   device   Text
//   created  Date
// API Rules: List/View = admin only, Create = "" (public)

// ── 15. monetization_campaigns ───────────────────────────────
// Type: Base collection
// Fields:
//   name            Text     required
//   campaign_type   Select   affiliate_image|affiliate_html|affiliate_text|adsense_manual|house_ad|sponsored_job|sponsored_employer
//   zone            Select   strip|sidebar|infeed|jobs-top|homepage-hero|all
//   priority        Number   default: 80
//   active          Bool     default: true
//   start_date      Date     (optional schedule start)
//   end_date        Date     (optional schedule end)
//   category_target Text     (optional contextual category)
//   reference_id    Text     required (source record id: affiliate link, house ad, job, employer, or AdSense slot key)
//   impressions     Number   default: 0
//   clicks          Number   default: 0
//   ad_width        Number   (optional, overrides natural image size for affiliate_image)
//   ad_height       Number   (optional)
// API Rules: admin only

// ── 16. house_ads ─────────────────────────────────────────────
// Fields:
//   title       Text     required
//   description Text
//   cta_text    Text     default: "Learn more"
//   image_file  File
//   link_url    Text     required
//   active      Bool     default: true
// API Rules: admin only

// ============================================================
//  SEED CATEGORIES
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
//  SEED JOBS
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
    description: '<p><strong>About the role:</strong></p><p>We are looking for a passionate Junior Software Developer to join our growing team in Johannesburg.</p><ul><li>Build and maintain web applications</li><li>Collaborate with senior developers</li><li>Write clean, well-documented code</li></ul>',
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
    description: '<p>Netcare is seeking a qualified Registered Nurse for our Cape Town facilities.</p>',
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
    description: '<p>Shoprite is hiring General Workers for our Gauteng stores.</p>',
    source: 'manual',
    active: true,
  },
];

module.exports = { SEED_CATEGORIES, SEED_JOBS };
