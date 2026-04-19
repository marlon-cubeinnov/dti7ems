import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, surveyApi } from '@/lib/api';
import { format } from 'date-fns';

/* ── Exact questions from official DTI FM-CSF-ACT form ── */

const SQD_ITEMS = [
  {
    num: '0', title: 'OVERALL RATING',
    key: 'sqd0OverallRating',
    text: 'In general, I am satisfied and I would recommend this session to colleagues.',
  },
  {
    num: '1', title: 'RESPONSIVENESS',
    key: 'sqd1Responsiveness',
    text: 'The session was provided in a timely manner, aligned with my learning needs, and relevant to my role, making it useful for my work.',
  },
  {
    num: '2', title: 'RELIABILITY',
    key: 'sqd2Reliability',
    text: 'The session was consistent with what was promised and effectively covered all key topics.',
  },
  {
    num: '3', title: 'ACCESS AND FACILITIES',
    key: 'sqd3AccessFacilities',
    text: 'The venue/platform was conducive to learning, equipment were appropriate, with clear audio and effective presentation facilities.',
  },
  {
    num: '4', title: 'COMMUNICATION',
    key: 'sqd4Communication',
    text: 'Information were clearly and effectively communicated, with well-structured instructions, and materials that were easy to understand.',
  },
  {
    num: '5', title: 'COSTS',
    key: 'sqd5Costs',
    text: 'N/A',
    isNA: true,
  },
  {
    num: '6', title: 'INTEGRITY',
    key: 'sqd6Integrity',
    text: 'The organizers and the resource speaker consistently provided clear and truthful information about the program. They demonstrated fairness, respect, and integrity in all interaction with participants, ensuring transparency and ethical behavior throughout the process/duration of the session.',
  },
  {
    num: '7', title: 'ASSURANCE',
    key: 'sqd7Assurance',
    text: "The organizers and the resource speaker demonstrated competence and courtesy, instilling confidence and trust in the participants. They provided reliable and credible information, ensuring participants' security and assurance throughout the process.",
  },
  {
    num: '8', title: 'OUTCOME',
    key: 'sqd8Outcome',
    text: 'The session builds productivity and efficiency for the participants.',
  },
] as const;

const CC1_LABELS: Record<number, string> = {
  1: "I know what a CC is and I saw this office's CC.",
  2: "I know what a CC is but I did NOT see this office's CC.",
  3: "I learned of the CC only when I saw this office's CC.",
  4: 'I do not know what a CC is and I did not see one in this office.',
};
const CC2_LABELS: Record<number, string> = {
  1: 'Easy to see', 2: 'Somewhat easy to see', 3: 'Difficult to see', 4: 'Not visible at all', 5: 'N/A',
};
const CC3_LABELS: Record<number, string> = {
  1: 'Helped very much', 2: 'Somewhat helped', 3: 'Did not help', 4: 'N/A',
};

const COL_LABELS = ['Strongly\nAgree', 'Agree', 'Neither', 'Disagree', 'Strongly\nDisagree'];
const COL_VALUES = [5, 4, 3, 2, 1];

const IMPACT_FIELDS = [
  { key: 'knowledgeApplication', label: 'Knowledge Application' },
  { key: 'skillImprovement', label: 'Skills Improvement' },
  { key: 'businessImpact', label: 'Business Impact' },
  { key: 'revenueChange', label: 'Revenue Change' },
  { key: 'employeeGrowth', label: 'Employee Growth' },
];

const BENEFIT_ITEMS = [
  { key: 'benefitIncreasedSales', label: 'Increased Sales', pctKey: 'benefitSalesPct' },
  { key: 'benefitIncreasedProfit', label: 'Increased Profit', pctKey: 'benefitProfitPct' },
  { key: 'benefitCostReduction', label: 'Cost Reduction', pctKey: 'benefitCostPct' },
  { key: 'benefitNewMarkets', label: 'New Markets' },
  { key: 'benefitProductivity', label: 'Improved Productivity' },
  { key: 'benefitManpowerWelfare', label: 'Improved Manpower Welfare' },
  { key: 'benefitStandardizedOp', label: 'Standardized Operations' },
  { key: 'benefitBookkeeping', label: 'Improved Bookkeeping' },
  { key: 'benefitImprovedMgmt', label: 'Improved Management' },
  { key: 'benefitSetupBusiness', label: 'Set Up Business' },
  { key: 'benefitExpandBusiness', label: 'Expanded Business' },
  { key: 'benefitEnhancedCapacity', label: 'Enhanced Capacity' },
  { key: 'benefitAdoptTechnology', label: 'Adopted Technology' },
  { key: 'benefitInnovation', label: 'Innovation' },
  { key: 'benefitNoComplaints', label: 'No Complaints' },
];

