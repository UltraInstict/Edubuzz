const PB = 'http://127.0.0.1:8090';

async function pbFetch(collection, opts) {
  const params = new URLSearchParams();
  params.set('perPage', '500');
  const url = PB + '/api/collections/' + collection + '/records?' + params.toString();
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

async function pbFetchOne(collection, id) {
  const url = PB + '/api/collections/' + collection + '/records/' + encodeURIComponent(id);
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  const campaigns = await pbFetch('monetization_campaigns');
  console.log('Total campaigns:', campaigns.length);
  const active = campaigns.filter(c => c.active);
  console.log('Active:', active.length);

  const stripVariants = ['strip', 'Strip', 'all', 'All', 'ALL'];
  const stripMatches = active.filter(c => stripVariants.includes(c.zone));
  console.log('Strip zone matches:', stripMatches.length);
  for (const c of stripMatches) {
    console.log(' ', c.id.slice(0,8), c.zone, c.campaign_type, (c.reference_id || '').slice(0,8));
    const link = await pbFetchOne('affiliate_links', c.reference_id);
    console.log('   link:', !!link, link?.display_type, 'active:', link?.active, 'bannerFileUrl:', (link?.banner_file || link?.image_url || 'none').slice(0,40));
  }

  // Sidebar matches
  const sidebarMatches = active.filter(c => ['sidebar', 'Sidebar'].includes(c.zone));
  console.log('Sidebar zone matches:', sidebarMatches.length);
  for (const c of sidebarMatches) {
    console.log(' ', c.id.slice(0,8), c.zone, c.campaign_type);
    const link = await pbFetchOne('affiliate_links', c.reference_id);
    console.log('   link:', !!link, link?.display_type, 'active:', link?.active, 'bannerFileUrl:', (link?.banner_file || link?.image_url || 'none').slice(0,40));
  }
}
main().catch(e => { console.error(e); process.exit(1); });
