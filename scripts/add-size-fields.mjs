// Add ad_width and ad_height fields to monetization_campaigns collection
const PB = 'http://127.0.0.1:8090';

const ADMIN = {
  identity: 'praiseleeto@gmail.com',
  password: process.env.PB_ADMIN_PASSWORD,
};

async function main() {
  // Auth
  const authRes = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN),
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed:', JSON.stringify(authData)); process.exit(1); }
  console.log('Auth OK');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Get collection info
  const colRes = await fetch(`${PB}/api/collections/monetization_campaigns`, { headers });
  const col = await colRes.json();
  console.log('Collection:', col.name, 'fields:', col.schema?.length || 0);

  // Check if ad_width already exists
  const existingFields = (col.schema || []).map((f) => f.name);
  const needsWidth = !existingFields.includes('ad_width');
  const needsHeight = !existingFields.includes('ad_height');

  if (!needsWidth && !needsHeight) {
    console.log('ad_width and ad_height already exist. Nothing to do.');
    return;
  }

  const newSchema = [...(col.schema || [])];

  if (needsWidth) {
    newSchema.push({
      name: 'ad_width',
      type: 'number',
      required: false,
      options: { min: 0, max: 4096 },
    });
    console.log('Added ad_width (number, optional)');
  }

  if (needsHeight) {
    newSchema.push({
      name: 'ad_height',
      type: 'number',
      required: false,
      options: { min: 0, max: 4096 },
    });
    console.log('Added ad_height (number, optional)');
  }

  // Update collection schema
  const updateRes = await fetch(`${PB}/api/collections/monetization_campaigns`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ schema: newSchema }),
  });
  const updateData = await updateRes.json();
  
  if (updateData.id) {
    console.log('Schema updated successfully. New field count:', updateData.schema?.length);
  } else {
    console.error('Schema update failed:', JSON.stringify(updateData));
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
