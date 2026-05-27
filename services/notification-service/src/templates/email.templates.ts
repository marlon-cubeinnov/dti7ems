// HTML email templates for DTI Region 7 EMS

const FRONTEND_URL = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background: #ffffff; border-radius: 8px; padding: 32px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { text-align: center; padding: 20px 0; }
  .header h1 { color: #1a3a6c; font-size: 20px; margin: 0; }
  .header p { color: #666; font-size: 12px; margin: 4px 0 0; }
  .btn { display: inline-block; background: #1a3a6c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; }
  .footer { text-align: center; color: #999; font-size: 11px; padding: 16px 0; }
  h2 { color: #1a3a6c; font-size: 18px; margin-top: 0; }
  p { color: #333; font-size: 14px; line-height: 1.6; }
  .detail { background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin: 12px 0; }
  .detail strong { color: #1a3a6c; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>DTI Region 7</h1>
    <p>Event Management System</p>
  </div>
  <div class="card">${content}</div>
  <div class="footer">
    <p>Department of Trade and Industry — Regional Office VII, Central Visayas</p>
    <p>This is an automated message. Please do not reply.</p>
  </div>
</div>
</body></html>`;
}

export interface RegistrationConfirmationData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  requiresTNA: boolean;
  participationId: string;
}

export function registrationConfirmation(data: RegistrationConfirmationData): { subject: string; html: string } {
  const tnaBlock = data.requiresTNA
    ? `<p>📋 <strong>Next step:</strong> Complete your Training Needs Assessment (TNA) to confirm your slot.</p>
       <p style="text-align:center;margin:20px 0">
         <a href="${FRONTEND_URL}/my-events/${data.participationId}/tna" class="btn">Complete TNA →</a>
       </p>`
    : `<p>✅ Your registration is confirmed. No further steps needed at this time.</p>`;

  return {
    subject: `Registration Confirmed: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>Registration Confirmed! 🎉</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>You have been successfully registered for:</p>
      <div class="detail">
        <strong>${data.eventTitle}</strong><br>
        📅 ${data.eventDate}${data.eventVenue ? `<br>📍 ${data.eventVenue}` : ''}
      </div>
      ${tnaBlock}
      <p style="text-align:center;margin-top:24px">
        <a href="${FRONTEND_URL}/my-events" class="btn" style="background:#4a7c59">View My Events</a>
      </p>
    `),
  };
}

export interface RsvpReminderData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  daysUntilEvent: number;
}

export function rsvpReminder(data: RsvpReminderData): { subject: string; html: string } {
  const urgency = data.daysUntilEvent <= 1 ? '⏰ Tomorrow!' : `📅 In ${data.daysUntilEvent} days`;

  return {
    subject: `Reminder: ${data.eventTitle} — ${urgency}`,
    html: baseLayout(`
      <h2>Event Reminder ${urgency}</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>This is a friendly reminder about your upcoming event:</p>
      <div class="detail">
        <strong>${data.eventTitle}</strong><br>
        📅 ${data.eventDate}${data.eventVenue ? `<br>📍 ${data.eventVenue}` : ''}
      </div>
      <p>📱 Don't forget to bring your QR code for attendance scanning.</p>
      <p style="text-align:center;margin-top:20px">
        <a href="${FRONTEND_URL}/my-events" class="btn">View My QR Code</a>
      </p>
    `),
  };
}

export interface CsfSurveyInviteData {
  participantName: string;
  eventTitle: string;
  participationId: string;
}

export function csfSurveyInvite(data: CsfSurveyInviteData): { subject: string; html: string } {
  return {
    subject: `Feedback Requested: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>We'd love your feedback! 📋</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>Thank you for attending <strong>${data.eventTitle}</strong>.</p>
      <p>Please take a few minutes to complete our Client Satisfaction Feedback (CSF) survey. Your input helps us improve future events.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/my-events/${data.participationId}/csf" class="btn">Complete Survey →</a>
      </p>
      <p style="background:#f0f4ff;border-left:3px solid #1a3a6c;padding:8px 12px;font-size:12px;color:#333">📋 <strong>This is a digital form — no signature is required.</strong> Simply submit your responses online.</p>
    `),
  };
}

export interface CertificateIssuedData {
  participantName: string;
  eventTitle: string;
  verificationCode: string;
}

export function certificateIssued(data: CertificateIssuedData): { subject: string; html: string } {
  return {
    subject: `Certificate Issued: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>Your Certificate is Ready! 🎓</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>Your certificate of completion for <strong>${data.eventTitle}</strong> has been issued.</p>
      <div class="detail">
        <strong>Verification Code:</strong> <code style="font-family:monospace;font-size:16px;letter-spacing:2px">${data.verificationCode}</code>
      </div>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/my-certificates" class="btn">View & Download Certificate</a>
      </p>
      <p style="color:#999;font-size:12px">Anyone can verify your certificate at ${FRONTEND_URL}/verify/${data.verificationCode}</p>
    `),
  };
}

export interface MaterialsSharedData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  materials: Array<{ title: string; driveUrl: string; expiresAt: string }>;
}

export function materialsShared(data: MaterialsSharedData): { subject: string; html: string } {
  const materialRows = data.materials.map(m => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">
        <a href="${m.driveUrl}" style="color:#1a3a6c;font-weight:600;text-decoration:none">${m.title}</a>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:12px;white-space:nowrap">
        Available until ${new Date(m.expiresAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
      </td>
    </tr>`).join('');

  return {
    subject: `Presentation Materials Available: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>Presentation Materials Available 📎</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>The presentation materials from <strong>${data.eventTitle}</strong> (${data.eventDate}) are now available for download via Google Drive.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:6px;overflow:hidden;margin:16px 0">
        <thead>
          <tr style="background:#f8f9fa">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#1a3a6c;border-bottom:2px solid #eee">Material</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#1a3a6c;border-bottom:2px solid #eee">Availability</th>
          </tr>
        </thead>
        <tbody>${materialRows}</tbody>
      </table>
      <p style="background:#fff8e1;border-left:3px solid #f59e0b;padding:8px 12px;font-size:12px;color:#333">⚠️ <strong>Note:</strong> Download links will expire 15 days after the event. Please save the materials to your device.</p>
      <p style="text-align:center;margin-top:20px">
        <a href="${FRONTEND_URL}/my-events" class="btn">View My Events</a>
      </p>
    `),
  };
}

export interface EventStatusChangeData {
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue?: string;
  newStatus: string;
  message?: string;
}

export function eventStatusChange(data: EventStatusChangeData): { subject: string; html: string } {
  const statusLabels: Record<string, { label: string; icon: string; color: string }> = {
    REGISTRATION_OPEN:   { label: 'Registration is Now Open',  icon: '🎟️', color: '#16a34a' },
    REGISTRATION_CLOSED: { label: 'Registration Closed',       icon: '🔒', color: '#dc2626' },
    CANCELLED:           { label: 'Event Cancelled',           icon: '❌', color: '#dc2626' },
    PUBLISHED:           { label: 'Event Published',           icon: '📢', color: '#1a3a6c' },
    ONGOING:             { label: 'Event is Ongoing',          icon: '▶️', color: '#7c3aed' },
    COMPLETED:           { label: 'Event Completed',           icon: '✅', color: '#16a34a' },
  };
  const s = statusLabels[data.newStatus] ?? { label: data.newStatus, icon: '📋', color: '#333' };

  return {
    subject: `${s.icon} ${s.label}: ${data.eventTitle}`,
    html: baseLayout(`
      <h2 style="color:${s.color}">${s.icon} ${s.label}</h2>
      <p>Hello <strong>${data.recipientName}</strong>,</p>
      <p>${data.message ?? `The status of the following event has been updated.`}</p>
      <div class="detail">
        <strong>${data.eventTitle}</strong><br>
        📅 ${data.eventDate}${data.eventVenue ? `<br>📍 ${data.eventVenue}` : ''}
      </div>
      <p style="text-align:center;margin-top:20px">
        <a href="${FRONTEND_URL}/my-events" class="btn">View My Events</a>
      </p>
    `),
  };
}

export interface ImpactSurveyInviteData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  participationId: string;
}

export function impactSurveyInvite(data: ImpactSurveyInviteData): { subject: string; html: string } {
  return {
    subject: `FM-CT-5 Training Monitoring & Evaluation: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>Training Monitoring and Evaluation Form (FM-CT-5) 📊</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>Six months ago, you attended <strong>${data.eventTitle}</strong> (${data.eventDate}).</p>
      <p>As part of DTI Region 7's training monitoring process, we need you to complete the <strong>FM-CT-5 Training Monitoring and Evaluation Form</strong>. This form measures how effectively the training was applied in your business operations.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/my-events/${data.participationId}/impact" class="btn">Complete FM-CT-5 Impact Survey →</a>
      </p>
      <p>The form covers:</p>
      <ul style="color:#555;font-size:13px">
        <li>Whether you applied the learnings from the training</li>
        <li>Benefit indicators (sales, profit, cost reduction, productivity, etc.)</li>
        <li>Additional assistance needs</li>
        <li>Training effectiveness assessment</li>
        <li>Knowledge application and business impact ratings</li>
      </ul>
      <p style="color:#999;font-size:12px">This survey will expire in 30 days. Your responses are confidential and help DTI improve future training programs.</p>
    `),
  };
}

// ── Enterprise Annual Profile Update Reminder ─────────────────────────────────

export interface EnterpriseUpdateReminderData {
  name: string;
  businessName: string;
  enterpriseId: string;
  year: number;
}

export function enterpriseUpdateReminder(data: EnterpriseUpdateReminderData): { subject: string; html: string } {
  return {
    subject: `Action Required: Annual Company Information Update for ${data.year} — ${data.businessName}`,
    html: baseLayout(`
      <h2 style="color:#172187">📋 Annual Company Information Update Required</h2>
      <p>Hello <strong>${data.name}</strong>,</p>
      <p>As the primary contact for <strong>${data.businessName}</strong>, you are required to review and update your company information in the DTI Region 7 Events Management System for <strong>${data.year}</strong>.</p>
      <div class="detail">
        <strong>Why is this needed?</strong><br>
        DTI Region 7 maintains accurate enterprise records to ensure that training programs, assistance, and reports reflect the current state of your business. An annual update ensures your company continues to receive relevant support.
      </div>
      <p>Please log in and update the following details:</p>
      <ul style="color:#555;font-size:13px">
        <li>Business name and registration details</li>
        <li>Contact information (email, phone, website)</li>
        <li>Business address</li>
        <li>Industry sector and business stage</li>
        <li>Employee count and revenue range</li>
      </ul>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/dashboard" class="btn">Update Company Information →</a>
      </p>
      <p style="color:#999;font-size:12px">This annual update is required by DTI Region 7. The update dialog will appear automatically when you log in. If you have questions, please contact your DTI Region 7 focal person.</p>
    `),
  };
}
