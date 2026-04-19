import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizerApi, eventsApi, ApiError, type EventBody } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Save, FileText } from 'lucide-react';

const TRAINING_TYPES = [
  { value: '', label: '— Select Training Type —' },
  { value: 'BUSINESS', label: 'Business Training' },
  { value: 'MANAGERIAL', label: 'Managerial Training' },
  { value: 'ORGANIZATIONAL', label: 'Organizational Training' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial Training' },
  { value: 'INTER_AGENCY', label: 'Inter-Agency Training' },
];

const EMPTY: EventBody = {
  title: '',
  description: '',
  venue: '',
  deliveryMode: 'FACE_TO_FACE',
  onlineLink: '',
  maxParticipants: null,
  registrationDeadline: '',
  startDate: '',
  endDate: '',
  targetSector: '',
  targetRegion: '',
  requiresTNA: true,
  trainingType: null,
  partnerInstitution: null,
  background: null,
  objectives: null,
  learningOutcomes: null,
  methodology: null,
  monitoringPlan: null,
};

// All times are displayed and entered in PHT (Asia/Manila, UTC+8)
const PHT_OFFSET_MS = 8 * 60 * 60_000;

/** Shift a UTC ISO string into PHT and format for datetime-local input */
function toInputDatetime(iso: string | null | undefined): string {
  if (!iso) return '';
  const phtMs = new Date(iso).getTime() + PHT_OFFSET_MS;
  const d = new Date(phtMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Interpret datetime-local value as PHT and convert to UTC ISO string */
function toIso(local: string): string | null {
  if (!local) return null;
  return new Date(`${local}:00+08:00`).toISOString();
}

export function OrganizerEventFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id) && id !== 'new';
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  // Detect whether we're on an event route vs proposal route
  const isEventRoute = location.pathname.startsWith('/organizer/events');
  const isProposalRoute = !isEventRoute;

  const [form, setForm] = useState<EventBody>(EMPTY);
  const [error, setError] = useState('');

  // Facilitators cannot create or edit events directly
  if (user?.role === 'EVENT_ORGANIZER') {
    return (
      <div className="card max-w-lg mx-auto text-center py-12 space-y-3">
        <p className="text-gray-700 font-medium">Access Restricted</p>
        <p className="text-sm text-gray-500">Facilitators cannot create proposals. Please wait for a Technical Staff member to assign an approved event to you.</p>
        <button onClick={() => navigate('/organizer/proposals')} className="btn-secondary text-sm">Back to My Proposals</button>
      </div>
    );
  }

  // Minimum datetime value: current time in PHT (prevents selecting past dates)
  const nowLocal = useMemo(() => {
    const now = new Date();
    const phtMs = now.getTime() + PHT_OFFSET_MS;
    const d = new Date(phtMs);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }, []);

  const { data: existingData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingData?.data) {
      const e = existingData.data as any;
      setForm({
        title:                e.title ?? '',
        description:          e.description ?? '',
        venue:                e.venue ?? '',
        deliveryMode:         e.deliveryMode ?? 'FACE_TO_FACE',
        onlineLink:           e.onlineLink ?? '',
        maxParticipants:      e.maxParticipants ?? null,
        registrationDeadline: toInputDatetime(e.registrationDeadline),
        startDate:            toInputDatetime(e.startDate),
        endDate:              toInputDatetime(e.endDate),
        targetSector:         e.targetSector ?? '',
        targetRegion:         e.targetRegion ?? '',
        requiresTNA:          e.requiresTNA ?? true,
        programId:            e.programId ?? null,
        trainingType:         e.trainingType ?? null,
        partnerInstitution:   e.partnerInstitution ?? null,
        background:           e.background ?? null,
        objectives:           e.objectives ?? null,
        learningOutcomes:     e.learningOutcomes ?? null,
        methodology:          e.methodology ?? null,
        monitoringPlan:       e.monitoringPlan ?? null,
      });
    }
  }, [existingData]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: EventBody = {
        ...form,
        startDate:            toIso(form.startDate as string) ?? '',
        endDate:              toIso(form.endDate as string) ?? '',
        registrationDeadline: toIso(form.registrationDeadline as string),
        onlineLink:           form.onlineLink || null,
        venue:                form.venue || null,
        description:          form.description || null,
        targetSector:         form.targetSector || null,
        targetRegion:         form.targetRegion || null,
        maxParticipants:      form.maxParticipants || null,
        trainingType:         form.trainingType || null,
        partnerInstitution:   form.partnerInstitution || null,
        background:           form.background || null,
        objectives:           form.objectives || null,
        learningOutcomes:     form.learningOutcomes || null,
        methodology:          form.methodology || null,
        monitoringPlan:       form.monitoringPlan || null,
      };
      return isEdit
        ? organizerApi.updateEvent(id!, payload)
        : organizerApi.createEvent(payload);
    },
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['organizer-events'] });
      qc.invalidateQueries({ queryKey: ['organizer-events-all'] });
      qc.invalidateQueries({ queryKey: ['organizer-proposals'] });
      if (isEdit) {
        qc.invalidateQueries({ queryKey: ['event', id] });
        navigate(isEventRoute ? `/organizer/events/${id}` : isEventRoute ? `/organizer/events/${id}` : `/organizer/proposals/${id}`);
      } else {
        // After creating a new proposal, redirect to proposal detail page
        const newId = res?.data?.id;
        navigate(newId ? `/organizer/proposals/${newId}` : '/organizer/proposals');
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : isEventRoute ? 'Failed to save event.' : isEventRoute ? 'Failed to save event.' : 'Failed to save proposal.');
    },
  });

  const set = (field: keyof EventBody, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <FileText size={22} className="text-dti-blue" />
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? (isEventRoute ? 'Edit Event' : 'Edit Proposal') : 'Create Proposal'}
        </h1>
      </div>

      {!isEdit && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-input px-4 py-3">
          Step 1 — Prepare your training proposal. After creating it, you can add budget items, risk register entries, and target groups before submitting for review.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-input px-4 py-3">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); setError(''); mutation.mutate(); }}
        className="space-y-6"
      >
        {/* Section 1: Training Information */}
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Training Information</h2>

          <div>
            <label className="label">Training Title *</label>
            <input className="input" value={form.title} required minLength={3}
              onChange={(e) => set('title', e.target.value)} placeholder="e.g. Negosyo Workshop 2026" />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[100px]" value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of the training program…" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Training Type</label>
              <select className="input" value={form.trainingType ?? ''}
                onChange={(e) => set('trainingType', e.target.value || null)}>
                {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Partner Institution</label>
              <input className="input" value={form.partnerInstitution ?? ''}
                onChange={(e) => set('partnerInstitution', e.target.value)}
                placeholder="e.g. DOST-7, TESDA" />
            </div>
          </div>
        </div>

        {/* Section 2: Schedule & Logistics */}
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Schedule & Logistics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Delivery Mode *</label>
              <select className="input" value={form.deliveryMode}
                onChange={(e) => set('deliveryMode', e.target.value)}>
                <option value="FACE_TO_FACE">Face-to-Face</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input" value={form.venue ?? ''}
                onChange={(e) => set('venue', e.target.value)}
                placeholder="e.g. DTI Region 7 Office" />
            </div>
          </div>

          {form.deliveryMode !== 'FACE_TO_FACE' && (
            <div>
              <label className="label">Online Link</label>
              <input className="input" type="url" value={form.onlineLink ?? ''}
                onChange={(e) => set('onlineLink', e.target.value)}
                placeholder="https://zoom.us/j/…" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date & Time *</label>
              <input className="input" type="datetime-local" required value={form.startDate as string}
                min={nowLocal}
                onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">End Date & Time *</label>
              <input className="input" type="datetime-local" required value={form.endDate as string}
                min={form.startDate as string || nowLocal}
                onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Registration Deadline</label>
            <input className="input" type="datetime-local" value={form.registrationDeadline as string}
              min={nowLocal}
              max={form.startDate as string || undefined}
              onChange={(e) => set('registrationDeadline', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Max Participants</label>
              <input className="input" type="number" min={1}
                value={form.maxParticipants ?? ''}
                onChange={(e) => set('maxParticipants', e.target.value ? Number(e.target.value) : null)}
                placeholder="Unlimited" />
            </div>
            <div>
              <label className="label">Target Sector</label>
              <input className="input" value={form.targetSector ?? ''}
                onChange={(e) => set('targetSector', e.target.value)}
                placeholder="e.g. MSMEs, Agriculture" />
            </div>
            <div>
              <label className="label">Target Region</label>
              <input className="input" value={form.targetRegion ?? ''}
                onChange={(e) => set('targetRegion', e.target.value)}
                placeholder="e.g. Cebu, Bohol" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input id="tna" type="checkbox" className="h-4 w-4 accent-dti-blue"
              checked={form.requiresTNA}
              onChange={(e) => set('requiresTNA', e.target.checked)} />
            <label htmlFor="tna" className="text-sm text-gray-700">
              Require Training Needs Assessment (TNA) before registration
            </label>
          </div>
        </div>

        {/* Section 3: Proposal Details — only shown on proposal routes */}
        {isProposalRoute && (
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Proposal Details</h2>
          <p className="text-xs text-gray-500">You can fill these in now or later from the proposal detail page.</p>

          <div>
            <label className="label">Background / Rationale</label>
            <textarea className="input min-h-[80px]" value={form.background ?? ''}
              onChange={(e) => set('background', e.target.value)}
              placeholder="Background and justification for the training…" />
          </div>

          <div>
            <label className="label">Objectives</label>
            <textarea className="input min-h-[80px]" value={form.objectives ?? ''}
              onChange={(e) => set('objectives', e.target.value)}
              placeholder="General and specific objectives…" />
          </div>

          <div>
            <label className="label">Expected Learning Outcomes</label>
            <textarea className="input min-h-[80px]" value={form.learningOutcomes ?? ''}
              onChange={(e) => set('learningOutcomes', e.target.value)}
              placeholder="At the end of the training, participants should be able to…" />
          </div>

          <div>
            <label className="label">Methodology</label>
            <textarea className="input min-h-[80px]" value={form.methodology ?? ''}
              onChange={(e) => set('methodology', e.target.value)}
              placeholder="Lecture, workshop, hands-on, group activity…" />
          </div>

          <div>
            <label className="label">Monitoring & Evaluation Plan</label>
            <textarea className="input min-h-[80px]" value={form.monitoringPlan ?? ''}
              onChange={(e) => set('monitoringPlan', e.target.value)}
              placeholder="How effectiveness will be measured post-training…" />
          </div>
        </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={mutation.isPending}>
            <Save size={16} />
            {mutation.isPending ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Proposal')}
          </button>
        </div>
      </form>
    </div>
  );
}
