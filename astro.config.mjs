import 'dotenv/config';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: false,
  },
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? 'https://edubuzz.co.za'),
      'import.meta.env.PB_URL': JSON.stringify(process.env.PB_URL ?? 'http://127.0.0.1:8090'),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('MonetizationSlot') || id.includes('Layout') || id.includes('Sidebar') || id.includes('JobCard') || id.includes('Breadcrumbs') || id.includes('Pagination') || id.includes('AdminNav')) {
              return 'shared-ui';
            }
          },
        },
      },
    },
  },
});
