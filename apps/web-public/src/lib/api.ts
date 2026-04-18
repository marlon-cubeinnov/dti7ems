// Typed API client for all backend services.
// In dev, Vite proxies /api/identity → localhost:3001 and /api/events → localhost:3002

const BASE_IDENTITY = '/api/identity';
const BASE_EVENTS   = '/api/events';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  message?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('access_token');

  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  // Handle empty responses (204)
  if (res.status === 204) return { success: true };

  const data: ApiResponse<T> = await res.json();

  if (!res.ok && data.error) {
    // Auto-refresh on 401
    if (res.status === 401 && data.error.code === 'AUTH_003') {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        return request<T>(url, init);
      }
      // Refresh failed — clear auth
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    throw new ApiError(data.error.code, data.error.message, res.status, data.error.details);
  }

  return data;
}

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_IDENTITY}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data: ApiResponse<{ accessToken: string }> = await res.json();
    if (data.data?.accessToken) {
      localStorage.setItem('access_token', data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Identity API ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dpaConsentGiven: true;
  }) =>
    request(`${BASE_IDENTITY}/auth/register`, { method: 'POST', body: JSON.stringify(body) }),

  registerBusiness: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobileNumber?: string | null;
    dpaConsentGiven: true;
    enterprise: {
      businessName: string;
      industrySector: string;
      tradeName?: string | null;
      registrationNo?: string | null;
      tinNumber?: string | null;
      stage?: string;
      employeeCount?: number | null;
      region?: string | null;
      province?: string | null;
      cityMunicipality?: string | null;
    };
    employees?: Array<{
      email: string;
      firstName: string;
      lastName: string;
      jobTitle?: string | null;
    }>;
  }) =>
    request(`${BASE_IDENTITY}/auth/register-business`, { method: 'POST', body: JSON.stringify(body) }),

  acceptInvite: (body: { token: string; password: string; dpaConsentGiven: true }) =>
    request(`${BASE_IDENTITY}/auth/accept-invite`, { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: { id: string; email: string; role: string; firstName: string; lastName: string } }>(
      `${BASE_IDENTITY}/auth/login`,
      { method: 'POST', body: JSON.stringify(body) },
    ),

  logout: () =>
    request(`${BASE_IDENTITY}/auth/logout`, { method: 'POST' }),

  verifyEmail: (token: string) =>
    request(`${BASE_IDENTITY}/auth/verify-email`, { method: 'POST', body: JSON.stringify({ token }) }),

  forgotPassword: (email: string) =>
    request(`${BASE_IDENTITY}/auth/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    request(`${BASE_IDENTITY}/auth/reset-password`, { method: 'POST', body: JSON.stringify({ token, password }) }),
};

export const userApi = {
  getMe: () => request(`${BASE_IDENTITY}/users/me`),
  updateMe: (body: Record<string, unknown>) =>
    request(`${BASE_IDENTITY}/users/me`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const enterpriseApi = {
  getMyEnterprises: () =>
    request(`${BASE_IDENTITY}/enterprises/my`),

  getMyMembership: () =>
    request(`${BASE_IDENTITY}/enterprises/my-membership`),

  create: (body: Record<string, unknown>) =>
    request(`${BASE_IDENTITY}/enterprises`, { method: 'POST', body: JSON.stringify(body) }),

  getMembers: (enterpriseId: string) =>
    request(`${BASE_IDENTITY}/enterprises/${enterpriseId}/members`),

  addMember: (enterpriseId: string, body: { email: string; role?: string }) =>
    request(`${BASE_IDENTITY}/enterprises/${enterpriseId}/members`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  inviteEmployee: (enterpriseId: string, body: { email: string; firstName: string; lastName: string; jobTitle?: string | null }) =>
    request(`${BASE_IDENTITY}/enterprises/${enterpriseId}/invite-employee`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  removeMember: (enterpriseId: string, userId: string) =>
    request(`${BASE_IDENTITY}/enterprises/${enterpriseId}/members/${userId}`, { method: 'DELETE' }),
};

// ── Events API ────────────────────────────────────────────────────────────────

export const eventsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return request(`${BASE_EVENTS}/events${qs}`);
  },

  get: (id: string) => request(`${BASE_EVENTS}/events/${id}`),

  getMyRegistration: (eventId: string) =>
    request(`${BASE_EVENTS}/participations/events/${eventId}/me`),

  register: (eventId: string, body: { enterpriseId?: string; dpaConsentConfirmed: true }) =>
    request(`${BASE_EVENTS}/participations/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMyParticipations: (params?: { page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString() : '';
    return request(`${BASE_EVENTS}/participations/me${qs}`);
  },

  submitTNA: (participationId: string, body: {
    knowledgeScore: number;
    skillScore: number;
    motivationScore: number;
    responses: Record<string, unknown>;
  }) =>
    request(`${BASE_EVENTS}/participations/${participationId}/tna`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  confirmRSVP: (participationId: string) =>
    request(`${BASE_EVENTS}/participations/${participationId}/confirm-rsvp`, { method: 'POST', body: '{}' }),
};

// ── Organizer / Admin API ─────────────────────────────────────────────────────

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface EventBody {
  title: string;
  description?: string | null;
  venue?: string | null;
  deliveryMode: 'FACE_TO_FACE' | 'ONLINE' | 'HYBRID';
  onlineLink?: string | null;
  maxParticipants?: number | null;
  registrationDeadline?: string | null;
  startDate: string;
  endDate: string;
  targetSector?: string | null;
  targetRegion?: string | null;
  requiresTNA?: boolean;
  programId?: string | null;
}

export const organizerApi = {
  listMyEvents: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_EVENTS}/events/mine${qs}`);
  },

  createEvent: (body: EventBody) =>
    request(`${BASE_EVENTS}/events`, { method: 'POST', body: JSON.stringify(body) }),

  updateEvent: (id: string, body: Partial<EventBody>) =>
    request(`${BASE_EVENTS}/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  updateStatus: (id: string, status: EventStatus) =>
    request(`${BASE_EVENTS}/events/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteEvent: (id: string) =>
    request(`${BASE_EVENTS}/events/${id}`, { method: 'DELETE' }),

  getParticipants: (eventId: string, params?: { page?: number; limit?: number; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString() : '';
    return request(`${BASE_EVENTS}/events/${eventId}/participants${qs}`);
  },

  exportParticipants: (eventId: string) =>
    `${BASE_EVENTS}/events/${eventId}/participants/export`,

  // Attendance
  scanQr: (token: string, sessionId: string) =>
    request(`${BASE_EVENTS}/participations/attendance/scan`, { method: 'POST', body: JSON.stringify({ token, sessionId }) }),

  manualCheckin: (participationId: string, sessionId: string) =>
    request(`${BASE_EVENTS}/participations/${participationId}/manual-checkin`, { method: 'POST', body: JSON.stringify({ sessionId }) }),

  getAttendance: (participationId: string) =>
    request(`${BASE_EVENTS}/participations/${participationId}/attendance`),

  getEventSessions: (eventId: string) =>
    request(`${BASE_EVENTS}/events/${eventId}/sessions`),

  createSession: (eventId: string, body: { title: string; startTime: string; endTime: string; venue?: string; speakerName?: string; orderIndex?: number }) =>
    request(`${BASE_EVENTS}/events/${eventId}/sessions`, { method: 'POST', body: JSON.stringify(body) }),

  deleteSession: (eventId: string, sessionId: string) =>
    request(`${BASE_EVENTS}/events/${eventId}/sessions/${sessionId}`, { method: 'DELETE' }),

  // Event report
  getEventReport: (eventId: string) =>
    request(`${BASE_EVENTS}/events/${eventId}/report`),

  // Organizer aggregate report
  getMySummary: () =>
    request(`${BASE_EVENTS}/events/reports/my-summary`),
};

// ── Checklist API ────────────────────────────────────────────────────────────

export const checklistApi = {
  getChecklists: (eventId: string) =>
    request(`${BASE_EVENTS}/checklists/events/${eventId}`),

  createChecklist: (eventId: string, body: { title: string; description?: string | null; useTemplate?: boolean }) =>
    request(`${BASE_EVENTS}/checklists/events/${eventId}`, { method: 'POST', body: JSON.stringify(body) }),

  getChecklist: (id: string) =>
    request(`${BASE_EVENTS}/checklists/${id}`),

  deleteChecklist: (id: string) =>
    request(`${BASE_EVENTS}/checklists/${id}`, { method: 'DELETE' }),

  addItem: (checklistId: string, body: {
    title: string;
    description?: string | null;
    phase?: string;
    priority?: string;
    assignedTo?: string | null;
    assignedToName?: string | null;
    dueDate?: string | null;
    orderIndex?: number;
    notes?: string | null;
  }) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items`, { method: 'POST', body: JSON.stringify(body) }),

  updateItem: (checklistId: string, itemId: string, body: Record<string, unknown>) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  deleteItem: (checklistId: string, itemId: string) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' }),

  getSummary: (eventId: string) =>
    request(`${BASE_EVENTS}/checklists/events/${eventId}/summary`),

  addComment: (checklistId: string, itemId: string, body: { content: string; linkUrl?: string | null; linkLabel?: string | null }) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items/${itemId}/comments`, { method: 'POST', body: JSON.stringify(body) }),

  getComments: (checklistId: string, itemId: string) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items/${itemId}/comments`),

  deleteComment: (checklistId: string, itemId: string, commentId: string) =>
    request(`${BASE_EVENTS}/checklists/${checklistId}/items/${itemId}/comments/${commentId}`, { method: 'DELETE' }),
};

export const participantApi = {
  getMyRegistrations: (params?: { page?: number; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString() : '';
    return request(`${BASE_EVENTS}/participations/me${qs}`);
  },

  getParticipation: (id: string) =>
    request(`${BASE_EVENTS}/participations/${id}`),

  getQrCode: (participationId: string) =>
    request(`${BASE_EVENTS}/participations/${participationId}/qr`),

  getAttendance: (participationId: string) =>
    request(`${BASE_EVENTS}/participations/${participationId}/attendance`),
};

export const surveyApi = {
  getMyResponse: (eventId: string) =>
    request(`${BASE_EVENTS}/surveys/events/${eventId}/csf/me`),

  submitCsf: (eventId: string, body: {
    overallRating: number;
    contentRating: number;
    facilitatorRating: number;
    logisticsRating: number;
    highlightsFeedback?: string;
    improvementsFeedback?: string;
  }) =>
    request(`${BASE_EVENTS}/surveys/events/${eventId}/csf`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getResults: (eventId: string) =>
    request(`${BASE_EVENTS}/surveys/events/${eventId}/csf/results`),

  // Impact Survey
  getMyImpactResponse: (eventId: string) =>
    request(`${BASE_EVENTS}/surveys/events/${eventId}/impact/me`),

  submitImpact: (eventId: string, body: {
    knowledgeApplication: number;
    skillImprovement: number;
    businessImpact: number;
    revenueChange: number;
    employeeGrowth: number;
    successStory?: string;
    challengesFaced?: string;
    additionalSupport?: string;
    revenueChangePct?: number;
    employeeCountBefore?: number;
    employeeCountAfter?: number;
  }) =>
    request(`${BASE_EVENTS}/surveys/events/${eventId}/impact`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const certificatesApi = {
  getMyCertificates: () => request(`${BASE_EVENTS}/certificates/my`),

  getCertificate: (participationId: string) =>
    request(`${BASE_EVENTS}/certificates/${participationId}`),

  verifyCertificate: (code: string) =>
    request(`${BASE_EVENTS}/certificates/verify/${encodeURIComponent(code)}`),

  // Organizer actions
  issueCertificate: (participationId: string) =>
    request(`${BASE_EVENTS}/certificates/${participationId}/issue`, { method: 'POST' }),

  bulkIssueCertificates: (eventId: string) =>
    request(`${BASE_EVENTS}/certificates/bulk-issue/${eventId}`, { method: 'POST' }),

  downloadCertificatePdf: async (participationId: string): Promise<void> => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_EVENTS}/certificates/${participationId}/pdf`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to download certificate PDF.');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    a.download = match?.[1] ?? 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ── Staff search (organizers + admins) ─────────────────────────────────────

export const staffApi = {
  search: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`${BASE_IDENTITY}/users/staff${qs}`);
  },
};

// ── Admin API (SYSTEM_ADMIN / SUPER_ADMIN only) ──────────────────────────

export const adminIdentityApi = {
  getStats: () => request(`${BASE_IDENTITY}/admin/stats`),

  listUsers: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/users${qs}`);
  },

  changeUserStatus: (id: string, status: string, reason: string) =>
    request(`${BASE_IDENTITY}/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),

  changeUserRole: (id: string, role: string) =>
    request(`${BASE_IDENTITY}/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  verifyUserEmail: (id: string) =>
    request(`${BASE_IDENTITY}/admin/users/${id}/verify-email`, { method: 'PATCH' }),

  getAuditLogs: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/admin/audit-logs${qs}`);
  },

  listEnterprises: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/admin/enterprises${qs}`);
  },

  verifyEnterprise: (id: string) =>
    request(`${BASE_IDENTITY}/enterprises/${id}/verify`, { method: 'PATCH' }),

  updateEnterprise: (id: string, data: Record<string, unknown>) =>
    request(`${BASE_IDENTITY}/enterprises/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};

// ── Roles & Permissions API ──────────────────────────────────────────────────

export const rolesApi = {
  list: () => request(`${BASE_IDENTITY}/admin/roles`),

  get: (id: string) => request(`${BASE_IDENTITY}/admin/roles/${id}`),

  listPermissions: () => request(`${BASE_IDENTITY}/admin/roles/permissions`),

  seed: () => request(`${BASE_IDENTITY}/admin/roles/seed`, { method: 'POST' }),

  create: (body: { name: string; label: string; description?: string; permissionIds: string[] }) =>
    request(`${BASE_IDENTITY}/admin/roles`, { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: { label?: string; description?: string }) =>
    request(`${BASE_IDENTITY}/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  updatePermissions: (id: string, permissionIds: string[]) =>
    request(`${BASE_IDENTITY}/admin/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissionIds }) }),

  remove: (id: string) =>
    request(`${BASE_IDENTITY}/admin/roles/${id}`, { method: 'DELETE' }),
};

export const adminEventsApi = {
  getStats: () => request(`${BASE_EVENTS}/admin/stats`),

  listEvents: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_EVENTS}/admin/events${qs}`);
  },

  getCsfReport: () => request(`${BASE_EVENTS}/admin/reports/csf`),
  getImpactReport: () => request(`${BASE_EVENTS}/admin/reports/impact`),
  getCompletionReport: () => request(`${BASE_EVENTS}/admin/reports/completion`),
  getEnterpriseTrainingReport: () => request(`${BASE_EVENTS}/admin/reports/enterprise-training`),
  getTrends: (months?: number) =>
    request(`${BASE_EVENTS}/admin/reports/trends${months ? `?months=${months}` : ''}`),
  getDpaReport: () => request(`${BASE_EVENTS}/admin/reports/dpa`),

  // Analytics
  getAnalyticsOverview: () => request(`${BASE_EVENTS}/admin/analytics/overview`),
  getSectorBreakdown: () => request(`${BASE_EVENTS}/admin/analytics/sectors`),
  getImpactTimeseries: (months?: number) =>
    request(`${BASE_EVENTS}/admin/analytics/impact-timeseries${months ? `?months=${months}` : ''}`),
};

// ── Public Directory API (no auth required) ─────────────────────────────────

export const directoryApi = {
  searchEnterprises: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return request(`${BASE_IDENTITY}/directory/enterprises${qs}`);
  },

  getSectors: () => request(`${BASE_IDENTITY}/directory/sectors`),

  getStats: () => request(`${BASE_IDENTITY}/directory/stats`),
};
