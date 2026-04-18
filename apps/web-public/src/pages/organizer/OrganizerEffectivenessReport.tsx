import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveyApi, organizerApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const BENEFIT_LABELS: Record<string, string> = {
  benefitIncreasedSales: 'Increased sales',
  benefitIncreasedProfit: 'Increased profit',
  benefitCostReduction: 'Cost reduction',
  benefitNewMarkets: 'Accessed new markets',
  benefitProductivity: 'Improved productivity',
  benefitManpowerWelfare: 'Improved manpower welfare',
  benefitStandardizedOp: 'Standardized operations',
  benefitBookkeeping: 'Started/improved bookkeeping',
  benefitImprovedMgmt: 'Improved management',
  benefitSetupBusiness: 'Set up new business',
  benefitExpandBusiness: 'Expanded business',
  benefitEnhancedCapacity: 'Enhanced capacity',
  benefitAdoptTechnology: 'Adopted technology',
  benefitInnovation: 'Innovation',
  benefitNoComplaints: 'No customer complaints',
};

type EffectivenessData = {
  totalParticipants: number;
  totalResponses: number;
  responseRate: number;
  meetsThreshold: boolean;
  appliedLearnings: { yes: number; no: number };
  trainingEffective: { yes: number; no: number };
  benefitSummary: Array<{ key: string; yesCount: number; noCount: number }>;
  evaluations: Array<{ id: string; userId: string; submittedAt: string; eval: Record<string, any> }>;
};

