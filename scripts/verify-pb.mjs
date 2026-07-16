import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);

const today = new Date().toISOString().slice(0,10);
const all = await pb.collection('jobs').getList(1,1);
const cats = await pb.collection('categories').getList(1,100);
const xml = await pb.collection('xml_sources').getList(1,10).catch(()=>({items:[]}));
const affs = await pb.collection('affiliate_links').getList(1,10);
const camps = await pb.collection('monetization_campaigns').getList(1,10);
const house = await pb.collection('house_ads').getList(1,1);

console.log(`Jobs: ${all.totalItems}`);
console.log(`Categories: ${cats.totalItems} -> ${cats.items.map(c=>c.name).join(', ')}`);
console.log(`XML sources: ${xml.items.length} -> ${xml.items.map(x=>x.name).join(', ')}`);
console.log(`Affiliate links: ${affs.totalItems}`);
console.log(`Campaigns: ${camps.totalItems}`);
console.log(`House ads: ${house.totalItems}`);
console.log(`Active jobs: ${await pb.collection('jobs').getList(1,1,{filter:'active=true'})}`);
