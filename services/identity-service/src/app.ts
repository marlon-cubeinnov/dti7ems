import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { dbPlugin } from './plugins/db.js';
import { jwtPlugin } from './plugins/jwt.js';
import { redisPlugin } from './plugins/redis.js';
import { mailerPlugin } from './plugins/mailer.js';
import { errorHandler } from './plugins/error-handler.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { enterpriseRoutes } from './routes/enterprises.js';
import { adminRoutes } from './routes/admin.js';
import { directoryRoutes } from './routes/directory.js';
import { rolesRoutes } from './routes/roles.js';

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

  // ── Security ───────────────────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // API — no HTML served
  });

  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173,http://localhost:5174').split(',');
  await app.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Rate limiting ──────────────────────────────────────────────────────────
  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: { code: 'RATE_001', message: 'Too many requests. Please slow down.' },
    }),
  });

  // ── Cookies ───────────────────────────────────────────────────────────────
  await app.register(cookie, {
    secret: process.env['COOKIE_SECRET'] ?? 'dti-ems-dev-cookie-secret-change-in-prod',
  });

  // ── Plugins ───────────────────────────────────────────────────────────────
  await app.register(redisPlugin);
  await app.register(dbPlugin);
  await app.register(jwtPlugin);
  await app.register(mailerPlugin);

  // ── Error handler ──────────────────────────────────────────────────────────
  app.setErrorHandler(errorHandler);

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(authRoutes,       { prefix: '/auth' });
  await app.register(userRoutes,       { prefix: '/users' });
  await app.register(enterpriseRoutes, { prefix: '/enterprises' });
  await app.register(adminRoutes,      { prefix: '/admin' });
  await app.register(directoryRoutes,  { prefix: '/directory' });
  await app.register(rolesRoutes,      { prefix: '/admin/roles' });

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    service: 'identity-service',
    timestamp: new Date().toISOString(),
  }));

  return app;
}
