import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ConflictError, ErrorCode } from '@dti-ems/shared-errors';
import { notifyBulkCsfInvite } from '../lib/notify.js';

const ORGANIZER_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
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
  // Proposal fields (can be set during creation)
  trainingType:        z.enum(['BUSINESS', 'MANAGERIAL', 'ORGANIZATIONAL', 'ENTREPRENEURIAL', 'INTER_AGENCY']).optional().nullable(),
  partnerInstitution:  z.string().max(500).optional().nullable(),
  background:          z.string().max(10000).optional().nullable(),
  objectives:          z.string().max(10000).optional().nullable(),
  learningOutcomes:    z.string().max(10000).optional().nullable(),
  methodology:         z.string().max(10000).optional().nullable(),
  monitoringPlan:      z.string().max(10000).optional().nullable(),
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

  // GET /events/mine — role-scoped:
  //   PROGRAM_MANAGER   → events they created (organizerId)
  //   EVENT_ORGANIZER   → events assigned to them (assignedOrganizerId)
  //   DIVISION_CHIEF    → proposals in SUBMITTED status (queued for review)
  //   REGIONAL_DIRECTOR → proposals in UNDER_REVIEW status (queued for approval)
  //   SYSTEM_ADMIN / SUPER_ADMIN → all events
  app.get('/mine', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access this endpoint.');
    }

    const q = z.object({
      page:           z.coerce.number().min(1).default(1),
      limit:          z.coerce.number().min(1).max(100).default(50),
      status:         z.string().optional(),
      proposalStatus: z.string().optional(),
      view:           z.enum(['proposals', 'events']).optional(),
    }).parse(request.query);

    const where: Record<string, unknown> = {};
    if (q.status) where['status'] = q.status;
    if (q.proposalStatus) where['proposalStatus'] = q.proposalStatus;

    // View filter: "proposals" = all proposal items regardless of approval status, "events" = approved/active items
    if (q.view === 'proposals') {
      where['proposalStatus'] = { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] };
    } else if (q.view === 'events') {
      where['proposalStatus'] = 'APPROVED';
      // Only show events that have been activated (not still in DRAFT status)
      where['status'] = { not: 'DRAFT' };
    }

    // Scope by role
    if (userRole === 'EVENT_ORGANIZER') {
      where['assignedOrganizerId'] = request.user.sub;
      // Facilitators only see events that have been activated (not DRAFT)
      where['status'] = { not: 'DRAFT' };
    } else if (userRole === 'PROGRAM_MANAGER') {
      where['organizerId'] = request.user.sub;
    } else if (userRole === 'DIVISION_CHIEF') {
      // Division Chief sees proposals submitted for review
      where['proposalStatus'] = { in: ['SUBMITTED', 'UNDER_REVIEW'] };
    } else if (userRole === 'REGIONAL_DIRECTOR' || userRole === 'PROVINCIAL_DIRECTOR') {
      // Regional Director sees proposals under review awaiting final decision
      where['proposalStatus'] = { in: ['UNDER_REVIEW', 'APPROVED'] };
    }
    // SYSTEM_ADMIN / SUPER_ADMIN see all — no extra filter

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

  // POST /events — program managers and admins only (not EVENT_ORGANIZER)
  app.post('/', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    const PM_ADMIN_ROLES = ['PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
    if (!PM_ADMIN_ROLES.includes(userRole as typeof PM_ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only Program Managers or admins can create proposals/events.');
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

  // PATCH /events/:id/sessions/:sessionId — update session details
  app.patch('/:id/sessions/:sessionId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, sessionId } = z.object({ id: z.string(), sessionId: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can update sessions.');
    }

    const session = await app.prisma.eventSession.findUnique({ where: { id: sessionId } });
    if (!session || session.eventId !== id) throw new NotFoundError('Session not found for this event.');

    const body = z.object({
      title:       z.string().min(1).max(300).optional(),
      startTime:   z.string().datetime().optional(),
      endTime:     z.string().datetime().optional(),
      venue:       z.string().max(500).optional().nullable(),
      speakerName: z.string().max(200).optional().nullable(),
      orderIndex:  z.number().int().min(0).optional(),
    }).parse(request.body);

    const updated = await app.prisma.eventSession.update({
      where: { id: sessionId },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime:   body.endTime   ? new Date(body.endTime)   : undefined,
      },
    });

    return reply.send({ success: true, data: updated });
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
          certificate:  { select: { status: true, issuedAt: true, verificationCode: true } },
          csfSurveyResponse: { select: { status: true, submittedAt: true } },
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

  // GET /events/:id/participants/attendance-sheet — participants with demographics for FM-CT-2A
  app.get('/:id/participants/attendance-sheet', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const isOrganizer = ORGANIZER_ROLES.includes(request.user.role as OrganizerRole);
    if (!isOrganizer) {
      throw new ForbiddenError('Only organizers or admins can view attendance sheet.');
    }

    const participations = await app.prisma.eventParticipation.findMany({
      where: { eventId: id },
      orderBy: { registeredAt: 'asc' },
      select: {
        id: true,
        userId: true,
        participantName: true,
        participantEmail: true,
        status: true,
        enterpriseName: true,
      },
    });

    if (participations.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    // Cross-schema query for demographics
    const userIds = participations.map(p => p.userId);
    const placeholders = userIds.map((_: string, i: number) => `$${i + 1}`).join(',');

    const profiles: Array<{
      id: string;
      sex: string | null;
      age_bracket: string | null;
      employment_category: string | null;
      social_classification: string | null;
      mobile_number: string | null;
      region: string | null;
      province: string | null;
      city_municipality: string | null;
      client_type: string | null;
    }> = await app.prisma.$queryRawUnsafe(
      `SELECT id, sex, age_bracket, employment_category, social_classification,
              mobile_number, region, province, city_municipality, client_type
       FROM identity_schema.user_profiles
       WHERE id IN (${placeholders})`,
      ...userIds,
    );

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    const enriched = participations.map(p => {
      const profile = profileMap.get(p.userId);
      return {
        ...p,
        participantSex: profile?.sex ?? null,
        participantAgeBracket: profile?.age_bracket ?? null,
        participantEmployment: profile?.employment_category ?? null,
        participantSocial: profile?.social_classification ?? null,
        participantMobile: profile?.mobile_number ?? null,
        participantAddress: [profile?.city_municipality, profile?.province].filter(Boolean).join(', ') || null,
        participantCompany: p.enterpriseName ?? null,
        participantClientType: profile?.client_type ?? null,
      };
    });

    return reply.send({ success: true, data: enriched });
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
          sqd0OverallRating: true,
          sqd1Responsiveness: true,
          sqd2Reliability: true,
          sqd3AccessFacilities: true,
          sqd4Communication: true,
          sqd5Costs: true,
          sqd6Integrity: true,
          sqd7Assurance: true,
          sqd8Outcome: true,
          highlightsFeedback: true,
          improvementsFeedback: true,
        },
      }),
      app.prisma.csfSurveyResponse.aggregate({
        where: { eventId: id, status: 'SUBMITTED' },
        _avg: {
          sqd0OverallRating: true,
          sqd1Responsiveness: true,
          sqd2Reliability: true,
          sqd3AccessFacilities: true,
          sqd4Communication: true,
          sqd5Costs: true,
          sqd6Integrity: true,
          sqd7Assurance: true,
          sqd8Outcome: true,
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
            highlights: [...new Set(csfResponses.filter(r => r.highlightsFeedback).map(r => r.highlightsFeedback))],
            improvements: [...new Set(csfResponses.filter(r => r.improvementsFeedback).map(r => r.improvementsFeedback))],
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
        _avg: { sqd0OverallRating: true, sqd1Responsiveness: true, sqd2Reliability: true, sqd3AccessFacilities: true, sqd4Communication: true, sqd5Costs: true, sqd6Integrity: true, sqd7Assurance: true, sqd8Outcome: true },
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

  // ── Speaker Management ────────────────────────────────────────────────────

  // GET /events/:id/speakers
  app.get('/:id/speakers', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const speakers = await app.prisma.trainingSpeaker.findMany({
      where: { eventId: id },
      orderBy: { displayOrder: 'asc' },
    });
    return reply.send({ success: true, data: speakers });
  });

  // POST /events/:id/speakers
  app.post('/:id/speakers', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can add speakers.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      name:         z.string().min(1).max(200),
      organization: z.string().max(300).optional().nullable(),
      topic:        z.string().max(500).optional().nullable(),
      displayOrder: z.number().int().min(0).default(0),
    }).parse(request.body);

    const speaker = await app.prisma.trainingSpeaker.create({
      data: { ...body, eventId: id },
    });
    return reply.code(201).send({ success: true, data: speaker });
  });

  // DELETE /events/:id/speakers/:speakerId
  app.delete('/:id/speakers/:speakerId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, speakerId } = z.object({ id: z.string(), speakerId: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can remove speakers.');
    }
    const speaker = await app.prisma.trainingSpeaker.findFirst({ where: { id: speakerId, eventId: id } });
    if (!speaker) throw new NotFoundError('Speaker not found');

    await app.prisma.trainingSpeaker.delete({ where: { id: speakerId } });
    return reply.send({ success: true, message: 'Speaker removed.' });
  });

  // ── Post-Activity Report (PAR) ────────────────────────────────────────────

  // GET /events/:id/par
  app.get('/:id/par', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view PAR.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const par = await app.prisma.postActivityReport.findUnique({
      where: { eventId: id },
      include: { beneficiaryGroups: true },
    });

    if (!par) return reply.send({ success: true, data: null });

    // Resolve signatory names from identity schema
    const userIds = [par.preparedById, par.reviewedById, par.approvedById].filter(Boolean) as string[];
    const nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const profiles: Array<{ id: string; first_name: string; last_name: string }> = await app.prisma.$queryRawUnsafe(
        `SELECT id, first_name, last_name FROM identity_schema.user_profiles WHERE id IN (${userIds.map((_: string, i: number) => `$${i + 1}`).join(',')})`,
        ...userIds,
      );
      for (const p of profiles) nameMap[p.id] = `${p.first_name} ${p.last_name}`;
    }

    return reply.send({
      success: true,
      data: {
        ...par,
        preparedByName: par.preparedById ? nameMap[par.preparedById] ?? null : null,
        reviewedByName: par.reviewedById ? nameMap[par.reviewedById] ?? null : null,
        approvedByName: par.approvedById ? nameMap[par.approvedById] ?? null : null,
      },
    });
  });

  // POST /events/:id/par — create or update PAR
  app.post('/:id/par', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage PAR.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      title:                    z.string().min(1).max(500).optional(),
      dateConducted:            z.string().max(200).optional(),
      venue:                    z.string().max(500).optional(),
      highlightsOutcomes:       z.string().max(10000).optional().nullable(),
      fundUtilizationNotes:     z.string().max(10000).optional().nullable(),
      csfAssessmentObservations: z.string().max(10000).optional().nullable(),
      improvementOpportunities: z.string().max(10000).optional().nullable(),
      beneficiaryGroups: z.array(z.object({
        sectorGroup: z.string().min(1).max(200),
        maleCount:   z.number().int().min(0).default(0),
        femaleCount: z.number().int().min(0).default(0),
        seniorCitizenCount: z.number().int().min(0).default(0),
        pwdCount:    z.number().int().min(0).default(0),
        edtLevel:    z.string().max(100).optional().nullable(),
        actualCount: z.number().int().min(0).default(0),
      })).optional(),
    }).parse(request.body);

    const { beneficiaryGroups, ...parData } = body;

    const existing = await app.prisma.postActivityReport.findUnique({ where: { eventId: id } });

    if (existing) {
      // Update
      const updated = await app.prisma.postActivityReport.update({
        where: { eventId: id },
        data: {
          ...parData,
          preparedById: request.user.sub,
          datePrepared: new Date(),
        },
      });

      if (beneficiaryGroups !== undefined) {
        await app.prisma.pARBeneficiaryGroup.deleteMany({ where: { reportId: updated.id } });
        if (beneficiaryGroups.length > 0) {
          await app.prisma.pARBeneficiaryGroup.createMany({
            data: beneficiaryGroups.map(g => ({ ...g, reportId: updated.id })),
          });
        }
      }

      const result = await app.prisma.postActivityReport.findUnique({
        where: { id: updated.id },
        include: { beneficiaryGroups: true },
      });
      return reply.send({ success: true, data: result });
    }

    // Create
    const startStr = event.startDate.toISOString().split('T')[0];
    const endStr = event.endDate.toISOString().split('T')[0];
    const par = await app.prisma.postActivityReport.create({
      data: {
        eventId: id,
        title: parData.title ?? event.title,
        dateConducted: parData.dateConducted ?? `${startStr} to ${endStr}`,
        venue: parData.venue ?? event.venue ?? 'TBD',
        highlightsOutcomes: parData.highlightsOutcomes ?? null,
        fundUtilizationNotes: parData.fundUtilizationNotes ?? null,
        csfAssessmentObservations: parData.csfAssessmentObservations ?? null,
        improvementOpportunities: parData.improvementOpportunities ?? null,
        preparedById: request.user.sub,
        datePrepared: new Date(),
        beneficiaryGroups: beneficiaryGroups && beneficiaryGroups.length > 0 ? {
          create: beneficiaryGroups,
        } : undefined,
      },
      include: { beneficiaryGroups: true },
    });

    return reply.code(201).send({ success: true, data: par });
  });

  // GET /events/:id/par/demographics — auto-generate beneficiary demographics from participant profiles
  app.get('/:id/par/demographics', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view demographics.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    // Get user IDs of participants (attended, completed, confirmed, registered)
    const participations = await app.prisma.eventParticipation.findMany({
      where: { eventId: id, status: { in: ['ATTENDED', 'COMPLETED', 'RSVP_CONFIRMED', 'REGISTERED'] } },
      select: { userId: true },
    });

    if (participations.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    const userIds = participations.map(p => p.userId);
    const placeholders = userIds.map((_: string, i: number) => `$${i + 1}`).join(',');

    // Cross-schema query for demographics grouped by industry
    const rows: Array<{
      industry_classification: string | null;
      sex: string | null;
      social_classification: string | null;
      age_bracket: string | null;
    }> = await app.prisma.$queryRawUnsafe(
      `SELECT industry_classification, sex, social_classification, age_bracket
       FROM identity_schema.user_profiles
       WHERE id IN (${placeholders})`,
      ...userIds,
    );

    // Group by industry_classification
    const industryMap = new Map<string, { male: number; female: number; senior: number; pwd: number; total: number }>();

    for (const row of rows) {
      const industry = row.industry_classification || 'Others';
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { male: 0, female: 0, senior: 0, pwd: 0, total: 0 });
      }
      const g = industryMap.get(industry)!;
      g.total++;
      if (row.sex === 'MALE') g.male++;
      if (row.sex === 'FEMALE') g.female++;
      if (row.social_classification === 'SENIOR_CITIZEN' || row.age_bracket === 'AGE_65_OR_HIGHER') g.senior++;
      if (row.social_classification === 'PWD') g.pwd++;
    }

    const groups = Array.from(industryMap.entries()).map(([sector, counts]) => ({
      sectorGroup: sector,
      maleCount: counts.male,
      femaleCount: counts.female,
      seniorCitizenCount: counts.senior,
      pwdCount: counts.pwd,
      edtLevel: '',
      actualCount: counts.total,
    }));

    return reply.send({ success: true, data: groups });
  });

  // PATCH /events/:id/par/status — transition PAR status
  app.patch('/:id/par/status', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can update PAR status.');
    }

    const body = z.object({
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED']),
    }).parse(request.body);

    const par = await app.prisma.postActivityReport.findUnique({ where: { eventId: id } });
    if (!par) throw new NotFoundError('Post-Activity Report not found');

    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === 'UNDER_REVIEW') {
      updateData['reviewedById'] = request.user.sub;
      updateData['dateReviewed'] = new Date();
    } else if (body.status === 'APPROVED') {
      updateData['approvedById'] = request.user.sub;
      updateData['dateApproved'] = new Date();
    }

    const updated = await app.prisma.postActivityReport.update({
      where: { id: par.id },
      data: updateData,
      include: { beneficiaryGroups: true },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Training Effectiveness Report / TEM (FM-CT-5, Step 7) ────────────────

  // GET /events/:id/tem
  app.get('/:id/tem', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view TEM report.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const tem = await app.prisma.trainingEffectivenessReport.findUnique({ where: { eventId: id } });
    if (!tem) return reply.send({ success: true, data: null });

    const userIds = [tem.preparedById, tem.reviewedById, tem.approvedById, tem.submittedToMaaById].filter(Boolean) as string[];
    const nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const profiles: Array<{ id: string; first_name: string; last_name: string }> = await app.prisma.$queryRawUnsafe(
        `SELECT id, first_name, last_name FROM identity_schema.user_profiles WHERE id IN (${userIds.map((_: string, i: number) => `$${i + 1}`).join(',')})`,
        ...userIds,
      );
      for (const p of profiles) nameMap[p.id] = `${p.first_name} ${p.last_name}`;
    }

    return reply.send({
      success: true,
      data: {
        ...tem,
        preparedByName:       tem.preparedById       ? nameMap[tem.preparedById]       ?? null : null,
        reviewedByName:       tem.reviewedById       ? nameMap[tem.reviewedById]       ?? null : null,
        approvedByName:       tem.approvedById       ? nameMap[tem.approvedById]       ?? null : null,
        submittedToMaaByName: tem.submittedToMaaById ? nameMap[tem.submittedToMaaById] ?? null : null,
      },
    });
  });

  // POST /events/:id/tem — create or update TEM report
  app.post('/:id/tem', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage TEM report.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      observations: z.string().max(10000).optional().nullable(),
    }).parse(request.body);

    const existing = await app.prisma.trainingEffectivenessReport.findUnique({ where: { eventId: id } });
    if (existing) {
      const updated = await app.prisma.trainingEffectivenessReport.update({
        where: { id: existing.id },
        data: { ...body, preparedById: request.user.sub, datePrepared: new Date() },
      });
      return reply.send({ success: true, data: updated });
    }

    const created = await app.prisma.trainingEffectivenessReport.create({
      data: {
        eventId: id,
        observations: body.observations ?? null,
        preparedById: request.user.sub,
        datePrepared: new Date(),
      },
    });
    return reply.code(201).send({ success: true, data: created });
  });

  // PATCH /events/:id/tem/status — transition TEM report status
  app.patch('/:id/tem/status', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can update TEM status.');
    }

    const body = z.object({
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SUBMITTED_TO_MAA']),
    }).parse(request.body);

    const tem = await app.prisma.trainingEffectivenessReport.findUnique({ where: { eventId: id } });
    if (!tem) throw new NotFoundError('Training Effectiveness Report not found. Save the report first.');

    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === 'UNDER_REVIEW') {
      updateData['reviewedById'] = request.user.sub;
      updateData['dateReviewed'] = new Date();
    } else if (body.status === 'APPROVED') {
      updateData['approvedById'] = request.user.sub;
      updateData['dateApproved'] = new Date();
    } else if (body.status === 'SUBMITTED_TO_MAA') {
      updateData['submittedToMaaById'] = request.user.sub;
      updateData['dateSubmittedToMaa'] = new Date();
    }

    const updated = await app.prisma.trainingEffectivenessReport.update({
      where: { id: tem.id },
      data: updateData,
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Proposal Workflow (FM-CT-4) ───────────────────────────────────────────

  // GET /events/:id/proposal — get proposal data (event + budget + risks + targets)
  app.get('/:id/proposal', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view proposals.');
    }

    const event = await app.prisma.event.findUnique({
      where: { id },
      include: {
        budgetItems:  { orderBy: { orderIndex: 'asc' } },
        riskItems:    { orderBy: { orderIndex: 'asc' } },
        targetGroups: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!event) throw new NotFoundError('Event not found');

    return reply.send({
      success: true,
      data: {
        trainingType: event.trainingType,
        partnerInstitution: event.partnerInstitution,
        background: event.background,
        objectives: event.objectives,
        learningOutcomes: event.learningOutcomes,
        methodology: event.methodology,
        monitoringPlan: event.monitoringPlan,
        proposalStatus: event.proposalStatus,
        proposalSubmittedAt: event.proposalSubmittedAt,
        proposalReviewedAt: event.proposalReviewedAt,
        proposalApprovedAt: event.proposalApprovedAt,
        proposalRejectionNote: event.proposalRejectionNote,
        assignedOrganizerId: event.assignedOrganizerId,
        budgetItems: event.budgetItems,
        riskItems: event.riskItems,
        targetGroups: event.targetGroups,
      },
    });
  });

  // PATCH /events/:id/proposal — save proposal fields
  app.patch('/:id/proposal', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can edit proposals.');
    }

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (event.proposalStatus === 'APPROVED') {
      throw new BadRequestError('Cannot edit an approved proposal.', ErrorCode.VALIDATION_ERROR);
    }

    const body = z.object({
      trainingType:       z.enum(['BUSINESS', 'MANAGERIAL', 'ORGANIZATIONAL', 'ENTREPRENEURIAL', 'INTER_AGENCY']).optional().nullable(),
      partnerInstitution: z.string().max(500).optional().nullable(),
      background:         z.string().max(10000).optional().nullable(),
      objectives:         z.string().max(10000).optional().nullable(),
      learningOutcomes:   z.string().max(10000).optional().nullable(),
      methodology:        z.string().max(10000).optional().nullable(),
      monitoringPlan:     z.string().max(10000).optional().nullable(),
    }).parse(request.body);

    const updated = await app.prisma.event.update({
      where: { id },
      data: body,
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /events/:id/submit-proposal — submit for review
  app.post('/:id/submit-proposal', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can submit proposals.');
    }

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (!['DRAFT', 'REJECTED'].includes(event.proposalStatus)) {
      throw new BadRequestError(`Cannot submit proposal in ${event.proposalStatus} status.`, ErrorCode.VALIDATION_ERROR);
    }

    const updated = await app.prisma.event.update({
      where: { id },
      data: { proposalStatus: 'SUBMITTED', proposalSubmittedAt: new Date(), proposalRejectionNote: null },
    });

    return reply.send({ success: true, data: updated, message: 'Proposal submitted for review.' });
  });

  // PATCH /events/:id/review-proposal — Technical Divisions Chief marks UNDER_REVIEW
  app.patch('/:id/review-proposal', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const role = request.user.role;
    if (!['DIVISION_CHIEF', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only the Technical Divisions Chief can mark proposals under review.');
    }

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (event.proposalStatus !== 'SUBMITTED') {
      throw new BadRequestError('Proposal must be in SUBMITTED status to review.', ErrorCode.VALIDATION_ERROR);
    }

    const updated = await app.prisma.event.update({
      where: { id },
      data: { proposalStatus: 'UNDER_REVIEW', proposalReviewedById: request.user.sub, proposalReviewedAt: new Date() },
    });

    return reply.send({ success: true, data: updated, message: 'Proposal is now under review.' });
  });

  // PATCH /events/:id/approve-proposal — PD/RD gives final approval or rejection
  app.patch('/:id/approve-proposal', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const role = request.user.role;
    if (!['REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only the Provincial/Regional Director can approve or reject proposals.');
    }

    const body = z.object({
      action: z.enum(['APPROVE', 'REJECT']),
      rejectionNote: z.string().max(5000).optional().nullable(),
    }).parse(request.body);

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(event.proposalStatus)) {
      throw new BadRequestError('Proposal must be in SUBMITTED or UNDER_REVIEW status.', ErrorCode.VALIDATION_ERROR);
    }

    if (body.action === 'APPROVE') {
      const updated = await app.prisma.event.update({
        where: { id },
        data: { proposalStatus: 'APPROVED', proposalApprovedById: request.user.sub, proposalApprovedAt: new Date() },
      });
      return reply.send({ success: true, data: updated, message: 'Proposal approved.' });
    } else {
      const updated = await app.prisma.event.update({
        where: { id },
        data: { proposalStatus: 'REJECTED', proposalRejectionNote: body.rejectionNote ?? 'Proposal rejected.' },
      });
      return reply.send({ success: true, data: updated, message: 'Proposal rejected.' });
    }
  });

  // POST /events/:id/assign-organizer — PM/Admin assigns EVENT_ORGANIZER as facilitator after approval
  app.post('/:id/assign-organizer', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const role = request.user.role;
    if (!['PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only Technical Staff can assign a facilitator.');
    }

    const { organizerId, organizerName } = z.object({ organizerId: z.string().min(1), organizerName: z.string().optional() }).parse(request.body);

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (event.proposalStatus !== 'APPROVED') {
      throw new BadRequestError('Proposal must be APPROVED before assigning a facilitator.', ErrorCode.VALIDATION_ERROR);
    }

    const updated = await app.prisma.event.update({
      where: { id },
      data: { assignedOrganizerId: organizerId, assignedOrganizerName: organizerName ?? null },
    });

    return reply.send({ success: true, data: updated, message: 'Facilitator assigned.' });
  });

  // POST /events/:id/activate — Step 3: Technical Staff activates event after proposal approval
  // Transitions DRAFT → PUBLISHED + auto-seeds DTI Training Monitoring Checklist
  app.post('/:id/activate', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const role = request.user.role;
    if (!['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only Technical Staff or admins can activate an event.');
    }

    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');
    if (event.proposalStatus !== 'APPROVED') {
      throw new BadRequestError('Proposal must be APPROVED before activating the event.', ErrorCode.VALIDATION_ERROR);
    }
    if (event.status !== 'DRAFT') {
      throw new BadRequestError('Event is already active.', ErrorCode.VALIDATION_ERROR);
    }

    // Transition event to PUBLISHED
    const updated = await app.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    // Auto-seed DTI Training Monitoring Checklist if none exists
    const existingChecklists = await app.prisma.eventChecklist.count({ where: { eventId: id } });
    if (existingChecklists === 0) {
      const DEFAULT_ITEMS = [
        { title: 'Conduct Training Needs Analysis (TNA)', phase: 'PLANNING', priority: 'CRITICAL', orderIndex: 0 },
        { title: 'Prepare Training Proposal (FM-CT-4)', phase: 'PLANNING', priority: 'CRITICAL', orderIndex: 1 },
        { title: 'Secure approval of Training Proposal', phase: 'PLANNING', priority: 'CRITICAL', orderIndex: 2 },
        { title: 'Identify and confirm resource persons/speakers', phase: 'PLANNING', priority: 'HIGH', orderIndex: 3 },
        { title: 'Prepare and send invitation letters', phase: 'PLANNING', priority: 'HIGH', orderIndex: 4 },
        { title: 'Prepare training design/program of activities', phase: 'PLANNING', priority: 'HIGH', orderIndex: 5 },
        { title: 'Prepare training materials and handouts', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 6 },
        { title: 'Prepare and reproduce evaluation forms (FM-CSF-ACT)', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 7 },
        { title: 'Prepare attendance sheet (FM-CT-2A)', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 8 },
        { title: 'Coordinate logistics (venue, meals, equipment)', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 9 },
        { title: 'Coordinate with training partners / requesting institution', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 10 },
        { title: 'Conduct promotional activities (press release, caravan)', phase: 'PREPARATION', priority: 'MEDIUM', orderIndex: 11 },
        { title: 'Prepare certificates of participation/completion', phase: 'PREPARATION', priority: 'MEDIUM', orderIndex: 12 },
        { title: 'Review Training Monitoring Checklist (FM-CT-7)', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 13 },
        { title: 'Registration of participants on-site', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 14 },
        { title: 'Opening program and orientation', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 15 },
        { title: 'Conduct sessions as per agenda', phase: 'EXECUTION', priority: 'CRITICAL', orderIndex: 16 },
        { title: 'Monitor training module and program flow', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 17 },
        { title: 'Distribute and collect CSF forms (FM-CSF-ACT)', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 18 },
        { title: 'Document proceedings (photos, videos, minutes)', phase: 'EXECUTION', priority: 'MEDIUM', orderIndex: 19 },
        { title: 'Closing program', phase: 'EXECUTION', priority: 'MEDIUM', orderIndex: 20 },
        { title: 'Consolidate attendance and registration records', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 21 },
        { title: 'Prepare Post-Activity Report (FM-CT-5)', phase: 'POST_EVENT', priority: 'CRITICAL', orderIndex: 22 },
        { title: 'Tabulate CSF Summary and Analysis', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 23 },
        { title: 'Submit report to DTI Regional Office / MSMED Dev Division', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 24 },
        { title: 'Provide feedback/technical support (follow-up mentoring)', phase: 'POST_EVENT', priority: 'MEDIUM', orderIndex: 25 },
        { title: 'Issue certificates to participants', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 26 },
        { title: 'File/archive training documents', phase: 'POST_EVENT', priority: 'MEDIUM', orderIndex: 27 },
      ];
      const checklist = await app.prisma.eventChecklist.create({
        data: {
          eventId:   id,
          title:     'DTI Training Monitoring Checklist (FM-CT-7)',
          description: 'Standard DTI QMS checklist for Conduct of Training procedure.',
          createdBy: request.user.sub,
        },
      });
      await app.prisma.checklistItem.createMany({
        data: DEFAULT_ITEMS.map(item => ({
          checklistId: checklist.id,
          title:       item.title,
          phase:       item.phase as any,
          priority:    item.priority as any,
          orderIndex:  item.orderIndex,
          status:      'NOT_STARTED' as any,
        })),
      });
    }

    return reply.send({ success: true, data: updated, message: 'Event activated. DTI Training Monitoring Checklist created.' });
  });

  // ── Budget Items CRUD ─────────────────────────────────────────────────────

  // GET /events/:id/budget
  app.get('/:id/budget', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view budget.');
    }

    const items = await app.prisma.trainingBudgetItem.findMany({
      where: { eventId: id },
      orderBy: { orderIndex: 'asc' },
    });
    return reply.send({ success: true, data: items });
  });

  // POST /events/:id/budget — add budget item
  app.post('/:id/budget', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage budget.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      item:            z.string().min(1).max(500),
      unitCost:        z.number().min(0),
      quantity:        z.number().int().min(1).default(1),
      estimatedAmount: z.number().min(0),
      sourceOfFunds:   z.string().max(300).optional().nullable(),
      actualSpent:     z.number().min(0).optional().nullable(),
      orderIndex:      z.number().int().min(0).default(0),
    }).parse(request.body);

    const budgetItem = await app.prisma.trainingBudgetItem.create({
      data: { ...body, eventId: id },
    });
    return reply.code(201).send({ success: true, data: budgetItem });
  });

  // PATCH /events/:id/budget/:itemId
  app.patch('/:id/budget/:itemId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage budget.');
    }

    const existing = await app.prisma.trainingBudgetItem.findFirst({ where: { id: itemId, eventId: id } });
    if (!existing) throw new NotFoundError('Budget item not found');

    const body = z.object({
      item:            z.string().min(1).max(500).optional(),
      unitCost:        z.number().min(0).optional(),
      quantity:        z.number().int().min(1).optional(),
      estimatedAmount: z.number().min(0).optional(),
      sourceOfFunds:   z.string().max(300).optional().nullable(),
      actualSpent:     z.number().min(0).optional().nullable(),
      orderIndex:      z.number().int().min(0).optional(),
    }).parse(request.body);

    const updated = await app.prisma.trainingBudgetItem.update({ where: { id: itemId }, data: body });
    return reply.send({ success: true, data: updated });
  });

  // DELETE /events/:id/budget/:itemId
  app.delete('/:id/budget/:itemId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage budget.');
    }
    const existing = await app.prisma.trainingBudgetItem.findFirst({ where: { id: itemId, eventId: id } });
    if (!existing) throw new NotFoundError('Budget item not found');

    await app.prisma.trainingBudgetItem.delete({ where: { id: itemId } });
    return reply.send({ success: true, message: 'Budget item deleted.' });
  });

  // ── Risk Items CRUD ───────────────────────────────────────────────────────

  // GET /events/:id/risks
  app.get('/:id/risks', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view risks.');
    }

    const items = await app.prisma.trainingRiskItem.findMany({
      where: { eventId: id },
      orderBy: { orderIndex: 'asc' },
    });
    return reply.send({ success: true, data: items });
  });

  // POST /events/:id/risks
  app.post('/:id/risks', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage risks.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      riskDescription:   z.string().min(1).max(5000),
      actionPlan:        z.string().max(5000).optional().nullable(),
      actionDate:        z.string().datetime().optional().nullable(),
      responsiblePerson: z.string().max(200).optional().nullable(),
      effectiveness:     z.string().max(5000).optional().nullable(),
      orderIndex:        z.number().int().min(0).default(0),
    }).parse(request.body);

    const riskItem = await app.prisma.trainingRiskItem.create({
      data: {
        ...body,
        actionDate: body.actionDate ? new Date(body.actionDate) : null,
        eventId: id,
      },
    });
    return reply.code(201).send({ success: true, data: riskItem });
  });

  // DELETE /events/:id/risks/:riskId
  app.delete('/:id/risks/:riskId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, riskId } = z.object({ id: z.string(), riskId: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage risks.');
    }
    const existing = await app.prisma.trainingRiskItem.findFirst({ where: { id: riskId, eventId: id } });
    if (!existing) throw new NotFoundError('Risk item not found');

    await app.prisma.trainingRiskItem.delete({ where: { id: riskId } });
    return reply.send({ success: true, message: 'Risk item deleted.' });
  });

  // ── Target Groups CRUD ────────────────────────────────────────────────────

  // GET /events/:id/target-groups
  app.get('/:id/target-groups', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can view target groups.');
    }

    const items = await app.prisma.trainingTargetGroup.findMany({
      where: { eventId: id },
      orderBy: { orderIndex: 'asc' },
    });
    return reply.send({ success: true, data: items });
  });

  // POST /events/:id/target-groups
  app.post('/:id/target-groups', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage target groups.');
    }
    const event = await app.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const body = z.object({
      edtLevel:              z.string().max(100).optional().nullable(),
      sectorGroup:           z.string().min(1).max(300),
      estimatedParticipants: z.number().int().min(0).default(0),
      orderIndex:            z.number().int().min(0).default(0),
    }).parse(request.body);

    const group = await app.prisma.trainingTargetGroup.create({
      data: { ...body, eventId: id },
    });
    return reply.code(201).send({ success: true, data: group });
  });

  // DELETE /events/:id/target-groups/:groupId
  app.delete('/:id/target-groups/:groupId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, groupId } = z.object({ id: z.string(), groupId: z.string() }).parse(request.params);
    if (!ORGANIZER_ROLES.includes(request.user.role as OrganizerRole)) {
      throw new ForbiddenError('Only organizers/admins can manage target groups.');
    }
    const existing = await app.prisma.trainingTargetGroup.findFirst({ where: { id: groupId, eventId: id } });
    if (!existing) throw new NotFoundError('Target group not found');

    await app.prisma.trainingTargetGroup.delete({ where: { id: groupId } });
    return reply.send({ success: true, message: 'Target group deleted.' });
  });
};
