import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, eventsApi, certificatesApi, surveyApi, ApiError, type EventStatus } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Pencil, QrCode, Plus, Trash2, ClipboardList, BarChart3, Users, Award, FileText, FileCheck, TrendingUp, Mic, Briefcase, X, Send, CheckCircle2 } from 'lucide-react';

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
  const { user } = useAuthStore();
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
  const [csfMsg, setCsfMsg] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');

  // Step 5: Distribute CSF forms
  const distributeCsfMut = useMutation({
    mutationFn: () => surveyApi.distributeCsf(id!),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['csf-distribution', id] });
      setCsfMsg(data.message ?? 'CSF forms distributed.');
    },
    onError: (err) => setCsfMsg(err instanceof ApiError ? err.message : 'Failed to distribute CSF.'),
  });

  const { data: csfDistData } = useQuery({
    queryKey: ['csf-distribution', id],
    queryFn: () => surveyApi.getCsfDistributionStatus(id!),
    enabled: Boolean(id) && Boolean(eventData),
  });
  const csfDist = (csfDistData as any)?.data ?? null;
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', startTime: '', endTime: '', venue: '', speakerName: '' });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSession, setEditSession] = useState({ title: '', startTime: '', endTime: '', venue: '', speakerName: '' });

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

  const updateSessionMut = useMutation({
    mutationFn: (sessionId: string) => organizerApi.updateSession(id!, sessionId, {
      ...editSession,
      startTime: new Date(editSession.startTime).toISOString(),
      endTime:   new Date(editSession.endTime).toISOString(),
      venue:     editSession.venue || null,
      speakerName: editSession.speakerName || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-sessions', id] });
      setEditingSessionId(null);
      setSessionMsg('Session updated.');
    },
    onError: (err) => setSessionMsg(err instanceof ApiError ? err.message : 'Failed to update session.'),
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

  // Speaker management
  const [showAddSpeaker, setShowAddSpeaker] = useState(false);
  const [speakerMsg, setSpeakerMsg] = useState('');
  const [newSpeaker, setNewSpeaker] = useState({ name: '', organization: '', topic: '' });

  const { data: speakersData } = useQuery({
    queryKey: ['event-speakers', id],
    queryFn: () => organizerApi.getSpeakers(id!),
    enabled: Boolean(id),
  });
  const speakersList: any[] = (speakersData as any)?.data ?? [];

  const addSpeakerMut = useMutation({
    mutationFn: () => organizerApi.addSpeaker(id!, {
      name: newSpeaker.name,
      organization: newSpeaker.organization || null,
      topic: newSpeaker.topic || null,
      displayOrder: speakersList.length,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-speakers', id] });
      setNewSpeaker({ name: '', organization: '', topic: '' });
      setShowAddSpeaker(false);
      setSpeakerMsg('Speaker added.');
    },
    onError: (err) => setSpeakerMsg(err instanceof ApiError ? err.message : 'Failed to add speaker.'),
  });

  const deleteSpeakerMut = useMutation({
    mutationFn: (speakerId: string) => organizerApi.deleteSpeaker(id!, speakerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-speakers', id] });
      setSpeakerMsg('Speaker removed.');
    },
    onError: (err) => setSpeakerMsg(err instanceof ApiError ? err.message : 'Failed to remove speaker.'),
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
        <Link to={`/organizer/events/${id}/proposal`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-center group">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Briefcase size={18} className="text-indigo-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Proposal</span>
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
        {event.status === 'COMPLETED' && (
          <Link to={`/organizer/events/${id}/csf-report`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-amber-300 hover:shadow-md transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <BarChart3 size={18} className="text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">CSF Report</span>
          </Link>
        )}
        {event.status === 'COMPLETED' && (
          <Link to={`/organizer/events/${id}/par`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-rose-300 hover:shadow-md transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <FileCheck size={18} className="text-rose-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Post-Activity Report</span>
          </Link>
        )}
        {event.status === 'COMPLETED' && (
          <Link to={`/organizer/events/${id}/effectiveness`}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Effectiveness</span>
          </Link>
        )}
      </div>

      {/* DTI Process Steps Banner */}
      {(() => {
        const p = (event as any).proposalStatus;
        const s = event.status;
        const steps = [
          { num: 1, label: 'Prepare Proposal', done: !!p, active: !p },
          { num: 2, label: 'Evaluate & Approve', done: p === 'APPROVED', active: ['SUBMITTED', 'UNDER_REVIEW'].includes(p) },
          { num: 3, label: 'Pre-Activity Requirements', done: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'].includes(s), active: s === 'PUBLISHED' },
          { num: 4, label: 'Conduct Activity', done: ['COMPLETED'].includes(s), active: s === 'ONGOING' },
          { num: 5, label: 'Post-Training Evaluation', done: s === 'COMPLETED' && csfDist?.submitted > 0, active: s === 'COMPLETED' },
        ];
        return (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">DTI QMS — Conduct of Training</p>
            <div className="flex items-center gap-0 overflow-x-auto">
              {steps.map((step, i) => (
                <div key={step.num} className="flex items-center min-w-0">
                  <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-center min-w-[90px] ${step.done ? 'bg-green-50' : step.active ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-green-500 text-white' : step.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {step.done ? '✓' : step.num}
                    </div>
                    <span className={`text-[10px] font-medium leading-tight ${step.done ? 'text-green-700' : step.active ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`h-0.5 w-6 shrink-0 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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

      {/* Step 5 — Post-Training Evaluation: CSF Distribution (shown for ONGOING/COMPLETED) */}
      {['ONGOING', 'COMPLETED'].includes(event.status) && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-yellow-600" />
              <h2 className="font-semibold text-gray-900">Step 5 — Post-Training Evaluation (CSF)</h2>
            </div>
            {csfDist && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${csfDist.responseRate >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {csfDist.responseRate}% Response Rate
              </span>
            )}
          </div>

          {csfMsg && (
            <p className={`text-sm px-3 py-2 rounded-lg ${csfMsg.startsWith('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {csfMsg}
            </p>
          )}

          {csfDist && (
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              {[
                { label: 'Attended', value: csfDist.attended, color: 'text-blue-600' },
                { label: 'Distributed', value: csfDist.distributed, color: 'text-purple-600' },
                { label: 'Submitted', value: csfDist.submitted, color: 'text-green-600' },
                { label: 'Pending', value: csfDist.pending, color: 'text-orange-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card text-center py-3">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(user?.role === 'PROGRAM_MANAGER' || user?.role === 'EVENT_ORGANIZER' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => distributeCsfMut.mutate()}
                disabled={distributeCsfMut.isPending}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                <Send size={14} /> {distributeCsfMut.isPending ? 'Distributing…' : 'Distribute CSF Forms'}
              </button>
            )}
            {event.status === 'COMPLETED' && (
              <>
                <Link to={`/organizer/events/${id}/csf-results`}
                  className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-100">
                  <BarChart3 size={14} /> View CSF Results
                </Link>
                <Link to={`/organizer/events/${id}/csf-report`}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100">
                  <FileText size={14} /> CSF Report
                </Link>
                <Link to={`/organizer/events/${id}/par`}
                  className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-100">
                  <FileCheck size={14} /> Post-Activity Report
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Distribute CSF forms (FM-CSF-ACT) to all attended participants. Participants have 30 days to submit online. Tabulate and include the CSF Summary in the Post-Activity Report.
          </p>
        </div>
      )}

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
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Speaker / Resource Person</label>
                <select
                  value={newSession.speakerName}
                  onChange={e => setNewSession(s => ({ ...s, speakerName: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— None —</option>
                  {speakersList.map((sp: any) => (
                    <option key={sp.id} value={sp.name}>{sp.name}{sp.organization ? ` (${sp.organization})` : ''}</option>
                  ))}
                </select>
                {speakersList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No speakers added yet. Add speakers below first, then assign them to sessions.</p>
                )}
              </div>
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
              <li key={s.id}>
                {editingSessionId === s.id ? (
                  /* ── Inline edit form ── */
                  <div className="px-4 py-3 bg-yellow-50 space-y-3">
                    <p className="text-sm font-medium text-yellow-800">Edit Session</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        placeholder="Session title *"
                        value={editSession.title}
                        onChange={e => setEditSession(s => ({ ...s, title: e.target.value }))}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        placeholder="Venue (optional)"
                        value={editSession.venue}
                        onChange={e => setEditSession(s => ({ ...s, venue: e.target.value }))}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start *</label>
                        <input
                          type="datetime-local"
                          value={editSession.startTime}
                          onChange={e => setEditSession(s => ({ ...s, startTime: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End *</label>
                        <input
                          type="datetime-local"
                          value={editSession.endTime}
                          onChange={e => setEditSession(s => ({ ...s, endTime: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Speaker / Resource Person</label>
                        <select
                          value={editSession.speakerName}
                          onChange={e => setEditSession(s => ({ ...s, speakerName: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                        >
                          <option value="">— None —</option>
                          {speakersList.map((sp: any) => (
                            <option key={sp.id} value={sp.name}>{sp.name}{sp.organization ? ` (${sp.organization})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateSessionMut.mutate(s.id)}
                        disabled={updateSessionMut.isPending || !editSession.title || !editSession.startTime || !editSession.endTime}
                        className="btn-primary text-sm"
                      >
                        {updateSessionMut.isPending ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditingSessionId(null)}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Session row ── */
                  <div className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{i + 1}. {s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(s.startTime).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {new Date(s.endTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        {s.venue ? ` · ${s.venue}` : ''}
                        {s.speakerName ? ` · 🎤 ${s.speakerName}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const toLocal = (iso: string) => {
                            const d = new Date(iso);
                            const pad = (n: number) => String(n).padStart(2, '0');
                            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                          };
                          setEditSession({
                            title: s.title,
                            startTime: toLocal(s.startTime),
                            endTime: toLocal(s.endTime),
                            venue: s.venue ?? '',
                            speakerName: s.speakerName ?? '',
                          });
                          setEditingSessionId(s.id);
                          setShowAddSession(false);
                          setSessionMsg('');
                        }}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit session"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this session?')) deleteSessionMut.mutate(s.id); }}
                        disabled={deleteSessionMut.isPending}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Speakers / Resource Persons */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">
            Speakers <span className="text-gray-500 font-normal text-sm">({speakersList.length})</span>
          </h2>
          <button
            onClick={() => { setShowAddSpeaker(s => !s); setSpeakerMsg(''); }}
            className="flex items-center gap-1 text-sm text-dti-blue hover:underline"
          >
            <Plus size={14} /> Add Speaker
          </button>
        </div>

        {speakerMsg && (
          <p className={`text-sm px-4 py-2 ${speakerMsg.startsWith('Failed') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>
            {speakerMsg}
          </p>
        )}

        {showAddSpeaker && (
          <div className="px-4 py-3 border-b bg-blue-50 space-y-3">
            <p className="text-sm font-medium text-blue-800">New Speaker / Resource Person</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Full name *"
                value={newSpeaker.name}
                onChange={e => setNewSpeaker(s => ({ ...s, name: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Organization (optional)"
                value={newSpeaker.organization}
                onChange={e => setNewSpeaker(s => ({ ...s, organization: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Topic (optional)"
                value={newSpeaker.topic}
                onChange={e => setNewSpeaker(s => ({ ...s, topic: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addSpeakerMut.mutate()}
                disabled={addSpeakerMut.isPending || !newSpeaker.name.trim()}
                className="btn-primary text-sm"
              >
                {addSpeakerMut.isPending ? 'Saving…' : 'Save Speaker'}
              </button>
              <button onClick={() => setShowAddSpeaker(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {speakersList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No speakers yet. Add one above.</p>
        ) : (
          <ul className="divide-y">
            {speakersList.map((s: any, i: number) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Mic size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{i + 1}. {s.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.organization ? s.organization : ''}
                      {s.organization && s.topic ? ' · ' : ''}
                      {s.topic ? s.topic : ''}
                      {!s.organization && !s.topic ? 'No details' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm('Remove this speaker?')) deleteSpeakerMut.mutate(s.id); }}
                  disabled={deleteSpeakerMut.isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove speaker"
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
