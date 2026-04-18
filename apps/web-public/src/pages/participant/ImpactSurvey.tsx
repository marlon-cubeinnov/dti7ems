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
      <div>
        <button onClick={() => navigate('/my-events')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← My Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Impact Assessment Survey</h1>
        <p className="text-gray-600 mt-1">{eventTitle}</p>
        <p className="text-sm text-gray-500 mt-2">
          This survey measures the impact of the training/event on your business operations, 6 months after the activity.
        </p>
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
        {submit.isPending ? 'Submitting…' : 'Submit Impact Assessment'}
      </button>
      <p className="text-xs text-gray-500 text-center pb-4">All ratings are required. Quantitative data and feedback are optional but appreciated.</p>
    </div>
  );
}
