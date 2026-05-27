/**
 * Lightweight HTTP client – event-service → notification-service.
 * EIML: HttpRestAdapter → /triggers/* namespace.
 * EIML DefaultRetryPolicy: retry 3, backoff 1 000 ms (linear).
 * All functions are fire-and-forget: failures are logged, not thrown.
 */

const NOTIFY_BASE = process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3013/triggers';

async function postWithRetry(url: string, body: unknown, retries = 3, backoffMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok || res.status < 500) return; // success or 4xx — no point retrying
    } catch { /* network error — fall through to retry */ }
    if (attempt < retries) await new Promise(r => setTimeout(r, backoffMs * attempt));
  }
}

export async function notifyRegistrationConfirmation(data: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  requiresTNA: boolean;
  participationId: string;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/registration-confirmation`, data).catch(() => { /* best effort */ });
}

export async function notifyRsvpReminder(data: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  daysUntilEvent: number;
  phone?: string;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/rsvp-reminder`, data).catch(() => { /* best effort */ });
}

export async function notifyCertificateIssued(data: {
  to: string;
  participantName: string;
  eventTitle: string;
  verificationCode: string;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/certificate-issued`, data).catch(() => { /* best effort */ });
}

export async function notifyBulkCsfInvite(data: {
  eventTitle: string;
  participants: Array<{
    to: string;
    participantName: string;
    participationId: string;
  }>;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/bulk-csf-invite`, data).catch(() => { /* best effort */ });
}

export async function notifyBulkImpactInvite(data: {
  eventTitle: string;
  eventDate: string;
  participants: Array<{
    to: string;
    participantName: string;
    participationId: string;
  }>;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/bulk-impact-invite`, data).catch(() => { /* best effort */ });
}

export async function notifyMaterialsShared(data: {
  eventTitle: string;
  eventDate: string;
  materials: Array<{ title: string; driveUrl: string; expiresAt: string }>;
  participants: Array<{ to: string; participantName: string }>;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/materials-shared`, data).catch(() => { /* best effort */ });
}

export async function notifyEventStatusChange(data: {
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  newStatus: string;
  message?: string;
  recipients: Array<{ to: string; recipientName: string }>;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/event-status-change`, data).catch(() => { /* best effort */ });
}

export async function notifyLeadAssigned(data: {
  to: string;
  leadName: string;
  eventTitle: string;
  eventDate: string;
  assignedByName: string;
}): Promise<void> {
  postWithRetry(`${NOTIFY_BASE}/lead-assigned`, data).catch(() => { /* best effort */ });
}
