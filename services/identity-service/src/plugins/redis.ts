import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin = fp(async (app) => {
  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redis.on('error', (err) => app.log.error({ err }, 'Redis error'));
  redis.on('connect', () => app.log.info('Redis connected'));

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    await redis.quit();
    app.log.info('Redis disconnected');
  });
});
