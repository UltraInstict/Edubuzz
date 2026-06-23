import 'dotenv/config';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? 'https://edubuzz.co.za'),
      'import.meta.env.PB_URL': JSON.stringify(process.env.PB_URL ?? 'http://127.0.0.1:8090'),
    },
  },
});
