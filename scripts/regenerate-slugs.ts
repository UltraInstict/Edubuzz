/**
 * Regenerate all job slugs to use title-only format.
 * Run: npx tsx scripts/regenerate-slugs.ts
 */
import PocketBase from 'pocketbase';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env'), override: true });

const PB_URL = 'http://127.0.0.1:8090';
const email = process.env.PB_ADMIN_EMAIL || '';
const password = process.env.PB_ADMIN_PASSWORD || '';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function main() {
  const pb = new PocketBase(PB_URL);
  await pb.collection('_superusers').authWithPassword(email, password);

  const jobs = await pb.collection('jobs').getFullList({ sort: '-created' });
  console.log(`Found ${jobs.length} jobs`);

  let updated = 0;
  for (const job of jobs) {
    const current = (job as any).slug;
    let newSlug = slugify((job as any).title);

    // uniqueness check
    let unique = newSlug;
    let i = 1;
    while (true) {
      const exists = await pb.collection('jobs').getList(1, 1, {
        filter: `slug="${unique}"&&id!="${job.id}"`,
        fields: 'id',
      });
      if (exists.totalItems === 0) break;
      unique = `${newSlug}-${i}`;
      i++;
    }

    if (current !== unique) {
      await pb.collection('jobs').update(job.id, { slug: unique });
      console.log(`  ${job.id}: "${current}" → "${unique}"`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} slugs.`);
}

main().catch(console.error);
