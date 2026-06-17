import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Building2, Plus, Trash2, Info } from 'lucide-react';
import { enterpriseApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

// ── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRY_SECTORS = [
  'Agriculture, Forestry and Fishing','Mining and Quarrying','Manufacturing',
  'Electricity, Gas, Steam and Air Conditioning Supply','Water Supply, Sewerage, Waste Management',
  'Construction','Wholesale and Retail Trade','Transportation and Storage',
  'Accommodation and Food Service Activities','Information and Communication',
  'Financial and Insurance Activities','Real Estate Activities',
  'Professional, Scientific and Technical Activities','Administrative and Support Service Activities',
  'Education','Human Health and Social Work Activities','Arts, Entertainment and Recreation',
  'Other Service Activities',
];

const MSME_LEVELS = [
  { value: 'LEVEL_0',   label: 'Level 0 — Would be / Potential Entrepreneurs' },
  { value: 'LEVEL_1',   label: 'Level 1 — Nurturing Startup' },
  { value: 'LEVEL_1_1', label: 'Level 1.1 — Unregistered' },
  { value: 'LEVEL_1_2', label: 'Level 1.2 — Partially Registered' },
  { value: 'LEVEL_2',   label: 'Level 2 — Growing Enterprises (Registered)' },
  { value: 'LEVEL_3',   label: 'Level 3 — Expanding Enterprises (Registered)' },
  { value: 'LEVEL_4',   label: 'Level 4 — Sustaining Enterprises (Registered)' },
  { value: 'CEASED',    label: 'Ceased Operations' },
];

const LEVEL_ZERO_CATEGORIES = [
  'Agrarian Reform Beneficiaries','Housewife/husband','Professional','Private Employee',
  'Self-Employed','KIA/WIA/KIP/WIPO','Student','Person with Disabilities','OFW',
  'Military/Police','Drug Surrenderee','Youth','Out-of-School Youth','Government Employee',
  'Unemployed','Retiree','Ex-Convict','Urban Poor','Former Rebel','4Ps Beneficiary',
  'Farmer','Alien/Foreigner','Persons of Concern','Person Deprived of Liberty','Others',
];

const BUSINESS_STAGES = [
  { value: 'IDEATION',      label: 'Ideation (Concept/Idea Stage)' },
  { value: 'VALIDATION',    label: 'Validation (Testing the Market)' },
  { value: 'GROWTH',        label: 'Growth (Scaling Up)' },
  { value: 'EXPANSION',     label: 'Expansion (New Markets/Products)' },
  { value: 'MATURITY_EXIT', label: 'Maturity/Exit (Established Business)' },
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
  { value: 'MICRO',  label: 'Micro — Up to ₱3,000,000' },
  { value: 'SMALL',  label: 'Small — ₱3,000,001 to ₱15,000,000' },
  { value: 'MEDIUM', label: 'Medium — ₱15,000,001 to ₱100,000,000' },
  { value: 'LARGE',  label: 'Large — More than ₱100,000,000' },
];

const BUSINESS_ACTIVITY = [
  { value: 'MANUFACTURING_PRODUCING', label: 'Manufacturing / Producing' },
  { value: 'WHOLESALING_TRADING',     label: 'Wholesaling / Trading' },
  { value: 'RETAILING_TRADING',       label: 'Retailing / Trading' },
  { value: 'EXPORTING',               label: 'Exporting' },
  { value: 'IMPORTING',               label: 'Importing' },
  { value: 'SERVICE',                 label: 'Service' },
];

const ASSET_SIZE_RANGES = [
  'Below ₱100,000','₱100,001–₱500,000','₱500,001–₱1.5M',
  '₱1.5M–₱3M','₱3M–₱5M','₱5M–₱10M','₱10M–₱15M','Above ₱15M to ₱100M',
];

const EDT_LEVELS = [
  { value: 'LEVEL_0', label: 'Level 0 — Entrepreneurial Mind' },
  { value: 'LEVEL_1', label: 'Level 1 — Nurturing Startup' },
  { value: 'LEVEL_2', label: 'Level 2 — Growing Business' },
  { value: 'LEVEL_3', label: 'Level 3 — Expanding Enterprise' },
  { value: 'LEVEL_4', label: 'Level 4 — Growing Enterprise' },
];

const RIPPLES_STAGES = [
  { value: 'STAGE_5', label: 'Stage 5 — Export Entry' },
  { value: 'STAGE_6', label: 'Stage 6 — Export Sustainability' },
  { value: 'STAGE_7', label: 'Stage 7 — Export Expansion' },
];

const SMERA_STAGES = [
  { value: 'STAGE_1', label: 'Stage 1 — Start Up and Capability Building' },
  { value: 'STAGE_2', label: 'Stage 2 — Market Awareness' },
  { value: 'STAGE_3', label: 'Stage 3 — Market Readiness' },
  { value: 'STAGE_4', label: 'Stage 4 — Export Readiness' },
];

const DIGITALIZATION_LEVELS = [
  { value: 'LEVEL_0', label: 'Level 0 — No use of digital tools' },
  { value: 'LEVEL_1', label: 'Level 1 — Basic (basic digital tools)' },
  { value: 'LEVEL_2', label: 'Level 2 — Intermediate (online presence)' },
  { value: 'LEVEL_3', label: 'Level 3 — Advanced (advanced digital tools)' },
];

const DIGITAL_TOOL_CATEGORIES = [
  { value: 'COLLABORATIVE_SUITES', label: 'Collaborative Suites (e.g. Google Suite, Microsoft 365)' },
  { value: 'COMMUNICATION',        label: 'Communication Tools (e.g. Skype, Zoom, Monday.com)' },
  { value: 'PROJECT_MGMT',         label: 'Project Management Tools (e.g. Trello, Asana)' },
  { value: 'ACCOUNTING_PAYROLL',   label: 'Digital Accounting & Payroll (e.g. Quickbooks, SAP)' },
  { value: 'CMS',                  label: 'Content Management System (e.g. WordPress, Joomla)' },
  { value: 'CYBERSECURITY',        label: 'Cybersecurity Tools (e.g. Norton, Sitelock)' },
  { value: 'CLOUD_STORAGE',        label: 'Cloud Storage (e.g. Google Drive, Dropbox)' },
  { value: 'FINTECH',              label: 'Fintech Tools (e.g. GCash, Maya, Dragonpay)' },
];

const TABS = [
  { id: 'registration', label: 'Registration & Status' },
  { id: 'address',      label: 'Address & Contact' },
  { id: 'profile',      label: 'Business Profile' },
  { id: 'owner',        label: 'Owner Info' },
  { id: 'trackers',     label: 'Business Trackers' },
  { id: 'financial',    label: 'Financial & Markets' },
  { id: 'products',     label: 'Products & Employment' },
];

// ── Types ────────────────────────────────────────────────────────────────────

