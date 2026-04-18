import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, staffApi, eventsApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Plus, Trash2, Save, UserCheck, Rocket } from 'lucide-react';

const TRAINING_TYPES = [
  { value: '', label: '— Select —' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'ORGANIZATIONAL', label: 'Organizational' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial' },
  { value: 'INTER_AGENCY', label: 'Inter-Agency' },
];

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

type Tab = 'details' | 'budget' | 'risks' | 'targets';

interface BudgetItem {
  id?: string;
  item: string;
  unitCost: number;
  quantity: number;
  estimatedAmount: number;
  sourceOfFunds: string;
  actualSpent: number | null;
}

interface RiskItem {
  id?: string;
  riskDescription: string;
  actionPlan: string;
  responsiblePerson: string;
}

interface TargetGroup {
  id?: string;
  edtLevel: string;
  sectorGroup: string;
  estimatedParticipants: number;
}

export function OrganizerProposalPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('details');
  const [msg, setMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Assign facilitator
  const [staffSearch, setStaffSearch] = useState('');
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState('');

  // Proposal fields state
  const [trainingType, setTrainingType] = useState('');
  const [partnerInstitution, setPartnerInstitution] = useState('');
  const [background, setBackground] = useState('');
  const [objectives, setObjectives] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [methodology, setMethodology] = useState('');
  const [monitoringPlan, setMonitoringPlan] = useState('');

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
    enabled: Boolean(id),
  });

  const { data: proposalData, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => organizerApi.getProposal(id!),
    enabled: Boolean(id),
  });

  const { data: budgetData } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => organizerApi.getBudget(id!),
    enabled: Boolean(id),
  });

  const { data: risksData } = useQuery({
    queryKey: ['risks', id],
    queryFn: () => organizerApi.getRisks(id!),
    enabled: Boolean(id),
  });

  const { data: targetGroupsData } = useQuery({
    queryKey: ['target-groups', id],
    queryFn: () => organizerApi.getTargetGroups(id!),
    enabled: Boolean(id),
  });

  const event = eventData?.data as any;
  const proposal = proposalData?.data as any;
  const budgetItems: any[] = (budgetData as any)?.data ?? [];
  const riskItems: any[] = (risksData as any)?.data ?? [];
  const targetGroups: any[] = (targetGroupsData as any)?.data ?? [];

  useEffect(() => {
    if (proposal) {
      setTrainingType(proposal.trainingType ?? '');
      setPartnerInstitution(proposal.partnerInstitution ?? '');
      setBackground(proposal.background ?? '');
      setObjectives(proposal.objectives ?? '');
      setLearningOutcomes(proposal.learningOutcomes ?? '');
      setMethodology(proposal.methodology ?? '');
      setMonitoringPlan(proposal.monitoringPlan ?? '');
    }
  }, [proposal]);

  const proposalStatus = proposal?.proposalStatus ?? 'DRAFT';
  const isLocked = proposalStatus === 'APPROVED';
  const canActivate = proposalStatus === 'APPROVED' && event?.status === 'DRAFT'
    && (user?.role === 'PROGRAM_MANAGER' || user?.role === 'EVENT_ORGANIZER' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN');

  // Activate event (Step 3) — DRAFT → PUBLISHED + seeds DTI checklist
  const activateMut = useMutation({
    mutationFn: () => organizerApi.activateEvent(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setMsg('Event activated! The DTI Training Monitoring Checklist has been created. You can now manage pre-activity requirements.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to activate event.'),
  });

  // Save proposal
  const saveMut = useMutation({
    mutationFn: () => organizerApi.saveProposal(id!, {
      trainingType: trainingType || null,
      partnerInstitution: partnerInstitution || null,
      background: background || null,
      objectives: objectives || null,
      learningOutcomes: learningOutcomes || null,
      methodology: methodology || null,
      monitoringPlan: monitoringPlan || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setMsg('Proposal saved.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to save.'),
  });

  // Submit proposal
  const submitMut = useMutation({
    mutationFn: () => organizerApi.submitProposal(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setMsg('Proposal submitted for review.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to submit.'),
  });

  // Review / Approve
  const reviewMut = useMutation({
    mutationFn: () => organizerApi.reviewProposal(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setMsg('Proposal is now under review.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const approveMut = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT') => organizerApi.approveProposal(id!, action),
    onSuccess: (_, action) => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setMsg(action === 'APPROVE' ? 'Proposal approved. You can now assign a facilitator.' : 'Proposal rejected.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const assignMut = useMutation({
    mutationFn: () => organizerApi.assignOrganizer(id!, selectedFacilitatorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      setMsg('Facilitator assigned successfully.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to assign facilitator.'),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff', staffSearch],
    queryFn: () => staffApi.search(staffSearch || undefined),
    enabled: proposalStatus === 'APPROVED',
  });
  const staffList: any[] = (staffData as any)?.data ?? [];
  const facilitators = staffList.filter((s: any) => s.role === 'EVENT_ORGANIZER');

  // Budget mutations
  const [newBudget, setNewBudget] = useState<BudgetItem>({ item: '', unitCost: 0, quantity: 1, estimatedAmount: 0, sourceOfFunds: '', actualSpent: null });

  const addBudgetMut = useMutation({
    mutationFn: () => organizerApi.addBudgetItem(id!, { ...newBudget, orderIndex: budgetItems.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget', id] });
      setNewBudget({ item: '', unitCost: 0, quantity: 1, estimatedAmount: 0, sourceOfFunds: '', actualSpent: null });
      setMsg('Budget item added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const deleteBudgetMut = useMutation({
    mutationFn: (itemId: string) => organizerApi.deleteBudgetItem(id!, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget', id] });
      setMsg('Budget item removed.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  // Risk mutations
  const [newRisk, setNewRisk] = useState<RiskItem>({ riskDescription: '', actionPlan: '', responsiblePerson: '' });

  const addRiskMut = useMutation({
    mutationFn: () => organizerApi.addRisk(id!, { ...newRisk, orderIndex: riskItems.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risks', id] });
      setNewRisk({ riskDescription: '', actionPlan: '', responsiblePerson: '' });
      setMsg('Risk item added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const deleteRiskMut = useMutation({
    mutationFn: (riskId: string) => organizerApi.deleteRisk(id!, riskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risks', id] });
      setMsg('Risk item removed.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  // Target group mutations
  const [newTarget, setNewTarget] = useState<TargetGroup>({ edtLevel: '', sectorGroup: '', estimatedParticipants: 0 });

  const addTargetMut = useMutation({
    mutationFn: () => organizerApi.addTargetGroup(id!, { ...newTarget, orderIndex: targetGroups.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['target-groups', id] });
      setNewTarget({ edtLevel: '', sectorGroup: '', estimatedParticipants: 0 });
      setMsg('Target group added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const deleteTargetMut = useMutation({
    mutationFn: (groupId: string) => organizerApi.deleteTargetGroup(id!, groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['target-groups', id] });
      setMsg('Target group removed.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  if (isLoading) return <div className="card text-center py-16 text-gray-400">Loading proposal…</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Proposal Details' },
    { key: 'budget', label: `Budget (${budgetItems.length})` },
    { key: 'risks', label: `Risk Register (${riskItems.length})` },
    { key: 'targets', label: `Target Groups (${targetGroups.length})` },
  ];

  const budgetTotal = budgetItems.reduce((s: number, b: any) => s + Number(b.estimatedAmount ?? 0), 0);
  const actualTotal = budgetItems.reduce((s: number, b: any) => s + Number(b.actualSpent ?? 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to={`/organizer/events/${id}`} className="text-gray-500 hover:text-gray-700 mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Training Proposal</h1>
            <p className="text-sm text-gray-500 mt-0.5">{event?.title ?? 'Loading…'}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${PROPOSAL_STATUS_COLORS[proposalStatus] ?? ''}`}>
          {proposalStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-input px-4 py-3">{msg}</div>}
      {errMsg && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-input px-4 py-3">{errMsg}</div>}
      {proposal?.proposalRejectionNote && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-input px-4 py-3">
          <strong>Rejection Note:</strong> {proposal.proposalRejectionNote}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setMsg(''); setErrMsg(''); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-dti-blue text-dti-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Proposal Details Tab */}
      {tab === 'details' && (
        <div className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Training Type</label>
              <select className="input" value={trainingType} disabled={isLocked}
                onChange={e => setTrainingType(e.target.value)}>
                {TRAINING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Partner Institution</label>
              <input className="input" value={partnerInstitution} disabled={isLocked}
                onChange={e => setPartnerInstitution(e.target.value)} placeholder="e.g. DOST-7, TESDA" />
            </div>
          </div>

          <div>
            <label className="label">Background / Rationale</label>
            <textarea className="input min-h-[80px]" value={background} disabled={isLocked}
              onChange={e => setBackground(e.target.value)} placeholder="Background and justification for the training…" />
          </div>

          <div>
            <label className="label">Objectives</label>
            <textarea className="input min-h-[80px]" value={objectives} disabled={isLocked}
              onChange={e => setObjectives(e.target.value)} placeholder="General and specific objectives…" />
          </div>

          <div>
            <label className="label">Expected Learning Outcomes</label>
            <textarea className="input min-h-[80px]" value={learningOutcomes} disabled={isLocked}
              onChange={e => setLearningOutcomes(e.target.value)} placeholder="At the end of the training, participants should be able to…" />
          </div>

          <div>
            <label className="label">Methodology</label>
            <textarea className="input min-h-[80px]" value={methodology} disabled={isLocked}
              onChange={e => setMethodology(e.target.value)} placeholder="Lecture, workshop, hands-on, group activity…" />
          </div>

          <div>
            <label className="label">Monitoring & Evaluation Plan</label>
            <textarea className="input min-h-[80px]" value={monitoringPlan} disabled={isLocked}
              onChange={e => setMonitoringPlan(e.target.value)} placeholder="How effectiveness will be measured post-training…" />
          </div>

          {!isLocked && (
            <div className="flex flex-wrap gap-3 pt-2">
              {/* Technical Staff: save + submit */}
              {(user?.role === 'PROGRAM_MANAGER' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <>
                  <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="btn-primary flex items-center gap-2">
                    <Save size={16} /> {saveMut.isPending ? 'Saving…' : 'Save Proposal'}
                  </button>
                  {['DRAFT', 'REJECTED'].includes(proposalStatus) && (
                    <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending} className="btn-secondary">
                      {submitMut.isPending ? 'Submitting…' : 'Submit for Review'}
                    </button>
                  )}
                </>
              )}

              {/* Division Chief: mark under review */}
              {(user?.role === 'DIVISION_CHIEF' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && proposalStatus === 'SUBMITTED' && (
                <button onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">
                  {reviewMut.isPending ? 'Processing…' : 'Mark Under Review'}
                </button>
              )}

              {/* Regional Director / PD: approve or reject */}
              {(user?.role === 'REGIONAL_DIRECTOR' || user?.role === 'PROVINCIAL_DIRECTOR' || user?.role === 'SUPER_ADMIN') && ['SUBMITTED', 'UNDER_REVIEW'].includes(proposalStatus) && (
                <>
                  <button onClick={() => approveMut.mutate('APPROVE')} disabled={approveMut.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => approveMut.mutate('REJECT')} disabled={approveMut.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                    Reject
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3 — Activate Event (APPROVED + DRAFT → PUBLISHED + auto-seeds checklist) */}
          {canActivate && (
            <div className="border-t pt-5">
              <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket size={18} className="text-green-600" />
                  <h3 className="text-sm font-semibold text-green-800">Step 3 — Facilitate Pre-Activity Requirements</h3>
                </div>
                <p className="text-xs text-green-700">
                  The proposal has been approved. Activating the event will publish it and auto-generate the <strong>DTI Training Monitoring Checklist (FM-CT-7)</strong> with all standard pre-training, actual training, and post-training tasks.
                </p>
                <button
                  onClick={() => activateMut.mutate()}
                  disabled={activateMut.isPending}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2"
                >
                  <Rocket size={15} /> {activateMut.isPending ? 'Activating…' : 'Activate Event & Start Pre-Activity'}
                </button>
              </div>
            </div>
          )}

          {/* Assign Facilitator — shown when proposal is APPROVED and user is PM/Admin */}
          {proposalStatus === 'APPROVED' && user?.role !== 'EVENT_ORGANIZER' && (
            <div className="border-t pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-800">Assign Facilitator</h3>
                {proposal?.assignedOrganizerId && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Assigned</span>
                )}
              </div>
              <p className="text-xs text-gray-500">Select a Facilitator (Event Organizer) to hand over this event.</p>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Search facilitator by name…"
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                />
              </div>
              <select
                className="input text-sm"
                value={selectedFacilitatorId}
                onChange={e => setSelectedFacilitatorId(e.target.value)}
              >
                <option value="">— Select a Facilitator —</option>
                {facilitators.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.firstName} {f.lastName} ({f.email})</option>
                ))}
                {facilitators.length === 0 && staffSearch && (
                  <option disabled>No facilitators found</option>
                )}
              </select>
              <button
                onClick={() => assignMut.mutate()}
                disabled={!selectedFacilitatorId || assignMut.isPending}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <UserCheck size={15} /> {assignMut.isPending ? 'Assigning…' : 'Assign Facilitator'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Budget Tab */}
      {tab === 'budget' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center py-3">
              <p className="text-lg font-bold text-blue-600">₱{budgetTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500">Estimated Total</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-lg font-bold text-green-600">₱{actualTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500">Actual Spent</p>
            </div>
          </div>

          {/* Budget Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Item</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600 text-right">Unit Cost</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600 text-center">Qty</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600 text-right">Estimated</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Source</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600 text-right">Actual</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {budgetItems.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900">{b.item}</td>
                      <td className="px-3 py-2 text-right text-gray-600">₱{Number(b.unitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{b.quantity}</td>
                      <td className="px-3 py-2 text-right font-medium">₱{Number(b.estimatedAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-gray-600">{b.sourceOfFunds ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{b.actualSpent != null ? `₱${Number(b.actualSpent).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => { if (confirm('Delete?')) deleteBudgetMut.mutate(b.id); }}
                          className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {budgetItems.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-gray-400">No budget items yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add budget item */}
          <div className="card space-y-3">
            <p className="text-sm font-semibold text-gray-700">Add Budget Item</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input placeholder="Item description *" value={newBudget.item}
                onChange={e => setNewBudget(p => ({ ...p, item: e.target.value }))}
                className="input col-span-2 sm:col-span-1" />
              <input placeholder="Unit cost" type="number" min={0} step={0.01} value={newBudget.unitCost || ''}
                onChange={e => {
                  const uc = Number(e.target.value);
                  setNewBudget(p => ({ ...p, unitCost: uc, estimatedAmount: uc * p.quantity }));
                }} className="input" />
              <input placeholder="Qty" type="number" min={1} value={newBudget.quantity || ''}
                onChange={e => {
                  const q = Number(e.target.value) || 1;
                  setNewBudget(p => ({ ...p, quantity: q, estimatedAmount: p.unitCost * q }));
                }} className="input" />
              <input placeholder="Source of funds" value={newBudget.sourceOfFunds}
                onChange={e => setNewBudget(p => ({ ...p, sourceOfFunds: e.target.value }))}
                className="input" />
              <input placeholder="Estimated amount" type="number" min={0} step={0.01} value={newBudget.estimatedAmount || ''}
                onChange={e => setNewBudget(p => ({ ...p, estimatedAmount: Number(e.target.value) }))}
                className="input" />
            </div>
            <button onClick={() => addBudgetMut.mutate()} disabled={addBudgetMut.isPending || !newBudget.item.trim()}
              className="btn-primary text-sm flex items-center gap-1.5">
              <Plus size={14} /> {addBudgetMut.isPending ? 'Adding…' : 'Add Item'}
            </button>
          </div>
        </div>
      )}

      {/* Risk Register Tab */}
      {tab === 'risks' && (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Risk / Threat</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Action Plan</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Responsible</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {riskItems.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900">{r.riskDescription}</td>
                      <td className="px-3 py-2 text-gray-600">{r.actionPlan ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{r.responsiblePerson ?? '—'}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => { if (confirm('Delete?')) deleteRiskMut.mutate(r.id); }}
                          className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {riskItems.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">No risks identified yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-semibold text-gray-700">Add Risk Item</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Risk / Threat description *" value={newRisk.riskDescription}
                onChange={e => setNewRisk(p => ({ ...p, riskDescription: e.target.value }))} className="input" />
              <input placeholder="Action plan" value={newRisk.actionPlan}
                onChange={e => setNewRisk(p => ({ ...p, actionPlan: e.target.value }))} className="input" />
              <input placeholder="Responsible person" value={newRisk.responsiblePerson}
                onChange={e => setNewRisk(p => ({ ...p, responsiblePerson: e.target.value }))} className="input" />
            </div>
            <button onClick={() => addRiskMut.mutate()} disabled={addRiskMut.isPending || !newRisk.riskDescription.trim()}
              className="btn-primary text-sm flex items-center gap-1.5">
              <Plus size={14} /> {addRiskMut.isPending ? 'Adding…' : 'Add Risk'}
            </button>
          </div>
        </div>
      )}

      {/* Target Groups Tab */}
      {tab === 'targets' && (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2.5 font-semibold text-gray-600">EDT Level</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600">Sector Group</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-600 text-center">Est. Participants</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {targetGroups.map((g: any) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900">{g.edtLevel ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{g.sectorGroup}</td>
                      <td className="px-3 py-2 text-center font-medium">{g.estimatedParticipants}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => { if (confirm('Delete?')) deleteTargetMut.mutate(g.id); }}
                          className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {targetGroups.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">No target groups yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-semibold text-gray-700">Add Target Group</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="EDT Level (e.g. Level 1)" value={newTarget.edtLevel}
                onChange={e => setNewTarget(p => ({ ...p, edtLevel: e.target.value }))} className="input" />
              <input placeholder="Sector group *" value={newTarget.sectorGroup}
                onChange={e => setNewTarget(p => ({ ...p, sectorGroup: e.target.value }))} className="input" />
              <input placeholder="Est. participants" type="number" min={0} value={newTarget.estimatedParticipants || ''}
                onChange={e => setNewTarget(p => ({ ...p, estimatedParticipants: Number(e.target.value) }))} className="input" />
            </div>
            <button onClick={() => addTargetMut.mutate()} disabled={addTargetMut.isPending || !newTarget.sectorGroup.trim()}
              className="btn-primary text-sm flex items-center gap-1.5">
              <Plus size={14} /> {addTargetMut.isPending ? 'Adding…' : 'Add Target Group'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
