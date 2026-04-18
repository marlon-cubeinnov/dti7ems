import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const dbPlugin = fp(async (app) => {
  const prisma = new PrismaClient({
    log: process.env['NODE_ENV'] === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });

  await prisma.$connect();
  app.log.info('PostgreSQL connected via Prisma');

  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
    app.log.info('PostgreSQL disconnected');
  });
});
