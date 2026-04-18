import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, ApiError } from '@/lib/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const TNA_QUESTIONS = {
  knowledge: [
    { id: 'k1', label: 'How would you rate your current knowledge of business management principles?' },
    { id: 'k2', label: 'How well do you understand financial literacy and bookkeeping?' },
    { id: 'k3', label: 'How familiar are you with digital marketing and e-commerce?' },
  ],
  skill: [
    { id: 's1', label: 'How would you rate your ability to create a business plan?' },
    { id: 's2', label: 'How confident are you in negotiating with suppliers and buyers?' },
    { id: 's3', label: 'How skilled are you in using technology for your business operations?' },
  ],
  motivation: [
    { id: 'm1', label: 'How motivated are you to grow your business in the next 12 months?' },
    { id: 'm2', label: 'How committed are you to implementing what you learn in this program?' },
  ],
};

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function TNAPage() {
  const { participationId } = useParams<{ participationId: string }>();
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [error, setError]         = useState('');

  const { data: partData } = useQuery({
    queryKey: ['participation', participationId],
    queryFn: () => eventsApi.getMyParticipations({ limit: 100 }),
    select: (res) => {
      const list = res.data as unknown as Array<{ id: string; event: { title: string; requiresTNA: boolean } }>;
      return list.find((p) => p.id === participationId);
    },
  });

  const mutation = useMutation({
    mutationFn: () => {
      const kScores = Object.entries(responses).filter(([k]) => k.startsWith('k')).map(([, v]) => v);
      const sScores = Object.entries(responses).filter(([k]) => k.startsWith('s')).map(([, v]) => v);
      const mScores = Object.entries(responses).filter(([k]) => k.startsWith('m')).map(([, v]) => v);

      return eventsApi.submitTNA(participationId!, {
        knowledgeScore:  Math.round(average(kScores) * 10),
        skillScore:      Math.round(average(sScores) * 10),
        motivationScore: Math.round(average(mScores) * 10),
        responses,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-participations'] });
      navigate('/my-events');
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Submission failed. Please try again.');
    },
  });

  const allAnswered = [
    ...TNA_QUESTIONS.knowledge,
    ...TNA_QUESTIONS.skill,
    ...TNA_QUESTIONS.motivation,
  ].every((q) => responses[q.id] !== undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) { setError('Please answer all questions before submitting.'); return; }
    setError('');
    mutation.mutate();
  };

  const renderGroup = (title: string, questions: typeof TNA_QUESTIONS.knowledge) => (
    <div className="card space-y-6">
      <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p className="text-sm text-gray-700 mb-3">{q.label}</p>
          <div className="flex gap-1 flex-wrap">
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setResponses((r) => ({ ...r, [q.id]: n }))}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                  responses[q.id] === n
                    ? 'bg-dti-blue text-white shadow-card'
                    : 'bg-gray-100 text-gray-600 hover:bg-dti-blue/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 — Not at all</span>
            <span>10 — Extremely</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training Needs Assessment</h1>
        {partData && <p className="text-gray-500 text-sm mt-1">For: {partData.event.title}</p>}
        <p className="text-gray-500 text-sm mt-3">
          Rate each item from 1 (lowest) to 10 (highest). Your answers help us match you to
          the right training track.
        </p>
      </div>

      <div className="bg-green-50 rounded-card p-4 text-xs text-green-700 flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Your answers are used for training design only. They will not affect your registration status.
          This assessment is required to confirm your RSVP.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderGroup('Knowledge Assessment', TNA_QUESTIONS.knowledge)}
        {renderGroup('Skills Assessment',    TNA_QUESTIONS.skill)}
        {renderGroup('Motivation Assessment', TNA_QUESTIONS.motivation)}

        {error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-input p-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-events')}
            className="btn-ghost flex-1"
          >
            Save for Later
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !allAnswered}
            className="btn-primary flex-1 py-3"
          >
            {mutation.isPending ? 'Submitting…' : 'Submit TNA & Confirm RSVP'}
          </button>
        </div>
      </form>
    </div>
  );
}
