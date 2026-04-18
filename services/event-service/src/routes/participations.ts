import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import QRCode from 'qrcode';
import { ConflictError, BadRequestError, NotFoundError, ForbiddenError, ErrorCode } from '@dti-ems/shared-errors';
import { notifyRegistrationConfirmation } from '../lib/notify.js';

// ── QR Token helpers ────────────────────────────────────────────────────────
const QR_SECRET = process.env.QR_HMAC_SECRET ?? randomBytes(32).toString('hex');

/**
 * Permanent, user-unique QR token.
 * Signs userId with HMAC-SHA256 — never expires.
 */
function signPermanentQr(userId: string): string {
  const sig = createHmac('sha256', QR_SECRET).update(userId).digest('hex');
  return Buffer.from(JSON.stringify({ userId, sig })).toString('base64url');
}

function verifyPermanentQr(token: string): { userId: string } {
  let parsed: { userId: string; sig: string };
  try {
    parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch {
    throw new BadRequestError('Invalid QR code', ErrorCode.VALIDATION_ERROR);
  }
  const { userId, sig } = parsed;
  const expected = createHmac('sha256', QR_SECRET).update(userId).digest('hex');
  if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
    throw new BadRequestError('QR code is not valid for this system', ErrorCode.VALIDATION_ERROR);
  }
  return { userId };
}

// BLML formula: compositeScore = (knowledge * 0.35) + (skill * 0.40) + (motivation * 0.25)
function computeTNACompositeScore(knowledge: number, skill: number, motivation: number): number {
  return Math.round((knowledge * 0.35 + skill * 0.40 + motivation * 0.25) * 100) / 100;
}

function recommendTrack(score: number): string {
  if (score >= 80) return 'ADVANCED';
  if (score >= 60) return 'INTERMEDIATE';
  return 'FOUNDATION';
}

