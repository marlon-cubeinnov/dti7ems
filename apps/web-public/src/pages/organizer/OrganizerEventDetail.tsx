import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, eventsApi, certificatesApi, ApiError, type EventStatus } from '@/lib/api';
import { ArrowLeft, Pencil, QrCode, Plus, Trash2, ClipboardList, BarChart3, Users, Award, FileText } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:               'bg-gray-100 text-gray-600',
  PUBLISHED:           'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN:   'bg-green-100 text-green-700',
  REGISTRATION_CLOSED: 'bg-yellow-100 text-yellow-700',
  ONGOING:             'bg-purple-100 text-purple-700',
  COMPLETED:           'bg-teal-100 text-teal-700',
  CANCELLED:           'bg-red-100 text-red-600',
};

const TRANSITIONS: Record<string, EventStatus[]> = {
  DRAFT:               ['PUBLISHED', 'CANCELLED'],
  PUBLISHED:           ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN:   ['REGISTRATION_CLOSED', 'ONGOING', 'CANCELLED'],
  REGISTRATION_CLOSED: ['ONGOING', 'CANCELLED'],
  ONGOING:             ['COMPLETED', 'CANCELLED'],
  COMPLETED:           [],
  CANCELLED:           [],
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  PUBLISHED:           'Publish',
  CANCELLED:           'Cancel',
  REGISTRATION_OPEN:   'Open Registration',
  REGISTRATION_CLOSED: 'Close Registration',
  ONGOING:             'Mark Ongoing',
  COMPLETED:           'Mark Complete',
  DRAFT:               'Revert to Draft',
};

const PARTICIPATION_STATUS_COLORS: Record<string, string> = {
  REGISTERED:   'bg-blue-50 text-blue-700',
  WAITLISTED:   'bg-yellow-50 text-yellow-700',
  CONFIRMED:    'bg-green-50 text-green-700',
  ATTENDED:     'bg-teal-50 text-teal-700',
  NO_SHOW:      'bg-red-50 text-red-600',
  CANCELLED:    'bg-gray-50 text-gray-500',
};

