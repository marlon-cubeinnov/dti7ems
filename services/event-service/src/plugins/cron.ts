import fp from 'fastify-plugin';
import cron from 'node-cron';

const NOTIFICATION_URL = process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3013';

/**
 * Scheduled jobs:
 *
 * 1. Impact Survey Dispatch — daily at 09:00
 *    Finds events completed ~180 days ago, creates PENDING impact survey rows,
 *    then notifies participants via notification-service.
 *
 * 2. Survey Expiry — daily at 02:00
 *    Marks CSF surveys EXPIRED after 14 days, impact surveys after 30 days.
 *
 * 3. RSVP Reminders — daily at 08:00
 *    Sends reminders 7 days and 1 day before event start.
 */
export const cronPlugin = fp(async (app) => {
  const tasks: cron.ScheduledTask[] = [];

  // ── 1. Impact Survey Dispatch (daily 09:00) ───────────────────────────────
  tasks.push(
    cron.schedule('0 9 * * *', async () => {
      try {
        app.log.info('[cron] Running impact survey dispatch...');

        // Find events completed 175–185 days ago (window to avoid re-processing)
        const now = new Date();
        const from = new Date(now.getTime() - 185 * 24 * 60 * 60 * 1000);
        const to   = new Date(now.getTime() - 175 * 24 * 60 * 60 * 1000);

        const completedEvents = await app.prisma.event.findMany({
          where: {
            status: 'COMPLETED',
            endDate: { gte: from, lte: to },
          },
          select: { id: true, title: true, endDate: true },
        });

        if (completedEvents.length === 0) {
          app.log.info('[cron] No events eligible for impact survey dispatch.');
          return;
        }

        for (const event of completedEvents) {
          // Find attended participants who don't have an impact survey yet
          const eligible = await app.prisma.eventParticipation.findMany({
            where: {
              eventId: event.id,
              status: { in: ['ATTENDED', 'COMPLETED'] },
              impactSurveyResponse: null,
            },
            select: {
              id: true,
              userId: true,
              participantEmail: true,
              participantName: true,
            },
          });

          if (eligible.length === 0) continue;

          // Create PENDING impact survey rows
          const scheduledAt = new Date();
          const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          for (const p of eligible) {
            await app.prisma.impactSurveyResponse.upsert({
              where: { participationId: p.id },
              create: {
                participationId: p.id,
                eventId: event.id,
                userId: p.userId,
                status: 'PENDING',
                scheduledAt,
                expiresAt,
              },
              update: {},
            });
          }

          // Fire notification via HTTP
          try {
            await fetch(`${NOTIFICATION_URL}/notify/bulk-impact-invite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventTitle: event.title,
                eventDate: event.endDate.toISOString().split('T')[0],
                participants: eligible
                  .filter(p => p.participantEmail)
                  .map(p => ({
                    to: p.participantEmail!,
                    participantName: p.participantName ?? 'Participant',
                    participationId: p.id,
                  })),
              }),
            });
          } catch (err) {
            app.log.error({ err, eventId: event.id }, '[cron] Failed to notify impact survey participants');
          }

          app.log.info({ eventId: event.id, count: eligible.length }, '[cron] Impact survey dispatched');
        }
      } catch (err) {
        app.log.error({ err }, '[cron] Impact survey dispatch failed');
      }
    }),
  );

  // ── 2. Survey Expiry (daily 02:00) ────────────────────────────────────────
  tasks.push(
    cron.schedule('0 2 * * *', async () => {
      try {
        app.log.info('[cron] Running survey expiry check...');
        const now = new Date();

        // CSF: expire PENDING after 14 days from event completion
        const csfExpired = await app.prisma.csfSurveyResponse.updateMany({
          where: {
            status: 'PENDING',
            createdAt: { lte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
          },
          data: { status: 'EXPIRED' },
        });

        // Impact: expire PENDING after expiresAt
        const impactExpired = await app.prisma.impactSurveyResponse.updateMany({
          where: {
            status: 'PENDING',
            expiresAt: { lte: now },
          },
          data: { status: 'EXPIRED' },
        });

        app.log.info(
          { csfExpired: csfExpired.count, impactExpired: impactExpired.count },
          '[cron] Survey expiry complete',
        );
      } catch (err) {
        app.log.error({ err }, '[cron] Survey expiry check failed');
      }
    }),
  );

  // ── 3. RSVP Reminders (daily 08:00) ──────────────────────────────────────
  tasks.push(
    cron.schedule('0 8 * * *', async () => {
      try {
        app.log.info('[cron] Running RSVP reminder check...');
        const now = new Date();

        for (const daysBeforeEvent of [7, 1]) {
          const targetDate = new Date(now.getTime() + daysBeforeEvent * 24 * 60 * 60 * 1000);
          const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
          const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

          const upcoming = await app.prisma.event.findMany({
            where: {
              status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'] },
              startDate: { gte: dayStart, lt: dayEnd },
            },
            select: { id: true, title: true, startDate: true, venue: true },
          });

          for (const event of upcoming) {
            const participants = await app.prisma.eventParticipation.findMany({
              where: {
                eventId: event.id,
                status: { in: ['REGISTERED', 'TNA_PENDING', 'RSVP_CONFIRMED'] },
              },
              select: {
                id: true,
                participantEmail: true,
                participantName: true,
              },
            });

            if (participants.length === 0) continue;

            for (const p of participants) {
              if (!p.participantEmail) continue;

              try {
                await fetch(`${NOTIFICATION_URL}/notify/rsvp-reminder`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: p.participantEmail,
                    participantName: p.participantName ?? 'Participant',
                    eventTitle: event.title,
                    eventDate: event.startDate.toISOString().split('T')[0],
                    eventVenue: event.venue ?? undefined,
                    daysUntilEvent: daysBeforeEvent,
                  }),
                });
              } catch {
                // Individual notification failure — don't block others
              }
            }

            app.log.info(
              { eventId: event.id, daysBeforeEvent, count: participants.length },
              '[cron] RSVP reminders sent',
            );
          }
        }
      } catch (err) {
        app.log.error({ err }, '[cron] RSVP reminder check failed');
      }
    }),
  );

  // Cleanup on app close
  app.addHook('onClose', async () => {
    for (const task of tasks) {
      task.stop();
    }
    app.log.info('[cron] All scheduled tasks stopped');
  });

  app.log.info(`[cron] ${tasks.length} scheduled tasks registered`);
});
