import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

function requireAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
    throw new ForbiddenError('Only administrators can access this resource.');
  }
}

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // ── System-wide stats ─────────────────────────────────────────────────────

  app.get('/stats', async (request, reply) => {
    requireAdmin(request.user.role);

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalEnterprises,
      verifiedEnterprises,
      roleCounts,
      recentUsers,
    ] = await Promise.all([
      app.prisma.userProfile.count(),
      app.prisma.userProfile.count({ where: { status: 'ACTIVE' } }),
      app.prisma.userProfile.count({ where: { status: 'PENDING_VERIFICATION' } }),
      app.prisma.userProfile.count({ where: { status: 'SUSPENDED' } }),
      app.prisma.enterpriseProfile.count(),
      app.prisma.enterpriseProfile.count({ where: { isVerified: true } }),
      app.prisma.userProfile.groupBy({ by: ['role'], _count: true }),
      app.prisma.userProfile.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
          recentSignups: recentUsers,
          byRole: Object.fromEntries(roleCounts.map(r => [r.role, r._count])),
        },
        enterprises: {
          total: totalEnterprises,
          verified: verifiedEnterprises,
          unverified: totalEnterprises - verifiedEnterprises,
        },
      },
    });
  });

  // ── Role change ───────────────────────────────────────────────────────────

  app.patch('/users/:id/role', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { role } = z.object({
      role: z.enum(['PARTICIPANT', 'ENTERPRISE_REPRESENTATIVE', 'PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN']),
    }).parse(request.body);

    // Only SUPER_ADMIN can grant admin roles
    if (['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role) && request.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Only Super Admins can grant admin roles.');
    }

    // Cannot change own role
    if (id === request.user.sub) {
      throw new BadRequestError('You cannot change your own role.', ErrorCode.VALIDATION_ERROR);
    }

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    const updated = await app.prisma.userProfile.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: `ROLE_CHANGE:${role}`,
        entityType: 'UserProfile',
        entityId: id,
        oldData: { role: existing.role },
        newData: { role },
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Force verify email ────────────────────────────────────────────────────

  app.patch('/users/:id/verify-email', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    if (existing.emailVerified) {
      return reply.send({ success: true, message: 'Email is already verified.' });
    }

    const updated = await app.prisma.userProfile.update({
      where: { id },
      data: { emailVerified: true, status: 'ACTIVE' },
      select: { id: true, email: true, emailVerified: true, status: true },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ADMIN_VERIFY_EMAIL',
        entityType: 'UserProfile',
        entityId: id,
        oldData: { emailVerified: false, status: existing.status },
        newData: { emailVerified: true, status: 'ACTIVE' },
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Audit logs ────────────────────────────────────────────────────────────

  app.get('/audit-logs', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      page:       z.coerce.number().min(1).default(1),
      limit:      z.coerce.number().min(1).max(100).default(25),
      userId:     z.string().optional(),
      entityType: z.string().optional(),
      action:     z.string().optional(),
      from:       z.string().datetime().optional(),
      to:         z.string().datetime().optional(),
    }).parse(request.query);

    const { page, limit, userId, entityType, action, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId)     where['userId']     = userId;
    if (entityType) where['entityType'] = entityType;
    if (action)     where['action']     = { contains: action, mode: 'insensitive' };
    if (from || to) {
      where['createdAt'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to   ? { lte: new Date(to) }   : {}),
      };
    }

    const [total, logs] = await Promise.all([
      app.prisma.auditLog.count({ where }),
      app.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // ── All enterprises (admin list) ──────────────────────────────────────────

  app.get('/enterprises', async (request, reply) => {
    requireAdmin(request.user.role);

    const query = z.object({
      page:     z.coerce.number().min(1).default(1),
      limit:    z.coerce.number().min(1).max(100).default(20),
      search:   z.string().optional(),
      sector:   z.string().optional(),
      stage:    z.string().optional(),
      verified: z.enum(['true', 'false']).optional(),
    }).parse(request.query);

    const { page, limit, search, sector, stage, verified } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (sector) where['industrySector'] = { contains: sector, mode: 'insensitive' };
    if (stage)  where['stage'] = stage;
    if (verified !== undefined) where['isVerified'] = verified === 'true';
    if (search) {
      where['OR'] = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { tradeName:    { contains: search, mode: 'insensitive' } },
        { tinNumber:    { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, enterprises] = await Promise.all([
      app.prisma.enterpriseProfile.count({ where }),
      app.prisma.enterpriseProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: enterprises,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // ── Enterprise stage counts ───────────────────────────────────────────────

  app.get('/enterprises/stats', async (request, reply) => {
    requireAdmin(request.user.role);

    const [stageCounts, sectorCounts] = await Promise.all([
      app.prisma.enterpriseProfile.groupBy({ by: ['stage'], _count: true }),
      app.prisma.enterpriseProfile.groupBy({ by: ['industrySector'], _count: true, orderBy: { _count: { industrySector: 'desc' } }, take: 15 }),
    ]);

    return reply.send({
      success: true,
      data: {
        byStage: Object.fromEntries(stageCounts.map(s => [s.stage, s._count])),
        topSectors: sectorCounts.map(s => ({ sector: s.industrySector, count: s._count })),
      },
    });
  });
};
