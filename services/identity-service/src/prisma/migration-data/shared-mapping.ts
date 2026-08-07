/**
 * Field-mapping logic shared by migrate-longlist.ts and migrate-olddata.ts —
 * both DTI startup-tracker spreadsheets use the same column semantics, just
 * with a couple of columns missing in the older sheet (see extract-olddata.py).
 */
import { z } from 'zod';

// ── Source row shape (matches extract-longlist.py / extract-olddata.py) ────
export interface RawRow {
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

// ── Field-mapping lookup tables ─────────────────────────────────────────────

export const INDUSTRY_MAP: Record<string, string> = {
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
export const INDUSTRY_FALLBACK = 'Other Service Activities';

// olddata.xlsx's Industry column is a "check all that applies" multi-select
// (comma-joined, occasionally with internal commas of its own, e.g.
// "Creative Industries (design, content, digital media, arts and etc.)"),
// using a different vocabulary than Longlist.xlsx's single-value column. A
// full-string match against INDUSTRY_MAP above will essentially never hit
// for these, so mapIndustry falls back to a substring scan (checked in this
// priority order — vertical/sector-specific terms before generic
// technology-implementation terms, so e.g. "Agritech, AI / Data Analytics"
// resolves to Agriculture rather than Information and Communication).
export const INDUSTRY_SUBSTRING_MAP: Array<[substring: string, sector: string]> = [
  ['healthtech', 'Human Health and Social Work Activities'],
  ['medtech', 'Human Health and Social Work Activities'],
  ['agritech', 'Agriculture, Forestry and Fishing'],
  ['edtech', 'Education'],
  ['games', 'Arts, Entertainment and Recreation'],
  ['creative industries', 'Arts, Entertainment and Recreation'],
  ['tourism', 'Accommodation and Food Service Activities'],
  ['hospitality', 'Accommodation and Food Service Activities'],
  ['green / cleantech', 'Electricity, Gas, Steam and Air Conditioning Supply'],
  ['cleantech', 'Electricity, Gas, Steam and Air Conditioning Supply'],
  ['logistics', 'Transportation and Storage'],
  ['mobility', 'Transportation and Storage'],
  ['e-commerce', 'Wholesale and Retail Trade'],
  ['retail tech', 'Wholesale and Retail Trade'],
  ['software / saas', 'Information and Communication'],
  ['ai / data analytics', 'Information and Communication'],
  ['mobile app', 'Information and Communication'],
];

export const STAGE_MAP: Array<[prefix: string, stage: string]> = [
  ['growth', 'GROWTH'],
  ['validation', 'VALIDATION'],
  ['expansion', 'EXPANSION'],
  ['maturity', 'MATURITY_EXIT'],
];
export const STAGE_DEFAULT = 'VALIDATION';

// ── Local Zod validation (mirrors createEnterpriseSchema's constraints) ────

export const enterpriseFieldsSchema = z.object({
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
export type EnterpriseFields = z.infer<typeof enterpriseFieldsSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function excelOrIsoToTimestamp(v: string | null): number {
  if (!v) return 0;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

export function mapIndustry(raw: string | null, warnings: string[], companyName: string): string {
  if (!raw) return INDUSTRY_FALLBACK;
  const key = raw.trim().toLowerCase();

  const exact = INDUSTRY_MAP[key];
  if (exact) return exact;

  for (const [substring, sector] of INDUSTRY_SUBSTRING_MAP) {
    if (key.includes(substring)) return sector;
  }

  warnings.push(`${companyName}: industry "${raw}" has no mapping, using fallback "${INDUSTRY_FALLBACK}"`);
  return INDUSTRY_FALLBACK;
}

export function mapStage(raw: string | null): string {
  if (!raw) return STAGE_DEFAULT;
  const lower = raw.trim().toLowerCase();
  for (const [prefix, stage] of STAGE_MAP) {
    if (lower.startsWith(prefix)) return stage;
  }
  return STAGE_DEFAULT;
}

export function deriveBusinessIsRegistered(raw: string | null): boolean | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('none') || lower.includes('under processing') || lower.includes('soon to be')) return false;
  if (['sec', 'dti bn', 'bir', "mayor's permit"].some((k) => lower.includes(k))) return true;
  return null;
}

export function cleanCity(raw: string | null): string | null {
  if (!raw) return null;
  return raw.trim().replace(/,\s*cebu\.?$/i, '').trim() || null;
}

/** Returns { url, unparseableRaw } — a raw value that isn't a plausible URL
 * (e.g. someone typed a street address into the Website column) goes into
 * notes instead of failing the whole row. */
export function cleanWebsite(raw: string | number | null): { url: string | null; unparseableRaw: string | null } {
  if (raw == null) return { url: null, unparseableRaw: null };
  const s = String(raw).trim();
  if (!s) return { url: null, unparseableRaw: null };
  const candidate = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    // eslint-disable-next-line no-new
    new URL(candidate);
    if (/\s/.test(s)) throw new Error('contains whitespace, not a real domain');
    return { url: candidate, unparseableRaw: null };
  } catch {
    return { url: null, unparseableRaw: s };
  }
}

/** Returns { phone, unparseable } — unparseable raw value goes into notes instead. */
export function cleanMobile(raw: string | number | null): { phone: string | null; unparseableRaw: string | null } {
  if (raw == null) return { phone: null, unparseableRaw: null };
  const raw_s = String(raw).trim();
  const digits = raw_s.replace(/\D/g, '');
  if (digits.length < 7) return { phone: null, unparseableRaw: raw_s || null };
  return { phone: digits, unparseableRaw: null };
}

export interface SocialLinks {
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  others: string | null;
}
export function splitSocialLinks(raw: string | null): SocialLinks {
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

export function splitContactName(raw: string | null): { firstName: string; lastName: string } {
  const trimmed = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: 'Unknown', lastName: 'Contact' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

export function buildNotes(
  row: RawRow,
  mobileUnparseable: string | null,
  websiteUnparseable: string | null,
  sourceLabel: string,
): string | null {
  const lines: string[] = [`[Migrated from ${sourceLabel} — Startup ID ${row.startupId ?? '?'}]`];
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
  if (websiteUnparseable) add('Website (unparseable, kept as-is)', websiteUnparseable);
  if (row.lastUpdated) {
    const t = excelOrIsoToTimestamp(row.lastUpdated);
    add('Last Updated (source sheet)', t ? new Date(t).toISOString().slice(0, 10) : row.lastUpdated);
  }
  return lines.length > 1 ? lines.join('\n') : null;
}

export interface MappedCompany {
  row: RawRow;
  contactEmail: string;
  contactFirstName: string;
  contactLastName: string;
  contactMobile: string | null;
  enterprise: EnterpriseFields;
}

export function mapRow(row: RawRow, warnings: string[], sourceLabel: string): MappedCompany | { error: string } {
  if (!row.emailAddress || !row.emailAddress.includes('@')) {
    return { error: `missing/invalid email address` };
  }

  const { firstName, lastName } = splitContactName(row.primaryContactPerson);
  const { phone: businessPhone, unparseableRaw: mobileUnparseable } = cleanMobile(row.mobileNumber);
  const { url: websiteUrl, unparseableRaw: websiteUnparseable } = cleanWebsite(row.website);
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
    websiteUrl,
    socialMediaFacebook: social.facebook,
    socialMediaLinkedIn: social.linkedin,
    socialMediaInstagram: social.instagram,
    socialMediaOthers: social.others,
    stage: mapStage(row.startupStage),
    businessIsRegistered: deriveBusinessIsRegistered(row.legalIdentity),
    notes: buildNotes(row, mobileUnparseable, websiteUnparseable, sourceLabel),
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

// ── Fuzzy name matching (for "previously imported data prevails") ─────────

const FUZZY_STOPWORDS = new Set([
  'inc', 'incorporated', 'corp', 'corporation', 'ltd', 'limited', 'co', 'company',
  'technologies', 'technology', 'solutions', 'solution', 'llc', 'app', 'apps',
  'philippines', 'ph', 'the', 'group', 'holdings', 'web',
]);

/** Order-independent, suffix-stripped normalization for detecting the same
 * company under slightly different spellings (e.g. "Farmtri" vs "Farmtri AI",
 * "BioConnectify" vs "BioConnectify Technologies Inc."). */
export function normalizeForFuzzyMatch(name: string): string {
  const s = name.toLowerCase().replace(/[^\w\s]/g, ' ');
  const tokens = s.split(/\s+/).filter((t) => t && !FUZZY_STOPWORDS.has(t));
  return [...new Set(tokens)].sort().join(' ');
}
