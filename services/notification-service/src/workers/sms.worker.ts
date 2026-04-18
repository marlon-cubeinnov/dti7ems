import fp from 'fastify-plugin';
import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../plugins/queue.js';

export interface SmsJobData {
  type: 'rsvp-reminder';
  to: string;     // Phone number (PH format, e.g., 09171234567)
  message: string;
}

export const smsWorkerPlugin = fp(async (app) => {
  const apiKey     = process.env['SEMAPHORE_API_KEY'] ?? '';
  const senderName = process.env['SEMAPHORE_SENDER_NAME'] ?? 'DTI-R7';
  const isDryRun   = !apiKey;

  if (isDryRun) {
    app.log.warn('SEMAPHORE_API_KEY not set — SMS will be logged, not sent');
  }

  const worker = new Worker<SmsJobData>(
    QUEUE_NAMES.SMS,
    async (job: Job<SmsJobData>) => {
      const { to, message } = job.data;
      app.log.info({ to }, `Processing SMS job`);

      if (!isDryRun) {
        const res = await fetch('https://api.semaphore.co/api/v4/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apikey: apiKey,
            number: to,
            message,
            sendername: senderName,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Semaphore API error: ${res.status} — ${body}`);
        }
        app.log.info({ to }, 'SMS sent via Semaphore');
      } else {
        app.log.info({ to, message }, '📱 [DRY-RUN] SMS would be sent');
      }
    },
    {
      connection: {
        host: app.redis.options.host,
        port: app.redis.options.port,
      },
      concurrency: 3,
    },
  );

  worker.on('completed', (job) => {
    app.log.info({ jobId: job.id }, 'SMS job completed');
  });

  worker.on('failed', (job, err) => {
    app.log.error({ jobId: job?.id, err: err.message }, 'SMS job failed');
  });

  app.addHook('onClose', async () => {
    await worker.close();
    app.log.info('SMS worker closed');
  });
});
