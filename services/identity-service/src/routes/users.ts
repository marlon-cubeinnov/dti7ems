import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import argon2 from 'argon2';
import { ConflictError, ForbiddenError, NotFoundError } from '@dti-ems/shared-errors';
import type { UserRole } from '@dti-ems/shared-types';
import { ASSIGNABLE_USER_ROLE_VALUES, USER_ROLE_VALUES, derivePrimaryRole } from '@dti-ems/shared-types';

const SEX_VALUES = ['MALE', 'FEMALE'] as const;
const AGE_BRACKET_VALUES = ['AGE_19_OR_LOWER', 'AGE_20_TO_34', 'AGE_35_TO_49', 'AGE_50_TO_64', 'AGE_65_OR_HIGHER'] as const;
const EMPLOYMENT_CATEGORY_VALUES = ['SELF_EMPLOYED', 'EMPLOYED_GOVT', 'EMPLOYED_PRIVATE', 'GENERAL_PUBLIC'] as const;
const SOCIAL_CLASSIFICATION_VALUES = ['ABLED', 'PWD', 'FOUR_PS', 'YOUTH', 'SENIOR_CITIZEN', 'INDIGENOUS_PERSON', 'OFW', 'OTHERS'] as const;
const CLIENT_TYPE_VALUES = ['CITIZEN', 'BUSINESS', 'GOVERNMENT'] as const;
const USER_ROLE_SCHEMA = z.enum(USER_ROLE_VALUES);
const ASSIGNABLE_USER_ROLE_SCHEMA = z.enum(ASSIGNABLE_USER_ROLE_VALUES);

