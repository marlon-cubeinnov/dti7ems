import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '@/lib/api';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

/* ── Exact questions from official DTI FM-CSF-ACT form ── */

const SQD_ITEMS = [
  { num: '0', title: 'OVERALL RATING', key: 'sqd0OverallRating',
    text: 'In general, I am satisfied and I would recommend this session to colleagues.' },
  { num: '1', title: 'RESPONSIVENESS', key: 'sqd1Responsiveness',
    text: 'The session was provided in a timely manner, aligned with my learning needs, and relevant to my role, making it useful for my work.' },
  { num: '2', title: 'RELIABILITY', key: 'sqd2Reliability',
    text: 'The session was consistent with what was promised and effectively covered all key topics.' },
  { num: '3', title: 'ACCESS AND FACILITIES', key: 'sqd3AccessFacilities',
    text: 'The venue/platform was conducive to learning, equipment were appropriate, with clear audio and effective presentation facilities.' },
  { num: '4', title: 'COMMUNICATION', key: 'sqd4Communication',
    text: 'Information were clearly and effectively communicated, with well-structured instructions, and materials that were easy to understand.' },
  { num: '5', title: 'COSTS', key: 'sqd5Costs', text: 'N/A', isNA: true },
  { num: '6', title: 'INTEGRITY', key: 'sqd6Integrity',
    text: 'The organizers and the resource speaker consistently provided clear and truthful information about the program. They demonstrated fairness, respect, and integrity in all interaction with participants, ensuring transparency and ethical behavior throughout the process/duration of the session.' },
  { num: '7', title: 'ASSURANCE', key: 'sqd7Assurance',
    text: "The organizers and the resource speaker demonstrated competence and courtesy, instilling confidence and trust in the participants. They provided reliable and credible information, ensuring participants' security and assurance throughout the process." },
  { num: '8', title: 'OUTCOME', key: 'sqd8Outcome',
    text: 'The session builds productivity and efficiency for the participants.' },
];

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

const ADJECTIVAL_COLORS: Record<string, string> = {
  Outstanding: 'text-green-700 bg-green-50',
  'Very Satisfactory': 'text-blue-700 bg-blue-50',
  Satisfactory: 'text-yellow-700 bg-yellow-50',
  Fair: 'text-orange-700 bg-orange-50',
  Unsatisfactory: 'text-red-700 bg-red-50',
};

type SqdBreakdown = {
  key: string;
  label: string;
  totalResponses: number;
  ratingCounts: Record<string, number>;
  csfRating: number;
  adjectival: string;
};

type SpeakerAvg = {
  speakerId: string;
  speakerName: string;
  topic?: string;
  avgRating: number;
  count: number;
};

type IndividualResponse = {
  id: string;
  sqd0OverallRating: number | null;
  sqd1Responsiveness: number | null;
  sqd2Reliability: number | null;
  sqd3AccessFacilities: number | null;
  sqd4Communication: number | null;
  sqd5Costs: number | null;
  sqd6Integrity: number | null;
  sqd7Assurance: number | null;
  sqd8Outcome: number | null;
  cc1Awareness: number | null;
  cc2Visibility: number | null;
  cc3Usefulness: number | null;
  highlightsFeedback: string | null;
  improvementsFeedback: string | null;
  commentsSuggestions: string | null;
  reasonsForLowRating: string | null;
  speakerRatings: Array<{ speakerId: string; rating: number }>;
  submittedAt: string;
  participantName: string | null;
  participantEmail: string | null;
};

type CsfResultData = {
  count: number;
  sqdBreakdown: SqdBreakdown[];
  ccDistribution: Array<{ key: string; distribution: Record<string, number>; total: number }>;
  speakerAverages: SpeakerAvg[];
  responses: IndividualResponse[];
};

