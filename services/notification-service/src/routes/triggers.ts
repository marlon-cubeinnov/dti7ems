import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

/**
 * HTTP trigger routes called by other services (event-service, identity-service)
 * to enqueue notification jobs. These are internal service-to-service calls.
 *
 * In production, these should be secured via a shared internal API key header.
 */
export const triggerRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {

  // POST /notify/registration-confirmation
  app.post('/registration-confirmation', async (request, reply) => {
    const body = z.object({
      to:              z.string().email(),
      participantName: z.string(),
      eventTitle:      z.string(),
      eventDate:       z.string(),
      eventVenue:      z.string().optional(),
      requiresTNA:     z.boolean(),
      participationId: z.string(),
    }).parse(request.body);

    await app.queues.email.add('registration-confirmation', {
      type: 'registration-confirmation',
      to: body.to,
      data: body,
    });

    return reply.code(202).send({ success: true, message: 'Notification queued.' });
  });

  // POST /notify/rsvp-reminder
  app.post('/rsvp-reminder', async (request, reply) => {
    const body = z.object({
      to:              z.string().email(),
      participantName: z.string(),
      eventTitle:      z.string(),
      eventDate:       z.string(),
      eventVenue:      z.string().optional(),
      daysUntilEvent:  z.number(),
      phone:           z.string().optional(), // Optional: also send SMS
    }).parse(request.body);

    await app.queues.email.add('rsvp-reminder', {
      type: 'rsvp-reminder',
      to: body.to,
      data: body,
    });

    // Optional SMS
    if (body.phone) {
      await app.queues.sms.add('rsvp-reminder-sms', {
        type: 'rsvp-reminder',
        to: body.phone,
        message: `DTI R7: Reminder — "${body.eventTitle}" is ${body.daysUntilEvent <= 1 ? 'tomorrow' : `in ${body.daysUntilEvent} days`}. See you there!`,
      });
    }

    return reply.code(202).send({ success: true, message: 'Reminder queued.' });
  });

  // POST /notify/csf-survey-invite
  app.post('/csf-survey-invite', async (request, reply) => {
    const body = z.object({
      to:              z.string().email(),
      participantName: z.string(),
      eventTitle:      z.string(),
      participationId: z.string(),
    }).parse(request.body);

    await app.queues.email.add('csf-survey-invite', {
      type: 'csf-survey-invite',
      to: body.to,
      data: body,
    });

    return reply.code(202).send({ success: true, message: 'Survey invite queued.' });
  });

  // POST /notify/certificate-issued
  app.post('/certificate-issued', async (request, reply) => {
    const body = z.object({
      to:               z.string().email(),
      participantName:  z.string(),
      eventTitle:       z.string(),
      verificationCode: z.string(),
    }).parse(request.body);

    await app.queues.email.add('certificate-issued', {
      type: 'certificate-issued',
      to: body.to,
      data: body,
    });

    return reply.code(202).send({ success: true, message: 'Certificate notification queued.' });
  });

  // POST /notify/bulk-csf-invite — batch: send CSF invites to multiple participants
  app.post('/bulk-csf-invite', async (request, reply) => {
    const body = z.object({
      eventTitle: z.string(),
      participants: z.array(z.object({
        to:              z.string().email(),
        participantName: z.string(),
        participationId: z.string(),
      })),
    }).parse(request.body);

    let queued = 0;
    for (const p of body.participants) {
      await app.queues.email.add(`csf-survey-invite-${p.participationId}`, {
        type: 'csf-survey-invite',
        to: p.to,
        data: { ...p, eventTitle: body.eventTitle },
      }, {
        delay: 3600_000, // 1 hour delay per BLML DispatchCSFSurveyOnEventEnd
      });
      queued++;
    }

    return reply.code(202).send({ success: true, message: `${queued} survey invites queued.` });
  });

  // POST /notify/impact-survey-invite — single impact survey email
  app.post('/impact-survey-invite', async (request, reply) => {
    const body = z.object({
      to:              z.string().email(),
      participantName: z.string(),
      eventTitle:      z.string(),
      eventDate:       z.string(),
      participationId: z.string(),
    }).parse(request.body);

    await app.queues.email.add('impact-survey-invite', {
      type: 'impact-survey-invite',
      to: body.to,
      data: body,
    });

    return reply.code(202).send({ success: true, message: 'Impact survey invite queued.' });
  });

  // POST /notify/bulk-impact-invite — batch: send 6-month impact survey invites
  app.post('/bulk-impact-invite', async (request, reply) => {
    const body = z.object({
      eventTitle: z.string(),
      eventDate:  z.string(),
      participants: z.array(z.object({
        to:              z.string().email(),
        participantName: z.string(),
        participationId: z.string(),
      })),
    }).parse(request.body);

    let queued = 0;
    for (const p of body.participants) {
      await app.queues.email.add(`impact-survey-invite-${p.participationId}`, {
        type: 'impact-survey-invite',
        to: p.to,
        data: { ...p, eventTitle: body.eventTitle, eventDate: body.eventDate },
      });
      queued++;
    }

    return reply.code(202).send({ success: true, message: `${queued} impact survey invites queued.` });
  });
};
