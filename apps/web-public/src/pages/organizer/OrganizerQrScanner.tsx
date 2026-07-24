import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, ApiError } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';

type EventParticipant = {
  id: string;
  userId?: string;
  participantName?: string | null;
  participantEmail?: string | null;
  status?: string;
};

type CheckinConfirmation = {
  /** For QR flow: the raw token to submit */
  token?: string;
  /** For manual flow: the participation to submit */
  participation?: EventParticipant;
  /** Resolved display name */
  name: string;
  /** Resolved display email */
  email: string;
  /** 'qr' | 'manual' */
  mode: 'qr' | 'manual';
};

/** Decode the userId embedded in a permanent QR token without verifying the HMAC. */
function decodeQrUserId(token: string): string | null {
  try {
    // Token is base64url-encoded JSON — normalize to standard base64 first
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const parsed = JSON.parse(json) as { userId?: string };
    return parsed.userId ?? null;
  } catch {
    return null;
  }
}

export function OrganizerQrScannerPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const [cameraOn, setCameraOn]       = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastResult, setLastResult]   = useState<{ ok: boolean; name?: string; message: string } | null>(null);
  const [processing, setProcessing]   = useState(false);
  const processingRef = useRef(false);

  // Pending confirmation — shown before the API call is made
  const [pending, setPending] = useState<CheckinConfirmation | null>(null);

  // ── Participants for name-based manual lookup ────────────────────────────
  const [manualQuery, setManualQuery] = useState('');
  const { data: participantsData, isFetching: participantsLoading } = useQuery({
    queryKey: ['event-participants-for-scan', eventId],
    queryFn: () => organizerApi.getParticipants(eventId!, { page: 1, limit: 200 }),
    enabled: !!eventId,
  });
  const participants: EventParticipant[] = (participantsData as { data?: EventParticipant[] })?.data ?? [];

  // Map userId → participant for QR lookup
  const participantByUserId = useMemo(() => {
    const map = new Map<string, EventParticipant>();
    for (const p of participants) {
      if (p.userId) map.set(p.userId, p);
    }
    return map;
  }, [participants]);

  const activeParticipantCount = useMemo(
    () => participants.filter(p => p.status !== 'CANCELLED').length,
    [participants],
  );

  const manualSearch = useMemo(() => {
    const q = manualQuery.trim().toLowerCase();
    if (!q) return { items: [] as EventParticipant[], total: 0 };
    const all = participants
      .filter(p => p.status !== 'CANCELLED')
      .filter((p) => {
        const name  = (p.participantName  ?? '').toLowerCase();
        const email = (p.participantEmail ?? '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    return { items: all.slice(0, 10), total: all.length };
  }, [manualQuery, participants]);

  // ── Scan mutation ─────────────────────────────────────────────────────────
  const scanMut = useMutation({
    mutationFn: (token: string) => organizerApi.scanQr(token, eventId!),
    onSuccess: (res) => {
      const r = res as { data?: { participantName?: string | null; participantEmail?: string | null }; message?: string };
      const name = r.data?.participantName ?? r.data?.participantEmail ?? 'Participant';
      setLastResult({ ok: true, name, message: r.message ?? 'Attendance recorded!' });
      void qc.invalidateQueries({ queryKey: ['event-attendance', eventId] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Scan failed';
      setLastResult({ ok: false, message: msg });
    },
    onSettled: () => {
      setPending(null);
      setProcessing(false);
      processingRef.current = false;
    },
  });

  // ── Manual check-in mutation ──────────────────────────────────────────────
  const manualMut = useMutation({
    mutationFn: (participationId: string) => organizerApi.manualCheckin(participationId),
    onSuccess: (res) => {
      const r = res as { data?: { participantName?: string | null; participantEmail?: string | null }; message?: string };
      const name = r.data?.participantName ?? r.data?.participantEmail ?? 'Participant';
      setLastResult({ ok: true, name, message: r.message ?? 'Manual check-in recorded!' });
      setManualQuery('');
      void qc.invalidateQueries({ queryKey: ['event-attendance', eventId] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Check-in failed';
      setLastResult({ ok: false, message: msg });
    },
    onSettled: () => {
      setPending(null);
    },
  });

  // ── QR decode callback — shows confirmation before submitting ─────────────
  const onQrDetected = useCallback((decodedText: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    // Try to resolve participant name from the preloaded list
    const userId = decodeQrUserId(decodedText);
    const found = userId ? participantByUserId.get(userId) : undefined;

    setPending({
      token: decodedText,
      name:  found?.participantName ?? found?.participantEmail ?? 'Unknown participant',
      email: found?.participantEmail ?? '',
      mode:  'qr',
    });
  }, [participantByUserId]);

  function confirmCheckin() {
    if (!pending) return;
    setProcessing(true);
    if (pending.mode === 'qr' && pending.token) {
      scanMut.mutate(pending.token);
    } else if (pending.mode === 'manual' && pending.participation) {
      manualMut.mutate(pending.participation.id);
    }
  }

  function cancelPending() {
    setPending(null);
    processingRef.current = false;
    setProcessing(false);
  }

  // ── Camera start/stop ─────────────────────────────────────────────────────
  async function startCamera() {
    setCameraError('');
    setLastResult(null);
    setPending(null);
    processingRef.current = false;
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        onQrDetected,
        () => {},
      );
      setCameraOn(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (msg.includes('NotFoundError')) {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Camera error: ${msg}`);
      }
    }
  }

  async function stopCamera() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch { /* already stopped */ }
    setCameraOn(false);
  }

  useEffect(() => {
    return () => {
      try { scannerRef.current?.stop(); } catch { /* cleanup */ }
    };
  }, []);

  const isBusy = scanMut.isPending || manualMut.isPending || processing;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/organizer/events/${eventId}`} className="text-blue-600 hover:underline text-sm">
          ← Back to event
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">QR Attendance Scanner</h1>
      </div>

      {/* ── QR Confirmation overlay ─────────────────────────────────────────── */}
      {pending && (
        <div className="rounded-xl border-2 border-blue-400 bg-blue-50 p-5 space-y-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
              {pending.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">
                {pending.mode === 'qr' ? 'QR Code Detected' : 'Manual Check-in'}
              </p>
              <p className="text-lg font-bold text-gray-900">{pending.name}</p>
              {pending.email && (
                <p className="text-sm text-gray-500">{pending.email}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Confirm attendance check-in for this participant?
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmCheckin}
              disabled={isBusy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-40 transition-colors"
            >
              {isBusy ? 'Recording…' : 'Confirm Check-in'}
            </button>
            <button
              onClick={cancelPending}
              disabled={isBusy}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {pending.mode === 'qr' ? 'Rescan' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ── Last check-in result ─────────────────────────────────────────────── */}
      {lastResult && !pending && (
        <div
          className={`rounded-xl border p-4 space-y-1 ${
            lastResult.ok
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          {lastResult.ok ? (
            <>
              <p className="text-base font-bold text-green-800">✅ Check-in confirmed</p>
              {lastResult.name && (
                <p className="text-lg font-semibold text-green-900">{lastResult.name}</p>
              )}
              <p className="text-sm text-green-700">{lastResult.message}</p>
              <p className="text-xs text-green-600">Recorded at {new Date().toLocaleTimeString()}</p>
            </>
          ) : (
            <p className="text-sm font-medium text-red-800">❌ {lastResult.message}</p>
          )}
        </div>
      )}

      {/* ── Camera Scanner ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Scan QR Code</h2>

        {cameraError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{cameraError}</p>
        )}

        <div id={scannerContainerId} className="rounded-lg overflow-hidden" />

        <div className="flex gap-3">
          <button
            onClick={startCamera}
            disabled={cameraOn || !!pending}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
          >
            Start Camera
          </button>
          <button
            onClick={stopCamera}
            disabled={!cameraOn}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-40"
          >
            Stop Camera
          </button>
        </div>

        {cameraOn && !pending && (
          <p className="text-xs text-gray-500">Point camera at participant's QR code. A confirmation will appear before recording.</p>
        )}
      </div>

      {/* ── Manual Check-in ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">Manual Check-in</h2>
        <p className="text-xs text-gray-500">Type a participant name or email to search, then select to check them in.</p>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search participant name or email…"
            value={manualQuery}
            onChange={e => setManualQuery(e.target.value)}
            disabled={!!pending}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />

          {participantsLoading && (
            <p className="text-xs text-gray-500">Loading participant list…</p>
          )}

          {/* Pool-size hint when input is empty */}
          {!manualQuery.trim() && !participantsLoading && activeParticipantCount > 0 && (
            <p className="text-xs text-gray-400">
              {activeParticipantCount} registered participant{activeParticipantCount !== 1 ? 's' : ''} — type to search
            </p>
          )}

          {manualQuery.trim() && !participantsLoading && manualSearch.total === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              No matching participant found.
            </p>
          )}

          {manualSearch.items.length > 0 && !pending && (
            <>
              {manualSearch.total > manualSearch.items.length && (
                <p className="text-xs text-gray-400">
                  Showing {manualSearch.items.length} of {manualSearch.total} matches — refine your search
                </p>
              )}
              <div className="max-h-64 overflow-auto border border-gray-200 rounded-lg divide-y">
                {manualSearch.items.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setLastResult(null);
                      setPending({
                        participation: p,
                        name:  p.participantName ?? p.participantEmail ?? 'Participant',
                        email: p.participantEmail ?? '',
                        mode:  'manual',
                      });
                      setManualQuery('');
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 disabled:opacity-40 transition-colors"
                  >
                    <p className="font-medium text-gray-800">{p.participantName ?? p.participantEmail ?? 'Participant'}</p>
                    <p className="text-xs text-gray-500">{p.participantEmail ?? 'No email'} · {p.status ?? 'UNKNOWN'}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
