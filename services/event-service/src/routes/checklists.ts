import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';

const ORGANIZER_ROLES = ['PROGRAM_MANAGER', 'EVENT_ORGANIZER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;
type OrganizerRole = typeof ORGANIZER_ROLES[number];

// ── Default checklist template ──────────────────────────────────────────────
const DEFAULT_CHECKLIST_ITEMS = [
  // Planning Phase
  { title: 'Define event objectives and expected outcomes', phase: 'PLANNING', priority: 'CRITICAL', orderIndex: 0 },
  { title: 'Identify target participants and sectors', phase: 'PLANNING', priority: 'HIGH', orderIndex: 1 },
  { title: 'Set event date, time, and duration', phase: 'PLANNING', priority: 'CRITICAL', orderIndex: 2 },
  { title: 'Determine delivery mode (F2F / Online / Hybrid)', phase: 'PLANNING', priority: 'HIGH', orderIndex: 3 },
  { title: 'Prepare budget proposal', phase: 'PLANNING', priority: 'HIGH', orderIndex: 4 },
  { title: 'Identify speakers / resource persons', phase: 'PLANNING', priority: 'HIGH', orderIndex: 5 },
  { title: 'Draft event program / agenda', phase: 'PLANNING', priority: 'MEDIUM', orderIndex: 6 },

  // Preparation Phase
  { title: 'Secure venue / online platform', phase: 'PREPARATION', priority: 'CRITICAL', orderIndex: 7 },
  { title: 'Send invitations / registration link', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 8 },
  { title: 'Prepare training materials and handouts', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 9 },
  { title: 'Coordinate with speakers for presentations', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 10 },
  { title: 'Arrange catering / meals', phase: 'PREPARATION', priority: 'MEDIUM', orderIndex: 11 },
  { title: 'Prepare certificates template', phase: 'PREPARATION', priority: 'MEDIUM', orderIndex: 12 },
  { title: 'Test audio-visual equipment / internet', phase: 'PREPARATION', priority: 'HIGH', orderIndex: 13 },
  { title: 'Print attendance sheets / ID badges', phase: 'PREPARATION', priority: 'LOW', orderIndex: 14 },
  { title: 'Prepare registration / check-in area', phase: 'PREPARATION', priority: 'MEDIUM', orderIndex: 15 },

  // Execution Phase
  { title: 'Setup venue / platform on event day', phase: 'EXECUTION', priority: 'CRITICAL', orderIndex: 16 },
  { title: 'Conduct participant check-in / QR scanning', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 17 },
  { title: 'Monitor event flow and schedule', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 18 },
  { title: 'Document event (photos, recording)', phase: 'EXECUTION', priority: 'MEDIUM', orderIndex: 19 },
  { title: 'Distribute CSF survey to participants', phase: 'EXECUTION', priority: 'HIGH', orderIndex: 20 },

  // Post-Event Phase
  { title: 'Issue certificates to eligible participants', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 21 },
  { title: 'Compile attendance report', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 22 },
  { title: 'Analyze CSF survey results', phase: 'POST_EVENT', priority: 'MEDIUM', orderIndex: 23 },
  { title: 'Prepare event completion report', phase: 'POST_EVENT', priority: 'HIGH', orderIndex: 24 },
  { title: 'Submit financial accountability report', phase: 'POST_EVENT', priority: 'MEDIUM', orderIndex: 25 },
  { title: 'File event documentation', phase: 'POST_EVENT', priority: 'LOW', orderIndex: 26 },
] as const;

// ── Validation schemas ──────────────────────────────────────────────────────

const createChecklistSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  useTemplate: z.boolean().default(true),
});

const createItemSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional().nullable(),
  phase: z.enum(['PLANNING', 'PREPARATION', 'EXECUTION', 'POST_EVENT']).default('PLANNING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedTo: z.string().optional().nullable(),
  assignedToName: z.string().max(200).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().nullable(),
});

const updateItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  phase: z.enum(['PLANNING', 'PREPARATION', 'EXECUTION', 'POST_EVENT']).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().optional().nullable(),
  assignedToName: z.string().max(200).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  linkUrl: z.string().url().max(2000).optional().nullable(),
  linkLabel: z.string().max(200).optional().nullable(),
});