export function OrganizerEffectivenessReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [observations, setObservations] = useState('');
  const [temMsg, setTemMsg] = useState('');

  const role = user?.role ?? '';
  const isStaff   = ['EVENT_ORGANIZER', 'PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
  const isChief   = ['DIVISION_CHIEF', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);
  const isApprover = ['REGIONAL_DIRECTOR', 'PROVINCIAL_DIRECTOR', 'SYSTEM_ADMIN', 'SUPER_ADMIN'].includes(role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['effectiveness-report', id],
    queryFn: () => surveyApi.getEffectivenessReport(id!),
    enabled: !!id,
  });

  const report = (data as any)?.data as EffectivenessData | null | undefined;

  const { data: temData, isLoading: temLoading } = useQuery({
    queryKey: ['tem-report', id],
    queryFn: () => organizerApi.getTem(id!),
    enabled: !!id,
  });
  const tem = (temData as any)?.data as any;

  const saveTemMut = useMutation({
    mutationFn: () => organizerApi.saveTem(id!, { observations: observations || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tem-report', id] });
      setTemMsg('Report saved.');
      setTimeout(() => setTemMsg(''), 3000);
    },
  });

  const temStatusMut = useMutation({
    mutationFn: (status: string) => organizerApi.updateTemStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tem-report', id] });
    },
  });

  // Pre-fill observations from existing TEM record
  const temObservations = tem?.observations ?? '';

  const TEM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT:           { label: 'Draft',           color: 'bg-gray-100 text-gray-700' },
    UNDER_REVIEW:    { label: 'Under Review',     color: 'bg-yellow-100 text-yellow-700' },
    APPROVED:        { label: 'Approved',         color: 'bg-green-100 text-green-700' },
    SUBMITTED_TO_MAA:{ label: 'Submitted to MAA', color: 'bg-blue-100 text-blue-700' },
  };
  const temStatus = tem?.status ?? null;
  const temStatusInfo = temStatus ? (TEM_STATUS_LABELS[temStatus] ?? TEM_STATUS_LABELS['DRAFT']) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <button
          onClick={() => navigate(`/organizer/events/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back to Event
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Effectiveness Report (FM-CT-5)</h1>
            <p className="text-sm text-gray-500 mt-1">Step 7 — Monitoring and Evaluation · Collect 6 months after conduct of training</p>
          </div>
          {temStatusInfo && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${temStatusInfo.color}`}>
              {temStatusInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* Step 7 TEM Report Panel */}
      <div className="card space-y-4 border border-indigo-200 bg-indigo-50/30">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">7</span>
          <h2 className="font-semibold text-gray-900">Monitoring and Evaluation Report</h2>
        </div>
        <p className="text-sm text-gray-600">
          Per ONE DTI QMS, TEM forms (FM-CT-5) must be collected at least <strong>6 months after training</strong>.
          Minimum response threshold: <strong>5% of total participants</strong>.
          Tabulate results below, then submit for Division Chief review and PD/RD approval before forwarding to MAA.
        </p>

        {/* 6-month collection window indicator */}
        {report && (
          <div className={`text-sm px-3 py-2 rounded-lg font-medium ${
            report.meetsThreshold ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {report.meetsThreshold
              ? `✓ Response threshold met (${report.responseRate}% ≥ 5%)`
              : `⚠ Response threshold NOT met (${report.responseRate}% < 5% required). Continue collecting forms.`}
          </div>
        )}

        {/* Observations field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Tabulation Summary &amp; Analysis</label>
          <textarea
            rows={4}
            className="input w-full resize-none"
            maxLength={10000}
            placeholder="Summarize the TEM results: key observations, improvement recommendations, and analysis for ManCom agenda..."
            defaultValue={temObservations}
            onChange={e => setObservations(e.target.value)}
            disabled={!isStaff || (temStatus && temStatus !== 'DRAFT')}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 items-center flex-wrap">
          {isStaff && (!temStatus || temStatus === 'DRAFT') && (
            <button
              className="btn-primary"
              disabled={saveTemMut.isPending}
              onClick={() => saveTemMut.mutate()}
            >
              {saveTemMut.isPending ? 'Saving…' : tem ? 'Update Report' : 'Save Report'}
            </button>
          )}

          {/* 7.3: Submit for Division Chief review */}
          {tem && temStatus === 'DRAFT' && isStaff && (
            <button
              className="btn-outline"
              disabled={temStatusMut.isPending}
              onClick={() => temStatusMut.mutate('UNDER_REVIEW')}
            >
              Submit for Review (Div. Chief)
            </button>
          )}

          {/* 7.3: Division Chief reviews → forward to PD/RD */}
          {tem && temStatus === 'UNDER_REVIEW' && isChief && !isApprover && (
            <button
              className="btn-outline border-blue-500 text-blue-700 hover:bg-blue-50"
              disabled={temStatusMut.isPending}
              onClick={() => temStatusMut.mutate('APPROVED')}
            >
              Mark as Reviewed (Forward to PD/RD)
            </button>
          )}

          {/* 7.3: PD/RD approves */}
          {tem && temStatus === 'UNDER_REVIEW' && isApprover && (
            <button
              className="btn-outline border-green-500 text-green-700 hover:bg-green-50"
              disabled={temStatusMut.isPending}
              onClick={() => temStatusMut.mutate('APPROVED')}
            >
              Approve
            </button>
          )}

          {/* 7.4: Submit to MAA for ManCom Agenda */}
          {tem && temStatus === 'APPROVED' && isApprover && (
            <button
              className="btn-outline border-purple-500 text-purple-700 hover:bg-purple-50"
              disabled={temStatusMut.isPending}
              onClick={() => temStatusMut.mutate('SUBMITTED_TO_MAA')}
            >
              Submit to MAA (ManCom Agenda)
            </button>
          )}

          {tem && temStatus === 'SUBMITTED_TO_MAA' && (
            <span className="text-sm text-blue-700 font-medium">
              ✓ Submitted to MAA on {tem.dateSubmittedToMaa ? new Date(tem.dateSubmittedToMaa).toLocaleDateString() : '—'}
            </span>
          )}

          {temMsg && <span className="text-sm text-green-600">{temMsg}</span>}
        </div>

        {/* Signatories */}
        {tem && (
          <div className="border-t border-gray-200 pt-4 grid sm:grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Prepared by', name: tem.preparedByName, date: tem.datePrepared, role: 'Technical Staff' },
              { label: 'Reviewed by', name: tem.reviewedByName, date: tem.dateReviewed, role: 'Division Chief' },
              { label: 'Approved by', name: tem.approvedByName, date: tem.dateApproved, role: 'PD / RD' },
              { label: 'Submitted to MAA', name: tem.submittedToMaaByName, date: tem.dateSubmittedToMaa, role: 'For ManCom' },
            ].map(s => (
              <div key={s.label} className="space-y-0.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="font-medium text-gray-900">{s.name ?? 'Pending'}</p>
                {s.date && <p className="text-xs text-gray-400">{new Date(s.date).toLocaleDateString()}</p>}
                <p className="text-xs text-gray-500">{s.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
        </div>
      ) : isError ? (
        <div className="card text-red-600">Failed to load effectiveness report.</div>
      ) : !report || report.totalResponses === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="text-lg">No effectiveness evaluations yet.</p>
          <p className="text-sm mt-1">Evaluations will appear here once participants complete their FM-CT-5 forms.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900">{report.totalParticipants}</p>
              <p className="text-xs text-gray-500">Total Participants</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900">{report.totalResponses}</p>
              <p className="text-xs text-gray-500">Responses</p>
            </div>
            <div className="card text-center">
              <p className={`text-2xl font-bold ${report.meetsThreshold ? 'text-green-600' : 'text-red-600'}`}>
                {report.responseRate}%
              </p>
              <p className="text-xs text-gray-500">Response Rate {!report.meetsThreshold && '(Below 5%)'}</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900">
                {report.trainingEffective.yes + report.trainingEffective.no > 0
                  ? `${Math.round((report.trainingEffective.yes / (report.trainingEffective.yes + report.trainingEffective.no)) * 100)}%`
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Effectiveness Rate</p>
            </div>
          </div>

          {/* Applied Learnings + Effectiveness */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Applied Learnings</h3>
              <div className="flex gap-4">
                <div className="flex-1 text-center bg-green-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-green-700">{report.appliedLearnings.yes}</p>
                  <p className="text-xs text-green-600">Yes</p>
                </div>
                <div className="flex-1 text-center bg-red-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-red-700">{report.appliedLearnings.no}</p>
                  <p className="text-xs text-red-600">No</p>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Training Effective?</h3>
              <div className="flex gap-4">
                <div className="flex-1 text-center bg-green-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-green-700">{report.trainingEffective.yes}</p>
                  <p className="text-xs text-green-600">Yes</p>
                </div>
                <div className="flex-1 text-center bg-red-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-red-700">{report.trainingEffective.no}</p>
                  <p className="text-xs text-red-600">No</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit Indicators */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Benefit Indicators Summary</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-medium text-gray-700">Indicator</th>
                  <th className="py-2 px-2 text-center font-medium text-green-700">Yes</th>
                  <th className="py-2 px-2 text-center font-medium text-red-700">No</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody>
                {report.benefitSummary.map((b) => {
                  const total = b.yesCount + b.noCount;
                  const rate = total > 0 ? Math.round((b.yesCount / report.totalResponses) * 100) : 0;
                  return (
                    <tr key={b.key} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-900">{BENEFIT_LABELS[b.key] ?? b.key}</td>
                      <td className="py-2 px-2 text-center text-green-700 font-medium">{b.yesCount}</td>
                      <td className="py-2 px-2 text-center text-red-700">{b.noCount}</td>
                      <td className="py-2 px-2 text-center text-gray-600">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Per-participant table */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Individual Evaluations ({report.totalResponses})</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-2 font-medium text-gray-700">#</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Submitted</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Applied?</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Effective?</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Designation</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Company</th>
                  <th className="py-2 px-2 font-medium text-gray-700">Benefits</th>
                </tr>
              </thead>
              <tbody>
                {report.evaluations.map((e, idx) => {
                  const ev = e.eval;
                  const checkedBenefits = Object.keys(BENEFIT_LABELS).filter(k => ev?.[k] === true);
                  return (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="py-1.5 pr-2 text-gray-500">{idx + 1}</td>
                      <td className="py-1.5 px-2 text-gray-600">{e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : '-'}</td>
                      <td className="py-1.5 px-2">{ev?.appliedLearnings === true ? '✓' : ev?.appliedLearnings === false ? '✗' : '-'}</td>
                      <td className="py-1.5 px-2">{ev?.trainingEffective === true ? '✓' : ev?.trainingEffective === false ? '✗' : '-'}</td>
                      <td className="py-1.5 px-2 text-gray-700">{ev?.respondentDesignation ?? '-'}</td>
                      <td className="py-1.5 px-2 text-gray-700">{ev?.respondentCompany ?? '-'}</td>
                      <td className="py-1.5 px-2 text-gray-600">{checkedBenefits.length > 0 ? checkedBenefits.map(k => BENEFIT_LABELS[k]).join(', ') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
