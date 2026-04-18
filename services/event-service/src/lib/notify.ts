/**
 * Lightweight HTTP client – event-service → notification-service.
 * Fires-and-forgets (best effort). Failures are logged, not thrown.
 */

const NOTIFY_BASE = process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3013/notify';

export async function notifyRegistrationConfirmation(data: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  requiresTNA: boolean;
  participationId: string;
}): Promise<void> {
  try {
    await fetch(`${NOTIFY_BASE}/registration-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* best effort */ }
}

export async function notifyCertificateIssued(data: {
  to: string;
  participantName: string;
  eventTitle: string;
  verificationCode: string;
}): Promise<void> {
  try {
    await fetch(`${NOTIFY_BASE}/certificate-issued`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* best effort */ }
}

export async function notifyBulkCsfInvite(data: {
  eventTitle: string;
  participants: Array<{
    to: string;
    participantName: string;
    participationId: string;
  }>;
}): Promise<void> {
  try {
    await fetch(`${NOTIFY_BASE}/bulk-csf-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* best effort */ }
}

export async function notifyBulkImpactInvite(data: {
  eventTitle: string;
  surveyDeadline: string;
  participants: Array<{
    to: string;
    participantName: string;
    participationId: string;
  }>;
}): Promise<void> {
  try {
    await fetch(`${NOTIFY_BASE}/bulk-impact-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch { /* best effort */ }
}
