import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError, ErrorCode } from '@dti-ems/shared-errors';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

export const surveyRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // POST /surveys/events/:eventId/csf — participant submits CSF response (once per event)
  app.post('/events/:eventId/csf', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const body = z.object({
      overallRating:       z.number().int().min(1).max(5),
      contentRating:       z.number().int().min(1).max(5),
      facilitatorRating:   z.number().int().min(1).max(5),
      logisticsRating:     z.number().int().min(1).max(5),
      highlightsFeedback:  z.string().max(2000).optional().nullable(),
      improvementsFeedback:z.string().max(2000).optional().nullable(),
    }).parse(request.body);

    // Must be a participant of this event
    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      select: { id: true, status: true },
    });
    if (!participation) {
      throw new NotFoundError('You are not registered for this event.');
    }
    if (!['RSVP_CONFIRMED', 'ATTENDED', 'COMPLETED'].includes(participation.status)) {
      throw new BadRequestError('Only confirmed participants can submit a survey.', ErrorCode.VALIDATION_ERROR);
    }

    // Check for existing response
    const existing = await app.prisma.csfSurveyResponse.findUnique({
      where: { participationId: participation.id },
    });
    if (existing && existing.status === 'SUBMITTED') {
      throw new ConflictError('You have already submitted a survey for this event.', ErrorCode.CONFLICT);
    }

    const response = await app.prisma.csfSurveyResponse.upsert({
      where: { participationId: participation.id },
      create: {
        participationId:      participation.id,
        eventId,
        userId:               request.user.sub,
        status:               'SUBMITTED',
        overallRating:        body.overallRating,
        contentRating:        body.contentRating,
        facilitatorRating:    body.facilitatorRating,
        logisticsRating:      body.logisticsRating,
        highlightsFeedback:   body.highlightsFeedback ?? null,
        improvementsFeedback: body.improvementsFeedback ?? null,
        submittedAt:          new Date(),
      },
      update: {
        status:               'SUBMITTED',
        overallRating:        body.overallRating,
        contentRating:        body.contentRating,
        facilitatorRating:    body.facilitatorRating,
        logisticsRating:      body.logisticsRating,
        highlightsFeedback:   body.highlightsFeedback ?? null,
        improvementsFeedback: body.improvementsFeedback ?? null,
        submittedAt:          new Date(),
      },
    });

    return reply.code(201).send({ success: true, data: response, message: 'Thank you for your feedback!' });
  });

  // GET /surveys/events/:eventId/csf/me — participant checks their own response
  app.get('/events/:eventId/csf/me', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      select: { id: true },
    });
    if (!participation) {
      return reply.send({ success: true, data: null });
    }

    const response = await app.prisma.csfSurveyResponse.findUnique({
      where: { participationId: participation.id },
    });
    return reply.send({ success: true, data: response ?? null });
  });

  // GET /surveys/events/:eventId/csf/results — organizer/admin aggregated results
  app.get('/events/:eventId/csf/results', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only organizers can view survey results.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const responses = await app.prisma.csfSurveyResponse.findMany({
      where: { eventId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
    });

    const count = responses.length;
    if (count === 0) {
      return reply.send({
        success: true,
        data: { count: 0, averages: null, responses: [] },
      });
    }

    const avg = (field: keyof typeof responses[0]) => {
      const vals = responses.map(r => Number(r[field])).filter(v => !isNaN(v));
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };

    return reply.send({
      success: true,
      data: {
        count,
        averages: {
          overall:     avg('overallRating'),
          content:     avg('contentRating'),
          facilitator: avg('facilitatorRating'),
          logistics:   avg('logisticsRating'),
        },
        responses: responses.map(r => ({
          id:                   r.id,
          overallRating:        r.overallRating,
          contentRating:        r.contentRating,
          facilitatorRating:    r.facilitatorRating,
          logisticsRating:      r.logisticsRating,
          highlightsFeedback:   r.highlightsFeedback,
          improvementsFeedback: r.improvementsFeedback,
          submittedAt:          r.submittedAt,
        })),
      },
    });
  });

  // ── Impact Survey Routes ──────────────────────────────────────────────────

  // POST /surveys/events/:eventId/impact — participant submits 6-month impact survey
  app.post('/events/:eventId/impact', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const body = z.object({
      knowledgeApplication: z.number().int().min(1).max(5),
      skillImprovement:     z.number().int().min(1).max(5),
      businessImpact:       z.number().int().min(1).max(5),
      revenueChange:        z.number().int().min(1).max(5),
      employeeGrowth:       z.number().int().min(1).max(5),
      successStory:         z.string().max(5000).optional().nullable(),
      challengesFaced:      z.string().max(5000).optional().nullable(),
      additionalSupport:    z.string().max(5000).optional().nullable(),
      revenueChangePct:     z.number().min(-100).max(1000).optional().nullable(),
      employeeCountBefore:  z.number().int().min(0).optional().nullable(),
      employeeCountAfter:   z.number().int().min(0).optional().nullable(),
    }).parse(request.body);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      select: { id: true, status: true },
    });
    if (!participation) {
      throw new NotFoundError('You are not registered for this event.');
    }
    if (!['ATTENDED', 'COMPLETED'].includes(participation.status)) {
      throw new BadRequestError('Only participants who attended can submit impact surveys.', ErrorCode.VALIDATION_ERROR);
    }

    const existing = await app.prisma.impactSurveyResponse.findUnique({
      where: { participationId: participation.id },
    });
    if (existing && existing.status === 'SUBMITTED') {
      throw new ConflictError('You have already submitted an impact survey for this event.', ErrorCode.CONFLICT);
    }

    const response = await app.prisma.impactSurveyResponse.upsert({
      where: { participationId: participation.id },
      create: {
        participationId: participation.id,
        eventId,
        userId: request.user.sub,
        status: 'SUBMITTED',
        scheduledAt: new Date(),
        ...body,
        submittedAt: new Date(),
      },
      update: {
        status: 'SUBMITTED',
        ...body,
        submittedAt: new Date(),
      },
    });

    return reply.code(201).send({ success: true, data: response, message: 'Thank you for sharing your impact story!' });
  });

  // GET /surveys/events/:eventId/impact/me — check own impact survey status
  app.get('/events/:eventId/impact/me', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      select: { id: true },
    });
    if (!participation) {
      return reply.send({ success: true, data: null });
    }

    const response = await app.prisma.impactSurveyResponse.findUnique({
      where: { participationId: participation.id },
    });
    return reply.send({ success: true, data: response ?? null });
  });

  // GET /surveys/events/:eventId/impact/results — aggregated results (admin/organizer)
  app.get('/events/:eventId/impact/results', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', ...ADMIN_ROLES].includes(role)) {
      throw new ForbiddenError('Only organizers or admins can view impact results.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const responses = await app.prisma.impactSurveyResponse.findMany({
      where: { eventId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
    });

    const count = responses.length;
    if (count === 0) {
      return reply.send({ success: true, data: { count: 0, averages: null, responses: [] } });
    }

    const avg = (field: keyof typeof responses[0]) => {
      const vals = responses.map(r => Number(r[field])).filter(v => !isNaN(v) && v > 0);
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };

    return reply.send({
      success: true,
      data: {
        count,
        averages: {
          knowledgeApplication: avg('knowledgeApplication'),
          skillImprovement:     avg('skillImprovement'),
          businessImpact:       avg('businessImpact'),
          revenueChange:        avg('revenueChange'),
          employeeGrowth:       avg('employeeGrowth'),
        },
        responses: responses.map(r => ({
          id:                   r.id,
          knowledgeApplication: r.knowledgeApplication,
          skillImprovement:     r.skillImprovement,
          businessImpact:       r.businessImpact,
          revenueChange:        r.revenueChange,
          employeeGrowth:       r.employeeGrowth,
          successStory:         r.successStory,
          challengesFaced:      r.challengesFaced,
          additionalSupport:    r.additionalSupport,
          revenueChangePct:     r.revenueChangePct,
          employeeCountBefore:  r.employeeCountBefore,
          employeeCountAfter:   r.employeeCountAfter,
          submittedAt:          r.submittedAt,
        })),
      },
    });
  });
};
