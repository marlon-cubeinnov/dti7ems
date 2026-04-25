import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ConflictError, ForbiddenError, NotFoundError } from '@dti-ems/shared-errors';
import { AuthService } from '../services/auth.service.js';

const createEnterpriseSchema = z.object({
  businessName:    z.string().min(1).max(300),
  tradeName:       z.string().max(300).optional().nullable(),
  registrationNo:  z.string().max(100).optional().nullable(),
  tinNumber:       z.string().max(20).optional().nullable(),
  industrySector:  z.string().min(1).max(200),
  industryTags:    z.array(z.string()).default([]),
  stage:           z.enum(['PRE_STARTUP', 'STARTUP', 'GROWTH', 'EXPANSION', 'MATURE']).default('STARTUP'),
  employeeCount:   z.number().int().min(1).optional().nullable(),
  annualRevenue:   z.string().optional().nullable(),
  region:          z.string().max(100).optional().nullable(),
  province:        z.string().max(100).optional().nullable(),
  cityMunicipality: z.string().max(100).optional().nullable(),
  barangay:        z.string().max(100).optional().nullable(),
  latitude:        z.number().min(-90).max(90).optional().nullable(),
  longitude:       z.number().min(-180).max(180).optional().nullable(),
  isPubliclyListed: z.boolean().default(false),
});

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

