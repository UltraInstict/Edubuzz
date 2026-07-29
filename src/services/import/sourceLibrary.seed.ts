/**
 * Import pipeline — Source Library seed (Phase 4B, Milestone 1).
 *
 * 50+ REAL South African employers across banking, retail, mining, universities,
 * healthcare, municipalities, telecoms, logistics, insurance and technology.
 *
 * Every entry is a genuine employer with its OWN official careers URL (public
 * facts — never fabricated). `verification_status`:
 *   'verified' → careers endpoint confirmed live this session AND wired to an
 *                import connector (these are the sources already producing SA
 *                jobs today; mirrored from services/import/sources.ts).
 *   'pending'  → real employer + official careers page recorded, but NOT yet
 *                confirmed importable (needs a live check / per-employer selector
 *                config before it may be enabled). NEVER imported while pending.
 *
 * This respects the hard rule "do not activate until verified": only 'verified'
 * rows are ever handed to the import runner.
 */

import { defineSource, type SourceLibraryEntry } from './sourceLibrary';

export const SOURCE_LIBRARY_SEED: SourceLibraryEntry[] = [
  // ─── Banking ──────────────────────────────────────────────────────────────
  defineSource({ id: 'standard-bank', company_name: 'Standard Bank Group', website: 'https://www.standardbank.com', careers_url: 'https://jobs.smartrecruiters.com/StandardBankGroup', industry: 'banking', province: 'Gauteng', verification_status: 'verified', connector: 'smartrecruiters', token: 'StandardBankGroup', notes: 'Verified live via SmartRecruiters API; SA bank. Pan-African tenant — SA gate keeps only SA roles.' }),
  defineSource({ id: 'absa', company_name: 'Absa Group', website: 'https://www.absa.africa', careers_url: 'https://absa.wd3.myworkdayjobs.com/AbsaCareerSite', industry: 'banking', province: 'Gauteng', verification_status: 'pending', notes: 'Workday tenant host known; CXS career-site slug needs live confirmation before enabling.' }),
  defineSource({ id: 'nedbank', company_name: 'Nedbank', website: 'https://www.nedbank.co.za', careers_url: 'https://www.nedbank.co.za/content/nedbank/desktop/gt/en/aboutus/careers.html', industry: 'banking', province: 'Gauteng', verification_status: 'pending', notes: 'Own-site careers portal; ATS/selectors to be confirmed.' }),
  defineSource({ id: 'firstrand', company_name: 'FirstRand (FNB)', website: 'https://www.firstrand.co.za', careers_url: 'https://www.firstrand.co.za/careers/', industry: 'banking', province: 'Gauteng', verification_status: 'pending', notes: 'FNB/FirstRand careers; ATS to be identified.' }),
  defineSource({ id: 'capitec', company_name: 'Capitec Bank', website: 'https://www.capitecbank.co.za', careers_url: 'https://www.capitecbank.co.za/careers/', industry: 'banking', province: 'Western Cape', verification_status: 'pending', notes: 'HQ Stellenbosch; own-site careers.' }),
  defineSource({ id: 'investec', company_name: 'Investec', website: 'https://www.investec.com', careers_url: 'https://www.investec.com/en_za/careers.html', industry: 'banking', province: 'Gauteng', verification_status: 'pending', notes: 'Global group; SA gate required — many roles are UK.' }),
  defineSource({ id: 'tymebank', company_name: 'TymeBank', website: 'https://www.tymebank.co.za', careers_url: 'https://www.tymebank.co.za/about-us/careers/', industry: 'banking', province: 'Gauteng', verification_status: 'pending', notes: 'Digital bank; careers portal to confirm.' }),

  // ─── Insurance ──────────────────────────────────────────────────────────────
  defineSource({ id: 'outsurance', company_name: 'OUTsurance', website: 'https://www.outsurance.co.za', careers_url: 'https://jobs.smartrecruiters.com/OUTsurance', industry: 'insurance', province: 'Gauteng', verification_status: 'verified', connector: 'smartrecruiters', token: 'OUTsurance', notes: 'Verified live via SmartRecruiters API; SA insurer.' }),
  defineSource({ id: 'old-mutual', company_name: 'Old Mutual', website: 'https://www.oldmutual.co.za', careers_url: 'https://www.oldmutual.co.za/careers/', industry: 'insurance', province: 'Western Cape', verification_status: 'pending', notes: 'HQ Cape Town; large SA insurer.' }),
  defineSource({ id: 'sanlam', company_name: 'Sanlam', website: 'https://www.sanlam.com', careers_url: 'https://www.sanlam.co.za/careers/Pages/default.aspx', industry: 'insurance', province: 'Western Cape', verification_status: 'pending', notes: 'HQ Bellville; own-site careers.' }),
  defineSource({ id: 'discovery', company_name: 'Discovery Limited', website: 'https://www.discovery.co.za', careers_url: 'https://www.discovery.co.za/portal/individual/careers', industry: 'insurance', province: 'Gauteng', verification_status: 'pending', notes: 'Sandton HQ; health/life/bank.' }),
  defineSource({ id: 'momentum', company_name: 'Momentum Metropolitan', website: 'https://www.momentummetropolitan.co.za', careers_url: 'https://www.momentummetropolitan.co.za/en/careers', industry: 'insurance', province: 'Gauteng', verification_status: 'pending', notes: 'Centurion HQ.' }),
  defineSource({ id: 'santam', company_name: 'Santam', website: 'https://www.santam.co.za', careers_url: 'https://www.santam.co.za/careers/', industry: 'insurance', province: 'Western Cape', verification_status: 'pending', notes: 'Short-term insurer, Bellville.' }),

  // ─── Retail ──────────────────────────────────────────────────────────────
  defineSource({ id: 'takealot', company_name: 'Takealot Group', website: 'https://www.takealot.com', careers_url: 'https://boards.greenhouse.io/takealotcom', industry: 'retail', province: 'Western Cape', verification_status: 'verified', connector: 'greenhouse', token: 'takealotcom', notes: 'Verified live via Greenhouse board API; SA e-commerce.' }),
  defineSource({ id: 'shoprite', company_name: 'Shoprite Holdings', website: 'https://www.shopriteholdings.co.za', careers_url: 'https://www.shopriteholdings.co.za/careers.html', industry: 'retail', province: 'Western Cape', verification_status: 'pending', notes: "Africa's largest retailer; Brackenfell HQ." }),
  defineSource({ id: 'picknpay', company_name: 'Pick n Pay', website: 'https://www.pnp.co.za', careers_url: 'https://www.pnp.co.za/careers', industry: 'retail', province: 'Western Cape', verification_status: 'pending', notes: 'Own-site careers.' }),
  defineSource({ id: 'woolworths', company_name: 'Woolworths Holdings', website: 'https://www.woolworths.co.za', careers_url: 'https://www.wholdings.co.za/careers/', industry: 'retail', province: 'Western Cape', verification_status: 'pending', notes: 'WHL; SA + Australia (Country Road) — SA gate required.' }),
  defineSource({ id: 'mrprice', company_name: 'Mr Price Group', website: 'https://www.mrpricegroup.com', careers_url: 'https://www.mrpricegroup.com/careers/', industry: 'retail', province: 'KwaZulu-Natal', verification_status: 'pending', notes: 'Durban HQ.' }),
  defineSource({ id: 'tfg', company_name: 'The Foschini Group (TFG)', website: 'https://www.tfglimited.co.za', careers_url: 'https://www.tfgcareers.co.za/', industry: 'retail', province: 'Western Cape', verification_status: 'pending', notes: 'Parow HQ; own-site careers.' }),
  defineSource({ id: 'clicks', company_name: 'Clicks Group', website: 'https://www.clicksgroup.co.za', careers_url: 'https://www.clicksgroup.co.za/careers', industry: 'retail', province: 'Western Cape', verification_status: 'pending', notes: 'Health & beauty retailer/pharmacy.' }),
  defineSource({ id: 'dischem', company_name: 'Dis-Chem Pharmacies', website: 'https://www.dischem.co.za', careers_url: 'https://www.dischem.co.za/careers', industry: 'retail', province: 'Gauteng', verification_status: 'pending', notes: 'Midrand HQ.' }),
  defineSource({ id: 'spar', company_name: 'The SPAR Group', website: 'https://www.spar.co.za', careers_url: 'https://www.spar.co.za/Careers', industry: 'retail', province: 'KwaZulu-Natal', verification_status: 'pending', notes: 'Pinetown HQ.' }),

  // ─── Mining ──────────────────────────────────────────────────────────────
  defineSource({ id: 'anglo-american', company_name: 'Anglo American', website: 'https://www.angloamerican.com', careers_url: 'https://careers.angloamerican.com/', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Global miner; SA gate required.' }),
  defineSource({ id: 'sibanye', company_name: 'Sibanye-Stillwater', website: 'https://www.sibanyestillwater.com', careers_url: 'https://www.sibanyestillwater.com/careers/', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Westonaria HQ.' }),
  defineSource({ id: 'implats', company_name: 'Impala Platinum (Implats)', website: 'https://www.implats.co.za', careers_url: 'https://www.implats.co.za/careers.php', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Platinum producer.' }),
  defineSource({ id: 'goldfields', company_name: 'Gold Fields', website: 'https://www.goldfields.com', careers_url: 'https://www.goldfields.com/careers.php', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Global gold; SA gate required.' }),
  defineSource({ id: 'exxaro', company_name: 'Exxaro Resources', website: 'https://www.exxaro.com', careers_url: 'https://www.exxaro.com/careers/', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Coal & minerals, Pretoria.' }),
  defineSource({ id: 'harmony', company_name: 'Harmony Gold', website: 'https://www.harmony.co.za', careers_url: 'https://www.harmony.co.za/careers/', industry: 'mining', province: 'Gauteng', verification_status: 'pending', notes: 'Gold producer.' }),

  // ─── Universities ──────────────────────────────────────────────────────────
  defineSource({ id: 'uct', company_name: 'University of Cape Town', website: 'https://www.uct.ac.za', careers_url: 'https://staff.uct.ac.za/staff/careers/vacancies', industry: 'university', province: 'Western Cape', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'wits', company_name: 'University of the Witwatersrand', website: 'https://www.wits.ac.za', careers_url: 'https://www.wits.ac.za/vacancies/', industry: 'university', province: 'Gauteng', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'stellenbosch', company_name: 'Stellenbosch University', website: 'https://www.sun.ac.za', careers_url: 'https://www.sun.ac.za/english/careers', industry: 'university', province: 'Western Cape', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'up', company_name: 'University of Pretoria', website: 'https://www.up.ac.za', careers_url: 'https://www.up.ac.za/careers-up', industry: 'university', province: 'Gauteng', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'ukzn', company_name: 'University of KwaZulu-Natal', website: 'https://www.ukzn.ac.za', careers_url: 'https://hr.ukzn.ac.za/employment-opportunities/', industry: 'university', province: 'KwaZulu-Natal', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'uj', company_name: 'University of Johannesburg', website: 'https://www.uj.ac.za', careers_url: 'https://www.uj.ac.za/vacancies/', industry: 'university', province: 'Gauteng', verification_status: 'pending', notes: 'Public university (.ac.za).' }),
  defineSource({ id: 'nwu', company_name: 'North-West University', website: 'https://www.nwu.ac.za', careers_url: 'https://www.nwu.ac.za/vacancies', industry: 'university', province: 'North West', verification_status: 'pending', notes: 'Public university (.ac.za).' }),

  // ─── Healthcare / Hospitals ─────────────────────────────────────────────────
  defineSource({ id: 'life-healthcare', company_name: 'Life Healthcare', website: 'https://www.lifehealthcare.co.za', careers_url: 'https://jobs.smartrecruiters.com/LifeHealthcare', industry: 'healthcare', province: 'Gauteng', verification_status: 'verified', connector: 'smartrecruiters', token: 'LifeHealthcare', notes: 'Verified live via SmartRecruiters API; SA private hospital group.' }),
  defineSource({ id: 'netcare', company_name: 'Netcare', website: 'https://www.netcare.co.za', careers_url: 'https://www.netcare.co.za/Careers', industry: 'healthcare', province: 'Gauteng', verification_status: 'pending', notes: 'Private hospital group.' }),
  defineSource({ id: 'mediclinic', company_name: 'Mediclinic Southern Africa', website: 'https://www.mediclinic.co.za', careers_url: 'https://www.mediclinic.co.za/en/corporate/careers.html', industry: 'healthcare', province: 'Western Cape', verification_status: 'pending', notes: 'Stellenbosch HQ.' }),
  defineSource({ id: 'nhls', company_name: 'National Health Laboratory Service', website: 'https://www.nhls.ac.za', careers_url: 'https://www.nhls.ac.za/careers/', industry: 'healthcare', province: 'Gauteng', verification_status: 'pending', notes: 'Public pathology service (SOE-linked).' }),

  // ─── Municipalities ─────────────────────────────────────────────────────────
  defineSource({ id: 'cape-town-metro', company_name: 'City of Cape Town', website: 'https://www.capetown.gov.za', careers_url: 'https://www.capetown.gov.za/Careers', industry: 'municipality', province: 'Western Cape', verification_status: 'pending', notes: 'Metropolitan municipality (.gov.za).' }),
  defineSource({ id: 'joburg-metro', company_name: 'City of Johannesburg', website: 'https://www.joburg.org.za', careers_url: 'https://www.joburg.org.za/work_/Pages/Work%20in%20Joburg/Vacancies.aspx', industry: 'municipality', province: 'Gauteng', verification_status: 'pending', notes: 'Metropolitan municipality.' }),
  defineSource({ id: 'tshwane-metro', company_name: 'City of Tshwane', website: 'https://www.tshwane.gov.za', careers_url: 'https://www.tshwane.gov.za/?page_id=1490', industry: 'municipality', province: 'Gauteng', verification_status: 'pending', notes: 'Metropolitan municipality.' }),
  defineSource({ id: 'ethekwini-metro', company_name: 'eThekwini Municipality', website: 'https://www.durban.gov.za', careers_url: 'https://www.durban.gov.za/pages/business/vacancies', industry: 'municipality', province: 'KwaZulu-Natal', verification_status: 'pending', notes: 'Durban metropolitan municipality.' }),
  defineSource({ id: 'ekurhuleni-metro', company_name: 'City of Ekurhuleni', website: 'https://www.ekurhuleni.gov.za', careers_url: 'https://www.ekurhuleni.gov.za/careers/', industry: 'municipality', province: 'Gauteng', verification_status: 'pending', notes: 'Metropolitan municipality.' }),

  // ─── Telecoms ──────────────────────────────────────────────────────────────
  defineSource({ id: 'vodacom', company_name: 'Vodacom', website: 'https://www.vodacom.com', careers_url: 'https://www.vodacom.com/careers.php', industry: 'telecoms', province: 'Gauteng', verification_status: 'pending', notes: 'Midrand HQ; pan-African — SA gate required.' }),
  defineSource({ id: 'mtn', company_name: 'MTN Group', website: 'https://www.mtn.com', careers_url: 'https://www.mtn.com/careers/', industry: 'telecoms', province: 'Gauteng', verification_status: 'pending', notes: 'Pan-African — SA gate required.' }),
  defineSource({ id: 'telkom', company_name: 'Telkom SA', website: 'https://www.telkom.co.za', careers_url: 'https://www.telkom.co.za/today/careers/', industry: 'telecoms', province: 'Gauteng', verification_status: 'pending', notes: 'Centurion HQ; part state-owned.' }),
  defineSource({ id: 'cellc', company_name: 'Cell C', website: 'https://www.cellc.co.za', careers_url: 'https://www.cellc.co.za/cellc/careers', industry: 'telecoms', province: 'Gauteng', verification_status: 'pending', notes: 'Sandton HQ.' }),

  // ─── Logistics / SOE ─────────────────────────────────────────────────────────
  defineSource({ id: 'transnet', company_name: 'Transnet', website: 'https://www.transnet.net', careers_url: 'https://www.transnet.net/Careers/Pages/default.aspx', industry: 'soe', province: 'Gauteng', verification_status: 'pending', notes: 'State-owned freight/rail/ports.' }),
  defineSource({ id: 'dsv-za', company_name: 'DSV South Africa', website: 'https://www.dsv.com', careers_url: 'https://www.dsv.com/en-za/about-dsv/careers', industry: 'logistics', province: 'Gauteng', verification_status: 'pending', notes: 'Global logistics; SA gate required.' }),
  defineSource({ id: 'imperial', company_name: 'Imperial Logistics (DP World)', website: 'https://www.imperiallogistics.com', careers_url: 'https://www.imperiallogistics.com/careers.php', industry: 'logistics', province: 'Gauteng', verification_status: 'pending', notes: 'Logistics group.' }),
  defineSource({ id: 'barloworld', company_name: 'Barloworld', website: 'https://www.barloworld.com', careers_url: 'https://www.barloworld.com/careers/', industry: 'logistics', province: 'Gauteng', verification_status: 'pending', notes: 'Industrial/equipment/logistics.' }),

  // ─── Technology ──────────────────────────────────────────────────────────────
  defineSource({ id: 'ozow', company_name: 'Ozow', website: 'https://www.ozow.com', careers_url: 'https://boards.greenhouse.io/ozow', industry: 'technology', province: 'Gauteng', verification_status: 'verified', connector: 'greenhouse', token: 'ozow', notes: 'Verified live via Greenhouse board API; SA fintech.' }),
  defineSource({ id: 'entersekt', company_name: 'Entersekt', website: 'https://www.entersekt.com', careers_url: 'https://boards.greenhouse.io/entersekt', industry: 'technology', province: 'Western Cape', verification_status: 'verified', connector: 'greenhouse', token: 'entersekt', notes: 'Verified live via Greenhouse board API; Stellenbosch fintech-security.' }),
  defineSource({ id: 'offerzen', company_name: 'OfferZen', website: 'https://www.offerzen.com', careers_url: 'https://boards.greenhouse.io/offerzen', industry: 'technology', province: 'Western Cape', verification_status: 'verified', connector: 'greenhouse', token: 'offerzen', notes: 'Verified live via Greenhouse board API; SA developer marketplace.' }),
  defineSource({ id: 'naspers', company_name: 'Naspers', website: 'https://www.naspers.com', careers_url: 'https://www.naspers.com/careers', industry: 'technology', province: 'Western Cape', verification_status: 'pending', notes: 'Global tech/media group; SA gate required.' }),
  defineSource({ id: 'bcx', company_name: 'BCX', website: 'https://www.bcx.co.za', careers_url: 'https://www.bcx.co.za/careers/', industry: 'technology', province: 'Gauteng', verification_status: 'pending', notes: 'Telkom-owned ICT services.' }),
  defineSource({ id: 'entelect', company_name: 'Entelect', website: 'https://www.entelect.co.za', careers_url: 'https://www.entelect.co.za/careers/', industry: 'technology', province: 'Gauteng', verification_status: 'pending', notes: 'Software engineering firm, Johannesburg.' }),
];
