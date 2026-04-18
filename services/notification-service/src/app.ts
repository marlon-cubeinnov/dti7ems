import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { redisPlugin } from './plugins/redis.js';
import { queuePlugin } from './plugins/queue.js';
import { emailWorkerPlugin } from './workers/email.worker.js';
import { smsWorkerPlugin } from './workers/sms.worker.js';
import { triggerRoutes } from './routes/triggers.js';
import { errorHandler } from './plugins/error-handler.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      ...(process.env['NODE_ENV'] !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
    },
    trustProxy: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: '*' });
  await app.register(rateLimit, { global: true, max: 100, timeWindow: '1 minute' });

  // Plugins
  await app.register(redisPlugin);
  await app.register(queuePlugin);

  // Workers
  await app.register(emailWorkerPlugin);
  await app.register(smsWorkerPlugin);

  // Error handler
  app.setErrorHandler(errorHandler);

  // HTTP trigger routes (called by other services)
  await app.register(triggerRoutes, { prefix: '/notify' });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
  }));

  return app;
}
