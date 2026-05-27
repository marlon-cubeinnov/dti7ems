import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@dti-ems/shared-errors';
import { AuthService } from '../services/auth.service.js';

// Coerce null → Prisma.JsonNull for nullable JSON columns
function j(v: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (v === undefined) return undefined;
  if (v === null) return Prisma.JsonNull;
  return v as Prisma.InputJsonValue;
}

function normalizeDateTimeInput(value: string | null | undefined, fieldName: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const raw = value.trim();
  if (!raw) return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? `${raw}T00:00:00.000Z`
    : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestError(`${fieldName} must be a valid date.`);
  }
  return parsed;
}

// ── MSME CPMS sub-schemas ──────────────────────────────────────────────────

const businessRegistrationSchema = z.object({
  type: z.enum(['DTI', 'SEC', 'DOLE', 'CDA', 'OTHERS']),
  registrationNo: z.string().max(100),
  expiry: z.string().max(20).optional().nullable(),
});

const businessPermitSchema = z.object({
  type: z.enum(['BUSINESS_PERMIT', 'BIR', 'FDA', 'BMBE', 'OTHERS']),
  permitNo: z.string().max(100),
  expiry: z.string().max(20).optional().nullable(),
});

const secondaryLicenseSchema = z.object({
  type: z.enum(['ICC', 'ISO', 'PRODUCT_STANDARD', 'OTHERS']),
  licenseNo: z.string().max(100),
  expiry: z.string().max(20).optional().nullable(),
});

const ecommercePlatformSchema = z.object({
  platform: z.enum(['SHOPEE', 'LAZADA', 'APEC', 'GO_LOKAL', 'OTHERS']),
  url: z.string().url().optional().nullable(),
});

const domesticMarketSchema = z.object({
  productService: z.string().max(200),
  region: z.string().max(100),
  province: z.string().max(100).optional().nullable(),
});

const exportMarketSchema = z.object({
  dateStarted: z.string().optional().nullable(),
  productService: z.string().max(200),
  country: z.string().max(100),
  tradeBloc: z.string().max(100).optional().nullable(),
});

const importMarketSchema = z.object({
  dateStarted: z.string().optional().nullable(),
  productCommodity: z.string().max(200),
  country: z.string().max(100),
});

const productLineSchema = z.object({
  productService: z.string().max(200),
  description: z.string().optional().nullable(),
  majorRawMaterials: z.string().optional().nullable(),
  annualProductionCapacity: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  valueVolume: z.string().optional().nullable(),
  unitOfMeasure: z.string().max(50).optional().nullable(),
});

const productCertificationSchema = z.object({
  certificationType: z.string().max(100),
  certifyingBody: z.string().max(200),
  expiryDate: z.string().optional().nullable(),
});

const digitalToolSchema = z.object({
  category: z.enum(['COLLABORATIVE_SUITES', 'COMMUNICATION', 'PROJECT_MGMT', 'ACCOUNTING_PAYROLL', 'CMS', 'CYBERSECURITY', 'CLOUD_STORAGE', 'FINTECH']),
  toolName: z.string().max(100),
});

// ── Main enterprise create/update schema (mirrors Form 01 MSME CPMS) ──────