const updateProfileSchema = z.object({
  firstName:              z.string().min(1).max(100).optional(),
  lastName:               z.string().min(1).max(100).optional(),
  middleName:             z.string().max(100).optional().nullable(),
  nameSuffix:             z.string().max(20).optional().nullable(),
  mobileNumber:           z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number').optional().nullable(),
  sex:                    z.enum(SEX_VALUES).optional().nullable(),
  ageBracket:             z.enum(AGE_BRACKET_VALUES).optional().nullable(),
  employmentCategory:     z.enum(EMPLOYMENT_CATEGORY_VALUES).optional().nullable(),
  socialClassification:   z.enum(SOCIAL_CLASSIFICATION_VALUES).optional().nullable(),
  clientType:             z.enum(CLIENT_TYPE_VALUES).optional().nullable(),
  region:                 z.string().max(100).optional().nullable(),
  province:               z.string().max(100).optional().nullable(),
  cityMunicipality:       z.string().max(100).optional().nullable(),
  barangay:               z.string().max(100).optional().nullable(),
  jobTitle:               z.string().max(200).optional().nullable(),
  industryClassification: z.string().max(200).optional().nullable(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional().nullable(),
  mobileNumber: z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid PH mobile number').optional().nullable(),
  role: ASSIGNABLE_USER_ROLE_SCHEMA.optional(),
  roles: z.array(ASSIGNABLE_USER_ROLE_SCHEMA).min(1).optional(),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'SUSPENDED', 'DEACTIVATED']).default('ACTIVE'),
  region: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  cityMunicipality: z.string().max(100).optional().nullable(),
  barangay: z.string().max(100).optional().nullable(),
  jobTitle: z.string().max(200).optional().nullable(),
  industryClassification: z.string().max(200).optional().nullable(),
  employmentCategory: z.enum(EMPLOYMENT_CATEGORY_VALUES).optional().nullable(),
  socialClassification: z.enum(SOCIAL_CLASSIFICATION_VALUES).optional().nullable(),
  clientType: z.enum(CLIENT_TYPE_VALUES).optional().nullable(),
});

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
const STAFF_ROLES = ['DTI_EMPLOYEE', 'PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'DIVISION_CHIEF', 'REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

function normalizeRoles(role?: UserRole, roles?: UserRole[]): UserRole[] {
  return Array.from(new Set(roles?.length ? roles : role ? [role] : ['PARTICIPANT']));
}

export const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // All user routes require authentication
  app.addHook('preHandler', app.verifyJwt);

  // GET /users/me
  app.get('/me', async (request, reply) => {
    const user = await app.prisma.userProfile.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true, email: true, role: true, status: true,
        roles: true,
        firstName: true, lastName: true, middleName: true, nameSuffix: true, mobileNumber: true,
        sex: true, ageBracket: true, employmentCategory: true, socialClassification: true, clientType: true,
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
        roles: true,
        firstName: true, lastName: true, middleName: true, nameSuffix: true, mobileNumber: true,
        sex: true, ageBracket: true, employmentCategory: true, socialClassification: true, clientType: true,
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
      // Match each word of the query against first/last name or email, so a full
      // display name like "DTI Employee Four" still matches even though it's
      // split across the firstName/lastName columns.
      const terms = search.trim().split(/\s+/).filter(Boolean);
      where['AND'] = terms.map((term) => ({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName:  { contains: term, mode: 'insensitive' } },
          { email:     { contains: term, mode: 'insensitive' } },
        ],
      }));
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
    if (role)   where['OR']     = [{ role }, { roles: { has: role as typeof USER_ROLE_VALUES[number] } }];
    if (search) {
      const searchOr = [
        { email:     { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
      ];
      if (where['OR']) {
        where['AND'] = [{ OR: where['OR'] as Record<string, unknown>[] }, { OR: searchOr }];
        delete where['OR'];
      } else {
        where['OR'] = searchOr;
      }
    }

    const [total, users] = await Promise.all([
      app.prisma.userProfile.count({ where }),
      app.prisma.userProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, roles: true, status: true,
          firstName: true, lastName: true, mobileNumber: true,
          region: true, emailVerified: true, lastLoginAt: true,
          employmentCategory: true, socialClassification: true, clientType: true,
          industryClassification: true,
          enterpriseMemberships: {
            where: { isActive: true, status: 'ACTIVE' },
            take: 1,
            select: {
              enterprise: { select: { businessName: true } },
            },
          },
          createdAt: true,
        },
      }),
    ]);

    const normalizedUsers = users.map((u) => {
      const enterpriseName = u.enterpriseMemberships[0]?.enterprise?.businessName ?? null;
      const companyOrOffice = enterpriseName ?? u.industryClassification ?? null;
      return {
        ...u,
        companyOrOffice,
        classificationCategory: u.socialClassification ?? u.clientType ?? u.employmentCategory ?? null,
      };
    });

    return reply.send({
      success: true,
      data: normalizedUsers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // POST /users — admin create user
  app.post('/', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can create users.');
    }

    const body = createUserSchema.parse(request.body);
    const roles = normalizeRoles(body.role, body.roles);
    const primaryRole = derivePrimaryRole(roles);

    const existing = await app.prisma.userProfile.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new ConflictError('A user with this email already exists.');
    }

    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });

    const created = await app.prisma.userProfile.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName ?? null,
        mobileNumber: body.mobileNumber ?? null,
        role: primaryRole,
        roles,
        status: body.status,
        region: body.region ?? null,
        province: body.province ?? null,
        cityMunicipality: body.cityMunicipality ?? null,
        barangay: body.barangay ?? null,
        jobTitle: body.jobTitle ?? null,
        industryClassification: body.industryClassification ?? null,
        employmentCategory: body.employmentCategory ?? null,
        socialClassification: body.socialClassification ?? null,
        clientType: body.clientType ?? null,
        dpaConsentGiven: true,
        dpaConsentAt: new Date(),
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        roles: true,
        status: true,
        createdAt: true,
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'USER_CREATED',
        entityType: 'UserProfile',
        entityId: created.id,
        oldData: {},
        newData: {
          email: created.email,
          role: created.role,
          roles: created.roles,
          status: created.status,
        },
      },
    });

    return reply.code(201).send({ success: true, data: created });
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
        id: true, email: true, role: true, roles: true, status: true,
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

  // PATCH /users/:id/status — admin or staff (staff may only approve pending accounts)
  app.patch('/:id/status', async (request, reply) => {
    const callerRole = request.user.role;
    const isAdmin = ADMIN_ROLES.includes(callerRole as typeof ADMIN_ROLES[number]);
    const isStaff = STAFF_ROLES.includes(callerRole as typeof STAFF_ROLES[number]);
    if (!isAdmin && !isStaff) {
      throw new ForbiddenError('Only administrators or staff can change user status.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status, reason } = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'PENDING_APPROVAL']),
      reason: z.string().min(1),
    }).parse(request.body);

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    // Non-admin staff may only approve pending accounts
    if (!isAdmin && isStaff) {
      if (existing.status !== 'PENDING_APPROVAL' || status !== 'ACTIVE') {
        throw new ForbiddenError('Staff may only approve pending accounts.');
      }
    }

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

  // PATCH /users/:id — admin edit user profile
  app.patch('/:id', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can edit user profiles.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = updateProfileSchema.parse(request.body);

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    const updated = await app.prisma.userProfile.update({
      where: { id },
      data: body,
      select: {
        id: true, email: true, role: true, roles: true, status: true,
        firstName: true, lastName: true, middleName: true, mobileNumber: true,
        region: true, province: true, cityMunicipality: true, barangay: true,
        jobTitle: true, industryClassification: true,
        emailVerified: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'PROFILE_EDIT',
        entityType: 'UserProfile',
        entityId: id,
        oldData: { firstName: existing.firstName, lastName: existing.lastName, mobileNumber: existing.mobileNumber, region: existing.region },
        newData: body,
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // DELETE /users/:id — admin only
  app.delete('/:id', async (request, reply) => {
    if (!ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number])) {
      throw new ForbiddenError('Only administrators can delete users.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    // Prevent self-deletion
    if (id === request.user.sub) {
      throw new ForbiddenError('You cannot delete your own account.');
    }

    const existing = await app.prisma.userProfile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('User not found');

    // Prevent deleting other admins
    if (ADMIN_ROLES.includes(existing.role as typeof ADMIN_ROLES[number]) && existing.role === 'SUPER_ADMIN') {
      throw new ForbiddenError('Cannot delete a Super Admin account.');
    }

    await app.prisma.userProfile.delete({ where: { id } });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'USER_DELETED',
        entityType: 'UserProfile',
        entityId: id,
        oldData: { email: existing.email, firstName: existing.firstName, lastName: existing.lastName, role: existing.role, roles: existing.roles },
        newData: {},
      },
    });

    return reply.send({ success: true, message: 'User deleted successfully.' });
  });
};
