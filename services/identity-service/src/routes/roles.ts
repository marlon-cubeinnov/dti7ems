import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError, ErrorCode } from '@dti-ems/shared-errors';

const ADMIN_ROLES = ['SYSTEM_ADMIN', 'SUPER_ADMIN'] as const;

function requireAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
    throw new ForbiddenError('Only administrators can access this resource.');
  }
}

// ── Default seed data ───────────────────────────────────────────────────────

const DEFAULT_PERMISSIONS = [
  // Users
  { code: 'users.view_own',       label: 'View Own Profile',          group: 'Users' },
  { code: 'users.edit_own',       label: 'Edit Own Profile',          group: 'Users' },
  { code: 'users.view_all',       label: 'View All Users',            group: 'Users' },
  { code: 'users.manage',         label: 'Manage Users (Role/Status)', group: 'Users' },

  // Events
  { code: 'events.view',          label: 'View Public Events',        group: 'Events' },
  { code: 'events.create',        label: 'Create Events',             group: 'Events' },
  { code: 'events.edit_own',      label: 'Edit Own Events',           group: 'Events' },
  { code: 'events.manage_all',    label: 'Manage All Events',         group: 'Events' },
  { code: 'events.delete',        label: 'Delete Events',             group: 'Events' },

  // Participants
  { code: 'participants.register', label: 'Register for Events',      group: 'Participants' },
  { code: 'participants.view_own', label: 'View Own Registrations',   group: 'Participants' },
  { code: 'participants.manage',   label: 'Manage Participants',      group: 'Participants' },
  { code: 'participants.export',   label: 'Export Participant Data',   group: 'Participants' },

  // Attendance
  { code: 'attendance.scan_qr',   label: 'Scan QR Attendance',        group: 'Attendance' },
  { code: 'attendance.manual',     label: 'Manual Check-in',          group: 'Attendance' },
  { code: 'attendance.view',       label: 'View Attendance Records',  group: 'Attendance' },

  // Certificates
  { code: 'certificates.view_own', label: 'View Own Certificates',    group: 'Certificates' },
  { code: 'certificates.issue',    label: 'Issue Certificates',       group: 'Certificates' },
  { code: 'certificates.revoke',   label: 'Revoke Certificates',      group: 'Certificates' },

  // Surveys
  { code: 'surveys.submit',       label: 'Submit Surveys',            group: 'Surveys' },
  { code: 'surveys.view_results', label: 'View Survey Results',       group: 'Surveys' },

  // Checklists
  { code: 'checklists.manage',    label: 'Manage Event Checklists',   group: 'Checklists' },
  { code: 'checklists.view',      label: 'View Checklists',           group: 'Checklists' },

  // Enterprises
  { code: 'enterprises.view_own', label: 'View Own Enterprise',       group: 'Enterprises' },
  { code: 'enterprises.manage_own', label: 'Manage Own Enterprise',   group: 'Enterprises' },
  { code: 'enterprises.manage_all', label: 'Manage All Enterprises',  group: 'Enterprises' },
  { code: 'enterprises.verify',    label: 'Verify Enterprises',       group: 'Enterprises' },

  // Reports & Analytics
  { code: 'reports.view',         label: 'View Reports',              group: 'Reports' },
  { code: 'reports.export',       label: 'Export Reports',            group: 'Reports' },
  { code: 'analytics.view',       label: 'View Analytics Dashboard',  group: 'Reports' },

  // Admin
  { code: 'admin.audit_logs',     label: 'View Audit Logs',           group: 'Admin' },
  { code: 'admin.settings',       label: 'Manage System Settings',    group: 'Admin' },
  { code: 'admin.roles',          label: 'Manage Roles & Permissions', group: 'Admin' },

  // Notifications
  { code: 'notifications.send',   label: 'Send Notifications',        group: 'Notifications' },
] as const;

const DEFAULT_ROLES: { name: string; label: string; description: string; isSystem: boolean; permissions: string[] }[] = [
  {
    name: 'PARTICIPANT',
    label: 'Participant',
    description: 'Default role for event participants. Can register for events, submit surveys, and view own certificates.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'participants.register',
      'participants.view_own', 'certificates.view_own', 'surveys.submit',
    ],
  },
  {
    name: 'ENTERPRISE_REPRESENTATIVE',
    label: 'Enterprise Representative',
    description: 'Represents a business enterprise. Has participant permissions plus enterprise management.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'participants.register',
      'participants.view_own', 'certificates.view_own', 'surveys.submit',
      'enterprises.view_own', 'enterprises.manage_own',
    ],
  },
  {
    name: 'PROGRAM_MANAGER',
    label: 'Program Manager',
    description: 'DTI program manager. Can create and manage events, view reports, and manage participants.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'events.create', 'events.edit_own',
      'participants.manage', 'participants.export', 'attendance.scan_qr', 'attendance.manual',
      'attendance.view', 'certificates.issue', 'surveys.view_results',
      'checklists.manage', 'checklists.view', 'reports.view', 'reports.export',
    ],
  },
  {
    name: 'EVENT_ORGANIZER',
    label: 'Event Organizer',
    description: 'DTI event organizer. Can create and manage own events, check-in participants, and issue certificates.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'events.view', 'events.create', 'events.edit_own',
      'participants.manage', 'participants.export', 'attendance.scan_qr', 'attendance.manual',
      'attendance.view', 'certificates.issue', 'surveys.view_results',
      'checklists.manage', 'checklists.view', 'reports.view',
    ],
  },
  {
    name: 'SYSTEM_ADMIN',
    label: 'System Admin',
    description: 'System administrator. Full access except role management for admin-level roles.',
    isSystem: true,
    permissions: [
      'users.view_own', 'users.edit_own', 'users.view_all', 'users.manage',
      'events.view', 'events.create', 'events.edit_own', 'events.manage_all', 'events.delete',
      'participants.manage', 'participants.export', 'attendance.scan_qr', 'attendance.manual',
      'attendance.view', 'certificates.issue', 'certificates.revoke', 'surveys.view_results',
      'checklists.manage', 'checklists.view', 'enterprises.manage_all', 'enterprises.verify',
      'reports.view', 'reports.export', 'analytics.view',
      'admin.audit_logs', 'admin.settings', 'notifications.send',
    ],
  },
  {
    name: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Super administrator. Full unrestricted access to all system features including role management.',
    isSystem: true,
    permissions: DEFAULT_PERMISSIONS.map(p => p.code),
  },
];

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
