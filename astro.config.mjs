import 'dotenv/config';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? 'https://edubuzz.co.za'),
      'import.meta.env.PB_URL': JSON.stringify(process.env.PB_URL ?? 'http://127.0.0.1:8090'),
    },
  },
});
