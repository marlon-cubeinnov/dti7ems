// PM2 process definitions for DTI EMS production
// Run: pm2 start ecosystem.config.cjs --env production
// Reload: pm2 reload ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: 'identity-service',
      script: 'dist/main.js',
      cwd: '/opt/dti-ems/services/identity-service',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/dti-ems/identity-service.err.log',
      out_file: '/var/log/dti-ems/identity-service.out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'event-service',
      script: 'dist/main.js',
      cwd: '/opt/dti-ems/services/event-service',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/dti-ems/event-service.err.log',
      out_file: '/var/log/dti-ems/event-service.out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'notification-service',
      script: 'dist/main.js',
      cwd: '/opt/dti-ems/services/notification-service',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/dti-ems/notification-service.err.log',
      out_file: '/var/log/dti-ems/notification-service.out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
