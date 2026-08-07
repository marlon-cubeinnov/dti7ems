/**
 * One-off migration: DTI Startup Longlist -> CPMS EnterpriseProfile records.
 *
 * Reads migration-data/longlist-raw.json (produced once by
 * migration-data/extract-longlist.py), dedupes/maps/validates each row, and
 * creates a UserProfile (ENTERPRISE_REPRESENTATIVE) + EnterpriseProfile +
 * EnterpriseMembership (OWNER) per unique company — reusing an existing
 * user by email instead of creating a duplicate when one already exists.
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter identity-service migrate:longlist   # plan only, no writes
 *   pnpm --filter identity-service migrate:longlist             # real run
 */
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import {
  type RawRow,
  excelOrIsoToTimestamp,
  mapRow,
  normalizeName,
} from './migration-data/shared-mapping.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';
const SOURCE_LABEL = 'DTI Startup Longlist';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// 32 unique companies total, minus 1 ("SugboDoc Technologies Inc") whose source
// row is column-shifted/corrupted and gets excluded before dedup (see loadAndDedupe).
const EXPECTED_UNIQUE_COMPANIES = 31;

function loadAndDedupe(): { winners: RawRow[]; corrupted: RawRow[] } {
  const raw: RawRow[] = JSON.parse(readFileSync(join(__dirname, 'migration-data', 'longlist-raw.json'), 'utf8'));

  const corrupted: RawRow[] = [];
  const clean: RawRow[] = [];
  for (const row of raw) {
    const mobileStr = row.mobileNumber == null ? '' : String(row.mobileNumber);
    if (mobileStr.includes('@')) {
      corrupted.push(row);
    } else {
      clean.push(row);
    }
  }

  const best = new Map<string, RawRow>();
  for (const row of clean) {
    const key = normalizeName(row.startup);
    const ts = excelOrIsoToTimestamp(row.lastUpdated);
    const existing = best.get(key);
    if (!existing || ts > excelOrIsoToTimestamp(existing.lastUpdated)) {
      best.set(key, row);
    }
  }

  return { winners: [...best.values()], corrupted };
}

async function main() {
  console.log(`=== DTI Longlist → CPMS Enterprise migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const { winners, corrupted } = loadAndDedupe();
  console.log(`Deduped to ${winners.length} unique companies (expected ${EXPECTED_UNIQUE_COMPANIES}).`);
  if (corrupted.length) {
    console.log(`Skipping ${corrupted.length} row(s) with column-shifted/corrupted source data (needs manual review):`);
    for (const r of corrupted) console.log(`  - "${r.startup}" (Startup ID ${r.startupId})`);
  }
  if (winners.length !== EXPECTED_UNIQUE_COMPANIES) {
    console.warn(`WARNING: expected ${EXPECTED_UNIQUE_COMPANIES} unique companies, got ${winners.length}. Source data may have changed — double-check before proceeding.`);
  }
  console.log();

  const warnings: string[] = [];
  const usersCreated: string[] = [];
  const usersReused: string[] = [];
  const enterprisesCreated: string[] = [];
  const skippedBusinessNameExists: string[] = [];
  const skippedValidation: string[] = [];
  const manifest: Array<{ enterpriseId: string; userId: string; businessName: string; userWasCreated: boolean }> = [];

  for (const row of winners) {
    const mapped = mapRow(row, warnings, SOURCE_LABEL);
    if ('error' in mapped) {
      skippedValidation.push(`"${row.startup}" (Startup ID ${row.startupId}): ${mapped.error}`);
      continue;
    }

    const existingEnterprise = await prisma.enterpriseProfile.findFirst({
      where: { businessName: { equals: mapped.enterprise.businessName, mode: 'insensitive' } },
      select: { id: true, businessName: true },
    });
    if (existingEnterprise) {
      skippedBusinessNameExists.push(`"${mapped.enterprise.businessName}" → already exists as EnterpriseProfile ${existingEnterprise.id}`);
      continue;
    }

    const existingUser = await prisma.userProfile.findUnique({
      where: { email: mapped.contactEmail },
      select: { id: true, email: true },
    });

    if (DRY_RUN) {
      console.log(`PLAN: "${mapped.enterprise.businessName}" — owner ${existingUser ? `reuse existing user ${existingUser.email}` : `create new user ${mapped.contactEmail}`}`);
      continue;
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        let userId: string;
        let userWasCreated = false;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const randomPassword = randomBytes(24).toString('hex');
          const passwordHash = await argon2.hash(randomPassword);
          const user = await tx.userProfile.create({
            data: {
              email: mapped.contactEmail,
              passwordHash,
              role: 'ENTERPRISE_REPRESENTATIVE',
              roles: ['ENTERPRISE_REPRESENTATIVE'],
              status: 'ACTIVE',
              firstName: mapped.contactFirstName,
              lastName: mapped.contactLastName,
              mobileNumber: mapped.contactMobile,
              emailVerified: true,
              emailVerifiedAt: new Date(),
            },
          });
          userId = user.id;
          userWasCreated = true;
        }

        const enterprise = await tx.enterpriseProfile.create({
          data: {
            ...mapped.enterprise,
            userId,
            isPubliclyListed: false,
            isVerified: false,
          },
        });

        await tx.enterpriseMembership.create({
          data: { enterpriseId: enterprise.id, userId, role: 'OWNER' },
        });

        return { enterpriseId: enterprise.id, userId, userWasCreated };
      });

      if (result.userWasCreated) usersCreated.push(mapped.contactEmail);
      else usersReused.push(mapped.contactEmail);
      enterprisesCreated.push(mapped.enterprise.businessName);
      manifest.push({
        enterpriseId: result.enterpriseId,
        userId: result.userId,
        businessName: mapped.enterprise.businessName,
        userWasCreated: result.userWasCreated,
      });
      console.log(`CREATED: "${mapped.enterprise.businessName}" → user ${result.userId} (${result.userWasCreated ? 'new' : 'reused'}), enterprise ${result.enterpriseId}`);
    } catch (err) {
      skippedValidation.push(`"${mapped.enterprise.businessName}" (Startup ID ${row.startupId}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN — nothing written' : 'LIVE'}`);
  console.log(`Users created: ${usersCreated.length}`);
  console.log(`Users reused (pre-existing): ${usersReused.length}`);
  console.log(`Enterprises created: ${enterprisesCreated.length}`);
  console.log(`Skipped — business name already exists: ${skippedBusinessNameExists.length}`);
  for (const s of skippedBusinessNameExists) console.log(`  - ${s}`);
  console.log(`Skipped — validation/mapping failure: ${skippedValidation.length}`);
  for (const s of skippedValidation) console.log(`  - ${s}`);
  console.log(`Skipped — corrupted source row: ${corrupted.length}`);
  for (const r of corrupted) console.log(`  - "${r.startup}" (Startup ID ${r.startupId})`);
  if (warnings.length) {
    console.log(`Industry fallback warnings: ${warnings.length}`);
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (!DRY_RUN && manifest.length) {
    const manifestPath = join(__dirname, 'migration-data', `run-${Date.now()}.json`);
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`\nManifest written to ${manifestPath}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