// ── Routes ──────────────────────────────────────────────────────────────────

export const checklistRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // GET /checklists/events/:eventId — get all checklists for an event
  app.get('/events/:eventId', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access checklists.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const event = await app.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    const checklists = await app.prisma.eventChecklist.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: { comments: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    return reply.send({ success: true, data: checklists });
  });

  // POST /checklists/events/:eventId — create a checklist for an event
  app.post('/events/:eventId', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can create checklists.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);
    const body = createChecklistSchema.parse(request.body);

    const event = await app.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    const checklist = await app.prisma.eventChecklist.create({
      data: {
        eventId,
        title: body.title,
        description: body.description ?? null,
        createdBy: request.user.sub,
        items: body.useTemplate ? {
          create: DEFAULT_CHECKLIST_ITEMS.map(item => ({
            title: item.title,
            phase: item.phase,
            priority: item.priority,
            orderIndex: item.orderIndex,
          })),
        } : undefined,
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: { comments: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    return reply.code(201).send({ success: true, data: checklist });
  });

  // GET /checklists/:id — get a specific checklist with items
  app.get('/:id', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access checklists.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const checklist = await app.prisma.eventChecklist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
          include: { comments: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    if (!checklist) throw new NotFoundError('Checklist not found');
    return reply.send({ success: true, data: checklist });
  });

  // DELETE /checklists/:id — delete a checklist
  app.delete('/:id', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can delete checklists.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const checklist = await app.prisma.eventChecklist.findUnique({ where: { id } });
    if (!checklist) throw new NotFoundError('Checklist not found');

    await app.prisma.eventChecklist.delete({ where: { id } });
    return reply.send({ success: true, message: 'Checklist deleted.' });
  });

  // POST /checklists/:id/items — add an item to a checklist
  app.post('/:id/items', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can add checklist items.');
    }

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = createItemSchema.parse(request.body);

    const checklist = await app.prisma.eventChecklist.findUnique({ where: { id } });
    if (!checklist) throw new NotFoundError('Checklist not found');

    const item = await app.prisma.checklistItem.create({
      data: {
        checklistId: id,
        title: body.title,
        description: body.description ?? null,
        phase: body.phase,
        priority: body.priority,
        assignedTo: body.assignedTo ?? null,
        assignedToName: body.assignedToName ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        orderIndex: body.orderIndex,
        notes: body.notes ?? null,
      },
    });

    return reply.code(201).send({ success: true, data: item });
  });

  // PATCH /checklists/:id/items/:itemId — update a checklist item
  app.patch('/:id/items/:itemId', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can update checklist items.');
    }

    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);
    const body = updateItemSchema.parse(request.body);

    const item = await app.prisma.checklistItem.findFirst({
      where: { id: itemId, checklistId: id },
    });
    if (!item) throw new NotFoundError('Checklist item not found');

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData['title'] = body.title;
    if (body.description !== undefined) updateData['description'] = body.description;
    if (body.phase !== undefined) updateData['phase'] = body.phase;
    if (body.priority !== undefined) updateData['priority'] = body.priority;
    if (body.assignedTo !== undefined) updateData['assignedTo'] = body.assignedTo;
    if (body.assignedToName !== undefined) updateData['assignedToName'] = body.assignedToName;
    if (body.dueDate !== undefined) updateData['dueDate'] = body.dueDate ? new Date(body.dueDate) : null;
    if (body.orderIndex !== undefined) updateData['orderIndex'] = body.orderIndex;
    if (body.notes !== undefined) updateData['notes'] = body.notes;

    // Auto-set completedAt/completedBy when status changes to COMPLETED
    if (body.status !== undefined) {
      updateData['status'] = body.status;
      if (body.status === 'COMPLETED') {
        updateData['completedAt'] = new Date();
        updateData['completedBy'] = request.user.sub;
      } else if (item.status === 'COMPLETED') {
        // Un-complete
        updateData['completedAt'] = null;
        updateData['completedBy'] = null;
      }
    }

    const updated = await app.prisma.checklistItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return reply.send({ success: true, data: updated });
  });

  // DELETE /checklists/:id/items/:itemId — remove a checklist item
  app.delete('/:id/items/:itemId', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can remove checklist items.');
    }

    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);

    const item = await app.prisma.checklistItem.findFirst({
      where: { id: itemId, checklistId: id },
    });
    if (!item) throw new NotFoundError('Checklist item not found');

    await app.prisma.checklistItem.delete({ where: { id: itemId } });
    return reply.send({ success: true, message: 'Item deleted.' });
  });

  // POST /checklists/:id/items/:itemId/comments — add a comment to a checklist item
  app.post('/:id/items/:itemId/comments', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and staff can comment on checklist items.');
    }

    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);
    const body = createCommentSchema.parse(request.body);

    const item = await app.prisma.checklistItem.findFirst({
      where: { id: itemId, checklistId: id },
    });
    if (!item) throw new NotFoundError('Checklist item not found');

    const comment = await app.prisma.checklistComment.create({
      data: {
        itemId,
        authorId: request.user.sub,
        authorName: `${request.user.firstName} ${request.user.lastName}`,
        content: body.content,
        linkUrl: body.linkUrl ?? null,
        linkLabel: body.linkLabel ?? null,
      },
    });

    return reply.code(201).send({ success: true, data: comment });
  });

  // GET /checklists/:id/items/:itemId/comments — list comments for a checklist item
  app.get('/:id/items/:itemId/comments', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and staff can view comments.');
    }

    const { id, itemId } = z.object({ id: z.string(), itemId: z.string() }).parse(request.params);

    const item = await app.prisma.checklistItem.findFirst({
      where: { id: itemId, checklistId: id },
    });
    if (!item) throw new NotFoundError('Checklist item not found');

    const comments = await app.prisma.checklistComment.findMany({
      where: { itemId },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({ success: true, data: comments });
  });

  // DELETE /checklists/:id/items/:itemId/comments/:commentId — delete a comment
  app.delete('/:id/items/:itemId/comments/:commentId', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and staff can delete comments.');
    }

    const { commentId } = z.object({ id: z.string(), itemId: z.string(), commentId: z.string() }).parse(request.params);

    const comment = await app.prisma.checklistComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError('Comment not found');

    // Only author or admins can delete
    if (comment.authorId !== request.user.sub && !['SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(request.user.role)) {
      throw new ForbiddenError('You can only delete your own comments.');
    }

    await app.prisma.checklistComment.delete({ where: { id: commentId } });
    return reply.send({ success: true, message: 'Comment deleted.' });
  });

  // GET /checklists/events/:eventId/summary — checklist progress summary
  app.get('/events/:eventId/summary', async (request, reply) => {
    const userRole = request.user.role as OrganizerRole;
    if (!ORGANIZER_ROLES.includes(userRole)) {
      throw new ForbiddenError('Only organizers and admins can access checklists.');
    }

    const { eventId } = z.object({ eventId: z.string() }).parse(request.params);

    const event = await app.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found');

    const items = await app.prisma.checklistItem.findMany({
      where: { checklist: { eventId } },
      select: { status: true, phase: true, priority: true },
    });

    const total = items.length;
    const byStatus = {
      NOT_STARTED: items.filter(i => i.status === 'NOT_STARTED').length,
      IN_PROGRESS: items.filter(i => i.status === 'IN_PROGRESS').length,
      COMPLETED: items.filter(i => i.status === 'COMPLETED').length,
      BLOCKED: items.filter(i => i.status === 'BLOCKED').length,
      CANCELLED: items.filter(i => i.status === 'CANCELLED').length,
    };
    const byPhase = {
      PLANNING: { total: 0, completed: 0 },
      PREPARATION: { total: 0, completed: 0 },
      EXECUTION: { total: 0, completed: 0 },
      POST_EVENT: { total: 0, completed: 0 },
    };
    for (const item of items) {
      byPhase[item.phase].total++;
      if (item.status === 'COMPLETED') byPhase[item.phase].completed++;
    }

    const completionPct = total > 0 ? Math.round((byStatus.COMPLETED / total) * 100) : 0;

    return reply.send({
      success: true,
      data: {
        total,
        completionPct,
        byStatus,
        byPhase,
      },
    });
  });
};