type RegistrationRow  = { type: string; registrationNo: string; expiry: string };
type PermitRow        = { type: string; permitNo: string; expiry: string };
type LicenseRow       = { type: string; licenseNo: string; expiry: string };
type EcommRow         = { platform: string; url: string };
type DigitalToolRow   = { category: string; toolName: string };
type DomesticMktRow   = { productService: string; region: string; province: string };
type ExportMktRow     = { dateStarted: string; productService: string; country: string; tradeBloc: string };
type ImportMktRow     = { dateStarted: string; productCommodity: string; country: string };
type ProductLineRow   = { productService: string; description: string; majorRawMaterials: string; annualProductionCapacity: string; year: string; valueVolume: string; unitOfMeasure: string };
type CertificationRow = { certificationType: string; certifyingBody: string; expiryDate: string };

// ── Empty form defaults ───────────────────────────────────────────────────────

const EMPTY: Record<string, unknown> = {
  cpmsIdNumber: '', oldCpmsIdNumber: '', philsysNumber: '', tinNumber: '', dtiKonekIdNumber: '',
  msmeLevel: '', levelZeroCategories: [] as string[], businessIsRegistered: '',
  businessName: '', registeredBusinessName: '', tradeName: '', dateOfRegistration: '',
  registrationNo: '', ipoRegistrationNumber: '',
  businessRegistrations: [] as RegistrationRow[],
  businessPermits:       [] as PermitRow[],
  secondaryLicenses:     [] as LicenseRow[],
  houseNo: '', streetName: '', barangay: '', district: '',
  cityMunicipality: '', province: '', region: '', zipCode: '',
  businessEmail: '', businessPhone: '', businessFax: '', websiteUrl: '',
  socialMediaFacebook: '', socialMediaInstagram: '', socialMediaLinkedIn: '', socialMediaOthers: '',
  ecommercePlatforms: [] as EcommRow[],
  description: '', yearEstablished: '',
  formOfOrganization: '', assetSizeClassification: '',
  primaryBusinessActivity: '', secondaryBusinessActivity: '',
  psicSection: '', psicDivision: '', psicGroup: '',
  priorityIndustry: '', industryClusterEnhancement: '',
  industrySector: '', industryTags: [] as string[],
  tradeAssociationAffiliations: [] as string[],
  stage: 'VALIDATION', isPubliclyListed: false,
  ownerPrefix: '', ownerFirstName: '', ownerMiddleName: '', ownerLastName: '', ownerSuffix: '',
  ownerBirthdate: '', ownerCitizenship: '', ownerSex: '', ownerCivilStatus: '',
  ownerSocialClassification: '',
  ownerHouseNo: '', ownerStreetName: '', ownerBarangay: '', ownerDistrict: '',
  ownerCityMunicipality: '', ownerProvince: '', ownerRegion: '', ownerZipCode: '',
  edtLevel: '', ripplesStage: '', smeraStage: '', digitalizationLevel: '',
  digitalToolsUsed: [] as DigitalToolRow[],
  hasEmail: false, hasFacebook: false,
  initialCapitalization: '', initialCapitalizationYear: '',
  authorizedCapital: '', subscribedCapital: '', paidUpCapital: '',
  assetSizeRange: '', domesticSales: '', exportSales: '', annualRevenue: '',
  domesticMarkets: [] as DomesticMktRow[],
  exportMarkets:   [] as ExportMktRow[],
  importMarkets:   [] as ImportMktRow[],
  productLines:          [] as ProductLineRow[],
  productCertifications: [] as CertificationRow[],
  ftAbledMale: '', ftAbledFemale: '', ftDiffAbledMale: '', ftDiffAbledFemale: '',
  ftIndigenousMale: '', ftIndigenousFemale: '', ftSeniorMale: '', ftSeniorFemale: '',
  ptAbledMale: '', ptAbledFemale: '', ptDiffAbledMale: '', ptDiffAbledFemale: '',
  ptIndigenousMale: '', ptIndigenousFemale: '', ptSeniorMale: '', ptSeniorFemale: '',
  notes: '',
};

function toDateInputValue(value: unknown): string {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  const yyyyMmDdPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (yyyyMmDdPrefix) return yyyyMmDdPrefix[1];

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function fromProfile(p: Record<string, unknown>): Record<string, unknown> {
  const n = (v: unknown) => (v == null ? '' : String(v));
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    cpmsIdNumber: n(p.cpmsIdNumber), oldCpmsIdNumber: n(p.oldCpmsIdNumber),
    philsysNumber: n(p.philsysNumber), tinNumber: n(p.tinNumber), dtiKonekIdNumber: n(p.dtiKonekIdNumber),
    msmeLevel: n(p.msmeLevel), levelZeroCategories: arr(p.levelZeroCategories),
    businessIsRegistered: p.businessIsRegistered == null ? '' : String(p.businessIsRegistered),
    businessName: n(p.businessName), registeredBusinessName: n(p.registeredBusinessName),
    tradeName: n(p.tradeName), dateOfRegistration: toDateInputValue(p.dateOfRegistration),
    registrationNo: n(p.registrationNo), ipoRegistrationNumber: n(p.ipoRegistrationNumber),
    businessRegistrations: arr(p.businessRegistrations),
    businessPermits: arr(p.businessPermits),
    secondaryLicenses: arr(p.secondaryLicenses),
    houseNo: n(p.houseNo), streetName: n(p.streetName), barangay: n(p.barangay),
    district: n(p.district), cityMunicipality: n(p.cityMunicipality),
    province: n(p.province), region: n(p.region), zipCode: n(p.zipCode),
    businessEmail: n(p.businessEmail), businessPhone: n(p.businessPhone),
    businessFax: n(p.businessFax), websiteUrl: n(p.websiteUrl),
    socialMediaFacebook: n(p.socialMediaFacebook), socialMediaInstagram: n(p.socialMediaInstagram),
    socialMediaLinkedIn: n(p.socialMediaLinkedIn), socialMediaOthers: n(p.socialMediaOthers),
    ecommercePlatforms: arr(p.ecommercePlatforms),
    description: n(p.description), yearEstablished: n(p.yearEstablished),
    formOfOrganization: n(p.formOfOrganization), assetSizeClassification: n(p.assetSizeClassification),
    primaryBusinessActivity: n(p.primaryBusinessActivity), secondaryBusinessActivity: n(p.secondaryBusinessActivity),
    psicSection: n(p.psicSection), psicDivision: n(p.psicDivision), psicGroup: n(p.psicGroup),
    priorityIndustry: n(p.priorityIndustry), industryClusterEnhancement: n(p.industryClusterEnhancement),
    industrySector: n(p.industrySector), industryTags: arr(p.industryTags),
    tradeAssociationAffiliations: arr(p.tradeAssociationAffiliations),
    stage: n(p.stage) || 'VALIDATION', isPubliclyListed: Boolean(p.isPubliclyListed),
    ownerPrefix: n(p.ownerPrefix), ownerFirstName: n(p.ownerFirstName),
    ownerMiddleName: n(p.ownerMiddleName), ownerLastName: n(p.ownerLastName), ownerSuffix: n(p.ownerSuffix),
    ownerBirthdate: toDateInputValue(p.ownerBirthdate),
    ownerCitizenship: n(p.ownerCitizenship), ownerSex: n(p.ownerSex), ownerCivilStatus: n(p.ownerCivilStatus),
    ownerSocialClassification: n(p.ownerSocialClassification),
    ownerHouseNo: n(p.ownerHouseNo), ownerStreetName: n(p.ownerStreetName),
    ownerBarangay: n(p.ownerBarangay), ownerDistrict: n(p.ownerDistrict),
    ownerCityMunicipality: n(p.ownerCityMunicipality), ownerProvince: n(p.ownerProvince),
    ownerRegion: n(p.ownerRegion), ownerZipCode: n(p.ownerZipCode),
    edtLevel: n(p.edtLevel), ripplesStage: n(p.ripplesStage),
    smeraStage: n(p.smeraStage), digitalizationLevel: n(p.digitalizationLevel),
    digitalToolsUsed: arr(p.digitalToolsUsed),
    hasEmail: Boolean(p.hasEmail), hasFacebook: Boolean(p.hasFacebook),
    initialCapitalization: n(p.initialCapitalization), initialCapitalizationYear: n(p.initialCapitalizationYear),
    authorizedCapital: n(p.authorizedCapital), subscribedCapital: n(p.subscribedCapital),
    paidUpCapital: n(p.paidUpCapital), assetSizeRange: n(p.assetSizeRange),
    domesticSales: n(p.domesticSales), exportSales: n(p.exportSales), annualRevenue: n(p.annualRevenue),
    domesticMarkets: arr(p.domesticMarkets),
    exportMarkets: arr(p.exportMarkets),
    importMarkets: arr(p.importMarkets),
    productLines: arr(p.productLines),
    productCertifications: arr(p.productCertifications),
    ftAbledMale: n(p.ftAbledMale), ftAbledFemale: n(p.ftAbledFemale),
    ftDiffAbledMale: n(p.ftDiffAbledMale), ftDiffAbledFemale: n(p.ftDiffAbledFemale),
    ftIndigenousMale: n(p.ftIndigenousMale), ftIndigenousFemale: n(p.ftIndigenousFemale),
    ftSeniorMale: n(p.ftSeniorMale), ftSeniorFemale: n(p.ftSeniorFemale),
    ptAbledMale: n(p.ptAbledMale), ptAbledFemale: n(p.ptAbledFemale),
    ptDiffAbledMale: n(p.ptDiffAbledMale), ptDiffAbledFemale: n(p.ptDiffAbledFemale),
    ptIndigenousMale: n(p.ptIndigenousMale), ptIndigenousFemale: n(p.ptIndigenousFemale),
    ptSeniorMale: n(p.ptSeniorMale), ptSeniorFemale: n(p.ptSeniorFemale),
    notes: '',
  };
}

