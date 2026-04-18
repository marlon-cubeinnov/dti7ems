// Admin Console API client
// Vite proxies: /api/identity → localhost:3011, /api/events → localhost:3012

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

  if (res.status === 204) return { success: true };

  const data: ApiResponse<T> = await res.json();

  if (!res.ok && data.error) {
    if (res.status === 401 && data.error.code === 'AUTH_003') {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) return request<T>(url, init);
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

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: { id: string; email: string; role: string; firstName: string; lastName: string } }>(
      `${BASE_IDENTITY}/auth/login`,
      { method: 'POST', body: JSON.stringify(body) },
    ),

  logout: () =>
    request(`${BASE_IDENTITY}/auth/logout`, { method: 'POST' }),
};

// ── Identity Admin ────────────────────────────────────────────────────────────

export const adminIdentityApi = {
  getStats: () =>
    request(`${BASE_IDENTITY}/admin/stats`),

  listUsers: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/users${qs}`);
  },

  getUser: (id: string) =>
    request(`${BASE_IDENTITY}/users/${id}`),

  changeUserStatus: (id: string, status: string, reason: string) =>
    request(`${BASE_IDENTITY}/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  changeUserRole: (id: string, role: string) =>
    request(`${BASE_IDENTITY}/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  verifyUserEmail: (id: string) =>
    request(`${BASE_IDENTITY}/admin/users/${id}/verify-email`, {
      method: 'PATCH',
    }),

  listEnterprises: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/admin/enterprises${qs}`);
  },

  getEnterpriseStats: () =>
    request(`${BASE_IDENTITY}/admin/enterprises/stats`),

  verifyEnterprise: (id: string) =>
    request(`${BASE_IDENTITY}/enterprises/${id}/verify`, { method: 'PATCH' }),

  getAuditLogs: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_IDENTITY}/admin/audit-logs${qs}`);
  },
};

// ── Events Admin ──────────────────────────────────────────────────────────────

export const adminEventsApi = {
  getStats: () =>
    request(`${BASE_EVENTS}/admin/stats`),

  listEvents: (params?: Record<string, string | number | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_EVENTS}/admin/events${qs}`);
  },

  getCsfReport: (params?: Record<string, string | undefined>) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return request(`${BASE_EVENTS}/admin/reports/csf${qs}`);
  },

  getCompletionReport: () =>
    request(`${BASE_EVENTS}/admin/reports/completion`),

  getDpaReport: () =>
    request(`${BASE_EVENTS}/admin/reports/dpa`),

  getTrends: (months?: number) =>
    request(`${BASE_EVENTS}/admin/reports/trends${months ? `?months=${months}` : ''}`),

  getImpactReport: () =>
    request(`${BASE_EVENTS}/admin/reports/impact`),
};
