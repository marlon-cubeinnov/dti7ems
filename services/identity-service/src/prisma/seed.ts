import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from '../lib/default-rbac.js';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  // ── Super Admin ──────────────────────────────────────────────────────────
  const passwordHash = await argon2.hash('Dti@Region7!');

  const superAdmin = await prisma.userProfile.upsert({
    where: { email: 'super.admin@dti7.gov.ph' },
    update: { passwordHash, status: 'ACTIVE', emailVerified: true },
    create: {
      email: 'super.admin@dti7.gov.ph',
      passwordHash,
      role: 'SUPER_ADMIN',
      roles: ['SUPER_ADMIN'],
      status: 'ACTIVE',
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
      dpaConsentGiven: true,
      dpaConsentAt: new Date(),
    },
  });
  console.log('✔ Super admin seeded');

  const seedUsers = [
    {
      email: 'system.admin1@dti7.gov.ph',
      firstName: 'System',
      lastName: 'Admin One',
      role: 'SYSTEM_ADMIN' as const,
      roles: ['SYSTEM_ADMIN', 'DTI_EMPLOYEE'] as const,
      jobTitle: 'Systems Administrator',
    },
    {
      email: 'system.admin2@dti7.gov.ph',
      firstName: 'System',
      lastName: 'Admin Two',
      role: 'SYSTEM_ADMIN' as const,
      roles: ['SYSTEM_ADMIN', 'DTI_EMPLOYEE'] as const,
      jobTitle: 'Systems Administrator',
    },
    {
      email: 'employee1@dti7.gov.ph',
      firstName: 'DTI',
      lastName: 'Employee One',
      role: 'DTI_EMPLOYEE' as const,
      roles: ['DTI_EMPLOYEE'] as const,
      jobTitle: 'DTI Employee',
    },
    {
      email: 'employee2@dti7.gov.ph',
      firstName: 'DTI',
      lastName: 'Employee Two',
      role: 'DTI_EMPLOYEE' as const,
      roles: ['DTI_EMPLOYEE'] as const,
      jobTitle: 'DTI Employee',
    },
    {
      email: 'employee3@dti7.gov.ph',
      firstName: 'DTI',
      lastName: 'Employee Three',
      role: 'DTI_EMPLOYEE' as const,
      roles: ['DTI_EMPLOYEE'] as const,
      jobTitle: 'DTI Employee',
    },
    {
      email: 'employee4@dti7.gov.ph',
      firstName: 'DTI',
      lastName: 'Employee Four',
      role: 'DTI_EMPLOYEE' as const,
      roles: ['DTI_EMPLOYEE'] as const,
      jobTitle: 'DTI Employee',
    },
    {
      email: 'employee5@dti7.gov.ph',
      firstName: 'DTI',
      lastName: 'Employee Five',
      role: 'DTI_EMPLOYEE' as const,
      roles: ['DTI_EMPLOYEE'] as const,
      jobTitle: 'DTI Employee',
    },
  ];

  for (const user of seedUsers) {
    await prisma.userProfile.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        role: user.role,
        roles: [...user.roles],
        status: 'ACTIVE',
        emailVerified: true,
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        dpaConsentGiven: true,
        dpaConsentAt: new Date(),
      },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
        roles: [...user.roles],
        status: 'ACTIVE',
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        dpaConsentGiven: true,
        dpaConsentAt: new Date(),
      },
    });
  }
  console.log('✔ Additional system admins and DTI employees seeded');

  for (const permission of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { label: permission.label, group: permission.group },
      create: { code: permission.code, label: permission.label, group: permission.group },
    });
  }

  for (const role of DEFAULT_ROLES) {
    const roleConfig = await prisma.roleConfig.upsert({
      where: { name: role.name },
      update: {
        label: role.label,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: {
        name: role.name,
        label: role.label,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    const permissions = await prisma.permission.findMany({
      where: { code: { in: role.permissions } },
      select: { id: true },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: roleConfig.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: roleConfig.id,
        permissionId: permission.id,
        grantedBy: superAdmin.id,
      })),
    });
  }
  console.log('✔ Default roles and permissions seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
