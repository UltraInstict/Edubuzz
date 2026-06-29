// PM2 Ecosystem File for Edubuzz Production
// Usage: pm2 start ecosystem.config.cjs --env production

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
      PB_URL: 'http://127.0.0.1:8090',
      SITE_URL: 'https://edubuzz.co.za',
      PB_ADMIN_EMAIL: 'praiseleeto@gmail.com',
      PB_ADMIN_PASSWORD: 'Mogaila1996!@#',
      CSRF_SECRET: '0e7e7bc03a1f67280b3d90cc6f0b113c668bb17f192fe783f09331c919ce9e6a',
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
      PB_URL: 'http://127.0.0.1:8090',
      SITE_URL: 'https://edubuzz.co.za',
      PB_ADMIN_EMAIL: 'praiseleeto@gmail.com',
      PB_ADMIN_PASSWORD: 'Mogaila1996!@#',
      CSRF_SECRET: '0e7e7bc03a1f67280b3d90cc6f0b113c668bb17f192fe783f09331c919ce9e6a',
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
