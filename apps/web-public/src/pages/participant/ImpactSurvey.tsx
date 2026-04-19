import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, surveyApi } from '@/lib/api';
import dtiLogo from '@/assets/dti-logo.jpg';

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600 self-center">{value > 0 ? `${value}/5` : 'Not rated'}</span>
      </div>
    </div>
  );
}

export function ImpactSurveyPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState({
    knowledgeApplication: 0,
    skillImprovement: 0,
    businessImpact: 0,
    revenueChange: 0,
    employeeGrowth: 0,
  });
  const [successStory, setSuccessStory] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [additionalSupport, setAdditionalSupport] = useState('');
  const [revenueChangePct, setRevenueChangePct] = useState('');
  const [employeeCountBefore, setEmployeeCountBefore] = useState('');
  const [employeeCountAfter, setEmployeeCountAfter] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FM-CT-5 effectiveness fields
  const [appliedLearnings, setAppliedLearnings] = useState<boolean | null>(null);
  const [benefits, setBenefits] = useState<Record<string, boolean>>({});
  const [benefitSalesPct, setBenefitSalesPct] = useState('');
  const [benefitProfitPct, setBenefitProfitPct] = useState('');
  const [benefitCostPct, setBenefitCostPct] = useState('');
  const [benefitOthers, setBenefitOthers] = useState('');
  const [needsProductDev, setNeedsProductDev] = useState(false);
  const [needsLoanAdvisory, setNeedsLoanAdvisory] = useState(false);
  const [needsOthers, setNeedsOthers] = useState('');
  const [futureTraining, setFutureTraining] = useState('');
  const [trainingEffective, setTrainingEffective] = useState<boolean | null>(null);
  const [ineffectiveReason, setIneffectiveReason] = useState('');
  const [respondentDesignation, setRespondentDesignation] = useState('');
  const [respondentCompany, setRespondentCompany] = useState('');

  // Get participation details to find eventId
  const { data: partData, isLoading } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => eventsApi.getMyParticipations({ page: 1, limit: 50 }),
  });

  const participations = (partData?.data as unknown as Array<{
    id: string;
    event: { id: string; title: string; endDate: string };
    impactSurveyResponse?: { status: string } | null;
  }>) ?? [];

  const participation = participations.find(p => p.id === participationId);
  const eventId = participation?.event?.id;
  const eventTitle = participation?.event?.title;

  const submit = useMutation({
    mutationFn: () => {
      if (!eventId) throw new Error('Event not found');
      return surveyApi.submitImpact(eventId, {
        knowledgeApplication: ratings.knowledgeApplication,
        skillImprovement:     ratings.skillImprovement,
        businessImpact:       ratings.businessImpact,
        revenueChange:        ratings.revenueChange,
        employeeGrowth:       ratings.employeeGrowth,
        successStory:         successStory || undefined,
        challengesFaced:      challengesFaced || undefined,
        additionalSupport:    additionalSupport || undefined,
        revenueChangePct:     revenueChangePct ? Number(revenueChangePct) : undefined,
        employeeCountBefore:  employeeCountBefore ? Number(employeeCountBefore) : undefined,
        employeeCountAfter:   employeeCountAfter ? Number(employeeCountAfter) : undefined,
        effectiveness: {
          appliedLearnings,
          benefitIncreasedSales:   benefits['increasedSales'] ?? false,
          benefitSalesPct:         benefitSalesPct ? Number(benefitSalesPct) : undefined,
          benefitIncreasedProfit:  benefits['increasedProfit'] ?? false,
          benefitProfitPct:        benefitProfitPct ? Number(benefitProfitPct) : undefined,
          benefitCostReduction:    benefits['costReduction'] ?? false,
          benefitCostPct:          benefitCostPct ? Number(benefitCostPct) : undefined,
          benefitNewMarkets:       benefits['newMarkets'] ?? false,
          benefitProductivity:     benefits['productivity'] ?? false,
          benefitManpowerWelfare:  benefits['manpowerWelfare'] ?? false,
          benefitStandardizedOp:   benefits['standardizedOp'] ?? false,
          benefitBookkeeping:      benefits['bookkeeping'] ?? false,
          benefitImprovedMgmt:     benefits['improvedMgmt'] ?? false,
          benefitSetupBusiness:    benefits['setupBusiness'] ?? false,
          benefitExpandBusiness:   benefits['expandBusiness'] ?? false,
          benefitEnhancedCapacity: benefits['enhancedCapacity'] ?? false,
          benefitAdoptTechnology:  benefits['adoptTechnology'] ?? false,
          benefitInnovation:       benefits['innovation'] ?? false,
          benefitNoComplaints:     benefits['noComplaints'] ?? false,
          benefitOthers:           benefitOthers || undefined,
          needsProductDevelopment: needsProductDev,
          needsLoanAdvisory,
          needsOthers:             needsOthers || undefined,
          futureTrainingRequests:  futureTraining || undefined,
          trainingEffective,
          ineffectiveReason:       ineffectiveReason || undefined,
          respondentDesignation:   respondentDesignation || undefined,
          respondentCompany:       respondentCompany || undefined,
        },
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!participation || !eventId) {
    return (
      <div className="card text-center py-12 text-gray-500">
        <p>Participation not found.</p>
        <button onClick={() => navigate('/my-events')} className="btn-outline mt-4">← Back to My Events</button>
      </div>
    );
  }

  if (submitted || participation.impactSurveyResponse?.status === 'SUBMITTED') {
    return (
      <div className="max-w-lg mx-auto card text-center py-12 space-y-4">
        <div className="text-5xl">🌟</div>
        <h2 className="text-xl font-bold text-gray-900">Thank you for sharing your impact!</h2>
        <p className="text-gray-600">Your response has been recorded for <strong>{eventTitle}</strong>.</p>
        <button onClick={() => navigate('/my-events')} className="btn-primary">← Back to My Events</button>
      </div>
    );
  }

  const isValid =
    ratings.knowledgeApplication > 0 &&
    ratings.skillImprovement > 0 &&
    ratings.businessImpact > 0 &&
    ratings.revenueChange > 0 &&
    ratings.employeeGrowth > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body * { visibility: hidden; }
          .fm-ct5-print, .fm-ct5-print * { visibility: visible; }
          .fm-ct5-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print">
        <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← My Events
        </button>
      </div>

      <div className="fm-ct5-print">
      {/* FM-CT-5 Official Header */}
      <div className="card border-2 border-gray-300 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <img src={dtiLogo} alt="DTI Logo" className="h-16 w-auto" />
          <div className="text-center flex-1">
            <p className="text-sm font-bold text-gray-900">DEPARTMENT OF TRADE AND INDUSTRY</p>
            <p className="text-sm text-gray-700">[Region VII — Central Visayas]</p>
            <p className="text-base font-bold text-gray-900 mt-2">TRAINING MONITORING AND<br />EVALUATION FORM</p>
            <p className="text-xs text-gray-600 mt-1">(6 months after conduct of training)</p>
          </div>
          <div className="text-right text-[10px] text-gray-500 border border-gray-300 p-2 rounded shrink-0">
            <p>Doc Code: <strong>FM-CT-5</strong></p>
            <p>Version No.: <strong>1</strong></p>
            <p>Effective Date:</p>
            <p><strong>February 1, 2024</strong></p>
          </div>
        </div>
        <div className="mt-4 border-t pt-3 text-sm text-gray-700 space-y-1">
          <p><strong>Title of Training/Seminar/Fora Attended:</strong> {eventTitle ?? '________________'}</p>
          <p><strong>Date and Place of Activity:</strong> {participation?.event?.endDate ? new Date(participation.event.endDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : '________________'}</p>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">Instruction: Place a tick (/) to your corresponding answer and qualify on the Remarks, if needed.</p>
      </div>

      <div className="card space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Impact Ratings</h3>
        <p className="text-sm text-gray-600">
          Rate from 1 (No Impact) to 5 (Significant Impact)
        </p>

        <StarRating
          label="Knowledge Application — How much have you applied the knowledge gained?"
          value={ratings.knowledgeApplication}
          onChange={(v) => setRatings(r => ({ ...r, knowledgeApplication: v }))}
        />
        <StarRating
          label="Skills Improvement — How much have your skills improved?"
          value={ratings.skillImprovement}
          onChange={(v) => setRatings(r => ({ ...r, skillImprovement: v }))}
        />
        <StarRating
          label="Business Impact — How has the training impacted your business?"
          value={ratings.businessImpact}
          onChange={(v) => setRatings(r => ({ ...r, businessImpact: v }))}
        />
        <StarRating
          label="Revenue Change — Has the training influenced your revenue?"
          value={ratings.revenueChange}
          onChange={(v) => setRatings(r => ({ ...r, revenueChange: v }))}
        />
        <StarRating
          label="Employee Growth — Has the training influenced employee growth?"
          value={ratings.employeeGrowth}
          onChange={(v) => setRatings(r => ({ ...r, employeeGrowth: v }))}
        />
      </div>

      <div className="card space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quantitative Data <span className="text-gray-400 font-normal">(optional)</span></h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Revenue Change %</label>
            <input
              type="number"
              step="0.01"
              min="-100"
              max="1000"
              className="input w-full"
              placeholder="e.g. 15.5"
              value={revenueChangePct}
              onChange={(e) => setRevenueChangePct(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Employees Before</label>
            <input
              type="number"
              min="0"
              className="input w-full"
              placeholder="e.g. 5"
              value={employeeCountBefore}
              onChange={(e) => setEmployeeCountBefore(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Employees After</label>
            <input
              type="number"
              min="0"
              className="input w-full"
              placeholder="e.g. 8"
              value={employeeCountAfter}
              onChange={(e) => setEmployeeCountAfter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Open-ended Feedback <span className="text-gray-400 font-normal">(optional)</span></h3>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Success Story</label>
          <textarea
            rows={3}
            maxLength={5000}
            className="input w-full resize-none"
            placeholder="Share any success stories resulting from the training..."
            value={successStory}
            onChange={(e) => setSuccessStory(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Challenges Faced</label>
          <textarea
            rows={3}
            maxLength={5000}
            className="input w-full resize-none"
            placeholder="What challenges did you face in applying the training?"
            value={challengesFaced}
            onChange={(e) => setChallengesFaced(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Additional Support Needed</label>
          <textarea
            rows={3}
            maxLength={5000}
            className="input w-full resize-none"
            placeholder="What additional support would help you?"
            value={additionalSupport}
            onChange={(e) => setAdditionalSupport(e.target.value)}
          />
        </div>
      </div>

      {/* FM-CT-5 Training Effectiveness Evaluation */}
      <div className="card space-y-5 border-2 border-gray-300">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">FM-CT-5 · Training Effectiveness Evaluation</h3>

        {/* Applied Learnings */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Were you able to apply the learnings from the training?</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applied" checked={appliedLearnings === true} onChange={() => setAppliedLearnings(true)} />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applied" checked={appliedLearnings === false} onChange={() => setAppliedLearnings(false)} />
              <span className="text-sm">No</span>
            </label>
          </div>
        </div>

        {/* Benefit Indicators */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">If YES, what benefits did you gain? <span className="text-gray-400 font-normal">(check all that apply)</span></p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { key: 'increasedSales', label: 'Increased sales' },
              { key: 'increasedProfit', label: 'Increased profit' },
              { key: 'costReduction', label: 'Cost reduction' },
              { key: 'newMarkets', label: 'Accessed new markets' },
              { key: 'productivity', label: 'Improved productivity' },
              { key: 'manpowerWelfare', label: 'Improved manpower welfare' },
              { key: 'standardizedOp', label: 'Standardized operations' },
              { key: 'bookkeeping', label: 'Started/improved bookkeeping' },
              { key: 'improvedMgmt', label: 'Improved management' },
              { key: 'setupBusiness', label: 'Set up new business' },
              { key: 'expandBusiness', label: 'Expanded business' },
              { key: 'enhancedCapacity', label: 'Enhanced capacity' },
              { key: 'adoptTechnology', label: 'Adopted technology' },
              { key: 'innovation', label: 'Innovation' },
              { key: 'noComplaints', label: 'No customer complaints' },
            ].map(b => (
              <label key={b.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={benefits[b.key] ?? false}
                  onChange={e => setBenefits(prev => ({ ...prev, [b.key]: e.target.checked }))} />
                <span className="text-sm text-gray-700">{b.label}</span>
              </label>
            ))}
          </div>

          {/* Percentage fields for first 3 */}
          {(benefits['increasedSales'] || benefits['increasedProfit'] || benefits['costReduction']) && (
            <div className="grid grid-cols-3 gap-3 mt-2">
              {benefits['increasedSales'] && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Sales increase %</label>
                  <input type="number" min={0} max={999} className="input w-full text-sm" value={benefitSalesPct}
                    onChange={e => setBenefitSalesPct(e.target.value)} />
                </div>
              )}
              {benefits['increasedProfit'] && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Profit increase %</label>
                  <input type="number" min={0} max={999} className="input w-full text-sm" value={benefitProfitPct}
                    onChange={e => setBenefitProfitPct(e.target.value)} />
                </div>
              )}
              {benefits['costReduction'] && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Cost reduction %</label>
                  <input type="number" min={0} max={999} className="input w-full text-sm" value={benefitCostPct}
                    onChange={e => setBenefitCostPct(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 mt-2">
            <label className="text-sm text-gray-600">Others (specify)</label>
            <input className="input w-full text-sm" maxLength={500} value={benefitOthers}
              onChange={e => setBenefitOthers(e.target.value)} placeholder="Other benefits..." />
          </div>
        </div>

        {/* Additional Assistance Needed */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Additional assistance needed:</p>
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={needsProductDev} onChange={e => setNeedsProductDev(e.target.checked)} />
              <span className="text-sm text-gray-700">Product development</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={needsLoanAdvisory} onChange={e => setNeedsLoanAdvisory(e.target.checked)} />
              <span className="text-sm text-gray-700">Loan advisory</span>
            </label>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Others</label>
              <input className="input w-full text-sm" maxLength={500} value={needsOthers}
                onChange={e => setNeedsOthers(e.target.value)} placeholder="Other needs..." />
            </div>
          </div>
        </div>

        {/* Future Training Requests */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">What training programs would you like to attend in the future?</label>
          <textarea rows={2} maxLength={5000} className="input w-full resize-none text-sm" value={futureTraining}
            onChange={e => setFutureTraining(e.target.value)} placeholder="Future training interests..." />
        </div>

        {/* Training Effectiveness */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Do you think the training was effective?</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="effective" checked={trainingEffective === true} onChange={() => setTrainingEffective(true)} />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="effective" checked={trainingEffective === false} onChange={() => setTrainingEffective(false)} />
              <span className="text-sm">No</span>
            </label>
          </div>
          {trainingEffective === false && (
            <div className="space-y-1">
              <label className="text-sm text-gray-600">If No, why?</label>
              <textarea rows={2} maxLength={5000} className="input w-full resize-none text-sm" value={ineffectiveReason}
                onChange={e => setIneffectiveReason(e.target.value)} placeholder="Reason..." />
            </div>
          )}
        </div>

        {/* Respondent Info */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Designation/Position</label>
            <input className="input w-full text-sm" maxLength={200} value={respondentDesignation}
              onChange={e => setRespondentDesignation(e.target.value)} placeholder="e.g. Owner, Manager" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Company/Enterprise Name</label>
            <input className="input w-full text-sm" maxLength={300} value={respondentCompany}
              onChange={e => setRespondentCompany(e.target.value)} placeholder="e.g. ABC Trading" />
          </div>
        </div>
      </div>

      {submit.isError && (
        <p className="text-sm text-red-600">
          {(submit.error as Error)?.message ?? 'Failed to submit survey. Please try again.'}
        </p>
      )}

      <button
        className="btn-primary w-full no-print"
        disabled={!isValid || submit.isPending}
        onClick={() => submit.mutate()}
      >
        {submit.isPending ? 'Submitting…' : 'Submit Impact Assessment'}
      </button>
      <p className="text-xs text-gray-500 text-center pb-4 no-print">All ratings are required. Quantitative data and feedback are optional but appreciated.</p>
      </div>{/* close fm-ct5-print */}
    </div>
  );
}
