import fp from 'fastify-plugin';
import { Queue } from 'bullmq';

declare module 'fastify' {
  interface FastifyInstance {
    queues: {
      email: Queue;
      sms: Queue;
    };
  }
}

export const QUEUE_NAMES = {
  EMAIL: 'notification-email',
  SMS: 'notification-sms',
} as const;

export const queuePlugin = fp(async (app) => {
  const connection = app.redis; // Reuse the same ioredis connection options

  const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
    connection: { host: connection.options.host, port: connection.options.port },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

  const smsQueue = new Queue(QUEUE_NAMES.SMS, {
    connection: { host: connection.options.host, port: connection.options.port },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

  app.decorate('queues', { email: emailQueue, sms: smsQueue });

  app.addHook('onClose', async () => {
    await emailQueue.close();
    await smsQueue.close();
    app.log.info('BullMQ queues closed');
  });
});
