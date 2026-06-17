import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminIdentityApi } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Globe, GlobeLock, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const STAGE_BADGE: Record<string, string> = {
  IDEATION:      'bg-gray-100 text-gray-600',
  VALIDATION:    'bg-blue-100 text-blue-700',
  GROWTH:        'bg-green-100 text-green-700',
  EXPANSION:     'bg-purple-100 text-purple-700',
  MATURITY_EXIT: 'bg-teal-100 text-teal-700',
};

const INDUSTRY_SECTORS = [
  'Agriculture, Forestry & Fishing', 'Food & Beverage Manufacturing', 'Textile & Garments',
  'Retail & Wholesale Trade', 'Trading / Retail', 'Tourism, Hospitality & Food Service',
  'Information Technology & BPO', 'Technology / IT', 'Health & Social Services',
  'Arts, Entertainment & Recreation', 'Creative Industries', 'Handicrafts',
  'Startup / Innovation Ecosystem', 'Construction & Real Estate', 'Transportation & Logistics',
  'Financial Services', 'Education & Training', 'Other',
];
const STAGES = ['IDEATION', 'VALIDATION', 'GROWTH', 'EXPANSION', 'MATURITY_EXIT'];
const MSME_LEVELS = [
  { value: 'LEVEL_0',   label: 'Level 0 – Would-be / Potential Entrepreneurs' },
  { value: 'LEVEL_1',   label: 'Level 1 – Nurturing Startup' },
  { value: 'LEVEL_1_1', label: 'Level 1.1 – Unregistered' },
  { value: 'LEVEL_1_2', label: 'Level 1.2 – Partially Registered' },
  { value: 'LEVEL_2',   label: 'Level 2 – Growing Enterprises (Registered)' },
  { value: 'LEVEL_3',   label: 'Level 3 – Expanding Enterprises (Registered)' },
  { value: 'LEVEL_4',   label: 'Level 4 – Sustaining Enterprises (Registered)' },
  { value: 'CEASED',    label: 'Ceased Operations' },
];
const FORM_OF_ORG = [
  { value: 'SOLE_PROPRIETORSHIP',       label: 'Sole Proprietorship' },
  { value: 'PARTNERSHIP',               label: 'Partnership' },
  { value: 'ASSOCIATION',               label: 'Association' },
  { value: 'CORPORATION',               label: 'Corporation' },
  { value: 'COOPERATIVE',               label: 'Cooperative' },
  { value: 'WORKERS_RURAL_ASSOCIATION', label: "Worker's / Rural Association (DOLE)" },
  { value: 'ONE_PERSON_CORPORATION',    label: 'One Person Corporation' },
  { value: 'FRANCHISE',                 label: 'Franchise' },
];
const ASSET_SIZE = [
  { value: 'MICRO',  label: 'Micro – Up to ₱3,000,000' },
  { value: 'SMALL',  label: 'Small – ₱3,000,001 to ₱15,000,000' },
  { value: 'MEDIUM', label: 'Medium – ₱15,000,001 to ₱100,000,000' },
  { value: 'LARGE',  label: 'Large – More than ₱100,000,000' },
];
const BUSINESS_ACTIVITY = [
  { value: 'MANUFACTURING_PRODUCING', label: 'Manufacturing / Producing' },
  { value: 'WHOLESALING_TRADING',     label: 'Wholesaling / Trading' },
  { value: 'RETAILING_TRADING',       label: 'Retailing / Trading' },
  { value: 'EXPORTING',               label: 'Exporting' },
  { value: 'IMPORTING',               label: 'Importing' },
  { value: 'SERVICE',                 label: 'Service' },
];
const EDT_LEVELS = [
  { value: 'LEVEL_0', label: 'Level 0 – Entrepreneurial Mind' },
  { value: 'LEVEL_1', label: 'Level 1 – Nurturing Startup' },
  { value: 'LEVEL_2', label: 'Level 2 – Growing Business' },
  { value: 'LEVEL_3', label: 'Level 3 – Expanding Enterprise' },
  { value: 'LEVEL_4', label: 'Level 4 – Growing Enterprise' },
];
const RIPPLES_STAGES = [
  { value: 'STAGE_5', label: 'Stage 5 – Export Entry' },
  { value: 'STAGE_6', label: 'Stage 6 – Export Sustainability' },
  { value: 'STAGE_7', label: 'Stage 7 – Export Expansion' },
];
const SMERA_STAGES = [
  { value: 'STAGE_1', label: 'Stage 1 – Start Up and Capability Building' },
  { value: 'STAGE_2', label: 'Stage 2 – Market Awareness' },
  { value: 'STAGE_3', label: 'Stage 3 – Market Readiness' },
  { value: 'STAGE_4', label: 'Stage 4 – Export Readiness' },
];
const DIGITALIZATION_LEVELS = [
  { value: 'LEVEL_0', label: 'Level 0 – No digital tools' },
  { value: 'LEVEL_1', label: 'Level 1 – Basic' },
  { value: 'LEVEL_2', label: 'Level 2 – Intermediate (online presence)' },
  { value: 'LEVEL_3', label: 'Level 3 – Advanced' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const INPUT_CLS = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue';
const LBL_CLS   = 'block text-xs font-medium text-gray-600 mb-1';

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-2 pt-4 pb-1 border-b border-dashed border-gray-200">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-dti-blue">{title}</h3>
    </div>
  );
}

