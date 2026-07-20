/**
 * Import pipeline — adapters barrel (Milestone 2).
 *
 * Public surface for all source connectors. Each adapter ONLY acquires raw
 * jobs; normalization/validation/dedupe/storage is handled by the shared core.
 */

export * from './http';
export * from './rss';
export * from './jsonFeed';
export * from './csv';
export * from './structuredHtml';
export * from './firecrawl';
// ATS API connectors (keyless, official apply URLs): one connector per platform.
export * from './greenhouse';
export * from './lever';
export * from './smartrecruiters';
export * from './workday';
export * from './registry';
