import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tnaApi, ApiError } from '@/lib/api';
import { ChevronLeft, Plus, Trash2, CheckCircle2, ClipboardList } from 'lucide-react';

const RESPONDENT_TYPES = [
  { value: 'MSME_OWNER', label: 'MSME Owner / Business Proprietor' },
  { value: 'MANAGER', label: 'Manager / Supervisor' },
  { value: 'EMPLOYEE', label: 'Employee / Staff' },
  { value: 'DTI_OFFICER', label: 'DTI Officer' },
  { value: 'PARTNER_AGENCY', label: 'Partner Agency Representative' },
  { value: 'OTHER', label: 'Other' },
];
const DELIVERY_MODES = ['Face-to-Face', 'Online / Webinar', 'Blended / Hybrid', 'On-the-Job / Coaching', 'No Preference'];
const SCHEDULE_PREFS = ['Weekday Mornings', 'Weekday Afternoons', 'Saturday', 'Full-Day Saturday', 'Flexible'];

const SCREEN_QUESTIONS = [
  'Is there a performance gap compared to defined industry standards, or customer expectations?',
  'Is the gap caused by lack of knowledge, skills, or attitudes (not equipment/policy/resource issues)?',
  'Will addressing this gap through training improve business outcomes (productivity, sales, quality, compliance)?',
  'Does the training align with DTI priorities / MSME development roadmap?',
  'Is there demand from multiple MSMEs or sector-wide need (not just one individual\'s interest)?',
];

const SCORE_CRITERIA = [
  { label: 'Performance Gap Severity', hint: '1=No gap; 3=Moderate; 5=Critical gap vs. standards/KPIs', key: 'scorePerfGap' },
  { label: 'Skill/Knowledge Deficiency (Training-related)', hint: '1=Not training-related; 3=Somewhat; 5=Entirely training-related', key: 'scoreSkillDef' },
  { label: 'Business/Organizational Relevance', hint: '1=No impact; 3=Moderate; 5=Critical impact', key: 'scoreBizRel' },
  { label: 'Urgency (Timing)', hint: '1=Not urgent; 3=Medium; 5=Immediate', key: 'scoreUrgency' },
  { label: 'Demand Across MSMEs', hint: '1=Individual; 3=Some sectors; 5=Nationwide/sector-wide', key: 'scoreDemand' },
];

interface TnaRespondentForm {
  respondentType: string;
  organizationName: string;
  sector: string;
  province: string;
  preferredDelivery: string;
  preferredSchedule: string;
  currentSkillLevel: number;
  desiredSkillLevel: number;
  notes: string;
}

const DEFAULT_RESPONDENT: TnaRespondentForm = {
  respondentType: 'MSME_OWNER',
  organizationName: '',
  sector: '',
  province: '',
  preferredDelivery: 'Face-to-Face',
  preferredSchedule: 'Weekday Mornings',
  currentSkillLevel: 2,
  desiredSkillLevel: 4,
  notes: '',
};

