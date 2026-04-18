import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: nodemailer.Transporter;
  }
}

export const mailerPlugin = fp(async (app) => {
  const transporter = nodemailer.createTransport({
    host:   process.env['SMTP_HOST'] ?? 'localhost',
    port:   Number(process.env['SMTP_PORT'] ?? 1025),
    secure: process.env['SMTP_SECURE'] === 'true',
    ...(process.env['SMTP_USER'] && {
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    }),
  });

  await transporter.verify();
  app.log.info('SMTP mailer connected');

  app.decorate('mailer', transporter);
});