function toDateInputValue(value: string): string {
  if (!value) return '';
  const raw = value.trim();
  if (!raw) return '';

  const yyyyMmDdPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (yyyyMmDdPrefix) return yyyyMmDdPrefix[1];

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function FField({ label, value, onChange, type = 'text', placeholder, span2 }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; span2?: boolean;
}) {
  const safeValue = type === 'date' ? toDateInputValue(value) : value;
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className={LBL_CLS}>{label}</label>
      <input type={type} value={safeValue} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLS} />
    </div>
  );
}
function FSelect({ label, value, onChange, options, span2 }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; span2?: boolean;
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className={LBL_CLS}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS}>
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function FNum({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={LBL_CLS}>{label}</label>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS} />
    </div>
  );
}

// ── Parse helpers ──────────────────────────────────────────────────────────
function pNum(v: string): number | null { const n = parseInt(v, 10); return isNaN(n) ? null : n; }
function pBool(v: string): boolean | null { return v === 'true' ? true : v === 'false' ? false : null; }
function pCsv(v: string): string[] { return v.split(',').map((s) => s.trim()).filter(Boolean); }
function orNull(v: string): string | null { return v.trim() || null; }
function s(v: string | null | undefined): string { return v ?? ''; }
function n(v: number | null | undefined): string { return v != null ? String(v) : ''; }
function b(v: boolean | null | undefined): string { return v == null ? '' : v ? 'true' : 'false'; }
function arr(v: string[] | null | undefined): string { return (v ?? []).join(', '); }
function dateStr(v: string | null | undefined): string { return v ? toDateInputValue(v) : ''; }

// ── Interfaces ─────────────────────────────────────────────────────────────
interface Enterprise {
  id: string;
  // S1: IDs
  cpmsIdNumber: string | null; oldCpmsIdNumber: string | null; philsysNumber: string | null;
  tinNumber: string | null; dtiKonekIdNumber: string | null;
  // S2: MSME Status
  msmeLevel: string | null; businessIsRegistered: boolean | null;
  // S3: Registration
  businessName: string; registeredBusinessName: string | null; tradeName: string | null;
  dateOfRegistration: string | null; registrationNo: string | null; ipoRegistrationNumber: string | null;
  // S4: Address
  houseNo: string | null; streetName: string | null; barangay: string | null;
  district: string | null; cityMunicipality: string | null; province: string | null;
  region: string | null; zipCode: string | null;
  // S5: Contact
  businessEmail: string | null; businessPhone: string | null; businessFax: string | null;
  websiteUrl: string | null; socialMediaFacebook: string | null; socialMediaInstagram: string | null;
  socialMediaLinkedIn: string | null; socialMediaOthers: string | null;
  // S6: Profile
  description: string | null; yearEstablished: number | null; formOfOrganization: string | null;
  assetSizeClassification: string | null; primaryBusinessActivity: string | null;
  secondaryBusinessActivity: string | null; psicSection: string | null; psicDivision: string | null;
  psicGroup: string | null; priorityIndustry: string | null; industryClusterEnhancement: string | null;
  industrySector: string; industryTags: string[]; tradeAssociationAffiliations: string[]; stage: string;
  // S7: Owner
  ownerPrefix: string | null; ownerFirstName: string | null; ownerMiddleName: string | null;
  ownerLastName: string | null; ownerSuffix: string | null; ownerBirthdate: string | null;
  ownerCitizenship: string | null; ownerSex: string | null; ownerCivilStatus: string | null;
  ownerSocialClassification: string | null; ownerHouseNo: string | null; ownerStreetName: string | null;
  ownerBarangay: string | null; ownerDistrict: string | null; ownerCityMunicipality: string | null;
  ownerProvince: string | null; ownerRegion: string | null; ownerZipCode: string | null;
  // S8: Trackers
  edtLevel: string | null; ripplesStage: string | null; smeraStage: string | null;
  digitalizationLevel: string | null; hasEmail: boolean | null; hasFacebook: boolean | null;
  // S9: Financial
  initialCapitalization: string | null; initialCapitalizationYear: number | null;
  authorizedCapital: string | null; subscribedCapital: string | null; paidUpCapital: string | null;
  assetSizeRange: string | null; domesticSales: string | null; exportSales: string | null;
  annualRevenue: string | null;
  // S13: Employment
  employeeCount: number | null;
  ftAbledMale: number | null; ftAbledFemale: number | null;
  ftDiffAbledMale: number | null; ftDiffAbledFemale: number | null;
  ftIndigenousMale: number | null; ftIndigenousFemale: number | null;
  ftSeniorMale: number | null; ftSeniorFemale: number | null;
  ptAbledMale: number | null; ptAbledFemale: number | null;
  ptDiffAbledMale: number | null; ptDiffAbledFemale: number | null;
  ptIndigenousMale: number | null; ptIndigenousFemale: number | null;
  ptSeniorMale: number | null; ptSeniorFemale: number | null;
  // Admin
  isVerified: boolean; isPubliclyListed: boolean; createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string };
}

