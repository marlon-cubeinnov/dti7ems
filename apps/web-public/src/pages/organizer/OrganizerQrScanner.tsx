import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, ApiError } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';

type EventParticipant = {
  id: string;
  participantName?: string | null;
  participantEmail?: string | null;
  status?: string;
};

export function OrganizerQrScannerPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  const [sessionId, setSessionId]     = useState('');
  const [cameraOn, setCameraOn]       = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lastResult, setLastResult]   = useState<{ ok: boolean; message: string } | null>(null);
  const [successNotice, setSuccessNotice] = useState<{ message: string; at: string } | null>(null);
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

  // ── Participants for name-based manual lookup ────────────────────────────
  const [manualQuery, setManualQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<EventParticipant | null>(null);
  const { data: participantsData, isFetching: participantsLoading } = useQuery({
    queryKey: ['event-participants-for-scan', eventId],
    queryFn: () => organizerApi.getParticipants(eventId!, { page: 1, limit: 200 }),
    enabled: !!eventId,
  });
  const participants: EventParticipant[] = (participantsData as { data?: EventParticipant[] })?.data ?? [];
  const manualMatches = useMemo(() => {
    const q = manualQuery.trim().toLowerCase();
    if (!q) return [];
    return participants
      .filter(p => p.status !== 'CANCELLED')
      .filter((p) => {
        const name = (p.participantName ?? '').toLowerCase();
        const email = (p.participantEmail ?? '').toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .slice(0, 8);
  }, [manualQuery, participants]);

  // ── Scan mutation ─────────────────────────────────────────────────────────
  const scanMut = useMutation({
    mutationFn: (token: string) => organizerApi.scanQr(token, sessionId),
    onSuccess: (res) => {
      const r = res as { message?: string };
      setLastResult({ ok: true, message: r.message ?? 'Attendance recorded!' });
      setSuccessNotice({ message: r.message ?? 'Attendance recorded!', at: new Date().toLocaleTimeString() });
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
  const manualMut = useMutation({
    mutationFn: () => organizerApi.manualCheckin(selectedParticipant!.id, sessionId),
    onSuccess: (res) => {
      const r = res as { message?: string };
      setLastResult({ ok: true, message: r.message ?? 'Manual check-in recorded!' });
      setSuccessNotice({ message: r.message ?? 'Manual check-in recorded!', at: new Date().toLocaleTimeString() });
      setManualQuery('');
      setSelectedParticipant(null);
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
            onChange={e => {
              setSessionId(e.target.value);
              setLastResult(null);
              setSuccessNotice(null);
            }}
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

      {/* Explicit successful scan confirmation */}
      {successNotice && (
        <div className="rounded-xl border border-green-300 bg-green-100 p-4">
          <p className="text-sm font-semibold text-green-900">Scan confirmed</p>
          <p className="text-sm text-green-800">{successNotice.message}</p>
          <p className="text-xs text-green-700 mt-1">Recorded at {successNotice.at}</p>
        </div>
      )}

      {/* Manual Check-in fallback */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">Manual Check-in</h2>
        <p className="text-xs text-gray-500">Type participant name or email, select a match, then check them in.</p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search participant name or email"
            value={manualQuery}
            onChange={e => {
              const v = e.target.value;
              setManualQuery(v);
              setSelectedParticipant(null);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {participantsLoading && (
            <p className="text-xs text-gray-500">Loading participant list…</p>
          )}

          {manualQuery.trim() && !participantsLoading && manualMatches.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              No matching participant found.
            </p>
          )}

          {manualMatches.length > 0 && (
            <div className="max-h-56 overflow-auto border border-gray-200 rounded-lg divide-y">
              {manualMatches.map((p) => {
                const isSelected = selectedParticipant?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedParticipant(p)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <p className="font-medium text-gray-800">{p.participantName ?? p.participantEmail ?? 'Participant'}</p>
                    <p className="text-xs text-gray-500">{p.participantEmail ?? 'No email'} • {p.status ?? 'UNKNOWN'}</p>
                  </button>
                );
              })}
            </div>
          )}

          {selectedParticipant && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2">
              Selected: {selectedParticipant.participantName ?? selectedParticipant.participantEmail ?? 'Participant'}
            </p>
          )}

          <div className="flex justify-end">
          <button
            onClick={() => manualMut.mutate()}
            disabled={!selectedParticipant || !sessionId || manualMut.isPending}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
          >
            {manualMut.isPending ? 'Checking in…' : 'Check In'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
