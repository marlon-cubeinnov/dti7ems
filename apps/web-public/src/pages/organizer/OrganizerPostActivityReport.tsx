import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, eventsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

type BeneficiaryGroup = {
  sectorGroup: string;
  maleCount: number;
  femaleCount: number;
  seniorCitizenCount: number;
  pwdCount: number;
  edtLevel: string;
  actualCount: number;
};

const EMPTY_GROUP: BeneficiaryGroup = {
  sectorGroup: '',
  maleCount: 0,
  femaleCount: 0,
  seniorCitizenCount: 0,
  pwdCount: 0,
  edtLevel: '',
  actualCount: 0,
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
};

export function OrganizerPostActivityReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [dateConducted, setDateConducted] = useState('');
  const [venue, setVenue] = useState('');
  const [highlights, setHighlights] = useState('');
  const [fundNotes, setFundNotes] = useState('');
  const [csfObservations, setCsfObservations] = useState('');
  const [improvements, setImprovements] = useState('');
  const [groups, setGroups] = useState<BeneficiaryGroup[]>([{ ...EMPTY_GROUP }]);
  const [initialized, setInitialized] = useState(false);

  const { data: eventData } = useQuery({
    queryKey: ['organizer-event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: !!id,
  });
  const event = (eventData as any)?.data;

  const { data: parData, isLoading } = useQuery({
    queryKey: ['par', id],
    queryFn: () => organizerApi.getPar(id!),
    enabled: !!id,
  });
  const par = (parData as any)?.data;

  // Initialize form from existing PAR or event defaults
  useEffect(() => {
    if (initialized) return;
    if (par) {
      setTitle(par.title ?? '');
      setDateConducted(par.dateConducted ?? '');
      setVenue(par.venue ?? '');
      setHighlights(par.highlightsOutcomes ?? '');
      setFundNotes(par.fundUtilizationNotes ?? '');
      setCsfObservations(par.csfAssessmentObservations ?? '');
      setImprovements(par.improvementOpportunities ?? '');
      if (par.beneficiaryGroups?.length > 0) {
        setGroups(par.beneficiaryGroups.map((g: any) => ({
          sectorGroup: g.sectorGroup,
          maleCount: g.maleCount,
          femaleCount: g.femaleCount,
          seniorCitizenCount: g.seniorCitizenCount,
          pwdCount: g.pwdCount,
          edtLevel: g.edtLevel ?? '',
          actualCount: g.actualCount,
        })));
      }
      setInitialized(true);
    } else if (event && !isLoading) {
      setTitle(event.title ?? '');
      const startStr = event.startDate ? new Date(event.startDate).toLocaleDateString() : '';
      const endStr = event.endDate ? new Date(event.endDate).toLocaleDateString() : '';
      setDateConducted(startStr && endStr ? `${startStr} - ${endStr}` : startStr);
      setVenue(event.venue ?? '');
      setInitialized(true);
    }
  }, [par, event, isLoading, initialized]);

  const saveMutation = useMutation({
    mutationFn: () =>
      organizerApi.savePar(id!, {
        title,
        dateConducted,
        venue,
        highlightsOutcomes: highlights || null,
        fundUtilizationNotes: fundNotes || null,
        csfAssessmentObservations: csfObservations || null,
        improvementOpportunities: improvements || null,
        beneficiaryGroups: groups.filter(g => g.sectorGroup.trim()),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['par', id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => organizerApi.updateParStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['par', id] });
    },
  });

  const addGroup = () => setGroups([...groups, { ...EMPTY_GROUP }]);
  const removeGroup = (idx: number) => setGroups(groups.filter((_, i) => i !== idx));
  const updateGroup = (idx: number, field: keyof BeneficiaryGroup, value: string | number) => {
    setGroups(groups.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  const role = user?.role ?? '';
  const isStaff = ['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
  const isChief = ['DIVISION_CHIEF', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
  const isApprover = ['REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  const currentStatus = par?.status ?? 'DRAFT';
  const statusInfo = STATUS_LABELS[currentStatus] ?? STATUS_LABELS['DRAFT'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(`/organizer/events/${id}`)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← Back to Event
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Post-Activity Report (FM-CT-6)</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Header Info */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Report Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Title of Activity</label>
            <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Date Conducted</label>
            <input className="input w-full" value={dateConducted} onChange={e => setDateConducted(e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input className="input w-full" value={venue} onChange={e => setVenue(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Beneficiary Groups */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Beneficiary Demographics</h2>
          <button onClick={addGroup} className="text-sm text-dti-blue hover:underline">+ Add Group</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 pr-2 font-medium text-gray-700">Sector/Group</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">Male</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">Female</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">Senior</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">PWD</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">EDT Level</th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">Actual</th>
                <th className="py-2 px-1"></th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-1 pr-2">
                    <input className="input w-full text-sm" placeholder="e.g. MSMEs" value={g.sectorGroup}
                      onChange={e => updateGroup(idx, 'sectorGroup', e.target.value)} />
                  </td>
                  <td className="py-1 px-1">
                    <input type="number" min={0} className="input w-16 text-center text-sm" value={g.maleCount}
                      onChange={e => updateGroup(idx, 'maleCount', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-1 px-1">
                    <input type="number" min={0} className="input w-16 text-center text-sm" value={g.femaleCount}
                      onChange={e => updateGroup(idx, 'femaleCount', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-1 px-1">
                    <input type="number" min={0} className="input w-16 text-center text-sm" value={g.seniorCitizenCount}
                      onChange={e => updateGroup(idx, 'seniorCitizenCount', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-1 px-1">
                    <input type="number" min={0} className="input w-16 text-center text-sm" value={g.pwdCount}
                      onChange={e => updateGroup(idx, 'pwdCount', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-1 px-1">
                    <input className="input w-24 text-center text-sm" placeholder="Level" value={g.edtLevel}
                      onChange={e => updateGroup(idx, 'edtLevel', e.target.value)} />
                  </td>
                  <td className="py-1 px-1">
                    <input type="number" min={0} className="input w-16 text-center text-sm" value={g.actualCount}
                      onChange={e => updateGroup(idx, 'actualCount', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="py-1 px-1">
                    {groups.length > 1 && (
                      <button onClick={() => removeGroup(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Narratives */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Report Narratives</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Highlights / Key Outcomes</label>
          <textarea rows={4} className="input w-full resize-none" maxLength={10000}
            placeholder="Describe key outcomes, achievements, and highlights of the activity..."
            value={highlights} onChange={e => setHighlights(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Fund Utilization Notes</label>
          <textarea rows={3} className="input w-full resize-none" maxLength={10000}
            placeholder="Summary of budget utilization, if applicable..."
            value={fundNotes} onChange={e => setFundNotes(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">CSF Assessment Observations</label>
          <textarea rows={3} className="input w-full resize-none" maxLength={10000}
            placeholder="Summary of CSF survey results and observations..."
            value={csfObservations} onChange={e => setCsfObservations(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Improvement Opportunities</label>
          <textarea rows={3} className="input w-full resize-none" maxLength={10000}
            placeholder="Recommended improvements for future activities..."
            value={improvements} onChange={e => setImprovements(e.target.value)} />
        </div>
      </div>

      {/* Signatories */}
      {par && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Signatories</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prepared by</p>
              <p className="font-medium text-gray-900">{par.preparedByName ?? '—'}</p>
              {par.datePrepared && <p className="text-xs text-gray-400">{new Date(par.datePrepared).toLocaleDateString()}</p>}
              <p className="text-xs text-gray-500">Technical Staff</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviewed by</p>
              <p className="font-medium text-gray-900">{par.reviewedByName ?? (par.status === 'DRAFT' ? 'Pending' : '—')}</p>
              {par.dateReviewed && <p className="text-xs text-gray-400">{new Date(par.dateReviewed).toLocaleDateString()}</p>}
              <p className="text-xs text-gray-500">Technical Divisions Chief</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approved by</p>
              <p className="font-medium text-gray-900">{par.approvedByName ?? (par.status !== 'APPROVED' ? 'Pending' : '—')}</p>
              {par.dateApproved && <p className="text-xs text-gray-400">{new Date(par.dateApproved).toLocaleDateString()}</p>}
              <p className="text-xs text-gray-500">PD / RD</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        {isStaff && (
          <button
            className="btn-primary"
            disabled={saveMutation.isPending || !title.trim()}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? 'Saving…' : par ? 'Update Report' : 'Create Report'}
          </button>
        )}

        {/* Step 6.1 → 6.2: Technical Staff submits for Division Chief review */}
        {par && currentStatus === 'DRAFT' && isStaff && (
          <button
            className="btn-outline"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate('UNDER_REVIEW')}
          >
            Submit for Review (Div. Chief)
          </button>
        )}

        {/* Step 6.2 → 6.3: Division Chief marks reviewed, forwards to PD/RD */}
        {par && currentStatus === 'UNDER_REVIEW' && isChief && !isApprover && (
          <button
            className="btn-outline border-blue-500 text-blue-700 hover:bg-blue-50"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate('APPROVED')}
          >
            Mark as Reviewed
          </button>
        )}

        {/* Step 6.3: PD/RD approves and submits to FAD */}
        {par && currentStatus === 'UNDER_REVIEW' && isApprover && (
          <button
            className="btn-outline border-green-500 text-green-700 hover:bg-green-50"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate('APPROVED')}
          >
            Approve &amp; Submit to FAD
          </button>
        )}

        {saveMutation.isSuccess && (
          <span className="text-sm text-green-600">Saved successfully.</span>
        )}
        {saveMutation.isError && (
          <span className="text-sm text-red-600">Failed to save. Please try again.</span>
        )}
      </div>
    </div>
  );
}
