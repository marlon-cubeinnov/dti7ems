import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError } from '@dti-ems/shared-errors';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

function requireAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
    throw new ForbiddenError('Only administrators can access this resource.');
  }
}

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // ── System-wide event stats ───────────────────────────────────────────────

  app.get('/stats', async (request, reply) => {
    requireAdmin(request.user.role);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      statusCounts,
      totalParticipations,
      recentRegistrations,
      totalCertificates,
      issuedCertificates,
      totalCsfResponses,
      submittedCsfResponses,
      attendanceRecordCount,
    ] = await Promise.all([
      app.prisma.event.count(),
      app.prisma.event.groupBy({ by: ['status'], _count: true }),
      app.prisma.eventParticipation.count(),
      app.prisma.eventParticipation.count({ where: { registeredAt: { gte: thirtyDaysAgo } } }),
      app.prisma.certificate.count(),
      app.prisma.certificate.count({ where: { status: 'ISSUED' } }),
      app.prisma.csfSurveyResponse.count(),
      app.prisma.csfSurveyResponse.count({ where: { status: 'SUBMITTED' } }),
      app.prisma.attendanceRecord.count(),
    ]);

    return reply.send({
      success: true,
      data: {
        events: {
          total: totalEvents,
          byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s._count])),
        },
        participations: {
          total: totalParticipations,
          recentRegistrations,
        },
        certificates: {
          total: totalCertificates,
          issued: issuedCertificates,
        },
        surveys: {
          totalCsf: totalCsfResponses,
          submittedCsf: submittedCsfResponses,
          csfResponseRate: totalCsfResponses > 0
            ? Math.round((submittedCsfResponses / totalCsfResponses) * 100)
            : 0,
        },
        attendance: {
          totalRecords: attendanceRecordCount,
        },
      },
    });
  });

  // ── All events (admin list) ───────────────────────────────────────────────

  app.get('/events', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      page:     z.coerce.number().min(1).default(1),
      limit:    z.coerce.number().min(1).max(100).default(20),
      status:   z.string().optional(),
      search:   z.string().optional(),
      from:     z.string().datetime().optional(),
      to:       z.string().datetime().optional(),
    }).parse(request.query);

    const { page, limit, status, search, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (search) {
      where['OR'] = [
        { title: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      where['startDate'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to   ? { lte: new Date(to) }   : {}),
      };
    }

    const [total, events] = await Promise.all([
      app.prisma.event.count({ where }),
      app.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              participations: true,
              sessions: true,
            },
          },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // ── CSF Report (system-wide) ──────────────────────────────────────────────

  app.get('/reports/csf', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      from: z.string().datetime().optional(),
      to:   z.string().datetime().optional(),
    }).parse(request.query);

    const where: Record<string, unknown> = { status: 'SUBMITTED' };
    if (query.from || query.to) {
      where['submittedAt'] = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to   ? { lte: new Date(query.to) }   : {}),
      };
    }

    const responses = await app.prisma.csfSurveyResponse.findMany({
      where,
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
        submittedAt: true,
        eventId: true,
      },
    });

    const count = responses.length;
    if (count === 0) {
      return reply.send({
        success: true,
        data: { count: 0, averages: null, byEvent: [] },
      });
    }

    const avg = (vals: (number | null)[]) => {
      const nums = vals.filter((v): v is number => v !== null);
      return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
    };

    // Per-event breakdown
    const byEventMap = new Map<string, typeof responses>();
    for (const r of responses) {
      const arr = byEventMap.get(r.eventId) ?? [];
      arr.push(r);
      byEventMap.set(r.eventId, arr);
    }

    const sqdAvg = (resps: typeof responses) => ({
      sqd0OverallRating:    avg(resps.map(r => r.sqd0OverallRating)),
      sqd1Responsiveness:   avg(resps.map(r => r.sqd1Responsiveness)),
      sqd2Reliability:      avg(resps.map(r => r.sqd2Reliability)),
      sqd3AccessFacilities: avg(resps.map(r => r.sqd3AccessFacilities)),
      sqd4Communication:    avg(resps.map(r => r.sqd4Communication)),
      sqd5Costs:            avg(resps.map(r => r.sqd5Costs)),
      sqd6Integrity:        avg(resps.map(r => r.sqd6Integrity)),
      sqd7Assurance:        avg(resps.map(r => r.sqd7Assurance)),
      sqd8Outcome:          avg(resps.map(r => r.sqd8Outcome)),
    });

    const byEvent = Array.from(byEventMap.entries()).map(([eventId, resps]) => ({
      eventId,
      count: resps.length,
      averages: sqdAvg(resps),
    }));

    return reply.send({
      success: true,
      data: {
        count,
        averages: sqdAvg(responses),
        byEvent,
      },
    });
  });

  // ── Event Completion Report ───────────────────────────────────────────────

  app.get('/reports/completion', async (request, reply) => {
    requireAdmin(request.user.role);

    const completedEvents = await app.prisma.event.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { endDate: 'desc' },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        targetSector: true,
        targetRegion: true,
        _count: {
          select: {
            participations: true,
            sessions: true,
          },
        },
      },
    });

    // Fetch additional stats for each event
    const report = await Promise.all(
      completedEvents.map(async (event) => {
        const [attended, certified, csfSubmitted, csfTotal] = await Promise.all([
          app.prisma.eventParticipation.count({ where: { eventId: event.id, status: { in: ['ATTENDED', 'COMPLETED'] } } }),
          app.prisma.certificate.count({ where: { eventId: event.id, status: 'ISSUED' } }),
          app.prisma.csfSurveyResponse.count({ where: { eventId: event.id, status: 'SUBMITTED' } }),
          app.prisma.csfSurveyResponse.count({ where: { eventId: event.id } }),
        ]);

        return {
          ...event,
          attended,
          certified,
          csfSubmitted,
          csfTotal,
          attendanceRate: event._count.participations > 0
            ? Math.round((attended / event._count.participations) * 100)
            : 0,
          csfResponseRate: csfTotal > 0
            ? Math.round((csfSubmitted / csfTotal) * 100)
            : 0,
        };
      }),
    );

    return reply.send({ success: true, data: report });
  });

  // ── DPA Compliance Report ─────────────────────────────────────────────────

  app.get('/reports/dpa', async (request, reply) => {
    requireAdmin(request.user.role);

    // DPA data lives in identity-service, but participation consent is in event-service
    const participationsWithConsent = await app.prisma.eventParticipation.count();
    const recentParticipations = await app.prisma.eventParticipation.count({
      where: { registeredAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
    });

    return reply.send({
      success: true,
      data: {
        totalRegistrations: participationsWithConsent,
        recentRegistrations: recentParticipations,
        note: 'DPA consent data is stored in identity-service. Registration implies DPA consent was given at user signup.',
      },
    });
  });

  // ── Monthly Registration Trends ───────────────────────────────────────────

  app.get('/reports/trends', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      months: z.coerce.number().min(1).max(24).default(12),
    }).parse(request.query);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - query.months);

    const participations = await app.prisma.eventParticipation.findMany({
      where: { registeredAt: { gte: startDate } },
      select: { registeredAt: true },
      orderBy: { registeredAt: 'asc' },
    });

    // Group by month
    const monthlyMap = new Map<string, number>();
    for (const p of participations) {
      const key = `${p.registeredAt.getFullYear()}-${String(p.registeredAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }

    const trends = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, registrations: count }));

    return reply.send({ success: true, data: trends });
  });

  // ── Impact Survey Report (system-wide) ────────────────────────────────────

  app.get('/reports/impact', async (request, reply) => {
    requireAdmin(request.user.role);

    const responses = await app.prisma.impactSurveyResponse.findMany({
      where: { status: 'SUBMITTED' },
      select: {
        knowledgeApplication: true,
        skillImprovement: true,
        businessImpact: true,
        revenueChange: true,
        employeeGrowth: true,
        revenueChangePct: true,
        employeeCountBefore: true,
        employeeCountAfter: true,
        successStory: true,
        submittedAt: true,
        eventId: true,
      },
    });

    const count = responses.length;
    if (count === 0) {
      return reply.send({ success: true, data: { count: 0, averages: null, byEvent: [] } });
    }

    const avg = (vals: (number | null | undefined)[]) => {
      const nums = vals.filter((v): v is number => v != null && !isNaN(v));
      return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
    };

    const byEventMap = new Map<string, typeof responses>();
    for (const r of responses) {
      const arr = byEventMap.get(r.eventId) ?? [];
      arr.push(r);
      byEventMap.set(r.eventId, arr);
    }

    const byEvent = Array.from(byEventMap.entries()).map(([eventId, resps]) => ({
      eventId,
      count: resps.length,
      averages: {
        knowledgeApplication: avg(resps.map(r => r.knowledgeApplication)),
        skillImprovement:     avg(resps.map(r => r.skillImprovement)),
        businessImpact:       avg(resps.map(r => r.businessImpact)),
        revenueChange:        avg(resps.map(r => r.revenueChange)),
        employeeGrowth:       avg(resps.map(r => r.employeeGrowth)),
      },
    }));

    return reply.send({
      success: true,
      data: {
        count,
        averages: {
          knowledgeApplication: avg(responses.map(r => r.knowledgeApplication)),
          skillImprovement:     avg(responses.map(r => r.skillImprovement)),
          businessImpact:       avg(responses.map(r => r.businessImpact)),
          revenueChange:        avg(responses.map(r => r.revenueChange)),
          employeeGrowth:       avg(responses.map(r => r.employeeGrowth)),
        },
        quantitative: {
          avgRevenueChangePct: avg(responses.map(r => r.revenueChangePct ? Number(r.revenueChangePct) : null)),
          avgEmployeeGrowth: avg(
            responses
              .filter(r => r.employeeCountBefore != null && r.employeeCountAfter != null)
              .map(r => r.employeeCountAfter! - r.employeeCountBefore!),
          ),
        },
        successStories: responses
          .filter(r => r.successStory)
          .slice(0, 20)
          .map(r => ({ story: r.successStory, submittedAt: r.submittedAt, eventId: r.eventId })),
        byEvent,
      },
    });
  });

  // ── Enterprise Training Completion Report ─────────────────────────────────

  app.get('/reports/enterprise-training', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      from: z.string().datetime().optional(),
      to:   z.string().datetime().optional(),
    }).parse(request.query);

    // Find participations with enterprise association and ATTENDED/COMPLETED status
    const where: Record<string, unknown> = {
      enterpriseId: { not: null },
      status: { in: ['ATTENDED', 'COMPLETED'] },
    };
    if (query.from || query.to) {
      where['event'] = {
        startDate: {
          ...(query.from ? { gte: new Date(query.from) } : {}),
          ...(query.to   ? { lte: new Date(query.to) }   : {}),
        },
      };
    }

    const participations = await app.prisma.eventParticipation.findMany({
      where,
      select: {
        enterpriseId: true,
        enterpriseName: true,
        participantName: true,
        participantEmail: true,
        userId: true,
        status: true,
        completedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            targetSector: true,
          },
        },
      },
      orderBy: [{ enterpriseId: 'asc' }, { event: { startDate: 'desc' } }],
    });

    // Group by enterprise
    const enterpriseMap = new Map<string, {
      enterpriseId: string;
      enterpriseName: string | null;
      events: Map<string, {
        eventId: string;
        eventTitle: string;
        eventDate: Date;
        members: Array<{ name: string | null; email: string | null; userId: string; status: string; completedAt: Date | null }>;
      }>;
    }>();

    for (const p of participations) {
      const eId = p.enterpriseId!;
      if (!enterpriseMap.has(eId)) {
        enterpriseMap.set(eId, {
          enterpriseId: eId,
          enterpriseName: p.enterpriseName,
          events: new Map(),
        });
      }
      const ent = enterpriseMap.get(eId)!;
      const evtId = p.event.id;
      if (!ent.events.has(evtId)) {
        ent.events.set(evtId, {
          eventId: evtId,
          eventTitle: p.event.title,
          eventDate: p.event.startDate,
          members: [],
        });
      }
      ent.events.get(evtId)!.members.push({
        name: p.participantName,
        email: p.participantEmail,
        userId: p.userId,
        status: p.status,
        completedAt: p.completedAt,
      });
    }

    // Build report
    const enterprises = Array.from(enterpriseMap.values()).map((ent) => ({
      enterpriseId: ent.enterpriseId,
      enterpriseName: ent.enterpriseName,
      totalEventsCompleted: ent.events.size,
      totalMembersParticipated: new Set(
        Array.from(ent.events.values()).flatMap((e) => e.members.map((m) => m.userId)),
      ).size,
      events: Array.from(ent.events.values()).map((e) => ({
        eventId: e.eventId,
        eventTitle: e.eventTitle,
        eventDate: e.eventDate,
        membersAttended: e.members.length,
        members: e.members,
      })),
    }));

    // Summary stats
    const totalEnterprises = enterprises.length;
    const totalCompletions = enterprises.reduce((s, e) => s + e.totalEventsCompleted, 0);

    return reply.send({
      success: true,
      data: {
        summary: {
          totalEnterprises,
          totalTrainingCompletions: totalCompletions,
        },
        enterprises,
      },
    });
  });

  // ── Analytics: Sector Breakdown ───────────────────────────────────────────

  app.get('/analytics/sectors', async (request, reply) => {
    requireAdmin(request.user.role);

    const events = await app.prisma.event.findMany({
      where: { targetSector: { not: null } },
      select: {
        targetSector: true,
        status: true,
        _count: { select: { participations: true } },
      },
    });

    const sectorMap = new Map<string, { events: number; completedEvents: number; participants: number }>();
    for (const e of events) {
      const key = e.targetSector!;
      const entry = sectorMap.get(key) ?? { events: 0, completedEvents: 0, participants: 0 };
      entry.events++;
      if (e.status === 'COMPLETED') entry.completedEvents++;
      entry.participants += e._count.participations;
      sectorMap.set(key, entry);
    }

    const sectors = Array.from(sectorMap.entries())
      .map(([sector, stats]) => ({ sector, ...stats }))
      .sort((a, b) => b.participants - a.participants);

    return reply.send({ success: true, data: sectors });
  });

  // ── Analytics: Impact Survey Timeseries ───────────────────────────────────

  app.get('/analytics/impact-timeseries', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      months: z.coerce.number().min(1).max(24).default(12),
    }).parse(request.query);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - query.months);

    const responses = await app.prisma.impactSurveyResponse.findMany({
      where: { status: 'SUBMITTED', submittedAt: { gte: startDate } },
      select: {
        submittedAt: true,
        knowledgeApplication: true,
        skillImprovement: true,
        businessImpact: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    const monthlyMap = new Map<string, { count: number; knowledge: number[]; skills: number[]; business: number[] }>();
    for (const r of responses) {
      if (!r.submittedAt) continue;
      const key = `${r.submittedAt.getFullYear()}-${String(r.submittedAt.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) ?? { count: 0, knowledge: [], skills: [], business: [] };
      entry.count++;
      if (r.knowledgeApplication != null) entry.knowledge.push(r.knowledgeApplication);
      if (r.skillImprovement != null) entry.skills.push(r.skillImprovement);
      if (r.businessImpact != null) entry.business.push(r.businessImpact);
      monthlyMap.set(key, entry);
    }

    const avg = (arr: number[]) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    const timeseries = Array.from(monthlyMap.entries()).map(([month, d]) => ({
      month,
      responses: d.count,
      avgKnowledge: avg(d.knowledge),
      avgSkills: avg(d.skills),
      avgBusiness: avg(d.business),
    }));

    return reply.send({ success: true, data: timeseries });
  });

  // ── Analytics: Comprehensive Overview ─────────────────────────────────────

  app.get('/analytics/overview', async (request, reply) => {
    requireAdmin(request.user.role);

    const [
      totalEvents,
      completedEvents,
      ongoingEvents,
      totalParticipations,
      totalCerts,
      issuedCerts,
      totalCsf,
      submittedCsf,
      totalImpact,
      submittedImpact,
      sectorCounts,
      recentEvents,
    ] = await Promise.all([
      app.prisma.event.count(),
      app.prisma.event.count({ where: { status: 'COMPLETED' } }),
      app.prisma.event.count({ where: { status: 'ONGOING' } }),
      app.prisma.eventParticipation.count(),
      app.prisma.certificate.count(),
      app.prisma.certificate.count({ where: { status: 'ISSUED' } }),
      app.prisma.csfSurveyResponse.count(),
      app.prisma.csfSurveyResponse.count({ where: { status: 'SUBMITTED' } }),
      app.prisma.impactSurveyResponse.count(),
      app.prisma.impactSurveyResponse.count({ where: { status: 'SUBMITTED' } }),
      app.prisma.event.groupBy({ by: ['targetSector'], _count: true, orderBy: { _count: { targetSector: 'desc' } }, take: 10 }),
      app.prisma.event.findMany({
        where: { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'ONGOING'] } },
        orderBy: { startDate: 'asc' },
        take: 5,
        select: { id: true, title: true, startDate: true, status: true, _count: { select: { participations: true } } },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        events: { total: totalEvents, completed: completedEvents, ongoing: ongoingEvents },
        participations: { total: totalParticipations },
        certificates: { total: totalCerts, issued: issuedCerts },
        surveys: {
          csf: { total: totalCsf, submitted: submittedCsf, rate: totalCsf > 0 ? Math.round((submittedCsf / totalCsf) * 100) : 0 },
          impact: { total: totalImpact, submitted: submittedImpact, rate: totalImpact > 0 ? Math.round((submittedImpact / totalImpact) * 100) : 0 },
        },
        topSectors: sectorCounts.filter(s => s.targetSector).map(s => ({ sector: s.targetSector, count: s._count })),
        upcomingEvents: recentEvents,
      },
    });
  });
};
