import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError } from '@dti-ems/shared-errors';

const updateProfileSchema = z.object({
  firstName:              z.string().min(1).max(100).optional(),
  lastName:               z.string().min(1).max(100).optional(),
  middleName:             z.string().max(100).optional().nullable(),
  mobileNumber:           z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number').optional().nullable(),
  region:                 z.string().max(100).optional().nullable(),
  province:               z.string().max(100).optional().nullable(),
  cityMunicipality:       z.string().max(100).optional().nullable(),
  barangay:               z.string().max(100).optional().nullable(),
  jobTitle:               z.string().max(200).optional().nullable(),
  industryClassification: z.string().max(200).optional().nullable(),
});

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
const STAFF_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // All user routes require authentication
  app.addHook('preHandler', app.verifyJwt);

  // GET /users/me
  app.get('/me', async (request, reply) => {
    const user = await app.prisma.userProfile.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true, email: true, role: true, status: true,
        firstName: true, lastName: true, middleName: true, mobileNumber: true,
        region: true, province: true, cityMunicipality: true, barangay: true,
        jobTitle: true, industryClassification: true,
        dpaConsentGiven: true, dpaConsentAt: true,
        emailVerified: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return reply.send({ success: true, data: user });
  });

  // PATCH /users/me
  app.patch('/me', async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);

    const updated = await app.prisma.userProfile.update({
      where: { id: request.user.sub },
      data: body,
      select: {
        id: true, email: true, role: true, status: true,
        firstName: true, lastName: true, middleName: true, mobileNumber: true,
        region: true, province: true, cityMunicipality: true, barangay: true,
        jobTitle: true, industryClassification: true,
        updatedAt: true,
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // GET /users/staff — search staff members (organizers + admins can call)
  app.get('/staff', async (request, reply) => {
    if (!STAFF_ROLES.includes(request.user.role as typeof STAFF_ROLES[number])) {
      throw new ForbiddenError('Only staff members can search staff.');
    }

    const { search } = z.object({
      search: z.string().min(1).max(100).optional(),
    }).parse(request.query);

    const where: Record<string, unknown> = {
      role: { in: [...STAFF_ROLES] },
      status: 'ACTIVE',
    };

    if (search) {
      where['OR'] = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await app.prisma.userProfile.findMany({
      where,
      take: 15,
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return reply.send({ success: true, data: users });
  });

  // GET /users — admin only
  app.get('/', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can list all users.');
    }

    const query = z.object({
      page:   z.coerce.number().min(1).default(1),
      limit:  z.coerce.number().min(1).max(100).default(20),
      status: z.string().optional(),
      role:   z.string().optional(),
      search: z.string().optional(),
    }).parse(request.query);

    const { page, limit, status, role, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (role)   where['role']   = role;
    if (search) {
      where['OR'] = [
        { email:     { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      app.prisma.userProfile.count({ where }),
      app.prisma.userProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, status: true,
          firstName: true, lastName: true, mobileNumber: true,
          region: true, emailVerified: true, lastLoginAt: true,
          createdAt: true,
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // GET /users/:id — admin only
  app.get('/:id', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can view user details.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const user = await app.prisma.userProfile.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, status: true,
        firstName: true, lastName: true, middleName: true, mobileNumber: true,
        region: true, province: true, cityMunicipality: true, barangay: true,
        jobTitle: true, industryClassification: true,
        dpaConsentGiven: true, dpaConsentAt: true,
        emailVerified: true, emailVerifiedAt: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return reply.send({ success: true, data: user });
  });

  // PATCH /users/:id/status — admin only
  app.patch('/:id/status', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can change user status.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status, reason } = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
      reason: z.string().min(1),
    }).parse(request.body);

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    const updated = await app.prisma.userProfile.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: `STATUS_CHANGE:${status}`,
        entityType: 'UserProfile',
        entityId: id,
        oldData: { status: existing.status },
        newData: { status, reason },
      },
    });

    return reply.send({ success: true, data: updated });
  });
};
