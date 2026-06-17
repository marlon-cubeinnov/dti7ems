import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from '../lib/default-rbac.js';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

function requireAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
    throw new ForbiddenError('Only administrators can access this resource.');
  }
}

// ── Routes ──────────────────────────────────────────────────────────────────

export const rolesRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', app.verifyJwt);

  // ── Seed / Initialize defaults ────────────────────────────────────────────

  app.post('/seed', async (request, reply) => {
    requireAdmin(request.user.role);

    // Upsert all permissions
    for (const perm of DEFAULT_PERMISSIONS) {
      await app.prisma.permission.upsert({
        where: { code: perm.code },
        update: { label: perm.label, group: perm.group },
        create: { code: perm.code, label: perm.label, group: perm.group },
      });
    }

    // Upsert all default roles with their permissions
    for (const roleDef of DEFAULT_ROLES) {
      const role = await app.prisma.roleConfig.upsert({
        where: { name: roleDef.name },
        update: { label: roleDef.label, description: roleDef.description },
        create: {
          name: roleDef.name,
          label: roleDef.label,
          description: roleDef.description,
          isSystem: roleDef.isSystem,
        },
      });

      // Sync permissions for this role
      const permRecords = await app.prisma.permission.findMany({
        where: { code: { in: roleDef.permissions } },
      });

      // Remove existing and re-create
      await app.prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
      await app.prisma.rolePermission.createMany({
        data: permRecords.map(p => ({
          roleId: role.id,
          permissionId: p.id,
          grantedBy: request.user.sub,
        })),
      });
    }

    return reply.send({ success: true, message: 'Default roles and permissions seeded.' });
  });

  // ── List all roles with permissions ───────────────────────────────────────

  app.get('/', async (request, reply) => {
    requireAdmin(request.user.role);

    const roles = await app.prisma.roleConfig.findMany({
      where: { isActive: true },
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { group: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return reply.send({
      success: true,
      data: roles.map(r => ({
        id: r.id,
        name: r.name,
        label: r.label,
        description: r.description,
        isSystem: r.isSystem,
        isActive: r.isActive,
        permissions: r.permissions.map(rp => ({
          id: rp.permission.id,
          code: rp.permission.code,
          label: rp.permission.label,
          group: rp.permission.group,
        })),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  });

  // ── List all permissions ──────────────────────────────────────────────────

  app.get('/permissions', async (request, reply) => {
    requireAdmin(request.user.role);

    const permissions = await app.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { code: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!grouped[p.group]) grouped[p.group] = [];
      grouped[p.group].push(p);
    }

    return reply.send({ success: true, data: permissions, grouped });
  });

  // ── Get single role ───────────────────────────────────────────────────────

  app.get('/:id', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const role = await app.prisma.roleConfig.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) throw new NotFoundError('Role not found.');

    return reply.send({
      success: true,
      data: {
        ...role,
        permissions: role.permissions.map(rp => ({
          id: rp.permission.id,
          code: rp.permission.code,
          label: rp.permission.label,
          group: rp.permission.group,
        })),
      },
    });
  });

  // ── Create custom role ────────────────────────────────────────────────────

  app.post('/', async (request, reply) => {
    requireAdmin(request.user.role);

    const body = z.object({
      name: z.string().min(1).max(50).regex(/^[A-Z_]+$/, 'Role name must be uppercase with underscores'),
      label: z.string().min(1).max(100),
      description: z.string().max(500).optional().nullable(),
      permissionIds: z.array(z.string()).default([]),
    }).parse(request.body);

    const existing = await app.prisma.roleConfig.findUnique({ where: { name: body.name } });
    if (existing) throw new BadRequestError('A role with this name already exists.', ErrorCode.VALIDATION_ERROR);

    const role = await app.prisma.roleConfig.create({
      data: {
        name: body.name,
        label: body.label,
        description: body.description ?? null,
        isSystem: false,
      },
    });

    if (body.permissionIds.length > 0) {
      await app.prisma.rolePermission.createMany({
        data: body.permissionIds.map(pid => ({
          roleId: role.id,
          permissionId: pid,
          grantedBy: request.user.sub,
        })),
      });
    }

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ROLE_CREATED',
        entityType: 'RoleConfig',
        entityId: role.id,
        newData: { name: body.name, label: body.label, permissions: body.permissionIds.length },
      },
    });

    return reply.code(201).send({ success: true, data: role });
  });

  // ── Update role info ──────────────────────────────────────────────────────

  app.patch('/:id', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({
      label: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional().nullable(),
    }).parse(request.body);

    const existing = await app.prisma.roleConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Role not found.');

    const updated = await app.prisma.roleConfig.update({
      where: { id },
      data: body,
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Update role permissions (full replace) ────────────────────────────────

  app.put('/:id/permissions', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { permissionIds } = z.object({
      permissionIds: z.array(z.string()),
    }).parse(request.body);

    const role = await app.prisma.roleConfig.findUnique({ where: { id } });
    if (!role) throw new NotFoundError('Role not found.');

    // Get old permissions for audit
    const oldPerms = await app.prisma.rolePermission.findMany({
      where: { roleId: id },
      include: { permission: { select: { code: true } } },
    });

    // Replace all permissions
    await app.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (permissionIds.length > 0) {
      await app.prisma.rolePermission.createMany({
        data: permissionIds.map(pid => ({
          roleId: id,
          permissionId: pid,
          grantedBy: request.user.sub,
        })),
      });
    }

    // Get new permissions for response
    const updated = await app.prisma.roleConfig.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ROLE_PERMISSIONS_UPDATED',
        entityType: 'RoleConfig',
        entityId: id,
        oldData: { permissions: oldPerms.map(p => p.permission.code) },
        newData: { permissions: permissionIds.length },
      },
    });

    return reply.send({
      success: true,
      data: {
        ...updated,
        permissions: updated!.permissions.map(rp => ({
          id: rp.permission.id,
          code: rp.permission.code,
          label: rp.permission.label,
          group: rp.permission.group,
        })),
      },
    });
  });

  // ── Delete custom role ────────────────────────────────────────────────────

  app.delete('/:id', async (request, reply) => {
    requireAdmin(request.user.role);

    const { id } = z.object({ id: z.string() }).parse(request.params);

    const role = await app.prisma.roleConfig.findUnique({ where: { id } });
    if (!role) throw new NotFoundError('Role not found.');
    if (role.isSystem) throw new BadRequestError('System roles cannot be deleted.', ErrorCode.VALIDATION_ERROR);

    await app.prisma.roleConfig.delete({ where: { id } });

    await app.prisma.auditLog.create({
      data: {
        userId: request.user.sub,
        action: 'ROLE_DELETED',
        entityType: 'RoleConfig',
        entityId: id,
        oldData: { name: role.name, label: role.label },
      },
    });

    return reply.send({ success: true, message: 'Role deleted.' });
  });
};
