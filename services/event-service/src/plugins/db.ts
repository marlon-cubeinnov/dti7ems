import fp from 'fastify-plugin';
// Relative import to the generated Prisma client for the event schema
// (custom output defined in prisma/schema.prisma)
import { PrismaClient as EventPrismaClient } from '../../node_modules/.prisma/event-client/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: EventPrismaClient;
  }
}

export const dbPlugin = fp(async (app) => {
  const prisma = new EventPrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['warn', 'error'] : ['error'],
  });

  await prisma.$connect();
  app.log.info('PostgreSQL (event schema) connected');

  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