export const participationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // GET /participations/me — my registrations
  app.get('/me', async (request, reply) => {
    const q = z.object({
      page:  z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(10),
    }).parse(request.query);

    const [total, participations] = await Promise.all([
      app.prisma.eventParticipation.count({ where: { userId: request.user.sub } }),
      app.prisma.eventParticipation.findMany({
        where: { userId: request.user.sub },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { registeredAt: 'desc' },
        include: {
          event: {
            select: {
              id: true, title: true, startDate: true, endDate: true,
              venue: true, deliveryMode: true, status: true, coverImageUrl: true,
            },
          },
          tnaResponse:       { select: { compositeScore: true, recommendedTrack: true, submittedAt: true } },
          certificate:       { select: { status: true, issuedAt: true, verificationCode: true } },
          csfSurveyResponse: { select: { status: true, submittedAt: true } },
          impactSurveyResponse: { select: { status: true, submittedAt: true } },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: participations,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    });
  });

  // GET /events/:eventId/me — check if current user is registered for this event
  app.get('/events/:eventId/me', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);
    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      select: { id: true, status: true, registeredAt: true },
    });
    return reply.send({ success: true, data: participation ?? null });
  });

  // POST /events/:eventId/register — register to an event
  app.post('/events/:eventId/register', async (request, reply) => {
    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);
    const { enterpriseId, dpaConsentConfirmed } = z.object({
      enterpriseId:        z.string().optional().nullable(),
      dpaConsentConfirmed: z.literal(true, { errorMap: () => ({ message: 'DPA consent confirmation is required' }) }),
    }).parse(request.body);

    const event = await app.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    // BLML: EventRegistrationOpenRule
    if (!['REGISTRATION_OPEN'].includes(event.status)) {
      throw new BadRequestError('Registration for this event is not currently open.', ErrorCode.REGISTRATION_CLOSED);
    }

    // BLML: RegistrationDeadlineRule
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestError('The registration deadline has passed.', ErrorCode.REGISTRATION_CLOSED);
    }

    // BLML: AlreadyRegisteredRule
    const existing = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
    });
    if (existing && existing.status !== 'CANCELLED') {
      throw new ConflictError('You are already registered for this event.', ErrorCode.ALREADY_REGISTERED);
    }

    // BLML: EnforceMaxCapacity
    let initialStatus: 'REGISTERED' | 'WAITLISTED' = 'REGISTERED';
    if (event.maxParticipants) {
      const count = await app.prisma.eventParticipation.count({
        where: { eventId, status: { notIn: ['CANCELLED', 'WAITLISTED'] } },
      });
      if (count >= event.maxParticipants) {
        initialStatus = 'WAITLISTED';
      }
    }

    // Upsert in case previous was CANCELLED
    const firstName = request.user.firstName ?? '';
    const lastName  = request.user.lastName  ?? '';
    const participantName  = `${firstName} ${lastName}`.trim() || null;
    const participantEmail = request.user.email;

    // BLML: LinkEnterpriseOnRegistration — auto-populate from identity-service membership
    let resolvedEnterpriseId  = enterpriseId ?? null;
    let resolvedEnterpriseName: string | null = null;

    if (!resolvedEnterpriseId) {
      // Look up active enterprise membership from identity schema (same DB)
      const membershipRows = await app.prisma.$queryRawUnsafe<Array<{ enterprise_id: string; business_name: string }>>(
        `SELECT em.enterprise_id, ep.business_name
         FROM identity_schema.enterprise_memberships em
         JOIN identity_schema.enterprise_profiles ep ON ep.id = em.enterprise_id
         WHERE em.user_id = $1 AND em.is_active = true
         ORDER BY em.joined_at DESC
         LIMIT 1`,
        request.user.sub,
      );
      if (membershipRows.length > 0) {
        resolvedEnterpriseId   = membershipRows[0].enterprise_id;
        resolvedEnterpriseName = membershipRows[0].business_name;
      }
    } else {
      // If enterpriseId was explicitly passed, look up the name
      const nameRows = await app.prisma.$queryRawUnsafe<Array<{ business_name: string }>>(
        `SELECT business_name FROM identity_schema.enterprise_profiles WHERE id = $1 LIMIT 1`,
        resolvedEnterpriseId,
      );
      if (nameRows.length > 0) {
        resolvedEnterpriseName = nameRows[0].business_name;
      }
    }

    const participation = await app.prisma.eventParticipation.upsert({
      where: { eventId_userId: { eventId, userId: request.user.sub } },
      create: {
        eventId,
        userId:          request.user.sub,
        enterpriseId:    resolvedEnterpriseId,
        enterpriseName:  resolvedEnterpriseName,
        status:          initialStatus,
        registeredAt:    new Date(),
        participantName,
        participantEmail,
      },
      update: {
        status:          initialStatus,
        enterpriseId:    resolvedEnterpriseId,
        enterpriseName:  resolvedEnterpriseName,
        registeredAt:    new Date(),
        completedAt:     null,
        rsvpConfirmedAt: null,
        tnaCompletedAt:  null,
        participantName,
        participantEmail,
      },
    });

    const message = initialStatus === 'WAITLISTED'
      ? 'You have been added to the waitlist.'
      : event.requiresTNA
        ? 'Registered! Please complete your TNA form to confirm your spot.'
        : 'Registration confirmed!';

    // Fire-and-forget: registration confirmation email
    if (initialStatus !== 'WAITLISTED' && participantEmail) {
      const dateFmt = (d: Date) => d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
      notifyRegistrationConfirmation({
        to: participantEmail,
        participantName: participantName ?? participantEmail,
        eventTitle: event.title,
        eventDate: dateFmt(event.startDate),
        eventVenue: event.venue ?? undefined,
        requiresTNA: event.requiresTNA,
        participationId: participation.id,
      }).catch(() => { /* best effort */ });
    }

    return reply.code(201).send({ success: true, data: participation, message });
  });

  // GET /participations/:id — get a specific participation
  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      include: {
        event:         { select: { id: true, title: true, startDate: true, endDate: true, requiresTNA: true, onlineLink: true } },
        tnaResponse:   true,
        attendanceRecords: { include: { session: { select: { id: true, title: true, startTime: true } } } },
        certificate:   true,
      },
    });

    if (!participation) throw new NotFoundError('Participation not found');

    const isOwner = participation.userId === request.user.sub;
    const isAdmin  = ['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role);
    if (!isOwner && !isAdmin) throw new ForbiddenError('Access denied.');

    return reply.send({ success: true, data: participation });
  });

  // POST /participations/:id/tna — submit TNA
  app.post('/:id/tna', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      include: { event: { select: { requiresTNA: true } }, tnaResponse: true },
    });

    if (!participation) throw new NotFoundError('Participation not found');
    if (participation.userId !== request.user.sub) throw new ForbiddenError('Access denied.');
    if (participation.tnaResponse) throw new ConflictError('TNA has already been submitted.', ErrorCode.CONFLICT);

    if (!participation.event.requiresTNA) {
      throw new BadRequestError('This event does not require TNA.', ErrorCode.VALIDATION_ERROR);
    }

    const body = z.object({
      knowledgeScore:  z.number().min(0).max(100),
      skillScore:      z.number().min(0).max(100),
      motivationScore: z.number().min(0).max(100),
      responses:       z.record(z.unknown()).default({}),
    }).parse(request.body);

    const compositeScore   = computeTNACompositeScore(body.knowledgeScore, body.skillScore, body.motivationScore);
    const recommendedTrack = recommendTrack(compositeScore);

    const [tna] = await app.prisma.$transaction([
      app.prisma.tNAResponse.create({
        data: {
          participationId:  id,
          userId:           request.user.sub,
          knowledgeScore:   body.knowledgeScore.toString(),
          skillScore:       body.skillScore.toString(),
          motivationScore:  body.motivationScore.toString(),
          compositeScore:   compositeScore.toString(),
          recommendedTrack,
          responses:        body.responses as Record<string, string>,
        },
      }),
      app.prisma.eventParticipation.update({
        where: { id },
        data: {
          status:         'RSVP_CONFIRMED',
          tnaCompletedAt: new Date(),
          rsvpConfirmedAt: new Date(),
        },
      }),
    ]);

    return reply.code(201).send({
      success: true,
      data: { ...tna, compositeScore, recommendedTrack },
      message: 'TNA submitted. Your participation is now confirmed.',
    });
  });

  // POST /participations/:id/confirm-rsvp — manual RSVP (for non-TNA events)
  app.post('/:id/confirm-rsvp', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      include: { event: { select: { requiresTNA: true } } },
    });

    if (!participation) throw new NotFoundError('Participation not found');
    if (participation.userId !== request.user.sub) throw new ForbiddenError('Access denied.');

    if (participation.event.requiresTNA && !participation.tnaCompletedAt) {
      throw new BadRequestError('Please complete TNA before confirming your RSVP.', ErrorCode.TNA_REQUIRED);
    }

    if (['RSVP_CONFIRMED', 'ATTENDED', 'COMPLETED'].includes(participation.status)) {
      throw new ConflictError('RSVP already confirmed.', ErrorCode.CONFLICT);
    }

    const updated = await app.prisma.eventParticipation.update({
      where: { id },
      data: { status: 'RSVP_CONFIRMED', rsvpConfirmedAt: new Date() },
    });

    return reply.send({ success: true, data: updated, message: 'RSVP confirmed!' });
  });

  // ── QR Attendance ─────────────────────────────────────────────────────────

  // GET /participations/:id/qr — return a permanent user-unique QR (no expiry, no session tie-in)
  app.get('/:id/qr', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });
    if (!participation) throw new NotFoundError('Participation not found');
    if (participation.userId !== request.user.sub) throw new ForbiddenError('Access denied.');
    if (!['RSVP_CONFIRMED', 'ATTENDED'].includes(participation.status)) {
      throw new BadRequestError('Your RSVP must be confirmed before you can get a QR code.', ErrorCode.VALIDATION_ERROR);
    }

    const qrValue = signPermanentQr(participation.userId);
    const dataUrl = await QRCode.toDataURL(qrValue, { errorCorrectionLevel: 'H', margin: 2 });

    return reply.send({
      success: true,
      data: { qrImage: dataUrl },
    });
  });

  // POST /attendance/scan — permanent QR scan: token encodes userId, sessionId comes from organizer
  app.post('/attendance/scan', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only event organizers can scan attendance.');
    }

    const { token, sessionId } = z.object({
      token:     z.string(),
      sessionId: z.string(),
    }).parse(request.body);

    // Verify permanent QR → extract userId
    const { userId } = verifyPermanentQr(token);

    // Resolve session → eventId
    const session = await app.prisma.eventSession.findUnique({
      where: { id: sessionId },
      select: { id: true, title: true, eventId: true },
    });
    if (!session) throw new NotFoundError('Session not found');

    // Find participation for this user + event
    const participation = await app.prisma.eventParticipation.findUnique({
      where: { eventId_userId: { eventId: session.eventId, userId } },
      select: { id: true, userId: true, eventId: true, status: true },
    });

    if (!participation || participation.status === 'CANCELLED') {
      throw new BadRequestError('This participant is not registered for this event.', ErrorCode.VALIDATION_ERROR);
    }
    if (!['RSVP_CONFIRMED', 'ATTENDED'].includes(participation.status)) {
      throw new BadRequestError('Participant RSVP is not confirmed.', ErrorCode.VALIDATION_ERROR);
    }

    const participationId = participation.id;

    // Check if already scanned for this session
    const existing = await app.prisma.attendanceRecord.findUnique({
      where: { participationId_sessionId: { participationId, sessionId } },
    });
    if (existing) throw new ConflictError('Attendance for this session was already recorded.', ErrorCode.CONFLICT);

    const [record] = await app.prisma.$transaction([
      app.prisma.attendanceRecord.create({
        data: {
          participationId,
          sessionId,
          userId,
          method: 'QR_SCAN',
          scannedByUserId: request.user.sub,
          scannedAt: new Date(),
        },
      }),
      app.prisma.eventParticipation.update({
        where: { id: participationId },
        data: { status: 'ATTENDED' },
      }),
    ]);

    // Auto-generate certificate placeholder when ALL sessions attended
    const [totalSessions, totalAttended] = await Promise.all([
      app.prisma.eventSession.count({ where: { eventId: session.eventId } }),
      app.prisma.attendanceRecord.count({ where: { participationId } }),
    ]);
    if (totalSessions > 0 && totalAttended >= totalSessions) {
      const verificationCode = randomBytes(12).toString('hex').toUpperCase();
      await app.prisma.certificate.upsert({
        where: { participationId },
        create: {
          participationId,
          userId,
          eventId: session.eventId,
          status: 'PENDING',
          verificationCode,
        },
        update: {},
      });
    }

    return reply.code(201).send({
      success: true,
      data: record,
      message: `Attendance recorded for ${session.title}`,
    });
  });

  // POST /participations/:id/manual-checkin — organizer-only manual fallback
  app.post('/:id/manual-checkin', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only organizers can perform manual check-in.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { sessionId } = z.object({ sessionId: z.string() }).parse(request.body);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      select: { id: true, userId: true, eventId: true, status: true },
    });
    if (!participation) throw new NotFoundError('Participation not found');

    if (!['RSVP_CONFIRMED', 'ATTENDED'].includes(participation.status)) {
      throw new BadRequestError('Participant RSVP must be confirmed first.', ErrorCode.VALIDATION_ERROR);
    }

    const session = await app.prisma.eventSession.findFirst({
      where: { id: sessionId, eventId: participation.eventId },
    });
    if (!session) throw new NotFoundError('Session not found for this event');

    const existing = await app.prisma.attendanceRecord.findUnique({
      where: { participationId_sessionId: { participationId: id, sessionId } },
    });
    if (existing) throw new ConflictError('Attendance already recorded for this session.', ErrorCode.CONFLICT);

    const [record] = await app.prisma.$transaction([
      app.prisma.attendanceRecord.create({
        data: {
          participationId: id,
          sessionId,
          userId: participation.userId,
          method: 'MANUAL',
          scannedByUserId: request.user.sub,
          scannedAt: new Date(),
        },
      }),
      app.prisma.eventParticipation.update({
        where: { id },
        data: { status: 'ATTENDED' },
      }),
    ]);

    return reply.code(201).send({
      success: true,
      data: record,
      message: `Manual check-in recorded for ${session.title}`,
    });
  });

  // GET /participations/:id/attendance — list attendance records for a participation
  app.get('/:id/attendance', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const participation = await app.prisma.eventParticipation.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!participation) throw new NotFoundError('Participation not found');

    const isOwner = participation.userId === request.user.sub;
    const isStaff = ['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role);
    if (!isOwner && !isStaff) throw new ForbiddenError('Access denied.');

    const records = await app.prisma.attendanceRecord.findMany({
      where: { participationId: id },
      include: { session: { select: { id: true, title: true, startTime: true, endTime: true } } },
      orderBy: { scannedAt: 'asc' },
    });

    return reply.send({ success: true, data: records });
  });
};
