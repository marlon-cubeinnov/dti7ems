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
      <p style="color:#999;font-size:12px">This survey will expire in 14 days.</p>
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

export interface ImpactSurveyInviteData {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  participationId: string;
}

export function impactSurveyInvite(data: ImpactSurveyInviteData): { subject: string; html: string } {
  return {
    subject: `6-Month Impact Survey: ${data.eventTitle}`,
    html: baseLayout(`
      <h2>How did the training impact you? 📊</h2>
      <p>Hello <strong>${data.participantName}</strong>,</p>
      <p>Six months ago, you attended <strong>${data.eventTitle}</strong> (${data.eventDate}).</p>
      <p>We'd love to know how the training has impacted your work. This brief survey helps DTI Region 7 measure program effectiveness and improve future initiatives.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${FRONTEND_URL}/my-events/${data.participationId}/impact" class="btn">Complete Impact Survey →</a>
      </p>
      <p>The survey covers:</p>
      <ul style="color:#555;font-size:13px">
        <li>Knowledge application in your work</li>
        <li>Skill improvement since the training</li>
        <li>Business impact &amp; growth metrics</li>
        <li>Your success story</li>
      </ul>
      <p style="color:#999;font-size:12px">This survey will expire in 30 days. Your responses are confidential.</p>
    `),
  };
}