function or(v: string): string | null { return v.trim() || null; }
function num(v: string): number | null { const n = parseInt(v, 10); return isNaN(n) ? null : n; }
function dec(v: string): string | null { return v.trim() || null; }

function toPayload(f: Record<string, unknown>): Record<string, unknown> {
  return {
    cpmsIdNumber: or(f.cpmsIdNumber as string), oldCpmsIdNumber: or(f.oldCpmsIdNumber as string),
    philsysNumber: or(f.philsysNumber as string), tinNumber: or(f.tinNumber as string),
    dtiKonekIdNumber: or(f.dtiKonekIdNumber as string),
    msmeLevel: or(f.msmeLevel as string),
    levelZeroCategories: f.levelZeroCategories,
    businessIsRegistered: f.businessIsRegistered === 'true' ? true : f.businessIsRegistered === 'false' ? false : null,
    businessName: (f.businessName as string).trim(),
    registeredBusinessName: or(f.registeredBusinessName as string),
    tradeName: or(f.tradeName as string), dateOfRegistration: or(f.dateOfRegistration as string),
    registrationNo: or(f.registrationNo as string), ipoRegistrationNumber: or(f.ipoRegistrationNumber as string),
    businessRegistrations: (f.businessRegistrations as RegistrationRow[]).filter(r => r.registrationNo),
    businessPermits: (f.businessPermits as PermitRow[]).filter(r => r.permitNo),
    secondaryLicenses: (f.secondaryLicenses as LicenseRow[]).filter(r => r.licenseNo),
    houseNo: or(f.houseNo as string), streetName: or(f.streetName as string),
    barangay: or(f.barangay as string), district: or(f.district as string),
    cityMunicipality: or(f.cityMunicipality as string), province: or(f.province as string),
    region: or(f.region as string), zipCode: or(f.zipCode as string),
    businessEmail: or(f.businessEmail as string), businessPhone: or(f.businessPhone as string),
    businessFax: or(f.businessFax as string), websiteUrl: or(f.websiteUrl as string),
    socialMediaFacebook: or(f.socialMediaFacebook as string), socialMediaInstagram: or(f.socialMediaInstagram as string),
    socialMediaLinkedIn: or(f.socialMediaLinkedIn as string), socialMediaOthers: or(f.socialMediaOthers as string),
    ecommercePlatforms: (f.ecommercePlatforms as EcommRow[]).filter(r => r.platform),
    description: or(f.description as string),
    yearEstablished: num(f.yearEstablished as string),
    formOfOrganization: or(f.formOfOrganization as string),
    assetSizeClassification: or(f.assetSizeClassification as string),
    primaryBusinessActivity: or(f.primaryBusinessActivity as string),
    secondaryBusinessActivity: or(f.secondaryBusinessActivity as string),
    psicSection: or(f.psicSection as string), psicDivision: or(f.psicDivision as string), psicGroup: or(f.psicGroup as string),
    priorityIndustry: or(f.priorityIndustry as string), industryClusterEnhancement: or(f.industryClusterEnhancement as string),
    industrySector: (f.industrySector as string).trim(),
    industryTags: f.industryTags,
    tradeAssociationAffiliations: f.tradeAssociationAffiliations,
    stage: f.stage,
    isPubliclyListed: f.isPubliclyListed,
    ownerPrefix: or(f.ownerPrefix as string), ownerFirstName: or(f.ownerFirstName as string),
    ownerMiddleName: or(f.ownerMiddleName as string), ownerLastName: or(f.ownerLastName as string),
    ownerSuffix: or(f.ownerSuffix as string), ownerBirthdate: or(f.ownerBirthdate as string),
    ownerCitizenship: or(f.ownerCitizenship as string), ownerSex: or(f.ownerSex as string),
    ownerCivilStatus: or(f.ownerCivilStatus as string), ownerSocialClassification: or(f.ownerSocialClassification as string),
    ownerHouseNo: or(f.ownerHouseNo as string), ownerStreetName: or(f.ownerStreetName as string),
    ownerBarangay: or(f.ownerBarangay as string), ownerDistrict: or(f.ownerDistrict as string),
    ownerCityMunicipality: or(f.ownerCityMunicipality as string), ownerProvince: or(f.ownerProvince as string),
    ownerRegion: or(f.ownerRegion as string), ownerZipCode: or(f.ownerZipCode as string),
    edtLevel: or(f.edtLevel as string), ripplesStage: or(f.ripplesStage as string),
    smeraStage: or(f.smeraStage as string), digitalizationLevel: or(f.digitalizationLevel as string),
    digitalToolsUsed: (f.digitalToolsUsed as DigitalToolRow[]).filter(r => r.category && r.toolName),
    hasEmail: f.hasEmail, hasFacebook: f.hasFacebook,
    initialCapitalization: dec(f.initialCapitalization as string),
    initialCapitalizationYear: num(f.initialCapitalizationYear as string),
    authorizedCapital: dec(f.authorizedCapital as string),
    subscribedCapital: dec(f.subscribedCapital as string),
    paidUpCapital: dec(f.paidUpCapital as string),
    assetSizeRange: or(f.assetSizeRange as string),
    domesticSales: dec(f.domesticSales as string), exportSales: dec(f.exportSales as string),
    annualRevenue: dec(f.annualRevenue as string),
    domesticMarkets: (f.domesticMarkets as DomesticMktRow[]).filter(r => r.productService),
    exportMarkets: (f.exportMarkets as ExportMktRow[]).filter(r => r.productService),
    importMarkets: (f.importMarkets as ImportMktRow[]).filter(r => r.productCommodity),
    productLines: (f.productLines as ProductLineRow[]).filter(r => r.productService),
    productCertifications: (f.productCertifications as CertificationRow[]).filter(r => r.certificationType),
    ftAbledMale: num(f.ftAbledMale as string), ftAbledFemale: num(f.ftAbledFemale as string),
    ftDiffAbledMale: num(f.ftDiffAbledMale as string), ftDiffAbledFemale: num(f.ftDiffAbledFemale as string),
    ftIndigenousMale: num(f.ftIndigenousMale as string), ftIndigenousFemale: num(f.ftIndigenousFemale as string),
    ftSeniorMale: num(f.ftSeniorMale as string), ftSeniorFemale: num(f.ftSeniorFemale as string),
    ptAbledMale: num(f.ptAbledMale as string), ptAbledFemale: num(f.ptAbledFemale as string),
    ptDiffAbledMale: num(f.ptDiffAbledMale as string), ptDiffAbledFemale: num(f.ptDiffAbledFemale as string),
    ptIndigenousMale: num(f.ptIndigenousMale as string), ptIndigenousFemale: num(f.ptIndigenousFemale as string),
    ptSeniorMale: num(f.ptSeniorMale as string), ptSeniorFemale: num(f.ptSeniorFemale as string),
    notes: or(f.notes as string),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SH({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-dti-blue uppercase tracking-wide border-b border-dti-blue/30 pb-1 mb-3 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

function AddRowBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs text-dti-blue hover:underline mt-2">
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-red-400 hover:text-red-600 p-1">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompanyProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requiredMode = searchParams.get('mode') === 'required';
  const updateType = searchParams.get('type') as 'FIRST_LOGIN' | 'ANNUAL' | null;

  const [enterpriseId, setEnterpriseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('registration');
  const [form, setForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [originalForm, setOriginalForm] = useState<Record<string, unknown>>({ ...EMPTY });
  const [isEditing, setIsEditing] = useState(requiredMode);

  useEffect(() => {
    (async () => {
      try {
        const res = await enterpriseApi.getMyEnterprises();
        const list = (res?.data ?? []) as Record<string, unknown>[];
        if (!list.length) { setLoading(false); return; }
        const p = list[0];
        const normalized = fromProfile(p);
        setEnterpriseId(p.id as string);
        setLastUpdated((p.profileLastUpdatedAt as string | null) ?? null);
        setForm(normalized);
        setOriginalForm(normalized);
      } catch {
        setError('Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleLevelZero(cat: string) {
    const cur = form.levelZeroCategories as string[];
    set('levelZeroCategories', cur.includes(cat) ? cur.filter(c => c !== cat) : [...cur, cat]);
  }

  function addRow<T>(field: string, row: T) { set(field, [...(form[field] as T[]), row]); }
  function removeRow(field: string, i: number) {
    set(field, (form[field] as unknown[]).filter((_, idx) => idx !== i));
  }
  function updateRow<T>(field: string, i: number, patch: Partial<T>) {
    set(field, (form[field] as T[]).map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requiredMode && !isEditing) return;
    if (!enterpriseId) return;
    if (!(form.businessName as string).trim() || !(form.industrySector as string).trim()) {
      setError('Business name and industry sector are required.');
      return;
    }
    setSaving(true); setError(null); setSaved(false);
    try {
      await enterpriseApi.updateFull(enterpriseId, toPayload(form));
      setSaved(true);
      setLastUpdated(new Date().toISOString());
      setOriginalForm({ ...form });
      if (!requiredMode) setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // If this was a required update (first login / annual), redirect to dashboard after save
      if (requiredMode) {
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setError(null);
    setSaved(false);
    setIsEditing(true);
  }

  function handleCancel() {
    setForm({ ...originalForm });
    setError(null);
    setSaved(false);
    setIsEditing(false);
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="card h-64 bg-gray-100 animate-pulse" />
    </div>
  );

  if (!enterpriseId) return (
    <div className="card text-center py-12 space-y-3">
      <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
      <p className="text-gray-500 text-sm">No company linked to your account.</p>
      <p className="text-gray-400 text-xs">Go to your Profile page to register or join a company first.</p>
    </div>
  );

  const f = form;
  const canEdit = requiredMode || isEditing;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-dti-blue" /> Company Profile (MSME CPMS Form 01)
        </h1>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-0.5">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
          </p>
        )}
      </div>

      {/* Required update context banner */}
      {requiredMode && !saved && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-input px-4 py-3 text-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            {updateType === 'FIRST_LOGIN' ? (
              <>
                <strong>Please complete your company profile.</strong> As an approved enterprise representative, DTI requires your full CPMS information before you can continue. Fill in all sections below and click <em>Save Changes</em>.
              </>
            ) : (
              <>
                <strong>Annual profile update required ({new Date().getFullYear()}).</strong> DTI Region 7 collects updated MSME information each year for program planning and reporting. Please review and update your details, then click <em>Save Changes</em>.
              </>
            )}
          </div>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-input px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {requiredMode ? 'Profile updated — redirecting to dashboard…' : 'Company profile saved successfully.'}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-input px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!requiredMode && (
        <div className="flex items-center justify-between rounded-input border border-gray-200 bg-white px-4 py-3 text-sm">
          <p className="text-gray-600">
            {canEdit ? 'Edit mode is on. Review your changes, then save or cancel.' : 'View mode is on. Click Edit Company Profile to make changes.'}
          </p>
          {!canEdit && (
            <button type="button" className="btn-primary" onClick={handleEdit}>
              Edit Company Profile
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-dti-blue text-dti-blue bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={!canEdit} className="space-y-4 disabled:opacity-100">
        <div className="card space-y-4">

          {/* ── Registration & Status ─────────────────────────────────────── */}
          {activeTab === 'registration' && <>
            <SH>Client IDs on Record</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">MSME CPMS ID No.</label><input className="input" value={f.cpmsIdNumber as string} onChange={e => set('cpmsIdNumber', e.target.value)} /></div>
              <div><label className="label">Old CPMS ID No.</label><input className="input" value={f.oldCpmsIdNumber as string} onChange={e => set('oldCpmsIdNumber', e.target.value)} /></div>
              <div><label className="label">PhilSys No.</label><input className="input" value={f.philsysNumber as string} onChange={e => set('philsysNumber', e.target.value)} /></div>
              <div><label className="label">TIN No.</label><input className="input" value={f.tinNumber as string} onChange={e => set('tinNumber', e.target.value)} placeholder="e.g. 123-456-789-000" /></div>
              <div><label className="label">DTI Konek ID No.</label><input className="input" value={f.dtiKonekIdNumber as string} onChange={e => set('dtiKonekIdNumber', e.target.value)} /></div>
            </div>

            <SH>Status of Client / MSMEs Assisted</SH>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">MSME Level</label>
                <select className="input" value={f.msmeLevel as string} onChange={e => set('msmeLevel', e.target.value)}>
                  <option value="">Select level…</option>
                  {MSME_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Business Registration Status</label>
                <select className="input" value={f.businessIsRegistered as string} onChange={e => set('businessIsRegistered', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="true">Registered</option>
                  <option value="false">Unregistered</option>
                </select>
              </div>
            </div>
            {(f.msmeLevel as string) === 'LEVEL_0' && (
              <div>
                <label className="label text-xs">Level 0 Categories (select all that apply)</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {LEVEL_ZERO_CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" className="accent-dti-blue"
                        checked={(f.levelZeroCategories as string[]).includes(cat)}
                        onChange={() => toggleLevelZero(cat)} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <SH>Business Registration</SH>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="label">Business / Legal Name *</label><input className="input" required value={f.businessName as string} onChange={e => set('businessName', e.target.value)} /></div>
              <div><label className="label">Registered Business Name</label><input className="input" value={f.registeredBusinessName as string} onChange={e => set('registeredBusinessName', e.target.value)} /></div>
              <div><label className="label">Trade Name / Billboard Name</label><input className="input" value={f.tradeName as string} onChange={e => set('tradeName', e.target.value)} /></div>
              <div><label className="label">Date of Registration</label><input className="input" type="date" value={toDateInputValue(f.dateOfRegistration)} onChange={e => set('dateOfRegistration', e.target.value)} /></div>
              <div><label className="label">Primary Registration No.</label><input className="input" value={f.registrationNo as string} onChange={e => set('registrationNo', e.target.value)} /></div>
              <div><label className="label">IPO Registration No.</label><input className="input" value={f.ipoRegistrationNumber as string} onChange={e => set('ipoRegistrationNumber', e.target.value)} /></div>
            </div>

            <SH>Business Name Registrations</SH>
            <div className="space-y-2">
              {(f.businessRegistrations as RegistrationRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className="input flex-1 text-sm" value={r.type} onChange={e => updateRow<RegistrationRow>('businessRegistrations', i, { type: e.target.value })}>
                    <option value="">Type…</option>
                    {['DTI','SEC','DOLE','CDA','OTHERS'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input className="input flex-1 text-sm" placeholder="Registration No." value={r.registrationNo} onChange={e => updateRow<RegistrationRow>('businessRegistrations', i, { registrationNo: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Expiry" value={r.expiry} onChange={e => updateRow<RegistrationRow>('businessRegistrations', i, { expiry: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('businessRegistrations', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Registration" onClick={() => addRow<RegistrationRow>('businessRegistrations', { type: '', registrationNo: '', expiry: '' })} />
            </div>

            <SH>Business Permits</SH>
            <div className="space-y-2">
              {(f.businessPermits as PermitRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className="input flex-1 text-sm" value={r.type} onChange={e => updateRow<PermitRow>('businessPermits', i, { type: e.target.value })}>
                    <option value="">Type…</option>
                    {['BUSINESS_PERMIT','BIR','FDA','BMBE','OTHERS'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input className="input flex-1 text-sm" placeholder="Permit/Registration No." value={r.permitNo} onChange={e => updateRow<PermitRow>('businessPermits', i, { permitNo: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Expiry" value={r.expiry} onChange={e => updateRow<PermitRow>('businessPermits', i, { expiry: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('businessPermits', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Permit" onClick={() => addRow<PermitRow>('businessPermits', { type: '', permitNo: '', expiry: '' })} />
            </div>

            <SH>Secondary Licenses &amp; Certifications</SH>
            <div className="space-y-2">
              {(f.secondaryLicenses as LicenseRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className="input flex-1 text-sm" value={r.type} onChange={e => updateRow<LicenseRow>('secondaryLicenses', i, { type: e.target.value })}>
                    <option value="">Type…</option>
                    {['ICC','ISO','PRODUCT_STANDARD','OTHERS'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input className="input flex-1 text-sm" placeholder="License/Certification No." value={r.licenseNo} onChange={e => updateRow<LicenseRow>('secondaryLicenses', i, { licenseNo: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Expiry" value={r.expiry} onChange={e => updateRow<LicenseRow>('secondaryLicenses', i, { expiry: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('secondaryLicenses', i)} />
                </div>
              ))}
              <AddRowBtn label="Add License / Certification" onClick={() => addRow<LicenseRow>('secondaryLicenses', { type: '', licenseNo: '', expiry: '' })} />
            </div>
          </>}

          {/* ── Address & Contact ─────────────────────────────────────────── */}
          {activeTab === 'address' && <>
            <SH>Business Address / Location</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">House / Building No.</label><input className="input" value={f.houseNo as string} onChange={e => set('houseNo', e.target.value)} /></div>
              <div><label className="label">Street Name</label><input className="input" value={f.streetName as string} onChange={e => set('streetName', e.target.value)} /></div>
              <div><label className="label">Barangay</label><input className="input" value={f.barangay as string} onChange={e => set('barangay', e.target.value)} /></div>
              <div><label className="label">District</label><input className="input" value={f.district as string} onChange={e => set('district', e.target.value)} /></div>
              <div><label className="label">City / Municipality</label><input className="input" value={f.cityMunicipality as string} onChange={e => set('cityMunicipality', e.target.value)} /></div>
              <div><label className="label">Province</label><input className="input" value={f.province as string} onChange={e => set('province', e.target.value)} /></div>
              <div><label className="label">Region</label><input className="input" value={f.region as string} onChange={e => set('region', e.target.value)} placeholder="e.g. Region VII" /></div>
              <div><label className="label">Zip Code</label><input className="input" value={f.zipCode as string} onChange={e => set('zipCode', e.target.value)} maxLength={10} /></div>
            </div>

            <SH>Business Contact Details</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Business Email</label><input className="input" type="email" value={f.businessEmail as string} onChange={e => set('businessEmail', e.target.value)} /></div>
              <div><label className="label">Mobile Number</label><input className="input" value={f.businessPhone as string} onChange={e => set('businessPhone', e.target.value)} placeholder="+63 9xx xxx xxxx" /></div>
              <div><label className="label">Landline / Fax Number</label><input className="input" value={f.businessFax as string} onChange={e => set('businessFax', e.target.value)} /></div>
              <div><label className="label">Business Website</label><input className="input" type="url" value={f.websiteUrl as string} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://www.example.com" /></div>
            </div>

            <SH>Social Media Accounts</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Facebook</label><input className="input" value={f.socialMediaFacebook as string} onChange={e => set('socialMediaFacebook', e.target.value)} placeholder="facebook.com/..." /></div>
              <div><label className="label">Instagram</label><input className="input" value={f.socialMediaInstagram as string} onChange={e => set('socialMediaInstagram', e.target.value)} placeholder="@handle" /></div>
              <div><label className="label">LinkedIn</label><input className="input" value={f.socialMediaLinkedIn as string} onChange={e => set('socialMediaLinkedIn', e.target.value)} /></div>
              <div><label className="label">Others</label><input className="input" value={f.socialMediaOthers as string} onChange={e => set('socialMediaOthers', e.target.value)} /></div>
            </div>

            <SH>E-Commerce Platforms</SH>
            <div className="space-y-2">
              {(f.ecommercePlatforms as EcommRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className="input w-40 text-sm" value={r.platform} onChange={e => updateRow<EcommRow>('ecommercePlatforms', i, { platform: e.target.value })}>
                    <option value="">Platform…</option>
                    {['SHOPEE','LAZADA','APEC','GO_LOKAL','OTHERS'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <input className="input flex-1 text-sm" placeholder="Profile / store URL" value={r.url} onChange={e => updateRow<EcommRow>('ecommercePlatforms', i, { url: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('ecommercePlatforms', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Platform" onClick={() => addRow<EcommRow>('ecommercePlatforms', { platform: '', url: '' })} />
            </div>
          </>}

          {/* ── Business Profile ─────────────────────────────────────────── */}
          {activeTab === 'profile' && <>
            <SH>Business Profile</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Year Established</label><input className="input" type="number" min={1900} max={2100} value={f.yearEstablished as string} onChange={e => set('yearEstablished', e.target.value)} placeholder="e.g. 2015" /></div>
              <div>
                <label className="label">Form of Organization</label>
                <select className="input" value={f.formOfOrganization as string} onChange={e => set('formOfOrganization', e.target.value)}>
                  <option value="">Select…</option>
                  {FORM_OF_ORG.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Asset Size Classification</label>
                <select className="input" value={f.assetSizeClassification as string} onChange={e => set('assetSizeClassification', e.target.value)}>
                  <option value="">Select…</option>
                  {ASSET_SIZE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Primary Business Activity</label>
                <select className="input" value={f.primaryBusinessActivity as string} onChange={e => set('primaryBusinessActivity', e.target.value)}>
                  <option value="">Select…</option>
                  {BUSINESS_ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Secondary Business Activity</label>
                <select className="input" value={f.secondaryBusinessActivity as string} onChange={e => set('secondaryBusinessActivity', e.target.value)}>
                  <option value="">Select…</option>
                  {BUSINESS_ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Industry Sector *</label>
                <select className="input" required value={f.industrySector as string} onChange={e => set('industrySector', e.target.value)}>
                  <option value="">Select sector…</option>
                  {INDUSTRY_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Enterprise Stage</label>
                <select className="input" value={f.stage as string} onChange={e => set('stage', e.target.value)}>
                  {BUSINESS_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <SH>Philippine Standard Industrial Classification (PSIC)</SH>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">Section</label><input className="input" value={f.psicSection as string} onChange={e => set('psicSection', e.target.value)} placeholder="e.g. C" /></div>
              <div><label className="label">Division</label><input className="input" value={f.psicDivision as string} onChange={e => set('psicDivision', e.target.value)} placeholder="e.g. 10" /></div>
              <div><label className="label">Group</label><input className="input" value={f.psicGroup as string} onChange={e => set('psicGroup', e.target.value)} placeholder="e.g. 101" /></div>
            </div>

            <SH>Industry Classification</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Priority Industry</label><input className="input" value={f.priorityIndustry as string} onChange={e => set('priorityIndustry', e.target.value)} /></div>
              <div><label className="label">Industry Cluster Enhancement (ICE)</label><input className="input" value={f.industryClusterEnhancement as string} onChange={e => set('industryClusterEnhancement', e.target.value)} /></div>
              <div className="col-span-2">
                <label className="label">Trade Association Affiliations <span className="font-normal text-gray-400">(comma-separated)</span></label>
                <input className="input" value={(f.tradeAssociationAffiliations as string[]).join(', ')}
                  onChange={e => set('tradeAssociationAffiliations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. CEBUCCI, PCCI" />
              </div>
              <div className="col-span-2">
                <label className="label">Business Description</label>
                <textarea className="input" rows={3} maxLength={2000} value={f.description as string} onChange={e => set('description', e.target.value)} placeholder="Brief description of your business activities" />
              </div>
            </div>

            <SH>Directory Visibility</SH>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-dti-blue" checked={f.isPubliclyListed as boolean} onChange={e => set('isPubliclyListed', e.target.checked)} />
              <div>
                <span className="text-sm font-medium text-gray-800">List our company in the public DTI enterprise directory</span>
                <p className="text-xs text-gray-400 mt-0.5">Other participants can discover your business.</p>
              </div>
            </label>
          </>}

          {/* ── Owner Info ────────────────────────────────────────────────── */}
          {activeTab === 'owner' && <>
            <SH>Owner / Chairperson / President Profile</SH>
            <div className="grid grid-cols-4 gap-3">
              <div><label className="label">Prefix</label><input className="input" value={f.ownerPrefix as string} onChange={e => set('ownerPrefix', e.target.value)} placeholder="Mr./Ms./Dr." /></div>
              <div><label className="label">First Name</label><input className="input" value={f.ownerFirstName as string} onChange={e => set('ownerFirstName', e.target.value)} /></div>
              <div><label className="label">Middle Name</label><input className="input" value={f.ownerMiddleName as string} onChange={e => set('ownerMiddleName', e.target.value)} /></div>
              <div><label className="label">Last Name</label><input className="input" value={f.ownerLastName as string} onChange={e => set('ownerLastName', e.target.value)} /></div>
              <div><label className="label">Suffix</label><input className="input" value={f.ownerSuffix as string} onChange={e => set('ownerSuffix', e.target.value)} placeholder="Jr./Sr./III" /></div>
              <div><label className="label">Date of Birth</label><input className="input" type="date" value={toDateInputValue(f.ownerBirthdate)} onChange={e => set('ownerBirthdate', e.target.value)} /></div>
              <div><label className="label">Citizenship</label><input className="input" value={f.ownerCitizenship as string} onChange={e => set('ownerCitizenship', e.target.value)} placeholder="Filipino" /></div>
              <div>
                <label className="label">Sex</label>
                <select className="input" value={f.ownerSex as string} onChange={e => set('ownerSex', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="label">Civil Status</label>
                <select className="input" value={f.ownerCivilStatus as string} onChange={e => set('ownerCivilStatus', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="LEGALLY_SEPARATED">Legally Separated</option>
                </select>
              </div>
              <div>
                <label className="label">Social Classification</label>
                <select className="input" value={f.ownerSocialClassification as string} onChange={e => set('ownerSocialClassification', e.target.value)}>
                  <option value="">Select…</option>
                  <option value="ABLED">Abled</option>
                  <option value="SENIOR_CITIZEN">Senior Citizen</option>
                  <option value="INDIGENOUS_PERSON">Indigenous Person</option>
                  <option value="PWD">Differently-Abled (PWD)</option>
                </select>
              </div>
            </div>

            <SH>Owner's Residential Address</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">House / Building No.</label><input className="input" value={f.ownerHouseNo as string} onChange={e => set('ownerHouseNo', e.target.value)} /></div>
              <div><label className="label">Street Name</label><input className="input" value={f.ownerStreetName as string} onChange={e => set('ownerStreetName', e.target.value)} /></div>
              <div><label className="label">Barangay</label><input className="input" value={f.ownerBarangay as string} onChange={e => set('ownerBarangay', e.target.value)} /></div>
              <div><label className="label">District</label><input className="input" value={f.ownerDistrict as string} onChange={e => set('ownerDistrict', e.target.value)} /></div>
              <div><label className="label">City / Municipality</label><input className="input" value={f.ownerCityMunicipality as string} onChange={e => set('ownerCityMunicipality', e.target.value)} /></div>
              <div><label className="label">Province</label><input className="input" value={f.ownerProvince as string} onChange={e => set('ownerProvince', e.target.value)} /></div>
              <div><label className="label">Region</label><input className="input" value={f.ownerRegion as string} onChange={e => set('ownerRegion', e.target.value)} /></div>
              <div><label className="label">Zip Code</label><input className="input" value={f.ownerZipCode as string} onChange={e => set('ownerZipCode', e.target.value)} maxLength={10} /></div>
            </div>
          </>}

          {/* ── Business Trackers ─────────────────────────────────────────── */}
          {activeTab === 'trackers' && <>
            <SH>Enterprise Development Track (EDT)</SH>
            <select className="input max-w-sm" value={f.edtLevel as string} onChange={e => set('edtLevel', e.target.value)}>
              <option value="">Select EDT level…</option>
              {EDT_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>

            <SH>Regional Interactive Platform for Philippine Exporters (RIPPLES)</SH>
            <select className="input max-w-sm" value={f.ripplesStage as string} onChange={e => set('ripplesStage', e.target.value)}>
              <option value="">Select RIPPLES stage…</option>
              {RIPPLES_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <SH>SME Roving Academy (SMERA)</SH>
            <select className="input max-w-sm" value={f.smeraStage as string} onChange={e => set('smeraStage', e.target.value)}>
              <option value="">Select SMERA stage…</option>
              {SMERA_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <SH>Level of Digitalization</SH>
            <select className="input max-w-sm" value={f.digitalizationLevel as string} onChange={e => set('digitalizationLevel', e.target.value)}>
              <option value="">Select digitalization level…</option>
              {DIGITALIZATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>

            <SH>Digital Tools Used</SH>
            <div className="space-y-2">
              {(f.digitalToolsUsed as DigitalToolRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className="input flex-1 text-sm" value={r.category} onChange={e => updateRow<DigitalToolRow>('digitalToolsUsed', i, { category: e.target.value })}>
                    <option value="">Category…</option>
                    {DIGITAL_TOOL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <input className="input flex-1 text-sm" placeholder="Tool/App name (e.g. Google Drive)" value={r.toolName} onChange={e => updateRow<DigitalToolRow>('digitalToolsUsed', i, { toolName: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('digitalToolsUsed', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Digital Tool" onClick={() => addRow<DigitalToolRow>('digitalToolsUsed', { category: '', toolName: '' })} />
            </div>

            <SH>Online Presence</SH>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-dti-blue" checked={f.hasEmail as boolean} onChange={e => set('hasEmail', e.target.checked)} />
                Has Business Email
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="accent-dti-blue" checked={f.hasFacebook as boolean} onChange={e => set('hasFacebook', e.target.checked)} />
                Has Facebook Page
              </label>
            </div>
          </>}

          {/* ── Financial & Markets ───────────────────────────────────────── */}
          {activeTab === 'financial' && <>
            <SH>Business Financial Structure</SH>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Initial Capitalization (₱)</label><input className="input" value={f.initialCapitalization as string} onChange={e => set('initialCapitalization', e.target.value)} /></div>
              <div><label className="label">Year of Initial Capitalization</label><input className="input" type="number" min={1900} max={2100} value={f.initialCapitalizationYear as string} onChange={e => set('initialCapitalizationYear', e.target.value)} /></div>
              <div><label className="label">Authorized Capital (₱)</label><input className="input" value={f.authorizedCapital as string} onChange={e => set('authorizedCapital', e.target.value)} /></div>
              <div><label className="label">Subscribed Capital (₱)</label><input className="input" value={f.subscribedCapital as string} onChange={e => set('subscribedCapital', e.target.value)} /></div>
              <div><label className="label">Paid-Up Capital (₱)</label><input className="input" value={f.paidUpCapital as string} onChange={e => set('paidUpCapital', e.target.value)} /></div>
              <div>
                <label className="label">Asset Size Range</label>
                <select className="input" value={f.assetSizeRange as string} onChange={e => set('assetSizeRange', e.target.value)}>
                  <option value="">Select range…</option>
                  {ASSET_SIZE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="label">Domestic Sales (₱)</label><input className="input" value={f.domesticSales as string} onChange={e => set('domesticSales', e.target.value)} /></div>
              <div><label className="label">Export Sales (US$)</label><input className="input" value={f.exportSales as string} onChange={e => set('exportSales', e.target.value)} /></div>
              <div><label className="label">Annual Revenue (₱)</label><input className="input" value={f.annualRevenue as string} onChange={e => set('annualRevenue', e.target.value)} /></div>
            </div>

            <SH>Domestic Market Access</SH>
            <div className="space-y-2">
              {(f.domesticMarkets as DomesticMktRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input className="input flex-1 text-sm" placeholder="Product/Service" value={r.productService} onChange={e => updateRow<DomesticMktRow>('domesticMarkets', i, { productService: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Region" value={r.region} onChange={e => updateRow<DomesticMktRow>('domesticMarkets', i, { region: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Province" value={r.province} onChange={e => updateRow<DomesticMktRow>('domesticMarkets', i, { province: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('domesticMarkets', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Domestic Market" onClick={() => addRow<DomesticMktRow>('domesticMarkets', { productService: '', region: '', province: '' })} />
            </div>

            <SH>Export Market Access</SH>
            <div className="space-y-2">
              {(f.exportMarkets as ExportMktRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start flex-wrap">
                  <input className="input w-32 text-sm" type="date" title="Date Export Started" value={r.dateStarted} onChange={e => updateRow<ExportMktRow>('exportMarkets', i, { dateStarted: e.target.value })} />
                  <input className="input flex-1 text-sm" placeholder="Product/Service" value={r.productService} onChange={e => updateRow<ExportMktRow>('exportMarkets', i, { productService: e.target.value })} />
                  <input className="input w-28 text-sm" placeholder="Country" value={r.country} onChange={e => updateRow<ExportMktRow>('exportMarkets', i, { country: e.target.value })} />
                  <input className="input w-28 text-sm" placeholder="Trade Bloc" value={r.tradeBloc} onChange={e => updateRow<ExportMktRow>('exportMarkets', i, { tradeBloc: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('exportMarkets', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Export Market" onClick={() => addRow<ExportMktRow>('exportMarkets', { dateStarted: '', productService: '', country: '', tradeBloc: '' })} />
            </div>

            <SH>Import Market</SH>
            <div className="space-y-2">
              {(f.importMarkets as ImportMktRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input className="input w-32 text-sm" type="date" title="Date Import Started" value={r.dateStarted} onChange={e => updateRow<ImportMktRow>('importMarkets', i, { dateStarted: e.target.value })} />
                  <input className="input flex-1 text-sm" placeholder="Product/Commodity" value={r.productCommodity} onChange={e => updateRow<ImportMktRow>('importMarkets', i, { productCommodity: e.target.value })} />
                  <input className="input w-36 text-sm" placeholder="Country" value={r.country} onChange={e => updateRow<ImportMktRow>('importMarkets', i, { country: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('importMarkets', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Import Market" onClick={() => addRow<ImportMktRow>('importMarkets', { dateStarted: '', productCommodity: '', country: '' })} />
            </div>
          </>}

          {/* ── Products & Employment ─────────────────────────────────────── */}
          {activeTab === 'products' && <>
            <SH>Product / Services Line</SH>
            <div className="space-y-4">
              {(f.productLines as ProductLineRow[]).map((r, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 relative">
                  <button type="button" onClick={() => removeRow('productLines', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label text-xs">Product / Service</label><input className="input text-sm" value={r.productService} onChange={e => updateRow<ProductLineRow>('productLines', i, { productService: e.target.value })} /></div>
                    <div><label className="label text-xs">Description</label><input className="input text-sm" value={r.description} onChange={e => updateRow<ProductLineRow>('productLines', i, { description: e.target.value })} /></div>
                    <div><label className="label text-xs">Major Raw Materials</label><input className="input text-sm" value={r.majorRawMaterials} onChange={e => updateRow<ProductLineRow>('productLines', i, { majorRawMaterials: e.target.value })} /></div>
                    <div><label className="label text-xs">Annual Production Capacity</label><input className="input text-sm" value={r.annualProductionCapacity} onChange={e => updateRow<ProductLineRow>('productLines', i, { annualProductionCapacity: e.target.value })} /></div>
                    <div><label className="label text-xs">Year</label><input className="input text-sm" type="number" value={r.year} onChange={e => updateRow<ProductLineRow>('productLines', i, { year: e.target.value })} /></div>
                    <div><label className="label text-xs">Value / Volume</label><input className="input text-sm" value={r.valueVolume} onChange={e => updateRow<ProductLineRow>('productLines', i, { valueVolume: e.target.value })} /></div>
                    <div><label className="label text-xs">Unit of Measure</label><input className="input text-sm" value={r.unitOfMeasure} onChange={e => updateRow<ProductLineRow>('productLines', i, { unitOfMeasure: e.target.value })} /></div>
                  </div>
                </div>
              ))}
              <AddRowBtn label="Add Product / Service Line" onClick={() => addRow<ProductLineRow>('productLines', { productService: '', description: '', majorRawMaterials: '', annualProductionCapacity: '', year: '', valueVolume: '', unitOfMeasure: '' })} />
            </div>

            <SH>Product / Service Certifications</SH>
            <div className="space-y-2">
              {(f.productCertifications as CertificationRow[]).map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input className="input flex-1 text-sm" placeholder="Certification Type" value={r.certificationType} onChange={e => updateRow<CertificationRow>('productCertifications', i, { certificationType: e.target.value })} />
                  <input className="input flex-1 text-sm" placeholder="Certifying Body" value={r.certifyingBody} onChange={e => updateRow<CertificationRow>('productCertifications', i, { certifyingBody: e.target.value })} />
                  <input className="input w-32 text-sm" placeholder="Expiry Date" value={r.expiryDate} onChange={e => updateRow<CertificationRow>('productCertifications', i, { expiryDate: e.target.value })} />
                  <RemoveBtn onClick={() => removeRow('productCertifications', i)} />
                </div>
              ))}
              <AddRowBtn label="Add Certification" onClick={() => addRow<CertificationRow>('productCertifications', { certificationType: '', certifyingBody: '', expiryDate: '' })} />
            </div>

            <SH>Employment Statistics</SH>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-2 py-1 text-left font-medium">Category</th>
                    <th className="border border-gray-200 px-2 py-1 text-center font-medium" colSpan={2}>Full-Time</th>
                    <th className="border border-gray-200 px-2 py-1 text-center font-medium" colSpan={2}>Part-Time</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-2 py-1" />
                    <th className="border border-gray-200 px-2 py-1 text-center">Male</th>
                    <th className="border border-gray-200 px-2 py-1 text-center">Female</th>
                    <th className="border border-gray-200 px-2 py-1 text-center">Male</th>
                    <th className="border border-gray-200 px-2 py-1 text-center">Female</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Abled',             ft: ['ftAbledMale','ftAbledFemale'],           pt: ['ptAbledMale','ptAbledFemale'] },
                    { label: 'Differently-Abled', ft: ['ftDiffAbledMale','ftDiffAbledFemale'],   pt: ['ptDiffAbledMale','ptDiffAbledFemale'] },
                    { label: 'Indigenous People', ft: ['ftIndigenousMale','ftIndigenousFemale'], pt: ['ptIndigenousMale','ptIndigenousFemale'] },
                    { label: 'Senior Citizen',    ft: ['ftSeniorMale','ftSeniorFemale'],         pt: ['ptSeniorMale','ptSeniorFemale'] },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="border border-gray-200 px-2 py-1 font-medium">{row.label}</td>
                      {[...row.ft, ...row.pt].map(field => (
                        <td key={field} className="border border-gray-200 p-0.5">
                          <input className="w-16 text-center border-0 outline-none text-xs p-1" type="number" min={0}
                            value={f[field] as string}
                            onChange={e => set(field, e.target.value)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

        </div>

        <div className="card space-y-3">
          <label className="label">Note to DTI Staff <span className="font-normal text-gray-400">(optional)</span></label>
          <textarea className="input" rows={2} maxLength={500} value={f.notes as string} onChange={e => set('notes', e.target.value)} placeholder="e.g. Rebranded last quarter, updated trade name and website." />
        </div>

        </fieldset>

        <div className="flex justify-end gap-3 pb-6">
          {canEdit ? (
            <>
              {!requiredMode && (
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
