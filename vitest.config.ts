import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run the import-pipeline unit tests. These are pure functions with
    // no PocketBase/Astro dependencies, so no special environment is needed.
    include: ['src/services/import/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