export default function OrganizerTnaPage() {
  const { tnaId } = useParams<{ tnaId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // TNA form state
  const [tnaTitle, setTnaTitle] = useState('');
  const [tnaSector, setTnaSector] = useState('');
  const [tnaRegion, setTnaRegion] = useState('');
  const [tnaDescription, setTnaDescription] = useState('');
  const [tnaConductedAt, setTnaConductedAt] = useState('');
  const [tnaSummary, setTnaSummary] = useState('');
  const [tnaTopics, setTnaTopics] = useState('');
  const [screenQ1, setScreenQ1] = useState<boolean | null>(null);
  const [screenQ2, setScreenQ2] = useState<boolean | null>(null);
  const [screenQ3, setScreenQ3] = useState<boolean | null>(null);
  const [screenQ4, setScreenQ4] = useState<boolean | null>(null);
  const [screenQ5, setScreenQ5] = useState<boolean | null>(null);
  const [scorePerfGap, setScorePerfGap] = useState(0);
  const [scoreSkillDef, setScoreSkillDef] = useState(0);
  const [scoreBizRel, setScoreBizRel] = useState(0);
  const [scoreUrgency, setScoreUrgency] = useState(0);
  const [scoreDemand, setScoreDemand] = useState(0);
  const [newRespondent, setNewRespondent] = useState<TnaRespondentForm>(DEFAULT_RESPONDENT);
  const [showRespondentForm, setShowRespondentForm] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const isNew = !tnaId || tnaId === 'new';

  // TNA data query
  const { data: tnaData } = useQuery({
    queryKey: ['tna', tnaId],
    queryFn: () => tnaApi.getTna(tnaId!),
    enabled: !isNew && !!tnaId,
    retry: false,
  });

  useEffect(() => {
    if (!tnaData) return;
    const t = (tnaData as unknown as Record<string, unknown>).data as Record<string, unknown> ?? tnaData as unknown as Record<string, unknown>;
    if (typeof t.title === 'string') setTnaTitle(t.title);
    if (typeof t.sector === 'string') setTnaSector(t.sector);
    if (typeof t.targetRegion === 'string') setTnaRegion(t.targetRegion);
    if (typeof t.description === 'string') setTnaDescription(t.description);
    if (typeof t.conductedAt === 'string') setTnaConductedAt(t.conductedAt?.slice(0, 10) ?? '');
    if (typeof t.summary === 'string') setTnaSummary(t.summary);
    if (typeof t.recommendedTopics === 'string') setTnaTopics(t.recommendedTopics);
    if (typeof t.screenQ1 === 'boolean') setScreenQ1(t.screenQ1);
    if (typeof t.screenQ2 === 'boolean') setScreenQ2(t.screenQ2);
    if (typeof t.screenQ3 === 'boolean') setScreenQ3(t.screenQ3);
    if (typeof t.screenQ4 === 'boolean') setScreenQ4(t.screenQ4);
    if (typeof t.screenQ5 === 'boolean') setScreenQ5(t.screenQ5);
    if (typeof t.scorePerformanceGap === 'number') setScorePerfGap(t.scorePerformanceGap);
    if (typeof t.scoreSkillDeficiency === 'number') setScoreSkillDef(t.scoreSkillDeficiency);
    if (typeof t.scoreBusinessRelevance === 'number') setScoreBizRel(t.scoreBusinessRelevance);
    if (typeof t.scoreUrgency === 'number') setScoreUrgency(t.scoreUrgency);
    if (typeof t.scoreDemandMsmes === 'number') setScoreDemand(t.scoreDemandMsmes);
  }, [tnaData]);

  const tna = (tnaData as unknown as Record<string, unknown>)?.data as Record<string, unknown> ?? tnaData as unknown as Record<string, unknown>;
  const tnaFinalized = tna?.status === 'FINALIZED';
  const respondents = (tna?.respondents as unknown[]) ?? [];

  // Computed scores
  const screenVals = [screenQ1, screenQ2, screenQ3, screenQ4, screenQ5];
  const screenPassed = screenVals.every(v => v === true);
  const hasScores = [scorePerfGap, scoreSkillDef, scoreBizRel, scoreUrgency, scoreDemand].some(s => s > 0);
  const totalScore = scorePerfGap + scoreSkillDef + scoreBizRel + scoreUrgency + scoreDemand;
  const classification =
    totalScore >= 20 ? 'Critical Training Need' :
    totalScore >= 15 ? 'Important Training Need' :
    totalScore >= 10 ? 'Optional/Desirable but not urgent' :
    hasScores ? 'Not a Training Need' : '—';
  const suggestedAction =
    !screenPassed ? 'Consider alternatives (policy/system/resource/mentoring)' :
    totalScore >= 20 ? 'Proceed with training proposal immediately' :
    totalScore >= 15 ? 'Include in training calendar' :
    totalScore >= 10 ? 'Schedule for next quarter/cycle' :
    hasScores ? 'Consider alternatives (policy/system/resource/mentoring)' : '—';
  const classColor =
    totalScore >= 20 ? 'bg-red-100 text-red-700' :
    totalScore >= 15 ? 'bg-orange-100 text-orange-700' :
    totalScore >= 10 ? 'bg-yellow-100 text-yellow-700' :
    hasScores ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400';

  const scoreSetters: Record<string, (v: number) => void> = {
    scorePerfGap: setScorePerfGap,
    scoreSkillDef: setScoreSkillDef,
    scoreBizRel: setScoreBizRel,
    scoreUrgency: setScoreUrgency,
    scoreDemand: setScoreDemand,
  };
  const scoreValues: Record<string, number> = { scorePerfGap, scoreSkillDef, scoreBizRel, scoreUrgency, scoreDemand };

  // Mutations
  const saveTnaMut = useMutation({
    mutationFn: () => {
      const body = {
        title: tnaTitle, sector: tnaSector, targetRegion: tnaRegion,
        description: tnaDescription, conductedAt: tnaConductedAt ? new Date(tnaConductedAt).toISOString() : null,
        summary: tnaSummary, recommendedTopics: tnaTopics,
        screenQ1, screenQ2, screenQ3, screenQ4, screenQ5,
        scorePerformanceGap: scorePerfGap || null, scoreSkillDeficiency: scoreSkillDef || null,
        scoreBusinessRelevance: scoreBizRel || null, scoreUrgency: scoreUrgency || null,
        scoreDemandMsmes: scoreDemand || null,
      };
      return isNew ? tnaApi.createTna(body) : tnaApi.updateTna(tnaId!, body);
    },
    onSuccess: (res) => {
      setSaveErr('');
      if (isNew) {
        const newId = ((res as unknown as Record<string, unknown>).data as Record<string, unknown>)?.id as string;
        if (newId) navigate(`/organizer/tna/${newId}`, { replace: true });
      } else {
        qc.invalidateQueries({ queryKey: ['tna', tnaId] });
        qc.invalidateQueries({ queryKey: ['tna-list'] });
      }
    },
    onError: (e: unknown) => setSaveErr(e instanceof ApiError ? e.message : 'Save failed'),
  });

  const finalizeTnaMut = useMutation({
    mutationFn: (status: 'DRAFT' | 'FINALIZED') => tnaApi.setTnaStatus(tnaId!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tna', tnaId] }),
  });

  const addRespondentMut = useMutation({
    mutationFn: () => tnaApi.addRespondent(tnaId!, newRespondent as unknown as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tna', tnaId] });
      setNewRespondent(DEFAULT_RESPONDENT);
      setShowRespondentForm(false);
    },
  });

  const deleteRespondentMut = useMutation({
    mutationFn: (respondentId: string) => tnaApi.deleteRespondent(tnaId!, respondentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tna', tnaId] }),
  });

  const tnaRecord = tna as Record<string, unknown> | null;
  const tnaTitle_ = tnaRecord?.title as string | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Back nav */}
      <RouterLink to="/organizer/tna" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={16} /> Back to TNA List
      </RouterLink>

      {/* Document header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Department of Trade and Industry · Conduct of Training</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            {isNew ? 'New Training Needs Assessment' : (tnaTitle_ ?? 'Training Needs Assessment')}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">FM-CT-1 · Version 2 · Effectivity: January 02, 2026</p>
          {!!tnaRecord?.linkedEventId && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <ClipboardList size={13} className="text-gray-400" />
              Linked to proposal
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && tnaRecord && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              tnaFinalized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {tnaFinalized ? 'Finalized' : 'Draft'}
            </span>
          )}
        </div>
      </div>

      {/* TNA context fields */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">TNA Context</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">TNA Title *</label>
            <input className="input text-sm" placeholder="e.g., TNA — Negosyo Center Clients 2026"
              value={tnaTitle} disabled={tnaFinalized} onChange={e => setTnaTitle(e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Date Conducted</label>
            <input className="input text-sm" type="date"
              value={tnaConductedAt} disabled={tnaFinalized} onChange={e => setTnaConductedAt(e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Sector / Industry</label>
            <input className="input text-sm" placeholder="e.g., Food & Beverage"
              value={tnaSector} disabled={tnaFinalized} onChange={e => setTnaSector(e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Region / Province</label>
            <input className="input text-sm" placeholder="e.g., Region 7 / Cebu"
              value={tnaRegion} disabled={tnaFinalized} onChange={e => setTnaRegion(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label text-xs">Background / Description</label>
            <textarea className="input text-sm" rows={2} placeholder="Briefly describe the context and reason for this TNA…"
              value={tnaDescription} disabled={tnaFinalized} onChange={e => setTnaDescription(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Screening */}
      <div className="card space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section 1 — Training Need Screening</p>
          <p className="text-xs text-gray-400 mt-0.5">All 5 must be YES to confirm a training need. Any NO → suggest non-training alternative.</p>
        </div>
        {SCREEN_QUESTIONS.map((q, idx) => {
          const val = screenVals[idx];
          const setters = [setScreenQ1, setScreenQ2, setScreenQ3, setScreenQ4, setScreenQ5];
          return (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${val === true ? 'border-green-200 bg-green-50' : val === false ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <span className="text-xs font-semibold text-gray-400 mt-0.5 w-4 shrink-0">{idx + 1}.</span>
              <span className="flex-1 text-gray-700">{q}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setters[idx](true)} disabled={tnaFinalized}
                  className={`px-2 py-0.5 rounded text-xs font-semibold border transition-colors ${val === true ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-300 hover:border-green-400'}`}>YES</button>
                <button onClick={() => setters[idx](false)} disabled={tnaFinalized}
                  className={`px-2 py-0.5 rounded text-xs font-semibold border transition-colors ${val === false ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-300 hover:border-red-400'}`}>NO</button>
              </div>
            </div>
          );
        })}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${screenPassed ? 'bg-green-100 text-green-700' : screenVals.some(v => v !== null) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>
          {screenPassed ? <CheckCircle2 size={14} /> : null}
          {screenPassed ? 'Training need confirmed — proceed to scoring.' : screenVals.some(v => v !== null) ? 'Training need NOT confirmed — consider non-training interventions.' : 'Answer all questions above.'}
        </div>
      </div>

      {/* Scoring */}
      <div className="card space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section 2 — Priority Scoring (1–5)</p>
          <p className="text-xs text-gray-400 mt-0.5">Rate each criterion 1–5. Total score determines classification.</p>
        </div>
        {SCORE_CRITERIA.map(c => (
          <div key={c.key} className="space-y-1">
            <div className="flex items-baseline justify-between">
              <label className="text-xs font-medium text-gray-700">{c.label}</label>
              <span className="text-xs text-gray-400">{c.hint}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} disabled={tnaFinalized} onClick={() => scoreSetters[c.key](v)}
                  className={`w-8 h-8 rounded text-sm font-semibold border transition-colors ${scoreValues[c.key] === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'}`}>{v}</button>
              ))}
              <span className="ml-2 text-xs text-gray-400">Selected: <strong className="text-gray-700">{scoreValues[c.key] || '—'}</strong></span>
            </div>
          </div>
        ))}
        <div className={`flex items-start gap-3 p-3 rounded-lg ${classColor}`}>
          <div className="flex-1">
            <p className="text-xs font-semibold">Total Score: {totalScore}/25</p>
            <p className="text-sm font-bold mt-0.5">{classification}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-current/60">Suggested Action</p>
            <p className="text-xs font-medium mt-0.5">{suggestedAction}</p>
          </div>
        </div>
      </div>

      {/* Findings & Recommendations */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section 3 — Summary & Recommendations</p>
        <div>
          <label className="label text-xs">Key Findings / Summary</label>
          <textarea className="input text-sm" rows={3}
            placeholder="Summarize key skill gaps and training needs identified…"
            value={tnaSummary} disabled={tnaFinalized} onChange={e => setTnaSummary(e.target.value)} />
        </div>
        <div>
          <label className="label text-xs">Recommended Training Topics</label>
          <textarea className="input text-sm" rows={2}
            placeholder="List recommended topics, e.g.: Business Planning, Financial Literacy, Digital Marketing…"
            value={tnaTopics} disabled={tnaFinalized} onChange={e => setTnaTopics(e.target.value)} />
        </div>
      </div>

      {/* Save / Finalize */}
      {saveErr && <p className="text-sm text-red-600">{saveErr}</p>}
      {!tnaFinalized && (
        <div className="flex items-center gap-2">
          <button onClick={() => saveTnaMut.mutate()} disabled={saveTnaMut.isPending}
            className="btn-primary text-sm">
            {saveTnaMut.isPending ? 'Saving…' : isNew ? 'Create TNA' : 'Save TNA'}
          </button>
          {!isNew && (
            <button onClick={() => finalizeTnaMut.mutate('FINALIZED')} disabled={finalizeTnaMut.isPending}
              className="btn-secondary text-sm">
              {finalizeTnaMut.isPending ? 'Finalizing…' : 'Finalize TNA'}
            </button>
          )}
        </div>
      )}
      {!isNew && tnaFinalized && (
        <button onClick={() => finalizeTnaMut.mutate('DRAFT')} disabled={finalizeTnaMut.isPending}
          className="btn-secondary text-sm">
          {finalizeTnaMut.isPending ? 'Reopening…' : 'Reopen for Editing'}
        </button>
      )}

      {/* Respondents — only show after TNA is created */}
      {!isNew && (
        <details className="border border-gray-200 rounded-lg p-4 space-y-3">
        <summary className="cursor-pointer font-semibold text-sm text-gray-700 list-none flex items-center justify-between">
          <span>Respondents ({respondents.length})</span>
          <span className="text-xs font-normal text-gray-400">Click to expand</span>
        </summary>
        <div className="mt-4 space-y-3">
          {respondents.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No respondents added yet.</p>
          )}
          {respondents.map((r: unknown) => {
            const resp = r as Record<string, unknown>;
            const rtLabel = RESPONDENT_TYPES.find(t => t.value === resp.respondentType)?.label ?? (resp.respondentType as string);
            return (
              <div key={resp.id as string} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{resp.organizationName as string || '(No organization)'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rtLabel} · {resp.sector as string || '—'} · {resp.province as string || '—'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">Delivery: <strong className="text-gray-600">{resp.preferredDelivery as string}</strong></span>
                    <span className="text-xs text-gray-400">Schedule: <strong className="text-gray-600">{resp.preferredSchedule as string}</strong></span>
                    <span className="text-xs text-gray-400">Skill: <strong className="text-gray-600">{resp.currentSkillLevel as number}→{resp.desiredSkillLevel as number}</strong></span>
                  </div>
                </div>
                {!tnaFinalized && (
                  <button onClick={() => deleteRespondentMut.mutate(resp.id as string)}
                    disabled={deleteRespondentMut.isPending}
                    className="text-red-400 hover:text-red-600 shrink-0 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}

          {!tnaFinalized && !showRespondentForm && (
            <button onClick={() => setShowRespondentForm(true)}
              className="btn-secondary text-sm flex items-center gap-1.5 w-full justify-center">
              <Plus size={14} /> Add Respondent
            </button>
          )}

          {!tnaFinalized && showRespondentForm && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">New Respondent</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Respondent Type</label>
                  <select className="input text-sm" value={newRespondent.respondentType}
                    onChange={e => setNewRespondent(p => ({ ...p, respondentType: e.target.value }))}>
                    {RESPONDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Organization Name</label>
                  <input className="input text-sm" placeholder="e.g., Dela Cruz Bakeshop"
                    value={newRespondent.organizationName}
                    onChange={e => setNewRespondent(p => ({ ...p, organizationName: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Sector / Industry</label>
                  <input className="input text-sm" placeholder="e.g., Food & Beverage"
                    value={newRespondent.sector}
                    onChange={e => setNewRespondent(p => ({ ...p, sector: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Province</label>
                  <input className="input text-sm" placeholder="e.g., Cebu"
                    value={newRespondent.province}
                    onChange={e => setNewRespondent(p => ({ ...p, province: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Preferred Delivery Mode</label>
                  <select className="input text-sm" value={newRespondent.preferredDelivery}
                    onChange={e => setNewRespondent(p => ({ ...p, preferredDelivery: e.target.value }))}>
                    {DELIVERY_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Preferred Schedule</label>
                  <select className="input text-sm" value={newRespondent.preferredSchedule}
                    onChange={e => setNewRespondent(p => ({ ...p, preferredSchedule: e.target.value }))}>
                    {SCHEDULE_PREFS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Current Skill Level (1–5)</label>
                  <input className="input text-sm" type="number" min={1} max={5}
                    value={newRespondent.currentSkillLevel}
                    onChange={e => setNewRespondent(p => ({ ...p, currentSkillLevel: +e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Desired Skill Level (1–5)</label>
                  <input className="input text-sm" type="number" min={1} max={5}
                    value={newRespondent.desiredSkillLevel}
                    onChange={e => setNewRespondent(p => ({ ...p, desiredSkillLevel: +e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">Notes</label>
                  <textarea className="input text-sm" rows={2}
                    placeholder="Any additional notes…"
                    value={newRespondent.notes}
                    onChange={e => setNewRespondent(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => addRespondentMut.mutate()} disabled={addRespondentMut.isPending}
                  className="btn-primary text-sm flex items-center gap-1.5">
                  <Plus size={14} /> {addRespondentMut.isPending ? 'Adding…' : 'Add Respondent'}
                </button>
                <button onClick={() => { setShowRespondentForm(false); setNewRespondent(DEFAULT_RESPONDENT); }}
                  className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </details>
      )}
    </div>
  );
}