export function OrganizerCsfResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetResponseId = searchParams.get('responseId');
  const [viewMode, setViewMode] = useState<'summary' | 'individual'>(() => targetResponseId ? 'individual' : 'summary');
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['csf-results', id],
    queryFn: () => surveyApi.getResults(id!),
    enabled: !!id,
  });

  const results = data?.data as CsfResultData | null | undefined;

  // When a specific responseId is requested, auto-select it in individual view
  useEffect(() => {
    if (!targetResponseId || !results?.responses?.length) return;
    const idx = results.responses.findIndex(r => r.id === targetResponseId);
    if (idx !== -1) {
      setViewMode('individual');
      setSelectedIdx(idx);
    }
  }, [targetResponseId, results]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <button onClick={() => navigate(`/organizer/events/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Back to Event
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
        </div>
      ) : isError ? (
        <div className="card text-red-600">Failed to load results.</div>
      ) : !results || results.count === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="text-lg">No survey responses yet.</p>
          <p className="text-sm mt-1">Responses will appear here once participants submit their CSF feedback.</p>
        </div>
      ) : (
        <>
          {/* ── Low-rating alert banner ── */}
          {(() => {
            const SQD_KEYS = ['sqd0OverallRating','sqd1Responsiveness','sqd2Reliability','sqd3AccessFacilities','sqd4Communication','sqd6Integrity','sqd7Assurance','sqd8Outcome'] as const;
            const lowRatingResponses = results.responses.filter(r =>
              SQD_KEYS.some(k => {
                const v = (r as any)[k];
                return v !== null && v !== undefined && v <= 2;
              })
            );
            if (lowRatingResponses.length === 0) return null;
            return (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Low-rating alert: </span>
                  {lowRatingResponses.length} response{lowRatingResponses.length !== 1 ? 's' : ''} contain{lowRatingResponses.length === 1 ? 's' : ''} one or more Disagree / Strongly Disagree ratings.
                  {' '}<button className="underline font-medium" onClick={() => setViewMode('individual')}>View individual responses</button> to review.
                </div>
              </div>
            );
          })()}

          {/* ── DTI Form Header ── */}
          <div className="bg-white border border-gray-300 rounded-t-lg">
            <div className="flex justify-between items-start px-4 pt-3">
              <span className="text-xs text-blue-700 bg-blue-50 rounded-full px-3 py-1 font-medium">
                {results.count} response{results.count !== 1 ? 's' : ''}
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
              <h1 className="text-base font-bold tracking-wide">CSF RESULTS — SERVICE QUALITY DIMENSIONS</h1>
              <p className="text-[11px] opacity-80 mt-0.5">Training | Seminar | Conference</p>
            </div>
          </div>

          {/* ── View Mode Toggle ── */}
          <div className="bg-white border-x border-b border-gray-300 px-5 py-3 flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">View:</span>
            <button
              onClick={() => setViewMode('summary')}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${viewMode === 'summary' ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Summary (All)
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors ${viewMode === 'individual' ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Individual Responses
            </button>
          </div>

          {/* ═══════ SUMMARY VIEW ═══════ */}
          {viewMode === 'summary' && (
            <>
              {/* SQD Breakdown Table */}
              <div className="bg-white border-x border-b border-gray-300">
                <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-[#003087]">PART II. <span className="font-normal text-gray-700 text-xs ml-1">SQD Rating Breakdown</span></h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#003087] text-white">
                        <th className="text-left px-4 py-2.5 font-semibold text-xs w-[30%]">Dimension</th>
                        <th className="text-center px-1 py-2.5 font-semibold text-[10px] w-[7%]">SD (1)</th>
                        <th className="text-center px-1 py-2.5 font-semibold text-[10px] w-[7%]">D (2)</th>
                        <th className="text-center px-1 py-2.5 font-semibold text-[10px] w-[7%]">N (3)</th>
                        <th className="text-center px-1 py-2.5 font-semibold text-[10px] w-[7%]">A (4)</th>
                        <th className="text-center px-1 py-2.5 font-semibold text-[10px] w-[7%]">SA (5)</th>
                        <th className="text-center px-2 py-2.5 font-semibold text-[10px] w-[10%]">CSF %</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-[10px] w-[15%]">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results.sqdBreakdown ?? []).map((sqd) => (
                        <tr key={sqd.key} className="border-b border-gray-100">
                          <td className="px-4 py-2.5">
                            <div className="font-bold text-xs text-[#003087]">{SQD_ITEMS.find(i => i.key === sqd.key)?.num ?? ''}. {sqd.label ?? SQD_ITEMS.find(i => i.key === sqd.key)?.title}</div>
                          </td>
                          {['1', '2', '3', '4', '5'].map(r => (
                            <td key={r} className="text-center px-1 py-2.5 text-sm text-gray-700">{sqd.ratingCounts?.[r] ?? 0}</td>
                          ))}
                          <td className="text-center px-2 py-2.5 font-bold text-sm text-gray-900">{sqd.csfRating?.toFixed(1)}%</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ADJECTIVAL_COLORS[sqd.adjectival] ?? ''}`}>
                              {sqd.adjectival}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CC Distribution */}
              {results.ccDistribution && results.ccDistribution.length > 0 && (
                <div className="bg-white border-x border-b border-gray-300">
                  <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                    <h2 className="text-sm font-bold text-[#003087]">PART I. <span className="font-normal text-gray-700 text-xs ml-1">Citizen's Charter Responses</span></h2>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    {results.ccDistribution.map(cc => {
                      const labels = cc.key === 'cc1Awareness' ? CC1_LABELS : cc.key === 'cc2Visibility' ? CC2_LABELS : CC3_LABELS;
                      const title = cc.key === 'cc1Awareness' ? 'CC1: Awareness' : cc.key === 'cc2Visibility' ? 'CC2: Visibility' : 'CC3: Usefulness';
                      const total = Object.values(cc.distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
                      return (
                        <div key={cc.key}>
                          <p className="text-xs font-semibold text-gray-800 mb-2">
                            <span className="text-[#003087] font-bold mr-1">{title.split(':')[0]}</span>
                            {title.split(':')[1]}
                          </p>
                          <div className="space-y-1">
                            {Object.entries(cc.distribution).map(([val, count]) => {
                              const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                              return (
                                <div key={val} className="flex items-center gap-3">
                                  <div className="w-6 text-xs font-medium text-gray-500 text-right">{val}.</div>
                                  <div className="flex-1 text-xs text-gray-700">{labels[Number(val)] ?? ('Option ' + val)}</div>
                                  <div className="w-16 bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-[#003087] h-3 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className="w-20 text-xs text-gray-600 text-right font-medium">{count as number} ({pct}%)</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speaker Averages */}
              {results.speakerAverages && results.speakerAverages.length > 0 && (
                <div className="bg-white border-x border-b border-gray-300">
                  <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                    <h2 className="text-sm font-bold text-[#003087]">SUPPLEMENTAL <span className="font-normal text-gray-700 text-xs ml-1">Speaker Satisfaction</span></h2>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {results.speakerAverages.map(sp => {
                      const pct = (sp.avgRating / 5) * 100;
                      return (
                        <div key={sp.speakerId} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="text-gray-900 font-semibold">{sp.speakerName}</span>
                              {sp.topic && <span className="text-gray-500 text-xs ml-2">({sp.topic})</span>}
                            </div>
                            <span className="text-[#003087] font-bold">{sp.avgRating.toFixed(2)} / 5 <span className="text-gray-400 font-normal">({sp.count} ratings)</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-[#003087] h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="bg-white border-x border-b border-gray-300 rounded-b-lg">
                <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-[#003087]">PART III. <span className="font-normal text-gray-700 text-xs ml-1">Comments and Suggestions</span></h2>
                </div>
                <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
                  <FeedbackColumn title="Reasons for low ratings" items={results.responses} field="reasonsForLowRating" borderColor="border-red-400" />
                  <FeedbackColumn title="Comments / Suggestions" items={results.responses} field="commentsSuggestions" borderColor="border-gray-400" />
                  <FeedbackColumn title="What participants liked" items={results.responses} field="highlightsFeedback" borderColor="border-[#003087]" />
                  <FeedbackColumn title="Areas for improvement" items={results.responses} field="improvementsFeedback" borderColor="border-yellow-400" />
                </div>
              </div>
            </>
          )}

          {/* ═══════ INDIVIDUAL VIEW ═══════ */}
          {viewMode === 'individual' && (
            <>
              {/* Response selector */}
              <div className="bg-white border-x border-b border-gray-300 px-5 py-3 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-gray-500">Respondent:</span>
                <select
                  value={selectedIdx}
                  onChange={e => setSelectedIdx(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700"
                >
                  {results.responses.map((r, i) => (
                    <option key={r.id} value={i}>
                      {r.participantName ?? `Response #${i + 1}`} — {format(new Date(r.submittedAt), 'MMM d, yyyy h:mm a')}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}
                    disabled={selectedIdx === 0}
                    className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >← Prev</button>
                  <button
                    onClick={() => setSelectedIdx(Math.min(results.responses.length - 1, selectedIdx + 1))}
                    disabled={selectedIdx === results.responses.length - 1}
                    className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>

              {(() => {
                const r = results.responses[selectedIdx];
                if (!r) return null;

                const speakerLookup = Object.fromEntries(
                  results.speakerAverages.map(s => [s.speakerId, s])
                );

                return (
                  <>
                    {/* Participant name banner */}
                    {(() => {
                      const SQD_KEYS = ['sqd0OverallRating','sqd1Responsiveness','sqd2Reliability','sqd3AccessFacilities','sqd4Communication','sqd6Integrity','sqd7Assurance','sqd8Outcome'] as const;
                      const hasLowRating = SQD_KEYS.some(k => { const v = (r as any)[k]; return v !== null && v !== undefined && v <= 2; });
                      return (
                        <div className={`border-x border-b border-gray-300 px-5 py-2.5 flex items-center gap-2 flex-wrap ${hasLowRating ? 'bg-red-50' : 'bg-blue-50'}`}>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Respondent:</span>
                          <span className={`text-sm font-semibold ${hasLowRating ? 'text-red-800' : 'text-[#003087]'}`}>{r.participantName ?? `Response #${selectedIdx + 1}`}</span>
                          {r.participantEmail && <span className="text-xs text-gray-500">({r.participantEmail})</span>}
                          {hasLowRating && (
                            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Low rating
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* PART I: CC */}
                    <div className="bg-white border-x border-b border-gray-300">
                      <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                        <h2 className="text-sm font-bold text-[#003087]">PART I. <span className="font-normal text-gray-700 text-xs ml-1">Citizen's Charter (CC)</span></h2>
                      </div>
                      <div className="divide-y divide-gray-100">
                        <div className="px-5 py-3">
                          <p className="text-xs font-semibold text-gray-800 mb-1"><span className="text-[#003087] font-bold mr-1">CC1</span> Awareness</p>
                          <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                            {r.cc1Awareness ? `${r.cc1Awareness}. ${CC1_LABELS[r.cc1Awareness]}` : 'Not answered'}
                          </p>
                        </div>
                        <div className="px-5 py-3">
                          <p className="text-xs font-semibold text-gray-800 mb-1"><span className="text-[#003087] font-bold mr-1">CC2</span> Visibility</p>
                          <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                            {r.cc2Visibility ? `${r.cc2Visibility}. ${CC2_LABELS[r.cc2Visibility]}` : 'Not answered'}
                          </p>
                        </div>
                        <div className="px-5 py-3">
                          <p className="text-xs font-semibold text-gray-800 mb-1"><span className="text-[#003087] font-bold mr-1">CC3</span> Usefulness</p>
                          <p className="text-sm text-gray-900 bg-blue-50 rounded px-3 py-1.5 inline-block">
                            {r.cc3Usefulness ? `${r.cc3Usefulness}. ${CC3_LABELS[r.cc3Usefulness]}` : 'Not answered'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PART II: SQD Table */}
                    <div className="bg-white border-x border-b border-gray-300">
                      <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                        <h2 className="text-sm font-bold text-[#003087]">PART II. <span className="font-normal text-gray-700 text-xs ml-1">Service Quality Dimensions</span></h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#003087] text-white">
                              <th className="text-left px-4 py-2.5 font-semibold text-xs w-[55%]">CRITERIA FOR RATING</th>
                              {COL_LABELS.map(label => (
                                <th key={label} className="text-center px-1 py-2.5 font-semibold text-[10px] whitespace-pre-line leading-tight w-[9%]">
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {SQD_ITEMS.map(item => {
                              const val = (r as any)[item.key] as number | null;
                              const isLow = !item.isNA && val !== null && val !== undefined && val <= 2;
                              return (
                                <tr key={item.key} className={`border-b border-gray-100 ${isLow ? 'bg-red-50' : ''}`}>
                                  <td className="px-4 py-3">
                                    <div className={`font-bold text-xs mb-0.5 ${isLow ? 'text-red-700' : 'text-[#003087]'}`}>{item.num}. {item.title}{isLow && <span className="ml-1.5 text-[10px] bg-red-100 text-red-700 rounded-full px-1.5 py-0.5">Low</span>}</div>
                                    {!item.isNA && <div className="text-xs text-gray-600 leading-relaxed">{item.text}</div>}
                                    {item.isNA && <div className="text-xs text-gray-400 italic">N/A</div>}
                                  </td>
                                  {COL_VALUES.map(v => (
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

                            {/* Speaker ratings */}
                            {r.speakerRatings && r.speakerRatings.length > 0 && (
                              <>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <td colSpan={6} className="px-4 py-2">
                                    <div className="font-bold text-xs text-[#003087]">SUPPLEMENTAL — Resource Speaker</div>
                                  </td>
                                </tr>
                                {r.speakerRatings.map(sr => {
                                  const sp = speakerLookup[sr.speakerId];
                                  return (
                                    <tr key={sr.speakerId} className="border-b border-gray-100">
                                      <td className="px-4 py-3">
                                        <div className="text-xs font-semibold text-gray-800">{sp?.speakerName || 'Speaker'}</div>
                                        {sp?.topic && <div className="text-xs text-gray-500">{sp.topic}</div>}
                                      </td>
                                      {COL_VALUES.map(v => (
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
                                  );
                                })}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PART III: Comments */}
                    <div className="bg-white border-x border-b border-gray-300 rounded-b-lg">
                      <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                        <h2 className="text-sm font-bold text-[#003087]">PART III. <span className="font-normal text-gray-700 text-xs ml-1">Comments and Suggestions</span></h2>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {r.reasonsForLowRating && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Reason/s for low rating:</p>
                            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{r.reasonsForLowRating}</p>
                          </div>
                        )}
                        {r.commentsSuggestions && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Comments/suggestions:</p>
                            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{r.commentsSuggestions}</p>
                          </div>
                        )}
                        {r.highlightsFeedback && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">What participant liked most:</p>
                            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{r.highlightsFeedback}</p>
                          </div>
                        )}
                        {r.improvementsFeedback && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Areas for improvement:</p>
                            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 border border-gray-100">{r.improvementsFeedback}</p>
                          </div>
                        )}
                        {!r.reasonsForLowRating && !r.commentsSuggestions && !r.highlightsFeedback && !r.improvementsFeedback && (
                          <p className="text-xs text-gray-400 italic text-center py-2">No comments or suggestions provided.</p>
                        )}
                      </div>
                      <div className="px-5 pb-3 text-center">
                        <p className="text-xs text-gray-400 font-medium">— End of Response #{selectedIdx + 1} —</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </>
      )}
    </div>
  );
}

function FeedbackColumn({ title, items, field, borderColor }: {
  title: string;
  items: Array<Record<string, any>>;
  field: string;
  borderColor: string;
}) {
  const filtered = items.filter(r => r[field]);

  // Deduplicate: group by normalized text (trimmed, case-insensitive) and count
  const grouped = new Map<string, { text: string; count: number }>();
  for (const r of filtered) {
    const raw = String(r[field]).trim();
    const key = raw.toLowerCase();
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
    } else {
      grouped.set(key, { text: raw, count: 1 });
    }
  }
  const unique = Array.from(grouped.values());

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-700">
        {title}
        {filtered.length > 0 && unique.length < filtered.length && (
          <span className="font-normal text-gray-400 ml-1">({unique.length} unique of {filtered.length})</span>
        )}
      </h3>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {unique.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No responses.</p>
        ) : (
          unique.map((item, i) => (
            <blockquote key={field + '-' + i} className={`text-xs text-gray-700 bg-gray-50 rounded p-2.5 border-l-2 ${borderColor}`}>
              {item.text}
              {item.count > 1 && (
                <span className="ml-2 text-[10px] font-semibold text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5">
                  ×{item.count}
                </span>
              )}
            </blockquote>
          ))
        )}
      </div>
    </div>
  );
}
