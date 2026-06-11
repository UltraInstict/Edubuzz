import PocketBase from 'pocketbase';
import { config } from 'dotenv';
config({ override: true });

const PB = 'http://127.0.0.1:8090';

async function main() {
  // Get user token
  const userPb = new PocketBase(PB);
  const auth = await userPb.collection('users').authWithPassword('admin@work-force.co.za', 'Admin123~!');
  console.log('User auth:', auth.record.id);

  // Try listing employers as regular user
  try {
    const list = await userPb.collection('employers').getList(1, 1);
    console.log('Employer list OK:', list.totalItems);
  } catch (err) {
    console.error('Employer list as user:', err.message);
  }

  // Now check the collection's actual rule via superuser
  const adminPb = new PocketBase(PB);
  await adminPb.collection('_superusers').authWithPassword(
    process.env.PB_ADMIN_EMAIL ?? 'praiseleeto@gmail.com',
    process.env.PB_ADMIN_PASSWORD ?? ''
  );
  
  const coll = await adminPb.collections.getOne('employers');
  console.log('Employers collection rules:', JSON.stringify({
    listRule: coll.listRule,
    viewRule: coll.viewRule,
    createRule: coll.createRule,
    updateRule: coll.updateRule,
    deleteRule: coll.deleteRule,
  }, null, 2));
}

main().catch(console.error);
