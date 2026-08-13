/**
 * Province career hub editorial content.
 *
 * Factual, South Africa-specific context for each province. Live jobs,
 * employers and category counts are pulled from PocketBase in the template;
 * this file holds the evergreen editorial layer (overview, industries, FAQs).
 */

export interface ProvinceFAQ {
  q: string;
  a: string;
}

export interface ProvinceHub {
  slug: string;        // province slug, e.g. 'gauteng'
  name: string;        // matches PROVINCES value exactly
  hubSlug: string;     // URL slug, e.g. 'gauteng-careers'
  title: string;
  description: string;
  overview: string;    // HTML
  industries: { name: string; note: string }[];
  majorEmployers: string[]; // well-known employers active in the province
  faqs: ProvinceFAQ[];
}

export const PROVINCE_HUBS: ProvinceHub[] = [
  {
    slug: 'gauteng',
    name: 'Gauteng',
    hubSlug: 'gauteng-careers',
    title: 'Careers in Gauteng (2026) — Employers, Salaries & Industries',
    description: 'A complete guide to careers in Gauteng. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Johannesburg, Pretoria and Ekurhuleni.',
    overview: `
<p>Gauteng is South Africa\u2019s economic engine. Despite being the smallest province by land area, it generates roughly a third of national GDP and is home to Johannesburg (the financial capital), Pretoria (the administrative capital) and the industrial hubs of Ekurhuleni and the Vaal.</p>
<p>The province offers the widest range of job opportunities in the country, from head-office corporate roles and government departments to mining, manufacturing, logistics and a fast-growing technology sector. If you are looking for the deepest job market in South Africa, Gauteng is it.</p>
`,
    industries: [
      { name: 'Finance & Banking', note: 'Johannesburg is the financial capital, home to the JSE and the head offices of the major banks and insurers.' },
      { name: 'Government & Public Service', note: 'Pretoria hosts national departments, embassies and state entities with regular DPSA vacancies.' },
      { name: 'IT & Technology', note: 'The fastest-growing sector, with strong demand for developers, data and cloud skills.' },
      { name: 'Manufacturing & Mining', note: 'Ekurhuleni and the East Rand remain a manufacturing and mining-services heartland.' },
      { name: 'Logistics & Warehousing', note: 'OR Tambo and inland ports drive huge demand for drivers, pickers and controllers.' },
    ],
    majorEmployers: ['Standard Bank', 'Absa', 'Nedbank', 'FNB / FirstRand', 'Discovery', 'MTN', 'Vodacom', 'Sasol', 'Anglo American', 'Transnet', 'Eskom', 'City of Johannesburg', 'Gauteng Provincial Government'],
    faqs: [
      { q: 'What jobs are most in demand in Gauteng?', a: 'Finance, IT and technology, government administration, sales, logistics and skilled trades are consistently in demand across Johannesburg, Pretoria and Ekurhuleni.' },
      { q: 'Which cities in Gauteng have the most jobs?', a: 'Johannesburg has the most corporate and financial roles, Pretoria leads for government posts, and Ekurhuleni (East Rand) is strong for manufacturing, logistics and trades.' },
      { q: 'Are there entry-level jobs and learnerships in Gauteng?', a: 'Yes. Because so many large employers are based in Gauteng, the province has the highest number of learnerships, internships and graduate programmes in the country. Apply early as they fill fast.' },
    ],
  },
  {
    slug: 'western-cape',
    name: 'Western Cape',
    hubSlug: 'western-cape-careers',
    title: 'Careers in the Western Cape (2026) — Employers & Industries',
    description: 'A complete guide to careers in the Western Cape. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Cape Town and beyond.',
    overview: `
<p>The Western Cape is South Africa\u2019s second-largest economy and one of its fastest-growing job markets. Cape Town has become the country\u2019s technology and business-process outsourcing (BPO) capital, while the wider province is a powerhouse in agriculture, tourism, retail and financial services.</p>
<p>Stellenbosch and the Cape Winelands host major corporate head offices, and the province is known for a strong call-centre and international outsourcing sector that hires large numbers of entry-level staff.</p>
`,
    industries: [
      { name: 'Technology & BPO', note: 'Cape Town is the call-centre and tech capital, with constant demand for agents and developers.' },
      { name: 'Tourism & Hospitality', note: 'Hotels, restaurants and travel operators hire heavily, especially in season.' },
      { name: 'Agriculture & Agri-processing', note: 'The Winelands and rural districts drive farming, packing and export jobs.' },
      { name: 'Retail & FMCG', note: 'Shoprite, Woolworths, TFG and Pep have major operations headquartered here.' },
      { name: 'Financial Services', note: 'Old Mutual, Sanlam and Capitec anchor a strong finance sector.' },
    ],
    majorEmployers: ['Shoprite Group', 'Woolworths', 'The Foschini Group (TFG)', 'Naspers / Prosus', 'Old Mutual', 'Sanlam', 'Capitec Bank', 'Pep / Pepkor', 'City of Cape Town', 'Western Cape Government'],
    faqs: [
      { q: 'What jobs are most in demand in the Western Cape?', a: 'Call-centre and BPO roles, technology and software, tourism and hospitality, retail, and agriculture are the biggest sources of jobs in the province.' },
      { q: 'Is Cape Town good for tech jobs?', a: 'Yes. Cape Town is widely regarded as South Africa\u2019s tech hub, with a large concentration of software companies, startups and digital roles alongside a major BPO sector.' },
      { q: 'Are there seasonal jobs in the Western Cape?', a: 'Yes. Tourism, hospitality and agriculture create strong seasonal demand, especially over summer and the harvest and festive periods.' },
    ],
  },
  {
    slug: 'kwazulu-natal',
    name: 'KwaZulu-Natal',
    hubSlug: 'kwazulu-natal-careers',
    title: 'Careers in KwaZulu-Natal (2026) — Employers & Industries',
    description: 'A complete guide to careers in KwaZulu-Natal. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Durban, Pietermaritzburg and beyond.',
    overview: `
<p>KwaZulu-Natal (KZN) is South Africa\u2019s third-largest provincial economy and a logistics and manufacturing powerhouse. Durban is home to the busiest port in Africa, making the province the country\u2019s gateway for imports and exports and a magnet for logistics, warehousing and manufacturing jobs.</p>
<p>Beyond the port, KZN has a large automotive and chemicals manufacturing base, a significant tourism sector along the coast, and major agricultural activity in sugar and forestry.</p>
`,
    industries: [
      { name: 'Logistics & Ports', note: 'The Port of Durban drives huge demand for logistics, freight and warehouse workers.' },
      { name: 'Manufacturing & Automotive', note: 'Toyota South Africa and a strong chemicals sector anchor manufacturing.' },
      { name: 'Tourism & Hospitality', note: 'The coastline and resorts support a busy hospitality sector.' },
      { name: 'Agriculture', note: 'Sugar cane, forestry and agri-processing are major rural employers.' },
      { name: 'Retail', note: 'Mr Price and other retailers are headquartered in Durban.' },
    ],
    majorEmployers: ['Toyota South Africa', 'Transnet (Port of Durban)', 'Mr Price Group', 'Hulamin', 'Tongaat', 'eThekwini Municipality', 'KwaZulu-Natal Provincial Government', 'University of KwaZulu-Natal'],
    faqs: [
      { q: 'What jobs are most in demand in KwaZulu-Natal?', a: 'Logistics and warehousing, manufacturing and automotive, tourism and hospitality, agriculture and retail are the largest sources of employment in the province.' },
      { q: 'Why is Durban good for logistics jobs?', a: 'Durban has the busiest container port in Africa. This drives constant demand for drivers, forklift operators, warehouse staff, clearing agents and logistics coordinators.' },
      { q: 'Are there manufacturing jobs in KZN?', a: 'Yes. KZN has a strong automotive base led by Toyota South Africa in Durban, plus chemicals, packaging and agri-processing plants that hire operators and artisans.' },
    ],
  },
  {
    slug: 'eastern-cape',
    name: 'Eastern Cape',
    hubSlug: 'eastern-cape-careers',
    title: 'Careers in the Eastern Cape (2026) — Employers & Industries',
    description: 'A complete guide to careers in the Eastern Cape. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Gqeberha, East London and beyond.',
    overview: `
<p>The Eastern Cape is the heart of South Africa\u2019s automotive manufacturing industry. Gqeberha (Port Elizabeth) and East London host major vehicle assembly plants and a deep network of component suppliers, making the province a key destination for manufacturing and engineering careers.</p>
<p>The province also has significant public-sector employment, a growing renewable-energy sector, and important agriculture in its rural districts.</p>
`,
    industries: [
      { name: 'Automotive Manufacturing', note: 'VW, Isuzu, Mercedes-Benz and suppliers make this the motor industry hub.' },
      { name: 'Government & Public Service', note: 'Bhisho is the provincial capital with substantial public-sector employment.' },
      { name: 'Renewable Energy', note: 'Wind farms in the province are creating new technical and construction jobs.' },
      { name: 'Agriculture', note: 'Livestock, citrus and wool farming support rural employment.' },
      { name: 'Manufacturing & Engineering', note: 'A strong artisan and technician demand around the auto plants.' },
    ],
    majorEmployers: ['Volkswagen Group South Africa', 'Isuzu Motors South Africa', 'Mercedes-Benz South Africa', 'Nelson Mandela Bay Municipality', 'Buffalo City Metropolitan Municipality', 'Eastern Cape Provincial Government'],
    faqs: [
      { q: 'What jobs are most in demand in the Eastern Cape?', a: 'Automotive manufacturing, engineering and artisan trades, government administration, agriculture and, increasingly, renewable-energy roles are the main sources of jobs.' },
      { q: 'Where are the car factories in the Eastern Cape?', a: 'Gqeberha (Port Elizabeth) and East London host major plants including Volkswagen, Isuzu and Mercedes-Benz, supported by a large network of component suppliers.' },
      { q: 'Are there artisan opportunities in the Eastern Cape?', a: 'Yes. The automotive and manufacturing sector creates steady demand for fitters, electricians, welders and other qualified artisans, often via apprenticeships and learnerships.' },
    ],
  },
  {
    slug: 'free-state',
    name: 'Free State',
    hubSlug: 'free-state-careers',
    title: 'Careers in the Free State (2026) — Employers & Industries',
    description: 'A complete guide to careers in the Free State. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Bloemfontein, Welkom and beyond.',
    overview: `
<p>The Free State sits at the centre of South Africa and is built on agriculture, mining and government. Bloemfontein is the judicial capital of the country and the provincial administrative centre, providing substantial public-sector and legal employment.</p>
<p>The province is one of the country\u2019s biggest grain producers, has a significant gold-mining region around Welkom, and a growing agri-processing sector.</p>
`,
    industries: [
      { name: 'Agriculture', note: 'A leading producer of maize and wheat, driving farming and agri-processing jobs.' },
      { name: 'Mining', note: 'The Welkom goldfields remain an important mining employer.' },
      { name: 'Government & Legal', note: 'Bloemfontein is the judicial capital with courts and provincial administration.' },
      { name: 'Education', note: 'The University of the Free State is a major regional employer.' },
      { name: 'Manufacturing', note: 'Agri-processing and light manufacturing support local employment.' },
    ],
    majorEmployers: ['Harmony Gold', 'University of the Free State', 'Mangaung Metropolitan Municipality', 'Free State Provincial Government', 'VKB Agriculture'],
    faqs: [
      { q: 'What jobs are most in demand in the Free State?', a: 'Agriculture and agri-processing, mining, government and legal services, education and healthcare are the main sources of employment in the province.' },
      { q: 'Is Bloemfontein good for government jobs?', a: 'Yes. As the judicial capital and provincial administrative centre, Bloemfontein has courts, provincial departments and public entities that advertise regular vacancies.' },
      { q: 'Are there mining jobs in the Free State?', a: 'Yes. The goldfields around Welkom continue to employ miners, artisans and engineers, though the sector has contracted from its historical peak.' },
    ],
  },
  {
    slug: 'limpopo',
    name: 'Limpopo',
    hubSlug: 'limpopo-careers',
    title: 'Careers in Limpopo (2026) — Employers & Industries',
    description: 'A complete guide to careers in Limpopo. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Polokwane and beyond.',
    overview: `
<p>Limpopo is one of South Africa\u2019s richest provinces for mining, home to major platinum, chrome and coal operations. The province is also a leading agricultural producer, especially of fruit and vegetables, and has a growing tourism sector anchored by the Kruger National Park.</p>
<p>Polokwane is the commercial and administrative hub, with government and public-service roles concentrated there.</p>
`,
    industries: [
      { name: 'Mining', note: 'Platinum, chrome and coal mines are the largest private employers.' },
      { name: 'Agriculture', note: 'A top producer of fruit, vegetables and livestock.' },
      { name: 'Government & Public Service', note: 'Polokwane concentrates provincial administration and services.' },
      { name: 'Tourism', note: 'Kruger National Park and reserves support hospitality jobs.' },
      { name: 'Healthcare & Education', note: 'Major public employers across the province.' },
    ],
    majorEmployers: ['Anglo American Platinum', 'Impala Platinum', 'Exxaro', 'Limpopo Provincial Government', 'University of Limpopo', 'Polokwane Municipality'],
    faqs: [
      { q: 'What jobs are most in demand in Limpopo?', a: 'Mining and mining services, agriculture, government administration, healthcare, education and tourism are the biggest sources of jobs in the province.' },
      { q: 'Are there mining jobs in Limpopo?', a: 'Yes. Limpopo hosts major platinum, chrome and coal operations that employ miners, artisans, engineers and support staff, often recruiting through learnerships and apprenticeships.' },
      { q: 'Where are most government jobs in Limpopo?', a: 'Polokwane, the provincial capital, concentrates provincial departments and services, while healthcare and education posts are spread across all districts.' },
    ],
  },
  {
    slug: 'mpumalanga',
    name: 'Mpumalanga',
    hubSlug: 'mpumalanga-careers',
    title: 'Careers in Mpumalanga (2026) — Employers & Industries',
    description: 'A complete guide to careers in Mpumalanga. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Mbombela, eMalahleni and beyond.',
    overview: `
<p>Mpumalanga is the energy heartland of South Africa. The province produces the majority of the country\u2019s coal and hosts most of Eskom\u2019s power stations, making mining and energy the dominant employers. Sasol\u2019s major operations in Secunda anchor a large petrochemical sector.</p>
<p>The province also has significant agriculture and forestry, and a strong tourism industry linked to the Kruger National Park and the Panorama Route.</p>
`,
    industries: [
      { name: 'Mining & Energy', note: 'Coal mining and Eskom power stations dominate the economy.' },
      { name: 'Petrochemicals', note: 'Sasol\u2019s Secunda complex is a major industrial employer.' },
      { name: 'Agriculture & Forestry', note: 'Timber, citrus and sugar support rural jobs.' },
      { name: 'Tourism', note: 'Kruger and the Panorama Route drive hospitality demand.' },
      { name: 'Manufacturing', note: 'Agri-processing and industrial plants across the province.' },
    ],
    majorEmployers: ['Sasol', 'Eskom', 'Exxaro', 'Seriti Resources', 'Mpumalanga Provincial Government', 'City of Mbombela'],
    faqs: [
      { q: 'What jobs are most in demand in Mpumalanga?', a: 'Mining, energy and petrochemicals lead demand, followed by agriculture and forestry, tourism, and skilled artisan trades that support the industrial sector.' },
      { q: 'Is Mpumalanga good for mining and energy jobs?', a: 'Yes. The province produces most of South Africa\u2019s coal and hosts the majority of Eskom\u2019s power stations, plus Sasol\u2019s Secunda petrochemical complex, creating strong demand for operators, artisans and engineers.' },
      { q: 'Are there tourism jobs in Mpumalanga?', a: 'Yes. The Kruger National Park and the Panorama Route support a busy hospitality and tourism sector with lodge, hotel and guiding roles.' },
    ],
  },
  {
    slug: 'north-west',
    name: 'North West',
    hubSlug: 'north-west-careers',
    title: 'Careers in the North West (2026) — Employers & Industries',
    description: 'A complete guide to careers in the North West. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Rustenburg, Mahikeng and beyond.',
    overview: `
<p>The North West is the world\u2019s leading platinum-producing region. The mines around Rustenburg dominate the provincial economy and are the largest employers, supported by a deep network of mining-services and engineering companies.</p>
<p>The province also has substantial agriculture, especially maize and cattle farming, and tourism anchored by Sun City and the Pilanesberg.</p>
`,
    industries: [
      { name: 'Platinum Mining', note: 'Rustenburg is the heart of global platinum production.' },
      { name: 'Agriculture', note: 'Maize, sunflower and cattle farming across the province.' },
      { name: 'Tourism', note: 'Sun City and Pilanesberg support a hospitality sector.' },
      { name: 'Government & Education', note: 'Mahikeng hosts provincial administration and North-West University.' },
      { name: 'Engineering & Trades', note: 'Mining drives strong demand for artisans and technicians.' },
    ],
    majorEmployers: ['Anglo American Platinum', 'Impala Platinum', 'Sibanye-Stillwater', 'North-West University', 'North West Provincial Government', 'Sun International'],
    faqs: [
      { q: 'What jobs are most in demand in the North West?', a: 'Platinum mining and mining services, engineering and artisan trades, agriculture, tourism and government administration are the main sources of employment.' },
      { q: 'Where are the platinum mines in the North West?', a: 'The bushveld region around Rustenburg is the world\u2019s largest platinum-producing area, employing large numbers of miners, artisans and engineers.' },
      { q: 'Are there tourism jobs in the North West?', a: 'Yes. Sun City and the Pilanesberg National Park support hospitality, gaming and tourism roles, especially in and around the resort complex.' },
    ],
  },
  {
    slug: 'northern-cape',
    name: 'Northern Cape',
    hubSlug: 'northern-cape-careers',
    title: 'Careers in the Northern Cape (2026) — Employers & Industries',
    description: 'A complete guide to careers in the Northern Cape. Major employers, growing industries, learnerships, internships, salary guides and live jobs in Kimberley, Upington and beyond.',
    overview: `
<p>The Northern Cape is South Africa\u2019s largest province by land area and a major centre for mining and renewable energy. It is rich in iron ore, manganese, diamonds and zinc, and has become the country\u2019s leading region for solar power, creating new construction and technical jobs.</p>
<p>Kimberley is the provincial capital and administrative hub, while Upington anchors a strong agriculture sector built on grapes and other irrigated crops along the Orange River.</p>
`,
    industries: [
      { name: 'Mining', note: 'Iron ore, manganese, diamonds and zinc are major employers.' },
      { name: 'Renewable Energy', note: 'The province leads South Africa in solar power projects.' },
      { name: 'Agriculture', note: 'Table grapes and irrigated crops along the Orange River.' },
      { name: 'Government & Public Service', note: 'Kimberley concentrates provincial administration.' },
      { name: 'Engineering & Construction', note: 'Mining and energy projects drive technical demand.' },
    ],
    majorEmployers: ['Kumba Iron Ore (Anglo American)', 'South32', 'Sishen operations', 'Northern Cape Provincial Government', 'Sol Plaatje Municipality'],
    faqs: [
      { q: 'What jobs are most in demand in the Northern Cape?', a: 'Mining and mining services, renewable-energy construction and operations, agriculture, engineering trades and government administration are the biggest sources of jobs.' },
      { q: 'Is the Northern Cape good for renewable-energy jobs?', a: 'Yes. The province receives some of the highest solar irradiation in the world and hosts many of South Africa\u2019s largest solar projects, creating construction, technical and operations roles.' },
      { q: 'Where are the mining jobs in the Northern Cape?', a: 'The iron-ore and manganese operations around Kathu, Sishen and the Kalahari basin are major employers of miners, artisans and engineers.' },
    ],
  },
];

