import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { surveyApi } from '@/lib/api';

function StarBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const pct = (value / 5) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{value.toFixed(1)} / 5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-dti-blue h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function OrganizerCsfResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['csf-results', id],
    queryFn: () => surveyApi.getResults(id!),
    enabled: !!id,
  });

  const results = data?.data as {
    count: number;
    averages: {
      overall: number | null;
      content: number | null;
      facilitator: number | null;
      logistics: number | null;
    } | null;
    responses: Array<{
      id: string;
      overallRating: number | null;
      highlightsFeedback: string | null;
      improvementsFeedback: string | null;
      submittedAt: string;
    }>;
  } | null | undefined;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => navigate(`/organizer/events/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Back to Event
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Client Satisfaction Survey Results</h1>
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
          <p className="text-sm mt-1">Responses will appear here once participants submit their feedback.</p>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg">Rating Summary</h2>
              <span className="badge badge-blue">{results.count} response{results.count !== 1 ? 's' : ''}</span>
            </div>
            {results.averages && (
              <div className="space-y-4">
                <StarBar label="Overall Satisfaction" value={results.averages.overall} />
                <StarBar label="Content Quality" value={results.averages.content} />
                <StarBar label="Facilitator / Speaker" value={results.averages.facilitator} />
                <StarBar label="Logistics & Organization" value={results.averages.logistics} />
              </div>
            )}
          </div>

          {/* Verbatim feedback */}
          {results.responses.some(r => r.highlightsFeedback || r.improvementsFeedback) && (
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Highlights */}
              <div className="card space-y-3">
                <h3 className="font-semibold text-gray-900">💬 What participants liked</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {results.responses
                    .filter(r => r.highlightsFeedback)
                    .map(r => (
                      <blockquote key={r.id + '-h'} className="text-sm text-gray-700 bg-gray-50 rounded-input p-3 border-l-2 border-dti-blue">
                        {r.highlightsFeedback}
                      </blockquote>
                    ))}
                  {results.responses.filter(r => r.highlightsFeedback).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No written highlights provided.</p>
                  )}
                </div>
              </div>

              {/* Improvements */}
              <div className="card space-y-3">
                <h3 className="font-semibold text-gray-900">🔧 Suggestions for improvement</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {results.responses
                    .filter(r => r.improvementsFeedback)
                    .map(r => (
                      <blockquote key={r.id + '-i'} className="text-sm text-gray-700 bg-gray-50 rounded-input p-3 border-l-2 border-yellow-400">
                        {r.improvementsFeedback}
                      </blockquote>
                    ))}
                  {results.responses.filter(r => r.improvementsFeedback).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No improvement suggestions provided.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
