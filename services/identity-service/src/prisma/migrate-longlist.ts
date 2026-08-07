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
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// ── Source row shape (matches extract-longlist.py's COLUMNS) ───────────────
interface RawRow {
  startupId: number | null;
  startup: string;
  shortDescription: string | null;
  industry: string | null;
  specificIndustry: string | null;
  yearFounded: number | string | null;
  city: string | null;
  province: string | null;
  startupStage: string | null;
  operatingStatus: string | null;
  legalIdentity: string | null;
  revenueStatus: string | null;
  mrr: string | null;
  fundingStage: string | null;
  jobsCreated: number | string | null;
  marketsReached: string | null;
  primaryContactPerson: string | null;
  designation: string | null;
  emailAddress: string | null;
  mobileNumber: number | string | null;
  website: string | number | null;
  socialMediaLink: string | null;
  programsParticipated: string | null;
  majorMilestones: string | null;
  supportNeeded: string | null;
  prioritySupportArea: string | null;
  remarks: string | null;
  lastUpdated: string | null;
  previousStartup: string | null;
}

// 32 unique companies total, minus 1 ("SugboDoc Technologies Inc") whose source
// row is column-shifted/corrupted and gets excluded before dedup (see loadAndDedupe).
const EXPECTED_UNIQUE_COMPANIES = 31;

// ── Field-mapping lookup tables ─────────────────────────────────────────────

const INDUSTRY_MAP: Record<string, string> = {
  'technology': 'Information and Communication',
  'gaming and esports': 'Information and Communication',
  'b2b saas (software as a service)': 'Information and Communication',
  'education': 'Education',
  'travel and hospitality': 'Accommodation and Food Service Activities',
  'agriculture and food technology': 'Agriculture, Forestry and Fishing',
  'finance and fintech': 'Financial and Insurance Activities',
  'e-commerce and retail': 'Wholesale and Retail Trade',
  'healthcare': 'Human Health and Social Work Activities',
  'media and entertainment': 'Arts, Entertainment and Recreation',
  'hr and workplace': 'Administrative and Support Service Activities',
  'sustainability and clean energy': 'Electricity, Gas, Steam and Air Conditioning Supply',
  'social impact and non-profit': 'Other Service Activities',
};
const INDUSTRY_FALLBACK = 'Other Service Activities';

const STAGE_MAP: Array<[prefix: string, stage: string]> = [
  ['growth', 'GROWTH'],
  ['validation', 'VALIDATION'],
  ['expansion', 'EXPANSION'],
  ['maturity', 'MATURITY_EXIT'],
];
const STAGE_DEFAULT = 'VALIDATION';

// ── Local Zod validation (mirrors createEnterpriseSchema's constraints) ────

const enterpriseFieldsSchema = z.object({
  businessName: z.string().min(1).max(300),
  industrySector: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  yearEstablished: z.number().int().min(1900).max(2100).optional().nullable(),
  province: z.string().max(200).optional().nullable(),
  cityMunicipality: z.string().max(200).optional().nullable(),
  businessEmail: z.string().email().optional().nullable(),
  businessPhone: z.string().max(50).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  socialMediaFacebook: z.string().max(500).optional().nullable(),
  socialMediaLinkedIn: z.string().max(500).optional().nullable(),
  socialMediaInstagram: z.string().max(500).optional().nullable(),
  socialMediaOthers: z.string().max(1000).optional().nullable(),
  stage: z.enum(['IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT']),
  businessIsRegistered: z.boolean().optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});
type EnterpriseFields = z.infer<typeof enterpriseFieldsSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function excelOrIsoToTimestamp(v: string | null): number {
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

function mapIndustry(raw: string | null, warnings: string[], companyName: string): string {
  if (!raw) return INDUSTRY_FALLBACK;
  const key = raw.trim().toLowerCase();
  const mapped = INDUSTRY_MAP[key];
  if (!mapped) {
    warnings.push(`${companyName}: industry "${raw}" has no mapping, using fallback "${INDUSTRY_FALLBACK}"`);
    return INDUSTRY_FALLBACK;
  }
  return mapped;
}

function mapStage(raw: string | null): string {
  if (!raw) return STAGE_DEFAULT;
  const lower = raw.trim().toLowerCase();
  for (const [prefix, stage] of STAGE_MAP) {
    if (lower.startsWith(prefix)) return stage;
  }
  return STAGE_DEFAULT;
}

function deriveBusinessIsRegistered(raw: string | null): boolean | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('none') || lower.includes('under processing') || lower.includes('soon to be')) return false;
  if (['sec', 'dti bn', 'bir', "mayor's permit"].some((k) => lower.includes(k))) return true;
  return null;
}

function cleanCity(raw: string | null): string | null {
  if (!raw) return null;
  return raw.trim().replace(/,\s*cebu\.?$/i, '').trim() || null;
}

