import fp from 'fastify-plugin';
import { Worker, Job } from 'bullmq';
import { Resend } from 'resend';
import { QUEUE_NAMES } from '../plugins/queue.js';
import {
  registrationConfirmation,
  rsvpReminder,
  csfSurveyInvite,
  certificateIssued,
  impactSurveyInvite,
} from '../templates/email.templates.js';

export interface EmailJobData {
  type: 'registration-confirmation' | 'rsvp-reminder' | 'csf-survey-invite' | 'certificate-issued' | 'impact-survey-invite';
  to: string;
  data: Record<string, unknown>;
}

export const emailWorkerPlugin = fp(async (app) => {
  const apiKey = process.env['RESEND_API_KEY'] ?? '';
  const from   = process.env['EMAIL_FROM'] ?? 'DTI EMS <noreply@ems.dti7.gov.ph>';

  // In dev without a real API key, just log
  const isDryRun = !apiKey || apiKey.startsWith('re_test_');
  if (isDryRun) {
    app.log.warn('RESEND_API_KEY is test/empty — emails will be logged, not sent');
  }

  const resend = isDryRun ? null : new Resend(apiKey);

  const worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job: Job<EmailJobData>) => {
      const { type, to, data } = job.data;
      app.log.info({ type, to }, `Processing email job: ${type}`);

      let email: { subject: string; html: string };

      switch (type) {
        case 'registration-confirmation':
          email = registrationConfirmation(data as any);
          break;
        case 'rsvp-reminder':
          email = rsvpReminder(data as any);
          break;
        case 'csf-survey-invite':
          email = csfSurveyInvite(data as any);
          break;
        case 'certificate-issued':
          email = certificateIssued(data as any);
          break;
        case 'impact-survey-invite':
          email = impactSurveyInvite(data as any);
          break;
        default:
          throw new Error(`Unknown email type: ${type}`);
      }

      if (resend) {
        const result = await resend.emails.send({
          from,
          to,
          subject: email.subject,
          html: email.html,
        });
        app.log.info({ type, to, result }, 'Email sent via Resend');
      } else {
        // Dry-run: log the email
        app.log.info({ type, to, subject: email.subject }, '📧 [DRY-RUN] Email would be sent');
      }
    },
    {
      connection: {
        host: app.redis.options.host,
        port: app.redis.options.port,
      },
      concurrency: 5,
    },
  );

  worker.on('completed', (job) => {
    app.log.info({ jobId: job.id, type: job.data.type }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    app.log.error({ jobId: job?.id, type: job?.data.type, err: err.message }, 'Email job failed');
  });

  app.addHook('onClose', async () => {
    await worker.close();
    app.log.info('Email worker closed');
  });
});