type EditForm = {
  cpmsIdNumber: string; oldCpmsIdNumber: string; philsysNumber: string;
  tinNumber: string; dtiKonekIdNumber: string;
  msmeLevel: string; businessIsRegistered: string;
  businessName: string; registeredBusinessName: string; tradeName: string;
  dateOfRegistration: string; registrationNo: string; ipoRegistrationNumber: string;
  houseNo: string; streetName: string; barangay: string; district: string;
  cityMunicipality: string; province: string; region: string; zipCode: string;
  businessEmail: string; businessPhone: string; businessFax: string;
  websiteUrl: string; socialMediaFacebook: string; socialMediaInstagram: string;
  socialMediaLinkedIn: string; socialMediaOthers: string;
  description: string; yearEstablished: string; formOfOrganization: string;
  assetSizeClassification: string; primaryBusinessActivity: string;
  secondaryBusinessActivity: string; psicSection: string; psicDivision: string;
  psicGroup: string; priorityIndustry: string; industryClusterEnhancement: string;
  industrySector: string; industryTags: string; tradeAssociationAffiliations: string; stage: string;
  ownerPrefix: string; ownerFirstName: string; ownerMiddleName: string;
  ownerLastName: string; ownerSuffix: string; ownerBirthdate: string;
  ownerCitizenship: string; ownerSex: string; ownerCivilStatus: string;
  ownerSocialClassification: string; ownerHouseNo: string; ownerStreetName: string;
  ownerBarangay: string; ownerDistrict: string; ownerCityMunicipality: string;
  ownerProvince: string; ownerRegion: string; ownerZipCode: string;
  edtLevel: string; ripplesStage: string; smeraStage: string;
  digitalizationLevel: string; hasEmail: string; hasFacebook: string;
  initialCapitalization: string; initialCapitalizationYear: string;
  authorizedCapital: string; subscribedCapital: string; paidUpCapital: string;
  assetSizeRange: string; domesticSales: string; exportSales: string; annualRevenue: string;
  employeeCount: string;
  ftAbledMale: string; ftAbledFemale: string; ftDiffAbledMale: string; ftDiffAbledFemale: string;
  ftIndigenousMale: string; ftIndigenousFemale: string; ftSeniorMale: string; ftSeniorFemale: string;
  ptAbledMale: string; ptAbledFemale: string; ptDiffAbledMale: string; ptDiffAbledFemale: string;
  ptIndigenousMale: string; ptIndigenousFemale: string; ptSeniorMale: string; ptSeniorFemale: string;
  isVerified: boolean; isPubliclyListed: boolean;
};

function toEditForm(e: Enterprise): EditForm {
  return {
    cpmsIdNumber: s(e.cpmsIdNumber), oldCpmsIdNumber: s(e.oldCpmsIdNumber),
    philsysNumber: s(e.philsysNumber), tinNumber: s(e.tinNumber), dtiKonekIdNumber: s(e.dtiKonekIdNumber),
    msmeLevel: s(e.msmeLevel), businessIsRegistered: b(e.businessIsRegistered),
    businessName: e.businessName, registeredBusinessName: s(e.registeredBusinessName),
    tradeName: s(e.tradeName), dateOfRegistration: dateStr(e.dateOfRegistration),
    registrationNo: s(e.registrationNo), ipoRegistrationNumber: s(e.ipoRegistrationNumber),
    houseNo: s(e.houseNo), streetName: s(e.streetName), barangay: s(e.barangay),
    district: s(e.district), cityMunicipality: s(e.cityMunicipality), province: s(e.province),
    region: s(e.region), zipCode: s(e.zipCode),
    businessEmail: s(e.businessEmail), businessPhone: s(e.businessPhone), businessFax: s(e.businessFax),
    websiteUrl: s(e.websiteUrl), socialMediaFacebook: s(e.socialMediaFacebook),
    socialMediaInstagram: s(e.socialMediaInstagram), socialMediaLinkedIn: s(e.socialMediaLinkedIn),
    socialMediaOthers: s(e.socialMediaOthers),
    description: s(e.description), yearEstablished: n(e.yearEstablished),
    formOfOrganization: s(e.formOfOrganization), assetSizeClassification: s(e.assetSizeClassification),
    primaryBusinessActivity: s(e.primaryBusinessActivity), secondaryBusinessActivity: s(e.secondaryBusinessActivity),
    psicSection: s(e.psicSection), psicDivision: s(e.psicDivision), psicGroup: s(e.psicGroup),
    priorityIndustry: s(e.priorityIndustry), industryClusterEnhancement: s(e.industryClusterEnhancement),
    industrySector: e.industrySector, industryTags: arr(e.industryTags),
    tradeAssociationAffiliations: arr(e.tradeAssociationAffiliations), stage: e.stage,
    ownerPrefix: s(e.ownerPrefix), ownerFirstName: s(e.ownerFirstName),
    ownerMiddleName: s(e.ownerMiddleName), ownerLastName: s(e.ownerLastName),
    ownerSuffix: s(e.ownerSuffix), ownerBirthdate: dateStr(e.ownerBirthdate),
    ownerCitizenship: s(e.ownerCitizenship), ownerSex: s(e.ownerSex),
    ownerCivilStatus: s(e.ownerCivilStatus), ownerSocialClassification: s(e.ownerSocialClassification),
    ownerHouseNo: s(e.ownerHouseNo), ownerStreetName: s(e.ownerStreetName),
    ownerBarangay: s(e.ownerBarangay), ownerDistrict: s(e.ownerDistrict),
    ownerCityMunicipality: s(e.ownerCityMunicipality), ownerProvince: s(e.ownerProvince),
    ownerRegion: s(e.ownerRegion), ownerZipCode: s(e.ownerZipCode),
    edtLevel: s(e.edtLevel), ripplesStage: s(e.ripplesStage), smeraStage: s(e.smeraStage),
    digitalizationLevel: s(e.digitalizationLevel), hasEmail: b(e.hasEmail), hasFacebook: b(e.hasFacebook),
    initialCapitalization: s(e.initialCapitalization), initialCapitalizationYear: n(e.initialCapitalizationYear),
    authorizedCapital: s(e.authorizedCapital), subscribedCapital: s(e.subscribedCapital),
    paidUpCapital: s(e.paidUpCapital), assetSizeRange: s(e.assetSizeRange),
    domesticSales: s(e.domesticSales), exportSales: s(e.exportSales), annualRevenue: s(e.annualRevenue),
    employeeCount: n(e.employeeCount),
    ftAbledMale: n(e.ftAbledMale), ftAbledFemale: n(e.ftAbledFemale),
    ftDiffAbledMale: n(e.ftDiffAbledMale), ftDiffAbledFemale: n(e.ftDiffAbledFemale),
    ftIndigenousMale: n(e.ftIndigenousMale), ftIndigenousFemale: n(e.ftIndigenousFemale),
    ftSeniorMale: n(e.ftSeniorMale), ftSeniorFemale: n(e.ftSeniorFemale),
    ptAbledMale: n(e.ptAbledMale), ptAbledFemale: n(e.ptAbledFemale),
    ptDiffAbledMale: n(e.ptDiffAbledMale), ptDiffAbledFemale: n(e.ptDiffAbledFemale),
    ptIndigenousMale: n(e.ptIndigenousMale), ptIndigenousFemale: n(e.ptIndigenousFemale),
    ptSeniorMale: n(e.ptSeniorMale), ptSeniorFemale: n(e.ptSeniorFemale),
    isVerified: e.isVerified, isPubliclyListed: e.isPubliclyListed,
  };
}

