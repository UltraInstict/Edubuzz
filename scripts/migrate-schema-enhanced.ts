/**
 * Schema Migration: Add enhanced job fields for structured data
 * 
 * Adds fields to support Firecrawl + AI normalization pipeline:
 * - Structured content: responsibilities, requirements, benefits, skills
 * - Metadata: experience_level, education_required, salary_period
 * - Company info: company_description, company_logo
 * - AI data: ai_summary, ai_confidence, enrichment_source
 * - Tracking: source_url, closing_date, last_scraped
 */

import PocketBase from 'pocketbase';
import 'dotenv/config';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('❌ PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD required');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function authenticate() {
  console.log('🔐 Authenticating...');
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL!, PB_ADMIN_PASSWORD!);
  console.log('✓ Authenticated');
}

async function addFieldIfMissing(collection: string, fieldName: string, fieldConfig: any) {
  try {
    const schema = await pb.collections.getOne(collection);
    const fields = (schema as any).schema || [];
    
    if (fields.some((f: any) => f.name === fieldName)) {
      console.log(`  ✓ ${fieldName} already exists`);
      return;
    }

    await pb.collections.update(collection, {
      schema: [...fields, fieldConfig],
    });
    console.log(`  ✓ ${fieldName} added`);
  } catch (err: any) {
    console.error(`  ❌ ${fieldName} failed:`, err.message);
  }
}

async function migrate() {
  await authenticate();

  console.log('\n📦 Migrating jobs collection...');

  // Structured content fields
  await addFieldIfMissing('jobs', 'responsibilities', {
    name: 'responsibilities',
    type: 'editor',
    required: false,
    options: { convertUrls: true },
  });

  await addFieldIfMissing('jobs', 'requirements', {
    name: 'requirements',
    type: 'editor',
    required: false,
    options: { convertUrls: true },
  });

  await addFieldIfMissing('jobs', 'benefits', {
    name: 'benefits',
    type: 'editor',
    required: false,
    options: { convertUrls: true },
  });

  await addFieldIfMissing('jobs', 'skills', {
    name: 'skills',
    type: 'json',
    required: false,
  });

  // Metadata fields
  await addFieldIfMissing('jobs', 'experience_level', {
    name: 'experience_level',
    type: 'select',
    required: false,
    options: {
      values: ['entry', 'mid', 'senior', 'executive'],
      maxSelect: 1,
    },
  });

  await addFieldIfMissing('jobs', 'education_required', {
    name: 'education_required',
    type: 'text',
    required: false,
    options: { max: 200 },
  });

  await addFieldIfMissing('jobs', 'salary_period', {
    name: 'salary_period',
    type: 'select',
    required: false,
    options: {
      values: ['monthly', 'annual', 'hourly'],
      maxSelect: 1,
    },
  });

  // Company info
  await addFieldIfMissing('jobs', 'company_description', {
    name: 'company_description',
    type: 'text',
    required: false,
    options: { max: 500 },
  });

  await addFieldIfMissing('jobs', 'company_website', {
    name: 'company_website',
    type: 'url',
    required: false,
  });

  // AI data
  await addFieldIfMissing('jobs', 'ai_summary', {
    name: 'ai_summary',
    type: 'text',
    required: false,
    options: { max: 500 },
  });

  await addFieldIfMissing('jobs', 'ai_confidence', {
    name: 'ai_confidence',
    type: 'number',
    required: false,
    options: { min: 0, max: 100 },
  });

  await addFieldIfMissing('jobs', 'enrichment_source', {
    name: 'enrichment_source',
    type: 'select',
    required: false,
    options: {
      values: ['firecrawl', 'xml_feed', 'manual', 'employer'],
      maxSelect: 1,
    },
  });

  // Tracking
  await addFieldIfMissing('jobs', 'source_url', {
    name: 'source_url',
    type: 'url',
    required: false,
  });

  await addFieldIfMissing('jobs', 'closing_date', {
    name: 'closing_date',
    type: 'date',
    required: false,
  });

  await addFieldIfMissing('jobs', 'last_scraped', {
    name: 'last_scraped',
    type: 'date',
    required: false,
  });

  console.log('\n✅ Migration complete');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
