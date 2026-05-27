// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'PARTICIPANT'
  | 'ENTERPRISE_REPRESENTATIVE'
  | 'PROGRAM_MANAGER'
  | 'EVENT_ORGANIZER'
  | 'DIVISION_CHIEF'
  | 'REGIONAL_DIRECTOR'
  | 'PROVINCIAL_DIRECTOR'
  | 'SYSTEM_ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type EnterpriseStage =
  | 'IDEATION'
  | 'VALIDATION'
  | 'GROWTH'
  | 'EXPANSION'
  | 'MATURITY_EXIT';

export type MsmeLevel =
  | 'LEVEL_0'
  | 'LEVEL_1'
  | 'LEVEL_1_1'
  | 'LEVEL_1_2'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'CEASED';

export type FormOfOrganization =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'ASSOCIATION'
  | 'CORPORATION'
  | 'COOPERATIVE'
  | 'WORKERS_RURAL_ASSOCIATION'
  | 'ONE_PERSON_CORPORATION'
  | 'FRANCHISE';

export type AssetSizeClassification = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';

export type BusinessActivity =
  | 'MANUFACTURING_PRODUCING'
  | 'WHOLESALING_TRADING'
  | 'RETAILING_TRADING'
  | 'EXPORTING'
  | 'IMPORTING'
  | 'SERVICE';

export type EdtLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
export type RipplesStage = 'STAGE_5' | 'STAGE_6' | 'STAGE_7';
export type SmeraStage = 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'STAGE_4';
export type DigitalizationLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

export interface BusinessRegistration {
  type: 'DTI' | 'SEC' | 'DOLE' | 'CDA' | 'OTHERS';
  registrationNo: string;
  expiry?: string | null;
}

export interface BusinessPermit {
  type: 'BUSINESS_PERMIT' | 'BIR' | 'FDA' | 'BMBE' | 'OTHERS';
  permitNo: string;
  expiry?: string | null;
}

export interface SecondaryLicense {
  type: 'ICC' | 'ISO' | 'PRODUCT_STANDARD' | 'OTHERS';
  licenseNo: string;
  expiry?: string | null;
}

export interface EcommercePlatform {
  platform: 'SHOPEE' | 'LAZADA' | 'APEC' | 'GO_LOKAL' | 'OTHERS';
  url?: string | null;
}

export interface DomesticMarket {
  productService: string;
  region: string;
  province?: string | null;
}

export interface ExportMarket {
  dateStarted?: string | null;
  productService: string;
  country: string;
  tradeBloc?: string | null;
}

export interface ImportMarket {
  dateStarted?: string | null;
  productCommodity: string;
  country: string;
}

export interface ProductLine {
  productService: string;
  description?: string | null;
  majorRawMaterials?: string | null;
  annualProductionCapacity?: string | null;
  year?: number | null;
  valueVolume?: string | null;
  unitOfMeasure?: string | null;
}

export interface ProductCertification {
  certificationType: string;
  certifyingBody: string;
  expiryDate?: string | null;
}

export interface DigitalTool {
  category: 'COLLABORATIVE_SUITES' | 'COMMUNICATION' | 'PROJECT_MGMT' | 'ACCOUNTING_PAYROLL' | 'CMS' | 'CYBERSECURITY' | 'CLOUD_STORAGE' | 'FINTECH';
  toolName: string;
}

