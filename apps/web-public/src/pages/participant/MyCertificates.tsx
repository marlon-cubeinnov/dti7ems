import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import dtiLogo from '@/assets/dti-bp-logo.png';

interface Certificate {
  id: string;
  participationId: string;
  verificationCode: string;
  status: string;
  issuedAt: string | null;
  appearanceEligible?: boolean;
  participation: {
    event: {
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      venue: string | null;
    };
  };
}

function CertificatePrintView({
  cert,
  userName,
}: {
  cert: Certificate;
  userName: string;
}) {
  const event = cert.participation.event;
  const dateRange = (() => {
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    if (start.toDateString() === end.toDateString()) return start.toLocaleDateString('en-PH', opts);
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}–${end.toLocaleDateString('en-PH', opts)}`;
    }
    return `${start.toLocaleDateString('en-PH', opts)} – ${end.toLocaleDateString('en-PH', opts)}`;
  })();

  return (
    <div
      id={`cert-${cert.id}`}
      className="bg-white border-[6px] border-double border-blue-800 rounded-2xl p-10 text-center shadow-lg max-w-2xl mx-auto print:shadow-none print:border-4"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <img src={dtiLogo} alt="DTI Bagong Pilipinas" className="h-16 w-auto object-contain" />
        <div className="text-left">
          <p className="text-xs text-blue-800 font-semibold uppercase tracking-widest">Republic of the Philippines</p>
          <p className="text-sm font-bold text-blue-900">Department of Trade and Industry</p>
          <p className="text-xs text-blue-700">Regional Office VII – Central Visayas</p>
        </div>
      </div>

      <div className="border-t border-b border-blue-200 py-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-900 tracking-wide" style={{ fontVariant: 'small-caps' }}>
          Certificate of Attendance
        </h1>
      </div>

      <p className="text-sm text-gray-600 mb-2">This is to certify that</p>
      <p className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-300 inline-block px-4 pb-1">
        {userName}
      </p>

      <p className="text-sm text-gray-600 mt-4 mb-2">has successfully attended the</p>
      <p className="text-xl font-semibold text-blue-800 mb-2">{event.title}</p>
      {event.venue && <p className="text-sm text-gray-500 mb-1">{event.venue}</p>}
      <p className="text-sm text-gray-500 mb-6">{dateRange}</p>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end">
        <div className="text-left">
          <div className="w-40 border-t border-gray-400 mt-8 pt-1">
            <p className="text-xs text-gray-500">Regional Director</p>
            <p className="text-xs text-gray-400">DTI Region VII</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">Verification Code</p>
          <p className="text-xs font-mono font-bold text-gray-600 tracking-widest">{cert.verificationCode}</p>
          {cert.issuedAt && (
            <p className="text-[10px] text-gray-400 mt-1">
              Issued: {new Date(cert.issuedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MyCertificatesPage() {
  const user = useAuthStore((s) => s.user);
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificatesApi.getMyCertificates(),
    staleTime: 0,
  });

  const certificates: Certificate[] = (data as { data?: Certificate[] })?.data ?? [];
  const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : 'Participant';

  function handlePrint(cert: Certificate) {
    const w = window.open('', '_blank');
    if (!w) return;

    const event = cert.participation.event;
    const start = new Date(event.startDate);
    const end   = new Date(event.endDate);
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateRange = start.toDateString() === end.toDateString()
      ? start.toLocaleDateString('en-PH', opts)
      : `${start.toLocaleDateString('en-PH', opts)} – ${end.toLocaleDateString('en-PH', opts)}`;
    const issuedDate = cert.issuedAt
      ? new Date(cert.issuedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;
    const logoUrl = `${window.location.origin}${dtiLogo}`;

    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Certificate of Attendance</title>
  <meta charset="utf-8">
  <style>
    @page { size: A4 landscape; margin: 6mm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100%;
      background: white;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .page {
      width: 100%; height: 100%;
      position: relative;
      border: 3.5pt double #1e3a8a;
      padding: 8mm 11mm;
      display: flex; flex-direction: column;
      align-items: center; justify-content: space-between;
    }
    /* Thin accent line just inside the outer double border */
    .page::before {
      content: '';
      position: absolute;
      inset: 3.5mm;
      border: 0.75pt solid #bfdbfe;
      pointer-events: none;
    }
    .header {
      display: flex; align-items: center; gap: 10pt; justify-content: center;
      width: 100%;
    }
    .header img { height: 44pt; width: auto; object-fit: contain; }
    .header-text { text-align: left; }
    .header-text .republic { font-size: 7pt; color: #1e40af; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5pt; }
    .header-text .dept { font-size: 11pt; font-weight: bold; color: #1e3a8a; }
    .header-text .region { font-size: 7.5pt; color: #1d4ed8; }
    .title-bar {
      border-top: 0.75pt solid #93c5fd; border-bottom: 0.75pt solid #93c5fd;
      padding: 5pt 0; text-align: center; width: 100%;
    }
    .title-bar h1 { font-size: 30pt; font-weight: bold; color: #1e3a8a; font-variant: small-caps; letter-spacing: 3pt; }
    .body { text-align: center; }
    .certify-text { font-size: 10.5pt; color: #6b7280; margin-bottom: 6pt; font-style: italic; }
    .recipient {
      font-size: 28pt; font-weight: bold; color: #111827;
      border-bottom: 2pt solid #3b82f6;
      display: inline-block; padding: 0 24pt 4pt;
    }
    .event-label { font-size: 10pt; color: #6b7280; margin-top: 8pt; margin-bottom: 4pt; }
    .event-title { font-size: 14.5pt; font-weight: 600; color: #1e40af; }
    .venue { font-size: 8.5pt; color: #9ca3af; margin-top: 3pt; }
    .dates { font-size: 8.5pt; color: #9ca3af; margin-top: 2pt; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
    .sig-block { text-align: center; }
    .sig-line { border-top: 0.75pt solid #9ca3af; width: 100pt; padding-top: 4pt; margin-top: 26pt; }
    .sig-name { font-size: 8pt; font-weight: bold; color: #374151; }
    .sig-title { font-size: 7pt; color: #6b7280; }
    .verify-block { text-align: right; }
    .verify-label { font-size: 6pt; color: #9ca3af; text-transform: uppercase; letter-spacing: 1pt; }
    .verify-code { font-family: 'Courier New', monospace; font-size: 8pt; font-weight: bold; color: #4b5563; letter-spacing: 2pt; margin-top: 2pt; }
    .issued-date { font-size: 6pt; color: #9ca3af; margin-top: 2pt; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="${logoUrl}" alt="DTI Bagong Pilipinas">
      <div class="header-text">
        <p class="republic">Republic of the Philippines</p>
        <p class="dept">Department of Trade and Industry</p>
        <p class="region">Regional Office VII \u2013 Central Visayas</p>
      </div>
    </div>
    <div class="title-bar">
      <h1>Certificate of Attendance</h1>
    </div>
    <div class="body">
      <p class="certify-text">This is to certify that</p>
      <p class="recipient">${userName}</p>
      <p class="event-label">has successfully attended the</p>
      <p class="event-title">${event.title}</p>
      ${event.venue ? `<p class="venue">${event.venue}</p>` : ''}
      <p class="dates">${dateRange}</p>
    </div>
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line">
          <p class="sig-name">Regional Director</p>
          <p class="sig-title">DTI Region VII</p>
        </div>
      </div>
      <div class="verify-block">
        <p class="verify-label">Verification Code</p>
        <p class="verify-code">${cert.verificationCode}</p>
        ${issuedDate ? `<p class="issued-date">Issued: ${issuedDate}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  async function handleDownloadPdf(cert: Certificate) {
    setDownloading(`${cert.id}:attendance`);
    try {
      await certificatesApi.downloadCertificatePdf(cert.participationId);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadAppearancePdf(cert: Certificate) {
    setDownloading(`${cert.id}:appearance`);
    try {
      await certificatesApi.downloadAppearanceCertificatePdf(cert.participationId);
    } catch {
      alert('Failed to download Certificate of Appearance. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  if (isLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading certificates…</div>;
  }

  return (
    <div className="space-y-6" ref={printRef}>
      <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">No certificates yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete an event and your certificate will appear here once issued by the facilitator.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {certificates.map(cert => (
            <div key={cert.id} className="space-y-3">
              <CertificatePrintView cert={cert} userName={userName} />
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => handlePrint(cert)}
                  className="btn-secondary text-sm"
                >
                  🖨️ Print / Preview
                </button>
                <button
                  onClick={() => handleDownloadPdf(cert)}
                  disabled={downloading === `${cert.id}:attendance`}
                  className="btn-primary text-sm"
                >
                  {downloading === `${cert.id}:attendance` ? 'Downloading…' : '⬇️ Download Attendance PDF'}
                </button>
                {cert.appearanceEligible && (
                  <button
                    onClick={() => handleDownloadAppearancePdf(cert)}
                    disabled={downloading === `${cert.id}:appearance`}
                    className="btn-secondary text-sm"
                  >
                    {downloading === `${cert.id}:appearance` ? 'Downloading…' : '⬇️ Download Appearance PDF'}
                  </button>
                )}
                <a
                  href={`/verify/${cert.verificationCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm"
                >
                  Verify Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
