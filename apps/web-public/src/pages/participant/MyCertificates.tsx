import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import dtiLogo from '@/assets/dti-logo.jpg';

interface Certificate {
  id: string;
  participationId: string;
  verificationCode: string;
  status: string;
  issuedAt: string | null;
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
        <img src={dtiLogo} alt="DTI Logo" className="h-16 w-auto object-contain" />
        <div className="text-left">
          <p className="text-xs text-blue-800 font-semibold uppercase tracking-widest">Republic of the Philippines</p>
          <p className="text-sm font-bold text-blue-900">Department of Trade and Industry</p>
          <p className="text-xs text-blue-700">Regional Office VII – Central Visayas</p>
        </div>
      </div>

      <div className="border-t border-b border-blue-200 py-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-900 tracking-wide" style={{ fontVariant: 'small-caps' }}>
          Certificate of Completion
        </h1>
      </div>

      <p className="text-sm text-gray-600 mb-2">This is to certify that</p>
      <p className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-300 inline-block px-4 pb-1">
        {userName}
      </p>

      <p className="text-sm text-gray-600 mt-4 mb-2">has successfully completed the</p>
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
  });

  const certificates: Certificate[] = (data as { data?: Certificate[] })?.data ?? [];
  const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : 'Participant';

  function handlePrint(certId: string) {
    const el = document.getElementById(`cert-${certId}`);
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const styles = Array.from(document.styleSheets)
      .map(ss => {
        try {
          return Array.from(ss.cssRules).map(r => r.cssText).join('\n');
        } catch { return ''; }
      })
      .join('\n');
    w.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body { background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        ${styles}
      </style>
      </head><body>${el.outerHTML}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  async function handleDownloadPdf(cert: Certificate) {
    setDownloading(cert.id);
    try {
      await certificatesApi.downloadCertificatePdf(cert.participationId);
    } catch {
      alert('Failed to download PDF. Please try again.');
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
            Complete an event and your certificate will appear here once issued by the organizer.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {certificates.map(cert => (
            <div key={cert.id} className="space-y-3">
              <CertificatePrintView cert={cert} userName={userName} />
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => handlePrint(cert.id)}
                  className="btn-secondary text-sm"
                >
                  🖨️ Print / Preview
                </button>
                <button
                  onClick={() => handleDownloadPdf(cert)}
                  disabled={downloading === cert.id}
                  className="btn-primary text-sm"
                >
                  {downloading === cert.id ? 'Downloading…' : '⬇️ Download PDF'}
                </button>
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
