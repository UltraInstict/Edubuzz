import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run pure-function unit tests (import pipeline + content helpers).
    // These have no PocketBase/Astro dependencies, so no special environment
    // is needed.
    include: ['src/services/import/__tests__/**/*.test.ts', 'src/lib/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
