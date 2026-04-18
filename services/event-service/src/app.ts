import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { dbPlugin } from './plugins/db.js';
import { jwtPlugin } from './plugins/jwt.js';
import { errorHandler } from './plugins/error-handler.js';
import { eventRoutes } from './routes/events.js';
import { participationRoutes } from './routes/participations.js';
import { certificateRoutes } from './routes/certificates.js';
import { surveyRoutes } from './routes/surveys.js';
import { adminRoutes } from './routes/admin.js';
import { checklistRoutes } from './routes/checklists.js';
import { cronPlugin } from './plugins/cron.js';

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

  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173,http://localhost:5174').split(',');
  await app.register(cors, { origin: origins, credentials: true });

  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
  });

  await app.register(dbPlugin);
  await app.register(jwtPlugin);

  app.setErrorHandler(errorHandler);

  await app.register(eventRoutes,         { prefix: '/events' });
  await app.register(participationRoutes, { prefix: '/participations' });
  await app.register(certificateRoutes,   { prefix: '/certificates' });
  await app.register(surveyRoutes,        { prefix: '/surveys' });
  await app.register(adminRoutes,         { prefix: '/admin' });
  await app.register(checklistRoutes,     { prefix: '/checklists' });

  // Scheduled background jobs
  await app.register(cronPlugin);

  app.get('/health', async () => ({
    status: 'ok',
    service: 'event-service',
    timestamp: new Date().toISOString(),
  }));

  return app;
}
