/**
 * One-off migration: docs/DTI/olddata.xlsx (an earlier startup tracker,
 * predates Longlist.xlsx) -> CPMS EnterpriseProfile records.
 *
 * Same pipeline as migrate-longlist.ts (see shared-mapping.ts), with two
 * differences specific to this older, sparser source file:
 *
 *  1. It has no "Last Updated" dates at all, so within-file duplicate rows
 *     for the same company are deduped by "most complete data" instead of
 *     "most recent" (ties broken by keeping the last occurrence in the file).
 *  2. Company names are dirtier ("Farmtri" vs "Farmtri AI", "BioConnectify"
 *     vs "BioConnectify Technologies Inc.") — matching against already-
 *     migrated companies (from the Longlist run, or anything else already in
 *     the system) uses fuzzy name matching in addition to the exact
 *     case-insensitive check, per "previously imported data prevails."
 *
 * Usage:
 *   DRY_RUN=1 pnpm --filter identity-service migrate:olddata   # plan only, no writes
 *   pnpm --filter identity-service migrate:olddata             # real run
 */
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import {
  type RawRow,
  mapRow,
  normalizeForFuzzyMatch,
  normalizeName,
} from './migration-data/shared-mapping.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';
const SOURCE_LABEL = 'DTI olddata.xlsx (earlier startup tracker)';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

function countNonNull(row: RawRow): number {
  return Object.values(row).filter((v) => v !== null && v !== undefined && v !== '').length;
}

/** Group rows by fuzzy-normalized name; within each group keep whichever row
 * has the most populated fields (last occurrence in the file wins ties). */
function loadAndDedupe(): { winners: RawRow[]; corrupted: RawRow[] } {
  const raw: RawRow[] = JSON.parse(readFileSync(join(__dirname, 'migration-data', 'oldlist-raw.json'), 'utf8'));

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
    const key = normalizeForFuzzyMatch(row.startup);
    const existing = best.get(key);
    if (!existing || countNonNull(row) >= countNonNull(existing)) {
      best.set(key, row);
    }
  }

  return { winners: [...best.values()], corrupted };
}

async function main() {
  console.log(`=== DTI olddata.xlsx → CPMS Enterprise migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===\n`);

  const { winners, corrupted } = loadAndDedupe();
  console.log(`Deduped ${winners.length + corrupted.length > 0 ? 'source rows' : ''} to ${winners.length} unique companies (fuzzy name match).`);
  if (corrupted.length) {
    console.log(`Skipping ${corrupted.length} row(s) with column-shifted/corrupted source data (needs manual review):`);
    for (const r of corrupted) console.log(`  - "${r.startup}" (Startup ID ${r.startupId})`);
  }
  console.log();

  // Fetch every existing business name once and pre-compute fuzzy keys, so
  // "previously imported data prevails" catches near-spelling matches too
  // (not just exact ones) without one query per candidate.
  const existingEnterprises = await prisma.enterpriseProfile.findMany({
    select: { id: true, businessName: true },
  });
  const existingByFuzzyKey = new Map<string, { id: string; businessName: string }>();
  const existingByExactLower = new Map<string, { id: string; businessName: string }>();
  // Whitespace/punctuation-agnostic tier — catches spacing differences the
  // sorted-token fuzzy match can miss when a stopword is glued onto another
  // word in one variant but not the other (e.g. "FoxCity SuperApp" vs
  // "Foxcity Super App" — "app" only reads as a standalone stopword token
  // in the second one).
  const existingBySquashed = new Map<string, { id: string; businessName: string }>();
  for (const e of existingEnterprises) {
    existingByFuzzyKey.set(normalizeForFuzzyMatch(e.businessName), e);
    existingByExactLower.set(e.businessName.trim().toLowerCase(), e);
    existingBySquashed.set(normalizeName(e.businessName), e);
  }

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

    const exactMatch = existingByExactLower.get(mapped.enterprise.businessName.trim().toLowerCase());
    const fuzzyMatch = existingByFuzzyKey.get(normalizeForFuzzyMatch(mapped.enterprise.businessName));
    const squashedMatch = existingBySquashed.get(normalizeName(mapped.enterprise.businessName));
    const match = exactMatch ?? fuzzyMatch ?? squashedMatch;
    if (match) {
      const matchKind = exactMatch ? 'exact' : fuzzyMatch ? 'fuzzy' : 'squashed';
      skippedBusinessNameExists.push(
        `"${mapped.enterprise.businessName}" → already exists as "${match.businessName}" (EnterpriseProfile ${match.id}, ${matchKind} match) — previously imported data prevails`,
      );
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

      // Keep the in-memory existing-name maps current so later rows in this
      // same run also correctly dedupe against companies just created.
      existingByFuzzyKey.set(normalizeForFuzzyMatch(mapped.enterprise.businessName), { id: result.enterpriseId, businessName: mapped.enterprise.businessName });
      existingByExactLower.set(mapped.enterprise.businessName.trim().toLowerCase(), { id: result.enterpriseId, businessName: mapped.enterprise.businessName });
      existingBySquashed.set(normalizeName(mapped.enterprise.businessName), { id: result.enterpriseId, businessName: mapped.enterprise.businessName });

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
  console.log(`Skipped — business name already exists (previously imported prevails): ${skippedBusinessNameExists.length}`);
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
    const manifestPath = join(__dirname, 'migration-data', `olddata-run-${Date.now()}.json`);
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`\nManifest written to ${manifestPath}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
