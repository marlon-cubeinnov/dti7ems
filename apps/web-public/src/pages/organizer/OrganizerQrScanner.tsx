import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, ApiError } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';

export function OrganizerQrScannerPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const [sessionId, setSessionId]     = useState('');
  const [cameraOn, setCameraOn]       = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastResult, setLastResult]   = useState<{ ok: boolean; message: string } | null>(null);
  const [processing, setProcessing]   = useState(false);
  const processingRef = useRef(false);

  // ── Sessions list ─────────────────────────────────────────────────────────
  const { data: sessionsData } = useQuery({
    queryKey: ['event-sessions', eventId],
    queryFn: () => organizerApi.getEventSessions(eventId!),
    enabled: !!eventId,
  });
  const sessions: { id: string; title: string; startTime: string }[] =
    (sessionsData as { data?: typeof sessions })?.data ?? [];

  // ── Scan mutation ─────────────────────────────────────────────────────────
  const scanMut = useMutation({
    mutationFn: (token: string) => organizerApi.scanQr(token, sessionId),
    onSuccess: (res) => {
      const r = res as { message?: string };
      setLastResult({ ok: true, message: r.message ?? 'Attendance recorded!' });
      void qc.invalidateQueries({ queryKey: ['event-attendance', eventId] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Scan failed';
      setLastResult({ ok: false, message: msg });
    },
    onSettled: () => {
      setProcessing(false);
      processingRef.current = false;
    },
  });

  // ── Manual check-in mutation ──────────────────────────────────────────────
  const [manualParticipationId, setManualParticipationId] = useState('');
  const manualMut = useMutation({
    mutationFn: () => organizerApi.manualCheckin(manualParticipationId.trim(), sessionId),
    onSuccess: (res) => {
      const r = res as { message?: string };
      setLastResult({ ok: true, message: r.message ?? 'Manual check-in recorded!' });
      setManualParticipationId('');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Check-in failed';
      setLastResult({ ok: false, message: msg });
    },
  });

  // ── QR decode callback ────────────────────────────────────────────────────
  const onQrDetected = useCallback((decodedText: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    scanMut.mutate(decodedText);
  }, [scanMut]);

  // ── Camera start/stop ─────────────────────────────────────────────────────
  async function startCamera() {
    setCameraError('');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/organizer/events/${eventId}`} className="text-blue-600 hover:underline text-sm">
          ← Back to event
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">QR Attendance Scanner</h1>
      </div>

      {/* Session Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Session to Mark Attendance
        </label>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No sessions found for this event. Add sessions first.</p>
        ) : (
          <select
            value={sessionId}
            onChange={e => { setSessionId(e.target.value); setLastResult(null); }}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— select a session —</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({new Date(s.startTime).toLocaleString()})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Camera Scanner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Camera Scanner</h2>

        {!sessionId && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
            Please select a session before scanning.
          </p>
        )}

        {cameraError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{cameraError}</p>
        )}

        <div id={scannerContainerId} className="rounded-lg overflow-hidden" />

        <div className="flex gap-3">
          <button
            onClick={startCamera}
            disabled={!sessionId || cameraOn}
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

        {processing && (
          <p className="text-sm text-gray-500 animate-pulse">Processing scan…</p>
        )}
      </div>

      {/* Scan Result */}
      {lastResult && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            lastResult.ok
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {lastResult.ok ? '✅ ' : '❌ '}{lastResult.message}
        </div>
      )}

      {/* Manual Check-in fallback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">Manual Check-in</h2>
        <p className="text-xs text-gray-500">Enter a participant's Participation ID to manually record attendance.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Participation ID"
            value={manualParticipationId}
            onChange={e => setManualParticipationId(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => manualMut.mutate()}
            disabled={!manualParticipationId.trim() || !sessionId || manualMut.isPending}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
          >
            {manualMut.isPending ? 'Checking in…' : 'Check In'}
          </button>
        </div>
      </div>
    </div>
  );
}