export const enterpriseRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);
  const authService = new AuthService(app);

  // GET /enterprises/my — get current user's enterprise profiles
  app.get('/my', async (request, reply) => {
    const enterprises = await app.prisma.enterpriseProfile.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, data: enterprises });
  });

  // POST /enterprises — create enterprise profile
  app.post('/', async (request, reply) => {
    const body = createEnterpriseSchema.parse(request.body);

    // Dedup check: warn if a similar business name exists (case-insensitive)
    const normalizedName = body.businessName.trim().toLowerCase();
    const existing = await app.prisma.enterpriseProfile.findFirst({
      where: {
        businessName: { equals: normalizedName, mode: 'insensitive' },
      },
      select: { id: true, businessName: true },
    });
    if (existing) {
      return reply.code(409).send({
        success: false,
        error: {
          code: 'ENTERPRISE_DUPLICATE',
          message: `A company named "${existing.businessName}" already exists in the system. If this is your company, contact the System Administrator to link your account instead of creating a duplicate.`,
        },
      });
    }

    const enterprise = await app.prisma.$transaction(async (tx) => {
      const ent = await tx.enterpriseProfile.create({
        data: {
          ...body,
          latitude:  body.latitude  ? body.latitude.toString()  : undefined,
          longitude: body.longitude ? body.longitude.toString() : undefined,
          userId: request.user.sub,
        },
      });

      // Auto-create OWNER membership for creator
      await tx.enterpriseMembership.create({
        data: {
          enterpriseId: ent.id,
          userId: request.user.sub,
          role: 'OWNER',
        },
      });

      return ent;
    });

    return reply.code(201).send({ success: true, data: enterprise });
  });

  // GET /enterprises/:id
  app.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise profile not found');

    // Only owner or admin can view non-public profiles
    const isOwner = enterprise.userId === request.user.sub;
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    if (!enterprise.isPubliclyListed && !isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have access to this enterprise profile.');
    }

    return reply.send({ success: true, data: enterprise });
  });

  // PATCH /enterprises/:id
  app.patch('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise profile not found');

    const isOwner = enterprise.userId === request.user.sub;
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You can only update your own enterprise profile.');
    }

    const body = createEnterpriseSchema.partial().parse(request.body);
    const updated = await app.prisma.enterpriseProfile.update({
      where: { id },
      data: {
        ...body,
        latitude:  body.latitude  != null ? body.latitude.toString()  : undefined,
        longitude: body.longitude != null ? body.longitude.toString() : undefined,
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // PATCH /enterprises/:id/verify — admin only
  app.patch('/:id/verify', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can verify enterprise profiles.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const updated = await app.prisma.enterpriseProfile.update({
      where: { id },
      data: { isVerified: true },
      select: { id: true, businessName: true, isVerified: true },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ENTERPRISE_VERIFIED',
        entityType: 'EnterpriseProfile',
        entityId: id,
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Membership routes ────────────────────────────────────────────────────

  // GET /enterprises/my-membership — get current user's active or pending enterprise membership
  app.get('/my-membership', async (request, reply) => {
    const membership = await app.prisma.enterpriseMembership.findFirst({
      where: {
        userId: request.user.sub,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: {
        enterprise: {
          select: { id: true, businessName: true, industrySector: true, stage: true, isVerified: true },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return reply.send({ success: true, data: membership });
  });

  // GET /enterprises/:id/members — list members of an enterprise
  app.get('/:id/members', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    // Only members, owner, or admins can view members
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const isMember = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    if (!isAdmin && !isMember) {
      throw new ForbiddenError('You do not have access to this enterprise.');
    }

    const members = await app.prisma.enterpriseMembership.findMany({
      where: { enterpriseId: id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return reply.send({ success: true, data: members });
  });

  // POST /enterprises/:id/members — add a member (by email)
  app.post('/:id/members', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { email, role } = z.object({
      email: z.string().email(),
      role:  z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    }).parse(request.body);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    // Only owner/admin of enterprise, or system admin can add members
    const isSystemAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerOrAdmin = callerMembership && ['OWNER', 'ADMIN'].includes(callerMembership.role);
    if (!isSystemAdmin && !isOwnerOrAdmin) {
      throw new ForbiddenError('Only enterprise owners or admins can add members.');
    }

    // Find target user
    const targetUser = await app.prisma.userProfile.findUnique({ where: { email } });
    if (!targetUser) throw new NotFoundError('No user found with that email address.');

    // Check if already a member
    const existing = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: targetUser.id } },
    });
    if (existing) {
      if (existing.isActive) {
        throw new ConflictError('This user is already a member of this enterprise.');
      }
      // Reactivate
      const reactivated = await app.prisma.enterpriseMembership.update({
        where: { id: existing.id },
        data: { isActive: true, status: 'ACTIVE', role },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      });
      return reply.send({ success: true, data: reactivated });
    }

    const membership = await app.prisma.enterpriseMembership.create({
      data: {
        enterpriseId: id,
        userId: targetUser.id,
        role,
        status: 'ACTIVE',
      },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });

    return reply.code(201).send({ success: true, data: membership });
  });

  // POST /enterprises/:id/invite-employee — invite a new employee (creates user + sends email)
  app.post('/:id/invite-employee', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({
      email:     z.string().email(),
      firstName: z.string().min(1).max(100),
      lastName:  z.string().min(1).max(100),
      jobTitle:  z.string().max(200).optional().nullable(),
    }).parse(request.body);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    // Only owner/admin or system admin can invite
    const isSystemAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerOrAdmin = callerMembership && ['OWNER', 'ADMIN'].includes(callerMembership.role);
    if (!isSystemAdmin && !isOwnerOrAdmin) {
      throw new ForbiddenError('Only enterprise owners or admins can invite employees.');
    }

    const invited = await authService.inviteEmployee(request.user.sub, id, body);
    return reply.code(201).send({ success: true, data: invited, message: 'Employee invitation sent.' });
  });

  // DELETE /enterprises/:id/members/:userId — remove a member
  app.delete('/:id/members/:userId', async (request, reply) => {
    const { id, userId } = z.object({
      id:     z.string(),
      userId: z.string(),
    }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isSystemAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerOrAdmin = callerMembership && ['OWNER', 'ADMIN'].includes(callerMembership.role);
    const isSelf = userId === request.user.sub;

    if (!isSystemAdmin && !isOwnerOrAdmin && !isSelf) {
      throw new ForbiddenError('You do not have permission to remove this member.');
    }

    const membership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId } },
    });
    if (!membership) throw new NotFoundError('Membership not found');

    if (membership.role === 'OWNER' && !isSystemAdmin) {
      throw new ForbiddenError('Cannot remove the enterprise owner.');
    }

    await app.prisma.enterpriseMembership.update({
      where: { id: membership.id },
      data: { isActive: false, status: 'INACTIVE' },
    });

    return reply.send({ success: true, message: 'Member removed.' });
  });

  // POST /enterprises/:id/join-request — any authenticated user can request to join
  app.post('/:id/join-request', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    // Check for existing membership / request
    const existing = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });

    if (existing) {
      if (existing.status === 'ACTIVE') throw new ConflictError('You are already a member of this enterprise.');
      if (existing.status === 'PENDING') throw new ConflictError('You already have a pending join request for this enterprise.');
      // Rejected or inactive — allow re-requesting
      const updated = await app.prisma.enterpriseMembership.update({
        where: { id: existing.id },
        data: { status: 'PENDING', isActive: false, role: 'MEMBER' },
      });
      return reply.send({ success: true, data: updated, message: 'Join request submitted.' });
    }

    const membership = await app.prisma.enterpriseMembership.create({
      data: {
        enterpriseId: id,
        userId: request.user.sub,
        role: 'MEMBER',
        status: 'PENDING',
        isActive: false,
      },
    });

    return reply.code(201).send({ success: true, data: membership, message: 'Join request submitted. Await approval from the company owner.' });
  });

  // GET /enterprises/:id/join-requests — list pending join requests (owner/admin only)
  app.get('/:id/join-requests', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isSystemAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerOrAdmin = callerMembership && ['OWNER', 'ADMIN'].includes(callerMembership.role);

    if (!isSystemAdmin && !isOwnerOrAdmin) {
      throw new ForbiddenError('Only enterprise owners or admins can view join requests.');
    }

    const requests = await app.prisma.enterpriseMembership.findMany({
      where: { enterpriseId: id, status: 'PENDING' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, jobTitle: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return reply.send({ success: true, data: requests });
  });

  // PATCH /enterprises/:id/join-requests/:membershipId — approve or reject
  app.patch('/:id/join-requests/:membershipId', async (request, reply) => {
    const { id, membershipId } = z.object({
      id:           z.string(),
      membershipId: z.string(),
    }).parse(request.params);
    const { action } = z.object({
      action: z.enum(['APPROVE', 'REJECT']),
    }).parse(request.body);

    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isSystemAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerOrAdmin = callerMembership && ['OWNER', 'ADMIN'].includes(callerMembership.role);

    if (!isSystemAdmin && !isOwnerOrAdmin) {
      throw new ForbiddenError('Only enterprise owners or admins can respond to join requests.');
    }

    const pending = await app.prisma.enterpriseMembership.findUnique({ where: { id: membershipId } });
    if (!pending || pending.enterpriseId !== id || pending.status !== 'PENDING') {
      throw new NotFoundError('Pending join request not found.');
    }

    const updated = await app.prisma.enterpriseMembership.update({
      where: { id: membershipId },
      data: {
        status:   action === 'APPROVE' ? 'ACTIVE'    : 'REJECTED',
        isActive: action === 'APPROVE',
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // DELETE /enterprises/:id — admin only
  app.delete('/:id', async (request, reply) => {
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    if (!isAdmin) {
      throw new ForbiddenError('Only administrators can delete enterprise profiles.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    await app.prisma.enterpriseProfile.delete({ where: { id } });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ENTERPRISE_DELETED',
        entityType: 'EnterpriseProfile',
        entityId: id,
      },
    });

    return reply.send({ success: true });
  });
};