function StarDisplay({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-xs text-gray-400">Not rated</span>;
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-lg ${s <= value ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-sm text-gray-500 ml-1">{value}/5</span>
    </div>
  );
}

export function MySurveyResponsesPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();

  const { data: partData, isLoading: partLoading } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => eventsApi.getMyParticipations({ page: 1, limit: 50 }),
  });

  const participations = (partData?.data as unknown as Array<{
    id: string;
    event: { id: string; title: string; startDate: string; venue?: string };
  }>) ?? [];

  const participation = participations.find(p => p.id === participationId);
  const eventId = participation?.event?.id;

  const { data: csfData, isLoading: csfLoading } = useQuery({
    queryKey: ['my-csf', eventId],
    queryFn: () => surveyApi.getMyResponse(eventId!),
    enabled: !!eventId,
  });

  const { data: impactData, isLoading: impactLoading } = useQuery({
    queryKey: ['my-impact', eventId],
    queryFn: () => surveyApi.getMyImpactResponse(eventId!),
    enabled: !!eventId,
  });

  const csf = (csfData as any)?.data as any | null;
  const impact = (impactData as any)?.data as any | null;

  if (partLoading || csfLoading || impactLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded" />
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

  const hasCsf = csf && csf.status === 'SUBMITTED';
  const hasImpact = impact && impact.status === 'SUBMITTED';

  if (!hasCsf && !hasImpact) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← My Events
        </button>
        <div className="card text-center py-12 text-gray-500">
          <p>No survey responses found for this event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-1 flex items-center gap-1">
        ← My Events
      </button>

      {/* ══════════ CSF Response — Official Form Layout ══════════ */}
      {hasCsf && (
        <div className="space-y-0">
          {/* ── Form Header ── */}
          <div className="bg-white border border-gray-300 rounded-t-lg">
            <div className="flex justify-between items-start px-4 pt-3">
              <span className="text-xs text-green-700 bg-green-50 rounded-full px-3 py-1 font-medium">
                ✓ Submitted {csf.submittedAt ? format(new Date(csf.submittedAt), 'MMM d, yyyy') : ''}
              </span>
              <div className="text-right text-[11px] text-gray-500 leading-tight">
                <div>Document Code: <span className="font-semibold text-gray-700">FM-CSF-ACT</span></div>
                <div>Version No.: <span className="font-semibold text-gray-700">1.0</span></div>
              </div>
            </div>

            <div className="text-center pt-1 pb-2 px-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Republic of the Philippines</p>
              <p className="text-sm font-bold text-[#003087] tracking-wide">DEPARTMENT OF TRADE AND INDUSTRY</p>
              <p className="text-xs text-gray-500">DTI Region VII — Central Visayas</p>
            </div>

            <div className="bg-[#003087] text-white text-center py-2.5 px-4">
              <h1 className="text-base font-bold tracking-wide">CLIENT SATISFACTION FEEDBACK FORM</h1>
              <p className="text-[11px] opacity-80 mt-0.5">Training | Seminar | Conference</p>
            </div>

            <div className="px-5 py-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Title of Program/Activity:</p>
              <p className="text-sm font-semibold text-gray-900">{participation.event.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(participation.event.startDate), 'MMMM d, yyyy')}
                {participation.event.venue && ` · ${participation.event.venue}`}
              </p>
            </div>
          </div>

          {/* ── PART I: Citizen's Charter ── */}
          <div className="bg-white border-x border-b border-gray-300">
            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-[#003087]">
                PART I. <span className="font-normal text-gray-700 text-xs ml-1">Citizen's Charter (CC)</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {/* CC1 */}
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  <span className="text-[#003087] font-bold mr-1">CC1</span>
                  Which of the following best describes your awareness of a Citizen's Charter (CC)?
                </p>
                <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                  {csf.cc1Awareness ? `${csf.cc1Awareness}. ${CC1_LABELS[csf.cc1Awareness]}` : 'Not answered'}
                </p>
              </div>

              {/* CC2 */}
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  <span className="text-[#003087] font-bold mr-1">CC2</span>
                  If aware of the CC, would you say that the CC of this office was …?
                </p>
                <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                  {csf.cc2Visibility ? `${csf.cc2Visibility}. ${CC2_LABELS[csf.cc2Visibility]}` : 'Not answered'}
                </p>
              </div>

              {/* CC3 */}
              <div className="px-5 py-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  <span className="text-[#003087] font-bold mr-1">CC3</span>
                  How much did the CC help you in your transaction?
                </p>
                <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                  {csf.cc3Usefulness ? `${csf.cc3Usefulness}. ${CC3_LABELS[csf.cc3Usefulness]}` : 'Not answered'}
                </p>
              </div>
            </div>
          </div>

          {/* ── PART II: SQD Table ── */}
          <div className="bg-white border-x border-b border-gray-300">
            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-[#003087]">
                PART II. <span className="font-normal text-gray-700 text-xs ml-1">Service Quality Dimensions</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#003087] text-white">
                    <th className="text-left px-4 py-2.5 font-semibold text-xs w-[55%]">CRITERIA FOR RATING</th>
                    {COL_LABELS.map((label) => (
                      <th key={label} className="text-center px-1 py-2.5 font-semibold text-[10px] whitespace-pre-line leading-tight w-[9%]">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SQD_ITEMS.map((item) => {
                    const val = csf[item.key] as number | null;
                    return (
                      <tr key={item.key} className="border-b border-gray-100">
                        <td className="px-4 py-3">
                          <div className="font-bold text-xs text-[#003087] mb-0.5">{item.num}. {item.title}</div>
                          {!item.isNA && <div className="text-xs text-gray-600 leading-relaxed">{item.text}</div>}
                          {item.isNA && <div className="text-xs text-gray-400 italic">N/A</div>}
                        </td>
                        {COL_VALUES.map((v) => (
                          <td key={v} className="text-center px-1 py-3">
                            <div className={`w-7 h-7 rounded border-2 mx-auto flex items-center justify-center text-xs ${
                              val === v
                                ? 'bg-[#003087] text-white border-[#003087]'
                                : 'bg-white text-transparent border-gray-200'
                            }`}>
                              {val === v ? '✔' : ''}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* Supplemental: Speaker Ratings */}
                  {csf.speakerRatings?.length > 0 && (
                    <>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={6} className="px-4 py-2">
                          <div className="font-bold text-xs text-[#003087]">SUPPLEMENTAL — Resource Speaker</div>
                          <div className="text-xs text-gray-600">
                            The resource speaker demonstrated mastery of topic, encouraged interactive discussions, and responded to questions asked.
                          </div>
                        </td>
                      </tr>
                      {csf.speakerRatings.map((sr: any) => (
                        <tr key={sr.id} className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <div className="text-xs font-semibold text-gray-800">{sr.speaker?.name || 'Speaker'}</div>
                            {sr.speaker?.topic && <div className="text-xs text-gray-500">{sr.speaker.topic}</div>}
                          </td>
                          {COL_VALUES.map((v) => (
                            <td key={v} className="text-center px-1 py-3">
                              <div className={`w-7 h-7 rounded border-2 mx-auto flex items-center justify-center text-xs ${
                                sr.rating === v
                                  ? 'bg-[#003087] text-white border-[#003087]'
                                  : 'bg-white text-transparent border-gray-200'
                              }`}>
                                {sr.rating === v ? '✔' : ''}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── PART III: Comments ── */}
          <div className="bg-white border-x border-b border-gray-300 rounded-b-lg">
            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-[#003087]">
                PART III. <span className="font-normal text-gray-700 text-xs ml-1">Comments and Suggestions</span>
              </h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              {csf.reasonsForLowRating && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Reason/s for "NEITHER", "DISAGREE" or "STRONGLY DISAGREE" answer:
                  </p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{csf.reasonsForLowRating}</p>
                </div>
              )}
              {csf.commentsSuggestions && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Comments/suggestions to help improve services:</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{csf.commentsSuggestions}</p>
                </div>
              )}
              {csf.highlightsFeedback && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">What did you like most?</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{csf.highlightsFeedback}</p>
                </div>
              )}
              {csf.improvementsFeedback && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">What can be improved?</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{csf.improvementsFeedback}</p>
                </div>
              )}
              {!csf.reasonsForLowRating && !csf.commentsSuggestions && !csf.highlightsFeedback && !csf.improvementsFeedback && (
                <p className="text-xs text-gray-400 italic text-center py-2">No comments or suggestions provided.</p>
              )}
            </div>

            <div className="px-5 pb-4 pt-1 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">THANK YOU!</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Impact Survey Response ══════════ */}
      {hasImpact && (
        <div className="space-y-0">
          {/* Header */}
          <div className="bg-white border border-gray-300 rounded-t-lg">
            <div className="flex justify-between items-start px-4 pt-3">
              <span className="text-xs text-purple-700 bg-purple-50 rounded-full px-3 py-1 font-medium">
                ✓ Submitted {impact.submittedAt ? format(new Date(impact.submittedAt), 'MMM d, yyyy') : ''}
              </span>
              <div className="text-right text-[11px] text-gray-500 leading-tight">
                <div>Document Code: <span className="font-semibold text-gray-700">FM-CT-5</span></div>
              </div>
            </div>

            <div className="text-center pt-1 pb-2 px-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Republic of the Philippines</p>
              <p className="text-sm font-bold text-[#003087] tracking-wide">DEPARTMENT OF TRADE AND INDUSTRY</p>
              <p className="text-xs text-gray-500">DTI Region VII — Central Visayas</p>
            </div>

            <div className="bg-[#6b21a8] text-white text-center py-2.5 px-4">
              <h1 className="text-base font-bold tracking-wide">TRAINING EFFECTIVENESS MONITORING</h1>
              <p className="text-[11px] opacity-80 mt-0.5">Impact Assessment Survey (FM-CT-5)</p>
            </div>

            <div className="px-5 py-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Title of Program/Activity:</p>
              <p className="text-sm font-semibold text-gray-900">{participation.event.title}</p>
            </div>
          </div>

          {/* Impact Ratings */}
          <div className="bg-white border-x border-b border-gray-300">
            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-[#6b21a8]">Impact Ratings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {IMPACT_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm font-medium text-gray-800">{f.label}</span>
                  <StarDisplay value={impact[f.key]} />
                </div>
              ))}
            </div>
          </div>

          {/* Quantitative data */}
          {(impact.revenueChangePct != null || impact.employeeCountBefore != null) && (
            <div className="bg-white border-x border-b border-gray-300">
              <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                <h2 className="text-sm font-bold text-[#6b21a8]">Quantitative Data</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 p-5">
                {impact.revenueChangePct != null && (
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-[#6b21a8]">{Number(impact.revenueChangePct)}%</p>
                    <p className="text-xs text-gray-500">Revenue Change</p>
                  </div>
                )}
                {impact.employeeCountBefore != null && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{impact.employeeCountBefore}</p>
                    <p className="text-xs text-gray-500">Employees Before</p>
                  </div>
                )}
                {impact.employeeCountAfter != null && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-gray-800">{impact.employeeCountAfter}</p>
                    <p className="text-xs text-gray-500">Employees After</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FM-CT-5 Effectiveness Evaluation */}
          {impact.effectivenessEval && (
            <div className="bg-white border-x border-b border-gray-300">
              <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                <h2 className="text-sm font-bold text-[#6b21a8]">Training Effectiveness Evaluation</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Applied Learnings</p>
                    <p className="text-sm font-semibold">
                      {impact.effectivenessEval.appliedLearnings === true ? '✅ Yes' :
                       impact.effectivenessEval.appliedLearnings === false ? '❌ No' : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Training Effective</p>
                    <p className="text-sm font-semibold">
                      {impact.effectivenessEval.trainingEffective === true ? '✅ Yes' :
                       impact.effectivenessEval.trainingEffective === false ? '❌ No' : '—'}
                    </p>
                  </div>
                </div>

                {impact.effectivenessEval.ineffectiveReason && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Reason for ineffectiveness</p>
                    <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{impact.effectivenessEval.ineffectiveReason}</p>
                  </div>
                )}

                {(() => {
                  const eval_ = impact.effectivenessEval;
                  const activeBenefits = BENEFIT_ITEMS.filter(b => eval_[b.key]);
                  if (activeBenefits.length === 0) return null;
                  return (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Benefit Indicators</p>
                      <div className="flex flex-wrap gap-2">
                        {activeBenefits.map(b => (
                          <span key={b.key} className="text-xs bg-green-50 text-green-700 rounded-full px-3 py-1 font-medium border border-green-200">
                            ✓ {b.label}
                            {'pctKey' in b && eval_[b.pctKey as string] != null && ` (${Number(eval_[b.pctKey as string])}%)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Narratives */}
          <div className="bg-white border-x border-b border-gray-300 rounded-b-lg">
            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-[#6b21a8]">Narratives</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {impact.successStory && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Success Story</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{impact.successStory}</p>
                </div>
              )}
              {impact.challengesFaced && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Challenges Faced</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{impact.challengesFaced}</p>
                </div>
              )}
              {impact.additionalSupport && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Additional Support Needed</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{impact.additionalSupport}</p>
                </div>
              )}
              {!impact.successStory && !impact.challengesFaced && !impact.additionalSupport && (
                <p className="text-xs text-gray-400 italic text-center py-2">No narrative responses provided.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
