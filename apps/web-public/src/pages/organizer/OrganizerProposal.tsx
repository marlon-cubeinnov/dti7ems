import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizerApi, staffApi, eventsApi, tnaApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, Save, UserCheck, Rocket, ClipboardList, Upload, FileCheck, ExternalLink } from 'lucide-react';

const PROPOSAL_TYPES = [
  { value: '', label: '— Select —', group: '' },
  { value: 'BUSINESS', label: 'Business Training', group: 'Training' },
  { value: 'MANAGERIAL', label: 'Managerial Training', group: 'Training' },
  { value: 'ORGANIZATIONAL', label: 'Organizational Training', group: 'Training' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial Training', group: 'Training' },
  { value: 'INTER_AGENCY', label: 'Inter-Agency Training', group: 'Training' },
  { value: 'SEMINAR', label: 'Seminar', group: 'Events' },
  { value: 'FORUM', label: 'Forum / Panel Discussion', group: 'Events' },
  { value: 'CONFERENCE', label: 'Conference', group: 'Events' },
  { value: 'TRADE_FAIR', label: 'Trade Fair / Exhibit', group: 'Events' },
  { value: 'TRADE_MISSION', label: 'Trade Mission', group: 'Events' },
  { value: 'CONSULTATION', label: 'Consultation / Meeting', group: 'Events' },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('details');
  const [msg, setMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Upload approved proposal doc
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Assign Event/Training Lead
  const [staffSearch, setStaffSearch] = useState('');  
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Inline edit mode for proposal narrative fields — auto-activate when ?edit=1
  const [isEditMode, setIsEditMode] = useState(() => searchParams.get('edit') === '1');
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

  const { data: linkedTnaData } = useQuery({
    queryKey: ['tna-linked', id],
    queryFn: () => tnaApi.listTnas({ linkedEventId: id!, limit: 10 }),
    enabled: !!id,
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
  const canModifyItems = ['DRAFT', 'REJECTED'].includes(proposalStatus);
  const hasLead = !!proposal?.assignedOrganizerId;
  const canActivate = proposalStatus === 'APPROVED' && event?.status === 'DRAFT'
    && (user?.role === 'PROGRAM_MANAGER' || user?.role === 'EVENT_ORGANIZER' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN');

  // Save proposal narrative fields
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
      setIsEditMode(false);
      setSearchParams({}, { replace: true });
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to save.'),
  });

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
      setMsg(action === 'APPROVE' ? 'Proposal approved. You can now upload the signed document and assign a facilitator.' : 'Proposal rejected.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const uploadMut = useMutation({
    mutationFn: () => organizerApi.uploadApprovedProposal(id!, uploadFile!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      setUploadFile(null);
      setMsg('Signed proposal document uploaded successfully.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Upload failed.'),
  });

  const assignMut = useMutation({
    mutationFn: () => {
      const selected = staffList.find((s: any) => s.id === selectedLeadId);
      const name = selected ? `${selected.firstName} ${selected.lastName}` : undefined;
      const email = selected?.email;
      return organizerApi.assignOrganizer(id!, selectedLeadId, name, email);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposal', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
      setMsg('Event/Training Lead assigned. They will receive a notification.');
      setErrMsg('');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed to assign lead.'),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff', staffSearch],
    queryFn: () => staffApi.search(staffSearch || undefined),
    enabled: proposalStatus === 'APPROVED',
  });
  const staffList: any[] = (staffData as any)?.data ?? [];

  // Responsible person autocomplete (Risk Register)
  const [riskPersonSearch, setRiskPersonSearch] = useState('');
  const { data: riskPersonData } = useQuery({
    queryKey: ['staff-risk', riskPersonSearch],
    queryFn: () => staffApi.search(riskPersonSearch),
    enabled: riskPersonSearch.length > 0,
  });
  const riskPersonList: any[] = (riskPersonData as any)?.data ?? [];

  // Responsible person autocomplete for editing existing risk rows
  const [editRiskPersonSearch, setEditRiskPersonSearch] = useState('');
  const { data: editRiskPersonData } = useQuery({
    queryKey: ['staff-risk-edit', editRiskPersonSearch],
    queryFn: () => staffApi.search(editRiskPersonSearch),
    enabled: editRiskPersonSearch.length > 0,
  });
  const editRiskPersonList: any[] = (editRiskPersonData as any)?.data ?? [];

  // Budget mutations
  const [newBudget, setNewBudget] = useState<BudgetItem>({ item: '', unitCost: 0, quantity: 1, estimatedAmount: 0, sourceOfFunds: '', actualSpent: null });

  // Inline edit state for budget rows
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetDraft, setEditBudgetDraft] = useState<BudgetItem>({ item: '', unitCost: 0, quantity: 1, estimatedAmount: 0, sourceOfFunds: '', actualSpent: null });

  const addBudgetMut = useMutation({
    mutationFn: () => organizerApi.addBudgetItem(id!, { ...newBudget, orderIndex: budgetItems.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget', id] });
      setNewBudget({ item: '', unitCost: 0, quantity: 1, estimatedAmount: 0, sourceOfFunds: '', actualSpent: null });
      setMsg('Budget item added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const updateBudgetMut = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Record<string, unknown> }) =>
      organizerApi.updateBudgetItem(id!, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budget', id] });
      setEditingBudgetId(null);
      setMsg('Budget item updated.');
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

  // Inline edit state for risk rows
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editRiskDraft, setEditRiskDraft] = useState<RiskItem>({ riskDescription: '', actionPlan: '', responsiblePerson: '' });

  const addRiskMut = useMutation({
    mutationFn: () => organizerApi.addRisk(id!, { ...newRisk, orderIndex: riskItems.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risks', id] });
      setNewRisk({ riskDescription: '', actionPlan: '', responsiblePerson: '' });
      setMsg('Risk item added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const updateRiskMut = useMutation({
    mutationFn: ({ riskId, data }: { riskId: string; data: Record<string, unknown> }) =>
      organizerApi.updateRisk(id!, riskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risks', id] });
      setEditingRiskId(null);
      setMsg('Risk item updated.');
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

  // Inline edit state for target rows
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetDraft, setEditTargetDraft] = useState<TargetGroup>({ edtLevel: '', sectorGroup: '', estimatedParticipants: 0 });

  const addTargetMut = useMutation({
    mutationFn: () => organizerApi.addTargetGroup(id!, { ...newTarget, orderIndex: targetGroups.length }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['target-groups', id] });
      setNewTarget({ edtLevel: '', sectorGroup: '', estimatedParticipants: 0 });
      setMsg('Target group added.');
    },
    onError: (err) => setErrMsg(err instanceof ApiError ? err.message : 'Failed.'),
  });

  const updateTargetMut = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: Record<string, unknown> }) =>
      organizerApi.updateTargetGroup(id!, groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['target-groups', id] });
      setEditingTargetId(null);
      setMsg('Target group updated.');
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
          <Link to="/organizer/proposals" className="text-gray-500 hover:text-gray-700 mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Event & Training Proposal</h1>
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
              <p className="label">Event / Training Type</p>
              {isEditMode ? (
                <select className="input" value={trainingType} onChange={e => setTrainingType(e.target.value)}>
                  <option value="">— Select Type —</option>
                  <optgroup label="Training">
                    {PROPOSAL_TYPES.filter(t => t.group === 'Training').map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Events">
                    {PROPOSAL_TYPES.filter(t => t.group === 'Events').map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <p className="text-sm text-gray-900 py-2">{PROPOSAL_TYPES.find(t => t.value === proposal?.trainingType)?.label ?? '—'}</p>
              )}
            </div>
            <div>
              <p className="label">Partner Institution</p>
              {isEditMode ? (
                <input className="input" value={partnerInstitution} onChange={e => setPartnerInstitution(e.target.value)} placeholder="e.g. DOST-7, TESDA" />
              ) : (
                <p className="text-sm text-gray-900 py-2">{proposal?.partnerInstitution || '—'}</p>
              )}
            </div>
          </div>

          <div>
            <p className="label">Background / Rationale</p>
            {isEditMode ? (
              <textarea className="input min-h-[80px]" value={background} onChange={e => setBackground(e.target.value)} placeholder="Background and justification…" />
            ) : proposal?.background ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.background}</p>
            ) : <p className="text-sm text-gray-400 italic">Not provided</p>}
          </div>

          <div>
            <p className="label">Objectives</p>
            {isEditMode ? (
              <textarea className="input min-h-[80px]" value={objectives} onChange={e => setObjectives(e.target.value)} placeholder="General and specific objectives…" />
            ) : proposal?.objectives ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.objectives}</p>
            ) : <p className="text-sm text-gray-400 italic">Not provided</p>}
          </div>

          <div>
            <p className="label">Expected Learning Outcomes</p>
            {isEditMode ? (
              <textarea className="input min-h-[80px]" value={learningOutcomes} onChange={e => setLearningOutcomes(e.target.value)} placeholder="At the end of the training, participants should be able to…" />
            ) : proposal?.learningOutcomes ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.learningOutcomes}</p>
            ) : <p className="text-sm text-gray-400 italic">Not provided</p>}
          </div>

          <div>
            <p className="label">Methodology</p>
            {isEditMode ? (
              <textarea className="input min-h-[80px]" value={methodology} onChange={e => setMethodology(e.target.value)} placeholder="Lecture, workshop, hands-on…" />
            ) : proposal?.methodology ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.methodology}</p>
            ) : <p className="text-sm text-gray-400 italic">Not provided</p>}
          </div>

          <div>
            <p className="label">Monitoring &amp; Evaluation Plan</p>
            {isEditMode ? (
              <textarea className="input min-h-[80px]" value={monitoringPlan} onChange={e => setMonitoringPlan(e.target.value)} placeholder="How effectiveness will be measured post-training…" />
            ) : proposal?.monitoringPlan ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.monitoringPlan}</p>
            ) : <p className="text-sm text-gray-400 italic">Not provided</p>}
          </div>

          {(() => {
            const isTech = user?.role === 'PROGRAM_MANAGER' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN';
            const canEdit    = isTech && ['DRAFT', 'REJECTED'].includes(proposalStatus);
            const canSubmit  = isTech && ['DRAFT', 'REJECTED'].includes(proposalStatus);
            const canReview  = (user?.role === 'DIVISION_CHIEF' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && proposalStatus === 'SUBMITTED';
            const canApprove = (user?.role === 'REGIONAL_DIRECTOR' || user?.role === 'PROVINCIAL_DIRECTOR' || user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && ['SUBMITTED', 'UNDER_REVIEW'].includes(proposalStatus);
            if (!canEdit && !canSubmit && !canReview && !canApprove) return null;
            return (
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                {isEditMode ? (
                  <>
                    <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="btn-primary flex items-center gap-2">
                      <Save size={16} /> {saveMut.isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setSearchParams({}, { replace: true });
                        setTrainingType(proposal?.trainingType ?? '');
                        setPartnerInstitution(proposal?.partnerInstitution ?? '');
                        setBackground(proposal?.background ?? '');
                        setObjectives(proposal?.objectives ?? '');
                        setLearningOutcomes(proposal?.learningOutcomes ?? '');
                        setMethodology(proposal?.methodology ?? '');
                        setMonitoringPlan(proposal?.monitoringPlan ?? '');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <button onClick={() => setIsEditMode(true)} className="btn-primary flex items-center gap-2">
                        <Pencil size={16} /> Edit Proposal
                      </button>
                    )}
                    {canSubmit && (
                      <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending} className="btn-secondary">
                        {submitMut.isPending ? 'Submitting…' : 'Submit for Review'}
                      </button>
                    )}
                    {canReview && (
                      <button onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">
                        {reviewMut.isPending ? 'Processing…' : 'Mark Under Review'}
                      </button>
                    )}
                    {canApprove && (
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
                  </>
                )}
              </div>
            );
          })()}

          {/* Assign Event/Training Lead — shown when APPROVED, for PM/Admin */}
          {proposalStatus === 'APPROVED' && ['PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '') && (
            <div className="border-t pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-800">Assign Event / Training Lead</h3>
                {hasLead && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Assigned</span>
                )}
              </div>
              {hasLead && !selectedLeadId ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      {proposal.assignedOrganizerName || 'Lead'} <span className="text-xs text-green-600">(Event/Training Lead)</span>
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">A notification has been sent to this person.</p>
                  </div>
                  <button
                    onClick={() => { setSelectedLeadId('x'); setStaffSearch(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500">
                    Search and select the staff member who will lead this event/training. They will receive an email notification once assigned.
                  </p>
                  <input
                    className="input text-sm"
                    placeholder="Search by name or email…"
                    value={staffSearch}
                    onChange={e => { setStaffSearch(e.target.value); setSelectedLeadId(''); }}
                  />
                  {staffSearch && staffList.length > 0 && (
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white shadow-sm">
                      {staffList.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSelectedLeadId(s.id); setStaffSearch(`${s.firstName} ${s.lastName}`); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedLeadId === s.id ? 'bg-blue-50 text-blue-700' : 'text-gray-800'}`}
                        >
                          <span className="font-medium">{s.firstName} {s.lastName}</span>
                          <span className="ml-2 text-xs text-gray-400">{s.email}</span>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.role.replace(/_/g, ' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {staffSearch && staffList.length === 0 && (
                    <p className="text-xs text-gray-400">No staff members found.</p>
                  )}
                  <button
                    onClick={() => assignMut.mutate()}
                    disabled={!selectedLeadId || selectedLeadId === 'x' || assignMut.isPending}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <UserCheck size={15} /> {assignMut.isPending ? 'Assigning…' : 'Assign as Event/Training Lead'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3 — Activate Event, unlocked once lead is assigned */}
          {canActivate && (
            <div className="border-t pt-5">
              <div className={`rounded-xl border-2 border-dashed p-5 space-y-3 ${hasLead ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Rocket size={18} className={hasLead ? 'text-green-600' : 'text-gray-400'} />
                  <h3 className={`text-sm font-semibold ${hasLead ? 'text-green-800' : 'text-gray-500'}`}>Step 3 — Facilitate Pre-Activity Requirements</h3>
                </div>
                <p className={`text-xs ${hasLead ? 'text-green-700' : 'text-gray-400'}`}>
                  {hasLead
                    ? <span>The proposal is approved and a lead is assigned. Activating the event will publish it and auto-generate the <strong>DTI Training Monitoring Checklist (FM-CT-7)</strong> with all standard pre-training, actual training, and post-training tasks.</span>
                    : 'Assign an Event/Training Lead above to unlock this step.'}
                </p>
                <button
                  onClick={() => activateMut.mutate()}
                  disabled={!hasLead || activateMut.isPending}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${hasLead ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <Rocket size={15} /> {activateMut.isPending ? 'Activating…' : 'Activate Event & Start Pre-Activity'}
                </button>
              </div>
            </div>
          )}

          {/* Upload Signed / Approved Proposal Document */}
          {proposalStatus === 'APPROVED' && (
            <div className="border-t pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-800">Signed / Approved Proposal Document</h3>
              </div>

              {proposal?.approvedProposalUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                  <FileCheck size={18} className="text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-800">Uploaded document on file</p>
                    <a
                      href={proposal.approvedProposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5 break-all"
                    >
                      <ExternalLink size={11} /> {proposal.approvedProposalUrl}
                    </a>
                  </div>
                  {/* Allow re-upload to replace */}
                  {['PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '') && (
                    <label className="btn-secondary text-xs cursor-pointer shrink-0">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-5 space-y-3">
                  <p className="text-xs text-blue-700">
                    Upload the scanned copy of the signed/approved proposal document (PDF, JPEG, or PNG, max 20 MB). It will be stored on Google Drive.
                  </p>
                  <label className="flex items-center gap-2 w-fit cursor-pointer btn-secondary text-sm">
                    <Upload size={14} />
                    {uploadFile ? uploadFile.name : 'Choose file…'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              )}

              {uploadFile && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 truncate max-w-xs">{uploadFile.name}</span>
                  <button
                    onClick={() => uploadMut.mutate()}
                    disabled={uploadMut.isPending}
                    className="btn-primary text-sm flex items-center gap-2 shrink-0"
                  >
                    <Upload size={14} /> {uploadMut.isPending ? 'Uploading…' : 'Upload to Google Drive'}
                  </button>
                  <button onClick={() => setUploadFile(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              )}
            </div>
          )}

          {/* TNA Reference */}
          <div className="border-t pt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Training Needs Assessment (TNA)</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <RouterLink to="/organizer/tna" className="text-xs text-blue-600 hover:underline font-medium">
                Manage TNAs →
              </RouterLink>
            </div>
            {(() => {
              const tnas = ((linkedTnaData as unknown as Record<string, unknown>)?.data as unknown[]) ?? [];
              if (tnas.length === 0) {
                return (
                  <p className="text-xs text-gray-500">
                    No TNA linked to this proposal.{' '}
                    <RouterLink to="/organizer/tna/new" className="text-blue-600 hover:underline">Create a TNA</RouterLink>
                    {' '}and set this proposal as its reference, or link an existing one from the{' '}
                    <RouterLink to="/organizer/tna" className="text-blue-600 hover:underline">TNA list</RouterLink>.
                  </p>
                );
              }
              return (
                <div className="space-y-1.5">
                  {tnas.map((t: unknown) => {
                    const tna = t as Record<string, unknown>;
                    const finalized = tna.status === 'FINALIZED';
                    return (
                      <div key={tna.id as string} className="flex items-center justify-between gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{tna.title as string}</p>
                          <p className="text-[10px] text-gray-500">{tna.sector as string}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${finalized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {finalized ? 'Finalized' : 'Draft'}
                          </span>
                          <RouterLink to={`/organizer/tna/${tna.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                            View →
                          </RouterLink>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
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
                    editingBudgetId === b.id ? (
                      <tr key={b.id} className="bg-blue-50">
                        <td className="px-2 py-1.5"><input className="input text-xs py-1" value={editBudgetDraft.item} onChange={e => setEditBudgetDraft(p => ({ ...p, item: e.target.value }))} /></td>
                        <td className="px-2 py-1.5"><input type="number" min={0} step={0.01} className="input text-xs py-1 text-right" value={editBudgetDraft.unitCost || ''} onChange={e => { const uc = Number(e.target.value); setEditBudgetDraft(p => ({ ...p, unitCost: uc, estimatedAmount: uc * p.quantity })); }} /></td>
                        <td className="px-2 py-1.5"><input type="number" min={1} className="input text-xs py-1 text-center" value={editBudgetDraft.quantity || ''} onChange={e => { const q = Number(e.target.value) || 1; setEditBudgetDraft(p => ({ ...p, quantity: q, estimatedAmount: p.unitCost * q })); }} /></td>
                        <td className="px-2 py-1.5"><input type="number" min={0} step={0.01} className="input text-xs py-1 text-right" value={editBudgetDraft.estimatedAmount || ''} onChange={e => setEditBudgetDraft(p => ({ ...p, estimatedAmount: Number(e.target.value) }))} /></td>
                        <td className="px-2 py-1.5"><input className="input text-xs py-1" value={editBudgetDraft.sourceOfFunds ?? ''} onChange={e => setEditBudgetDraft(p => ({ ...p, sourceOfFunds: e.target.value }))} /></td>
                        <td className="px-2 py-1.5 text-right text-gray-400 text-xs">—</td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-1">
                            <button onClick={() => updateBudgetMut.mutate({ itemId: b.id, data: { ...editBudgetDraft } })} disabled={updateBudgetMut.isPending || !editBudgetDraft.item.trim()} className="text-blue-600 hover:text-blue-800"><Save size={14} /></button>
                            <button onClick={() => setEditingBudgetId(null)} className="text-gray-400 hover:text-gray-600"><span className="text-xs">✕</span></button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{b.item}</td>
                        <td className="px-3 py-2 text-right text-gray-600">₱{Number(b.unitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{b.quantity}</td>
                        <td className="px-3 py-2 text-right font-medium">₱{Number(b.estimatedAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-gray-600">{b.sourceOfFunds ?? '—'}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{b.actualSpent != null ? `₱${Number(b.actualSpent).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1.5">
                            {canModifyItems && (
                              <button onClick={() => { setEditingBudgetId(b.id); setEditBudgetDraft({ item: b.item, unitCost: Number(b.unitCost), quantity: b.quantity, estimatedAmount: Number(b.estimatedAmount), sourceOfFunds: b.sourceOfFunds ?? '', actualSpent: b.actualSpent }); }} className="text-gray-400 hover:text-blue-500"><Pencil size={13} /></button>
                            )}
                            {canModifyItems && (
                              <button onClick={() => { if (confirm('Delete?')) deleteBudgetMut.mutate(b.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                  {budgetItems.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-gray-400">No budget items yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add budget item */}
          {canModifyItems && (
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
          )}
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
              <div className="relative">
                <input
                  placeholder="Search DTI employee…"
                  value={newRisk.responsiblePerson}
                  onChange={e => {
                    setNewRisk(p => ({ ...p, responsiblePerson: e.target.value }));
                    setRiskPersonSearch(e.target.value);
                  }}
                  className="input w-full"
                  autoComplete="off"
                />
                {riskPersonSearch.length > 0 && riskPersonList.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white shadow-md">
                    {riskPersonList.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setNewRisk(p => ({ ...p, responsiblePerson: `${s.firstName} ${s.lastName}` }));
                          setRiskPersonSearch('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                        <span className="ml-2 text-xs text-gray-400">{s.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {riskPersonSearch.length > 0 && riskPersonList.length === 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-md px-3 py-2">
                    <p className="text-xs text-gray-400">No DTI employees found.</p>
                  </div>
                )}
              </div>
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
