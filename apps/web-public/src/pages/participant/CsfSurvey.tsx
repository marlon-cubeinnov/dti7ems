import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, surveyApi } from '@/lib/api';

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

export function CsfSurveyPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState({ overall: 0, content: 0, facilitator: 0, logistics: 0 });
  const [highlights, setHighlights] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // We need eventId — get it from participation data
  const { data: partData, isLoading } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => eventsApi.getMyParticipations({ page: 1, limit: 50 }),
  });

  const participations = (partData?.data as unknown as Array<{
    id: string;
    event: { id: string; title: string };
    csfSurveyResponse?: { status: string } | null;
  }>) ?? [];

  const participation = participations.find(p => p.id === participationId);
  const eventId = participation?.event?.id;
  const eventTitle = participation?.event?.title;

  const submit = useMutation({
    mutationFn: () => {
      if (!eventId) throw new Error('Event not found');
      return surveyApi.submitCsf(eventId, {
        overallRating:       ratings.overall,
        contentRating:       ratings.content,
        facilitatorRating:   ratings.facilitator,
        logisticsRating:     ratings.logistics,
        highlightsFeedback:  highlights || undefined,
        improvementsFeedback: improvements || undefined,
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

  if (submitted || participation.csfSurveyResponse?.status === 'SUBMITTED') {
    return (
      <div className="max-w-lg mx-auto card text-center py-12 space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-gray-900">Thank you for your feedback!</h2>
        <p className="text-gray-600">Your response has been recorded for <strong>{eventTitle}</strong>.</p>
        <button onClick={() => navigate('/my-events')} className="btn-primary">← Back to My Events</button>
      </div>
    );
  }

  const isValid = ratings.overall > 0 && ratings.content > 0 && ratings.facilitator > 0 && ratings.logistics > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← My Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Client Satisfaction Survey</h1>
        <p className="text-gray-600 mt-1">{eventTitle}</p>
      </div>

      <div className="card space-y-6">
        <p className="text-sm text-gray-600">
          Please rate the following aspects of the event from 1 (Poor) to 5 (Excellent).
        </p>

        <StarRating
          label="Overall Satisfaction"
          value={ratings.overall}
          onChange={(v) => setRatings(r => ({ ...r, overall: v }))}
        />
        <StarRating
          label="Content Quality"
          value={ratings.content}
          onChange={(v) => setRatings(r => ({ ...r, content: v }))}
        />
        <StarRating
          label="Facilitator / Speaker"
          value={ratings.facilitator}
          onChange={(v) => setRatings(r => ({ ...r, facilitator: v }))}
        />
        <StarRating
          label="Logistics & Organization"
          value={ratings.logistics}
          onChange={(v) => setRatings(r => ({ ...r, logistics: v }))}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            What did you like most? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={2000}
            className="input w-full resize-none"
            placeholder="Highlights, key takeaways..."
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            What can be improved? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            maxLength={2000}
            className="input w-full resize-none"
            placeholder="Suggestions for improvement..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
          />
        </div>

        {submit.isError && (
          <p className="text-sm text-red-600">
            {(submit.error as Error)?.message ?? 'Failed to submit survey. Please try again.'}
          </p>
        )}

        <button
          className="btn-primary w-full"
          disabled={!isValid || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? 'Submitting…' : 'Submit Feedback'}
        </button>
        <p className="text-xs text-gray-500 text-center">All ratings are required. Feedback is anonymous to other participants.</p>
      </div>
    </div>
  );
}
