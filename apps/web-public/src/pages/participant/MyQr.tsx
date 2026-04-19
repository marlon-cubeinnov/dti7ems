import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { participantApi, ApiError } from '@/lib/api';

interface QrData {
  qrImage: string;
}

export function MyQrPage() {
  const { participationId } = useParams<{ participationId: string }>();

  // Get participation info
  const { data: partData, isLoading: partLoading } = useQuery({
    queryKey: ['participation', participationId],
    queryFn: () => participantApi.getParticipation(participationId!),
    enabled: !!participationId,
  });

  const participation = (partData as { data?: any })?.data;

  // Permanent QR — fetch once, never re-fetch
  const {
    data: qrData,
    isLoading: qrLoading,
    isError: qrError,
    error: qrErrorObj,
  } = useQuery({
    queryKey: ['qr-code', participationId],
    queryFn: () => participantApi.getQrCode(participationId!),
    enabled: !!participationId && ['RSVP_CONFIRMED', 'ATTENDED'].includes(participation?.status ?? ''),
    staleTime: Infinity,
  });

  const qr: QrData | undefined = (qrData as { data?: QrData })?.data;
  const qrErrorMsg = qrError ? (qrErrorObj instanceof ApiError ? qrErrorObj.message : 'Failed to get QR code') : null;

  if (partLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading…</div>;
  }

  if (!participation) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">Participation not found.</p>
        <Link to="/my-events" className="text-blue-600 text-sm mt-2 inline-block">← Back to My Events</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/my-events" className="text-blue-600 hover:underline text-sm">← My Events</Link>
        <h1 className="text-xl font-bold text-gray-900">My Attendance QR</h1>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-gray-800">{participation.event?.title}</h2>
        <p className="text-sm text-gray-500">
          {participation.event?.startDate
            ? new Date(participation.event.startDate).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            : ''}
        </p>
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          participation.status === 'RSVP_CONFIRMED' ? 'bg-green-100 text-green-700' :
          participation.status === 'ATTENDED' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {participation.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* QR Code Display */}
      <div className="card flex flex-col items-center space-y-4">
        {qrLoading && <p className="text-gray-400 text-sm">Generating QR code…</p>}

        {qrErrorMsg && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 w-full text-center">{qrErrorMsg}</p>
        )}

        {qr && (
          <>
            <img
              src={qr.qrImage}
              alt="Attendance QR Code"
              className="w-64 h-64 object-contain rounded-lg border border-gray-200 shadow"
            />
            <p className="text-xs text-gray-500 text-center">
              Show this to the facilitator for scanning.<br />
              This is your permanent personal QR code.
            </p>
          </>
        )}
      </div>

      {!['RSVP_CONFIRMED', 'ATTENDED'].includes(participation.status) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Your RSVP must be confirmed to get an attendance QR code. Please confirm your RSVP first.
        </div>
      )}
    </div>
  );
}
