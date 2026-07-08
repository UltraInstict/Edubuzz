// Reseed affiliate_links with proper content and reconnect campaigns
const PB = 'http://127.0.0.1:8090';

async function main() {
  const authRes = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'praiseleeto@gmail.com', password: 'PbCFfkcMOhL9CvgGjB9Fs23Q!9X' }),
  });
  const auth = await authRes.json();
  if (!auth.token) { console.error('Auth failed:', JSON.stringify(auth)); process.exit(1); }
  const H = { 'Authorization': 'Bearer ' + auth.token, 'Content-Type': 'application/json' };

  // Create 5 proper affiliate links
  const links = [
    {
      name: 'SPARK Schools Careers',
      url: 'https://www.sparkschools.co.za/careers/',
      display_type: 'image',
      zone: 'sidebar',
      category: 'education',
      active: true,
      image_url: 'https://edubuzz.co.za/banners/spark-schools-300x250.png',
      banner_width: 300,
      banner_height: 250,
    },
    {
      name: 'UNISA Registration 2026',
      url: 'https://www.unisa.ac.za/sites/corporate/default/Register-to-study-through-Unisa',
      display_type: 'text',
      zone: 'sidebar',
      category: 'education',
      active: true,
      description: 'Apply online for 2026 academic year',
    },
    {
      name: 'IIE Rosebank College',
      url: 'https://www.rosebankcollege.co.za/',
      display_type: 'image',
      zone: 'all',
      category: 'general',
      active: true,
      image_url: 'https://edubuzz.co.za/banners/rosebank-728x90.png',
      banner_width: 728,
      banner_height: 90,
    },
    {
      name: 'Workforce Staffing',
      url: 'https://work-force.co.za',
      display_type: 'text',
      zone: 'sidebar',
      category: 'general',
      active: true,
      description: 'South Africa staffing solutions',
    },
    {
      name: 'Betway SA',
      url: 'https://www.betway.co.za/',
      display_type: 'image',
      zone: 'sidebar',
      category: 'general',
      active: true,
      image_url: 'https://edubuzz.co.za/banners/betway-300x250.png',
      banner_width: 300,
      banner_height: 250,
    },
  ];

  const createdIds = [];
  for (const link of links) {
    const res = await fetch(`${PB}/api/collections/affiliate_links/records`, {
      method: 'POST', headers: H,
      body: JSON.stringify({ ...link, clicks: 0 }),
    });
    const record = await res.json();
    console.log('Created:', record.id?.slice(0,8), link.name, '—', res.status);
    if (record.id) createdIds.push(record.id);
  }

  // Now reconnect existing campaigns to new links
  if (createdIds.length >= 4) {
    const campaigns = [
      { id: 'kdo7apknf1irl7p', ref: createdIds[0] }, // sidebar image -> SPARK
      { id: 'n6hcj2f3alrsrxi', ref: createdIds[1] }, // sidebar text -> UNISA
      { id: '4kxhoedkf8fjboi', ref: createdIds[2] }, // all image -> Rosebank
      { id: '0n99gmtlrdodc8j', ref: createdIds[3] }, // sidebar text -> Workforce
      { id: '6v6lzbz5c9f0nn7', ref: createdIds[4] }, // sidebar image -> Betway
      { id: 'nqjgfzm0c177t76', ref: createdIds[2] }, // strip -> Rosebank
      { id: 'bxziy5fcsbkmris', ref: createdIds[2] }, // infeed -> Rosebank
    ];
    for (const c of campaigns) {
      const res = await fetch(`${PB}/api/collections/monetization_campaigns/records/${c.id}`, {
        method: 'PATCH', headers: H,
        body: JSON.stringify({ reference_id: c.ref }),
      });
      console.log('Campaign', c.id.slice(0,8), '-> ref', c.ref.slice(0,8), '—', res.status);
    }
  }

  console.log('Done. PM2 reloading...');
}

main().catch(e => { console.error(e); process.exit(1); });
