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
export * from './registry';
