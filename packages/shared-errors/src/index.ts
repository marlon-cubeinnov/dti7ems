// ── Error Codes ───────────────────────────────────────────────────────────────

export const ErrorCode = {
  // Auth
  INVALID_CREDENTIALS: 'AUTH_001',
  EMAIL_NOT_VERIFIED: 'AUTH_002',
  TOKEN_EXPIRED: 'AUTH_003',
  TOKEN_INVALID: 'AUTH_004',
  REFRESH_TOKEN_INVALID: 'AUTH_005',
  ACCOUNT_SUSPENDED: 'AUTH_006',
  ACCOUNT_DEACTIVATED: 'AUTH_007',
  EMAIL_ALREADY_EXISTS: 'AUTH_008',
  DPA_CONSENT_REQUIRED: 'AUTH_009',

  // Authorization
  FORBIDDEN: 'AUTHZ_001',
  INSUFFICIENT_ROLE: 'AUTHZ_002',

  // Validation
  VALIDATION_ERROR: 'VAL_001',
  MISSING_REQUIRED_FIELD: 'VAL_002',

  // Resources
  NOT_FOUND: 'RES_001',
  CONFLICT: 'RES_002',

  // Events
  REGISTRATION_CLOSED: 'EVT_001',
  CAPACITY_REACHED: 'EVT_002',
  ALREADY_REGISTERED: 'EVT_003',
  TNA_REQUIRED: 'EVT_004',
  RSVP_DEADLINE_PASSED: 'EVT_005',
  INVALID_EVENT_STATUS: 'EVT_006',

  // QR / Attendance
  QR_TOKEN_INVALID: 'QR_001',
  QR_TOKEN_EXPIRED: 'QR_002',
  QR_TOKEN_CONSUMED: 'QR_003',
  ATTENDANCE_ALREADY_RECORDED: 'QR_004',

  // Rate limiting
  TOO_MANY_REQUESTS: 'RATE_001',

  // Server
  INTERNAL_ERROR: 'SRV_001',
  SERVICE_UNAVAILABLE: 'SRV_002',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

// ── Base App Error ────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Typed Error Subclasses ────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.VALIDATION_ERROR) {
    super(message, code, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.TOKEN_INVALID) {
    super(message, code, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.FORBIDDEN) {
    super(message, code, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, ErrorCode.NOT_FOUND, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT) {
    super(message, code, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, ErrorCode.TOO_MANY_REQUESTS, 429);
  }
}

// ── Fastify error shape ───────────────────────────────────────────────────────

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}