export function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusError, setStatusError] = useState('');

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  const { data: participantsData, isLoading: partLoading } = useQuery({
    queryKey: ['event-participants', id],
    queryFn: () => organizerApi.getParticipants(id!, { limit: 100 }),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: EventStatus) => organizerApi.updateStatus(id!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['organizer-events'] });
      qc.invalidateQueries({ queryKey: ['organizer-events-all'] });
      setStatusError('');
    },
    onError: (err) => {
      setStatusError(err instanceof ApiError ? err.message : 'Failed to update status.');
    },
  });

  const [certMsg, setCertMsg] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', startTime: '', endTime: '', venue: '', speakerName: '' });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['event-sessions', id],
    queryFn: () => organizerApi.getEventSessions(id!),
    enabled: Boolean(id),
  });
  const sessions: any[] = (sessionsData as { data?: any[] })?.data ?? [];

  const addSessionMut = useMutation({
    mutationFn: () => organizerApi.createSession(id!, {
      ...newSession,
      startTime: new Date(newSession.startTime).toISOString(),
      endTime:   new Date(newSession.endTime).toISOString(),
      orderIndex: sessions.length,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-sessions', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      setNewSession({ title: '', startTime: '', endTime: '', venue: '', speakerName: '' });
      setShowAddSession(false);
      setSessionMsg('Session added.');
    },
    onError: (err) => setSessionMsg(err instanceof ApiError ? err.message : 'Failed to add session.'),
  });

  const deleteSessionMut = useMutation({
    mutationFn: (sessionId: string) => organizerApi.deleteSession(id!, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-sessions', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      setSessionMsg('Session removed.');
    },
    onError: (err) => setSessionMsg(err instanceof ApiError ? err.message : 'Failed to delete session.'),
  });
  const bulkCertMut = useMutation({
    mutationFn: () => certificatesApi.bulkIssueCertificates(id!),
    onSuccess: (res) => {
      const r = res as { data?: { issued: number }; message?: string };
      setCertMsg(r.message ?? `${r.data?.issued ?? 0} certificate(s) issued.`);
      qc.invalidateQueries({ queryKey: ['event-participants', id] });
    },
    onError: (err) => {
      setCertMsg(err instanceof ApiError ? err.message : 'Failed to issue certificates.');
    },
  });

  const event = eventData?.data as any;
  const participants: any[] = (participantsData?.data as any) ?? [];
  const meta: any = (participantsData as any)?.meta ?? {};
  const total: number = meta.total ?? participants.length;

  // Derived attendance stats from participants list
  const attended = participants.filter(p => ['ATTENDED', 'COMPLETED'].includes(p.status)).length;

  if (eventLoading) {
    return <div className="card text-center py-16 text-gray-400">Loading event…</div>;
  }

  if (!event) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/organizer/events" className="text-dti-blue text-sm mt-2 inline-block">← Back to events</Link>
      </div>
    );
  }

  const transitions = TRANSITIONS[event.status] ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mt-1">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(event.startDate).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              {event.venue ? ` · ${event.venue}` : ''}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[event.status] ?? ''}`}>
          {event.status.replace(/_/g, ' ')}
        </span>
      </div>

      {statusError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-input px-4 py-3">
          {statusError}
        </div>
      )}

      {certMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-input px-4 py-3">
          {certMsg}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to={`/organizer/events/${id}/edit`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Pencil size={18} className="text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Edit Event</span>
        </Link>
        <Link to={`/organizer/events/${id}/participants`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-green-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <Users size={18} className="text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Participants</span>
        </Link>
        <Link to={`/organizer/events/${id}/scan`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-purple-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <QrCode size={18} className="text-purple-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">QR / Check-In</span>
        </Link>
        <Link to={`/organizer/events/${id}/checklist`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <ClipboardList size={18} className="text-orange-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Checklist</span>
        </Link>
        <Link to={`/organizer/events/${id}/report`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
            <BarChart3 size={18} className="text-teal-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Report</span>
        </Link>
        {event.status === 'COMPLETED' && (
          <Link to={`/organizer/events/${id}/csf-results`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
              <FileText size={18} className="text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">CSF Results</span>
          </Link>
        )}
      </div>

      {/* Certificate & Status Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {attended > 0 && (
          <button
            onClick={() => bulkCertMut.mutate()}
            disabled={bulkCertMut.isPending}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <Award size={14} /> {bulkCertMut.isPending ? 'Issuing…' : 'Issue Certificates'}
          </button>
        )}
        {transitions.length > 0 && (
          <>
            <span className="text-sm text-gray-500 font-medium">Move to:</span>
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => statusMutation.mutate(s)}
                disabled={statusMutation.isPending}
                className={`btn-secondary text-sm ${s === 'CANCELLED' ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}`}
              >
                {STATUS_ACTION_LABELS[s] ?? s.replace(/_/g, ' ')}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Event details */}
      <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Mode',     value: event.deliveryMode?.replace(/_/g, ' ') },
          { label: 'Capacity', value: event.maxParticipants ?? 'Unlimited' },
          { label: 'Sector',   value: event.targetSector ?? '—' },
          { label: 'Region',   value: event.targetRegion ?? '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="font-medium text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Attendance overview */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Total Registered', value: total, color: 'text-blue-600' },
          { label: 'Attended', value: attended, color: 'text-green-600' },
          { label: 'Attendance Rate', value: total > 0 ? `${Math.round((attended / total) * 100)}%` : '—', color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">
            Sessions <span className="text-gray-500 font-normal text-sm">({sessions.length})</span>
          </h2>
          <button
            onClick={() => { setShowAddSession(s => !s); setSessionMsg(''); }}
            className="flex items-center gap-1 text-sm text-dti-blue hover:underline"
          >
            <Plus size={14} /> Add Session
          </button>
        </div>

        {sessionMsg && (
          <p className={`text-sm px-4 py-2 ${sessionMsg.startsWith('Failed') || sessionMsg.startsWith('Cannot') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>
            {sessionMsg}
          </p>
        )}

        {showAddSession && (
          <div className="px-4 py-3 border-b bg-blue-50 space-y-3">
            <p className="text-sm font-medium text-blue-800">New Session</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                placeholder="Session title *"
                value={newSession.title}
                onChange={e => setNewSession(s => ({ ...s, title: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Venue (optional)"
                value={newSession.venue}
                onChange={e => setNewSession(s => ({ ...s, venue: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start *</label>
                <input
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={e => setNewSession(s => ({ ...s, startTime: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End *</label>
                <input
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={e => setNewSession(s => ({ ...s, endTime: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                placeholder="Speaker name (optional)"
                value={newSession.speakerName}
                onChange={e => setNewSession(s => ({ ...s, speakerName: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addSessionMut.mutate()}
                disabled={addSessionMut.isPending || !newSession.title || !newSession.startTime || !newSession.endTime}
                className="btn-primary text-sm"
              >
                {addSessionMut.isPending ? 'Saving…' : 'Save Session'}
              </button>
              <button onClick={() => setShowAddSession(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {sessionsLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet. Add one above.</p>
        ) : (
          <ul className="divide-y">
            {sessions.map((s: any, i: number) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{i + 1}. {s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(s.startTime).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(s.endTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    {s.venue ? ` · ${s.venue}` : ''}
                    {s.speakerName ? ` · ${s.speakerName}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => { if (confirm('Delete this session?')) deleteSessionMut.mutate(s.id); }}
                  disabled={deleteSessionMut.isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete session"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Participants */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">
            Participants <span className="text-gray-500 font-normal text-sm">({total})</span>
          </h2>
        </div>

        {partLoading ? (
          <p className="text-center text-gray-400 text-sm py-8">Loading participants…</p>
        ) : participants.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No participants yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-4 py-3 font-semibold text-gray-600">Name / Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Registered</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">TNA Score</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {p.participantName ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500">{p.participantEmail ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {new Date(p.registeredAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PARTICIPATION_STATUS_COLORS[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {p.tnaResponse?.compositeScore != null
                      ? `${Number(p.tnaResponse.compositeScore).toFixed(2)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