function cleanWebsite(raw: string | number | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Returns { phone, unparseable } — unparseable raw value goes into notes instead. */
function cleanMobile(raw: string | number | null): { phone: string | null; unparseableRaw: string | null } {
  if (raw == null) return { phone: null, unparseableRaw: null };
  const raw_s = String(raw).trim();
  const digits = raw_s.replace(/\D/g, '');
  if (digits.length < 7) return { phone: null, unparseableRaw: raw_s || null };
  return { phone: digits, unparseableRaw: null };
}

interface SocialLinks {
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  others: string | null;
}
function splitSocialLinks(raw: string | null): SocialLinks {
  const out: SocialLinks = { facebook: null, linkedin: null, instagram: null, others: null };
  if (!raw) return out;
  const others: string[] = [];
  for (const part of raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
    const lower = part.toLowerCase();
    if (lower.includes('facebook.com') && !out.facebook) out.facebook = part;
    else if (lower.includes('linkedin.com') && !out.linkedin) out.linkedin = part;
    else if (lower.includes('instagram.com') && !out.instagram) out.instagram = part;
    else others.push(part);
  }
  if (others.length) out.others = others.join(', ');
  return out;
}

function splitContactName(raw: string | null): { firstName: string; lastName: string } {
  const trimmed = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: 'Unknown', lastName: 'Contact' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

function buildNotes(row: RawRow, mobileUnparseable: string | null): string | null {
  const lines: string[] = [`[Migrated from DTI Startup Longlist — Startup ID ${row.startupId ?? '?'}]`];
  const add = (label: string, value: unknown) => {
    if (value === null || value === undefined) return;
    const s = String(value).trim();
    if (s) lines.push(`${label}: ${s}`);
  };
  add('Operating Status', row.operatingStatus);
  add('Legal Identity', row.legalIdentity);
  add('Revenue Status', row.revenueStatus);
  add('MRR', row.mrr);
  add('Funding Stage', row.fundingStage);
  add('Jobs Created', row.jobsCreated);
  add('Markets Reached', row.marketsReached);
  add('Contact Designation', row.designation);
  add('Programs Participated', row.programsParticipated);
  add('Major Milestones', row.majorMilestones);
  add('Support Needed', row.supportNeeded);
  add('Priority Support Area', row.prioritySupportArea);
  add('Remarks', row.remarks);
  add('Previous Startup (if applicable)', row.previousStartup);
  if (mobileUnparseable) add('Mobile Number (unparseable, kept as-is)', mobileUnparseable);
  if (row.lastUpdated) {
    const t = excelOrIsoToTimestamp(row.lastUpdated);
    add('Last Updated (source sheet)', t ? new Date(t).toISOString().slice(0, 10) : row.lastUpdated);
  }
  return lines.length > 1 ? lines.join('\n') : null;
}

// ── Pipeline ─────────────────────────────────────────────────────────────

interface MappedCompany {
  row: RawRow;
  contactEmail: string;
  contactFirstName: string;
  contactLastName: string;
  contactMobile: string | null;
  enterprise: EnterpriseFields;
}

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

function mapRow(row: RawRow, warnings: string[]): MappedCompany | { error: string } {
  if (!row.emailAddress || !row.emailAddress.includes('@')) {
    return { error: `missing/invalid email address` };
  }

  const { firstName, lastName } = splitContactName(row.primaryContactPerson);
  const { phone: businessPhone, unparseableRaw: mobileUnparseable } = cleanMobile(row.mobileNumber);
  const social = splitSocialLinks(row.socialMediaLink);

  const enterpriseFields = {
    businessName: row.startup.trim(),
    industrySector: mapIndustry(row.industry, warnings, row.startup),
    description: row.shortDescription,
    yearEstablished: typeof row.yearFounded === 'number' ? row.yearFounded
      : (row.yearFounded && /^\d{4}$/.test(String(row.yearFounded)) ? Number(row.yearFounded) : null),
    province: row.province,
    cityMunicipality: cleanCity(row.city),
    businessEmail: row.emailAddress,
    businessPhone,
    websiteUrl: cleanWebsite(row.website),
    socialMediaFacebook: social.facebook,
    socialMediaLinkedIn: social.linkedin,
    socialMediaInstagram: social.instagram,
    socialMediaOthers: social.others,
    stage: mapStage(row.startupStage),
    businessIsRegistered: deriveBusinessIsRegistered(row.legalIdentity),
    notes: buildNotes(row, mobileUnparseable),
  };

  const parsed = enterpriseFieldsSchema.safeParse(enterpriseFields);
  if (!parsed.success) {
    return { error: `validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}` };
  }

  return {
    row,
    contactEmail: row.emailAddress.trim().toLowerCase(),
    contactFirstName: firstName,
    contactLastName: lastName,
    contactMobile: businessPhone,
    enterprise: parsed.data,
  };
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
    const mapped = mapRow(row, warnings);
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
