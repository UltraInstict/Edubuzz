// PM2 Ecosystem File for Edubuzz Production
// Usage: pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [{
    name: 'edubuzz',
    script: './dist/server/entry.mjs',
    instances: 'max',           // Cluster mode: one per CPU core
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4321,
    },
    // Memory & CPU
    max_memory_restart: '512M',
    max_restarts: 10,
    restart_delay: 5000,
    min_uptime: '30s',

    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/edubuzz/logs/edubuzz-error.log',
    out_file: '/home/edubuzz/logs/edubuzz-out.log',
    merge_logs: true,
    log_type: 'json',

    // Watch for file changes (disable in production)
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', 'pb_data'],

    // Environment-specific
    env_production: {
      NODE_ENV: 'production',
      PORT: 4321,
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 4322,
    },
  }],

  // Deployment config
  deploy: {
    production: {
      user: 'edubuzz',
      host: 'edubuzz.co.za',
      ref: 'origin/main',
      repo: 'git@github.com:edubuzz/edubuzz.git',
      path: '/home/edubuzz/edubuzz',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /home/edubuzz/logs /home/edubuzz/backups',
    },
    staging: {
      user: 'edubuzz',
      host: 'staging.edubuzz.co.za',
      ref: 'origin/develop',
      repo: 'git@github.com:edubuzz/edubuzz.git',
      path: '/home/edubuzz/staging',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.cjs --env staging',
    },
  },
};
