import fp from 'fastify-plugin';
import cron from 'node-cron';

/**
 * Scheduled jobs for identity-service:
 *
 * 1. Annual Profile Update Reminder — fires on Jan 5 at 08:00 PH time (UTC+8 → 00:00 UTC)
 *    Marks all enterprise profiles as `profileUpdateDue = true` and emails primary contacts.
 *
 * 2. Daily Due-Check — runs at 01:00 every day in January (days 5–31) to catch
 *    any enterprise whose annual update flag was never cleared from a prior year.
 */
export const cronPlugin = fp(async (app) => {
  const tasks: cron.ScheduledTask[] = [];

  const NOTIFICATION_SERVICE = process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3013';

  async function markAndNotifyAnnualUpdates() {
    try {
      app.log.info('[cron] Running annual enterprise profile update notification...');

      const currentYear = new Date().getFullYear();

      // Mark all enterprises whose annualUpdateYear < currentYear (or never updated) as due
      const marked = await app.prisma.enterpriseProfile.updateMany({
        where: {
          OR: [
            { annualUpdateYear: null },
            { annualUpdateYear: { lt: currentYear } },
          ],
          profileUpdateDue: false,
        },
        data: { profileUpdateDue: true },
      });

      app.log.info(`[cron] Marked ${marked.count} enterprise profiles as update-due for ${currentYear}.`);

      // Fetch all OWNER memberships with their user emails
      const owners = await app.prisma.enterpriseMembership.findMany({
        where: {
          role: 'OWNER',
          isActive: true,
          enterprise: {
            OR: [
              { annualUpdateYear: null },
              { annualUpdateYear: { lt: currentYear } },
            ],
          },
        },
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
          enterprise: {
            select: { id: true, businessName: true },
          },
        },
      });

      app.log.info(`[cron] Sending annual update reminder to ${owners.length} primary contacts.`);

      for (const owner of owners) {
        try {
          await fetch(`${NOTIFICATION_SERVICE}/triggers/enterprise-update-reminder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: owner.user.email,
              name: `${owner.user.firstName} ${owner.user.lastName}`.trim(),
              businessName: owner.enterprise.businessName,
              enterpriseId: owner.enterprise.id,
              year: currentYear,
            }),
          });
        } catch (err) {
          app.log.warn(`[cron] Failed to notify ${owner.user.email}: ${(err as Error).message}`);
        }
      }

      app.log.info('[cron] Annual enterprise update reminder complete.');
    } catch (err) {
      app.log.error({ err }, '[cron] Annual enterprise update job failed.');
    }
  }

  // ── 1. Jan 5 main trigger (08:00 PH = 00:00 UTC) ─────────────────────────
  tasks.push(
    cron.schedule('0 0 5 1 *', markAndNotifyAnnualUpdates, { timezone: 'Asia/Manila' })
  );

  // ── 2. Daily catch-up for Jan 6–31 (also at 08:00 PH) ────────────────────
  // Handles enterprises that registered or joined after Jan 5, or missed the trigger.
  tasks.push(
    cron.schedule('0 0 6-31 1 *', async () => {
      app.log.info('[cron] Running January catch-up: marking overdue profiles...');
      const currentYear = new Date().getFullYear();
      await app.prisma.enterpriseProfile.updateMany({
        where: {
          OR: [
            { annualUpdateYear: null },
            { annualUpdateYear: { lt: currentYear } },
          ],
          profileUpdateDue: false,
        },
        data: { profileUpdateDue: true },
      });
    }, { timezone: 'Asia/Manila' })
  );

  app.addHook('onClose', async () => {
    for (const task of tasks) task.stop();
  });
});
