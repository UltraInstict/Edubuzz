import { resolveSlot, listCampaigns } from '../src/services/monetizationService.js';

console.log('=== Testing resolveSlot ===');
try {
  const result = await resolveSlot('sidebar', { category: 'finance' });
  console.log('Result type:', result.type);
  console.log('Result campaignId:', result.campaignId);
  if (result.content) {
    console.log('Content keys:', Object.keys(result.content));
    console.log('Content:', JSON.stringify(result.content).slice(0, 200));
  } else {
    console.log('Content is null — NO AD WILL RENDER');
  }
} catch (e) {
  console.log('ERROR:', e.message.slice(0, 200));
}

console.log('\n=== List campaigns ===');
try {
  const camps = await listCampaigns();
  console.log('Count:', camps.length);
} catch (e) {
  console.log('ERROR:', e.message);
}
