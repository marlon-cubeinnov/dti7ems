// ── Enums ─────────────────────────────────────────────────────────────────────

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type ParticipantStatus =
  | 'REGISTERED'
  | 'TNA_PENDING'
  | 'RSVP_CONFIRMED'
  | 'ATTENDED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'WAITLISTED'
  | 'CANCELLED';

export type DeliveryMode = 'FACE_TO_FACE' | 'ONLINE' | 'HYBRID';

export type CertificateStatus = 'PENDING' | 'GENERATED' | 'ISSUED' | 'REVOKED';

// ── Event Types ───────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  title: string;
  description?: string | null;
  sector: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  programId?: string | null;
  title: string;
  description?: string | null;
  venue?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  deliveryMode: DeliveryMode;
  status: EventStatus;
  maxParticipants?: number | null;
  registrationDeadline?: string | null;
  startDate: string;
  endDate: string;
  targetSector?: string | null;
  targetRegion?: string | null;
  requiresTNA: boolean;
  organizerId: string;
  coverImageUrl?: string | null;
  onlineLink?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventSession {
  id: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  venue?: string | null;
  speakerName?: string | null;
  createdAt: string;
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  registeredAt: string;
  rsvpConfirmedAt?: string | null;
  tnaCompletedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
}

export interface TNAResponse {
  id: string;
  participationId: string;
  userId: string;
  knowledgeScore: number;
  skillScore: number;
  motivationScore: number;
  compositeScore: number;
  recommendedTrack?: string | null;
  responses: Record<string, unknown>;
  submittedAt: string;
}

export interface AttendanceRecord {
  id: string;
  participationId: string;
  sessionId: string;
  userId: string;
  method: 'QR_SCAN' | 'MANUAL';
  scannedAt: string;
  scannedByUserId?: string | null;
}

export interface Certificate {
  id: string;
  participationId: string;
  userId: string;
  eventId: string;
  status: CertificateStatus;
  storageUrl?: string | null;
  issuedAt?: string | null;
  generatedAt?: string | null;
  verificationCode: string;
}
