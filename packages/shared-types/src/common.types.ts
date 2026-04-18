// ── Kafka Event Types ─────────────────────────────────────────────────────────
// These match the integration events defined in the DBML model.

export interface KafkaEvent<T = unknown> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  source: string;
  payload: T;
}

// ── Integration Event Payloads ────────────────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AttendanceConfirmedPayload {
  participationId: string;
  userId: string;
  eventId: string;
  sessionId: string;
  attendanceRate: number;
}

export interface EventCompletedPayload {
  eventId: string;
  participantCount: number;
  completedAt: string;
}

export interface ParticipationCompletedPayload {
  participationId: string;
  userId: string;
  eventId: string;
  attendanceRate: number;
}

export interface CSFSurveySubmittedPayload {
  surveyResponseId: string;
  participationId: string;
  userId: string;
  eventId: string;
}

// ── Kafka Topic Names ─────────────────────────────────────────────────────────

export const KAFKA_TOPICS = {
  USER_REGISTERED: 'dti.identity.user.registered',
  USER_UPDATED: 'dti.identity.user.updated',
  ATTENDANCE_CONFIRMED: 'dti.event.attendance.confirmed',
  EVENT_COMPLETED: 'dti.event.event.completed',
  PARTICIPATION_COMPLETED: 'dti.event.participation.completed',
  CSF_SURVEY_SUBMITTED: 'dti.survey.csf.submitted',
  IMPACT_SURVEY_SUBMITTED: 'dti.survey.impact.submitted',
  NOTIFICATION_REQUESTED: 'dti.notification.requested',
  CERTIFICATE_REQUESTED: 'dti.document.certificate.requested',
} as const;

export type KafkaTopic = typeof KAFKA_TOPICS[keyof typeof KAFKA_TOPICS];

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
