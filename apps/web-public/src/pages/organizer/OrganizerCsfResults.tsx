import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '@/lib/api';

const SQD_LABELS: Record<string, string> = {
  sqd0OverallRating:    'SQD0: Overall Satisfaction',
  sqd1Responsiveness:   'SQD1: Responsiveness',
  sqd2Reliability:      'SQD2: Reliability',
  sqd3AccessFacilities: 'SQD3: Access & Facilities',
  sqd4Communication:    'SQD4: Communication',
  sqd5Costs:            'SQD5: Costs',
  sqd6Integrity:        'SQD6: Integrity',
  sqd7Assurance:        'SQD7: Assurance',
  sqd8Outcome:          'SQD8: Outcome',
};

const ADJECTIVAL_COLORS: Record<string, string> = {
  Outstanding: 'text-green-700 bg-green-50',
  'Very Satisfactory': 'text-blue-700 bg-blue-50',
  Satisfactory: 'text-yellow-700 bg-yellow-50',
  Fair: 'text-orange-700 bg-orange-50',
  Unsatisfactory: 'text-red-700 bg-red-50',
};

type SqdBreakdown = {
  key: string;
  totalResponses: number;
  ratingCounts: Record<string, number>;
  csfRating: number;
  adjectival: string;
};

type CcDistribution = {
  key: string;
  distribution: Record<string, number>;
  total: number;
};

type SpeakerAvg = {
  speakerId: string;
  speakerName: string;
  avgRating: number;
  count: number;
};

type CsfResultData = {
  count: number;
  sqdBreakdown: SqdBreakdown[];
  ccDistribution: CcDistribution[];
  speakerAverages: SpeakerAvg[];
  responses: Array<{
    id: string;
    highlightsFeedback: string | null;
    improvementsFeedback: string | null;
    commentsSuggestions: string | null;
    reasonsForLowRating: string | null;
    submittedAt: string;
  }>;
};

export function OrganizerCsfResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['csf-results', id],
    queryFn: () => surveyApi.getResults(id!),
    enabled: !!id,
  });

  const results = data?.data as CsfResultData | null | undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <button
          onClick={() => navigate(`/organizer/events/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back to Event
        </button>
        <h1 className="text-2xl font-bold text-gray-900">CSF Results — Service Quality Dimensions</h1>
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
          {/* Response count */}
          <div className="flex items-center gap-3">
            <span className="badge badge-blue text-base px-3 py-1">{results.count} response{results.count !== 1 ? 's' : ''}</span>
          </div>

          {/* SQD Breakdown Table */}
          <div className="card overflow-x-auto">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">SQD Rating Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 pr-4 font-medium text-gray-700">Dimension</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">1</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">2</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">3</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">4</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">5</th>
                  <th className="py-2 px-2 text-center font-medium text-gray-700">CSF %</th>
                  <th className="py-2 pl-4 font-medium text-gray-700">Rating</th>
                </tr>
              </thead>
              <tbody>
                {(results.sqdBreakdown ?? []).map((sqd) => (
                  <tr key={sqd.key} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900 whitespace-nowrap">{SQD_LABELS[sqd.key] ?? sqd.key}</td>
                    {['1', '2', '3', '4', '5'].map((r) => (
                      <td key={r} className="py-2 px-2 text-center text-gray-600">{sqd.ratingCounts?.[r] ?? 0}</td>
                    ))}
                    <td className="py-2 px-2 text-center font-semibold text-gray-900">{sqd.csfRating?.toFixed(1)}%</td>
                    <td className="py-2 pl-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ADJECTIVAL_COLORS[sqd.adjectival] ?? ''}`}>
                        {sqd.adjectival}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CC Distribution */}
          {results.ccDistribution && results.ccDistribution.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Citizen's Charter Responses</h2>
              <div className="space-y-4">
                {results.ccDistribution.map((cc) => {
                  const label = cc.key === 'cc1Awareness' ? 'CC1: Awareness' : cc.key === 'cc2Visibility' ? 'CC2: Visibility' : 'CC3: Usefulness';
                  return (
                    <div key={cc.key}>
                      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                      <div className="flex gap-3 flex-wrap">
                        {Object.entries(cc.distribution).map(([value, count]) => (
                          <span key={value} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Option {value}: <strong>{count as number}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Speaker Averages */}
          {results.speakerAverages && results.speakerAverages.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 text-lg mb-4">Speaker Satisfaction</h2>
              <div className="space-y-3">
                {results.speakerAverages.map((sp) => {
                  const pct = (sp.avgRating / 5) * 100;
                  return (
                    <div key={sp.speakerId} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{sp.speakerName}</span>
                        <span className="text-gray-900 font-semibold">{sp.avgRating.toFixed(2)} / 5 ({sp.count} ratings)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-dti-blue h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Verbatim feedback */}
          <div className="grid sm:grid-cols-2 gap-6">
            <FeedbackColumn title="What participants liked" items={results.responses} field="highlightsFeedback" borderColor="border-dti-blue" />
            <FeedbackColumn title="Suggestions for improvement" items={results.responses} field="improvementsFeedback" borderColor="border-yellow-400" />
          </div>

          {/* Comments & Low-rating reasons */}
          {results.responses.some(r => r.commentsSuggestions || r.reasonsForLowRating) && (
            <div className="grid sm:grid-cols-2 gap-6">
              <FeedbackColumn title="Comments / Suggestions" items={results.responses} field="commentsSuggestions" borderColor="border-gray-400" />
              <FeedbackColumn title="Reasons for low ratings" items={results.responses} field="reasonsForLowRating" borderColor="border-red-400" />
            </div>
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
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No responses.</p>
        ) : (
          filtered.map(r => (
            <blockquote key={r.id + '-' + field} className={`text-sm text-gray-700 bg-gray-50 rounded-input p-3 border-l-2 ${borderColor}`}>
              {r[field]}
            </blockquote>
          ))
        )}
      </div>
    </div>
  );
}