export function AdminEnterprisesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const queryClient = useQueryClient();

  const [editTarget, setEditTarget] = useState<Enterprise | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enterprise | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enterprises', page, search, stageFilter, verifiedFilter],
    queryFn: () =>
      adminIdentityApi.listEnterprises({
        page, limit: 20,
        ...(search        ? { search }            : {}),
        ...(stageFilter   ? { stage: stageFilter } : {}),
        ...(verifiedFilter ? { verified: verifiedFilter } : {}),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.verifyEnterprise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });
  const toggleListingMutation = useMutation({
    mutationFn: ({ id, listed }: { id: string; listed: boolean }) =>
      adminIdentityApi.updateEnterprise(id, { isPubliclyListed: listed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] }),
  });
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminIdentityApi.updateEnterprise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] });
      setEditTarget(null);
      setEditForm(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminIdentityApi.deleteEnterprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enterprises'] });
      setDeleteTarget(null);
    },
  });

  const enterprises: Enterprise[] = Array.isArray((data as any)?.data) ? (data as any).data : [];
  const meta = (data as any)?.meta;

  function openEdit(e: Enterprise) { setEditTarget(e); setEditForm(toEditForm(e)); }
  function set(field: keyof EditForm, value: string | boolean) {
    setEditForm((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  function submitEdit() {
    if (!editTarget || !editForm) return;
    const f = editForm;
    editMutation.mutate({
      id: editTarget.id,
      data: {
        cpmsIdNumber: orNull(f.cpmsIdNumber), oldCpmsIdNumber: orNull(f.oldCpmsIdNumber),
        philsysNumber: orNull(f.philsysNumber), tinNumber: orNull(f.tinNumber),
        dtiKonekIdNumber: orNull(f.dtiKonekIdNumber),
        msmeLevel: orNull(f.msmeLevel), businessIsRegistered: pBool(f.businessIsRegistered),
        businessName: f.businessName.trim(), registeredBusinessName: orNull(f.registeredBusinessName),
        tradeName: orNull(f.tradeName), dateOfRegistration: orNull(f.dateOfRegistration),
        registrationNo: orNull(f.registrationNo), ipoRegistrationNumber: orNull(f.ipoRegistrationNumber),
        houseNo: orNull(f.houseNo), streetName: orNull(f.streetName), barangay: orNull(f.barangay),
        district: orNull(f.district), cityMunicipality: orNull(f.cityMunicipality),
        province: orNull(f.province), region: orNull(f.region), zipCode: orNull(f.zipCode),
        businessEmail: orNull(f.businessEmail), businessPhone: orNull(f.businessPhone),
        businessFax: orNull(f.businessFax), websiteUrl: orNull(f.websiteUrl),
        socialMediaFacebook: orNull(f.socialMediaFacebook), socialMediaInstagram: orNull(f.socialMediaInstagram),
        socialMediaLinkedIn: orNull(f.socialMediaLinkedIn), socialMediaOthers: orNull(f.socialMediaOthers),
        description: orNull(f.description), yearEstablished: pNum(f.yearEstablished),
        formOfOrganization: orNull(f.formOfOrganization), assetSizeClassification: orNull(f.assetSizeClassification),
        primaryBusinessActivity: orNull(f.primaryBusinessActivity), secondaryBusinessActivity: orNull(f.secondaryBusinessActivity),
        psicSection: orNull(f.psicSection), psicDivision: orNull(f.psicDivision), psicGroup: orNull(f.psicGroup),
        priorityIndustry: orNull(f.priorityIndustry), industryClusterEnhancement: orNull(f.industryClusterEnhancement),
        industrySector: f.industrySector, industryTags: pCsv(f.industryTags),
        tradeAssociationAffiliations: pCsv(f.tradeAssociationAffiliations), stage: f.stage,
        ownerPrefix: orNull(f.ownerPrefix), ownerFirstName: orNull(f.ownerFirstName),
        ownerMiddleName: orNull(f.ownerMiddleName), ownerLastName: orNull(f.ownerLastName),
        ownerSuffix: orNull(f.ownerSuffix), ownerBirthdate: orNull(f.ownerBirthdate),
        ownerCitizenship: orNull(f.ownerCitizenship), ownerSex: orNull(f.ownerSex),
        ownerCivilStatus: orNull(f.ownerCivilStatus), ownerSocialClassification: orNull(f.ownerSocialClassification),
        ownerHouseNo: orNull(f.ownerHouseNo), ownerStreetName: orNull(f.ownerStreetName),
        ownerBarangay: orNull(f.ownerBarangay), ownerDistrict: orNull(f.ownerDistrict),
        ownerCityMunicipality: orNull(f.ownerCityMunicipality), ownerProvince: orNull(f.ownerProvince),
        ownerRegion: orNull(f.ownerRegion), ownerZipCode: orNull(f.ownerZipCode),
        edtLevel: orNull(f.edtLevel), ripplesStage: orNull(f.ripplesStage),
        smeraStage: orNull(f.smeraStage), digitalizationLevel: orNull(f.digitalizationLevel),
        hasEmail: pBool(f.hasEmail), hasFacebook: pBool(f.hasFacebook),
        initialCapitalization: orNull(f.initialCapitalization), initialCapitalizationYear: pNum(f.initialCapitalizationYear),
        authorizedCapital: orNull(f.authorizedCapital), subscribedCapital: orNull(f.subscribedCapital),
        paidUpCapital: orNull(f.paidUpCapital), assetSizeRange: orNull(f.assetSizeRange),
        domesticSales: orNull(f.domesticSales), exportSales: orNull(f.exportSales),
        annualRevenue: orNull(f.annualRevenue),
        employeeCount: pNum(f.employeeCount),
        ftAbledMale: pNum(f.ftAbledMale), ftAbledFemale: pNum(f.ftAbledFemale),
        ftDiffAbledMale: pNum(f.ftDiffAbledMale), ftDiffAbledFemale: pNum(f.ftDiffAbledFemale),
        ftIndigenousMale: pNum(f.ftIndigenousMale), ftIndigenousFemale: pNum(f.ftIndigenousFemale),
        ftSeniorMale: pNum(f.ftSeniorMale), ftSeniorFemale: pNum(f.ftSeniorFemale),
        ptAbledMale: pNum(f.ptAbledMale), ptAbledFemale: pNum(f.ptAbledFemale),
        ptDiffAbledMale: pNum(f.ptDiffAbledMale), ptDiffAbledFemale: pNum(f.ptDiffAbledFemale),
        ptIndigenousMale: pNum(f.ptIndigenousMale), ptIndigenousFemale: pNum(f.ptIndigenousFemale),
        ptSeniorMale: pNum(f.ptSeniorMale), ptSeniorFemale: pNum(f.ptSeniorFemale),
        isVerified: f.isVerified, isPubliclyListed: f.isPubliclyListed,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} enterprises registered</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by business name or TIN…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dti-blue"
          />
        </div>
        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={verifiedFilter} onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Business Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sector</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Listed</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registered</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : enterprises.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No enterprises found.</td></tr>
              ) : (
                enterprises.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{e.businessName}</div>
                      {e.tradeName && <div className="text-xs text-gray-400">{e.tradeName}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.industrySector}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[e.stage] ?? ''}`}>
                        {e.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{e.user.firstName} {e.user.lastName}</td>
                    <td className="px-4 py-3">{e.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}</td>
                    <td className="px-4 py-3">{e.isPubliclyListed ? <Globe size={16} className="text-blue-500" /> : <GlobeLock size={16} className="text-gray-300" />}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(e.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!e.isVerified && (
                          <button onClick={() => verifyMutation.mutate(e.id)} disabled={verifyMutation.isPending} className="text-xs text-dti-blue hover:text-dti-blue-dark font-medium px-1.5">Verify</button>
                        )}
                        <button onClick={() => toggleListingMutation.mutate({ id: e.id, listed: !e.isPubliclyListed })} disabled={toggleListingMutation.isPending} className={`text-xs font-medium px-1.5 ${e.isPubliclyListed ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}>
                          {e.isPubliclyListed ? 'Unlist' : 'List'}
                        </button>
                        <button onClick={() => openEdit(e)} title="Edit enterprise" className="p-1 text-gray-400 hover:text-dti-blue rounded"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(e)} title="Delete enterprise" className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── CPMS Edit Modal ───────────────────────────────────────────────── */}
      {editTarget && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">MSME CPMS — Edit Enterprise Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editTarget.businessName}</p>
              </div>
              <button onClick={() => { setEditTarget(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">

                {/* ── Section 1: Client IDs ─────────────────────────────── */}
                <SectionHeader title="Section 1 — Client IDs" />
                <FField label="MSME CPMS ID No." value={editForm.cpmsIdNumber} onChange={(v) => set('cpmsIdNumber', v)} />
                <FField label="Old CPMS ID No." value={editForm.oldCpmsIdNumber} onChange={(v) => set('oldCpmsIdNumber', v)} />
                <FField label="PhilSys No." value={editForm.philsysNumber} onChange={(v) => set('philsysNumber', v)} />
                <FField label="TIN No." value={editForm.tinNumber} onChange={(v) => set('tinNumber', v)} />
                <FField label="DTI Konek ID No." value={editForm.dtiKonekIdNumber} onChange={(v) => set('dtiKonekIdNumber', v)} />

                {/* ── Section 2: MSME Status ───────────────────────────── */}
                <SectionHeader title="Section 2 — MSME Status / Level" />
                <FSelect label="MSME Level" value={editForm.msmeLevel} onChange={(v) => set('msmeLevel', v)} options={MSME_LEVELS} />
                <FSelect label="Business Registered?" value={editForm.businessIsRegistered} onChange={(v) => set('businessIsRegistered', v)}
                  options={[{ value: 'true', label: 'Yes — Registered' }, { value: 'false', label: 'No — Unregistered' }]} />

                {/* ── Section 3: Business Registration ────────────────── */}
                <SectionHeader title="Section 3 — Business Registration" />
                <FField label="Business Name *" value={editForm.businessName} onChange={(v) => set('businessName', v)} span2 />
                <FField label="Registered Business Name" value={editForm.registeredBusinessName} onChange={(v) => set('registeredBusinessName', v)} />
                <FField label="Trade Name / Billboard Name" value={editForm.tradeName} onChange={(v) => set('tradeName', v)} />
                <FField label="Date of Registration" value={editForm.dateOfRegistration} onChange={(v) => set('dateOfRegistration', v)} type="date" />
                <FField label="Primary Reg. No. (DTI/SEC)" value={editForm.registrationNo} onChange={(v) => set('registrationNo', v)} />
                <FField label="IPO Registration No." value={editForm.ipoRegistrationNumber} onChange={(v) => set('ipoRegistrationNumber', v)} />

                {/* ── Section 4: Business Address ──────────────────────── */}
                <SectionHeader title="Section 4 — Business Address" />
                <FField label="House / Bldg. No." value={editForm.houseNo} onChange={(v) => set('houseNo', v)} />
                <FField label="Street Name" value={editForm.streetName} onChange={(v) => set('streetName', v)} />
                <FField label="Barangay" value={editForm.barangay} onChange={(v) => set('barangay', v)} />
                <FField label="District" value={editForm.district} onChange={(v) => set('district', v)} />
                <FField label="City / Municipality" value={editForm.cityMunicipality} onChange={(v) => set('cityMunicipality', v)} />
                <FField label="Province" value={editForm.province} onChange={(v) => set('province', v)} />
                <FField label="Region" value={editForm.region} onChange={(v) => set('region', v)} />
                <FField label="Zip Code" value={editForm.zipCode} onChange={(v) => set('zipCode', v)} />

                {/* ── Section 5: Business Contact ──────────────────────── */}
                <SectionHeader title="Section 5 — Business Contact Details" />
                <FField label="Business Email" value={editForm.businessEmail} onChange={(v) => set('businessEmail', v)} type="email" />
                <FField label="Mobile / Phone" value={editForm.businessPhone} onChange={(v) => set('businessPhone', v)} />
                <FField label="Landline / Fax" value={editForm.businessFax} onChange={(v) => set('businessFax', v)} />
                <FField label="Website URL" value={editForm.websiteUrl} onChange={(v) => set('websiteUrl', v)} type="url" placeholder="https://" />
                <FField label="Facebook" value={editForm.socialMediaFacebook} onChange={(v) => set('socialMediaFacebook', v)} />
                <FField label="Instagram" value={editForm.socialMediaInstagram} onChange={(v) => set('socialMediaInstagram', v)} />
                <FField label="LinkedIn" value={editForm.socialMediaLinkedIn} onChange={(v) => set('socialMediaLinkedIn', v)} />
                <FField label="Other Social Media" value={editForm.socialMediaOthers} onChange={(v) => set('socialMediaOthers', v)} />

                {/* ── Section 6: Business Profile ──────────────────────── */}
                <SectionHeader title="Section 6 — Business Profile" />
                <div className="col-span-2">
                  <label className={LBL_CLS}>Business Description</label>
                  <textarea value={editForm.description} onChange={(e) => set('description', e.target.value)} rows={3} className={INPUT_CLS} />
                </div>
                <FField label="Year Established" value={editForm.yearEstablished} onChange={(v) => set('yearEstablished', v)} type="number" placeholder="e.g. 2015" />
                <FSelect label="Form of Organization" value={editForm.formOfOrganization} onChange={(v) => set('formOfOrganization', v)} options={FORM_OF_ORG} />
                <FSelect label="Asset Size Classification" value={editForm.assetSizeClassification} onChange={(v) => set('assetSizeClassification', v)} options={ASSET_SIZE} />
                <FField label="Asset Size Range (text)" value={editForm.assetSizeRange} onChange={(v) => set('assetSizeRange', v)} placeholder="e.g. ₱3M – ₱15M" />
                <FSelect label="Primary Business Activity" value={editForm.primaryBusinessActivity} onChange={(v) => set('primaryBusinessActivity', v)} options={BUSINESS_ACTIVITY} />
                <FSelect label="Secondary Business Activity" value={editForm.secondaryBusinessActivity} onChange={(v) => set('secondaryBusinessActivity', v)} options={BUSINESS_ACTIVITY} />
                <FField label="PSIC Section" value={editForm.psicSection} onChange={(v) => set('psicSection', v)} />
                <FField label="PSIC Division" value={editForm.psicDivision} onChange={(v) => set('psicDivision', v)} />
                <FField label="PSIC Group" value={editForm.psicGroup} onChange={(v) => set('psicGroup', v)} />
                <div>
                  <label className={LBL_CLS}>Industry Sector *</label>
                  <select value={editForm.industrySector} onChange={(e) => set('industrySector', e.target.value)} className={INPUT_CLS}>
                    {INDUSTRY_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL_CLS}>Business Stage</label>
                  <select value={editForm.stage} onChange={(e) => set('stage', e.target.value)} className={INPUT_CLS}>
                    {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <FField label="Priority Industry" value={editForm.priorityIndustry} onChange={(v) => set('priorityIndustry', v)} />
                <FField label="Industry Cluster Enhancement (ICE)" value={editForm.industryClusterEnhancement} onChange={(v) => set('industryClusterEnhancement', v)} />
                <FField label="Industry Tags (comma-separated)" value={editForm.industryTags} onChange={(v) => set('industryTags', v)} span2 placeholder="e.g. export, food processing, halal" />
                <FField label="Trade Association Affiliations (comma-separated)" value={editForm.tradeAssociationAffiliations} onChange={(v) => set('tradeAssociationAffiliations', v)} span2 placeholder="e.g. PHILEXPORT, PCCI" />

                {/* ── Section 7: Business Owner ────────────────────────── */}
                <SectionHeader title="Section 7 — Business Owner / Chairperson / President" />
                <FField label="Prefix" value={editForm.ownerPrefix} onChange={(v) => set('ownerPrefix', v)} />
                <FField label="First Name" value={editForm.ownerFirstName} onChange={(v) => set('ownerFirstName', v)} />
                <FField label="Middle Name" value={editForm.ownerMiddleName} onChange={(v) => set('ownerMiddleName', v)} />
                <FField label="Last Name" value={editForm.ownerLastName} onChange={(v) => set('ownerLastName', v)} />
                <FField label="Suffix" value={editForm.ownerSuffix} onChange={(v) => set('ownerSuffix', v)} />
                <FField label="Birthdate" value={editForm.ownerBirthdate} onChange={(v) => set('ownerBirthdate', v)} type="date" />
                <FField label="Citizenship" value={editForm.ownerCitizenship} onChange={(v) => set('ownerCitizenship', v)} />
                <FSelect label="Sex" value={editForm.ownerSex} onChange={(v) => set('ownerSex', v)} options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }]} />
                <FSelect label="Civil Status" value={editForm.ownerCivilStatus} onChange={(v) => set('ownerCivilStatus', v)}
                  options={[{ value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }, { value: 'WIDOWED', label: 'Widowed' }, { value: 'LEGALLY_SEPARATED', label: 'Legally Separated' }]} />
                <FField label="Social Classification" value={editForm.ownerSocialClassification} onChange={(v) => set('ownerSocialClassification', v)} />
                <FField label="Owner House / Bldg No." value={editForm.ownerHouseNo} onChange={(v) => set('ownerHouseNo', v)} />
                <FField label="Owner Street" value={editForm.ownerStreetName} onChange={(v) => set('ownerStreetName', v)} />
                <FField label="Owner Barangay" value={editForm.ownerBarangay} onChange={(v) => set('ownerBarangay', v)} />
                <FField label="Owner District" value={editForm.ownerDistrict} onChange={(v) => set('ownerDistrict', v)} />
                <FField label="Owner City / Municipality" value={editForm.ownerCityMunicipality} onChange={(v) => set('ownerCityMunicipality', v)} />
                <FField label="Owner Province" value={editForm.ownerProvince} onChange={(v) => set('ownerProvince', v)} />
                <FField label="Owner Region" value={editForm.ownerRegion} onChange={(v) => set('ownerRegion', v)} />
                <FField label="Owner Zip Code" value={editForm.ownerZipCode} onChange={(v) => set('ownerZipCode', v)} />

                {/* ── Section 8: Business Trackers ─────────────────────── */}
                <SectionHeader title="Section 8 — Business Trackers" />
                <FSelect label="EDT Level" value={editForm.edtLevel} onChange={(v) => set('edtLevel', v)} options={EDT_LEVELS} />
                <FSelect label="RIPPLES Stage" value={editForm.ripplesStage} onChange={(v) => set('ripplesStage', v)} options={RIPPLES_STAGES} />
                <FSelect label="SMERA Stage" value={editForm.smeraStage} onChange={(v) => set('smeraStage', v)} options={SMERA_STAGES} />
                <FSelect label="Level of Digitalization" value={editForm.digitalizationLevel} onChange={(v) => set('digitalizationLevel', v)} options={DIGITALIZATION_LEVELS} />
                <FSelect label="Has Email?" value={editForm.hasEmail} onChange={(v) => set('hasEmail', v)} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
                <FSelect label="Has Facebook?" value={editForm.hasFacebook} onChange={(v) => set('hasFacebook', v)} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />

                {/* ── Section 9: Financial Structure ───────────────────── */}
                <SectionHeader title="Section 9 — Business Financial Structure" />
                <FField label="Initial Capitalization (₱)" value={editForm.initialCapitalization} onChange={(v) => set('initialCapitalization', v)} placeholder="e.g. 500000" />
                <FField label="Initial Capitalization Year" value={editForm.initialCapitalizationYear} onChange={(v) => set('initialCapitalizationYear', v)} type="number" />
                <FField label="Authorized Capital (₱)" value={editForm.authorizedCapital} onChange={(v) => set('authorizedCapital', v)} />
                <FField label="Subscribed Capital (₱)" value={editForm.subscribedCapital} onChange={(v) => set('subscribedCapital', v)} />
                <FField label="Paid-Up Capital (₱)" value={editForm.paidUpCapital} onChange={(v) => set('paidUpCapital', v)} />
                <FField label="Annual Revenue (₱)" value={editForm.annualRevenue} onChange={(v) => set('annualRevenue', v)} placeholder="e.g. 1500000" />
                <FField label="Domestic Sales (₱)" value={editForm.domesticSales} onChange={(v) => set('domesticSales', v)} />
                <FField label="Export Sales (₱)" value={editForm.exportSales} onChange={(v) => set('exportSales', v)} />

                {/* ── Section 13: Employment Statistics ───────────────── */}
                <SectionHeader title="Section 13 — Employment Statistics" />
                <FNum label="Total Employee Count (legacy)" value={editForm.employeeCount} onChange={(v) => set('employeeCount', v)} />
                <div className="col-span-2 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-2 py-1.5 font-medium text-gray-600 border border-gray-200">Category</th>
                        <th className="px-2 py-1.5 font-medium text-gray-600 border border-gray-200">FT Male</th>
                        <th className="px-2 py-1.5 font-medium text-gray-600 border border-gray-200">FT Female</th>
                        <th className="px-2 py-1.5 font-medium text-gray-600 border border-gray-200">PT Male</th>
                        <th className="px-2 py-1.5 font-medium text-gray-600 border border-gray-200">PT Female</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Abled', ftm: 'ftAbledMale', ftf: 'ftAbledFemale', ptm: 'ptAbledMale', ptf: 'ptAbledFemale' },
                        { label: 'Diff. Abled (PWD)', ftm: 'ftDiffAbledMale', ftf: 'ftDiffAbledFemale', ptm: 'ptDiffAbledMale', ptf: 'ptDiffAbledFemale' },
                        { label: 'Indigenous', ftm: 'ftIndigenousMale', ftf: 'ftIndigenousFemale', ptm: 'ptIndigenousMale', ptf: 'ptIndigenousFemale' },
                        { label: 'Senior Citizen', ftm: 'ftSeniorMale', ftf: 'ftSeniorFemale', ptm: 'ptSeniorMale', ptf: 'ptSeniorFemale' },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className="px-2 py-1 font-medium text-gray-700 border border-gray-200">{row.label}</td>
                          {[row.ftm, row.ftf, row.ptm, row.ptf].map((field) => (
                            <td key={field} className="px-1 py-1 border border-gray-200">
                              <input type="number" min="0" value={(editForm as any)[field]} onChange={(e) => set(field as keyof EditForm, e.target.value)}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-dti-blue text-center" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Admin Controls ───────────────────────────────────── */}
                <SectionHeader title="Admin Controls" />
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                    <input type="checkbox" checked={editForm.isVerified} onChange={(e) => set('isVerified', e.target.checked)} className="w-4 h-4 accent-dti-blue" />
                    Verified by DTI
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                    <input type="checkbox" checked={editForm.isPubliclyListed} onChange={(e) => set('isPubliclyListed', e.target.checked)} className="w-4 h-4 accent-dti-blue" />
                    Publicly Listed in Directory
                  </label>
                </div>

              </div>
            </div>

            {/* Footer */}
            {editMutation.isError && (
              <p className="px-6 pb-2 text-xs text-red-600 flex-shrink-0">Failed to save changes. Please try again.</p>
            )}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button onClick={() => { setEditTarget(null); setEditForm(null); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={submitEdit} disabled={editMutation.isPending || !editForm.businessName.trim()} className="px-4 py-2 text-sm font-medium bg-dti-blue text-white rounded-lg hover:bg-dti-blue-dark disabled:opacity-50">
                {editMutation.isPending ? 'Saving…' : 'Save CPMS Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete Enterprise</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-medium">{deleteTarget.businessName}</span>?
                  This will permanently remove the enterprise profile and all associated membership records. This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteMutation.isError && <p className="px-6 pb-2 text-xs text-red-600">Failed to delete. Please try again.</p>}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Enterprise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

