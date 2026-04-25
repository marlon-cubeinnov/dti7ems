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
      // 9 SQD dimensions (1-5)
      sqd0OverallRating:    z.number().int().min(1).max(5),
      sqd1Responsiveness:   z.number().int().min(1).max(5),
      sqd2Reliability:      z.number().int().min(1).max(5),
      sqd3AccessFacilities: z.number().int().min(1).max(5),
      sqd4Communication:    z.number().int().min(1).max(5),
      sqd5Costs:            z.number().int().min(1).max(5).optional().nullable(),
      sqd6Integrity:        z.number().int().min(1).max(5),
      sqd7Assurance:        z.number().int().min(1).max(5),
      sqd8Outcome:          z.number().int().min(1).max(5),
      // Citizen's Charter
      cc1Awareness:         z.number().int().min(1).max(4).optional().nullable(),
      cc2Visibility:        z.number().int().min(1).max(4).optional().nullable(),
      cc3Usefulness:        z.number().int().min(1).max(3).optional().nullable(),
      // Feedback
      highlightsFeedback:   z.string().max(2000).optional().nullable(),
      improvementsFeedback: z.string().max(2000).optional().nullable(),
      commentsSuggestions:  z.string().max(2000).optional().nullable(),
      reasonsForLowRating:  z.string().max(2000).optional().nullable(),
      // Speaker ratings
      speakerRatings:       z.array(z.object({
        speakerId: z.string(),
        rating:    z.number().int().min(1).max(5),
      })).optional().default([]),
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

    const { speakerRatings, ...csfData } = body;

    const response = await app.prisma.csfSurveyResponse.upsert({
      where: { participationId: participation.id },
      create: {
        participationId:      participation.id,
        eventId,
        userId:               request.user.sub,
        status:               'SUBMITTED',
        ...csfData,
        submittedAt:          new Date(),
      },
      update: {
        status:               'SUBMITTED',
        ...csfData,
        submittedAt:          new Date(),
      },
    });

    // Upsert speaker ratings
    if (speakerRatings.length > 0) {
      // Delete existing then recreate
      await app.prisma.csfSpeakerRating.deleteMany({ where: { csfResponseId: response.id } });
      await app.prisma.csfSpeakerRating.createMany({
        data: speakerRatings.map(sr => ({
          csfResponseId: response.id,
          speakerId: sr.speakerId,
          rating: sr.rating,
        })),
      });
    }

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
      include: { speakerRatings: { include: { speaker: { select: { id: true, name: true, topic: true } } } } },
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
      include: {
        speakerRatings: true,
        participation: { select: { participantName: true, participantEmail: true } },
      },
    });

    const count = responses.length;
    if (count === 0) {
      return reply.send({
        success: true,
        data: { count: 0, averages: null, sqdBreakdown: null, ccDistribution: null, speakerAverages: [], responses: [] },
      });
    }

    // SQD fields helper
    const SQD_FIELDS = [
      'sqd0OverallRating', 'sqd1Responsiveness', 'sqd2Reliability', 'sqd3AccessFacilities',
      'sqd4Communication', 'sqd5Costs', 'sqd6Integrity', 'sqd7Assurance', 'sqd8Outcome',
    ] as const;
    const SQD_LABELS = [
      'Overall Satisfaction', 'Responsiveness', 'Reliability', 'Access & Facilities',
      'Communication', 'Costs', 'Integrity', 'Assurance', 'Outcome',
    ];

    const avg = (field: string) => {
      const vals = responses.map(r => Number((r as any)[field])).filter(v => !isNaN(v) && v > 0);
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null;
    };

    // Per-SQD breakdown: count per rating level + CSF rating % + adjectival
    const sqdBreakdown = SQD_FIELDS.map((field, i) => {
      const vals = responses.map(r => Number((r as any)[field])).filter(v => !isNaN(v) && v > 0);
      const ratingCounts = [0, 0, 0, 0, 0]; // index 0=rating1 ... 4=rating5
      for (const v of vals) ratingCounts[v - 1]++;
      const sum = vals.reduce((a, b) => a + b, 0);
      const csfRatingPct = vals.length > 0 ? Math.round((sum / (5 * vals.length)) * 10000) / 100 : null;
      let adjectival: string | null = null;
      if (csfRatingPct !== null) {
        if (csfRatingPct >= 90) adjectival = 'Outstanding';
        else if (csfRatingPct >= 80) adjectival = 'Very Satisfactory';
        else if (csfRatingPct >= 70) adjectival = 'Satisfactory';
        else if (csfRatingPct >= 60) adjectival = 'Fair';
        else adjectival = 'Unsatisfactory';
      }
      const ratingCountsObj: Record<string, number> = {};
      for (let r = 1; r <= 5; r++) ratingCountsObj[String(r)] = ratingCounts[r - 1];
      return {
        key: field, label: SQD_LABELS[i], average: vals.length ? Math.round((sum / vals.length) * 100) / 100 : null,
        ratingCounts: ratingCountsObj, totalResponses: vals.length, csfRating: csfRatingPct, adjectival,
      };
    });

    // CC distribution
    const ccDist = (field: string, max: number) => {
      const dist: Record<number, number> = {};
      for (let i = 1; i <= max; i++) dist[i] = 0;
      for (const r of responses) {
        const v = Number((r as any)[field]);
        if (v >= 1 && v <= max) dist[v]++;
      }
      return dist;
    };

    // Speaker average ratings
    const speakerMap = new Map<string, { total: number; count: number }>();
    for (const r of responses) {
      for (const sr of r.speakerRatings) {
        const entry = speakerMap.get(sr.speakerId) ?? { total: 0, count: 0 };
        entry.total += sr.rating;
        entry.count++;
        speakerMap.set(sr.speakerId, entry);
      }
    }
    // Fetch speaker names
    const speakerIds = [...speakerMap.keys()];
    const speakers = speakerIds.length > 0
      ? await app.prisma.trainingSpeaker.findMany({ where: { id: { in: speakerIds } }, select: { id: true, name: true, topic: true } })
      : [];
    const speakerAverages = speakers.map(s => {
      const entry = speakerMap.get(s.id)!;
      return { speakerId: s.id, speakerName: s.name, topic: s.topic, avgRating: Math.round((entry.total / entry.count) * 100) / 100, count: entry.count };
    });

    return reply.send({
      success: true,
      data: {
        count,
        averages: Object.fromEntries(SQD_FIELDS.map(f => [f, avg(f)])),
        sqdBreakdown,
        ccDistribution: [
          { key: 'cc1Awareness', distribution: ccDist('cc1Awareness', 4), total: count },
          { key: 'cc2Visibility', distribution: ccDist('cc2Visibility', 4), total: count },
          { key: 'cc3Usefulness', distribution: ccDist('cc3Usefulness', 3), total: count },
        ],
        speakerAverages,
        responses: responses.map(r => ({
          id: r.id,
          sqd0OverallRating: r.sqd0OverallRating,
          sqd1Responsiveness: r.sqd1Responsiveness,
          sqd2Reliability: r.sqd2Reliability,
          sqd3AccessFacilities: r.sqd3AccessFacilities,
          sqd4Communication: r.sqd4Communication,
          sqd5Costs: r.sqd5Costs,
          sqd6Integrity: r.sqd6Integrity,
          sqd7Assurance: r.sqd7Assurance,
          sqd8Outcome: r.sqd8Outcome,
          cc1Awareness: r.cc1Awareness,
          cc2Visibility: r.cc2Visibility,
          cc3Usefulness: r.cc3Usefulness,
          highlightsFeedback: r.highlightsFeedback,
          improvementsFeedback: r.improvementsFeedback,
          commentsSuggestions: r.commentsSuggestions,
          reasonsForLowRating: (r as any).reasonsForLowRating ?? null,
          speakerRatings: r.speakerRatings.map(sr => ({ speakerId: sr.speakerId, rating: sr.rating })),
          submittedAt: r.submittedAt,
          participantName: r.participation?.participantName ?? null,
          participantEmail: r.participation?.participantEmail ?? null,
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
      // FM-CT-5 effectiveness fields
      effectiveness: z.object({
        appliedLearnings:        z.boolean().optional().nullable(),
        benefitIncreasedSales:   z.boolean().default(false),
        benefitSalesPct:         z.number().min(0).max(999).optional().nullable(),
        benefitIncreasedProfit:  z.boolean().default(false),
        benefitProfitPct:        z.number().min(0).max(999).optional().nullable(),
        benefitCostReduction:    z.boolean().default(false),
        benefitCostPct:          z.number().min(0).max(999).optional().nullable(),
        benefitNewMarkets:       z.boolean().default(false),
        benefitProductivity:     z.boolean().default(false),
        benefitManpowerWelfare:  z.boolean().default(false),
        benefitStandardizedOp:   z.boolean().default(false),
        benefitBookkeeping:      z.boolean().default(false),
        benefitImprovedMgmt:     z.boolean().default(false),
        benefitSetupBusiness:    z.boolean().default(false),
        benefitExpandBusiness:   z.boolean().default(false),
        benefitEnhancedCapacity: z.boolean().default(false),
        benefitAdoptTechnology:  z.boolean().default(false),
        benefitInnovation:       z.boolean().default(false),
        benefitNoComplaints:     z.boolean().default(false),
        benefitOthers:           z.string().max(500).optional().nullable(),
        needsProductDevelopment: z.boolean().default(false),
        needsLoanAdvisory:       z.boolean().default(false),
        needsOthers:             z.string().max(500).optional().nullable(),
        futureTrainingRequests:  z.string().max(5000).optional().nullable(),
        trainingEffective:       z.boolean().optional().nullable(),
        ineffectiveReason:       z.string().max(5000).optional().nullable(),
        respondentDesignation:   z.string().max(200).optional().nullable(),
        respondentCompany:       z.string().max(300).optional().nullable(),
      }).optional(),
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

    const { effectiveness, ...impactData } = body;

    const response = await app.prisma.impactSurveyResponse.upsert({
      where: { participationId: participation.id },
      create: {
        participationId: participation.id,
        eventId,
        userId: request.user.sub,
        status: 'SUBMITTED',
        scheduledAt: new Date(),
        ...impactData,
        submittedAt: new Date(),
      },
      update: {
        status: 'SUBMITTED',
        ...impactData,
        submittedAt: new Date(),
      },
    });

    // Save effectiveness evaluation if provided
    if (effectiveness) {
      await app.prisma.trainingEffectivenessEvaluation.upsert({
        where: { impactSurveyResponseId: response.id },
        create: {
          impactSurveyResponseId: response.id,
          ...effectiveness,
          dateAccomplished: new Date(),
        },
        update: {
          ...effectiveness,
          dateAccomplished: new Date(),
        },
      });
    }

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
      include: { effectivenessEval: true },
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

  // GET /surveys/events/:eventId/csf/report — FM-CSF-ACT-RPT full report
  app.get('/events/:eventId/csf/report', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', ...ADMIN_ROLES].includes(role)) {
      throw new ForbiddenError('Only organizers can view CSF reports.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    // Fetch event details
    const event = await app.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, venue: true, startDate: true, endDate: true, targetSector: true },
    });
    if (!event) throw new NotFoundError('Event not found.');

    // Total attended participants (clients served)
    const totalClients = await app.prisma.eventParticipation.count({
      where: { eventId, status: { in: ['ATTENDED', 'COMPLETED'] } },
    });

    const responses = await app.prisma.csfSurveyResponse.findMany({
      where: { eventId, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      include: { speakerRatings: true },
    });

    const count = responses.length;
    const retrievalRate = totalClients > 0 ? Math.round((count / totalClients) * 10000) / 100 : 0;

    // SQD fields helper
    const SQD_FIELDS = [
      'sqd0OverallRating', 'sqd1Responsiveness', 'sqd2Reliability', 'sqd3AccessFacilities',
      'sqd4Communication', 'sqd5Costs', 'sqd6Integrity', 'sqd7Assurance', 'sqd8Outcome',
    ] as const;
    const SQD_LABELS = [
      'Overall Satisfaction', 'Responsiveness', 'Reliability', 'Access & Facilities',
      'Communication', 'Costs', 'Integrity', 'Assurance', 'Outcome',
    ];

    // Per-SQD breakdown
    const sqdBreakdown = SQD_FIELDS.map((field, i) => {
      const vals = responses.map(r => Number((r as any)[field])).filter(v => !isNaN(v) && v > 0);
      const ratingCounts = [0, 0, 0, 0, 0];
      for (const v of vals) ratingCounts[v - 1]++;
      const sum = vals.reduce((a, b) => a + b, 0);
      const csfRatingPct = vals.length > 0 ? Math.round((sum / (5 * vals.length)) * 10000) / 100 : null;
      let adjectival: string | null = null;
      if (csfRatingPct !== null) {
        if (csfRatingPct >= 90) adjectival = 'Outstanding';
        else if (csfRatingPct >= 80) adjectival = 'Very Satisfactory';
        else if (csfRatingPct >= 70) adjectival = 'Satisfactory';
        else if (csfRatingPct >= 60) adjectival = 'Fair';
        else adjectival = 'Unsatisfactory';
      }
      return {
        field, label: SQD_LABELS[i],
        ratingCounts, totalResponses: vals.length,
        csfRatingPct, adjectival,
      };
    });

    // Overall satisfaction (average of SQD0)
    const sqd0Vals = responses.map(r => Number(r.sqd0OverallRating)).filter(v => !isNaN(v) && v > 0);
    const overallSatisfactionPct = sqd0Vals.length > 0
      ? Math.round((sqd0Vals.reduce((a, b) => a + b, 0) / (5 * sqd0Vals.length)) * 10000) / 100
      : null;
    let overallAdjectival: string | null = null;
    if (overallSatisfactionPct !== null) {
      if (overallSatisfactionPct >= 90) overallAdjectival = 'Outstanding';
      else if (overallSatisfactionPct >= 80) overallAdjectival = 'Very Satisfactory';
      else if (overallSatisfactionPct >= 70) overallAdjectival = 'Satisfactory';
      else if (overallSatisfactionPct >= 60) overallAdjectival = 'Fair';
      else overallAdjectival = 'Unsatisfactory';
    }

    // CC distribution
    const ccDist = (field: string, max: number) => {
      const dist: Record<number, number> = {};
      for (let i = 1; i <= max; i++) dist[i] = 0;
      for (const r of responses) {
        const v = Number((r as any)[field]);
        if (v >= 1 && v <= max) dist[v]++;
      }
      return dist;
    };

    // Speaker averages
    const speakerMap = new Map<string, { total: number; count: number }>();
    for (const r of responses) {
      for (const sr of r.speakerRatings) {
        const entry = speakerMap.get(sr.speakerId) ?? { total: 0, count: 0 };
        entry.total += sr.rating;
        entry.count++;
        speakerMap.set(sr.speakerId, entry);
      }
    }
    const speakerIds = [...speakerMap.keys()];
    const speakers = speakerIds.length > 0
      ? await app.prisma.trainingSpeaker.findMany({ where: { id: { in: speakerIds } }, select: { id: true, name: true, organization: true, topic: true } })
      : [];
    const speakerSummary = speakers.map(s => {
      const entry = speakerMap.get(s.id)!;
      const avg = Math.round((entry.total / entry.count) * 100) / 100;
      const pct = Math.round((entry.total / (5 * entry.count)) * 10000) / 100;
      return { speakerId: s.id, name: s.name, organization: s.organization, topic: s.topic, average: avg, csfPct: pct, responseCount: entry.count };
    });

    // Demographics disaggregation — query identity_schema
    const respondentUserIds = responses.map(r => r.userId);
    let demographics: { sex: Record<string, number>; ageBracket: Record<string, number>; clientType: Record<string, number> } = {
      sex: {}, ageBracket: {}, clientType: {},
    };

    if (respondentUserIds.length > 0) {
      const profiles: Array<{ sex: string | null; age_bracket: string | null; client_type: string | null }> = await app.prisma.$queryRawUnsafe(
        `SELECT sex, age_bracket, client_type FROM identity_schema.user_profiles WHERE id IN (${respondentUserIds.map((_: string, i: number) => `$${i + 1}`).join(',')})`,
        ...respondentUserIds,
      );

      for (const p of profiles) {
        const s = p.sex ?? 'NOT_SPECIFIED';
        demographics.sex[s] = (demographics.sex[s] ?? 0) + 1;

        const a = p.age_bracket ?? 'NOT_SPECIFIED';
        demographics.ageBracket[a] = (demographics.ageBracket[a] ?? 0) + 1;

        const c = p.client_type ?? 'NOT_SPECIFIED';
        demographics.clientType[c] = (demographics.clientType[c] ?? 0) + 1;
      }
    }

    // Feedback texts
    const feedbackItems = {
      highlights: responses.map(r => r.highlightsFeedback).filter(Boolean),
      improvements: responses.map(r => r.improvementsFeedback).filter(Boolean),
      comments: responses.map(r => r.commentsSuggestions).filter(Boolean),
      lowRatingReasons: responses.map(r => r.reasonsForLowRating).filter(Boolean),
    };

    return reply.send({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          venue: event.venue,
          startDate: event.startDate,
          endDate: event.endDate,
          targetSector: event.targetSector,
        },
        summary: {
          totalClients,
          totalResponses: count,
          retrievalRate,
          overallSatisfactionPct,
          overallAdjectival,
        },
        sqdBreakdown,
        ccDistribution: {
          cc1Awareness: ccDist('cc1Awareness', 4),
          cc2Visibility: ccDist('cc2Visibility', 4),
          cc3Usefulness: ccDist('cc3Usefulness', 3),
        },
        speakerSummary,
        demographics,
        feedback: feedbackItems,
      },
    });
  });

  // GET /surveys/events/:eventId/impact/effectiveness — FM-CT-3 effectiveness report
  app.get('/events/:eventId/impact/effectiveness', async (request, reply) => {
    const role = request.user.role;
    if (!['EVENT_ORGANIZER', 'PROGRAM_MANAGER', ...ADMIN_ROLES].includes(role)) {
      throw new ForbiddenError('Only organizers or admins can view effectiveness reports.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const responses = await app.prisma.impactSurveyResponse.findMany({
      where: { eventId, status: 'SUBMITTED' },
      include: { effectivenessEval: true },
      orderBy: { submittedAt: 'desc' },
    });

    const totalParticipants = await app.prisma.eventParticipation.count({
      where: { eventId, status: { in: ['ATTENDED', 'COMPLETED'] } },
    });

    const withEval = responses.filter(r => r.effectivenessEval);
    const count = withEval.length;
    const responseRate = totalParticipants > 0 ? Math.round((count / totalParticipants) * 100 * 10) / 10 : 0;
    const meetsThreshold = responseRate >= 5;

    // Aggregate benefit indicators
    const BENEFIT_KEYS = [
      'benefitIncreasedSales', 'benefitIncreasedProfit', 'benefitCostReduction',
      'benefitNewMarkets', 'benefitProductivity', 'benefitManpowerWelfare',
      'benefitStandardizedOp', 'benefitBookkeeping', 'benefitImprovedMgmt',
      'benefitSetupBusiness', 'benefitExpandBusiness', 'benefitEnhancedCapacity',
      'benefitAdoptTechnology', 'benefitInnovation', 'benefitNoComplaints',
    ] as const;

    const benefitSummary = BENEFIT_KEYS.map(key => ({
      key,
      yesCount: withEval.filter(r => (r.effectivenessEval as any)?.[key] === true).length,
      noCount: withEval.filter(r => (r.effectivenessEval as any)?.[key] === false).length,
    }));

    const appliedCount = withEval.filter(r => r.effectivenessEval?.appliedLearnings === true).length;
    const notAppliedCount = withEval.filter(r => r.effectivenessEval?.appliedLearnings === false).length;
    const effectiveCount = withEval.filter(r => r.effectivenessEval?.trainingEffective === true).length;
    const ineffectiveCount = withEval.filter(r => r.effectivenessEval?.trainingEffective === false).length;

    return reply.send({
      success: true,
      data: {
        totalParticipants,
        totalResponses: count,
        responseRate,
        meetsThreshold,
        appliedLearnings: { yes: appliedCount, no: notAppliedCount },
        trainingEffective: { yes: effectiveCount, no: ineffectiveCount },
        benefitSummary,
        evaluations: withEval.map(r => ({
          id: r.id,
          userId: r.userId,
          submittedAt: r.submittedAt,
          eval: r.effectivenessEval,
        })),
      },
    });
  });

  // POST /surveys/events/:eventId/csf/distribute — Step 5: Technical Staff distributes CSF forms
  // Creates CsfSurveyResponse records (PENDING) for all ATTENDED/COMPLETED participants
  app.post('/events/:eventId/csf/distribute', async (request, reply) => {
    const role = request.user.role;
    if (!['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only Technical Staff or admins can distribute CSF forms.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const event = await app.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, endDate: true },
    });
    if (!event) throw new NotFoundError('Event not found');
    if (!['ONGOING', 'COMPLETED'].includes(event.status)) {
      throw new BadRequestError('CSF forms can only be distributed for ongoing or completed events.', ErrorCode.VALIDATION_ERROR);
    }

    // Find all ATTENDED or COMPLETED participants without an existing CSF response
    const participations = await app.prisma.eventParticipation.findMany({
      where: {
        eventId,
        status: { in: ['ATTENDED', 'COMPLETED'] },
        csfSurveyResponse: null,
      },
      select: { id: true, userId: true },
    });

    if (participations.length === 0) {
      return reply.send({ success: true, data: { created: 0 }, message: 'All eligible participants already have a CSF form.' });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await app.prisma.csfSurveyResponse.createMany({
      data: participations.map(p => ({
        participationId: p.id,
        eventId,
        userId:         p.userId,
        status:         'PENDING' as const,
        expiresAt,
      })),
    });

    return reply.send({
      success: true,
      data:    { created: participations.length },
      message: `CSF forms distributed to ${participations.length} participant(s). They have 30 days to submit.`,
    });
  });

  // GET /surveys/events/:eventId/csf/distribution-status — Step 5: get CSF distribution summary
  app.get('/events/:eventId/csf/distribution-status', async (request, reply) => {
    const role = request.user.role;
    if (!['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenError('Only Technical Staff or admins can view CSF distribution status.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const [attended, distributed, submitted] = await Promise.all([
      app.prisma.eventParticipation.count({ where: { eventId, status: { in: ['ATTENDED', 'COMPLETED'] } } }),
      app.prisma.csfSurveyResponse.count({ where: { eventId } }),
      app.prisma.csfSurveyResponse.count({ where: { eventId, status: 'SUBMITTED' } }),
    ]);

    return reply.send({
      success: true,
      data: {
        attended,
        distributed,
        submitted,
        pending: distributed - submitted,
        responseRate: distributed > 0 ? Math.round((submitted / distributed) * 100) : 0,
      },
    });
  });
};