// ── Identity Types ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  mobileNumber?: string | null;
  region?: string | null;
  province?: string | null;
  cityMunicipality?: string | null;
  barangay?: string | null;
  jobTitle?: string | null;
  industryClassification?: string | null;
  dpaConsentGiven: boolean;
  dpaConsentAt?: string | null;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseProfile {
  id: string;
  userId: string;

  // Section 1: Client IDs
  cpmsIdNumber?: string | null;
  oldCpmsIdNumber?: string | null;
  philsysNumber?: string | null;
  tinNumber?: string | null;
  dtiKonekIdNumber?: string | null;

  // Section 2: MSME Status
  msmeLevel?: MsmeLevel | null;
  levelZeroCategories: string[];
  businessIsRegistered?: boolean | null;

  // Section 3: Business Registration
  businessName: string;
  registeredBusinessName?: string | null;
  tradeName?: string | null;
  dateOfRegistration?: string | null;
  registrationNo?: string | null;
  ipoRegistrationNumber?: string | null;
  businessRegistrations?: BusinessRegistration[] | null;
  businessPermits?: BusinessPermit[] | null;
  secondaryLicenses?: SecondaryLicense[] | null;

  // Section 4: Business Address
  houseNo?: string | null;
  streetName?: string | null;
  streetAddress?: string | null;
  barangay?: string | null;
  district?: string | null;
  cityMunicipality?: string | null;
  province?: string | null;
  region?: string | null;
  zipCode?: string | null;
  latitude?: string | null;
  longitude?: string | null;

  // Section 5: Business Contact
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessFax?: string | null;
  websiteUrl?: string | null;
  socialMediaFacebook?: string | null;
  socialMediaInstagram?: string | null;
  socialMediaLinkedIn?: string | null;
  socialMediaOthers?: string | null;
  ecommercePlatforms?: EcommercePlatform[] | null;

  // Section 6: Business Profile
  description?: string | null;
  yearEstablished?: number | null;
  formOfOrganization?: FormOfOrganization | null;
  assetSizeClassification?: AssetSizeClassification | null;
  primaryBusinessActivity?: BusinessActivity | null;
  secondaryBusinessActivity?: BusinessActivity | null;
  psicSection?: string | null;
  psicDivision?: string | null;
  psicGroup?: string | null;
  priorityIndustry?: string | null;
  industryClusterEnhancement?: string | null;
  industrySector: string;
  industryTags: string[];
  tradeAssociationAffiliations: string[];
  stage: EnterpriseStage;

  // Section 7: Owner Information
  ownerPrefix?: string | null;
  ownerFirstName?: string | null;
  ownerMiddleName?: string | null;
  ownerLastName?: string | null;
  ownerSuffix?: string | null;
  ownerBirthdate?: string | null;
  ownerCitizenship?: string | null;
  ownerSex?: string | null;
  ownerCivilStatus?: string | null;
  ownerSocialClassification?: string | null;
  ownerHouseNo?: string | null;
  ownerStreetName?: string | null;
  ownerBarangay?: string | null;
  ownerDistrict?: string | null;
  ownerCityMunicipality?: string | null;
  ownerProvince?: string | null;
  ownerRegion?: string | null;
  ownerZipCode?: string | null;

  // Section 8: Business Trackers
  edtLevel?: EdtLevel | null;
  ripplesStage?: RipplesStage | null;
  smeraStage?: SmeraStage | null;
  digitalizationLevel?: DigitalizationLevel | null;
  digitalToolsUsed?: DigitalTool[] | null;
  hasEmail?: boolean | null;
  hasFacebook?: boolean | null;

  // Section 9: Financial Structure
  initialCapitalization?: string | null;
  initialCapitalizationYear?: number | null;
  authorizedCapital?: string | null;
  subscribedCapital?: string | null;
  paidUpCapital?: string | null;
  assetSizeRange?: string | null;
  domesticSales?: string | null;
  exportSales?: string | null;
  annualRevenue?: string | null;

  // Section 10: Market Access
  domesticMarkets?: DomesticMarket[] | null;
  exportMarkets?: ExportMarket[] | null;
  importMarkets?: ImportMarket[] | null;

  // Section 11: Product/Services Line
  productLines?: ProductLine[] | null;

  // Section 12: Product/Service Certifications
  productCertifications?: ProductCertification[] | null;

  // Section 13: Employment Statistics
  ftAbledMale?: number | null;
  ftAbledFemale?: number | null;
  ftDiffAbledMale?: number | null;
  ftDiffAbledFemale?: number | null;
  ftIndigenousMale?: number | null;
  ftIndigenousFemale?: number | null;
  ftSeniorMale?: number | null;
  ftSeniorFemale?: number | null;
  ptAbledMale?: number | null;
  ptAbledFemale?: number | null;
  ptDiffAbledMale?: number | null;
  ptDiffAbledFemale?: number | null;
  ptIndigenousMale?: number | null;
  ptIndigenousFemale?: number | null;
  ptSeniorMale?: number | null;
  ptSeniorFemale?: number | null;

  // Tracking
  employeeCount?: number | null;
  isVerified: boolean;
  isPubliclyListed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Auth Types ────────────────────────────────────────────────────────────────

export interface AuthTokenPayload {
  sub: string;         // userId
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  iat: number;
  exp: number;
}

export interface LoginResult {
  accessToken: string;
  user: Pick<UserProfile, 'id' | 'email' | 'role' | 'status' | 'firstName' | 'lastName'>;
}
