import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';
import { hasPermission, requireAnyPermission, requirePermission } from '../lib/rbac.js';

const tnaBodySchema = z.object({
  title:                  z.string().min(1).max(500),
  sector:                 z.string().min(1).max(300),
  targetRegion:           z.string().max(300).optional().nullable(),
  description:            z.string().max(5000).optional().nullable(),
  conductedAt:            z.string().datetime().optional().nullable(),
  summary:                z.string().max(10000).optional().nullable(),
  recommendedTopics:      z.string().max(5000).optional().nullable(),
  screenQ1:               z.boolean().optional(),
  screenQ2:               z.boolean().optional(),
  screenQ3:               z.boolean().optional(),
  screenQ4:               z.boolean().optional(),
  screenQ5:               z.boolean().optional(),
  scorePerformanceGap:    z.number().int().min(1).max(5).optional().nullable(),
  scoreSkillDeficiency:   z.number().int().min(1).max(5).optional().nullable(),
  scoreBusinessRelevance: z.number().int().min(1).max(5).optional().nullable(),
  scoreUrgency:           z.number().int().min(1).max(5).optional().nullable(),
  scoreDemandMsmes:       z.number().int().min(1).max(5).optional().nullable(),
  linkedEventId:          z.string().optional().nullable(),
});

const respondentBodySchema = z.object({
  respondentType:    z.enum(['INDIVIDUAL', 'BUSINESS_OWNER', 'ORGANIZATION', 'GOVERNMENT']).default('INDIVIDUAL'),
  name:              z.string().max(300).optional().nullable(),
  organization:      z.string().max(300).optional().nullable(),
  sector:            z.string().max(300).optional().nullable(),
  region:            z.string().max(200).optional().nullable(),
  needKnowledge:     z.number().int().min(1).max(5).default(3),
  needSkills:        z.number().int().min(1).max(5).default(3),
  needAttitude:      z.number().int().min(1).max(5).default(3),
  preferredTopics:   z.string().max(2000).optional().nullable(),
  preferredMode:     z.enum(['FACE_TO_FACE', 'ONLINE', 'HYBRID']).optional().nullable(),
  preferredSchedule: z.enum(['WEEKDAY', 'WEEKEND', 'FLEXIBLE']).optional().nullable(),
  currentChallenges: z.string().max(3000).optional().nullable(),
  additionalNeeds:   z.string().max(3000).optional().nullable(),
});

const tnaRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {

  // GET /tna — list TNAs for current user (or all for admin)
  app.get('/', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    requireAnyPermission(
      request.user,
      ['tna.view', 'tna.edit_own', 'tna.manage_all'],
      'Only users with TNA access can view TNA records.',
    );
    const q = z.object({
      page:          z.coerce.number().min(1).default(1),
      limit:         z.coerce.number().min(1).max(100).default(50),
      status:        z.enum(['DRAFT', 'FINALIZED']).optional(),
      linkedEventId: z.string().optional(),
    }).parse(request.query);

    const canViewAllTna = hasPermission(request.user, 'tna.view') || hasPermission(request.user, 'tna.manage_all');
    const where: Record<string, unknown> = {};
    if (!canViewAllTna) where['conductedBy'] = request.user.sub;
    if (q.status) where['status'] = q.status;
    if (q.linkedEventId) where['linkedEventId'] = q.linkedEventId;

    const [total, tnas] = await Promise.all([
      app.prisma.preProposalTna.count({ where }),
      app.prisma.preProposalTna.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { respondents: true } } },
      }),
    ]);

    return reply.send({
      success: true,
      data: tnas,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    });
  });

  // POST /tna — create standalone TNA
  app.post('/', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    requirePermission(
      request.user,
      'tna.create',
      'Only users with TNA creation permission can create TNA records.',
    );
    const body = tnaBodySchema.parse(request.body);

    // If linkedEventId provided, verify event exists
    if (body.linkedEventId) {
      const event = await app.prisma.event.findUnique({ where: { id: body.linkedEventId } });
      if (!event) throw new NotFoundError('Linked event not found.');
    }

    const tna = await app.prisma.preProposalTna.create({
      data: {
        ...body,
        conductedAt: body.conductedAt ? new Date(body.conductedAt) : null,
        conductedBy: request.user.sub,
        status: 'DRAFT',
      },
      include: { respondents: { orderBy: { createdAt: 'asc' } } },
    });
    return reply.code(201).send({ success: true, data: tna });
  });

  // GET /tna/:id
  app.get('/:id', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    requireAnyPermission(
      request.user,
      ['tna.view', 'tna.edit_own', 'tna.manage_all'],
      'Only users with TNA access can view TNA records.',
    );
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({
      where: { id },
      include: { respondents: { orderBy: { createdAt: 'asc' } } },
    });
    if (!tna) throw new NotFoundError('TNA not found.');

    const canViewAllTna = hasPermission(request.user, 'tna.view') || hasPermission(request.user, 'tna.manage_all');
    if (!canViewAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }
    return reply.send({ success: true, data: tna });
  });

  // PATCH /tna/:id — update fields
  app.patch('/:id', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({ where: { id } });
    if (!tna) throw new NotFoundError('TNA not found.');

    requireAnyPermission(
      request.user,
      ['tna.edit_own', 'tna.manage_all'],
      'Only users with TNA edit permission can update this TNA.',
    );

    const canManageAllTna = hasPermission(request.user, 'tna.manage_all');
    if (!canManageAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }
    if (tna.status === 'FINALIZED') {
      throw new BadRequestError('Cannot edit a finalized TNA. Reopen it first.', ErrorCode.VALIDATION_ERROR);
    }

    const body = tnaBodySchema.partial().parse(request.body);

    // If linkedEventId provided, verify event exists
    if (body.linkedEventId) {
      const event = await app.prisma.event.findUnique({ where: { id: body.linkedEventId } });
      if (!event) throw new NotFoundError('Linked event not found.');
    }

    const updated = await app.prisma.preProposalTna.update({
      where: { id },
      data: {
        ...body,
        conductedAt: body.conductedAt !== undefined
          ? (body.conductedAt ? new Date(body.conductedAt) : null)
          : undefined,
      },
      include: { respondents: { orderBy: { createdAt: 'asc' } } },
    });
    return reply.send({ success: true, data: updated });
  });

  // PATCH /tna/:id/status — finalize or reopen
  app.patch('/:id/status', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({ where: { id } });
    if (!tna) throw new NotFoundError('TNA not found.');

    requireAnyPermission(
      request.user,
      ['tna.edit_own', 'tna.manage_all'],
      'Only users with TNA edit permission can change TNA status.',
    );

    const canManageAllTna = hasPermission(request.user, 'tna.manage_all');
    if (!canManageAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }

    const { status } = z.object({ status: z.enum(['DRAFT', 'FINALIZED']) }).parse(request.body);
    const updated = await app.prisma.preProposalTna.update({
      where: { id },
      data: { status },
      include: { respondents: { orderBy: { createdAt: 'asc' } } },
    });
    return reply.send({ success: true, data: updated });
  });

  // DELETE /tna/:id — delete TNA (only if DRAFT and no linked event)
  app.delete('/:id', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({ where: { id } });
    if (!tna) throw new NotFoundError('TNA not found.');

    requireAnyPermission(
      request.user,
      ['tna.edit_own', 'tna.manage_all'],
      'Only users with TNA edit permission can delete this TNA.',
    );

    const canManageAllTna = hasPermission(request.user, 'tna.manage_all');
    if (!canManageAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }
    if (tna.status === 'FINALIZED') {
      throw new BadRequestError('Cannot delete a finalized TNA.', ErrorCode.VALIDATION_ERROR);
    }

    await app.prisma.preProposalTna.delete({ where: { id } });
    return reply.send({ success: true, message: 'TNA deleted.' });
  });

  // POST /tna/:id/respondents
  app.post('/:id/respondents', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({ where: { id } });
    if (!tna) throw new NotFoundError('TNA not found.');

    requireAnyPermission(
      request.user,
      ['tna.edit_own', 'tna.manage_all'],
      'Only users with TNA edit permission can add respondents.',
    );

    const canManageAllTna = hasPermission(request.user, 'tna.manage_all');
    if (!canManageAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }
    if (tna.status === 'FINALIZED') {
      throw new BadRequestError('Cannot add respondents to a finalized TNA.', ErrorCode.VALIDATION_ERROR);
    }

    const body = respondentBodySchema.parse(request.body);
    const respondent = await app.prisma.tnaRespondent.create({
      data: { ...body, tnaId: id },
    });
    return reply.code(201).send({ success: true, data: respondent });
  });

  // DELETE /tna/:id/respondents/:respondentId
  app.delete('/:id/respondents/:respondentId', { preHandler: [app.verifyJwt] }, async (request, reply) => {
    const { id, respondentId } = z.object({ id: z.string(), respondentId: z.string() }).parse(request.params);
    const tna = await app.prisma.preProposalTna.findUnique({ where: { id } });
    if (!tna) throw new NotFoundError('TNA not found.');

    requireAnyPermission(
      request.user,
      ['tna.edit_own', 'tna.manage_all'],
      'Only users with TNA edit permission can remove respondents.',
    );

    const canManageAllTna = hasPermission(request.user, 'tna.manage_all');
    if (!canManageAllTna && tna.conductedBy !== request.user.sub) {
      throw new ForbiddenError('You do not have access to this TNA.');
    }
    if (tna.status === 'FINALIZED') {
      throw new BadRequestError('Cannot remove respondents from a finalized TNA.', ErrorCode.VALIDATION_ERROR);
    }

    const respondent = await app.prisma.tnaRespondent.findFirst({ where: { id: respondentId, tnaId: id } });
    if (!respondent) throw new NotFoundError('Respondent not found.');

    await app.prisma.tnaRespondent.delete({ where: { id: respondentId } });
    return reply.send({ success: true, message: 'Respondent removed.' });
  });
};

export default tnaRoutes;
