// PM2 Ecosystem File for Edubuzz Production
// Usage: pm2 start ecosystem.config.cjs --env production
//
// Secrets are loaded from environment (systemd env, .env file, or PM2 env).
// NEVER hardcode credentials here — this file is committed.

require('dotenv').config({ path: '/home/edubuzz/app/.env' });

module.exports = {
  apps: [{
    name: 'edubuzz',
    script: './dist/server/entry.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321,
      PB_URL: process.env.PB_URL || 'http://127.0.0.1:8090',
      PUBLIC_PB_URL: process.env.PUBLIC_PB_URL || 'https://edubuzz.co.za/pb-api',
      SITE_URL: process.env.SITE_URL || 'https://edubuzz.co.za',
      PB_ADMIN_EMAIL: process.env.PB_ADMIN_EMAIL || '',
      PB_ADMIN_PASSWORD: process.env.PB_ADMIN_PASSWORD || '',
      CSRF_SECRET: process.env.CSRF_SECRET || '',
    },
    max_memory_restart: '512M',
    max_restarts: 10,
    restart_delay: 5000,
    min_uptime: '30s',

    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/edubuzz/logs/edubuzz-error.log',
    out_file: '/home/edubuzz/logs/edubuzz-out.log',
    merge_logs: true,
    log_type: 'json',

    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', 'pb_data'],

    env_production: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321,
      PB_URL: process.env.PB_URL || 'http://127.0.0.1:8090',
      PUBLIC_PB_URL: process.env.PUBLIC_PB_URL || 'https://edubuzz.co.za/pb-api',
      SITE_URL: process.env.SITE_URL || 'https://edubuzz.co.za',
      PB_ADMIN_EMAIL: process.env.PB_ADMIN_EMAIL || '',
      PB_ADMIN_PASSWORD: process.env.PB_ADMIN_PASSWORD || '',
      CSRF_SECRET: process.env.CSRF_SECRET || '',
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 4322,
    },
  }],

  deploy: {
    production: {
      user: 'edubuzz',
      host: 'edubuzz.co.za',
      ref: 'origin/main',
      repo: 'git@github.com:UltraInstict/Edubuzz.git',
      path: '/home/edubuzz/app',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /home/edubuzz/logs /home/edubuzz/backups',
    },
    staging: {
      user: 'edubuzz',
      host: 'staging.edubuzz.co.za',
      ref: 'origin/develop',
      repo: 'git@github.com:UltraInstict/Edubuzz.git',
      path: '/home/edubuzz/staging',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.cjs --env staging',
    },
  },
};
