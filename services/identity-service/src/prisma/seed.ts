import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  // ── Super Admin ──────────────────────────────────────────────────────────
  const passwordHash = await argon2.hash('Dti@Region7!');

  await prisma.userProfile.upsert({
    where: { email: 'super.admin@dti7.gov.ph' },
    update: { passwordHash, status: 'ACTIVE', emailVerified: true },
    create: {
      email:         'super.admin@dti7.gov.ph',
      passwordHash,
      role:          'SUPER_ADMIN',
      status:        'ACTIVE',
      firstName:     'Super',
      lastName:      'Admin',
      emailVerified: true,
      dpaConsentGiven: true,
      dpaConsentAt:  new Date(),
    },
  });
  console.log('✔ Super admin seeded');

  // ── Default Roles ────────────────────────────────────────────────────────
  const roles = [
    { name: 'PARTICIPANT',              label: 'Participant' },
    { name: 'ENTERPRISE_REPRESENTATIVE',label: 'Enterprise Representative' },
    { name: 'PROGRAM_MANAGER',          label: 'Program Manager' },
    { name: 'EVENT_ORGANIZER',          label: 'Event Organizer' },
    { name: 'DIVISION_CHIEF',           label: 'Division Chief' },
    { name: 'REGIONAL_DIRECTOR',        label: 'Regional Director' },
    { name: 'PROVINCIAL_DIRECTOR',      label: 'Provincial Director' },
    { name: 'SYSTEM_ADMIN',             label: 'System Admin', isSystem: true },
    { name: 'SUPER_ADMIN',              label: 'Super Admin',  isSystem: true },
  ];

  for (const role of roles) {
    await prisma.roleConfig.upsert({
      where:  { name: role.name },
      update: { label: role.label },
      create: { name: role.name, label: role.label, isSystem: role.isSystem ?? false },
    });
  }
  console.log('✔ Default roles seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
