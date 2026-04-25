import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';
import type { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: nodemailer.Transporter;
    reloadMailer: () => Promise<void>;
  }
}

/** Read all smtp_* keys from system_settings, fall back to env vars. */
export async function loadSmtpConfig(prisma: PrismaClient): Promise<{
  host: string; port: number; secure: boolean;
  user: string | null; pass: string | null; from: string;
}> {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'smtp_from'] } },
  });
  const kv = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']));

  return {
    host:   kv['smtp_host']   || process.env['SMTP_HOST'] || 'localhost',
    port:   Number(kv['smtp_port']   || process.env['SMTP_PORT'] || 1025),
    secure: (kv['smtp_secure'] !== undefined && kv['smtp_secure'] !== '')
              ? kv['smtp_secure'] === 'true'
              : process.env['SMTP_SECURE'] === 'true',
    user:   kv['smtp_user']   || process.env['SMTP_USER'] || null,
    pass:   kv['smtp_pass']   || process.env['SMTP_PASS'] || null,
    from:   kv['smtp_from']   || process.env['SMTP_FROM'] || 'DTI Region 7 EMS <noreply@dti7-ems.local>',
  };
}

function buildTransport(cfg: Awaited<ReturnType<typeof loadSmtpConfig>>) {
  return nodemailer.createTransport({
    host:   cfg.host,
    port:   cfg.port,
    secure: cfg.secure,
    ...(cfg.user ? { auth: { user: cfg.user, pass: cfg.pass ?? '' } } : {}),
  });
}

export const mailerPlugin = fp(async (app) => {
  const cfg = await loadSmtpConfig(app.prisma);
  const transporter = buildTransport(cfg);

  await transporter.verify();
  app.log.info('SMTP mailer connected');

  app.decorate('mailer', transporter);

  /** Call this after saving new SMTP settings to reconnect with new config. */
  app.decorate('reloadMailer', async () => {
    const newCfg = await loadSmtpConfig(app.prisma);
    const newTransport = buildTransport(newCfg);
    await newTransport.verify();
    // @ts-expect-error – replace decorated value in-place
    app.mailer = newTransport;
    app.log.info('SMTP mailer reloaded');
  });
});