const createEnterpriseSchema = z.object({
  // Section 1: Client IDs
  cpmsIdNumber:     z.string().max(50).optional().nullable(),
  oldCpmsIdNumber:  z.string().max(50).optional().nullable(),
  philsysNumber:    z.string().max(50).optional().nullable(),
  tinNumber:        z.string().max(20).optional().nullable(),
  dtiKonekIdNumber: z.string().max(50).optional().nullable(),

  // Section 2: MSME Status
  msmeLevel: z.enum(['LEVEL_0', 'LEVEL_1', 'LEVEL_1_1', 'LEVEL_1_2', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'CEASED']).optional().nullable(),
  levelZeroCategories:  z.array(z.string()).default([]),
  businessIsRegistered: z.boolean().optional().nullable(),

  // Section 3: Business Registration
  businessName:           z.string().min(1).max(300),
  registeredBusinessName: z.string().max(300).optional().nullable(),
  tradeName:              z.string().max(300).optional().nullable(),
  dateOfRegistration:     z.string().optional().nullable(),
  registrationNo:         z.string().max(100).optional().nullable(),
  ipoRegistrationNumber:  z.string().max(100).optional().nullable(),
  businessRegistrations:  z.array(businessRegistrationSchema).optional().nullable(),
  businessPermits:        z.array(businessPermitSchema).optional().nullable(),
  secondaryLicenses:      z.array(secondaryLicenseSchema).optional().nullable(),

  // Section 4: Business Address
  houseNo:          z.string().max(100).optional().nullable(),
  streetName:       z.string().max(200).optional().nullable(),
  streetAddress:    z.string().max(300).optional().nullable(),
  barangay:         z.string().max(100).optional().nullable(),
  district:         z.string().max(100).optional().nullable(),
  cityMunicipality: z.string().max(100).optional().nullable(),
  province:         z.string().max(100).optional().nullable(),
  region:           z.string().max(100).optional().nullable(),
  zipCode:          z.string().max(10).optional().nullable(),
  latitude:         z.number().min(-90).max(90).optional().nullable(),
  longitude:        z.number().min(-180).max(180).optional().nullable(),

  // Section 5: Business Contact Details
  businessEmail:         z.string().email().optional().nullable(),
  businessPhone:         z.string().max(30).optional().nullable(),
  businessFax:           z.string().max(30).optional().nullable(),
  websiteUrl:            z.string().url().optional().nullable(),
  socialMediaFacebook:   z.string().max(200).optional().nullable(),
  socialMediaInstagram:  z.string().max(200).optional().nullable(),
  socialMediaLinkedIn:   z.string().max(200).optional().nullable(),
  socialMediaOthers:     z.string().max(200).optional().nullable(),
  ecommercePlatforms:    z.array(ecommercePlatformSchema).optional().nullable(),

  // Section 6: Business Profile
  description:                z.string().optional().nullable(),
  yearEstablished:            z.number().int().min(1900).max(2100).optional().nullable(),
  formOfOrganization:         z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'ASSOCIATION', 'CORPORATION', 'COOPERATIVE', 'WORKERS_RURAL_ASSOCIATION', 'ONE_PERSON_CORPORATION', 'FRANCHISE']).optional().nullable(),
  assetSizeClassification:    z.enum(['MICRO', 'SMALL', 'MEDIUM', 'LARGE']).optional().nullable(),
  primaryBusinessActivity:    z.enum(['MANUFACTURING_PRODUCING', 'WHOLESALING_TRADING', 'RETAILING_TRADING', 'EXPORTING', 'IMPORTING', 'SERVICE']).optional().nullable(),
  secondaryBusinessActivity:  z.enum(['MANUFACTURING_PRODUCING', 'WHOLESALING_TRADING', 'RETAILING_TRADING', 'EXPORTING', 'IMPORTING', 'SERVICE']).optional().nullable(),
  psicSection:                z.string().max(10).optional().nullable(),
  psicDivision:               z.string().max(10).optional().nullable(),
  psicGroup:                  z.string().max(10).optional().nullable(),
  priorityIndustry:               z.string().max(200).optional().nullable(),
  industryClusterEnhancement:     z.string().max(200).optional().nullable(),
  industrySector:                 z.string().min(1).max(200),
  industryTags:                   z.array(z.string()).default([]),
  tradeAssociationAffiliations:   z.array(z.string()).default([]),
  stage:                          z.enum(['IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT']).default('VALIDATION'),
  isPubliclyListed:               z.boolean().default(false),

  // Section 7: Owner Information
  ownerPrefix:                z.string().max(20).optional().nullable(),
  ownerFirstName:             z.string().max(100).optional().nullable(),
  ownerMiddleName:            z.string().max(100).optional().nullable(),
  ownerLastName:              z.string().max(100).optional().nullable(),
  ownerSuffix:                z.string().max(20).optional().nullable(),
  ownerBirthdate:             z.string().optional().nullable(),
  ownerCitizenship:           z.string().max(100).optional().nullable(),
  ownerSex:                   z.enum(['MALE', 'FEMALE']).optional().nullable(),
  ownerCivilStatus:           z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'LEGALLY_SEPARATED']).optional().nullable(),
  ownerSocialClassification:  z.string().max(100).optional().nullable(),
  ownerHouseNo:               z.string().max(100).optional().nullable(),
  ownerStreetName:            z.string().max(200).optional().nullable(),
  ownerBarangay:              z.string().max(100).optional().nullable(),
  ownerDistrict:              z.string().max(100).optional().nullable(),
  ownerCityMunicipality:      z.string().max(100).optional().nullable(),
  ownerProvince:              z.string().max(100).optional().nullable(),
  ownerRegion:                z.string().max(100).optional().nullable(),
  ownerZipCode:               z.string().max(10).optional().nullable(),

  // Section 8: Business Trackers
  edtLevel:             z.enum(['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4']).optional().nullable(),
  ripplesStage:         z.enum(['STAGE_5', 'STAGE_6', 'STAGE_7']).optional().nullable(),
  smeraStage:           z.enum(['STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4']).optional().nullable(),
  digitalizationLevel:  z.enum(['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3']).optional().nullable(),
  digitalToolsUsed:     z.array(digitalToolSchema).optional().nullable(),
  hasEmail:             z.boolean().optional().nullable(),
  hasFacebook:          z.boolean().optional().nullable(),

  // Section 9: Financial Structure
  initialCapitalization:     z.string().optional().nullable(),
  initialCapitalizationYear: z.number().int().optional().nullable(),
  authorizedCapital:         z.string().optional().nullable(),
  subscribedCapital:         z.string().optional().nullable(),
  paidUpCapital:             z.string().optional().nullable(),
  assetSizeRange:            z.string().max(100).optional().nullable(),
  domesticSales:             z.string().optional().nullable(),
  exportSales:               z.string().optional().nullable(),
  annualRevenue:             z.string().optional().nullable(),

  // Section 10: Market Access
  domesticMarkets: z.array(domesticMarketSchema).optional().nullable(),
  exportMarkets:   z.array(exportMarketSchema).optional().nullable(),
  importMarkets:   z.array(importMarketSchema).optional().nullable(),

  // Section 11: Product/Services Line
  productLines: z.array(productLineSchema).optional().nullable(),

  // Section 12: Certifications
  productCertifications: z.array(productCertificationSchema).optional().nullable(),

  // Section 13: Employment Statistics
  ftAbledMale:        z.number().int().min(0).optional().nullable(),
  ftAbledFemale:      z.number().int().min(0).optional().nullable(),
  ftDiffAbledMale:    z.number().int().min(0).optional().nullable(),
  ftDiffAbledFemale:  z.number().int().min(0).optional().nullable(),
  ftIndigenousMale:   z.number().int().min(0).optional().nullable(),
  ftIndigenousFemale: z.number().int().min(0).optional().nullable(),
  ftSeniorMale:       z.number().int().min(0).optional().nullable(),
  ftSeniorFemale:     z.number().int().min(0).optional().nullable(),
  ptAbledMale:        z.number().int().min(0).optional().nullable(),
  ptAbledFemale:      z.number().int().min(0).optional().nullable(),
  ptDiffAbledMale:    z.number().int().min(0).optional().nullable(),
  ptDiffAbledFemale:  z.number().int().min(0).optional().nullable(),
  ptIndigenousMale:   z.number().int().min(0).optional().nullable(),
  ptIndigenousFemale: z.number().int().min(0).optional().nullable(),
  ptSeniorMale:       z.number().int().min(0).optional().nullable(),
  ptSeniorFemale:     z.number().int().min(0).optional().nullable(),
  employeeCount:      z.number().int().min(1).optional().nullable(),
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
          dateOfRegistration: normalizeDateTimeInput(body.dateOfRegistration, 'dateOfRegistration'),
          ownerBirthdate: normalizeDateTimeInput(body.ownerBirthdate, 'ownerBirthdate'),
          latitude:  body.latitude  != null ? body.latitude.toString()  : undefined,
          longitude: body.longitude != null ? body.longitude.toString() : undefined,
          initialCapitalization: body.initialCapitalization ?? undefined,
          authorizedCapital:     body.authorizedCapital     ?? undefined,
          subscribedCapital:     body.subscribedCapital     ?? undefined,
          paidUpCapital:         body.paidUpCapital         ?? undefined,
          domesticSales:         body.domesticSales         ?? undefined,
          exportSales:           body.exportSales           ?? undefined,
          annualRevenue:         body.annualRevenue         ?? undefined,
          // JSON fields
          businessRegistrations: j(body.businessRegistrations),
          businessPermits:       j(body.businessPermits),
          secondaryLicenses:     j(body.secondaryLicenses),
          ecommercePlatforms:    j(body.ecommercePlatforms),
          digitalToolsUsed:      j(body.digitalToolsUsed),
          domesticMarkets:       j(body.domesticMarkets),
          exportMarkets:         j(body.exportMarkets),
          importMarkets:         j(body.importMarkets),
          productLines:          j(body.productLines),
          productCertifications: j(body.productCertifications),
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
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
      select: { role: true, isActive: true, status: true },
    });
    const isOwnerOrAdminMember = Boolean(
      callerMembership
      && callerMembership.isActive
      && callerMembership.status === 'ACTIVE'
      && ['OWNER', 'ADMIN'].includes(callerMembership.role),
    );

    if (!isOwner && !isAdmin && !isOwnerOrAdminMember) {
      throw new ForbiddenError('You can only update your own enterprise profile.');
    }

    const body = createEnterpriseSchema.partial().parse(request.body);
    const currentYear = new Date().getFullYear();
    const updated = await app.prisma.enterpriseProfile.update({
      where: { id },
      data: {
        ...body,
        dateOfRegistration: normalizeDateTimeInput(body.dateOfRegistration, 'dateOfRegistration'),
        ownerBirthdate: normalizeDateTimeInput(body.ownerBirthdate, 'ownerBirthdate'),
        latitude:  body.latitude  != null ? body.latitude.toString()  : undefined,
        longitude: body.longitude != null ? body.longitude.toString() : undefined,
        initialCapitalization: body.initialCapitalization ?? undefined,
        authorizedCapital:     body.authorizedCapital     ?? undefined,
        subscribedCapital:     body.subscribedCapital     ?? undefined,
        paidUpCapital:         body.paidUpCapital         ?? undefined,
        domesticSales:         body.domesticSales         ?? undefined,
        exportSales:           body.exportSales           ?? undefined,
        annualRevenue:         body.annualRevenue         ?? undefined,
        // JSON fields
        businessRegistrations: j(body.businessRegistrations),
        businessPermits:       j(body.businessPermits),
        secondaryLicenses:     j(body.secondaryLicenses),
        ecommercePlatforms:    j(body.ecommercePlatforms),
        digitalToolsUsed:      j(body.digitalToolsUsed),
        domesticMarkets:       j(body.domesticMarkets),
        exportMarkets:         j(body.exportMarkets),
        importMarkets:         j(body.importMarkets),
        productLines:          j(body.productLines),
        productCertifications: j(body.productCertifications),
        // Mark annual/first-login update as fulfilled
        profileLastUpdatedAt: new Date(),
        profileLastUpdatedBy: request.user.sub,
        annualUpdateYear: currentYear,
        profileUpdateDue: false,
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

  // ── Profile Update / Annual Update Routes ───────────────────────────────────

  // Updatable fields (what primary contacts can change)
  const profileUpdateSchema = z.object({
    businessName:     z.string().min(1).max(300).optional(),
    tradeName:        z.string().max(300).optional().nullable(),
    registrationNo:   z.string().max(100).optional().nullable(),
    tinNumber:        z.string().max(20).optional().nullable(),
    businessEmail:    z.string().email().optional().nullable(),
    businessPhone:    z.string().max(50).optional().nullable(),
    websiteUrl:       z.string().url().optional().nullable(),
    description:      z.string().max(2000).optional().nullable(),
    industrySector:   z.string().min(1).max(200).optional(),
    industryTags:     z.array(z.string()).optional(),
    stage:            z.enum(['IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT']).optional(),
    employeeCount:    z.number().int().min(1).optional().nullable(),
    annualRevenue:    z.string().optional().nullable(),
    region:           z.string().max(100).optional().nullable(),
    province:         z.string().max(100).optional().nullable(),
    cityMunicipality: z.string().max(100).optional().nullable(),
    barangay:         z.string().max(100).optional().nullable(),
    streetAddress:    z.string().max(300).optional().nullable(),
    isPubliclyListed: z.boolean().optional(),
    notes:            z.string().max(500).optional().nullable(), // optional notes about this update
  });

  // GET /enterprises/:id/update-status — check if an update is due
  app.get('/:id/update-status', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isOwner = enterprise.userId === request.user.sub;
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const isMember = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    if (!isOwner && !isAdmin && !isMember) throw new ForbiddenError('Access denied.');

    const currentYear = new Date().getFullYear();
    const isAnnualDue = enterprise.profileUpdateDue || (enterprise.annualUpdateYear ?? 0) < currentYear;
    const isFirstLogin = !enterprise.profileLastUpdatedAt;

    return reply.send({
      success: true,
      data: {
        enterpriseId: id,
        updateDue: isFirstLogin || isAnnualDue,
        updateType: isFirstLogin ? 'FIRST_LOGIN' : isAnnualDue ? 'ANNUAL' : null,
        lastUpdatedAt: enterprise.profileLastUpdatedAt,
        lastUpdatedYear: enterprise.annualUpdateYear,
      },
    });
  });

  // POST /enterprises/:id/update-profile — submit annual/first-login update with diff tracking
  app.post('/:id/update-profile', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isOwner = enterprise.userId === request.user.sub;
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const callerMembership = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    const isOwnerMember = callerMembership?.role === 'OWNER';

    if (!isOwner && !isOwnerMember && !isAdmin) {
      throw new ForbiddenError('Only the primary contact (owner) can submit profile updates.');
    }

    const body = profileUpdateSchema.parse(request.body);
    const { notes, ...updateData } = body;

    // Build diff: only track fields that actually changed
    const TRACKED_FIELDS = [
      'businessName', 'tradeName', 'registrationNo', 'tinNumber',
      'businessEmail', 'businessPhone', 'websiteUrl', 'description',
      'industrySector', 'industryTags', 'stage', 'employeeCount', 'annualRevenue',
      'region', 'province', 'cityMunicipality', 'barangay', 'streetAddress', 'isPubliclyListed',
    ] as const;

    const changedFields: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
    for (const field of TRACKED_FIELDS) {
      const newVal = (updateData as Record<string, unknown>)[field];
      if (newVal === undefined) continue;
      const oldVal = (enterprise as Record<string, unknown>)[field];
      const oldStr = JSON.stringify(oldVal ?? null);
      const newStr = JSON.stringify(newVal ?? null);
      if (oldStr !== newStr) {
        changedFields.push({ field, oldValue: oldVal ?? null, newValue: newVal ?? null });
      }
    }

    const currentYear = new Date().getFullYear();
    const updateType = !enterprise.profileLastUpdatedAt ? 'FIRST_LOGIN'
      : (enterprise.profileUpdateDue || (enterprise.annualUpdateYear ?? 0) < currentYear) ? 'ANNUAL'
      : 'VOLUNTARY';

    const updated = await app.prisma.$transaction(async (tx) => {
      const ent = await tx.enterpriseProfile.update({
        where: { id },
        data: {
          ...updateData,
          annualRevenue: updateData.annualRevenue != null ? updateData.annualRevenue : undefined,
          profileUpdateDue: false,
          profileLastUpdatedAt: new Date(),
          profileLastUpdatedBy: request.user.sub,
          annualUpdateYear: currentYear,
        },
      });

      // Snapshot after update (omit internal prisma fields)
      const snapshot = {
        businessName: ent.businessName, tradeName: ent.tradeName,
        registrationNo: ent.registrationNo, tinNumber: ent.tinNumber,
        businessEmail: ent.businessEmail, businessPhone: ent.businessPhone,
        websiteUrl: ent.websiteUrl, description: ent.description,
        industrySector: ent.industrySector, industryTags: ent.industryTags,
        stage: ent.stage, employeeCount: ent.employeeCount,
        annualRevenue: ent.annualRevenue?.toString() ?? null,
        region: ent.region, province: ent.province,
        cityMunicipality: ent.cityMunicipality, barangay: ent.barangay,
        streetAddress: ent.streetAddress, isPubliclyListed: ent.isPubliclyListed,
      };

      await tx.enterpriseUpdateLog.create({
        data: {
          enterpriseId: id,
          updatedBy: request.user.sub,
          updateYear: currentYear,
          updateType,
          changedFields: changedFields as unknown as import('@prisma/client').Prisma.InputJsonValue,
          snapshotAfter: snapshot as unknown as import('@prisma/client').Prisma.InputJsonValue,
          ipAddress: request.ip ?? null,
          notes: notes ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: request.user.sub,
          action: 'ENTERPRISE_PROFILE_UPDATED',
          entityType: 'EnterpriseProfile',
          entityId: id,
          oldData: Object.fromEntries(changedFields.map((c) => [c.field, c.oldValue])) as import('@prisma/client').Prisma.InputJsonValue,
          newData: Object.fromEntries(changedFields.map((c) => [c.field, c.newValue])) as import('@prisma/client').Prisma.InputJsonValue,
        },
      });

      return ent;
    });

    return reply.send({
      success: true,
      data: updated,
      meta: { changedFields: changedFields.length, updateType },
    });
  });

  // GET /enterprises/:id/update-logs — full update history for an enterprise
  app.get('/:id/update-logs', async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const enterprise = await app.prisma.enterpriseProfile.findUnique({ where: { id } });
    if (!enterprise) throw new NotFoundError('Enterprise not found');

    const isOwner = enterprise.userId === request.user.sub;
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    const isMember = await app.prisma.enterpriseMembership.findUnique({
      where: { enterpriseId_userId: { enterpriseId: id, userId: request.user.sub } },
    });
    if (!isOwner && !isAdmin && !isMember) throw new ForbiddenError('Access denied.');

    const logs = await app.prisma.enterpriseUpdateLog.findMany({
      where: { enterpriseId: id },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({ success: true, data: logs });
  });

  // GET /enterprises/admin/update-logs — all update logs across all companies (admin only)
  app.get('/admin/update-logs', async (request, reply) => {
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    if (!isAdmin) throw new ForbiddenError('Administrators only.');

    const query = z.object({
      year:   z.string().optional(),
      page:   z.string().optional(),
      limit:  z.string().optional(),
      search: z.string().optional(),
    }).parse(request.query);

    const year    = query.year   ? parseInt(query.year)   : undefined;
    const page    = query.page   ? parseInt(query.page)   : 1;
    const limit   = query.limit  ? parseInt(query.limit)  : 50;
    const skip    = (page - 1) * limit;

    const where = {
      ...(year ? { updateYear: year } : {}),
      ...(query.search ? {
        enterprise: {
          businessName: { contains: query.search, mode: 'insensitive' as const },
        },
      } : {}),
    };

    const [logs, total] = await app.prisma.$transaction([
      app.prisma.enterpriseUpdateLog.findMany({
        where,
        include: {
          enterprise: {
            select: {
              id: true, businessName: true, industrySector: true, stage: true,
              region: true, province: true, cityMunicipality: true,
              isVerified: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      app.prisma.enterpriseUpdateLog.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  });

  // GET /enterprises/admin/update-summary — summary stats for DTI staff report
  app.get('/admin/update-summary', async (request, reply) => {
    const isAdmin = ADMIN_ROLES.includes(request.user.role as typeof ADMIN_ROLES[number]);
    if (!isAdmin) throw new ForbiddenError('Administrators only.');

    const currentYear = new Date().getFullYear();

    const [totalEnterprises, updatedThisYear, pendingUpdate, firstLoginPending, byType] =
      await app.prisma.$transaction([
        app.prisma.enterpriseProfile.count(),
        app.prisma.enterpriseProfile.count({ where: { annualUpdateYear: currentYear } }),
        app.prisma.enterpriseProfile.count({
          where: { OR: [{ profileUpdateDue: true }, { annualUpdateYear: { lt: currentYear } }] },
        }),
        app.prisma.enterpriseProfile.count({ where: { profileLastUpdatedAt: null } }),
        app.prisma.enterpriseUpdateLog.groupBy({
          by: ['updateType'],
          where: { updateYear: currentYear },
          _count: { _all: true },
          orderBy: { _count: { updateType: 'desc' } },
        }),
      ]);

    return reply.send({
      success: true,
      data: {
        year: currentYear,
        totalEnterprises,
        updatedThisYear,
        pendingUpdate,
        firstLoginPending,
        updatesByType: Object.fromEntries(byType.map((b) => [b.updateType, (b._count as Record<string, number>)['_all'] ?? 0])),
        complianceRate: totalEnterprises > 0
          ? Math.round((updatedThisYear / totalEnterprises) * 100)
          : 0,
      },
    });
  });
};
