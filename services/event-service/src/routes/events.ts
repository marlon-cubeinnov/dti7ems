import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ConflictError, ErrorCode } from '@dti-ems/shared-errors';
import { notifyBulkCsfInvite } from '../lib/notify.js';

const ORGANIZER_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
type OrganizerRole = typeof ORGANIZER_ROLES[number];

const createEventSchema = z.object({
  programId:           z.string().optional().nullable(),
  title:               z.string().min(3).max(300),
  description:         z.string().max(5000).optional().nullable(),
  venue:               z.string().max(500).optional().nullable(),
  deliveryMode:        z.enum(['FACE_TO_FACE', 'ONLINE', 'HYBRID']).default('FACE_TO_FACE'),
  onlineLink:          z.string().url().optional().nullable(),
  maxParticipants:     z.number().int().min(1).optional().nullable(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  startDate:           z.string().datetime(),
  endDate:             z.string().datetime(),
  targetSector:        z.string().max(200).optional().nullable(),
  targetRegion:        z.string().max(200).optional().nullable(),
  requiresTNA:         z.boolean().default(true),
  latitude:            z.number().min(-90).max(90).optional().nullable(),
  longitude:           z.number().min(-180).max(180).optional().nullable(),
});

const listEventsSchema = z.object({
  page:         z.coerce.number().min(1).default(1),
  limit:        z.coerce.number().min(1).max(50).default(12),
  status:       z.string().optional(),
  sector:       z.string().optional(),
  region:       z.string().optional(),
  search:       z.string().optional(),
  deliveryMode: z.string().optional(),
  upcoming:     z.coerce.boolean().optional(),
});

export const eventRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ── Public routes (no auth required) ──────────────────────────────────────

  // GET /events — public list
  app.get('/', async (request, reply) => {
    const q = listEventsSchema.parse(request.query);
    const skip = (q.page - 1) * q.limit;

    const where: Record<string, unknown> = {
      status: q.status ?? { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'] },
    };

    if (q.sector)       where['targetSector']  = { contains: q.sector, mode: 'insensitive' };
    if (q.region)       where['targetRegion']  = { contains: q.region, mode: 'insensitive' };
    if (q.deliveryMode) where['deliveryMode']  = q.deliveryMode;
    if (q.upcoming)     where['startDate']     = { gte: new Date() };
    if (q.search) {
      where['OR'] = [
        { title:       { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
        { venue:       { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const [total, events] = await Promise.all([
      app.prisma.event.count({ where }),
      app.prisma.event.findMany({
        where,
        skip,
        take: q.limit,
        orderBy: { startDate: 'asc' },
        select: {
          id: true, title: true, description: true, venue: true,
          deliveryMode: true, status: true, startDate: true, endDate: true,
          maxParticipants: true, registrationDeadline: true,
          targetSector: true, targetRegion: true, requiresTNA: true,
          coverImageUrl: true, onlineLink: true,
          _count: { select: { participations: { where: { status: { not: 'CANCELLED' } } } } },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: events,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    });
  });

  // GET /events/:id — public
  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const event = await app.prisma.event.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { participations: { where: { status: { not: 'CANCELLED' } } } } },
      },
    });

    if (!event) throw new NotFoundError('Event not found');
    return reply.send({ success: true, data: event });
  });

  // ── Protected routes (auth required) ──────────────────────────────────────

  // GET /events/mine — organizer's own events (all statuses including DRAFT)
  app.get('/mine', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access this endpoint.');
    }

    const q = z.object({
      page:   z.coerce.number().min(1).default(1),
      limit:  z.coerce.number().min(1).max(100).default(50),
      status: z.string().optional(),
    }).parse(request.query);

    // All organizer roles see all events (needed for QR scanning, participant management on any event)
    const where: Record<string, unknown> = {};
    if (q.status) where['status'] = q.status;

    const [total, events] = await Promise.all([
      app.prisma.event.count({ where }),
      app.prisma.event.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { participations: { where: { status: { not: 'CANCELLED' } } } } },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: events,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    });
  });

  // POST /events — organizer/admin
  app.post('/', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can create events.');
    }

    const body = createEventSchema.parse(request.body);

    // Date validation
    const start = new Date(body.startDate);
    const end   = new Date(body.endDate);
    if (end <= start) {
      throw new BadRequestError('endDate must be after startDate', ErrorCode.VALIDATION_ERROR);
    }

    const event = await app.prisma.event.create({
      data: {
        ...body,
        startDate: start,
        endDate:   end,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
        latitude:  body.latitude  != null ? body.latitude.toString()  : null,
        longitude: body.longitude != null ? body.longitude.toString() : null,
        organizerId: request.user.sub,
      },
    });

    return reply.code(201).send({ success: true, data: event });
  });

  // PATCH /events/:id — any organizer role or admin
  app.patch('/:id', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can update this event.');
    }

    if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
      throw new BadRequestError(`Cannot update a ${event.status} event.`, ErrorCode.INVALID_EVENT_STATUS);
    }

    const body = createEventSchema.partial().parse(request.body);
    const updated = await app.prisma.event.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate:   body.endDate   ? new Date(body.endDate)   : undefined,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
        latitude:  body.latitude  != null ? body.latitude.toString()  : undefined,
        longitude: body.longitude != null ? body.longitude.toString() : undefined,
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // PATCH /events/:id/status — workflow transitions
  app.patch('/:id/status', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({
      status: z.enum(['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
    }).parse(request.body);

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can change event status.');
    }

    // Workflow validation (from BLML EventWorkflow)
    const allowedTransitions: Record<string, string[]> = {
      DRAFT:               ['PUBLISHED', 'CANCELLED'],
      PUBLISHED:           ['REGISTRATION_OPEN', 'CANCELLED'],
      REGISTRATION_OPEN:   ['REGISTRATION_CLOSED', 'ONGOING', 'CANCELLED'],
      REGISTRATION_CLOSED: ['ONGOING', 'CANCELLED'],
      ONGOING:             ['COMPLETED', 'CANCELLED'],
      COMPLETED:           [],
      CANCELLED:           [],
    };

    const allowed = allowedTransitions[event.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestError(
        `Cannot transition from ${event.status} to ${status}.`,
        ErrorCode.INVALID_EVENT_STATUS,
      );
    }

    const updated = await app.prisma.event.update({
      where: { id },
      data: { status },
    });

    // Auto-create pending CSF survey records for all ATTENDED participants
    if (status === 'COMPLETED') {
      const attendedParticipants = await app.prisma.eventParticipation.findMany({
        where: { eventId: id, status: 'ATTENDED' },
        select: { id: true, userId: true, participantName: true, participantEmail: true },
      });

      if (attendedParticipants.length > 0) {
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await app.prisma.csfSurveyResponse.createMany({
          data: attendedParticipants.map(p => ({
            participationId: p.id,
            eventId: id,
            userId: p.userId,
            status: 'PENDING' as const,
            expiresAt,
          })),
          skipDuplicates: true,
        });

        // Fire-and-forget: dispatch CSF survey email invites (1-hour delay in notification-service)
        notifyBulkCsfInvite({
          eventTitle: updated.title,
          participants: attendedParticipants
            .filter(p => p.participantEmail)
            .map(p => ({
              to: p.participantEmail!,
              participantName: p.participantName ?? p.participantEmail ?? 'Participant',
              participationId: p.id,
            })),
        }).catch(() => { /* best effort */ });
      }
    }

    return reply.send({ success: true, data: updated });
  });

  // GET /events/:id/sessions — list sessions for an event
  app.get('/:id/sessions', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const sessions = await app.prisma.eventSession.findMany({
      where: { eventId: id },
      orderBy: { orderIndex: 'asc' },
    });

    return reply.send({ success: true, data: sessions });
  });

  // POST /events/:id/sessions
  app.post('/:id/sessions', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can add sessions.');
    }

    const body = z.object({
      title:       z.string().min(1).max(300),
      startTime:   z.string().datetime(),
      endTime:     z.string().datetime(),
      venue:       z.string().max(500).optional().nullable(),
      speakerName: z.string().max(200).optional().nullable(),
      orderIndex:  z.number().int().min(0).default(0),
    }).parse(request.body);

    const session = await app.prisma.eventSession.create({
      data: {
        ...body,
        startTime: new Date(body.startTime),
        endTime:   new Date(body.endTime),
        eventId: id,
      },
    });

    return reply.code(201).send({ success: true, data: session });
  });

  // DELETE /events/:id/sessions/:sessionId
  app.delete('/:id/sessions/:sessionId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, sessionId } = z.object({ id: z.string(), sessionId: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can delete sessions.');
    }

    const hasAttendance = await app.prisma.attendanceRecord.count({ where: { sessionId } });
    if (hasAttendance > 0) {
      throw new ConflictError('Cannot delete a session that already has attendance records.', ErrorCode.CONFLICT);
    }

    await app.prisma.eventSession.delete({ where: { id: sessionId } });
    return reply.send({ success: true, message: 'Session deleted.' });
  });

  // GET /events/:id/participants — organizer only
  app.get('/:id/participants', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can view participants.');
    }

    const q = z.object({
      page:   z.coerce.number().min(1).default(1),
      limit:  z.coerce.number().min(1).max(200).default(50),
      status: z.string().optional(),
    }).parse(request.query);

    const where: Record<string, unknown> = { eventId: id };
    if (q.status) where['status'] = q.status;

    const [total, participations] = await Promise.all([
      app.prisma.eventParticipation.count({ where }),
      app.prisma.eventParticipation.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { registeredAt: 'asc' },
        include: {
          tnaResponse:  { select: { compositeScore: true, recommendedTrack: true } },
          certificate:  { select: { status: true, issuedAt: true } },
          _count:       { select: { attendanceRecords: true } },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: participations,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    });
  });

  // GET /events/:id/participants/export — CSV download (organizer only)
  app.get('/:id/participants/export', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id }, select: { id: true, organizerId: true, title: true } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can export participants.');
    }

    const participations = await app.prisma.eventParticipation.findMany({
      where: { eventId: id },
      orderBy: { registeredAt: 'asc' },
      include: {
        tnaResponse:  { select: { compositeScore: true, recommendedTrack: true } },
        certificate:  { select: { status: true } },
        _count:       { select: { attendanceRecords: true } },
      },
    });

    const header = ['Name', 'Email', 'Status', 'Registered At', 'TNA Score', 'TNA Track', 'Sessions Attended', 'Certificate'].join(',');
    const rows = participations.map((p: any) => [
      `"${p.participantName ?? ''}"`,
      `"${p.participantEmail ?? ''}"`,
      p.status,
      new Date(p.registeredAt).toISOString(),
      p.tnaResponse?.compositeScore != null ? Number(p.tnaResponse.compositeScore).toFixed(2) : '',
      p.tnaResponse?.recommendedTrack ?? '',
      p._count.attendanceRecords,
      p.certificate?.status ?? 'NONE',
    ].join(','));

    const csv = [header, ...rows].join('\n');
    const filename = `participants-${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(csv);
  });

  // GET /events/:id/report — comprehensive event report (organizer)
  app.get('/:id/report', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can view event reports.');
    }

    const event = await app.prisma.event.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { participations: true, sessions: true } },
      },
    });
    if (!event) throw new NotFoundError('Event not found');

    // Get participation breakdown
    const [
      participationStats,
      attendanceBySession,
      certificates,
      csfResponses,
      csfAggregates,
      checklistProgress,
    ] = await Promise.all([
      app.prisma.eventParticipation.groupBy({
        by: ['status'],
        where: { eventId: id },
        _count: true,
      }),
      Promise.all(
        event.sessions.map(async (session) => {
          const count = await app.prisma.attendanceRecord.count({ where: { sessionId: session.id } });
          return { sessionId: session.id, sessionTitle: session.title, attendanceCount: count };
        }),
      ),
      app.prisma.certificate.groupBy({
        by: ['status'],
        where: { eventId: id },
        _count: true,
      }),
      app.prisma.csfSurveyResponse.findMany({
        where: { eventId: id, status: 'SUBMITTED' },
        select: {
          overallRating: true,
          contentRating: true,
          facilitatorRating: true,
          logisticsRating: true,
          highlightsFeedback: true,
          improvementsFeedback: true,
        },
      }),
      app.prisma.csfSurveyResponse.aggregate({
        where: { eventId: id, status: 'SUBMITTED' },
        _avg: {
          overallRating: true,
          contentRating: true,
          facilitatorRating: true,
          logisticsRating: true,
        },
        _count: true,
      }),
      app.prisma.checklistItem.findMany({
        where: { checklist: { eventId: id } },
        select: { status: true, phase: true },
      }),
    ]);

    // Participation breakdown
    const participationBreakdown = Object.fromEntries(
      participationStats.map((s) => [s.status, s._count]),
    );
    const totalParticipants = participationStats.reduce((s, p) => s + p._count, 0);
    const attended = (participationBreakdown['ATTENDED'] ?? 0) + (participationBreakdown['COMPLETED'] ?? 0);

    // Certificate breakdown
    const certBreakdown = Object.fromEntries(
      certificates.map((c) => [c.status, c._count]),
    );

    // Checklist progress
    const checklistTotal = checklistProgress.length;
    const checklistCompleted = checklistProgress.filter(i => i.status === 'COMPLETED').length;
    const checklistByPhase: Record<string, { total: number; completed: number }> = {};
    for (const item of checklistProgress) {
      if (!checklistByPhase[item.phase]) checklistByPhase[item.phase] = { total: 0, completed: 0 };
      checklistByPhase[item.phase].total++;
      if (item.status === 'COMPLETED') checklistByPhase[item.phase].completed++;
    }

    return reply.send({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue,
          deliveryMode: event.deliveryMode,
          targetSector: event.targetSector,
          targetRegion: event.targetRegion,
          maxParticipants: event.maxParticipants,
          totalSessions: event._count.sessions,
        },
        participation: {
          total: totalParticipants,
          attended,
          attendanceRate: totalParticipants > 0 ? Math.round((attended / totalParticipants) * 100) : 0,
          breakdown: participationBreakdown,
        },
        attendance: {
          bySessions: attendanceBySession,
        },
        certificates: {
          breakdown: certBreakdown,
          totalIssued: certBreakdown['ISSUED'] ?? 0,
        },
        csf: {
          totalResponses: csfAggregates._count,
          averages: csfAggregates._avg,
          feedback: {
            highlights: csfResponses.filter(r => r.highlightsFeedback).map(r => r.highlightsFeedback),
            improvements: csfResponses.filter(r => r.improvementsFeedback).map(r => r.improvementsFeedback),
          },
        },
        checklist: {
          total: checklistTotal,
          completed: checklistCompleted,
          completionPct: checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0,
          byPhase: checklistByPhase,
        },
      },
    });
  });

  // GET /events/reports/my-summary — organizer's aggregate event metrics
  app.get('/reports/my-summary', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access reports.');
    }

    const where: Record<string, unknown> = {};
    // EVENT_ORGANIZER only sees their own events; PROGRAM_MANAGER and admins see all
    if (userRole === 'EVENT_ORGANIZER') {
      where['organizerId'] = request.user.sub;
    }

    const [
      totalEvents,
      statusCounts,
      totalParticipations,
      attendedParticipations,
      totalCerts,
      issuedCerts,
      totalCsf,
      submittedCsf,
      avgCsf,
    ] = await Promise.all([
      app.prisma.event.count({ where }),
      app.prisma.event.groupBy({ by: ['status'], where, _count: true }),
      app.prisma.eventParticipation.count({ where: { event: where } }),
      app.prisma.eventParticipation.count({ where: { event: where, status: { in: ['ATTENDED', 'COMPLETED'] } } }),
      app.prisma.certificate.count({ where: { participation: { event: where } } }),
      app.prisma.certificate.count({ where: { participation: { event: where }, status: 'ISSUED' } }),
      app.prisma.csfSurveyResponse.count({ where: { participation: { event: where } } }),
      app.prisma.csfSurveyResponse.count({ where: { participation: { event: where }, status: 'SUBMITTED' } }),
      app.prisma.csfSurveyResponse.aggregate({
        where: { participation: { event: where }, status: 'SUBMITTED' },
        _avg: { overallRating: true, contentRating: true, facilitatorRating: true, logisticsRating: true },
      }),
    ]);

    // Recent events
    const recentEvents = await app.prisma.event.findMany({
      where: { ...where, status: 'COMPLETED' },
      orderBy: { endDate: 'desc' },
      take: 10,
      select: {
        id: true, title: true, startDate: true, endDate: true, status: true,
        targetSector: true,
        _count: { select: { participations: true } },
      },
    });

    // Get per-event attendance and CSF for recent events
    const recentEventReports = await Promise.all(
      recentEvents.map(async (evt) => {
        const [attended, csfCount] = await Promise.all([
          app.prisma.eventParticipation.count({ where: { eventId: evt.id, status: { in: ['ATTENDED', 'COMPLETED'] } } }),
          app.prisma.csfSurveyResponse.count({ where: { eventId: evt.id, status: 'SUBMITTED' } }),
        ]);
        return {
          ...evt,
          attended,
          attendanceRate: evt._count.participations > 0 ? Math.round((attended / evt._count.participations) * 100) : 0,
          csfSubmitted: csfCount,
        };
      }),
    );

    return reply.send({
      success: true,
      data: {
        summary: {
          totalEvents,
          byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s._count])),
          totalParticipations,
          attendedParticipations,
          overallAttendanceRate: totalParticipations > 0 ? Math.round((attendedParticipations / totalParticipations) * 100) : 0,
          totalCertificates: totalCerts,
          issuedCertificates: issuedCerts,
          csfResponseRate: totalCsf > 0 ? Math.round((submittedCsf / totalCsf) * 100) : 0,
          avgCsfScores: avgCsf._avg,
        },
        recentEvents: recentEventReports,
      },
    });
  });
};
