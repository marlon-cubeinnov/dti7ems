// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'PARTICIPANT'
  | 'ENTERPRISE_REPRESENTATIVE'
  | 'PROGRAM_MANAGER'
  | 'EVENT_ORGANIZER'
  | 'SYSTEM_ADMIN'
  | 'SUPER_ADMIN';

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type EnterpriseStage =
  | 'PRE_STARTUP'
  | 'STARTUP'
  | 'GROWTH'
  | 'EXPANSION'
  | 'MATURE';

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
  businessName: string;
  tradeName?: string | null;
  registrationNo?: string | null;
  tinNumber?: string | null;
  industrySector: string;
  industryTags: string[];
  stage: EnterpriseStage;
  employeeCount?: number | null;
  annualRevenue?: string | null;
  region?: string | null;
  province?: string | null;
  cityMunicipality?: string | null;
  barangay?: string | null;
  latitude?: string | null;
  longitude?: string | null;
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
